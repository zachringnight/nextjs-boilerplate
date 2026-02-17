import type { Player } from '../types';
import { EVENT_TIMEZONE, EVENT_DATES, SLOT_DURATION_MINUTES } from './constants';
import {
  type ScheduleConfig,
  parseTimeValue,
  toTimeZoneDate,
  getCurrentMinutesInTimeZone,
  getEventDayForDate,
  isCurrentPlayerAtTime,
  isUpcomingPlayerAtTime,
  getTimeRemainingInSlot,
  getNextPlayerInSchedule,
  findCurrentPlayerInSchedule,
  getCompletedCountInSchedule,
  formatTimeInTimeZone,
  formatDateInTimeZone,
  formatDateShortInTimeZone,
  getEventStatusForDate,
} from '../../lib/schedule-core';

const SCHEDULE_CONFIG: ScheduleConfig = {
  timezone: EVENT_TIMEZONE,
  eventDates: EVENT_DATES,
  slotDurationMinutes: SLOT_DURATION_MINUTES,
  dayStartHour: 9,
  dayEndHour: 20,
};

export function parseTime(timeStr: string | null): { hours: number; minutes: number } | null {
  return parseTimeValue(timeStr);
}

export function toPT(date: Date): Date {
  return toTimeZoneDate(date, EVENT_TIMEZONE);
}

export function getCurrentMinutesPT(date: Date): number {
  return getCurrentMinutesInTimeZone(date, EVENT_TIMEZONE);
}

export function getEventDay(date: Date): 1 | 2 | null {
  return getEventDayForDate(date, SCHEDULE_CONFIG);
}

export function isCurrentPlayer(player: Player, currentTime: Date, eventDay?: 1 | 2 | null): boolean {
  return isCurrentPlayerAtTime(player, currentTime, SCHEDULE_CONFIG, eventDay);
}

export function isUpcomingPlayer(player: Player, currentTime: Date, eventDay?: 1 | 2 | null): boolean {
  return isUpcomingPlayerAtTime(player, currentTime, SCHEDULE_CONFIG, eventDay, 30);
}

export function getTimeRemaining(player: Player, currentTime: Date): { minutes: number; seconds: number } {
  return getTimeRemainingInSlot(player, currentTime, SCHEDULE_CONFIG);
}

export function getNextPlayer(players: Player[], currentTime: Date, eventDay: 1 | 2 | null): Player | null {
  return getNextPlayerInSchedule(players, currentTime, SCHEDULE_CONFIG, eventDay);
}

export function findCurrentPlayer(players: Player[], currentTime: Date, eventDay?: 1 | 2 | null): Player | undefined {
  return findCurrentPlayerInSchedule(players, currentTime, SCHEDULE_CONFIG, eventDay);
}

export function getCompletedCount(players: Player[], currentTime: Date): number {
  return getCompletedCountInSchedule(players, currentTime, SCHEDULE_CONFIG);
}

export function formatTime(date: Date, includeSeconds = false): string {
  return formatTimeInTimeZone(date, EVENT_TIMEZONE, includeSeconds);
}

export function formatDate(date: Date): string {
  return formatDateInTimeZone(date, EVENT_TIMEZONE);
}

export function formatDateShort(date: Date): string {
  return formatDateShortInTimeZone(date, EVENT_TIMEZONE);
}

export function getEventStatus(): 'pre-show' | 'active' | 'wrapped' | 'off-day' {
  return getEventStatusForDate(new Date(), SCHEDULE_CONFIG);
}
