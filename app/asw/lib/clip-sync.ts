/**
 * Supabase sync helpers for clip markers in the ASW build.
 * Includes a pending sync queue that retries failed operations when online.
 */

import { getSupabase } from './supabase';
import type { ClipMarker } from '../types';
import { canWriteRole, getRuntimeAccessContext } from './runtime-context';

interface WriteContext {
  eventId: string;
  userId: string | null;
}

interface SyncInsertOp {
  type: 'insert';
  clip: Partial<ClipMarker>;
  ctx: WriteContext;
}

interface SyncUpdateOp {
  type: 'update';
  id: string;
  updates: Partial<ClipMarker>;
  ctx: WriteContext;
}

interface SyncDeleteOp {
  type: 'delete';
  id: string;
  ctx: WriteContext;
}

interface SyncBulkUpdateOp {
  type: 'bulk_update';
  ids: string[];
  updates: Partial<ClipMarker>;
  ctx: WriteContext;
}

interface SyncBulkDeleteOp {
  type: 'bulk_delete';
  ids: string[];
  ctx: WriteContext;
}

type SyncOp =
  | SyncInsertOp
  | SyncUpdateOp
  | SyncDeleteOp
  | SyncBulkUpdateOp
  | SyncBulkDeleteOp;

const QUEUE_KEY = 'asw-clip-sync-queue';

function getWriteContext(): WriteContext | null {
  const ctx = getRuntimeAccessContext();
  if (!ctx.ready || !ctx.hasAccess || !ctx.eventId) return null;
  if (!canWriteRole(ctx.role)) return null;

  return {
    eventId: ctx.eventId,
    userId: ctx.userId,
  };
}

function loadQueue(): SyncOp[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as SyncOp[]) : [];
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

export async function flushSyncQueue(): Promise<number> {
  const queue = loadQueue();
  if (queue.length === 0) return 0;

  saveQueue([]);

  const failed: SyncOp[] = [];

  for (const op of queue) {
    let success = false;
    switch (op.type) {
      case 'insert':
        success = await doInsert(op.clip, op.ctx);
        break;
      case 'update':
        success = await doUpdate(op.id, op.updates, op.ctx);
        break;
      case 'delete':
        success = await doDelete(op.id, op.ctx);
        break;
      case 'bulk_update':
        success = await doBulkUpdate(op.ids, op.updates, op.ctx);
        break;
      case 'bulk_delete':
        success = await doBulkDelete(op.ids, op.ctx);
        break;
    }

    if (!success) failed.push(op);
  }

  if (failed.length > 0) saveQueue(failed);
  return failed.length;
}

function toDbClip(clipData: Partial<ClipMarker>, ctx: WriteContext): Record<string, unknown> {
  return {
    id: clipData.id,
    event_id: ctx.eventId,
    name: clipData.name || null,
    timestamp: clipData.timestamp || new Date().toISOString(),
    category: clipData.category || 'general',
    media_type: clipData.mediaType || 'video',
    status: clipData.status || 'marked',
    priority: clipData.priority || 'normal',
    flagged: clipData.flagged || false,
    tags: clipData.tags || [],
    notes: clipData.notes || null,
    player_id: clipData.playerId || null,
    station_id: clipData.stationId || null,
    timecode: clipData.timecode || null,
    timecode_in: clipData.timecodeIn || null,
    timecode_out: clipData.timecodeOut || null,
    camera: clipData.camera || null,
    crew_member: clipData.crewMember || null,
    rating: clipData.rating || null,
    created_by_user_id: ctx.userId,
  };
}

function toDbUpdates(updates: Partial<ClipMarker>): Record<string, unknown> {
  const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.timestamp !== undefined) dbUpdates.timestamp = updates.timestamp;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.mediaType !== undefined) dbUpdates.media_type = updates.mediaType;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.flagged !== undefined) dbUpdates.flagged = updates.flagged;
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.playerId !== undefined) dbUpdates.player_id = updates.playerId;
  if (updates.stationId !== undefined) dbUpdates.station_id = updates.stationId;
  if (updates.timecode !== undefined) dbUpdates.timecode = updates.timecode;
  if (updates.timecodeIn !== undefined) dbUpdates.timecode_in = updates.timecodeIn;
  if (updates.timecodeOut !== undefined) dbUpdates.timecode_out = updates.timecodeOut;
  if (updates.camera !== undefined) dbUpdates.camera = updates.camera;
  if (updates.crewMember !== undefined) dbUpdates.crew_member = updates.crewMember;
  if (updates.rating !== undefined) dbUpdates.rating = updates.rating;

  return dbUpdates;
}

