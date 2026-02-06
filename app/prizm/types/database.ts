/**
 * Supabase Database Types for Prizm Lounge
 *
 * These types define the structure of our Supabase tables.
 * Run supabase/migration.sql in the Supabase SQL Editor to create all tables.
 */

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
  timestamp: string; // ISO timestamp of when the clip was marked
  timecode?: string | null; // Camera timecode (e.g., "01:23:45:12")
  timecode_in?: string | null; // In-point timecode for clip range
  timecode_out?: string | null; // Out-point timecode for clip range
  player_id?: string | null; // Associated player ID
  station_id?: string | null; // Station where clip was captured
  category: ClipCategory;
  tags: string[];
  notes?: string | null;
  rating?: number | null; // 1-5 star rating
  media_type: MediaType;
  camera?: string | null; // Camera identifier (e.g., "Camera A", "iPhone Pro")
  crew_member?: string | null; // Who marked the clip
  status: ClipStatus;
  priority: ClipPriority; // Priority level for post-production triage
  flagged: boolean; // Pinned/favorited for quick access
  created_at: string;
  updated_at: string;
}

export interface ClipMarkerInsert {
  timestamp?: string;
  timecode?: string | null;
  timecode_in?: string | null;
  timecode_out?: string | null;
  player_id?: string | null;
  station_id?: string | null;
  category?: ClipCategory;
  tags?: string[];
  notes?: string | null;
  rating?: number | null;
  media_type?: MediaType;
  camera?: string | null;
  crew_member?: string | null;
  status?: ClipStatus;
  priority?: ClipPriority;
  flagged?: boolean;
}

export interface ClipMarkerUpdate {
  timestamp?: string;
  timecode?: string | null;
  timecode_in?: string | null;
  timecode_out?: string | null;
  player_id?: string | null;
  station_id?: string | null;
  category?: ClipCategory;
  tags?: string[];
  notes?: string | null;
  rating?: number | null;
  media_type?: MediaType;
  camera?: string | null;
  crew_member?: string | null;
  status?: ClipStatus;
  priority?: ClipPriority;
  flagged?: boolean;
  updated_at?: string;
}

export interface ClipDefaults {
  crew_member: string;
  camera: string;
  media_type: MediaType;
}

// =============================================
// Notes table types
// =============================================

export interface NoteRow {
  id: string;
  content: string;
  category: string;
  priority: string;
  status: string;
  station_id: string | null;
  player_id: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  created_by: string | null;
}

export interface NoteInsert {
  id: string;
  content: string;
  category?: string;
  priority?: string;
  status?: string;
  station_id?: string | null;
  player_id?: string | null;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string | null;
  created_by?: string | null;
}

export interface NoteUpdate {
  content?: string;
  category?: string;
  priority?: string;
  status?: string;
  station_id?: string | null;
  player_id?: string | null;
  updated_at?: string;
  resolved_at?: string | null;
  created_by?: string | null;
}

// =============================================
// Deliverables table types
// =============================================

export interface DeliverableRow {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  player_id: string | null;
  due_day: string;
  completed_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  assignee: string | null;
  priority: string | null;
}

export interface DeliverableInsert {
  id: string;
  title: string;
  description?: string | null;
  type?: string;
  status?: string;
  player_id?: string | null;
  due_day: string;
  completed_at?: string | null;
  delivered_at?: string | null;
  notes?: string | null;
  assignee?: string | null;
  priority?: string | null;
}

export interface DeliverableUpdate {
  title?: string;
  description?: string | null;
  type?: string;
  status?: string;
  player_id?: string | null;
  due_day?: string;
  completed_at?: string | null;
  delivered_at?: string | null;
  notes?: string | null;
  assignee?: string | null;
  priority?: string | null;
}

// =============================================
// Schedule slots table types
// =============================================

export interface ScheduleSlotRow {
  id: string;
  player_id: string;
  date: string;
  start_time: string;
  end_time: string;
  station: string;
  status: string | null;
  pr_call_info: Record<string, unknown> | null;
  notes: string | null;
}

export interface ScheduleSlotInsert {
  id: string;
  player_id: string;
  date: string;
  start_time: string;
  end_time: string;
  station: string;
  status?: string | null;
  pr_call_info?: Record<string, unknown> | null;
  notes?: string | null;
}

export interface ScheduleSlotUpdate {
  player_id?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  station?: string;
  status?: string | null;
  pr_call_info?: Record<string, unknown> | null;
  notes?: string | null;
}

// =============================================
// Player station completions table types
// =============================================

export interface PlayerStationCompletionRow {
  id: string;
  player_id: string;
  station_id: string;
  completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  notes: string | null;
}

export interface PlayerStationCompletionInsert {
  player_id: string;
  station_id: string;
  completed?: boolean;
  completed_at?: string | null;
  completed_by?: string | null;
  notes?: string | null;
}

export interface PlayerStationCompletionUpdate {
  completed?: boolean;
  completed_at?: string | null;
  completed_by?: string | null;
  notes?: string | null;
}

// Database schema definition for Supabase client
export interface Database {
  public: {
    Tables: {
      clip_markers: {
        Row: ClipMarker;
        Insert: ClipMarkerInsert;
        Update: ClipMarkerUpdate;
      };
      notes: {
        Row: NoteRow;
        Insert: NoteInsert;
        Update: NoteUpdate;
      };
      deliverables: {
        Row: DeliverableRow;
        Insert: DeliverableInsert;
        Update: DeliverableUpdate;
      };
      schedule_slots: {
        Row: ScheduleSlotRow;
        Insert: ScheduleSlotInsert;
        Update: ScheduleSlotUpdate;
      };
      player_station_completions: {
        Row: PlayerStationCompletionRow;
        Insert: PlayerStationCompletionInsert;
        Update: PlayerStationCompletionUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      clip_category: ClipCategory;
      clip_status: ClipStatus;
      media_type: MediaType;
      clip_priority: ClipPriority;
    };
  };
}
