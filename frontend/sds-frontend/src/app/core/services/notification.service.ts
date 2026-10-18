import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Notification {
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

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = inject(ApiService);

  getAll(unreadOnly = false): Observable<Notification[]> {
    return this.api.get<Notification[]>(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`);
  }

  getUnread(): Observable<Notification[]> {
    return this.getAll(true);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.api.get<{ count: number }>('/notifications/unread-count');
  }

  markAsRead(id: number): Observable<Notification> {
    return this.api.put<Notification>(`/notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<{ updated: number }> {
    return this.api.put<{ updated: number }>('/notifications/read-all', {});
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/notifications/${id}`);
  }
}
