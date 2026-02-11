/**
 * Shared clip marker constants for the ASW build.
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
  Play,
  Share2,
  Clapperboard,
  Eye,
  Download,
  Archive,
  AlertTriangle,
  ArrowUp,
  Minus,
  ArrowDown,
} from 'lucide-react';
import type { ClipCategory, ClipStatus, MediaType, ClipPriority } from '../types';

export const CATEGORY_CONFIG: Record<
  ClipCategory,
  { label: string; icon: typeof Video; color: string; shortcut: string }
> = {
  highlight: { label: 'Highlight', icon: Sparkles, color: '#FFD100', shortcut: 'H' },
  interview: { label: 'Interview', icon: MessageSquare, color: '#3B82F6', shortcut: 'I' },
  broll: { label: 'B-Roll', icon: Film, color: '#8B5CF6', shortcut: 'B' },
  reaction: { label: 'Reaction', icon: Laugh, color: '#F59E0B', shortcut: 'R' },
  signing: { label: 'Signing', icon: User, color: '#22C55E', shortcut: 'S' },
  pack_rip: { label: 'Pack Rip', icon: Play, color: '#EF4444', shortcut: 'P' },
  general: { label: 'General', icon: Video, color: '#9CA3AF', shortcut: 'G' },
  blooper: { label: 'Blooper', icon: Laugh, color: '#EC4899', shortcut: 'L' },
  social: { label: 'Social', icon: Share2, color: '#06B6D4', shortcut: 'O' },
};

export const STATUS_CONFIG: Record<
  ClipStatus,
  { label: string; color: string; icon: typeof Eye }
> = {
  marked: { label: 'Marked', color: '#3B82F6', icon: Clapperboard },
  reviewed: { label: 'Reviewed', color: '#F59E0B', icon: Eye },
  exported: { label: 'Exported', color: '#22C55E', icon: Download },
  archived: { label: 'Archived', color: '#6B7280', icon: Archive },
};

export const MEDIA_CONFIG: Record<MediaType, { label: string; icon: typeof Video }> = {
  video: { label: 'Video', icon: Video },
  photo: { label: 'Photo', icon: Camera },
  audio: { label: 'Audio', icon: Mic },
};

export const PRIORITY_CONFIG: Record<
  ClipPriority,
  { label: string; icon: typeof AlertTriangle; color: string; sortOrder: number }
> = {
  urgent: { label: 'Urgent', icon: AlertTriangle, color: '#EF4444', sortOrder: 0 },
  high: { label: 'High', icon: ArrowUp, color: '#F59E0B', sortOrder: 1 },
  normal: { label: 'Normal', icon: Minus, color: '#9CA3AF', sortOrder: 2 },
  low: { label: 'Low', icon: ArrowDown, color: '#6B7280', sortOrder: 3 },
};
