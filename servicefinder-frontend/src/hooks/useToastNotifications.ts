import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationType } from '../types/notifications';
import { useAuthStore, isProvider } from '../store/authStore';

export function useToastNotifications() {
  const { addNotification } = useNotifications();
  const { user } = useAuthStore();

  // Enhanced toast that also creates in-app notification
  const notifySuccess = useCallback((
    message: string, 
    options?: {
      title?: string;
      type?: NotificationType;
      actionUrl?: string;
      relatedId?: string;
    }
  ) => {
    // Show toast
    toast.success(message);
    
    // Create in-app notification if type is provided
    if (options?.type) {
      addNotification({
        type: options.type,
        title: options.title || 'Success',
        message,
        actionUrl: options.actionUrl,
        relatedId: options.relatedId
      });
    }
  }, [addNotification]);

  const notifyError = useCallback((
    message: string,
    options?: {
      title?: string;
      actionUrl?: string;
    }
  ) => {
    // Show toast
    toast.error(message);
    
    // For errors, we don't create in-app notifications as they're usually temporary
  }, []);

  // Specific notification functions for common scenarios
  const notifyBookingCreated = useCallback((bookingId: string, serviceName: string) => {
    const isUserProvider = isProvider(user);
    
    if (isUserProvider) {
      notifySuccess(
        `New booking request received for "${serviceName}"`,
        {
          title: 'New Booking Request',
          type: 'NEW_BOOKING_REQUEST',
          actionUrl: '/provider/bookings',
          relatedId: bookingId
        }
      );
    } else {
      notifySuccess(
        `Your booking request for "${serviceName}" has been submitted`,
        {
          title: 'Booking Request Sent',
          type: 'BOOKING_CONFIRMATION',
          actionUrl: '/customer/bookings',
          relatedId: bookingId
        }
      );
    }
  }, [notifySuccess, user]);

  const notifyBookingStatusChange = useCallback((
    bookingId: string, 
    serviceName: string, 
    status: string,
    providerName?: string
  ) => {
    const isUserProvider = isProvider(user);
    
    if (status === 'CONFIRMED') {
      if (isUserProvider) {
        notifySuccess(
          `You confirmed the booking for "${serviceName}"`,
          {
            title: 'Booking Confirmed',
            type: 'BOOKING_CONFIRMED',
            actionUrl: '/provider/bookings',
            relatedId: bookingId
          }
        );
      } else {
        notifySuccess(
          `${providerName || 'Service provider'} confirmed your booking for "${serviceName}"`,
          {
            title: 'Booking Confirmed',
            type: 'BOOKING_CONFIRMATION',
            actionUrl: '/customer/bookings',
            relatedId: bookingId
          }
        );
      }
    } else if (status === 'CANCELLED') {
      const cancelledBy = isUserProvider ? 'You' : (providerName || 'Service provider');
      notifySuccess(
        `${cancelledBy} cancelled the booking for "${serviceName}"`,
        {
          title: 'Booking Cancelled',
          type: 'BOOKING_CANCELLED',
          actionUrl: isUserProvider ? '/provider/bookings' : '/customer/bookings',
          relatedId: bookingId
        }
      );
    }
  }, [notifySuccess, user]);

  const notifyRatingCreated = useCallback((
    ratingId: string, 
    serviceName: string, 
    rating: number,
    customerName?: string
  ) => {
    const isUserProvider = isProvider(user);
    
    if (isUserProvider) {
      notifySuccess(
        `${customerName || 'A customer'} left a ${rating}-star review for "${serviceName}"`,
        {
          title: 'New Customer Review',
          type: 'NEW_CUSTOMER_REVIEW',
          actionUrl: '/provider/ratings',
          relatedId: ratingId
        }
      );
    } else {
      notifySuccess(`Your review for "${serviceName}" has been submitted`);
    }
  }, [notifySuccess, user]);

  const notifyServiceCreated = useCallback((serviceName: string) => {
    notifySuccess(`"${serviceName}" service has been created successfully`, {
      title: 'Service Created',
      type: 'SERVICE_CREATED',
      actionUrl: '/provider/services'
    });
  }, [notifySuccess]);

  const notifyServiceUpdated = useCallback((serviceName: string) => {
    notifySuccess(`"${serviceName}" service has been updated successfully`, {
      title: 'Service Updated',
      type: 'SERVICE_UPDATED',
      actionUrl: '/provider/services'
    });
  }, [notifySuccess]);

  const notifyProfileUpdated = useCallback(() => {
    const isUserProvider = isProvider(user);
    notifySuccess('Your profile has been updated successfully', {
      title: 'Profile Updated',
      type: 'PROFILE_UPDATED',
      actionUrl: isUserProvider ? '/provider/profile' : '/profile'
    });
  }, [notifySuccess, user]);

  return {
    // Basic toast functions
    notifySuccess,
    notifyError,
    
    // Specific business logic notifications
    notifyBookingCreated,
    notifyBookingStatusChange,
    notifyRatingCreated,
    notifyServiceCreated,
    notifyServiceUpdated,
    notifyProfileUpdated,
  };
} 