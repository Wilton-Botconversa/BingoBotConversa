import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Participant } from '../models/game.model';

@Injectable({ providedIn: 'root' })
export class ParticipantService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getParticipants(gameId: number): Observable<Participant[]> {
    return this.http.get<Participant[]>(`${this.API}/games/${gameId}/participants`);
  }

  joinGame(gameId: number): Observable<Participant> {
    return this.http.post<Participant>(`${this.API}/games/${gameId}/join`, {});
  }

  checkParticipation(gameId: number): Observable<{ participating: boolean }> {
    return this.http.get<{ participating: boolean }>(`${this.API}/games/${gameId}/my-participation`);
  }
}
