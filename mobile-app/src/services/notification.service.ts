import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { db } from '../environments/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Signalement, Statut } from '../models/signalement.model';

const STATUT_LABELS: Record<Statut, string> = {
  nouveau: 'Nouveau',
  en_cours: 'En cours de traitement',
  termine: 'Terminé'
};

let unsubscribe: (() => void) | null = null;
let knownStatuts: Map<string, Statut> = new Map();
let notifId = 1;

async function requestPermission(): Promise<boolean> {
  // Sur le web, les local notifications ne sont pas supportées
  if (!Capacitor.isNativePlatform()) {
    console.log('📱 Notifications locales non disponibles sur le web');
    return false;
  }

  const permission = await LocalNotifications.checkPermissions();
  if (permission.display === 'granted') return true;

  const result = await LocalNotifications.requestPermissions();
  return result.display === 'granted';
}

async function sendNotification(title: string, body: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    // Fallback web : utiliser l'API Notification du navigateur si disponible
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification(title, { body });
      }
    }
    console.log(`🔔 [Web] ${title}: ${body}`);
    return;
  }

  await LocalNotifications.schedule({
    notifications: [
      {
        id: notifId++,
        title,
        body,
        smallIcon: 'ic_stat_icon_config_sample',
        largeIcon: 'ic_launcher',
      }
    ]
  });
}

/**
 * Démarre l'écoute en temps réel des signalements de l'utilisateur.
 * Envoie une notification locale quand un statut change.
 */
function startListening(userId: string): void {
  // Éviter les doublons
  stopListening();

  // Demander la permission
  requestPermission();

  const q = query(
    collection(db, 'signalements'),
    where('userId', '==', userId)
  );

  let isInitialLoad = true;

  unsubscribe = onSnapshot(q, (snapshot) => {
    if (isInitialLoad) {
      // Premier chargement : mémoriser les statuts sans notifier
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        knownStatuts.set(doc.id, data.statut as Statut);
      });
      isInitialLoad = false;
      console.log(`🔔 Surveillance activée pour ${snapshot.docs.length} signalement(s)`);
      return;
    }

    // Changements suivants : détecter les modifications de statut
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'modified') {
        const data = change.doc.data();
        const newStatut = data.statut as Statut;
        const oldStatut = knownStatuts.get(change.doc.id);

        if (oldStatut && oldStatut !== newStatut) {
          const label = STATUT_LABELS[newStatut] || newStatut;
          const desc = data.description?.substring(0, 50) || 'Signalement';

          sendNotification(
            '📋 Statut mis à jour',
            `"${desc}" → ${label}`
          );

          console.log(`🔔 Statut changé: ${change.doc.id} ${oldStatut} → ${newStatut}`);
        }

        knownStatuts.set(change.doc.id, newStatut);
      }

      if (change.type === 'added' && !knownStatuts.has(change.doc.id)) {
        const data = change.doc.data();
        knownStatuts.set(change.doc.id, data.statut as Statut);
      }

      if (change.type === 'removed') {
        knownStatuts.delete(change.doc.id);
      }
    });
  }, (error) => {
    console.error('❌ Erreur listener notifications:', error);
  });
}

function stopListening(): void {
  unsubscribe?.();
  unsubscribe = null;
  knownStatuts.clear();
}

export const notificationService = {
  startListening,
  stopListening,
  requestPermission,
  sendNotification
};
