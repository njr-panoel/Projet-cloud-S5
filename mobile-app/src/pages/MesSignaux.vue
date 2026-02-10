<template>
  <ion-page>
    <ion-content>
      <div class="page-container">
        <h2 class="small">Mes signalements</h2>
        <div>
          <div v-for="item in mine" :key="item.id" class="card-rounded list-card" style="margin-bottom:12px">
            <img v-if="item.photoBase64" :src="'data:image/jpeg;base64,' + item.photoBase64" alt="photo" class="list-thumbnail" />
            <img v-else-if="item.photoUrl" :src="item.photoUrl" alt="photo" class="list-thumbnail" />
            <div style="flex:1;min-width:0">
              <div class="list-title" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ item.description }}</div>
              <div class="list-meta">Statut: {{ item.statut }} • {{ new Date(item.createdAt).toLocaleString() }}</div>
            </div>
            <ion-badge :color="statusColor(item.statut)">{{ item.statut }}</ion-badge>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { IonPage, IonContent, IonSegment, IonSegmentButton, IonLabel, IonList, IonItem, IonBadge } from '@ionic/vue';
import { useSignalementStore } from '../stores/signalement.store';
import { useAuthStore } from '../stores/auth.store';

const signalements = useSignalementStore();
const auth = useAuthStore();

const mine = computed(() => signalements.list.filter(s => s.userId === auth.user?.uid));

const statusColor = (s: string) => {
  if (s === 'termine') return 'success';
  if (s === 'en_cours') return 'warning';
  return 'danger';
};

onMounted(async () => {
  await signalements.init();
});
</script>
