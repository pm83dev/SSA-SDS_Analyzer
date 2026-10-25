import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as XLSX from 'xlsx';
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
  isExporting = false;

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

  // Esporta le schede in Excel direttamente dal frontend usando la libreria xlsx.
  // Usa il filtro cliente attualmente selezionato:
  // se è selezionato un cliente, esporta solo le sue schede; altrimenti esporta tutte.
  exportToExcel() {
    this.isExporting = true;
    try {
      // Se il filtro è "Solo archivio" (-1), esporta le schede senza clienti
      let cardsToExport: SafetyCard[];
      if (this.selectedClientId > 0) {
        cardsToExport = this.cards.filter(card => card.clients.some(c => c.id === this.selectedClientId));
      } else if (this.selectedClientId === -1) {
        cardsToExport = this.cards.filter(card => card.clients.length === 0);
      } else {
        cardsToExport = this.cards;
      }

      // Intestazioni: stesso ordine e stesse colonne della tabella frontend (SDS_FIELDS)
      const headers = [
        'ID CLIENTE', 'Nome prodotto chimico', 'Produttore', 'Frasi H', 'Pittogramma',
        'Composizione n. CAS > 0,1%', 'Composizione n. CAS < 0,1%', 'Composizione',
        'Diisocianati', 'Stato fisico', 'Teb (°C)', '%COV o VOC', 'Densità (g/cm³)',
        'SDS', 'Data SDS', 'Nome file importato',
        'Tipologia', 'Versione / Revisione SDS', 'Data Scadenza', 'Stato',
        'Giorni restanti', 'Validità (mesi)', 'Frequenza Controllo', 'Osservazioni',
        'Campi da verificare', 'Note verifica', 'Creato il', 'Aggiornato il'
      ];

      // Costruisce i dati da esportare
      const rows = cardsToExport.map(card => [
        card.clients.map(c => `${c.id} – ${c.ragioneSociale}`).join('; ') || 'Archivio',
        card.titolo,
        card.enteEmittitore,
        card.frasiH,
        card.pittogrammi,
        card.composizioneCasSopra,
        card.composizioneCasSotto,
        card.composizione,
        card.contieneDiisocianati ? 'Sì' : 'No',
        card.statoFisico,
        card.temperaturaEbollizione,
        card.covPercent,
        card.densita,
        card.sdsUrl,
        card.dataRilascio ? new Date(card.dataRilascio).toLocaleDateString('it-IT') : '',
        card.nomeFileImportato,
        card.tipologia,
        card.numeroProtocollo,
        card.dataScadenza ? new Date(card.dataScadenza).toLocaleDateString('it-IT') : '',
        card.stato,
        card.daysRemaining,
        card.validitaMesi,
        card.frequenzaControllo,
        card.osservazioni,
        card.campiDaVerificare?.length ? card.campiDaVerificare.map(k => fieldLabel(k)).join('; ') : '',
        card.noteVerifica,
        card.createdAt ? new Date(card.createdAt).toLocaleDateString('it-IT') : '',
        card.updatedAt ? new Date(card.updatedAt).toLocaleDateString('it-IT') : ''
      ]);

      // Crea il foglio di lavoro
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

      // Imposta le larghezze delle colonne
      ws['!cols'] = headers.map((_, i) => ({
        wch: Math.min(40, Math.max(12, headers[i].length + 2))
      }));

      // Crea il workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Schede di Sicurezza');

      // Genera il file Excel e lo scarica
      const fileName = this.selectedClientId > 0
        ? `Schede_Sicurezza_Cliente_${this.selectedClientId}_${new Date().toISOString().slice(0, 10)}.xlsx`
        : this.selectedClientId === -1
          ? `Schede_Sicurezza_Archivio_${new Date().toISOString().slice(0, 10)}.xlsx`
          : `Schede_Sicurezza_${new Date().toISOString().slice(0, 10)}.xlsx`;

      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Errore nell\'esportazione Excel:', error);
      alert('Errore nell\'esportazione delle schede in Excel');
    } finally {
      this.isExporting = false;
    }
  }
}
