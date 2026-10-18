import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { Client, CreateClient, UpdateClient } from '../models/client.model';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/clients`;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAll() {
    return this.http.get<Client[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getById(id: number) {
    return this.http.get<Client>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  create(client: CreateClient) {
    return this.http.post<Client>(this.apiUrl, client, { headers: this.getHeaders() });
  }

  update(id: number, client: UpdateClient) {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client, { headers: this.getHeaders() });
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
