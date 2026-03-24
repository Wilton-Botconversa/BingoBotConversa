import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BingoCard } from '../models/bingo-card.model';

@Injectable({ providedIn: 'root' })
export class CardService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMyCard(gameId: number): Observable<BingoCard> {
    return this.http.get<BingoCard>(`${this.API}/games/${gameId}/my-card`);
  }

  confirmCell(cardId: number, cellId: number): Observable<any> {
    return this.http.post(`${this.API}/cards/${cardId}/confirm/${cellId}`, {});
  }
}
