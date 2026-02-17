import { getScheduleForPlayer, EVENT_TIMEZONE } from '../data/schedule';
import { stationMap } from '../data/stations';
import type { ScheduleSlot, StationId } from '../types';

export const DAY_FILTERS = [
  { key: 'thu', label: 'Thu', date: '2026-02-05' },
  { key: 'fri', label: 'Fri', date: '2026-02-06' },
  { key: 'sat', label: 'Sat', date: '2026-02-07' },
];

export type PlayerStatusKey =
  | 'now'
  | 'up-next'
  | 'complete'
  | 'offsite'
  | 'tbd'
  | 'not-started';

export const PLAYER_STATUS_LABELS: Record<PlayerStatusKey, string> = {
  now: 'Now',
  'up-next': 'Up Next',
  complete: 'Complete',
  offsite: 'Offsite',
  tbd: 'TBD',
  'not-started': 'Not Started',
};

export const STATUS_FILTERS = [
  { key: 'now', label: 'Now' },
  { key: 'up-next', label: 'Up Next' },
  { key: 'complete', label: 'Done' },
  { key: 'not-started', label: 'Not Started' },
];

export const getStationLabel = (stationId: StationId) =>
  stationMap.get(stationId)?.name ?? stationId;

const toDateString = (date: Date) =>
  date.toLocaleDateString('en-CA', { timeZone: EVENT_TIMEZONE });

const toTimeString = (date: Date) =>
  date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: EVENT_TIMEZONE,
  });

export const formatTime = (time: string) => {
  if (!time || time === '00:00') return 'TBD';
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

export const formatAssignment = (slot?: ScheduleSlot | null) => {
  if (!slot) return 'No assignment';
  return `${formatTime(slot.startTime)} • ${getStationLabel(slot.station)}`;
};

export const getPlayerSchedule = (
  schedule: ScheduleSlot[],
  playerId: string,
  dateFilter?: string
) => {
  const slots = getScheduleForPlayer(schedule, playerId);
  if (!dateFilter) return slots;
  return slots.filter((slot) => slot.date === dateFilter);
};

export const getCurrentPlayerSlot = (
  schedule: ScheduleSlot[],
  playerId: string,
  now: Date | null,
  dateFilter?: string
) => {
  if (!now) return null;
  const today = toDateString(now);
  if (dateFilter && dateFilter !== today) return null;
  const currentTime = toTimeString(now);
  const slots = getPlayerSchedule(schedule, playerId, dateFilter);
  return (
    slots.find(
      (slot) =>
        slot.status !== 'tbd' &&
        slot.date === today &&
        slot.startTime <= currentTime &&
        slot.endTime > currentTime
    ) ?? null
  );
};

export const getNextPlayerSlot = (
  schedule: ScheduleSlot[],
  playerId: string,
  now: Date | null,
  dateFilter?: string
) => {
  const slots = getPlayerSchedule(schedule, playerId, dateFilter);
  if (slots.length === 0) return null;
  if (!now) return slots[0];
  const today = toDateString(now);
  const currentTime = toTimeString(now);
  const upcoming = slots
    .filter(
      (slot) =>
        slot.status !== 'tbd' &&
        (slot.date > today || (slot.date === today && slot.startTime > currentTime))
    )
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
  return upcoming[0] ?? slots[0];
};

export const getPlayerStatus = (
  schedule: ScheduleSlot[],
  playerId: string,
  now: Date | null,
  dateFilter?: string
): PlayerStatusKey => {
  const allSlots = getScheduleForPlayer(schedule, playerId);
  if (allSlots.length === 0) return 'offsite';

  const slots = dateFilter ? allSlots.filter((slot) => slot.date === dateFilter) : allSlots;
  if (slots.length === 0) return 'offsite';

  const scheduledSlots = slots.filter((slot) => slot.status !== 'tbd');
  if (scheduledSlots.length === 0) return 'tbd';
  if (!now) return 'not-started';

  const today = toDateString(now);
  const currentTime = toTimeString(now);

  if (dateFilter && dateFilter < today) return 'complete';

  const currentSlot = getCurrentPlayerSlot(schedule, playerId, now, dateFilter);
  if (currentSlot) return 'now';

  const sortedSlots = [...scheduledSlots].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });
  const lastSlot = sortedSlots[sortedSlots.length - 1];

  if (
    lastSlot.date < today ||
    (lastSlot.date === today && lastSlot.endTime <= currentTime)
  ) {
    return 'complete';
  }

  const nextSlot = getNextPlayerSlot(schedule, playerId, now, dateFilter);
  if (!nextSlot) return 'not-started';

  if (nextSlot.date === today) return 'up-next';
  return 'not-started';
};

export const getSortKeyForSlot = (slot: ScheduleSlot | null) => {
  if (!slot) return '9999-99-99-99:99';
  return `${slot.date}-${slot.startTime}`;
};
