import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { NotificationProvider } from './contexts/NotificationContext';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Public pages
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BookingPage from './pages/customer/BookingPage';
import CustomerBookings from './pages/customer/CustomerBookings';
import CustomerRatings from './pages/customer/CustomerRatings';

// Provider pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ManageServices from './pages/provider/ManageServices';
import ProviderBookings from './pages/provider/ProviderBookings';
import ProviderProfile from './pages/provider/ProviderProfile';
import AvailabilityManagement from './pages/provider/AvailabilityManagement';
import ProviderRatings from './pages/provider/ProviderRatings';

// Shared pages
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const { validateToken, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Validate token on app load
    validateToken();
  }, [validateToken]);

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <Router>
                     <div className="min-h-screen bg-gray-50">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="services/:id" element={<ServiceDetailPage />} />
              <Route path="search" element={<SearchPage />} />
            </Route>

            {/* Auth routes */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to={user?.role === 'CUSTOMER' ? '/customer/dashboard' : '/provider/dashboard'} replace />
                ) : (
                  <LoginPage />
                )
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Navigate to={user?.role === 'CUSTOMER' ? '/customer/dashboard' : '/provider/dashboard'} replace />
                ) : (
                  <RegisterPage />
                )
              }
            />

            {/* Customer protected routes */}
            <Route
              path="/customer"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="bookings" element={<CustomerBookings />} />
              <Route path="ratings" element={<CustomerRatings />} />
              <Route path="book/:serviceId" element={<BookingPage />} />
            </Route>

            {/* Customer dashboard redirects */}
            <Route
              path="/dashboard"
              element={
                isAuthenticated && user?.role === 'CUSTOMER' ? (
                  <Navigate to="/customer/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/dashboard/bookings"
              element={
                isAuthenticated && user?.role === 'CUSTOMER' ? (
                  <Navigate to="/customer/bookings" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/dashboard/ratings"
              element={
                isAuthenticated && user?.role === 'CUSTOMER' ? (
                  <Navigate to="/customer/ratings" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Provider protected routes */}
                    <Route
          path="/provider"
          element={
            <ProtectedRoute allowedRoles={['SERVICE_PROVIDER']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<ProviderDashboard />} />
          <Route path="services" element={<ManageServices />} />
          <Route path="bookings" element={<ProviderBookings />} />
          <Route path="availability" element={<AvailabilityManagement />} />
          <Route path="profile" element={<ProviderProfile />} />
          <Route path="ratings" element={<ProviderRatings />} />
        </Route>

            {/* Shared protected routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'SERVICE_PROVIDER']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ProfilePage />} />
            </Route>

            {/* 404 page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        </Router>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export default App;
