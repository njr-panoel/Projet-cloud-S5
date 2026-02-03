import { defineStore } from 'pinia';
import { signalementService } from '../services/signalement.service';
import { geolocationService } from '../services/geolocation.service';
import { useAuthStore } from './auth.store';
import { useNetworkStore } from './network.store';
import { Signalement, SignalementInput } from '../models/signalement.model';
import { emptyStats, Stats } from '../models/stats.model';
import { networkService } from '../services/network.service';

export const useSignalementStore = defineStore('signalements', {
  state: () => ({ list: [] as Signalement[], loading: false, stats: { ...emptyStats }, center: { lat: -18.8792, lng: 47.5079 }, networkUnsub: null as (() => void) | null }),
  actions: {
    async init() {
      const auth = useAuthStore();
      const net = useNetworkStore();
      await net.init();
      if (!auth.user) return;
      this.loading = true;
      if (net.online) {
        await signalementService.syncQueue(auth.user.uid);
      }
      if (!this.networkUnsub) {
        this.networkUnsub = networkService.onChange(async (status) => {
          if (status.connected && auth.user) {
            await signalementService.syncQueue(auth.user.uid);
            await this.refresh();
          }
        });
      }
      await this.refresh();
      this.loading = false;
    },
    async refresh() {
      const auth = useAuthStore();
      if (!auth.user) return;
      this.list = await signalementService.listAll();
      this.computeStats();
    },
    async addSignalement(input: SignalementInput & { photo: any }) {
      const auth = useAuthStore();
      const net = useNetworkStore();
      if (!auth.user) {
        console.error('❌ Utilisateur non connecté');
        throw new Error('Vous devez être connecté pour ajouter un signalement');
      }
      
      console.log('🚀 Ajout signalement, online:', net.online);
      
      if (net.online) {
        await signalementService.addOnline(auth.user.uid, input);
      } else {
        console.log('📴 Mode hors-ligne, mise en queue');
        await signalementService.queueOffline(auth.user.uid, input);
      }
      
      console.log('🔄 Rafraîchissement de la liste...');
      await this.refresh();
      console.log('✅ Signalement ajouté et liste rafraîchie');
    },
    async centerOnUser() {
      const position = await geolocationService.currentPosition();
      if (position) {
        this.center = position;
      }
    },
    computeStats() {
      const total = this.list.length;
      const surfaceTotal = this.list.reduce((sum, s) => sum + (s.surface_m2 ?? 0), 0);
      const budgetTotal = this.list.reduce((sum, s) => sum + (s.budget ?? 0), 0);
      const completed = this.list.filter(s => s.statut === 'termine').length;
      const completion = total ? Math.round((completed / total) * 100) : 0;
      this.stats = { total, surfaceTotal, budgetTotal, completion } as Stats;
    },
    $reset() {
      this.networkUnsub?.();
      this.networkUnsub = null;
      this.list = [];
      this.loading = false;
      this.stats = { ...emptyStats };
      this.center = { lat: -18.8792, lng: 47.5079 };
    }
  }
});
