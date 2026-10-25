import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SafetyCardService } from '../../../core/services/safety-card.service';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';
import { CreateSafetyCard } from '../../../core/models/safety-card.model';
import { SDS_FIELDS, SdsField, fieldLabel } from '../../../core/models/sds-fields';

@Component({
  selector: 'app-card-form',
  standalone: true,
  imports: [CommonModule, NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: './card-form.component.html',
  styleUrl: './card-form.component.css'
})
export class CardFormComponent implements OnInit {
  cardForm!: FormGroup;
  clients: Client[] = [];
  isEdit = false;
  isSubmitting = false;
  isUploadingPdf = false;
  selectedPdf: File | null = null;
  pdfFileName = '';
  nomeFileImportato = '';
  // Campi che l'import PDF non ha ritrovato nel testo della SDS
  campiDaVerificare: string[] = [];
  noteVerifica = '';
  datiVerificati = false;
  protected readonly fieldLabel = fieldLabel;

  reasonsFor(key: string): string {
    return (this.noteVerifica ?? '').split('\n')
      .filter(l => l.startsWith(key + ':'))
      .map(l => l.slice(key.length + 1).trim())
      .join('; ');
  }
  cardId?: number;

  // Campi specifici delle schede di sicurezza (SDS), con lo stesso nome nel form e nell'API
  private readonly sdsTextFields = [
    'frasiH', 'pittogrammi', 'composizioneCasSopra', 'composizioneCasSotto', 'composizione',
    'statoFisico', 'temperaturaEbollizione', 'covPercent', 'densita', 'sdsUrl'
  ] as const;

  // Campi del file "dati per SDS.xlsx" nel form (il cliente è già in testa al form)
  readonly sdsFormFields = SDS_FIELDS.filter(f => f.key !== 'clients' && !f.readonly);

  // Clienti collegati alla scheda (zero, uno o più)
  selectedClientIds = new Set<number>();

  toggleClient(id: number, checked: boolean) {
    if (checked) this.selectedClientIds.add(id);
    else this.selectedClientIds.delete(id);
  }

  get isSds(): boolean {
    return this.cardForm?.get('tipologia')?.value === 'SDS';
  }

  isWide(field: SdsField): boolean {
    return field.kind === 'cas' || field.kind === 'names';
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cardService: SafetyCardService,
    private clientService: ClientService
  ) {}

  ngOnInit() {
    this.cardId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.cardId;
    this.initForm();
    this.loadClients();
    if (this.isEdit) {
      this.loadCard();
    } else {
      // Preselezione del cliente quando si arriva dal dettaglio cliente (?clientId=)
      const clientId = Number(this.route.snapshot.queryParamMap.get('clientId'));
      if (clientId) {
        this.selectedClientIds.add(clientId);
      }
    }
  }

  private initForm() {
    this.cardForm = this.fb.group({
      tipologia: ['', [Validators.required]],
      titolo: ['', [Validators.required, Validators.minLength(3)]],
      numeroProtocollo: [''],
      enteEmittitore: [''],
      dataRilascio: [''],
      dataScadenza: [''],
      validitaMesi: [null],
      frequenzaControllo: [''],
      osservazioni: [''],
      ...Object.fromEntries(this.sdsTextFields.map(f => [f, ['']])),
      contieneDiisocianati: [false]
    });
  }

  private loadClients() {
    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: () => {
        console.error('Errore nel caricamento clienti');
      }
    });
  }

  private loadCard() {
    if (!this.cardId) return;
    this.cardService.getCard(this.cardId).subscribe({
      next: (card) => {
        this.selectedClientIds = new Set(card.clients.map(c => c.id));
        this.cardForm.patchValue({
          tipologia: card.tipologia,
          titolo: card.titolo,
          numeroProtocollo: card.numeroProtocollo,
          enteEmittitore: card.enteEmittitore,
          // Le date arrivano dall'API come stringhe ISO, non come Date
          dataRilascio: card.dataRilascio ? String(card.dataRilascio).substring(0, 10) : '',
          dataScadenza: card.dataScadenza ? String(card.dataScadenza).substring(0, 10) : '',
          validitaMesi: card.validitaMesi,
          frequenzaControllo: card.frequenzaControllo,
          osservazioni: card.osservazioni,
          ...Object.fromEntries(this.sdsTextFields.map(f => [f, card[f] ?? ''])),
          contieneDiisocianati: !!card.contieneDiisocianati
        });
        this.nomeFileImportato = card.nomeFileImportato ?? '';
        this.campiDaVerificare = card.campiDaVerificare ?? [];
        this.noteVerifica = card.noteVerifica ?? '';
        this.pdfFileName = card.pdfUrl ? card.pdfUrl.split('/').pop() || 'PDF allegato' : '';
      },
      error: () => {
        alert('Errore nel caricamento della scheda');
        this.router.navigate(['/safety-cards']);
      }
    });
  }

  onSubmit() {
    if (this.cardForm.invalid) {
      this.cardForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.cardForm.value;
    const request: CreateSafetyCard = {
      clientIds: [...this.selectedClientIds],
      tipologia: formData.tipologia,
      titolo: formData.titolo,
      numeroProtocollo: formData.numeroProtocollo,
      enteEmittitore: formData.enteEmittitore,
      dataRilascio: formData.dataRilascio ? new Date(formData.dataRilascio) : undefined,
      dataScadenza: formData.dataScadenza ? new Date(formData.dataScadenza) : undefined,
      validitaMesi: formData.validitaMesi === '' || formData.validitaMesi === null ? undefined : Number(formData.validitaMesi),
      frequenzaControllo: formData.frequenzaControllo,
      osservazioni: formData.osservazioni,
      datiVerificati: this.datiVerificati
    };
    // I dati SDS si salvano solo per le schede di tipo SDS
    if (formData.tipologia === 'SDS') {
      for (const f of this.sdsTextFields) {
        request[f] = formData[f] || undefined;
      }
      request.contieneDiisocianati = formData.contieneDiisocianati || undefined;
    }

    if (this.isEdit && this.cardId) {
      this.cardService.updateCard(this.cardId, request).subscribe({
        next: () => {
          alert('Scheda aggiornata con successo');
          this.router.navigate(['/safety-cards']);
        },
        error: () => {
          alert('Errore nell\'aggiornamento della scheda');
          this.isSubmitting = false;
        }
      });
    } else {
      this.cardService.createCard(request).subscribe({
        next: () => {
          alert('Scheda creata con successo');
          this.router.navigate(['/safety-cards']);
        },
        error: () => {
          alert('Errore nella creazione della scheda');
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/safety-cards']);
  }

  onPdfSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedPdf = input.files[0];
    }
  }

  uploadPdf() {
    if (!this.selectedPdf || !this.cardId) return;
    this.isUploadingPdf = true;
    const formData = new FormData();
    formData.append('file', this.selectedPdf);
    this.cardService.uploadPdf(this.cardId, formData).subscribe({
      next: () => {
        this.pdfFileName = this.selectedPdf!.name;
        this.selectedPdf = null;
        this.isUploadingPdf = false;
        alert('PDF caricato con successo');
      },
      error: () => {
        alert('Errore nel caricamento del PDF');
        this.isUploadingPdf = false;
      }
    });
  }

  deletePdf() {
    if (!this.cardId) return;
    this.cardService.deletePdf(this.cardId).subscribe({
      next: () => {
        this.pdfFileName = '';
        alert('PDF rimosso');
      },
      error: () => alert('Errore nella rimozione del PDF')
    });
  }
}
