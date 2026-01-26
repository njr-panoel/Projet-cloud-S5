import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AdminService } from '../../../core/services/admin.service';

@Component({
  standalone: true,
  selector: 'app-manager-users-page',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h1>Déblocage utilisateurs</h1>

    <mat-card>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" style="width: 100%">
            <mat-label>ID utilisateur</mat-label>
            <input matInput type="number" formControlName="userId" />
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
            Débloquer
          </button>
        </form>

        @if (message) {
          <div style="margin-top: 12px;">{{ message }}</div>
        }
      </mat-card-content>
    </mat-card>
  `
})
export class ManagerUsersPage {
  private readonly fb = inject(FormBuilder);
  private readonly admin = inject(AdminService);

  protected message: string | null = null;

  protected readonly form = this.fb.group({
    userId: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  submit() {
    this.message = null;
    if (this.form.invalid) {
      return;
    }

    const userId = this.form.value.userId as number;
    this.admin.unblockUser(userId).subscribe({
      next: () => {
        this.message = 'Utilisateur débloqué.';
      },
      error: () => {
        this.message = "Impossible de débloquer l'utilisateur.";
      }
    });
  }
}
