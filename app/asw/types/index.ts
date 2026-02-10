export type ViewMode = 'now' | 'schedule' | 'station' | 'players';
export type Conference = 'Eastern' | 'Western';
export type StationId = 'tunnel' | 'product';

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
  scheduledTime: string;
  playerNumber: number;
  notes: string[];
  embargoed: boolean;
  translatorNeeded: boolean;
  bio: string[];
  talkingPoints: string[];
  questions: PlayerQuestion[];
}

// =============================================
// Clip Marker Types (ported from Prizm)
// =============================================

export type ClipCategory =
  | 'highlight'
  | 'interview'
  | 'broll'
  | 'reaction'
  | 'tunnel_walk'
  | 'product_shoot'
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
  timecode_in?: string | null;
  timecode_out?: string | null;
  player_id?: string | null;
  station_id?: string | null;
  category: ClipCategory;
  tags: string[];
  notes?: string | null;
  rating?: number | null;
  media_type: MediaType;
  camera?: string | null;
  crew_member?: string | null;
  status: ClipStatus;
  priority: ClipPriority;
  flagged: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClipDefaults {
  crew_member: string;
  camera: string;
  media_type: MediaType;
}

// =============================================
// Notes / Issue Logger Types (ported from Prizm)
// =============================================

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
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  createdBy?: string;
}

// =============================================
// Player Station Checklist (ported from Prizm)
// =============================================

export interface PlayerStationCompletion {
  playerId: string;
  stationId: StationId;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}
