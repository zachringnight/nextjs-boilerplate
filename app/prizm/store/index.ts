import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ScheduleSlot, StationId, DayDate, AppState } from '../types';
import { defaultSchedule } from '../data/schedule';

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Preferences
      largeText: false,
      toggleLargeText: () => set((state) => ({ largeText: !state.largeText })),

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
      updateSlot: (id, updates) =>
        set((state) => ({
          schedule: state.schedule.map((slot) =>
            slot.id === id ? { ...slot, ...updates } : slot
          ),
        })),
      addSlot: (slot) =>
        set((state) => ({
          schedule: [...state.schedule, slot],
        })),
      removeSlot: (id) =>
        set((state) => ({
          schedule: state.schedule.filter((slot) => slot.id !== id),
        })),
      resetSchedule: () => set({ schedule: defaultSchedule }),

      // UI
      selectedStation: 'signing',
      setSelectedStation: (id) => set({ selectedStation: id }),
      selectedDay: '2026-02-06',
      setSelectedDay: (date) => set({ selectedDay: date }),
    }),
    {
      name: 'prizm-lounge-storage',
      storage: createJSONStorage(() => {
        // Handle SSR gracefully - only use localStorage in browser
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Return a no-op storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        largeText: state.largeText,
        recentSearches: state.recentSearches,
        schedule: state.schedule,
        selectedStation: state.selectedStation,
        selectedDay: state.selectedDay,
      }),
    }
  )
);
