import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';

import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  standalone: true,
  selector: 'app-manager-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LayoutModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  template: `
    <mat-sidenav-container class="app-shell">
      <mat-sidenav
        #sidenav
        class="app-sidenav"
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        aria-label="Menu manager"
      >
        <div class="app-brand">Manager</div>

        <mat-nav-list>
          <a mat-list-item routerLink="/manager" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            <mat-icon matListItemIcon aria-hidden="true">dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/manager/signalements" routerLinkActive="active">
            <mat-icon matListItemIcon aria-hidden="true">report</mat-icon>
            <span matListItemTitle>Signalements</span>
          </a>
          <a mat-list-item routerLink="/carte" routerLinkActive="active">
            <mat-icon matListItemIcon aria-hidden="true">map</mat-icon>
            <span matListItemTitle>Carte</span>
          </a>
          <a mat-list-item routerLink="/manager/utilisateurs" routerLinkActive="active">
            <mat-icon matListItemIcon aria-hidden="true">group</mat-icon>
            <span matListItemTitle>Utilisateurs</span>
          </a>
          <a mat-list-item routerLink="/manager/sync" routerLinkActive="active">
            <mat-icon matListItemIcon aria-hidden="true">sync</mat-icon>
            <span matListItemTitle>Synchronisation</span>
          </a>
          <a mat-list-item routerLink="/manager/profil" routerLinkActive="active">
            <mat-icon matListItemIcon aria-hidden="true">person</mat-icon>
            <span matListItemTitle>Profil</span>
          </a>
          <a mat-list-item routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            <mat-icon matListItemIcon aria-hidden="true">public</mat-icon>
            <span matListItemTitle>Public</span>
          </a>
        </mat-nav-list>

        <div class="app-sidenav-footer">
          <div style="display:flex; gap: 8px; flex-wrap: wrap;">
            <button mat-stroked-button type="button" (click)="theme.toggle()" aria-label="Basculer le thème">
              <mat-icon aria-hidden="true">{{ theme.theme() === 'dark' ? 'dark_mode' : 'light_mode' }}</mat-icon>
              Thème
            </button>
            <button mat-raised-button color="primary" type="button" (click)="auth.logout()">Déconnexion</button>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="app-toolbar">
          @if (isMobile()) {
            <button mat-icon-button type="button" (click)="sidenav.toggle()" aria-label="Ouvrir le menu">
              <mat-icon aria-hidden="true">menu</mat-icon>
            </button>
          }
          <span class="app-title">Espace manager</span>
          <span style="flex: 1 1 auto"></span>
          <button mat-icon-button type="button" (click)="theme.toggle()" aria-label="Basculer le thème">
            <mat-icon aria-hidden="true">{{ theme.theme() === 'dark' ? 'dark_mode' : 'light_mode' }}</mat-icon>
          </button>
        </mat-toolbar>

        <main class="app-content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `
})
export class ManagerLayoutComponent {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isMobile = signal(false);

  constructor() {
    this.breakpointObserver
      .observe(['(max-width: 900px)'])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => this.isMobile.set(state.matches));
  }
}
