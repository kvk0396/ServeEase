import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Star,
  Filter,
  Search,
  Calendar,
  User,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Award,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

import ThemedSelect from '../../components/ThemedSelect';
import { apiClient } from '../../lib/api';
import { formatDate, cn } from '../../lib/utils';
import type { Rating } from '../../types';
import BackButton from '../../components/BackButton';

const ratingFilters = [
  { value: 'all', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Rating' },
  { value: 'lowest', label: 'Lowest Rating' },
  { value: 'most_helpful', label: 'Most Helpful' },
];

export default function ProviderRatings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [reviewsOnly, setReviewsOnly] = useState(false);

  // Fetch provider ratings
  const {
    data: ratingsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['provider-ratings', ratingFilter, sortBy, reviewsOnly, searchTerm],
    queryFn: () => apiClient.getMyProviderRatings({ 
      page: 0, 
      size: 50,
      reviewsOnly,
      // Note: Additional filtering will be done client-side for now
    }),
  });

  // Fetch rating statistics
  const {
    data: stats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['provider-rating-stats'],
    queryFn: () => {
      // We'll need to get the provider ID from the user context or derive it from ratings
      // For now, let's calculate stats from the ratings data
      if (ratingsData?.content) {
        const ratings = ratingsData.content;
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0 
          ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / totalRatings 
          : 0;
        const fiveStarCount = ratings.filter((r: any) => r.rating === 5).length;
        
        return {
          averageRating,
          totalRatings,
          fiveStarCount
        };
      }
      return null;
    },
    enabled: !!ratingsData?.content,
  });

  const ratings = ratingsData?.content || [];

  // Filter and sort ratings client-side
  const filteredRatings = ratings
    .filter((rating: Rating) => {
      // Rating filter
      if (ratingFilter !== 'all' && rating.rating !== parseInt(ratingFilter)) {
        return false;
      }
      
      // Search term filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        return (
          rating.review?.toLowerCase().includes(searchLower) ||
          rating.customer?.name?.toLowerCase().includes(searchLower) ||
          rating.booking?.serviceName?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a: Rating, b: Rating) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'most_helpful':
          return (b.helpfulCount || 0) - (a.helpfulCount || 0);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="loading-spinner mr-3"></div>
          <span className="text-gray-600">Loading your ratings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading ratings</h3>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold text-primary-700">Customer Ratings & Reviews</h1>
            <p className="text-lg text-gray-600 mt-1">
              See what your customers are saying about your services
            </p>
          </div>
        </div>
      </div>

      {/* Rating Statistics */}
      {stats && !statsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.averageRating?.toFixed(1) || '0.0'}
                </p>
                <p className="text-xs text-gray-500">{stats.totalRatings} reviews</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500 fill-current" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalRatings || 0}</p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">5-Star Reviews</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.fiveStarCount || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.totalRatings > 0 ? Math.round((stats.fiveStarCount || 0) / stats.totalRatings * 100) : 0}% of total
                </p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Helpful Votes</p>
                <p className="text-2xl font-bold text-purple-600">
                  {ratings.reduce((sum: number, r: Rating) => sum + (r.helpfulCount || 0), 0)}
                </p>
                <p className="text-xs text-gray-500">Total helpful votes</p>
              </div>
              <ThumbsUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Reviews
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reviews, customers, or services..."
                className="input pl-10 w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating Filter
            </label>
            <ThemedSelect
              value={ratingFilter}
              onChange={(v: string) => setRatingFilter(v)}
              options={ratingFilters.map((f) => ({ value: f.value, label: f.label }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <ThemedSelect
              value={sortBy}
              onChange={(v: string) => setSortBy(v)}
              options={sortOptions.map((o) => ({ value: o.value, label: o.label }))}
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={reviewsOnly}
                onChange={(e) => setReviewsOnly(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Reviews only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Ratings List */}
      <div className="space-y-6">
        {filteredRatings.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ratings found</h3>
            <p className="text-gray-600">
              {searchTerm || ratingFilter !== 'all' 
                ? 'Try adjusting your filters to see more results.'
                : 'Customer ratings will appear here after they review your completed services.'
              }
            </p>
          </div>
        ) : (
          filteredRatings.map((rating: Rating) => (
            <RatingCard key={rating.id} rating={rating} />
          ))
        )}
      </div>

      {/* Load More */}
      {filteredRatings.length > 0 && ratings.length >= 50 && (
        <div className="text-center mt-8">
          <button className="btn btn-outline">
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
}

// Individual Rating Card Component
function RatingCard({ rating }: { rating: Rating }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'w-5 h-5',
                  star <= rating.rating
                    ? 'text-yellow-500 fill-current'
                    : 'text-gray-300'
                )}
              />
            ))}
          </div>
          <span className="text-lg font-semibold text-gray-900">
            {rating.rating}/5
          </span>
        </div>
        <span className="text-sm text-gray-500 flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {formatDate(rating.createdAt)}
        </span>
      </div>

      {rating.review && (
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">"{rating.review}"</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            {rating.customer?.fullName || rating.customer?.name || 'Customer'}
          </div>
          <div>
            Service: <span className="font-medium">{rating.booking?.serviceName || 'N/A'}</span>
          </div>
        </div>
        
        {rating.helpfulCount > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <ThumbsUp className="w-4 h-4 mr-1" />
            {rating.helpfulCount} helpful
          </div>
        )}
      </div>
    </div>
  );
} 