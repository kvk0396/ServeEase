export type Role = 'CUSTOMER' | 'SERVICE_PROVIDER' | 'ADMIN';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  role: Role;
  active: boolean;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceProvider {
  id: number;
  businessName: string;
  description: string;
  averageRating: number;
  totalRatings: number;
  yearsOfExperience: number;
  verificationStatus: VerificationStatus;
  available: boolean;
  serviceRadiusKm?: number;
  user: User;
  services: Service[];
}

export interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  durationMinutes: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  serviceArea?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  serviceRadiusKm?: number;
  serviceProvider: {
    id: number;
    businessName: string;
    contactName: string;
    email: string;
    phoneNumber: string;
    averageRating: number;
    totalRatings: number;
    yearsOfExperience: number;
    verificationStatus: VerificationStatus;
  };
}

export interface Booking {
  id: number;
  scheduledDateTime: string;
  estimatedEndDateTime: string;
  actualStartDateTime?: string;
  actualEndDateTime?: string;
  status: BookingStatus;
  totalPrice: number;
  notes?: string;
  customerAddress: string;
  customerLatitude: number;
  customerLongitude: number;
  cancellationReason?: string;
  cancelledBy?: string;
  cancellationDateTime?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
  };
  serviceProvider: {
    id: number;
    businessName: string;
    contactName: string;
    email: string;
    phoneNumber: string;
    averageRating: number;
  };
  service: {
    id: number;
    name: string;
    category: string;
    subcategory: string;
    price: number;
    durationMinutes: number;
  };
}

export interface Rating {
  id: number;
  rating: number;
  review?: string;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: number;
    name: string;
    fullName?: string; // Backend sends fullName
    email: string;
  };
  serviceProvider: {
    id: number;
    businessName: string;
    contactName: string;
    averageRating: number;
  };
  booking: {
    id: number;
    serviceName: string;
    scheduledDateTime: string;
    status: string;
  };
}

// API Request/Response Types
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: Role;
  userId: number;
  fullName: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  userType: 'CUSTOMER' | 'SERVICE_PROVIDER';
  businessName?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ServiceCreateRequest {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  durationMinutes: number;
  serviceArea: string; // City, District
  city: string;
  district: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  serviceRadiusKm?: number;
}

export interface BookingCreateRequest {
  serviceId: number;
  scheduledDateTime: string;
  notes?: string;
  customerAddress: string;
  customerLatitude: number;
  customerLongitude: number;
}

export interface RatingCreateRequest {
  bookingId: number;
  rating: number;
  review?: string;
}

export interface LocationSearchRequest {
  latitude: number;
  longitude: number;
  radiusKm: number;
  minRating?: number;
  category?: string;
  subcategory?: string;
  maxPrice?: number;
  limit?: number;
  sortByDistance?: boolean;
}

export interface LocationSearchResponse {
  metadata: {
    totalResults: number;
    searchLatitude: number;
    searchLongitude: number;
    searchRadiusKm: number;
    sortedByDistance: boolean;
    minDistance?: number;
    maxDistance?: number;
  };
  providers: ServiceProviderLocationInfo[];
}

export interface ServiceProviderLocationInfo {
  id: number;
  businessName: string;
  description: string;
  averageRating: number;
  totalRatings: number;
  yearsOfExperience: number;
  verificationStatus: string;
  distance: number;
  serviceRadiusKm: number;
  location: {
    city: string;
    state: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  contact: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  services: {
    id: number;
    name: string;
    category: string;
    subcategory: string;
    price: number;
    durationMinutes: number;
  }[];
}

// UI State Types
export interface SearchFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Availability Types (matching backend DTOs)
export interface AvailabilitySlot {
  id: number;
  startDateTime: string; // ISO format
  endDateTime: string;   // ISO format
  durationMinutes: number;
  isBooked: boolean;
  isRecurring: boolean;
  dayOfWeek?: string; // "MONDAY", "TUESDAY", etc.
  recurringStartTime?: string; // "09:00:00"
  recurringEndTime?: string;   // "17:00:00"
  notes?: string;
  distance?: number; // Distance in km from search location
  createdAt: string;
  provider: {
    id: number;
    businessName: string;
    fullName: string;
    phoneNumber: string;
    averageRating: number;
    yearsOfExperience: number;
    verificationStatus: string;
  };
  availableServices: Array<{
    id: number;
    name: string;
    category: string;
    price: string;
    durationMinutes: number;
  }>;
}

export interface AvailabilitySearchRequest {
  serviceType?: string;
  startDate: string;
  endDate: string;
  durationMinutes?: number;
  preferredStartTime?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  providerId?: number;
  limit?: number;
  sortByTime?: boolean;
}

export interface AvailabilityCreateRequest {
  startDateTime: string;
  endDateTime: string;
  isRecurring?: boolean;
  dayOfWeek?: string;
  recurringStartTime?: string;
  recurringEndTime?: string;
  notes?: string;
}

// Enhanced types for better UX
export interface TimeSlot {
  time: string; // "09:00"
  available: boolean;
  availabilityId?: number;
  conflictReason?: string;
}

export interface DayAvailability {
  date: string; // "2025-01-15"
  dayName: string; // "Monday"
  timeSlots: TimeSlot[];
  hasAvailability: boolean;
} 

export interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  timestamp: string;
  success: boolean;
  error?: string;
} 