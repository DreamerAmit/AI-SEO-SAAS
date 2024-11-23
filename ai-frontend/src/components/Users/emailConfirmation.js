import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ConfirmEmail = () => {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const { token } = useParams();

  const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://pic2alt.com/api/v1'
    : 'http://localhost:3001/api/v1';

  useEffect(() => {
    const confirmEmail = async () => {
      console.log('Current environment:', {
        nodeEnv: process.env.NODE_ENV,
        apiUrl: API_URL,
        token: token
      });

      try {
        const response = await axios({
          method: 'GET',
          url: `${API_URL}/users/confirm-email/${token}`,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          validateStatus: function (status) {
            return status >= 200 && status < 500; // Handle all responses
          }
        });

        console.log('Server response:', response.data);

        if (response.data.status === 'success') {
          setStatus('success');
          setMessage(response.data.message || 'Email confirmed successfully!');
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Failed to confirm email.');
        }
      } catch (error) {
        console.error('Full error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: `${API_URL}/users/confirm-email/${token}`
        });

        setStatus('error');
        setMessage(error.response?.data?.message || 'An error occurred during email confirmation.');
      }
    };

    if (token) {
      confirmEmail();
    } else {
      setStatus('error');
      setMessage('No confirmation token provided.');
    }
  }, [token, API_URL]);

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
