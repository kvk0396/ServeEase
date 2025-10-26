import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Star,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Settings
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useToastNotifications } from '../../hooks/useToastNotifications';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import type { Booking } from '../../types';

export default function ProviderProfile() {
  const { user } = useAuthStore();
  const { notifyProfileUpdated, notifyError } = useToastNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const queryClient = useQueryClient();

  // Fetch provider ratings data
  const { data: ratingsData, isLoading: ratingsLoading } = useQuery({
    queryKey: ['provider-ratings-stats'],
    queryFn: () => apiClient.getMyProviderRatings({ page: 0, size: 1000 }), // Get all ratings for stats
  });

  // Fetch provider bookings data
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['provider-bookings-stats'],
    queryFn: () => apiClient.getProviderBookings({ page: 0, size: 1000 }), // Get all bookings for stats
  });

  // Calculate real stats from API data
  const ratings = ratingsData?.content || [];
  const bookings = bookingsData?.content || [];
  
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length 
    : 0;
  
  const totalReviews = ratings.length;
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((b: any) => b.status === 'COMPLETED').length;

  // Fetch user profile data
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => apiClient.getUserProfile(),
    enabled: !!user && !!user.token,
  });

  // Profile data - mix of user data and editable fields
  const [profileData, setProfileData] = useState({
    businessName: user?.fullName || 'Your Business Name',
    contactName: user?.fullName || 'Your Name',
    email: user?.email || '',
    phoneNumber: '',
    address: '',
    website: '',
    description: 'Professional services provider committed to quality and customer satisfaction.',
    serviceAreas: ['City Center', 'Suburbs'],
    businessHours: {
      monday: { open: '08:00', close: '18:00', isOpen: true },
      tuesday: { open: '08:00', close: '18:00', isOpen: true },
      wednesday: { open: '08:00', close: '18:00', isOpen: true },
      thursday: { open: '08:00', close: '18:00', isOpen: true },
      friday: { open: '08:00', close: '18:00', isOpen: true },
      saturday: { open: '09:00', close: '17:00', isOpen: true },
      sunday: { open: '10:00', close: '16:00', isOpen: false },
    },
    verificationStatus: 'PENDING',
    joinDate: '2024-01-01',
    responseTime: 'Within 24 hours',
  });

  // Update profile data when user profile is fetched
  useEffect(() => {
    if (userProfile) {
      setProfileData(prev => ({
        ...prev,
        businessName: userProfile.businessName || prev.businessName,
        contactName: userProfile.fullName || `${userProfile.firstName} ${userProfile.lastName}` || prev.contactName,
        email: userProfile.email || prev.email,
        phoneNumber: userProfile.phoneNumber || prev.phoneNumber,
        address: userProfile.address || prev.address,
        description: userProfile.description || prev.description,
        verificationStatus: userProfile.verificationStatus || prev.verificationStatus,
      }));
    }
  }, [userProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => {
      return apiClient.updateUserProfile(data);
    },
    onSuccess: () => {
      // This will show both toast and in-app notification
      notifyProfileUpdated();
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: () => {
      notifyError('Failed to update profile');
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data here if needed
  };

  const tabs = [
    { id: 'profile', label: 'Business Profile', icon: Building2 },
    { id: 'hours', label: 'Business Hours', icon: Clock },
    { id: 'verification', label: 'Verification', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-700 mb-4">Business Profile</h1>
            <p className="text-lg text-gray-600">Manage your business information and settings</p>
          </div>
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="btn btn-outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="btn btn-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              {ratingsLoading ? (
                <div className="flex items-center">
                  <div className="loading-spinner w-4 h-4 mr-2"></div>
                  <span className="text-gray-500">Loading...</span>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-yellow-600">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">{totalReviews} reviews</p>
                </>
              )}
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              {bookingsLoading ? (
                <div className="flex items-center">
                  <div className="loading-spinner w-4 h-4 mr-2"></div>
                  <span className="text-gray-500">Loading...</span>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-blue-600">{totalBookings}</p>
                  <p className="text-xs text-gray-500">{completedBookings} completed</p>
                </>
              )}
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className="text-2xl font-bold text-green-600">{profileData.responseTime}</p>
              <p className="text-xs text-gray-500">Average response</p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verification</p>
              <p className="text-lg font-bold text-green-600">
                {profileData.verificationStatus === 'VERIFIED' ? 'Verified' : 'Pending'}
              </p>
              <p className="text-xs text-gray-500">Business status</p>
            </div>
            <Shield className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <ProfileTab
              profileData={profileData}
              setProfileData={setProfileData}
              isEditing={isEditing}
            />
          )}
          {activeTab === 'hours' && (
            <BusinessHoursTab
              businessHours={profileData.businessHours}
              setBusinessHours={(hours) => setProfileData({ ...profileData, businessHours: hours })}
              isEditing={isEditing}
            />
          )}
          {activeTab === 'verification' && (
            <VerificationTab profileData={profileData} />
          )}
          {activeTab === 'settings' && (
            <SettingsTab />
          )}
        </div>
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ 
  profileData, 
  setProfileData, 
  isEditing 
}: { 
  profileData: any; 
  setProfileData: (data: any) => void; 
  isEditing: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.businessName}
              onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
              className="input w-full"
            />
          ) : (
            <p className="text-gray-900">{profileData.businessName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.contactName}
              onChange={(e) => setProfileData({ ...profileData, contactName: e.target.value })}
              className="input w-full"
            />
          ) : (
            <p className="text-gray-900">{profileData.contactName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          {isEditing ? (
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="input w-full"
            />
          ) : (
            <p className="text-gray-900">{profileData.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={profileData.phoneNumber}
              onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
              className="input w-full"
            />
          ) : (
            <p className="text-gray-900">{profileData.phoneNumber}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Address
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              className="input w-full"
            />
          ) : (
            <p className="text-gray-900">{profileData.address}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          {isEditing ? (
            <input
              type="url"
              value={profileData.website}
              onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
              className="input w-full"
              placeholder="https://your-website.com"
            />
          ) : (
            <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
              {profileData.website}
            </a>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Description
          </label>
          {isEditing ? (
            <textarea
              value={profileData.description}
              onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
              className="input w-full h-32"
              placeholder="Describe your business and services..."
            />
          ) : (
            <p className="text-gray-900">{profileData.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Business Hours Tab Component
function BusinessHoursTab({ 
  businessHours, 
  setBusinessHours, 
  isEditing 
}: { 
  businessHours: any; 
  setBusinessHours: (hours: any) => void; 
  isEditing: boolean;
}) {
  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  const updateDay = (day: string, field: string, value: any) => {
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-primary-700">Business Hours</h3>
      
      <div className="space-y-4">
        {days.map((day) => (
          <div key={day.key} className="flex items-center justify-between p-4 border border-primary-200 rounded-lg bg-gradient-to-r from-primary-50/30 to-primary-100/30 hover:from-primary-50/50 hover:to-primary-100/50 transition-all duration-300">
            <div className="flex items-center">
              <span className="font-medium text-primary-700 w-24">{day.label}</span>
              {isEditing ? (
                <label className="flex items-center ml-4">
                  <input
                    type="checkbox"
                    checked={businessHours[day.key].isOpen}
                    onChange={(e) => updateDay(day.key, 'isOpen', e.target.checked)}
                    className="rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-primary-600">Open</span>
                </label>
              ) : (
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium shadow-sm',
                  businessHours[day.key].isOpen
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                )}>
                  {businessHours[day.key].isOpen ? 'Open' : 'Closed'}
                </span>
              )}
            </div>
            
            {businessHours[day.key].isOpen && (
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <input
                      type="time"
                      value={businessHours[day.key].open}
                      onChange={(e) => updateDay(day.key, 'open', e.target.value)}
                      className="input text-sm"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={businessHours[day.key].close}
                      onChange={(e) => updateDay(day.key, 'close', e.target.value)}
                      className="input text-sm"
                    />
                  </>
                ) : (
                  <span className="text-primary-600 font-medium">
                    {businessHours[day.key].open} - {businessHours[day.key].close}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Verification Tab Component
function VerificationTab({ profileData }: { profileData: any }) {
  const verificationSteps = [
    {
      title: 'Business License',
      status: 'completed',
      description: 'Upload your business license or registration documents',
    },
    {
      title: 'Identity Verification',
      status: 'completed',
      description: 'Verify your identity with government-issued ID',
    },
    {
      title: 'Address Verification',
      status: 'completed',
      description: 'Confirm your business address',
    },
    {
      title: 'Insurance Documentation',
      status: 'pending',
      description: 'Upload proof of business insurance',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-primary-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-primary-700">Verification Status</h3>
        <span className={cn(
          'px-3 py-1 rounded-full text-sm font-medium shadow-sm',
          profileData.verificationStatus === 'VERIFIED'
            ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white'
            : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
        )}>
          {profileData.verificationStatus === 'VERIFIED' ? 'Verified Business' : 'Verification Pending'}
        </span>
      </div>

      <div className="space-y-4">
        {verificationSteps.map((step, index) => (
          <div key={index} className="flex items-start p-4 border border-primary-200 rounded-lg bg-gradient-to-r from-primary-50/30 to-primary-100/30 hover:from-primary-50/50 hover:to-primary-100/50 transition-all duration-300">
            <div className="flex-shrink-0 mr-3">
              {getStatusIcon(step.status)}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-primary-700">{step.title}</h4>
              <p className="text-sm text-primary-600 mt-1">{step.description}</p>
              {step.status === 'pending' && (
                <button className="btn btn-primary btn-sm mt-2">
                  Upload Documents
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Why verify your business?</h4>
            <p className="text-sm text-blue-700 mt-1">
              Verified businesses get more bookings, higher trust from customers, and access to premium features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const [privacy, setPrivacy] = useState({
    showPhoneNumber: true,
    showEmail: false,
    showAddress: true,
  });

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-3 text-sm text-gray-700">Email notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={notifications.sms}
              onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-3 text-sm text-gray-700">SMS notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={notifications.push}
              onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-3 text-sm text-gray-700">Push notifications</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={privacy.showPhoneNumber}
              onChange={(e) => setPrivacy({ ...privacy, showPhoneNumber: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-3 text-sm text-gray-700">Show phone number on profile</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={privacy.showEmail}
              onChange={(e) => setPrivacy({ ...privacy, showEmail: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-3 text-sm text-gray-700">Show email address on profile</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={privacy.showAddress}
              onChange={(e) => setPrivacy({ ...privacy, showAddress: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-3 text-sm text-gray-700">Show business address on profile</span>
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button className="btn btn-primary">Save Settings</button>
      </div>
    </div>
  );
} 