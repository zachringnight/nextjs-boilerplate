'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../store';
import { checkSupabaseConnection, getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { flushSyncQueue } from '../lib/clip-sync';
import { ClipMarker } from '../types/database';
import QuickClipButton from './QuickClipButton';
import QuickClipModal from './QuickClipModal';

export default function ClipProvider() {
  const { setClips } = useAppStore();
  const isInitialLoad = useRef(true);
  const isOnline = useRef(true);
  const supabaseAvailableRef = useRef<boolean | null>(null);
  const channelRef = useRef<ReturnType<NonNullable<ReturnType<typeof getSupabase>>['channel']> | null>(null);

  const ensureSupabaseAvailable = useCallback(async () => {
    if (!isOnline.current || !isSupabaseConfigured()) return false;
    if (supabaseAvailableRef.current === true) return true;
    const isAvailable = await checkSupabaseConnection();
    supabaseAvailableRef.current = isAvailable;
    return isAvailable;
  }, []);

  // Load clips from Supabase (Zustand persist handles offline fallback)
  const loadClips = useCallback(async () => {
    const supabase = getSupabase();

    if (supabase && (await ensureSupabaseAvailable())) {
      try {
        const { data, error } = await supabase
          .from('clip_markers')
          .select('*')
          .order('timestamp', { ascending: false });

        if (error) throw error;

        if (data) {
          setClips(data as ClipMarker[]);
        }
      } catch (err) {
        console.error('Error loading clips from Supabase:', err);
        // Zustand persist already has clips cached in localStorage — no extra fallback needed
      }
    }
    // When offline, Zustand's persisted state already has the clips
  }, [ensureSupabaseAvailable, setClips]);

  // Subscribe (or re-subscribe) to realtime changes
  const subscribe = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) return;
    if (!(await ensureSupabaseAvailable())) return;

    // Tear down previous channel if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    channelRef.current = supabase
      .channel('clip-markers-global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clip_markers' },
        () => {
          loadClips();
        }
      )
      .subscribe();
  }, [ensureSupabaseAvailable, loadClips]);

  // Initial load, online/offline handlers, and sync queue flush
  useEffect(() => {
    const handleOnline = async () => {
      isOnline.current = true;
      supabaseAvailableRef.current = null;

      // Flush any queued sync operations first, then reload
      await flushSyncQueue();
      await loadClips();

      // Re-subscribe to realtime (channel may have died while offline)
      subscribe();
    };
    const handleOffline = () => {
      isOnline.current = false;
    };

    isOnline.current = navigator.onLine;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial load
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      // Flush any leftover queue from a previous session, then load
      flushSyncQueue().then(() => loadClips());
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [ensureSupabaseAvailable, loadClips, subscribe]);

  // Subscribe to realtime updates
  useEffect(() => {
    subscribe();

    return () => {
      if (channelRef.current) {
        const supabase = getSupabase();
        if (supabase) supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [subscribe]);

  return (
    <>
      <QuickClipButton />
      <QuickClipModal />
    </>
  );
}
