import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="ri-auth-container">
      <mat-card class="ri-auth-card">
        <mat-card-content>
          <div class="ri-auth-header">
            <h1>Connexion</h1>
            <p>Accédez à votre espace de suivi</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" style="width: 100%">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" placeholder="vous@exemple.com" />
              @if (form.controls.email.touched && form.controls.email.invalid) {
                <mat-error>
                  @if (form.controls.email.errors?.['required']) { Email requis. }
                  @if (form.controls.email.errors?.['email']) { Email invalide. }
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" style="width: 100%">
              <mat-label>Mot de passe</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="current-password" />
              @if (form.controls.password.touched && form.controls.password.invalid) {
                <mat-error>Mot de passe requis.</mat-error>
              }
            </mat-form-field>

            <mat-checkbox formControlName="remember" style="margin-bottom: 8px;">Rester connecté</mat-checkbox>

            @if (blockedMessage(); as msg) {
              <div class="ri-error-message">{{ msg }}</div>
            }

            @if (errorMessage) {
              <div class="ri-error-message">{{ errorMessage }}</div>
            }

            <div class="ri-auth-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || isBlocked() || loading">
                @if (loading) {
                  <mat-progress-spinner diameter="18" mode="indeterminate" />
                } @else {
                  Se connecter
                }
              </button>

              <a mat-button routerLink="/auth/register" type="button" style="text-align: center;">
                Pas encore de compte ? <strong>S'inscrire</strong>
              </a>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    remember: [true]
  });

  protected loading = false;
  protected errorMessage: string | null = null;

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

    this.errorMessage = null;
    this.loading = true;

    const email = this.form.value.email ?? '';
    const password = this.form.value.password ?? '';
    const remember = !!this.form.value.remember;
    const mode = remember ? 'local' : 'session';

    this.auth.login({ email, password }, mode).subscribe({
      next: () => {
        this.loading = false;
        const role = this.auth.getRole();
        if (role === 'MANAGER') {
          this.router.navigateByUrl('/manager');
          return;
        }
        if (role === 'UTILISATEUR_MOBILE') {
          this.router.navigateByUrl('/signaler');
          return;
        }
        this.router.navigateByUrl('/');
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de se connecter. Vérifiez vos identifiants.';
      }
    });
  }
}
