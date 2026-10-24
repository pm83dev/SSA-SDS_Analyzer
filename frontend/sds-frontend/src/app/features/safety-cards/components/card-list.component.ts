import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SafetyCardService } from '../../../core/services/safety-card.service';
import { SafetyCard } from '../../../core/models/safety-card.model';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';
import { SDS_FIELDS, SdsField, columnLabel, isToVerify, verifyReasons, fieldLabel } from '../../../core/models/sds-fields';
import { SdsValueComponent } from '../../../shared/components/sds-value.component';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [CommonModule, RouterLink, SdsValueComponent],
  template: `
    <div class="card-list-page">
      <div class="page-header">
        <h1>Schede di Sicurezza</h1>
        <a routerLink="/safety-cards/new" class="btn btn-primary">+ Nuova Scheda</a>
      </div>
      <div class="filters">
        <input type="text" class="filter-select search-input" placeholder="Cerca prodotto, produttore, frasi H, CAS..." (input)="onSearch($event)" />
        <select class="filter-select" (change)="onClientChange($event)">
          <option value="">Tutti i clienti</option>
          <option value="-1">Solo archivio (senza clienti)</option>
          <option *ngFor="let c of clients" [value]="c.id">{{ c.id }} – {{ c.ragioneSociale }}</option>
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
        <label class="verify-filter">
          <input type="checkbox" (change)="onOnlyToVerifyChange($event)" />
          Solo da verificare ({{ toVerifyCount }})
        </label>
      </div>

      <!-- Colonne nello stesso ordine e con le stesse intestazioni del file "dati per SDS.xlsx" -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th *ngFor="let f of fields; let i = index" [class]="'col-' + f.kind" [class.sticky-1]="i === 0"
                  [class.sticky-2]="i === 1" [title]="f.hint || ''">{{ columnLabel(f) }}</th>
              <th class="col-actions">Azioni</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="filteredCards.length === 0">
              <td [attr.colspan]="fields.length + 1" class="text-center">
                {{ isLoading ? 'Caricamento...' : 'Nessuna scheda trovata' }}
              </td>
            </tr>
            <tr *ngFor="let card of filteredCards" class="clickable-row" [class.row-verify]="card.campiDaVerificare?.length" (click)="openDetail(card)" title="Clicca per vedere tutti i dati">
              <td *ngFor="let f of fields; let i = index" [class]="'col-' + f.kind" [class.sticky-1]="i === 0" [class.sticky-2]="i === 1" [class.cell-verify]="isToVerify(card, f.key)">
                <app-sds-value [card]="card" [field]="f" mode="cell" (openPdf)="openPdf($event)"></app-sds-value>
              </td>
              <td class="col-actions" (click)="$event.stopPropagation()">
                <div class="actions">
                  <a [routerLink]="['/safety-cards', card.id, 'edit']" class="btn btn-small btn-secondary">Modifica</a>
                  <button class="btn btn-small btn-danger" (click)="onDelete(card.id)">Elimina</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Scheda di dettaglio: i campi del file nello stesso ordine, con la descrizione della riga 2 -->
      <div class="detail-overlay" *ngIf="selectedCard as c" (click)="closeDetail()">
        <div class="detail-card" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
          <div class="detail-header">
            <div>
              <h2>{{ c.titolo }}</h2>
              <span class="detail-sub">{{ clientNames(c) || 'Solo archivio (nessun cliente)' }} · {{ c.tipologia }}</span>
              <span class="badge ms-2" [ngClass]="getStatusClass(c.stato)">{{ c.stato }}</span>
            </div>
            <button type="button" class="close-btn" (click)="closeDetail()" aria-label="Chiudi">&times;</button>
          </div>

          <div class="detail-body">
            <div class="verify-banner" *ngIf="c.campiDaVerificare?.length">
              <strong>⚠ {{ c.campiDaVerificare!.length }} {{ c.campiDaVerificare!.length === 1 ? 'campo da verificare' : 'campi da verificare' }} sulla scheda PDF</strong>
              <p>Questi dati non sono stati ritrovati nel testo della SDS e non sono stati inseriti (o sono stati inseriti in parte). Controllali sul PDF e completali da "Modifica".</p>
              <ul>
                <li *ngFor="let k of c.campiDaVerificare"><strong>{{ fieldLabel(k) }}</strong>: {{ verifyReasons(c, k).join('; ') }}</li>
              </ul>
            </div>
            <h3>Dati da estrapolare</h3>
            <div class="detail-grid">
              <div *ngFor="let f of fields" class="detail-item" [class.full-width]="isWide(f)" [class.item-verify]="isToVerify(c, f.key)">
                <label>{{ columnLabel(f) }}</label>
                <small *ngIf="f.hint" class="hint">{{ f.hint }}</small>
                <div class="detail-value">
                  <app-sds-value [card]="c" [field]="f" mode="detail" (openPdf)="openPdf($event)"></app-sds-value>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h3>Gestione scheda</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Tipologia</label>
                  <div class="detail-value">{{ c.tipologia || '-' }}</div>
                </div>
                <div class="detail-item" [class.item-verify]="isToVerify(c, 'numeroProtocollo')">
                  <label>Versione / Revisione SDS</label>
                  <div class="detail-value">{{ c.numeroProtocollo || '-' }}</div>
                </div>
                <div class="detail-item" [class.item-verify]="isToVerify(c, 'dataScadenza')">
                  <label>Data Scadenza</label>
                  <div class="detail-value">
                    {{ (c.dataScadenza | date:'dd/MM/yyyy') || '-' }}
                    <span *ngIf="c.daysRemaining !== null && c.daysRemaining !== undefined"
                          [ngClass]="getDaysClass(c.daysRemaining)"> ({{ c.daysRemaining }} giorni)</span>
                  </div>
                </div>
                <div class="detail-item">
                  <label>Stato</label>
                  <div class="detail-value"><span class="badge" [ngClass]="getStatusClass(c.stato)">{{ c.stato }}</span></div>
                </div>
                <div class="detail-item">
                  <label>Validità (mesi)</label>
                  <div class="detail-value">{{ c.validitaMesi ?? '-' }}</div>
                </div>
                <div class="detail-item">
                  <label>Frequenza Controllo</label>
                  <div class="detail-value">{{ c.frequenzaControllo || '-' }}</div>
                </div>
                <div class="detail-item full-width">
                  <label>Osservazioni</label>
                  <div class="detail-value pre-wrap">{{ c.osservazioni || '-' }}</div>
                </div>
              </div>
            </div>
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
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 16px;
    }
    .filter-select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    .search-input { min-width: 300px; }
    .table-container {
      overflow-x: auto;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .data-table {
      width: max-content;
      min-width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 14px;
    }
    .data-table th, .data-table td {
      padding: 10px;
      text-align: left;
      vertical-align: top;
      border-bottom: 1px solid #eee;
      background: white;
    }
    .data-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #2c3e50;
      font-size: 13px;
      vertical-align: bottom;
      cursor: help;
    }
    /* Larghezze per tipo di colonna: il contenuto va a capo dentro la cella */
    .col-client { min-width: 110px; max-width: 150px; }
    .col-text { min-width: 110px; max-width: 170px; }
    .col-hcodes { min-width: 170px; max-width: 220px; }
    .col-ghs { min-width: 150px; max-width: 200px; }
    .col-cas { min-width: 120px; max-width: 160px; }
    .col-names { min-width: 180px; max-width: 240px; }
    .col-teb, .col-density { min-width: 90px; white-space: nowrap; }
    .col-file { min-width: 140px; max-width: 200px; }
    .col-bool { min-width: 90px; }
    .col-url { min-width: 100px; max-width: 160px; }
    .col-date { min-width: 95px; white-space: nowrap; }
    .col-actions { min-width: 90px; }
    /* ID cliente e nome prodotto restano visibili scorrendo in orizzontale */
    .sticky-1 { position: sticky; left: 0; z-index: 2; width: 130px; min-width: 130px; max-width: 130px; }
    .sticky-2 { position: sticky; left: 130px; z-index: 2; box-shadow: 2px 0 0 #eee; min-width: 170px; max-width: 170px; }
    th.sticky-1, th.sticky-2 { z-index: 3; }
    .text-center { text-align: center !important; color: #999; }
    .clickable-row { cursor: pointer; }
    .row-verify td.sticky-1 { box-shadow: inset 4px 0 0 #f0ad4e; }
    .data-table td.cell-verify { background: #fff8e6; }
    .verify-filter { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #8a5a00; }
    .verify-banner { margin-bottom: 20px; padding: 12px 16px; border: 1px solid #f0c36d; border-radius: 6px; background: #fff8e6; color: #6b4a00; font-size: 13px; }
    .verify-banner p { margin: 4px 0 6px; }
    .verify-banner ul { margin: 0; padding-left: 18px; }
    .item-verify .detail-value { border-color: #f0c36d; background: #fff8e6; }
    .clickable-row:hover td { background: #f5f9fd; }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      background: #eceff1;
      color: #455a64;
    }
    .badge-valid { background: #d4edda; color: #155724; }
    .badge-expiring { background: #fff3cd; color: #856404; }
    .badge-expired { background: #f8d7da; color: #721c24; }
    .days-positive { color: #27ae60; font-weight: 600; }
    .days-warning { color: #f39c12; font-weight: 600; }
    .days-danger { color: #e74c3c; font-weight: 600; }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .actions .btn { text-align: center; }
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
    .btn-outline { background: white; color: #3498db; border: 1px solid #3498db; }
    .btn-outline:hover { background: #eaf4fc; }
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
      max-width: 960px;
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
    .detail-header h2 { margin: 0 0 6px; color: #2c3e50; font-size: 22px; overflow-wrap: break-word; }
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
    .detail-body { padding: 20px 32px; }
    .detail-body h3 { margin: 0 0 16px; font-size: 16px; color: #2c3e50; }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px 20px;
    }
    .detail-item { min-width: 0; }
    .detail-item.full-width { grid-column: 1 / -1; }
    .detail-item label {
      display: block;
      font-weight: 600;
      color: #2c3e50;
      font-size: 13px;
    }
    .hint { display: block; margin-bottom: 4px; color: #95a5a6; font-size: 11px; }
    .detail-value {
      margin-top: 4px;
      padding: 8px 12px;
      min-height: 38px;
      background: #f8f9fa;
      border: 1px solid #eee;
      border-radius: 4px;
      font-size: 14px;
      overflow-wrap: break-word;
    }
    .pre-wrap { white-space: pre-wrap; }
    .detail-section {
      margin-top: 24px;
      padding: 20px;
      border: 1px solid #e1e8ed;
      border-radius: 8px;
    }
    .detail-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      padding: 16px 32px 24px;
      border-top: 1px solid #eee;
    }
    .detail-meta { margin-right: auto; color: #95a5a6; font-size: 12px; }
    @media (max-width: 768px) {
      .detail-grid { grid-template-columns: 1fr; }
      .detail-header, .detail-body, .detail-actions { padding-left: 16px; padding-right: 16px; }
      .sticky-1, .sticky-2 { position: static; box-shadow: none; }
    }
  `]
})
export class CardListComponent implements OnInit {
  protected readonly columnLabel = columnLabel;
  protected readonly isToVerify = isToVerify;
  protected readonly verifyReasons = verifyReasons;
  protected readonly fieldLabel = fieldLabel;
  onlyToVerify = false;

