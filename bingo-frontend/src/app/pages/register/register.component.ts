import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="logo">BINGO</h1>
        <h2>Criar Conta</h2>

        <div class="error" *ngIf="error">{{ error }}</div>

        <div class="form-group">
          <label>Nome</label>
          <input type="text" [(ngModel)]="name" placeholder="Seu nome completo" />
        </div>

        <div class="form-group">
          <label>E-mail</label>
          <input type="email" [(ngModel)]="email" placeholder="seu@email.com" />
        </div>

        <div class="form-group">
          <label>Telefone com DDI</label>
          <input type="text" [(ngModel)]="phone" placeholder="5511999998888" />
        </div>

        <div class="form-group">
          <label>Senha</label>
          <input type="password" [(ngModel)]="password" placeholder="Mínimo 6 caracteres" />
        </div>

        <button class="btn-primary" (click)="onRegister()" [disabled]="loading">
          {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
        </button>

        <p class="login-link">
          Já tem conta? <a routerLink="/login">Entrar</a>
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

    .error {
      background: #ffebee;
      color: #c62828;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .login-link {
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
export class RegisterComponent {
  name = '';
  email = '';
  phone = '';
  password = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    this.loading = true;
    this.error = '';

    this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password,
      phone: this.phone
    }).subscribe({
      next: () => {
        this.router.navigate(['/participantes']);
      },
      error: (err) => {
        this.error = err.error?.error || 'Erro ao cadastrar';
        this.loading = false;
      }
    });
  }
}
