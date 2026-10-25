import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ScenarioService, AppNotification } from '../../core/services/scenario.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
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
