import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationModel, NotificationService } from '../../../core/services/notification.service';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MaterialModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUser: any;
  notifications: NotificationModel[] = [];
  notificationCount = 0;
  searchQuery = '';

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadNotifications();
  }

  logout(): void {
    this.authService.logout();
  }

  loadNotifications(): void {
    this.notificationService.getUnreadNotifications().subscribe({
      next: (data: NotificationModel[]) => {
        this.notifications = data;
        this.notificationCount = data.length;
      }
    });
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        this.loadNotifications();
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.loadNotifications();
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      // Navigate to search results
      // this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
  }
}
