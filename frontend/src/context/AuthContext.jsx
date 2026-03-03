import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrapAuth = async () => {
      try {
        const response = await axios.get('/api/auth/me', { withCredentials: true });
        if (!mounted) return;
        setUser(response.data.user || null);
        setIsAuthenticated(true);
      } catch {
        if (!mounted) return;
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    } catch {
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
