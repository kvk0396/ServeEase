import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { Notification, NotificationType, NotificationContextType, NotificationConfig } from '../types/notifications';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Star, 
  Bell,
  MessageSquare,
  ClipboardCheck
} from 'lucide-react';
import { useAuthStore, isProvider } from '../store/authStore';
import { apiClient } from '../lib/api';

// Configuration for different notification types
export const notificationConfig: NotificationConfig = {
  NEW_BOOKING_REQUEST: {
    icon: 'Calendar',
    color: 'text-blue-600',
    defaultTitle: 'New Booking Request'
  },
  BOOKING_CONFIRMED: {
    icon: 'CheckCircle',
    color: 'text-green-600',
    defaultTitle: 'Booking Confirmed'
  },
  BOOKING_CANCELLED: {
    icon: 'XCircle',
    color: 'text-red-600',
    defaultTitle: 'Booking Cancelled'
  },
  NEW_CUSTOMER_REVIEW: {
    icon: 'Star',
    color: 'text-yellow-600',
    defaultTitle: 'New Customer Review'
  },
  BOOKING_CONFIRMATION: {
    icon: 'CheckCircle',
    color: 'text-green-600',
    defaultTitle: 'Booking Confirmed'
  },
  BOOKING_STARTED: {
    icon: 'CheckCircle',
    color: 'text-blue-600',
    defaultTitle: 'Service Started'
  },
  BOOKING_COMPLETED: {
    icon: 'ClipboardCheck',
    color: 'text-emerald-600',
    defaultTitle: 'Service Completed'
  },
  PROVIDER_RESPONSE: {
    icon: 'MessageSquare',
    color: 'text-blue-600',
    defaultTitle: 'Provider Response'
  },
  SERVICE_COMPLETION_REQUEST: {
    icon: 'ClipboardCheck',
    color: 'text-purple-600',
    defaultTitle: 'Service Completion'
  },
  SERVICE_CREATED: {
    icon: 'ClipboardCheck',
    color: 'text-blue-600',
    defaultTitle: 'Service Created'
  },
  SERVICE_UPDATED: {
    icon: 'ClipboardCheck',
    color: 'text-indigo-600',
    defaultTitle: 'Service Updated'
  },
  PROFILE_UPDATED: {
    icon: 'CheckCircle',
    color: 'text-green-600',
    defaultTitle: 'Profile Updated'
  }
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, isAuthenticated } = useAuthStore();

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove notification after 10 seconds for non-critical types
    const autoRemoveTypes: NotificationType[] = ['BOOKING_CONFIRMATION', 'PROVIDER_RESPONSE'];
    if (autoRemoveTypes.includes(notification.type)) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 10000);
    }
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Provider-side polling for new bookings (no websockets, cross-browser)
  const notifiedBookingIdsRef = useRef<Set<number>>(new Set());
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track last known statuses for provider to detect customer-driven changes (e.g., cancellation)
  const providerLastStatusesRef = useRef<Map<number, string>>(new Map());
  const providerStatusPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track ratings to notify providers about new customer reviews
  const notifiedRatingIdsRef = useRef<Set<number>>(new Set());
  const providerRatingsPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Only poll for service providers
    if (!isAuthenticated || !user || !isProvider(user)) {
      // Cleanup when user logs out or role changes
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (providerStatusPollingRef.current) {
        clearInterval(providerStatusPollingRef.current);
        providerStatusPollingRef.current = null;
      }
      if (providerRatingsPollingRef.current) {
        clearInterval(providerRatingsPollingRef.current);
        providerRatingsPollingRef.current = null;
      }
      return;
    }

    const storageKey = `notified-bookings-${user.userId}`;
    const statusStorageKey = `provider-last-statuses-${user.userId}`;
    const ratingsStorageKey = `provider-notified-ratings-${user.userId}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: number[] = JSON.parse(saved);
        notifiedBookingIdsRef.current = new Set(parsed);
      }
      const savedStatuses = localStorage.getItem(statusStorageKey);
      if (savedStatuses) {
        const parsed: Array<[number, string]> = JSON.parse(savedStatuses);
        providerLastStatusesRef.current = new Map(parsed);
      }
      const savedRatings = localStorage.getItem(ratingsStorageKey);
      if (savedRatings) {
        const parsed: number[] = JSON.parse(savedRatings);
        notifiedRatingIdsRef.current = new Set(parsed);
      }
    } catch (e) {
      // ignore storage errors
    }

    let initialized = false;
    let isDisposed = false;

    const syncToStorage = () => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(notifiedBookingIdsRef.current)));
        localStorage.setItem(statusStorageKey, JSON.stringify(Array.from(providerLastStatusesRef.current.entries())));
        localStorage.setItem(ratingsStorageKey, JSON.stringify(Array.from(notifiedRatingIdsRef.current)));
      } catch (e) {
        // ignore
      }
    };

    const poll = async () => {
      if (isDisposed) return;
      try {
        const page = await apiClient.getProviderBookings({ page: 0, size: 10, status: 'PENDING' });
        const bookings = page?.content || [];

        if (!initialized) {
          // On first load, seed known IDs to avoid spamming older bookings
          bookings.forEach(b => notifiedBookingIdsRef.current.add(b.id));
          syncToStorage();
          initialized = true;
          return;
        }

        for (const b of bookings) {
          if (!notifiedBookingIdsRef.current.has(b.id)) {
            // New booking detected for provider → create in-app notification
            const when = b.scheduledDateTime ? new Date(b.scheduledDateTime).toLocaleString() : '';
            addNotification({
              type: 'NEW_BOOKING_REQUEST',
              title: 'New Booking Request',
              message: `${b.customer?.name || 'Customer'} requested "${b.service?.name || 'a service'}" for ${when}`.trim(),
              actionUrl: `/provider/bookings`,
              relatedId: String(b.id)
            });
            notifiedBookingIdsRef.current.add(b.id);
          }
        }

        syncToStorage();
      } catch (e) {
        // Silently ignore polling errors
      }
    };

    // Kick off immediately, then poll periodically
    poll();
    pollingIntervalRef.current = setInterval(poll, 10000); // 10s

    // Provider: poll for booking status changes (e.g., customer cancellations)
    const pollStatuses = async () => {
      if (isDisposed) return;
      try {
        const page = await apiClient.getProviderBookings({ page: 0, size: 10 });
        const list = page?.content || [];
        if (providerLastStatusesRef.current.size === 0) {
          // Seed on first run
          providerLastStatusesRef.current = new Map(list.map(b => [b.id, b.status]));
          syncToStorage();
          return;
        }
        for (const b of list) {
          const prev = providerLastStatusesRef.current.get(b.id);
          if (!prev) {
            providerLastStatusesRef.current.set(b.id, b.status);
            continue;
          }
          if (prev !== b.status) {
            // Notify for customer-driven cancel
            if (b.status === 'CANCELLED' && (b.cancelledBy === 'customer' || !b.cancelledBy)) {
              const customerName = b.customer?.name || 'Customer';
              const serviceName = b.service?.name || 'a service';
              addNotification({
                type: 'BOOKING_CANCELLED',
                title: 'Booking Cancelled',
                message: `${customerName} cancelled their booking for "${serviceName}"`,
                actionUrl: `/provider/bookings`,
                relatedId: String(b.id)
              });
            }
            providerLastStatusesRef.current.set(b.id, b.status);
          }
        }
        syncToStorage();
      } catch {}
    };
    pollStatuses();
    providerStatusPollingRef.current = setInterval(pollStatuses, 10000);

    // Provider: poll for new customer reviews
    const pollRatings = async () => {
      if (isDisposed) return;
      try {
        const page = await apiClient.getMyProviderRatings({ page: 0, size: 10 });
        const ratings = page?.content || [];
        if (notifiedRatingIdsRef.current.size === 0) {
          ratings.forEach(r => notifiedRatingIdsRef.current.add(r.id));
          syncToStorage();
          return;
        }
        for (const r of ratings) {
          if (!notifiedRatingIdsRef.current.has(r.id)) {
            const serviceName = r.booking?.serviceName || r.serviceProvider?.businessName || r.serviceProvider?.contactName || 'your service';
            const customerName = r.customer?.fullName || r.customer?.name || 'Customer';
            addNotification({
              type: 'NEW_CUSTOMER_REVIEW',
              title: 'New Customer Review',
              message: `${customerName} rated ${r.rating}★ for "${serviceName}"`,
              actionUrl: `/provider/ratings`,
              relatedId: String(r.id)
            });
            notifiedRatingIdsRef.current.add(r.id);
          }
        }
        syncToStorage();
      } catch {}
    };
    pollRatings();
    providerRatingsPollingRef.current = setInterval(pollRatings, 15000); // 15s

    return () => {
      isDisposed = true;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (providerStatusPollingRef.current) {
        clearInterval(providerStatusPollingRef.current);
        providerStatusPollingRef.current = null;
      }
      if (providerRatingsPollingRef.current) {
        clearInterval(providerRatingsPollingRef.current);
        providerRatingsPollingRef.current = null;
      }
    };
  }, [user, isAuthenticated, addNotification]);

  // Customer-side polling for booking status updates
  const customerLastStatusesRef = useRef<Map<number, string>>(new Map());
  const customerPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const customerLastNotesRef = useRef<Map<number, string | undefined>>(new Map());

  useEffect(() => {
    // Only poll for customers
    if (!isAuthenticated || !user || isProvider(user)) {
      if (customerPollingRef.current) {
        clearInterval(customerPollingRef.current);
        customerPollingRef.current = null;
      }
      return;
    }

    let initialized = false;
    let disposed = false;

    const pollCustomer = async () => {
      if (disposed) return;
      try {
        const page = await apiClient.getMyBookings({ page: 0, size: 10 });
        const bookings = page?.content || [];

        if (!initialized) {
          // Seed last known statuses and notes to avoid spamming existing
          customerLastStatusesRef.current = new Map(bookings.map(b => [b.id, b.status]));
          customerLastNotesRef.current = new Map(bookings.map(b => [b.id, b.notes]));
          initialized = true;
          return;
        }

        for (const b of bookings) {
          const prev = customerLastStatusesRef.current.get(b.id);
          if (!prev) {
            // New booking appeared in list; seed baseline
            customerLastStatusesRef.current.set(b.id, b.status);
            customerLastNotesRef.current.set(b.id, b.notes);
            continue;
          }

          if (prev !== b.status) {
            // Status changed → notify customer
            const serviceName = b.service?.name || 'your service';
            const providerName = b.serviceProvider?.businessName || 'Provider';
            const bookingUrl = `/customer/bookings`;

            switch (b.status) {
              case 'CONFIRMED':
                addNotification({
                  type: 'BOOKING_CONFIRMATION',
                  title: 'Booking Confirmed',
                  message: `${providerName} confirmed your booking for "${serviceName}"`,
                  actionUrl: bookingUrl,
                  relatedId: String(b.id)
                });
                break;
              case 'IN_PROGRESS':
                addNotification({
                  type: 'BOOKING_STARTED',
                  title: 'Service Started',
                  message: `${providerName} has started "${serviceName}"`,
                  actionUrl: bookingUrl,
                  relatedId: String(b.id)
                });
                break;
              case 'COMPLETED':
                addNotification({
                  type: 'BOOKING_COMPLETED',
                  title: 'Service Completed',
                  message: `${providerName} marked "${serviceName}" as completed`,
                  actionUrl: bookingUrl,
                  relatedId: String(b.id)
                });
                break;
              case 'CANCELLED':
                addNotification({
                  type: 'BOOKING_CANCELLED',
                  title: 'Booking Cancelled',
                  message: `${providerName} cancelled your booking for "${serviceName}"`,
                  actionUrl: bookingUrl,
                  relatedId: String(b.id)
                });
                break;
              default:
                break;
            }

            customerLastStatusesRef.current.set(b.id, b.status);
          }

          // Detect provider response/notes updates
          const prevNotes = customerLastNotesRef.current.get(b.id);
          const currNotes = b.notes;
          if (currNotes !== prevNotes) {
            const providerName = b.serviceProvider?.businessName || 'Provider';
            const messagePreview = (currNotes || '').trim().slice(0, 140);
            addNotification({
              type: 'PROVIDER_RESPONSE',
              title: 'Booking Update from Provider',
              message: messagePreview ? `${providerName}: ${messagePreview}` : `${providerName} updated booking details`,
              actionUrl: '/customer/bookings',
              relatedId: String(b.id)
            });
            customerLastNotesRef.current.set(b.id, currNotes);
          }
        }
      } catch (e) {
        // ignore
      }
    };

    // Kick off and then poll every 10s
    pollCustomer();
    customerPollingRef.current = setInterval(pollCustomer, 10000);

    return () => {
      disposed = true;
      if (customerPollingRef.current) {
        clearInterval(customerPollingRef.current);
        customerPollingRef.current = null;
      }
    };
  }, [user, isAuthenticated, addNotification]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 