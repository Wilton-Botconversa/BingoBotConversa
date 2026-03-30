import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="page-title">Usuários Cadastrados</h1>

    <div class="card">
      <div class="card-header">
        <span class="count">Total de {{ users.length }} usuários</span>
      </div>

      <table class="users-table" *ngIf="users.length > 0">
        <thead>
          <tr>
            <th>Usuário</th>
            <th>E-mail</th>
            <th>Telefone</th>
            <th>Papel</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users">
            <td class="user-cell">
              <div class="avatar">
                <img *ngIf="user.profilePhotoUrl" [src]="user.profilePhotoUrl" [alt]="user.name" />
                <span *ngIf="!user.profilePhotoUrl">{{ user.name.charAt(0) }}</span>
              </div>
              <span>{{ user.name }}</span>
            </td>
            <td>{{ user.email }}</td>
            <td>{{ user.phone || '-' }}</td>
            <td>
              <span class="role-badge" [class.admin]="user.role === 'ADMIN'" [class.user-role]="user.role === 'USER'">
                {{ user.role }}
              </span>
            </td>
            <td class="action-cell">
              <button class="btn-toggle" [class.btn-remove]="user.role === 'ADMIN'" [class.btn-promote]="user.role === 'USER'" (click)="toggleAdmin(user)">
                {{ user.role === 'ADMIN' ? 'Remover Admin' : 'Tornar Admin' }}
              </button>
              <button class="btn-delete" (click)="deleteUser(user)">
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p class="empty" *ngIf="users.length === 0">Nenhum usuário cadastrado.</p>
    </div>

    <div class="error" *ngIf="error">{{ error }}</div>
  `,
  styles: [`
    .page-title {
      font-size: 24px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 32px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 24px 32px;
      box-shadow: 0 1px 8px rgba(0,0,0,0.06);
      max-width: 900px;
      margin: 0 auto;
    }
    .card-header {
      margin-bottom: 20px;
    }
    .count {
      font-size: 15px;
      color: #666;
    }
    .users-table {
      width: 100%;
      border-collapse: collapse;
    }
    .users-table th {
      text-align: left;
      padding: 10px 12px;
      font-size: 13px;
      font-weight: 600;
      color: #888;
      border-bottom: 2px solid #eee;
    }
    .users-table td {
      padding: 12px;
      font-size: 14px;
      border-bottom: 1px solid #f0f0f0;
      vertical-align: middle;
    }
    .user-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      overflow: hidden;
      background: #9C27B0;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      flex-shrink: 0;
    }
    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .role-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .role-badge.admin {
      background: #E8F5E9;
      color: #2E7D32;
    }
    .role-badge.user-role {
      background: #F3E5F5;
      color: #7B1FA2;
    }
    .btn-toggle {
      padding: 6px 16px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-promote {
      background: #4CAF50;
      color: white;
    }
    .btn-promote:hover {
      background: #388E3C;
    }
    .btn-remove {
      background: #ef5350;
      color: white;
    }
    .btn-remove:hover {
      background: #c62828;
    }
    .action-cell {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .btn-delete {
      padding: 6px 16px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      background: #333;
      color: white;
      transition: background 0.2s;
    }
    .btn-delete:hover {
      background: #000;
    }
    .empty {
      text-align: center;
      color: #999;
      padding: 20px;
    }
    .error {
      background: #ffebee;
      color: #c62828;
      padding: 12px;
      border-radius: 8px;
      margin-top: 16px;
      font-size: 14px;
      max-width: 900px;
      margin-left: auto;
      margin-right: auto;
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  error = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users) => this.users = users,
      error: () => this.error = 'Erro ao carregar usuários'
    });
  }

  toggleAdmin(user: User): void {
    this.adminService.toggleAdmin(user.id).subscribe({
      next: (updated) => {
        const idx = this.users.findIndex(u => u.id === updated.id);
        if (idx >= 0) this.users[idx] = updated;
      },
      error: (err) => this.error = err.error?.error || 'Erro ao alterar permissão'
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Tem certeza que deseja excluir ${user.name}? Esta ação não pode ser desfeita.`)) return;
    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
      },
      error: (err) => this.error = err.error?.error || 'Erro ao excluir usuário'
    });
  }
}
