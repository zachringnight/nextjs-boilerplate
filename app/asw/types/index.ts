export type ViewMode = 'now' | 'schedule' | 'station' | 'players';
export type Conference = 'Eastern' | 'Western';

export interface PlayerQuestion {
  station: 'tunnel' | 'product';
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
}

// =====================
// ASW STATIONS
// =====================

export type ASWStationId = 'tunnel' | 'product';

export const ASW_STATIONS = [
  { id: 'tunnel', name: 'Tunnel', icon: '\uD83D\uDEB6', color: '#22c55e' },
  { id: 'product', name: 'Product', icon: '\uD83D\uDCF8', color: '#f59e0b' },
] as const;

export const CHECKLIST_STATIONS: ASWStationId[] = ['tunnel', 'product'];

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

// =====================
// CLIP MARKERS
// =====================

export type ClipCategory =
  | 'highlight'
  | 'interview'
  | 'broll'
  | 'reaction'
  | 'signing'
  | 'pack_rip'
  | 'general'
  | 'blooper'
  | 'social';

export type ClipStatus = 'marked' | 'reviewed' | 'exported' | 'archived';

export type MediaType = 'video' | 'photo' | 'audio';

export type ClipPriority = 'urgent' | 'high' | 'normal' | 'low';

export type ClipSortField = 'timestamp' | 'rating' | 'category' | 'priority' | 'status';
export type ClipSortDirection = 'asc' | 'desc';

export interface ClipMarker {
  id: string;
  name?: string | null;
  timestamp: string;
  timecode?: string | null;
  timecodeIn?: string | null;
  timecodeOut?: string | null;
  playerId?: string | null;
  stationId?: string | null;
  category: ClipCategory;
  tags: string[];
  notes?: string | null;
  rating?: number | null;
  mediaType: MediaType;
  camera?: string | null;
  crewMember?: string | null;
  status: ClipStatus;
  priority: ClipPriority;
  flagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClipDefaults {
  crewMember: string;
  camera: string;
  mediaType: MediaType;
}
