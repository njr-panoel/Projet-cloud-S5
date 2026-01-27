import { Preferences } from '@capacitor/preferences';
import { addSignalementToFirestore, uploadPhotoBase64 } from './firebase';

const KEY = 'pending_signalements_v1';

export const getQueue = async () => {
  const { value } = await Preferences.get({ key: KEY });
  return value ? JSON.parse(value) : [];
};

export const pushToQueue = async (payload: any) => {
  const q = await getQueue();
  q.push(payload);
  await Preferences.set({ key: KEY, value: JSON.stringify(q) });
};

export const setQueue = async (arr: any[]) => {
  await Preferences.set({ key: KEY, value: JSON.stringify(arr) });
};

export const processQueue = async () => {
  const q = await getQueue();
  const remaining: any[] = [];
  for (const item of q) {
    try {
      // If has photoBase64, upload first
      if (item.photoBase64) {
        const path = `signalements/${item.userId}/${Date.now()}.jpg`;
        const url = await uploadPhotoBase64(item.photoBase64, path);
        item.photoUrl = url;
        delete item.photoBase64;
      }
      await addSignalementToFirestore(item);
    } catch (e) {
      console.error('Sync failed for item', e);
      remaining.push(item);
    }
  }
  await setQueue(remaining);
  return remaining.length === 0;
};