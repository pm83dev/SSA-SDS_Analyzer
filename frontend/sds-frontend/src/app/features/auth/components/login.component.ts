import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <h1>SSA-SDS</h1>
        <p class="subtitle">Schede di Sicurezza Management</p>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Username</label>
            <input id="username" type="text" formControlName="username" class="form-control" placeholder="Inserisci username" />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" class="form-control" placeholder="Inserisci password" />
          </div>
          <div class="error-message" *ngIf="error">{{ error }}</div>
          <button type="submit" class="btn btn-primary" [disabled]="loginForm.invalid || isSubmitting">
            {{ isSubmitting ? 'Accesso in corso...' : 'Accedi' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .login-card {
      background: white;
      border-radius: 12px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .login-card h1 {
      margin: 0 0 4px 0;
      color: #2c3e50;
      font-size: 28px;
    }
    .subtitle {
      color: #7f8c8d;
      margin: 0 0 28px 0;
      font-size: 14px;
    }
    .form-group {
      margin-bottom: 18px;
    }
    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
      color: #2c3e50;
      font-size: 14px;
    }
    .form-control {
      width: 100%;
      padding: 11px 14px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      box-sizing: border-box;
    }
    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
    }
    .btn {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 15px;
      font-weight: 600;
    }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-primary:hover { background: #5a6fd6; }
    .btn-primary:disabled { background: #bdc3c7; cursor: not-allowed; }
    .error-message {
      color: #e74c3c;
      font-size: 13px;
      margin-bottom: 12px;
    }
  `]
})
export class LoginComponent {
  loginForm;
  isSubmitting = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.error = '';

    const { username, password } = this.loginForm.value;
    this.auth.login(username!, password!).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error = 'Credenziali non valide. Riprova.';
        this.isSubmitting = false;
      }
    });
  }
}
