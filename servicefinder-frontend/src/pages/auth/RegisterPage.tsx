import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, User, Building } from 'lucide-react';
import Logo from '../../components/Logo';

import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Please enter your full address'),
  city: z.string().min(2, 'Please enter your city'),
  state: z.string().min(2, 'Please enter your state'),
  zipCode: z.string().min(5, 'Please enter a valid ZIP code'),
  country: z.string().default('USA'),
  userType: z.enum(['CUSTOMER', 'SERVICE_PROVIDER']),
  businessName: z.string().optional(),
}).refine((data) => {
  if (data.userType === 'SERVICE_PROVIDER' && !data.businessName) {
    return false;
  }
  return true;
}, {
  message: 'Business name is required for service providers',
  path: ['businessName'],
});

// type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'CUSTOMER' | 'SERVICE_PROVIDER'>('CUSTOMER');
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: 'CUSTOMER' as const,
      country: 'USA',
    },
  });

  const handleUserTypeChange = (type: 'CUSTOMER' | 'SERVICE_PROVIDER') => {
    setUserType(type);
    setValue('userType', type);
  };

  const onSubmit = async (data: any) => {
    try {
      await registerUser(data);
      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center space-x-2">
          <Logo size={40} className="sunset-shadow animate-glow rounded-lg" />
                      <span className="font-bold text-2xl gradient-serveease-header">ServeEase</span>
        </Link>
                    <h2 className="mt-6 text-center text-3xl font-bold text-primary-700">
              Create your account
            </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* User type selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I want to:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleUserTypeChange('CUSTOMER')}
                className={cn(
                  'flex items-center p-4 border-2 rounded-lg transition-all',
                  userType === 'CUSTOMER'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <User className="w-6 h-6 mr-3 text-primary-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Find Services</div>
                  <div className="text-sm text-gray-500">Book local service providers</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleUserTypeChange('SERVICE_PROVIDER')}
                className={cn(
                  'flex items-center p-4 border-2 rounded-lg transition-all',
                  userType === 'SERVICE_PROVIDER'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <Building className="w-6 h-6 mr-3 text-primary-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Offer Services</div>
                  <div className="text-sm text-gray-500">Become a service provider</div>
                </div>
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register('userType')} />
            <input type="hidden" {...register('country')} />

            {/* Personal Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  className={`input mt-1 ${errors.firstName ? 'border-red-500' : ''}`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  className={`input mt-1 ${errors.lastName ? 'border-red-500' : ''}`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {userType === 'SERVICE_PROVIDER' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Business Name
                </label>
                <input
                  {...register('businessName')}
                  type="text"
                  className={`input mt-1 ${errors.businessName ? 'border-red-500' : ''}`}
                  placeholder="Your Business Name"
                />
                {errors.businessName && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                className={`input mt-1 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                {...register('phoneNumber')}
                type="tel"
                className={`input mt-1 ${errors.phoneNumber ? 'border-red-500' : ''}`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Address Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-primary-700 mb-4">Address Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <input
                  {...register('address')}
                  type="text"
                  className={`input mt-1 ${errors.address ? 'border-red-500' : ''}`}
                  placeholder="123 Main Street"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    {...register('city')}
                    type="text"
                    className={`input mt-1 ${errors.city ? 'border-red-500' : ''}`}
                    placeholder="New York"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    {...register('state')}
                    type="text"
                    className={`input mt-1 ${errors.state ? 'border-red-500' : ''}`}
                    placeholder="NY"
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ZIP Code
                  </label>
                  <input
                    {...register('zipCode')}
                    type="text"
                    className={`input mt-1 ${errors.zipCode ? 'border-red-500' : ''}`}
                    placeholder="10001"
                  />
                  {errors.zipCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full flex justify-center items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 