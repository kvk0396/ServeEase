import { useNotifications } from '../contexts/NotificationContext';
import { NotificationType } from '../types/notifications';
import { useAuthStore, isProvider } from '../store/authStore';

export function useNotificationHelpers() {
  const { addNotification } = useNotifications();
  const { user } = useAuthStore();

  // Helper function to create notifications
  const createNotification = (
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string,
    relatedId?: string
  ) => {
    addNotification({
      type,
      title,
      message,
      actionUrl,
      relatedId
    });
  };

  // Booking-related notifications
  const notifyNewBookingRequest = (bookingId: string, serviceName: string, customerName: string) => {
    createNotification(
      'NEW_BOOKING_REQUEST',
      'New Booking Request',
      `${customerName} has requested to book "${serviceName}"`,
      `/provider/bookings`,
      bookingId
    );
  };

  const notifyBookingConfirmed = (bookingId: string, serviceName: string, providerName?: string) => {
    const isUserProvider = isProvider(user);
    
    if (isUserProvider) {
      createNotification(
        'BOOKING_CONFIRMED',
        'Booking Confirmed',
        `You confirmed the booking for "${serviceName}"`,
        `/provider/bookings`,
        bookingId
      );
    } else {
      createNotification(
        'BOOKING_CONFIRMATION',
        'Booking Confirmed',
        `${providerName || 'Service provider'} confirmed your booking for "${serviceName}"`,
        `/dashboard/bookings`,
        bookingId
      );
    }
  };

  const notifyBookingCancelled = (bookingId: string, serviceName: string, cancelledBy: string) => {
    const isUserProvider = isProvider(user);
    
    createNotification(
      'BOOKING_CANCELLED',
      'Booking Cancelled',
      `${cancelledBy} cancelled the booking for "${serviceName}"`,
      isUserProvider ? `/provider/bookings` : `/dashboard/bookings`,
      bookingId
    );
  };

  const notifyProviderResponse = (bookingId: string, serviceName: string, response: string) => {
    createNotification(
      'PROVIDER_RESPONSE',
      'Provider Response',
      `Service provider responded to your "${serviceName}" booking: ${response}`,
      `/dashboard/bookings`,
      bookingId
    );
  };

  const notifyServiceCompletionRequest = (bookingId: string, serviceName: string) => {
    createNotification(
      'SERVICE_COMPLETION_REQUEST',
      'Service Completion',
      `Please confirm completion of "${serviceName}" service`,
      `/dashboard/bookings`,
      bookingId
    );
  };

  // Rating-related notifications
  const notifyNewCustomerReview = (ratingId: string, serviceName: string, customerName: string, rating: number) => {
    createNotification(
      'NEW_CUSTOMER_REVIEW',
      'New Customer Review',
      `${customerName} left a ${rating}-star review for "${serviceName}"`,
      `/provider/ratings`,
      ratingId
    );
  };

  // Demo function to trigger sample notifications (for testing)
  const triggerDemoNotifications = () => {
    const isUserProvider = isProvider(user);
    
    if (isUserProvider) {
      // Provider notifications
      setTimeout(() => notifyNewBookingRequest('demo-1', 'House Cleaning', 'John Doe'), 500);
      setTimeout(() => notifyNewCustomerReview('demo-2', 'Plumbing Service', 'Jane Smith', 5), 1000);
      setTimeout(() => notifyBookingConfirmed('demo-3', 'Garden Maintenance', 'Mike Johnson'), 1500);
    } else {
      // Customer notifications
      setTimeout(() => notifyBookingConfirmed('demo-1', 'House Cleaning', 'CleanPro Services'), 500);
      setTimeout(() => notifyProviderResponse('demo-2', 'Plumbing Service', 'I can start tomorrow at 2 PM'), 1000);
      setTimeout(() => notifyServiceCompletionRequest('demo-3', 'Garden Maintenance'), 1500);
    }
  };

  return {
    notifyNewBookingRequest,
    notifyBookingConfirmed,
    notifyBookingCancelled,
    notifyProviderResponse,
    notifyServiceCompletionRequest,
    notifyNewCustomerReview,
    triggerDemoNotifications
  };
} 