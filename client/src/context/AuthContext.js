import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        
        if (parsedUser.name && (!parsedUser.firstName || !parsedUser.lastName)) {
          const nameParts = parsedUser.name.split(' ');
          if (nameParts.length > 1) {
            parsedUser.firstName = nameParts[0];
            parsedUser.lastName = nameParts.slice(1).join(' ');
          } else {
            parsedUser.firstName = parsedUser.name;
            parsedUser.lastName = '';
          }
        }
        
        setCurrentUser(parsedUser);

        if (parsedUser.preferences && parsedUser.preferences.theme) {
          applyTheme(parsedUser.preferences.theme);
        }
      } catch (error) {
        console.error('Eroare la parsarea datelor utilizator:', error);
        logout();
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);

    const userToStore = { ...userData };
    if (userData.name && (!userData.firstName || !userData.lastName)) {
      const nameParts = userData.name.split(' ');
      if (nameParts.length > 1) {
        userToStore.firstName = nameParts[0];
        userToStore.lastName = nameParts.slice(1).join(' ');
      } else {
        userToStore.firstName = userData.name;
        userToStore.lastName = '';
      }
    }
    
    localStorage.setItem('user', JSON.stringify(userToStore));

    if (userToStore.preferences && userToStore.preferences.theme) {
      applyTheme(userToStore.preferences.theme);
    }
    
    setCurrentUser(userToStore);
    setError(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);

    applyTheme('light');
  };

  const updateUser = (userData) => {
    const updatedUser = { ...currentUser, ...userData };

    if (updatedUser.preferences && updatedUser.preferences.theme) {
      applyTheme(updatedUser.preferences.theme);
    }

    if (updatedUser.firstName && updatedUser.lastName) {
      updatedUser.name = `${updatedUser.firstName} ${updatedUser.lastName}`;
    }
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  const applyTheme = (theme) => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.style.setProperty('--bg-color', '#1a202c');
      root.style.setProperty('--text-color', '#f7fafc');
      root.style.setProperty('--card-bg', '#2d3748');
      root.style.setProperty('--border-color', '#4a5568');
      document.body.className = 'theme-dark';
    } else if (theme === 'light') {
      root.style.setProperty('--bg-color', '#f7fafc');
      root.style.setProperty('--text-color', '#2d3748');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--border-color', '#e2e8f0');
      document.body.className = 'theme-light';
    } else if (theme === 'auto') {
      document.body.className = 'theme-auto';
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (prefersDarkMode) {
        root.style.setProperty('--bg-color', '#1a202c');
        root.style.setProperty('--text-color', '#f7fafc');
        root.style.setProperty('--card-bg', '#2d3748');
        root.style.setProperty('--border-color', '#4a5568');
      } else {
        root.style.setProperty('--bg-color', '#f7fafc');
        root.style.setProperty('--text-color', '#2d3748');
        root.style.setProperty('--card-bg', '#ffffff');
        root.style.setProperty('--border-color', '#e2e8f0');
      }
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    updateUser,
    setError,
    applyTheme
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};