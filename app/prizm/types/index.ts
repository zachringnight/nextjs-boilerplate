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
}

export interface Station {
  id: StationId;
  name: string;
  icon: string;
  color: string;
  questions: string[];
}

export type StationId = 'ledWall' | 'signing' | 'packRip' | 'prCall' | 'free';

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
