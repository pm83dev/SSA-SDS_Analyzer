import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUser {
  username: string;
  password: string;
  email: string;
  role: string;
}

export interface UpdateUser {
  email?: string;
  role?: string;
  isActive?: boolean;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/api/users`;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAll(): Observable<User[]> {
    return this.httpClient.get<User[]>(this.baseUrl, { headers: this.getHeaders() });
  }

  getById(id: number): Observable<User> {
    return this.httpClient.get<User>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  create(user: CreateUser): Observable<{ message: string; userId: number }> {
    return this.httpClient.post<{ message: string; userId: number }>(this.baseUrl, user, { headers: this.getHeaders() });
  }

  update(id: number, user: UpdateUser): Observable<{ message: string }> {
    return this.httpClient.put<{ message: string }>(`${this.baseUrl}/${id}`, user, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<{ message: string }> {
    return this.httpClient.delete<{ message: string }>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  constructor(private httpClient: HttpClient) {}
}