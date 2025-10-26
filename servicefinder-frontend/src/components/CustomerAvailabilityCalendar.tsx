import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, ChevronLeft, ChevronRight, Loader2, CheckCircle, X } from 'lucide-react';
import { apiClient } from '../lib/api';
import { Service, AvailabilitySlot } from '../types';
import { cn } from '../lib/utils';

interface CustomerAvailabilityCalendarProps {
  service: Service;
  onSlotSelect: (slot: AvailabilitySlot | null) => void;
  selectedSlot?: AvailabilitySlot | null;
  compact?: boolean;
}

export function CustomerAvailabilityCalendar({
  service,
  onSlotSelect,
  selectedSlot,
  compact = false
}: CustomerAvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  // Always use week view

  // Local date helpers to avoid UTC day shifting
  const toLocalDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const toLocalDateTimeString = (d: Date) => {
    const date = toLocalDateKey(d);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${date}T${hh}:${mm}:${ss}`;
  };

  // Transform flattened service provider fields into nested structure
  const getServiceProvider = (service: Service) => {
    if ((service as any).serviceProviderId) {
      return {
        id: (service as any).serviceProviderId,
        businessName: (service as any).providerBusinessName || 'Unknown Provider',
        contactName: (service as any).providerName || 'Unknown Contact',
        email: (service as any).providerEmail || '',
        phoneNumber: (service as any).providerPhone || '',
        averageRating: (service as any).providerAverageRating || 0,
        totalRatings: (service as any).providerTotalRatings || 0,
        yearsOfExperience: 0, // Not available in flattened structure
        verificationStatus: (service as any).providerVerificationStatus || 'PENDING'
      };
    }
    return service.serviceProvider;
  };

  const serviceProvider = getServiceProvider(service);

  if (import.meta.env.DEV) console.log('=== CustomerAvailabilityCalendar Debug ===');
  if (import.meta.env.DEV) console.log('Service Details:', {
    serviceId: service.id,
    serviceName: service.name,
    serviceCategory: service.category,
    serviceProvider: service.serviceProvider,
    providerId: serviceProvider?.id,
    providerBusinessName: serviceProvider?.businessName
  });

  // Debug service provider transformation
  if (import.meta.env.DEV) console.log('Service Provider Transformation:', {
    originalServiceProvider: service.serviceProvider,
    flattenedFields: {
      serviceProviderId: (service as any).serviceProviderId,
      providerBusinessName: (service as any).providerBusinessName,
      providerName: (service as any).providerName,
      providerEmail: (service as any).providerEmail,
      providerPhone: (service as any).providerPhone,
      providerAverageRating: (service as any).providerAverageRating,
      providerTotalRatings: (service as any).providerTotalRatings,
      providerVerificationStatus: (service as any).providerVerificationStatus
    },
    transformedProvider: serviceProvider
  });

  useEffect(() => {
    if (!serviceProvider) {
      if (import.meta.env.DEV) console.error('❌ No service provider found for service:', service.id);
      return;
    }

    // Manual API test
    if (import.meta.env.DEV) console.log('🔧 Manual API Test Call:');
    const { startDate, endDate } = getDateRange();
    if (import.meta.env.DEV) console.log('📞 API Call Details:', {
      providerId: serviceProvider.id,
      startDate,
      endDate,
      apiMethod: 'getProviderAvailability'
    });

    apiClient.getProviderAvailability(serviceProvider.id, { startDate, endDate })
      .then(response => {
        if (import.meta.env.DEV) console.log('📡 Manual API Response (Raw):', response);
        if (import.meta.env.DEV) console.log('📡 Manual API Response (Parsed):', {
          totalSlots: response?.length || 0,
          slots: response?.map((slot: AvailabilitySlot) => ({
            id: slot.id,
            startDateTime: slot.startDateTime,
            endDateTime: slot.endDateTime,
            duration: slot.durationMinutes,
            isBooked: slot.isBooked
          })) || []
        });
      })
      .catch(error => {
        if (import.meta.env.DEV) console.error('❌ Manual API Error:', error);
      });
  }, [service, serviceProvider]);

  // Get date range for week view
  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    
    // Get start of week (Monday)
    const dayOfWeek = start.getDay();
    const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    start.setDate(diff);
    end.setDate(start.getDate() + 6);
    
    // Set start time to beginning of day and end time to end of day
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return {
      startDate: toLocalDateTimeString(start),
      endDate: toLocalDateTimeString(end)
    };
  };

  const { startDate, endDate } = getDateRange();

  if (import.meta.env.DEV) console.log('🗓️ Date Range:', {
    startDate: startDate,
    endDate: endDate,
    compact,
    currentDate: toLocalDateTimeString(currentDate),
    viewMode: 'week'
  });

  // Check if service has provider
  if (!serviceProvider) {
    if (import.meta.env.DEV) console.error('❌ SERVICE HAS NO PROVIDER! This is the main issue.');
    if (import.meta.env.DEV) console.log('Service object:', service);
    if (import.meta.env.DEV) console.log('Raw service fields:', {
      serviceProviderId: (service as any).serviceProviderId,
      providerBusinessName: (service as any).providerBusinessName,
      providerName: (service as any).providerName,
      providerEmail: (service as any).providerEmail,
      providerPhone: (service as any).providerPhone,
      providerAverageRating: (service as any).providerAverageRating,
      providerTotalRatings: (service as any).providerTotalRatings,
      providerVerificationStatus: (service as any).providerVerificationStatus
    });
  }

  // Fetch availability slots for the service provider
  const {
    data: availabilitySlots = [] as AvailabilitySlot[],
    isLoading: availabilityLoading,
    error: availabilityError,
    refetch: refetchAvailability
  } = useQuery({
    queryKey: ['provider-availability', serviceProvider?.id, startDate, endDate],
    queryFn: () => {
      if (!serviceProvider?.id) {
        if (import.meta.env.DEV) console.error('❌ No provider ID available for availability query');
        return Promise.resolve([]);
      }
      
      if (import.meta.env.DEV) console.log('🔄 Fetching availability for provider:', {
        providerId: serviceProvider.id,
        startDate,
        endDate
      });
      
      return apiClient.getProviderAvailability(serviceProvider.id, { startDate, endDate });
    },
    enabled: !!serviceProvider?.id,
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    // Week navigation
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  // Utility functions
  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Process availability data
  const totalAvailableSlots = availabilitySlots?.length || 0;

  if (import.meta.env.DEV) console.log('📈 Availability data updated:', {
    totalSlots: totalAvailableSlots,
    availableSlots: availabilitySlots?.filter((slot: AvailabilitySlot) => !slot.isBooked).length || 0,
    bookedSlots: availabilitySlots?.filter((slot: AvailabilitySlot) => slot.isBooked).length || 0,
    error: availabilityError,
    rawSlots: availabilitySlots
  });

  if (availabilityError) {
    if (import.meta.env.DEV) console.error('❌ Availability fetch error:', availabilityError);
  }

  if (!availabilitySlots || availabilitySlots.length === 0) {
    if (import.meta.env.DEV) console.log('⚠️ No slots found in response');
  } else {
    if (import.meta.env.DEV) console.log('✅ Slots found:', availabilitySlots.map((slot: AvailabilitySlot) => ({
      id: slot.id,
      startDateTime: slot.startDateTime,
      endDateTime: slot.endDateTime,
      isBooked: slot.isBooked,
      durationMinutes: slot.durationMinutes
    })));
  }

  // Filter available slots
  const availableSlots = availabilitySlots?.filter((slot: AvailabilitySlot) => !slot.isBooked) || [];

  if (import.meta.env.DEV) console.log('🔍 Slot filtering results:', {
    originalSlots: availabilitySlots?.length || 0,
    availableSlots: availableSlots.length,
    filteredOutSlots: (availabilitySlots?.length || 0) - availableSlots.length
  });

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Group slots by local date (avoid UTC toISOString)
  const slotsByDate = availableSlots.reduce((acc: Record<string, AvailabilitySlot[]>, slot: AvailabilitySlot) => {
    const d = new Date(slot.startDateTime);
    const dateStr = toLocalDateKey(d);
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(slot);
    return acc;
  }, {});

  console.log('📅 Slots grouped by date:', slotsByDate);
  console.log('📅 Date grouping details:', {
    totalDatesWithSlots: Object.keys(slotsByDate).length,
    datesAndCounts: Object.entries(slotsByDate).map(([date, slots]) => ({
      date,
      slotsCount: (slots as AvailabilitySlot[]).length,
      slots: (slots as AvailabilitySlot[]).map((slot: AvailabilitySlot) => ({
        id: slot.id,
        time: `${formatTime(slot.startDateTime)} - ${formatTime(slot.endDateTime)}`,
        duration: slot.durationMinutes
      }))
    }))
  });

  // Sort slots by time within each date
  Object.keys(slotsByDate).forEach(dateStr => {
    slotsByDate[dateStr].sort((a: AvailabilitySlot, b: AvailabilitySlot) => 
      new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
    );
  });

  console.log('📆 Calendar days generated:', {
    totalDays: calendarDays.length,
    viewMode: 'week',
    currentDate: toLocalDateTimeString(currentDate),
    days: calendarDays.map(day => ({
      date: toLocalDateKey(day),
      dayOfWeek: day.toLocaleDateString('en-US', { weekday: 'long' }),
      slotsCount: slotsByDate[toLocalDateKey(day)]?.length || 0
    }))
  }, [calendarDays, currentDate]);

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 max-w-full overflow-hidden">
        {/* Compact Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 text-base">Available Times</h4>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {totalAvailableSlots} slots
            </span>
          </div>
          
          {/* Compact Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0 border"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-base font-medium text-center flex-1 mx-3">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric',
                day: 'numeric'
              })}
            </span>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0 border"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex justify-center">
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
              Week View
            </span>
          </div>
        </div>

        {/* Compact Calendar Content */}
        <div className="p-4 overflow-hidden">
          {availabilityLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <span className="ml-3 text-sm text-gray-600">Loading...</span>
            </div>
          ) : totalAvailableSlots === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600 font-medium">No available times</p>
              <p className="text-xs text-gray-500 mt-1">Try a different week</p>
            </div>
          ) : (
            <div className="w-full overflow-hidden">
              {/* Compact Day Headers */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].slice(0, 3).map((day, i) => (
                  <div key={i} className="text-center text-xs font-semibold text-gray-700 py-2 bg-gray-50 rounded">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Compact Calendar Grid */}
              <div className="grid grid-cols-3 gap-3">
                {calendarDays.slice(0, 3).map((day) => {
                  const dateStr = toLocalDateKey(day);
                  const daySlots = slotsByDate[dateStr] || [];
                  const isToday = dateStr === toLocalDateKey(new Date());
                  const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

                  console.log(`📅 Calendar day ${dateStr}:`, {
                    daySlots: daySlots.length,
                    isToday,
                    isPast,
                    slots: daySlots.map((slot: AvailabilitySlot) => ({
                      id: slot.id,
                      time: `${formatTime(slot.startDateTime)} - ${formatTime(slot.endDateTime)}`,
                      duration: slot.durationMinutes
                    }))
                  });

                  return (
                    <div
                      key={dateStr}
                      className={cn(
                        'min-h-[140px] max-h-[180px] border rounded p-3 overflow-hidden',
                        isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200',
                        isPast ? 'bg-gray-50' : ''
                      )}
                    >
                      {/* Compact Day Header */}
                      <div className="text-center mb-3">
                        <span className={cn(
                          'font-medium text-base',
                          isToday ? 'text-blue-700' : isPast ? 'text-gray-400' : 'text-gray-700'
                        )}>
                          {day.getDate()}
                        </span>
                      </div>
                      
                      {/* Compact Time Slots */}
                      <div className="space-y-2 overflow-y-auto max-h-[130px]">
                        {isPast ? (
                          <div className="text-xs text-gray-400 text-center py-3">
                            Past
                          </div>
                        ) : daySlots.length === 0 ? (
                          <div className="text-xs text-gray-400 text-center py-3">
                            -
                          </div>
                        ) : (
                          <>
                            {daySlots.slice(0, 4).map((slot: AvailabilitySlot) => (
                              <button
                                key={slot.id}
                                onClick={() => onSlotSelect(slot)}
                                className={cn(
                                  'w-full text-xs px-3 py-2 rounded border transition-all',
                                  selectedSlot?.id === slot.id
                                    ? 'bg-primary-100 border-primary-300 text-primary-800'
                                    : 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'
                                )}
                                title={`${formatTime(slot.startDateTime)} - ${formatTime(slot.endDateTime)}`}
                              >
                                <div className="font-medium text-sm leading-tight">
                                  {formatTime(slot.startDateTime)} - {formatTime(slot.endDateTime)}
                                </div>
                                <div className="text-xs opacity-75 leading-tight mt-1">
                                  ({slot.durationMinutes} min)
                                </div>
                              </button>
                            ))}
                            
                            {daySlots.length > 4 && (
                              <div className="text-xs text-center text-gray-500 py-1">
                                +{daySlots.length - 4} more
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Show remaining days in second row if needed */}
              {calendarDays.length > 3 && (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-3 mt-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].slice(3, 6).map((day, i) => (
                      <div key={i + 3} className="text-center text-xs font-semibold text-gray-700 py-2 bg-gray-50 rounded">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {calendarDays.slice(3, 6).map((day) => {
                      const dateStr = toLocalDateKey(day);
                      const daySlots = slotsByDate[dateStr] || [];
                      const isToday = dateStr === toLocalDateKey(new Date());
                      const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

                      return (
                        <div
                          key={dateStr}
                          className={cn(
                            'min-h-[140px] max-h-[180px] border rounded p-3 overflow-hidden',
                            isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200',
                            isPast ? 'bg-gray-50' : ''
                          )}
                        >
                          <div className="text-center mb-3">
                            <span className={cn(
                              'font-medium text-base',
                              isToday ? 'text-blue-700' : isPast ? 'text-gray-400' : 'text-gray-700'
                            )}>
                              {day.getDate()}
                            </span>
                          </div>
                          
                          <div className="space-y-2 overflow-y-auto max-h-[130px]">
                            {isPast ? (
                              <div className="text-xs text-gray-400 text-center py-3">
                                Past
                              </div>
                            ) : daySlots.length === 0 ? (
                              <div className="text-xs text-gray-400 text-center py-3">
                                -
                              </div>
                            ) : (
                              <>
                                {daySlots.slice(0, 4).map((slot: AvailabilitySlot) => (
                                  <button
                                    key={slot.id}
                                    onClick={() => onSlotSelect(slot)}
                                    className={cn(
                                      'w-full text-xs px-3 py-2 rounded border transition-all',
                                      selectedSlot?.id === slot.id
                                        ? 'bg-primary-100 border-primary-300 text-primary-800'
                                        : 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'
                                    )}
                                    title={`${formatTime(slot.startDateTime)} - ${formatTime(slot.endDateTime)}`}
                                  >
                                    <div className="font-medium text-sm leading-tight">
                                      {formatTime(slot.startDateTime)} - {formatTime(slot.endDateTime)}
                                    </div>
                                    <div className="text-xs opacity-75 leading-tight mt-1">
                                      ({slot.durationMinutes} min)
                                    </div>
                                  </button>
                                ))}
                                
                                {daySlots.length > 4 && (
                                  <div className="text-xs text-center text-gray-500 py-1">
                                    +{daySlots.length - 4} more
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {calendarDays.length === 7 && (
                    <>
                      <div className="grid grid-cols-1 gap-3 mb-3">
                        <div className="text-center text-xs font-semibold text-gray-700 py-2 bg-gray-50 rounded">
                          Sun
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {calendarDays.slice(6, 7).map((day) => {
                          const dateStr = toLocalDateKey(day);
                          const daySlots = slotsByDate[dateStr] || [];
                          const isToday = dateStr === toLocalDateKey(new Date());
                          const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

                          return (
                            <div
                              key={dateStr}
                              className={cn(
                                'min-h-[140px] max-h-[180px] border rounded p-3 overflow-hidden',
                                isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200',
                                isPast ? 'bg-gray-50' : ''
                              )}
                            >
                              <div className="text-center mb-3">
                                <span className={cn(
                                  'font-medium text-base',
                                  isToday ? 'text-blue-700' : isPast ? 'text-gray-400' : 'text-gray-700'
                                )}>
                                  {day.getDate()}
                                </span>
                              </div>
                              
                              <div className="space-y-2 overflow-y-auto max-h-[130px]">
                                {isPast ? (
                                  <div className="text-xs text-gray-400 text-center py-3">
                                    Past
                                  </div>
                                ) : daySlots.length === 0 ? (
                                  <div className="text-xs text-gray-400 text-center py-3">
                                    -
                                  </div>
                                ) : (
                                  <>
                                    {daySlots.slice(0, 4).map((slot: AvailabilitySlot) => (
                                      <button
                                        key={slot.id}
                                        onClick={() => onSlotSelect(slot)}
                                        className={cn(
                                          'w-full text-xs px-3 py-2 rounded border transition-all',
                                          selectedSlot?.id === slot.id
                                            ? 'bg-primary-100 border-primary-300 text-primary-800'
                                            : 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'
                                        )}
                                        title={`${formatTime(slot.startDateTime)} - ${formatTime(slot.endDateTime)}`}
                                      >
                                        <div className="font-medium text-sm leading-tight">
                                          {formatTime(slot.startDateTime)} - {formatTime(slot.endDateTime)}
                                        </div>
                                        <div className="text-xs opacity-75 leading-tight mt-1">
                                          ({slot.durationMinutes} min)
                                        </div>
                                      </button>
                                    ))}
                                    
                                    {daySlots.length > 4 && (
                                      <div className="text-xs text-center text-gray-500 py-1">
                                        +{daySlots.length - 4} more
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Selected Slot Summary */}
        {selectedSlot && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm font-semibold text-gray-900">Selected Time Slot</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                    <p className="text-gray-900 font-medium">
                      {formatDate(selectedSlot.startDateTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Time</p>
                    <p className="text-gray-900 font-medium">
                      {formatTime(selectedSlot.startDateTime)} - {formatTime(selectedSlot.endDateTime)}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onSlotSelect(null as any)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded"
                title="Clear selection"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full calendar view for non-compact mode would go here
  // For now, just return the compact view
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-primary-700">Available Times</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
            {totalAvailableSlots} slots available
          </span>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-medium text-gray-900">
            {currentDate.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric',
              day: 'numeric'
            })}
          </h3>
          <button
            onClick={() => navigateDate('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {availabilityLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <span className="ml-3 text-gray-600">Loading availability...</span>
          </div>
        ) : totalAvailableSlots === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg text-gray-600 font-medium">No available times</p>
            <p className="text-gray-500">Please try a different week</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-4">
              {calendarDays.map((day) => {
                const dateStr = toLocalDateKey(day);
                const daySlots = slotsByDate[dateStr] || [];
                const isToday = dateStr === toLocalDateKey(new Date());
                const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

                return (
                  <div
                    key={dateStr}
                    className={cn(
                      'min-h-[200px] border rounded-lg p-4',
                      isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200',
                      isPast ? 'bg-gray-50' : ''
                    )}
                  >
                    {/* Day number */}
                    <div className="text-center mb-3">
                      <span className={cn(
                        'text-lg font-semibold',
                        isToday ? 'text-blue-700' : isPast ? 'text-gray-400' : 'text-gray-900'
                      )}>
                        {day.getDate()}
                      </span>
                    </div>

                    {/* Time slots */}
                    <div className="space-y-2">
                      {isPast ? (
                        <div className="text-sm text-gray-400 text-center py-4">
                          Past
                        </div>
                      ) : daySlots.length === 0 ? (
                        <div className="text-sm text-gray-400 text-center py-4">
                          No slots
                        </div>
                      ) : (
                        <>
                          {daySlots.slice(0, 6).map((slot: AvailabilitySlot) => (
                            <button
                              key={slot.id}
                              onClick={() => onSlotSelect(slot)}
                              className={cn(
                                'w-full text-sm px-3 py-2 rounded-lg border transition-all',
                                selectedSlot?.id === slot.id
                                  ? 'bg-primary-100 border-primary-300 text-primary-800'
                                  : 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'
                              )}
                            >
                              <div className="font-medium">
                                {formatTime(slot.startDateTime)} - {formatTime(slot.endDateTime)}
                              </div>
                              <div className="text-xs opacity-75">
                                ({slot.durationMinutes} min)
                              </div>
                            </button>
                          ))}
                          
                          {daySlots.length > 6 && (
                            <div className="text-xs text-center text-gray-500 py-2">
                              +{daySlots.length - 6} more slots
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected slot summary */}
        {selectedSlot && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-900">Selected Time Slot</h4>
                </div>
                <p className="text-green-800">
                  {formatDate(selectedSlot.startDateTime)}
                </p>
                <p className="text-green-800 font-medium">
                  {formatTime(selectedSlot.startDateTime)} - {formatTime(selectedSlot.endDateTime)}
                </p>
              </div>
              <button
                onClick={() => onSlotSelect(null as any)}
                className="text-green-600 hover:text-green-800 p-1"
                title="Clear selection"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 