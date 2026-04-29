import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../shared/api/client';

interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('study_hub_token'));
  const [user, setUser] = useState<UserInfo | null>(null);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      setUser(res.data.data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized as EventListener);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized as EventListener);
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('study_hub_token', newToken);
    setToken(newToken);
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('study_hub_token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const deleteAccount = async () => {
    await apiClient.delete('/auth/me');
    logout();
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
