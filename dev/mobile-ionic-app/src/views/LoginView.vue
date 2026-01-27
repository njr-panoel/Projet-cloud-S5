<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Connexion</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div style="color: green; margin-bottom: 8px; font-weight: bold;">Login view visible</div>
      <ion-card>
        <ion-card-content>
          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input v-model="email" type="email" />
          </ion-item>

          <ion-item>
            <ion-label position="floating">Mot de passe</ion-label>
            <ion-input v-model="password" type="password" />
          </ion-item>

          <ion-button expand="block" @click="login" :disabled="loading">Se connecter</ion-button>
          <ion-loading :is-open="loading" message="Connexion..." />
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { signIn } from '../services/firebase';
import { useRouter } from 'vue-router';
import { toastController } from '@ionic/vue';

const email = ref('');
const password = ref('');
const loading = ref(false);
const router = useRouter();

onMounted(() => {
  console.log('LoginView: Mounted');
  const dbg = (window as any).debugLog;
  if (dbg) dbg('LoginView mounted');
});

const showToast = async (msg: string) => {
  const t = await toastController.create({ message: msg, duration: 3000 });
  await t.present();
};

const login = async () => {
  try {
    console.log('LoginView: Login attempt with', email.value);
    loading.value = true;
    await signIn(email.value, password.value);
    console.log('LoginView: Sign in successful, redirecting to /tabs/map');
    await router.replace('/tabs/map');
  } catch (e: any) {
    console.error('LoginView: Login error', e);
    await showToast(e.message || 'Erreur connexion');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
ion-card { margin-top: 2rem; }
</style>