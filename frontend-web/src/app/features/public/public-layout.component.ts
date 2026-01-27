import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-public-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule
  ],
  template: `
    <mat-sidenav-container class="app-shell">
      <mat-sidenav #drawer mode="side" [opened]="true" class="app-sidenav">
        <div class="app-brand">Road Issues</div>

        <mat-nav-list>
          <a mat-list-item routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            Tableau de bord
          </a>
          <a mat-list-item routerLink="/carte" routerLinkActive="active">Carte</a>

          @if (!auth.isAuthenticated()) {
            <a mat-list-item routerLink="/auth/login" routerLinkActive="active">Connexion</a>
            <a mat-list-item routerLink="/auth/register" routerLinkActive="active">Inscription</a>
          }

          @if (auth.isAuthenticated() && auth.isManager()) {
            <a mat-list-item routerLink="/manager" routerLinkActive="active">Espace Manager</a>
          }
        </mat-nav-list>

        @if (auth.isAuthenticated()) {
          <div class="app-sidenav-footer">
            <button mat-button type="button" (click)="auth.logout()">Déconnexion</button>
          </div>
        }
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="app-toolbar">
          <button mat-button type="button" (click)="drawer.toggle()">Menu</button>
          <span class="app-title">Suivi des travaux routiers</span>
        </mat-toolbar>

        <div class="app-content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `
})
export class PublicLayoutComponent {
  protected readonly auth = inject(AuthService);
}
