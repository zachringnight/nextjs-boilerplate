import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ScheduleSlot, StationId, DayDate } from '../types';
import { defaultSchedule } from '../data/schedule';

interface AppState {
  // Preferences
  largeText: boolean;
  toggleLargeText: () => void;

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

  // UI
  selectedStation: StationId;
  setSelectedStation: (id: StationId) => void;
  selectedDay: DayDate;
  setSelectedDay: (date: DayDate) => void;
}

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
      storage: createJSONStorage(() => localStorage),
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
