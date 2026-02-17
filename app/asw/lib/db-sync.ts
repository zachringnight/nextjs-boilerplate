/**
 * Supabase sync helpers for ASW database tables.
 * Supports both event-scoped schema (current) and legacy schema (production fallback).
 */

import { players as schedulePlayers } from '../data/players';
import { getSupabase } from './supabase';
import { canWriteRole, getRuntimeAccessContext } from './runtime-context';
import { detectASWSchemaMode } from './schema-compat';
import { isUuid, stableUuidFromString } from './id-utils';

function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

function getReadContext(): { eventId: string } | null {
  const ctx = getRuntimeAccessContext();
  if (!ctx.ready || !ctx.hasAccess || !ctx.eventId) return null;
  return { eventId: ctx.eventId };
}

function getWriteContext(): { eventId: string; userId: string | null } | null {
  const ctx = getRuntimeAccessContext();
  if (!ctx.ready || !ctx.hasAccess || !ctx.eventId) return null;
  if (!canWriteRole(ctx.role)) return null;
  return {
    eventId: ctx.eventId,
    userId: ctx.userId,
  };
}

function isDeliverableStatus(value: string | null | undefined): value is DeliverableRecord['status'] {
  return value === 'pending' || value === 'in-progress' || value === 'completed' || value === 'delivered';
}

function normalizeDeliverableStatus(value: string | null | undefined): DeliverableRecord['status'] {
  const normalized = (value || '').trim().toLowerCase();
  if (isDeliverableStatus(normalized)) return normalized;
  return 'pending';
}

function normalizeDeliverableType(value: string | null | undefined): DeliverableRecord['type'] {
  const normalized = (value || '').trim().toLowerCase();
  if (normalized === 'photo' || normalized === 'video') return normalized;
  return 'video';
}

function normalizeDueDay(value: string | null | undefined, title: string | null | undefined): string {
  if (value === 'Thursday' || value === 'Friday') return value;

  const haystack = `${value || ''} ${title || ''}`.toLowerCase();
  if (haystack.includes('friday') || haystack.includes('day 2')) return 'Friday';
  return 'Thursday';
}

function legacyNoteId(id: string): string {
  if (isUuid(id)) return id;
  return stableUuidFromString(`legacy-note:${id}`);
}

function legacyDeliverableId(id: string): string {
  if (isUuid(id)) return id;
  return stableUuidFromString(`legacy-deliverable:${id}`);
}

const LEGACY_PLAYER_UUID_BY_ID = new Map<string, string>(
  schedulePlayers.map((player) => [player.id, stableUuidFromString(`legacy-player:${player.id}`)])
);

const LEGACY_PLAYER_ID_BY_UUID = new Map<string, string>(
  schedulePlayers.map((player) => [stableUuidFromString(`legacy-player:${player.id}`), player.id])
);

function legacyPlayerUuid(playerId: string): string {
  return LEGACY_PLAYER_UUID_BY_ID.get(playerId) || stableUuidFromString(`legacy-player:${playerId}`);
}

// =============================================
// NOTES SYNC
// =============================================

export interface NoteRecord {
  id: string;
  event_id?: string;
  content: string;
  category: string;
  priority: string;
  status: string;
  station_id?: string | null;
  player_id?: string | null;
  created_by_user_id?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  created_by?: string | null;
  body?: string | null;
}

