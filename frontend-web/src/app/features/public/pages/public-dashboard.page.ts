import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { StatsService } from '../../../core/services/stats.service';

@Component({
  standalone: true,
  selector: 'app-public-dashboard-page',
  imports: [AsyncPipe, MatCardModule, MatProgressSpinnerModule],
  template: `
    <h1>Tableau de bord</h1>

    @if (vm$ | async; as vm) {
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
        <mat-card>
          <mat-card-title>Signalements</mat-card-title>
          <mat-card-content>{{ vm.nbPoints }}</mat-card-content>
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
          <mat-card-content>{{ vm.avancementPercent }} %</mat-card-content>
        </mat-card>
      </div>
    } @else {
      <mat-progress-spinner mode="indeterminate" />
    }
  `
})
export class PublicDashboardPage {
  private readonly stats = inject(StatsService);

  protected readonly vm$ = this.stats.getStats();
}
