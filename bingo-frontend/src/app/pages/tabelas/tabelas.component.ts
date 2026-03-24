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
        <span class="drawn-count">Números sorteados: {{ game.drawnNumbers?.length || 0 }} / 75</span>
      </div>

      <div class="last-number" *ngIf="lastDrawnNumber">
        <span class="last-label">Último número:</span>
        <span class="last-value">{{ lastDrawnNumber }}</span>
      </div>

      <div class="drawn-numbers" *ngIf="game.drawnNumbers?.length">
        <div class="number-pill" *ngFor="let n of game.drawnNumbers">{{ n }}</div>
      </div>

      <app-bingo-card [cells]="card.cells" (cellClick)="onCellClick($event)" />

      <div class="completion-message" *ngIf="card.completed">
        PARABÉNS! Você completou a cartela! Posição: #{{ card.completionRank }}
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

    .last-number {
      text-align: center;
      margin-bottom: 16px;
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

    .drawn-numbers {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 6px;
      margin-bottom: 24px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
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

      p { margin-bottom: 8px; }

      .hint {
        font-size: 13px;
        color: #bbb;
      }
    }

    .completion-message {
      text-align: center;
      margin-top: 24px;
      padding: 16px;
      background: #E8F5E9;
      color: #2E7D32;
      border-radius: 12px;
      font-size: 18px;
      font-weight: 700;
    }
  `]
})
export class TabelasComponent implements OnInit, OnDestroy {
  game: Game | null = null;
  card: BingoCard | null = null;
  winners: RankingEntry[] = [];
  lastDrawnNumber: number | null = null;
  loading = true;
  private pollInterval: any = null;

  constructor(
    private cardService: CardService,
    private gameService: GameService
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
        if (game && (game.status === 'ACTIVE' || game.status === 'PAUSED' || game.status === 'PENDING')) {
          this.loadCard(game.id);
          this.loadRanking(game.id);
          this.startPolling(game.id);
          if (game.drawnNumbers?.length) {
            this.lastDrawnNumber = game.drawnNumbers[game.drawnNumbers.length - 1];
          }
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadCard(gameId: number): void {
    this.cardService.getMyCard(gameId).subscribe({
      next: (card) => this.card = card,
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
            // Update drawn numbers
            if (data.drawnNumbers?.length > (this.game.drawnNumbers?.length || 0)) {
              this.lastDrawnNumber = data.drawnNumbers[data.drawnNumbers.length - 1];
              // Update card cells for newly drawn numbers
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

          // Stop polling if game finished
          if (data.status === 'FINISHED') {
            this.stopPolling();
          }
        }
      });
    }, 2000);
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  onCellClick(cell: CardCell): void {
    if (!this.card) return;
    this.cardService.confirmCell(this.card.id, cell.id).subscribe({
      next: (res) => {
        // Update cell to confirmed
        this.card!.cells = this.card!.cells.map(c =>
          c.id === cell.id ? { ...c, confirmed: true } : c
        );
        if (res.complete) {
          this.card!.completed = true;
          this.loadRanking(this.card!.gameId);
        }
      }
    });
  }
}
