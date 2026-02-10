import { AsyncPipe } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, OnDestroy, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';

import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

import { PublicDataService } from '../services/public-data.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { TableContainerComponent } from '../../../shared/components/table-container/table-container.component';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [
    AsyncPipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTableModule,
    LoaderComponent,
    StatsCardComponent,
    TableContainerComponent
  ],
  template: `
    <div class="ri-page-header">
      <h1>Tableau de bord</h1>
      <div class="ri-page-actions">
        <a mat-stroked-button routerLink="/carte">
          <mat-icon>map</mat-icon> Carte
        </a>
        <a mat-stroked-button routerLink="/signalements">
          <mat-icon>list_alt</mat-icon> Signalements
        </a>
      </div>
    </div>

    @if (vm$ | async; as vm) {
      <div class="ri-stats-grid ri-animate-in">
        <app-stats-card title="Total signalements" [value]="vm.nbPoints" icon="pin_drop" variant="primary" />
        <app-stats-card title="Nouveaux" [value]="vm.nbNouveau" icon="fiber_new" variant="danger" />
        <app-stats-card title="En cours" [value]="vm.nbEnCours" icon="autorenew" variant="warning" />
        <app-stats-card title="Terminés" [value]="vm.nbTermine" icon="check_circle" variant="success" />
        <app-stats-card title="Avancement" [value]="vm.avancementPercent + '%'" icon="trending_up" />
        <app-stats-card title="Surface totale (m\u00B2)" [value]="vm.totalSurfaceM2" icon="crop_square" />
        <app-stats-card title="Budget total" [value]="vm.totalBudget" icon="payments" />

        <mat-card class="ri-full-width">
          <mat-card-title>Avancement global</mat-card-title>
          <mat-card-content>
            <div style="display:flex; align-items:center; justify-content: space-between; gap: 12px; margin-bottom: 12px;">
              <div style="font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em;">{{ vm.avancementPercent }}%</div>
              <div style="color: var(--ri-text-secondary); font-size: 13px;">Progression globale des travaux</div>
            </div>
            <mat-progress-bar mode="determinate" [value]="vm.avancementPercent" />
          </mat-card-content>
        </mat-card>

        <mat-card class="ri-full-width">
          <mat-card-title>Répartition par statut</mat-card-title>
          <mat-card-content>
            <canvas #chart style="width: 100%; height: 240px;"></canvas>
          </mat-card-content>
        </mat-card>

        <mat-card class="ri-full-width">
          <mat-card-title>Derniers signalements</mat-card-title>
          <mat-card-content>
            @if (latest$ | async; as latest) {
              @if (latest.length === 0) {
                <div class="ri-empty-state">
                  <mat-icon>inbox</mat-icon>
                  <p>Aucun signalement pour le moment</p>
                </div>
              } @else {
                <app-table-container>
                  <table mat-table [dataSource]="latest" style="min-width: 700px;">
                    <ng-container matColumnDef="id">
                      <th mat-header-cell *matHeaderCellDef>ID</th>
                      <td mat-cell *matCellDef="let s">#{{ s.id }}</td>
                    </ng-container>

                    <ng-container matColumnDef="createdAt">
                      <th mat-header-cell *matHeaderCellDef>Date</th>
                      <td mat-cell *matCellDef="let s">{{ s.createdAt }}</td>
                    </ng-container>

                    <ng-container matColumnDef="titre">
                      <th mat-header-cell *matHeaderCellDef>Titre</th>
                      <td mat-cell *matCellDef="let s" style="font-weight: 500;">{{ s.titre }}</td>
                    </ng-container>

                    <ng-container matColumnDef="statut">
                      <th mat-header-cell *matHeaderCellDef>Statut</th>
                      <td mat-cell *matCellDef="let s">
                        <span
                          [class.ri-status-nouveau]="s.statut === 'NOUVEAU'"
                          [class.ri-status-en-cours]="s.statut === 'EN_COURS'"
                          [class.ri-status-termine]="s.statut === 'TERMINE'"
                          [class.ri-status-annule]="s.statut === 'ANNULE'"
                          class="ri-status"
                        >
                          {{ s.statut }}
                        </span>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="latestColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: latestColumns"></tr>
                  </table>
                </app-table-container>
              }
            } @else {
              <app-loader label="Chargement…" />
            }
          </mat-card-content>
        </mat-card>
      </div>
    } @else {
      <mat-card style="margin-top: 24px;">
        <mat-card-content>
          <app-loader label="Chargement des statistiques…" />
        </mat-card-content>
      </mat-card>
    }
  `
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  private readonly data = inject(PublicDataService);
  private readonly destroyRef = inject(DestroyRef);

  private chart: Chart | null = null;

  protected readonly vm$ = this.data.getStats();
  protected readonly latest$ = this.data.getLatestSignalements(6);

  protected readonly latestColumns = ['id', 'createdAt', 'titre', 'statut'];

  protected readonly chartEl = viewChild.required<ElementRef<HTMLCanvasElement>>('chart');

  ngAfterViewInit() {
    Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

    this.vm$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((vm) => {
      setTimeout(() => {
        const ctx = this.chartEl().nativeElement.getContext('2d');
        if (!ctx) {
          return;
        }

        this.chart?.destroy();

        this.chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Nouveau', 'En cours', 'Terminé'],
            datasets: [
              {
                label: 'Signalements',
                data: [vm.nbNouveau, vm.nbEnCours, vm.nbTermine],
                backgroundColor: ['#1976d2', '#f9a825', '#2e7d32'],
                borderRadius: 8
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      }, 0);
    });
  }

  ngOnDestroy() {
    this.chart?.destroy();
    this.chart = null;
  }
}
