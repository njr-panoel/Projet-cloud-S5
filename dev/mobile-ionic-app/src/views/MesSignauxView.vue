<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Mes signalements</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleFilter" fill="clear">{{ store.showOnlyMine ? 'Tous' : 'Mes' }}</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item v-for="s in store.filtered()" :key="s.id">
          <ion-label>
            <h2>{{ s.description }}</h2>
            <p>{{ s.statut }} • {{ formatDate(s.createdAt) }}</p>
          </ion-label>
          <ion-badge :color="badgeColor(s.statut)">{{ s.statut }}</ion-badge>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { useSignalementStore } from '../stores/signalement';

const store = useSignalementStore();
store.initRealtime();

const toggleFilter = () => (store.showOnlyMine = !store.showOnlyMine);
const formatDate = (t: any) => {
  if (!t?.toDate) return '—';
  const d = t.toDate();
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
};
const badgeColor = (stat: string) => (stat === 'nouveau' ? 'danger' : stat === 'en_cours' ? 'warning' : 'success');
</script>

<style scoped>
</style>