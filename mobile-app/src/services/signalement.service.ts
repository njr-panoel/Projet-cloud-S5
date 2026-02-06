import { db } from '../environments/firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { Preferences } from '@capacitor/preferences';
import { QueuedSignalement, Signalement, SignalementInput } from '../models/signalement.model';
import { storageService } from './storage.service';

const COLLECTION = 'signalements';
const QUEUE_KEY = 'offline_queue_signalements';

function mapDoc(d: any): Signalement {
  const data = d.data();
  return {
    id: d.id,
    userId: data.userId,
    latitude: data.latitude,
    longitude: data.longitude,
    description: data.description,
      type: data.type || 'autre',
    photoUrl: data.photoUrl ?? null,
    statut: data.statut,
    surface_m2: data.surface_m2 ?? null,
    budget: data.budget ?? null,
    entreprise: data.entreprise ?? null,
    createdAt: data.createdAt?.toMillis?.() ?? data.createdAt ?? Date.now(),
    updatedAt: data.updatedAt?.toMillis?.() ?? data.updatedAt ?? Date.now()
  };
}

async function loadQueue(): Promise<QueuedSignalement[]> {
  const stored = await Preferences.get({ key: QUEUE_KEY });
  if (!stored.value) return [];
  try {
    return JSON.parse(stored.value) as QueuedSignalement[];
  } catch (e) {
    return [];
  }
}

async function saveQueue(queue: QueuedSignalement[]): Promise<void> {
  await Preferences.set({ key: QUEUE_KEY, value: JSON.stringify(queue) });
}

export const signalementService = {
  async listAll(): Promise<Signalement[]> {
    const snap = await getDocs(collection(db, COLLECTION));
    return snap.docs.map(mapDoc);
  },

  async listByUser(userId: string): Promise<Signalement[]> {
    const q = query(collection(db, COLLECTION), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(mapDoc);
  },

  async addOnline(userId: string, input: SignalementInput): Promise<void> {
    console.log('💾 Début sauvegarde signalement...');
    console.log('👤 userId:', userId);
    console.log('📍 latitude:', input.latitude, 'longitude:', input.longitude);
    console.log('📝 description:', input.description);
    console.log('🏷️ type:', input.type);
    
    let photoUrl: string | null = null;
    
    // Upload photo si présente (optionnel, ne bloque pas)
    if (input.photo) {
      try {
        console.log('📸 Upload photo...');
        photoUrl = await storageService.uploadSignalementPhoto(userId, input.photo);
        console.log('✅ Photo uploadée:', photoUrl);
      } catch (error) {
        console.warn('⚠️ Erreur upload photo, continue sans photo:', error);
        // Continue même si l'upload photo échoue
      }
    }
    
    console.log('💾 Création document Firestore...');
    try {
      const now = Date.now();
      const docData = {
        userId,
        latitude: input.latitude,
        longitude: input.longitude,
        type: input.type,
        description: input.description,
        photoUrl,
        statut: 'nouveau',
        surface_m2: null,
        budget: null,
        entreprise: null,
        createdAt: now,
        updatedAt: now
      };
      console.log('📄 Données à enregistrer:', docData);
      
      // Timeout de 30s sur l'appel Firestore
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore timeout après 30s - vérifiez les règles de sécurité Firestore dans la Console Firebase')), 30000)
      );
      
      console.log('⏳ Appel addDoc...');
      const docRef = await Promise.race([
        addDoc(collection(db, COLLECTION), docData),
        timeoutPromise
      ]) as any;
      console.log('✅ Signalement sauvegardé avec succès! ID:', docRef.id);
    } catch (error: any) {
      console.error('❌ Erreur Firestore:', error);
      console.error('❌ Code:', error?.code);
      console.error('❌ Message:', error?.message);
      throw error;
    }
  },

  async queueOffline(userId: string, input: SignalementInput): Promise<void> {
    const queue = await loadQueue();
    queue.push({
      ...input,
      id: crypto.randomUUID(),
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    await saveQueue(queue);
  },

  async syncQueue(userId: string): Promise<void> {
    const queue = await loadQueue();
    if (!queue.length) return;
    for (const item of queue) {
      await this.addOnline(userId, item);
    }
    await saveQueue([]);
  },

  async updateStatus(id: string, statut: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { statut, updatedAt: serverTimestamp() });
  }
};
