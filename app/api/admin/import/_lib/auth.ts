import type { NextRequest } from 'next/server';
import { getDefaultEventSlug } from '@/app/asw/lib/event-config';
import {
  getServiceSupabaseClient,
  getUserFromBearerToken,
  parseBearerToken,
} from '@/app/lib/supabase-server';

export interface AdminRequestContext {
  userId: string;
  eventId: string;
  eventSlug: string;
  eventName: string;
}

type AdminContextResult =
  | { ok: true; ctx: AdminRequestContext; supabase: ReturnType<typeof getServiceSupabaseClient> }
  | { ok: false; status: number; message: string };

export async function requireAdminContext(request: NextRequest): Promise<AdminContextResult> {
  try {
    const token = parseBearerToken(request.headers.get('authorization'));
    if (!token) {
      return { ok: false, status: 401, message: 'Missing bearer token.' };
    }

    const user = await getUserFromBearerToken(token);
    if (!user) {
      return { ok: false, status: 401, message: 'Invalid or expired auth token.' };
    }

    const eventSlug = request.nextUrl.searchParams.get('eventSlug') || getDefaultEventSlug();
    const supabase = getServiceSupabaseClient();

    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('id, slug, name')
      .eq('slug', eventSlug)
      .maybeSingle();

    if (eventError) {
      return { ok: false, status: 500, message: `Failed to load event: ${eventError.message}` };
    }

    if (!eventData) {
      return { ok: false, status: 404, message: `No event found for slug "${eventSlug}".` };
    }

    const { data: membershipData, error: membershipError } = await supabase
      .from('event_members')
      .select('role')
      .eq('event_id', eventData.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (membershipError) {
      return { ok: false, status: 500, message: `Failed to verify membership: ${membershipError.message}` };
    }

    if (!membershipData?.role) {
      return { ok: false, status: 403, message: 'User is not assigned to this event.' };
    }

    if (membershipData.role !== 'admin') {
      return { ok: false, status: 403, message: 'Admin role is required for CSV imports.' };
    }

    return {
      ok: true,
      supabase,
      ctx: {
        userId: user.id,
        eventId: eventData.id,
        eventSlug: eventData.slug,
        eventName: eventData.name,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown authorization failure';
    return { ok: false, status: 500, message };
  }
}
