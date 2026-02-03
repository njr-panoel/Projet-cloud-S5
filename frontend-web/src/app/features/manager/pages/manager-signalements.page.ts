import { AfterViewInit, Component, DestroyRef, ViewChild, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { startWith, Subject, switchMap } from 'rxjs';

import { ExcelExportService } from '../../../core/services/excel-export.service';
import { SignalementsService } from '../../../core/services/signalements.service';
import { SignalementDto, StatutSignalement, TypeTravaux } from '../../../models/signalement.models';

@Component({
  standalone: true,
  selector: 'app-manager-signalements-page',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h1>Gestion des signalements</h1>

    <mat-card>
      <mat-card-content>
        <div style="display:flex; gap: 10px; flex-wrap: wrap; align-items:center;">
          <mat-form-field appearance="outline">
            <mat-label>Recherche</mat-label>
            <input matInput [formControl]="searchCtrl" placeholder="Titre, adresse, email…" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Statut</mat-label>
            <mat-select [formControl]="statutCtrl">
              <mat-option [value]="''">Tous</mat-option>
              <mat-option value="NOUVEAU">Nouveau</mat-option>
              <mat-option value="EN_COURS">En cours</mat-option>
              <mat-option value="TERMINE">Terminé</mat-option>
              <mat-option value="ANNULE">Annulé</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select [formControl]="typeCtrl">
              <mat-option [value]="''">Tous</mat-option>
              @for (t of allTypes; track t) {
                <mat-option [value]="t">{{ t }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <button mat-stroked-button type="button" (click)="refresh()" [disabled]="loading">Rafraîchir</button>
          <button mat-stroked-button type="button" (click)="export()" [disabled]="loading">Exporter (.xlsx)</button>
        </div>

        <div style="margin-top: 12px; display:flex; align-items:center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
          <div><strong>Résultats:</strong> {{ dataSource.filteredData.length }}</div>
          @if (loading) {
            <div style="display:flex; align-items:center; gap: 8px;">
              <mat-progress-spinner diameter="18" mode="indeterminate" />
              <span>Chargement…</span>
            </div>
          }
        </div>

        <div style="overflow:auto; margin-top: 12px;">
          <table mat-table [dataSource]="dataSource" matSort>
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
              <td mat-cell *matCellDef="let s">#{{ s.id }}</td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
              <td mat-cell *matCellDef="let s">{{ s.createdAt }}</td>
            </ng-container>

            <ng-container matColumnDef="adresse">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Localisation</th>
              <td mat-cell *matCellDef="let s">{{ s.adresse || (s.latitude + ', ' + s.longitude) }}</td>
            </ng-container>

            <ng-container matColumnDef="statut">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
              <td mat-cell *matCellDef="let s">
                <mat-form-field appearance="outline" style="width: 160px; margin: 0;">
                  <mat-select [value]="s.statut" (selectionChange)="setStatut(s, $event.value)">
                    <mat-option value="NOUVEAU">Nouveau</mat-option>
                    <mat-option value="EN_COURS">En cours</mat-option>
                    <mat-option value="TERMINE">Terminé</mat-option>
                    <mat-option value="ANNULE">Annulé</mat-option>
                  </mat-select>
                </mat-form-field>
              </td>
            </ng-container>

            <ng-container matColumnDef="typeTravaux">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
              <td mat-cell *matCellDef="let s">{{ s.typeTravaux }}</td>
            </ng-container>

            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef>Utilisateur</th>
              <td mat-cell *matCellDef="let s">{{ s.user?.email }}</td>
            </ng-container>

            <ng-container matColumnDef="synced">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Sync</th>
              <td mat-cell *matCellDef="let s">{{ s.synced ? 'Oui' : 'Non' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let s">
                <button mat-button type="button" (click)="remove(s)">Supprimer</button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>
      </mat-card-content>
    </mat-card>
  `
})
export class ManagerSignalementsPage implements AfterViewInit {
  private readonly signalements = inject(SignalementsService);
  private readonly excel = inject(ExcelExportService);
  private readonly snack = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  private readonly refresh$ = new Subject<void>();

  protected loading = false;

  protected readonly searchCtrl = new FormControl<string>('', { nonNullable: true });
  protected readonly statutCtrl = new FormControl<string>('', { nonNullable: true });
  protected readonly typeCtrl = new FormControl<string>('', { nonNullable: true });

  protected readonly allTypes: TypeTravaux[] = [
    'NIDS_DE_POULE',
    'FISSURE',
    'AFFAISSEMENT',
    'INONDATION',
    'SIGNALISATION',
    'ECLAIRAGE',
    'AUTRE'
  ];

  protected readonly displayedColumns = ['id', 'createdAt', 'adresse', 'statut', 'typeTravaux', 'user', 'synced', 'actions'];
  protected readonly dataSource = new MatTableDataSource<SignalementDto>([]);

  @ViewChild(MatSort) sort?: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort ?? null;

    this.dataSource.filterPredicate = (row, raw) => {
      let filter: { q: string; statut: string; type: string };
      try {
        filter = JSON.parse(raw) as { q: string; statut: string; type: string };
      } catch {
        filter = { q: '', statut: '', type: '' };
      }

      const q = (filter.q || '').trim().toLowerCase();
      const statut = (filter.statut || '').trim();
      const type = (filter.type || '').trim();

      if (statut && row.statut !== statut) {
        return false;
      }
      if (type && row.typeTravaux !== type) {
        return false;
      }

      if (!q) {
        return true;
      }

      const hay = [
        String(row.id),
        row.titre,
        row.description ?? '',
        row.adresse ?? '',
        row.user?.email ?? '',
        row.user?.nom ?? '',
        row.user?.prenom ?? '',
        row.typeTravaux,
        row.statut
      ]
        .join(' ')
        .toLowerCase();

      return hay.includes(q);
    };

    this.refresh$
      .pipe(
        startWith(undefined),
        switchMap(() => {
          this.loading = true;
          return this.signalements.listAll();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (list) => {
          this.loading = false;
          this.dataSource.data = list;
          this.applyFilter();
        },
        error: () => {
          this.loading = false;
          this.snack.open('Impossible de charger les signalements.', 'OK', { duration: 3500 });
        }
      });

    this.searchCtrl.valueChanges.pipe(startWith(this.searchCtrl.value), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.applyFilter());
    this.statutCtrl.valueChanges.pipe(startWith(this.statutCtrl.value), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.applyFilter());
    this.typeCtrl.valueChanges.pipe(startWith(this.typeCtrl.value), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.applyFilter());
  }

  refresh() {
    this.refresh$.next();
  }

  private applyFilter() {
    this.dataSource.filter = JSON.stringify({
      q: this.searchCtrl.value,
      statut: this.statutCtrl.value,
      type: this.typeCtrl.value
    });
  }

  setStatut(s: SignalementDto, statut: StatutSignalement) {
    if (s.statut === statut) {
      return;
    }

    this.signalements.updateStatut(s.id, statut).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        s.statut = updated.statut;
        this.applyFilter();
        this.snack.open('Statut mis à jour.', 'OK', { duration: 2000 });
      },
      error: () => {
        this.snack.open('Impossible de mettre à jour le statut.', 'OK', { duration: 3500 });
      }
    });
  }

  remove(s: SignalementDto) {
    this.signalements.delete(s.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter((x) => x.id !== s.id);
        this.applyFilter();
        this.snack.open('Signalement supprimé.', 'OK', { duration: 2500 });
      },
      error: () => {
        this.snack.open('Impossible de supprimer le signalement.', 'OK', { duration: 3500 });
      }
    });
  }

  export() {
    const rows = this.dataSource.filteredData.map((s) => ({
      id: s.id,
      createdAt: s.createdAt,
      titre: s.titre,
      description: s.description,
      typeTravaux: s.typeTravaux,
      statut: s.statut,
      adresse: s.adresse,
      latitude: s.latitude,
      longitude: s.longitude,
      userEmail: s.user?.email,
      synced: s.synced,
      firebaseId: s.firebaseId
    }));

    this.excel.exportAsXlsx('signalements', rows, 'Signalements');
  }
}
