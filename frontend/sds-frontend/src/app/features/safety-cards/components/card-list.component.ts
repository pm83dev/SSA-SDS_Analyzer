import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SafetyCardService } from '../../../core/services/safety-card.service';
import { SafetyCard } from '../../../core/models/safety-card.model';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="card-list-page">
      <div class="page-header">
        <h1>Schede di Sicurezza</h1>
        <a routerLink="/safety-cards/new" class="btn btn-primary">+ Nuova Scheda</a>
      </div>
      <div class="filters">
        <select class="filter-select" (change)="onFilterChange($event)">
          <option value="">Tutte le tipologie</option>
          <option value="DPI">DPI</option>
          <option value="Antincendio">Antincendio</option>
          <option value="Rischi">Valutazione Rischi</option>
        </select>
        <select class="filter-select" (change)="onFilterChange($event)">
          <option value="">Tutti gli stati</option>
          <option value="Valid">Valida</option>
          <option value="Expiring">In scadenza</option>
          <option value="Expired">Scaduta</option>
        </select>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Tipologia</th>
              <th>Titolo</th>
              <th>Data Rilascio</th>
              <th>Data Scadenza</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="filteredCards.length === 0">
              <td colspan="7" class="text-center">
                {{ isLoading ? 'Caricamento...' : 'Nessuna scheda trovata' }}
              </td>
            </tr>
            <tr *ngFor="let card of filteredCards">
              <td>{{ card.clientName }}</td>
              <td>{{ card.tipologia }}</td>
              <td>{{ card.titolo }}</td>
              <td>{{ card.dataRilascio | date:'dd/MM/yyyy' }}</td>
              <td>{{ card.dataScadenza | date:'dd/MM/yyyy' }}</td>
              <td>
                <span class="badge" [ngClass]="getStatusClass(card.stato)">{{ card.stato }}</span>
              </td>
              <td class="actions">
                <a [routerLink]="['/safety-cards', card.id, 'edit']" class="btn btn-small btn-secondary">Modifica</a>
                <button class="btn btn-small btn-danger" (click)="onDelete(card.id)">Elimina</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .card-list-page { padding: 20px; }
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
export class CardListComponent implements OnInit {
  cards: SafetyCard[] = [];
  filteredCards: SafetyCard[] = [];
  isLoading = true;
  selectedTipologia = '';
  selectedStato = '';

  constructor(
    private cardService: SafetyCardService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCards();
  }

  private loadCards() {
    this.isLoading = true;
    this.cardService.getCards().subscribe({
      next: (cards) => {
        this.cards = cards;
        this.applyFilters();
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
    if (target.selectedIndex === 0) {
      // Reset both filters
      this.selectedTipologia = '';
      this.selectedStato = '';
    } else {
      // Determine which filter changed
      const options = Array.from(target.options).map(o => o.value);
      const tipi = ['DPI', 'Antincendio', 'Rischi'];
      if (tipi.includes(target.value)) {
        this.selectedTipologia = target.value;
      } else {
        this.selectedStato = target.value;
      }
    }
    this.applyFilters();
  }

  private applyFilters() {
    this.filteredCards = this.cards.filter(card => {
      const matchTipologia = !this.selectedTipologia || card.tipologia === this.selectedTipologia;
      const matchStato = !this.selectedStato || card.stato === this.selectedStato;
      return matchTipologia && matchStato;
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Valid': return 'badge-valid';
      case 'Expiring': return 'badge-expiring';
      case 'Expired': return 'badge-expired';
      default: return 'badge-default';
    }
  }

  onDelete(id: number) {
    if (confirm('Sei sicuro di voler eliminare questa scheda?')) {
      this.cardService.deleteCard(id).subscribe({
        next: () => {
          alert('Scheda eliminata con successo');
          this.loadCards();
        },
        error: () => {
          alert('Errore nell\'eliminazione della scheda');
        }
      });
    }
  }
}
