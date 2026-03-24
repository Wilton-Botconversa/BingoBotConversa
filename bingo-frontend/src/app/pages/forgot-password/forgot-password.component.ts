import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="logo">BINGO</h1>
        <h2>Recuperar Senha</h2>

        <div class="success" *ngIf="sent">
          Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.
        </div>

        <div class="error" *ngIf="error">{{ error }}</div>

        <div class="form-group" *ngIf="!sent">
          <label>E-mail</label>
          <input type="email" [(ngModel)]="email" placeholder="seu@email.com" />
        </div>

        <button class="btn-primary" (click)="onSubmit()" [disabled]="loading" *ngIf="!sent">
          {{ loading ? 'Enviando...' : 'Enviar link de recuperação' }}
        </button>

        <p class="back-link">
          <a routerLink="/login">Voltar ao login</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f5f5f5;
    }

    .auth-card {
      background: white;
      padding: 48px 40px;
      border-radius: 16px;
      box-shadow: 0 2px 20px rgba(0,0,0,0.08);
      width: 100%;
      max-width: 420px;
    }

    .logo {
      font-size: 32px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 8px;
      color: #9C27B0;
    }

    h2 {
      text-align: center;
      margin-bottom: 32px;
      color: #333;
      font-size: 20px;
    }

    .form-group {
      margin-bottom: 24px;

      label {
        display: block;
        margin-bottom: 6px;
        font-size: 14px;
        font-weight: 500;
        color: #555;
      }
    }

    .success {
      background: #e8f5e9;
      color: #2e7d32;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .error {
      background: #ffebee;
      color: #c62828;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .back-link {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;

      a {
        color: #9C27B0;
        font-weight: 600;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  `]
})
export class ForgotPasswordComponent {
  email = '';
  error = '';
  loading = false;
  sent = false;

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.sent = true;
        this.loading = false;
      },
      error: () => {
        this.sent = true;
        this.loading = false;
      }
    });
  }
}
