import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext/AuthContext'; // Assuming you have AuthContext

export default function Account() {
  const { user } = useAuth(); // Get user from auth context
  const [status, setStatus] = useState({ message: '', type: '' });
  
  const [userInfo, setUserInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  });

  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Raw response data:', data);

                if (data && data.user) {
                    setUserInfo({
                        firstName: data.user.firstName || '',
                        lastName: data.user.lastName || '',
                        email: data.user.email || ''
                    });
                } else {
                    console.error('Invalid data structure:', data);
                }
            } else {
                console.error('Response not OK:', response.status);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    fetchProfile();
  }, []);

  const handleUserInfoSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: 'Updating...', type: 'loading' });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          firstName: userInfo.firstName,
          lastName: userInfo.lastName
        })
      });

      if (response.ok) {
        setStatus({ message: 'Profile updated successfully!', type: 'success' });
      } else {
        setStatus({ message: 'Failed to update profile', type: 'error' });
      }
    } catch (error) {
      setStatus({ message: 'Error updating profile', type: 'error' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      setStatus({ message: 'New passwords do not match', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: password.currentPassword,
          newPassword: password.newPassword
        })
      });

      if (response.ok) {
        setStatus({ message: 'Password updated successfully!', type: 'success' });
        setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setStatus({ message: 'Failed to update password', type: 'error' });
      }
    } catch (error) {
      setStatus({ message: 'Error updating password', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

        {/* Status Message */}
        {status.message && (
          <div className={`mb-4 p-4 rounded-md ${
            status.type === 'success' ? 'bg-green-100 text-green-700' :
            status.type === 'error' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {status.message}
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
            <form onSubmit={handleUserInfoSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    value={userInfo.firstName}
                    onChange={(e) => setUserInfo({...userInfo, firstName: e.target.value})}
                    className="mt-1 block w-full border-0 border-b-2 border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    value={userInfo.lastName}
                    onChange={(e) => setUserInfo({...userInfo, lastName: e.target.value})}
                    className="mt-1 block w-full border-0 border-b-2 border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={userInfo.email}
                    disabled
                    className="mt-1 block w-full border-0 border-b-2 border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    value={password.currentPassword}
                    onChange={(e) => setPassword({...password, currentPassword: e.target.value})}
                    className="mt-1 block w-full border-0 border-b-2 border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={password.newPassword}
                    onChange={(e) => setPassword({...password, newPassword: e.target.value})}
                    className="mt-1 block w-full border-0 border-b-2 border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={password.confirmPassword}
                    onChange={(e) => setPassword({...password, confirmPassword: e.target.value})}
                    className="mt-1 block w-full border-0 border-b-2 border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                  />
                </div>
              </div>
              <div className="mt-4">
                {/* <div className="rounded-md bg-gray-50 p-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h3>
                  <ul className="text-sm text-gray-600 list-disc pl-5">
                    <li>Minimum 8 characters</li>
                    <li>At least 1 uppercase letter</li>
                    <li>At least 1 lowercase letter</li>
                    <li>At least 1 number</li>
                    <li>At least 1 special character</li>
                  </ul>
                </div> */}
                <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
