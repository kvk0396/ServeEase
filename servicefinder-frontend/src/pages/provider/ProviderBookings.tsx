import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar,
  Search,
  Filter,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  MessageSquare,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

import ThemedSelect from '../../components/ThemedSelect';
import { apiClient } from '../../lib/api';
import { formatCurrency, formatDate, formatDateTime, cn } from '../../lib/utils';
import type { Booking, Rating } from '../../types';
import { BookingStatus } from '../../types';
import BackButton from '../../components/BackButton';

const statusOptions = [
  { value: 'all', label: 'All Bookings', color: 'bg-gray-100 text-gray-800' },
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

const sortOptions = [
  { value: 'scheduledDateTime', label: 'Date (Newest)' },
  { value: 'scheduledDateTime_asc', label: 'Date (Oldest)' },
  { value: 'totalPrice', label: 'Price (Highest)' },
  { value: 'totalPrice_asc', label: 'Price (Lowest)' },
  { value: 'status', label: 'Status' },
];

export default function ProviderBookings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('scheduledDateTime');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [expandedBookings, setExpandedBookings] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();

  const {
    data: bookingsData,
    isLoading: bookingsLoading
  } = useQuery({
    queryKey: ['provider-bookings', statusFilter, sortBy],
    queryFn: () => apiClient.getProviderBookings({
      status: statusFilter === 'all' ? undefined : statusFilter,
      size: 50
    }),
  });

  const bookings = bookingsData?.content || [];
  
  // Debug logging (dev only)
  if (import.meta.env.DEV && bookings.length > 0) {
    console.log('Bookings data received:', bookingsData);
    console.log('First booking structure:', bookings[0]);
    console.log('Customer data in first booking:', bookings[0].customer);
  }

  const updateBookingStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: number; status: string; reason?: string }) => 
      apiClient.updateBookingStatus(id, { status, reason }),
    onSuccess: () => {
      toast.success('Booking status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
      setShowStatusModal(false);
      setSelectedBooking(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update booking status');
    },
  });

  const filteredAndSortedBookings = bookings
    .filter((booking: Booking) => {
      // Status filter
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      
      // Search filter - add proper null checks
      const matchesSearch = 
        booking.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && (searchTerm === '' || matchesSearch);
    })
    .sort((a: Booking, b: Booking) => {
      const [field, direction] = sortBy.split('_');
      const isAsc = direction === 'asc';
      
      let aValue: any, bValue: any;
      
      switch (field) {
        case 'scheduledDateTime':
          aValue = new Date(a.scheduledDateTime).getTime();
          bValue = new Date(b.scheduledDateTime).getTime();
          break;
        case 'totalPrice':
          aValue = a.totalPrice || 0;
          bValue = b.totalPrice || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.scheduledDateTime;
          bValue = b.scheduledDateTime;
      }
      
      if (aValue < bValue) return isAsc ? -1 : 1;
      if (aValue > bValue) return isAsc ? 1 : -1;
      return 0;
    });

  const toggleBookingExpansion = (bookingId: number) => {
    const newExpanded = new Set(expandedBookings);
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId);
    } else {
      newExpanded.add(bookingId);
    }
    setExpandedBookings(newExpanded);
  };

  // Stats calculation with proper null checks
  const stats = {
    total: bookings.length || 0,
    pending: bookings.filter((b: Booking) => b.status === 'PENDING').length || 0,
    confirmed: bookings.filter((b: Booking) => b.status === 'CONFIRMED').length || 0,
    completed: bookings.filter((b: Booking) => b.status === 'COMPLETED').length || 0,
    revenue: bookings
      .filter((b: Booking) => b.status === 'COMPLETED')
      .reduce((sum: number, b: Booking) => sum + (b.totalPrice || 0), 0),
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
          <div>
        <h1 className="text-3xl font-bold text-primary-700 mb-2">Booking Management</h1>
        <p className="text-lg text-secondary-600">Manage your service bookings and customer requests</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/95 rounded-xl border border-primary-200 p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-primary-100 text-primary-500 mr-3">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Total Bookings</p>
              <p className="text-2xl font-bold text-primary-700">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/95 rounded-xl border border-primary-200 p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-warm-100 text-warm-500 mr-3">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Pending</p>
              <p className="text-2xl font-bold text-warm-600">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/95 rounded-xl border border-primary-200 p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-secondary-100 text-secondary-500 mr-3">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Confirmed</p>
              <p className="text-2xl font-bold text-secondary-600">{stats.confirmed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/95 rounded-xl border border-primary-200 p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-accent-100 text-accent-500 mr-3">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Completed</p>
              <p className="text-2xl font-bold text-accent-600">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/95 rounded-xl border border-primary-200 p-4 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium border',
                statusFilter === option.value
                  ? 'bg-primary-100 text-primary-700 border-primary-300'
                  : 'bg-white/80 text-secondary-700 hover:bg-primary-50 border-primary-200'
              )}
            >
              {option.label}
              {option.value !== 'all' && (
                <span className="ml-2 text-xs text-secondary-600">
                  ({bookings.filter((b: Booking) => b.status === option.value).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <ThemedSelect
            value={sortBy}
            onChange={(v: string) => setSortBy(v)}
            options={sortOptions.map((option) => ({ value: option.value, label: option.label }))}
          />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {bookingsLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-secondary-600">Loading bookings...</span>
        </div>
      ) : filteredAndSortedBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredAndSortedBookings.map((booking: Booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              isExpanded={expandedBookings.has(booking.id)}
              onToggleExpand={() => toggleBookingExpansion(booking.id)}
              onUpdateStatus={(status: string, reason?: string) => {
                updateBookingStatusMutation.mutate({
                  id: booking.id,
                  status,
                  reason
                });
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-primary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary-700 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No matching bookings found' : 'No bookings yet'}
          </h3>
          <p className="text-secondary-600 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Bookings will appear here when customers book your services'
            }
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="btn btn-outline border-primary-300 text-primary-600 hover:bg-primary-50"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedBooking && (
        <StatusUpdateModal
          booking={selectedBooking}
          onUpdate={(status, reason) => {
            updateBookingStatusMutation.mutate({ id: selectedBooking.id, status, reason });
          }}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedBooking(null);
          }}
          isUpdating={updateBookingStatusMutation.isPending}
        />
      )}
    </div>
  );
}

// Booking Card Component
function BookingCard({ 
  booking, 
  isExpanded, 
  onToggleExpand, 
  onUpdateStatus 
}: { 
  booking: Booking; 
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdateStatus: (status: string, reason?: string) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-warm-100 text-warm-800';
      case 'CONFIRMED':
        return 'bg-secondary-100 text-secondary-800';
      case 'IN_PROGRESS':
        return 'bg-primary-100 text-primary-800';
      case 'COMPLETED':
        return 'bg-accent-100 text-accent-800';
      case 'CANCELLED':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-primary-50 text-primary-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <XCircle className="w-3 h-3 mr-1" />;
      case 'CONFIRMED':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'IN_PROGRESS':
        return <Eye className="w-3 h-3 mr-1" />;
      case 'COMPLETED':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'CANCELLED':
        return <XCircle className="w-3 h-3 mr-1" />;
      default:
        return <CheckCircle className="w-3 h-3 mr-1" />;
    }
  };

  const getStatusOptions = (currentStatus: string) => {
    const statusFlow = {
      'PENDING': [
        { value: 'CONFIRMED', label: 'Confirm Booking', color: 'btn-primary' },
        { value: 'CANCELLED', label: 'Cancel Booking', color: 'btn-danger' }
      ],
      'CONFIRMED': [
        { value: 'IN_PROGRESS', label: 'Start Service', color: 'btn-primary' },
        { value: 'CANCELLED', label: 'Cancel Booking', color: 'btn-danger' }
      ],
      'IN_PROGRESS': [
        { value: 'COMPLETED', label: 'Mark Complete', color: 'btn-success' }
      ],
      'COMPLETED': [],
      'CANCELLED': []
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || [];
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' });
  };

  const deriveNameFromEmail = (email?: string) => {
    if (!email) return undefined;
    const local = email.split('@')[0] || '';
    const spaced = local.replace(/[._-]+/g, ' ').trim();
    if (!spaced) return undefined;
    return spaced
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const displayCustomerName =
    booking.customer?.name ||
    // allow alternate shapes if backend differs at runtime
    (booking as any)?.customerName ||
    (booking as any)?.customer?.fullName ||
    deriveNameFromEmail(booking.customer?.email || (booking as any)?.customerEmail) ||
    'Customer';

  return (
    <div className="bg-white/95 rounded-xl border border-primary-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-primary-700 mb-1">{booking.service?.name || 'Service'}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(booking.status))}>
                {getStatusIcon(booking.status)}
                {booking.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-secondary-500">
                #{booking.id}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center text-secondary-600">
            <Calendar className="w-4 h-4 mr-2 text-secondary-500" />
            {formatDate(booking.scheduledDateTime)}
          </div>
          <div className="flex items-center text-secondary-600">
            <Clock className="w-4 h-4 mr-2 text-secondary-500" />
            {formatTime(booking.scheduledDateTime)}
          </div>
          <div className="flex items-center text-secondary-600">
            <User className="w-4 h-4 mr-2 text-secondary-500" />
            {displayCustomerName}
          </div>
          <div className="flex items-center text-secondary-600">
            <DollarSign className="w-4 h-4 mr-2 text-secondary-500" />
            {formatCurrency(booking.totalPrice || 0)}
          </div>
        </div>

        <div className="pt-4 border-t border-primary-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {getStatusOptions(booking.status).map((statusOption) => (
                <button
                  key={statusOption.value}
                  onClick={() => onUpdateStatus(statusOption.value)}
                  className={cn(
                    'btn btn-sm flex-shrink-0',
                    statusOption.color === 'btn-primary' ? 'btn-primary gradient-primary text-white' :
                    statusOption.color === 'btn-danger' ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700' :
                    statusOption.color === 'btn-success' ? 'btn-success' : 'btn-outline',
                    statusOption.value === 'CONFIRMED' ? 'mr-2 sm:mr-3' : ''
                  )}
                >
                  {statusOption.label}
                </button>
              ))}
            </div>
            
            <div className="flex-shrink-0">
              <button
                onClick={onToggleExpand}
                className="btn btn-outline btn-sm border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    More
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-primary-200 pt-4 space-y-4">
            {/* Customer Details */}
            <div>
              <h4 className="font-medium text-primary-700 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2 text-secondary-400" />
                Customer Details
              </h4>
              <div className="bg-primary-50 rounded-lg p-3 space-y-1">
                <p className="text-secondary-700">
                  <span className="font-medium">Name:</span> {displayCustomerName}
                </p>
                <p className="text-secondary-700">
                  <span className="font-medium">Email:</span> {booking.customer?.email || (booking as any)?.customerEmail || 'N/A'}
                </p>
                {(booking.customer?.phoneNumber || (booking as any)?.customerPhone) && (
                  <p className="text-secondary-700">
                    <span className="font-medium">Phone:</span> {booking.customer?.phoneNumber || (booking as any)?.customerPhone}
                  </p>
                )}
                {booking.customerAddress && (
                  <p className="text-secondary-700">
                    <span className="font-medium">Address:</span> {booking.customerAddress}
                  </p>
                )}
              </div>
            </div>

            {/* Booking Details */}
            <div>
              <h4 className="font-medium text-primary-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-secondary-400" />
                Booking Details
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-secondary-600">Service:</span>
                  <p className="text-primary-700 font-medium">{booking.service?.name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-secondary-600">Price:</span>
                  <p className="text-primary-700 font-medium">{formatCurrency(booking.totalPrice || 0)}</p>
                </div>
                <div>
                  <span className="text-secondary-600">Duration:</span>
                  <p className="text-secondary-600">{booking.service?.durationMinutes || 0} minutes</p>
                </div>
                <div>
                  <span className="text-secondary-600">Booking ID:</span>
                  <p className="text-secondary-600">#{booking.id}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div>
                <h4 className="font-medium text-primary-700 mb-2">Notes</h4>
                <p className="text-primary-700 bg-primary-50 rounded-lg p-3">{booking.notes}</p>
              </div>
            )}

            {/* Customer Rating */}
            <RatingDisplay bookingId={booking.id} />
          </div>
        )}
      </div>
    </div>
  );
}

