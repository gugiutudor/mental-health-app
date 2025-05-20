import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verifică dacă există un token salvat
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        
        // Asigurăm compatibilitatea cu versiunile anterioare
        // Dacă userul are doar câmpul 'name' și nu are firstName/lastName
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
      } catch (error) {
        console.error('Eroare la parsarea datelor utilizator:', error);
        logout();
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    
    // Asigurăm-ne că avem firstName și lastName în userData
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
    setCurrentUser(userToStore);
    setError(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const updateUser = (userData) => {
    // Asigurăm-ne că păstrăm toate datele utilizatorului
    const updatedUser = { ...currentUser, ...userData };
    
    // Vom adăuga și câmpul name pentru compatibilitate
    if (updatedUser.firstName && updatedUser.lastName) {
      updatedUser.name = `${updatedUser.firstName} ${updatedUser.lastName}`;
    }
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    updateUser,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};