import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService, User } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEdit = false;
  isSubmitting = false;
  userId?: number;

  roles = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Operator', label: 'Operatore' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.userId;
    this.initForm();
    if (this.isEdit) {
      this.loadUser();
    }
  }

  private initForm() {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.email]],
      role: ['Operator', Validators.required],
      isActive: [true]
    });
  }

  private loadUser() {
    if (!this.userId) return;
    this.userService.getById(this.userId).subscribe({
      next: (user: User) => {
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        });
        // In edit, username non è modificabile
        this.userForm.get('username')?.disable();
      },
      error: () => {
        alert('Errore nel caricamento dell\'utente');
        this.router.navigate(['/users']);
      }
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.userForm.value;

    if (this.isEdit && this.userId) {
      const updateData = {
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
        password: formData.password || undefined
      };
      this.userService.update(this.userId, updateData).subscribe({
        next: () => {
          alert('Utente aggiornato con successo');
          this.router.navigate(['/users']);
        },
        error: (err) => {
          alert(err.error?.message || 'Errore nell\'aggiornamento dell\'utente');
          this.isSubmitting = false;
        }
      });
    } else {
      this.userService.create(formData).subscribe({
        next: () => {
          alert('Utente creato con successo');
          this.router.navigate(['/users']);
        },
        error: (err) => {
          alert(err.error?.message || 'Errore nella creazione dell\'utente');
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/users']);
  }
}