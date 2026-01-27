<template>
  <ion-page>
    <ion-header class="page-header">
      <ion-toolbar>
        <ion-title>Cloud S5 - Antananarivo</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refresh" title="Rafraîchir">
            <ion-icon :icon="refreshIcon" />
          </ion-button>
          <ion-button @click="logout" title="Déconnexion">
            <ion-icon :icon="logoutIcon" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-router-outlet />
    </ion-content>
    <ion-tab-bar slot="bottom" color="light">
      <ion-tab-button tab="map" href="/map">
        <ion-icon :icon="mapIcon" />
        <ion-label>Carte</ion-label>
      </ion-tab-button>
      <ion-tab-button tab="stats" href="/stats">
        <ion-icon :icon="statsIcon" />
        <ion-label>Statistiques</ion-label>
      </ion-tab-button>
      <ion-tab-button tab="mes-signaux" href="/mes-signaux">
        <ion-icon :icon="listIcon" />
        <ion-label>Mes Signal.</ion-label>
      </ion-tab-button>
      <ion-tab-button tab="profil" href="/profil">
        <ion-icon :icon="personIcon" />
        <ion-label>Profil</ion-label>
      </ion-tab-button>
    </ion-tab-bar>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonTabBar, IonTabButton, IonLabel, IonRouterOutlet } from '@ionic/vue';
import { logOutOutline, refreshOutline, mapOutline, statsChartOutline, listOutline, personCircleOutline } from 'ionicons/icons';
import { useAuthStore } from '../stores/auth.store';
import { useSignalementStore } from '../stores/signalement.store';

const auth = useAuthStore();
const signalements = useSignalementStore();

const refreshIcon = refreshOutline;
const logoutIcon = logOutOutline;
const mapIcon = mapOutline;
const statsIcon = statsChartOutline;
const listIcon = listOutline;
const personIcon = personCircleOutline;

const refresh = async () => {
  await signalements.refresh();
};

const logout = async () => {
  await auth.logout();
};
</script>
