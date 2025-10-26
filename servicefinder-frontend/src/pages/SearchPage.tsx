import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  MapPin, 
  Filter, 
  Star, 
  DollarSign, 
  Clock,
  Navigation,
  Grid,
  List,
  Sliders,
  Globe,
  ChevronDown
} from 'lucide-react';
import ThemedSelect from '../components/ThemedSelect';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';

import { apiClient } from '../lib/api';
import { formatCurrency, calculateDistance, cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import type { LocationSearchRequest, LocationSearchResponse } from '../types';

export default function SearchPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [mode, setMode] = useState<'nearby' | 'all'>(
    (localStorage.getItem('searchMode') as 'nearby' | 'all') || 'nearby'
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [debouncedLocation, setDebouncedLocation] = useState(location);
  const [category, setCategory] = useState(searchParams.get('category') || 'All Categories');
  const [maxDistance, setMaxDistance] = useState(parseInt(searchParams.get('distance') || '150'));
  const [minPrice, setMinPrice] = useState(parseInt(searchParams.get('minPrice') || '0'));
  const [maxPrice, setMaxPrice] = useState(parseInt(searchParams.get('maxPrice') || '1000'));
  const [minRating, setMinRating] = useState(parseFloat(searchParams.get('minRating') || '0'));
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'distance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);

  // Ensure sortBy is valid for current mode
  useEffect(() => {
    const allowed = mode === 'nearby' 
      ? ['distance', 'rating', 'price', 'experience'] 
      : ['rating', 'price', 'experience'];
    if (!allowed.includes(sortBy)) {
      setSortBy(mode === 'nearby' ? 'distance' : 'rating');
    }
  }, [mode]);

  // Fetch categories from API
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const allCategories = ['All Categories', ...categories];

  useEffect(() => {
    localStorage.setItem('searchMode', mode);
  }, [mode]);

  // Check authentication for nearby search and auto-detect location
  useEffect(() => {
    if (mode === 'nearby' && !isAuthenticated) {
      toast.error('Please login to search for nearby services');
      navigate('/login');
      return;
    }
    
    // Auto-detect location when switching to nearby mode
    if (mode === 'nearby' && isAuthenticated && !location) {
      getCurrentLocation();
    }
  }, [mode, isAuthenticated, navigate, location]);

  // Debounce location
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocation(location);
    }, 800);
    return () => clearTimeout(timer);
  }, [location]);

  // Get user's current location
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setIsGettingLocation(false);
          toast.success('Location detected successfully!');
        },
        (error) => {
          setIsGettingLocation(false);
          toast.error('Unable to get your location. Please enter manually.');
          if (import.meta.env.DEV) console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      setIsGettingLocation(false);
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  // Enhanced geocoding function
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    // Simulate geocoding with common city coordinates
    const cityCoords: { [key: string]: { lat: number; lng: number } } = {
      'new york': { lat: 40.7128, lng: -74.0060 },
      'los angeles': { lat: 34.0522, lng: -118.2437 },
      'chicago': { lat: 41.8781, lng: -87.6298 },
      'houston': { lat: 29.7604, lng: -95.3698 },
      'phoenix': { lat: 33.4484, lng: -112.0740 },
      'philadelphia': { lat: 39.9526, lng: -75.1652 },
      'san antonio': { lat: 29.4241, lng: -98.4936 },
      'san diego': { lat: 32.7157, lng: -117.1611 },
      'dallas': { lat: 32.7767, lng: -96.7970 },
      'san jose': { lat: 37.3382, lng: -121.8863 },
      'austin': { lat: 30.2672, lng: -97.7431 },
      'miami': { lat: 25.7617, lng: -80.1918 },
      'seattle': { lat: 47.6062, lng: -122.3321 },
      'denver': { lat: 39.7392, lng: -104.9903 },
      'boston': { lat: 42.3601, lng: -71.0589 },
    };

    const normalizedAddress = address.toLowerCase().trim();
    
    // Check for exact city match
    for (const city in cityCoords) {
      if (normalizedAddress.includes(city)) {
        return cityCoords[city];
      }
    }

    // Check for zip code pattern (US format)
    const zipMatch = normalizedAddress.match(/\b(\d{5})\b/);
    if (zipMatch) {
      // Simulate zip code lookup - return NYC coordinates as default
      return { lat: 40.7128, lng: -74.0060 };
    }

    return null;
  };

  const {
    data: searchResults,
    isLoading: isNearbyLoading,
    error: nearbyError,
    refetch: refetchNearby
  } = useQuery({
    queryKey: ['location-search', debouncedLocation, category, maxDistance, minPrice, maxPrice, minRating, sortBy],
    queryFn: async () => {
      if (!debouncedLocation.trim()) return null;

      let searchRequest: LocationSearchRequest;

      // Check if location is coordinates
      const coordsMatch = debouncedLocation.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
      if (coordsMatch) {
        searchRequest = {
          latitude: parseFloat(coordsMatch[1]),
          longitude: parseFloat(coordsMatch[2]),
          radiusKm: maxDistance,
          category: category !== 'All Categories' ? category : undefined,
          maxPrice: maxPrice < 1000 ? maxPrice : undefined,
          minRating: minRating > 0 ? minRating : undefined,
          sortByDistance: sortBy === 'distance',
        };
      } else {
        // Enhanced address-based search with geocoding
        const coords = await geocodeAddress(debouncedLocation);
        if (!coords) {
          toast.error('Location not found. Please try a different address or use current location.');
          return null;
        }

        searchRequest = {
          latitude: coords.lat,
          longitude: coords.lng,
          radiusKm: maxDistance,
          category: category !== 'All Categories' ? category : undefined,
          maxPrice: maxPrice < 1000 ? maxPrice : undefined,
          minRating: minRating > 0 ? minRating : undefined,
          sortByDistance: sortBy === 'distance',
        };
      }

      try {
        const response = await apiClient.searchByLocation(searchRequest);
        return response;
              } catch (error) {
          if (import.meta.env.DEV) console.error('Search error:', error);
          throw error;
        }
    },
    enabled: mode === 'nearby' && !!debouncedLocation.trim(),
    retry: 1,
  });

  // All services query
  const {
    data: allServices,
    isLoading: isAllLoading,
    error: allError,
    refetch: refetchAll
  } = useQuery({
    queryKey: ['all-services', category, minPrice, maxPrice, minRating, sortBy],
    queryFn: async () => {
      const services = await apiClient.getServices({ category: category !== 'All Categories' ? category : undefined });
      // Client-side filters
      let filtered = services.filter((s) => {
        // Category filter
        const categoryOk = category === 'All Categories' || s.category === category;
        
        // Price filter
        const servicePrice = typeof s.price === 'number' ? s.price : Number(s.price || 0);
        const priceOk = servicePrice >= (minPrice || 0) && servicePrice <= (maxPrice || 1000);
        
        // Rating filter
        const rating = (s.serviceProvider as any)?.averageRating ?? (s as any).providerAverageRating ?? 0;
        const ratingOk = rating >= (minRating || 0);
        
        return categoryOk && priceOk && ratingOk;
      });
      // Sorting
      switch (sortBy) {
        case 'price':
          filtered.sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
          break;
        case 'rating':
          filtered.sort((a: any, b: any) => (((b.serviceProvider as any)?.averageRating ?? (b as any).providerAverageRating ?? 0) - (((a.serviceProvider as any)?.averageRating ?? (a as any).providerAverageRating ?? 0))));
          break;
        case 'experience':
          filtered.sort((a: any, b: any) => (((b.serviceProvider as any)?.yearsOfExperience ?? 0) - ((a.serviceProvider as any)?.yearsOfExperience ?? 0)));
          break;
        default:
          break;
      }
      return filtered;
    },
    enabled: mode === 'all',
    retry: 1,
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (category !== 'All Categories') params.set('category', category);
    if (maxDistance !== 150) params.set('distance', maxDistance.toString());
    if (minPrice > 0) params.set('minPrice', minPrice.toString());
    if (maxPrice < 1000) params.set('maxPrice', maxPrice.toString());
    if (minRating > 0) params.set('minRating', minRating.toString());
    if (sortBy !== 'distance') params.set('sort', sortBy);
    
    setSearchParams(params);
  }, [location, category, maxDistance, minPrice, maxPrice, minRating, sortBy, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'nearby') {
      if (location) {
        refetchNearby();
      } else {
        toast.error('Please enter a location to search');
      }
    } else {
      refetchAll();
    }
  };

  // Open map picker and center appropriately
  const openMapPicker = () => {
    // If the input has coords, center there; else use userLocation or default India
    const coordsMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordsMatch) {
      setMapCenter([parseFloat(coordsMatch[1]), parseFloat(coordsMatch[2])]);
    } else if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
    } else {
      setMapCenter([20.5937, 78.9629]);
    }
    setShowMapPicker(true);
  };

  const providers = searchResults?.providers || [];
  const servicesList = allServices || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 search-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-700 mb-4">Find Local Services</h1>
        <p className="text-lg text-gray-600">Discover trusted service providers in your area</p>
      </div>

      {/* Mode toggle */}
      <div className="mb-4">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setMode('nearby')}
            className={cn('px-3 py-1.5 text-sm font-medium rounded-md inline-flex items-center gap-2', mode === 'nearby' ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-50')}
          >
            <MapPin className="w-4 h-4" /> Near me
          </button>
          <button
            type="button"
            onClick={() => setMode('all')}
            className={cn('px-3 py-1.5 text-sm font-medium rounded-md inline-flex items-center gap-2', mode === 'all' ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-50')}
          >
            <Globe className="w-4 h-4" /> All services
          </button>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500 w-5 h-5 z-10 pointer-events-none" />
                             <ThemedSelect
                 value={category}
                 onChange={(v: string) => setCategory(v)}
                  options={allCategories.map((cat) => ({ value: cat, label: cat }))}
                 placeholder="All Categories"
                 buttonClassName="pl-10 pr-10"
               />

            </div>
            
            {mode === 'nearby' ? (
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500 w-5 h-5 z-10 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Enter location or coordinates"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input pl-10 pr-24 w-full hover:bg-primary-50 hover:border-primary-400 transition-all duration-500 ease-in-out text-primary-700 font-medium"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={openMapPicker}
                    className="p-1.5 rounded-md text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    title="Pick on map"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="p-1.5 rounded-md text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    title="Use current location"
                  >
                    <Navigation className={cn('w-5 h-5', isGettingLocation && 'animate-spin')} />
                  </button>
                </div>
              </div>
            ) : (
              <div />
            )}

            <div className="flex space-x-2">
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={mode === 'nearby' ? isNearbyLoading : isAllLoading}
              >
                {(mode === 'nearby' ? isNearbyLoading : isAllLoading) ? 'Searching...' : 'Search'}
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-outline px-3"
              >
                <Sliders className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-primary-200 pt-4 bg-gradient-to-r from-primary-50/50 to-secondary-50/50 rounded-lg p-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {mode === 'nearby' && (
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Max Distance: {maxDistance} km
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="200"
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Price Range
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(parseInt(e.target.value) || 0)}
                      className="input w-full text-sm hover:bg-primary-50 hover:border-primary-400 transition-all duration-500 ease-in-out text-primary-700 font-medium"
                    />
                    <span className="text-secondary-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(parseInt(e.target.value) || 1000)}
                      className="input w-full text-sm hover:bg-primary-50 hover:border-primary-400 transition-all duration-500 ease-in-out text-primary-700 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent-700 mb-2">
                    Min Rating: {minRating || 'Any'}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={minRating}
                    onChange={(e) => setMinRating(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-2">
                    Sort By
                  </label>
                  <ThemedSelect
                    value={sortBy}
                    onChange={(v: string) => setSortBy(v)}
                    options={[
                      ...(mode === 'nearby' ? [{ value: 'distance', label: 'Distance' }] : []),
                      { value: 'rating', label: 'Rating' },
                      { value: 'price', label: 'Price' },
                      { value: 'experience', label: 'Experience' },
                    ]}
                    placeholder="Sort By"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCategory('All Categories');
                    setMaxDistance(150);
                    setMinPrice(0);
                    setMaxPrice(1000);
                    setMinRating(0);
                    setSortBy(mode === 'nearby' ? 'distance' : 'rating');
                  }}
                  className="btn mt-6 px-6 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 hover:shadow-lg transition-all duration-500 ease-in-out transform hover:scale-105"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Results */}
      {mode === 'nearby' && searchResults && (
        (() => {
          // Calculate filtered items first to get accurate count
          const items = providers.flatMap((p: any) =>
            (p.services || []).filter((s: any) => {
              // Client-side category filter as backup
              const categoryMatch = category === 'All Categories' || s.category === category;
                              if (!categoryMatch) {
                  if (import.meta.env.DEV) console.log(`Filtering out service ${s.name} - category ${s.category} doesn't match ${category}`);
                }
              
              // Client-side price filter as backup
              const priceMatch = (s.price >= minPrice) && (s.price <= maxPrice);
              
              // Client-side rating filter as backup
              const providerRating = p.averageRating || 0;
              const ratingMatch = providerRating >= minRating;
              
              return categoryMatch && priceMatch && ratingMatch;
            }).map((s: any) => {
              // Calculate distance for each service individually
              let serviceDistance = p.distance; // Default to provider distance
              
              // If service has its own coordinates and we have search coordinates
                              if (s.latitude && s.longitude && searchResults?.metadata?.searchLatitude && searchResults?.metadata?.searchLongitude) {
                  serviceDistance = calculateDistance(
                    searchResults.metadata.searchLatitude,
                    searchResults.metadata.searchLongitude,
                    s.latitude,
                    s.longitude
                  );
                  if (import.meta.env.DEV) console.log(`Service ${s.name}: individual distance = ${serviceDistance.toFixed(2)}km (${s.latitude}, ${s.longitude}), provider distance = ${p.distance?.toFixed(2)}km`);
                } else {
                  if (import.meta.env.DEV) console.log(`Service ${s.name}: using provider distance = ${p.distance?.toFixed(2)}km (no service coords: lat=${s.latitude}, lon=${s.longitude})`);
                }
              
              return { service: s, provider: p, distance: serviceDistance };
            })
          ).filter(({ distance }: any) => {
            // Apply client-side distance filter
            const withinDistance = distance <= maxDistance;
            if (!withinDistance) {
              if (import.meta.env.DEV) console.log(`Filtering out service - distance ${distance?.toFixed(2)}km > max ${maxDistance}km`);
            }
            return withinDistance;
          }).sort((a: any, b: any) => {
            // Apply sorting
            switch (sortBy) {
              case 'distance':
                return (a.distance ?? Infinity) - (b.distance ?? Infinity);
              case 'price':
                return (a.service.price || 0) - (b.service.price || 0);
              case 'rating':
                const ratingA = a.provider.averageRating || 0;
                const ratingB = b.provider.averageRating || 0;
                return ratingB - ratingA; // Descending
              case 'experience':
                const expA = a.provider.yearsOfExperience || 0;
                const expB = b.provider.yearsOfExperience || 0;
                return expB - expA; // Descending
              default:
                return (a.distance ?? Infinity) - (b.distance ?? Infinity);
            }
          });

          return (
            <>
              {/* Results Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-primary-700">
                    {items.length} {items.length === 1 ? 'service' : 'services'} found
                  </h2>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 rounded-md',
                      viewMode === 'grid'
                        ? 'bg-primary-100 text-primary-600'
                        : 'text-gray-400 hover:text-gray-600'
                    )}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-2 rounded-md',
                      viewMode === 'list'
                        ? 'bg-primary-100 text-primary-600'
                        : 'text-gray-400 hover:text-gray-600'
                    )}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Results Grid/List */}
              {items.length > 0 ? (
                <div className={cn(
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                )}>
                  {items.map(({ service: s, provider: p, distance }: any) => {
                    // Build a service-like object that ServiceResultCard expects
                    const mappedService: any = {
                      id: s.id,
                      name: s.name,
                      category: s.category,
                      subcategory: s.subcategory,
                      price: s.price,
                      durationMinutes: s.durationMinutes,
                      description: p.description,
                      serviceArea: s.serviceArea,
                      city: s.city,
                      district: s.district,
                      serviceProvider: {
                        businessName: p.businessName,
                        averageRating: p.averageRating,
                        verificationStatus: p.verificationStatus,
                        yearsOfExperience: p.yearsOfExperience,
                      },
                    };

                    return (
                      <ServiceResultCard key={`${p.id}-${s.id}`} service={mappedService} distanceKm={distance} />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-primary-700 mb-2">No services found</h3>
                  <p className="text-gray-600 mb-4">
                    Try expanding your search radius or adjusting your filters
                  </p>
                </div>
              )}
            </>
          );
        })()
      )}

      {mode === 'all' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-primary-700">
                {servicesList.length} services found
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={cn('p-2 rounded-md', viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600')}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn('p-2 rounded-md', viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600')}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {servicesList.length > 0 ? (
            <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4')}>
              {servicesList.map((service: any) => (
                <ServiceResultCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600 mb-4">Try broadening your filters</p>
            </div>
          )}
        </>
      )}

      {mode === 'nearby' && !location && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MapPin className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-primary-700 mb-2">Enter a location to search</h3>
          <p className="text-gray-600">
            Use your current location or enter an address to find nearby services
          </p>
        </div>
      )}

      {showMapPicker && (
        <MapPickerModal
          center={mapCenter}
          onClose={() => setShowMapPicker(false)}
          onPick={(lat, lon) => {
            const coord = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
            setLocation(coord);
            setDebouncedLocation(coord);
            setShowMapPicker(false);
          }}
        />
      )}
    </div>
  );
}

// Map Picker Modal (local to SearchPage for manual coordinate selection)
function MapPickerModal({ center, onPick, onClose }: { center: [number, number]; onPick: (lat: number, lon: number) => void; onClose: () => void; }) {
  const [leafletReady, setLeafletReady] = useState(false);
  const [selected, setSelected] = useState<[number, number]>(center);
  useEffect(() => { setLeafletReady(true); }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h4 className="text-lg font-semibold">Pick location on map</h4>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon />
          </button>
        </div>
        <div className="h-[60vh]">
          {leafletReady ? (
            <PlainLeafletMap center={center} value={selected} onChange={(lat, lon) => setSelected([lat, lon])} />
          ) : (
            <div className="flex items-center justify-center h-full">Loading map...</div>
          )}
        </div>
        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">Lat: {selected[0].toFixed(6)}, Lon: {selected[1].toFixed(6)}</div>
          <div className="space-x-2">
            <button onClick={onClose} className="btn btn-outline">Cancel</button>
            <button onClick={() => { onPick(selected[0], selected[1]); }} className="btn btn-primary">Use this location</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal inline icon to avoid extra import noise
function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PlainLeafletMap({ center, value, onChange }: { center: [number, number]; value: [number, number]; onChange: (lat: number, lon: number) => void; }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (container && !mapInstance) {
      const map = L.map(container).setView(center, 12);
      setMapInstance(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });

      const m = L.marker(value, { icon: DefaultIcon, draggable: true }).addTo(map);
      setMarker(m);

      map.on('click', (e: any) => {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;
        m.setLatLng([lat, lon]);
        onChange(lat, lon);
      });

      m.on('dragend', () => {
        const pos = m.getLatLng();
        onChange(pos.lat, pos.lng);
      });
    }

    return () => {
      if (container) {
        // Remove on unmount
        const instance = mapInstance;
        if (instance) instance.remove();
      }
    };
  }, [container]);

  // Recenter map if center changes while modal is open
  useEffect(() => {
    if (mapInstance) {
      mapInstance.setView(center, mapInstance.getZoom() || 12);
    }
  }, [center, mapInstance]);

  // keep marker in sync when external value changes
  useEffect(() => {
    if (marker) {
      const current = marker.getLatLng();
      if (current.lat !== value[0] || current.lng !== value[1]) {
        marker.setLatLng(value);
      }
    }
  }, [value]);

  return <div ref={setContainer as any} style={{ height: '100%', width: '100%' }} />;
}

// Service Result Card Component
function ServiceResultCard({ service, distanceKm }: { service: any; distanceKm?: number }) {
  const area = (service.serviceArea && service.serviceArea.trim())
    || [service.city, service.district].filter(Boolean).join(', ')
    || [
      (service as any).locationCity,
      (service as any).locationDistrict
    ].filter(Boolean).join(', ')
    || 'Local area';

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
        <div className="relative animated-gradient-x px-6 py-4 min-h-[120px] flex flex-col justify-center">
          <div className="absolute inset-0 bg-white/20"></div>
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="mb-2 text-lg font-bold line-clamp-2 transition-colors" style={{ color: '#FFF4E6' }}>
                <span className="group-hover:text-white transition-colors">
                  {service.name}
                </span>
              </h3>
              <div className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-sm border border-primary-200 px-3 py-1 text-sm font-medium text-primary-700">
                <div className="mr-2 h-2 w-2 rounded-full bg-primary-500"></div>
                {service.category}
              </div>
            </div>
            {avgRating != null && (
              <div className="shrink-0 flex items-center rounded-lg bg-amber-100 border border-amber-200 px-3 py-2 shadow-sm">
                <Star className="mr-1.5 h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="font-bold text-amber-700">{Number(avgRating).toFixed(1)}</span>
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
            <div className="flex items-center rounded-lg border border-primary-200 bg-primary-50 p-2.5 transition-colors hover:bg-primary-100">
              <div className="mr-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary-100">
                <DollarSign className="h-4 w-4 text-primary-600" />
              </div>
              <div className="flex-1">
                <span className="text-base font-bold text-primary-600">{formatCurrency(service.price)}</span>
                <span className="ml-2 text-sm text-primary-500">starting price</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex items-center rounded-lg border border-secondary-200 bg-secondary-50 p-2.5">
                <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-secondary-100">
                  <Clock className="h-3 w-3 text-secondary-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-secondary-600">{service.durationMinutes}</div>
                  <div className="text-[10px] text-secondary-500">minutes</div>
                </div>
              </div>
              
              <div className="flex items-center rounded-lg border border-accent-200 bg-accent-50 p-2.5">
                <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent-100">
                  <MapPin className="h-3 w-3 text-accent-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[10px] font-semibold text-accent-600">{area}</div>
                  <div className="text-[10px] text-accent-500">service area</div>
                </div>
              </div>
            </div>
          </div>

          {/* Provider info */}
          <div className="mt-auto">
            <div className="flex items-center justify-between rounded-xl border border-warm-200 bg-warm-50 p-4">
              <div className="flex items-center min-w-0">
                                <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-white sunset-shadow animate-float">
                    <span className="font-bold text-lg">
                      {providerName.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-warm-800">
                    {providerName}
                  </p>
                  {contactName && (
                    <p className="truncate text-xs text-warm-500">
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
                      <span className="text-xs text-warm-400">
                        {service.serviceProvider.yearsOfExperience} years exp.
                      </span>
                    )}
                    {typeof distanceKm === 'number' && !isNaN(distanceKm) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-light-100 border border-light-200 px-2 py-0.5 text-xs font-semibold text-light-600">
                        <MapPin className="h-3 w-3" />
                        {distanceKm.toFixed(1)} km away
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