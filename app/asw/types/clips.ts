/**
 * Clip marker types for ASW
 */

export type ASWClipCategory =
  | 'highlight'
  | 'interview'
  | 'broll'
  | 'reaction'
  | 'signing'
  | 'tunnel_walk'
  | 'general'
  | 'social';

export type ASWClipStatus = 'marked' | 'reviewed' | 'exported' | 'archived';

export type ASWMediaType = 'video' | 'photo' | 'audio';

export type ASWClipPriority = 'urgent' | 'high' | 'normal' | 'low';

export interface ASWClipMarker {
  id: string;
  name?: string | null;
  timestamp: string;
  timecode?: string | null;
  player_id?: string | null;
  station_id?: string | null; // 'tunnel' | 'qa' | 'signing'
  category: ASWClipCategory;
  tags: string[];
  notes?: string | null;
  rating?: number | null;
  media_type: ASWMediaType;
  camera?: string | null;
  crew_member?: string | null;
  status: ASWClipStatus;
  priority: ASWClipPriority;
  flagged: boolean;
  created_at: string;
  updated_at: string;
}

export interface ASWClipDefaults {
  crew_member: string;
  camera: string;
  media_type: ASWMediaType;
}
