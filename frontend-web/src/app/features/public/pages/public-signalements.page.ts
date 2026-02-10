import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { AuthService } from '../../../core/services/auth.service';
import { SignalementsService } from '../../../core/services/signalements.service';
import { SignalementDto } from '../../../models/signalement.models';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { TableContainerComponent } from '../../../shared/components/table-container/table-container.component';

@Component({
  standalone: true,
  selector: 'app-public-signalements-page',
  imports: [
    AsyncPipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    LoaderComponent,
    TableContainerComponent
  ],
  template: `
    <div class="ri-page-header">
      <h1>Signalements</h1>
      <div class="ri-page-actions">
        <a mat-stroked-button routerLink="/carte">
          <mat-icon>map</mat-icon> Carte
        </a>
        @if (canReport()) {
          <a mat-raised-button color="primary" routerLink="/signaler">
            <mat-icon>add_location_alt</mat-icon> Signaler
          </a>
        }
      </div>
    </div>

    <mat-card>
      <mat-card-content>
        @if (signalements$ | async; as list) {
          @if (list.length === 0) {
            <div class="ri-empty-state">
              <mat-icon>inbox</mat-icon>
              <p>Aucun signalement pour le moment</p>
            </div>
          } @else {
            <app-table-container>
              <table mat-table [dataSource]="list" style="min-width: 900px;">
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

                <ng-container matColumnDef="typeTravaux">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let s">{{ s.typeTravaux }}</td>
                </ng-container>

                <ng-container matColumnDef="adresse">
                  <th mat-header-cell *matHeaderCellDef>Localisation</th>
                  <td mat-cell *matCellDef="let s">{{ s.adresse || (s.latitude + ', ' + s.longitude) }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            </app-table-container>
          }
        } @else {
          <app-loader label="Chargement des signalements…" />
        }
      </mat-card-content>
    </mat-card>
  `
})
export class PublicSignalementsPage {
  private readonly auth = inject(AuthService);
  private readonly signalements = inject(SignalementsService);

  protected canReport() {
    const role = this.auth.getRole();
    return role === 'UTILISATEUR_MOBILE' || role === 'MANAGER';
  }

  protected readonly displayedColumns: (keyof Pick<
    SignalementDto,
    'id' | 'createdAt' | 'titre' | 'statut' | 'typeTravaux' | 'adresse'
  >)[] = ['id', 'createdAt', 'titre', 'statut', 'typeTravaux', 'adresse'];

  protected readonly signalements$ = this.signalements.listAll();
}
