import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const getUserId = () => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      return parsedUser.id;
    }
  }
  return userId;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    console.log('AuthContext - Initial token check:', token);
    
    if (token) {
      setIsAuthenticated(true);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      console.log('AuthContext - Setting isAuthenticated to true');
    }
  }, []);

  const loginUser = async (userData) => {
    console.log("AuthContext - loginUser called with:", userData);
    if (!userData.token) {
      console.error('AuthContext - Token is missing in userData:', userData);
      return;
    }
    
    localStorage.setItem('token', userData.token);
    
    // If user data is available, store it
    if (userData.user) {
      localStorage.setItem('user', JSON.stringify(userData.user));
      localStorage.setItem('userId', userData.user.id);
      setUser(userData.user);
    }
    
    setIsAuthenticated(true);
    console.log("User state updated, isAuthenticated set to true");
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  };

  const logoutUser = () => {
    console.log('Logging out user...');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.clear();
    console.log('User logged out, auth state cleared');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
