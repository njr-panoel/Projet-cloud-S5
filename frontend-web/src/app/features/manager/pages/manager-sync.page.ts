import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
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
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div style="display:flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
      <h1 style="margin: 0;">Synchronisation</h1>
      <div style="display:flex; gap: 10px; flex-wrap: wrap;">
        <button mat-raised-button color="primary" type="button" (click)="syncToFirebase()" [disabled]="loading">
          Envoyer vers Firebase
        </button>
        <button mat-raised-button color="primary" type="button" (click)="syncFromFirebase()" [disabled]="loading">
          Récupérer depuis Firebase
        </button>
        <button mat-button type="button" (click)="refreshAll()" [disabled]="loading">Rafraîchir</button>
      </div>
    </div>

    <mat-card style="margin-top: 12px;">
      <mat-card-title>Statistiques</mat-card-title>
      <mat-card-content>
        @if (stats$ | async; as stats) {
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
            <div><strong>Total:</strong> {{ stats.totalSignalements }}</div>
            <div><strong>Synchronisés:</strong> {{ stats.syncedSignalements }}</div>
            <div><strong>Non synchronisés:</strong> {{ stats.unsyncedSignalements }}</div>
            <div><strong>Succès:</strong> {{ stats.successfulSyncs }}</div>
            <div><strong>Échecs:</strong> {{ stats.failedSyncs }}</div>
            <div><strong>Firebase:</strong> {{ stats.firebaseEnabled ? 'Activé' : 'Désactivé' }}</div>
          </div>
        } @else {
          <div style="display:flex; align-items:center; gap: 8px; padding: 10px 0;">
            <mat-progress-spinner diameter="18" mode="indeterminate" />
            <span>Chargement…</span>
          </div>
        }
      </mat-card-content>
    </mat-card>

    <mat-card style="margin-top: 12px;">
      <mat-card-title>Logs</mat-card-title>
      <mat-card-content>
        <div style="display:flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px;">
          <button mat-button type="button" (click)="loadLogs(undefined)">Tous</button>
          <button mat-button type="button" (click)="loadLogs(true)">Succès</button>
          <button mat-button type="button" (click)="loadLogs(false)">Échecs</button>
          <button mat-stroked-button type="button" (click)="exportLogs()" [disabled]="loading">Exporter (.xlsx)</button>
        </div>

        @if (logs$ | async; as logs) {
          @if (logs.length === 0) {
            <div>Aucun log.</div>
          } @else {
            <div style="display:grid; gap: 10px;">
              @for (l of logs; track l.id) {
                <div style="border: 1px solid rgba(0,0,0,.08); border-radius: 10px; padding: 10px;">
                  <div style="display:flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
                    <div style="font-weight: 700;">#{{ l.id }} - {{ l.entityType }} {{ l.entityId }} ({{ l.action }})</div>
                    <div style="opacity: 0.75;">{{ l.syncedAt }}</div>
                  </div>
                  <div style="margin-top: 4px;">
                    <strong>Résultat:</strong>
                    <span [style.color]="l.success ? '#2e7d32' : '#b00020'">{{ l.success ? 'Succès' : 'Échec' }}</span>
                  </div>
                  @if (l.firebaseId) {
                    <div style="margin-top: 4px;"><strong>FirebaseId:</strong> {{ l.firebaseId }}</div>
                  }
                  @if (l.errorMessage) {
                    <div style="margin-top: 4px;"><strong>Erreur:</strong> {{ l.errorMessage }}</div>
                  }
                </div>
              }
            </div>
          }
        } @else {
          <div style="display:flex; align-items:center; gap: 8px; padding: 10px 0;">
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
