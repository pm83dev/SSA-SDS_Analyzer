import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { environment } from 'environments/environment';
import { SafetyCardService } from '../../../core/services/safety-card.service';
import { SafetyCard } from '../../../core/models/safety-card.model';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';

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
        <input type="text" class="filter-select search-input" placeholder="Cerca prodotto, produttore, frasi H..." (input)="onSearch($event)" />
        <select class="filter-select" (change)="onClientChange($event)">
          <option value="">Tutti i clienti</option>
          <option *ngFor="let c of clients" [value]="c.id">{{ c.ragioneSociale }}</option>
        </select>
        <select class="filter-select" (change)="onTipologiaChange($event)">
          <option value="">Tutte le tipologie</option>
          <option value="SDS">Scheda di Sicurezza (SDS)</option>
          <option value="DPI">DPI</option>
          <option value="Antincendio">Antincendio</option>
          <option value="Rischi">Valutazione Rischi</option>
          <option value="Altro">Altro</option>
        </select>
        <select class="filter-select" (change)="onStatoChange($event)">
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
              <th>Titolo / Prodotto</th>
              <th>Produttore</th>
              <th>Frasi H</th>
              <th>Pittogrammi</th>
              <th>Data Rilascio / SDS</th>
              <th>Data Scadenza</th>
              <th>Giorni</th>
              <th>Stato</th>
              <th>PDF</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="filteredCards.length === 0">
              <td colspan="12" class="text-center">
                {{ isLoading ? 'Caricamento...' : 'Nessuna scheda trovata' }}
              </td>
            </tr>
            <tr *ngFor="let card of filteredCards" class="clickable-row" (click)="openDetail(card)" title="Clicca per vedere tutti i dati">
              <td>{{ card.clientName }}</td>
              <td>{{ card.tipologia }}</td>
              <td class="wrap-cell">
                {{ card.titolo }}
                <span *ngIf="card.contieneDiisocianati" class="badge badge-expiring" title="Contiene diisocianati">Diisocianati</span>
              </td>
              <td class="wrap-cell">{{ card.enteEmittitore || '-' }}</td>
              <td class="codes-cell">
                <span *ngFor="let code of splitCodes(card.frasiH)" class="code-tag">{{ code }}</span>
                <span *ngIf="!card.frasiH">-</span>
              </td>
              <td class="codes-cell">
                <span *ngFor="let code of splitCodes(card.pittogrammi)" class="code-tag code-tag-ghs">{{ code }}</span>
                <span *ngIf="!card.pittogrammi">-</span>
              </td>
              <td>{{ card.dataRilascio | date:'dd/MM/yyyy' }}</td>
              <td>{{ card.dataScadenza | date:'dd/MM/yyyy' }}</td>
              <td>
                <span *ngIf="card.daysRemaining !== null && card.daysRemaining !== undefined"
                      [ngClass]="getDaysClass(card.daysRemaining)">{{ card.daysRemaining }}</span>
                <span *ngIf="card.daysRemaining === null || card.daysRemaining === undefined">-</span>
              </td>
              <td>
                <span class="badge" [ngClass]="getStatusClass(card.stato)">{{ card.stato }}</span>
              </td>
              <td (click)="$event.stopPropagation()">
                <a *ngIf="card.hasPdf && card.pdfUrl" href="#" (click)="$event.preventDefault(); openPdf(card)" class="pdf-link">PDF</a>
                <span *ngIf="!card.hasPdf" class="no-pdf">-</span>
              </td>
              <td (click)="$event.stopPropagation()">
                <div class="actions">
                  <a [routerLink]="['/safety-cards', card.id, 'edit']" class="btn btn-small btn-secondary">Modifica</a>
                  <button class="btn btn-small btn-danger" (click)="onDelete(card.id)">Elimina</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Scheda di dettaglio: tutti i dati, con lo stesso layout del form di modifica -->
      <div class="detail-overlay" *ngIf="selectedCard as c" (click)="closeDetail()">
        <div class="detail-card" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
          <div class="detail-header">
            <div>
              <h2>{{ c.titolo }}</h2>
              <span class="detail-sub">{{ c.clientName }} · {{ c.tipologia }}</span>
              <span class="badge ms-2" [ngClass]="getStatusClass(c.stato)">{{ c.stato }}</span>
              <span *ngIf="c.contieneDiisocianati" class="badge badge-expiring ms-2">Contiene diisocianati</span>
            </div>
            <button type="button" class="close-btn" (click)="closeDetail()" aria-label="Chiudi">&times;</button>
          </div>

          <div class="detail-body">
            <div class="detail-grid">
              <div class="detail-item">
                <label>Cliente</label>
                <p>{{ c.clientName || '-' }}</p>
              </div>
              <div class="detail-item">
                <label>Tipologia</label>
                <p>{{ c.tipologia || '-' }}</p>
              </div>
              <div class="detail-item">
                <label>{{ isSds(c) ? 'Versione / Revisione SDS' : 'Numero Protocollo' }}</label>
                <p>{{ c.numeroProtocollo || '-' }}</p>
              </div>
              <div class="detail-item">
                <label>{{ isSds(c) ? 'Produttore' : 'Ente Emittitore' }}</label>
                <p>{{ c.enteEmittitore || '-' }}</p>
              </div>
              <div class="detail-item">
                <label>{{ isSds(c) ? 'Data SDS' : 'Data Rilascio' }}</label>
                <p>{{ (c.dataRilascio | date:'dd/MM/yyyy') || '-' }}</p>
              </div>
              <div class="detail-item">
                <label>Data Scadenza</label>
                <p>
                  {{ (c.dataScadenza | date:'dd/MM/yyyy') || '-' }}
                  <span *ngIf="c.daysRemaining !== null && c.daysRemaining !== undefined"
                        [ngClass]="getDaysClass(c.daysRemaining)"> ({{ c.daysRemaining }} giorni)</span>
                </p>
              </div>
              <div class="detail-item">
                <label>Validità (mesi)</label>
                <p>{{ c.validitaMesi ?? '-' }}</p>
              </div>
              <div class="detail-item">
                <label>Frequenza Controllo</label>
                <p>{{ c.frequenzaControllo || '-' }}</p>
              </div>
              <div class="detail-item full-width" *ngIf="c.osservazioni">
                <label>Osservazioni</label>
                <p class="pre-wrap">{{ c.osservazioni }}</p>
              </div>
            </div>

            <div class="detail-section" *ngIf="isSds(c) || hasSdsData(c)">
              <h3>Dati della Scheda di Sicurezza</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Frasi H (sez. 2.1)</label>
                  <p class="codes-cell">
                    <span *ngFor="let code of splitCodes(c.frasiH)" class="code-tag">{{ code }}</span>
                    <span *ngIf="!c.frasiH">-</span>
                  </p>
                </div>
                <div class="detail-item">
                  <label>Pittogrammi (sez. 2.2)</label>
                  <p class="codes-cell">
                    <span *ngFor="let code of splitCodes(c.pittogrammi)" class="code-tag code-tag-ghs">{{ code }}</span>
                    <span *ngIf="!c.pittogrammi">-</span>
                  </p>
                </div>
                <div class="detail-item full-width">
                  <label>Composizione n. CAS &gt; 0,1% (sez. 3)</label>
                  <ul class="composition-list" *ngIf="c.composizioneCasSopra; else noValue">
                    <li *ngFor="let row of splitList(c.composizioneCasSopra)">{{ row }}</li>
                  </ul>
                </div>
                <div class="detail-item full-width">
                  <label>Composizione n. CAS &lt; 0,1% (sez. 3)</label>
                  <ul class="composition-list" *ngIf="c.composizioneCasSotto; else noValue">
                    <li *ngFor="let row of splitList(c.composizioneCasSotto)">{{ row }}</li>
                  </ul>
                </div>
                <div class="detail-item full-width">
                  <label>Composizione (sez. 3)</label>
                  <p class="pre-wrap">{{ c.composizione || '-' }}</p>
                </div>
                <div class="detail-item">
                  <label>Diisocianati</label>
                  <p>{{ c.contieneDiisocianati === true ? 'Sì' : c.contieneDiisocianati === false ? 'No' : '-' }}</p>
                </div>
                <div class="detail-item">
                  <label>Stato fisico (sez. 9)</label>
                  <p>{{ c.statoFisico || '-' }}</p>
                </div>
                <div class="detail-item">
                  <label>Temperatura di ebollizione (sez. 9)</label>
                  <p>{{ c.temperaturaEbollizione || '-' }}</p>
                </div>
                <div class="detail-item">
                  <label>COV %</label>
                  <p>{{ c.covPercent || '-' }}</p>
                </div>
                <div class="detail-item">
                  <label>Densità (sez. 9)</label>
                  <p>{{ c.densita || '-' }}</p>
                </div>
                <div class="detail-item">
                  <label>URL SDS</label>
                  <p class="wrap-cell">
                    <a *ngIf="isUrl(c.sdsUrl); else plainUrl" [href]="c.sdsUrl" target="_blank" rel="noopener">{{ c.sdsUrl }}</a>
                    <ng-template #plainUrl>{{ c.sdsUrl || '-' }}</ng-template>
                  </p>
                </div>
              </div>
            </div>
            <ng-template #noValue><p>-</p></ng-template>
          </div>

          <div class="detail-actions">
            <span class="detail-meta">
              <span *ngIf="c.llmAnalyzed">Dati estratti automaticamente dal PDF · </span>
              Aggiornata il {{ c.updatedAt | date:'dd/MM/yyyy HH:mm' }}
            </span>
            <button *ngIf="c.hasPdf && c.pdfUrl" type="button" class="btn btn-small btn-outline" (click)="openPdf(c)">Apri PDF</button>
            <a [routerLink]="['/safety-cards', c.id, 'edit']" class="btn btn-small btn-primary">Modifica</a>
            <button type="button" class="btn btn-small btn-secondary" (click)="closeDetail()">Chiudi</button>
          </div>
        </div>
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
    .search-input { min-width: 280px; }
    .wrap-cell { overflow-wrap: anywhere; min-width: 120px; max-width: 260px; }
    .codes-cell {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      min-width: 120px;
      max-width: 240px;
      margin: 0;
    }
    td.codes-cell { display: table-cell; }
    td.codes-cell .code-tag { margin: 0 4px 4px 0; }
    .code-tag {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      background: #eef2f7;
      color: #2c3e50;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }
    .code-tag-ghs { background: #fdecea; color: #a93226; }
    .clickable-row { cursor: pointer; }
    .clickable-row:hover td { background: #f5f9fd; }
    .detail-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 40px 16px;
      overflow-y: auto;
      z-index: 1050;
    }
    .detail-card {
      background: white;
      border-radius: 8px;
      width: 100%;
      max-width: 900px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
    }
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      padding: 24px 32px 16px;
      border-bottom: 1px solid #eee;
    }
    .detail-header h2 { margin: 0 0 6px; color: #2c3e50; font-size: 22px; overflow-wrap: anywhere; }
    .detail-sub { color: #7f8c8d; font-size: 14px; }
    .close-btn {
      background: none;
      border: none;
      font-size: 28px;
      line-height: 1;
      color: #95a5a6;
      cursor: pointer;
    }
    .close-btn:hover { color: #2c3e50; }
    .detail-body { padding: 24px 32px; }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px 20px;
    }
    .detail-item.full-width { grid-column: 1 / -1; }
    .detail-item label {
      display: block;
      margin-bottom: 4px;
      font-weight: 600;
      color: #2c3e50;
      font-size: 13px;
    }
    .detail-item p {
      margin: 0;
      padding: 8px 12px;
      min-height: 38px;
      background: #f8f9fa;
      border: 1px solid #eee;
      border-radius: 4px;
      font-size: 14px;
      overflow-wrap: anywhere;
    }
    .detail-item p.codes-cell { max-width: none; }
    .pre-wrap { white-space: pre-wrap; }
    .composition-list {
      margin: 0;
      padding: 8px 12px 8px 28px;
      background: #f8f9fa;
      border: 1px solid #eee;
      border-radius: 4px;
      font-size: 13px;
      overflow-wrap: anywhere;
    }
    .composition-list li { margin-bottom: 2px; }
    .detail-section {
      margin-top: 24px;
      padding: 20px;
      border: 1px solid #e1e8ed;
      border-radius: 8px;
    }
    .detail-section h3 { margin: 0 0 16px; font-size: 16px; color: #2c3e50; }
    .detail-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      padding: 16px 32px 24px;
      border-top: 1px solid #eee;
    }
    .detail-meta { margin-right: auto; color: #95a5a6; font-size: 12px; }
    .btn-outline { background: white; color: #3498db; border: 1px solid #3498db; }
    .btn-outline:hover { background: #eaf4fc; }
    @media (max-width: 768px) {
      .detail-grid { grid-template-columns: 1fr; }
      .detail-header, .detail-body, .detail-actions { padding-left: 16px; padding-right: 16px; }
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
    .days-positive { color: #27ae60; font-weight: 600; }
    .days-warning { color: #f39c12; font-weight: 600; }
    .days-danger { color: #e74c3c; font-weight: 600; }
    .pdf-link {
      color: #3498db;
      text-decoration: underline;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
    }
    .no-pdf { color: #ccc; }
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
  selectedClientId = 0;
  searchTerm = '';
  clients: Client[] = [];

  constructor(
    private cardService: SafetyCardService,
    private clientService: ClientService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadCards();
    this.clientService.getAll().subscribe({
      next: (clients) => this.clients = clients,
      error: () => {}
    });
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

  onTipologiaChange(event: Event) {
    this.selectedTipologia = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  onStatoChange(event: Event) {
    this.selectedStato = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  // Il PDF è servito da un endpoint protetto: un semplice <a href> non invia il token
  openPdf(card: SafetyCard) {
    if (!card.pdfUrl) return;
    this.http.get(`${environment.apiUrl}${card.pdfUrl}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      },
      error: () => alert('Errore nell\'apertura del PDF')
    });
  }

  private applyFilters() {
    this.filteredCards = this.cards.filter(card => {
      const matchTipologia = !this.selectedTipologia || card.tipologia === this.selectedTipologia;
      const matchStato = !this.selectedStato || card.stato === this.selectedStato;
      const matchClient = !this.selectedClientId || card.clientId === this.selectedClientId;
      const matchSearch = !this.searchTerm ||
        [card.titolo, card.enteEmittitore, card.frasiH, card.pittogrammi, card.composizione, card.clientName]
          .some(v => v?.toLowerCase().includes(this.searchTerm));
      return matchTipologia && matchStato && matchClient && matchSearch;
    });
  }

  selectedCard: SafetyCard | null = null;

  openDetail(card: SafetyCard) {
    this.selectedCard = card;
  }

  closeDetail() {
    this.selectedCard = null;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeDetail();
  }

  isSds(card: SafetyCard): boolean {
    return card.tipologia === 'SDS';
  }

  hasSdsData(card: SafetyCard): boolean {
    return !!(card.frasiH || card.pittogrammi || card.composizione || card.composizioneCasSopra ||
      card.composizioneCasSotto || card.statoFisico || card.covPercent || card.densita);
  }

  // "H225,H319" o "GHS02, GHS07" -> un tag per codice, così la cella va a capo
  splitCodes(value?: string): string[] {
    return value ? value.split(/[,;]/).map(v => v.trim()).filter(v => v) : [];
  }

  // Le composizioni arrivano come elenco separato da virgole o punto e virgola: una voce per riga
  splitList(value?: string): string[] {
    return value ? value.split(/;|,(?=\s*[A-Za-zÀ-ÿ])/).map(v => v.trim()).filter(v => v) : [];
  }

  isUrl(value?: string): boolean {
    return !!value && /^https?:\/\//i.test(value);
  }

  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.applyFilters();
  }

  onClientChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedClientId = value ? Number(value) : 0;
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Valid': return 'badge-valid';
      case 'Expiring': return 'badge-expiring';
      case 'Expired': return 'badge-expired';
      default: return 'badge-default';
    }
  }

  getDaysClass(days: number | undefined): string {
    if (days === undefined || days === null) return '';
    if (days < 0) return 'days-danger';
    if (days <= 30) return 'days-warning';
    return 'days-positive';
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
