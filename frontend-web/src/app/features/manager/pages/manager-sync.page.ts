import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ExcelExportService } from '../../../core/services/excel-export.service';
import { SyncService } from '../../../core/services/sync.service';

@Component({
  standalone: true,
  selector: 'app-manager-sync-page',
  imports: [
    AsyncPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="ri-page-header">
      <h1>Synchronisation</h1>
      <div class="ri-page-actions">
        <button mat-raised-button color="primary" type="button" (click)="syncToFirebase()" [disabled]="loading">
          <mat-icon>cloud_upload</mat-icon> Envoyer vers Firebase
        </button>
        <button mat-raised-button color="primary" type="button" (click)="syncFromFirebase()" [disabled]="loading">
          <mat-icon>cloud_download</mat-icon> Récupérer depuis Firebase
        </button>
        <button mat-stroked-button type="button" (click)="refreshAll()" [disabled]="loading">
          <mat-icon>refresh</mat-icon> Rafraîchir
        </button>
      </div>
    </div>

    <mat-card class="ri-animate-in" style="margin-bottom: 16px;">
      <mat-card-title><mat-icon style="vertical-align: middle; margin-right: 8px;">analytics</mat-icon>Statistiques</mat-card-title>
      <mat-card-content>
        @if (stats$ | async; as stats) {
          <div class="ri-stats-grid">
            <div class="ri-stat-item"><strong>Total</strong><span>{{ stats.totalSignalements }}</span></div>
            <div class="ri-stat-item"><strong>Synchronisés</strong><span style="color: var(--ri-success)">{{ stats.syncedSignalements }}</span></div>
            <div class="ri-stat-item"><strong>Non synchronisés</strong><span style="color: var(--ri-warning)">{{ stats.unsyncedSignalements }}</span></div>
            <div class="ri-stat-item"><strong>Succès</strong><span style="color: var(--ri-success)">{{ stats.successfulSyncs }}</span></div>
            <div class="ri-stat-item"><strong>Échecs</strong><span style="color: var(--ri-danger)">{{ stats.failedSyncs }}</span></div>
            <div class="ri-stat-item"><strong>Firebase</strong><span>{{ stats.firebaseEnabled ? 'Activé' : 'Désactivé' }}</span></div>
          </div>
        } @else {
          <div style="display:flex; align-items:center; gap: 8px; padding: 16px 0;">
            <mat-progress-spinner diameter="18" mode="indeterminate" />
            <span>Chargement…</span>
          </div>
        }
      </mat-card-content>
    </mat-card>

    <mat-card class="ri-animate-in">
      <mat-card-title><mat-icon style="vertical-align: middle; margin-right: 8px;">history</mat-icon>Logs</mat-card-title>
      <mat-card-content>
        <div class="ri-filter-bar" style="margin-bottom: 16px;">
          <button mat-button type="button" (click)="loadLogs(undefined)">Tous</button>
          <button mat-button type="button" (click)="loadLogs(true)">
            <mat-icon>check_circle</mat-icon> Succès
          </button>
          <button mat-button type="button" (click)="loadLogs(false)">
            <mat-icon>error</mat-icon> Échecs
          </button>
          <button mat-stroked-button type="button" (click)="exportLogs()" [disabled]="loading">
            <mat-icon>download</mat-icon> Exporter (.xlsx)
          </button>
        </div>

        @if (logs$ | async; as logs) {
          @if (logs.length === 0) {
            <div class="ri-empty-state">
              <mat-icon>inbox</mat-icon>
              <p>Aucun log.</p>
            </div>
          } @else {
            <div style="display:grid; gap: 12px;">
              @for (l of logs; track l.id) {
                <div class="ri-log-card">
                  <div class="ri-log-header">
                    <div class="ri-log-title">#{{ l.id }} - {{ l.entityType }} {{ l.entityId }} ({{ l.action }})</div>
                    <div class="ri-log-date">{{ l.syncedAt }}</div>
                  </div>
                  <div style="margin-top: 6px;">
                    <strong>Résultat:</strong>
                    <span [class]="l.success ? 'ri-log-success' : 'ri-log-failure'">{{ l.success ? 'Succès' : 'Échec' }}</span>
                  </div>
                  @if (l.firebaseId) {
                    <div style="margin-top: 4px; color: var(--ri-text-secondary); font-size: 0.875rem;"><strong>FirebaseId:</strong> {{ l.firebaseId }}</div>
                  }
                  @if (l.errorMessage) {
                    <div style="margin-top: 4px; color: var(--ri-danger); font-size: 0.875rem;"><strong>Erreur:</strong> {{ l.errorMessage }}</div>
                  }
                </div>
              }
            </div>
          }
        } @else {
          <div style="display:flex; align-items:center; gap: 8px; padding: 16px 0;">
            <mat-progress-spinner diameter="18" mode="indeterminate" />
            <span>Chargement…</span>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `
})
export class ManagerSyncPage {
  private readonly sync = inject(SyncService);
  private readonly excel = inject(ExcelExportService);
  private readonly snack = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected loading = false;

  protected stats$ = this.sync.stats();
  protected logs$ = this.sync.logs({ limit: 50 });

  refreshAll() {
    this.stats$ = this.sync.stats();
    this.logs$ = this.sync.logs({ limit: 50 });
  }

  loadLogs(success?: boolean) {
    this.logs$ = this.sync.logs({ success, limit: 50 });
  }

  syncToFirebase() {
    this.loading = true;
    this.sync
      .toFirebase()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading = false;
          this.snack.open('Synchronisation vers Firebase lancée.', 'OK', { duration: 2500 });
          this.refreshAll();
        },
        error: () => {
          this.loading = false;
          this.snack.open('Impossible de synchroniser vers Firebase.', 'OK', { duration: 3500 });
        }
      });
  }

  syncFromFirebase() {
    this.loading = true;
    this.sync
      .fromFirebase()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading = false;
          this.snack.open('Synchronisation depuis Firebase lancée.', 'OK', { duration: 2500 });
          this.refreshAll();
        },
        error: () => {
          this.loading = false;
          this.snack.open('Impossible de synchroniser depuis Firebase.', 'OK', { duration: 3500 });
        }
      });
  }

  exportLogs() {
    this.logs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((logs) => {
      const rows = logs.map((l) => ({
        id: l.id,
        entityType: l.entityType,
        entityId: l.entityId,
        action: l.action,
        firebaseId: l.firebaseId,
        success: l.success,
        errorMessage: l.errorMessage,
        syncedAt: l.syncedAt
      }));
      this.excel.exportAsXlsx('sync-logs', rows, 'Logs');
    });
  }
}
