/**
 * Shared Supabase sync helpers for clip markers.
 * Used by QuickClipButton, QuickClipModal, and the clips page.
 */

import { getSupabase } from './supabase';
import { ClipMarker } from '../types/database';

/**
 * Insert a clip into Supabase. Returns true on success, false on failure.
 * Silently fails when offline or Supabase is not configured.
 */
export async function syncClipInsert(
  clipData: Partial<ClipMarker>
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !navigator.onLine) return false;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('clip_markers').insert({
      timestamp: new Date().toISOString(),
      category: clipData.category || 'general',
      media_type: clipData.media_type || 'video',
      status: 'marked',
      priority: clipData.priority || 'normal',
      flagged: clipData.flagged || false,
      tags: clipData.tags || [],
      notes: clipData.notes || null,
      player_id: clipData.player_id || null,
      station_id: clipData.station_id || null,
      timecode: clipData.timecode || null,
      timecode_in: clipData.timecode_in || null,
      timecode_out: clipData.timecode_out || null,
      camera: clipData.camera || null,
      crew_member: clipData.crew_member || null,
      rating: clipData.rating || null,
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing clip insert to Supabase:', err);
    return false;
  }
}

/**
 * Update a clip in Supabase by ID.
 */
export async function syncClipUpdate(
  id: string,
  updates: Partial<ClipMarker>
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !navigator.onLine) return false;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('clip_markers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing clip update to Supabase:', err);
    return false;
  }
}

/**
 * Delete a clip from Supabase by ID.
 */
export async function syncClipDelete(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !navigator.onLine) return false;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('clip_markers')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing clip delete to Supabase:', err);
    return false;
  }
}

/**
 * Bulk update multiple clips in Supabase.
 */
export async function syncBulkClipUpdate(
  ids: string[],
  updates: Partial<ClipMarker>
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !navigator.onLine) return false;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('clip_markers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .in('id', ids);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing bulk clip update to Supabase:', err);
    return false;
  }
}

/**
 * Bulk delete multiple clips from Supabase.
 */
export async function syncBulkClipDelete(ids: string[]): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !navigator.onLine) return false;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('clip_markers')
      .delete()
      .in('id', ids);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing bulk clip delete to Supabase:', err);
    return false;
  }
}
