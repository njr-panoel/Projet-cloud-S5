import { inject, Injectable } from '@angular/core';
import { catchError, map, of, tap, timeout } from 'rxjs';

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

  private readonly mapClickHandlers = new Set<(lat: number, lon: number) => void>();
  private mapClickListener: ((e: unknown) => void) | null = null;

  private allSignalements: SignalementDto[] = [];
  private filtre: StatutFiltre = 'TOUS';

  async initMap(container: HTMLElement) {
    const L = await this.leafletService.load();
    this.L = L;

    this.map?.remove();

    this.map = L.map(container, {
      center: [-18.8792, 47.5079],
      zoom: 12,
      zoomControl: true,
      maxZoom: 19
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
      maxNativeZoom: 19,
      detectRetina: true
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);

    L.control.scale({ imperial: false }).addTo(this.map);

    this.installLegend(L);

    this.installClickListener();

    this.render();
  }

  onMapClick(handler: (lat: number, lon: number) => void) {
    this.mapClickHandlers.add(handler);
    return () => {
      this.mapClickHandlers.delete(handler);
    };
  }

  private installClickListener() {
    if (!this.map || !this.L) {
      return;
    }

    if (this.mapClickListener) {
      return;
    }

    this.mapClickListener = (e: unknown) => {
      const anyE = e as { latlng?: { lat: number; lng: number } };
      const lat = anyE.latlng?.lat;
      const lon = anyE.latlng?.lng;

      if (typeof lat !== 'number' || typeof lon !== 'number') {
        return;
      }

      for (const h of this.mapClickHandlers) {
        h(lat, lon);
      }
    };

    this.map.on('click', this.mapClickListener as unknown as (evt: import('leaflet').LeafletMouseEvent) => void);
  }

  destroy() {
    if (this.map && this.mapClickListener) {
      this.map.off('click', this.mapClickListener as unknown as (evt: import('leaflet').LeafletMouseEvent) => void);
    }
    this.mapClickListener = null;

    this.map?.remove();
    this.map = null;
    this.markersLayer = null;
    this.legendControl = null;
    this.allSignalements = [];
    this.filtre = 'TOUS';
  }

  invalidateSize() {
    this.map?.invalidateSize();
  }

  flyTo(lat: number, lon: number, zoom = 15) {
    this.map?.flyTo([lat, lon], zoom, { duration: 0.8 });
  }

  setFiltre(filtre: StatutFiltre) {
    this.filtre = filtre;
    this.render();
  }

  loadSignalements() {
    return this.signalementsService.listAll().pipe(
      timeout({ first: 2500 }),
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

      const icon = this.buildPinIcon(L, color, this.normalizeStatut(s.statut));
      const marker = L.marker([s.latitude, s.longitude], {
        icon,
        keyboard: false,
        riseOnHover: true
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

  private buildPinIcon(L: typeof import('leaflet'), color: string, statut: StatutFiltre) {
    const html = this.buildPinSvg(color, statut);
    const className = `ri-pin ri-pin--${statut.toLowerCase()}`;

    return L.divIcon({
      className,
      html,
      iconSize: [36, 46],
      iconAnchor: [18, 46],
      popupAnchor: [0, -40]
    });
  }

  private buildPinSvg(color: string, statut: StatutFiltre) {
    const symbol = this.getPinSymbolSvg(statut);

    return `
      <svg width="36" height="46" viewBox="0 0 36 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M18 0C10.3 0 4 6.3 4 14c0 10.5 14 32 14 32s14-21.5 14-32C32 6.3 25.7 0 18 0z" fill="${color}" />
        <circle cx="18" cy="14" r="8.5" fill="#ffffff" />
        ${symbol}
      </svg>
    `;
  }

  private getPinSymbolSvg(statut: StatutFiltre) {
    switch (statut) {
      case 'TERMINE':
        return '<path d="M13.8 14.2l2.5 2.7 6-6.6" fill="none" stroke="#0f172a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />';
      case 'EN_COURS':
        return '<circle cx="18" cy="14" r="5" fill="none" stroke="#0f172a" stroke-width="2" /><path d="M18 11v3.6l2.3 1.7" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />';
      case 'NOUVEAU':
      default:
        return '<path d="M18 9.2v7.2" stroke="#0f172a" stroke-width="2.4" stroke-linecap="round" /><circle cx="18" cy="19.5" r="1.3" fill="#0f172a" />';
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
    const date = this.formatDateFr(s.createdAt);
    const statut = this.formatStatutFr(s.statut);
    const statutColor = this.getStatutColor(s.statut);
    const titre = s.titre || '—';
    const surface = s.surface != null ? `${s.surface} m²` : '—';
    const budget = s.budget != null ? `${s.budget.toLocaleString('fr-FR')} Ar` : '—';
    const entreprise = s.entreprise || '—';
    const niveau = s.niveau || '—';

    const photosHtml = s.photos
      ? `<a href="${s.photos}" target="_blank" rel="noopener" style="color:#1976d2;text-decoration:underline;font-weight:500;">Voir les photos</a>`
      : '—';

    return `
      <div style="min-width:260px;font-family:Roboto,Arial,sans-serif;font-size:13px;line-height:1.6;">
        <div style="font-weight:700;font-size:15px;margin-bottom:8px;border-bottom:2px solid ${statutColor};padding-bottom:6px;">${titre}</div>
        <div><strong>Date :</strong> ${date}</div>
        <div><strong>Statut :</strong> <span style="color:${statutColor};font-weight:600;">${statut}</span></div>
        <div><strong>Surface :</strong> ${surface}</div>
        <div><strong>Budget :</strong> ${budget}</div>
        <div><strong>Entreprise :</strong> ${entreprise}</div>
        <div><strong>Niveau :</strong> ${niveau}</div>
        <div style="margin-top:6px;"><strong>Photos :</strong> ${photosHtml}</div>
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
        titre: 'Signalement (mock)',
        description: 'Nid-de-poule important (mock)',
        typeTravaux: 'NIDS_DE_POULE',
        statut: 'NOUVEAU',
        latitude: -18.8792,
        longitude: 47.5079,
        adresse: 'Antananarivo',
        photos: null,
        user: {
          id: 10,
          email: 'test@example.com',
          nom: 'Test',
          prenom: 'User',
          telephone: null,
          role: 'VISITEUR'
        },
        synced: false,
        firebaseId: null,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        completedAt: null,
        surface: 25,
        budget: 500000,
        entreprise: 'Colas Madagascar',
        niveau: 'Urgent'
      },
      {
        id: 2,
        titre: 'Signalement (mock)',
        description: 'Chaussée dégradée (mock)',
        typeTravaux: 'FISSURE',
        statut: 'EN_COURS',
        latitude: -18.8725,
        longitude: 47.5162,
        adresse: 'Antananarivo',
        photos: null,
        user: {
          id: 11,
          email: 'test2@example.com',
          nom: 'Test',
          prenom: 'User',
          telephone: null,
          role: 'VISITEUR'
        },
        synced: false,
        firebaseId: null,
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        completedAt: null,
        surface: 40,
        budget: 800000,
        entreprise: 'SOGEA Madagascar',
        niveau: 'Moyen'
      },
      {
        id: 3,
        titre: 'Signalement (mock)',
        description: 'Tranchée ouverte, signalisation insuffisante (mock)',
        typeTravaux: 'SIGNALISATION',
        statut: 'NOUVEAU',
        latitude: -18.8913,
        longitude: 47.5033,
        adresse: 'Antananarivo',
        photos: null,
        user: {
          id: 12,
          email: 'test3@example.com',
          nom: 'Test',
          prenom: 'User',
          telephone: null,
          role: 'VISITEUR'
        },
        synced: true,
        firebaseId: 'mock123',
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        completedAt: null,
        surface: 15,
        budget: 300000,
        entreprise: 'Henri Fraise',
        niveau: 'Faible'
      }
    ];
  }
}
