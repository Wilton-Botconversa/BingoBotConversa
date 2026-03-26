import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../../core/services/game.service';
import { ParticipantService } from '../../../core/services/participant.service';
import { RankingBoardComponent } from '../../../shared/components/ranking-board/ranking-board.component';
import { Game, Participant } from '../../../core/models/game.model';
import { RankingEntry } from '../../../core/models/ranking.model';

@Component({
  selector: 'app-game-control',
  standalone: true,
  imports: [CommonModule, FormsModule, RankingBoardComponent],
  template: `
    <h1 class="page-title">Painel do Administrador</h1>

    <app-ranking-board [winners]="winners" />

    <!-- Create game form -->
    <div class="card" *ngIf="!game">
      <h2>Criar Novo Jogo</h2>
      <div class="form-group">
        <label>Modo de Sorteio</label>
        <select [(ngModel)]="drawMode">
          <option value="MANUAL">Manual</option>
          <option value="AUTOMATIC">Automático</option>
        </select>
      </div>
      <div class="form-group" *ngIf="drawMode === 'AUTOMATIC'">
        <label>Intervalo entre números (segundos)</label>
        <input type="number" [(ngModel)]="drawInterval" min="5" max="10" />
      </div>
      <button class="btn-create" (click)="createGame()" [disabled]="creating">
        {{ creating ? 'Criando...' : 'Criar Jogo' }}
      </button>
    </div>

    <!-- Active game controls -->
    <div class="card" *ngIf="game">
      <div class="game-header">
        <h2>Jogo #{{ game.id }}</h2>
        <span class="status-badge" [class]="'status-' + game.status.toLowerCase()">{{ game.status }}</span>
      </div>

      <div class="game-info">
        <p><strong>Modo:</strong> {{ game.drawMode === 'MANUAL' ? 'Manual' : 'Automático (' + game.drawIntervalSeconds + 's)' }}</p>
        <p><strong>Participantes:</strong> {{ participants.length }}</p>
        <p><strong>Números sorteados:</strong> {{ game.drawnNumbers?.length || 0 }} / 75</p>
      </div>

      <!-- Last drawn number -->
      <div class="last-number" *ngIf="lastDrawnNumber">
        <span class="last-label">Último número sorteado:</span>
        <span class="last-value">{{ lastDrawnNumber }}</span>
      </div>

      <!-- Drawn numbers display -->
      <div class="drawn-numbers" *ngIf="game.drawnNumbers?.length">
        <div class="number-pill" *ngFor="let n of game.drawnNumbers">{{ n }}</div>
      </div>

      <!-- Action buttons -->
      <div class="actions">
        <!-- PENDING: Start button -->
        <button class="btn-start" *ngIf="game.status === 'PENDING'" (click)="startGame()" [disabled]="starting">
          {{ starting ? 'Iniciando...' : 'Iniciar Jogo' }}
        </button>

        <!-- ACTIVE: Draw + Pause -->
        <div class="active-controls" *ngIf="game.status === 'ACTIVE'">
          <button class="btn-draw" (click)="drawNumber()" *ngIf="game.drawMode === 'MANUAL'" [disabled]="drawing">
            {{ drawing ? 'Sorteando...' : 'Sortear Número' }}
          </button>
          <button class="btn-pause" (click)="pauseGame()">Pausar</button>
        </div>

        <!-- PAUSED: Resume -->
        <button class="btn-resume" *ngIf="game.status === 'PAUSED'" (click)="resumeGame()">Retomar</button>

        <!-- Finish -->
        <button class="btn-finish" *ngIf="game.status !== 'FINISHED'" (click)="finishGame()">Encerrar Jogo</button>
      </div>

      <!-- Participants -->
      <div class="participants-section" *ngIf="participants.length > 0">
        <h3>Participantes</h3>
        <div class="participants-grid">
          <div class="participant-chip" *ngFor="let p of participants">
            <div class="chip-avatar">{{ p.name.charAt(0) }}</div>
            {{ p.name }}
          </div>
        </div>
      </div>
    </div>

    <div class="error" *ngIf="error">{{ error }}</div>
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 32px; }
    .card { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 1px 8px rgba(0,0,0,0.06); max-width: 700px; margin: 0 auto; }
    h2 { font-size: 20px; margin-bottom: 24px; }
    .form-group { margin-bottom: 20px;
      label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #555; }
      select, input { width: 100%; padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; font-family: 'Inter', sans-serif; outline: none; }
      select:focus, input:focus { border-color: #9C27B0; }
    }
    .btn-create { background: #9C27B0; color: white; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; width: 100%; border: none; cursor: pointer; }
    .btn-create:hover { background: #7B1FA2; }
    .btn-create:disabled { opacity: 0.6; cursor: not-allowed; }

    .game-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .game-header h2 { margin-bottom: 0; }
    .status-badge { padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: uppercase; }
    .status-pending { background: #FFF3E0; color: #E65100; }
    .status-active { background: #E8F5E9; color: #2E7D32; }
    .status-paused { background: #FFF8E1; color: #F57F17; }
    .status-finished { background: #ECEFF1; color: #546E7A; }

    .game-info { margin-bottom: 20px; }
    .game-info p { font-size: 14px; color: #555; margin-bottom: 6px; }

    .last-number { text-align: center; margin-bottom: 16px; }
    .last-label { font-size: 14px; color: #666; margin-right: 8px; }
    .last-value { font-size: 40px; font-weight: 700; color: #9C27B0; }

    .drawn-numbers { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 24px; }
    .number-pill { width: 36px; height: 36px; border-radius: 50%; background: #E1BEE7; color: #6A1B9A; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; }

    .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
    .btn-start { background: #4CAF50; color: white; padding: 12px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; border: none; cursor: pointer; }
    .btn-start:hover { background: #388E3C; }
    .btn-start:disabled { opacity: 0.6; }
    .active-controls { display: flex; gap: 12px; }
    .btn-draw { background: #9C27B0; color: white; padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; border: none; cursor: pointer; }
    .btn-draw:hover { background: #7B1FA2; }
    .btn-draw:disabled { opacity: 0.6; }
    .btn-pause { background: #FF9800; color: white; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; }
    .btn-pause:hover { background: #F57C00; }
    .btn-resume { background: #4CAF50; color: white; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; }
    .btn-resume:hover { background: #388E3C; }
    .btn-finish { background: #c62828; color: white; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; }
    .btn-finish:hover { background: #b71c1c; }

    .participants-section { margin-top: 24px; }
    .participants-section h3 { font-size: 16px; margin-bottom: 12px; }
    .participants-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .participant-chip { display: flex; align-items: center; gap: 8px; padding: 6px 14px; background: #f5f5f5; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .chip-avatar { width: 24px; height: 24px; border-radius: 50%; background: #9C27B0; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }

    .error { background: #ffebee; color: #c62828; padding: 12px; border-radius: 8px; margin-top: 16px; font-size: 14px; max-width: 700px; margin-left: auto; margin-right: auto; }
  `]
})
export class GameControlComponent implements OnInit, OnDestroy {
  game: Game | null = null;
  participants: Participant[] = [];
  winners: RankingEntry[] = [];
  lastDrawnNumber: number | null = null;
  drawMode = 'MANUAL';
  drawInterval = 5;
  creating = false;
  starting = false;
  drawing = false;
  error = '';
  private pollInterval: any = null;

