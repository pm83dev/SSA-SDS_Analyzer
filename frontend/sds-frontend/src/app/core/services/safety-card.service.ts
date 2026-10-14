import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateSafetyCard, SafetyCard } from '../models/safety-card.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SafetyCardService {
  private api = inject(ApiService);

  getCards(): Observable<SafetyCard[]> {
    return this.api.get<SafetyCard[]>('/safety-cards');
  }

  getCard(id: number): Observable<SafetyCard> {
    return this.api.get<SafetyCard>(`/safety-cards/${id}`);
  }

  getCardsByClient(clientId: number): Observable<SafetyCard[]> {
    return this.api.get<SafetyCard[]>(`/clients/${clientId}/cards`);
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

  uploadPdf(cardId: number, file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.uploadFile<{ url: string }>(`/safety-cards/${cardId}/upload-pdf`, formData);
  }

  analyzePdf(clientId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('clientId', clientId.toString());
    formData.append('pdfFile', file);
    return this.api.uploadFile<any>('/safety-cards/analyze-pdf', formData);
  }
}
