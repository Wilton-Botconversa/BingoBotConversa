import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardCell } from '../../../core/models/bingo-card.model';

@Component({
  selector: 'app-bingo-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bingo-card">
      <div class="card-header">
        <div class="header-cell" *ngFor="let letter of ['B','I','N','G','O']">{{ letter }}</div>
      </div>
      <div class="card-grid">
        <div class="card-row" *ngFor="let row of [0,1,2,3,4]">
          <div
            *ngFor="let cell of getCellsForRow(row)"
            class="card-cell"
            [class.drawn]="cell.drawn && !cell.confirmed"
            [class.confirmed]="cell.confirmed"
            [class.clickable]="cell.drawn && !cell.confirmed"
            (click)="onCellClick(cell)">
            {{ cell.number }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bingo-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.1);
      max-width: 400px;
      margin: 0 auto;
    }

    .card-header {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      background: #9C27B0;
    }

    .header-cell {
      text-align: center;
      padding: 12px;
      color: white;
      font-size: 20px;
      font-weight: 700;
    }

    .card-grid {
      padding: 4px;
    }

    .card-row {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
    }

    .card-cell {
      text-align: center;
      padding: 14px 8px;
      font-size: 18px;
      font-weight: 600;
      border-radius: 8px;
      background: white;
      border: 2px solid #eee;
      transition: all 0.3s;
      user-select: none;
    }

    .card-cell.drawn {
      background: #FFF9C4;
      border-color: #FBC02D;
      animation: pulse 1.5s infinite;
      cursor: pointer;
    }

    .card-cell.confirmed {
      background: #C8E6C9;
      border-color: #4CAF50;
      color: #2E7D32;
    }

    .card-cell.clickable:hover {
      background: #FFF176;
      transform: scale(1.05);
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `]
})
export class BingoCardComponent {
  @Input() cells: CardCell[] = [];
  @Output() cellClick = new EventEmitter<CardCell>();

  getCellsForRow(row: number): CardCell[] {
    return this.cells
      .filter(c => c.rowIdx === row)
      .sort((a, b) => a.colIdx - b.colIdx);
  }

  onCellClick(cell: CardCell): void {
    if (cell.drawn && !cell.confirmed) {
      this.cellClick.emit(cell);
    }
  }
}
