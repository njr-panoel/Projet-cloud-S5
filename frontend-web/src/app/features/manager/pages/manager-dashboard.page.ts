import { Component } from '@angular/core';

import { MatCardModule } from '@angular/material/card';

@Component({
  standalone: true,
  selector: 'app-manager-dashboard-page',
  imports: [MatCardModule],
  template: `
    <h1>Dashboard manager</h1>

    <mat-card>
      <mat-card-content>
        Accès protégé. Depuis ici, vous pourrez gérer les signalements, synchroniser Firebase et débloquer des utilisateurs.
      </mat-card-content>
    </mat-card>
  `
})
export class ManagerDashboardPage {}
