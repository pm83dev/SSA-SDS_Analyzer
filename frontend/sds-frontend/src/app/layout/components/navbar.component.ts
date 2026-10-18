import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ScenarioService, AppNotification } from '../../core/services/scenario.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" routerLink="/dashboard" routerLinkActive="active">SSA-SDS</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/clients" routerLinkActive="active">Clienti</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/safety-cards" routerLinkActive="active">Schede</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/import" routerLinkActive="active">Import</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/scenarios" routerLinkActive="active">Scadenze</a>
            </li>
          </ul>
          <ul class="navbar-nav">
            <li class="nav-item dropdown me-2" *ngIf="unreadCount > 0">
              <a class="nav-link position-relative" href="#" data-bs-toggle="dropdown">
                Notifiche
                <span class="badge-notif">{{ unreadCount }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li *ngFor="let n of notifications">
                  <a class="dropdown-item" href="#" (click)="markRead(n.id)">
                    <span [ngClass]="n.type === 'Expired' ? 'notif-expired' : 'notif-warning'">{{ n.message }}</span>
                  </a>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li><a class="dropdown-item text-center" href="#" (click)="markAllRead()">Segna tutte come lette</a></li>
              </ul>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link" href="#" data-bs-toggle="dropdown">
                {{ username }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="#" (click)="logout()">Esci</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .badge-notif {
      position: absolute;
      top: -2px;
      right: -8px;
      background: #e74c3c;
      color: white;
      border-radius: 10px;
      font-size: 11px;
      padding: 2px 6px;
      font-weight: 700;
    }
    .notif-expired { color: #e74c3c; }
    .notif-warning { color: #f39c12; }
  `]
})
export class NavbarComponent implements OnInit {
  username = 'Utente';
  unreadCount = 0;
  notifications: AppNotification[] = [];

  constructor(
    private auth: AuthService,
    private scenarioService: ScenarioService,
    private router: Router
  ) {}

  ngOnInit() {
    this.username = localStorage.getItem('username') || 'Utente';
    this.loadNotifications();
  }

  private loadNotifications() {
    this.scenarioService.getNotifications(true).subscribe({
      next: (notifs) => {
        this.unreadCount = notifs.length;
        this.notifications = notifs.slice(0, 5);
      },
      error: () => {}
    });
  }

  markRead(id: number) {
    this.scenarioService.markNotificationRead(id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      },
      error: () => {}
    });
  }

  markAllRead() {
    this.scenarioService.markAllNotificationsRead().subscribe({
      next: () => {
        this.unreadCount = 0;
        this.notifications = [];
      },
      error: () => {}
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
