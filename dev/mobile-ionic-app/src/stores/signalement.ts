import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Signalement } from '../types';
import { listenSignalements, addSignalementToFirestore } from '../services/firebase';
import { pushToQueue, processQueue } from '../services/offlineQueue';
import { Network } from '@capacitor/network';
import { getAuth } from 'firebase/auth';

export const useSignalementStore = defineStore('signalement', () => {
  const items = ref<Signalement[]>([]);
  const loading = ref(false);
  const showOnlyMine = ref(false);

  const initRealtime = () => {
    loading.value = true;
    listenSignalements((docs: any[]) => {
      items.value = docs as Signalement[];
      loading.value = false;
    });
  };

  const addSignalement = async (payload: any, photoBase64?: string | null) => {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    const doc = {
      ...payload,
      userId: user.uid,
      statut: 'nouveau'
    } as Signalement;

    const status = await Network.getStatus();
    if (!status.connected) {
      // save to queue for later sync
      await pushToQueue({ ...doc, photoBase64 });
      return { queued: true };
    }

    // online: add immediately
    if (photoBase64) doc.photoUrl = null; // will be uploaded by offlineQueue.processQueue when applicable
    await addSignalementToFirestore({ ...doc, photoUrl: doc.photoUrl ?? null });
    return { queued: false };
  };

  const syncPending = async () => {
    await processQueue();
  };

  const filtered = () => {
    if (!showOnlyMine.value) return items.value;
    const uid = getAuth().currentUser?.uid;
    return items.value.filter(i => i.userId === uid);
  };

  // listen to network changes and auto-sync
  Network.addListener('networkStatusChange', async (status) => {
    if (status.connected) {
      await processQueue();
    }
  });

  return { items, loading, initRealtime, addSignalement, syncPending, showOnlyMine, filtered };
});