import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, ChemicalProduct } from '../../../core/services/product.service';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-list-page">
      <div class="page-header">
        <h1>Prodotti Chimici</h1>
      </div>
      <div class="filters">
        <select class="filter-select" (change)="onFilterChange($event)">
          <option value="">Tutti i clienti</option>
          <option *ngFor="let client of clients" [value]="client.id">{{ client.ragioneSociale }}</option>
        </select>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Prodotto</th>
              <th>Produttore</th>
              <th>Frasi H</th>
              <th>Pittogramma</th>
              <th>Stato Fisico</th>
              <th>COV %</th>
              <th>Densità</th>
              <th>Data SDS</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="filteredProducts.length === 0">
              <td colspan="10" class="text-center">
                {{ isLoading ? 'Caricamento...' : 'Nessun prodotto trovato' }}
              </td>
            </tr>
            <tr *ngFor="let product of filteredProducts">
              <td>{{ product.clientName }}</td>
              <td>{{ product.productName }}</td>
              <td>{{ product.producer || '-' }}</td>
              <td>{{ product.hPhrases || '-' }}</td>
              <td>{{ product.pictogram || '-' }}</td>
              <td>{{ product.physicalState || '-' }}</td>
              <td>{{ product.vocPercent || '-' }}</td>
              <td>{{ product.density || '-' }}</td>
              <td>{{ product.sdsDate | date:'dd/MM/yyyy' }}</td>
              <td class="actions">
                <button class="btn btn-small btn-danger" (click)="onDelete(product.id)">Elimina</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .product-list-page { padding: 20px; }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .page-header h1 { margin: 0; color: #2c3e50; }
    .filters {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }
    .filter-select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    .table-container { overflow-x: auto; }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .data-table th, .data-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    .data-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #2c3e50;
    }
    .text-center { text-align: center !important; color: #999; }
    .actions {
      display: flex;
      gap: 8px;
    }
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      text-decoration: none;
      display: inline-block;
      color: white;
    }
    .btn-small {
      padding: 6px 12px;
      font-size: 12px;
    }
    .btn-danger { background: #e74c3c; }
    .btn-danger:hover { background: #c0392b; }
  `]
})
export class ProductListComponent implements OnInit {
  products: ChemicalProduct[] = [];
  filteredProducts: ChemicalProduct[] = [];
  clients: Client[] = [];
  isLoading = true;
  selectedClientId = 0;

  constructor(
    private productService: ProductService,
    private clientService: ClientService
  ) {}

  ngOnInit() {
    this.loadClients();
    this.loadProducts();
  }

  private loadClients() {
    this.clientService.getAll().subscribe({
      next: (clients) => this.clients = clients,
      error: () => {}
    });
  }

  private loadProducts() {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Errore nel caricamento dei prodotti');
      }
    });
  }

  onFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedClientId = target.value ? parseInt(target.value) : 0;
    this.applyFilter();
  }

  private applyFilter() {
    this.filteredProducts = this.selectedClientId
      ? this.products.filter(p => p.clientId === this.selectedClientId)
      : this.products;
  }

  onDelete(id: number) {
    if (confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          alert('Prodotto eliminato con successo');
          this.loadProducts();
        },
        error: () => {
          alert('Errore nell\'eliminazione del prodotto');
        }
      });
    }
  }
}
