'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../store';
import { checkSupabaseConnection, getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { ClipMarker } from '../types/database';
import QuickClipButton from './QuickClipButton';
import QuickClipModal from './QuickClipModal';

export default function ClipProvider() {
  const { setClips } = useAppStore();
  const isInitialLoad = useRef(true);
  const isOnline = useRef(true);
  const supabaseAvailableRef = useRef<boolean | null>(null);

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
        const { data, error } = await (supabase as any)
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

  // Initial load and online status
  useEffect(() => {
    const handleOnline = () => {
      isOnline.current = true;
      supabaseAvailableRef.current = null;
      loadClips();
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
      loadClips();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [ensureSupabaseAvailable, loadClips]);

  // Subscribe to realtime updates
  useEffect(() => {
    let channel: ReturnType<NonNullable<ReturnType<typeof getSupabase>>['channel']> | null = null;

    const subscribe = async () => {
      const supabase = getSupabase();
      if (!supabase || !isSupabaseConfigured()) return;
      if (!(await ensureSupabaseAvailable())) return;

      channel = supabase
        .channel('clip-markers-global')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'clip_markers' },
          () => {
            loadClips();
          }
        )
        .subscribe();
    };

    subscribe();

    return () => {
      if (channel) {
        const supabase = getSupabase();
        if (supabase) supabase.removeChannel(channel);
      }
    };
  }, [ensureSupabaseAvailable, loadClips]);

  return (
    <>
      <QuickClipButton />
      <QuickClipModal />
    </>
  );
}
