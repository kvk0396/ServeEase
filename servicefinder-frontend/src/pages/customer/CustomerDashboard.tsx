import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar,
  Star,
  MapPin,
  Search,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Settings
} from 'lucide-react';

import { apiClient } from '../../lib/api';

import { useAuthStore } from '../../store/authStore';
import { formatCurrency, formatDateTime, cn } from '../../lib/utils';
import type { Booking } from '../../types';

const quickActions = [
  {
    title: 'Find Services',
    description: 'Browse local service providers',
    icon: Search,
    href: '/search',
    color: 'gradient-primary',
  },
  {
    title: 'My Bookings',
    description: 'View and manage bookings',
    icon: Calendar,
    href: '/customer/bookings',
    color: 'gradient-secondary',
  },
  {
    title: 'My Reviews',
    description: 'Rate completed services',
    icon: Star,
    href: '/customer/ratings',
    color: 'gradient-accent',
  },
];

export default function CustomerDashboard() {
  const { user } = useAuthStore();

  // Fetch customer bookings
  const {
    data: bookings,
    isLoading: bookingsLoading
  } = useQuery({
    queryKey: ['customer-bookings'],
    queryFn: () => apiClient.getCustomerBookings(),
  });

  // Fetch customer ratings
  const {
    data: ratings,
    isLoading: ratingsLoading
  } = useQuery({
    queryKey: ['customer-ratings'],
    queryFn: () => apiClient.getCustomerRatings(),
  });

  // Calculate stats
  const recentBookings = bookings?.content?.slice(0, 5) || [];
  const totalBookings = bookings?.totalElements || 0;
  const completedBookings = bookings?.content?.filter((b: Booking) => b.status === 'COMPLETED').length || 0;
  const pendingBookings = bookings?.content?.filter((b: Booking) => b.status === 'PENDING').length || 0;
  const totalSpent = bookings?.content?.reduce((sum: number, booking: Booking) => sum + booking.totalPrice, 0) || 0;
  const averageRating = ratings?.content && ratings.content.length > 0 
    ? ratings.content.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.content.length 
    : 0;

  const stats = [
    {
      title: 'Total Bookings',
      value: totalBookings,
      icon: Calendar,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      title: 'Completed',
      value: completedBookings,
      icon: CheckCircle,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
    },
    {
      title: 'Pending',
      value: pendingBookings,
      icon: AlertCircle,
      color: 'text-accent-600',
      bgColor: 'bg-accent-100',
    },
    {
      title: 'Total Spent',
      value: formatCurrency(totalSpent),
      icon: DollarSign,
      color: 'text-warm-600',
      bgColor: 'bg-warm-100',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Welcome Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-700">
              Welcome back, {user?.fullName?.split(' ')[0]}! 👋
            </h1>
            <p className="text-lg text-secondary-600 mt-2">
              Here's what's happening with your services
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-3">
              <Link to="/profile" className="btn btn-primary">
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
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor} mr-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-600">{stat.title}</p>
                <p className="text-2xl font-bold text-primary-700">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="glass-card sunset-shadow">
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

          {/* Rating Overview */}
          {ratings?.content && ratings.content.length > 0 && (
            <div className="glass-card sunset-shadow mt-4">
              <h2 className="text-lg font-semibold text-primary-700 mb-4">Your Reviews</h2>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-8 h-8 text-warm-400 fill-current mr-2" />
                  <span className="text-3xl font-bold text-primary-700">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <p className="text-secondary-600 mb-4">
                  Average rating from {ratings.content.length} reviews
                </p>
                <Link
                  to="/customer/ratings"
                  className="btn btn-outline btn-sm w-full"
                >
                  View All Reviews
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="glass-card sunset-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary-700">Recent Bookings</h2>
              <Link
                to="/customer/bookings"
                className="text-secondary-600 hover:text-secondary-700 font-medium text-sm"
              >
                View All
              </Link>
            </div>

            {bookingsLoading ? (
              <div className="flex justify-center py-8">
                <div className="loading-spinner"></div>
              </div>
            ) : recentBookings.length > 0 ? (
                              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-primary-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-primary-700 mb-2">No bookings yet</h3>
                <p className="text-secondary-600 mb-4">
                  Start by booking your first service
                </p>
                <Link to="/search" className="btn btn-primary">
                  Browse Services
                </Link>
              </div>
            )}
          </div>

          {/* Upcoming Bookings */}
          {recentBookings.some((b: Booking) => b.status === 'CONFIRMED' || b.status === 'PENDING') && (
            <div className="glass-card sunset-shadow mt-4">
              <h2 className="text-lg font-semibold text-primary-700 mb-4">Upcoming Services</h2>
                              <div className="space-y-2">
                {recentBookings
                  .filter((b: Booking) => b.status === 'CONFIRMED' || b.status === 'PENDING')
                  .slice(0, 3)
                  .map((booking) => (
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
      </div>
    </div>
  );
}

// Booking Card Component
function BookingCard({ booking }: { booking: Booking }) {
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

  return (
    <div className="border border-primary-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-white/60 hover:bg-white/80">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-primary-700 mb-1">
            {booking.service?.name || 'Service Booking'}
          </h3>
          <p className="text-sm text-secondary-600 mb-2">
            {booking.serviceProvider?.businessName || 'Service Provider'}
          </p>
        </div>
        <span className={cn(
          'px-2 py-1 rounded-full text-xs font-medium',
          getStatusColor(booking.status)
        )}>
          {booking.status}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-accent-600">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {formatDateTime(booking.scheduledDateTime)}
        </div>
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-1" />
          {formatCurrency(booking.totalPrice)}
        </div>
      </div>

      {booking.customerAddress && (
        <div className="flex items-center text-sm text-warm-600 mt-2">
          <MapPin className="w-4 h-4 mr-1" />
          {booking.customerAddress}
        </div>
      )}
    </div>
  );
} 