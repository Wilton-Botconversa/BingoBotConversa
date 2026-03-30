import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RankingEntry } from '../../../core/models/ranking.model';

@Component({
  selector: 'app-ranking-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ranking-container" *ngIf="winners.length > 0">
      <h2 class="ranking-title">Ganhadores</h2>
      <div class="winners-row">
        <div class="winner-badge" *ngFor="let w of winners">
          <div class="winner-rank">#{{ w.rank }}</div>
          <div class="winner-avatar">
            <img *ngIf="w.profilePhotoUrl" [src]="w.profilePhotoUrl" [alt]="w.name" />
            <span *ngIf="!w.profilePhotoUrl">{{ w.name.charAt(0) }}</span>
          </div>
          <div class="winner-info">
            <span class="winner-name">{{ w.name }}</span>
            <span class="winner-time" *ngIf="w.completedAt">{{ formatTime(w.completedAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ranking-container {
      text-align: center;
      margin-bottom: 32px;
    }

    .ranking-title {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 20px;
      color: #333;
    }

    .winners-row {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .winner-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #4CAF50;
      color: white;
      padding: 8px 20px 8px 8px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 600;
    }

    .winner-rank {
      font-size: 14px;
      font-weight: 800;
      min-width: 24px;
    }
    .winner-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .winner-name {
      font-size: 14px;
      font-weight: 600;
    }
    .winner-time {
      font-size: 11px;
      opacity: 0.85;
    }
    .winner-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  `]
})
export class RankingBoardComponent {
  @Input() winners: RankingEntry[] = [];

  formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    const s = d.getSeconds().toString().padStart(2, '0');
    const ms = d.getMilliseconds().toString().padStart(3, '0');
    return `${h}:${m}:${s}.${ms}`;
  }
}
