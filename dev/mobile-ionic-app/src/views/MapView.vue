<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Carte - Antananarivo</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="goToMes" fill="clear">Mes signaux</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <MapComponent ref="mapRef" @long-press="openFormWithCoords" />

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="onFabClick">
          <ion-icon name="add" />
        </ion-fab-button>
      </ion-fab>

      <SignalementFormModal ref="modalRef" @submitted="onSubmitted" />

      <ion-toast :is-open="toastOpen" :message="toastMsg" duration="3000"></ion-toast>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import MapComponent from '../components/MapComponent.vue';
import SignalementFormModal from './SignalementFormModal.vue';
import { useRouter } from 'vue-router';
import { useSignalementStore } from '../stores/signalement';

const mapRef = ref();
const modalRef = ref();
const router = useRouter();
const store = useSignalementStore();

store.initRealtime();

const toastOpen = ref(false);
const toastMsg = ref('');

const showToast = (msg: string) => {
  toastMsg.value = msg;
  toastOpen.value = true;
  setTimeout(() => (toastOpen.value = false), 3000);
};

const onFabClick = async () => {
  const pos = await mapRef.value.getCenter();
  modalRef.value.open({ latitude: pos.lat, longitude: pos.lng });
};

const openFormWithCoords = (coords: any) => {
  modalRef.value.open(coords);
};

const onSubmitted = async (payload: any) => {
  try {
    await store.addSignalement(payload.signalement, payload.photoBase64 || null);
    showToast(payload.queued ? 'Signalement en file (hors-ligne)' : 'Signalement envoyé');
    // notify map to refresh/listen will auto-refresh via Firestore listener
  } catch (e: any) {
    showToast('Erreur: ' + e.message);
  }
};

const goToMes = () => router.push('/mes');
</script>

<style scoped>
ion-fab { z-index: 999; }
</style>