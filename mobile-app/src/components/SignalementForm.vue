<template>
  <ion-header>
    <ion-toolbar color="primary">
      <ion-title>Nouveau signalement</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="$emit('cancel')">Fermer</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-item>
      <ion-label position="stacked">Type de problème *</ion-label>
      <ion-select v-model="type" interface="action-sheet" placeholder="Sélectionnez">
        <ion-select-option value="nids_de_poule">Nids de poule</ion-select-option>
        <ion-select-option value="fissure">Fissure</ion-select-option>
        <ion-select-option value="affaissement">Affaissement</ion-select-option>
        <ion-select-option value="inondation">Inondation</ion-select-option>
        <ion-select-option value="obstacle">Obstacle sur la route</ion-select-option>
        <ion-select-option value="autre">Autre</ion-select-option>
      </ion-select>
    </ion-item>
    <ion-item>
      <ion-label position="stacked">Description *</ion-label>
      <ion-textarea 
        v-model="description" 
        :rows="3" 
        placeholder="Décrivez le problème..."
      />
    </ion-item>
    <ion-item lines="none" class="ion-margin-top">
      <ion-label>Photo (optionnelle)</ion-label>
      <ion-button fill="outline" size="small" @click="takePhoto">Caméra</ion-button>
      <ion-button fill="clear" size="small" @click="pickPhoto">Galerie</ion-button>
    </ion-item>
    <div v-if="preview" class="preview">
      <img :src="preview" alt="prévisualisation" />
    </div>
    <ion-button 
      expand="block" 
      class="ion-margin-top" 
      :class="{ 'button-loading': saving }" 
      @click="submit"
    >
      <ion-spinner v-if="saving" name="crescent" class="ion-margin-end" />
      <span v-else>Enregistrer</span>
    </ion-button>
    
    <!-- Bouton test temporaire -->
    <ion-button expand="block" color="warning" class="ion-margin-top" @click="testFirestore">
      🧪 Test Firestore Direct
    </ion-button>
  </ion-content>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import {

  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonSpinner
} from '@ionic/vue';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { useSignalementStore } from '../stores/signalement.store';
import { useAuthStore } from '../stores/auth.store';
import { db } from '../environments/firebase';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';

const signalements = useSignalementStore();
const auth = useAuthStore();
const props = defineProps<{ latlng: { lat: number; lng: number } | null }>();

const emit = defineEmits(['submitted', 'cancel']);

const userId = computed(() => auth.user?.uid);
const type = ref('');
const description = ref('');
const photo = ref<Photo | null>(null);
const preview = computed(() => photo.value?.webPath ?? null);
const saving = ref(false);

const takePhoto = async () => {
  try {
    photo.value = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 70
    });
  } catch (error) {
    console.log('📸 Caméra annulée');
  }
};

const pickPhoto = async () => {
  try {
    photo.value = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
      quality: 70
    });
  } catch (error) {
    console.log('🖼️ Sélection photo annulée');
  }
};

// Test direct Firestore
const testFirestore = async () => {
  console.log('🧪 Test Firestore démarré...');
  console.log('🔗 DB instance:', db);
  
  try {
    // Test 1: Lecture
    console.log('📖 Test lecture...');
    const snap = await getDocs(collection(db, 'signalements'));
    console.log('✅ Lecture OK, documents:', snap.size);
    
    // Test 2: Écriture avec timeout
    console.log('✏️ Test écriture avec setDoc...');
    const testDoc = { test: true, timestamp: Date.now() };
    const docId = 'test_' + Date.now();
    
    const writePromise = setDoc(doc(db, 'test', docId), testDoc);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('TIMEOUT 10s')), 10000)
    );
    
    console.log('⏳ Attente réponse setDoc... docId:', docId);
    await Promise.race([writePromise, timeoutPromise]);
    console.log('✅ Écriture OK! ID:', docId);
    
    alert('✅ Firestore fonctionne! Vérifiez la console.');
  } catch (error: any) {
    console.error('❌ Test échoué:', error);
    console.error('Code:', error?.code);
    console.error('Message:', error?.message);
    alert('❌ Erreur: ' + (error?.message || error));
  }
};

const submit = async () => {
  if (!props.latlng) {
    console.warn('⚠️ Pas de coordonnées');
    return;
  }
  if (!type.value || !description.value.trim()) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }
  
  console.log('📝 Submission démarrée...');
  console.log('🔐 Utilisateur authentifié:', userId.value);
  if (!userId.value) {
    alert('Vous devez être connecté pour signaler un problème!');
    return;
  }
  
  saving.value = true;
  
  // Timeout de sécurité: débloquer après 30 secondes
  const timeoutId = setTimeout(() => {
    console.error('⏱️ Timeout: déblocage du formulaire après 30s');
    saving.value = false;
  }, 30000);
  
  try {
    console.log('📤 Envoi du signalement...');
    await signalements.addSignalement({
      latitude: props.latlng.lat,
      longitude: props.latlng.lng,
      type: type.value,
      description: description.value.trim(),
      photo: photo.value
    });
    
    console.log('✅ Signalement envoyé!');
    clearTimeout(timeoutId);
    saving.value = false;
    emit('submitted');
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error);
    clearTimeout(timeoutId);
    saving.value = false;
    alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
  }
};

</script>

<style scoped>
.preview {
  margin-top: 12px;
  text-align: center;
}
.preview img {
  max-width: 100%;
  border-radius: 8px;
}
ion-header ion-toolbar { background: var(--ion-color-primary); color: white; }
ion-content { --padding-start: 12px; --padding-end: 12px; }
ion-item { margin-top: 6px; }
ion-button { border-radius: 8px; }
.button-loading {
  opacity: 0.6;
  pointer-events: none;
}
</style>




