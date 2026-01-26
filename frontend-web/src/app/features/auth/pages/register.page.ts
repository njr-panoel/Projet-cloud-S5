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
  selector: 'app-register-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h1>Créer un compte</h1>

    <mat-card>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" style="width: 100%">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="nom" autocomplete="name" />
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 100%">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email" />
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 100%">
            <mat-label>Mot de passe</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="new-password" />
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
            S'inscrire
          </button>

          <a mat-button routerLink="/auth/login" type="button">Déjà un compte ?</a>
        </form>
      </mat-card-content>
    </mat-card>
  `
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit() {
    if (this.form.invalid) {
      return;
    }

    const nom = this.form.value.nom ?? '';
    const email = this.form.value.email ?? '';
    const password = this.form.value.password ?? '';

    this.auth.register({ nom, email, password }).subscribe({
      next: () => {
        this.router.navigateByUrl('/');
      },
      error: () => {
        // à compléter avec un message UI
      }
    });
  }
}
