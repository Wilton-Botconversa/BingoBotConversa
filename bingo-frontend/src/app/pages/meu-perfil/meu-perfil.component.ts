import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-meu-perfil',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <h1 class="page-title">Editar Cadastro</h1>

    <div class="profile-form" *ngIf="user">
      <div class="form-group">
        <label>Seu Nome</label>
        <input type="text" [(ngModel)]="user.name" />
      </div>

      <div class="form-group">
        <label>Seu Telefone com DDI</label>
        <input type="text" [(ngModel)]="user.phone" />
      </div>

      <div class="form-group">
        <label>Foto de Perfil</label>
        <div class="photo-container">
          <div class="photo-wrapper">
            <img *ngIf="user.profilePhotoUrl" [src]="user.profilePhotoUrl" alt="Foto de perfil" class="profile-photo" />
            <div *ngIf="!user.profilePhotoUrl" class="photo-placeholder">{{ user.name?.charAt(0) || '?' }}</div>
          </div>
          <label class="photo-btn">
            Escolher foto
            <input type="file" (change)="onPhotoSelected($event)" accept="image/*" hidden />
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>Seu E-mail</label>
        <input type="email" [(ngModel)]="user.email" />
      </div>

      <div class="success" *ngIf="success">Perfil atualizado com sucesso!</div>
      <div class="error" *ngIf="error">{{ error }}</div>

      <button class="btn-primary" (click)="onUpdate()" [disabled]="loading">
        {{ loading ? 'Atualizando...' : 'Atualizar' }}
      </button>

      <hr class="divider" />

      <h2 class="section-title">Alterar Senha</h2>

      <div class="form-group">
        <label>Senha Atual</label>
        <input type="password" [(ngModel)]="currentPassword" placeholder="Senha atual" />
      </div>

      <div class="form-group">
        <label>Nova Senha</label>
        <input type="password" [(ngModel)]="newPassword" placeholder="Mínimo 6 caracteres" />
      </div>

      <div class="form-group">
        <label>Confirmar Nova Senha</label>
        <input type="password" [(ngModel)]="confirmNewPassword" placeholder="Repita a nova senha" />
      </div>

      <div class="success" *ngIf="passwordSuccess">Senha alterada com sucesso!</div>
      <div class="error" *ngIf="passwordError">{{ passwordError }}</div>

      <button class="btn-primary" (click)="onChangePassword()" [disabled]="changingPassword">
        {{ changingPassword ? 'Alterando...' : 'Alterar Senha' }}
      </button>
    </div>
  `,
  styles: [`
    .page-title {
      font-size: 24px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 32px;
    }

    .profile-form {
      max-width: 400px;
      margin: 0 auto;
    }

    .form-group {
      margin-bottom: 24px;

      label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }
    }

    .photo-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .photo-wrapper {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid #eee;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
    }
    .profile-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .photo-placeholder {
      font-size: 40px;
      font-weight: 700;
      color: #9C27B0;
    }
    .photo-btn {
      display: inline-block;
      padding: 8px 20px;
      background: #9C27B0;
      color: white;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .photo-btn:hover {
      background: #7B1FA2;
    }

    .success {
      background: #e8f5e9;
      color: #2e7d32;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 14px;
    }

    .error {
      background: #ffebee;
      color: #c62828;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 14px;
    }
    .divider {
      border: none;
      border-top: 1px solid #eee;
      margin: 32px 0;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #333;
    }
  `]
})
export class MeuPerfilComponent implements OnInit {
  user: User | null = null;
  loading = false;
  success = false;
  error = '';
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  changingPassword = false;
  passwordSuccess = false;
  passwordError = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (user) => this.user = user,
      error: () => this.error = 'Erro ao carregar perfil'
    });
  }

  onUpdate(): void {
    if (!this.user) return;
    this.loading = true;
    this.success = false;
    this.error = '';

    this.userService.updateProfile({
      name: this.user.name,
      phone: this.user.phone,
      email: this.user.email
    }).subscribe({
      next: (updated) => {
        this.user = updated;
        this.success = true;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Erro ao atualizar perfil';
        this.loading = false;
      }
    });
  }

  onChangePassword(): void {
    this.passwordError = '';
    this.passwordSuccess = false;

    if (this.newPassword.length < 6) {
      this.passwordError = 'A nova senha deve ter no mínimo 6 caracteres';
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.passwordError = 'As senhas não coincidem';
      return;
    }

    this.changingPassword = true;
    this.userService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.passwordSuccess = true;
        this.changingPassword = false;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
      },
      error: (err) => {
        this.passwordError = err.error?.error || 'Erro ao alterar senha';
        this.changingPassword = false;
      }
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.userService.uploadPhoto(input.files[0]).subscribe({
        next: (updated) => this.user = updated,
        error: () => this.error = 'Erro ao enviar foto'
      });
    }
  }
}
