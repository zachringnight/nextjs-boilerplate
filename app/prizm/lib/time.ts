import { EVENT_TIMEZONE } from '../data/schedule';

// Get current time in event timezone
export const getEventTime = (): Date => {
  return new Date();
};

// Format time as HH:MM
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: EVENT_TIMEZONE
  });
};

// Format time as h:mm AM/PM
export const formatTime12 = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: EVENT_TIMEZONE
  });
};

// Format date as YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-CA', { timeZone: EVENT_TIMEZONE });
};

// Parse time string (HH:MM) to Date object for a given date
export const parseTimeToDate = (dateStr: string, timeStr: string): Date => {
  return new Date(`${dateStr}T${timeStr}:00`);
};

// Calculate seconds remaining until a time
export const getSecondsUntil = (dateStr: string, timeStr: string): number => {
  const target = parseTimeToDate(dateStr, timeStr);
  const now = new Date();
  return Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
};

// Calculate seconds remaining in a slot
export const getSecondsRemaining = (dateStr: string, endTimeStr: string): number => {
  return getSecondsUntil(dateStr, endTimeStr);
};

// Format seconds as MM:SS or HH:MM:SS
export const formatCountdown = (seconds: number): string => {
  if (seconds <= 0) return '00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Check if current time is within a slot
export const isCurrentSlot = (dateStr: string, startTime: string, endTime: string): boolean => {
  const now = new Date();
  const today = formatDate(now);
  if (today !== dateStr) return false;

  const currentTime = formatTime(now);
  return currentTime >= startTime && currentTime < endTime;
};

// Check if slot is in the past
export const isPastSlot = (dateStr: string, endTime: string): boolean => {
  const now = new Date();
  const today = formatDate(now);

  if (dateStr < today) return true;
  if (dateStr > today) return false;

  const currentTime = formatTime(now);
  return currentTime >= endTime;
};

// Check if slot is upcoming (next one)
export const isUpcomingSlot = (dateStr: string, startTime: string): boolean => {
  const now = new Date();
  const today = formatDate(now);

  if (dateStr > today) return true;
  if (dateStr < today) return false;

  const currentTime = formatTime(now);
  return currentTime < startTime;
};

// Get day number (1, 2, or 3) for a date
export const getDayNumber = (dateStr: string): number => {
  const dayMap: Record<string, number> = {
    '2026-02-06': 1,
    '2026-02-07': 2,
    '2026-02-08': 3
  };
  return dayMap[dateStr] || 1;
};

// Get current day number
export const getCurrentDayNumber = (): number => {
  const today = formatDate(new Date());
  return getDayNumber(today);
};

// Check if we're in event hours
export const isEventHours = (): boolean => {
  const now = new Date();
  const today = formatDate(now);
  const currentTime = formatTime(now);

  // Check if it's an event day
  if (!['2026-02-06', '2026-02-07', '2026-02-08'].includes(today)) {
    return false;
  }

  // Check if within hours (10:00 - 18:00)
  return currentTime >= '10:00' && currentTime < '18:00';
};

// Check if it's lunch break
export const isLunchBreak = (): boolean => {
  const now = new Date();
  const currentTime = formatTime(now);
  return currentTime >= '12:00' && currentTime < '13:00';
};

// Get event status message
export const getEventStatus = (): 'pre-show' | 'active' | 'lunch' | 'wrapped' | 'off-day' => {
  const now = new Date();
  const today = formatDate(now);
  const currentTime = formatTime(now);

  // Check if it's an event day
  if (!['2026-02-06', '2026-02-07', '2026-02-08'].includes(today)) {
    return 'off-day';
  }

  if (currentTime < '10:00') return 'pre-show';
  if (currentTime >= '18:00') return 'wrapped';
  if (currentTime >= '12:00' && currentTime < '13:00') return 'lunch';
  return 'active';
};
