
import axios, { type AxiosInstance } from 'axios';
import type {
  AuthRequest,
  AuthResponse,
  RegisterRequest,
  Service,
  ServiceCreateRequest,
  Booking,
  BookingCreateRequest,
  Rating,
  RatingCreateRequest,
  LocationSearchRequest,
  LocationSearchResponse,
  PaginatedResponse,
  ChatRequest,
  ChatResponse,
} from '../types';

// Use environment variable or fallback to localhost
// For network access, set VITE_API_URL=http://YOUR_IP:8080/api in .env file
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (import.meta.env.DEV) console.log('API Request:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
      });
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (import.meta.env.DEV) console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async register(data: RegisterRequest) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async login(data: AuthRequest): Promise<AuthResponse> {
    const response = await this.client.post('/auth/login', data);
    return response.data;
  }

  async validateToken(): Promise<AuthResponse> {
    const response = await this.client.get('/auth/validate');
    return response.data;
  }

  // User profile endpoints
  async getUserProfile(): Promise<any> {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  async updateUserProfile(data: any): Promise<any> {
    const response = await this.client.put('/auth/profile', data);
    return response.data;
  }

  // Service endpoints
  async getServices(params?: {
    category?: string;
    subcategory?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Service[]> {
    const response = await this.client.get('/services', { params });
    return response.data;
  }

  async getService(id: number): Promise<Service> {
    const response = await this.client.get(`/services/${id}`);
    return response.data;
  }

  async createService(data: ServiceCreateRequest): Promise<Service> {
    const response = await this.client.post('/services', data);
    return response.data;
  }

  async updateService(id: number, data: Partial<ServiceCreateRequest> & { active?: boolean; serviceArea?: string }): Promise<Service> {
    const response = await this.client.put(`/services/${id}`, data);
    return response.data;
  }

  async deleteService(id: number): Promise<void> {
    await this.client.delete(`/services/${id}`);
  }

  async getMyServices(): Promise<Service[]> {
    const response = await this.client.get('/services/my-services');
    return response.data;
  }

  async getCategories(): Promise<string[]> {
    const response = await this.client.get('/services/categories');
    return response.data;
  }

  async getServiceCategories(): Promise<string[]> {
    const response = await this.client.get('/services/categories');
    return response.data;
  }

  async getSubcategories(category: string): Promise<string[]> {
    const response = await this.client.get('/services/subcategories', {
      params: { category },
    });
    return response.data;
  }

  async searchServicesByLocation(params: {
    latitude: number;
    longitude: number;
    radiusKm?: number;
  }): Promise<Service[]> {
    const response = await this.client.get('/services/search/location', { params });
    return response.data;
  }

  // Booking endpoints
  async createBooking(data: {
    serviceId: number;
    scheduledDateTime: string;
    customerAddress: string;
    notes?: string;
    customerLatitude?: number;
    customerLongitude?: number;
    availabilityId?: number; // Optional availability slot to mark as booked
  }) {
    try {
      const response = await this.client.post('/bookings', data);
      
      // If an availability slot was specified, mark it as booked
      if (data.availabilityId) {
        try {
          await this.markAvailabilityAsBooked(data.availabilityId);
        } catch (error) {
          console.warn('Failed to mark availability as booked:', error);
          // Don't fail the booking creation if availability update fails
        }
      }
      
      return response.data;
    } catch (error: any) {
      // Enhanced error handling for booking creation
      if (error.response?.status === 409) {
        throw new Error('This time slot is no longer available. Please select another time.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid booking data. Please check your information.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to book this service.');
      }
      throw error;
    }
  }

  async getBooking(id: number): Promise<Booking> {
    const response = await this.client.get(`/bookings/${id}`);
    return response.data;
  }

  async getMyBookings(params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<PaginatedResponse<Booking>> {
    const response = await this.client.get('/bookings/my-bookings', { params });
    return response.data;
  }

  async getProviderBookings(params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<PaginatedResponse<Booking>> {
    const response = await this.client.get('/bookings/provider-bookings', { params });
    return response.data;
  }

  async getUpcomingBookings(): Promise<Booking[]> {
    const response = await this.client.get('/bookings/upcoming');
    return response.data;
  }

  async updateBooking(id: number, data: any): Promise<Booking> {
    const response = await this.client.put(`/bookings/${id}`, data);
    return response.data;
  }

  async confirmBooking(id: number): Promise<Booking> {
    const response = await this.client.post(`/bookings/${id}/confirm`);
    return response.data;
  }

  async startService(id: number): Promise<Booking> {
    const response = await this.client.post(`/bookings/${id}/start`);
    return response.data;
  }

  async completeService(id: number): Promise<Booking> {
    const response = await this.client.post(`/bookings/${id}/complete`);
    return response.data;
  }

  async cancelBooking(id: number, reason: string): Promise<Booking> {
    const response = await this.client.post(`/bookings/${id}/cancel`, null, {
      params: { reason },
    });
    return response.data;
  }

  async updateBookingStatus(id: number, data: { status: string; reason?: string }): Promise<void> {
    await this.client.put(`/bookings/${id}/status`, data);
  }

  // Rating endpoints
  async createRating(data: RatingCreateRequest): Promise<Rating> {
    const response = await this.client.post('/ratings', data);
    return response.data;
  }

  async getRating(id: number): Promise<Rating> {
    const response = await this.client.get(`/ratings/${id}`);
    return response.data;
  }

  async getMyRatings(params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Rating>> {
    const response = await this.client.get('/ratings/my-ratings', { params });
    return response.data;
  }

  async getProviderRatings(
    providerId: number,
    params?: {
      page?: number;
      size?: number;
      reviewsOnly?: boolean;
      minRating?: number;
      maxRating?: number;
    }
  ): Promise<PaginatedResponse<Rating>> {
    const response = await this.client.get(`/ratings/provider/${providerId}`, { params });
    return response.data;
  }

  async getMyProviderRatings(
    params?: {
      page?: number;
      size?: number;
      reviewsOnly?: boolean;
    }
  ): Promise<PaginatedResponse<Rating>> {
    const response = await this.client.get('/ratings/provider-ratings', { params });
    return response.data;
  }

  async updateRating(id: number, data: { rating?: number; review?: string }): Promise<Rating> {
    const response = await this.client.put(`/ratings/${id}`, data);
    return response.data;
  }

  async deleteRating(id: number): Promise<void> {
    await this.client.delete(`/ratings/${id}`);
  }

  async markReviewHelpful(id: number): Promise<Rating> {
    const response = await this.client.post(`/ratings/${id}/helpful`);
    return response.data;
  }

  async getProviderRatingStats(providerId: number) {
    const response = await this.client.get(`/ratings/provider/${providerId}/stats`);
    return response.data;
  }

  async searchReviews(providerId: number, keyword: string): Promise<Rating[]> {
    const response = await this.client.get(`/ratings/provider/${providerId}/search`, {
      params: { keyword },
    });
    return response.data;
  }

  async getServiceRatings(serviceId: number): Promise<Rating[]> {
    const response = await this.client.get(`/ratings/service/${serviceId}`);
    return response.data;
  }

  async getRatingByBooking(bookingId: number): Promise<Rating | null> {
    try {
      const response = await this.client.get(`/ratings/booking/${bookingId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No rating exists for this booking
      }
      throw error;
    }
  }

  async getCustomerBookings(params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<PaginatedResponse<Booking>> {
    const response = await this.client.get('/bookings/customer', { params });
    return response.data;
  }

  async getCustomerRatings(params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Rating>> {
    const response = await this.client.get('/ratings/customer', { params });
    return response.data;
  }

  // Geolocation search endpoints
  async searchByLocation(data: LocationSearchRequest): Promise<LocationSearchResponse> {
    const response = await this.client.post('/search/location', data);
    return response.data;
  }

  async findAvailableProviders(params: {
    latitude: number;
    longitude: number;
    minRating?: number;
    category?: string;
    limit?: number;
  }): Promise<LocationSearchResponse> {
    const response = await this.client.get('/search/available', { params });
    return response.data;
  }

  async calculateDistance(params: {
    lat1: number;
    lon1: number;
    lat2: number;
    lon2: number;
  }) {
    const response = await this.client.get('/search/distance', { params });
    return response.data;
  }

  // ===== AVAILABILITY MANAGEMENT =====
  
  // Search available slots with comprehensive filters
  async searchAvailability(searchRequest: {
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
  }) {
    const response = await this.client.post('/availability/search', searchRequest);
    return response.data;
  }

  // Get availability for a specific provider
  async getProviderAvailability(
    providerId: number,
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ) {
    const response = await this.client.get(`/availability/provider/${providerId}`, { params });
    return response.data;
  }

  // Get current provider's availability (for provider dashboard)
  async getMyAvailability(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    // Use the endpoint that returns both available and booked slots for accurate stats
    const response = await this.client.get('/availability/my-availability/all', { params });
    return response.data;
  }

  // Quick availability search for customers
  async quickAvailabilitySearch(params: {
    serviceType?: string;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    durationMinutes?: number;
    daysAhead?: number;
    limit?: number;
  }) {
    const response = await this.client.get('/availability/search/quick', { params });
    return response.data;
  }

  // Get providers available today
  async getProvidersAvailableToday(params?: {
    serviceType?: string;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
  }) {
    const response = await this.client.get('/availability/providers/available-today', { params });
    return response.data;
  }

  // Create availability slot (for providers)
  async createAvailability(data: {
    startDateTime: string; // ISO format: "2025-01-15T09:00:00"
    endDateTime: string;   // ISO format: "2025-01-15T17:00:00"
    isRecurring?: boolean;
    dayOfWeek?: string;    // For recurring: "MONDAY", "TUESDAY", etc.
    recurringStartTime?: string; // For recurring: "09:00:00"
    recurringEndTime?: string;   // For recurring: "17:00:00"
    notes?: string;
  }) {
    if (import.meta.env.DEV) console.log('API createAvailability called with data:', data);
    
    // Extract date information for debugging
    const startDate = new Date(data.startDateTime);
    const debugInfo = {
      inputData: data,
      parsedStartDate: startDate.toISOString(),
      localStartDate: startDate.toLocaleString(),
      dayOfWeek: startDate.toLocaleDateString('en-US', { weekday: 'long' }),
      month: startDate.toLocaleDateString('en-US', { month: 'long' }),
      day: startDate.getDate(),
      isWeekend: startDate.getDay() === 0 || startDate.getDay() === 6
    };
    
    if (import.meta.env.DEV) console.log('API Debug Info:', debugInfo);
    
    // Validate the datetime format before sending
    try {
      const endDate = new Date(data.endDateTime);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid datetime format');
      }
      
      if (import.meta.env.DEV) console.log('Parsed dates:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startDateLocal: startDate.toLocaleString(),
        endDateLocal: endDate.toLocaleString()
      });
      
    } catch (error) {
      if (import.meta.env.DEV) console.error('Date validation error:', error);
      throw new Error('Invalid date format provided');
    }
    
    try {
      const response = await this.client.post('/availability/create', data);
      if (import.meta.env.DEV) console.log('API createAvailability SUCCESS for date:', debugInfo.day, debugInfo.month);
      if (import.meta.env.DEV) console.log('API createAvailability response:', response.data);
      return response.data;
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('API createAvailability FAILED for date:', debugInfo.day, debugInfo.month);
      if (import.meta.env.DEV) console.error('Failed request data:', debugInfo);
      if (import.meta.env.DEV) console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  // Create bulk availability (for providers setting up weekly schedules)
  async createBulkAvailability(data: {
    startDate: string;
    endDate: string;
    selectedDays: string[]; // ["Monday", "Tuesday", etc.]
    timeSlots: Array<{ startTime: string; endTime: string }>;
    notes?: string;
  }) {
    const response = await this.client.post('/availability/bulk-create', data);
    return response.data;
  }

  // Delete availability slot
  async deleteAvailability(availabilityId: number) {
    const response = await this.client.delete(`/availability/${availabilityId}`);
    return response.data;
  }

  // Mark availability slot as booked (used when creating bookings)
  async markAvailabilityAsBooked(availabilityId: number) {
    const response = await this.client.post(`/availability/${availabilityId}/book`);
    return response.data;
  }

  // Mark availability slot as available (used when canceling bookings)
  async markAvailabilityAsAvailable(availabilityId: number) {
    const response = await this.client.post(`/availability/${availabilityId}/unbook`);
    return response.data;
  }

  // Chat API
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.client.post('/chat/send', request);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient; 
