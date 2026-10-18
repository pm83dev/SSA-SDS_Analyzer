import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService, ExpiringCard } from '../../../core/services/scenario.service';

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
          <option value="180">Prossimi 180 giorni</option>
          <option value="365">Prossimo anno</option>
        </select>
      </div>
      <div class="summary-cards">
        <div class="summary-card summary-expiring">
          <h3>In Scadenza (≤30gg)</h3>
          <p class="summary-number">{{ warningCount }}</p>
        </div>
        <div class="summary-card summary-expired">
          <h3>Scadute</h3>
          <p class="summary-number">{{ expiredCount }}</p>
        </div>
        <div class="summary-card summary-total">
          <h3>Totali nel periodo</h3>
          <p class="summary-number">{{ expiring.length }}</p>
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
            <tr *ngIf="expiring.length === 0">
              <td colspan="6" class="text-center">
                {{ isLoading ? 'Caricamento...' : 'Nessuna scheda in scadenza nel periodo selezionato' }}
              </td>
            </tr>
            <tr *ngFor="let card of expiring">
              <td>{{ card.clientName }}</td>
              <td>{{ card.titolo }}</td>
              <td>{{ card.tipologia }}</td>
              <td>{{ card.dataScadenza | date:'dd/MM/yyyy' }}</td>
              <td>
                <span *ngIf="(card.daysRemaining ?? 0) >= 0" class="text-warning">{{ card.daysRemaining }} giorni</span>
                <span *ngIf="(card.daysRemaining ?? 0) < 0" class="text-danger">{{ (card.daysRemaining ?? 0) * -1 }} giorni fa</span>
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
    .page-header { margin-bottom: 24px; }
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
      flex-wrap: wrap;
    }
    .summary-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      flex: 1;
      min-width: 140px;
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
    .summary-total .summary-number { color: #3498db; }
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
  expiring: ExpiringCard[] = [];
  isLoading = true;
  selectedDays = 90;
  warningCount = 0;
  expiredCount = 0;

  constructor(
    private scenarioService: ScenarioService
  ) {}

  ngOnInit() {
    this.loadExpiring();
  }

  private loadExpiring() {
    this.isLoading = true;
    this.scenarioService.getExpiring(this.selectedDays).subscribe({
      next: (cards) => {
        this.expiring = cards;
        this.expiredCount = cards.filter(c => (c.daysRemaining ?? 0) < 0).length;
        this.warningCount = cards.filter(c => (c.daysRemaining ?? 999) >= 0 && (c.daysRemaining ?? 999) <= 30).length;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.expiring = [];
      }
    });
  }

  onFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedDays = parseInt(target.value, 10);
    this.loadExpiring();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Valid': return 'badge-valid';
      case 'Expiring': return 'badge-expiring';
      case 'Expired': return 'badge-expired';
      default: return 'badge-valid';
    }
  }
}
