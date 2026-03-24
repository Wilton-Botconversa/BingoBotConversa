import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API}/admin/users`);
  }

  toggleAdmin(userId: number): Observable<User> {
    return this.http.post<User>(`${this.API}/admin/users/${userId}/toggle-admin`, {});
  }
}
