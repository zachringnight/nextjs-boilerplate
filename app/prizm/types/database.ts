/**
 * Supabase Database Types for Prizm Lounge
 *
 * These types define the structure of our Supabase tables.
 * Run this SQL in Supabase to create the tables:
 *
 * -- Clip markers table
 * CREATE TABLE clip_markers (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *   timecode VARCHAR(20),
 *   player_id VARCHAR(100),
 *   station_id VARCHAR(50),
 *   category VARCHAR(50) NOT NULL DEFAULT 'general',
 *   tags TEXT[],
 *   notes TEXT,
 *   rating INTEGER CHECK (rating >= 1 AND rating <= 5),
 *   media_type VARCHAR(20) DEFAULT 'video',
 *   camera VARCHAR(50),
 *   crew_member VARCHAR(100),
 *   status VARCHAR(20) DEFAULT 'marked',
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * -- Enable Row Level Security
 * ALTER TABLE clip_markers ENABLE ROW LEVEL SECURITY;
 *
 * -- Allow anonymous access for production use
 * CREATE POLICY "Allow anonymous access" ON clip_markers
 *   FOR ALL USING (true) WITH CHECK (true);
 *
 * -- Create index for faster queries
 * CREATE INDEX idx_clip_markers_timestamp ON clip_markers(timestamp DESC);
 * CREATE INDEX idx_clip_markers_player_id ON clip_markers(player_id);
 * CREATE INDEX idx_clip_markers_station_id ON clip_markers(station_id);
 * CREATE INDEX idx_clip_markers_category ON clip_markers(category);
 *
 * -- Enable realtime
 * ALTER PUBLICATION supabase_realtime ADD TABLE clip_markers;
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

// Database schema definition for Supabase client
export interface Database {
  public: {
    Tables: {
      clip_markers: {
        Row: ClipMarker;
        Insert: ClipMarkerInsert;
        Update: ClipMarkerUpdate;
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
