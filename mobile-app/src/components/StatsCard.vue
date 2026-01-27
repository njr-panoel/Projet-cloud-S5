<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Statistiques globales</ion-card-title>
      <ion-card-subtitle>Antananarivo</ion-card-subtitle>
    </ion-card-header>
    <ion-card-content>
      <ion-grid>
        <ion-row>
          <ion-col size="6">
            <ion-chip color="primary">Total: {{ stats.total }}</ion-chip>
          </ion-col>
          <ion-col size="6">
            <ion-chip color="success">Surface: {{ stats.surfaceTotal }} m²</ion-chip>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="6">
            <ion-chip color="tertiary">Budget: {{ stats.budgetTotal }} Ar</ion-chip>
          </ion-col>
          <ion-col size="6">
            <ion-chip color="medium">Complétion: {{ stats.completion }}%</ion-chip>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonGrid, IonRow, IonCol, IonChip } from '@ionic/vue';
import { Stats } from '../models/stats.model';

defineProps<{ stats: Stats; loading: boolean }>();
</script>
