import { db } from '../environments/firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { Preferences } from '@capacitor/preferences';
import { QueuedSignalement, Signalement, SignalementInput } from '../models/signalement.model';
import { storageService } from './storage.service';

const COLLECTION = 'signalements';
const QUEUE_KEY = 'offline_queue_signalements';
const dataSource = (import.meta.env.VITE_DATA_SOURCE ?? '').toLowerCase();
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
const useApi = dataSource === 'api';

function mapDoc(d: any): Signalement {
  const data = d.data();
  return {
    id: d.id,
    userId: data.userId,
    latitude: data.latitude,
    longitude: data.longitude,
    description: data.description,
    photoUrl: data.photoUrl ?? null,
    statut: data.statut,
    surface_m2: data.surface_m2 ?? null,
    budget: data.budget ?? null,
    entreprise: data.entreprise ?? null,
    createdAt: data.createdAt?.toMillis?.() ?? data.createdAt ?? Date.now(),
    updatedAt: data.updatedAt?.toMillis?.() ?? data.updatedAt ?? Date.now()
  };
}

function normalizeStatut(value: any): Signalement['statut'] {
  if (!value) return 'nouveau';
  const s = String(value).toLowerCase();
  if (s === 'en_cours' || s === 'nouveau' || s === 'termine' || s === 'annule') return s as Signalement['statut'];
  if (s === 'en-cours' || s === 'encours') return 'en_cours';
  return 'nouveau';
}

function parseTime(value: any): number {
  if (value == null) return Date.now();
  if (typeof value === 'number') return value;
  const t = Date.parse(value);
  if (!Number.isNaN(t)) return t;
  return Date.now();
}

function mapApiSignalement(item: any): Signalement {
  return {
    id: String(item.id ?? item.firebaseId ?? ''),
    userId: item.firebaseId ?? (item.user?.id != null ? String(item.user.id) : ''),
    latitude: Number(item.latitude ?? 0),
    longitude: Number(item.longitude ?? 0),
    description: item.description ?? item.titre ?? '',
    photoUrl: item.photos ?? null,
    statut: normalizeStatut(item.statut),
    surface_m2: null,
    budget: null,
    entreprise: null,
    createdAt: parseTime(item.createdAt),
    updatedAt: parseTime(item.updatedAt)
  };
}

async function fetchApiSignalements(): Promise<Signalement[]> {
  const res = await fetch(`${apiBaseUrl}/api/signalements`);
  if (!res.ok) return [];
  const body = await res.json();
  const data = body?.data ?? body;
  if (!Array.isArray(data)) return [];
  return data.map(mapApiSignalement);
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
    if (useApi) return fetchApiSignalements();
    const snap = await getDocs(collection(db, COLLECTION));
    return snap.docs.map(mapDoc);
  },

  async listByUser(userId: string): Promise<Signalement[]> {
    if (useApi) {
      const all = await fetchApiSignalements();
      return all.filter(s => s.userId === userId);
    }
    const q = query(collection(db, COLLECTION), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(mapDoc);
  },

  async addOnline(userId: string, input: SignalementInput): Promise<void> {
    let photoUrl: string | null = null;
    if (input.photo) {
      photoUrl = await storageService.uploadSignalementPhoto(userId, input.photo);
    }
    await addDoc(collection(db, COLLECTION), {
      userId,
      latitude: input.latitude,
      longitude: input.longitude,
      description: input.description,
      photoUrl,
      statut: input.statut,
      surface_m2: input.surface_m2,
      budget: input.budget,
      entreprise: input.entreprise,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
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
