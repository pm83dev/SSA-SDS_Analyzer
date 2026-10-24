import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { SafetyCardService } from '../../../core/services/safety-card.service';
import { Client } from '../../../core/models/client.model';
import { SafetyCard } from '../../../core/models/safety-card.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <h1>Dashboard</h1>
        <div class="header-actions">
          <a routerLink="/clients/new" class="btn btn-primary">+ Nuovo Cliente</a>
          <a routerLink="/safety-cards/new" class="btn btn-success">+ Nuova Scheda</a>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card" routerLink="/clients">
          <h3>Clienti Totali</h3>
          <p class="stat-number">{{ totalClients }}</p>
        </div>
        <div class="stat-card" routerLink="/safety-cards">
          <h3>Schede Totali</h3>
          <p class="stat-number">{{ totalCards }}</p>
        </div>
        <div class="stat-card stat-warning" routerLink="/scenarios">
          <h3>In Scadenza</h3>
          <p class="stat-number">{{ expiringCards }}</p>
        </div>
        <div class="stat-card stat-danger" routerLink="/scenarios">
          <h3>Scadute</h3>
          <p class="stat-number">{{ expiredCards }}</p>
        </div>
      </div>

      <div class="recent-section">
        <h2>Ultime Schede Aggiunte</h2>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Titolo</th>
                <th>Tipologia</th>
                <th>Data Scadenza</th>
                <th>Stato</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="recentCards.length === 0">
                <td colspan="5" class="text-center">Nessuna scheda presente</td>
              </tr>
              <tr *ngFor="let card of recentCards">
                <td>{{ clientNames(card) || '—' }}</td>
                <td>{{ card.titolo }}</td>
                <td>{{ card.tipologia }}</td>
                <td>{{ card.dataScadenza | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(card.stato)">{{ card.stato }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 20px; }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .page-header h1 { margin: 0; color: #2c3e50; }
    .header-actions {
      display: flex;
      gap: 12px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .stat-card h3 {
      margin: 0 0 12px 0;
      color: #7f8c8d;
      font-size: 14px;
      text-transform: uppercase;
    }
    .stat-number {
      font-size: 36px;
      font-weight: bold;
      color: #2c3e50;
      margin: 0;
    }
    .stat-warning .stat-number { color: #f39c12; }
    .stat-danger .stat-number { color: #e74c3c; }
    .recent-section {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .recent-section h2 {
      margin: 0 0 16px 0;
      color: #2c3e50;
      font-size: 18px;
    }
    .table-container { overflow-x: auto; }
    .data-table {
      width: 100%;
      border-collapse: collapse;
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
    .text-center { text-align: center; color: #999; }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
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
    .btn-primary { background: #3498db; }
    .btn-primary:hover { background: #2980b9; }
    .btn-success { background: #27ae60; }
    .btn-success:hover { background: #219a52; }
  `]
})
export class DashboardComponent implements OnInit {
  totalClients = 0;
  totalCards = 0;
  expiringCards = 0;
  expiredCards = 0;
  recentCards: SafetyCard[] = [];

  constructor(
    private clientService: ClientService,
    private cardService: SafetyCardService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.clientService.getAll().subscribe({
      next: (clients: Client[]) => {
        this.totalClients = clients.length;
      },
      error: () => console.error('Errore caricamento clienti')
    });

    this.cardService.getCards().subscribe({
      next: (cards: SafetyCard[]) => {
        this.totalCards = cards.length;
        this.expiringCards = cards.filter(c => c.stato === 'Expiring').length;
        this.expiredCards = cards.filter(c => c.stato === 'Expired').length;
        this.recentCards = [...cards]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
      },
      error: () => console.error('Errore caricamento schede')
    });
  }

  clientNames(card: SafetyCard): string {
    return card.clients.map(c => c.ragioneSociale).join(', ');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Valid': return 'badge-valid';
      case 'Expiring': return 'badge-expiring';
      case 'Expired': return 'badge-expired';
      default: return 'badge-default';
    }
  }
}
