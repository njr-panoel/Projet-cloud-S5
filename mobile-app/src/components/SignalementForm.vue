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
    <ion-button expand="block" class="ion-margin-top" :disabled="saving" @click="submit">
      <ion-spinner v-if="saving" name="crescent" class="ion-margin-end" />
      <span v-else>Enregistrer</span>
    </ion-button>
  </ion-content>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
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
  IonInput,
  IonSpinner
} from '@ionic/vue';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { useSignalementStore } from '../stores/signalement.store';

const signalements = useSignalementStore();
const props = defineProps<{ latlng: { lat: number; lng: number } | null }>();

const emit = defineEmits(['submitted', 'cancel']);

const type = ref<'nids_de_poule' | 'fissure' | 'affaissement' | 'inondation' | 'obstacle' | 'autre'>('nids_de_poule');
const description = ref('');
const photo = ref<Photo | null>(null);
const preview = computed(() => photo.value?.webPath ?? null);
const saving = ref(false);

const takePhoto = async () => {
  photo.value = await Camera.getPhoto({
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    quality: 70
  });
};

const pickPhoto = async () => {
  photo.value = await Camera.getPhoto({
    resultType: CameraResultType.Uri,
    source: CameraSource.Photos,
    quality: 70
  });
};

const submit = async () => {
  if (!props.latlng) return;
  if (!type.value || !description.value.trim()) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }
  
  await nextTick();
  saving.value = true;
  
  try {
    await signalements.addSignalement({
      latitude: props.latlng.lat,
      longitude: props.latlng.lng,
      type: type.value,
      description: description.value.trim(),
      photo: photo.value
    });
    
    await nextTick();
    saving.value = false;
    emit('submitted');
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error);
    await nextTick();
    saving.value = false;
    alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
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
</style>