async function doInsert(clipData: Partial<ClipMarker>, ctx: WriteContext): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('clip_markers').insert(toDbClip(clipData, ctx));
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing clip insert to Supabase:', err);
    return false;
  }
}

async function doUpdate(id: string, updates: Partial<ClipMarker>, ctx: WriteContext): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('clip_markers')
      .update(toDbUpdates(updates))
      .eq('event_id', ctx.eventId)
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing clip update to Supabase:', err);
    return false;
  }
}

async function doDelete(id: string, ctx: WriteContext): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('clip_markers')
      .delete()
      .eq('event_id', ctx.eventId)
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing clip delete to Supabase:', err);
    return false;
  }
}

async function doBulkUpdate(ids: string[], updates: Partial<ClipMarker>, ctx: WriteContext): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('clip_markers')
      .update(toDbUpdates(updates))
      .eq('event_id', ctx.eventId)
      .in('id', ids);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing bulk clip update to Supabase:', err);
    return false;
  }
}

async function doBulkDelete(ids: string[], ctx: WriteContext): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('clip_markers')
      .delete()
      .eq('event_id', ctx.eventId)
      .in('id', ids);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing bulk clip delete to Supabase:', err);
    return false;
  }
}

export async function syncClipInsert(
  clipData: Partial<ClipMarker>
): Promise<boolean> {
  const supabase = getSupabase();
  const ctx = getWriteContext();
  if (!supabase || !ctx) return false;

  if (!navigator.onLine) {
    enqueue({ type: 'insert', clip: clipData, ctx });
    return false;
  }

  const ok = await doInsert(clipData, ctx);
  if (!ok) enqueue({ type: 'insert', clip: clipData, ctx });
  return ok;
}

export async function syncClipUpdate(
  id: string,
  updates: Partial<ClipMarker>
): Promise<boolean> {
  const supabase = getSupabase();
  const ctx = getWriteContext();
  if (!supabase || !ctx) return false;

  if (!navigator.onLine) {
    enqueue({ type: 'update', id, updates, ctx });
    return false;
  }

  const ok = await doUpdate(id, updates, ctx);
  if (!ok) enqueue({ type: 'update', id, updates, ctx });
  return ok;
}

export async function syncClipDelete(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const ctx = getWriteContext();
  if (!supabase || !ctx) return false;

  if (!navigator.onLine) {
    enqueue({ type: 'delete', id, ctx });
    return false;
  }

  const ok = await doDelete(id, ctx);
  if (!ok) enqueue({ type: 'delete', id, ctx });
  return ok;
}

export async function syncBulkClipUpdate(
  ids: string[],
  updates: Partial<ClipMarker>
): Promise<boolean> {
  const supabase = getSupabase();
  const ctx = getWriteContext();
  if (!supabase || !ctx) return false;

  if (!navigator.onLine) {
    enqueue({ type: 'bulk_update', ids, updates, ctx });
    return false;
  }

  const ok = await doBulkUpdate(ids, updates, ctx);
  if (!ok) enqueue({ type: 'bulk_update', ids, updates, ctx });
  return ok;
}

export async function syncBulkClipDelete(ids: string[]): Promise<boolean> {
  const supabase = getSupabase();
  const ctx = getWriteContext();
  if (!supabase || !ctx) return false;

  if (!navigator.onLine) {
    enqueue({ type: 'bulk_delete', ids, ctx });
    return false;
  }

  const ok = await doBulkDelete(ids, ctx);
  if (!ok) enqueue({ type: 'bulk_delete', ids, ctx });
  return ok;
}
