import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Copy,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  AlertCircle,
  CheckCircle,
  Loader2,
  Filter,
  Search,
  MapPin,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

import { apiClient } from '../../lib/api';
import { formatDate, formatTime, cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import type { AvailabilitySlot, AvailabilityCreateRequest } from '../../types';
import BackButton from '../../components/BackButton';
import ThemedSelect from '../../components/ThemedSelect';
import { Listbox, Popover, Transition } from '@headlessui/react';
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, isAfter, isBefore, isEqual, isSameMonth, parseISO, startOfMonth, startOfWeek } from 'date-fns';

const DAYS_OF_WEEK = [
  { key: 'MONDAY', label: 'Monday' },
  { key: 'TUESDAY', label: 'Tuesday' },
  { key: 'WEDNESDAY', label: 'Wednesday' },
  { key: 'THURSDAY', label: 'Thursday' },
  { key: 'FRIDAY', label: 'Friday' },
  { key: 'SATURDAY', label: 'Saturday' },
  { key: 'SUNDAY', label: 'Sunday' }
];

const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];

export default function AvailabilityManagement() {
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [filterBooked, setFilterBooked] = useState<'all' | 'available' | 'booked'>('all');
  const queryClient = useQueryClient();

  // Check authentication and role
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to access this page');
      window.location.href = '/login';
      return;
    }
    
    if (user?.role !== 'SERVICE_PROVIDER') {
      toast.error('Access denied. This page is only for service providers.');
      window.location.href = '/';
      return;
    }
  }, [isAuthenticated, user]);

  // Don't render anything if not authenticated or wrong role
  if (!isAuthenticated || user?.role !== 'SERVICE_PROVIDER') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-3 text-secondary-600">Checking authentication...</span>
      </div>
    );
  }

  // Get date range for current view
  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    
    if (viewMode === 'week') {
      // Get start of week (Monday)
      const dayOfWeek = start.getDay();
      const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      start.setDate(diff);
      end.setDate(start.getDate() + 6);
    } else {
      // Get start and end of month
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    }
    
    // Set start time to beginning of day and end time to end of day
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    };
  };

  const { startDate, endDate } = getDateRange();

  // Fetch availability slots with real-time updates
  const {
    data: availabilitySlots = [],
    isLoading: availabilityLoading,
    refetch: refetchAvailability
  } = useQuery({
    queryKey: ['provider-availability', startDate, endDate, filterBooked],
    queryFn: () => {
      if (import.meta.env.DEV) console.log('Fetching availability with params:', { startDate, endDate });
      return apiClient.getMyAvailability({ startDate, endDate });
    },
    refetchInterval: 30000, // Refetch every 30 seconds to show real-time bookings
    refetchIntervalInBackground: true, // Continue refetching when tab is not active
  });

  // Debug log when availability data changes
  useEffect(() => {
    if (import.meta.env.DEV) console.log('Availability data updated:', {
      count: availabilitySlots.length,
      available: availabilitySlots.filter((s: AvailabilitySlot) => !s.isBooked).length,
      booked: availabilitySlots.filter((s: AvailabilitySlot) => s.isBooked).length
    });
  }, [availabilitySlots]);

  // Filter slots based on booking status
  const filteredSlots = availabilitySlots.filter((slot: AvailabilitySlot) => {
    if (filterBooked === 'available') return !slot.isBooked;
    if (filterBooked === 'booked') return slot.isBooked;
    return true; // 'all'
  });

  // Create availability mutation
  const createAvailabilityMutation = useMutation({
    mutationFn: (data: AvailabilityCreateRequest) => apiClient.createAvailability(data),
    onSuccess: () => {
      toast.success('Availability created successfully!');
      // Invalidate the specific query with current date range
      queryClient.invalidateQueries({ queryKey: ['provider-availability'] });
      // Also refetch the current query immediately
      refetchAvailability();
      setShowCreateModal(false);
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) console.error('Create availability error:', error);
      if (import.meta.env.DEV) console.error('Error response:', error.response);
      if (import.meta.env.DEV) console.error('Full error object:', JSON.stringify(error, null, 2));
      
      // Try to extract the actual error message from the response
      let errorMessage = 'Failed to create availability. Please try again.';
      
      if (error.response?.status === 403) {
        errorMessage = 'Access denied. Please ensure you are logged in as a service provider.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 400) {
        // Validation errors from backend
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else {
            errorMessage = 'Invalid data provided. Please check your inputs.';
          }
        }
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again later.';
        console.error('Server error details:', error.response?.data);
        
        // Try to extract server error details
        if (error.response?.data) {
          if (typeof error.response.data === 'string' && error.response.data.includes('conflict')) {
            errorMessage = 'Time slot conflicts with existing availability';
          } else if (error.response.data.message && error.response.data.message.includes('conflict')) {
            errorMessage = error.response.data.message;
          }
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      console.error('Final error message to user:', errorMessage);
      toast.error(errorMessage);
    },
  });

  // Create bulk availability mutation
  const createBulkAvailabilityMutation = useMutation({
    mutationFn: (data: {
      startDate: string;
      endDate: string;
      selectedDays: string[];
      timeSlots: Array<{ startTime: string; endTime: string }>;
      notes?: string;
    }) => apiClient.createBulkAvailability(data),
    onSuccess: (results) => {
      toast.success(`Created ${results.length} availability slots!`);
      // Invalidate and refetch availability data
      queryClient.invalidateQueries({ queryKey: ['provider-availability'] });
      refetchAvailability();
      setShowBulkModal(false);
    },
    onError: (error: any) => {
      console.error('Bulk create availability error:', error);
      toast.error('Failed to create bulk availability');
    },
  });

  // Delete availability mutation
  const deleteAvailabilityMutation = useMutation({
    mutationFn: (availabilityId: number) => apiClient.deleteAvailability(availabilityId),
    onSuccess: () => {
      toast.success('Availability deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['provider-availability'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete availability');
    },
  });

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const handleDeleteSlot = (slotId: number) => {
    if (window.confirm('Are you sure you want to delete this availability slot?')) {
      deleteAvailabilityMutation.mutate(slotId);
    }
  };

  const tabs = [
    { id: 'calendar', label: 'Calendar View', icon: Calendar },
    { id: 'list', label: 'List View', icon: CalendarDays },
    { id: 'bulk', label: 'Bulk Creation', icon: Copy },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-700 mb-2 sm:mb-4">Availability Management</h1>
            <p className="text-base sm:text-lg text-black">Manage your service availability and schedules</p>
          </div>
          <div className="hidden sm:flex space-x-3">
            <button
              onClick={() => setShowBulkModal(true)}
              className="btn btn-secondary"
            >
              <Copy className="w-4 h-4 mr-2" />
              Bulk Create
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary gradient-primary text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Availability
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="glass-card">
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-primary-100 text-primary-600 mr-3">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-primary-700">{availabilitySlots.length}</p>
                <p className="text-sm text-secondary-600">Total Slots</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-accent-100 text-accent-600 mr-3">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-accent-700">{availabilitySlots.filter((s: AvailabilitySlot) => !s.isBooked).length}</p>
                <p className="text-sm text-secondary-600">Available</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-secondary-100 text-secondary-600 mr-3">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-secondary-700">{availabilitySlots.filter((s: AvailabilitySlot) => s.isBooked).length}</p>
                <p className="text-sm text-secondary-600">Booked</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-warm-100 text-warm-600 mr-3">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-warm-700">{Math.round(availabilitySlots.length / 7)}</p>
                <p className="text-sm text-secondary-600">Avg/Week</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="glass-card overflow-hidden">
        <div className="border-b border-primary-200">
          <nav className="flex overflow-x-auto whitespace-nowrap no-scrollbar">
            <button
              onClick={() => setActiveTab('calendar')}
              className={cn(
                'px-3 py-2 sm:px-6 sm:py-3 text-sm font-medium transition-colors',
                activeTab === 'calendar'
                  ? 'border-b-2 border-primary-500 text-primary-600 bg-primary-50'
                  : 'text-secondary-600 hover:text-primary-600'
              )}
            >
              <Calendar className="w-4 h-4 mr-2 inline" />
              Calendar View
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={cn(
                'px-3 py-2 sm:px-6 sm:py-3 text-sm font-medium transition-colors',
                activeTab === 'list'
                  ? 'border-b-2 border-primary-500 text-primary-600 bg-primary-50'
                  : 'text-secondary-600 hover:text-primary-600'
              )}
            >
              <Filter className="w-4 h-4 mr-2 inline" />
              List View
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'calendar' && (
            <CalendarView
              currentDate={currentDate}
              viewMode={viewMode}
              setViewMode={setViewMode}
              navigateDate={navigateDate}
              availabilitySlots={filteredSlots}
              isLoading={availabilityLoading}
              onDeleteSlot={handleDeleteSlot}
              filterBooked={filterBooked}
              setFilterBooked={setFilterBooked}
            />
          )}

          {activeTab === 'list' && (
            <ListView
              availabilitySlots={filteredSlots}
              isLoading={availabilityLoading}
              onDeleteSlot={handleDeleteSlot}
              filterBooked={filterBooked}
              setFilterBooked={setFilterBooked}
            />
          )}

          {activeTab === 'bulk' && (
            <BulkCreationView
              onBulkCreate={(data: {
                startDate: string;
                endDate: string;
                selectedDays: string[];
                timeSlots: Array<{ startTime: string; endTime: string }>;
                notes?: string;
              }) => createBulkAvailabilityMutation.mutate(data)}
              isCreating={createBulkAvailabilityMutation.isPending}
            />
          )}
        </div>
      </div>

      {/* Create Availability Modal */}
      {showCreateModal && (
        <CreateAvailabilityModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(data: AvailabilityCreateRequest) => createAvailabilityMutation.mutate(data)}
          isCreating={createAvailabilityMutation.isPending}
          availabilitySlots={availabilitySlots}
        />
      )}

      {/* Bulk Create Modal */}
      {showBulkModal && (
        <BulkCreateModal
          onClose={() => setShowBulkModal(false)}
          onCreate={(data: {
            startDate: string;
            endDate: string;
            selectedDays: string[];
            timeSlots: Array<{ startTime: string; endTime: string }>;
            notes?: string;
          }) => createBulkAvailabilityMutation.mutate(data)}
          isCreating={createBulkAvailabilityMutation.isPending}
        />
      )}
    </div>
  );
}

