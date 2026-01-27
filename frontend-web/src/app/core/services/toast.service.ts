import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ToastNotificationComponent } from '../../shared/components/toast-notification/toast-notification.component';

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly snack = inject(MatSnackBar);

  show(message: string, variant: ToastVariant = 'info', durationMs = 3000) {
    this.snack.openFromComponent(ToastNotificationComponent, {
      duration: durationMs,
      data: { message, variant },
      panelClass: [`ri-toast`, `ri-toast-${variant}`]
    });
  }

  success(message: string, durationMs = 2500) {
    this.show(message, 'success', durationMs);
  }

  warning(message: string, durationMs = 3500) {
    this.show(message, 'warning', durationMs);
  }

  danger(message: string, durationMs = 3500) {
    this.show(message, 'danger', durationMs);
  }
}
