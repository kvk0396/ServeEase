import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, Calendar, Star, Clock } from 'lucide-react';
import { useAuthStore, isCustomer, isProvider } from '../store/authStore';
import Logo from './Logo';
import { cn } from '../lib/utils';
import { NotificationBell } from './NotificationBell';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  // Compute home destination based on authentication/role
  const homeHref = isAuthenticated ? (isProvider(user) ? '/provider/dashboard' : '/customer/dashboard') : '/';

  const navSecondLabel = isAuthenticated ? (isProvider(user) ? 'My services' : 'My bookings') : 'Search';
  const navSecondHref = isAuthenticated ? (isProvider(user) ? '/provider/services' : '/customer/bookings') : '/search';
  
  // Build navigation array - avoid duplicate Search button when not authenticated
  const navigation = [
    { name: 'Home', href: homeHref, current: location.pathname === homeHref },
    ...(isAuthenticated ? [{ name: navSecondLabel, href: navSecondHref, current: location.pathname === navSecondHref }] : []),
    { name: 'Search', href: '/search', current: location.pathname === '/search' },
  ];

  const customerNavigation = [
    { name: 'Dashboard', href: '/customer/dashboard', icon: Calendar },
    { name: 'My Bookings', href: '/customer/bookings', icon: Calendar },
    { name: 'My Ratings', href: '/customer/ratings', icon: Star },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const providerNavigation = [
    { name: 'Dashboard', href: '/provider/dashboard', icon: Calendar },
    { name: 'My Services', href: '/provider/services', icon: Settings },
    { name: 'Bookings', href: '/provider/bookings', icon: Calendar },
    { name: 'Availability', href: '/provider/availability', icon: Clock },
    { name: 'Ratings', href: '/provider/ratings', icon: Star },
    { name: 'Profile', href: '/provider/profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 glass-card sunset-shadow border-b border-primary-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Logo size={32} className="sunset-shadow animate-glow rounded-lg" />
              <span className="font-bold text-2xl gradient-serveease-header">ServeEase</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-all duration-500 ease-in-out',
                  item.current
                    ? 'text-white bg-gradient-to-r from-primary-600 to-primary-500 shadow-md'
                    : 'text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-primary-600 hover:to-primary-500 hover:shadow-md'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && <NotificationBell />}
            
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-white p-2 rounded-lg hover:bg-gradient-to-r hover:from-primary-600 hover:to-primary-500 hover:shadow-md transition-all duration-500 ease-in-out"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.fullName}
                  </span>
                </button>

                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <p className="text-xs text-primary-600 font-medium capitalize">
                        {user?.role.replace('_', ' ').toLowerCase()}
                      </p>
                    </div>

                    <div className="py-1">
                      {isCustomer(user) &&
                        customerNavigation.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Icon className="w-4 h-4 mr-2" />
                              {item.name}
                            </Link>
                          );
                        })}

                      {isProvider(user) &&
                        providerNavigation.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-primary-600 hover:to-primary-500 transition-all duration-500 ease-in-out"
                            >
                              <Icon className="w-4 h-4 mr-2" />
                              {item.name}
                            </Link>
                          );
                        })}

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-primary-600 hover:to-primary-500 transition-all duration-500 ease-in-out"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gradient-to-r hover:from-primary-600 hover:to-primary-500 hover:shadow-md transition-all duration-500 ease-in-out"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary text-sm"
                >
                  Get started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-primary-600 hover:to-primary-500 hover:shadow-md transition-all duration-500 ease-in-out"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-3">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'block px-3 py-2 rounded-md text-base font-medium transition-all duration-500 ease-in-out',
                    item.current
                      ? 'text-white bg-gradient-to-r from-primary-600 to-primary-500 shadow-md'
                      : 'text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-primary-600 hover:to-primary-500 hover:shadow-md'
                  )}
                >
                  {item.name}
                </Link>
              ))}

              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 mt-3 pt-3">
                    {isCustomer(user) &&
                      customerNavigation.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-primary-600 hover:to-primary-500 hover:shadow-md rounded-md transition-all duration-500 ease-in-out"
                          >
                            <Icon className="w-5 h-5 mr-2" />
                            {item.name}
                          </Link>
                        );
                      })}

                    {isProvider(user) &&
                      providerNavigation.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-primary-600 hover:to-primary-500 hover:shadow-md rounded-md transition-all duration-500 ease-in-out"
                          >
                            <Icon className="w-5 h-5 mr-2" />
                            {item.name}
                          </Link>
                        );
                      })}

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md mt-2 transition-all duration-500 ease-in-out"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
} 