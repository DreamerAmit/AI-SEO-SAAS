import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext/AuthContext';

const PrivateNavbar = () => {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  console.log("PrivateNavbar rendered");

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="text-xl font-bold">Dashboard</Link>
        <div className="space-x-4">
          <Link to="/generate-content" className="hover:text-gray-300">Generate Content</Link>
          <Link to="/history" className="hover:text-gray-300">History</Link>
          <Link to="/account" className="hover:text-gray-300">Account</Link>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default PrivateNavbar;
