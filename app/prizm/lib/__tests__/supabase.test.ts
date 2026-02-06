import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock @supabase/supabase-js before importing the module under test
const mockGetSession = vi.fn();
const mockSupabaseClient = {
  auth: { getSession: mockGetSession },
  from: vi.fn(),
  channel: vi.fn(),
};
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

describe('supabase.ts', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    // Reset module registry so singleton is re-created per test
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------
  // getSupabase
  // -------------------------------------------------------
  describe('getSupabase', () => {
    it('returns null when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const { getSupabase } = await import('../supabase');
      expect(getSupabase()).toBeNull();
    });

    it('returns null when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const { getSupabase } = await import('../supabase');
      expect(getSupabase()).toBeNull();
    });

    it('returns a Supabase client when both env vars are set', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      const { getSupabase } = await import('../supabase');
      const client = getSupabase();
      expect(client).not.toBeNull();
    });

    it('returns the same singleton instance on repeated calls', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      const { getSupabase } = await import('../supabase');
      const first = getSupabase();
      const second = getSupabase();
      expect(first).toBe(second);
    });
  });

  // -------------------------------------------------------
  // isSupabaseConfigured
  // -------------------------------------------------------
  describe('isSupabaseConfigured', () => {
    it('returns false when env vars are missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const { isSupabaseConfigured } = await import('../supabase');
      expect(isSupabaseConfigured()).toBe(false);
    });

    it('returns true when both env vars are set', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      const { isSupabaseConfigured } = await import('../supabase');
      expect(isSupabaseConfigured()).toBe(true);
    });
  });

  // -------------------------------------------------------
  // requireSupabase
  // -------------------------------------------------------
  describe('requireSupabase', () => {
    it('throws when Supabase is not configured', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const { requireSupabase } = await import('../supabase');
      expect(() => requireSupabase()).toThrow(
        'Supabase is not configured'
      );
    });

    it('returns the client when configured', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      const { requireSupabase } = await import('../supabase');
      expect(requireSupabase()).not.toBeNull();
    });
  });

  // -------------------------------------------------------
  // checkSupabaseConnection
  // -------------------------------------------------------
  describe('checkSupabaseConnection', () => {
    it('returns false when Supabase is not configured', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const { checkSupabaseConnection } = await import('../supabase');
      await expect(checkSupabaseConnection()).resolves.toBe(false);
    });

    it('returns true when getSession succeeds', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

      const { checkSupabaseConnection } = await import('../supabase');
      await expect(checkSupabaseConnection()).resolves.toBe(true);
    });

    it('returns false when getSession returns an error', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      mockGetSession.mockResolvedValue({
        data: null,
        error: { message: 'Network error' },
      });

      const { checkSupabaseConnection } = await import('../supabase');
      await expect(checkSupabaseConnection()).resolves.toBe(false);
    });

    it('returns false when getSession throws', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      mockGetSession.mockRejectedValue(new Error('Connection refused'));

      const { checkSupabaseConnection } = await import('../supabase');
      await expect(checkSupabaseConnection()).resolves.toBe(false);
    });
  });

  // -------------------------------------------------------
  // Exported singleton
  // -------------------------------------------------------
  describe('supabase export', () => {
    it('exports null when env vars are not set', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const mod = await import('../supabase');
      expect(mod.supabase).toBeNull();
    });

    it('exports the client when env vars are set', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      const mod = await import('../supabase');
      expect(mod.supabase).not.toBeNull();
    });
  });
});
