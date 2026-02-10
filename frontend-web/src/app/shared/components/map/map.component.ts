import { AfterViewInit, Component, DestroyRef, ElementRef, EventEmitter, OnDestroy, Output, inject, viewChild } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { debounceTime, fromEvent } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { MapService, StatutFiltre } from '../../../core/services/map.service';

@Component({
  standalone: true,
  selector: 'app-map',
  imports: [MatCardModule, MatButtonToggleModule],
  template: `
    <mat-card>
      <mat-card-content>
        <div class="ri-filter-bar" style="margin-bottom: 16px;">
          <span style="font-weight: 600; color: var(--ri-text-secondary);">Filtrer:</span>
          <mat-button-toggle-group
            [value]="filtre"
            (valueChange)="onFiltreChange($event)"
            aria-label="Filtre statut"
          >
            <mat-button-toggle value="TOUS">Tous</mat-button-toggle>
            <mat-button-toggle value="NOUVEAU">Nouveau</mat-button-toggle>
            <mat-button-toggle value="EN_COURS">En cours</mat-button-toggle>
            <mat-button-toggle value="TERMINE">Terminé</mat-button-toggle>
          </mat-button-toggle-group>
        </div>

        <div #map style="height: min(70vh, 640px); width: 100%; border-radius: var(--ri-radius-lg); position: relative; z-index: 1; border: 1px solid var(--ri-border);"></div>
      </mat-card-content>
    </mat-card>
  `
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private readonly mapService = inject(MapService);
  private readonly destroyRef = inject(DestroyRef);

  private unsubscribeClick: (() => void) | null = null;

  @Output() locationSelected = new EventEmitter<{ lat: number; lon: number }>();

  private resizeObserver: ResizeObserver | null = null;

  protected filtre: StatutFiltre = 'TOUS';

  protected readonly mapEl = viewChild.required<ElementRef<HTMLElement>>('map');

  async ngAfterViewInit() {
    await this.mapService.initMap(this.mapEl().nativeElement);

    this.unsubscribeClick?.();
    this.unsubscribeClick = this.mapService.onMapClick((lat, lon) => {
      this.locationSelected.emit({ lat, lon });
    });

    this.mapService
      .loadSignalements()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    setTimeout(() => {
      this.mapService.invalidateSize();
    }, 300);

    fromEvent(window, 'resize')
      .pipe(debounceTime(100), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.mapService.invalidateSize());

    const el = this.mapEl().nativeElement;
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => this.mapService.invalidateSize());
      this.resizeObserver.observe(el);
    }
  }

  ngOnDestroy() {
    this.unsubscribeClick?.();
    this.unsubscribeClick = null;

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.mapService.destroy();
  }

  onFiltreChange(value: StatutFiltre) {
    this.filtre = value;
    this.mapService.setFiltre(value);
  }
}
