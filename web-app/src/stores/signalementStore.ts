import { create } from 'zustand';
import type { Signalement, SignalementFilters, GlobalStats, PaginatedResponse } from '../types';
import { signalementService } from '../services/signalementService';

interface SignalementStore {
  signalements: Signalement[];
  selectedSignalement: Signalement | null;
  stats: GlobalStats | null;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  filters: SignalementFilters;
  isLoading: boolean;
  error: string | null;

  fetchSignalements: (page?: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  setFilters: (filters: SignalementFilters) => void;
  selectSignalement: (signalement: Signalement | null) => void;
  createSignalement: (data: Parameters<typeof signalementService.create>[0]) => Promise<Signalement>;
  updateSignalement: (id: string, data: Partial<Signalement>) => Promise<void>;
  deleteSignalement: (id: string) => Promise<void>;
}

export const useSignalementStore = create<SignalementStore>((set, get) => ({
  signalements: [],
  selectedSignalement: null,
  stats: null,
  pagination: {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  },
  filters: {},
  isLoading: false,
  error: null,

  fetchSignalements: async (page = 0) => {
    set({ isLoading: true, error: null });
    try {
      const { size } = get().pagination;
      const filters = get().filters;
      const response: PaginatedResponse<Signalement> = await signalementService.getAll(page, size, filters);
      set({
        signalements: response.content,
        pagination: {
          page: response.number,
          size: response.size,
          totalElements: response.totalElements,
          totalPages: response.totalPages,
        },
        isLoading: false,
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement' 
      });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await signalementService.getStats();
      set({ stats });
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    }
  },

  setFilters: (filters: SignalementFilters) => {
    set({ filters });
    get().fetchSignalements(0);
  },

  selectSignalement: (signalement: Signalement | null) => {
    set({ selectedSignalement: signalement });
  },

  createSignalement: async (data) => {
    set({ isLoading: true });
    try {
      const newSignalement = await signalementService.create(data);
      set((state) => ({
        signalements: [newSignalement, ...state.signalements],
        isLoading: false,
      }));
      return newSignalement;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateSignalement: async (id: string, data: Partial<Signalement>) => {
    set({ isLoading: true });
    try {
      const updated = await signalementService.update(id, data);
      set((state) => ({
        signalements: state.signalements.map((s) => 
          s.id === id ? updated : s
        ),
        selectedSignalement: state.selectedSignalement?.id === id ? updated : state.selectedSignalement,
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteSignalement: async (id: string) => {
    set({ isLoading: true });
    try {
      await signalementService.delete(id);
      set((state) => ({
        signalements: state.signalements.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
