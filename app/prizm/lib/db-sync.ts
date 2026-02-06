/**
 * Supabase sync helpers for all database tables.
 * Each function gracefully returns false when offline or Supabase is not configured.
 */

import { getSupabase } from './supabase';

function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

// =============================================
// NOTES SYNC
// =============================================

export interface NoteRecord {
  id: string;
  content: string;
  category: string;
  priority: string;
  status: string;
  station_id?: string | null;
  player_id?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  created_by?: string | null;
}

export async function fetchNotes(): Promise<NoteRecord[] | null> {
  const supabase = getSupabase();
  if (!supabase || !isOnline()) return null;
  try {
    const { data, error } = await (supabase as any)
      .from('notes')
      .select('*')
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
  if (!supabase || !isOnline()) return false;
  try {
    const { error } = await (supabase as any).from('notes').insert({
      id: note.id,
      content: note.content,
      category: note.category,
      priority: note.priority,
      status: note.status,
      station_id: note.station_id || null,
      player_id: note.player_id || null,
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
  if (!supabase || !isOnline()) return false;
  try {
    const { error } = await (supabase as any)
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
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
  if (!supabase || !isOnline()) return false;
  try {
    const { error } = await (supabase as any).from('notes').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing note delete:', err);
    return false;
  }
}

export async function syncBulkNoteDelete(ids: string[]): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !isOnline()) return false;
  try {
    const { error } = await (supabase as any).from('notes').delete().in('id', ids);
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
}

export async function fetchDeliverables(): Promise<DeliverableRecord[] | null> {
  const supabase = getSupabase();
  if (!supabase || !isOnline()) return null;
  try {
    const { data, error } = await (supabase as any).from('deliverables').select('*');
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
  if (!supabase || !isOnline()) return false;
  try {
    const { error } = await (supabase as any).from('deliverables').upsert({
      id: deliverable.id,
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
  if (!supabase || !isOnline()) return false;
  try {
    const { error } = await (supabase as any)
      .from('deliverables')
      .update(updates)
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
  if (!supabase || !isOnline()) return false;
  try {
    const { error } = await (supabase as any).from('deliverables').delete().eq('id', id);
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
  if (!supabase || !isOnline()) return false;
  try {
    const rows = deliverables.map((d) => ({
      id: d.id,
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
    }));
    const { error } = await (supabase as any).from('deliverables').upsert(rows);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing bulk deliverable upsert:', err);
    return false;
  }
}

// =============================================
// SCHEDULE SLOTS SYNC
// =============================================

export interface ScheduleSlotRecord {
  id: string;
  player_id: string;
  date: string;
  start_time: string;
  end_time: string;
  station: string;
  status?: string | null;
  pr_call_info?: Record<string, unknown> | null;
  notes?: string | null;
}

export async function fetchScheduleSlots(): Promise<ScheduleSlotRecord[] | null> {
  const supabase = getSupabase();
  if (!supabase || !isOnline()) return null;
  try {
    const { data, error } = await (supabase as any)
      .from('schedule_slots')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    if (error) throw error;
    return data as ScheduleSlotRecord[];
  } catch (err) {
    console.error('Error fetching schedule slots from Supabase:', err);
    return null;
  }
}

export async function syncScheduleSlotUpsert(
  slot: ScheduleSlotRecord
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !isOnline()) return false;
  try {
    const { error } = await (supabase as any).from('schedule_slots').upsert({
      id: slot.id,
      player_id: slot.player_id,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      station: slot.station,
      status: slot.status || null,
      pr_call_info: slot.pr_call_info || null,
      notes: slot.notes || null,
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing schedule slot upsert:', err);
    return false;
  }
}

export async function syncScheduleSlotDelete(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !isOnline()) return false;
  try {
    const { error } = await (supabase as any)
      .from('schedule_slots')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing schedule slot delete:', err);
    return false;
  }
}

export async function syncBulkScheduleSlotUpsert(
  slots: ScheduleSlotRecord[]
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !isOnline()) return false;
  try {
    const rows = slots.map((s) => ({
      id: s.id,
      player_id: s.player_id,
      date: s.date,
      start_time: s.start_time,
      end_time: s.end_time,
      station: s.station,
      status: s.status || null,
      pr_call_info: s.pr_call_info || null,
      notes: s.notes || null,
    }));
    const { error } = await (supabase as any).from('schedule_slots').upsert(rows);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing bulk schedule slot upsert:', err);
    return false;
  }
}

// =============================================
// PLAYER STATION COMPLETIONS SYNC
// =============================================

export interface CompletionRecord {
  player_id: string;
  station_id: string;
  completed: boolean;
  completed_at?: string | null;
  completed_by?: string | null;
  notes?: string | null;
}

export async function fetchCompletions(): Promise<CompletionRecord[] | null> {
  const supabase = getSupabase();
  if (!supabase || !isOnline()) return null;
  try {
    const { data, error } = await (supabase as any)
      .from('player_station_completions')
      .select('*');
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
  if (!supabase || !isOnline()) return false;
  try {
    const { error } = await (supabase as any)
      .from('player_station_completions')
      .upsert(
        {
          player_id: completion.player_id,
          station_id: completion.station_id,
          completed: completion.completed,
          completed_at: completion.completed_at || null,
          completed_by: completion.completed_by || null,
          notes: completion.notes || null,
        },
        { onConflict: 'player_id,station_id' }
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
  if (!supabase || !isOnline()) return false;
  try {
    const { error } = await (supabase as any)
      .from('player_station_completions')
      .delete()
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
  if (!supabase || !isOnline()) return false;
  try {
    const { error } = await (supabase as any)
      .from('player_station_completions')
      .delete()
      .neq('player_id', '');
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing completions reset:', err);
    return false;
  }
}
