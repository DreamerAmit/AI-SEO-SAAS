import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const getUserId = () => {
  const userId = localStorage.getItem('userId');
  console.log('Retrieved userId:', userId); // Add this line for debugging
  return userId;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      // Optionally, fetch user data here and set the user state
    }
  }, []);

 

  const loginUser = (userData) => {
    console.log("loginUser called with:", userData);
    if (!userData.user || !userData.user.id) {
      console.error('User ID is missing in userData:', userData);
      return;
    }
    setUser(userData.user);
    setIsAuthenticated(true);
    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('userId', userData.user.id); // Store user ID in local storage
    console.log("User state updated, isAuthenticated set to true");
  };

  const logoutUser = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
