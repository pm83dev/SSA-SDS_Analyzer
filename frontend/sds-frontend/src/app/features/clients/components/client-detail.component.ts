import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { SafetyCardService } from '../../../core/services/safety-card.service';
import { Client } from '../../../core/models/client.model';
import { SafetyCard } from '../../../core/models/safety-card.model';
import { SDS_FIELDS, columnLabel } from '../../../core/models/sds-fields';
import { SdsValueComponent } from '../../../shared/components/sds-value.component';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, SdsValueComponent],
  template: `
    <div class="client-detail-page" *ngIf="client">
      <div class="page-header">
        <h1>{{ client.ragioneSociale }}</h1>
        <div class="header-actions">
          <a [routerLink]="['/clients', client.id, 'edit']" class="btn btn-secondary">Modifica</a>
          <a routerLink="/safety-cards/new" [queryParams]="{ clientId: client.id }" class="btn btn-primary">+ Nuova Scheda</a>
        </div>
      </div>

      <div class="client-info">
        <div class="info-grid">
          <div class="info-item">
            <label>Codice Fiscale</label>
            <p>{{ client.codiceFiscale || '-' }}</p>
          </div>
          <div class="info-item">
            <label>Indirizzo</label>
            <p>{{ client.indirizzo || '-' }}</p>
          </div>
          <div class="info-item">
            <label>Città</label>
            <p>{{ client.citta || '-' }} {{ client.provincia ? '(' + client.provincia + ')' : '' }}</p>
          </div>
          <div class="info-item">
            <label>CAP</label>
            <p>{{ client.cap || '-' }}</p>
          </div>
          <div class="info-item">
            <label>Telefono</label>
            <p>{{ client.telefono || '-' }}</p>
          </div>
          <div class="info-item">
            <label>Email</label>
            <p>{{ client.email || '-' }}</p>
          </div>
          <div class="info-item">
            <label>Contatto</label>
            <p>{{ client.contatto || '-' }}</p>
          </div>
          <div class="info-item">
            <label>Note</label>
            <p>{{ client.note || '-' }}</p>
          </div>
        </div>
      </div>

      <div class="cards-section">
        <h2>Schede di Sicurezza ({{ cards.length }})</h2>
        <!-- La stessa scheda può essere collegata a più clienti: qui si collegano schede già presenti nell'archivio -->
        <div class="link-card">
          <select class="form-select form-select-sm" [value]="cardToLink || ''" (change)="cardToLink = +$any($event.target).value || 0">
            <option value="">Collega una scheda dall'archivio...</option>
            <option *ngFor="let c of linkableCards" [value]="c.id">{{ c.titolo }}{{ c.enteEmittitore ? ' – ' + c.enteEmittitore : '' }}</option>
          </select>
          <button class="btn btn-small btn-primary" [disabled]="!cardToLink" (click)="linkCard(cardToLink)">Collega</button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th *ngFor="let f of fields" [title]="f.hint || ''">{{ columnLabel(f) }}</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="cards.length === 0">
                <td [attr.colspan]="fields.length + 1" class="text-center">Nessuna scheda presente per questo cliente</td>
              </tr>
              <tr *ngFor="let card of cards">
                <td *ngFor="let f of fields" class="sds-cell">
                  <app-sds-value [card]="card" [field]="f" mode="cell" (openPdf)="cardService.openPdf($event)"></app-sds-value>
                </td>
                <td class="actions">
                  <a [routerLink]="['/safety-cards', card.id, 'edit']" class="btn btn-small btn-secondary">Modifica</a>
                  <button class="btn btn-small btn-warning" (click)="unlinkCard(card)" title="Toglie la scheda da questo cliente: la scheda resta nell'archivio">Scollega</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div *ngIf="!client && !isLoading" class="not-found">
      <h1>Cliente non trovato</h1>
      <a routerLink="/clients" class="btn btn-primary">Torna alla lista</a>
    </div>
    <div *ngIf="isLoading" class="loading">Caricamento...</div>
  `,
  styles: [`
    .client-detail-page { padding: 20px; }
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
    .client-info {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 24px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    .info-item label {
      display: block;
      font-size: 12px;
      color: #7f8c8d;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .info-item p {
      margin: 0;
      color: #2c3e50;
      font-weight: 500;
    }
    .cards-section {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .cards-section h2 {
      margin: 0 0 16px 0;
      color: #2c3e50;
      font-size: 18px;
    }
    .table-container { overflow-x: auto; }
    .link-card { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; max-width: 560px; }
    .btn-warning { background: #f0ad4e; color: white; }
    .btn-warning:hover { background: #ec971f; }
    .sds-cell { min-width: 110px; max-width: 260px; vertical-align: top; font-size: 13px; }
    .data-table {
      width: max-content;
      min-width: 100%;
      border-collapse: collapse;
    }
    .data-table th, .data-table td {
      padding: 10px;
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
    .not-found {
      padding: 40px;
      text-align: center;
      color: #999;
    }
    .not-found h1 { color: #2c3e50; margin-bottom: 16px; }
    .loading {
      padding: 40px;
      text-align: center;
      color: #999;
    }
  `]
})
export class ClientDetailComponent implements OnInit {
  client?: Client;
  // Colonne del file "dati per SDS.xlsx" (senza ID CLIENTE: si è già nella pagina del cliente)
  protected readonly columnLabel = columnLabel;
  readonly fields = SDS_FIELDS.filter(f => f.key !== 'clients');
  cards: SafetyCard[] = [];
  // Tutte le schede dell'archivio, per collegarne una al cliente
  allCards: SafetyCard[] = [];
  cardToLink = 0;

  get linkableCards(): SafetyCard[] {
    const linked = new Set(this.cards.map(c => c.id));
    return this.allCards.filter(c => !linked.has(c.id)).sort((a, b) => a.titolo.localeCompare(b.titolo));
  }
  isLoading = true;
  clientId?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    protected cardService: SafetyCardService
  ) {}

  ngOnInit() {
    this.clientId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.clientId) {
      this.loadClient();
      this.loadCards();
      this.cardService.getCards().subscribe({ next: cards => this.allCards = cards, error: () => {} });
    }
  }

  linkCard(cardId: number) {
    if (!this.clientId || !cardId) return;
    this.cardService.linkToClient(this.clientId, cardId).subscribe({
      next: () => {
        this.cardToLink = 0;
        this.loadCards();
      },
      error: () => alert('Errore nel collegamento della scheda')
    });
  }

  unlinkCard(card: SafetyCard) {
    if (!this.clientId) return;
    if (!confirm(`Scollegare la scheda "${card.titolo}" da questo cliente?\nLa scheda resta nell'archivio.`)) return;
    this.cardService.unlinkFromClient(this.clientId, card.id).subscribe({
      next: () => this.loadCards(),
      error: () => alert('Errore nello scollegamento della scheda')
    });
  }

  private loadClient() {
    if (!this.clientId) return;
    this.isLoading = true;
    this.clientService.getById(this.clientId).subscribe({
      next: (client) => {
        this.client = client;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private loadCards() {
    if (!this.clientId) return;
    this.cardService.getCardsByClient(this.clientId).subscribe({
      next: (cards) => {
        this.cards = cards;
      },
      error: () => console.error('Errore caricamento schede')
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
}
