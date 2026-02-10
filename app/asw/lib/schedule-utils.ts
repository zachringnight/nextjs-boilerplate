import type { Player } from '../types';
import { EVENT_TIMEZONE, EVENT_DATES, SLOT_DURATION_MINUTES } from './constants';

/**
 * Parse a time string like "10:05 AM" into hours and minutes
 * Returns null for invalid or null time strings
 */
export function parseTime(timeStr: string | null): { hours: number; minutes: number } | null {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
}

/**
 * Convert a Date to PT timezone
 */
export function toPT(date: Date): Date {
  const ptString = date.toLocaleString('en-US', { timeZone: EVENT_TIMEZONE });
  return new Date(ptString);
}

/**
 * Get current minutes since midnight in PT
 */
export function getCurrentMinutesPT(date: Date): number {
  const ptDate = toPT(date);
  return ptDate.getHours() * 60 + ptDate.getMinutes();
}

/**
 * Get the event day (1, 2, or null if not during event)
 */
export function getEventDay(date: Date): 1 | 2 | null {
  const ptDate = toPT(date);
  const year = ptDate.getFullYear();
  const month = ptDate.getMonth();
  const day = ptDate.getDate();

  if (year === EVENT_DATES.day1.year && month === EVENT_DATES.day1.month && day === EVENT_DATES.day1.day) {
    return 1;
  }
  if (year === EVENT_DATES.day2.year && month === EVENT_DATES.day2.month && day === EVENT_DATES.day2.day) {
    return 2;
  }
  return null;
}

/**
 * Check if a player is currently at station (within their slot)
 */
export function isCurrentPlayer(player: Player, currentTime: Date, eventDay?: 1 | 2 | null): boolean {
  if (eventDay !== undefined && eventDay !== null && player.day !== eventDay) {
    return false;
  }

  const parsed = parseTime(player.scheduledTime);
  if (!parsed) return false; // Skip players with TBD/null times

  const { hours, minutes } = parsed;
  const slotStart = hours * 60 + minutes;
  const slotEnd = slotStart + SLOT_DURATION_MINUTES;
  const currentMinutes = getCurrentMinutesPT(currentTime);

  return currentMinutes >= slotStart && currentMinutes < slotEnd;
}

/**
 * Check if a player is upcoming (within the next 30 minutes)
 */
export function isUpcomingPlayer(player: Player, currentTime: Date): boolean {
  const parsed = parseTime(player.scheduledTime);
  if (!parsed) return false; // Skip players with TBD/null times

  const { hours, minutes } = parsed;
  const slotStart = hours * 60 + minutes;
  const currentMinutes = getCurrentMinutesPT(currentTime);

  return slotStart > currentMinutes && slotStart <= currentMinutes + 30;
}

/**
 * Get time remaining in current player's slot
 */
export function getTimeRemaining(player: Player, currentTime: Date): { minutes: number; seconds: number } {
  const parsed = parseTime(player.scheduledTime);
  if (!parsed) return { minutes: 0, seconds: 0 }; // Return 0 for TBD/null times

  const { hours, minutes } = parsed;
  const slotEndSeconds = (hours * 60 + minutes + SLOT_DURATION_MINUTES) * 60;

  const ptDate = toPT(currentTime);
  const nowSeconds = ptDate.getHours() * 3600 + ptDate.getMinutes() * 60 + ptDate.getSeconds();

  const remaining = Math.max(0, slotEndSeconds - nowSeconds);
  return {
    minutes: Math.floor(remaining / 60),
    seconds: remaining % 60,
  };
}

/**
 * Get the next player after the current time
 */
export function getNextPlayer(players: Player[], currentTime: Date, eventDay: 1 | 2 | null): Player | null {
  if (eventDay === null) return null;

  const currentMinutes = getCurrentMinutesPT(currentTime);
  const dayPlayers = players.filter(p => p.day === eventDay);

  for (const player of dayPlayers) {
    const parsed = parseTime(player.scheduledTime);
    if (!parsed) continue; // Skip players with TBD/null times

    const { hours, minutes } = parsed;
    const slotStart = hours * 60 + minutes;
    if (slotStart > currentMinutes) {
      return player;
    }
  }
  return null;
}

/**
 * Find current player from a list
 */
export function findCurrentPlayer(players: Player[], currentTime: Date, eventDay?: 1 | 2 | null): Player | undefined {
  return players.find(p => isCurrentPlayer(p, currentTime, eventDay));
}

/**
 * Count completed players for a given day
 */
export function getCompletedCount(players: Player[], currentTime: Date): number {
  const currentMinutes = getCurrentMinutesPT(currentTime);

  return players.filter(p => {
    const parsed = parseTime(p.scheduledTime);
    if (!parsed) return false; // Skip players with TBD/null times

    const { hours, minutes } = parsed;
    const slotEnd = hours * 60 + minutes + SLOT_DURATION_MINUTES;
    return slotEnd <= currentMinutes;
  }).length;
}

/**
 * Format time for display
 */
export function formatTime(date: Date, includeSeconds = false): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: true,
    timeZone: EVENT_TIMEZONE,
  });
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: EVENT_TIMEZONE,
  });
}

/**
 * Format short date for header
 */
export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: EVENT_TIMEZONE,
  });
}

/**
 * Get event status
 */
export function getEventStatus(): 'pre-show' | 'active' | 'wrapped' | 'off-day' {
  const now = new Date();
  const eventDay = getEventDay(now);
  if (eventDay === null) return 'off-day';

  const currentMinutes = getCurrentMinutesPT(now);
  if (currentMinutes < 9 * 60) return 'pre-show';
  if (currentMinutes > 20 * 60) return 'wrapped';
  return 'active';
}
