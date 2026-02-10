import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ViewMode,
  Note,
  NoteStatus,
  Deliverable,
  DeliverableStatus,
  DeliverableType,
  EventDay,
  ASWStationId,
  PlayerStationCompletion,
} from '../types';
import { defaultDeliverables } from '../data/deliverables';
import {
  syncNoteInsert,
  syncNoteUpdate,
  syncNoteDelete,
  syncBulkNoteDelete,
  syncDeliverableUpsert,
  syncDeliverableUpdate,
  syncDeliverableDelete,
  syncBulkDeliverableUpsert,
  syncCompletionUpsert,
  syncCompletionDelete,
  syncResetCompletions,
} from '../lib/db-sync';

// ASW has 2 checklist stations
const checklistStations: ASWStationId[] = ['tunnel', 'product'];

function deliverableToRecord(d: Deliverable) {
  return {
    id: d.id,
    title: d.title,
    description: d.description || null,
    type: d.type,
    status: d.status,
    player_id: d.playerId || null,
    due_day: d.dueDay,
    completed_at: d.completedAt || null,
    delivered_at: d.deliveredAt || null,
    notes: d.notes || null,
    assignee: d.assignee || null,
    priority: d.priority || null,
  };
}

interface ASWState {
  // UI state
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  largeText: boolean;
  toggleLargeText: () => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // Filters
  activeDay: number | null;
  setActiveDay: (day: number | null) => void;
  showEmbargoedOnly: boolean;
  setShowEmbargoedOnly: (show: boolean) => void;

  // Notes / Issue Logger
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  resolveNote: (id: string) => void;
  clearResolvedNotes: () => void;

  // Deliverables
  deliverables: Deliverable[];
  updateDeliverableStatus: (id: string, status: DeliverableStatus) => void;
  updateDeliverable: (id: string, updates: Partial<Deliverable>) => void;
  addDeliverable: (deliverable: Omit<Deliverable, 'id'>) => string;
  removeDeliverable: (id: string) => void;
  resetDeliverables: () => void;
  getDeliverablesByDay: (day: EventDay) => Deliverable[];
  getDeliverablesByType: (type: DeliverableType) => Deliverable[];
  getDeliverablesByStatus: (status: DeliverableStatus) => Deliverable[];
  getDeliverablesProgress: () => { pending: number; inProgress: number; completed: number; delivered: number };

  // Player Station Checklist
  playerStationCompletions: PlayerStationCompletion[];
  togglePlayerStation: (playerId: string, stationId: ASWStationId, completedBy?: string) => void;
  isStationCompleted: (playerId: string, stationId: ASWStationId) => boolean;
  getPlayerProgress: (playerId: string) => { completed: number; total: number; percentage: number };
  getCompletedStationsForPlayer: (playerId: string) => ASWStationId[];
  getRemainingStationsForPlayer: (playerId: string) => ASWStationId[];
  resetPlayerStationChecklist: () => void;
  getStationCompletionCount: (stationId: ASWStationId) => number;
}

