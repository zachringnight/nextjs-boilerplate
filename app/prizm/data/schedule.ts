import { ScheduleSlot, StationId } from '../types';
import { formatDate, formatTime } from '../lib/time';

// Event dates
export const EVENT_DATES = ['2026-02-06', '2026-02-07', '2026-02-08'] as const;
export const EVENT_TIMEZONE = 'America/Los_Angeles';

// Day labels
export const DAY_LABELS: Record<string, string> = {
  '2026-02-06': 'Thursday',
  '2026-02-07': 'Friday',
  '2026-02-08': 'Saturday'
};

// Event hours (PST)
export const EVENT_START_TIME = '10:00';
export const EVENT_END_TIME = '18:00';
export const LUNCH_START = '12:00';
export const LUNCH_END = '13:00';

// Helper to generate slots for a player
const generatePlayerSlots = (
  playerId: string,
  date: string,
  startHour: number,
  startMinute: number,
  slotIdBase: number
): ScheduleSlot[] => {
  const stationOrder: StationId[] = ['signing', 'packRip', 'photoOp', 'interview'];
  const slots: ScheduleSlot[] = [];

  let currentHour = startHour;
  let currentMinute = startMinute;

  stationOrder.forEach((station, index) => {
    const startTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    // Add 30 minutes
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentMinute -= 60;
      currentHour += 1;
    }

    const endTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    slots.push({
      id: `slot-${slotIdBase + index}`,
      playerId,
      date,
      startTime,
      endTime,
      station,
      status: 'scheduled'
    });
  });

  return slots;
};

// Generate the complete schedule
// Each player rotates through all 4 stations (30 min each = 2 hr appearance)
// Multiple players can be at different stations simultaneously

export const defaultSchedule: ScheduleSlot[] = [
  // =====================
  // THURSDAY FEB 6 - Day 1
  // =====================

  // Morning Session 1: Trevor Lawrence (10:00 - 12:00)
  ...generatePlayerSlots('trevor-lawrence', '2026-02-06', 10, 0, 1),

  // Morning Session 2: Aidan Hutchinson (10:30 - 12:30, overlapping)
  ...generatePlayerSlots('aidan-hutchinson', '2026-02-06', 10, 30, 5),

  // Afternoon Session 1: Garrett Wilson (13:00 - 15:00, after lunch)
  ...generatePlayerSlots('garrett-wilson', '2026-02-06', 13, 0, 9),

  // Afternoon Session 2: Julian Edelman (14:00 - 16:00)
  ...generatePlayerSlots('julian-edelman', '2026-02-06', 14, 0, 13),

  // =====================
  // FRIDAY FEB 7 - Day 2
  // =====================

  // Morning Session 1: Ty Law (10:00 - 12:00)
  ...generatePlayerSlots('ty-law', '2026-02-07', 10, 0, 17),

  // Morning Session 2: Malcolm Butler (10:30 - 12:30)
  ...generatePlayerSlots('malcolm-butler', '2026-02-07', 10, 30, 21),

  // Afternoon Session 1: Eli Manning (13:00 - 15:00)
  ...generatePlayerSlots('eli-manning', '2026-02-07', 13, 0, 25),

  // Afternoon Session 2: Dante Moore (14:00 - 16:00)
  ...generatePlayerSlots('dante-moore', '2026-02-07', 14, 0, 29),

  // =====================
  // SATURDAY FEB 8 - Day 3
  // =====================

  // Morning Session 1: Ricky Williams (10:00 - 12:00)
  ...generatePlayerSlots('ricky-williams', '2026-02-08', 10, 0, 33),

  // Morning Session 2: Champ Bailey (10:30 - 12:30)
  ...generatePlayerSlots('champ-bailey', '2026-02-08', 10, 30, 37),
];

// Helper functions
export const getScheduleForDay = (schedule: ScheduleSlot[], date: string): ScheduleSlot[] => {
  return schedule
    .filter(slot => slot.date === date && slot.status !== 'cancelled')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
};

export const getScheduleForStation = (schedule: ScheduleSlot[], station: StationId, date?: string): ScheduleSlot[] => {
  return schedule
    .filter(slot =>
      slot.station === station &&
      slot.status !== 'cancelled' &&
      (!date || slot.date === date)
    )
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
};

export const getScheduleForPlayer = (schedule: ScheduleSlot[], playerId: string): ScheduleSlot[] => {
  return schedule
    .filter(slot => slot.playerId === playerId && slot.status !== 'cancelled')
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
};

export const getCurrentSlot = (schedule: ScheduleSlot[], station: StationId, now: Date): ScheduleSlot | null => {
  const today = formatDate(now);
  const currentTime = formatTime(now);

  return schedule.find(slot =>
    slot.station === station &&
    slot.date === today &&
    slot.status !== 'cancelled' &&
    // String comparison works for HH:MM format (lexicographic order matches time order)
    slot.startTime <= currentTime &&
    slot.endTime > currentTime
  ) || null;
};

export const getNextSlot = (schedule: ScheduleSlot[], station: StationId, now: Date): ScheduleSlot | null => {
  const today = formatDate(now);
  const currentTime = formatTime(now);

  const upcomingSlots = schedule
    .filter(slot =>
      slot.station === station &&
      slot.status !== 'cancelled' &&
      // String comparison works for HH:MM format (lexicographic order matches time order)
      (slot.date > today || (slot.date === today && slot.startTime > currentTime))
    )
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });

  return upcomingSlots[0] || null;
};

// Get unique players scheduled for a specific day
export const getPlayersForDay = (schedule: ScheduleSlot[], date: string): string[] => {
  const playerIds = new Set(
    schedule
      .filter(slot => slot.date === date && slot.status !== 'cancelled')
      .map(slot => slot.playerId)
  );
  return Array.from(playerIds);
};

// Count completed players for today (all 4 stations done)
export const getCompletedPlayerCount = (schedule: ScheduleSlot[], date: string, now: Date): number => {
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const todaySchedule = schedule.filter(slot => slot.date === date && slot.status !== 'cancelled');

  const playerSlots = new Map<string, ScheduleSlot[]>();
  todaySchedule.forEach(slot => {
    const slots = playerSlots.get(slot.playerId) || [];
    slots.push(slot);
    playerSlots.set(slot.playerId, slots);
  });

  let completed = 0;
  playerSlots.forEach(slots => {
    const allDone = slots.every(slot => slot.endTime <= currentTime);
    if (allDone) completed++;
  });

  return completed;
};
