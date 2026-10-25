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
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.css'
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
