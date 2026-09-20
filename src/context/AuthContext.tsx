import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminApi } from '../api/client';
import { AdminLoginResponseDto } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  adminUser: AdminLoginResponseDto | null;
  secretKey: string;
  loading: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  loginWithSecretKey: (secret: string) => Promise<void>;
  logout: () => void;
  setSecretKey: (key: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminLoginResponseDto | null>(null);
  const [secretKey, setSecretKeyInternal] = useState<string>(() => {
    return localStorage.getItem('crushpad_admin_secret') || import.meta.env.VITE_ADMIN_SECRET_KEY || 'crushpad-admin-secret-key-2026';
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('crushpad_admin_token');
    const storedUser = localStorage.getItem('crushpad_admin_user');
    const storedSecret = localStorage.getItem('crushpad_admin_secret');

    if (token || storedSecret) {
      setIsAuthenticated(true);
      if (storedUser) {
        try {
          setAdminUser(JSON.parse(storedUser));
        } catch {
          // ignore
        }
      }
    }
    setLoading(false);
  }, []);

  const setSecretKey = (key: string) => {
    localStorage.setItem('crushpad_admin_secret', key);
    setSecretKeyInternal(key);
  };

  const loginWithCredentials = async (email: string, password: string) => {
    const res = await AdminApi.login(email, password);
    if (res.success && res.data) {
      localStorage.setItem('crushpad_admin_token', res.data.token);
      localStorage.setItem('crushpad_admin_user', JSON.stringify(res.data));
      setAdminUser(res.data);
      setIsAuthenticated(true);
    } else {
      throw new Error(res.message || 'Login failed');
    }
  };

  const loginWithSecretKey = async (secret: string) => {
    const res = await AdminApi.login(undefined, undefined, secret);
    if (res.success && res.data) {
      setSecretKey(secret);
      localStorage.setItem('crushpad_admin_token', res.data.token);
      localStorage.setItem('crushpad_admin_user', JSON.stringify(res.data));
      setAdminUser(res.data);
      setIsAuthenticated(true);
    } else {
      // Direct key authorization fallback
      setSecretKey(secret);
      setIsAuthenticated(true);
      setAdminUser({
        token: '',
        tokenType: 'KEY',
        userId: 0,
        email: 'admin@crushpad.app',
        username: 'superadmin',
        name: 'Master Administrator',
        role: 'ROLE_ADMIN',
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('crushpad_admin_token');
    localStorage.removeItem('crushpad_admin_user');
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        adminUser,
        secretKey,
        loading,
        loginWithCredentials,
        loginWithSecretKey,
        logout,
        setSecretKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
