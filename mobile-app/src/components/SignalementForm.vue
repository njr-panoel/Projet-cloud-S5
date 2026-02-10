<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title size="small">Nouveau signalement</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('cancel')">Fermer</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="form-content">
      <div class="form-wrapper">
        <ion-item>
          <ion-label position="stacked">Type de problème *</ion-label>
          <ion-select v-model="type" interface="action-sheet" placeholder="Sélectionnez">
            <ion-select-option value="nids_de_poule">Nids de poule</ion-select-option>
            <ion-select-option value="fissure">Fissure</ion-select-option>
            <ion-select-option value="affaissement">Affaissement</ion-select-option>
            <ion-select-option value="inondation">Inondation</ion-select-option>
            <ion-select-option value="obstacle">Obstacle sur la route</ion-select-option>
            <ion-select-option value="autre">Autre</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Description *</ion-label>
          <ion-textarea 
            v-model="description" 
            :rows="2" 
            placeholder="Décrivez le problème..."
            :auto-grow="true"
          />
        </ion-item>
        <div class="photo-section">
          <div class="photo-actions">
            <span class="photo-label">Photo (optionnelle)</span>
            <div class="photo-buttons">
              <ion-button fill="outline" size="small" @click="takePhoto">
                <ion-icon :icon="cameraIcon" slot="start" />
                Caméra
              </ion-button>
              <ion-button fill="outline" size="small" color="medium" @click="pickPhoto">
                <ion-icon :icon="imageIcon" slot="start" />
                Galerie
              </ion-button>
            </div>
          </div>
          <div v-if="preview" class="preview">
            <img :src="preview" alt="prévisualisation" />
            <ion-button fill="clear" size="small" color="danger" class="remove-photo" @click="photoBase64 = null">
              <ion-icon :icon="closeIcon" />
            </ion-button>
          </div>
        </div>
        <ion-button 
          expand="block" 
          class="submit-btn" 
          :disabled="saving"
          @click="submit"
        >
          <ion-spinner v-if="saving" name="crescent" class="ion-margin-end" />
          <span v-else>Enregistrer</span>
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonIcon
} from '@ionic/vue';
import { cameraOutline, imageOutline, closeCircleOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useSignalementStore } from '../stores/signalement.store';
import { useAuthStore } from '../stores/auth.store';
import type { TypeProbleme } from '../models/signalement.model';

const signalements = useSignalementStore();
const auth = useAuthStore();
const props = defineProps<{ latlng: { lat: number; lng: number } | null }>();

const emit = defineEmits(['submitted', 'cancel']);

const userId = computed(() => auth.user?.uid);
const type = ref('');
const description = ref('');
const photoBase64 = ref<string | null>(null);
const preview = computed(() => photoBase64.value ? `data:image/jpeg;base64,${photoBase64.value}` : null);
const saving = ref(false);
const cameraIcon = cameraOutline;
const imageIcon = imageOutline;
const closeIcon = closeCircleOutline;

const takePhoto = async () => {
  try {
    const result = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 50,
      width: 800
    });
    photoBase64.value = result.base64String ?? null;
  } catch {
    // Photo capture canceled
  }
};

const pickPhoto = async () => {
  try {
    const result = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
      quality: 50,
      width: 800
    });
    photoBase64.value = result.base64String ?? null;
  } catch {
    // Photo selection canceled
  }
};

const submit = async () => {
  if (!props.latlng) {
    return;
  }
  if (!type.value || !description.value.trim()) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }
  
  if (!userId.value) {
    alert('Vous devez être connecté pour signaler un problème!');
    return;
  }
  
  saving.value = true;
  
  // Timeout de sécurité: débloquer après 30 secondes
  const timeoutId = setTimeout(() => {
    saving.value = false;
  }, 30000);
  
  try {
    await signalements.addSignalement({
      latitude: props.latlng.lat,
      longitude: props.latlng.lng,
      type: type.value as TypeProbleme,
      description: description.value.trim(),
      photoBase64: photoBase64.value ?? undefined
    });
    
    clearTimeout(timeoutId);
    saving.value = false;
    emit('submitted');
  } catch (error: any) {
    clearTimeout(timeoutId);
    saving.value = false;
    
    const code = error?.code || '';
    const msg = error?.message || String(error);
    
    if (code === 'permission-denied' || code === 'PERMISSION_DENIED') {
      alert('❌ Permission refusée par Firestore.\n\nAllez dans la Console Firebase > Firestore > Rules et autorisez les écritures pour les utilisateurs authentifiés.');
    } else if (msg.includes('timeout') || msg.includes('Timeout')) {
      alert('⏱️ Timeout Firestore.\n\nCauses possibles :\n- Règles Firestore bloquent l\'écriture\n- Problème réseau\n\nVérifiez les Rules dans la Console Firebase.');
    } else {
      alert(`❌ Erreur: ${code || 'inconnue'}\n${msg}`);
    }
  }
};

</script>

<style scoped>
.form-content {
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}
.form-wrapper {
  padding: 12px 16px;
  padding-bottom: env(safe-area-inset-bottom, 12px);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  --background: transparent;
  margin: 0;
}
.photo-section {
  margin-top: 8px;
}
.photo-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
}
.photo-label {
  font-size: 14px;
  color: var(--ion-color-medium);
  font-weight: 500;
}
.photo-buttons {
  display: flex;
  gap: 4px;
}
.preview {
  margin-top: 8px;
  position: relative;
  text-align: center;
}
.preview img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.08);
}
.remove-photo {
  position: absolute;
  top: -4px;
  right: -4px;
  --padding-start: 4px;
  --padding-end: 4px;
  font-size: 22px;
}
.submit-btn {
  margin-top: 12px;
  --border-radius: 10px;
  font-weight: 600;
  height: 44px;
}
.submit-btn[disabled] {
  opacity: 0.6;
}
</style>




