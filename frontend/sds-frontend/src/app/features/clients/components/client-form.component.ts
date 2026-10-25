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
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.css'
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
