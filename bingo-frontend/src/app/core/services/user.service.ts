import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = environment.apiUrl + '/users';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.API}/me`);
  }

  updateProfile(data: { name: string; phone: string; email: string }): Observable<User> {
    return this.http.put<User>(`${this.API}/me`, data);
  }

  uploadPhoto(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<User>(`${this.API}/me/photo`, formData);
  }
}
