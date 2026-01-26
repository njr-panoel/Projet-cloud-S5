import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h1>Connexion</h1>

    <mat-card>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" style="width: 100%">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email" />
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 100%">
            <mat-label>Mot de passe</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="current-password" />
          </mat-form-field>

          @if (blockedMessage(); as msg) {
            <div style="color: #b00020; margin-bottom: 12px;">{{ msg }}</div>
          }

          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || isBlocked()">
            Se connecter
          </button>

          <a mat-button routerLink="/auth/register" type="button">Créer un compte</a>
        </form>
      </mat-card-content>
    </mat-card>
  `
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  protected isBlocked(): boolean {
    const email = this.form.value.email ?? '';
    return email ? this.auth.isLoginBlocked(email) : false;
  }

  protected blockedMessage(): string | null {
    const email = this.form.value.email ?? '';
    if (!email || !this.auth.isLoginBlocked(email)) {
      return null;
    }

    const until = this.auth.getBlockedUntil(email);
    if (!until) {
      return 'Compte temporairement bloqué.';
    }

    const seconds = Math.max(0, Math.ceil((until - Date.now()) / 1000));
    const minutes = Math.ceil(seconds / 60);
    return `Compte bloqué après 3 tentatives. Réessayez dans ~${minutes} minute(s).`;
  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    const email = this.form.value.email ?? '';
    const password = this.form.value.password ?? '';

    this.auth.login({ email, password }).subscribe({
      next: () => {
        if (this.auth.isManager()) {
          this.router.navigateByUrl('/manager');
        } else {
          this.router.navigateByUrl('/');
        }
      },
      error: () => {
        // message minimal, la gestion d'erreur UI viendra ensuite
      }
    });
  }
}
