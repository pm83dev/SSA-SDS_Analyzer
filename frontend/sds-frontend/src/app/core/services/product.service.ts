import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

export interface ChemicalProduct {
  id: number;
  clientId: number;
  clientName: string;
  productName: string;
  producer?: string;
  hPhrases?: string;
  pictogram?: string;
  compositionCasAbove?: string;
  compositionCasBelow?: string;
  composition?: string;
  hasDiisocyanates?: boolean;
  physicalState?: string;
  boilingPoint?: string;
  vocPercent?: string;
  density?: string;
  sdsUrl?: string;
  sdsDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChemicalProduct {
  clientId: number;
  productName: string;
  producer?: string;
  hPhrases?: string;
  pictogram?: string;
  compositionCasAbove?: string;
  compositionCasBelow?: string;
  composition?: string;
  hasDiisocyanates?: boolean;
  physicalState?: string;
  boilingPoint?: string;
  vocPercent?: string;
  density?: string;
  sdsUrl?: string;
  sdsDate?: Date;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/chemical-products`;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getProducts(clientId?: number): Observable<ChemicalProduct[]> {
    const url = clientId ? `${this.baseUrl}?clientId=${clientId}` : this.baseUrl;
    return this.http.get<ChemicalProduct[]>(url, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.error('Errore nel caricamento dei prodotti:', err);
        return throwError(() => err);
      })
    );
  }

  getProduct(id: number): Observable<ChemicalProduct> {
    return this.http.get<ChemicalProduct>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  createProduct(product: CreateChemicalProduct): Observable<ChemicalProduct> {
    return this.http.post<ChemicalProduct>(this.baseUrl, product, { headers: this.getHeaders() });
  }

  updateProduct(id: number, product: CreateChemicalProduct): Observable<ChemicalProduct> {
    return this.http.put<ChemicalProduct>(`${this.baseUrl}/${id}`, product, { headers: this.getHeaders() });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }
}
