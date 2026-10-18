import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { LoginResponse } from '../models/safety-card.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private httpClient: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>(`${this.baseUrl}/auth/login`, { username, password }).pipe(
      tap((res) => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        localStorage.setItem('userRole', res.role);
        localStorage.setItem('username', username);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  refresh(): Observable<LoginResponse | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return of(null);
    }
    return this.httpClient.post<LoginResponse>(`${this.baseUrl}/auth/refresh`, { refreshToken }).pipe(
      tap((res) => {
        if (res) {
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
        }
      }),
      catchError(() => of(null))
    );
  }
}
