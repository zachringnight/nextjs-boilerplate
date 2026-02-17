import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './supabase';

export type ASWSchemaMode = 'event-scoped' | 'legacy';

let cachedMode: ASWSchemaMode | null = null;
let detectionPromise: Promise<ASWSchemaMode> | null = null;

function messageFromError(error: unknown): string {
  if (!error || typeof error !== 'object') return '';
  const e = error as { message?: string; details?: string; hint?: string };
  return `${e.message || ''} ${e.details || ''} ${e.hint || ''}`.trim();
}

function isMissingColumnError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string };
  if (e.code === '42703') return true;
  return /column .* does not exist/i.test(messageFromError(error));
}

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string };
  if (e.code === '42P01') return true;
  return /relation .* does not exist/i.test(messageFromError(error));
}

async function supportsEventScopedSchema(supabase: SupabaseClient): Promise<boolean> {
  const { error } = await supabase
    .from('notes')
    .select('id,event_id,content,created_at')
    .limit(1);

  if (!error) return true;
  if (isMissingColumnError(error) || isMissingTableError(error)) return false;
  throw error;
}

export async function detectASWSchemaMode(forceRefresh = false): Promise<ASWSchemaMode> {
  if (!forceRefresh && cachedMode) return cachedMode;
  if (!forceRefresh && detectionPromise) return detectionPromise;

  detectionPromise = (async () => {
    const supabase = getSupabase();
    if (!supabase) {
      cachedMode = 'event-scoped';
      return cachedMode;
    }

    try {
      cachedMode = (await supportsEventScopedSchema(supabase))
        ? 'event-scoped'
        : 'legacy';
    } catch (error) {
      // Default to event-scoped on unknown probe errors to avoid silently dropping writes.
      console.warn('Failed to detect ASW schema mode, defaulting to event-scoped.', error);
      cachedMode = 'event-scoped';
    }

    return cachedMode;
  })().finally(() => {
    detectionPromise = null;
  });

  return detectionPromise;
}

export function getCachedASWSchemaMode(): ASWSchemaMode | null {
  return cachedMode;
}

export function resetASWSchemaModeCacheForTests(): void {
  cachedMode = null;
  detectionPromise = null;
}

const LEGACY_STATION_BY_ASW: Record<string, string> = {
  tunnel: 'LED Wall',
  product: 'Signing',
};

const ASW_STATION_BY_LEGACY: Record<string, string> = {
  'LED Wall': 'tunnel',
  Signing: 'product',
};

export function toLegacyClipStation(stationId: string | null | undefined): string {
  if (!stationId) return 'Free';
  return LEGACY_STATION_BY_ASW[stationId] || 'Free';
}

export function fromLegacyClipStation(stationName: string | null | undefined): string | null {
  if (!stationName) return null;
  return ASW_STATION_BY_LEGACY[stationName] || null;
}

export function fromLegacyTimestamp(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return new Date().toISOString();
  }

  const numeric = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(numeric)) {
    return new Date().toISOString();
  }

  const millis = numeric < 1e12 ? numeric * 1000 : numeric;
  const parsed = new Date(millis);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

export function toLegacyTimestamp(value: string | null | undefined): number {
  const fallback = Date.now();
  if (!value) return fallback;

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return fallback;
  return parsed;
}
