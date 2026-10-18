import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ImportHistory {
  id: number;
  fileName: string;
  fileType: string;
  clientId?: number;
  clientName?: string;
  recordsImported: number;
  status: string;
  errorMessage?: string;
  createdAt: Date;
}

export interface ImportExcelResult {
  historyId: number;
  status: string;
  clientsImported: number;
  productsImported: number;
  errors: number;
  errorDetails: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  private api = inject(ApiService);

  importExcel(file: File): Observable<ImportExcelResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.uploadFile<ImportExcelResult>('/import/excel', formData);
  }

  getHistory(): Observable<ImportHistory[]> {
    return this.api.get<ImportHistory[]>('/import/history');
  }

  getStatus(id: number): Observable<ImportHistory> {
    return this.api.get<ImportHistory>(`/import/${id}/status`);
  }
}
