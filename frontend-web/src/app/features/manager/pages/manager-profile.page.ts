import { Component, DestroyRef, inject } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-manager-profile-page',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="ri-page-header">
      <h1>Mon compte</h1>
    </div>

    <mat-card class="ri-animate-in">
      <mat-card-title>Informations</mat-card-title>
      <mat-card-content>
        @if (auth.user(); as u) {
          <div style="display:grid; gap: 12px;">
            <div style="display:flex; align-items:center; gap: 8px;">
              <mat-icon style="color: var(--ri-text-secondary)">email</mat-icon>
              <div><strong>Email:</strong> {{ u.email }}</div>
            </div>
            <div style="display:flex; align-items:center; gap: 8px;">
              <mat-icon style="color: var(--ri-text-secondary)">person</mat-icon>
              <div><strong>Nom:</strong> {{ u.nom }}</div>
            </div>
            <div style="display:flex; align-items:center; gap: 8px;">
              <mat-icon style="color: var(--ri-text-secondary)">badge</mat-icon>
              <div><strong>Rôle:</strong> {{ u.role }}</div>
            </div>
          </div>
        } @else {
          <div class="ri-empty-state">
            <mat-icon>person_off</mat-icon>
            <p>Non connecté.</p>
          </div>
        }

        @if (message) {
          <div style="margin-top: 16px; padding: 12px 16px; border-radius: var(--ri-radius-md); font-weight: 500;"
               [style.color]="messageColor"
               [style.background]="messageColor === 'var(--ri-success)' ? 'var(--ri-success-light)' : 'var(--ri-danger-light)'">
            {{ message }}
          </div>
        }

        <div style="margin-top: 20px; display:flex; gap: 12px; align-items:center; flex-wrap: wrap;">
          <button mat-raised-button color="primary" type="button" (click)="refresh()" [disabled]="loading">
            @if (loading) {
              <mat-progress-spinner diameter="18" mode="indeterminate" />
            } @else {
              <ng-container><mat-icon>refresh</mat-icon> Rafraîchir</ng-container>
            }
          </button>

          <button mat-stroked-button type="button" (click)="auth.logout()">
            <mat-icon>logout</mat-icon> Déconnexion
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `
})
export class ManagerProfilePage {
  protected readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected loading = false;
  protected message: string | null = null;
  protected messageColor = 'var(--ri-text)';

  refresh() {
    this.message = null;
    this.loading = true;

    this.auth
      .loadProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading = false;
          this.message = 'Session vérifiée.';
          this.messageColor = 'var(--ri-success)';
        },
        error: () => {
          this.loading = false;
          this.message = 'Impossible de vérifier la session.';
          this.messageColor = 'var(--ri-danger)';
        }
      });
  }
}
