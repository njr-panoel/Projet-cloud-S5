import { Component, Input } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-stats-card',
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card class="ri-stats-card" [attr.data-variant]="variant">
      <mat-card-content class="ri-stats-card-content">
        <div class="ri-stats-card-header">
          <div class="ri-stats-card-title">{{ title }}</div>
          @if (icon) {
            <mat-icon aria-hidden="true">{{ icon }}</mat-icon>
          }
        </div>
        <div class="ri-stats-card-value">{{ value }}</div>
        @if (subtitle) {
          <div class="ri-stats-card-subtitle">{{ subtitle }}</div>
        }
      </mat-card-content>
    </mat-card>
  `
})
export class StatsCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string | number;
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}
