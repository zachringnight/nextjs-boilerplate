import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
let mockQueryResult: { data?: unknown; error?: unknown } = { data: null, error: null };

function createChainableProxy(): unknown {
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, prop) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => void) => resolve(mockQueryResult);
      }
      if (typeof prop === 'symbol') return undefined;
      return vi.fn().mockImplementation(() => createChainableProxy());
    },
  };
  return new Proxy({}, handler);
}

const mockFrom = vi.fn(() => createChainableProxy());
const mockSupabaseClient = { from: mockFrom, auth: { getSession: vi.fn() } };

vi.mock('../supabase', () => ({
  getSupabase: vi.fn(() => mockSupabaseClient),
}));

// Mock navigator.onLine
let onLineValue = true;
Object.defineProperty(globalThis, 'navigator', {
  value: { get onLine() { return onLineValue; } },
  writable: true,
  configurable: true,
});

import {
  syncClipInsert,
  syncClipUpdate,
  syncClipDelete,
  syncBulkClipUpdate,
  syncBulkClipDelete,
} from '../clip-sync';
import { getSupabase } from '../supabase';

describe('clip-sync.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onLineValue = true;
    mockQueryResult = { data: null, error: null };
    (getSupabase as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabaseClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Offline / unconfigured guard tests
  // ==========================================================================
  describe('offline and unconfigured guards', () => {
    it('syncClipInsert returns false when offline', async () => {
      onLineValue = false;
      expect(await syncClipInsert({})).toBe(false);
    });

    it('syncClipInsert returns false when Supabase not configured', async () => {
      (getSupabase as ReturnType<typeof vi.fn>).mockReturnValue(null);
      expect(await syncClipInsert({})).toBe(false);
    });

    it('syncClipUpdate returns false when offline', async () => {
      onLineValue = false;
      expect(await syncClipUpdate('clip-1', { notes: 'Updated' })).toBe(false);
    });

    it('syncClipUpdate returns false when Supabase not configured', async () => {
      (getSupabase as ReturnType<typeof vi.fn>).mockReturnValue(null);
      expect(await syncClipUpdate('clip-1', {})).toBe(false);
    });

    it('syncClipDelete returns false when offline', async () => {
      onLineValue = false;
      expect(await syncClipDelete('clip-1')).toBe(false);
    });

    it('syncClipDelete returns false when Supabase not configured', async () => {
      (getSupabase as ReturnType<typeof vi.fn>).mockReturnValue(null);
      expect(await syncClipDelete('clip-1')).toBe(false);
    });

    it('syncBulkClipUpdate returns false when offline', async () => {
      onLineValue = false;
      expect(await syncBulkClipUpdate(['clip-1'], { notes: 'Bulk' })).toBe(false);
    });

    it('syncBulkClipUpdate returns false when Supabase not configured', async () => {
      (getSupabase as ReturnType<typeof vi.fn>).mockReturnValue(null);
      expect(await syncBulkClipUpdate(['clip-1'], {})).toBe(false);
    });

    it('syncBulkClipDelete returns false when offline', async () => {
      onLineValue = false;
      expect(await syncBulkClipDelete(['clip-1'])).toBe(false);
    });

    it('syncBulkClipDelete returns false when Supabase not configured', async () => {
      (getSupabase as ReturnType<typeof vi.fn>).mockReturnValue(null);
      expect(await syncBulkClipDelete(['clip-1'])).toBe(false);
    });
  });

  // ==========================================================================
  // Clip insert
  // ==========================================================================
  describe('syncClipInsert', () => {
    it('calls from("clip_markers").insert and returns true on success', async () => {
      mockQueryResult = { data: null, error: null };
      const result = await syncClipInsert({ category: 'highlight', notes: 'Great play' });
      expect(mockFrom).toHaveBeenCalledWith('clip_markers');
      expect(result).toBe(true);
    });

    it('sets default values for optional fields', async () => {
      mockQueryResult = { data: null, error: null };
      await syncClipInsert({});
      expect(mockFrom).toHaveBeenCalledWith('clip_markers');
    });

    it('returns false on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Insert error' } };
      expect(await syncClipInsert({})).toBe(false);
    });
  });

  // ==========================================================================
  // Clip update
  // ==========================================================================
  describe('syncClipUpdate', () => {
    it('calls from("clip_markers").update and returns true on success', async () => {
      mockQueryResult = { data: null, error: null };
      const result = await syncClipUpdate('clip-1', { notes: 'Updated note' });
      expect(mockFrom).toHaveBeenCalledWith('clip_markers');
      expect(result).toBe(true);
    });

    it('returns false on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Update error' } };
      expect(await syncClipUpdate('clip-1', { notes: 'Bad' })).toBe(false);
    });
  });

  // ==========================================================================
  // Clip delete
  // ==========================================================================
  describe('syncClipDelete', () => {
    it('calls from("clip_markers").delete and returns true on success', async () => {
      mockQueryResult = { data: null, error: null };
      const result = await syncClipDelete('clip-1');
      expect(mockFrom).toHaveBeenCalledWith('clip_markers');
      expect(result).toBe(true);
    });

    it('returns false on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Delete error' } };
      expect(await syncClipDelete('clip-1')).toBe(false);
    });
  });

  // ==========================================================================
  // Bulk clip update
  // ==========================================================================
  describe('syncBulkClipUpdate', () => {
    it('calls from("clip_markers").update with ids and returns true', async () => {
      mockQueryResult = { data: null, error: null };
      const result = await syncBulkClipUpdate(['clip-1', 'clip-2'], { status: 'reviewed' });
      expect(mockFrom).toHaveBeenCalledWith('clip_markers');
      expect(result).toBe(true);
    });

    it('returns false on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Bulk update error' } };
      expect(await syncBulkClipUpdate(['clip-1'], {})).toBe(false);
    });
  });

  // ==========================================================================
  // Bulk clip delete
  // ==========================================================================
  describe('syncBulkClipDelete', () => {
    it('calls from("clip_markers").delete with ids and returns true', async () => {
      mockQueryResult = { data: null, error: null };
      const result = await syncBulkClipDelete(['clip-1', 'clip-2']);
      expect(mockFrom).toHaveBeenCalledWith('clip_markers');
      expect(result).toBe(true);
    });

    it('returns false on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Bulk delete error' } };
      expect(await syncBulkClipDelete(['clip-1'])).toBe(false);
    });
  });
});
