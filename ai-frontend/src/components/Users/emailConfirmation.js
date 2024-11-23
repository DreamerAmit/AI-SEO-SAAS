import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ConfirmEmail = () => {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const { token } = useParams();
  const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://pic2alt.com/api/v1'
    : process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    let isMounted = true;

    const confirmEmail = async () =>  {
      try {
        console.log('Sending confirmation request');
        const res = await axios.get(`${API_URL}/users/confirm-email/${token}`);
        console.log('Received response:', res.data);
        if (res.data.status === 'success') {
          console.log('Setting success status');
          setStatus('success');
          setMessage(res.data.message);
        } else {
          console.log('Setting error status');
          setStatus('error');
          setMessage(res.data.message || 'An error occurred during email confirmation.');
        }
      } catch (error) {
        console.error('Confirmation error:', error);
        console.error('Error response:', error.response?.data);
        setStatus('error');
        setMessage(error.response?.data?.message || 'An error occurred during email confirmation.');
      }
    };

    confirmEmail();

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (status === 'loading') {
    return <div>Verifying your email...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Account Confimed!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {message}
          </p>
        </div>
        {status === 'success' && (
          <div className="mt-5">
            <Link
              to="/login"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Proceed to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmail;
