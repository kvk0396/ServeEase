import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Custom hook to synchronize availability updates across the application
 * This ensures that when a booking is made or cancelled, all components
 * showing availability are updated in real-time
 */
export function useAvailabilitySync() {
  const queryClient = useQueryClient();

  const syncAvailability = useCallback((providerId?: number, availabilityId?: number) => {
    // Invalidate all availability-related queries
    queryClient.invalidateQueries({ queryKey: ['provider-availability'] });
    queryClient.invalidateQueries({ queryKey: ['availability-search'] });
    
    // If we have specific provider ID, invalidate their queries
    if (providerId) {
      queryClient.invalidateQueries({ queryKey: ['provider-availability', providerId] });
    }

    // Invalidate booking queries to show updated booking status
    queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
    queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
  }, [queryClient]);

  const syncBookingCreated = useCallback((providerId: number, availabilityId: number) => {
    // Mark specific availability slot as booked in cache if possible
    queryClient.setQueryData(
      ['provider-availability', providerId],
      (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        
        return oldData.map((slot: any) => 
          slot.id === availabilityId 
            ? { ...slot, isBooked: true }
            : slot
        );
      }
    );

    // Sync all related queries
    syncAvailability(providerId, availabilityId);
  }, [queryClient, syncAvailability]);

  const syncBookingCancelled = useCallback((providerId: number, availabilityId: number) => {
    // Mark specific availability slot as available in cache if possible
    queryClient.setQueryData(
      ['provider-availability', providerId],
      (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        
        return oldData.map((slot: any) => 
          slot.id === availabilityId 
            ? { ...slot, isBooked: false }
            : slot
        );
      }
    );

    // Sync all related queries
    syncAvailability(providerId, availabilityId);
  }, [queryClient, syncAvailability]);

  return {
    syncAvailability,
    syncBookingCreated,
    syncBookingCancelled,
  };
} 