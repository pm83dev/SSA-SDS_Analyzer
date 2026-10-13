import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafetyCardService } from '../../../core/services/safety-card.service';
import { SafetyCard } from '../../../core/models/safety-card.model';

@Component({
  selector: 'app-scenarios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="scenarios-page">
      <div class="page-header">
        <h1>Gestione Scadenze</h1>
      </div>
      <div class="scenarios-filters">
        <select class="filter-select" (change)="onFilterChange($event)">
          <option value="30">Prossimi 30 giorni</option>
          <option value="60">Prossimi 60 giorni</option>
          <option value="90">Prossimi 90 giorni</option>
          <option value="365">Prossimo anno</option>
          <option value="all">Tutte</option>
        </select>
      </div>
      <div class="summary-cards">
        <div class="summary-card summary-expiring">
          <h3>In Scadenza</h3>
          <p class="summary-number">{{ expiringCount }}</p>
        </div>
        <div class="summary-card summary-expired">
          <h3>Scadute</h3>
          <p class="summary-number">{{ expiredCount }}</p>
        </div>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Scheda</th>
              <th>Tipologia</th>
              <th>Data Scadenza</th>
              <th>Giorni Restanti</th>
              <th>Stato</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="filteredCards.length === 0">
              <td colspan="6" class="text-center">
                {{ isLoading ? 'Caricamento...' : 'Nessuna scheda trovata' }}
              </td>
            </tr>
            <tr *ngFor="let card of filteredCards">
              <td>{{ card.clientName }}</td>
              <td>{{ card.titolo }}</td>
              <td>{{ card.tipologia }}</td>
              <td>{{ card.dataScadenza | date:'dd/MM/yyyy' }}</td>
              <td>
                <span *ngIf="getDaysRemaining(card) >= 0" class="text-warning">{{ getDaysRemaining(card) }} giorni</span>
                <span *ngIf="getDaysRemaining(card) < 0" class="text-danger">{{ getDaysRemaining(card) * -1 }} giorni fa</span>
              </td>
              <td>
                <span class="badge" [ngClass]="getStatusClass(card.stato)">{{ card.stato }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .scenarios-page { padding: 20px; }
    .page-header {
      margin-bottom: 24px;
    }
    .page-header h1 { margin: 0; color: #2c3e50; }
    .scenarios-filters { margin-bottom: 16px; }
    .filter-select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    .summary-cards {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }
    .summary-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      flex: 1;
      text-align: center;
    }
    .summary-card h3 {
      margin: 0 0 12px 0;
      color: #7f8c8d;
      font-size: 14px;
      text-transform: uppercase;
    }
    .summary-number {
      font-size: 32px;
      font-weight: bold;
      margin: 0;
    }
    .summary-expiring .summary-number { color: #f39c12; }
    .summary-expired .summary-number { color: #e74c3c; }
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
    .text-warning { color: #f39c12; font-weight: 600; }
    .text-danger { color: #e74c3c; font-weight: 600; }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-valid { background: #d4edda; color: #155724; }
    .badge-expiring { background: #fff3cd; color: #856404; }
    .badge-expired { background: #f8d7da; color: #721c24; }
  `]
})
export class ScenariosComponent implements OnInit {
  cards: SafetyCard[] = [];
  filteredCards: SafetyCard[] = [];
  isLoading = true;
  selectedDays = 30;
  expiringCount = 0;
  expiredCount = 0;

  constructor(
    private cardService: SafetyCardService
  ) {}

  ngOnInit() {
    this.loadCards();
  }

  private loadCards() {
    this.isLoading = true;
    this.cardService.getCards().subscribe({
      next: (cards) => {
        this.cards = cards;
        this.expiringCount = cards.filter(c => c.stato === 'Expiring').length;
        this.expiredCount = cards.filter(c => c.stato === 'Expired').length;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Errore nel caricamento delle schede');
      }
    });
  }

  onFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedDays = target.value === 'all' ? 9999 : parseInt(target.value);
    this.applyFilter();
  }

  private applyFilter() {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const limitDate = new Date(todayStart);
    limitDate.setDate(limitDate.getDate() + this.selectedDays);

    this.filteredCards = this.cards
      .filter(card => {
        if (!card.dataScadenza) return false;
        const scadenza = new Date(card.dataScadenza);
        const scadenzaStart = new Date(scadenza.getFullYear(), scadenza.getMonth(), scadenza.getDate());
        return scadenzaStart >= todayStart && scadenzaStart <= limitDate;
      })
      .sort((a, b) => new Date(a.dataScadenza!).getTime() - new Date(b.dataScadenza!).getTime());
  }

  getDaysRemaining(card: SafetyCard): number {
    if (!card.dataScadenza) return 0;
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const scadenza = new Date(card.dataScadenza);
    const scadenzaStart = new Date(scadenza.getFullYear(), scadenza.getMonth(), scadenza.getDate());
    const diffTime = scadenzaStart.getTime() - todayStart.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
