import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { SignalementsService } from '../../../core/services/signalements.service';

@Component({
  standalone: true,
  selector: 'app-manager-signalements-page',
  imports: [AsyncPipe, MatCardModule, MatButtonModule],
  template: `
    <h1>Gestion des signalements</h1>

    <mat-card>
      <mat-card-content>
        @if (page$ | async; as page) {
          <div>Résultats: {{ page.totalElements }}</div>
          <div style="margin-top: 12px; display: grid; gap: 10px;">
            @for (s of page.content; track s.id) {
              <div style="padding: 10px; border: 1px solid rgba(0,0,0,.1); border-radius: 10px;">
                <div><strong>#{{ s.id }}</strong> - {{ s.statut }}</div>
                <div>{{ s.description }}</div>
                <div style="opacity: 0.75">{{ s.latitude }}, {{ s.longitude }}</div>
              </div>
            }
          </div>
        } @else {
          Chargement...
        }
      </mat-card-content>
    </mat-card>
  `
})
export class ManagerSignalementsPage {
  private readonly signalements = inject(SignalementsService);

  protected readonly page$ = this.signalements.list({ page: 0, size: 50 });
}
