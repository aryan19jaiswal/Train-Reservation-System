
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-900 mb-6">Train Seat Reservation System</h1>
          <p className="text-gray-600 mb-8">
            A complete system for train seat reservations with authentication, booking logic,
            and PostgreSQL database integration.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-md">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">System Features</h2>
              <ul className="text-left text-gray-700 space-y-2">
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  User authentication with JWT
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  Interactive seat map visualization
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  Intelligent seat allocation algorithm
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  Booking and cancellation functionality
                </li>
              </ul>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Get Started</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="w-full">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/signup">Create Account</Link>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <p className="text-sm text-gray-500">
              Ready to book your train seat? Sign in or create an account to get started.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
