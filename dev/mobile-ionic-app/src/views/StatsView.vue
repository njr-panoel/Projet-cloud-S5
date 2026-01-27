<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Statistiques</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <StatsCards :items="store.items" />
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import StatsCards from '../components/StatsCards.vue';
import { useSignalementStore } from '../stores/signalement';
const store = useSignalementStore();
store.initRealtime();
</script>

<style scoped>
</style>