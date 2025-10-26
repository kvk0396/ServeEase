import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, MapPin, Star, Clock, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

import ThemedSelect from '../components/ThemedSelect';
import { apiClient } from '../lib/api';
import { formatCurrency, cn } from '../lib/utils';
import type { Service, PaginatedResponse } from '../types';

const categories = [
  'All Categories',
  'Home Cleaning',
  'Plumbing',
  'Electrical',
  'Gardening',
  'Painting',
  'Carpentry',
  'HVAC',
  'Pest Control',
  'Appliance Repair',
];

const sortOptions = [
  { value: 'name', label: 'Name A-Z' },
  { value: 'price', label: 'Price Low to High' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'created', label: 'Newest First' },
];

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All Categories');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));

  const {
    data: servicesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['services', searchTerm, selectedCategory, sortBy, currentPage],
    queryFn: async () => {
      const params: any = {};
      
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory !== 'All Categories') params.category = selectedCategory;

      const response = await apiClient.getServices(params);
      
      // Apply client-side sorting since backend might not support all sort options
      let sortedServices = [...response];
      
      switch (sortBy) {
        case 'price':
          sortedServices.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case 'rating':
          sortedServices.sort((a, b) => (b.serviceProvider?.averageRating || 0) - (a.serviceProvider?.averageRating || 0));
          break;
        case 'created':
          sortedServices.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
          break;
        case 'name':
        default:
          sortedServices.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
      
      // Simulate pagination
      const itemsPerPage = 12;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedServices = sortedServices.slice(startIndex, startIndex + itemsPerPage);
      
      return {
        content: paginatedServices,
        totalElements: sortedServices.length,
        totalPages: Math.ceil(sortedServices.length / itemsPerPage),
        size: itemsPerPage,
        number: currentPage - 1
      };
    },
    retry: 1,
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory !== 'All Categories') params.set('category', selectedCategory);
    if (sortBy !== 'name') params.set('sort', sortBy);
    if (currentPage !== 1) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  }, [searchTerm, selectedCategory, sortBy, currentPage, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const totalPages = servicesData ? Math.ceil(servicesData.totalElements / 12) : 0;

  if (error) {
    toast.error('Failed to load services. Please try again.');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-700 mb-4">Browse Services</h1>
        <p className="text-lg text-gray-600">Find the perfect service provider for your needs</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary px-6"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline px-6 flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        </form>

        {/* Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                                <ThemedSelect
                  value={selectedCategory}
                  onChange={(v: string) => handleCategoryChange(v)}
                  options={categories.map((category) => ({ value: category, label: category }))}
                  placeholder="Category"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <ThemedSelect
                  value={sortBy}
                  onChange={(v: string) => handleSortChange(v)}
                  options={sortOptions.map((option) => ({ value: option.value, label: option.label }))}
                  placeholder="Sort By"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-gray-600">Loading services...</span>
        </div>
      ) : servicesData?.content && servicesData.content.length > 0 ? (
        <>
          {/* Results Info */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {servicesData.content.length} of {servicesData.totalElements} services
            </p>
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          {/* Service Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {servicesData.content.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn btn-outline px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      'px-3 py-2 rounded-md text-sm font-medium',
                      currentPage === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-outline px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-primary-700 mb-2">No services found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or browse all categories
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All Categories');
              setCurrentPage(1);
            }}
            className="btn btn-primary"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

// Service Card Component
function ServiceCard({ service }: { service: Service }) {
  const area = (service.serviceArea && service.serviceArea.trim())
    || [service.city, service.district].filter(Boolean).join(', ')
    || [
      // backend may expose location* fields
      (service as any).locationCity,
      (service as any).locationDistrict
    ].filter(Boolean).join(', ')
    || 'Local area';

  // Debug service provider data (dev only)
  if (import.meta.env.DEV) {
    console.log('Service provider data:', service.serviceProvider);
    console.log('Full service data:', service);
  }

  // Get provider name with multiple fallbacks
  const getProviderName = () => {
    const provider = service.serviceProvider;
    if (!provider) {
      return (
        (service as any).providerBusinessName ||
        (service as any).providerName ||
        (service as any).businessName ||
        (service as any).name ||
        'Service Provider'
      );
    }

    return (
      provider.businessName ||
      provider.contactName ||
      (service as any).providerBusinessName ||
      (service as any).providerName ||
      (service as any).businessName ||
      (service as any).name ||
      'Service Provider'
    );
  };

  const getProviderContact = () => {
    const provider = service.serviceProvider;
    if (!provider) return null;
    
    // Only show contact if we have business name and separate contact name
    if (provider.businessName && provider.contactName && provider.businessName !== provider.contactName) {
      return provider.contactName;
    }
    return null;
  };

  const providerName = getProviderName();
  const contactName = getProviderContact();
  const avgRating = service.serviceProvider?.averageRating ?? (service as any).providerAverageRating ?? null;
  const isVerified = (service.serviceProvider?.verificationStatus ?? (service as any).providerVerificationStatus) === 'VERIFIED';

  return (
    <Link
      to={`/services/${service.id}`}
      className="group block h-full"
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary-300">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-br from-primary-50 to-primary-100 px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
                          <h3 className="mb-2 text-lg font-bold text-primary-700 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {service.name}
            </h3>
              <div className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-sm border border-primary-200 px-3 py-1 text-sm font-medium text-primary-700">
                <div className="mr-2 h-2 w-2 rounded-full bg-primary-500"></div>
                {service.category}
              </div>
            </div>
            {service.serviceProvider?.averageRating != null && (
              <div className="shrink-0 flex items-center rounded-lg bg-amber-100 border border-amber-200 px-3 py-2 shadow-sm">
                <Star className="mr-1.5 h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="font-bold text-amber-700">{service.serviceProvider.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
          {/* Decorative element */}
          <div className="absolute -bottom-1 -right-8 h-16 w-16 rounded-full bg-primary-200/30 blur-xl"></div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-6">
          <p className="mb-5 text-sm leading-relaxed text-gray-600 line-clamp-3">
            {service.description}
          </p>

          {/* Key details with better visual hierarchy */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center rounded-lg border border-green-200 bg-green-50 p-2.5 transition-colors hover:bg-green-100">
              <div className="mr-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <span className="text-base font-bold text-green-700">{formatCurrency(service.price)}</span>
                <span className="ml-2 text-sm text-green-600">starting price</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex items-center rounded-lg border border-blue-200 bg-blue-50 p-2.5">
                <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                  <Clock className="h-3 w-3 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-blue-700">{service.durationMinutes}</div>
                  <div className="text-[10px] text-blue-600">minutes</div>
                </div>
              </div>
              
              <div className="flex items-center rounded-lg border border-rose-200 bg-rose-50 p-2.5">
                <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-100">
                  <MapPin className="h-3 w-3 text-rose-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[10px] font-semibold text-rose-700">{area}</div>
                  <div className="text-[10px] text-rose-600">service area</div>
                </div>
              </div>
            </div>
          </div>

          {/* Provider info */}
          <div className="mt-auto">
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center min-w-0">
                <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md">
                  <span className="font-bold text-lg">
                    {providerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">
                    {providerName}
                  </p>
                  {contactName && (
                    <p className="truncate text-xs text-gray-600">
                      Contact: {contactName}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                        Verified
                      </span>
                    )}
                    {service.serviceProvider?.yearsOfExperience && (
                      <span className="text-xs text-gray-500">
                        {service.serviceProvider.yearsOfExperience} years exp.
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-primary-600 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 