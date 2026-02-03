<template>
  <ion-page>
    <ion-content>
      <div class="page-container">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <ion-segment v-model="segment" style="--background:transparent">
            <ion-segment-button value="all">Tous</ion-segment-button>
            <ion-segment-button value="mine">Mes signalements</ion-segment-button>
          </ion-segment>
          <div style="display:flex;gap:4px">
            <ion-button fill="clear" @click="openForm()" title="Nouveau signalement">
              <ion-icon :icon="addIcon"/>
            </ion-button>
            <ion-button fill="clear" @click="refresh"><ion-icon :icon="refreshIcon"/></ion-button>
          </div>
        </div>
        <div class="card-rounded map-full">
          <MapView
            :signalements="filtered"
            :loading="signalements.loading"
            :center="[signalements.center.lat, signalements.center.lng]"
            @long-press="openForm"
            @my-location="centerOnUser"
          />
        </div>
      </div>

      <ion-modal v-if="formOpen" :is-open="true" @did-dismiss="closeForm">
        <SignalementForm :latlng="selectedLatLng" @submitted="onSubmitted" @cancel="closeForm" />
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { IonPage, IonContent, IonModal, IonSegment, IonSegmentButton, IonButton, IonIcon } from '@ionic/vue';
import { refreshOutline, addCircleOutline } from 'ionicons/icons';
import MapView from '../components/MapView.vue';
import SignalementForm from '../components/SignalementForm.vue';
import { useSignalementStore } from '../stores/signalement.store';
import { useNetworkStore } from '../stores/network.store';
import { useAuthStore } from '../stores/auth.store';

const signalements = useSignalementStore();
const network = useNetworkStore();
const auth = useAuthStore();

const segment = ref<'all'|'mine'>('all');
const formOpen = ref(false);
const selectedLatLng = ref<{ lat: number; lng: number } | null>(null);
const refreshIcon = refreshOutline;
const addIcon = addCircleOutline;

const filtered = computed(() => {
  if (segment.value === 'mine') {
    return signalements.list.filter(s => s.userId === auth.user?.uid);
  }
  return signalements.list;
});

const refresh = async () => {
  await signalements.refresh();
};

const openForm = (latlng?: { lat: number; lng: number } | any) => {
  console.log('📝 Opening form with coords:', latlng);
  // Convertir l'objet LatLng de Leaflet en objet simple
  if (latlng && typeof latlng.lat === 'number' && typeof latlng.lng === 'number') {
    selectedLatLng.value = { lat: latlng.lat, lng: latlng.lng };
  } else {
    selectedLatLng.value = null;
  }
  // Utiliser nextTick pour s'assurer que Vue a fini de traiter
  setTimeout(() => {
    formOpen.value = true;
  }, 0);
};
const closeForm = () => { 
  console.log('✖️ Closing form');
  formOpen.value = false; 
};

const onSubmitted = async () => {
  formOpen.value = false;
};

const centerOnUser = async () => {
  await signalements.centerOnUser();
};

onMounted(async () => {
  await network.init();
  await signalements.init();
});
</script>