export const useASWStore = create<ASWState>()(
  persist(
    (set, get) => ({
      // UI state
      viewMode: 'now',
      setViewMode: (mode) => set({ viewMode: mode }),
      largeText: false,
      toggleLargeText: () => set((state) => ({ largeText: !state.largeText })),
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),

      // Filters
      activeDay: null,
      setActiveDay: (day) => set({ activeDay: day }),
      showEmbargoedOnly: false,
      setShowEmbargoedOnly: (show) => set({ showEmbargoedOnly: show }),

      // Notes / Issue Logger
      notes: [],
      addNote: (noteData) => {
        const now = new Date().toISOString();
        const note: Note = {
          ...noteData,
          id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          notes: [note, ...state.notes],
        }));
        syncNoteInsert({
          id: note.id,
          content: note.content,
          category: note.category,
          priority: note.priority,
          status: note.status,
          station_id: note.stationId || null,
          player_id: note.playerId || null,
          created_at: note.createdAt,
          updated_at: note.updatedAt,
          resolved_at: note.resolvedAt || null,
          created_by: note.createdBy || null,
        });
      },
      updateNote: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: now }
              : note
          ),
        }));
        const dbUpdates: Record<string, unknown> = { updated_at: now };
        if (updates.content !== undefined) dbUpdates.content = updates.content;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.stationId !== undefined) dbUpdates.station_id = updates.stationId;
        if (updates.playerId !== undefined) dbUpdates.player_id = updates.playerId;
        if (updates.resolvedAt !== undefined) dbUpdates.resolved_at = updates.resolvedAt;
        if (updates.createdBy !== undefined) dbUpdates.created_by = updates.createdBy;
        syncNoteUpdate(id, dbUpdates);
      },
      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
        syncNoteDelete(id);
      },
      resolveNote: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, status: 'resolved' as NoteStatus, resolvedAt: now, updatedAt: now }
              : note
          ),
        }));
        syncNoteUpdate(id, { status: 'resolved', resolved_at: now, updated_at: now });
      },
      clearResolvedNotes: () => {
        const resolvedIds = get().notes
          .filter((note) => note.status === 'resolved')
          .map((note) => note.id);
        set((state) => ({
          notes: state.notes.filter((note) => note.status !== 'resolved'),
        }));
        if (resolvedIds.length > 0) syncBulkNoteDelete(resolvedIds);
      },

      // Deliverables
      deliverables: defaultDeliverables,
      updateDeliverableStatus: (id, status) => {
        const now = new Date().toISOString();
        set((state) => ({
          deliverables: state.deliverables.map((d) =>
            d.id === id
              ? {
                  ...d,
                  status,
                  completedAt: status === 'completed' || status === 'delivered' ? now : d.completedAt,
                  deliveredAt: status === 'delivered' ? now : d.deliveredAt,
                }
              : d
          ),
        }));
        const updated = get().deliverables.find((d) => d.id === id);
        if (updated) syncDeliverableUpdate(id, {
          status: updated.status,
          completed_at: updated.completedAt || null,
          delivered_at: updated.deliveredAt || null,
        });
      },
      updateDeliverable: (id, updates) => {
        set((state) => ({
          deliverables: state.deliverables.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        }));
        const updated = get().deliverables.find((d) => d.id === id);
        if (updated) syncDeliverableUpsert(deliverableToRecord(updated));
      },
      addDeliverable: (deliverableData) => {
        const id = `deliverable-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        const deliverable: Deliverable = {
          ...deliverableData,
          id,
        };
        set((state) => ({
          deliverables: [...state.deliverables, deliverable],
        }));
        syncDeliverableUpsert(deliverableToRecord(deliverable));
        return id;
      },
      removeDeliverable: (id) => {
        set((state) => ({
          deliverables: state.deliverables.filter((d) => d.id !== id),
        }));
        syncDeliverableDelete(id);
      },
      resetDeliverables: () => {
        set({ deliverables: defaultDeliverables });
        syncBulkDeliverableUpsert(defaultDeliverables.map(deliverableToRecord));
      },
      getDeliverablesByDay: (day) => {
        return get().deliverables.filter((d) => d.dueDay === day);
      },
      getDeliverablesByType: (type) => {
        return get().deliverables.filter((d) => d.type === type);
      },
      getDeliverablesByStatus: (status) => {
        return get().deliverables.filter((d) => d.status === status);
      },
      getDeliverablesProgress: () => {
        const state = get();
        return {
          pending: state.deliverables.filter((d) => d.status === 'pending').length,
          inProgress: state.deliverables.filter((d) => d.status === 'in-progress').length,
          completed: state.deliverables.filter((d) => d.status === 'completed').length,
          delivered: state.deliverables.filter((d) => d.status === 'delivered').length,
        };
      },

      // Player Station Checklist
      playerStationCompletions: [],
      togglePlayerStation: (playerId, stationId, completedBy) => {
        let shouldDelete = false;
        let upsertPayload:
          | {
              player_id: string;
              station_id: ASWStationId;
              completed: boolean;
              completed_at: string;
              completed_by: string | null;
            }
          | null = null;

        set((state) => {
          const existingIndex = state.playerStationCompletions.findIndex(
            (c) => c.playerId === playerId && c.stationId === stationId
          );

          if (existingIndex >= 0) {
            const existing = state.playerStationCompletions[existingIndex];

            if (existing.completed) {
              // Toggle off: remove completion
              shouldDelete = true;
              return {
                playerStationCompletions: state.playerStationCompletions.filter(
                  (_, i) => i !== existingIndex
                ),
              };
            } else {
              // Toggle on: mark existing as completed
              const now = new Date().toISOString();
              upsertPayload = {
                player_id: playerId,
                station_id: stationId,
                completed: true,
                completed_at: now,
                completed_by: completedBy || null,
              };
              return {
                playerStationCompletions: state.playerStationCompletions.map((c, i) =>
                  i === existingIndex
                    ? { ...c, completed: true, completedAt: now, completedBy }
                    : c
                ),
              };
            }
          } else {
            // No existing record: create a new completed entry
            const now = new Date().toISOString();
            const newCompletion: PlayerStationCompletion = {
              playerId,
              stationId,
              completed: true,
              completedAt: now,
              completedBy,
            };
            upsertPayload = {
              player_id: playerId,
              station_id: stationId,
              completed: true,
              completed_at: now,
              completed_by: completedBy || null,
            };
            return {
              playerStationCompletions: [
                ...state.playerStationCompletions,
                newCompletion,
              ],
            };
          }
        });

        // Perform database sync after state update
        if (shouldDelete) {
          syncCompletionDelete(playerId, stationId);
        } else if (upsertPayload) {
          syncCompletionUpsert(upsertPayload);
        }
      },
      isStationCompleted: (playerId, stationId) => {
        return get().playerStationCompletions.some(
          (c) => c.playerId === playerId && c.stationId === stationId && c.completed
        );
      },
      getPlayerProgress: (playerId) => {
        const completed = get().playerStationCompletions.filter(
          (c) => c.playerId === playerId && c.completed
        ).length;
        const total = checklistStations.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { completed, total, percentage };
      },
      getCompletedStationsForPlayer: (playerId) => {
        return get().playerStationCompletions
          .filter((c) => c.playerId === playerId && c.completed)
          .map((c) => c.stationId);
      },
      getRemainingStationsForPlayer: (playerId) => {
        const completed = get().playerStationCompletions
          .filter((c) => c.playerId === playerId && c.completed)
          .map((c) => c.stationId);
        return checklistStations.filter((s) => !completed.includes(s));
      },
      resetPlayerStationChecklist: () => {
        set({ playerStationCompletions: [] });
        syncResetCompletions();
      },
      getStationCompletionCount: (stationId) => {
        return get().playerStationCompletions.filter(
          (c) => c.stationId === stationId && c.completed
        ).length;
      },
    }),
    {
      name: 'asw-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist UI-related preferences; Supabase remains the source of truth
      // for notes, deliverables, and playerStationCompletions to avoid stale-data flashes.
      partialize: (state) => ({
        viewMode: state.viewMode,
        largeText: state.largeText,
      }),
    }
  )
);
