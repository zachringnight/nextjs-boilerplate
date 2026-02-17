/**
 * Supabase sync helpers for ASW database tables.
 * All reads/writes are scoped to the active event context.
 */

import { getSupabase } from './supabase';
import { canWriteRole, getRuntimeAccessContext } from './runtime-context';

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
}

export async function fetchNotes(): Promise<NoteRecord[] | null> {
  const supabase = getSupabase();
  const readCtx = getReadContext();
  if (!supabase || !readCtx || !isOnline()) return null;

  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('event_id', readCtx.eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as NoteRecord[];
  } catch (err) {
    console.error('Error fetching notes from Supabase:', err);
    return null;
  }
}

export async function syncNoteInsert(note: NoteRecord): Promise<boolean> {
  const supabase = getSupabase();
  const writeCtx = getWriteContext();
  if (!supabase || !writeCtx || !isOnline()) return false;

  try {
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

  try {
    const { error } = await supabase
      .from('notes')
      .update(updates)
      .eq('event_id', writeCtx.eventId)
      .eq('id', id);

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

  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('event_id', writeCtx.eventId)
      .eq('id', id);

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

  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('event_id', writeCtx.eventId)
      .in('id', ids);

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
}

export async function fetchDeliverables(): Promise<DeliverableRecord[] | null> {
  const supabase = getSupabase();
  const readCtx = getReadContext();
  if (!supabase || !readCtx || !isOnline()) return null;

  try {
    const { data, error } = await supabase
      .from('deliverables')
      .select('*')
      .eq('event_id', readCtx.eventId);

    if (error) throw error;
    return data as DeliverableRecord[];
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

  try {
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

  try {
    const { error } = await supabase
      .from('deliverables')
      .update(updates)
      .eq('event_id', writeCtx.eventId)
      .eq('id', id);

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

  try {
    const { error } = await supabase
      .from('deliverables')
      .delete()
      .eq('event_id', writeCtx.eventId)
      .eq('id', id);

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

  try {
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

  try {
    const { data, error } = await supabase
      .from('player_station_completions')
      .select('*')
      .eq('event_id', readCtx.eventId);

    if (error) throw error;
    return data as CompletionRecord[];
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

  try {
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

  try {
    const { error } = await supabase
      .from('player_station_completions')
      .delete()
      .eq('event_id', writeCtx.eventId)
      .eq('player_id', playerId)
      .eq('station_id', stationId);

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

  try {
    const { error } = await supabase
      .from('player_station_completions')
      .delete()
      .eq('event_id', writeCtx.eventId)
      .neq('player_id', '');

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing completions reset:', err);
    return false;
  }
}
