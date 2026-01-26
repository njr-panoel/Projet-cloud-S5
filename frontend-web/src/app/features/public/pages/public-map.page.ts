import { AfterViewInit, Component, DestroyRef, ElementRef, inject, viewChild } from '@angular/core';

import { MatCardModule } from '@angular/material/card';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { LeafletService } from '../../../core/services/leaflet.service';
import { SignalementsService } from '../../../core/services/signalements.service';

@Component({
  standalone: true,
  selector: 'app-public-map-page',
  imports: [MatCardModule],
  template: `
    <h1>Carte des signalements</h1>

    <mat-card>
      <mat-card-content>
        <div #map style="height: 520px; width: 100%; border-radius: 12px;"></div>
      </mat-card-content>
    </mat-card>
  `
})
export class PublicMapPage implements AfterViewInit {
  private readonly leaflet = inject(LeafletService);
  private readonly signalements = inject(SignalementsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly mapEl = viewChild.required<ElementRef<HTMLElement>>('map');

  async ngAfterViewInit() {
    const L = await this.leaflet.load();

    const map = L.map(this.mapEl().nativeElement).setView([-18.8792, 47.5079], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    this.signalements
      .list({ page: 0, size: 200 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((page) => {
        for (const s of page.content) {
          L.circleMarker([s.latitude, s.longitude], {
            radius: 7,
            color: '#1976d2'
          })
            .addTo(map)
            .bindPopup(`<strong>${s.statut}</strong><br/>${s.description}`);
        }
      });
  }
}
