'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AthleteFilters, ContractFilters, ObligationFilters } from '../types';

interface PartnershipsState {
  // Filters (persisted)
  athleteFilters: AthleteFilters;
  setAthleteFilters: (filters: Partial<AthleteFilters>) => void;
  contractFilters: ContractFilters;
  setContractFilters: (filters: Partial<ContractFilters>) => void;
  obligationFilters: ObligationFilters;
  setObligationFilters: (filters: Partial<ObligationFilters>) => void;

  // CRUD modals
  editModalOpen: boolean;
  editModalEntity: string | null;
  editModalData: Record<string, unknown> | null;
  openEditModal: (entity: string, data?: Record<string, unknown> | null) => void;
  closeEditModal: () => void;

  deleteModalOpen: boolean;
  deleteModalEntity: string | null;
  deleteModalId: number | null;
  openDeleteModal: (entity: string, id: number) => void;
  closeDeleteModal: () => void;

  // Refresh trigger
  refreshKey: number;
  triggerRefresh: () => void;
}

export const usePartnershipsStore = create<PartnershipsState>()(
  persist(
    (set) => ({
      // Filters
      athleteFilters: { search: '', sport: 'all', league: 'all' },
      setAthleteFilters: (filters) =>
        set((s) => ({ athleteFilters: { ...s.athleteFilters, ...filters } })),
      contractFilters: { status: 'active', dealType: 'all', sport: 'all', search: '' },
      setContractFilters: (filters) =>
        set((s) => ({ contractFilters: { ...s.contractFilters, ...filters } })),
      obligationFilters: { type: 'all', search: '' },
      setObligationFilters: (filters) =>
        set((s) => ({ obligationFilters: { ...s.obligationFilters, ...filters } })),

      // Edit modal
      editModalOpen: false,
      editModalEntity: null,
      editModalData: null,
      openEditModal: (entity, data = null) =>
        set({ editModalOpen: true, editModalEntity: entity, editModalData: data ?? null }),
      closeEditModal: () =>
        set({ editModalOpen: false, editModalEntity: null, editModalData: null }),

      // Delete modal
      deleteModalOpen: false,
      deleteModalEntity: null,
      deleteModalId: null,
      openDeleteModal: (entity, id) =>
        set({ deleteModalOpen: true, deleteModalEntity: entity, deleteModalId: id }),
      closeDeleteModal: () =>
        set({ deleteModalOpen: false, deleteModalEntity: null, deleteModalId: null }),

      // Refresh
      refreshKey: 0,
      triggerRefresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),
    }),
    {
      name: 'partnerships-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        athleteFilters: state.athleteFilters,
        contractFilters: state.contractFilters,
        obligationFilters: state.obligationFilters,
      }),
    }
  )
);
