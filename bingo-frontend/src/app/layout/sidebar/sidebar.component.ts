import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar">
      <h1 class="logo">BINGO</h1>
      <ul class="nav-list">
        <li>
          <a routerLink="/participantes" routerLinkActive="active" class="nav-item">
            <span class="icon">&#128100;</span>
            Participantes
          </a>
        </li>
        <li>
          <a routerLink="/tabelas" routerLinkActive="active" class="nav-item">
            <span class="icon">&#9638;</span>
            Tabelas
          </a>
        </li>
        <li *ngIf="isAdmin">
          <a routerLink="/admin/game" routerLinkActive="active" class="nav-item">
            <span class="icon">&#9881;</span>
            Admin
          </a>
        </li>
        <li *ngIf="isAdmin">
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
            <span class="icon">&#128101;</span>
            Usuários
          </a>
        </li>
        <li>
          <a routerLink="/meu-perfil" routerLinkActive="active" class="nav-item">
            <span class="icon">&#128100;</span>
            Meu Perfil
          </a>
        </li>
      </ul>
      <button class="logout-btn" (click)="logout()">Sair</button>
    </nav>
  `,
  styles: [`
    .sidebar {
      width: 180px;
      height: 100vh;
      background: white;
      border-right: 1px solid #eee;
      display: flex;
      flex-direction: column;
      padding: 24px 12px;
      position: fixed;
      left: 0;
      top: 0;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 40px;
      color: #333;
    }
    .nav-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 24px;
      font-size: 14px;
      font-weight: 500;
      color: #555;
      transition: all 0.2s;
    }
    .nav-item:hover {
      background: #f5f5f5;
    }
    .nav-item.active {
      background: #9C27B0;
      color: white;
    }
    .icon {
      font-size: 16px;
    }
    .logout-btn {
      background: none;
      color: #999;
      font-size: 14px;
      padding: 12px;
      border-radius: 8px;
    }
    .logout-btn:hover {
      background: #f5f5f5;
      color: #333;
    }
  `]
})
export class SidebarComponent {
  isAdmin = false;

  constructor(private authService: AuthService) {
    this.isAdmin = this.authService.isAdmin();
  }

  logout(): void {
    this.authService.logout();
  }
}
