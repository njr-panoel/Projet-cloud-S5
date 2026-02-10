<template>
  <div class="stats-dashboard page-container">
    <div class="stats-top" style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px">
      <div class="card-rounded" style="flex:1;min-width:260px;padding:12px">
        <div class="small">Répartition par statut</div>
        <div v-if="store.list.length" style="height:100%"><Pie :data="pieDataRaw" :options="pieOptions" /></div>
        <div v-else class="small">Pas encore de données</div>
      </div>
      <div class="card-rounded" style="flex:1;min-width:260px;padding:12px">
        <div class="small">Surface & Budget par statut</div>
        <div v-if="store.list.length" style="height:100%"><Bar :data="barDataRaw" :options="barOptions" /></div>
        <div v-else class="small">Pas encore de données</div>
      </div>
    </div>

    <div class="card-rounded" style="padding:12px">
      <div class="small">Top 5 rapports récents</div>
      <div v-if="recent.length === 0" class="small">Aucun signalement</div>
      <div v-else>
        <div v-for="s in recent" :key="s.id" class="list-card" style="margin-top:8px">
          <div style="flex:1">
            <div class="list-title">{{ s.description }}</div>
            <div class="list-meta">{{ s.statut }} • {{ new Date(s.createdAt).toLocaleString() }}</div>
          </div>
          <div style="min-width:80px;text-align:right">
            <div class="small">Surface: {{ s.surface_m2 ?? 'N/A' }} m²</div>
            <div class="small">Budget: {{ s.budget ?? 'N/A' }} Ar</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSignalementStore } from '../stores/signalement.store';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'vue-chartjs';

// register Chart.js components
Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const store = useSignalementStore();

const statusLabels = ['nouveau', 'en_cours', 'termine'];

const pieData = computed(() => {
  const counts = statusLabels.map(l => store.list.filter(s => s.statut === l).length);
  return {
    labels: statusLabels,
    datasets: [{ data: counts, backgroundColor: ['#ef4444', '#f59e0b', '#10b981'] }]
  };
});

const pieDataRaw = computed(() => {
  const d = pieData.value;
  return { labels: d?.labels ?? [], datasets: d?.datasets ?? [] };
});

const pieOptions = { responsive: true, maintainAspectRatio: false };

const barData = computed(() => {
  const surface = statusLabels.map(l => store.list.filter(s => s.statut === l).reduce((acc, s) => acc + (s.surface_m2 ?? 0), 0));
  const budget = statusLabels.map(l => store.list.filter(s => s.statut === l).reduce((acc, s) => acc + (s.budget ?? 0), 0));
  return {
    labels: statusLabels,
    datasets: [
      { label: 'Surface (m²)', data: surface, backgroundColor: 'rgba(30,58,138,0.8)' },
      { label: 'Budget (Ar)', data: budget, backgroundColor: 'rgba(14,165,164,0.8)' }
    ]
  };
});

const barDataRaw = computed(() => {
  const d = barData.value;
  return { labels: d?.labels ?? [], datasets: d?.datasets ?? [] };
});

const barOptions = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } };

const recent = computed(() => store.list.slice().sort((a,b) => b.createdAt - a.createdAt).slice(0,5));
</script>

<style scoped>
.stats-dashboard { display:block; }
.stats-top { min-height: 260px; }

/* Chart responsive heights */
.stats-top .card-rounded { height: 260px; display:flex; flex-direction:column; }
.stats-top canvas { flex:1; }

@media (max-width:600px) {
  .stats-top .card-rounded { height: 220px; }
  .stats-top { gap:8px; }
} </style>
