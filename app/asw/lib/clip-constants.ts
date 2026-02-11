/**
 * Shared clip marker constants for ASW QuickClipButton, QuickClipModal, and clips page.
 */

import {
  Video,
  Camera,
  Mic,
  Sparkles,
  MessageSquare,
  Film,
  Laugh,
  User,
  Share2,
  Clapperboard,
  Eye,
  Download,
  Archive,
  AlertTriangle,
  ArrowUp,
  Minus,
  ArrowDown,
  Footprints,
} from 'lucide-react';
import type { ASWClipCategory, ASWClipStatus, ASWMediaType, ASWClipPriority } from '../types/clips';

export const ASW_CATEGORY_CONFIG: Record<
  ASWClipCategory,
  { label: string; icon: typeof Video; color: string; shortcut: string }
> = {
  highlight: { label: 'Highlight', icon: Sparkles, color: '#FFD100', shortcut: 'H' },
  interview: { label: 'Interview', icon: MessageSquare, color: '#3B82F6', shortcut: 'I' },
  broll: { label: 'B-Roll', icon: Film, color: '#8B5CF6', shortcut: 'B' },
  reaction: { label: 'Reaction', icon: Laugh, color: '#F59E0B', shortcut: 'R' },
  signing: { label: 'Signing', icon: User, color: '#22C55E', shortcut: 'S' },
  tunnel_walk: { label: 'Tunnel Walk', icon: Footprints, color: '#06B6D4', shortcut: 'T' },
  general: { label: 'General', icon: Video, color: '#9CA3AF', shortcut: 'G' },
  social: { label: 'Social', icon: Share2, color: '#EC4899', shortcut: 'O' },
};

export const ASW_STATUS_CONFIG: Record<
  ASWClipStatus,
  { label: string; color: string; icon: typeof Eye }
> = {
  marked: { label: 'Marked', color: '#3B82F6', icon: Clapperboard },
  reviewed: { label: 'Reviewed', color: '#F59E0B', icon: Eye },
  exported: { label: 'Exported', color: '#22C55E', icon: Download },
  archived: { label: 'Archived', color: '#6B7280', icon: Archive },
};

export const ASW_MEDIA_CONFIG: Record<ASWMediaType, { label: string; icon: typeof Video }> = {
  video: { label: 'Video', icon: Video },
  photo: { label: 'Photo', icon: Camera },
  audio: { label: 'Audio', icon: Mic },
};

export const ASW_PRIORITY_CONFIG: Record<
  ASWClipPriority,
  { label: string; icon: typeof AlertTriangle; color: string; sortOrder: number }
> = {
  urgent: { label: 'Urgent', icon: AlertTriangle, color: '#EF4444', sortOrder: 0 },
  high: { label: 'High', icon: ArrowUp, color: '#F59E0B', sortOrder: 1 },
  normal: { label: 'Normal', icon: Minus, color: '#9CA3AF', sortOrder: 2 },
  low: { label: 'Low', icon: ArrowDown, color: '#6B7280', sortOrder: 3 },
};
