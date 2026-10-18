import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

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

@Injectable({
  providedIn: 'root'
})
export class ChemicalProductService {
  private api = inject(ApiService);

  getProducts(clientId?: number): Observable<ChemicalProduct[]> {
    const query = clientId ? `?clientId=${clientId}` : '';
    return this.api.get<ChemicalProduct[]>(`/chemical-products${query}`);
  }

  getProduct(id: number): Observable<ChemicalProduct> {
    return this.api.get<ChemicalProduct>(`/chemical-products/${id}`);
  }

  deleteProduct(id: number): Observable<void> {
    return this.api.delete<void>(`/chemical-products/${id}`);
  }
}
