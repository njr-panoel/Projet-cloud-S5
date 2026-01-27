<template>
  <ion-page>
    <ion-content>
      <div class="page-container">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <ion-segment v-model="segment" style="--background:transparent">
            <ion-segment-button value="all">Tous</ion-segment-button>
            <ion-segment-button value="mine">Mes signalements</ion-segment-button>
          </ion-segment>
          <ion-button fill="clear" @click="refresh"><ion-icon :icon="refreshIcon"/></ion-button>
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

      <ion-modal :is-open="formOpen" @did-dismiss="closeForm">
        <SignalementForm :latlng="selectedLatLng" @submitted="onSubmitted" @cancel="closeForm" />
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { IonPage, IonContent, IonModal } from '@ionic/vue';
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

const filtered = computed(() => {
  if (segment.value === 'mine') {
    return signalements.list.filter(s => s.userId === auth.user?.uid);
  }
  return signalements.list;
});

const refresh = async () => {
  await signalements.refresh();
};

const openForm = (latlng?: { lat: number; lng: number }) => {
  selectedLatLng.value = latlng ?? null;
  formOpen.value = true;
};
const closeForm = () => { formOpen.value = false; };

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
