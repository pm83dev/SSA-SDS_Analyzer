import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  isLoading = true;

  constructor(
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadClients();
  }

  private loadClients() {
    this.isLoading = true;
    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.filteredClients = clients;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Errore nel caricamento dei clienti');
      }
    });
  }

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredClients = this.clients.filter(c =>
      c.ragioneSociale.toLowerCase().includes(term) ||
      (c.citta && c.citta.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  }

  onDelete(client: Client) {
    // Le schede non vengono eliminate: si toglie solo il collegamento con il cliente
    const schede = client.totalCards > 0
      ? `\n\nLe sue ${client.totalCards} schede di sicurezza restano nell'archivio (vengono solo scollegate).`
      : '';
    if (confirm(`Sei sicuro di voler eliminare il cliente "${client.ragioneSociale}"?${schede}`)) {
      this.clientService.delete(client.id).subscribe({
        next: () => {
          alert('Cliente eliminato con successo');
          this.loadClients();
        },
        error: () => {
          alert('Errore nell\'eliminazione del cliente');
        }
      });
    }
  }
}
