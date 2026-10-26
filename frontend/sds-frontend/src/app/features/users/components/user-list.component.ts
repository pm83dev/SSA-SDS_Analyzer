import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService, User } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  isLoading = true;
  isAdmin = false;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const role = localStorage.getItem('userRole');
    this.isAdmin = role === 'Admin';
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Errore nel caricamento degli utenti');
      }
    });
  }

  deleteUser(id: number, username: string) {
    if (!confirm(`Sei sicuro di voler disabilitare l'utente ${username}?`)) return;
    this.userService.delete(id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== id);
        alert('Utente disabilitato con successo');
      },
      error: (err) => {
        alert(err.error?.message || 'Errore nella disabilitazione dell\'utente');
      }
    });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('it-IT');
  }

  getRoleBadgeClass(role: string): string {
    return role === 'Admin' ? 'badge bg-danger' : 'badge bg-secondary';
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'badge bg-success' : 'badge bg-warning text-dark';
  }

  getCurrentUserId(): number {
    return Number(localStorage.getItem('userId')) || 0;
  }
}