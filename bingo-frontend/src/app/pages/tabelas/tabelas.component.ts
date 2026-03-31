import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardService } from '../../core/services/card.service';
import { GameService } from '../../core/services/game.service';
import { BingoCardComponent } from './bingo-card/bingo-card.component';
import { RankingBoardComponent } from '../../shared/components/ranking-board/ranking-board.component';
import { BingoCard, CardCell } from '../../core/models/bingo-card.model';
import { RankingEntry } from '../../core/models/ranking.model';
import { Game } from '../../core/models/game.model';

@Component({
  selector: 'app-tabelas',
  standalone: true,
  imports: [CommonModule, BingoCardComponent, RankingBoardComponent],
  template: `
    <h1 class="page-title">Minhas Tabelas</h1>

    <app-ranking-board [winners]="winners" />

    <div *ngIf="game && card; else noCard">
      <div class="game-status">
        <span class="status-badge" [class]="'status-' + game.status.toLowerCase()">
          {{ game.status }}
        </span>
        <span class="drawn-count">Confirmados: {{ confirmedCount }} / 25</span>
      </div>

      <!-- BINGO CARD ON TOP -->
      <app-bingo-card [cells]="card.cells" (cellClick)="onCellClick($event)" />

      <!-- BINGO BUTTON -->
      <div class="bingo-button-container">
        <button
          class="btn-bingo"
          [class.active]="canClaimBingo"
          [disabled]="!canClaimBingo || claimingBingo"
          (click)="onClaimBingo()">
          {{ claimingBingo ? 'Registrando...' : 'BINGO!' }}
        </button>
      </div>

      <!-- Congrats message ONLY after clicking BINGO -->
      <div class="completion-message" *ngIf="bingoMessage">
        {{ bingoMessage }}
      </div>

      <!-- LAST DRAWN NUMBER -->
      <div class="last-number" *ngIf="lastDrawnNumber">
        <span class="last-label">Último número:</span>
        <span class="last-value">{{ lastDrawnNumber }}</span>
      </div>

      <!-- DRAWN NUMBERS BELOW -->
      <div class="drawn-numbers-section" *ngIf="game.drawnNumbers?.length">
        <h3 class="section-title">Números sorteados ({{ game.drawnNumbers.length }})</h3>
        <div class="drawn-numbers">
          <div class="number-pill" *ngFor="let n of game.drawnNumbers">{{ n }}</div>
        </div>
      </div>
    </div>

    <ng-template #noCard>
      <div class="card empty-card" *ngIf="!loading">
        <p>Nenhuma tabela ativa no momento.</p>
        <p class="hint">Participe de um jogo na aba "Participantes" e aguarde o início.</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .page-title {
      font-size: 24px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 24px;
    }
    .game-status {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }
    .status-badge {
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-pending { background: #FFF3E0; color: #E65100; }
    .status-active { background: #E8F5E9; color: #2E7D32; }
    .status-paused { background: #FFF8E1; color: #F57F17; }
    .status-finished { background: #ECEFF1; color: #546E7A; }
    .drawn-count {
      font-size: 14px;
      color: #666;
    }
    .bingo-button-container {
      text-align: center;
      margin: 24px 0;
    }
    .btn-bingo {
      padding: 16px 64px;
      font-size: 28px;
      font-weight: 800;
      border-radius: 16px;
      border: 3px solid #ccc;
      background: #e0e0e0;
      color: #999;
      cursor: not-allowed;
      transition: all 0.3s;
      letter-spacing: 2px;
    }
    .btn-bingo.active {
      background: #4CAF50;
      color: white;
      border-color: #2E7D32;
      cursor: pointer;
      animation: bingoPulse 1s infinite;
    }
    .btn-bingo.active:hover {
      background: #388E3C;
      transform: scale(1.05);
    }
    @keyframes bingoPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
      50% { box-shadow: 0 0 0 12px rgba(76, 175, 80, 0); }
    }
    .completion-message {
      text-align: center;
      margin: 16px auto;
      padding: 16px;
      background: #E8F5E9;
      color: #2E7D32;
      border-radius: 12px;
      font-size: 18px;
      font-weight: 700;
      max-width: 400px;
    }
    .last-number {
      text-align: center;
      margin: 20px 0 12px;
    }
    .last-label {
      font-size: 14px;
      color: #666;
      margin-right: 8px;
    }
    .last-value {
      font-size: 32px;
      font-weight: 700;
      color: #9C27B0;
    }
    .drawn-numbers-section {
      max-width: 500px;
      margin: 16px auto 0;
    }
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #666;
      text-align: center;
      margin-bottom: 12px;
    }
    .drawn-numbers {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 6px;
    }
    .number-pill {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #E1BEE7;
      color: #6A1B9A;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 1px 8px rgba(0,0,0,0.06);
      max-width: 500px;
      margin: 0 auto;
    }
    .empty-card {
      text-align: center;
      color: #999;
    }
    .empty-card p { margin-bottom: 8px; }
    .empty-card .hint { font-size: 13px; color: #bbb; }
  `]
})
export class TabelasComponent implements OnInit, OnDestroy {
  game: Game | null = null;
  card: BingoCard | null = null;
  winners: RankingEntry[] = [];
  lastDrawnNumber: number | null = null;
  loading = true;
  canClaimBingo = false;
  claimingBingo = false;
  bingoMessage = '';
  confirmedCount = 0;
  private pollInterval: any = null;

