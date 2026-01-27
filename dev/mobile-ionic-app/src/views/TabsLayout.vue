<template>
  <ion-page>
    <ion-content>
      <ion-tabs>
        <ion-router-outlet />
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="map" :href="'/tabs/map'">
            <ion-icon name="map" />
            <ion-label>Carte</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="stats" :href="'/tabs/stats'">
            <ion-icon name="stats-chart" />
            <ion-label>Stats</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="mes" :href="'/tabs/mes'">
            <ion-icon name="list" />
            <ion-label>Mes signaux</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="profile" :href="'/tabs/profile'">
            <ion-icon name="person" />
            <ion-label>Profil</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>

      <ion-toast :is-open="toastOpen" :message="network.statusText" duration="2500" />
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useNetworkStore } from '../stores/network';

const network = useNetworkStore();
const toastOpen = ref(false);

onMounted(async () => {
  await network.start();
});

watch(() => network.statusText, (t) => {
  if (t) {
    toastOpen.value = true;
    setTimeout(() => (toastOpen.value = false), 2400);
  }
});
</script>

<style scoped>
</style>