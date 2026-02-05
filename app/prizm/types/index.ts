// Prizm Lounge Production Hub - TypeScript Types

// Re-export database types
export * from './database';

export interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  photo: string;
  bio: string;
  stats: string[];
  cardHistory: string[];
  moments: string[];
  signingOnly?: boolean; // Player only does signing, no rotation
  questions?: {
    signing?: QuestionPrompt[];
    packRip?: QuestionPrompt[];
  };
}

export interface QuestionPrompt {
  type: 'question' | 'checklist';
  text: string;
}

export interface Station {
  id: StationId;
  name: string;
  icon: string;
  color: string;
  questions: string[];
}

export type StationId = 'ledWall' | 'signing' | 'packRip' | 'prCall' | 'free' | 'kidReporter' | 'deacon';

// PR Call information for media interviews
export interface PRCallInfo {
  outlet: string;        // e.g., "Fox News Digital (Sports)"
  contact?: string;      // e.g., "Scott Thompson"
  callIn?: string;       // e.g., "732-850-2940"
  notes?: string;        // Any additional notes
}

export interface ScheduleSlot {
  id: string;
  playerId: string;
  date: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:MM'
  endTime: string;
  station: StationId;
  status?: 'scheduled' | 'cancelled' | 'tbd';
  prCallInfo?: PRCallInfo; // PR call details when station is 'prCall'
  notes?: string; // Additional notes for the slot
}

export type DayDate = '2026-02-06' | '2026-02-07' | '2026-02-08';

// Quick Notes / Issue Logger
export type NoteCategory = 'general' | 'technical' | 'scheduling' | 'vip' | 'media' | 'urgent';
export type NotePriority = 'low' | 'medium' | 'high';
export type NoteStatus = 'open' | 'in-progress' | 'resolved';

export interface Note {
  id: string;
  content: string;
  category: NoteCategory;
  priority: NotePriority;
  status: NoteStatus;
  stationId?: StationId;
  playerId?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  resolvedAt?: string; // ISO timestamp
  createdBy?: string; // Optional crew member name
}

// =====================
// CONTENT TRACKING
// =====================

export const CONTENT_MODES = [
  'Player Spotlight',
  'Pack Reveal/Hit',
  'Signing Session',
  'Legend Tribute',
  'Event Promo',
  'Behind the Scenes',
  'Day Recap',
  'Media Moment',
  'Product Drop',
  'Card Break Hype',
] as const;

export type ContentMode = typeof CONTENT_MODES[number];

export const CONTENT_PLATFORMS = [
  'Instagram',
  'TikTok',
  'Twitter/X',
  'YouTube',
  'Facebook',
  'Internal',
] as const;

export type ContentPlatform = typeof CONTENT_PLATFORMS[number];

export interface ContentTracking {
  id: string;
  playerId: string;
  mode: ContentMode;
  platform: ContentPlatform;
  usedAt: string; // ISO timestamp
  notes?: string;
  createdBy?: string;
}

// =====================
// PRODUCTION CHECKLIST
// =====================

export const CHECKLIST_CATEGORIES = ['setup', 'player', 'content', 'teardown'] as const;
export type ChecklistCategory = typeof CHECKLIST_CATEGORIES[number];

export const EVENT_DAYS = ['Thursday', 'Friday', 'Saturday'] as const;
export type EventDay = typeof EVENT_DAYS[number];

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string; // ISO timestamp
  assignee?: string;
  dueDay: EventDay;
  priority?: 'low' | 'medium' | 'high';
}

// =====================
// DELIVERABLES TRACKER
// =====================

export const DELIVERABLE_TYPES = ['photo', 'video', 'social', 'document', 'other'] as const;
export type DeliverableType = typeof DELIVERABLE_TYPES[number];

export const DELIVERABLE_STATUSES = ['pending', 'in-progress', 'completed', 'delivered'] as const;
export type DeliverableStatus = typeof DELIVERABLE_STATUSES[number];

export interface Deliverable {
  id: string;
  title: string;
  description?: string;
  type: DeliverableType;
  status: DeliverableStatus;
  playerId?: string; // Optional link to specific player
  dueDay: EventDay;
  completedAt?: string; // ISO timestamp
  deliveredAt?: string; // ISO timestamp
  notes?: string;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
}

// =====================
// PLAYER STATION CHECKLIST
// =====================

// Tracks which stations each player has completed
export interface PlayerStationCompletion {
  playerId: string;
  stationId: StationId;
  completed: boolean;
  completedAt?: string; // ISO timestamp
  completedBy?: string; // Crew member who marked it
  notes?: string;
}

// Summary of a player's station progress
export interface PlayerStationProgress {
  playerId: string;
  completedStations: StationId[];
  remainingStations: StationId[];
  completionPercentage: number;
}

// =====================
// APP STATE
// =====================

export interface AppState {
  // Preferences
  largeText: boolean;
  toggleLargeText: () => void;

  // Search
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // Schedule (editable)
  schedule: ScheduleSlot[];
  updateSlot: (id: string, updates: Partial<ScheduleSlot>) => void;
  addSlot: (slot: ScheduleSlot) => void;
  removeSlot: (id: string) => void;
  resetSchedule: () => void;

  // UI
  selectedStation: StationId;
  setSelectedStation: (id: StationId) => void;
  selectedDay: DayDate;
  setSelectedDay: (date: DayDate) => void;
}
