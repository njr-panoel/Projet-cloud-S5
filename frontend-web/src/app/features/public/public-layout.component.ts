import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  standalone: true,
  selector: 'app-public-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <div class="app-public">
      <mat-toolbar color="primary" class="app-toolbar">
        <span class="app-title">Road Issues</span>
        <span style="flex: 1 1 auto"></span>
        @if (!isMobile()) {
          <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            Tableau de bord
          </a>
          <a mat-button routerLink="/carte" routerLinkActive="active">Carte</a>
          <a mat-button routerLink="/signalements" routerLinkActive="active">Signalements</a>

          @if (canReport()) {
            <a mat-button routerLink="/signaler" routerLinkActive="active">Signaler</a>
          }

          @if (isManager()) {
            <a mat-button routerLink="/manager" routerLinkActive="active">Manager</a>
          }

          @if (!isAuthenticated()) {
            <a mat-button routerLink="/auth/login" routerLinkActive="active">Connexion</a>
            <a mat-button routerLink="/auth/register" routerLinkActive="active">Inscription</a>
          } @else {
            <button mat-button type="button" (click)="auth.logout()" aria-label="Se déconnecter">Déconnexion</button>
          }
        } @else {
          <button mat-icon-button [matMenuTriggerFor]="menu" type="button" aria-label="Ouvrir le menu">
            <mat-icon aria-hidden="true">menu</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <a
              mat-menu-item
              routerLink="/"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
            >
              <mat-icon aria-hidden="true">dashboard</mat-icon>
              <span>Tableau de bord</span>
            </a>
            <a mat-menu-item routerLink="/carte" routerLinkActive="active">
              <mat-icon aria-hidden="true">map</mat-icon>
              <span>Carte</span>
            </a>
            <a mat-menu-item routerLink="/signalements" routerLinkActive="active">
              <mat-icon aria-hidden="true">list</mat-icon>
              <span>Signalements</span>
            </a>

            @if (canReport()) {
              <a mat-menu-item routerLink="/signaler" routerLinkActive="active">
                <mat-icon aria-hidden="true">add_location_alt</mat-icon>
                <span>Signaler</span>
              </a>
            }

            @if (isManager()) {
              <a mat-menu-item routerLink="/manager" routerLinkActive="active">
                <mat-icon aria-hidden="true">admin_panel_settings</mat-icon>
                <span>Manager</span>
              </a>
            }

            @if (!isAuthenticated()) {
              <a mat-menu-item routerLink="/auth/login" routerLinkActive="active">
                <mat-icon aria-hidden="true">login</mat-icon>
                <span>Connexion</span>
              </a>
              <a mat-menu-item routerLink="/auth/register" routerLinkActive="active">
                <mat-icon aria-hidden="true">person_add</mat-icon>
                <span>Inscription</span>
              </a>
            } @else {
              <button mat-menu-item type="button" (click)="auth.logout()" aria-label="Se déconnecter">
                <mat-icon aria-hidden="true">logout</mat-icon>
                <span>Déconnexion</span>
              </button>
            }
          </mat-menu>
        }

        <button mat-icon-button type="button" (click)="theme.toggle()" aria-label="Basculer le thème">
          <mat-icon aria-hidden="true">{{ theme.theme() === 'dark' ? 'dark_mode' : 'light_mode' }}</mat-icon>
        </button>
      </mat-toolbar>

      <main class="app-content">
        <router-outlet />
      </main>

      <footer class="app-footer">
        <div> Road Issues</div>
      </footer>
    </div>
  `
})
export class PublicLayoutComponent {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isMobile = signal(false);

  protected isAuthenticated() {
    return this.auth.isAuthenticated();
  }

  protected canReport() {
    const role = this.auth.getRole();
    return role === 'UTILISATEUR_MOBILE' || role === 'MANAGER';
  }

  protected isManager() {
    return this.auth.isManager();
  }

  constructor() {
    this.breakpointObserver
      .observe(['(max-width: 900px)'])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => this.isMobile.set(state.matches));
  }
}
