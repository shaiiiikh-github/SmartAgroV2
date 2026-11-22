import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL as API_BASE } from '../components/api';

// Attach JWT token automatically to all axios requests if available
axios.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('smart_agro_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Ignore localStorage access errors
  }
  return config;
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return Boolean(localStorage.getItem('smart_agro_token'));
    } catch {
      return false;
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      return Boolean(localStorage.getItem('smart_agro_token'));
    } catch {
      return false;
    }
  });

  const navigate = useNavigate();

  // =========================
  // Initialize auth state
  // =========================
  const initializeAuth = useCallback(async () => {
    const token = localStorage.getItem('smart_agro_token');
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return false;
    }
    try {
      const headers = {
        Authorization: `Bearer ${token}`
      };
      const res = await axios.get(
        `${API_BASE}/api/auth/check`,
        { withCredentials: true, headers }
      );

      if (res.data?.authenticated) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        return true;
      }

      // Backend confirmed session/token is invalid
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('smart_agro_token');
      localStorage.removeItem('smart_agro_user');
      return false;
    } catch (err) {
      console.error('Auth check failed:', err);
      // In case of 401/403 or invalid token, clear auth state
      if (err.response?.status === 401 || err.response?.status === 403) {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('smart_agro_token');
        localStorage.removeItem('smart_agro_user');
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // =========================
  // Local login
  // =========================
  const login = useCallback(async (credentials) => {
    try {
      const res = await axios.post(
        `${API_BASE}/api/auth/login`,
        credentials,
        { withCredentials: true }
      );

      if (res.data?.token) {
        localStorage.setItem('smart_agro_token', res.data.token);
      }
      if (res.data?.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Login failed',
      };
    }
  }, []);

  // =========================
  // OAuth login (Google/GitHub)
  // =========================
  const handleOAuthLogin = useCallback(async (authRequest) => {
    try {
      const res = await authRequest();
      if (res?.data?.token) {
        localStorage.setItem('smart_agro_token', res.data.token);
      }
      if (res?.data?.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('OAuth login failed:', err);
      return false;
    }
  }, []);

  // =========================
  // Forgot Password
  // =========================
  const forgotPassword = useCallback(async (identifier) => {
    try {
      await axios.post(
        `${API_BASE}/api/auth/forgot-password`,
        { identifier },
        { withCredentials: true }
      );
      return { success: true };
    } catch {
      return { success: true };
    }
  }, []);

  // =========================
  // Reset Password
  // =========================
  const resetPassword = useCallback(async ({ token, password }) => {
    try {
      await axios.post(
        `${API_BASE}/api/auth/reset-password`,
        { token, password },
        { withCredentials: true }
      );

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          'Reset link is invalid or expired',
      };
    }
  }, []);

  // =========================
  // Logout
  // =========================
  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('smart_agro_token');
      await axios.post(
        `${API_BASE}/api/auth/logout`,
        {},
        {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem('smart_agro_token');
      localStorage.removeItem('smart_agro_user');
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    }
  }, [navigate]);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      isAuthenticated,
      setIsAuthenticated,
      loading,
      login,
      logout,
      handleOAuthLogin,
      initializeAuth,
      forgotPassword,
      resetPassword,
    }),
    [
      user,
      isAuthenticated,
      loading,
      login,
      logout,
      handleOAuthLogin,
      initializeAuth,
      forgotPassword,
      resetPassword,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
