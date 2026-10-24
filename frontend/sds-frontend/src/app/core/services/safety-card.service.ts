import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { CreateSafetyCard, SafetyCard } from '../models/safety-card.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SafetyCardService {
  private api = inject(ApiService);
  private http = inject(HttpClient);

  getCards(): Observable<SafetyCard[]> {
    return this.api.get<SafetyCard[]>('/safety-cards');
  }

  getCard(id: number): Observable<SafetyCard> {
    return this.api.get<SafetyCard>(`/safety-cards/${id}`);
  }

  getCardsByClient(clientId: number): Observable<SafetyCard[]> {
    return this.api.get<SafetyCard[]>(`/clients/${clientId}/cards`);
  }

  // Collega al cliente una scheda già presente nell'archivio
  linkToClient(clientId: number, cardId: number): Observable<SafetyCard> {
    return this.api.post<SafetyCard>(`/clients/${clientId}/cards/${cardId}`, {});
  }

  // Scollega la scheda dal cliente: la scheda resta nell'archivio
  unlinkFromClient(clientId: number, cardId: number): Observable<void> {
    return this.api.delete<void>(`/clients/${clientId}/cards/${cardId}`);
  }

  createCard(request: CreateSafetyCard): Observable<SafetyCard> {
    return this.api.post<SafetyCard>('/safety-cards', request);
  }

  updateCard(id: number, request: Partial<CreateSafetyCard>): Observable<SafetyCard> {
    return this.api.put<SafetyCard>(`/safety-cards/${id}`, request);
  }

  deleteCard(id: number): Observable<void> {
    return this.api.delete<void>(`/safety-cards/${id}`);
  }

  uploadPdf(cardId: number, formData: FormData): Observable<{ pdfPath: string }> {
    return this.api.uploadFile<{ pdfPath: string }>(`/safety-cards/${cardId}/upload-pdf`, formData);
  }

  deletePdf(cardId: number): Observable<void> {
    return this.api.delete<void>(`/safety-cards/${cardId}/pdf`);
  }

  getPdfUrl(cardId: number): Observable<string> {
    return this.api.get<string>(`/safety-cards/${cardId}/pdf-url`);
  }

  // Cliente facoltativo: senza cliente la scheda va solo nell'archivio
  analyzePdf(clientId: number | null, file: File): Observable<any> {
    const formData = new FormData();
    if (clientId) formData.append('clientId', clientId.toString());
    formData.append('pdfFile', file);
    return this.api.uploadFile<any>('/safety-cards/analyze-pdf', formData);
  }

  // Il PDF è servito da un endpoint protetto: un semplice <a href> non invia il token,
  // quindi lo si scarica con HttpClient (che aggiunge il token) e lo si apre in una nuova scheda
  openPdf(card: SafetyCard): void {
    if (!card.pdfUrl) return;
    this.http.get(`${environment.apiUrl}${card.pdfUrl}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      },
      error: () => alert('Errore nell\x27apertura del PDF')
    });
  }
}
