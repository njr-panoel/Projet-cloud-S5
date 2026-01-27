import { Component, DestroyRef, inject } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-manager-profile-page',
  imports: [MatCardModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <h1>Mon compte</h1>

    <mat-card>
      <mat-card-title>Informations</mat-card-title>
      <mat-card-content>
        @if (auth.user(); as u) {
          <div style="display:grid; gap: 6px;">
            <div><strong>Email:</strong> {{ u.email }}</div>
            <div><strong>Nom:</strong> {{ u.nom }}</div>
            <div><strong>Rôle:</strong> {{ u.role }}</div>
          </div>
        } @else {
          <div>Non connecté.</div>
        }

        @if (message) {
          <div style="margin-top: 12px;" [style.color]="messageColor">{{ message }}</div>
        }

        <div style="margin-top: 12px; display:flex; gap: 10px; align-items:center; flex-wrap: wrap;">
          <button mat-raised-button color="primary" type="button" (click)="refresh()" [disabled]="loading">
            @if (loading) {
              <mat-progress-spinner diameter="18" mode="indeterminate" />
            } @else {
              Rafraîchir
            }
          </button>

          <button mat-button type="button" (click)="auth.logout()">Déconnexion</button>
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
  protected messageColor = '#0f172a';

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
          this.messageColor = '#2e7d32';
        },
        error: () => {
          this.loading = false;
          this.message = 'Impossible de vérifier la session.';
          this.messageColor = '#b00020';
        }
      });
  }
}
