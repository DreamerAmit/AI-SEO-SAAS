import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ConfirmEmail = () => {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const { token } = useParams();
  const API_BASE_URL = 'http://localhost:3000'; // Assuming this is the base URL for API requests

  useEffect(() => {
    let isMounted = true;

    const confirmEmail = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/confirm-email/${token}`);
        if (isMounted) {
          setStatus('success');
          setMessage(res.data.message);
        }
      } catch (error) {
        if (isMounted) {
          setStatus('error');
          setMessage(error.response?.data?.message || 'An error occurred during email confirmation.');
          console.error('Detailed error:', error.response?.data);
        }
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
