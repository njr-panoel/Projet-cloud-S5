import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-public-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule
  ],
  template: `
    <div class="app-public">
      <mat-toolbar color="primary" class="app-toolbar">
        <span class="app-title">Road Issues</span>
        <span style="flex: 1 1 auto"></span>
        <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          Tableau de bord
        </a>
        <a mat-button routerLink="/carte" routerLinkActive="active">Carte</a>
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
export class PublicLayoutComponent {}
