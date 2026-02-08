<template>
  <ion-header>
    <ion-toolbar color="primary">
      <ion-title>Nouveau signalement</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="$emit('cancel')">Fermer</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
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
        :rows="3" 
        placeholder="Décrivez le problème..."
      />
    </ion-item>
    <ion-item lines="none" class="ion-margin-top">
      <ion-label>Photo (optionnelle)</ion-label>
      <ion-button fill="outline" size="small" @click="takePhoto">Caméra</ion-button>
      <ion-button fill="clear" size="small" @click="pickPhoto">Galerie</ion-button>
    </ion-item>
    <div v-if="preview" class="preview">
      <img :src="preview" alt="prévisualisation" />
    </div>
    <ion-button 
      expand="block" 
      class="ion-margin-top" 
      :class="{ 'button-loading': saving }" 
      @click="submit"
    >
      <ion-spinner v-if="saving" name="crescent" class="ion-margin-end" />
      <span v-else>Enregistrer</span>
    </ion-button>
  </ion-content>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {

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
  IonSpinner
} from '@ionic/vue';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { useSignalementStore } from '../stores/signalement.store';
import { useAuthStore } from '../stores/auth.store';

const signalements = useSignalementStore();
const auth = useAuthStore();
const props = defineProps<{ latlng: { lat: number; lng: number } | null }>();

const emit = defineEmits(['submitted', 'cancel']);

const userId = computed(() => auth.user?.uid);
const type = ref('');
const description = ref('');
const photo = ref<Photo | null>(null);
const preview = computed(() => photo.value?.webPath ?? null);
const saving = ref(false);

const takePhoto = async () => {
  try {
    photo.value = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 70
    });
  } catch {
    // Photo capture canceled
  }
};

const pickPhoto = async () => {
  try {
    photo.value = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
      quality: 70
    });
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
      type: type.value,
      description: description.value.trim(),
      photo: photo.value
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
.preview {
  margin-top: 12px;
  text-align: center;
}
.preview img {
  max-width: 100%;
  border-radius: 8px;
}
ion-header ion-toolbar { background: var(--ion-color-primary); color: white; }
ion-content { --padding-start: 12px; --padding-end: 12px; }
ion-item { margin-top: 6px; }
ion-button { border-radius: 8px; }
.button-loading {
  opacity: 0.6;
  pointer-events: none;
}
</style>




