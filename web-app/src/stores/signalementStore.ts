import { create } from 'zustand';
import type { Signalement, SignalementFilters, GlobalStats, SignalementFormData, SignalementStatut } from '../types';
import { signalementService } from '../services/signalementService';

interface SignalementStore {
  signalements: Signalement[];
  filteredSignalements: Signalement[];
  selectedSignalement: Signalement | null;
  stats: GlobalStats | null;
  filters: SignalementFilters;
  isLoading: boolean;
  error: string | null;

  fetchSignalements: () => Promise<void>;
  setFilters: (filters: SignalementFilters) => void;
  clearFilters: () => void;
  selectSignalement: (signalement: Signalement | null) => void;
  createSignalement: (data: SignalementFormData) => Promise<Signalement>;
  updateSignalement: (id: number, data: SignalementFormData) => Promise<void>;
  updateStatut: (id: number, statut: SignalementStatut) => Promise<void>;
  deleteSignalement: (id: number) => Promise<void>;
}

export const useSignalementStore = create<SignalementStore>((set, get) => ({
  signalements: [],
  filteredSignalements: [],
  selectedSignalement: null,
  stats: null,
  filters: {},
  isLoading: false,
  error: null,

  fetchSignalements: async () => {
    set({ isLoading: true, error: null });
    try {
      const signalements = await signalementService.getAll();
      const stats = signalementService.calculateStats(signalements);
      const filters = get().filters;
      const filteredSignalements = signalementService.filterSignalements(signalements, filters);
      
      set({
        signalements,
        filteredSignalements,
        stats,
        isLoading: false,
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement' 
      });
    }
  },

  setFilters: (filters: SignalementFilters) => {
    const { signalements } = get();
    const filteredSignalements = signalementService.filterSignalements(signalements, filters);
    set({ filters, filteredSignalements });
  },

  clearFilters: () => {
    const { signalements } = get();
    set({ filters: {}, filteredSignalements: signalements });
  },

  selectSignalement: (signalement: Signalement | null) => {
    set({ selectedSignalement: signalement });
  },

  createSignalement: async (data: SignalementFormData) => {
    set({ isLoading: true });
    try {
      const newSignalement = await signalementService.create(data);
      const signalements = [newSignalement, ...get().signalements];
      const stats = signalementService.calculateStats(signalements);
      const filters = get().filters;
      const filteredSignalements = signalementService.filterSignalements(signalements, filters);
      
      set({
        signalements,
        filteredSignalements,
        stats,
        isLoading: false,
      });
      return newSignalement;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateSignalement: async (id: number, data: SignalementFormData) => {
    set({ isLoading: true });
    try {
      const updated = await signalementService.update(id, data);
      const signalements = get().signalements.map((s) => 
        s.id === id ? updated : s
      );
      const stats = signalementService.calculateStats(signalements);
      const filters = get().filters;
      const filteredSignalements = signalementService.filterSignalements(signalements, filters);
      
      set({
        signalements,
        filteredSignalements,
        stats,
        selectedSignalement: get().selectedSignalement?.id === id ? updated : get().selectedSignalement,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateStatut: async (id: number, statut: SignalementStatut) => {
    set({ isLoading: true });
    try {
      const updated = await signalementService.updateStatut(id, statut);
      const signalements = get().signalements.map((s) => 
        s.id === id ? updated : s
      );
      const stats = signalementService.calculateStats(signalements);
      const filters = get().filters;
      const filteredSignalements = signalementService.filterSignalements(signalements, filters);
      
      set({
        signalements,
        filteredSignalements,
        stats,
        selectedSignalement: get().selectedSignalement?.id === id ? updated : get().selectedSignalement,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteSignalement: async (id: number) => {
    set({ isLoading: true });
    try {
      await signalementService.delete(id);
      const signalements = get().signalements.filter((s) => s.id !== id);
      const stats = signalementService.calculateStats(signalements);
      const filters = get().filters;
      const filteredSignalements = signalementService.filterSignalements(signalements, filters);
      
      set({
        signalements,
        filteredSignalements,
        stats,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
