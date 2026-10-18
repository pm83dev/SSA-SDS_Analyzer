import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ExpiringCard {
  id: number;
  clientId: number;
  clientName: string;
  tipologia: string;
  titolo: string;
  dataScadenza?: Date;
  daysRemaining?: number;
  stato: string;
}

export interface AppNotification {
  id: number;
  clientId: number;
  clientName: string;
  cardId?: number;
  cardTitle?: string;
  type: string;
  message: string;
  isRead: boolean;
  sentDate?: Date;
  createdAt: Date;
}

export interface DashboardStats {
  totalClients: number;
  totalCards: number;
  expiringCards: number;
  expiredCards: number;
  validCards: number;
  totalProducts: number;
  unreadNotifications: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScenarioService {
  private api = inject(ApiService);

  getExpiring(days: number): Observable<ExpiringCard[]> {
    return this.api.get<ExpiringCard[]>(`/scenarios/expiring?days=${days}`);
  }

  getAllScenarios(): Observable<ExpiringCard[]> {
    return this.api.get<ExpiringCard[]>('/scenarios');
  }

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('/dashboard/stats');
  }

  getNotifications(unreadOnly = false): Observable<AppNotification[]> {
    return this.api.get<AppNotification[]>(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`);
  }

  markNotificationRead(id: number): Observable<AppNotification> {
    return this.api.put<AppNotification>(`/notifications/${id}/read`, {});
  }

  markAllNotificationsRead(): Observable<{ updated: number }> {
    return this.api.put<{ updated: number }>('/notifications/read-all', {});
  }
}
