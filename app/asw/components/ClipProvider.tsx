'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useASWStore } from '../store';
import { getSupabase, isSupabaseConfigured, checkSupabaseConnection } from '../lib/supabase';
import { flushASWClipSyncQueue } from '../lib/clip-sync';
import type { ASWClipMarker } from '../types/clips';
import QuickClipButton from './QuickClipButton';
import QuickClipModal from './QuickClipModal';

export default function ClipProvider() {
  const { setClips } = useASWStore();
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

  const loadClips = useCallback(async () => {
    const supabase = getSupabase();
    if (supabase && (await ensureSupabaseAvailable())) {
      try {
        const { data, error } = await supabase
          .from('asw_clip_markers')
          .select('*')
          .order('timestamp', { ascending: false });
        if (error) throw error;
        if (data) setClips(data as ASWClipMarker[]);
      } catch (err) {
        console.error('Error loading ASW clips:', err);
      }
    }
  }, [ensureSupabaseAvailable, setClips]);

  const subscribe = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) return;
    if (!(await ensureSupabaseAvailable())) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    channelRef.current = supabase
      .channel('asw-clip-markers')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'asw_clip_markers' },
        () => { loadClips(); }
      )
      .subscribe();
  }, [ensureSupabaseAvailable, loadClips]);

  useEffect(() => {
    const handleOnline = async () => {
      isOnline.current = true;
      supabaseAvailableRef.current = null;
      await flushASWClipSyncQueue();
      await loadClips();
      subscribe();
    };
    const handleOffline = () => { isOnline.current = false; };

    isOnline.current = navigator.onLine;
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      flushASWClipSyncQueue().then(() => loadClips());
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [ensureSupabaseAvailable, loadClips, subscribe]);

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
