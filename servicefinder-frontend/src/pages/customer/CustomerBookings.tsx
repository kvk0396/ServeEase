import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Star,
  Filter,
  Search,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

import { apiClient } from '../../lib/api';
import { formatCurrency, formatDateTime, cn } from '../../lib/utils';
import type { Booking, BookingStatus } from '../../types';
import BackButton from '../../components/BackButton';

const statusFilters = [
  { value: 'all', label: 'All Bookings', color: 'text-gray-600' },
  { value: 'PENDING', label: 'Pending', color: 'text-yellow-600' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'text-blue-600' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'text-purple-600' },
  { value: 'COMPLETED', label: 'Completed', color: 'text-green-600' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'text-red-600' },
];

export default function CustomerBookings() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const queryClient = useQueryClient();

  const {
    data: bookingsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['customer-bookings', statusFilter],
    queryFn: () => apiClient.getCustomerBookings({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      size: 50
    }),
  });

  const cancelBookingMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      apiClient.cancelBooking(id, reason),
    onSuccess: () => {
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancellationReason('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    },
  });

  const bookings = bookingsData?.content || [];
  const filteredBookings = bookings.filter(booking =>
    booking.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.serviceProvider?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCancelBooking = () => {
    if (selectedBooking && cancellationReason.trim()) {
      cancelBookingMutation.mutate({
        id: selectedBooking.id,
        reason: cancellationReason.trim()
      });
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'CONFIRMED':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-purple-500" />;
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load bookings</h3>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
          <div>
        <h1 className="text-3xl font-bold text-primary-700 mb-2">My Bookings</h1>
        <p className="text-lg text-black">Manage your service bookings</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/95 rounded-xl border border-primary-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium border',
                  statusFilter === filter.value
                    ? 'bg-primary-100 text-primary-700 border-primary-300'
                    : 'bg-white/80 text-secondary-700 hover:bg-primary-50 border-primary-200'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full text-primary-700"
            />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-secondary-600">Loading bookings...</span>
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={(booking) => {
                setSelectedBooking(booking);
                setShowCancelModal(true);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-primary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary-700 mb-2">
            {statusFilter === 'all' ? 'No bookings found' : `No ${statusFilter.toLowerCase()} bookings`}
          </h3>
          <p className="text-secondary-600 mb-6">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Start by booking your first service'
            }
          </p>
          {!searchTerm && (
            <Link to="/search" className="btn btn-primary gradient-primary text-white">
              Browse Services
            </Link>
          )}
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 rounded-xl border border-primary-200 max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-primary-700 mb-4">
              Cancel Booking
            </h3>
            <p className="text-secondary-600 mb-4">
              Are you sure you want to cancel this booking for "{selectedBooking.service?.name}"?
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Reason for cancellation *
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                className="input w-full h-20"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                  setCancellationReason('');
                }}
                className="btn btn-outline flex-1 border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={!cancellationReason.trim() || cancelBookingMutation.isPending}
                className="btn btn-primary flex-1"
              >
                {cancelBookingMutation.isPending ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Booking Card Component
function BookingCard({ 
  booking, 
  onCancel 
}: { 
  booking: Booking; 
  onCancel: (booking: Booking) => void;
}) {
  const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  const canRate = booking.status === 'COMPLETED';

  return (
    <div className="bg-white/95 rounded-xl border border-primary-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold text-primary-700 mr-3">
              {booking.service?.name || 'Service Booking'}
            </h3>
            <span className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              getStatusColor(booking.status)
            )}>
              {booking.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-secondary-600 mb-3">
            {booking.serviceProvider?.businessName || 'Service Provider'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-secondary-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="font-medium">Scheduled:</span>
            <span className="ml-1">{formatDateTime(booking.scheduledDateTime)}</span>
          </div>
          
          {booking.estimatedEndDateTime && (
            <div className="flex items-center text-sm text-secondary-600">
              <Clock className="w-4 h-4 mr-2" />
              <span className="font-medium">Estimated End:</span>
              <span className="ml-1">{formatDateTime(booking.estimatedEndDateTime)}</span>
            </div>
          )}

          <div className="flex items-center text-sm text-secondary-600">
            <DollarSign className="w-4 h-4 mr-2" />
            <span className="font-medium">Total Price:</span>
            <span className="ml-1 font-semibold text-accent-600">
              {formatCurrency(booking.totalPrice)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {booking.customerAddress && (
            <div className="flex items-start text-sm text-secondary-600">
              <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Service Address:</span>
                <p className="mt-1">{booking.customerAddress}</p>
              </div>
            </div>
          )}

          {booking.serviceProvider && (
            <div className="space-y-1">
              <div className="flex items-center text-sm text-secondary-600">
                <Phone className="w-4 h-4 mr-2" />
                <span>{booking.serviceProvider.phoneNumber}</span>
              </div>
              <div className="flex items-center text-sm text-secondary-600">
                <Mail className="w-4 h-4 mr-2" />
                <span>{booking.serviceProvider.email}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {booking.notes && (
        <div className="mb-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
          <div className="flex items-start">
            <MessageSquare className="w-4 h-4 mr-2 mt-0.5 text-secondary-500" />
            <div>
              <span className="text-sm font-medium text-primary-700">Notes:</span>
              <p className="text-sm text-secondary-700 mt-1">{booking.notes}</p>
            </div>
          </div>
        </div>
      )}

      {booking.cancellationReason && (
        <div className="mb-4 p-3 bg-error-50 rounded-lg border border-error-200">
          <div className="flex items-start">
            <XCircle className="w-4 h-4 mr-2 mt-0.5 text-error-500" />
            <div>
              <span className="text-sm font-medium text-error-700">Cancellation Reason:</span>
              <p className="text-sm text-error-600 mt-1">{booking.cancellationReason}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-primary-200">
        <div className="text-sm text-secondary-600">
          Booking ID: #{booking.id}
        </div>
        
        <div className="flex items-center space-x-2">
          <Link
            to={`/services/${booking.service?.id}`}
            className="btn btn-outline btn-sm border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Service
          </Link>
          
          {canRate && (
            <Link
              to={`/customer/ratings?bookingId=${booking.id}`}
              className="btn btn-primary btn-sm gradient-primary text-white"
            >
              <Star className="w-4 h-4 mr-1" />
              Rate Service
            </Link>
          )}
          
          {canCancel && (
            <button
              onClick={() => onCancel(booking)}
              className="btn btn-primary btn-sm"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: BookingStatus): string {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800';
    case 'IN_PROGRESS':
      return 'bg-purple-100 text-purple-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
} 