import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Shield, Clock, Users, ArrowRight, CheckCircle, MapPin, Award, Zap } from 'lucide-react';

export default function HomePage() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Create intersection observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const delay = element.dataset.delay || '0';
            
            setTimeout(() => {
              element.classList.add('animate-in');
            }, parseInt(delay));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach((el) => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-fade-in-up" data-animate data-delay="0">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Find Local Services with{' '}
                <span className="gradient-serveease">
                  {'ServeEase'.split('').map((letter, index) => (
                    <span
                      key={index}
                      className="animate-letter"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        display: 'inline-block'
                      }}
                    >
                      {letter}
                    </span>
                  ))}
                </span>
              </h1>
            </div>
            
            <div className="animate-fade-in-up" data-animate data-delay="200">
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                Connect with trusted providers in your area. Browse ratings, compare prices, and book in seconds.
              </p>
            </div>

            <div className="animate-scale-in" data-animate data-delay="400">
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/search" className="btn-serveease text-lg px-7 py-3 inline-flex items-center justify-center rounded-lg font-medium">
                  <Search className="w-5 h-5 mr-2" />
                  Find Services
                </Link>
                <Link to="/register" className="btn-serveease text-lg px-7 py-3 inline-flex items-center justify-center rounded-lg font-medium">
                  Become a Provider
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up" data-animate data-delay="0">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-700 mb-4">
              Why Choose ServeEase?
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              We make finding and booking local services simple, fast, and reliable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-slide-in-left" data-animate data-delay="100">
              <div className="w-14 h-14 rounded-xl gradient-primary text-white flex items-center justify-center sunset-shadow mb-4 mx-auto">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-primary-700 mb-2">Verified Providers</h3>
              <p className="text-secondary-600">
                All service providers are thoroughly vetted and verified for your peace of mind.
              </p>
            </div>

            <div className="text-center animate-scale-in" data-animate data-delay="200">
              <div className="w-14 h-14 rounded-xl gradient-primary text-white flex items-center justify-center sunset-shadow mb-4 mx-auto">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-primary-700 mb-2">Quick Booking</h3>
              <p className="text-secondary-600">
                Book services instantly with our streamlined booking process. No hassle, no delays.
              </p>
            </div>

            <div className="text-center animate-slide-in-right" data-animate data-delay="300">
              <div className="w-14 h-14 rounded-xl gradient-primary text-white flex items-center justify-center sunset-shadow mb-4 mx-auto">
                <Star className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-primary-700 mb-2">Quality Guaranteed</h3>
              <p className="text-secondary-600">
                Read real reviews and ratings from customers to make informed decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up" data-animate data-delay="0">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-700 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Getting the help you need is just three simple steps away.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-float-in" data-animate data-delay="100">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full gradient-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <Link to="/search" className="inline-flex items-center px-6 py-3 rounded-lg text-white font-medium gradient-primary hover:opacity-95 transition">
                  <Search className="w-5 h-5 mr-2" />
                  Search Services
                </Link>
              </div>
              <h3 className="text-xl font-semibold text-primary-700 mb-2">Find Providers</h3>
              <p className="text-secondary-600">
                Search for the service you need and browse verified providers in your area.
              </p>
            </div>

            <div className="text-center animate-float-in" data-animate data-delay="200">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full gradient-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-10 h-10 rounded-full gradient-primary" />
                  <div className="w-10 h-10 rounded-full gradient-primary" />
                  <div className="w-10 h-10 rounded-full gradient-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-primary-700 mb-2">Compare & Choose</h3>
              <p className="text-secondary-600">
                Compare ratings, prices, and availability to find the perfect match for your needs.
              </p>
            </div>

            <div className="text-center animate-float-in" data-animate data-delay="300">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full gradient-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <div className="inline-flex items-center px-6 py-3 rounded-lg bg-green-100 text-green-800 font-medium">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Booked!
                </div>
              </div>
              <h3 className="text-xl font-semibold text-primary-700 mb-2">Book Instantly</h3>
              <p className="text-secondary-600">
                Schedule your service with just a few clicks. It's that simple!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up" data-animate data-delay="0">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-700 mb-4">
              Popular Service Categories
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Discover the most requested services in your area.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, name: 'Home Cleaning' },
              { icon: MapPin, name: 'Landscaping' },
              { icon: Award, name: 'Tutoring' },
              { icon: Zap, name: 'Electrical' },
            ].map((category, index) => (
              <div
                key={category.name}
                className="text-center p-6 rounded-xl bg-white hover:bg-primary-50 border border-gray-100 hover:border-primary-200 transition-all duration-500 ease-in-out cursor-pointer animate-scale-in transform hover:scale-105 hover:shadow-lg"
                data-animate
                data-delay={index * 100}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <category.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-primary-700">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up" data-animate data-delay="0">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-700 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust ServeEase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Homeowner",
                content: "Found an amazing plumber within minutes! The booking process was so smooth and the service was excellent.",
                rating: 5
              },
              {
                name: "Mike Chen",
                role: "Business Owner",
                content: "As a service provider, ServeEase has helped me grow my business significantly. Highly recommend!",
                rating: 5
              },
              {
                name: "Emily Rodriguez",
                role: "Busy Parent",
                content: "Life-saver! I can book cleaning services while managing kids. The providers are always reliable.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-slide-in-left"
                data-animate
                data-delay={index * 150}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-secondary-600 mb-4">"{testimonial.content}"</p>
                <div className="font-semibold text-primary-700">{testimonial.name}</div>
                <div className="text-sm text-secondary-500">{testimonial.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white text-primary-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in-up" data-animate data-delay="0">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to get started?
            </h2>
          </div>
          <div className="animate-fade-in-up" data-animate data-delay="200">
            <p className="text-secondary-600 mt-2 max-w-2xl mx-auto">
              Join thousands who find and book trusted local services every day.
            </p>
          </div>
          <div className="animate-scale-in" data-animate data-delay="400">
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="inline-flex items-center px-7 py-3 rounded-lg text-white font-medium gradient-primary hover:opacity-95 transition">
                Create free account <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link to="/search" className="inline-flex items-center px-7 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 hover:shadow-lg transition-all duration-500 ease-in-out transform hover:scale-105">
                Explore now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 