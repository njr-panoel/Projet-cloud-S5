<template>
  <ion-page>
    <ion-content class="ion-padding auth-bg">
      <div class="login-wrapper">
        <div class="logo">Cloud S5</div>
        <ion-card class="card-rounded login-card">
          <ion-card-header>
            <ion-card-title>Connexion</ion-card-title>
            <ion-card-subtitle>Accès réservé aux utilisateurs enregistrés</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-input v-model="email" type="email" label="Email" label-placement="floating" required />
            </ion-item>
            <ion-item>
              <ion-input v-model="password" type="password" label="Mot de passe" label-placement="floating" required />
            </ion-item>
            <ion-button expand="block" class="ion-margin-top" :disabled="loading" @click="login">
              <ion-spinner v-if="loading" name="crescent" class="ion-margin-end" />
              <span v-else>Se connecter</span>
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useIonRouter, IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonInput, IonButton, IonSpinner } from '@ionic/vue';
import { useAuthStore } from '../stores/auth.store';

const router = useIonRouter();
const auth = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);

const login = async () => {
  if (!email.value || !password.value) return;
  loading.value = true;
  const ok = await auth.login(email.value, password.value);
  loading.value = false;
  if (ok) {
    router.push('/map');
  }
};
</script>

<style scoped>
.auth-bg {
  --background: linear-gradient(180deg, rgba(30,58,138,0.08) 0%, rgba(248,250,252,1) 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.login-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 20px;
}
.logo {
  text-align: center;
  color: var(--ion-color-primary);
  font-weight: 800;
  font-size: 30px;
  margin: 0;
}
.login-card { width: 100%; max-width: 420px; }
</style>
