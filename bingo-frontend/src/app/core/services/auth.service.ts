import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.apiUrl + '/auth';
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, data).pipe(
      tap(res => this.storeUser(res))
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, data).pipe(
      tap(res => this.storeUser(res))
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.API}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.API}/reset-password`, { token, password: newPassword });
  }

  logout(): void {
    localStorage.removeItem('bingo_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const user = this.getStoredUser();
    return user?.token ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getStoredUser()?.role === 'ADMIN';
  }

  private storeUser(res: AuthResponse): void {
    localStorage.setItem('bingo_user', JSON.stringify(res));
    this.currentUserSubject.next(res);
  }

  private getStoredUser(): AuthResponse | null {
    const data = localStorage.getItem('bingo_user');
    return data ? JSON.parse(data) : null;
  }
}
