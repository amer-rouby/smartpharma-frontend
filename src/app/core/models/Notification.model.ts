export interface NotificationModel {
  id: number;
  title: string;
  message: string;
  type: 'LOW_STOCK' | 'EXPIRY_WARNING' | 'EXPIRED' | 'SALE_COMPLETED' | 'EXPENSE_ADDED' | 'SYSTEM';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  read: boolean;
  createdAt: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  icon?: string;
  time?: string;
  link?: string;
}
export interface NotificationsResponse {
  content: NotificationModel[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
  pageSize: number;
  unreadCount?: number;
}
