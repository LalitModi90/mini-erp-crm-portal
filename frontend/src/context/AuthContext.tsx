import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, AUTH_UNAUTHORIZED_EVENT } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const clearStoredAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('user');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token') || localStorage.getItem('jwt_token'));
  const [loading, setLoading] = useState<boolean>(() => Boolean(localStorage.getItem('token') || localStorage.getItem('jwt_token')));

  const logout = () => {
    setToken(null);
    setUserState(null);
    clearStoredAuth();
  };

  useEffect(() => {
    const onUnauthorized = () => {
      logout();
    };
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token') || localStorage.getItem('jwt_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      const storedUser = localStorage.getItem('user');
      try {
        const res = await api.get('/auth/profile');
        if (res.data?.success && res.data?.data) {
          const profile = res.data.data;
          const freshUser: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
          };
          setUserState(freshUser);
          setToken(storedToken);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } else {
          logout();
        }
      } catch {
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUserState(parsed);
            setToken(storedToken);
          } catch {
            logout();
          }
        } else {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUserState(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('jwt_token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const setUser = (newUser: User) => {
    setUserState(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
