import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="gradient-primary-animated border-t border-primary-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Logo size={32} className="sunset-shadow animate-glow" />
              <span className="font-bold text-xl gradient-serveease">ServeEase</span>
            </Link>
            <p className="text-sm max-w-md drop-shadow-sm text-white">
              Find trusted local service providers for all your needs. From home maintenance to professional services, 
              we connect you with verified providers in your area.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 drop-shadow-sm gradient-serveease">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/search" className="text-sm transition-all duration-700 ease-out hover:footer-hover-gradient hover:scale-110 hover:translate-x-2 hover:-translate-y-0.5 hover:drop-shadow-lg transform-gpu drop-shadow-sm text-white">
                  Search Providers
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm transition-all duration-700 ease-out hover:footer-hover-gradient hover:scale-110 hover:translate-x-2 hover:-translate-y-0.5 hover:drop-shadow-lg transform-gpu drop-shadow-sm text-white">
                  Become a Provider
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 drop-shadow-sm gradient-serveease">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm transition-all duration-700 ease-out hover:footer-hover-gradient hover:scale-110 hover:translate-x-2 hover:-translate-y-0.5 hover:drop-shadow-lg transform-gpu drop-shadow-sm text-white">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm transition-all duration-700 ease-out hover:footer-hover-gradient hover:scale-110 hover:translate-x-2 hover:-translate-y-0.5 hover:drop-shadow-lg transform-gpu drop-shadow-sm text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm transition-all duration-700 ease-out hover:footer-hover-gradient hover:scale-110 hover:translate-x-2 hover:-translate-y-0.5 hover:drop-shadow-lg transform-gpu drop-shadow-sm text-white">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/30 mt-8 pt-8">
          <p className="text-center text-sm drop-shadow-sm text-white">
            © 2024 ServeEase. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 