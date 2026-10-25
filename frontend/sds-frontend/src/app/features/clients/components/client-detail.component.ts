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
  templateUrl: './client-detail.component.html',
  styleUrl: './client-detail.component.css'
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
