<template>
  <div class="map-wrapper">
    <l-map
      :zoom="zoom"
      :center="center"
      @ready="onReady"
      @click="onMapClick"
    >
      <l-tile-layer :url="tileUrl" :attribution="attribution" />
      <l-marker
        v-for="item in signalements"
        :key="item.id"
        :lat-lng="[item.latitude, item.longitude]"
        :icon="iconByStatus(item.statut)"
      >
        <l-popup>
          <div>
            <strong>{{ item.description }}</strong>
            <div v-if="item.type">Type: {{ getTypeLabel(item.type) }}</div>
            <div>Statut: {{ item.statut }}</div>
            <div v-if="item.surface_m2">Surface: {{ item.surface_m2 }} m²</div>
            <div v-if="item.budget">Budget: {{ item.budget }} Ar</div>
            <div>Créé: {{ new Date(item.createdAt).toLocaleDateString() }}</div>
          </div>
        </l-popup>
      </l-marker>
    </l-map>
    <ion-fab slot="fixed" vertical="bottom" horizontal="end">
      <ion-fab-button color="primary" @click="$emit('my-location')">
        <ion-icon :icon="locIcon" />
      </ion-fab-button>
    </ion-fab>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { IonFab, IonFabButton, IonIcon } from '@ionic/vue';
import { locateOutline } from 'ionicons/icons';
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet';
import { icon, Map as LeafletMap } from 'leaflet';
import { Signalement, TYPE_PROBLEME_LABELS } from '../models/signalement.model';

const props = defineProps<{ signalements: Signalement[]; loading: boolean; center?: [number, number] }>();
const emit = defineEmits(['long-press', 'my-location']);

const center = ref<[number, number]>(props.center ?? [-18.8792, 47.5079]);
const zoom = ref(13);
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution = '&copy; OpenStreetMap contributors';
const locIcon = locateOutline;
let leafletMap: LeafletMap | null = null;
let pressTimeout: number | null = null;

watch(
  () => props.center,
  (val) => {
    if (val && leafletMap) {
      leafletMap.setView(val, zoom.value);
      center.value = val;
    }
  }
);

const onReady = (event: any) => {
  console.log('🗺️ Map ready event', event);
  leafletMap = event?.map ?? event?.target ?? event ?? null;
  if (!leafletMap) {
    console.error('❌ Leaflet map instance not found on ready event', event);
    return;
  }
  console.log('✅ Leaflet map instance ready');
  
  if (typeof leafletMap.on === 'function') {
    // Clic droit = ouverture formulaire
    leafletMap.on('contextmenu', onContextMenu);
    console.log('✅ Event contextmenu registered');
    
    // Appui long pour mobile
    leafletMap.on('mousedown', onPressStart);
    leafletMap.on('touchstart', onPressStart);
    leafletMap.on('mouseup', clearPress);
    leafletMap.on('touchend', clearPress);
    leafletMap.on('dragstart', clearPress);
    leafletMap.on('mousemove', clearPress);
    leafletMap.on('touchmove', clearPress);
    console.log('✅ Touch events registered');
  } else {
    console.warn('⚠️ Leaflet map instance does not expose .on()', leafletMap);
  }
  if (props.center && typeof leafletMap.setView === 'function') {
    leafletMap.setView(props.center, zoom.value);
  }
};

const onMapClick = (e: any) => {
  console.log('🖱️ Map clicked', e);
};

const onContextMenu = (e: any) => {
  console.log('📍 Context menu triggered', e.latlng);
  e.originalEvent?.preventDefault();
  emit('long-press', e.latlng);
};

const onPressStart = (e: any) => {
  console.log('👇 Press started', e.latlng);
  clearPress();
  pressTimeout = window.setTimeout(() => {
    console.log('⏱️ Long press detected!', e.latlng);
    emit('long-press', e.latlng);
  }, 800);
};

const clearPress = () => {
  if (pressTimeout) {
    console.log('❌ Press cancelled');
    window.clearTimeout(pressTimeout);
    pressTimeout = null;
  }
};

onUnmounted(() => {
  if (leafletMap && typeof leafletMap.off === 'function') {
    leafletMap.off('contextmenu', onContextMenu);
    leafletMap.off('mousedown', onPressStart);
    leafletMap.off('touchstart', onPressStart);
    leafletMap.off('mouseup', clearPress);
    leafletMap.off('touchend', clearPress);
    leafletMap.off('dragstart', clearPress);
    leafletMap.off('mousemove', clearPress);
    leafletMap.off('touchmove', clearPress);
  }
  leafletMap = null;
});

const iconByStatus = (statut: string) => {
  const color = statut === 'termine' ? 'green' : statut === 'en_cours' ? 'orange' : 'red';
  return icon({
    iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=pin|${color}`,
    iconSize: [30, 50],
    iconAnchor: [15, 45],
    popupAnchor: [0, -40]
  });
};

const getTypeLabel = (type: string) => {
  return TYPE_PROBLEME_LABELS[type as keyof typeof TYPE_PROBLEME_LABELS] || type;
};
</script>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: block;
}
.l-map {
  height: 100%;
  width: 100%;
  min-height: calc(60vh);
}
.leaflet-container { border-radius: 6px; }
.leaflet-popup-content { font-size: 14px; }
ion-fab { box-shadow: 0 6px 14px rgba(0,0,0,0.16); }

/* Ensure map occupies available area on small devices */
@media (max-width: 600px) {
  .l-map { min-height: calc(70vh); }
  .leaflet-control-zoom { transform: scale(1.0); }
} 
</style>
