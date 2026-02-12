/**
 * Supabase sync helpers for ASW clip markers with offline queue.
 */

import { getSupabase } from './supabase';
import type { ASWClipMarker } from '../types/clips';

// =============================================
// Pending sync queue for offline resilience
// =============================================

type SyncOp =
  | { type: 'insert'; clip: Partial<ASWClipMarker> }
  | { type: 'update'; id: string; updates: Partial<ASWClipMarker> }
  | { type: 'delete'; id: string }
  | { type: 'bulk_delete'; ids: string[] };

const QUEUE_KEY = 'asw-clip-sync-queue';

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
 * Flush all pending sync operations. Called when the app comes back online.
 */
export async function flushASWClipSyncQueue(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase || !navigator.onLine) return;

  const queue = loadQueue();
  if (queue.length === 0) return;

  const remaining: SyncOp[] = [];

  for (const op of queue) {
    try {
      let error: unknown = null;

      switch (op.type) {
        case 'insert': {
          const res = await supabase.from('asw_clip_markers').insert(op.clip);
          error = res.error;
          break;
        }
        case 'update': {
          const res = await supabase.from('asw_clip_markers').update(op.updates).eq('id', op.id);
          error = res.error;
          break;
        }
        case 'delete': {
          const res = await supabase.from('asw_clip_markers').delete().eq('id', op.id);
          error = res.error;
          break;
        }
        case 'bulk_delete': {
          const res = await supabase.from('asw_clip_markers').delete().in('id', op.ids);
          error = res.error;
          break;
        }
      }

      if (error) {
        console.error('Sync queue op failed:', error);
        remaining.push(op);
      }
    } catch (err) {
      console.error('Sync queue op error:', err);
      remaining.push(op);
    }
  }

  saveQueue(remaining);
}

// =============================================
// Individual sync operations
// =============================================

export async function syncASWClipInsert(clip: Partial<ASWClipMarker>): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !navigator.onLine) {
    enqueue({ type: 'insert', clip });
    return false;
  }

  try {
    const { error } = await supabase.from('asw_clip_markers').insert(clip);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing ASW clip insert:', err);
    enqueue({ type: 'insert', clip });
    return false;
  }
}

export async function syncASWClipUpdate(
  id: string,
  updates: Partial<ASWClipMarker>
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !navigator.onLine) {
    enqueue({ type: 'update', id, updates });
    return false;
  }

  try {
    const { error } = await supabase.from('asw_clip_markers').update(updates).eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing ASW clip update:', err);
    enqueue({ type: 'update', id, updates });
    return false;
  }
}

export async function syncASWClipDelete(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !navigator.onLine) {
    enqueue({ type: 'delete', id });
    return false;
  }

  try {
    const { error } = await supabase.from('asw_clip_markers').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing ASW clip delete:', err);
    enqueue({ type: 'delete', id });
    return false;
  }
}
