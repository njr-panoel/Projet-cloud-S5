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
      <ion-label position="stacked">Description</ion-label>
      <ion-textarea v-model="description" rows="3" />
    </ion-item>
    <ion-item>
      <ion-label position="stacked">Statut</ion-label>
      <ion-select v-model="statut" interface="popover">
        <ion-select-option value="nouveau">Nouveau</ion-select-option>
        <ion-select-option value="en_cours">En cours</ion-select-option>
        <ion-select-option value="termine">Terminé</ion-select-option>
      </ion-select>
    </ion-item>
    <ion-item>
      <ion-label position="stacked">Surface (m²)</ion-label>
      <ion-input v-model.number="surface" type="number" />
    </ion-item>
    <ion-item>
      <ion-label position="stacked">Budget (Ar)</ion-label>
      <ion-input v-model.number="budget" type="number" />
    </ion-item>
    <ion-item>
      <ion-label position="stacked">Entreprise</ion-label>
      <ion-input v-model="entreprise" />
    </ion-item>
    <ion-item lines="none" class="ion-margin-top">
      <ion-label>Photo</ion-label>
      <ion-button fill="outline" @click="takePhoto">Caméra</ion-button>
      <ion-button fill="clear" @click="pickPhoto">Galerie</ion-button>
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
  IonInput,
  IonSpinner
} from '@ionic/vue';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { useSignalementStore } from '../stores/signalement.store';

const signalements = useSignalementStore();
const props = defineProps<{ latlng: { lat: number; lng: number } | null }>();

const emit = defineEmits(['submitted', 'cancel']);

const description = ref('');
const statut = ref<'nouveau' | 'en_cours' | 'termine'>('nouveau');
const surface = ref<number | null>(null);
const budget = ref<number | null>(null);
const entreprise = ref<string | null>(null);
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
  saving.value = true;
  await signalements.addSignalement({
    latitude: props.latlng.lat,
    longitude: props.latlng.lng,
    description: description.value,
    statut: statut.value,
    surface_m2: surface.value,
    budget: budget.value,
    entreprise: entreprise.value,
    photo
  });
  saving.value = false;
  emit('submitted');
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
