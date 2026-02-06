/**
 * Shared Supabase sync helpers for clip markers.
 * Used by QuickClipButton, QuickClipModal, and the clips page.
 *
 * Includes a pending sync queue that retries failed operations
 * when the connection is restored.
 */

import { getSupabase } from './supabase';
import { ClipMarker } from '../types/database';

// =============================================
// Pending sync queue for offline resilience
// =============================================

type SyncOp =
  | { type: 'insert'; clip: Partial<ClipMarker> }
  | { type: 'update'; id: string; updates: Partial<ClipMarker> }
  | { type: 'delete'; id: string }
  | { type: 'bulk_update'; ids: string[]; updates: Partial<ClipMarker> }
  | { type: 'bulk_delete'; ids: string[] };

const QUEUE_KEY = 'prizm-clip-sync-queue';

function loadQueue(): SyncOp[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: SyncOp[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // localStorage full or unavailable
  }
}

function enqueue(op: SyncOp): void {
  const queue = loadQueue();
  queue.push(op);
  saveQueue(queue);
}

/**
 * Flush all pending sync operations. Called when the app comes back online
 * or when a sync succeeds (piggyback flush).
 * Returns the number of operations that failed and were re-queued.
 */
export async function flushSyncQueue(): Promise<number> {
  const queue = loadQueue();
  if (queue.length === 0) return 0;

  // Clear queue first to avoid double-processing
  saveQueue([]);

  const failed: SyncOp[] = [];

  for (const op of queue) {
    let success = false;
    switch (op.type) {
      case 'insert':
        success = await doInsert(op.clip);
        break;
      case 'update':
        success = await doUpdate(op.id, op.updates);
        break;
      case 'delete':
        success = await doDelete(op.id);
        break;
      case 'bulk_update':
        success = await doBulkUpdate(op.ids, op.updates);
        break;
      case 'bulk_delete':
        success = await doBulkDelete(op.ids);
        break;
    }
    if (!success) failed.push(op);
  }

  if (failed.length > 0) saveQueue(failed);
  return failed.length;
}

// =============================================
// Raw Supabase operations (no queue, no online check)
// =============================================

async function doInsert(clipData: Partial<ClipMarker>): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('clip_markers').insert({
      id: clipData.id,
      name: clipData.name || null,
      timestamp: clipData.timestamp || new Date().toISOString(),
      category: clipData.category || 'general',
      media_type: clipData.media_type || 'video',
      status: clipData.status || 'marked',
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

async function doUpdate(id: string, updates: Partial<ClipMarker>): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
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

async function doDelete(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
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

async function doBulkUpdate(ids: string[], updates: Partial<ClipMarker>): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
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

async function doBulkDelete(ids: string[]): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
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

// =============================================
// Public sync API (with online check + queue fallback)
// =============================================

/**
 * Insert a clip into Supabase. Returns true on success.
 * Queues the operation for retry if offline or if the request fails.
 */
export async function syncClipInsert(
  clipData: Partial<ClipMarker>
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  if (!navigator.onLine) {
    enqueue({ type: 'insert', clip: clipData });
    return false;
  }

  const ok = await doInsert(clipData);
  if (!ok) enqueue({ type: 'insert', clip: clipData });
  return ok;
}

/**
 * Update a clip in Supabase by ID.
 */
export async function syncClipUpdate(
  id: string,
  updates: Partial<ClipMarker>
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  if (!navigator.onLine) {
    enqueue({ type: 'update', id, updates });
    return false;
  }

  const ok = await doUpdate(id, updates);
  if (!ok) enqueue({ type: 'update', id, updates });
  return ok;
}

/**
 * Delete a clip from Supabase by ID.
 */
export async function syncClipDelete(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  if (!navigator.onLine) {
    enqueue({ type: 'delete', id });
    return false;
  }

  const ok = await doDelete(id);
  if (!ok) enqueue({ type: 'delete', id });
  return ok;
}

/**
 * Bulk update multiple clips in Supabase.
 */
export async function syncBulkClipUpdate(
  ids: string[],
  updates: Partial<ClipMarker>
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  if (!navigator.onLine) {
    enqueue({ type: 'bulk_update', ids, updates });
    return false;
  }

  const ok = await doBulkUpdate(ids, updates);
  if (!ok) enqueue({ type: 'bulk_update', ids, updates });
  return ok;
}

/**
 * Bulk delete multiple clips from Supabase.
 */
export async function syncBulkClipDelete(ids: string[]): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  if (!navigator.onLine) {
    enqueue({ type: 'bulk_delete', ids });
    return false;
  }

  const ok = await doBulkDelete(ids);
  if (!ok) enqueue({ type: 'bulk_delete', ids });
  return ok;
}
