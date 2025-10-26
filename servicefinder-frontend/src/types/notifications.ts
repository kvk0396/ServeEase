export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string; // booking ID, service ID, etc.
  actionUrl?: string; // where to navigate when clicked
}

export type NotificationType = 
  // For Service Providers
  | 'NEW_BOOKING_REQUEST'
  | 'BOOKING_CONFIRMED' 
  | 'BOOKING_CANCELLED'
  | 'NEW_CUSTOMER_REVIEW'
  | 'SERVICE_CREATED'
  | 'SERVICE_UPDATED'
  // For Customers / Shared
  | 'BOOKING_CONFIRMATION'
  | 'BOOKING_STARTED'
  | 'BOOKING_COMPLETED'
  | 'PROVIDER_RESPONSE'
  | 'SERVICE_COMPLETION_REQUEST'
  | 'PROFILE_UPDATED';

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
}

export type NotificationConfig = {
  [key in NotificationType]: {
    icon: string;
    color: string;
    defaultTitle: string;
  };
}; 