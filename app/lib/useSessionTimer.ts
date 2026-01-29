'use client';

import { useState, useEffect, useCallback } from 'react';
import { SLOT_DURATION_MINUTES } from './constants';

interface PlayerSession {
  playerId: string;
  actualStartTime: number; // Unix timestamp in ms
  durationMinutes: number;
}

interface SessionTimerState {
  sessions: Record<string, PlayerSession>;
}

const STORAGE_KEY = 'panini-crew-sessions';

function loadFromStorage(): SessionTimerState {
  if (typeof window === 'undefined') return { sessions: {} };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load session data:', e);
  }
  return { sessions: {} };
}

function saveToStorage(state: SessionTimerState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save session data:', e);
  }
}

export function useSessionTimer() {
  const [state, setState] = useState<SessionTimerState>({ sessions: {} });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setState(loadFromStorage());
    setIsLoaded(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(state);
    }
  }, [state, isLoaded]);

  // Start a player's session (mark them as arrived)
  const startSession = useCallback((playerId: string, durationMinutes: number = SLOT_DURATION_MINUTES) => {
    setState(prev => ({
      ...prev,
      sessions: {
        ...prev.sessions,
        [playerId]: {
          playerId,
          actualStartTime: Date.now(),
          durationMinutes,
        },
      },
    }));
  }, []);

  // Adjust a player's session start time by offset minutes (positive = started later, negative = started earlier)
  const adjustSession = useCallback((playerId: string, offsetMinutes: number) => {
    setState(prev => {
      const session = prev.sessions[playerId];
      if (!session) return prev;

      return {
        ...prev,
        sessions: {
          ...prev.sessions,
          [playerId]: {
            ...session,
            actualStartTime: session.actualStartTime + (offsetMinutes * 60 * 1000),
          },
        },
      };
    });
  }, []);

  // Set custom duration for a player's session
  const setDuration = useCallback((playerId: string, durationMinutes: number) => {
    setState(prev => {
      const session = prev.sessions[playerId];
      if (!session) return prev;

      return {
        ...prev,
        sessions: {
          ...prev.sessions,
          [playerId]: {
            ...session,
            durationMinutes,
          },
        },
      };
    });
  }, []);

  // Clear a player's session (reset to scheduled time)
  const clearSession = useCallback((playerId: string) => {
    setState(prev => {
      const { [playerId]: _, ...remainingSessions } = prev.sessions;
      return {
        ...prev,
        sessions: remainingSessions,
      };
    });
  }, []);

  // Clear all sessions (useful for resetting between days)
  const clearAllSessions = useCallback(() => {
    setState({ sessions: {} });
  }, []);

  // Get a player's session if it exists
  const getSession = useCallback((playerId: string): PlayerSession | null => {
    return state.sessions[playerId] || null;
  }, [state.sessions]);

  // Check if a player has an active session
  const hasActiveSession = useCallback((playerId: string): boolean => {
    const session = state.sessions[playerId];
    if (!session) return false;

    const elapsed = Date.now() - session.actualStartTime;
    const durationMs = session.durationMinutes * 60 * 1000;
    return elapsed < durationMs;
  }, [state.sessions]);

  // Get time remaining for a player's session (in seconds)
  const getTimeRemaining = useCallback((playerId: string): { minutes: number; seconds: number } | null => {
    const session = state.sessions[playerId];
    if (!session) return null;

    const elapsed = Date.now() - session.actualStartTime;
    const durationMs = session.durationMinutes * 60 * 1000;
    const remainingMs = Math.max(0, durationMs - elapsed);

    return {
      minutes: Math.floor(remainingMs / 60000),
      seconds: Math.floor((remainingMs % 60000) / 1000),
    };
  }, [state.sessions]);

  // Check if player is currently active based on manual session
  const isPlayerActive = useCallback((playerId: string): boolean => {
    const session = state.sessions[playerId];
    if (!session) return false;

    const elapsed = Date.now() - session.actualStartTime;
    const durationMs = session.durationMinutes * 60 * 1000;
    return elapsed >= 0 && elapsed < durationMs;
  }, [state.sessions]);

  return {
    sessions: state.sessions,
    isLoaded,
    startSession,
    adjustSession,
    setDuration,
    clearSession,
    clearAllSessions,
    getSession,
    hasActiveSession,
    getTimeRemaining,
    isPlayerActive,
  };
}

export type { PlayerSession, SessionTimerState };
