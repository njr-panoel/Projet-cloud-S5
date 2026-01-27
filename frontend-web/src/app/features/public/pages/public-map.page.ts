import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, of, startWith, switchMap } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';

import { MapService } from '../../../core/services/map.service';
import { MapComponent } from '../../../shared/components/map/map.component';
import { GeocodingService } from '../services/geocoding.service';

@Component({
  standalone: true,
  selector: 'app-map-view',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MapComponent
  ],
  template: `
    <h1>Carte des signalements</h1>

    <mat-card style="margin-bottom: 12px;">
      <mat-card-content>
        <mat-form-field appearance="outline" style="width: 100%">
          <mat-label>Rechercher une localisation</mat-label>
          <input matInput [formControl]="query" placeholder="Ex: Analakely, Antananarivo" />
        </mat-form-field>

        @if (results$ | async; as results) {
          @if (results.length > 0) {
            <mat-nav-list>
              @for (r of results; track r.label) {
                <a mat-list-item (click)="select(r)">{{ r.label }}</a>
              }
            </mat-nav-list>
          }
        }
      </mat-card-content>
    </mat-card>

    <app-map />
  `
})
export class MapViewComponent {
  private readonly geocoding = inject(GeocodingService);
  private readonly map = inject(MapService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly query = new FormControl('', { nonNullable: true });

  protected readonly results$ = this.query.valueChanges.pipe(
    startWith(this.query.value),
    debounceTime(250),
    distinctUntilChanged(),
    switchMap((q) => (q.trim().length >= 3 ? this.geocoding.search(q) : of([]))),
    catchError(() => of([])),
    takeUntilDestroyed(this.destroyRef)
  );

  select(place: { lat: number; lon: number; label: string }) {
    this.map.flyTo(place.lat, place.lon, 16);
    this.query.setValue(place.label);
  }
}
