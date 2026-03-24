import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Game, CreateGameRequest } from '../models/game.model';

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getActiveGame(): Observable<Game> {
    return this.http.get<Game>(`${this.API}/games/active`);
  }

  getGame(id: number): Observable<Game> {
    return this.http.get<Game>(`${this.API}/games/${id}`);
  }

  createGame(data: CreateGameRequest): Observable<Game> {
    return this.http.post<Game>(`${this.API}/admin/games`, data);
  }

  finishGame(id: number): Observable<Game> {
    return this.http.post<Game>(`${this.API}/admin/games/${id}/finish`, {});
  }

  startGame(id: number): Observable<any> {
    return this.http.post(`${this.API}/admin/games/${id}/start`, {});
  }

  drawNumber(id: number): Observable<any> {
    return this.http.post(`${this.API}/admin/games/${id}/draw`, {});
  }

  pauseGame(id: number): Observable<any> {
    return this.http.post(`${this.API}/admin/games/${id}/pause`, {});
  }

  resumeGame(id: number): Observable<any> {
    return this.http.post(`${this.API}/admin/games/${id}/resume`, {});
  }

  getRanking(gameId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/games/${gameId}/ranking`);
  }

  pollGame(gameId: number): Observable<any> {
    return this.http.get(`${this.API}/games/${gameId}/poll`);
  }
}