  constructor(
    private gameService: GameService,
    private participantService: ParticipantService
  ) {}

  ngOnInit(): void {
    this.loadGame();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadGame(): void {
    this.gameService.getActiveGame().subscribe({
      next: (game) => {
        this.game = game;
        if (game) {
          this.loadParticipants();
          this.loadRanking();
          this.startPolling(game.id);
          if (game.drawnNumbers?.length) {
            this.lastDrawnNumber = game.drawnNumbers[game.drawnNumbers.length - 1];
          }
        }
      },
      error: () => this.game = null
    });
  }

  loadParticipants(): void {
    if (!this.game) return;
    this.participantService.getParticipants(this.game.id).subscribe({
      next: (list) => this.participants = list
    });
  }

  loadRanking(): void {
    if (!this.game) return;
    this.gameService.getRanking(this.game.id).subscribe({
      next: (winners) => this.winners = winners,
      error: () => this.winners = []
    });
  }

  startPolling(gameId: number): void {
    this.pollInterval = setInterval(() => {
      this.gameService.pollGame(gameId).subscribe({
        next: (data: any) => {
          if (this.game) {
            this.game.drawnNumbers = data.drawnNumbers;
            this.game.status = data.status;
            if (data.drawnNumbers?.length) {
              this.lastDrawnNumber = data.drawnNumbers[data.drawnNumbers.length - 1];
            }
          }
          this.winners = data.winners || [];
          if (data.status === 'FINISHED') this.stopPolling();
        }
      });
    }, 1000);
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  createGame(): void {
    this.creating = true;
    this.error = '';
    this.gameService.createGame({ drawMode: this.drawMode, drawIntervalSeconds: this.drawInterval }).subscribe({
      next: (game) => { this.game = game; this.creating = false; },
      error: (err) => { this.error = err.error?.error || 'Erro ao criar jogo'; this.creating = false; }
    });
  }

  startGame(): void {
    if (!this.game) return;
    this.starting = true;
    this.gameService.startGame(this.game.id).subscribe({
      next: () => {
        if (this.game) this.game.status = 'ACTIVE';
        this.starting = false;
        this.startPolling(this.game!.id);
      },
      error: (err) => { this.error = err.error?.error || 'Erro ao iniciar'; this.starting = false; }
    });
  }

  drawNumber(): void {
    if (!this.game) return;
    this.drawing = true;
    this.gameService.drawNumber(this.game.id).subscribe({
      next: (res) => {
        this.drawing = false;
        if (res.finished) this.game!.status = 'FINISHED';
      },
      error: (err) => { this.error = err.error?.error || 'Erro ao sortear'; this.drawing = false; }
    });
  }

  pauseGame(): void {
    if (!this.game) return;
    this.gameService.pauseGame(this.game.id).subscribe({
      next: () => { if (this.game) this.game.status = 'PAUSED'; },
      error: (err) => this.error = err.error?.error || 'Erro ao pausar'
    });
  }

  resumeGame(): void {
    if (!this.game) return;
    this.gameService.resumeGame(this.game.id).subscribe({
      next: () => { if (this.game) this.game.status = 'ACTIVE'; },
      error: (err) => this.error = err.error?.error || 'Erro ao retomar'
    });
  }

  finishGame(): void {
    if (!this.game) return;
    this.gameService.finishGame(this.game.id).subscribe({
      next: (game) => this.game = game,
      error: (err) => this.error = err.error?.error || 'Erro ao encerrar'
    });
  }
}
