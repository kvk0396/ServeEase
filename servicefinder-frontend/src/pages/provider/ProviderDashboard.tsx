import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar,
  Star,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  Plus,
  Settings,
  BarChart3,
  CheckCircle,
  AlertCircle,
  XCircle,
  MapPin
} from 'lucide-react';

import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

import { formatCurrency, formatDate, formatDateTime, cn } from '../../lib/utils';
import type { Booking, Service } from '../../types';

const quickActions = [
  {
    title: 'Add Service',
    description: 'Create a new service offering',
    icon: Plus,
    href: '/provider/services',
    color: 'gradient-primary',
  },
  {
    title: 'Manage Bookings',
    description: 'View and update bookings',
    icon: Calendar,
    href: '/provider/bookings',
    color: 'gradient-secondary',
  },
  {
    title: 'Set Availability',
    description: 'Manage your schedule',
    icon: Clock,
    href: '/provider/availability',
    color: 'gradient-accent',
  },
];

// Recent Service Card Component - Designed similar to search page service cards
function RecentServiceCard({ service }: { service: Service }) {
  const area = (service.serviceArea && service.serviceArea.trim())
    || [service.city, service.district].filter(Boolean).join(', ')
    || 'Local area';

  const getStatusColor = (active: boolean) => {
    return active ? 'bg-secondary-100 text-secondary-800' : 'bg-warm-100 text-warm-800';
  };

  const getStatusIcon = (active: boolean) => {
    return active ? (
      <CheckCircle className="w-4 h-4 text-secondary-500" />
    ) : (
      <XCircle className="w-4 h-4 text-warm-500" />
    );
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-primary-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary-400 floating-card">
              {/* Header with gradient background */}
        <div className="relative animated-gradient-x px-5 py-4">
          <div className="absolute inset-0 bg-white/20"></div>
          <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="mb-2 text-lg font-bold line-clamp-1 transition-colors" style={{ color: '#FFF4E6' }}>
              {service.name}
            </h3>
            <div className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-sm border border-primary-200 px-3 py-1 text-sm font-medium text-primary-700">
              <div className="mr-2 h-2 w-2 rounded-full bg-primary-500"></div>
              {service.category}
            </div>
          </div>
          <div className="flex items-center">
            {getStatusIcon(service.active)}
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium ml-2',
              getStatusColor(service.active)
            )}>
              {service.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          </div>
          {/* Decorative element */}
          <div className="absolute -bottom-1 -right-8 h-16 w-16 rounded-full bg-primary-200/30 blur-xl"></div>
        </div>

              {/* Content */}
        <div className="flex flex-1 flex-col p-5">
        {service.description && (
          <p className="mb-4 text-sm leading-relaxed text-gray-600 line-clamp-2">
            {service.description}
          </p>
        )}

                  {/* Key details with better visual hierarchy */}
          <div className="mb-4 space-y-2">
                      <div className="flex items-center rounded-xl border border-primary-200 bg-primary-50 p-3 transition-colors hover:bg-primary-100">
            <div className="mr-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary-100">
              <DollarSign className="h-4 w-4 text-primary-600" />
            </div>
            <div className="flex-1">
              <span className="text-base font-bold text-primary-700">{formatCurrency(service.price)}</span>
              <span className="ml-2 text-sm text-primary-600">starting price</span>
            </div>
          </div>
          
                      <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center rounded-xl border border-secondary-200 bg-secondary-50 p-3">
                <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-secondary-100">
                  <Clock className="h-3 w-3 text-secondary-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-secondary-700">{service.durationMinutes}</div>
                  <div className="text-[10px] text-secondary-600">minutes</div>
                </div>
              </div>
              
              <div className="flex items-center rounded-xl border border-accent-200 bg-accent-50 p-3">
                <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent-100">
                  <MapPin className="h-3 w-3 text-accent-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[10px] font-semibold text-accent-700">{area}</div>
                  <div className="text-[10px] text-accent-600">service area</div>
                </div>
              </div>
            </div>
        </div>

        {/* Service Info Footer */}
        <div className="mt-auto">
          <div className="flex items-center justify-between rounded-xl border border-warm-200 bg-warm-50 p-4">
            <div className="flex items-center min-w-0">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md">
                <span className="font-bold text-sm">
                  {service.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-warm-900 text-sm">
                  {service.subcategory || service.category}
                </p>
                <p className="truncate text-xs text-warm-600">
                  Created {formatDate(service.createdAt)}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-secondary-600">
              <Settings className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProviderDashboard() {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState('30'); // days

  // Fetch provider services
  const {
    data: services,
    isLoading: servicesLoading
  } = useQuery({
    queryKey: ['provider-services'],
    queryFn: () => apiClient.getMyServices(),
  });

  // Fetch provider bookings
  const {
    data: bookingsData,
    isLoading: bookingsLoading
  } = useQuery({
    queryKey: ['provider-bookings'],
    queryFn: () => apiClient.getProviderBookings(),
  });

  // Fetch provider ratings
  const {
    data: ratingsData,
    isLoading: ratingsLoading
  } = useQuery({
    queryKey: ['provider-ratings'],
    queryFn: () => apiClient.getMyProviderRatings(), // Use authenticated provider ratings endpoint
  });

  // Calculate metrics
  const totalServices = services?.length || 0;
  const recentServices = services?.slice(0, 2) || []; // Show only 2 most recent services
  const bookings = bookingsData?.content || [];
  const recentBookings = bookings.slice(0, 5);
  const totalBookings = bookingsData?.totalElements || 0;
  const pendingBookings = bookings.filter((b: Booking) => b.status === 'PENDING').length;
  const confirmedBookings = bookings.filter((b: Booking) => b.status === 'CONFIRMED').length;
  const completedBookings = bookings.filter((b: Booking) => b.status === 'COMPLETED').length;
  
  // Time-based calculations
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  // Services created this month
  const servicesThisMonth = services?.filter((service: any) => 
    new Date(service.createdAt) >= oneMonthAgo
  ).length || 0;
  
  // Revenue calculation (last 30 days)
  const recentRevenue = bookings
    .filter((b: Booking) => 
      b.status === 'COMPLETED' && 
      new Date(b.scheduledDateTime) >= thirtyDaysAgo
    )
    .reduce((sum: number, booking: Booking) => sum + booking.totalPrice, 0);
    
  // Revenue calculation (30-60 days ago for comparison)
  const previousPeriodRevenue = bookings
    .filter((b: Booking) => 
      b.status === 'COMPLETED' && 
      new Date(b.scheduledDateTime) >= sixtyDaysAgo &&
      new Date(b.scheduledDateTime) < thirtyDaysAgo
    )
    .reduce((sum: number, booking: Booking) => sum + booking.totalPrice, 0);
    
  // Calculate revenue percentage change
  const revenueChange = previousPeriodRevenue > 0 
    ? ((recentRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100).toFixed(1)
    : recentRevenue > 0 ? '100' : '0';
  const revenueChangeSign = parseFloat(revenueChange) >= 0 ? '+' : '';
  const revenueChangeText = previousPeriodRevenue === 0 && recentRevenue === 0 
    ? 'No previous data' 
    : `${revenueChangeSign}${revenueChange}% from last month`;

  // Average rating
  const ratings = ratingsData?.content || [];
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length 
    : 0;

  const stats = [
    {
      title: 'Total Services',
      value: totalServices,
      icon: Settings,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
      change: servicesThisMonth > 0 ? `+${servicesThisMonth} this month` : 'No new services this month',
    },
    {
      title: 'Total Bookings',
      value: totalBookings,
      icon: Calendar,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
      change: `+${pendingBookings + confirmedBookings} pending`,
    },
    {
      title: 'Revenue (30d)',
      value: formatCurrency(recentRevenue),
      icon: DollarSign,
      color: 'text-accent-600',
      bgColor: 'bg-accent-100',
      change: revenueChangeText,
    },
    {
      title: 'Average Rating',
      value: averageRating > 0 ? averageRating.toFixed(1) : 'N/A',
      icon: Star,
      color: 'text-warm-600',
      bgColor: 'bg-warm-100',
      change: `${ratings.length} reviews`,
    },
  ];

  const upcomingBookings = bookings
    .filter((b: Booking) => b.status === 'CONFIRMED' || b.status === 'PENDING')
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Welcome Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-700">
              Welcome back, {user?.fullName?.split(' ')[0]}! 🚀
            </h1>
            <p className="text-lg text-secondary-600 mt-2">
              Here's how your business is performing
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-3">
              <Link to="/provider/profile" className="btn btn-primary">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="glass-card sunset-shadow floating-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-accent-600">{stat.title}</p>
                <p className="text-2xl font-bold text-primary-700 mt-1">{stat.value}</p>
                <p className="text-xs text-secondary-500 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Left Column - Quick Actions & Business Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card sunset-shadow mb-4">
            <h2 className="text-lg font-semibold text-primary-700 mb-4">Quick Actions</h2>
                          <div className="space-y-2 quick-actions">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.href}
                    className="flex items-center p-4 rounded-xl border border-primary-200 hover:border-primary-400 hover:bg-primary-50 transition-colors group"
                  >
                                      <div className={`p-3 rounded-xl ${action.color} mr-4 group-hover:scale-105 transition-transform sunset-shadow`}>
                      <action.icon className="w-5 h-5" style={{ color: '#FFDCA2' }} />
                    </div>
                  <div>
                    <h3 className="font-medium text-primary-700">{action.title}</h3>
                    <p className="text-sm text-secondary-600">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Business Summary */}
          <div className="glass-card sunset-shadow">
            <h2 className="text-lg font-semibold text-primary-700 mb-4">Business Summary</h2>
                          <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Active Services</span>
                <span className="font-semibold text-primary-700">{totalServices}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Pending Bookings</span>
                <span className="font-semibold text-accent-600">{pendingBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Confirmed Today</span>
                <span className="font-semibold text-secondary-600">{confirmedBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Completed This Month</span>
                <span className="font-semibold text-warm-600">{completedBookings}</span>
              </div>
            </div>
          </div>
        </div>

                  {/* Middle Column - Recent Services */}
          <div className="lg:col-span-2">
            <div className="glass-card sunset-shadow mb-4">
                          <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary-700 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-secondary-600" />
                Recent Services
              </h2>
              <Link
                to="/provider/services"
                className="text-secondary-600 hover:text-secondary-700 font-medium text-sm"
              >
                View All {totalServices} Services
              </Link>
            </div>

            {servicesLoading ? (
              <div className="flex justify-center py-8">
                <div className="loading-spinner"></div>
              </div>
            ) : recentServices.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {recentServices.map((service: Service) => (
                    <RecentServiceCard key={service.id} service={service} />
                  ))}
                </div>
                {totalServices > 2 && (
                  <div className="mt-4 text-center">
                    <Link
                      to="/provider/services"
                      className="btn btn-outline"
                    >
                      View All {totalServices} Services
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-primary-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-primary-700 mb-2">No services yet</h3>
                <p className="text-secondary-600 mb-4">
                  Start by creating your first service offering
                </p>
                <Link to="/provider/services" className="btn btn-primary">
                  Add Service
                </Link>
              </div>
            )}
          </div>

          {/* Upcoming Bookings */}
          {upcomingBookings.length > 0 && (
            <div className="glass-card sunset-shadow">
              <h2 className="text-lg font-semibold text-primary-700 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-secondary-600" />
                Upcoming Bookings
              </h2>
              <div className="space-y-2">
                {upcomingBookings.map((booking: Booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-primary-50 rounded-xl border border-primary-200"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                        <Calendar className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-primary-700">
                          {booking.service?.name || 'Service'}
                        </p>
                        <p className="text-sm text-secondary-600">
                          {formatDateTime(booking.scheduledDateTime)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary-700">
                        {formatCurrency(booking.totalPrice)}
                      </p>
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        booking.status === 'CONFIRMED'
                          ? 'bg-secondary-100 text-secondary-800'
                          : 'bg-accent-100 text-accent-800'
                      )}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Customer Reviews */}
        <div className="lg:col-span-1">
          <div className="glass-card sunset-shadow">
            <h2 className="text-lg font-semibold text-primary-700 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-warm-500" />
              Customer Reviews
            </h2>
            <RecentRatingsDisplay />
          </div>
        </div>
      </div>
    </div>
  );
}

// Provider Booking Card Component
function ProviderBookingCard({ booking }: { booking: Booking }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-secondary-100 text-secondary-800';
      case 'CONFIRMED':
        return 'bg-primary-100 text-primary-800';
      case 'PENDING':
        return 'bg-accent-100 text-accent-800';
      case 'CANCELLED':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-warm-100 text-warm-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-secondary-500" />;
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4 text-primary-500" />;
      case 'PENDING':
        return <AlertCircle className="w-4 h-4 text-accent-500" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-error-500" />;
      default:
        return <Clock className="w-4 h-4 text-warm-500" />;
    }
  };

  return (
    <div className="border border-primary-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-white/60 hover:bg-white/80">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-primary-700 mb-1">
            {booking.service?.name || 'Service Booking'}
          </h3>
          <p className="text-sm text-secondary-600 mb-2">
            Customer: {booking.customer?.name || 'Customer'}
          </p>
        </div>
        <div className="flex items-center">
          {getStatusIcon(booking.status)}
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium ml-2',
            getStatusColor(booking.status)
          )}>
            {booking.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-accent-600">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          {formatDateTime(booking.scheduledDateTime)}
        </div>
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-2" />
          {formatCurrency(booking.totalPrice)}
        </div>
      </div>

      {booking.customerAddress && (
        <div className="flex items-center text-sm text-warm-600 mt-2">
          <MapPin className="w-4 h-4 mr-2" />
          {booking.customerAddress}
        </div>
      )}
    </div>
  );
} 

// Recent Ratings Display Component
function RecentRatingsDisplay() {
  const { data: ratingsData, isLoading } = useQuery({
    queryKey: ['provider-ratings-recent'],
    queryFn: () => apiClient.getMyProviderRatings({ page: 0, size: 5 }), // Get recent 5 ratings
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading-spinner mr-3"></div>
        <span className="text-secondary-600">Loading ratings...</span>
      </div>
    );
  }

  const ratings = ratingsData?.content || [];

  if (ratings.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className="w-12 h-12 text-primary-300 mx-auto mb-3" />
        <p className="text-secondary-600">No customer ratings yet</p>
        <p className="text-sm text-accent-500 mt-1">
          Ratings will appear here after customers review your completed services
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {ratings.map((rating: any) => (
        <div key={rating.id} className="border border-primary-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-white/60 hover:bg-white/80">
          {/* Rating Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'w-4 h-4',
                      star <= rating.rating
                        ? 'text-warm-500 fill-current'
                        : 'text-warm-200'
                    )}
                  />
                ))}
              </div>
              <span className="font-semibold text-primary-700 text-sm">
                {rating.rating}/5
              </span>
            </div>
            <span className="text-xs text-secondary-500 flex-shrink-0">
              {formatDate(rating.createdAt)}
            </span>
          </div>
          
          {/* Review Text */}
          {rating.review && (
            <p className="text-sm text-accent-700 mb-3 italic leading-relaxed">
              "{rating.review}"
            </p>
          )}
          
          {/* Customer and Service Info */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-secondary-600">
              <span className="font-medium">
                by {rating.customer?.fullName || rating.customer?.name || 'Customer'}
              </span>
            </div>
            <div className="text-xs text-warm-500">
              Service: <span className="font-medium">{rating.booking?.serviceName || 'N/A'}</span>
            </div>
          </div>
          
          {/* Helpful Count */}
          {rating.helpfulCount > 0 && (
            <div className="mt-2 pt-2 border-t border-primary-100">
              <span className="text-xs text-secondary-600">
                {rating.helpfulCount} customer{rating.helpfulCount !== 1 ? 's' : ''} found this helpful
              </span>
            </div>
          )}
        </div>
      ))}
      
      {/* View All Link */}
      <div className="text-center pt-3 border-t border-primary-100">
        <Link 
          to="/provider/ratings" 
          className="inline-flex items-center text-secondary-600 hover:text-secondary-700 text-sm font-medium transition-colors"
        >
          View All Ratings
          <span className="ml-1">→</span>
        </Link>
      </div>
    </div>
  );
} 