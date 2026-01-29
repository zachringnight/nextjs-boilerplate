import type { Player } from '../data/players';
import { EVENT_TIMEZONE, EVENT_DATES, SLOT_DURATION_MINUTES } from './constants';

/**
 * Parse a time string like "10:05 AM" into hours and minutes
 */
export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return { hours: 0, minutes: 0 };

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
}

/**
 * Convert a Date to PST/PT timezone and return the date object
 */
export function toPST(date: Date): Date {
  const pstString = date.toLocaleString('en-US', { timeZone: EVENT_TIMEZONE });
  return new Date(pstString);
}

/**
 * Get current minutes since midnight in PST
 */
export function getCurrentMinutesPST(date: Date): number {
  const pstDate = toPST(date);
  return pstDate.getHours() * 60 + pstDate.getMinutes();
}

/**
 * Get the event day (1, 2, or null if not during event)
 */
export function getEventDay(date: Date): 1 | 2 | null {
  const pstDate = toPST(date);
  const year = pstDate.getFullYear();
  const month = pstDate.getMonth();
  const day = pstDate.getDate();

  if (year === EVENT_DATES.day1.year && month === EVENT_DATES.day1.month && day === EVENT_DATES.day1.day) {
    return 1;
  }
  if (year === EVENT_DATES.day2.year && month === EVENT_DATES.day2.month && day === EVENT_DATES.day2.day) {
    return 2;
  }
  return null;
}

/**
 * Check if a player is currently at station (within their 15-min slot)
 */
export function isCurrentPlayer(player: Player, currentTime: Date, eventDay?: 1 | 2 | null): boolean {
  // If eventDay is provided and doesn't match player's day, return false
  if (eventDay !== undefined && eventDay !== null && player.day !== eventDay) {
    return false;
  }

  const { hours, minutes } = parseTime(player.scheduledTime);
  const slotStart = hours * 60 + minutes;
  const slotEnd = slotStart + SLOT_DURATION_MINUTES;
  const currentMinutes = getCurrentMinutesPST(currentTime);

  return currentMinutes >= slotStart && currentMinutes < slotEnd;
}

/**
 * Check if a player is upcoming (within the next 30 minutes)
 */
export function isUpcomingPlayer(player: Player, currentTime: Date): boolean {
  const { hours, minutes } = parseTime(player.scheduledTime);
  const slotStart = hours * 60 + minutes;
  const currentMinutes = getCurrentMinutesPST(currentTime);

  return slotStart > currentMinutes && slotStart <= currentMinutes + 30;
}

/**
 * Get time remaining in current player's slot
 */
export function getTimeRemaining(player: Player, currentTime: Date): { minutes: number; seconds: number } {
  const { hours, minutes } = parseTime(player.scheduledTime);
  const slotEndSeconds = (hours * 60 + minutes + SLOT_DURATION_MINUTES) * 60;

  const pstDate = toPST(currentTime);
  const nowSeconds = pstDate.getHours() * 3600 + pstDate.getMinutes() * 60 + pstDate.getSeconds();

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

  const currentMinutes = getCurrentMinutesPST(currentTime);
  const dayPlayers = players.filter(p => p.day === eventDay);

  for (const player of dayPlayers) {
    const { hours, minutes } = parseTime(player.scheduledTime);
    const slotStart = hours * 60 + minutes;
    if (slotStart > currentMinutes) {
      return player;
    }
  }
  return null;
}

/**
 * Find current player from a list of players
 */
export function findCurrentPlayer(players: Player[], currentTime: Date, eventDay?: 1 | 2 | null): Player | undefined {
  return players.find(p => isCurrentPlayer(p, currentTime, eventDay));
}

/**
 * Count completed players for a given day
 */
export function getCompletedCount(players: Player[], currentTime: Date): number {
  const currentMinutes = getCurrentMinutesPST(currentTime);

  return players.filter(p => {
    const { hours, minutes } = parseTime(p.scheduledTime);
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
