<template>
  <div class="stats-grid">
    <ion-card>
      <ion-card-header>
        <ion-card-title>Nombre de points</ion-card-title>
      </ion-card-header>
      <ion-card-content>{{ total }}</ion-card-content>
    </ion-card>

    <ion-card>
      <ion-card-header>
        <ion-card-title>Surface totale (m²)</ion-card-title>
      </ion-card-header>
      <ion-card-content>{{ surfaceTotale }}</ion-card-content>
    </ion-card>

    <ion-card>
      <ion-card-header>
        <ion-card-title>Avancement %</ion-card-title>
      </ion-card-header>
      <ion-card-content>{{ avancement }}</ion-card-content>
    </ion-card>

    <ion-card>
      <ion-card-header>
        <ion-card-title>Budget total (Ar)</ion-card-title>
      </ion-card-header>
      <ion-card-content>{{ budgetTotal }}</ion-card-content>
    </ion-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import type { Signalement } from '../types';

const props = defineProps<{ items: Signalement[] }>();

const total = computed(() => props.items.length);
const surfaceTotale = computed(() => props.items.reduce((s, i) => s + (i.surface_m2 || 0), 0));
const budgetTotal = computed(() => props.items.reduce((s, i) => s + (i.budget || 0), 0));
const avancement = computed(() => {
  if (props.items.length === 0) return '0%';
  const done = props.items.filter(i => i.statut === 'termine').length;
  return Math.round((done / props.items.length) * 100) + '%';
});
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
</style>