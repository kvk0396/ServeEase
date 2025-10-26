import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Calendar, Clock, User, MapPin, CreditCard, AlertCircle } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useToastNotifications } from '../../hooks/useToastNotifications';
import { formatCurrency, formatDate, formatTime, cn } from '../../lib/utils';
import { CustomerAvailabilityCalendar } from '../../components/CustomerAvailabilityCalendar';
import type { Service, AvailabilitySlot } from '../../types';
import { useAvailabilitySync } from '../../hooks/useAvailabilitySync';

export default function BookingPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { syncBookingCreated } = useAvailabilitySync();
  const { notifyBookingCreated, notifyError } = useToastNotifications();

  const [step, setStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch service details
  const {
    data: service,
    isLoading: serviceLoading,
    error: serviceError
  } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => apiClient.getService(parseInt(serviceId!)),
    enabled: !!serviceId,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (bookingData: {
      serviceId: number;
      scheduledDateTime: string;
      customerAddress: string;
      notes?: string;
      customerLatitude?: number;
      customerLongitude?: number;
      availabilityId?: number;
    }) => apiClient.createBooking(bookingData),
    onSuccess: (booking) => {
      // This will show both toast and in-app notification
      notifyBookingCreated(booking.id.toString(), service?.name || 'Service');
      // Sync availability so provider dashboards and customer calendars update
      if (selectedSlot) {
        syncBookingCreated(selectedSlot.provider.id, selectedSlot.id);
      }
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      navigate(`/customer/bookings/${booking.id}`);
    },
    onError: (error: any) => {
      notifyError(error.response?.data?.message || 'Failed to create booking');
    },
  });

  const handleSlotSelect = (slot: AvailabilitySlot | null) => {
    setSelectedSlot(slot);
    if (slot) {
      setStep(3); // Skip to details step since we have the time
    }
  };

  const handleBookingSubmit = () => {
    if (!user) {
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

    if (!selectedSlot || !service || !address.trim()) {
      notifyError('Please fill in all required fields');
      return;
    }

    createBookingMutation.mutate({
      serviceId: service.id,
      scheduledDateTime: selectedSlot.startDateTime,
      customerAddress: address,
      notes: notes || undefined,
      // Add optional location data if available
      customerLatitude: undefined, // Could be populated from geolocation
      customerLongitude: undefined, // Could be populated from geolocation
      availabilityId: selectedSlot.id,
    });
  };

  if (serviceLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (serviceError || !service) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-primary-700 mb-2">Service Not Found</h2>
          <p className="text-gray-600 mb-4">The service you're looking for doesn't exist or has been removed.</p>
          <Link to="/search" className="btn btn-primary">
            Browse Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to={`/services/${serviceId}`}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Service Details
        </Link>
        <h1 className="text-3xl font-bold text-primary-700 mb-2">Book Service</h1>
        <p className="text-lg text-gray-600">Complete your booking for {service.name}</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex items-center justify-between p-6">
          {[
            { step: 1, title: 'Service Info', icon: User },
            { step: 2, title: 'Select Time', icon: Calendar },
            { step: 3, title: 'Details', icon: MapPin },
            { step: 4, title: 'Confirm', icon: CreditCard }
          ].map((stepInfo, index) => (
            <div key={stepInfo.step} className="flex items-center">
              <div className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium border-2',
                step >= stepInfo.step
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-400 border-gray-300'
              )}>
                {step > stepInfo.step ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <stepInfo.icon className="w-5 h-5" />
                )}
              </div>
              <span className={cn(
                'ml-3 text-sm font-medium',
                step >= stepInfo.step ? 'text-primary-600' : 'text-gray-500'
              )}>
                {stepInfo.title}
              </span>
              {index < 3 && (
                <div className={cn(
                  'w-16 h-0.5 mx-6',
                  step > stepInfo.step ? 'bg-primary-600' : 'bg-gray-300'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <ServiceInfoStep 
              service={service} 
              onNext={() => setStep(2)} 
            />
          )}

          {step === 2 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Select Available Time
              </h3>
              <p className="text-gray-600 mb-6">
                Choose from available time slots for {service.name}
              </p>
              
              <CustomerAvailabilityCalendar
                service={service}
                onSlotSelect={handleSlotSelect}
                selectedSlot={selectedSlot}
                compact={false}
              />
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="btn btn-outline"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {step === 3 && selectedSlot && (
            <DetailsStep
              address={address}
              setAddress={setAddress}
              notes={notes}
              setNotes={setNotes}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && selectedSlot && (
            <ConfirmationStep
              service={service}
              selectedSlot={selectedSlot}
              address={address}
              notes={notes}
              isSubmitting={createBookingMutation.isPending}
              onSubmit={handleBookingSubmit}
              onBack={() => setStep(3)}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <BookingSummary 
            service={service} 
            selectedSlot={selectedSlot}
            address={address}
            step={step}
          />
        </div>
      </div>
    </div>
  );
}

// Service Info Step Component
function ServiceInfoStep({ service, onNext }: { service: Service; onNext: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-primary-700 mb-4">Service Information</h3>
      
      <div className="space-y-4">
        <div className="flex items-start space-x-4">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{service.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>Category: {service.category}</span>
              <span>Duration: {service.durationMinutes} min</span>
              <span>Price: {formatCurrency(service.price)}</span>
            </div>
          </div>
        </div>

        {service.serviceProvider && (
          <div className="border-t pt-4">
            <h5 className="font-medium text-gray-900 mb-2">Service Provider</h5>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{service.serviceProvider.businessName}</p>
                <p className="text-sm text-gray-600">{service.serviceProvider.yearsOfExperience} years experience</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-6">
        <button onClick={onNext} className="btn btn-primary">
          Continue to Time Selection
        </button>
      </div>
    </div>
  );
}

// Details Step Component
function DetailsStep({ 
  address, 
  setAddress, 
  notes, 
  setNotes, 
  onNext, 
  onBack 
}: {
  address: string;
  setAddress: (address: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-primary-700 mb-4">Service Details</h3>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Service Address *
          </label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter the full address where the service should be performed..."
            className="input w-full h-24 resize-none"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Provide a detailed address including apartment/unit numbers if applicable
          </p>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions or requirements..."
            className="input w-full h-24 resize-none"
          />
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="btn btn-outline">
          Back
        </button>
        <button 
          onClick={onNext} 
          className="btn btn-primary"
          disabled={!address.trim()}
        >
          Continue to Confirmation
        </button>
      </div>
    </div>
  );
}

// Confirmation Step Component
function ConfirmationStep({ 
  service, 
  selectedSlot, 
  address, 
  notes, 
  isSubmitting, 
  onSubmit, 
  onBack 
}: {
  service: Service;
  selectedSlot: AvailabilitySlot;
  address: string;
  notes: string;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-primary-700 mb-4">Confirm Your Booking</h3>
      
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Service Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Provider:</span>
              <span className="font-medium">{selectedSlot.provider.businessName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time:</span>
              <span className="font-medium">
                {formatDate(selectedSlot.startDateTime)} at {formatTime(selectedSlot.startDateTime)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{selectedSlot.durationMinutes} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price:</span>
              <span className="font-medium">{formatCurrency(service.price)}</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Service Location</h4>
          <p className="text-sm text-gray-600">{address}</p>
        </div>

        {notes && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Additional Notes</h4>
            <p className="text-sm text-gray-600">{notes}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Booking Terms</p>
              <p className="text-blue-700">
                By confirming this booking, you agree to our terms of service. 
                You can cancel or reschedule up to 24 hours before the appointment.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="btn btn-outline" disabled={isSubmitting}>
          Back
        </button>
        <button 
          onClick={onSubmit} 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}

// Booking Summary Sidebar Component
function BookingSummary({ 
  service, 
  selectedSlot, 
  address, 
  step 
}: {
  service: Service;
  selectedSlot: AvailabilitySlot | null;
  address: string;
  step: number;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h3 className="text-lg font-medium text-primary-700 mb-4">Booking Summary</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900">{service.name}</h4>
          <p className="text-sm text-gray-600">{service.category}</p>
        </div>

        {selectedSlot && (
          <div className="border-t pt-4">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(selectedSlot.startDateTime)}
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Clock className="w-4 h-4 mr-2" />
              {formatTime(selectedSlot.startDateTime)} - {formatTime(selectedSlot.endDateTime)}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-2" />
              {selectedSlot.provider.businessName}
            </div>
          </div>
        )}

        {address && step >= 3 && (
          <div className="border-t pt-4">
            <div className="flex items-start text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 mt-0.5" />
              <span>{address}</span>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-medium">
            <span>Total:</span>
            <span>{formatCurrency(service.price)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 