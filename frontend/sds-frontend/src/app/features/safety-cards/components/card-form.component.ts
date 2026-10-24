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
  template: `
    <div class="card-form-page">
      <div class="page-header">
        <h1>{{ isEdit ? 'Modifica Scheda' : 'Nuova Scheda' }}</h1>
        <a routerLink="/safety-cards" class="btn btn-secondary">Torna alla lista</a>
      </div>
      <div class="form-container">
        <form [formGroup]="cardForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="form-group">
              <label>{{ isSds ? 'ID CLIENTE' : 'Clienti' }}</label>
              <small class="hint">la scheda può essere collegata a più clienti; senza clienti resta solo nell'archivio</small>
              <div class="client-checks">
                <label *ngFor="let client of clients" class="client-check">
                  <input type="checkbox" [checked]="selectedClientIds.has(client.id)"
                         (change)="toggleClient(client.id, $any($event.target).checked)" />
                  {{ client.id }} – {{ client.ragioneSociale }}
                </label>
                <span *ngIf="!clients.length" class="hint">Nessun cliente registrato</span>
              </div>
            </div>
            <div class="form-group">
              <label for="tipologia">Tipologia *</label>
              <select id="tipologia" formControlName="tipologia" class="form-control">
                <option value="">Seleziona tipologia</option>
                <option value="SDS">Scheda di Sicurezza (SDS)</option>
                <option value="DPI">DPI</option>
                <option value="Antincendio">Antincendio</option>
                <option value="Rischi">Valutazione Rischi</option>
                <option value="Altro">Altro</option>
              </select>
              <div class="error-message" *ngIf="cardForm.get('tipologia')?.errors?.['required'] && cardForm.get('tipologia')?.touched">
                Campo obbligatorio
              </div>
            </div>
          </div>

          <!-- Scheda SDS: colonne del file "dati per SDS.xlsx", stesso ordine, intestazioni e descrizioni -->
          <div class="verify-banner" *ngIf="campiDaVerificare.length">
            <strong>⚠ {{ campiDaVerificare.length }} {{ campiDaVerificare.length === 1 ? 'campo da verificare' : 'campi da verificare' }} sulla scheda PDF</strong>
            <p>L'import non ha ritrovato questi dati nel testo della SDS e non li ha inseriti: controllali sul PDF e completali. Un campo esce dall'elenco quando lo modifichi.</p>
            <ul>
              <li *ngFor="let k of campiDaVerificare"><strong>{{ fieldLabel(k) }}</strong>: {{ reasonsFor(k) }}</li>
            </ul>
          </div>

          <div class="sds-section" *ngIf="isSds; else genericFields">
            <h2>Dati da estrapolare</h2>
            <div class="form-grid">
              <div *ngFor="let f of sdsFormFields" class="form-group" [class.full-width]="isWide(f)" [class.field-verify]="campiDaVerificare.includes(f.key)">
                <ng-container [ngSwitch]="f.kind">
                  <label *ngSwitchCase="'bool'" class="checkbox-label">
                    <input type="checkbox" [id]="f.key" [formControlName]="f.key" />
                    {{ f.label }}
                  </label>
                  <label *ngSwitchDefault [for]="f.key">{{ f.label }}{{ f.key === 'titolo' ? ' *' : '' }}</label>
                </ng-container>
                <small *ngIf="f.hint" class="hint">{{ f.hint }}</small>
                <small *ngIf="campiDaVerificare.includes(f.key)" class="verify-hint">⚠ da verificare: {{ reasonsFor(f.key) }}</small>
                <ng-container [ngSwitch]="f.kind">
                  <textarea *ngSwitchCase="'cas'" [id]="f.key" [formControlName]="f.key" class="form-control" rows="3"
                            placeholder="nome|n. CAS|%, separati da virgola"></textarea>
                  <textarea *ngSwitchCase="'names'" [id]="f.key" [formControlName]="f.key" class="form-control" rows="3"></textarea>
                  <input *ngSwitchCase="'date'" type="date" [id]="f.key" [formControlName]="f.key" class="form-control" />
                  <ng-container *ngSwitchCase="'bool'"></ng-container>
                  <input *ngSwitchDefault type="text" [id]="f.key" [formControlName]="f.key" class="form-control"
                         [placeholder]="f.kind === 'hcodes' ? 'es. H225, H319' : f.kind === 'ghs' ? 'es. GHS02, GHS07' : f.kind === 'url' ? 'https://...' : ''" />
                </ng-container>
                <div class="error-message" *ngIf="f.key === 'titolo' && cardForm.get('titolo')?.invalid && cardForm.get('titolo')?.touched">
                  Campo obbligatorio
                </div>
              </div>
            </div>
          </div>

          <ng-template #genericFields>
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="titolo">Titolo *</label>
                <input type="text" id="titolo" formControlName="titolo" class="form-control" />
                <div class="error-message" *ngIf="cardForm.get('titolo')?.errors?.['required'] && cardForm.get('titolo')?.touched">
                  Campo obbligatorio
                </div>
              </div>
              <div class="form-group">
                <label for="enteEmittitore">Ente Emittitore</label>
                <input type="text" id="enteEmittitore" formControlName="enteEmittitore" class="form-control" />
              </div>
              <div class="form-group">
                <label for="dataRilascio">Data Rilascio</label>
                <input type="date" id="dataRilascio" formControlName="dataRilascio" class="form-control" />
              </div>
            </div>
          </ng-template>

          <div class="manage-section">
            <h2 *ngIf="isSds">Gestione scheda</h2>
            <div class="form-grid">
              <div class="form-group full-width" *ngIf="nomeFileImportato">
                <label>Nome file importato</label>
                <p class="readonly-value">{{ nomeFileImportato }}</p>
              </div>
              <div class="form-group" [class.field-verify]="campiDaVerificare.includes('numeroProtocollo')">
                <small *ngIf="campiDaVerificare.includes('numeroProtocollo')" class="verify-hint">⚠ da verificare: {{ reasonsFor('numeroProtocollo') }}</small>
                <label for="numeroProtocollo">{{ isSds ? 'Versione / Revisione SDS' : 'Numero Protocollo' }}</label>
                <input type="text" id="numeroProtocollo" formControlName="numeroProtocollo" class="form-control" />
              </div>
              <div class="form-group">
                <label for="dataScadenza">Data Scadenza</label>
                <input type="date" id="dataScadenza" formControlName="dataScadenza" class="form-control" />
              </div>
              <div class="form-group">
                <label for="validitaMesi">Validità (mesi)</label>
                <input type="number" id="validitaMesi" formControlName="validitaMesi" class="form-control" min="1" />
              </div>
              <div class="form-group">
                <label for="frequenzaControllo">Frequenza Controllo</label>
                <select id="frequenzaControllo" formControlName="frequenzaControllo" class="form-control">
                  <option value="">Seleziona frequenza</option>
                  <option value="mensile">Mensile</option>
                  <option value="trimestrale">Trimestrale</option>
                  <option value="semestrale">Semestrale</option>
                  <option value="annuale">Annuale</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label for="osservazioni">Osservazioni</label>
                <textarea id="osservazioni" formControlName="osservazioni" class="form-control" rows="3"></textarea>
              </div>
            </div>
          </div>

          <div class="pdf-section" *ngIf="isEdit && cardId">
            <h2>File PDF della Scheda</h2>
            <div class="pdf-current" *ngIf="pdfFileName">
              <p><strong>File attuale:</strong> {{ pdfFileName }}</p>
              <button type="button" class="btn btn-danger" (click)="deletePdf()">Rimuovi PDF</button>
            </div>
            <div class="pdf-upload">
              <input type="file" accept=".pdf" (change)="onPdfSelected($event)" />
              <button type="button" class="btn btn-primary" (click)="uploadPdf()" [disabled]="!selectedPdf || isUploadingPdf">
                {{ isUploadingPdf ? 'Caricamento...' : 'Carica PDF' }}
              </button>
            </div>
          </div>

          <label class="verified-check" *ngIf="campiDaVerificare.length">
            <input type="checkbox" [checked]="datiVerificati" (change)="datiVerificati = $any($event.target).checked" />
            Ho verificato tutti i dati con la scheda PDF (toglie tutti i "da verificare")
          </label>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="onCancel()">Annulla</button>
            <button type="submit" class="btn btn-primary" [disabled]="cardForm.invalid || isSubmitting">
              {{ isSubmitting ? 'Salvataggio...' : (isEdit ? 'Aggiorna' : 'Crea') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .card-form-page { padding: 20px; }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .page-header h1 { margin: 0; color: #2c3e50; }
    .form-container {
      background: white;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }
    .form-group.full-width { grid-column: 1 / -1; }
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #2c3e50;
    }
    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    .form-control:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }
    .error-message {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 4px;
    }
    .sds-section, .manage-section {
      margin-bottom: 24px;
      padding: 20px;
      border: 1px solid #e1e8ed;
      border-radius: 8px;
    }
    .manage-section { border-style: dashed; }
    .sds-section h2, .manage-section h2 {
      margin: 0 0 16px 0;
      color: #2c3e50;
      font-size: 16px;
    }
    .readonly-value { margin: 0; padding: 8px 12px; background: #f8f9fa; border: 1px solid #eee; border-radius: 4px; font-size: 14px; }
    .verify-banner { margin-bottom: 20px; padding: 12px 16px; border: 1px solid #f0c36d; border-radius: 6px; background: #fff8e6; color: #6b4a00; font-size: 13px; }
    .verify-banner p { margin: 4px 0 6px; }
    .verify-banner ul { margin: 0; padding-left: 18px; }
    .field-verify .form-control { border-color: #f0ad4e; background: #fffbf0; }
    .verify-hint { display: block; margin: -2px 0 6px; color: #8a5a00; font-size: 12px; font-weight: 600; }
    .verified-check { display: flex; align-items: center; gap: 8px; margin: 0 0 16px; font-weight: 600; color: #2c3e50; }
    .client-checks {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 180px;
      overflow-y: auto;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .form-group label.client-check { display: flex; align-items: center; gap: 8px; margin: 0; font-weight: 400; }
    .hint { display: block; margin: -4px 0 6px; color: #95a5a6; font-size: 11px; }
    .form-group label.checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pdf-section {
      margin-bottom: 24px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .pdf-section h2 {
      margin: 0 0 14px 0;
      color: #2c3e50;
      font-size: 16px;
    }
    .pdf-current {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      padding: 12px;
      background: #fff;
      border-radius: 6px;
    }
    .pdf-current p { margin: 0; color: #2c3e50; }
    .pdf-upload {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }
    .btn-danger {
      background: #e74c3c;
      color: white;
    }
    .btn-danger:hover { background: #c0392b; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 24px;
      border-top: 1px solid #eee;
    }
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      text-decoration: none;
      display: inline-block;
    }
    .btn-primary {
      background: #3498db;
      color: white;
    }
    .btn-primary:hover { background: #2980b9; }
    .btn-primary:disabled { background: #bdc3c7; cursor: not-allowed; }
    .btn-secondary {
      background: #95a5a6;
      color: white;
    }
    .btn-secondary:hover { background: #7f8c8d; }
    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
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
