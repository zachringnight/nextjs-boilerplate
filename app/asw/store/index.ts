import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ViewMode } from '../types';

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
}

export const useASWStore = create<ASWState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'asw-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        viewMode: state.viewMode,
        largeText: state.largeText,
      }),
    }
  )
);
