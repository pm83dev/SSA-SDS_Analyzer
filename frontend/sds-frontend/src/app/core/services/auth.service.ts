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
        // Estrai userId dal JWT
        const token = res.accessToken;
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            localStorage.setItem('userId', payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload['sub'] || '');
          } catch (e) {
            console.warn('Non è stato possibile estrarre l\'userId dal token');
          }
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
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
