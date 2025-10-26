import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Star, 
  Clock, 
  DollarSign, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Mail,
  Shield,
  Award,
  ArrowLeft,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../lib/api';
import { useToastNotifications } from '../hooks/useToastNotifications';
import { formatCurrency, formatDate, formatDateTime, formatTime, cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import { CustomerAvailabilityCalendar } from '../components/CustomerAvailabilityCalendar';
import { useAvailabilitySync } from '../hooks/useAvailabilitySync';
import type { Service, Rating, AvailabilitySlot } from '../types';

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const { syncBookingCreated } = useAvailabilitySync();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');
  const { notifyBookingCreated, notifyError } = useToastNotifications();

  const serviceId = parseInt(id || '0');

  const {
    data: service,
    isLoading: serviceLoading,
    error: serviceError
  } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => apiClient.getService(serviceId),
    enabled: !!serviceId,
  });

  const providerId = service?.serviceProvider?.id ?? (service as any)?.serviceProviderId;

  const {
    data: ratings,
    isLoading: ratingsLoading
  } = useQuery({
    queryKey: ['provider-ratings-public', providerId],
    queryFn: async () => {
      if (!providerId) return [] as Rating[];
      const resp = await apiClient.getProviderRatings(providerId, {
        page: 0,
        size: 10,
        reviewsOnly: false,
      });
      return resp.content || [];
    },
    enabled: !!providerId,
  });

  const bookingMutation = useMutation({
    mutationFn: (bookingData: {
      serviceId: number;
      scheduledDateTime: string;
      customerAddress: string;
      notes?: string;
      availabilityId?: number;
    }) => apiClient.createBooking(bookingData),
    onSuccess: (booking, variables) => {
      // This will show both toast and in-app notification
      notifyBookingCreated(booking.id.toString(), service?.name || 'Service');
      setShowBookingForm(false);
      setSelectedSlot(null);
      
      // Use the sync hook to update all availability-related queries
      if (variables.availabilityId && service?.serviceProvider?.id) {
        syncBookingCreated(service.serviceProvider.id, variables.availabilityId);
      } else {
        // Fallback: refresh availability manually
        queryClient.invalidateQueries({ queryKey: ['provider-availability'] });
      }
      
      navigate('/customer/bookings');
    },
    onError: (error: any) => {
      notifyError(error.message || 'Failed to create booking');
    },
  });

  const handleSlotSelect = (slot: AvailabilitySlot | null) => {
    setSelectedSlot(slot);
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      notifyError('Please login to book a service');
      navigate('/login');
      return;
    }

    // Check if user is a service provider trying to book
    if (user.role === 'SERVICE_PROVIDER') {
      notifyError('Please log in as a customer to book services');
      navigate('/login');
      return;
    }

    if (!selectedSlot || !customerAddress) {
      notifyError('Please fill in all required fields');
      return;
    }
    
    bookingMutation.mutate({
      serviceId,
      scheduledDateTime: selectedSlot.startDateTime,
      customerAddress,
      notes: notes || undefined,
      availabilityId: selectedSlot.id, // Include availability ID to mark it as booked
    });
  };

  if (serviceLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-gray-600">Loading service details...</span>
        </div>
      </div>
    );
  }

  if (serviceError || !service) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Service not found</h3>
          <p className="text-gray-600 mb-4">The service you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/services')}
            className="btn btn-primary"
          >
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Service Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-primary-700 mb-2">{service.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full">
                    {service.category}
                  </span>
                  {service.subcategory && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
                      {service.subcategory}
                    </span>
                  )}
                </div>
              </div>
              {((service.serviceProvider?.averageRating || (service as any).providerAverageRating) > 0) && (
                <div className="flex items-center text-lg text-yellow-600">
                  <Star className="w-5 h-5 fill-current mr-1" />
                  {Number(service.serviceProvider?.averageRating || (service as any).providerAverageRating).toFixed(1)}
                  <span className="text-sm text-gray-500 ml-1">
                    ({service.serviceProvider?.totalRatings || (service as any).providerTotalRatings} reviews)
                  </span>
                </div>
              )}
            </div>

            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {service.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Starting Price</p>
                  <p className="font-semibold text-lg">{formatCurrency(service.price)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold">{service.durationMinutes} minutes</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-red-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Service Area</p>
                  <p className="font-semibold">
                    {service.serviceArea || 
                     [service.city, service.district].filter(Boolean).join(', ') || 
                     'Local Area'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Provider Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">Service Provider</h2>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-primary-600">
                  {(service.serviceProvider?.businessName || (service as any).providerBusinessName)?.charAt(0) || 'P'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary-700 mb-1">
                  {service.serviceProvider?.businessName || (service as any).providerBusinessName || 'Service Provider'}
                </h3>
                {(service.serviceProvider?.contactName || (service as any).providerName) && (
                  <p className="text-gray-600 mb-2">
                    Contact: {service.serviceProvider?.contactName || (service as any).providerName}
                  </p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {(service.serviceProvider?.email || (service as any).providerEmail) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 text-blue-600" />
                      <span>{service.serviceProvider?.email || (service as any).providerEmail}</span>
                    </div>
                  )}
                  {(service.serviceProvider?.phoneNumber || (service as any).providerPhone) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-green-600" />
                      <span>{service.serviceProvider?.phoneNumber || (service as any).providerPhone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-6">
                  {((service.serviceProvider?.verificationStatus || (service as any).providerVerificationStatus) === 'VERIFIED') && (
                    <div className="flex items-center text-sm text-green-600">
                      <Shield className="w-4 h-4 mr-1" />
                      <span>Verified Provider</span>
                    </div>
                  )}
                  {(service.serviceProvider?.yearsOfExperience || (service as any).providerYearsOfExperience) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Award className="w-4 h-4 mr-1 text-orange-600" />
                      <span>{service.serviceProvider?.yearsOfExperience || (service as any).providerYearsOfExperience} years experience</span>
                    </div>
                  )}
                  {((service.serviceProvider?.averageRating || (service as any).providerAverageRating) > 0) && (
                    <div className="flex items-center text-sm text-yellow-600">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      <span>
                        {Number(service.serviceProvider?.averageRating || (service as any).providerAverageRating).toFixed(1)}
                        {((service.serviceProvider?.totalRatings || (service as any).providerTotalRatings) > 0) && (
                          <span className="text-gray-500 ml-1">
                            ({service.serviceProvider?.totalRatings || (service as any).providerTotalRatings} reviews)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">Customer Reviews</h2>
            
            {ratingsLoading ? (
              <div className="flex justify-center py-4">
                <div className="loading-spinner"></div>
              </div>
            ) : ratings && ratings.length > 0 ? (
              <div className="space-y-4">
                {ratings.slice(0, 5).map((rating) => (
                  <ReviewCard key={rating.id} rating={rating} />
                ))}
                {ratings.length > 5 && (
                  <button className="text-primary-600 hover:text-primary-700 font-medium">
                    View all {ratings.length} reviews
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No reviews yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Booking */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-primary-700 mb-4">Book This Service</h3>
            
            {/* Show special message for service providers */}
            {isAuthenticated && user?.role === 'SERVICE_PROVIDER' ? (
              <div className="text-center py-8">
                <div className="mb-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(service.price)}
                  </p>
                  <p className="text-sm text-gray-600">Starting price</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 font-medium mb-2">Service Provider Account</p>
                  <p className="text-blue-700 text-sm">
                    You're logged in as a service provider. To book services, please create a customer account or log in with your customer credentials.
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    // Log out first, then navigate to registration
                    useAuthStore.getState().logout();
                    navigate('/register');
                  }}
                  className="btn btn-primary w-full mb-2"
                >
                  Become a Customer
                </button>
                
                <button
                  onClick={() => {
                    // Log out first, then navigate to login
                    useAuthStore.getState().logout();
                    navigate('/login');
                  }}
                  className="btn btn-outline w-full"
                >
                  Login as Customer
                </button>
              </div>
            ) : !showBookingForm ? (
              <div className="text-center">
                <div className="mb-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(service.price)}
                  </p>
                  <p className="text-sm text-gray-600">Starting price</p>
                </div>
                
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                      return;
                    }
                    setShowBookingForm(true);
                  }}
                  className="btn btn-primary w-full mb-3"
                >
                  {isAuthenticated ? 'Check Availability' : 'Login to Book'}
                </button>
                
                <p className="text-xs text-gray-500 text-center">
                  Free cancellation up to 24 hours before service
                </p>
              </div>
            ) : (
              <div>
                <CustomerAvailabilityCalendar
                  service={service}
                  onSlotSelect={handleSlotSelect}
                  selectedSlot={selectedSlot}
                  compact={true}
                />

                {/* Booking Form */}
                {selectedSlot && (
                  <form onSubmit={handleBooking} className="space-y-4 pt-4 border-t border-gray-200 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Address *
                      </label>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Enter your address"
                        className="input w-full"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special instructions or requirements..."
                        rows={3}
                        className="input w-full resize-none"
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSlot(null);
                          setShowBookingForm(false);
                        }}
                        className="btn btn-outline flex-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={bookingMutation.isPending}
                        className="btn btn-primary flex-1"
                      >
                        {bookingMutation.isPending ? 'Booking...' : 'Book Service'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Back to Service Details */}
                {!selectedSlot && (
                  <div className="pt-4">
                    <button
                      onClick={() => setShowBookingForm(false)}
                      className="btn btn-outline w-full"
                    >
                      Back to Service Details
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Review Card Component
function ReviewCard({ rating }: { rating: Rating }) {
  return (
    <div className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-gray-900">{rating.customer.fullName || rating.customer.name || 'Customer'}</h4>
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    i < rating.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {formatDate(rating.createdAt)}
            </span>
          </div>
          {rating.review && (
            <p className="text-gray-700 text-sm">{rating.review}</p>
          )}
        </div>
      </div>
    </div>
  );
} 