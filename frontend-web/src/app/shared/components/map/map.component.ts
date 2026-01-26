import { AfterViewInit, Component, DestroyRef, ElementRef, OnDestroy, inject, viewChild } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
        <div style="display:flex; align-items:center; gap:12px; flex-wrap: wrap; margin-bottom: 12px;">
          <div style="font-weight: 600;">Filtrer:</div>
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

        <div #map style="height: 520px; width: 100%; border-radius: 12px;"></div>
      </mat-card-content>
    </mat-card>
  `
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private readonly mapService = inject(MapService);
  private readonly destroyRef = inject(DestroyRef);

  protected filtre: StatutFiltre = 'TOUS';

  protected readonly mapEl = viewChild.required<ElementRef<HTMLElement>>('map');

  async ngAfterViewInit() {
    await this.mapService.initMap(this.mapEl().nativeElement);

    this.mapService
      .loadSignalements()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  ngOnDestroy() {
    this.mapService.destroy();
  }

  onFiltreChange(value: StatutFiltre) {
    this.filtre = value;
    this.mapService.setFiltre(value);
  }
}
