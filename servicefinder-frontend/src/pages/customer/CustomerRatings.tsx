import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Star,
  Search,
  Filter,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  MessageSquare
} from 'lucide-react';
import ThemedSelect from '../../components/ThemedSelect';
import { apiClient } from '../../lib/api';
import { useToastNotifications } from '../../hooks/useToastNotifications';
import { formatDate, formatDateTime, cn } from '../../lib/utils';
import type { Rating, Booking } from '../../types';
import BackButton from '../../components/BackButton';

const filterOptions = [
  { value: 'all', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star' },
];

export default function CustomerRatings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRating, setEditingRating] = useState<Rating | null>(null);
  const queryClient = useQueryClient();
  const { notifyRatingCreated, notifySuccess, notifyError } = useToastNotifications();

  // Get bookingId from URL params for direct rating creation
  const bookingIdFromParams = searchParams.get('bookingId');

  const {
    data: ratingsData,
    isLoading: ratingsLoading
  } = useQuery({
    queryKey: ['customer-ratings', ratingFilter],
    queryFn: () => apiClient.getCustomerRatings({
      size: 50
    }),
  });

  const {
    data: completedBookings,
    isLoading: bookingsLoading
  } = useQuery({
    queryKey: ['completed-bookings'],
    queryFn: () => apiClient.getCustomerBookings({
      status: 'COMPLETED',
      size: 50
    }),
    enabled: showCreateForm || !!bookingIdFromParams,
  });

  const createRatingMutation = useMutation({
    mutationFn: (data: any) => apiClient.createRating(data),
    onSuccess: (rating, variables) => {
      // This will show both toast and in-app notification
      const serviceName = variables.serviceName || 'Service';
      notifyRatingCreated(rating.id.toString(), serviceName, variables.rating);
      queryClient.invalidateQueries({ queryKey: ['customer-ratings'] });
      setShowCreateForm(false);
      // Clear bookingId from URL
      setSearchParams({});
    },
    onError: (error: any) => {
      notifyError(error.response?.data?.message || 'Failed to submit rating');
    },
  });

  const updateRatingMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiClient.updateRating(id, data),
    onSuccess: () => {
      notifySuccess('Rating updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['customer-ratings'] });
      setEditingRating(null);
    },
    onError: (error: any) => {
      notifyError(error.response?.data?.message || 'Failed to update rating');
    },
  });

  const deleteRatingMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteRating(id),
    onSuccess: () => {
      notifySuccess('Rating deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['customer-ratings'] });
    },
    onError: (error: any) => {
      notifyError(error.response?.data?.message || 'Failed to delete rating');
    },
  });

  const ratings = ratingsData?.content || [];
  const filteredRatings = ratings.filter((rating: Rating) => {
    const matchesSearch = rating.booking?.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rating.serviceProvider?.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || rating.rating.toString() === ratingFilter;
    return matchesSearch && matchesRating;
  });

  // Find unrated completed bookings
  const unratedBookings = completedBookings?.content?.filter((booking: Booking) => 
    !ratings.some((rating: Rating) => rating.booking?.id === booking.id)
  ) || [];

  // Auto-show create form if bookingId in URL
  useState(() => {
    if (bookingIdFromParams && !showCreateForm) {
      setShowCreateForm(true);
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-primary-700 mb-4">My Ratings & Reviews</h1>
            <p className="text-lg text-gray-600">Rate your completed service experiences</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Rating
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setRatingFilter(option.value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  ratingFilter === option.value
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search ratings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>
      </div>

      {/* Ratings List */}
      {ratingsLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-gray-600">Loading ratings...</span>
        </div>
      ) : filteredRatings.length > 0 ? (
        <div className="space-y-4">
          {filteredRatings.map((rating: Rating) => (
            <RatingCard
              key={rating.id}
              rating={rating}
              onEdit={setEditingRating}
              onDelete={(id) => deleteRatingMutation.mutate(id)}
              isDeleting={deleteRatingMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ratings found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || ratingFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Start rating your completed services'
            }
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            Rate Your First Service
          </button>
        </div>
      )}

      {/* Create Rating Modal */}
      {showCreateForm && (
        <CreateRatingModal
          bookings={unratedBookings}
          selectedBookingId={bookingIdFromParams ? parseInt(bookingIdFromParams) : undefined}
          onSubmit={(data) => createRatingMutation.mutate(data)}
          onClose={() => {
            setShowCreateForm(false);
            setSearchParams({});
          }}
          isSubmitting={createRatingMutation.isPending}
          onError={notifyError}
        />
      )}

      {/* Edit Rating Modal */}
      {editingRating && (
        <EditRatingModal
          rating={editingRating}
          onSubmit={(data) => updateRatingMutation.mutate({ id: editingRating.id, data })}
          onClose={() => setEditingRating(null)}
          isSubmitting={updateRatingMutation.isPending}
        />
      )}
    </div>
  );
}

// Rating Card Component
function RatingCard({ 
  rating, 
  onEdit, 
  onDelete, 
  isDeleting 
}: { 
  rating: Rating; 
  onEdit: (rating: Rating) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className="flex items-center mr-4">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-5 h-5',
                    i < rating.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {rating.rating}/5
            </span>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {rating.booking?.serviceName || 'Service'}
          </h3>
          <p className="text-gray-600 mb-2">
            {rating.serviceProvider?.businessName || 'Service Provider'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(rating)}
            className="btn btn-outline btn-sm"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </button>
          <button
            onClick={() => onDelete(rating.id)}
            disabled={isDeleting}
            className="btn btn-danger btn-sm"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </button>
        </div>
      </div>

      {rating.review && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start">
            <MessageSquare className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
            <p className="text-gray-700">{rating.review}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-200 pt-4">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          Service Date: {formatDate(rating.booking?.scheduledDateTime || '')}
        </div>
        <div>
          Rated on {formatDate(rating.createdAt)}
        </div>
      </div>
    </div>
  );
}

// Create Rating Modal Component
function CreateRatingModal({
  bookings,
  selectedBookingId,
  onSubmit,
  onClose,
  isSubmitting,
  onError
}: {
  bookings: Booking[];
  selectedBookingId?: number;
  onSubmit: (data: any) => void;
  onClose: () => void;
  isSubmitting: boolean;
  onError: (message: string) => void;
}) {
  const [selectedBooking, setSelectedBooking] = useState<number>(selectedBookingId || 0);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) {
      onError('Please select a booking to rate');
      return;
    }

    onSubmit({
      bookingId: selectedBooking,
      rating,
      review: review.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
                  <h3 className="text-lg font-semibold text-primary-700 mb-4">Rate Your Service</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Service *
            </label>
            <ThemedSelect
              value={String(selectedBooking)}
              onChange={(v: string) => setSelectedBooking(parseInt(v))}
              options={[{ value: '0', label: 'Choose a completed service...' }, ...bookings.map((b) => ({ value: String(b.id), label: `${b.service?.name} - ${b.serviceProvider?.businessName}` }))]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className="focus:outline-none"
                >
                  <Star
                    className={cn(
                      'w-8 h-8 transition-colors',
                      i < rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 hover:text-yellow-300'
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with this service..."
              className="input w-full h-24"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{review.length}/500 characters</p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedBooking}
              className="btn btn-primary flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Rating Modal Component
function EditRatingModal({
  rating,
  onSubmit,
  onClose,
  isSubmitting
}: {
  rating: Rating;
  onSubmit: (data: any) => void;
  onClose: () => void;
  isSubmitting: boolean;
}) {
  const [newRating, setNewRating] = useState(rating.rating);
  const [review, setReview] = useState(rating.review || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      rating: newRating,
      review: review.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
                  <h3 className="text-lg font-semibold text-primary-700 mb-4">Edit Your Rating</h3>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-900">{rating.booking?.serviceName}</p>
          <p className="text-sm text-gray-600">{rating.serviceProvider?.businessName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setNewRating(i + 1)}
                  className="focus:outline-none"
                >
                  <Star
                    className={cn(
                      'w-8 h-8 transition-colors',
                      i < newRating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 hover:text-yellow-300'
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">({newRating}/5)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with this service..."
              className="input w-full h-24"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{review.length}/500 characters</p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex-1"
            >
              {isSubmitting ? 'Updating...' : 'Update Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 