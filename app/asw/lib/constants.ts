import type { ViewMode } from '../types';

// Event Configuration
export const EVENT_TIMEZONE = 'America/Los_Angeles';
export const SLOT_DURATION_MINUTES = 15;

// Event dates (month is 0-indexed: February = 1)
export const EVENT_DATES = {
  day1: { year: 2026, month: 1, day: 13 },
  day2: { year: 2026, month: 1, day: 14 },
} as const;

// Event metadata
export const EVENT_INFO = {
  name: 'NBA All-Star Weekend 2026',
  subtitle: 'Prizm Lounge',
  location: 'Los Angeles',
  dateDisplay: 'Feb 13 & 14, 2026',
  totalDays: 2,
  venue: {
    name: 'Terrace at LA LIVE',
    address: '800 W Olympic Blvd A150',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90015',
    fullAddress: '800 W Olympic Blvd A150, Los Angeles, CA 90015',
  },
  hours: {
    day1: { open: '12:00 PM', close: '8:00 PM' },
    day2: { open: '10:00 AM', close: '7:00 PM' },
  },
  rsvp: {
    name: 'Gena Terranova',
    email: 'gterranova@paniniamerica.net',
  },
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
    dayName: 'Friday',
    shortDay: 'Fri',
    dateDisplay: 'Friday, February 13',
  },
  2: {
    border: 'border-violet-500/30',
    borderActive: 'border-violet-500',
    header: 'bg-violet-500/10',
    badge: 'bg-violet-500/20 text-violet-400',
    text: 'text-violet-400',
    bg: 'bg-violet-500',
    dayName: 'Saturday',
    shortDay: 'Sat',
    dateDisplay: 'Saturday, February 14',
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
  nbaRed: '#C8102E',
} as const;

// View mode config for toggle buttons
export const VIEW_MODES: { mode: ViewMode; label: string; icon: string }[] = [
  { mode: 'now', label: 'Live Now', icon: 'Zap' },
  { mode: 'schedule', label: 'Schedule', icon: 'Calendar' },
  { mode: 'station', label: 'Station Tool', icon: 'Radio' },
  { mode: 'players', label: 'Players', icon: 'User' },
];

// Time intervals for updates (in milliseconds)
export const UPDATE_INTERVALS = {
  realtime: 1000,
  schedule: 30000,
} as const;
