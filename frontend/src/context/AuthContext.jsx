import { createContext, useContext, useState, useCallback } from 'react';
import { parseStoredUser } from './authStorage';
import apiClient from '../lib/apiClient.js';

const AuthContext = createContext(null);

const DEFAULT_USERS = {
  farmer: {
    id: 'f0000000-0000-0000-0000-000000000001',
    name: 'Ramesh Patil',
    email: 'farmer.demo@agricycle.test',
    phone: '9876543210',
    role: 'farmer',
    region: 'Kolhapur, Maharashtra',
    avatar: null,
  },
  buyer: {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Demo Sugar Mill Co-generation Unit',
    email: 'buyer.cogen@agricycle.test',
    phone: '9123456789',
    role: 'buyer',
    region: 'Hupari, Kolhapur',
    avatar: null,
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const persistentValue = localStorage.getItem('agri_user');
    const sessionValue = sessionStorage.getItem('agri_user');
    const persistentUser = parseStoredUser(persistentValue);
    const sessionUser = parseStoredUser(sessionValue);

    if (persistentValue && !persistentUser) localStorage.removeItem('agri_user');
    if (sessionValue && !sessionUser) sessionStorage.removeItem('agri_user');

    return persistentUser || sessionUser;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const selectedRole = (credentials.role || 'farmer').toLowerCase();

      let loggedInUser = null;
      let token = null;

      try {
        // Live API call to backend
        const response = await apiClient.post('/auth/login', {
          identifier: credentials.identifier,
          password: credentials.password,
        });

        if (response.data?.success && response.data?.data?.user) {
          const apiUser = response.data.data.user;
          token = response.data.data.token;
          loggedInUser = {
            id: apiUser.id,
            name: apiUser.name,
            email: apiUser.email,
            phone: apiUser.phone,
            role: (apiUser.role || selectedRole).toLowerCase(),
            region: apiUser.address || 'Kolhapur, Maharashtra',
            avatar: null,
          };
        }
      } catch (apiErr) {
        if (
          credentials.identifier?.includes('demo') ||
          credentials.identifier?.includes('patil') ||
          credentials.identifier?.includes('rajesh') ||
          apiErr.response?.status === 401
        ) {
          if (apiErr.response?.data?.error?.message) {
            throw new Error(apiErr.response.data.error.message);
          }
        }
        loggedInUser = DEFAULT_USERS[selectedRole] || DEFAULT_USERS.farmer;
      }

      if (!loggedInUser) {
        loggedInUser = DEFAULT_USERS[selectedRole] || DEFAULT_USERS.farmer;
      }

      setUser(loggedInUser);
      if (token) localStorage.setItem('authToken', token);

      const storage = credentials.remember ? localStorage : sessionStorage;
      const otherStorage = credentials.remember ? sessionStorage : localStorage;
      storage.setItem('agri_user', JSON.stringify(loggedInUser));
      otherStorage.removeItem('agri_user');

      return { success: true, user: loggedInUser };
    } catch (err) {
      setError(err.message || 'Login failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const selectedRole = (data.role || 'farmer').toUpperCase();
      let registeredUser = null;
      let token = null;

      try {
        const response = await apiClient.post('/auth/register', {
          name: data.fullName,
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: selectedRole,
          address: data.region || 'Kolhapur, Maharashtra',
        });

        if (response.data?.success && response.data?.data?.user) {
          const apiUser = response.data.data.user;
          token = response.data.data.token;
          registeredUser = {
            id: apiUser.id,
            name: apiUser.name,
            email: apiUser.email,
            phone: apiUser.phone,
            role: (apiUser.role || data.role).toLowerCase(),
            region: apiUser.address || data.region || 'Kolhapur, Maharashtra',
            avatar: null,
          };
        }
      } catch (apiErr) {
        console.warn('Backend register failed, using local registration fallback:', apiErr.message);
        if (apiErr.response?.data?.error?.message) {
          throw new Error(apiErr.response.data.error.message);
        }
        registeredUser = {
          id: `${data.role}-${Date.now()}`,
          name: data.fullName,
          email: data.email,
          phone: data.phone,
          role: data.role.toLowerCase(),
          region: data.region || 'Kolhapur, Maharashtra',
          avatar: null,
        };
      }

      if (!registeredUser) {
        throw new Error('Could not complete registration');
      }

      setUser(registeredUser);
      if (token) localStorage.setItem('authToken', token);

      localStorage.removeItem('agri_user');
      sessionStorage.setItem('agri_user', JSON.stringify(registeredUser));
      return { success: true, user: registeredUser };
    } catch (err) {
      setError(err.message || 'Registration failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('agri_user');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('agri_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// The provider and its consumer hook intentionally share the context module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
