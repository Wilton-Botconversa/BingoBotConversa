import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { GameService } from '../../core/services/game.service';
import { ParticipantService } from '../../core/services/participant.service';
import { AuthService } from '../../core/services/auth.service';
import { Game, Participant } from '../../core/models/game.model';

@Component({
  selector: 'app-participantes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="page-title">Escolha os participantes</h1>

    <div class="loading" *ngIf="loading">Carregando...</div>

    <div class="card" *ngIf="!loading && game; else noGame">
      <div class="card-header">
        <span class="count">Total de {{ participants.length }} participantes</span>
        <button class="btn-participar" (click)="onJoin()" *ngIf="!isParticipating && game.status === 'PENDING'" [disabled]="joining">
          {{ joining ? 'Entrando...' : 'Participar' }}
        </button>
        <span class="already-in" *ngIf="isParticipating">Você está participando!</span>
      </div>

      <div class="participant-list">
        <div class="participant-item" *ngFor="let p of participants">
          <div class="avatar">
            <img *ngIf="p.profilePhotoUrl" [src]="p.profilePhotoUrl" [alt]="p.name" />
            <div *ngIf="!p.profilePhotoUrl" class="avatar-placeholder">{{ p.name.charAt(0) }}</div>
          </div>
          <span class="participant-name">{{ p.name }}</span>
        </div>
      </div>

      <div class="empty" *ngIf="participants.length === 0">
        Nenhum participante ainda. Seja o primeiro!
      </div>
    </div>

    <ng-template #noGame>
      <div class="card" *ngIf="!loading">
        <p class="empty">Nenhum jogo ativo no momento.</p>
      </div>
    </ng-template>
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
      max-width: 700px;
      margin: 0 auto;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .count {
      font-size: 15px;
      color: #666;
    }

    .btn-participar {
      background: #9C27B0;
      color: white;
      padding: 10px 28px;
      border-radius: 24px;
      font-size: 14px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #7B1FA2;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .already-in {
      color: #4CAF50;
      font-weight: 600;
      font-size: 14px;
    }

    .participant-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .participant-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 10px 8px;
      border-radius: 8px;
      transition: background 0.15s;

      &:hover {
        background: #f9f9f9;
      }
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background: #9C27B0;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 16px;
    }

    .participant-name {
      font-size: 15px;
      font-weight: 500;
      color: #333;
    }

    .empty {
      text-align: center;
      color: #999;
      font-size: 15px;
      padding: 20px 0;
    }
    .loading {
      text-align: center;
      color: #999;
      font-size: 14px;
      padding: 40px 0;
    }
  `]
})
export class ParticipantesComponent implements OnInit {
  game: Game | null = null;
  participants: Participant[] = [];
  isParticipating = false;
  joining = false;
  loading = true;

  constructor(
    private gameService: GameService,
    private participantService: ParticipantService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadGame();
  }

  loadGame(): void {
    this.gameService.getActiveGame().subscribe({
      next: (game) => {
        this.game = game;
        if (game) {
          // Load participants and check participation in parallel
          forkJoin({
            participants: this.participantService.getParticipants(game.id),
            participation: this.participantService.checkParticipation(game.id)
          }).subscribe({
            next: (result) => {
              this.participants = result.participants;
              this.isParticipating = result.participation.participating;
              this.loading = false;
            },
            error: () => this.loading = false
          });
        } else {
          this.loading = false;
        }
      },
      error: () => { this.game = null; this.loading = false; }
    });
  }

  onJoin(): void {
    if (!this.game) return;
    this.joining = true;
    this.participantService.joinGame(this.game.id).subscribe({
      next: () => {
        this.isParticipating = true;
        this.joining = false;
        this.loadParticipants();
      },
      error: () => this.joining = false
    });
  }
}
