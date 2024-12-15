import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../AuthContext/AuthContext';

const AuthRoute = ({ children }) => {
  const { isAuthenticated, loginUser } = useAuth();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      // Check for token in URL
      const params = new URLSearchParams(location.search);
      const tokenFromURL = params.get('token');

      if (tokenFromURL) {
        console.log('Token found in URL:', tokenFromURL);
        // Store token and authenticate user
        localStorage.setItem('token', tokenFromURL);
        await loginUser({ token: tokenFromURL });
      }
      setIsProcessing(false);
    };

    handleAuth();
  }, [location, loginUser]);

  // Show loading or wait while processing token
  if (isProcessing) {
    return <div>Loading...</div>;
  }

  // Check authentication after handling URL token
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  return children;
};

export default AuthRoute;
