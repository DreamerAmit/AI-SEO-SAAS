import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../Navbar/PublicNavbar';
import PrivateNavbar from '../Navbar/PrivateNavbar';
import { useAuth } from '../../AuthContext/AuthContext';

const Layout = () => {
  const { isAuthenticated, user } = useAuth();
  console.log("Layout render - isAuthenticated:", isAuthenticated, "user:", user);

  return (
    <div>
      {isAuthenticated && user ? (
        <>
          <PrivateNavbar />
          <p>Private Navbar Rendered</p>
        </>
      ) : (
        <>
          <PublicNavbar />
          <p>Public Navbar Rendered</p>
        </>
      )}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
