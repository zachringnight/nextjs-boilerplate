import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  ScheduleSlot,
  StationId,
  DayDate,
  Note,
  NoteStatus,
  EventDay,
  Deliverable,
  DeliverableStatus,
  DeliverableType,
  ClipMarker,
  ClipCategory,
  ClipSortField,
  ClipSortDirection,
  ClipDefaults,
  PlayerStationCompletion,
} from '../types';
import { checklistStations, getStationById } from '../data/stations';
import { getPlayerById } from '../data/players';
import { defaultSchedule } from '../data/schedule';
import { defaultDeliverables } from '../data/deliverables';
import { syncClipInsert, syncClipUpdate, syncClipDelete, syncBulkClipUpdate, syncBulkClipDelete } from '../lib/clip-sync';
import {
  syncNoteInsert,
  syncNoteUpdate,
  syncNoteDelete,
  syncBulkNoteDelete,
  syncDeliverableUpsert,
  syncDeliverableUpdate,
  syncDeliverableDelete,
  syncBulkDeliverableUpsert,
  syncScheduleSlotUpsert,
  syncScheduleSlotDelete,
  syncBulkScheduleSlotUpsert,
  syncCompletionUpsert,
  syncCompletionDelete,
  syncResetCompletions,
} from '../lib/db-sync';

// Helper to convert app ScheduleSlot to DB record format
function slotToRecord(slot: ScheduleSlot) {
  return {
    id: slot.id,
    player_id: slot.playerId,
    date: slot.date,
    start_time: slot.startTime,
    end_time: slot.endTime,
    station: slot.station,
    status: slot.status || null,
    pr_call_info: slot.prCallInfo ? (slot.prCallInfo as unknown as Record<string, unknown>) : null,
    notes: slot.notes || null,
  };
}

// Helper to generate a clip name from player and station IDs
function generateClipName(playerId?: string | null, stationId?: string | null): string | null {
  const player = playerId ? getPlayerById(playerId) : null;
  const station = stationId ? getStationById(stationId as StationId) : null;
  if (player && station) return `${player.name} @ ${station.name}`;
  if (player) return player.name;
  if (station) return station.name;
  return null;
}

// Helper to convert app Deliverable to DB record format
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

interface AppState {
  // Preferences
  largeText: boolean;
  toggleLargeText: () => void;

  // Notifications
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  notificationSound: boolean;
  setNotificationSound: (enabled: boolean) => void;

  // Search
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // Schedule (editable)
  schedule: ScheduleSlot[];
  updateSlot: (id: string, updates: Partial<ScheduleSlot>) => void;
  addSlot: (slot: ScheduleSlot) => void;
  removeSlot: (id: string) => void;
  resetSchedule: () => void;

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

  // UI
  selectedStation: StationId;
  setSelectedStation: (id: StationId) => void;
  selectedDay: DayDate;
  setSelectedDay: (date: DayDate) => void;

  // Clips (global state for quick access)
  clips: ClipMarker[];
  clipModalOpen: boolean;
  quickMarkCategory: ClipCategory;
  clipDefaults: ClipDefaults;
  clipSortField: ClipSortField;
  clipSortDirection: ClipSortDirection;
  selectedClipIds: string[];
  setClips: (clips: ClipMarker[]) => void;
  addClip: (clip: Partial<ClipMarker>) => ClipMarker;
  updateClip: (id: string, updates: Partial<ClipMarker>) => void;
  deleteClip: (id: string) => void;
  duplicateClip: (id: string) => ClipMarker | null;
  bulkUpdateClips: (ids: string[], updates: Partial<ClipMarker>) => void;
  bulkDeleteClips: (ids: string[]) => void;
  toggleClipSelection: (id: string) => void;
  selectAllClips: (ids: string[]) => void;
  clearClipSelection: () => void;
  editingClipId: string | null;
  setEditingClipId: (id: string | null) => void;
  setClipModalOpen: (open: boolean) => void;
  setQuickMarkCategory: (category: ClipCategory) => void;
  setClipDefaults: (defaults: Partial<ClipDefaults>) => void;
  setClipSort: (field: ClipSortField, direction: ClipSortDirection) => void;
  toggleClipFlag: (id: string) => void;
  getTodayClipCount: () => number;
  getHighlightCount: () => number;
  getFlaggedCount: () => number;
  getClipAnalytics: () => {
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byCrewMember: Record<string, number>;
    avgRating: number;
    totalToday: number;
    totalFlagged: number;
  };