export async function fetchNotes(): Promise<NoteRecord[] | null> {
  const supabase = getSupabase();
  const readCtx = getReadContext();
  if (!supabase || !readCtx || !isOnline()) return null;

  const schemaMode = await detectASWSchemaMode();

  try {
    if (schemaMode === 'event-scoped') {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('event_id', readCtx.eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NoteRecord[];
    }

    const { data, error } = await supabase
      .from('notes')
      .select('id,event_id,body,created_at')
      .eq('event_id', readCtx.eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const legacyRows = (data || []) as Array<{
      id: string;
      event_id: string;
      body: string | null;
      created_at: string;
    }>;

    return legacyRows.map((row) => ({
      id: row.id,
      event_id: row.event_id,
      content: row.body || '',
      category: 'general',
      priority: 'medium',
      status: 'open',
      created_at: row.created_at,
      updated_at: row.created_at,
      body: row.body,
    }));
  } catch (err) {
    console.error('Error fetching notes from Supabase:', err);
    return null;
  }
}

export async function syncNoteInsert(note: NoteRecord): Promise<boolean> {
  const supabase = getSupabase();
  const writeCtx = getWriteContext();
  if (!supabase || !writeCtx || !isOnline()) return false;

  const schemaMode = await detectASWSchemaMode();

  try {
    if (schemaMode === 'event-scoped') {
      const { error } = await supabase.from('notes').insert({
        id: note.id,
        event_id: writeCtx.eventId,
        content: note.content,
        category: note.category,
        priority: note.priority,
        status: note.status,
        station_id: note.station_id || null,
        player_id: note.player_id || null,
        created_by_user_id: writeCtx.userId,
        created_at: note.created_at,
        updated_at: note.updated_at,
        resolved_at: note.resolved_at || null,
        created_by: note.created_by || null,
      });

      if (error) throw error;
      return true;
    }

    const { error } = await supabase.from('notes').insert({
      id: legacyNoteId(note.id),
      event_id: writeCtx.eventId,
      body: note.content,
      created_at: note.created_at,
    });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing note insert:', err);
    return false;
  }
}

export async function syncNoteUpdate(
  id: string,
  updates: Record<string, unknown>
): Promise<boolean> {
  const supabase = getSupabase();
  const writeCtx = getWriteContext();
  if (!supabase || !writeCtx || !isOnline()) return false;

  const schemaMode = await detectASWSchemaMode();

  try {
    if (schemaMode === 'event-scoped') {
      const { error } = await supabase
        .from('notes')
        .update(updates)
        .eq('event_id', writeCtx.eventId)
        .eq('id', id);

      if (error) throw error;
      return true;
    }

    const legacyUpdates: Record<string, unknown> = {};
    if (typeof updates.content === 'string') {
      legacyUpdates.body = updates.content;
    }

    if (Object.keys(legacyUpdates).length === 0) {
      return true;
    }

    const { error } = await supabase
      .from('notes')
      .update(legacyUpdates)
      .eq('event_id', writeCtx.eventId)
      .eq('id', legacyNoteId(id));

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing note update:', err);
    return false;
  }
}

export async function syncNoteDelete(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const writeCtx = getWriteContext();
  if (!supabase || !writeCtx || !isOnline()) return false;

  const schemaMode = await detectASWSchemaMode();

  try {
    const targetId = schemaMode === 'event-scoped' ? id : legacyNoteId(id);
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('event_id', writeCtx.eventId)
      .eq('id', targetId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing note delete:', err);
    return false;
  }
}

export async function syncBulkNoteDelete(ids: string[]): Promise<boolean> {
  const supabase = getSupabase();
  const writeCtx = getWriteContext();
  if (!supabase || !writeCtx || !isOnline()) return false;

  const schemaMode = await detectASWSchemaMode();

  try {
    const targetIds = schemaMode === 'event-scoped'
      ? ids
      : ids.map((id) => legacyNoteId(id));

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('event_id', writeCtx.eventId)
      .in('id', targetIds);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing bulk note delete:', err);
    return false;
  }
}

// =============================================
// DELIVERABLES SYNC
// =============================================

export interface DeliverableRecord {
  id: string;
  event_id?: string;
  title: string;
  description?: string | null;
  type: string;
  status: string;
  player_id?: string | null;
  due_day: string;
  completed_at?: string | null;
  delivered_at?: string | null;
  notes?: string | null;
  assignee?: string | null;
  priority?: string | null;
  created_by_user_id?: string | null;
  created_at?: string | null;
}

export async function fetchDeliverables(): Promise<DeliverableRecord[] | null> {
  const supabase = getSupabase();
  const readCtx = getReadContext();
  if (!supabase || !readCtx || !isOnline()) return null;

  const schemaMode = await detectASWSchemaMode();

  try {
    if (schemaMode === 'event-scoped') {
      const { data, error } = await supabase
        .from('deliverables')
        .select('*')
        .eq('event_id', readCtx.eventId);

      if (error) throw error;
      return data as DeliverableRecord[];
    }

    const { data, error } = await supabase
      .from('deliverables')
      .select('id,event_id,title,status,created_at')
      .eq('event_id', readCtx.eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const legacyRows = (data || []) as Array<{
      id: string;
      event_id: string;
      title: string;
      status: string | null;
      created_at: string | null;
    }>;

    return legacyRows.map((row) => ({
      id: row.id,
      event_id: row.event_id,
      title: row.title,
      status: normalizeDeliverableStatus(row.status),
      type: 'video',
      due_day: normalizeDueDay(null, row.title),
      created_at: row.created_at,
    }));
  } catch (err) {
    console.error('Error fetching deliverables from Supabase:', err);
    return null;
  }
}

export async function syncDeliverableUpsert(
  deliverable: DeliverableRecord
): Promise<boolean> {
  const supabase = getSupabase();
  const writeCtx = getWriteContext();
  if (!supabase || !writeCtx || !isOnline()) return false;

  const schemaMode = await detectASWSchemaMode();

  try {
    if (schemaMode === 'event-scoped') {
      const { error } = await supabase.from('deliverables').upsert({
        id: deliverable.id,
        event_id: writeCtx.eventId,
        title: deliverable.title,
        description: deliverable.description || null,
        type: deliverable.type,
        status: deliverable.status,
        player_id: deliverable.player_id || null,
        due_day: deliverable.due_day,
        completed_at: deliverable.completed_at || null,
        delivered_at: deliverable.delivered_at || null,
        notes: deliverable.notes || null,
        assignee: deliverable.assignee || null,
        priority: deliverable.priority || null,
        created_by_user_id: writeCtx.userId,
      });

      if (error) throw error;
      return true;
    }

    const { error } = await supabase.from('deliverables').upsert({
      id: legacyDeliverableId(deliverable.id),
      event_id: writeCtx.eventId,
      title: deliverable.title,
      status: normalizeDeliverableStatus(deliverable.status),
    });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing deliverable upsert:', err);
    return false;
  }
}

export async function syncDeliverableUpdate(
  id: string,
  updates: Partial<DeliverableRecord>
): Promise<boolean> {
  const supabase = getSupabase();
  const writeCtx = getWriteContext();
  if (!supabase || !writeCtx || !isOnline()) return false;

  const schemaMode = await detectASWSchemaMode();

  try {
    if (schemaMode === 'event-scoped') {
      const { error } = await supabase
        .from('deliverables')
        .update(updates)
        .eq('event_id', writeCtx.eventId)
        .eq('id', id);

      if (error) throw error;
      return true;
    }

    const legacyUpdates: Record<string, unknown> = {};
    if (typeof updates.title === 'string') legacyUpdates.title = updates.title;
    if (typeof updates.status === 'string') {
      legacyUpdates.status = normalizeDeliverableStatus(updates.status);
    }

    if (Object.keys(legacyUpdates).length === 0) return true;

    const { error } = await supabase
      .from('deliverables')
      .update(legacyUpdates)
      .eq('event_id', writeCtx.eventId)
      .eq('id', legacyDeliverableId(id));

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing deliverable update:', err);
    return false;
  }
}

export async function syncDeliverableDelete(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const writeCtx = getWriteContext();
  if (!supabase || !writeCtx || !isOnline()) return false;

  const schemaMode = await detectASWSchemaMode();

  try {
    const targetId = schemaMode === 'event-scoped' ? id : legacyDeliverableId(id);

    const { error } = await supabase
      .from('deliverables')
      .delete()
      .eq('event_id', writeCtx.eventId)
      .eq('id', targetId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing deliverable delete:', err);
    return false;
  }
}

export async function syncBulkDeliverableUpsert(
  deliverables: DeliverableRecord[]
): Promise<boolean> {
  const supabase = getSupabase();
  const writeCtx = getWriteContext();
  if (!supabase || !writeCtx || !isOnline()) return false;

  const schemaMode = await detectASWSchemaMode();

  try {
    if (schemaMode === 'event-scoped') {
      const rows = deliverables.map((d) => ({
        id: d.id,
        event_id: writeCtx.eventId,
        title: d.title,
        description: d.description || null,
        type: d.type,
        status: d.status,
        player_id: d.player_id || null,
        due_day: d.due_day,
        completed_at: d.completed_at || null,
        delivered_at: d.delivered_at || null,
        notes: d.notes || null,
        assignee: d.assignee || null,
        priority: d.priority || null,
        created_by_user_id: writeCtx.userId,
      }));

      const { error } = await supabase.from('deliverables').upsert(rows);
      if (error) throw error;
      return true;
    }

    const rows = deliverables.map((d) => ({
      id: legacyDeliverableId(d.id),
      event_id: writeCtx.eventId,
      title: d.title,
      status: normalizeDeliverableStatus(d.status),
    }));

    const { error } = await supabase.from('deliverables').upsert(rows);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing bulk deliverable upsert:', err);
    return false;
  }
}

// =============================================
// PLAYER STATION COMPLETIONS SYNC
// =============================================

export interface CompletionRecord {
  event_id?: string;
  player_id: string;
  station_id: string;
  completed: boolean;
  completed_at?: string | null;
  completed_by?: string | null;
  notes?: string | null;
  created_by_user_id?: string | null;
}

export async function fetchCompletions(): Promise<CompletionRecord[] | null> {
  const supabase = getSupabase();
  const readCtx = getReadContext();
  if (!supabase || !readCtx || !isOnline()) return null;

  const schemaMode = await detectASWSchemaMode();

  try {
    if (schemaMode === 'event-scoped') {
      const { data, error } = await supabase
        .from('player_station_completions')
        .select('*')
        .eq('event_id', readCtx.eventId);

      if (error) throw error;
      return data as CompletionRecord[];
    }

    const { data, error } = await supabase
      .from('player_station_completions')
      .select('player_id,station,completed_at')
      .order('completed_at', { ascending: false });

    if (error) throw error;

    const legacyRows = (data || []) as Array<{
      player_id: string;
      station: string;
      completed_at: string | null;
    }>;

    const mappedRows: CompletionRecord[] = [];

    for (const row of legacyRows) {
      const playerId = LEGACY_PLAYER_ID_BY_UUID.get(row.player_id);
      if (!playerId) continue;
      if (row.station !== 'tunnel' && row.station !== 'product') continue;

      mappedRows.push({
        player_id: playerId,
        station_id: row.station,
        completed: true,
        completed_at: row.completed_at,
      });
    }

    return mappedRows;
  } catch (err) {
    console.error('Error fetching completions from Supabase:', err);
    return null;
  }
}

export async function syncCompletionUpsert(
  completion: CompletionRecord
): Promise<boolean> {
  const supabase = getSupabase();
  const writeCtx = getWriteContext();
  if (!supabase || !writeCtx || !isOnline()) return false;

  const schemaMode = await detectASWSchemaMode();

  try {
    if (schemaMode === 'event-scoped') {
      const { error } = await supabase
        .from('player_station_completions')
        .upsert(
          {
            event_id: writeCtx.eventId,
            player_id: completion.player_id,
            station_id: completion.station_id,
            completed: completion.completed,
            completed_at: completion.completed_at || null,
            completed_by: completion.completed_by || null,
            notes: completion.notes || null,
            created_by_user_id: writeCtx.userId,
          },
          { onConflict: 'event_id,player_id,station_id' }
        );

      if (error) throw error;
      return true;
    }

    const playerUuid = legacyPlayerUuid(completion.player_id);

    const { error: ensurePlayerError } = await supabase
      .from('players')
      .upsert({ id: playerUuid }, { onConflict: 'id' });

    if (ensurePlayerError) throw ensurePlayerError;

    const { error: deleteError } = await supabase
      .from('player_station_completions')
      .delete()
      .eq('player_id', playerUuid)
      .eq('station', completion.station_id);

    if (deleteError) throw deleteError;

    const { error: insertError } = await supabase
      .from('player_station_completions')
      .insert({
        player_id: playerUuid,
        station: completion.station_id,
        completed_at: completion.completed_at || new Date().toISOString(),
      });

    if (insertError) throw insertError;
    return true;
  } catch (err) {
    console.error('Error syncing completion upsert:', err);
    return false;
  }
}

export async function syncCompletionDelete(
  playerId: string,
  stationId: string
): Promise<boolean> {
  const supabase = getSupabase();
  const writeCtx = getWriteContext();
  if (!supabase || !writeCtx || !isOnline()) return false;

  const schemaMode = await detectASWSchemaMode();

  try {
    if (schemaMode === 'event-scoped') {
      const { error } = await supabase
        .from('player_station_completions')
        .delete()
        .eq('event_id', writeCtx.eventId)
        .eq('player_id', playerId)
        .eq('station_id', stationId);

      if (error) throw error;
      return true;
    }

    const playerUuid = legacyPlayerUuid(playerId);

    const { error } = await supabase
      .from('player_station_completions')
      .delete()
      .eq('player_id', playerUuid)
      .eq('station', stationId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing completion delete:', err);
    return false;
  }
}

export async function syncResetCompletions(): Promise<boolean> {
  const supabase = getSupabase();
  const writeCtx = getWriteContext();
  if (!supabase || !writeCtx || !isOnline()) return false;

  const schemaMode = await detectASWSchemaMode();

  try {
    if (schemaMode === 'event-scoped') {
      const { error } = await supabase
        .from('player_station_completions')
        .delete()
        .eq('event_id', writeCtx.eventId)
        .neq('player_id', '');

      if (error) throw error;
      return true;
    }

    const legacyPlayerUuids = Array.from(LEGACY_PLAYER_ID_BY_UUID.keys());
    if (legacyPlayerUuids.length === 0) return true;

    const { error } = await supabase
      .from('player_station_completions')
      .delete()
      .in('player_id', legacyPlayerUuids);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing completions reset:', err);
    return false;
  }
}