// Status Update Modal Component
function StatusUpdateModal({
  booking,
  onUpdate,
  onClose,
  isUpdating
}: {
  booking: Booking;
  onUpdate: (status: string, reason?: string) => void;
  onClose: () => void;
  isUpdating: boolean;
}) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }
    onUpdate(selectedStatus, reason.trim() || undefined);
  };

  const statusOptions = [
    { value: 'CONFIRMED', label: 'Confirm Booking' },
    { value: 'IN_PROGRESS', label: 'Start Service' },
    { value: 'COMPLETED', label: 'Mark as Complete' },
    { value: 'CANCELLED', label: 'Cancel Booking' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white/95 rounded-xl border border-primary-200 p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-primary-700 mb-4">Update Booking Status</h3>
        
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-primary-700">
            <strong>Service:</strong> {booking.service?.name || 'N/A'}
          </p>
          <p className="text-sm text-secondary-600">
            <strong>Customer:</strong> {booking.customer?.name || 'N/A'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              New Status *
            </label>
            <ThemedSelect
              value={selectedStatus}
              onChange={(v: string) => setSelectedStatus(v)}
              options={[{ value: '', label: 'Select new status' }, ...statusOptions.map((o) => ({ value: o.value, label: o.label }))]}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide additional details..."
              className="input w-full h-24"
              maxLength={500}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400 flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || !selectedStatus}
              className="btn btn-primary gradient-primary text-white flex-1"
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 

// Rating Display Component
function RatingDisplay({ bookingId }: { bookingId: number }) {
  const { data: rating, isLoading, error } = useQuery({
    queryKey: ['booking-rating', bookingId],
    queryFn: () => apiClient.getRatingByBooking(bookingId),
    retry: false, // Don't retry on 404 (no rating exists)
  });

  if (isLoading) {
    return (
      <div className="flex items-center text-sm text-secondary-600">
        <div className="loading-spinner w-4 h-4 mr-2"></div>
        Loading rating...
      </div>
    );
  }

  if (error || !rating) {
    return (
      <div className="flex items-center text-sm text-secondary-600">
        <Star className="w-4 h-4 mr-2 text-secondary-400" />
        No customer rating yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-primary-700 flex items-center">
        <Star className="w-4 h-4 mr-2 text-yellow-500" />
        Customer Rating & Review
      </h4>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'w-4 h-4',
                  star <= rating.rating
                    ? 'text-yellow-500 fill-current'
                    : 'text-gray-300'
                )}
              />
            ))}
            <span className="ml-2 font-medium text-primary-700">
              {rating.rating}/5
            </span>
          </div>
          <span className="text-xs text-secondary-600">
            {formatDate(rating.createdAt)}
          </span>
        </div>
        
        {rating.review && (
          <div className="mt-3">
            <p className="text-sm text-secondary-700 italic">"{rating.review}"</p>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-yellow-200">
          <span className="text-xs text-secondary-600">
            by {rating.customer?.fullName || rating.customer?.name || 'Customer'}
          </span>
          {rating.helpfulCount > 0 && (
            <span className="text-xs text-secondary-600">
              {rating.helpfulCount} found this helpful
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 