'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../store';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { ClipMarker } from '../types/database';
import QuickClipButton from './QuickClipButton';
import QuickClipModal from './QuickClipModal';

const LOCAL_STORAGE_KEY = 'prizm-clip-markers';

export default function ClipProvider() {
  const { setClips, clips } = useAppStore();
  const isInitialLoad = useRef(true);
  const isOnline = useRef(true);

  // Load clips from Supabase or localStorage
  const loadClips = useCallback(async () => {
    const supabase = getSupabase();

    if (supabase && isOnline.current) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('clip_markers')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);

        if (error) throw error;

        if (data) {
          setClips(data as ClipMarker[]);
          // Cache to localStorage for offline use
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
          } catch (e) {
            console.error('Error caching clips to localStorage:', e);
          }
        }
      } catch (err) {
        console.error('Error loading clips from Supabase:', err);
        loadFromLocalStorage();
      }
    } else {
      loadFromLocalStorage();
    }
  }, [setClips]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsedClips = JSON.parse(cached);
        setClips(parsedClips);
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err);
    }
  }, [setClips]);

  // Initial load and online status
  useEffect(() => {
    const handleOnline = () => {
      isOnline.current = true;
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
  }, [loadClips]);

  // Subscribe to realtime updates
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) return;

    const channel = supabase
      .channel('clip-markers-global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clip_markers' },
        () => {
          loadClips();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadClips]);

  // Keep localStorage in sync with store changes
  useEffect(() => {
    if (clips.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clips));
      } catch (e) {
        console.error('Error saving clips to localStorage:', e);
      }
    }
  }, [clips]);

  return (
    <>
      <QuickClipButton />
      <QuickClipModal />
    </>
  );
}
