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
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AuthService } from '../../../core/services/auth.service';
import { MapService } from '../../../core/services/map.service';
import { MapComponent } from '../../../shared/components/map/map.component';
import { GeocodingService } from '../services/geocoding.service';
import { PublicDataService } from '../services/public-data.service';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';

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
    MatIconModule,
    MatProgressBarModule,
    MapComponent,
    StatsCardComponent
  ],
  template: `
    <div class="ri-page-header">
      <h1>Carte des signalements</h1>
      <div class="ri-page-actions">
        <a mat-stroked-button routerLink="/signalements">
          <mat-icon>list_alt</mat-icon> Liste
        </a>
        @if (canReport()) {
          <a mat-raised-button color="primary" routerLink="/signaler">
            <mat-icon>add_location_alt</mat-icon> Signaler
          </a>
        } @else {
          <a mat-raised-button color="primary" routerLink="/auth/login">Connexion</a>
        }
      </div>
    </div>

    <mat-card style="margin-bottom: 16px;">
      <mat-card-content>
        <div style="width: 100%; max-width: 560px;">
          <mat-form-field appearance="outline" style="width: 100%">
            <mat-label>Rechercher une localisation</mat-label>
            <mat-icon matPrefix style="margin-right: 8px; color: var(--ri-text-tertiary);">search</mat-icon>
            <input matInput [formControl]="query" placeholder="Ex: Analakely, Antananarivo" />
          </mat-form-field>

          @if (results$ | async; as results) {
            @if (results.length > 0) {
              <mat-nav-list style="margin-top: -8px;">
                @for (r of results; track r.label) {
                  <a mat-list-item (click)="select(r)">
                    <mat-icon matListItemIcon style="color: var(--ri-text-tertiary);">place</mat-icon>
                    {{ r.label }}
                  </a>
                }
              </mat-nav-list>
            }
          }
        </div>
      </mat-card-content>
    </mat-card>

    <app-map (locationSelected)="onLocationSelected($event)" />

    @if (stats$ | async; as stats) {
      <mat-card style="margin-top: 16px;" class="ri-animate-in">
        <mat-card-content>
          <div style="font-weight: 700; font-size: 16px; margin-bottom: 12px;">
            <mat-icon style="vertical-align: middle; font-size: 20px; margin-right: 6px; color: var(--ri-primary);">summarize</mat-icon>
            Récapitulation
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px;">
            <app-stats-card title="Nb de points" [value]="stats.nbPoints" icon="pin_drop" variant="primary" />
            <app-stats-card title="Surface totale (m²)" [value]="stats.totalSurfaceM2" icon="crop_square" />
            <app-stats-card title="Avancement" [value]="stats.avancementPercent + '%'" icon="trending_up" variant="success" />
            <app-stats-card title="Budget total" [value]="stats.totalBudget" icon="payments" variant="warning" />
          </div>
          <div style="margin-top: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: 600; font-size: 14px; color: var(--ri-text-secondary);">Avancement global</span>
              <span style="font-weight: 800; font-size: 18px;">{{ stats.avancementPercent }}%</span>
            </div>
            <mat-progress-bar mode="determinate" [value]="stats.avancementPercent"></mat-progress-bar>
          </div>
        </mat-card-content>
      </mat-card>
    }

    @if (picked) {
      <mat-card style="margin-top: 16px;" class="ri-animate-in">
        <mat-card-content style="display:flex; align-items:center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
          <div>
            <div style="font-weight: 700; font-size: 15px; margin-bottom: 4px;">
              <mat-icon style="vertical-align: middle; font-size: 18px; margin-right: 6px; color: var(--ri-primary);">place</mat-icon>
              Position sélectionnée
            </div>
            <div style="color: var(--ri-text-secondary); font-size: 13px;">
              Lat: {{ picked.lat.toFixed(6) }} | Lon: {{ picked.lon.toFixed(6) }}
            </div>
          </div>

          @if (canReport()) {
            <button mat-raised-button color="primary" type="button" (click)="startReportFromPicked()">
              <mat-icon>add_location_alt</mat-icon>
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
  private readonly publicData = inject(PublicDataService);

  protected readonly stats$ = this.publicData.getStats();

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
