import { defineStore } from 'pinia';
import { networkService, NetworkStatus } from '../services/network.service';

export const useNetworkStore = defineStore('network', {
  state: () => ({ status: { connected: true } as NetworkStatus, initialized: false, unsubscribe: null as (() => void) | null }),
  actions: {
    async init() {
      if (this.initialized) return;
      this.status = await networkService.getStatus();
      this.unsubscribe = networkService.onChange((s) => {
        this.status = s;
      });
      this.initialized = true;
    },
    $reset() {
      this.unsubscribe?.();
      this.unsubscribe = null;
      this.status = { connected: true };
      this.initialized = false;
    }
  },
  getters: {
    online: (state) => state.status.connected
  }
});
