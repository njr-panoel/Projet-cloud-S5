import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { interval, startWith, switchMap } from 'rxjs';

import { StatsService } from '../../../core/services/stats.service';
import { SyncService } from '../../../core/services/sync.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';

@Component({
  standalone: true,
  selector: 'app-manager-dashboard-page',
  imports: [AsyncPipe, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule, LoaderComponent, StatsCardComponent],
  template: `
    <div class="ri-page-header">
      <h1>Dashboard manager</h1>
      <div class="ri-page-actions">
        <a mat-stroked-button routerLink="/manager/sync">
          <mat-icon>sync</mat-icon> Page sync
        </a>
        <button mat-raised-button color="primary" type="button" (click)="syncToFirebase()" [disabled]="loading">
          <mat-icon>cloud_upload</mat-icon> Synchroniser Firebase
        </button>
      </div>
    </div>

    <div class="ri-stats-grid ri-animate-in">
      @if (stats$ | async; as s) {
        <app-stats-card title="Total signalements" [value]="s.nbPoints" icon="pin_drop" variant="primary" />
        <app-stats-card title="Nouveaux" [value]="s.nbNouveau" icon="fiber_new" variant="danger" />
        <app-stats-card title="En cours" [value]="s.nbEnCours" icon="autorenew" variant="warning" />
        <app-stats-card title="Terminés" [value]="s.nbTermine" icon="check_circle" variant="success" />
        <app-stats-card title="Avancement" [value]="s.avancementPercent + '%'" icon="trending_up" />
      } @else {
        <mat-card class="ri-full-width">
          <mat-card-content>
            <app-loader label="Chargement des statistiques…" />
          </mat-card-content>
        </mat-card>
      }

      @if (syncStats$ | async; as st) {
        <app-stats-card title="Firebase" [value]="st.firebaseEnabled ? 'Activé' : 'Désactivé'" icon="cloud" />
        <app-stats-card title="Synchronisés" [value]="st.syncedSignalements" icon="cloud_done" variant="success" />
        <app-stats-card title="Non synchronisés" [value]="st.unsyncedSignalements" icon="cloud_off" variant="warning" />
        <app-stats-card title="Succès" [value]="st.successfulSyncs" icon="check" variant="success" />
        <app-stats-card title="Échecs" [value]="st.failedSyncs" icon="error" variant="danger" />
      } @else {
        <mat-card class="ri-full-width">
          <mat-card-content>
            <app-loader label="Chargement sync…" />
          </mat-card-content>
        </mat-card>
      }

      <mat-card class="ri-full-width">
        <mat-card-title>Raccourcis</mat-card-title>
        <mat-card-content>
          <div style="display:flex; gap: 12px; flex-wrap: wrap;">
            <a mat-raised-button color="primary" routerLink="/manager/signalements">
              <mat-icon>report</mat-icon> Gérer les signalements
            </a>
            <a mat-raised-button color="primary" routerLink="/manager/utilisateurs">
              <mat-icon>group</mat-icon> Gérer les utilisateurs
            </a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ManagerDashboardPage {
  private readonly stats = inject(StatsService);
  private readonly sync = inject(SyncService);
  private readonly snack = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected loading = false;

  protected readonly stats$ = interval(5000).pipe(startWith(0), switchMap(() => this.stats.getStats()));
  protected readonly syncStats$ = interval(5000).pipe(startWith(0), switchMap(() => this.sync.stats()));

  syncToFirebase() {
    this.loading = true;
    this.sync
      .toFirebase()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading = false;
          this.snack.open('Synchronisation vers Firebase lancée.', 'OK', { duration: 2500 });
        },
        error: () => {
          this.loading = false;
          this.snack.open('Impossible de lancer la synchronisation.', 'OK', { duration: 3500 });
        }
      });
  }
}
