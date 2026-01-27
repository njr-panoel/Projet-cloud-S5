import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-manager-layout',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <span>Manager</span>
      <span style="flex: 1 1 auto"></span>
      <a mat-button routerLink="/manager">Dashboard</a>
      <a mat-button routerLink="/manager/profil">Profil</a>
      <a mat-button routerLink="/manager/signalements">Signalements</a>
      <a mat-button routerLink="/manager/utilisateurs">Utilisateurs</a>
      <a mat-button routerLink="/">Public</a>
      <button mat-button type="button" (click)="auth.logout()">Déconnexion</button>
    </mat-toolbar>

    <div style="padding: 16px">
      <router-outlet />
    </div>
  `
})
export class ManagerLayoutComponent {
  protected readonly auth = inject(AuthService);
}
