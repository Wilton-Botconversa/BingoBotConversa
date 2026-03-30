import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="logo">BINGO</h1>
        <h2>Redefinir Senha</h2>

        <div class="success" *ngIf="success">
          {{ success }}
          <a routerLink="/login" class="back-link">Voltar ao login</a>
        </div>

        <div *ngIf="!success">
          <div class="error" *ngIf="error">{{ error }}</div>

          <div class="form-group">
            <label>Nova Senha</label>
            <div class="password-wrapper">
              <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" placeholder="Minimo 6 caracteres" />
              <span class="eye-toggle" (click)="showPassword = !showPassword">{{ showPassword ? '🙈' : '👁️' }}</span>
            </div>
          </div>

          <div class="form-group">
            <label>Confirmar Senha</label>
            <div class="password-wrapper">
              <input [type]="showConfirm ? 'text' : 'password'" [(ngModel)]="confirmPassword" placeholder="Repita a senha" />
              <span class="eye-toggle" (click)="showConfirm = !showConfirm">{{ showConfirm ? '🙈' : '👁️' }}</span>
            </div>
          </div>

          <button class="btn-primary" (click)="onSubmit()" [disabled]="loading">
            {{ loading ? 'Redefinindo...' : 'Redefinir Senha' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
    .auth-card { background: white; padding: 48px 40px; border-radius: 16px; box-shadow: 0 2px 20px rgba(0,0,0,0.08); width: 100%; max-width: 420px; }
    .logo { font-size: 32px; font-weight: 700; text-align: center; margin-bottom: 8px; color: #9C27B0; }
    h2 { text-align: center; margin-bottom: 32px; color: #333; font-size: 20px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #555; }
    .form-group input { width: 100%; padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; }
    .form-group input:focus { border-color: #9C27B0; }
    .btn-primary { width: 100%; padding: 14px; background: #1a237e; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; }
    .btn-primary:hover { background: #0d1757; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .password-wrapper { position: relative; }
    .password-wrapper input { width: 100%; padding-right: 40px; box-sizing: border-box; }
    .eye-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; font-size: 18px; user-select: none; }
    .error { background: #ffebee; color: #c62828; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
    .success { background: #E8F5E9; color: #2E7D32; padding: 16px; border-radius: 8px; text-align: center; font-size: 14px; }
    .back-link { display: block; margin-top: 12px; color: #9C27B0; font-weight: 600; }
  `]
})
export class ResetPasswordComponent implements OnInit {
  password = '';
  confirmPassword = '';
  token = '';
  loading = false;
  error = '';
  success = '';
  showPassword = false;
  showConfirm = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.error = 'Token de recuperacao nao encontrado';
    }
  }

  onSubmit(): void {
    if (this.password.length < 6) {
      this.error = 'A senha deve ter no minimo 6 caracteres';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'As senhas nao coincidem';
      return;
    }

    this.loading = true;
    this.error = '';
    this.authService.resetPassword(this.token, this.password).subscribe({
      next: () => {
        this.success = 'Senha redefinida com sucesso!';
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Erro ao redefinir senha';
        this.loading = false;
      }
    });
  }
}
