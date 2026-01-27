<template>
  <div class="map-wrapper">
    <l-map
      ref="mapRef"
      :zoom="zoom"
      :center="center"
      use-global-leaflet
      @ready="onReady"
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
            <div>Statut: {{ item.statut }}</div>
            <div>Surface: {{ item.surface_m2 ?? 'N/A' }} m²</div>
            <div>Budget: {{ item.budget ?? 'N/A' }} Ar</div>
            <div>Maj: {{ new Date(item.updatedAt).toLocaleString() }}</div>
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
import { ref, watch } from 'vue';
import { IonFab, IonFabButton, IonIcon } from '@ionic/vue';
import { locateOutline } from 'ionicons/icons';
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet';
import { icon, Map as LeafletMap } from 'leaflet';
import { Signalement } from '../models/signalement.model';

const props = defineProps<{ signalements: Signalement[]; loading: boolean; center?: [number, number] }>();
const emit = defineEmits(['long-press', 'my-location']);

const center = ref<[number, number]>(props.center ?? [-18.8792, 47.5079]);
const zoom = ref(13);
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution = '&copy; OpenStreetMap contributors';
const locIcon = locateOutline;
const mapRef = ref<InstanceType<typeof LMap> | null>(null);
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
  // vue-leaflet may pass different shapes: the map itself, or { map }, or an event with target
  console.debug('Map ready event', event);
  leafletMap = event?.map ?? event?.target ?? event ?? null;
  if (!leafletMap) {
    console.error('Leaflet map instance not found on ready event', event);
    return;
  }
  if (typeof leafletMap.on === 'function') {
    leafletMap.on('mousedown', onMouseDown);
    leafletMap.on('mouseup', clearPress);
    leafletMap.on('dragstart', clearPress);
  } else {
    console.warn('Leaflet map instance does not expose .on()', leafletMap);
  }
  if (props.center && typeof leafletMap.setView === 'function') {
    leafletMap.setView(props.center, zoom.value);
  }
};

const onMouseDown = (e: any) => {
  clearPress();
  pressTimeout = window.setTimeout(() => {
    emit('long-press', e.latlng);
  }, 600);
};

const clearPress = () => {
  if (pressTimeout) {
    window.clearTimeout(pressTimeout);
    pressTimeout = null;
  }
};

const iconByStatus = (statut: string) => {
  const color = statut === 'termine' ? 'green' : statut === 'en_cours' ? 'orange' : 'red';
  return icon({
    iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=pin|${color}`,
    iconSize: [30, 50],
    iconAnchor: [15, 45],
    popupAnchor: [0, -40]
  });
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
