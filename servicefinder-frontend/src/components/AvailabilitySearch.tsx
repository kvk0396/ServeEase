import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  Star,
  Phone,
  User,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';

import ThemedSelect from './ThemedSelect';
import { apiClient } from '../lib/api';
import { formatDate, formatTime, cn } from '../lib/utils';
import type { AvailabilitySlot, AvailabilitySearchRequest } from '../types';

interface AvailabilitySearchProps {
  serviceType?: string;
  onSlotSelect?: (slot: AvailabilitySlot) => void;
  showProviderInfo?: boolean;
  maxResults?: number;
}

export default function AvailabilitySearch({ 
  serviceType, 
  onSlotSelect, 
  showProviderInfo = true,
  maxResults = 20 
}: AvailabilitySearchProps) {
  const [searchParams, setSearchParams] = useState<AvailabilitySearchRequest>({
    serviceType: serviceType || '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next 7 days
    radiusKm: 25,
    limit: maxResults,
    sortByTime: true,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Get user's location for proximity search
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSearchParams(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          if (import.meta.env.DEV) console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  // Search available slots
  const {
    data: availableSlots = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['availability-search', searchParams],
    queryFn: () => apiClient.searchAvailability(searchParams),
    enabled: !!searchParams.startDate && !!searchParams.endDate,
  });

  // Group slots by date for better visualization
  const slotsByDate = availableSlots.reduce((acc: Record<string, AvailabilitySlot[]>, slot: AvailabilitySlot) => {
    const date = slot.startDateTime.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  const handleSearch = () => {
    refetch();
  };

  const updateSearchParam = (key: keyof AvailabilitySearchRequest, value: any) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };

  const getAvailableToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return slotsByDate[today] || [];
  };

  const getAvailableTomorrow = () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return slotsByDate[tomorrow] || [];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Search Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-primary-700">Find Available Times</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm text-primary-600 hover:text-primary-700"
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </button>
        </div>

        {/* Basic Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <input
              type="text"
              value={searchParams.serviceType || ''}
              onChange={(e) => updateSearchParam('serviceType', e.target.value)}
              placeholder="e.g., plumbing, electrical"
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={searchParams.startDate}
              onChange={(e) => updateSearchParam('startDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={searchParams.endDate}
              onChange={(e) => updateSearchParam('endDate', e.target.value)}
              min={searchParams.startDate}
              className="input w-full"
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={searchParams.durationMinutes || ''}
                onChange={(e) => updateSearchParam('durationMinutes', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="e.g., 120"
                min="15"
                step="15"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Radius (km)
              </label>
              <ThemedSelect
                value={String(searchParams.radiusKm || 25)}
                onChange={(v: string) => updateSearchParam('radiusKm', parseInt(v))}
                options={[5,10,25,50,100].map((km) => ({ value: String(km), label: `${km} km` }))}
                placeholder="Search Radius"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Start Time
              </label>
              <input
                type="time"
                value={searchParams.preferredStartTime || ''}
                onChange={(e) => updateSearchParam('preferredStartTime', e.target.value)}
                className="input w-full"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="btn btn-primary mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Search Available Times
            </>
          )}
        </button>
      </div>

      {/* Quick Access */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setSearchParams(prev => ({ ...prev, startDate: today, endDate: today }));
            }}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Available Today ({getAvailableToday().length})
          </button>
          <button
            onClick={() => {
              const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
              setSearchParams(prev => ({ ...prev, startDate: tomorrow, endDate: tomorrow }));
            }}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Available Tomorrow ({getAvailableTomorrow().length})
          </button>
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
              setSearchParams(prev => ({ ...prev, startDate: today, endDate: nextWeek }));
            }}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Next 7 Days ({availableSlots.length})
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
            <p className="text-gray-600">Searching for available times...</p>
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No availability found</h4>
            <p className="text-gray-600">Try adjusting your search criteria or date range.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(slotsByDate).map(([date, slots]) => {
              const typedSlots = slots as AvailabilitySlot[];
              return (
                <div key={date} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h4 className="font-medium text-gray-900">
                      {formatDate(date)} ({typedSlots.length} slots available)
                    </h4>
                  </div>
                  <div className="divide-y">
                    {typedSlots.map((slot) => (
                      <AvailabilitySlotCard
                        key={slot.id}
                        slot={slot}
                        showProviderInfo={showProviderInfo}
                        onSelect={() => onSlotSelect?.(slot)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Individual slot card component
function AvailabilitySlotCard({ 
  slot, 
  showProviderInfo, 
  onSelect 
}: { 
  slot: AvailabilitySlot; 
  showProviderInfo: boolean; 
  onSelect: () => void; 
}) {
  const startTime = formatTime(slot.startDateTime);
  const endTime = formatTime(slot.endDateTime);
  const duration = `${slot.durationMinutes} min`;

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-2">
            <div className="flex items-center text-primary-600">
              <Clock className="w-4 h-4 mr-1" />
              <span className="font-medium">{startTime} - {endTime}</span>
              <span className="text-sm text-gray-500 ml-2">({duration})</span>
            </div>
            {slot.distance && (
              <div className="flex items-center text-gray-500 text-sm">
                <MapPin className="w-3 h-3 mr-1" />
                {slot.distance.toFixed(1)} km away
              </div>
            )}
          </div>

          {showProviderInfo && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                <span>{slot.provider.businessName}</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                <span>{slot.provider.averageRating.toFixed(1)}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                <span>{slot.provider.phoneNumber}</span>
              </div>
            </div>
          )}

          {slot.availableServices.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-2">
                {slot.availableServices.slice(0, 3).map((service) => (
                  <span
                    key={service.id}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {service.name} (${service.price})
                  </span>
                ))}
                {slot.availableServices.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{slot.availableServices.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {slot.notes && (
            <p className="text-sm text-gray-600 mt-2">{slot.notes}</p>
          )}
        </div>

        <button
          onClick={onSelect}
          className="btn btn-primary btn-sm ml-4"
        >
          Select Time
        </button>
      </div>
    </div>
  );
} 