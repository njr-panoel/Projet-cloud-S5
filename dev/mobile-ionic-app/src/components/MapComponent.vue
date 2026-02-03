<template>
  <div class="map-wrap" ref="mapEl" />
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue';
import L from 'leaflet';
import { useSignalementStore } from '../stores/signalement';
import { getCurrentPosition } from '../services/geolocation';

const mapEl = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;
let markersLayer: L.LayerGroup | null = null;

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const store = useSignalementStore();

const emit = (getCurrentInstance() as any).emit;

store.initRealtime();

const createMap = async () => {
  console.log('MapComponent: createMap starting, mapEl available:', !!mapEl.value);
  if (!mapEl.value) {
    console.error('MapComponent: mapEl ref is null!');
    return;
  }
  map = L.map(mapEl.value).setView([-18.8792, 47.5079], 13);
  L.tileLayer(tileUrl).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
  console.log('MapComponent: Leaflet map created');

  // center on user if available
  try {
    const pos = await getCurrentPosition();
    console.log('MapComponent: User position acquired:', pos.coords.latitude, pos.coords.longitude);
    map.setView([pos.coords.latitude, pos.coords.longitude], 14);
  } catch (e) { 
    console.warn('MapComponent: Geolocation failed', e);
  }

  // click/long-press handling
  let touchTimer: any = null;
  const LONG_PRESS_MS = 600;

  const onDown = (e: any) => {
    touchTimer = setTimeout(() => {
      const latlng = map!.mouseEventToLatLng(e.originalEvent);
      console.log('MapComponent: Long press at', latlng);
      emit('long-press', { latitude: latlng.lat, longitude: latlng.lng });
    }, LONG_PRESS_MS);
  };
  const onUp = () => { if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; } };

  map.on('mousedown', onDown);
  map.on('mouseup', onUp);
  map.on('touchstart', onDown);
  map.on('touchend', onUp);
  map.on('contextmenu', (e: any) => emit('long-press', { latitude: e.latlng.lat, longitude: e.latlng.lng }));

  // update markers initially and on store change
  updateMarkers();
  console.log('MapComponent: Map initialized, store items:', store.items.length);
};

const updateMarkers = () => {
  if (!markersLayer || !map) return;
  markersLayer.clearLayers();
  for (const s of store.items) {
    const m = L.marker([s.latitude, s.longitude]);
    m.bindPopup(`<b>${s.description || ''}</b><br/>Statut: ${s.statut || ''}`);
    markersLayer.addLayer(m);
  }
};

onMounted(() => {
  console.log('MapComponent: Mounted, calling createMap');
  createMap().catch(err => console.error('MapComponent: createMap error', err));
  store.$subscribe(() => {
    console.log('MapComponent: Store changed, updating markers');
    updateMarkers();
  });
});
onBeforeUnmount(() => { 
  console.log('MapComponent: Before unmount');
  if (map) map.remove(); 
});

defineExpose({ getCenter: () => map ? map.getCenter() : { lat: -18.8792, lng: 47.5079 } });
</script>

<style scoped>
.map-wrap { height: 100vh; width: 100%; }
</style>