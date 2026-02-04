// Prizm Lounge Production Hub - TypeScript Types

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
}

export interface Station {
  id: StationId;
  name: string;
  icon: string;
  color: string;
  questions: string[];
}

export type StationId = 'signing' | 'packRip' | 'photoOp' | 'interview';

export interface ScheduleSlot {
  id: string;
  playerId: string;
  date: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:MM'
  endTime: string;
  station: StationId;
  status?: 'scheduled' | 'cancelled';
}

export type DayDate = '2026-02-06' | '2026-02-07' | '2026-02-08';

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
