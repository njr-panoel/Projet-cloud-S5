<template>
  <ion-modal :is-open="isOpen" @didDismiss="close">
    <ion-header>
      <ion-toolbar>
        <ion-title>Nouveau signalement</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="close">Fermer</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-label>Latitude</ion-label>
        <ion-input v-model.number="form.latitude" readonly></ion-input>
      </ion-item>
      <ion-item>
        <ion-label>Longitude</ion-label>
        <ion-input v-model.number="form.longitude" readonly></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Description</ion-label>
        <ion-textarea v-model="form.description" rows="6" />
      </ion-item>

      <div class="ion-padding">
        <ion-button expand="block" @click="takePhoto">Ajouter une photo</ion-button>
        <img v-if="preview" :src="preview" style="width:100%;margin-top:8px;border-radius:8px;" />
      </div>

      <ion-button expand="block" @click="submit" :disabled="loading">Envoyer</ion-button>
      <ion-loading :is-open="loading" message="Envoi..." />
    </ion-content>
  </ion-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const isOpen = ref(false);
const loading = ref(false);
const preview = ref<string | null>(null);

const form = ref({ latitude: 0, longitude: 0, description: '' });

const open = (coords: any) => {
  form.value.latitude = coords.latitude;
  form.value.longitude = coords.longitude;
  preview.value = null;
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
};

const takePhoto = async () => {
  const photo = await Camera.getPhoto({ resultType: CameraResultType.DataUrl, source: CameraSource.Prompt, quality: 60 });
  preview.value = photo.dataUrl;
};

const submit = async () => {
  loading.value = true;
  try {
    // emit event to parent with form data and photoBase64
    const payload = { signalement: { ...form.value }, photoBase64: preview.value };
    close();
    (emit as any)('submitted', payload);
  } catch (e: any) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

// expose open to parent
defineExpose({ open });

// local emit helper
import { getCurrentInstance } from 'vue';
const emit = getCurrentInstance()!.emit;
</script>

<style scoped>
img { max-height: 240px; object-fit:cover; }
</style>