import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <span>Suivi des travaux routiers</span>
      <span style="flex: 1 1 auto"></span>
      <a mat-button routerLink="/">Tableau de bord</a>
      <a mat-button routerLink="/carte">Carte</a>

      @if (!auth.isAuthenticated()) {
        <a mat-button routerLink="/auth/login">Connexion</a>
      }

      @if (auth.isAuthenticated() && auth.isManager()) {
        <a mat-button routerLink="/manager">Manager</a>
      }

      @if (auth.isAuthenticated()) {
        <button mat-button type="button" (click)="auth.logout()">Déconnexion</button>
      }
    </mat-toolbar>

    <div style="padding: 16px">
      <router-outlet />
    </div>
  `
})
export class PublicLayoutComponent {
  protected readonly auth = inject(AuthService);
}
