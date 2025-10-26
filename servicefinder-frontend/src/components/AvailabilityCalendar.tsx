import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { formatTime, cn } from '../lib/utils';
import type { AvailabilitySlot } from '../types';

interface AvailabilityCalendarProps {
  availabilitySlots: AvailabilitySlot[];
  onSlotClick?: (slot: AvailabilitySlot) => void;
  onDateClick?: (date: string) => void;
  selectedDate?: string;
  viewMode?: 'week' | 'month';
  showBookedSlots?: boolean;
  className?: string;
}

export default function AvailabilityCalendar({
  availabilitySlots = [],
  onSlotClick,
  onDateClick,
  selectedDate,
  viewMode = 'week',
  showBookedSlots = true,
  className = ''
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate calendar days based on view mode
  const calendarDays = useMemo(() => {
    const days = [];
    const startDate = new Date(currentDate);

    if (viewMode === 'week') {
      // Get start of week (Monday)
      const dayOfWeek = startDate.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startDate.setDate(startDate.getDate() + mondayOffset);

      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        days.push(date);
      }
    } else {
      // Month view
      const year = startDate.getFullYear();
      const month = startDate.getMonth();
      
      // Get first day of month and adjust to start from Monday
      const firstDay = new Date(year, month, 1);
      const firstMonday = new Date(firstDay);
      const dayOffset = firstDay.getDay() === 0 ? -6 : 1 - firstDay.getDay();
      firstMonday.setDate(firstDay.getDate() + dayOffset);

      // Generate 6 weeks (42 days) to ensure full month coverage
      for (let i = 0; i < 42; i++) {
        const date = new Date(firstMonday);
        date.setDate(firstMonday.getDate() + i);
        days.push(date);
      }
    }

    return days;
  }, [currentDate, viewMode]);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, AvailabilitySlot[]> = {};
    
    availabilitySlots.forEach(slot => {
      const date = slot.startDateTime.split('T')[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(slot);
    });

    // Sort slots by start time for each date
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => 
        new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
      );
    });

    return grouped;
  }, [availabilitySlots]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toISOString().split('T')[0] === selectedDate;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getDaySlots = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const slots = slotsByDate[dateStr] || [];
    return showBookedSlots ? slots : slots.filter(slot => !slot.isBooked);
  };

  const getSlotStats = (slots: AvailabilitySlot[]) => {
    const available = slots.filter(slot => !slot.isBooked).length;
    const booked = slots.filter(slot => slot.isBooked).length;
    return { available, booked, total: slots.length };
  };

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => navigateDate('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <h3 className="text-lg font-medium text-primary-700">
          {currentDate.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric',
            ...(viewMode === 'week' && { day: 'numeric' })
          })}
        </h3>
        
        <button
          onClick={() => navigateDate('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="p-3 text-center font-medium text-gray-600 text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={cn(
        'grid grid-cols-7',
        viewMode === 'month' ? 'grid-rows-6' : 'grid-rows-1'
      )}>
        {calendarDays.map((date, index) => {
          const daySlots = getDaySlots(date);
          const stats = getSlotStats(daySlots);
          const isDateToday = isToday(date);
          const isDateSelected = isSelected(date);
          const isDateCurrentMonth = isCurrentMonth(date);

          return (
            <div
              key={index}
              onClick={() => onDateClick?.(date.toISOString().split('T')[0])}
              className={cn(
                'min-h-24 p-2 border-r border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors',
                isDateToday && 'bg-blue-50',
                isDateSelected && 'bg-primary-50 border-primary-200',
                viewMode === 'month' && !isDateCurrentMonth && 'text-gray-400 bg-gray-50'
              )}
            >
              {/* Date Number */}
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  'text-sm font-medium',
                  isDateToday && 'text-blue-600',
                  isDateSelected && 'text-primary-600',
                  viewMode === 'month' && !isDateCurrentMonth && 'text-gray-400'
                )}>
                  {date.getDate()}
                </span>
                
                {stats.total > 0 && (
                  <div className="flex items-center space-x-1">
                    {stats.available > 0 && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" title={`${stats.available} available`} />
                    )}
                    {stats.booked > 0 && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full" title={`${stats.booked} booked`} />
                    )}
                  </div>
                )}
              </div>

              {/* Availability Slots */}
              <div className="space-y-1">
                {daySlots.slice(0, viewMode === 'week' ? 6 : 3).map((slot, slotIndex) => (
                  <div
                    key={slotIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSlotClick?.(slot);
                    }}
                    className={cn(
                      'text-xs px-2 py-1 rounded cursor-pointer transition-colors',
                      slot.isBooked
                        ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    )}
                    title={`${formatTime(slot.startDateTime)} - ${formatTime(slot.endDateTime)} ${slot.isBooked ? '(Booked)' : '(Available)'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {formatTime(slot.startDateTime)}
                      </span>
                      {slot.isBooked ? (
                        <Users className="w-3 h-3" />
                      ) : (
                        <CheckCircle className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                ))}
                
                {daySlots.length > (viewMode === 'week' ? 6 : 3) && (
                  <div className="text-xs text-gray-500 px-2">
                    +{daySlots.length - (viewMode === 'week' ? 6 : 3)} more
                  </div>
                )}
              </div>

              {/* Empty State */}
              {daySlots.length === 0 && isDateCurrentMonth && (
                <div className="text-center py-2">
                  <div className="w-1 h-1 bg-gray-300 rounded-full mx-auto" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span>Booked</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          Click on dates or slots to interact
        </div>
      </div>
    </div>
  );
}

// Compact availability display component for smaller spaces
export function CompactAvailabilityDisplay({ 
  availabilitySlots, 
  date,
  onSlotClick,
  className = ''
}: {
  availabilitySlots: AvailabilitySlot[];
  date: string;
  onSlotClick?: (slot: AvailabilitySlot) => void;
  className?: string;
}) {
  const daySlots = availabilitySlots.filter(slot => 
    slot.startDateTime.split('T')[0] === date
  );

  const availableSlots = daySlots.filter(slot => !slot.isBooked);
  const bookedSlots = daySlots.filter(slot => slot.isBooked);

  if (daySlots.length === 0) {
    return (
      <div className={cn('text-center py-4 text-gray-500', className)}>
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No availability</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {availableSlots.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            Available ({availableSlots.length})
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {availableSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => onSlotClick?.(slot)}
                className="text-xs px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
              >
                {formatTime(slot.startDateTime)}
              </button>
            ))}
          </div>
        </div>
      )}

      {bookedSlots.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-orange-700 mb-2 flex items-center">
            <Users className="w-4 h-4 mr-1" />
            Booked ({bookedSlots.length})
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {bookedSlots.map((slot) => (
              <div
                key={slot.id}
                className="text-xs px-3 py-2 bg-orange-100 text-orange-800 rounded-lg"
              >
                {formatTime(slot.startDateTime)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 