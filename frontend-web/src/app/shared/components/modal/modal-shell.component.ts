import { Component, Input } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'app-modal-shell',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ title }}</h2>
    <div mat-dialog-content>
      <ng-content />
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close type="button">Fermer</button>
    </div>
  `
})
export class ModalShellComponent {
  @Input({ required: true }) title!: string;
}
