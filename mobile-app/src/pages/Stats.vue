<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="page-container">
        <StatsDashboard />
        <div style="height:12px"></div>
        <div class="stats-grid">
          <div class="stats-card card-rounded">
            <div class="small">Total signalements</div>
            <div class="stats-value">{{ signalements.stats.total }}</div>
          </div>
          <div class="stats-card card-rounded">
            <div class="small">Surface totale (m²)</div>
            <div class="stats-value">{{ signalements.stats.surfaceTotal }}</div>
          </div>
          <div class="stats-card card-rounded">
            <div class="small">Budget total (Ar)</div>
            <div class="stats-value">{{ signalements.stats.budgetTotal }}</div>
          </div>
          <div class="stats-card card-rounded">
            <div class="small">Complétion</div>
            <div class="stats-value">{{ signalements.stats.completion }}%</div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonBadge } from '@ionic/vue';
import StatsCard from '../components/StatsCard.vue';
import StatsDashboard from '../components/StatsDashboard.vue';
import { useSignalementStore } from '../stores/signalement.store';
import { onMounted } from 'vue';

const signalements = useSignalementStore();

onMounted(async () => {
  await signalements.init();
});
</script>
