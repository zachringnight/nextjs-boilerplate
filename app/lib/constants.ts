// Event Configuration
export const EVENT_TIMEZONE = 'America/Los_Angeles';
export const SLOT_DURATION_MINUTES = 15;

// Event dates (month is 0-indexed: January = 0)
export const EVENT_DATES = {
  day1: { year: 2026, month: 0, day: 28 },
  day2: { year: 2026, month: 0, day: 29 },
} as const;

// Event metadata
export const EVENT_INFO = {
  name: 'NWSL Media Day 2026',
  subtitle: 'Panini Shoot',
  location: 'MG Studio, Los Angeles',
  dateDisplay: 'Jan 28 & 29, 2026',
  totalDays: 2,
} as const;

// Day styling configurations
export const DAY_STYLES = {
  1: {
    border: 'border-blue-500/30',
    borderActive: 'border-blue-500',
    header: 'bg-blue-500/10',
    badge: 'bg-blue-500/20 text-blue-400',
    text: 'text-blue-400',
    bg: 'bg-blue-500',
    dayName: 'Wednesday',
    shortDay: 'Wed',
    dateDisplay: 'Wednesday, January 28',
  },
  2: {
    border: 'border-violet-500/30',
    borderActive: 'border-violet-500',
    header: 'bg-violet-500/10',
    badge: 'bg-violet-500/20 text-violet-400',
    text: 'text-violet-400',
    bg: 'bg-violet-500',
    dayName: 'Thursday',
    shortDay: 'Thu',
    dateDisplay: 'Thursday, January 29',
  },
} as const;

// Station configurations
export const STATION_CONFIG = {
  tunnel: {
    id: 'tunnel',
    name: 'Tunnel',
    shortName: 'TUNNEL',
    icon: '1',
    emoji: '\uD83D\uDEB6',
    color: '#22c55e',
    colorClass: 'green',
    borderClass: 'border-green-500/30',
    bgClass: 'bg-green-500',
    textClass: 'text-green-400',
    description: 'Walk-in + Interview',
    hasInterview: true,
  },
  product: {
    id: 'product',
    name: 'Product',
    shortName: 'PRODUCT',
    icon: '2',
    emoji: '\uD83D\uDCF8',
    color: '#f59e0b',
    colorClass: 'amber',
    borderClass: 'border-amber-500/30',
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-400',
    description: 'Card Photography',
    hasInterview: false,
  },
} as const;

// Status colors
export const STATUS_COLORS = {
  embargoed: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500',
  },
  clear: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500',
  },
  translator: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500',
  },
  current: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500',
  },
  upcoming: {
    bg: 'bg-blue-500/5',
    text: 'text-blue-400',
    border: 'border-blue-500/50',
  },
} as const;

// UI Theme colors
export const THEME = {
  background: '#0a0a0a',
  foreground: '#ffffff',
  cardBg: '#141414',
  cardBorder: '#2a2a2a',
  accentGold: '#FFD100',
  accentBlue: '#0033A0',
} as const;

// View mode types
export type ViewMode = 'now' | 'schedule' | 'station' | 'players';

// Time intervals for updates (in milliseconds)
export const UPDATE_INTERVALS = {
  realtime: 1000,    // 1 second - for live now view
  schedule: 60000,   // 1 minute - for schedule/station views
} as const;
