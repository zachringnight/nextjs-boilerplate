'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getDefaultEventSlug } from '../lib/event-config';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import type { AppRole, EventAccess } from '../lib/auth-types';
import { isUuid } from '../lib/id-utils';
import {
  canAdminRole,
  canWriteRole,
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

function resolveEmailRedirect(): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/asw`;
}

function getRoleFromMembership(value: unknown): AppRole | null {
  if (value === 'admin' || value === 'editor' || value === 'viewer') return value;
  return null;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AuthMode>('auth');
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [access, setAccess] = useState<EventAccess | null>(null);
  const [error, setError] = useState<string | null>(null);

  const defaultEventSlug = useMemo(() => getDefaultEventSlug(), []);

  const applyBypassMode = useCallback(() => {
    setMode('bypass');
    setSession(null);
    setAccess({
      eventId: defaultEventSlug,
      eventSlug: defaultEventSlug,
      eventName: 'Local Development Mode',
      role: 'admin',
    });
    setError(null);
    setLoading(false);
    setReady(true);

    setRuntimeAccessContext({
      ready: true,
      bypass: true,
      userId: 'local-dev-user',
      eventId: defaultEventSlug,
      eventSlug: defaultEventSlug,
      role: 'admin',
      hasAccess: true,
    });
  }, [defaultEventSlug]);

  const resolveAccess = useCallback(
    async (nextSession: Session | null) => {
      const supabase = getSupabase();

      if (!supabase) {
        applyBypassMode();
        return;
      }

      setMode('auth');

      if (!nextSession?.user) {
        setAccess(null);
        setError(null);
        setRuntimeAccessContext({
          ready: true,
          bypass: false,
          userId: null,
          eventId: null,
          eventSlug: defaultEventSlug,
          role: null,
          hasAccess: false,
        });
        return;
      }

      try {
        let eventData: { id: string; slug: string; name: string } | null = null;

        const { data: eventBySlug, error: eventError } = await supabase
          .from('events')
          .select('id, slug, name')
          .eq('slug', defaultEventSlug)
          .maybeSingle();

        if (eventError) {
          throw new Error(`Failed to load event context: ${eventError.message}`);
        }

        eventData = eventBySlug;

        if (!eventData && isUuid(defaultEventSlug)) {
          const { data: eventById, error: eventByIdError } = await supabase
            .from('events')
            .select('id, slug, name')
            .eq('id', defaultEventSlug)
            .maybeSingle();

          if (eventByIdError) {
            throw new Error(`Failed to load event context by id: ${eventByIdError.message}`);
          }

          eventData = eventById;
        }

        if (!eventData) {
          const { data: fallbackEvents, error: fallbackError } = await supabase
            .from('events')
            .select('id, slug, name')
            .limit(2);

          if (fallbackError) {
            throw new Error(`Failed to inspect fallback event context: ${fallbackError.message}`);
          }

          if ((fallbackEvents || []).length === 1) {
            eventData = fallbackEvents?.[0] || null;
          }
        }

        if (!eventData?.id) {
          setAccess(null);
          setError(`No event found for slug "${defaultEventSlug}".`);
          setRuntimeAccessContext({
            ready: true,
            bypass: false,
            userId: nextSession.user.id,
            eventId: null,
            eventSlug: defaultEventSlug,
            role: null,
            hasAccess: false,
          });
          return;
        }

        const { data: membershipData, error: membershipError } = await supabase
          .from('event_members')
          .select('role')
          .eq('event_id', eventData.id)
          .eq('user_id', nextSession.user.id)
          .maybeSingle();

        if (membershipError) {
          throw new Error(`Failed to load access role: ${membershipError.message}`);
        }

        const role = getRoleFromMembership(membershipData?.role);
        if (!role) {
          setAccess(null);
          setError('Your account is signed in, but it has no access to this event.');
          setRuntimeAccessContext({
            ready: true,
            bypass: false,
            userId: nextSession.user.id,
            eventId: eventData.id,
            eventSlug: eventData.slug,
            role: null,
            hasAccess: false,
          });
          return;
        }

        const resolvedAccess: EventAccess = {
          eventId: eventData.id,
          eventSlug: eventData.slug || defaultEventSlug,
          eventName: eventData.name,
          role,
        };

        setAccess(resolvedAccess);
        setError(null);
        setRuntimeAccessContext({
          ready: true,
          bypass: false,
          userId: nextSession.user.id,
          eventId: resolvedAccess.eventId,
          eventSlug: resolvedAccess.eventSlug,
          role,
          hasAccess: true,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown auth error';
        setAccess(null);
        setError(message);
        setRuntimeAccessContext({
          ready: true,
          bypass: false,
          userId: nextSession.user.id,
          eventId: null,
          eventSlug: defaultEventSlug,
          role: null,
          hasAccess: false,
        });
      }
    },
    [applyBypassMode, defaultEventSlug]
  );

  const refreshAccess = useCallback(async () => {
    setLoading(true);
    const supabase = getSupabase();

    if (!supabase || !isSupabaseConfigured()) {
      applyBypassMode();
      return;
    }

    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      setError(sessionError.message);
    }

    const nextSession = data.session;
    setSession(nextSession);
    await resolveAccess(nextSession);
    setLoading(false);
    setReady(true);
  }, [applyBypassMode, resolveAccess]);

  useEffect(() => {
    void refreshAccess();

    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      return () => {
        resetRuntimeAccessContext();
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(true);
      resolveAccess(nextSession)
        .finally(() => {
          setLoading(false);
          setReady(true);
        });
    });

    return () => {
      subscription.unsubscribe();
      resetRuntimeAccessContext();
    };
  }, [refreshAccess, resolveAccess]);

  const sendMagicLink = useCallback(
    async (email: string) => {
      const supabase = getSupabase();
      if (!supabase || mode === 'bypass') {
        return {
          ok: false,
          message: 'Auth is not configured in this environment.',
        };
      }

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: resolveEmailRedirect(),
        },
      });

      if (signInError) {
        return {
          ok: false,
          message: signInError.message,
        };
      }

      return { ok: true };
    },
    [mode]
  );

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || mode === 'bypass') return;

    await supabase.auth.signOut();
    setSession(null);
    setAccess(null);
    setError(null);
    setRuntimeAccessContext({
      ready: true,
      bypass: false,
      userId: null,
      eventId: null,
      eventSlug: defaultEventSlug,
      role: null,
      hasAccess: false,
    });
  }, [defaultEventSlug, mode]);

  const role = access?.role ?? null;

  const value = useMemo<AuthContextValue>(() => {
    const hasAccess = mode === 'bypass' || Boolean(access);

    return {
      mode,
      ready,
      loading,
      session,
      user: session?.user ?? null,
      access,
      hasAccess,
      canEdit: mode === 'bypass' || canWriteRole(role),
      canAdmin: mode === 'bypass' || canAdminRole(role),
      role,
      defaultEventSlug,
      error,
      sendMagicLink,
      signOut,
      refreshAccess,
    };
  }, [access, defaultEventSlug, error, loading, mode, ready, refreshAccess, role, sendMagicLink, session, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return value;
}
