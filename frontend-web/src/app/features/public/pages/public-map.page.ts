import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, of, startWith, switchMap } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../core/services/auth.service';
import { MapService } from '../../../core/services/map.service';
import { MapComponent } from '../../../shared/components/map/map.component';
import { GeocodingService } from '../services/geocoding.service';

@Component({
  standalone: true,
  selector: 'app-map-view',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatButtonModule,
    MapComponent
  ],
  template: `
    <div style="display:flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
      <h1 style="margin: 0;">Carte des signalements</h1>
      <div style="display:flex; gap: 10px; flex-wrap: wrap;">
        <a mat-stroked-button routerLink="/signalements">Liste</a>
        @if (canReport()) {
          <a mat-raised-button color="primary" routerLink="/signaler">Signaler</a>
        } @else {
          <a mat-raised-button color="primary" routerLink="/auth/login">Connexion</a>
        }
      </div>
    </div>

    <mat-card style="margin-bottom: 12px;">
      <mat-card-content>
        <div style="width: 100%; max-width: 560px;">
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
        </div>
      </mat-card-content>
    </mat-card>

    <app-map (locationSelected)="onLocationSelected($event)" />

    @if (picked) {
      <mat-card style="margin-top: 12px;">
        <mat-card-content style="display:flex; align-items:center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
          <div>
            <div style="font-weight: 600;">Position sélectionnée</div>
            <div style="opacity: .85; font-size: 13px;">Lat: {{ picked.lat.toFixed(6) }} | Lon: {{ picked.lon.toFixed(6) }}</div>
          </div>

          @if (canReport()) {
            <button mat-raised-button color="primary" type="button" (click)="startReportFromPicked()">
              Créer un signalement ici
            </button>
          } @else {
            <a mat-raised-button color="primary" routerLink="/auth/login">Connexion pour signaler</a>
          }
        </mat-card-content>
      </mat-card>
    }
  `
})
export class MapViewComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly geocoding = inject(GeocodingService);
  private readonly map = inject(MapService);
  private readonly destroyRef = inject(DestroyRef);

  protected picked: { lat: number; lon: number } | null = null;

  protected canReport() {
    const role = this.auth.getRole();
    return role === 'UTILISATEUR_MOBILE' || role === 'MANAGER';
  }

  protected onLocationSelected(pos: { lat: number; lon: number }) {
    this.picked = pos;
  }

  protected startReportFromPicked() {
    if (!this.picked) {
      return;
    }

    this.router.navigate(['/signaler'], {
      queryParams: {
        lat: Number(this.picked.lat.toFixed(6)),
        lon: Number(this.picked.lon.toFixed(6))
      }
    });
  }

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
