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
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
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
