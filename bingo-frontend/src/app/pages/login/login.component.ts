import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="logo">BINGO</h1>
        <h2>Entrar</h2>

        <div class="error" *ngIf="error">{{ error }}</div>

        <div class="form-group">
          <label>E-mail</label>
          <input type="email" [(ngModel)]="email" placeholder="seu@email.com" />
        </div>

        <div class="form-group">
          <label>Senha</label>
          <div class="password-wrapper">
            <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" placeholder="Sua senha" />
            <span class="eye-toggle" (click)="showPassword = !showPassword">{{ showPassword ? '🙈' : '👁️' }}</span>
          </div>
        </div>

        <a routerLink="/forgot-password" class="forgot-link">Esqueceu a senha?</a>

        <button class="btn-primary" (click)="onLogin()" [disabled]="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>

        <p class="register-link">
          Não tem conta? <a routerLink="/register">Cadastre-se</a>
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
      margin-bottom: 20px;

      label {
        display: block;
        margin-bottom: 6px;
        font-size: 14px;
        font-weight: 500;
        color: #555;
      }
    }

    .forgot-link {
      display: block;
      text-align: right;
      font-size: 13px;
      color: #9C27B0;
      margin-bottom: 24px;

      &:hover {
        text-decoration: underline;
      }
    }

    .error {
      background: #ffebee;
      color: #c62828;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .password-wrapper {
      position: relative;

      input {
        width: 100%;
        padding-right: 40px;
        box-sizing: border-box;
      }
    }

    .eye-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      font-size: 18px;
      user-select: none;
    }

    .register-link {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: #666;

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
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    this.loading = true;
    this.error = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/participantes']);
      },
      error: (err) => {
        this.error = err.error?.error || 'Erro ao fazer login';
        this.loading = false;
      }
    });
  }
}
