import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-300">404</h1>
        <h2 className="text-3xl font-bold text-primary-700 mb-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="btn btn-primary inline-flex items-center"
        >
          <Home className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
} 