import { inject, Injectable } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';

import { SignalementsService } from './signalements.service';
import { LeafletService } from './leaflet.service';
import { SignalementDto } from '../../models/signalement.models';

export type StatutFiltre = 'TOUS' | 'NOUVEAU' | 'EN_COURS' | 'TERMINE';

@Injectable({ providedIn: 'root' })
export class MapService {
  private readonly leafletService = inject(LeafletService);
  private readonly signalementsService = inject(SignalementsService);

  private L: typeof import('leaflet') | null = null;

  private map: (import('leaflet').Map) | null = null;
  private markersLayer: (import('leaflet').LayerGroup) | null = null;
  private legendControl: (import('leaflet').Control) | null = null;

  private allSignalements: SignalementDto[] = [];
  private filtre: StatutFiltre = 'TOUS';

  async initMap(container: HTMLElement) {
    const L = await this.leafletService.load();
    this.L = L;

    this.map?.remove();

    this.map = L.map(container, {
      center: [-18.8792, 47.5079],
      zoom: 12,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);

    L.control.scale({ imperial: false }).addTo(this.map);

    this.installLegend(L);

    this.render();
  }

  destroy() {
    this.map?.remove();
    this.map = null;
    this.markersLayer = null;
    this.legendControl = null;
    this.allSignalements = [];
    this.filtre = 'TOUS';
  }

  setFiltre(filtre: StatutFiltre) {
    this.filtre = filtre;
    this.render();
  }

  loadSignalements() {
    return this.signalementsService.list({ page: 0, size: 200 }).pipe(
      map((page) => page.content),
      catchError(() => of(this.getMockSignalements())),
      tap((signalements) => {
        this.allSignalements = signalements;
        this.render();
      })
    );
  }

  private render() {
    if (!this.map || !this.markersLayer) {
      return;
    }

    const L = this.L;
    if (!L) {
      return;
    }

    this.markersLayer.clearLayers();

    const list = this.getFiltered(this.allSignalements);

    for (const s of list) {
      const color = this.getStatutColor(s.statut);

      const marker = L.circleMarker([s.latitude, s.longitude], {
        radius: 7,
        color,
        fillColor: color,
        fillOpacity: 0.9,
        weight: 2
      });

      marker.bindPopup(this.buildPopupHtml(s), {
        closeButton: false,
        autoClose: false,
        closeOnClick: false
      });

      marker.on('mouseover', () => marker.openPopup());
      marker.on('mouseout', () => marker.closePopup());

      marker.addTo(this.markersLayer);
    }
  }

  private getFiltered(list: SignalementDto[]) {
    if (this.filtre === 'TOUS') {
      return list;
    }

    return list.filter((s) => this.normalizeStatut(s.statut) === this.filtre);
  }

  private normalizeStatut(statut: string | null | undefined): StatutFiltre {
    const raw = (statut ?? '').trim().toUpperCase();

    if (raw === 'NOUVEAU' || raw === 'NEW') {
      return 'NOUVEAU';
    }
    if (raw === 'EN_COURS' || raw === 'EN COURS' || raw === 'IN_PROGRESS') {
      return 'EN_COURS';
    }
    if (raw === 'TERMINE' || raw === 'TERMINÉ' || raw === 'DONE') {
      return 'TERMINE';
    }

    return 'TOUS';
  }

  private getStatutColor(statut: string | null | undefined) {
    const s = this.normalizeStatut(statut);

    switch (s) {
      case 'NOUVEAU':
        return '#1976d2';
      case 'EN_COURS':
        return '#f9a825';
      case 'TERMINE':
        return '#2e7d32';
      default:
        return '#6d6d6d';
    }
  }

  private buildPopupHtml(s: SignalementDto) {
    const date = this.formatDateFr(s.dateCreation);
    const statut = this.formatStatutFr(s.statut);
    const surface = s.surfaceM2 ?? 0;
    const budget = s.budget ?? 0;
    const entreprise = s.entreprise ?? '—';

    return `
      <div style="min-width: 220px">
        <div><strong>Date:</strong> ${date}</div>
        <div><strong>Statut:</strong> ${statut}</div>
        <div><strong>Surface:</strong> ${surface} m²</div>
        <div><strong>Budget:</strong> ${budget}</div>
        <div><strong>Entreprise:</strong> ${entreprise}</div>
      </div>
    `;
  }

  private formatDateFr(value: string | null | undefined) {
    if (!value) {
      return '—';
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return value;
    }
    return d.toLocaleString('fr-FR');
  }

  private formatStatutFr(value: string | null | undefined) {
    const s = this.normalizeStatut(value);
    switch (s) {
      case 'NOUVEAU':
        return 'Nouveau';
      case 'EN_COURS':
        return 'En cours';
      case 'TERMINE':
        return 'Terminé';
      default:
        return value ?? '—';
    }
  }

  private installLegend(L: typeof import('leaflet')) {
    if (!this.map) {
      return;
    }

    if (this.legendControl) {
      this.legendControl.remove();
      this.legendControl = null;
    }

    const colors = {
      nouveau: this.getStatutColor('NOUVEAU'),
      enCours: this.getStatutColor('EN_COURS'),
      termine: this.getStatutColor('TERMINE')
    };

    class LegendControl extends L.Control {
      override onAdd(_map: import('leaflet').Map) {
        const div = L.DomUtil.create('div', 'ri-legend');
        div.setAttribute(
          'style',
          [
            'background: white',
            'padding: 10px 12px',
            'border-radius: 10px',
            'box-shadow: 0 2px 10px rgba(0,0,0,.15)',
            'font: 12px/1.3 Roboto, Arial, sans-serif'
          ].join(';')
        );

        div.innerHTML = `
          <div style="font-weight: 600; margin-bottom: 6px;">Légende</div>
          <div style="display:flex; align-items:center; gap:8px; margin:4px 0;">
            <span style="width:12px; height:12px; background:${colors.nouveau}; border-radius:50%; display:inline-block"></span>
            <span>Nouveau</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px; margin:4px 0;">
            <span style="width:12px; height:12px; background:${colors.enCours}; border-radius:50%; display:inline-block"></span>
            <span>En cours</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px; margin:4px 0;">
            <span style="width:12px; height:12px; background:${colors.termine}; border-radius:50%; display:inline-block"></span>
            <span>Terminé</span>
          </div>
        `;

        return div;
      }
    }

    const control = new LegendControl({ position: 'bottomright' });
    control.addTo(this.map);
    this.legendControl = control;
  }

  private getMockSignalements(): SignalementDto[] {
    return [
      {
        id: 1,
        userId: 10,
        nomUtilisateur: 'Test',
        latitude: -18.8792,
        longitude: 47.5079,
        description: 'Nid-de-poule important (mock)',
        photoUrl: null,
        statut: 'NOUVEAU',
        surfaceM2: 2.5,
        budget: 150000,
        entreprise: 'Entreprise A',
        dateCreation: new Date(Date.now() - 2 * 86400000).toISOString(),
        dateUpdate: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 2,
        userId: 11,
        nomUtilisateur: 'Test',
        latitude: -18.8725,
        longitude: 47.5162,
        description: 'Chaussée dégradée (mock)',
        photoUrl: null,
        statut: 'EN_COURS',
        surfaceM2: 12,
        budget: 1200000,
        entreprise: 'Entreprise B',
        dateCreation: new Date(Date.now() - 6 * 86400000).toISOString(),
        dateUpdate: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: 3,
        userId: 12,
        nomUtilisateur: 'Test',
        latitude: -18.8913,
        longitude: 47.5033,
        description: 'Tranchée ouverte, signalisation insuffisante (mock)',
        photoUrl: null,
        statut: 'NOUVEAU',
        surfaceM2: 5.2,
        budget: 350000,
        entreprise: 'Entreprise C',
        dateCreation: new Date(Date.now() - 1 * 86400000).toISOString(),
        dateUpdate: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: 4,
        userId: 13,
        nomUtilisateur: 'Test',
        latitude: -18.8668,
        longitude: 47.4982,
        description: 'Travaux terminés (mock)',
        photoUrl: null,
        statut: 'TERMINE',
        surfaceM2: 20,
        budget: 2500000,
        entreprise: 'Entreprise D',
        dateCreation: new Date(Date.now() - 20 * 86400000).toISOString(),
        dateUpdate: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: 5,
        userId: 14,
        nomUtilisateur: 'Test',
        latitude: -18.8849,
        longitude: 47.5221,
        description: 'Bouchon et chaussée abîmée (mock)',
        photoUrl: null,
        statut: 'EN_COURS',
        surfaceM2: 7.7,
        budget: 900000,
        entreprise: 'Entreprise E',
        dateCreation: new Date(Date.now() - 9 * 86400000).toISOString(),
        dateUpdate: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ];
  }
}
