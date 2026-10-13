import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SafetyCardService } from '../../../core/services/safety-card.service';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';
import { CreateSafetyCard } from '../../../core/models/safety-card.model';

@Component({
  selector: 'app-card-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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
              <label for="clientId">Cliente *</label>
              <select id="clientId" formControlName="clientId" class="form-control">
                <option value="">Seleziona cliente</option>
                <option *ngFor="let client of clients" [value]="client.id">
                  {{ client.ragioneSociale }}
                </option>
              </select>
              <div class="error-message" *ngIf="cardForm.get('clientId')?.errors?.['required'] && cardForm.get('clientId')?.touched">
                Campo obbligatorio
              </div>
            </div>
            <div class="form-group">
              <label for="tipologia">Tipologia *</label>
              <select id="tipologia" formControlName="tipologia" class="form-control">
                <option value="">Seleziona tipologia</option>
                <option value="DPI">DPI</option>
                <option value="Antincendio">Antincendio</option>
                <option value="Rischi">Valutazione Rischi</option>
                <option value="Altro">Altro</option>
              </select>
              <div class="error-message" *ngIf="cardForm.get('tipologia')?.errors?.['required'] && cardForm.get('tipologia')?.touched">
                Campo obbligatorio
              </div>
            </div>
            <div class="form-group full-width">
              <label for="titolo">Titolo *</label>
              <input type="text" id="titolo" formControlName="titolo" class="form-control" />
              <div class="error-message" *ngIf="cardForm.get('titolo')?.errors?.['required'] && cardForm.get('titolo')?.touched">
                Campo obbligatorio
              </div>
            </div>
            <div class="form-group">
              <label for="numeroProtocollo">Numero Protocollo</label>
              <input type="text" id="numeroProtocollo" formControlName="numeroProtocollo" class="form-control" />
            </div>
            <div class="form-group">
              <label for="enteEmittitore">Ente Emittitore</label>
              <input type="text" id="enteEmittitore" formControlName="enteEmittitore" class="form-control" />
            </div>
            <div class="form-group">
              <label for="dataRilascio">Data Rilascio</label>
              <input type="date" id="dataRilascio" formControlName="dataRilascio" class="form-control" />
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
              <textarea id="osservazioni" formControlName="osservazioni" class="form-control" rows="4"></textarea>
            </div>
          </div>
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
  cardId?: number;

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
    }
  }

  private initForm() {
    this.cardForm = this.fb.group({
      clientId: ['', [Validators.required]],
      tipologia: ['', [Validators.required]],
      titolo: ['', [Validators.required, Validators.minLength(3)]],
      numeroProtocollo: [''],
      enteEmittitore: [''],
      dataRilascio: [''],
      dataScadenza: [''],
      validitaMesi: [null],
      frequenzaControllo: [''],
      osservazioni: ['']
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
        this.cardForm.patchValue({
          clientId: card.clientId,
          tipologia: card.tipologia,
          titolo: card.titolo,
          numeroProtocollo: card.numeroProtocollo,
          enteEmittitore: card.enteEmittitore,
          dataRilascio: card.dataRilascio ? card.dataRilascio.toISOString().split('T')[0] : '',
          dataScadenza: card.dataScadenza ? card.dataScadenza.toISOString().split('T')[0] : '',
          validitaMesi: card.validitaMesi,
          frequenzaControllo: card.frequenzaControllo,
          osservazioni: card.osservazioni
        });
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
      clientId: formData.clientId,
      tipologia: formData.tipologia,
      titolo: formData.titolo,
      numeroProtocollo: formData.numeroProtocollo,
      enteEmittitore: formData.enteEmittitore,
      dataRilascio: formData.dataRilascio ? new Date(formData.dataRilascio) : undefined,
      dataScadenza: formData.dataScadenza ? new Date(formData.dataScadenza) : undefined,
      validitaMesi: formData.validitaMesi,
      frequenzaControllo: formData.frequenzaControllo,
      osservazioni: formData.osservazioni
    };

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
}
