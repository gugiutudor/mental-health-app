import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Importă paginile - păstrăm numele fișierului Dashboard
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Exercises from './pages/Exercises';
import Exercise from './pages/Exercise';
import Resources from './pages/Resources';
import NotFound from './pages/NotFound';

// Importă componentele de layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Componenta pentru protejarea rutelor
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Se încarcă...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Componenta pentru a inițializa tema
const ThemeInitializer = ({ children }) => {
  const { currentUser, applyTheme } = useAuth();
  
  useEffect(() => {
    if (currentUser && currentUser.preferences) {
      const theme = currentUser.preferences.theme || 'light';
      applyTheme(theme);
    } else {
      // Temă implicită dacă utilizatorul nu are preferințe
      applyTheme('light');
    }
    
    // Ascultă pentru schimbări în preferințele de temă ale sistemului
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (event) => {
      if (currentUser && currentUser.preferences && currentUser.preferences.theme === 'auto') {
        if (event.matches) {
          document.documentElement.style.setProperty('--bg-color', '#1a202c');
          document.documentElement.style.setProperty('--text-color', '#f7fafc');
          document.documentElement.style.setProperty('--card-bg', '#2d3748');
          document.documentElement.style.setProperty('--border-color', '#4a5568');
        } else {
          document.documentElement.style.setProperty('--bg-color', '#f7fafc');
          document.documentElement.style.setProperty('--text-color', '#2d3748');
          document.documentElement.style.setProperty('--card-bg', '#ffffff');
          document.documentElement.style.setProperty('--border-color', '#e2e8f0');
        }
      }
    };
    
    darkModeMediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [currentUser, applyTheme]);
  
  return children;
};

function AppContent() {
  return (
    <Router>
      <ThemeInitializer>
        <div className="app">
          <Header />
          <main className="content">
            <Routes>
              <Route path="/" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="/exercises" element={
                <PrivateRoute>
                  <Exercises />
                </PrivateRoute>
              } />
              <Route path="/exercises/:id" element={
                <PrivateRoute>
                  <Exercise />
                </PrivateRoute>
              } />
              <Route path="/resources" element={
                <PrivateRoute>
                  <Resources />
                </PrivateRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ThemeInitializer>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;