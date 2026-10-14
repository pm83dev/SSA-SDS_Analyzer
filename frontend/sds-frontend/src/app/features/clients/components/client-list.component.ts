import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="client-list-page">
      <div class="page-header">
        <h1>Clienti</h1>
        <a routerLink="/clients/new" class="btn btn-primary">+ Nuovo Cliente</a>
      </div>
      <div class="search-bar">
        <input type="text" placeholder="Cerca cliente..." class="search-input" (input)="onSearch($event)" />
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Ragione Sociale</th>
              <th>Codice Fiscale</th>
              <th>Città</th>
              <th>Telefono</th>
              <th>Email</th>
              <th>Schede</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="filteredClients.length === 0">
              <td colspan="7" class="text-center">
                {{ isLoading ? 'Caricamento...' : 'Nessun cliente trovato' }}
              </td>
            </tr>
            <tr *ngFor="let client of filteredClients">
              <td>
                <a [routerLink]="['/clients', client.id]" class="client-link">{{ client.ragioneSociale }}</a>
              </td>
              <td>{{ client.codiceFiscale || '-' }}</td>
              <td>{{ client.citta || '-' }}</td>
              <td>{{ client.telefono || '-' }}</td>
              <td>{{ client.email || '-' }}</td>
              <td>{{ client.totalCards }}</td>
              <td class="actions">
                <a [routerLink]="['/clients', client.id, 'edit']" class="btn btn-small btn-secondary">Modifica</a>
                <button class="btn btn-small btn-danger" (click)="onDelete(client.id)">Elimina</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .client-list-page { padding: 20px; }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .page-header h1 { margin: 0; color: #2c3e50; }
    .search-bar { margin-bottom: 16px; }
    .search-input {
      width: 100%;
      max-width: 400px;
      padding: 10px 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    .search-input:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }
    .table-container { overflow-x: auto; }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-radius: 8px;
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
    .client-link {
      color: #3498db;
      text-decoration: none;
      font-weight: 600;
    }
    .client-link:hover { text-decoration: underline; }
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
    .btn-primary { background: #3498db; }
    .btn-primary:hover { background: #2980b9; }
    .btn-secondary { background: #95a5a6; }
    .btn-secondary:hover { background: #7f8c8d; }
    .btn-danger { background: #e74c3c; }
    .btn-danger:hover { background: #c0392b; }
  `]
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  isLoading = true;

  constructor(
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadClients();
  }

  private loadClients() {
    this.isLoading = true;
    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.filteredClients = clients;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Errore nel caricamento dei clienti');
      }
    });
  }

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredClients = this.clients.filter(c =>
      c.ragioneSociale.toLowerCase().includes(term) ||
      (c.citta && c.citta.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  }

  onDelete(id: number) {
    if (confirm('Sei sicuro di voler eliminare questo cliente?')) {
      this.clientService.delete(id).subscribe({
        next: () => {
          alert('Cliente eliminato con successo');
          this.loadClients();
        },
        error: () => {
          alert('Errore nell\'eliminazione del cliente');
        }
      });
    }
  }
}
