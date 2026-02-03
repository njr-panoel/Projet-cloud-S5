import { storage } from '../environments/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Photo } from '@capacitor/camera';

async function photoToBlob(photo: Photo): Promise<Blob> {
  const response = await fetch(photo.webPath || photo.path || '');
  return await response.blob();
}

export const storageService = {
  async uploadSignalementPhoto(userId: string, photo: Photo): Promise<string> {
    const blob = await photoToBlob(photo);
    const filename = `signalements/${userId}/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
    return await getDownloadURL(storageRef);
  }
};
