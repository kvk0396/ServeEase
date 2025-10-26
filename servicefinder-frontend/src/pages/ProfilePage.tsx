import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Bell,
  Lock,
  Edit,
  Save,
  X,
  Camera,
  Settings,
  CreditCard,
  Globe,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Star,
  Clock,
  Languages,
  Palette
} from 'lucide-react';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

import ThemedSelect from '../components/ThemedSelect';
import { useAuthStore, isProvider } from '../store/authStore';
import { formatDate, cn } from '../lib/utils';
import { apiClient } from '../lib/api';

export default function ProfilePage() {
  const { user, token, logout, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const [profileData, setProfileData] = useState(() => {
    // Get additional user data from localStorage if available
    const storedUser = localStorage.getItem('user');
    let additionalUserData = {};
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        additionalUserData = {
          phoneNumber: parsedUser.phoneNumber || '',
          address: parsedUser.address || '',
          city: parsedUser.city || '',
          state: parsedUser.state || '',
          postalCode: parsedUser.postalCode || '',
          country: parsedUser.country || '',
        };
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }

    return {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: (additionalUserData as any).phoneNumber || '',
      address: (additionalUserData as any).address || '',
      city: (additionalUserData as any).city || '',
      state: (additionalUserData as any).state || '',
      postalCode: (additionalUserData as any).postalCode || '',
      country: (additionalUserData as any).country || '',
      
      bio: '',
      profileImage: '',
      // Provider-specific fields
      businessName: '',
      businessDescription: '',
      businessAddress: '',
      businessPhone: '',
      businessWebsite: '',
      yearsOfExperience: 0,
      hourlyRate: 0,
      serviceRadiusKm: 50,
      businessHours: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '09:00', close: '17:00', closed: true },
      },
      serviceAreas: [] as string[],
      certifications: [] as string[],
      languages: ['English'] as string[],
    };
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bookingReminders: true,
    promotionalEmails: false,
    weeklyDigest: true,
    bookingUpdates: true,
    reminderNotifications: true,
    marketingUpdates: false,
    systemAlerts: true,
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showAddress: false,
    allowDirectMessages: true,
    showOnlineStatus: true,
  });

  // Fetch current user profile data
  const { data: userProfile, isLoading: profileLoading, error: profileError, refetch } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => apiClient.getUserProfile(),
    enabled: !!user && !!token && isAuthenticated,
    retry: 3,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update profile data when user profile is fetched
  useEffect(() => {
    if (import.meta.env.DEV) console.log('Query state:', { userProfile, profileLoading, profileError, user: !!user, token: !!token });
    if (userProfile) {
      if (import.meta.env.DEV) console.log('Profile data received from API:', userProfile);
      if (import.meta.env.DEV) console.log('Phone number from API:', userProfile.phoneNumber);
      if (import.meta.env.DEV) console.log('Address from API:', userProfile.address);
      
      setProfileData(prev => ({
        ...prev,
        fullName: userProfile.fullName || `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || prev.fullName,
        email: userProfile.email || prev.email,
        phoneNumber: userProfile.phoneNumber || userProfile.phone || '',
        address: userProfile.address || userProfile.fullAddress || '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        postalCode: userProfile.postalCode || userProfile.zipCode || '',
        country: userProfile.country || '',
        // Provider-specific fields (if user is a provider)
        businessName: userProfile.businessName || prev.businessName,
        businessDescription: userProfile.description || prev.businessDescription,
        yearsOfExperience: userProfile.yearsOfExperience || prev.yearsOfExperience,
        hourlyRate: userProfile.hourlyRate || prev.hourlyRate,
        workingHours: userProfile.workingHours || prev.businessHours,
        serviceRadiusKm: userProfile.serviceRadiusKm || prev.serviceRadiusKm,
      }));
      
      if (import.meta.env.DEV) console.log('Updated profile data:', {
        phoneNumber: userProfile.phoneNumber || userProfile.phone || '',
        address: userProfile.address || userProfile.fullAddress || ''
      });
    }
  }, [userProfile, profileLoading, profileError]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      if (import.meta.env.DEV) console.log('Updating profile with data:', data);
      return apiClient.updateUserProfile(data);
    },
    onSuccess: (response) => {
      if (import.meta.env.DEV) console.log('Profile update successful:', response);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      // Manually trigger a refetch to ensure fresh data
      setTimeout(() => {
        refetch();
      }, 500);
    },
    onError: (error) => {
      if (import.meta.env.DEV) console.error('Profile update failed:', error);
      toast.error('Failed to update profile');
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      // Mock file upload - replace with actual upload logic
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return URL.createObjectURL(file);
    },
    onSuccess: (imageUrl) => {
      toast.success('Profile image updated successfully!');
      setProfileData(prev => ({ ...prev, profileImage: imageUrl }));
      setProfileImageFile(null);
    },
    onError: () => {
      toast.error('Failed to upload image');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      // Mock API call - replace with actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordFields(false);
    },
    onError: () => {
      toast.error('Failed to change password');
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async (settings: any) => {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      return settings;
    },
    onSuccess: () => {
      toast.success('Notification settings updated!');
    },
    onError: () => {
      toast.error('Failed to update notification settings');
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (prefs: any) => {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      return prefs;
    },
    onSuccess: () => {
      toast.success('Preferences updated!');
    },
    onError: () => {
      toast.error('Failed to update preferences');
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
    onSuccess: () => {
      toast.success('Account deleted successfully');
      logout();
    },
    onError: () => {
      toast.error('Failed to delete account');
    },
  });



  // Helper functions
  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      setProfileImageFile(file);
      uploadImageMutation.mutate(file);
    }
  };

  const handleBusinessHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setProfileData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day as keyof typeof prev.businessHours],
          [field]: value,
        },
      },
    }));
  };

  const addServiceArea = (area: string) => {
    if (area.trim() && !profileData.serviceAreas.includes(area.trim())) {
      setProfileData(prev => ({
        ...prev,
        serviceAreas: [...prev.serviceAreas, area.trim()],
      }));
    }
  };

  const removeServiceArea = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter((_, i) => i !== index),
    }));
  };

  const addCertification = (cert: string) => {
    if (cert.trim() && !profileData.certifications.includes(cert.trim())) {
      setProfileData(prev => ({
        ...prev,
        certifications: [...prev.certifications, cert.trim()],
      }));
    }
  };

  const removeCertification = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    changePasswordMutation.mutate(passwordData);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      deleteAccountMutation.mutate();
    }
  };

  const handleRefreshProfile = async () => {
    console.log('Manually refreshing profile data...');
    try {
      const result = await refetch();
      console.log('Manual refresh result:', result.data);
      if (result.data) {
        toast.success('Profile data refreshed!');
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      toast.error('Failed to refresh profile data');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    ...(isProvider(user) ? [
      { id: 'business', label: 'Business', icon: CreditCard },
      { id: 'hours', label: 'Hours & Areas', icon: Clock },
    ] : []),
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
          <div>
        <h1 className="text-3xl font-bold text-primary-700 mb-4">Account Settings</h1>
        <p className="text-lg text-gray-600">Manage your account information and preferences</p>
          </div>
        </div>
      </div>

      {/* Profile Summary Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-primary-600" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700">
              <Camera className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-primary-700">{user?.fullName}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <div className="flex items-center mt-2">
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                user?.role === 'CUSTOMER' 
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              )}>
                {user?.role === 'CUSTOMER' ? 'Customer' : 'Service Provider'}
              </span>
              {user?.role === 'SERVICE_PROVIDER' && (
                <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Verified
                </span>
              )}
            </div>
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
              setIsEditing={setIsEditing}
              onSave={handleSaveProfile}
              isSaving={updateProfileMutation.isPending}
              profileLoading={profileLoading}
            />
          )}

          {activeTab === 'security' && (
            <SecurityTab
              passwordData={passwordData}
              setPasswordData={setPasswordData}
              onChangePassword={handleChangePassword}
              isChangingPassword={changePasswordMutation.isPending}
              onDeleteAccount={handleDeleteAccount}
              isDeletingAccount={deleteAccountMutation.isPending}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsTab
              settings={notificationSettings}
              setSettings={setNotificationSettings}
            />
          )}

          {activeTab === 'preferences' && (
            <PreferencesTab />
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
  isEditing, 
  setIsEditing, 
  onSave, 
  isSaving,
  profileLoading 
}: any) {
  if (profileLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading profile data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-primary-700">Personal Information</h3>
        {isEditing ? (
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditing(false)}
              className="btn btn-outline btn-sm"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="btn btn-primary btn-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-outline btn-sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.fullName}
              onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              className="input w-full"
            />
          ) : (
            <p className="text-gray-900">{profileData.fullName || 'Not provided'}</p>
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
            {profileLoading && <span className="text-xs text-blue-600 ml-2">(Loading...)</span>}
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={profileData.phoneNumber}
              onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
              className="input w-full"
              placeholder="Enter your phone number"
            />
          ) : (
                          <p className="text-gray-900">
                {profileData.phoneNumber || 'Not provided'}
                {profileLoading && <span className="text-xs text-blue-600 ml-2">(Loading...)</span>}
              </p>
          )}
        </div>



        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
            {profileLoading && <span className="text-xs text-blue-600 ml-2">(Loading...)</span>}
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              className="input w-full"
              placeholder="Enter your address"
            />
          ) : (
            <p className="text-gray-900">
              {profileData.address || 'Not provided'}
              {profileLoading && <span className="text-xs text-blue-600 ml-2">(Loading...)</span>}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          {isEditing ? (
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              className="input w-full h-24"
              placeholder="Tell us about yourself..."
              maxLength={500}
            />
          ) : (
            <p className="text-gray-900">{profileData.bio || 'No bio provided'}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Security Tab Component
function SecurityTab({ 
  passwordData, 
  setPasswordData, 
  onChangePassword, 
  isChangingPassword,
  onDeleteAccount,
  isDeletingAccount 
}: any) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-primary-700 mb-4">Change Password</h3>
        <form onSubmit={onChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="input w-full"
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="input w-full"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="btn btn-primary"
          >
            {isChangingPassword ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-medium text-primary-700 mb-4">Two-Factor Authentication</h3>
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">SMS Authentication</p>
            <p className="text-sm text-gray-600">Secure your account with SMS verification</p>
          </div>
          <button className="btn btn-outline btn-sm">
            Enable
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
        <div className="border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-900">Delete Account</p>
              <p className="text-sm text-red-600">
                Permanently delete your account and all associated data
              </p>
            </div>
            <button
              onClick={onDeleteAccount}
              disabled={isDeletingAccount}
              className="btn btn-danger btn-sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Notifications Tab Component
function NotificationsTab({ settings, setSettings }: any) {
  const updateSetting = (key: string, value: boolean) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-primary-700 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">SMS Notifications</p>
              <p className="text-sm text-gray-600">Receive notifications via text message</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => updateSetting('smsNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-600">Receive browser push notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => updateSetting('pushNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-900 mb-4">Notification Types</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Booking Updates</p>
              <p className="text-sm text-gray-600">Status changes and confirmations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.bookingUpdates}
                onChange={(e) => updateSetting('bookingUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Promotional Emails</p>
              <p className="text-sm text-gray-600">Special offers and promotions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.promotionalEmails}
                onChange={(e) => updateSetting('promotionalEmails', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Reminder Notifications</p>
              <p className="text-sm text-gray-600">Upcoming appointments and deadlines</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reminderNotifications}
                onChange={(e) => updateSetting('reminderNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// Preferences Tab Component
function PreferencesTab() {
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  const [currency, setCurrency] = useState('USD');
  const [theme, setTheme] = useState('light');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-primary-700 mb-4">General Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <ThemedSelect
              value={language}
              onChange={(v: string) => setLanguage(v)}
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' },
                { value: 'de', label: 'German' },
              ]}
              placeholder="Language"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <ThemedSelect
              value={timezone}
              onChange={(v: string) => setTimezone(v)}
              options={[
                { value: 'UTC', label: 'UTC' },
                { value: 'EST', label: 'Eastern Time' },
                { value: 'PST', label: 'Pacific Time' },
                { value: 'CST', label: 'Central Time' },
              ]}
              placeholder="Timezone"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <ThemedSelect
              value={currency}
              onChange={(v: string) => setCurrency(v)}
              options={[
                { value: 'USD', label: 'USD ($)' },
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'GBP', label: 'GBP (£)' },
                { value: 'CAD', label: 'CAD ($)' },
              ]}
              placeholder="Currency"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <ThemedSelect
              value={theme}
              onChange={(v: string) => setTheme(v)}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'auto', label: 'Auto' },
              ]}
              placeholder="Theme"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <button className="btn btn-primary">
          Save Preferences
        </button>
      </div>
    </div>
  );
} 