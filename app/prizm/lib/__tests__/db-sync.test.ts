import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Chainable query builder mock – every proxy in the chain is thenable
// so that `await supabase.from('x').select('*').order(...)` resolves correctly.
let mockQueryResult: { data?: unknown; error?: unknown } = { data: [], error: null };

function createChainableProxy(): unknown {
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, prop) {
      if (prop === 'then') {
        // Return a thenable resolve function so `await proxy` works
        return (resolve: (v: unknown) => void) => resolve(mockQueryResult);
      }
      if (typeof prop === 'symbol') return undefined;
      // Every chained method call returns another thenable proxy
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
  fetchNotes,
  syncNoteInsert,
  syncNoteUpdate,
  syncNoteDelete,
  syncBulkNoteDelete,
  fetchDeliverables,
  syncDeliverableUpsert,
  syncDeliverableUpdate,
  syncDeliverableDelete,
  syncBulkDeliverableUpsert,
  fetchScheduleSlots,
  syncScheduleSlotUpsert,
  syncScheduleSlotDelete,
  syncBulkScheduleSlotUpsert,
  fetchCompletions,
  syncCompletionUpsert,
  syncCompletionDelete,
  syncResetCompletions,
  NoteRecord,
  DeliverableRecord,
  ScheduleSlotRecord,
  CompletionRecord,
} from '../db-sync';
import { getSupabase } from '../supabase';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const sampleNote: NoteRecord = {
  id: 'note-1',
  content: 'Test note',
  category: 'general',
  priority: 'medium',
  status: 'open',
  station_id: null,
  player_id: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

const sampleDeliverable: DeliverableRecord = {
  id: 'del-1',
  title: 'Deliverable 1',
  type: 'video',
  status: 'pending',
  due_day: '2025-01-15',
};

const sampleSlot: ScheduleSlotRecord = {
  id: 'slot-1',
  player_id: 'player-1',
  date: '2025-01-15',
  start_time: '09:00',
  end_time: '10:00',
  station: 'Station A',
};

const sampleCompletion: CompletionRecord = {
  player_id: 'player-1',
  station_id: 'station-1',
  completed: true,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('db-sync.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onLineValue = true;
    mockQueryResult = { data: [], error: null };
    (getSupabase as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabaseClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Offline / unconfigured guard tests
  // ==========================================================================
  describe('offline and unconfigured guards', () => {
    it('fetchNotes returns null when offline', async () => {
      onLineValue = false;
      expect(await fetchNotes()).toBeNull();
    });

    it('fetchNotes returns null when Supabase not configured', async () => {
      (getSupabase as ReturnType<typeof vi.fn>).mockReturnValue(null);
      expect(await fetchNotes()).toBeNull();
    });

    it('syncNoteInsert returns false when offline', async () => {
      onLineValue = false;
      expect(await syncNoteInsert(sampleNote)).toBe(false);
    });

    it('syncNoteUpdate returns false when offline', async () => {
      onLineValue = false;
      expect(await syncNoteUpdate('note-1', { content: 'updated' })).toBe(false);
    });

    it('syncNoteDelete returns false when offline', async () => {
      onLineValue = false;
      expect(await syncNoteDelete('note-1')).toBe(false);
    });

    it('syncBulkNoteDelete returns false when offline', async () => {
      onLineValue = false;
      expect(await syncBulkNoteDelete(['note-1'])).toBe(false);
    });

    it('fetchDeliverables returns null when offline', async () => {
      onLineValue = false;
      expect(await fetchDeliverables()).toBeNull();
    });

    it('syncDeliverableUpsert returns false when offline', async () => {
      onLineValue = false;
      expect(await syncDeliverableUpsert(sampleDeliverable)).toBe(false);
    });

    it('syncDeliverableUpdate returns false when offline', async () => {
      onLineValue = false;
      expect(await syncDeliverableUpdate('del-1', { title: 'Updated' })).toBe(false);
    });

    it('syncDeliverableDelete returns false when offline', async () => {
      onLineValue = false;
      expect(await syncDeliverableDelete('del-1')).toBe(false);
    });

    it('syncBulkDeliverableUpsert returns false when offline', async () => {
      onLineValue = false;
      expect(await syncBulkDeliverableUpsert([sampleDeliverable])).toBe(false);
    });

    it('fetchScheduleSlots returns null when offline', async () => {
      onLineValue = false;
      expect(await fetchScheduleSlots()).toBeNull();
    });

    it('syncScheduleSlotUpsert returns false when offline', async () => {
      onLineValue = false;
      expect(await syncScheduleSlotUpsert(sampleSlot)).toBe(false);
    });

    it('syncScheduleSlotDelete returns false when offline', async () => {
      onLineValue = false;
      expect(await syncScheduleSlotDelete('slot-1')).toBe(false);
    });

    it('syncBulkScheduleSlotUpsert returns false when offline', async () => {
      onLineValue = false;
      expect(await syncBulkScheduleSlotUpsert([sampleSlot])).toBe(false);
    });

    it('fetchCompletions returns null when offline', async () => {
      onLineValue = false;
      expect(await fetchCompletions()).toBeNull();
    });

    it('syncCompletionUpsert returns false when offline', async () => {
      onLineValue = false;
      expect(await syncCompletionUpsert(sampleCompletion)).toBe(false);
    });

    it('syncCompletionDelete returns false when offline', async () => {
      onLineValue = false;
      expect(await syncCompletionDelete('player-1', 'station-1')).toBe(false);
    });

    it('syncResetCompletions returns false when offline', async () => {
      onLineValue = false;
      expect(await syncResetCompletions()).toBe(false);
    });
  });

  // ==========================================================================
  // Notes CRUD
  // ==========================================================================
  describe('notes CRUD (online)', () => {
    it('fetchNotes calls from("notes").select and returns data', async () => {
      const notes = [sampleNote];
      mockQueryResult = { data: notes, error: null };

      const result = await fetchNotes();
      expect(mockFrom).toHaveBeenCalledWith('notes');
      expect(result).toEqual(notes);
    });

    it('fetchNotes returns null on error', async () => {
      mockQueryResult = { data: null, error: { message: 'DB error' } };
      const result = await fetchNotes();
      expect(result).toBeNull();
    });

    it('syncNoteInsert calls from("notes").insert and returns true', async () => {
      mockQueryResult = { data: null, error: null };
      const result = await syncNoteInsert(sampleNote);
      expect(mockFrom).toHaveBeenCalledWith('notes');
      expect(result).toBe(true);
    });

    it('syncNoteInsert returns false on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Insert error' } };
      const result = await syncNoteInsert(sampleNote);
      expect(result).toBe(false);
    });

    it('syncNoteUpdate calls from("notes").update and returns true', async () => {
      mockQueryResult = { data: null, error: null };
      const result = await syncNoteUpdate('note-1', { content: 'updated' });
      expect(mockFrom).toHaveBeenCalledWith('notes');
      expect(result).toBe(true);
    });

    it('syncNoteUpdate returns false on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Update error' } };
      const result = await syncNoteUpdate('note-1', { content: 'updated' });
      expect(result).toBe(false);
    });

    it('syncNoteDelete calls from("notes").delete and returns true', async () => {
      mockQueryResult = { data: null, error: null };
      const result = await syncNoteDelete('note-1');
      expect(mockFrom).toHaveBeenCalledWith('notes');
      expect(result).toBe(true);
    });

    it('syncNoteDelete returns false on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Delete error' } };
      const result = await syncNoteDelete('note-1');
      expect(result).toBe(false);
    });

    it('syncBulkNoteDelete calls from("notes").delete with ids and returns true', async () => {
      mockQueryResult = { data: null, error: null };
      const result = await syncBulkNoteDelete(['note-1', 'note-2']);
      expect(mockFrom).toHaveBeenCalledWith('notes');
      expect(result).toBe(true);
    });

    it('syncBulkNoteDelete returns false on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Bulk delete error' } };
      const result = await syncBulkNoteDelete(['note-1']);
      expect(result).toBe(false);
    });
  });

  // ==========================================================================
  // Deliverables CRUD
  // ==========================================================================
  describe('deliverables CRUD (online)', () => {
    it('fetchDeliverables returns data on success', async () => {
      const deliverables = [sampleDeliverable];
      mockQueryResult = { data: deliverables, error: null };
      const result = await fetchDeliverables();
      expect(mockFrom).toHaveBeenCalledWith('deliverables');
      expect(result).toEqual(deliverables);
    });

    it('fetchDeliverables returns null on error', async () => {
      mockQueryResult = { data: null, error: { message: 'DB error' } };
      expect(await fetchDeliverables()).toBeNull();
    });

    it('syncDeliverableUpsert returns true on success', async () => {
      mockQueryResult = { data: null, error: null };
      expect(await syncDeliverableUpsert(sampleDeliverable)).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('deliverables');
    });

    it('syncDeliverableUpsert returns false on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Upsert error' } };
      expect(await syncDeliverableUpsert(sampleDeliverable)).toBe(false);
    });

    it('syncDeliverableUpdate returns true on success', async () => {
      mockQueryResult = { data: null, error: null };
      expect(await syncDeliverableUpdate('del-1', { title: 'Updated' })).toBe(true);
    });

    it('syncDeliverableUpdate returns false on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Update error' } };
      expect(await syncDeliverableUpdate('del-1', { title: 'Updated' })).toBe(false);
    });

    it('syncDeliverableDelete returns true on success', async () => {
      mockQueryResult = { data: null, error: null };
      expect(await syncDeliverableDelete('del-1')).toBe(true);
    });

    it('syncDeliverableDelete returns false on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Delete error' } };
      expect(await syncDeliverableDelete('del-1')).toBe(false);
    });

    it('syncBulkDeliverableUpsert returns true on success', async () => {
      mockQueryResult = { data: null, error: null };
      expect(await syncBulkDeliverableUpsert([sampleDeliverable])).toBe(true);
    });

    it('syncBulkDeliverableUpsert returns false on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Bulk error' } };
      expect(await syncBulkDeliverableUpsert([sampleDeliverable])).toBe(false);
    });
  });

  // ==========================================================================
  // Schedule Slots CRUD
  // ==========================================================================
  describe('schedule slots CRUD (online)', () => {
    it('fetchScheduleSlots returns data on success', async () => {
      const slots = [sampleSlot];
      mockQueryResult = { data: slots, error: null };
      const result = await fetchScheduleSlots();
      expect(mockFrom).toHaveBeenCalledWith('schedule_slots');
      expect(result).toEqual(slots);
    });

    it('fetchScheduleSlots returns null on error', async () => {
      mockQueryResult = { data: null, error: { message: 'DB error' } };
      expect(await fetchScheduleSlots()).toBeNull();
    });

    it('syncScheduleSlotUpsert returns true on success', async () => {
      mockQueryResult = { data: null, error: null };
      expect(await syncScheduleSlotUpsert(sampleSlot)).toBe(true);
    });

    it('syncScheduleSlotUpsert returns false on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Upsert error' } };
      expect(await syncScheduleSlotUpsert(sampleSlot)).toBe(false);
    });

    it('syncScheduleSlotDelete returns true on success', async () => {
      mockQueryResult = { data: null, error: null };
      expect(await syncScheduleSlotDelete('slot-1')).toBe(true);
    });

    it('syncScheduleSlotDelete returns false on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Delete error' } };
      expect(await syncScheduleSlotDelete('slot-1')).toBe(false);
    });

    it('syncBulkScheduleSlotUpsert returns true on success', async () => {
      mockQueryResult = { data: null, error: null };
      expect(await syncBulkScheduleSlotUpsert([sampleSlot])).toBe(true);
    });

    it('syncBulkScheduleSlotUpsert returns false on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Bulk error' } };
      expect(await syncBulkScheduleSlotUpsert([sampleSlot])).toBe(false);
    });
  });

  // ==========================================================================
  // Player Station Completions CRUD
  // ==========================================================================
  describe('completions CRUD (online)', () => {
    it('fetchCompletions returns data on success', async () => {
      const completions = [sampleCompletion];
      mockQueryResult = { data: completions, error: null };
      const result = await fetchCompletions();
      expect(mockFrom).toHaveBeenCalledWith('player_station_completions');
      expect(result).toEqual(completions);
    });

    it('fetchCompletions returns null on error', async () => {
      mockQueryResult = { data: null, error: { message: 'DB error' } };
      expect(await fetchCompletions()).toBeNull();
    });

    it('syncCompletionUpsert returns true on success', async () => {
      mockQueryResult = { data: null, error: null };
      expect(await syncCompletionUpsert(sampleCompletion)).toBe(true);
    });

    it('syncCompletionUpsert returns false on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Upsert error' } };
      expect(await syncCompletionUpsert(sampleCompletion)).toBe(false);
    });

    it('syncCompletionDelete returns true on success', async () => {
      mockQueryResult = { data: null, error: null };
      expect(await syncCompletionDelete('player-1', 'station-1')).toBe(true);
    });

    it('syncCompletionDelete returns false on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Delete error' } };
      expect(await syncCompletionDelete('player-1', 'station-1')).toBe(false);
    });

    it('syncResetCompletions returns true on success', async () => {
      mockQueryResult = { data: null, error: null };
      expect(await syncResetCompletions()).toBe(true);
    });

    it('syncResetCompletions returns false on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Reset error' } };
      expect(await syncResetCompletions()).toBe(false);
    });
  });
});