  get toVerifyCount(): number {
    return this.cards.filter(c => c.campiDaVerificare?.length).length;
  }

  onOnlyToVerifyChange(event: Event) {
    this.onlyToVerify = (event.target as HTMLInputElement).checked;
    this.applyFilters();
  }
  readonly fields = SDS_FIELDS;
  cards: SafetyCard[] = [];
  filteredCards: SafetyCard[] = [];
  isLoading = true;
  selectedTipologia = '';
  selectedStato = '';
  selectedClientId = 0;
  searchTerm = '';
  clients: Client[] = [];
  selectedCard: SafetyCard | null = null;

  constructor(
    private cardService: SafetyCardService,
    private clientService: ClientService
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

  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.applyFilters();
  }

  onClientChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedClientId = value ? Number(value) : 0;
    this.applyFilters();
  }

  private applyFilters() {
    this.filteredCards = this.cards.filter(card => {
      const matchTipologia = !this.selectedTipologia || card.tipologia === this.selectedTipologia;
      const matchStato = !this.selectedStato || card.stato === this.selectedStato;
      // -1 = schede non collegate a nessun cliente
      const matchClient = !this.selectedClientId
        || (this.selectedClientId === -1 ? card.clients.length === 0 : card.clients.some(c => c.id === this.selectedClientId));
      const matchSearch = !this.searchTerm ||
        [card.titolo, card.enteEmittitore, card.frasiH, card.pittogrammi, card.composizione, card.nomeFileImportato,
          card.composizioneCasSopra, card.composizioneCasSotto, ...card.clients.map(c => c.ragioneSociale)]
          .some(v => v?.toLowerCase().includes(this.searchTerm));
      const matchVerify = !this.onlyToVerify || !!card.campiDaVerificare?.length;
      return matchTipologia && matchStato && matchClient && matchSearch && matchVerify;
    });
  }

  openPdf(card: SafetyCard) {
    this.cardService.openPdf(card);
  }

  clientNames(card: SafetyCard): string {
    return card.clients.map(c => c.ragioneSociale).join(', ');
  }

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

  isWide(field: SdsField): boolean {
    return field.kind === 'hcodes';
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
