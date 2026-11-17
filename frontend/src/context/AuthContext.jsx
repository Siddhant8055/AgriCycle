import { createContext, useContext, useState, useCallback } from 'react';
import { parseStoredUser } from './authStorage';

const AuthContext = createContext(null);

// Demo users for development/testing
const DEMO_USERS = {
  farmer: {
    id: 'farmer-001',
    name: 'Rajesh Patil',
    email: 'rajesh@example.com',
    phone: '9876543210',
    role: 'farmer',
    region: 'Kolhapur, Maharashtra',
    avatar: null,
  },
  buyer: {
    id: 'buyer-001',
    name: 'Suresh Kumar',
    email: 'suresh@example.com',
    phone: '9123456789',
    role: 'buyer',
    region: 'Sangli, Maharashtra',
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
      // Simulate API call
      await new Promise((r) => setTimeout(r, 800));
      const role = credentials.role || 'farmer';
      const demoUser = DEMO_USERS[role];
      setUser(demoUser);
      const storage = credentials.remember ? localStorage : sessionStorage;
      const otherStorage = credentials.remember ? sessionStorage : localStorage;
      storage.setItem('agri_user', JSON.stringify(demoUser));
      otherStorage.removeItem('agri_user');
      return { success: true, user: demoUser };
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
      await new Promise((r) => setTimeout(r, 1000));
      const newUser = {
        id: `${data.role}-${Date.now()}`,
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        region: data.region || 'Kolhapur, Maharashtra',
        avatar: null,
      };
      setUser(newUser);
      localStorage.removeItem('agri_user');
      sessionStorage.setItem('agri_user', JSON.stringify(newUser));
      return { success: true, user: newUser };
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