  constructor(
    private cardService: CardService,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    this.loadGame();
    // Re-poll immediately when tab becomes active
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  ngOnDestroy(): void {
    this.stopPolling();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  private onVisibilityChange = (): void => {
    if (!document.hidden && this.game?.id) {
      this.gameService.pollGame(this.game.id).subscribe({
        next: (data: any) => {
          if (this.game) {
            this.game.drawnNumbers = data.drawnNumbers;
            this.game.status = data.status;
            if (data.drawnNumbers?.length) {
              this.lastDrawnNumber = data.drawnNumbers[data.drawnNumbers.length - 1];
            }
            if (this.card) {
              const drawnSet = new Set(data.drawnNumbers);
              this.card.cells = this.card.cells.map(cell => ({
                ...cell,
                drawn: drawnSet.has(cell.number) ? true : cell.drawn
              }));
            }
          }
          this.winners = data.winners || [];
        }
      });
    }
  };

  loadGame(): void {
    this.gameService.getActiveGame().subscribe({
      next: (game) => {
        this.game = game;
        if (game && (game.status === 'ACTIVE' || game.status === 'PAUSED' || game.status === 'PENDING')) {
          // First poll to get latest state, then load card with synced data
          this.gameService.pollGame(game.id).subscribe({
            next: (data: any) => {
              if (this.game) {
                this.game.drawnNumbers = data.drawnNumbers;
                this.game.status = data.status;
                if (data.drawnNumbers?.length) {
                  this.lastDrawnNumber = data.drawnNumbers[data.drawnNumbers.length - 1];
                }
              }
              this.winners = data.winners || [];
              // Now load card with updated drawnNumbers
              this.loadCard(game.id);
            },
            error: () => this.loadCard(game.id)
          });
          this.loadRanking(game.id);
          this.startPolling(game.id);
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadCard(gameId: number): void {
    this.cardService.getMyCard(gameId).subscribe({
      next: (card) => {
        this.card = card;
        // Sync card cells with already drawn numbers
        if (this.card && this.game?.drawnNumbers?.length) {
          const drawnSet = new Set(this.game.drawnNumbers);
          this.card.cells = this.card.cells.map(cell => ({
            ...cell,
            drawn: drawnSet.has(cell.number) ? true : cell.drawn
          }));
        }
        this.updateConfirmedCount();
        this.checkBingoReady();
      },
      error: () => this.card = null
    });
  }

  loadRanking(gameId: number): void {
    this.gameService.getRanking(gameId).subscribe({
      next: (winners) => this.winners = winners,
      error: () => this.winners = []
    });
  }

  startPolling(gameId: number): void {
    this.pollInterval = setInterval(() => {
      this.gameService.pollGame(gameId).subscribe({
        next: (data: any) => {
          if (this.game) {
            if (data.drawnNumbers?.length > (this.game.drawnNumbers?.length || 0)) {
              this.lastDrawnNumber = data.drawnNumbers[data.drawnNumbers.length - 1];
              if (this.card) {
                const drawnSet = new Set(data.drawnNumbers);
                this.card.cells = this.card.cells.map(cell => ({
                  ...cell,
                  drawn: drawnSet.has(cell.number) ? true : cell.drawn
                }));
              }
            }
            this.game.drawnNumbers = data.drawnNumbers;
            this.game.status = data.status;
          }
          this.winners = data.winners || [];
          if (data.status === 'FINISHED') this.stopPolling();
        }
      });
    }, 500); // Poll every 500ms for faster updates
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  updateConfirmedCount(): void {
    if (this.card) {
      this.confirmedCount = this.card.cells.filter(c => c.confirmed).length;
    }
  }

  checkBingoReady(): void {
    if (this.card) {
      this.canClaimBingo = this.card.cells.every(c => c.confirmed) && !this.card.completed;
    }
  }

  onCellClick(cell: CardCell): void {
    if (!this.card || cell.confirmed) return;

    // Optimistic update - turn green immediately
    this.card.cells = this.card.cells.map(c =>
      c.id === cell.id ? { ...c, confirmed: true } : c
    );
    this.updateConfirmedCount();
    this.checkBingoReady();

    // Then confirm on server
    this.cardService.confirmCell(this.card.id, cell.id).subscribe({
      error: () => {
        // Revert on error
        this.card!.cells = this.card!.cells.map(c =>
          c.id === cell.id ? { ...c, confirmed: false } : c
        );
        this.updateConfirmedCount();
        this.checkBingoReady();
      }
    });
  }

  onClaimBingo(): void {
    if (!this.game || !this.canClaimBingo) return;

    // Instant feedback - show congrats immediately
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    const ms = now.getMilliseconds().toString().padStart(3, '0');
    this.bingoMessage = `Parabéns! BINGO registrado às ${h}:${m}:${s}.${ms}!`;
    this.canClaimBingo = false;
    this.claimingBingo = false;
    if (this.card) this.card.completed = true;

    // Send to server in background
    this.gameService.claimBingo(this.game.id).subscribe({
      next: (res) => {
        if (res.message) this.bingoMessage = res.message;
        this.loadRanking(this.game!.id);
      },
      error: (err) => {
        if (err.error?.alreadyClaimed) {
          this.bingoMessage = 'Você já registrou seu BINGO!';
        }
      }
    });
  }
}
