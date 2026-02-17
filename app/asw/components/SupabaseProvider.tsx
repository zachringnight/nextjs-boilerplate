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
import { flushSyncQueue } from '../lib/clip-sync';
import { detectASWSchemaMode } from '../lib/schema-compat';
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
import { useAuthContext } from './AuthProvider';

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
  const onlineRef = useRef(true);
  const supabaseAvailableRef = useRef<boolean | null>(null);
  const { mode, ready, hasAccess, access } = useAuthContext();

  const eventId = access?.eventId ?? null;

  const ensureSupabaseAvailable = useCallback(async () => {
    if (mode === 'bypass') return false;
    if (!ready || !hasAccess || !eventId) return false;
    if (!onlineRef.current || !isSupabaseConfigured()) return false;
    if (supabaseAvailableRef.current === true) return true;

    const isAvailable = await checkSupabaseConnection();
    supabaseAvailableRef.current = isAvailable;
    return isAvailable;
  }, [eventId, hasAccess, mode, ready]);

  const loadAllData = useCallback(async () => {
    if (!(await ensureSupabaseAvailable())) return;

    const [notesData, deliverablesData, completionsData] = await Promise.all([
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

  useEffect(() => {
    if (mode === 'bypass') return;
    if (!ready || !hasAccess || !eventId) return;

    const handleOnline = async () => {
      onlineRef.current = true;
      supabaseAvailableRef.current = null;
      await flushSyncQueue();
      await loadAllData();
    };

    const handleOffline = () => {
      onlineRef.current = false;
    };

    onlineRef.current = navigator.onLine;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    void loadAllData();
    void flushSyncQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [eventId, hasAccess, loadAllData, mode, ready]);

  useEffect(() => {
    if (mode === 'bypass') return;
    if (!ready || !hasAccess || !eventId) return;

    let mounted = true;
    let currentChannel: ReturnType<NonNullable<ReturnType<typeof getSupabase>>['channel']> | null = null;

    const subscribe = async () => {
      const supabase = getSupabase();
      if (!supabase || !isSupabaseConfigured()) return;
      if (!(await ensureSupabaseAvailable())) return;
      if (!mounted) return;
      const schemaMode = await detectASWSchemaMode();
      const baseChannel = supabase
        .channel(`asw-tables-sync-${eventId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notes', filter: `event_id=eq.${eventId}` },
          () => {
            fetchNotes().then((data) => {
              if (data && mounted) useASWStore.setState({ notes: data.map(toAppNote) });
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'deliverables', filter: `event_id=eq.${eventId}` },
          () => {
            fetchDeliverables().then((data) => {
              if (data && data.length > 0 && mounted) {
                useASWStore.setState({ deliverables: data.map(toAppDeliverable) });
              }
            });
          }
        );

      const onCompletionsChange = () => {
        fetchCompletions().then((data) => {
          if (data && mounted) {
            useASWStore.setState({
              playerStationCompletions: data.map(toAppCompletion),
            });
          }
        });
      };

      currentChannel =
        schemaMode === 'event-scoped'
          ? baseChannel
              .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'player_station_completions', filter: `event_id=eq.${eventId}` },
                onCompletionsChange
              )
              .subscribe()
          : baseChannel
              .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'player_station_completions' },
                onCompletionsChange
              )
              .subscribe();
    };

    void subscribe();

    return () => {
      mounted = false;
      if (currentChannel) {
        const supabase = getSupabase();
        if (supabase) supabase.removeChannel(currentChannel);
      }
    };
  }, [ensureSupabaseAvailable, eventId, hasAccess, mode, ready]);

  return null;
}
