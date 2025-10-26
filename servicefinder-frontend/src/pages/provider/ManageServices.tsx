import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Clock,
  MapPin,
  Star,
  Users,
  Calendar,
  X,
  Check,
  AlertTriangle,
  MapPin as MapPinIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { useToastNotifications } from '../../hooks/useToastNotifications';

import ThemedSelect from '../../components/ThemedSelect';
import { apiClient } from '../../lib/api';
import { formatCurrency, cn } from '../../lib/utils';
import type { Service } from '../../types';
import BackButton from '../../components/BackButton';

const categories = [
  'Home Cleaning',
  'Plumbing',
  'Electrical',
  'Gardening',
  'Painting',
  'Carpentry',
  'HVAC',
  'Appliance Repair',
  'Pest Control',
  'Moving',
  'Photography',
  'Tutoring',
  'Personal Training',
  'Pet Care',
  'Other'
];

const statusOptions = [
  { value: 'all', label: 'All Services' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function ManageServices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const queryClient = useQueryClient();
  const { notifyServiceCreated, notifyServiceUpdated, notifySuccess, notifyError } = useToastNotifications();

  const {
    data: services,
    isLoading: servicesLoading
  } = useQuery({
    queryKey: ['provider-services'],
    queryFn: () => apiClient.getMyServices(),
  });

  const createServiceMutation = useMutation({
    mutationFn: (data: any) => apiClient.createService(data),
    onSuccess: (service, variables) => {
      // This will show both toast and in-app notification
      notifyServiceCreated(variables.name || 'Service');
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      setShowCreateModal(false);
    },
    onError: (error: any) => {
      notifyError(error.response?.data?.message || 'Failed to create service');
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiClient.updateService(id, data),
    onSuccess: (service, { data }) => {
      // This will show both toast and in-app notification
      notifyServiceUpdated(data.name || 'Service');
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      setEditingService(null);
    },
    onError: (error: any) => {
      notifyError(error.response?.data?.message || 'Failed to update service');
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteService(id),
    onSuccess: () => {
      toast.success('Service deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      setDeletingService(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete service');
    },
  });

  // Bulk operations mutations
  const bulkDeleteMutation = useMutation({
    mutationFn: async (serviceIds: number[]) => {
      await Promise.all(serviceIds.map(id => apiClient.deleteService(id)));
    },
    onSuccess: () => {
      toast.success(`${selectedServices.length} services deleted successfully!`);
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      setSelectedServices([]);
      setShowBulkActions(false);
    },
    onError: (error: any) => {
      toast.error('Failed to delete some services');
    },
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({ serviceIds, active }: { serviceIds: number[]; active: boolean }) => {
      await Promise.all(serviceIds.map(id => apiClient.updateService(id, { active })));
    },
    onSuccess: (_, { active }) => {
      toast.success(`${selectedServices.length} services ${active ? 'activated' : 'deactivated'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      setSelectedServices([]);
      setShowBulkActions(false);
    },
    onError: (error: any) => {
      toast.error('Failed to update some services');
    },
  });

  // Helper functions for selection management
  const toggleServiceSelection = (serviceId: number) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const toggleSelectAll = () => {
    const currentFiltered = filteredServices || [];
    if (selectedServices.length === currentFiltered.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(currentFiltered.map(service => service.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedServices.length === 0) return;
    bulkDeleteMutation.mutate(selectedServices);
  };

  const handleBulkStatusUpdate = (active: boolean) => {
    if (selectedServices.length === 0) return;
    bulkUpdateStatusMutation.mutate({ serviceIds: selectedServices, active });
  };

  const filteredServices = (services || []).filter((service: Service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' ? service.active : !service.active);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Service statistics
  const serviceStats = {
    total: services?.length || 0,
    active: services?.filter(s => s.active).length || 0,
    inactive: services?.filter(s => !s.active).length || 0,
    categories: [...new Set(services?.map(s => s.category) || [])].length,
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-primary-700 mb-4">Manage Services</h1>
            <p className="text-lg text-black">Create and manage your service offerings</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary gradient-primary text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/95 rounded-xl border border-primary-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-700">{serviceStats.total}</p>
              <p className="text-sm text-secondary-600">Total Services</p>
            </div>
          </div>
        </div>

        <div className="bg-white/95 rounded-xl border border-primary-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-accent-100 text-accent-600 mr-4">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-accent-700">{serviceStats.active}</p>
              <p className="text-sm text-secondary-600">Active Services</p>
            </div>
          </div>
        </div>

        <div className="bg-white/95 rounded-xl border border-primary-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-error-100 text-error-600 mr-4">
              <X className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-error-700">{serviceStats.inactive}</p>
              <p className="text-sm text-secondary-600">Inactive Services</p>
            </div>
          </div>
        </div>

        <div className="bg-white/95 rounded-xl border border-primary-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-secondary-100 text-secondary-600 mr-4">
              <Filter className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-700">{serviceStats.categories}</p>
              <p className="text-sm text-secondary-600">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/95 rounded-xl border border-primary-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium border',
                  statusFilter === option.value
                    ? 'bg-primary-100 text-primary-700 border-primary-300'
                    : 'bg-white/80 text-secondary-700 hover:bg-primary-50 border-primary-200'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <ThemedSelect
              value={categoryFilter}
              onChange={(v: string) => setCategoryFilter(v)}
              options={[{ value: 'all', label: 'All Categories' }, ...categories.map((c) => ({ value: c, label: c }))]}
              placeholder="All Categories"
              className="sm:w-64"
            />

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedServices.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-primary-700">
                {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkStatusUpdate(true)}
                  disabled={bulkUpdateStatusMutation.isPending}
                  className="btn btn-sm bg-accent-100 text-accent-700 hover:bg-accent-200 border-accent-300"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Activate
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate(false)}
                  disabled={bulkUpdateStatusMutation.isPending}
                  className="btn btn-sm bg-warm-100 text-warm-800 hover:bg-warm-200 border-warm-300"
                >
                  <X className="w-4 h-4 mr-1" />
                  Deactivate
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteMutation.isPending}
                  className="btn btn-sm bg-error-100 text-error-700 hover:bg-error-200 border-error-300"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
            <button
              onClick={() => setSelectedServices([])}
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Services List */}
      {servicesLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-secondary-600">Loading services...</span>
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service: Service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={setEditingService}
              onDelete={setDeletingService}
              isSelected={selectedServices.includes(service.id)}
              onToggleSelect={() => toggleServiceSelection(service.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-primary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary-700 mb-2">No services found</h3>
          <p className="text-secondary-600 mb-6">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first service to start receiving bookings'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary gradient-primary text-white"
          >
            Create Your First Service
          </button>
        </div>
      )}

      {/* Create Service Modal */}
      {showCreateModal && (
        <ServiceModal
          onSubmit={(data) => createServiceMutation.mutate(data)}
          onClose={() => setShowCreateModal(false)}
          isSubmitting={createServiceMutation.isPending}
        />
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <ServiceModal
          service={editingService}
          onSubmit={(data) => updateServiceMutation.mutate({ id: editingService.id, data })}
          onClose={() => setEditingService(null)}
          isSubmitting={updateServiceMutation.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingService && (
        <DeleteConfirmationModal
          service={deletingService}
          onConfirm={() => deleteServiceMutation.mutate(deletingService.id)}
          onCancel={() => setDeletingService(null)}
          isDeleting={deleteServiceMutation.isPending}
        />
      )}
    </div>
  );
}

// Service Card Component
function ServiceCard({ 
  service, 
  onEdit, 
  onDelete,
  isSelected = false,
  onToggleSelect
}: { 
  service: Service; 
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}) {
  return (
    <div className={cn(
      "bg-white/95 rounded-xl border border-primary-200 overflow-hidden",
      isSelected && "ring-2 ring-primary-500 border-primary-300"
    )}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          {onToggleSelect && (
            <div className="mr-3 mt-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelect}
                className="rounded border-primary-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="font-semibold text-primary-700 mr-2">{service.name}</h3>
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                service.active
                  ? 'bg-accent-100 text-accent-800'
                  : 'bg-error-100 text-error-800'
              )}>
                {service.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-secondary-600 mb-2">{service.category}</p>
          </div>
        </div>

        <p className="text-secondary-600 text-sm mb-4 line-clamp-3">
          {service.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-secondary-600">
            <DollarSign className="w-4 h-4 mr-2 text-accent-600" />
            {formatCurrency(service.price)} starting price
          </div>
          <div className="flex items-center text-sm text-secondary-600">
            <Clock className="w-4 h-4 mr-2 text-secondary-600" />
            {service.durationMinutes} minutes
          </div>
          {service.serviceArea && (
            <div className="flex items-center text-sm text-secondary-600">
              <MapPin className="w-4 h-4 mr-2 text-warm-600" />
              {service.serviceArea}
            </div>
          )}
          {service.serviceProvider?.averageRating && (
            <div className="flex items-center text-sm text-secondary-600">
              <Star className="w-4 h-4 mr-2 text-warm-500" />
              {service.serviceProvider.averageRating.toFixed(1)} rating
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-primary-200">
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(service)}
              className="btn btn-outline btn-sm border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </button>
            <button
              onClick={() => onDelete(service)}
              className="btn btn-primary btn-sm"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Service Modal Component
function ServiceModal({
  service,
  onSubmit,
  onClose,
  isSubmitting
}: {
  service?: Service;
  onSubmit: (data: any) => void;
  onClose: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || '',
    price: service?.price || 0,
    durationMinutes: service?.durationMinutes || 60,
    isActive: service?.active ?? true,
    serviceArea: service?.serviceArea || '',
    city: service?.city || '',
    district: service?.district || '',
    state: service?.state || '',
    country: service?.country || '',
    postalCode: service?.postalCode || '',
    latitude: service?.latitude ?? undefined,
    longitude: service?.longitude ?? undefined,
    serviceRadiusKm: service?.serviceRadiusKm ?? 20,
  });
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // India default
  const [mapError, setMapError] = useState<string | null>(null);

  const handleOpenMap = async () => {
    setMapError(null);
    setShowMap(true);
    try {
      const query = encodeURIComponent(`${formData.postalCode}, ${formData.city}, ${formData.state}, ${formData.country}`);
      const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
      const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (resp.ok) {
        const results = await resp.json();
        if (Array.isArray(results) && results.length > 0) {
          const { lat, lon } = results[0];
          if (lat && lon) setMapCenter([parseFloat(lat), parseFloat(lon)]);
        } else {
          setMapError('Could not center map from address. You can still pick on map.');
        }
      } else {
        setMapError('Failed to fetch map location.');
      }
    } catch (e) {
      setMapError('Failed to fetch map location.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Service name is required');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Service description is required');
      return;
    }
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    
    if (formData.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    
    if (formData.durationMinutes <= 0) {
      toast.error('Duration must be greater than 0');
      return;
    }

    if (!formData.serviceArea.trim()) {
      toast.error('Service area (City, District) is required');
      return;
    }

    if (!formData.city.trim() || !formData.district.trim() || !formData.state.trim() || !formData.country.trim() || !formData.postalCode.trim()) {
      toast.error('Please fill City, District, State, Country, and Postal Code');
      return;
    }

    // Auto-geocode to fetch lat/lon if not provided
    try {
      if (formData.latitude == null || formData.longitude == null) {
        const query = encodeURIComponent(`${formData.city}, ${formData.district}, ${formData.state}, ${formData.country}, ${formData.postalCode}`);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
        const resp = await fetch(url, {
          headers: { 'Accept': 'application/json' }
        });
        if (resp.ok) {
          const results = await resp.json();
          if (Array.isArray(results) && results.length > 0) {
            const { lat, lon } = results[0];
            if (lat && lon) {
              formData.latitude = parseFloat(lat);
              formData.longitude = parseFloat(lon);
            }
          }
        }
      }
    } catch (geocodeErr) {
      if (import.meta.env.DEV) console.warn('Geocoding failed, proceeding without lat/lon', geocodeErr);
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 rounded-xl border border-primary-200 max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6 border-b border-primary-200 bg-gradient-to-r from-primary-50 to-white relative rounded-t-xl">
          <h3 className="text-xl font-semibold text-primary-700 flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary-100 text-primary-700">
              <MapPinIcon className="w-5 h-5" />
            </span>
            {service ? 'Edit Service' : 'Create New Service'}
          </h3>
          <p className="text-sm text-secondary-600 mt-1">Provide complete location details so customers nearby can find you easily.</p>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-md text-secondary-400 hover:text-primary-600 hover:bg-primary-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Service Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input w-full"
                placeholder="e.g., Home Deep Cleaning"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Category *
              </label>
              <ThemedSelect
                value={formData.category}
                onChange={(v: string) => setFormData({ ...formData, category: v })}
                options={[{ value: '', label: 'Select a category' }, ...categories.map((c) => ({ value: c, label: c }))]}
                placeholder="Select a category"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Status
              </label>
              <ThemedSelect
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(v: string) => setFormData({ ...formData, isActive: v === 'active' })}
                options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Starting Price ($) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="input w-full"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
                className="input w-full"
                min="15"
                step="15"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input w-full h-32"
                placeholder="Describe your service in detail..."
                required
              />
            </div>

            {/* Service Area */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primary-700 mb-2">Service Area (City, District) *</label>
              <input
                type="text"
                value={formData.serviceArea}
                onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                className="input w-full"
                placeholder="e.g., Chennai, Chennai District"
                required
              />
            </div>

            {/* Address grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">City *</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="input w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">District *</label>
                <input type="text" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className="input w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">State *</label>
                <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="input w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Country *</label>
                <input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="input w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Postal Code *</label>
                <input type="text" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} className="input w-full" required />
              </div>
            </div>

            {/* Coordinates and Map Button */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Latitude</label>
                <input type="number" value={formData.latitude ?? ''} onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : undefined })} className="input w-full" step="0.000001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Longitude</label>
                <input type="number" value={formData.longitude ?? ''} onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : undefined })} className="input w-full" step="0.000001" />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={handleOpenMap} className="btn btn-outline w-full justify-center whitespace-nowrap border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400">
                  <MapPinIcon className="w-4 h-4 mr-2" /> Set on Map
                </button>
              </div>
            </div>

            {/* Radius */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primary-700 mb-2">Service Radius (km)</label>
              <input type="number" min={1} max={200} value={formData.serviceRadiusKm ?? 20} onChange={(e) => setFormData({ ...formData, serviceRadiusKm: parseInt(e.target.value) || 20 })} className="input w-full" />
              <p className="text-xs text-secondary-600 mt-1">Customers within this radius will see your service prominently.</p>
            </div>
          </div>

          <div className="flex space-x-3 pt-6 border-t border-primary-200">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1 border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary gradient-primary text-white flex-1">
              {isSubmitting ? (service ? 'Updating...' : 'Creating...') : (service ? 'Update Service' : 'Create Service')}
            </button>
          </div>
        </form>

        {/* Map Modal */}
        {showMap && (
          <MapPickerModal
            center={mapCenter}
            onClose={() => setShowMap(false)}
            onPick={(lat, lon) => {
              setFormData({ ...formData, latitude: lat, longitude: lon });
              setShowMap(false);
            }}
            error={mapError}
          />
        )}
      </div>
    </div>
  );
}

// Map Picker Modal using Leaflet
function MapPickerModal({ center, onPick, onClose, error }: { center: [number, number]; onPick: (lat: number, lon: number) => void; onClose: () => void; error: string | null; }) {
  const [leafletReady, setLeafletReady] = useState(false);
  const [selected, setSelected] = useState<[number, number]>(center);
  useEffect(() => { setLeafletReady(true); }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white/95 rounded-xl border border-primary-200 max-w-4xl w-full overflow-hidden">
        <div className="p-4 border-b border-primary-200 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-primary-700">Select Location on Map</h4>
          <button onClick={onClose} className="text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        {error && <div className="px-4 py-2 text-sm text-warm-800 bg-warm-50 border-b border-warm-200">{error}</div>}
        <div className="h-[60vh]">
          {leafletReady ? (
            <PlainLeafletMap center={center} value={selected} onChange={(lat, lon) => setSelected([lat, lon])} />
          ) : (
            <div className="flex items-center justify-center h-full text-secondary-600">Loading map...</div>
          )}
        </div>
        <div className="p-4 border-t border-primary-200 flex items-center justify-between">
          <div className="text-sm text-secondary-600">Lat: {selected[0].toFixed(6)}, Lon: {selected[1].toFixed(6)} (click map or drag pin)</div>
          <div className="space-x-2">
            <button onClick={onClose} className="btn btn-outline border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400">Cancel</button>
            <button onClick={() => { onPick(selected[0], selected[1]); onClose(); }} className="btn btn-primary gradient-primary text-white">Use this location</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlainLeafletMap({ center, value, onChange }: { center: [number, number]; value: [number, number]; onChange: (lat: number, lon: number) => void; }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView(center, 12);
      mapInstanceRef.current = map;

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

      markerRef.current = L.marker(value, { icon: DefaultIcon, draggable: true }).addTo(map);

      map.on('click', (e: any) => {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;
        markerRef.current.setLatLng([lat, lon]);
        onChange(lat, lon);
      });

      markerRef.current.on('dragend', () => {
        const pos = markerRef.current.getLatLng();
        onChange(pos.lat, pos.lng);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, onChange, value]);

  // keep marker in sync when external value changes
  useEffect(() => {
    if (markerRef.current) {
      const current = markerRef.current.getLatLng();
      if (current.lat !== value[0] || current.lng !== value[1]) {
        markerRef.current.setLatLng(value);
      }
    }
  }, [value]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
}

// Delete Confirmation Modal
function DeleteConfirmationModal({
  service,
  onConfirm,
  onCancel,
  isDeleting
}: {
  service: Service;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Delete Service</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>"{service.name}"</strong>? 
          This action cannot be undone and will affect any pending bookings.
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="btn btn-outline flex-1"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="btn btn-primary flex-1"
          >
            {isDeleting ? 'Deleting...' : 'Delete Service'}
          </button>
        </div>
      </div>
    </div>
  );
} 