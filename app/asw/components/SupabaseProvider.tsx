'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useASWStore } from '../store';
import { checkSupabaseConnection, getSupabase, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchNotes,
  fetchDeliverables,
  fetchCompletions,
  type NoteRecord,
  type DeliverableRecord,
  type CompletionRecord,
} from '../lib/db-sync';
import { flushASWClipSyncQueue as flushSyncQueue } from '../lib/clip-sync';
import type {
  Note,
  NoteCategory,
  NotePriority,
  NoteStatus,
  Deliverable,
  DeliverableType,
  DeliverableStatus,
  ASWStationId,
  PlayerStationCompletion,
} from '../types';

function toAppNote(row: NoteRecord): Note {
  return {
    id: row.id,
    content: row.content,
    category: row.category as NoteCategory,
    priority: row.priority as NotePriority,
    status: row.status as NoteStatus,
    stationId: (row.station_id as ASWStationId) || undefined,
    playerId: row.player_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at || undefined,
    createdBy: row.created_by || undefined,
  };
}

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

function toAppCompletion(row: CompletionRecord): PlayerStationCompletion {
  return {
    playerId: row.player_id,
    stationId: row.station_id as ASWStationId,
    completed: row.completed,
    completedAt: row.completed_at || undefined,
    completedBy: row.completed_by || undefined,
    notes: row.notes || undefined,
  };
}

export default function SupabaseProvider() {
  const isInitialLoad = useRef(true);
  const onlineRef = useRef(true);
  const supabaseAvailableRef = useRef<boolean | null>(null);

  const ensureSupabaseAvailable = useCallback(async () => {
    if (!onlineRef.current || !isSupabaseConfigured()) return false;
    if (supabaseAvailableRef.current === true) return true;
    const isAvailable = await checkSupabaseConnection();
    supabaseAvailableRef.current = isAvailable;
    return isAvailable;
  }, []);

  const loadAllData = useCallback(async () => {
    if (!(await ensureSupabaseAvailable())) return;

    const [notesData, deliverablesData, completionsData] =
      await Promise.all([
        fetchNotes(),
        fetchDeliverables(),
        fetchCompletions(),
      ]);

    if (notesData) {
      useASWStore.setState({ notes: notesData.map(toAppNote) });
    }
    if (deliverablesData && deliverablesData.length > 0) {
      useASWStore.setState({ deliverables: deliverablesData.map(toAppDeliverable) });
    }
    if (completionsData) {
      useASWStore.setState({
        playerStationCompletions: completionsData.map(toAppCompletion),
      });
    }
  }, [ensureSupabaseAvailable]);

  // Initial load and online/offline handling
  useEffect(() => {
    const handleOnline = async () => {
      onlineRef.current = true;
      supabaseAvailableRef.current = null;
      // Flush any pending clip sync operations when coming back online
      await flushSyncQueue();
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
      // Also flush any pending operations on initial load
      flushSyncQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadAllData]);

  // Subscribe to realtime changes
  useEffect(() => {
    let mounted = true;
    let currentChannel: ReturnType<NonNullable<ReturnType<typeof getSupabase>>['channel']> | null = null;

    const subscribe = async () => {
      const supabase = getSupabase();
      if (!supabase || !isSupabaseConfigured()) return;
      if (!(await ensureSupabaseAvailable())) return;
      if (!mounted) return;

      currentChannel = supabase
        .channel('asw-tables-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notes' },
          () => {
            fetchNotes().then((data) => {
              if (data && mounted) useASWStore.setState({ notes: data.map(toAppNote) });
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'deliverables' },
          () => {
            fetchDeliverables().then((data) => {
              if (data && data.length > 0 && mounted)
                useASWStore.setState({ deliverables: data.map(toAppDeliverable) });
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'player_station_completions' },
          () => {
            fetchCompletions().then((data) => {
              if (data && mounted)
                useASWStore.setState({
                  playerStationCompletions: data.map(toAppCompletion),
                });
            });
          }
        )
        .subscribe();
    };

    subscribe();

    return () => {
      mounted = false;
      if (currentChannel) {
        const supabase = getSupabase();
        if (supabase) supabase.removeChannel(currentChannel);
      }
    };
  }, [ensureSupabaseAvailable]);

  return null;
}
