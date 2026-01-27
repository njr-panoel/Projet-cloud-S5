<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Profil</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div>
        <p>Email: {{ user?.email }}</p>
        <ion-button color="danger" @click="logout">Se déconnecter</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { getAuth } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { signOut } from '../services/firebase';

const auth = getAuth();
const user = auth.currentUser;
const router = useRouter();

const logout = async () => {
  await signOut();
  router.replace('/login');
};
</script>

<style scoped>
</style>