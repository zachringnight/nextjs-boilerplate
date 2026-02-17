export interface EventDate {
  year: number;
  month: number;
  day: number;
}

export interface EventDates {
  day1: EventDate;
  day2: EventDate;
}

export interface ScheduleConfig {
  timezone: string;
  eventDates: EventDates;
  slotDurationMinutes: number;
  dayStartHour?: number;
  dayEndHour?: number;
}

export interface SchedulablePlayer {
  day: 1 | 2;
  scheduledTime: string | null;
}

export function parseTimeValue(timeStr: string | null | undefined): { hours: number; minutes: number } | null {
  if (!timeStr) return null;

  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;

  let hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
}

export function toTimeZoneDate(date: Date, timeZone: string): Date {
  const timeZoneString = date.toLocaleString('en-US', { timeZone });
  return new Date(timeZoneString);
}

export function getCurrentMinutesInTimeZone(date: Date, timeZone: string): number {
  const zonedDate = toTimeZoneDate(date, timeZone);
  return zonedDate.getHours() * 60 + zonedDate.getMinutes();
}

export function getEventDayForDate(date: Date, config: ScheduleConfig): 1 | 2 | null {
  const zonedDate = toTimeZoneDate(date, config.timezone);
  const year = zonedDate.getFullYear();
  const month = zonedDate.getMonth();
  const day = zonedDate.getDate();

  if (
    year === config.eventDates.day1.year &&
    month === config.eventDates.day1.month &&
    day === config.eventDates.day1.day
  ) {
    return 1;
  }

  if (
    year === config.eventDates.day2.year &&
    month === config.eventDates.day2.month &&
    day === config.eventDates.day2.day
  ) {
    return 2;
  }

  return null;
}

export function isCurrentPlayerAtTime<T extends SchedulablePlayer>(
  player: T,
  currentTime: Date,
  config: ScheduleConfig,
  eventDay?: 1 | 2 | null
): boolean {
  if (eventDay !== undefined && eventDay !== null && player.day !== eventDay) {
    return false;
  }

  const parsed = parseTimeValue(player.scheduledTime);
  if (!parsed) return false;

  const slotStart = parsed.hours * 60 + parsed.minutes;
  const slotEnd = slotStart + config.slotDurationMinutes;
  const currentMinutes = getCurrentMinutesInTimeZone(currentTime, config.timezone);

  return currentMinutes >= slotStart && currentMinutes < slotEnd;
}

export function isUpcomingPlayerAtTime<T extends SchedulablePlayer>(
  player: T,
  currentTime: Date,
  config: ScheduleConfig,
  eventDay?: 1 | 2 | null,
  lookAheadMinutes = 30
): boolean {
  if (eventDay !== undefined && eventDay !== null && player.day !== eventDay) {
    return false;
  }

  const parsed = parseTimeValue(player.scheduledTime);
  if (!parsed) return false;

  const slotStart = parsed.hours * 60 + parsed.minutes;
  const currentMinutes = getCurrentMinutesInTimeZone(currentTime, config.timezone);
  return slotStart > currentMinutes && slotStart <= currentMinutes + lookAheadMinutes;
}

export function getTimeRemainingInSlot<T extends SchedulablePlayer>(
  player: T,
  currentTime: Date,
  config: ScheduleConfig
): { minutes: number; seconds: number } {
  const parsed = parseTimeValue(player.scheduledTime);
  if (!parsed) return { minutes: 0, seconds: 0 };

  const slotEndSeconds = (parsed.hours * 60 + parsed.minutes + config.slotDurationMinutes) * 60;
  const zonedDate = toTimeZoneDate(currentTime, config.timezone);
  const nowSeconds = zonedDate.getHours() * 3600 + zonedDate.getMinutes() * 60 + zonedDate.getSeconds();

  const remaining = Math.max(0, slotEndSeconds - nowSeconds);
  return {
    minutes: Math.floor(remaining / 60),
    seconds: remaining % 60,
  };
}

export function getNextPlayerInSchedule<T extends SchedulablePlayer>(
  players: T[],
  currentTime: Date,
  config: ScheduleConfig,
  eventDay: 1 | 2 | null
): T | null {
  if (eventDay === null) return null;

  const currentMinutes = getCurrentMinutesInTimeZone(currentTime, config.timezone);
  const dayPlayers = players.filter((player) => player.day === eventDay);

  for (const player of dayPlayers) {
    const parsed = parseTimeValue(player.scheduledTime);
    if (!parsed) continue;

    const slotStart = parsed.hours * 60 + parsed.minutes;
    if (slotStart > currentMinutes) {
      return player;
    }
  }

  return null;
}

export function findCurrentPlayerInSchedule<T extends SchedulablePlayer>(
  players: T[],
  currentTime: Date,
  config: ScheduleConfig,
  eventDay?: 1 | 2 | null
): T | undefined {
  return players.find((player) => isCurrentPlayerAtTime(player, currentTime, config, eventDay));
}

export function getCompletedCountInSchedule<T extends SchedulablePlayer>(
  players: T[],
  currentTime: Date,
  config: ScheduleConfig
): number {
  const currentMinutes = getCurrentMinutesInTimeZone(currentTime, config.timezone);

  return players.filter((player) => {
    const parsed = parseTimeValue(player.scheduledTime);
    if (!parsed) return false;

    const slotEnd = parsed.hours * 60 + parsed.minutes + config.slotDurationMinutes;
    return slotEnd <= currentMinutes;
  }).length;
}

export function formatTimeInTimeZone(date: Date, timeZone: string, includeSeconds = false): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: true,
    timeZone,
  });
}

export function formatDateInTimeZone(date: Date, timeZone: string): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone,
  });
}

export function formatDateShortInTimeZone(date: Date, timeZone: string): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone,
  });
}

export function getEventStatusForDate(
  date: Date,
  config: ScheduleConfig
): 'pre-show' | 'active' | 'wrapped' | 'off-day' {
  const eventDay = getEventDayForDate(date, config);
  if (eventDay === null) return 'off-day';

  const currentMinutes = getCurrentMinutesInTimeZone(date, config.timezone);
  const startHour = config.dayStartHour ?? 9;
  const endHour = config.dayEndHour ?? 20;

  if (currentMinutes < startHour * 60) return 'pre-show';
  if (currentMinutes > endHour * 60) return 'wrapped';
  return 'active';
}
