import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { Client, CreateClient, UpdateClient } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="client-form-page">
      <div class="page-header">
        <h1>{{ isEdit ? 'Modifica Cliente' : 'Nuovo Cliente' }}</h1>
        <a routerLink="/clients" class="btn btn-secondary">Torna alla lista</a>
      </div>
      <div class="form-container">
        <form [formGroup]="clientForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="form-group">
              <label for="ragioneSociale">Ragione Sociale *</label>
              <input type="text" id="ragioneSociale" formControlName="ragioneSociale" class="form-control" />
              <div class="error-message" *ngIf="clientForm.get('ragioneSociale')?.errors?.['required'] && clientForm.get('ragioneSociale')?.touched">
                Campo obbligatorio
              </div>
            </div>
            <div class="form-group">
              <label for="codiceFiscale">Codice Fiscale</label>
              <input type="text" id="codiceFiscale" formControlName="codiceFiscale" class="form-control" />
            </div>
            <div class="form-group">
              <label for="indirizzo">Indirizzo</label>
              <input type="text" id="indirizzo" formControlName="indirizzo" class="form-control" />
            </div>
            <div class="form-group">
              <label for="citta">Città</label>
              <input type="text" id="citta" formControlName="citta" class="form-control" />
            </div>
            <div class="form-group">
              <label for="provincia">Provincia</label>
              <input type="text" id="provincia" formControlName="provincia" class="form-control" />
            </div>
            <div class="form-group">
              <label for="cap">CAP</label>
              <input type="text" id="cap" formControlName="cap" class="form-control" />
            </div>
            <div class="form-group">
              <label for="telefono">Telefono</label>
              <input type="text" id="telefono" formControlName="telefono" class="form-control" />
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" formControlName="email" class="form-control" />
              <div class="error-message" *ngIf="clientForm.get('email')?.errors?.['email'] && clientForm.get('email')?.touched">
                Email non valida
              </div>
            </div>
            <div class="form-group">
              <label for="contatto">Contatto</label>
              <input type="text" id="contatto" formControlName="contatto" class="form-control" />
            </div>
            <div class="form-group full-width">
              <label for="note">Note</label>
              <textarea id="note" formControlName="note" class="form-control" rows="4"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="onCancel()">Annulla</button>
            <button type="submit" class="btn btn-primary" [disabled]="clientForm.invalid || isSubmitting">
              {{ isSubmitting ? 'Salvataggio...' : (isEdit ? 'Aggiorna' : 'Crea') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .client-form-page { padding: 20px; }
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
export class ClientFormComponent implements OnInit {
  clientForm!: FormGroup;
  isEdit = false;
  isSubmitting = false;
  clientId?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService
  ) {}

  ngOnInit() {
    this.clientId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.clientId;
    this.initForm();
    if (this.isEdit) {
      this.loadClient();
    }
  }

  private initForm() {
    this.clientForm = this.fb.group({
      ragioneSociale: ['', [Validators.required, Validators.minLength(3)]],
      codiceFiscale: [''],
      indirizzo: [''],
      citta: [''],
      provincia: [''],
      cap: [''],
      telefono: [''],
      email: ['', [Validators.email]],
      contatto: [''],
      note: ['']
    });
  }

  private loadClient() {
    if (!this.clientId) return;
    this.clientService.getById(this.clientId).subscribe({
      next: (client: Client) => {
        this.clientForm.patchValue({
          ragioneSociale: client.ragioneSociale,
          codiceFiscale: client.codiceFiscale,
          indirizzo: client.indirizzo,
          citta: client.citta,
          provincia: client.provincia,
          cap: client.cap,
          telefono: client.telefono,
          email: client.email,
          contatto: client.contatto,
          note: client.note
        });
      },
      error: () => {
        alert('Errore nel caricamento del cliente');
        this.router.navigate(['/clients']);
      }
    });
  }

  onSubmit() {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.clientForm.value;

    if (this.isEdit && this.clientId) {
      const updateData: UpdateClient = { ...formData };
      this.clientService.update(this.clientId, updateData).subscribe({
        next: () => {
          alert('Cliente aggiornato con successo');
          this.router.navigate(['/clients']);
        },
        error: () => {
          alert('Errore nell\'aggiornamento del cliente');
          this.isSubmitting = false;
        }
      });
    } else {
      const createData: CreateClient = { ...formData };
      this.clientService.create(createData).subscribe({
        next: () => {
          alert('Cliente creato con successo');
          this.router.navigate(['/clients']);
        },
        error: () => {
          alert('Errore nella creazione del cliente');
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/clients']);
  }
}
