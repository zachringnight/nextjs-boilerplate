'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getDefaultEventSlug } from '../lib/event-config';
import type { AppRole, EventAccess } from '../lib/auth-types';
import {
  resetRuntimeAccessContext,
  setRuntimeAccessContext,
} from '../lib/runtime-context';

type AuthMode = 'auth' | 'bypass';

interface AuthContextValue {
  mode: AuthMode;
  ready: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  access: EventAccess | null;
  hasAccess: boolean;
  canEdit: boolean;
  canAdmin: boolean;
  role: AppRole | null;
  defaultEventSlug: string;
  error: string | null;
  sendMagicLink: (email: string) => Promise<{ ok: boolean; message?: string }>;
  signOut: () => Promise<void>;
  refreshAccess: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Auth is fully bypassed for now — everyone gets admin access.
// To re-enable Supabase auth, restore the resolveAccess / onAuthStateChange
// logic that was here before this change.

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const defaultEventSlug = useMemo(() => getDefaultEventSlug(), []);

  const access: EventAccess = useMemo(() => ({
    eventId: defaultEventSlug,
    eventSlug: defaultEventSlug,
    eventName: 'Open Access',
    role: 'admin' as AppRole,
  }), [defaultEventSlug]);

  useEffect(() => {
    setRuntimeAccessContext({
      ready: true,
      bypass: true,
      userId: 'open-user',
      eventId: defaultEventSlug,
      eventSlug: defaultEventSlug,
      role: 'admin',
      hasAccess: true,
    });
    return () => {
      resetRuntimeAccessContext();
    };
  }, [defaultEventSlug]);

  const refreshAccess = useCallback(async () => {
    // no-op while auth is bypassed
  }, []);

  const sendMagicLink = useCallback(
    async (_email: string) => ({
      ok: false as const,
      message: 'Auth is disabled in this environment.',
    }),
    []
  );

  const signOut = useCallback(async () => {
    // no-op while auth is bypassed
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    mode: 'bypass',
    ready: true,
    loading: false,
    session: null,
    user: null,
    access,
    hasAccess: true,
    canEdit: true,
    canAdmin: true,
    role: 'admin',
    defaultEventSlug,
    error: null,
    sendMagicLink,
    signOut,
    refreshAccess,
  }), [access, defaultEventSlug, refreshAccess, sendMagicLink, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return value;
}
