'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../store';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchNotes,
  fetchDeliverables,
  fetchScheduleSlots,
  fetchCompletions,
  type NoteRecord,
  type DeliverableRecord,
  type ScheduleSlotRecord,
  type CompletionRecord,
} from '../lib/db-sync';
import type {
  Note,
  NoteCategory,
  NotePriority,
  NoteStatus,
  Deliverable,
  DeliverableType,
  DeliverableStatus,
  ScheduleSlot,
  StationId,
  PlayerStationCompletion,
} from '../types';

// Convert Supabase note row to app Note type
function toAppNote(row: NoteRecord): Note {
  return {
    id: row.id,
    content: row.content,
    category: row.category as NoteCategory,
    priority: row.priority as NotePriority,
    status: row.status as NoteStatus,
    stationId: (row.station_id as StationId) || undefined,
    playerId: row.player_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at || undefined,
    createdBy: row.created_by || undefined,
  };
}

// Convert Supabase deliverable row to app Deliverable type
function toAppDeliverable(row: DeliverableRecord): Deliverable {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    type: row.type as DeliverableType,
    status: row.status as DeliverableStatus,
    playerId: row.player_id || undefined,
    dueDay: row.due_day as Deliverable['dueDay'],
    completedAt: row.completed_at || undefined,
    deliveredAt: row.delivered_at || undefined,
    notes: row.notes || undefined,
    assignee: row.assignee || undefined,
    priority: (row.priority as Deliverable['priority']) || undefined,
  };
}

// Convert Supabase schedule slot row to app ScheduleSlot type
function toAppScheduleSlot(row: ScheduleSlotRecord): ScheduleSlot {
  const slot: ScheduleSlot = {
    id: row.id,
    playerId: row.player_id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    station: row.station as StationId,
    status: (row.status as ScheduleSlot['status']) || undefined,
    notes: row.notes || undefined,
  };
  if (row.pr_call_info) {
    slot.prCallInfo = row.pr_call_info as unknown as ScheduleSlot['prCallInfo'];
  }
  return slot;
}

// Convert Supabase completion row to app PlayerStationCompletion type
function toAppCompletion(row: CompletionRecord): PlayerStationCompletion {
  return {
    playerId: row.player_id,
    stationId: row.station_id as StationId,
    completed: row.completed,
    completedAt: row.completed_at || undefined,
    completedBy: row.completed_by || undefined,
    notes: row.notes || undefined,
  };
}

export default function SupabaseProvider() {
  const store = useAppStore;
  const isInitialLoad = useRef(true);
  const onlineRef = useRef(true);

  const loadAllData = useCallback(async () => {
    if (!onlineRef.current || !isSupabaseConfigured()) return;

    const [notesData, deliverablesData, scheduleData, completionsData] =
      await Promise.all([
        fetchNotes(),
        fetchDeliverables(),
        fetchScheduleSlots(),
        fetchCompletions(),
      ]);

    if (notesData) {
      store.setState({ notes: notesData.map(toAppNote) });
    }
    if (deliverablesData && deliverablesData.length > 0) {
      store.setState({ deliverables: deliverablesData.map(toAppDeliverable) });
    }
    if (scheduleData && scheduleData.length > 0) {
      store.setState({ schedule: scheduleData.map(toAppScheduleSlot) });
    }
    if (completionsData) {
      store.setState({
        playerStationCompletions: completionsData.map(toAppCompletion),
      });
    }
  }, [store]);

  // Initial load and online/offline handling
  useEffect(() => {
    const handleOnline = () => {
      onlineRef.current = true;
      loadAllData();
    };
    const handleOffline = () => {
      onlineRef.current = false;
    };

    onlineRef.current = navigator.onLine;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadAllData();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadAllData]);

  // Subscribe to realtime changes on all tables
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) return;

    const channel = supabase
      .channel('all-tables-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        () => {
          fetchNotes().then((data) => {
            if (data) store.setState({ notes: data.map(toAppNote) });
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deliverables' },
        () => {
          fetchDeliverables().then((data) => {
            if (data && data.length > 0)
              store.setState({ deliverables: data.map(toAppDeliverable) });
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schedule_slots' },
        () => {
          fetchScheduleSlots().then((data) => {
            if (data && data.length > 0)
              store.setState({ schedule: data.map(toAppScheduleSlot) });
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'player_station_completions' },
        () => {
          fetchCompletions().then((data) => {
            if (data)
              store.setState({
                playerStationCompletions: data.map(toAppCompletion),
              });
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [store]);

  return null;
}
