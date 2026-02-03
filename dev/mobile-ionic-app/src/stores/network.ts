import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Network } from '@capacitor/network';
import { processQueue } from '../services/offlineQueue';

export const useNetworkStore = defineStore('network', () => {
  const connected = ref(true);
  const statusText = ref('');

  const start = async () => {
    const status = await Network.getStatus();
    connected.value = !!status.connected;
    statusText.value = connected.value ? 'En ligne' : 'Hors-ligne';

    Network.addListener('networkStatusChange', async (s: any) => {
      connected.value = s.connected;
      statusText.value = s.connected ? 'Connexion rétablie' : 'Hors-ligne';
      if (s.connected) {
        // try to sync pending
        statusText.value = 'Synchronisation…';
        await processQueue();
        statusText.value = 'Synchronisation terminée';
        setTimeout(() => (statusText.value = ''), 2000);
      }
    });
  };

  return { connected, statusText, start };
});