// Calendar View Component
function CalendarView({ 
  currentDate, 
  viewMode, 
  setViewMode, 
  navigateDate, 
  availabilitySlots,
  isLoading,
  onDeleteSlot,
  filterBooked,
  setFilterBooked
}: any) {
  return (
    <div className="space-y-6">
      {/* Calendar Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-primary-100 rounded-lg transition-colors text-primary-600 hover:text-primary-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-medium text-primary-700 min-w-[200px] text-center">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric',
                ...(viewMode === 'week' && { day: 'numeric' })
              })}
            </h3>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-primary-100 rounded-lg transition-colors text-primary-600 hover:text-primary-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                viewMode === 'week'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-secondary-600 hover:text-primary-700 hover:bg-primary-50'
              )}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                viewMode === 'month'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-secondary-600 hover:text-primary-700 hover:bg-primary-50'
              )}
            >
              Month
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-secondary-400" />
          <ThemedSelect
            value={filterBooked}
            onChange={(v: string) => setFilterBooked(v as any)}
            options={[{ value: 'all', label: 'All Slots' }, { value: 'available', label: 'Available Only' }, { value: 'booked', label: 'Booked Only' }]}
            className="text-sm"
          />
        </div>
      </div>

      {/* Calendar Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-3 text-secondary-600">Loading availability...</span>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-primary-50/50 to-secondary-50/50 rounded-lg p-4">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-2 mb-4 min-w-[700px]">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center font-medium text-primary-600 py-2">
                {day}
              </div>
            ))}
            </div>
          </div>
          
          {/* Calendar Days */}
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <CalendarGrid
            currentDate={currentDate}
            viewMode={viewMode}
            availabilitySlots={availabilitySlots}
            onDeleteSlot={onDeleteSlot}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// List View Component
function ListView({ 
  availabilitySlots, 
  isLoading, 
  onDeleteSlot, 
  filterBooked, 
  setFilterBooked 
}: any) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndSearchedSlots = availabilitySlots.filter((slot: AvailabilitySlot) => {
    const matchesSearch = 
      formatDate(slot.startDateTime).toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatTime(slot.startDateTime).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (slot.notes && slot.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* List Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by date, time, or notes..."
              className="input pl-10 w-full sm:w-80 border-primary-300 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <ThemedSelect
            value={filterBooked}
            onChange={(v: string) => setFilterBooked(v as any)}
            options={[
              { value: 'all', label: `All Slots (${availabilitySlots.length})` },
              { value: 'available', label: `Available (${availabilitySlots.filter((s: AvailabilitySlot) => !s.isBooked).length})` },
              { value: 'booked', label: `Booked (${availabilitySlots.filter((s: AvailabilitySlot) => s.isBooked).length})` },
            ]}
          />
        </div>
      </div>

      {/* Slots List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-3 text-secondary-600">Loading availability...</span>
        </div>
      ) : filteredAndSearchedSlots.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-primary-300" />
          <h3 className="text-lg font-medium text-primary-700 mb-2">No availability slots found</h3>
          <p className="text-secondary-600">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSearchedSlots.map((slot: AvailabilitySlot) => (
            <div
              key={slot.id}
              className={cn(
                'glass-card p-4',
                slot.isBooked 
                  ? 'border-error-300 bg-gradient-to-r from-error-50/80 to-error-100/50' 
                  : 'border-accent-300 bg-gradient-to-r from-accent-50/80 to-accent-100/50',
                'cursor-pointer'
              )}
              onClick={() => onDeleteSlot(slot.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center text-primary-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="font-medium">{formatDate(slot.startDateTime)}</span>
                    </div>
                    <div className="flex items-center text-secondary-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{formatTime(slot.startDateTime)} - {formatTime(slot.endDateTime)}</span>
                      <span className="text-sm text-secondary-500 ml-2">({slot.durationMinutes} min)</span>
                    </div>
                    <div className={cn(
                      'px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1',
                      slot.isBooked
                        ? 'bg-error-200 text-error-900 border border-error-400'
                        : 'bg-accent-200 text-accent-900 border border-accent-400'
                    )}>
                      <span>{slot.isBooked ? '🔒' : '✅'}</span>
                      <span>{slot.isBooked ? 'Booked' : 'Available'}</span>
                    </div>
                  </div>

                  {slot.notes && (
                    <p className="text-sm text-secondary-600 mb-2">{slot.notes}</p>
                  )}

                  {slot.isRecurring && (
                    <div className="flex items-center text-sm text-primary-600">
                      <Copy className="w-4 h-4 mr-1" />
                      Recurring: {slot.dayOfWeek} {slot.recurringStartTime} - {slot.recurringEndTime}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onDeleteSlot(slot.id)}
                    disabled={slot.isBooked}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      slot.isBooked
                        ? 'text-secondary-400 cursor-not-allowed'
                        : 'text-primary-600 hover:bg-primary-50'
                    )}
                    title={slot.isBooked ? 'Cannot delete booked slot' : 'Delete slot'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Bulk Creation View Component
function BulkCreationView({ onBulkCreate, isCreating }: any) {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [timeSlots, setTimeSlots] = useState([{ startTime: '09:00', endTime: '17:00' }]);
  const [notes, setNotes] = useState('');

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { startTime: '09:00', endTime: '17:00' }]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const newSlots = [...timeSlots];
    newSlots[index][field] = value;
    setTimeSlots(newSlots);
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSubmit = () => {
    if (timeSlots.length === 0 || selectedDays.length === 0) {
      toast.error('Please select at least one day and time slot');
      return;
    }

    // Debug the bulk creation data
    console.log('Bulk creation data:', {
      startDate,
      endDate,
      selectedDays,
      timeSlots,
      notes
    });
    
    // Calculate expected slots for verification
    let expectedCount = 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    console.log('Date range analysis:', {
      startDate: start.toString(),
      endDate: end.toString(),
      startDateISO: start.toISOString(),
      endDateISO: end.toISOString()
    });
    
    // Show which days will be created
    const slotsToCreate = [];
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      if (selectedDays.includes(dayName)) {
        slotsToCreate.push({
          date: date.toISOString().split('T')[0],
          dayName: dayName,
          timeSlotsCount: timeSlots.length
        });
        expectedCount += timeSlots.length;
      }
    }
    
    console.log('Expected slots to create:', {
      totalCount: expectedCount,
      breakdown: slotsToCreate
    });

    onBulkCreate({
      startDate,
      endDate,
      selectedDays,
      timeSlots,
      notes
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-primary-700 mb-4">Bulk Create Availability</h3>
        <p className="text-secondary-600 mb-6">
          Create multiple availability slots across multiple days with the same time patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Range */}
        <div>
          <ThemedDatePicker
            label="Date Range (Start)"
            value={startDate}
            onChange={setStartDate}
            min={new Date().toISOString().split('T')[0]}
          />
          <div className="mt-2">
            <ThemedDatePicker
              label="Date Range (End)"
              value={endDate}
              onChange={setEndDate}
              min={startDate}
            />
          </div>
        </div>

        {/* Days Selection */}
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">
            Days of Week
          </label>
          <div className="grid grid-cols-2 gap-2">
            <ThemedSelect
              value={''}
              onChange={(v) => {
                if (!v) return;
                toggleDay(DAYS_OF_WEEK.find(d => d.key === v)?.label || v);
              }}
              options={DAYS_OF_WEEK.map(d => ({ value: d.key, label: d.label }))}
              placeholder="Add day"
            />
            <div className="col-span-2 text-secondary-600 text-sm">
              Selected: {selectedDays.length ? selectedDays.join(', ') : 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Time Slots */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-primary-700">
            Time Slots
          </label>
          <button
            onClick={addTimeSlot}
            className="btn btn-outline btn-sm border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Slot
          </button>
        </div>
        
        <div className="space-y-3">
          {timeSlots.map((slot, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                className="input border-primary-300 focus:ring-primary-500 focus:border-primary-500"
              />
              <span className="text-secondary-500">to</span>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                className="input border-primary-300 focus:ring-primary-500 focus:border-primary-500"
              />
              {timeSlots.length > 1 && (
                <button
                  onClick={() => removeTimeSlot(index)}
                  className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-primary-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes for these availability slots..."
          className="input w-full h-24 resize-none border-primary-300 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Preview */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h4 className="font-medium text-primary-700 mb-2">Preview</h4>
        <p className="text-sm text-primary-600">
          This will create approximately{' '}
          <strong>
            {(() => {
              if (!startDate || !endDate || selectedDays.length === 0 || timeSlots.length === 0) {
                return 0;
              }
              
              let count = 0;
              const start = new Date(startDate);
              const end = new Date(endDate);
              
              // Iterate through each day in the date range
              for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                
                // If this day is selected, count the time slots for this day
                if (selectedDays.includes(dayName)) {
                  count += timeSlots.length;
                }
              }
              
              return count;
            })()}
          </strong>{' '}
          availability slots across the selected date range.
        </p>
        
        {/* Detailed breakdown */}
        <div className="mt-2 text-xs text-primary-500">
          <strong>Breakdown:</strong>
          <ul className="list-disc list-inside mt-1">
            {selectedDays.map(day => {
              // Count how many times this day appears in the range
              let dayCount = 0;
              const start = new Date(startDate);
              const end = new Date(endDate);
              
              for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                if (dayName === day) {
                  dayCount++;
                }
              }
              
              return (
                <li key={day}>
                  {day}: {dayCount} days × {timeSlots.length} time slots = {dayCount * timeSlots.length} slots
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isCreating || timeSlots.length === 0 || selectedDays.length === 0}
          className="btn btn-primary gradient-primary text-white"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Create Bulk Availability
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Create Availability Modal Component
function CreateAvailabilityModal({ 
  onClose, 
  onCreate, 
  isCreating, 
  availabilitySlots 
}: {
  onClose: () => void;
  onCreate: (data: AvailabilityCreateRequest) => void;
  isCreating: boolean;
  availabilitySlots: AvailabilitySlot[];
}) {
  // Default to tomorrow's date to avoid @Future validation issues
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [formData, setFormData] = useState({
    date: tomorrow.toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: false,
    dayOfWeek: '',
    recurringStartTime: '',
    recurringEndTime: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Convert to datetime format expected by backend
    // Create datetime strings in local timezone (no conversion to UTC)
    const startDateTime = `${formData.date}T${formData.startTime}:00`;
    const endDateTime = `${formData.date}T${formData.endTime}:00`;
    
    // Validate that the datetime is in the future (backend requirement)
    const now = new Date();
    const startDateObj = new Date(startDateTime);
    const endDateObj = new Date(endDateTime);
    
    if (startDateObj <= now) {
      toast.error('Start time must be in the future');
      return;
    }
    
    if (endDateObj <= startDateObj) {
      toast.error('End time must be after start time');
      return;
    }
    
    // Check for existing availability conflicts on this date
    const selectedDateStr = formData.date;
    const existingSlotsOnDate = availabilitySlots.filter((slot: AvailabilitySlot) => {
      const slotDate = slot.startDateTime.split('T')[0];
      return slotDate === selectedDateStr;
    });
    
    console.log('Existing slots on selected date:', {
      selectedDate: selectedDateStr,
      existingSlots: existingSlotsOnDate,
      conflictCheck: existingSlotsOnDate.map((slot: AvailabilitySlot) => ({
        id: slot.id,
        startTime: formatTime(slot.startDateTime),
        endTime: formatTime(slot.endDateTime),
        isBooked: slot.isBooked,
        notes: slot.notes
      }))
    });
    
    // Debug logging
    console.log('Form data:', formData);
    console.log('Date conversion:', {
      originalDate: formData.date,
      originalStartTime: formData.startTime,
      originalEndTime: formData.endTime,
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      currentTime: now.toISOString(),
      isInFuture: startDateObj > now,
      dayOfWeek: startDateObj.toLocaleDateString('en-US', { weekday: 'long' }),
      dateInfo: {
        year: startDateObj.getFullYear(),
        month: startDateObj.getMonth() + 1,
        day: startDateObj.getDate(),
        isWeekend: startDateObj.getDay() === 0 || startDateObj.getDay() === 6
      },
      note: 'Sending as local time without timezone conversion'
    });

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to create availability');
      return;
    }

    // Prepare the request data
    const requestData = {
      startDateTime,
      endDateTime,
      isRecurring: formData.isRecurring,
      dayOfWeek: formData.isRecurring && formData.dayOfWeek ? formData.dayOfWeek : undefined,
      recurringStartTime: formData.isRecurring && formData.recurringStartTime ? formData.recurringStartTime + ':00' : undefined,
      recurringEndTime: formData.isRecurring && formData.recurringEndTime ? formData.recurringEndTime + ':00' : undefined,
      notes: formData.notes || undefined
    };

    // Special debugging for August 10th, 11th, 12th
    const selectedDay = startDateObj.getDate();
    const selectedMonth = startDateObj.getMonth() + 1; // JavaScript months are 0-based
    
    if (selectedMonth === 8 && [10, 11, 12].includes(selectedDay)) {
      console.warn(`🚨 DEBUGGING PROBLEMATIC DATE: August ${selectedDay}`);
      console.log('Special date debugging:', {
        formattedDate: startDateObj.toISOString(),
        localString: startDateObj.toString(),
        dayOfWeek: startDateObj.toLocaleDateString('en-US', { weekday: 'long' }),
        isWeekend: startDateObj.getDay() === 0 || startDateObj.getDay() === 6,
        timezoneName: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: startDateObj.getTimezoneOffset(),
        requestData: requestData,
        existingSlotsCount: existingSlotsOnDate.length
      });
    }

    console.log('Final request data:', requestData);
    onCreate(requestData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-card max-w-md w-full mx-4 availability-modal">
        <div className="flex items-center justify-between p-6 border-b border-primary-200">
          <h3 className="text-lg font-medium text-primary-700">Create Availability</h3>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-primary-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form p-6 space-y-4">
          <div>
            <ThemedDatePicker
              label="Date *"
              value={formData.date}
              onChange={(v) => setFormData({ ...formData, date: v })}
              min={tomorrow.toISOString().split('T')[0]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <ThemedTimePicker
                label="Start Time *"
                value={formData.startTime}
                onChange={(v) => setFormData({ ...formData, startTime: v })}
              />
            </div>
            <div>
              <ThemedTimePicker
                label="End Time *"
                value={formData.endTime}
                onChange={(v) => setFormData({ ...formData, endTime: v })}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="rounded border-primary-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-secondary-700">Recurring availability</span>
            </label>
          </div>

          {formData.isRecurring && (
            <>
              <div>
                <ThemedSelect
                  label="Day of Week"
                  value={formData.dayOfWeek}
                  onChange={(v) => setFormData({ ...formData, dayOfWeek: v })}
                  options={DAYS_OF_WEEK.map(d => ({ value: d.key, label: d.label }))}
                  placeholder="Select day"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <ThemedTimePicker
                    label="Recurring Start Time"
                    value={formData.recurringStartTime}
                    onChange={(v) => setFormData({ ...formData, recurringStartTime: v })}
                  />
                </div>
                <div>
                  <ThemedTimePicker
                    label="Recurring End Time"
                    value={formData.recurringEndTime}
                    onChange={(v) => setFormData({ ...formData, recurringEndTime: v })}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about this availability..."
              className="input w-full h-20 resize-none border-primary-300 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary gradient-primary text-white"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Bulk Create Modal Component (simplified version)
function BulkCreateModal({ onClose, onCreate, isCreating }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto availability-modal">
        <div className="flex items-center justify-between p-6 border-b border-primary-200">
          <h3 className="text-lg font-medium text-primary-700">Bulk Create Availability</h3>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-primary-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="modal-form p-6">
          <BulkCreationView onBulkCreate={onCreate} isCreating={isCreating} />
        </div>
      </div>
    </div>
  );
} 

// Calendar Grid Component
function CalendarGrid({ 
  currentDate, 
  viewMode, 
  availabilitySlots, 
  onDeleteSlot 
}: {
  currentDate: Date;
  viewMode: 'week' | 'month';
  availabilitySlots: AvailabilitySlot[];
  onDeleteSlot: (slotId: number) => void;
}) {
  // Get calendar days to display
  const getCalendarDays = () => {
    const days: Date[] = [];
    const start = new Date(currentDate);
    
    if (viewMode === 'week') {
      // Get start of week (Monday)
      const dayOfWeek = start.getDay();
      const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      start.setDate(diff);
      
      // Add 7 days for the week
      for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        days.push(day);
      }
    } else {
      // Get start of month
      start.setDate(1);
      const endOfMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      
      // Add days from start of month to end of month
      for (let date = new Date(start); date <= endOfMonth; date.setDate(date.getDate() + 1)) {
        days.push(new Date(date));
      }
    }
    
    return days;
  };

  // Group slots by date
  const slotsByDate = availabilitySlots.reduce((acc: Record<string, AvailabilitySlot[]>, slot) => {
    const date = slot.startDateTime.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  const calendarDays = getCalendarDays();

  return (
    <div className={`grid gap-2 ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'} min-w-[700px]`}>
      {calendarDays.map((day) => {
        const dateStr = day.toISOString().split('T')[0];
        const daySlots = slotsByDate[dateStr] || [];
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        
        return (
          <div
            key={dateStr}
            className={cn(
              'min-h-[120px] border rounded-lg p-2',
              isToday ? 'bg-primary-50 border-primary-200' : 'bg-white/90 border-primary-200'
            )}
          >
            {/* Day Header */}
            <div className="flex items-center justify-between mb-2">
              <span className={cn(
                'text-sm font-medium',
                isToday ? 'text-primary-700' : 'text-secondary-700'
              )}>
                {day.getDate()}
              </span>
              {daySlots.length > 0 && (
                <span className="text-xs text-secondary-500">
                  {daySlots.length} slots
                </span>
              )}
            </div>
            
            {/* Availability Slots */}
            <div className="space-y-1">
              {daySlots.slice(0, 3).map((slot) => (
                <div
                  key={slot.id}
                  className={cn(
                    'text-xs p-2 rounded cursor-pointer group relative border transition-all duration-200',
                    slot.isBooked ? 'slot-booked' : 'slot-available'
                  )}
                  onClick={() => !slot.isBooked && onDeleteSlot(slot.id)}
                  title={`${formatTime(slot.startDateTime)} - ${formatTime(slot.endDateTime)}${slot.notes ? `\nNotes: ${slot.notes}` : ''}${slot.isBooked ? '\nStatus: Booked' : '\nStatus: Available\nClick to delete'}`}
                >
                  {/* Time Range */}
                  <div className="font-bold text-center mb-1">
                    {formatTime(slot.startDateTime)} - {formatTime(slot.endDateTime)}
                  </div>
                  
                  {/* Status and Actions */}
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      'text-xs font-bold px-2 py-0.5 rounded-full',
                      slot.isBooked
                        ? 'bg-error-200 text-error-800'
                        : 'bg-accent-200 text-accent-800'
                    )}>
                      {slot.isBooked ? '🔒 Booked' : '✅ Available'}
                    </span>
                    {!slot.isBooked && (
                      <X className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-error-600" />
                    )}
                  </div>
                  
                  {/* Notes preview */}
                  {slot.notes && (
                    <div className="text-xs text-secondary-600 truncate mt-1" title={slot.notes}>
                      {slot.notes}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Show more indicator */}
              {daySlots.length > 3 && (
                <div className="text-xs text-secondary-500 text-center py-1 bg-primary-100 rounded border border-primary-200">
                  +{daySlots.length - 3} more slots
                </div>
              )}
              
              {/* Empty state for days with no slots */}
              {daySlots.length === 0 && (
                <div className="text-xs text-secondary-400 text-center py-2">
                  No slots
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
} 



// Themed Time Picker using TIME_SLOTS
function ThemedTimePicker({ label, value, onChange, className = '' }: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const to12Hour = (t: string) => {
    if (!t) return '';
    const [hStr, mStr] = t.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr || '0', 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  };
  const options = TIME_SLOTS.map(t => ({ value: t, label: to12Hour(t) }));
  const display = value ? to12Hour(value) : '';
  return (
    <ThemedSelect label={label} value={value} onChange={onChange} options={options} className={className} placeholder="Select time" />
  );
}

// Themed Date Picker (lightweight calendar)
function ThemedDatePicker({ label, value, onChange, min, className = '' }: {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (v: string) => void;
  min?: string; // YYYY-MM-DD
  className?: string;
}) {
  const selected = value ? parseISO(value) : new Date();
  const minDate = min ? parseISO(min) : undefined;
  const [viewDate, setViewDate] = useState<Date>(startOfMonth(selected));

  const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 });
  const end = startOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 });
  // Add 6 days to get the full week containing the end of month
  const endWeek = new Date(end);
  endWeek.setDate(endWeek.getDate() + 6);
  const days = eachDayOfInterval({ start, end: endWeek });

  const canPick = (d: Date) => {
    if (minDate && isBefore(d, minDate)) return false;
    return true;
  };

  const pick = (d: Date) => {
    if (!canPick(d)) return;
    onChange(format(d, 'yyyy-MM-dd'));
  };

  return (
    <div className={cn('w-full', className)}>
      {label && <label className="block text-sm font-medium text-primary-700 mb-2">{label}</label>}
      <Popover className="relative">
        <Popover.Button className="w-full input flex items-center justify-between">
          <span className="truncate">{value ? format(selected, 'PPP') : 'Select date'}</span>
          <Calendar className="w-4 h-4 text-primary-600" />
        </Popover.Button>
        <Transition
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Popover.Panel className="absolute z-20 mt-2 w-80 p-3 glass-card border border-primary-200"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95) !important',
              border: '1px solid #FE676E !important'
            }}>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setViewDate(addMonths(viewDate, -1))} className="p-1 rounded hover:bg-primary-50 text-primary-700">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-primary-700 font-medium">{format(viewDate, 'MMMM yyyy')}</div>
              <button onClick={() => setViewDate(addMonths(viewDate, 1))} className="p-1 rounded hover:bg-primary-50 text-primary-700">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs text-secondary-600 mb-1">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                <div key={d} className="text-center py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((d) => {
                const isDisabled = !canPick(d) || !isSameMonth(d, viewDate);
                const isSelected = isEqual(d, selected);
                const isCurrentMonth = isSameMonth(d, viewDate);
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => pick(d)}
                    disabled={isDisabled}
                    className={cn(
                      'px-2 py-2 rounded text-sm text-center border transition',
                      isSelected && 'bg-primary-100 border-primary-300 text-primary-800',
                      !isSelected && isCurrentMonth && 'bg-white/90 border-primary-200 hover:bg-primary-50 text-secondary-700',
                      !isSelected && !isCurrentMonth && 'bg-gray-50/50 border-gray-200 text-gray-400',
                      isDisabled && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    {format(d, 'd')}
                  </button>
                );
              })}
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    </div>
  );
} 