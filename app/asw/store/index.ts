import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ViewMode,
  ClipMarker,
  ClipCategory,
  ClipPriority,
  ClipDefaults,
  ClipSortField,
  ClipSortDirection,
  Note,
  NoteCategory,
  NotePriority,
  NoteStatus,
  PlayerStationCompletion,
  StationId,
} from '../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

interface ASWState {
  // =============================================
  // UI State
  // =============================================
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  largeText: boolean;
  toggleLargeText: () => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // Filters
  activeDay: 1 | 2 | null;
  setActiveDay: (day: 1 | 2 | null) => void;
  showEmbargoedOnly: boolean;
  setShowEmbargoedOnly: (show: boolean) => void;

  // =============================================
  // Notifications (ported from Prizm)
  // =============================================
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  notificationSound: boolean;
  setNotificationSound: (enabled: boolean) => void;

  // =============================================
  // Clip Markers (ported from Prizm)
  // =============================================
  clips: ClipMarker[];
  clipModalOpen: boolean;
  setClipModalOpen: (open: boolean) => void;
  editingClipId: string | null;
  setEditingClipId: (id: string | null) => void;
  quickMarkCategory: ClipCategory;
  setQuickMarkCategory: (category: ClipCategory) => void;
  clipDefaults: ClipDefaults;
  setClipDefaults: (defaults: ClipDefaults) => void;
  clipSort: { field: ClipSortField; direction: ClipSortDirection };
  setClipSort: (sort: { field: ClipSortField; direction: ClipSortDirection }) => void;
  selectedClipIds: string[];
  toggleClipSelection: (id: string) => void;
  selectAllClips: () => void;
  clearClipSelection: () => void;

  // Clip CRUD
  addClip: (clipData: Partial<ClipMarker>) => void;
  updateClip: (id: string, updates: Partial<ClipMarker>) => void;
  deleteClip: (id: string) => void;
  duplicateClip: (id: string) => void;
  bulkUpdateClips: (ids: string[], updates: Partial<ClipMarker>) => void;
  bulkDeleteClips: (ids: string[]) => void;
  toggleClipFlag: (id: string) => void;

  // Clip analytics
  getTodayClipCount: () => number;
  getHighlightCount: () => number;
  getFlaggedCount: () => number;

  // =============================================
  // Notes / Issue Logger (ported from Prizm)
  // =============================================
  notes: Note[];
  addNote: (content: string, category?: NoteCategory, priority?: NotePriority, stationId?: StationId, playerId?: string) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  resolveNote: (id: string) => void;
  clearResolvedNotes: () => void;

  // =============================================
  // Player Station Checklist (ported from Prizm)
  // =============================================
  playerStationCompletions: PlayerStationCompletion[];
  togglePlayerStation: (playerId: string, stationId: StationId, completedBy?: string) => void;
  isStationCompleted: (playerId: string, stationId: StationId) => boolean;
  getPlayerProgress: (playerId: string) => { completed: number; total: number; percentage: number };
}

