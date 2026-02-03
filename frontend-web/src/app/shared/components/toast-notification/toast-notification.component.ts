import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

type ToastData = {
  message: string;
  variant: 'info' | 'success' | 'warning' | 'danger';
};

@Component({
  standalone: true,
  selector: 'app-toast-notification',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="ri-toast-content" role="status" aria-live="polite">
      <mat-icon class="ri-toast-icon" aria-hidden="true">{{ icon }}</mat-icon>
      <div class="ri-toast-message">{{ data.message }}</div>
      <button mat-icon-button type="button" (click)="dismiss()" aria-label="Fermer la notification">
        <mat-icon aria-hidden="true">close</mat-icon>
      </button>
    </div>
  `
})
export class ToastNotificationComponent {
  protected readonly data = inject<ToastData>(MAT_SNACK_BAR_DATA);
  private readonly ref = inject(MatSnackBarRef<ToastNotificationComponent>);

  get icon() {
    switch (this.data.variant) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      default:
        return 'info';
    }
  }

  dismiss() {
    this.ref.dismiss();
  }
}
