import { AsyncPipe } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, OnDestroy, inject, viewChild } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

import { PublicDataService } from '../services/public-data.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [AsyncPipe, MatCardModule, MatProgressSpinnerModule, MatProgressBarModule],
  template: `
    <div style="display:flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
      <h1 style="margin: 0;">Tableau de bord</h1>
      <div style="opacity: 0.75;">Vue globale des signalements</div>
    </div>

    @if (vm$ | async; as vm) {
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 16px;">
        <mat-card>
          <mat-card-title>Signalements</mat-card-title>
          <mat-card-content>{{ vm.nbPoints }}</mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-title>Nouveaux</mat-card-title>
          <mat-card-content>{{ vm.nbNouveau }}</mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-title>En cours</mat-card-title>
          <mat-card-content>{{ vm.nbEnCours }}</mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-title>Terminés</mat-card-title>
          <mat-card-content>{{ vm.nbTermine }}</mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-title>Surface totale (m²)</mat-card-title>
          <mat-card-content>{{ vm.totalSurfaceM2 }}</mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-title>Budget total</mat-card-title>
          <mat-card-content>{{ vm.totalBudget }}</mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-title>Avancement</mat-card-title>
          <mat-card-content>
            <div style="display:flex; align-items:center; justify-content: space-between; gap: 12px;">
              <div style="font-weight: 600;">{{ vm.avancementPercent }}%</div>
              <div style="opacity: 0.75;">global</div>
            </div>
            <mat-progress-bar mode="determinate" [value]="vm.avancementPercent" />
          </mat-card-content>
        </mat-card>

        <mat-card style="grid-column: 1 / -1;">
          <mat-card-title>Répartition par statut</mat-card-title>
          <mat-card-content>
            <canvas #chart style="width: 100%; height: 220px;"></canvas>
          </mat-card-content>
        </mat-card>

        <mat-card style="grid-column: 1 / -1;">
          <mat-card-title>Derniers signalements</mat-card-title>
          <mat-card-content>
            @if (latest$ | async; as latest) {
              @if (latest.length === 0) {
                <div>Aucun signalement.</div>
              } @else {
                <div style="display: grid; gap: 10px;">
                  @for (s of latest; track s.id) {
                    <div style="padding: 10px; border: 1px solid rgba(0,0,0,.08); border-radius: 12px;">
                      <div style="display:flex; justify-content: space-between; gap: 12px;">
                        <div style="font-weight: 700;">#{{ s.id }} - {{ s.statut }}</div>
                        <div style="opacity: 0.75;">{{ s.dateCreation }}</div>
                      </div>
                      <div style="margin-top: 4px;">{{ s.description }}</div>
                    </div>
                  }
                </div>
              }
            }
          </mat-card-content>
        </mat-card>
      </div>
    } @else {
      <div style="padding-top: 24px; display:flex; justify-content:center;">
        <mat-progress-spinner mode="indeterminate" />
      </div>
    }
  `
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  private readonly data = inject(PublicDataService);
  private readonly destroyRef = inject(DestroyRef);

  private chart: Chart | null = null;

  protected readonly vm$ = this.data.getStats();
  protected readonly latest$ = this.data.getLatestSignalements(6);

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
