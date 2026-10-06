import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { getAuthToken, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session on page refresh
  useEffect(() => {
    const restoreSession = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.auth.getMe();
        if (data?.user) {
          setUser(data.user);
        } else {
          setAuthToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('[AUTH SESSION] Token invalid or expired, resetting session.');
        setAuthToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const data = await api.auth.login({ email, password });
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const data = await api.auth.register({ name, email, password });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setAuthToken(null);
    }
  };

  const hasRole = (...roles) => {
    if (!user || !user.role) return false;
    const userRole = user.role.toUpperCase();
    return roles.map((r) => r.toUpperCase()).includes(userRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role.toUpperCase() : null,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