  // Player Station Checklist
  playerStationCompletions: PlayerStationCompletion[];
  togglePlayerStation: (playerId: string, stationId: StationId, completedBy?: string) => void;
  isStationCompleted: (playerId: string, stationId: StationId) => boolean;
  getPlayerProgress: (playerId: string) => { completed: number; total: number; percentage: number };
  getCompletedStationsForPlayer: (playerId: string) => StationId[];
  getRemainingStationsForPlayer: (playerId: string) => StationId[];
  resetPlayerStationChecklist: () => void;
  getStationCompletionCount: (stationId: StationId) => number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Preferences
      largeText: false,
      toggleLargeText: () => set((state) => ({ largeText: !state.largeText })),

      // Notifications
      notificationsEnabled: true,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      notificationSound: true,
      setNotificationSound: (enabled) => set({ notificationSound: enabled }),

      // Search
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),
      recentSearches: [],
      addRecentSearch: (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;

        set((state) => {
          const filtered = state.recentSearches.filter(
            (s) => s.toLowerCase() !== trimmed.toLowerCase()
          );
          return {
            recentSearches: [trimmed, ...filtered].slice(0, 5), // Keep last 5
          };
        });
      },
      clearRecentSearches: () => set({ recentSearches: [] }),

      // Schedule
      schedule: defaultSchedule,
      updateSlot: (id, updates) => {
        set((state) => ({
          schedule: state.schedule.map((slot) =>
            slot.id === id ? { ...slot, ...updates } : slot
          ),
        }));
        const updated = get().schedule.find((s) => s.id === id);
        if (updated) syncScheduleSlotUpsert(slotToRecord(updated));
      },
      addSlot: (slot) => {
        set((state) => ({
          schedule: [...state.schedule, slot],
        }));
        syncScheduleSlotUpsert(slotToRecord(slot));
      },
      removeSlot: (id) => {
        set((state) => ({
          schedule: state.schedule.filter((slot) => slot.id !== id),
        }));
        syncScheduleSlotDelete(id);
      },
      resetSchedule: () => {
        set({ schedule: defaultSchedule });
        syncBulkScheduleSlotUpsert(defaultSchedule.map(slotToRecord));
      },

      // Notes / Issue Logger
      notes: [],
      addNote: (noteData) => {
        const now = new Date().toISOString();
        const note: Note = {
          ...noteData,
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        const id = `deliverable-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
        const state = get();
        return state.deliverables.filter((d) => d.dueDay === day);
      },
      getDeliverablesByType: (type) => {
        const state = get();
        return state.deliverables.filter((d) => d.type === type);
      },
      getDeliverablesByStatus: (status) => {
        const state = get();
        return state.deliverables.filter((d) => d.status === status);
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

      // UI
      selectedStation: 'signing',
      setSelectedStation: (id) => set({ selectedStation: id }),
      selectedDay: '2026-02-05',
      setSelectedDay: (date) => set({ selectedDay: date }),

      // Clips
      clips: [],
      clipModalOpen: false,
      quickMarkCategory: 'highlight',
      clipDefaults: { crew_member: '', camera: '', media_type: 'video' },
      clipSortField: 'timestamp',
      clipSortDirection: 'desc',
      selectedClipIds: [],
      setClips: (clips) => set({ clips }),
      addClip: (clipData) => {
        const now = new Date().toISOString();
        const defaults = get().clipDefaults;
        const newClip: ClipMarker = {
          id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: clipData.name || generateClipName(clipData.player_id, clipData.station_id),
          timestamp: now,
          timecode: clipData.timecode || null,
          timecode_in: clipData.timecode_in || null,
          timecode_out: clipData.timecode_out || null,
          player_id: clipData.player_id || null,
          station_id: clipData.station_id || null,
          category: clipData.category || 'general',
          tags: clipData.tags || [],
          notes: clipData.notes || null,
          rating: clipData.rating || null,
          media_type: clipData.media_type || defaults.media_type || 'video',
          camera: clipData.camera || defaults.camera || null,
          crew_member: clipData.crew_member || defaults.crew_member || null,
          status: 'marked',
          priority: clipData.priority || 'normal',
          flagged: clipData.flagged || false,
          created_at: now,
          updated_at: now,
        };
        set((state) => {
          const updated = [newClip, ...state.clips];
          return { clips: updated.length > 500 ? updated.slice(0, 500) : updated };
        });
        syncClipInsert(newClip);
        return newClip;
      },
      updateClip: (id, updates) => {
        // Auto-regenerate name when player or station changes (unless name was explicitly provided)
        const finalUpdates = { ...updates };
        if (('player_id' in updates || 'station_id' in updates) && !('name' in updates)) {
          const clip = get().clips.find((c) => c.id === id);
          if (clip) {
            const playerId = 'player_id' in updates ? updates.player_id : clip.player_id;
            const stationId = 'station_id' in updates ? updates.station_id : clip.station_id;
            finalUpdates.name = generateClipName(playerId, stationId);
          }
        }
        set((state) => ({
          clips: state.clips.map((clip) =>
            clip.id === id
              ? { ...clip, ...finalUpdates, updated_at: new Date().toISOString() }
              : clip
          ),
        }));
        syncClipUpdate(id, finalUpdates);
      },
      deleteClip: (id) => {
        set((state) => ({
          clips: state.clips.filter((clip) => clip.id !== id),
          selectedClipIds: state.selectedClipIds.filter((sid) => sid !== id),
        }));
        syncClipDelete(id);
      },
      duplicateClip: (id) => {
        const state = get();
        const original = state.clips.find((c) => c.id === id);
        if (!original) return null;
        const now = new Date().toISOString();
        const newClip: ClipMarker = {
          ...original,
          id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: now,
          status: 'marked',
          created_at: now,
          updated_at: now,
        };
        set((state) => {
          const updated = [newClip, ...state.clips];
          return { clips: updated.length > 500 ? updated.slice(0, 500) : updated };
        });
        syncClipInsert(newClip);
        return newClip;
      },
      bulkUpdateClips: (ids, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          clips: state.clips.map((clip) =>
            ids.includes(clip.id)
              ? { ...clip, ...updates, updated_at: now }
              : clip
          ),
        }));
        syncBulkClipUpdate(ids, updates);
      },
      bulkDeleteClips: (ids) => {
        set((state) => ({
          clips: state.clips.filter((clip) => !ids.includes(clip.id)),
          selectedClipIds: [],
        }));
        syncBulkClipDelete(ids);
      },
      toggleClipSelection: (id) => {
        set((state) => ({
          selectedClipIds: state.selectedClipIds.includes(id)
            ? state.selectedClipIds.filter((sid) => sid !== id)
            : [...state.selectedClipIds, id],
        }));
      },
      selectAllClips: (ids) => set({ selectedClipIds: ids }),
      clearClipSelection: () => set({ selectedClipIds: [] }),
      editingClipId: null,
      setEditingClipId: (id) => set({ editingClipId: id }),
      setClipModalOpen: (open) => {
        if (!open) set({ clipModalOpen: false, editingClipId: null });
        else set({ clipModalOpen: true });
      },
      setQuickMarkCategory: (category) => set({ quickMarkCategory: category }),
      setClipDefaults: (defaults) => {
        set((state) => ({
          clipDefaults: { ...state.clipDefaults, ...defaults },
        }));
      },
      setClipSort: (field, direction) => set({ clipSortField: field, clipSortDirection: direction }),
      toggleClipFlag: (id) => {
        const clip = get().clips.find((c) => c.id === id);
        const newFlagged = clip ? !clip.flagged : true;
        set((state) => ({
          clips: state.clips.map((c) =>
            c.id === id
              ? { ...c, flagged: newFlagged, updated_at: new Date().toISOString() }
              : c
          ),
        }));
        syncClipUpdate(id, { flagged: newFlagged });
      },
      getTodayClipCount: () => {
        const state = get();
        const today = new Date().toDateString();
        return state.clips.filter(
          (c) => new Date(c.timestamp).toDateString() === today
        ).length;
      },
      getHighlightCount: () => {
        const state = get();
        return state.clips.filter((c) => c.category === 'highlight').length;
      },
      getFlaggedCount: () => {
        const state = get();
        return state.clips.filter((c) => c.flagged).length;
      },
      getClipAnalytics: () => {
        const state = get();
        const byCategory: Record<string, number> = {};
        const byStatus: Record<string, number> = {};
        const byPriority: Record<string, number> = {};
        const byCrewMember: Record<string, number> = {};
        let ratingSum = 0;
        let ratingCount = 0;
        const today = new Date().toDateString();
        let totalToday = 0;
        let totalFlagged = 0;

        for (const clip of state.clips) {
          byCategory[clip.category] = (byCategory[clip.category] || 0) + 1;
          byStatus[clip.status] = (byStatus[clip.status] || 0) + 1;
          byPriority[clip.priority || 'normal'] = (byPriority[clip.priority || 'normal'] || 0) + 1;
          if (clip.crew_member) {
            byCrewMember[clip.crew_member] = (byCrewMember[clip.crew_member] || 0) + 1;
          }
          if (clip.rating) {
            ratingSum += clip.rating;
            ratingCount++;
          }
          if (new Date(clip.timestamp).toDateString() === today) totalToday++;
          if (clip.flagged) totalFlagged++;
        }

        return {
          byCategory,
          byStatus,
          byPriority,
          byCrewMember,
          avgRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0,
          totalToday,
          totalFlagged,
        };
      },

      // Player Station Checklist
      playerStationCompletions: [],
      togglePlayerStation: (playerId, stationId, completedBy) => {
        const state = get();
        const existingIndex = state.playerStationCompletions.findIndex(
          (c) => c.playerId === playerId && c.stationId === stationId
        );

        if (existingIndex >= 0) {
          const existing = state.playerStationCompletions[existingIndex];
          if (existing.completed) {
            // Remove completion
            set({
              playerStationCompletions: state.playerStationCompletions.filter(
                (_, i) => i !== existingIndex
              ),
            });
            syncCompletionDelete(playerId, stationId);
          } else {
            // Mark as completed
            const now = new Date().toISOString();
            set({
              playerStationCompletions: state.playerStationCompletions.map((c, i) =>
                i === existingIndex
                  ? { ...c, completed: true, completedAt: now, completedBy }
                  : c
              ),
            });
            syncCompletionUpsert({
              player_id: playerId,
              station_id: stationId,
              completed: true,
              completed_at: now,
              completed_by: completedBy || null,
            });
          }
        } else {
          // Add new completion
          const now = new Date().toISOString();
          const newCompletion: PlayerStationCompletion = {
            playerId,
            stationId,
            completed: true,
            completedAt: now,
            completedBy,
          };
          set({
            playerStationCompletions: [...state.playerStationCompletions, newCompletion],
          });
          syncCompletionUpsert({
            player_id: playerId,
            station_id: stationId,
            completed: true,
            completed_at: now,
            completed_by: completedBy || null,
          });
        }
      },
      isStationCompleted: (playerId, stationId) => {
        const state = get();
        return state.playerStationCompletions.some(
          (c) => c.playerId === playerId && c.stationId === stationId && c.completed
        );
      },
      getPlayerProgress: (playerId) => {
        const state = get();
        const completed = state.playerStationCompletions.filter(
          (c) => c.playerId === playerId && c.completed
        ).length;
        const total = checklistStations.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { completed, total, percentage };
      },
      getCompletedStationsForPlayer: (playerId) => {
        const state = get();
        return state.playerStationCompletions
          .filter((c) => c.playerId === playerId && c.completed)
          .map((c) => c.stationId);
      },
      getRemainingStationsForPlayer: (playerId) => {
        const state = get();
        const completed = state.playerStationCompletions
          .filter((c) => c.playerId === playerId && c.completed)
          .map((c) => c.stationId);
        return checklistStations.filter((s) => !completed.includes(s));
      },
      resetPlayerStationChecklist: () => {
        set({ playerStationCompletions: [] });
        syncResetCompletions();
      },
      getStationCompletionCount: (stationId) => {
        const state = get();
        return state.playerStationCompletions.filter(
          (c) => c.stationId === stationId && c.completed
        ).length;
      },
    }),
    {
      name: 'prizm-lounge-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        largeText: state.largeText,
        notificationsEnabled: state.notificationsEnabled,
        notificationSound: state.notificationSound,
        recentSearches: state.recentSearches,
        schedule: state.schedule,
        notes: state.notes,
        deliverables: state.deliverables,
        selectedStation: state.selectedStation,
        selectedDay: state.selectedDay,
        clips: state.clips,
        quickMarkCategory: state.quickMarkCategory,
        clipDefaults: state.clipDefaults,
        clipSortField: state.clipSortField,
        clipSortDirection: state.clipSortDirection,
        playerStationCompletions: state.playerStationCompletions,
      }),
    }
  )
);
