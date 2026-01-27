import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

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
