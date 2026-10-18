import { Injectable, inject } from '@angular/core';
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
  private api = inject(ApiService);

  getProducts(clientId?: number): Observable<ChemicalProduct[]> {
    return this.api.get<ChemicalProduct[]>(`/chemical-products${clientId ? `?clientId=${clientId}` : ''}`);
  }

  getProduct(id: number): Observable<ChemicalProduct> {
    return this.api.get<ChemicalProduct>(`/chemical-products/${id}`);
  }

  createProduct(product: CreateChemicalProduct): Observable<ChemicalProduct> {
    return this.api.post<ChemicalProduct>('/chemical-products', product);
  }

  updateProduct(id: number, product: CreateChemicalProduct): Observable<ChemicalProduct> {
    return this.api.put<ChemicalProduct>(`/chemical-products/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.api.delete<void>(`/chemical-products/${id}`);
  }
}
