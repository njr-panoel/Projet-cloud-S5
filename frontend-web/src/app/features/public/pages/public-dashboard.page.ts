import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { StatsService } from '../../../core/services/stats.service';

@Component({
  standalone: true,
  selector: 'app-public-dashboard-page',
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
      </div>
    } @else {
      <div style="padding-top: 24px; display:flex; justify-content:center;">
        <mat-progress-spinner mode="indeterminate" />
      </div>
    }
  `
})
export class PublicDashboardPage {
  private readonly stats = inject(StatsService);

  protected readonly vm$ = this.stats.getStats();
}
