export type ViewMode = 'now' | 'schedule' | 'station' | 'players';
export type Conference = 'Eastern' | 'Western';

export interface PlayerQuestion {
  station: 'tunnel' | 'qa' | 'signing';
  questions: string[];
}

export interface Player {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  pronunciation?: string;
  position: string;
  team: string;
  teamAbbr: string;
  conference: Conference;
  nationality: string;
  flag: string;
  photo: string;
  jerseyNumber: number;
  day: 1 | 2;
  scheduledTime: string | null;
  playerNumber: number;
  notes: string[];
  embargoed: boolean;
  translatorNeeded: boolean;
  bio: string[];
  talkingPoints: string[];
  questions: PlayerQuestion[];
  tier?: number; // Jeff's tier (1, 1.5, 2, 2.5, 3, 3.5, 4)
  tierReason?: string; // Jeff's reasoning for tier assignment
  contentNotes?: string; // Deliverable/content plan from Jeff
  league?: string; // e.g. 'NBA', 'WNBA', 'COLLEGE', 'HS'
  exclusive?: boolean; // Exclusive Panini appearance
  signingOnly?: boolean; // Signing only, no full rotation
}

// =====================
// ASW STATIONS
// =====================

export type ASWStationId = 'tunnel' | 'qa' | 'signing';

export const ASW_STATIONS = [
  { id: 'tunnel', name: 'Tunnel', icon: '\uD83D\uDEB6', color: '#22c55e' },
  { id: 'qa', name: 'Q&A', icon: '\uD83C\uDFA4', color: '#f59e0b' },
  { id: 'signing', name: 'Signing', icon: '\u270D\uFE0F', color: '#8b5cf6' },
] as const;

export const CHECKLIST_STATIONS: ASWStationId[] = ['tunnel', 'qa', 'signing'];

// =====================
// NOTES / ISSUE LOGGER
// =====================

export type NoteCategory = 'general' | 'technical' | 'scheduling' | 'talent' | 'media' | 'urgent';
export type NotePriority = 'low' | 'medium' | 'high';
export type NoteStatus = 'open' | 'in-progress' | 'resolved';

export interface Note {
  id: string;
  content: string;
  category: NoteCategory;
  priority: NotePriority;
  status: NoteStatus;
  stationId?: ASWStationId;
  playerId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  createdBy?: string;
}

// =====================
// EVENT DAYS
// =====================

export const EVENT_DAYS = ['Thursday', 'Friday'] as const;
export type EventDay = (typeof EVENT_DAYS)[number];

// =====================
// DELIVERABLES TRACKER
// =====================

export const DELIVERABLE_TYPES = ['photo', 'video'] as const;
export type DeliverableType = (typeof DELIVERABLE_TYPES)[number];

export const DELIVERABLE_STATUSES = ['pending', 'in-progress', 'completed', 'delivered'] as const;
export type DeliverableStatus = (typeof DELIVERABLE_STATUSES)[number];

export interface Deliverable {
  id: string;
  title: string;
  description?: string;
  type: DeliverableType;
  status: DeliverableStatus;
  playerId?: string;
  dueDay: EventDay;
  completedAt?: string;
  deliveredAt?: string;
  notes?: string;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
}

// =====================
// PLAYER STATION CHECKLIST
// =====================

export interface PlayerStationCompletion {
  playerId: string;
  stationId: ASWStationId;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}
