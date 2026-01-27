<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="page-container">
        <div class="card-rounded" style="padding:16px;display:flex;gap:16px;align-items:center">
          <div>
            <div class="avatar">{{ auth.user?.email?.charAt(0)?.toUpperCase() ?? 'U' }}</div>
          </div>
          <div style="flex:1">
            <div style="font-weight:700">Compte</div>
            <div class="small">{{ auth.user?.email }}</div>
          </div>
          <div>
            <ion-button expand="block" color="danger" @click="logout">Se déconnecter</ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton } from '@ionic/vue';
import { useAuthStore } from '../stores/auth.store';

const auth = useAuthStore();

const logout = async () => {
  await auth.logout();
};
</script>