export const useASWStore = create<ASWState>()(
  persist(
    (set, get) => ({
      // =============================================
      // UI State
      // =============================================
      viewMode: 'now',
      setViewMode: (mode) => set({ viewMode: mode }),
      largeText: false,
      toggleLargeText: () => set((s) => ({ largeText: !s.largeText })),
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),

      activeDay: null,
      setActiveDay: (day) => set({ activeDay: day }),
      showEmbargoedOnly: false,
      setShowEmbargoedOnly: (show) => set({ showEmbargoedOnly: show }),

      // =============================================
      // Notifications
      // =============================================
      notificationsEnabled: false,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      notificationSound: true,
      setNotificationSound: (enabled) => set({ notificationSound: enabled }),

      // =============================================
      // Clip Markers
      // =============================================
      clips: [],
      clipModalOpen: false,
      setClipModalOpen: (open) => set({ clipModalOpen: open }),
      editingClipId: null,
      setEditingClipId: (id) => set({ editingClipId: id }),
      quickMarkCategory: 'highlight',
      setQuickMarkCategory: (category) => set({ quickMarkCategory: category }),
      clipDefaults: { crew_member: '', camera: '', media_type: 'video' },
      setClipDefaults: (defaults) => set({ clipDefaults: defaults }),
      clipSort: { field: 'timestamp', direction: 'desc' },
      setClipSort: (sort) => set({ clipSort: sort }),
      selectedClipIds: [],
      toggleClipSelection: (id) => set((s) => ({
        selectedClipIds: s.selectedClipIds.includes(id)
          ? s.selectedClipIds.filter(i => i !== id)
          : [...s.selectedClipIds, id],
      })),
      selectAllClips: () => set((s) => ({
        selectedClipIds: s.clips.map(c => c.id),
      })),
      clearClipSelection: () => set({ selectedClipIds: [] }),

      addClip: (clipData) => set((s) => {
        const now = new Date().toISOString();
        const newClip: ClipMarker = {
          id: generateId(),
          name: clipData.name || null,
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
          media_type: clipData.media_type || 'video',
          camera: clipData.camera || null,
          crew_member: clipData.crew_member || null,
          status: 'marked',
          priority: clipData.priority || 'normal',
          flagged: clipData.flagged || false,
          created_at: now,
          updated_at: now,
        };
        return { clips: [newClip, ...s.clips] };
      }),

      updateClip: (id, updates) => set((s) => ({
        clips: s.clips.map(c => c.id === id
          ? { ...c, ...updates, updated_at: new Date().toISOString() }
          : c
        ),
      })),

      deleteClip: (id) => set((s) => ({
        clips: s.clips.filter(c => c.id !== id),
        selectedClipIds: s.selectedClipIds.filter(i => i !== id),
      })),

      duplicateClip: (id) => set((s) => {
        const clip = s.clips.find(c => c.id === id);
        if (!clip) return s;
        const now = new Date().toISOString();
        const dupe: ClipMarker = {
          ...clip,
          id: generateId(),
          name: clip.name ? `${clip.name} (copy)` : null,
          timestamp: now,
          status: 'marked',
          created_at: now,
          updated_at: now,
        };
        return { clips: [dupe, ...s.clips] };
      }),

      bulkUpdateClips: (ids, updates) => set((s) => ({
        clips: s.clips.map(c => ids.includes(c.id)
          ? { ...c, ...updates, updated_at: new Date().toISOString() }
          : c
        ),
      })),

      bulkDeleteClips: (ids) => set((s) => ({
        clips: s.clips.filter(c => !ids.includes(c.id)),
        selectedClipIds: s.selectedClipIds.filter(i => !ids.includes(i)),
      })),

      toggleClipFlag: (id) => set((s) => ({
        clips: s.clips.map(c => c.id === id
          ? { ...c, flagged: !c.flagged, updated_at: new Date().toISOString() }
          : c
        ),
      })),

      getTodayClipCount: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().clips.filter(c => c.created_at.startsWith(today)).length;
      },
      getHighlightCount: () => get().clips.filter(c => c.category === 'highlight').length,
      getFlaggedCount: () => get().clips.filter(c => c.flagged).length,

      // =============================================
      // Notes / Issue Logger
      // =============================================
      notes: [],

      addNote: (content, category = 'general', priority = 'medium', stationId, playerId) => set((s) => {
        const now = new Date().toISOString();
        const note: Note = {
          id: generateId(),
          content,
          category,
          priority,
          status: 'open',
          stationId,
          playerId,
          createdAt: now,
          updatedAt: now,
        };
        return { notes: [note, ...s.notes] };
      }),

      updateNote: (id, updates) => set((s) => ({
        notes: s.notes.map(n => n.id === id
          ? { ...n, ...updates, updatedAt: new Date().toISOString() }
          : n
        ),
      })),

      deleteNote: (id) => set((s) => ({
        notes: s.notes.filter(n => n.id !== id),
      })),

      resolveNote: (id) => set((s) => ({
        notes: s.notes.map(n => n.id === id
          ? { ...n, status: 'resolved' as NoteStatus, resolvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : n
        ),
      })),

      clearResolvedNotes: () => set((s) => ({
        notes: s.notes.filter(n => n.status !== 'resolved'),
      })),

      // =============================================
      // Player Station Checklist
      // =============================================
      playerStationCompletions: [],

      togglePlayerStation: (playerId, stationId, completedBy) => set((s) => {
        const existing = s.playerStationCompletions.find(
          c => c.playerId === playerId && c.stationId === stationId
        );

        if (existing) {
          return {
            playerStationCompletions: s.playerStationCompletions.map(c =>
              c.playerId === playerId && c.stationId === stationId
                ? { ...c, completed: !c.completed, completedAt: !c.completed ? new Date().toISOString() : undefined, completedBy }
                : c
            ),
          };
        }

        return {
          playerStationCompletions: [
            ...s.playerStationCompletions,
            { playerId, stationId, completed: true, completedAt: new Date().toISOString(), completedBy },
          ],
        };
      }),

      isStationCompleted: (playerId, stationId) => {
        return get().playerStationCompletions.some(
          c => c.playerId === playerId && c.stationId === stationId && c.completed
        );
      },

      getPlayerProgress: (playerId) => {
        const totalStations = 2; // tunnel and product
        const completed = get().playerStationCompletions.filter(
          c => c.playerId === playerId && c.completed
        ).length;
        return {
          completed,
          total: totalStations,
          percentage: Math.round((completed / totalStations) * 100),
        };
      },
    }),
    {
      name: 'asw-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        viewMode: state.viewMode,
        largeText: state.largeText,
        activeDay: state.activeDay,
        showEmbargoedOnly: state.showEmbargoedOnly,
        notificationsEnabled: state.notificationsEnabled,
        notificationSound: state.notificationSound,
        clips: state.clips,
        clipDefaults: state.clipDefaults,
        quickMarkCategory: state.quickMarkCategory,
        clipSort: state.clipSort,
        notes: state.notes,
        playerStationCompletions: state.playerStationCompletions,
      }),
    }
  )
);
