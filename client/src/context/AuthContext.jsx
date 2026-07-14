import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const AuthContext = createContext(null);

/**
 * Internal component that lives inside BrowserRouter so it can call useNavigate.
 * It captures the navigate fn into a ref so the AuthProvider can use it from
 * async callbacks (e.g. logout) without violating the Rules of Hooks.
 */
function NavigateCapture({ navigateRef }) {
  const navigate = useNavigate();
  useEffect(() => { navigateRef.current = navigate; }, [navigate, navigateRef]);
  return null;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const navigateRef           = useRef(null);

  // ── Fetch current user ──────────────────────────────────────
  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { setLoading(false); return; }
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        setUser(null);
        localStorage.removeItem('accessToken');
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setUser(null);
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCurrentUser(); }, [fetchCurrentUser]);

  // ── Login ───────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { accessToken, user: loggedInUser } = response.data;
        localStorage.setItem('accessToken', accessToken);
        setUser(loggedInUser);
        // Return role so Login page can redirect to the correct dashboard
        return { success: true, role: loggedInUser.role };
      }
      return { success: false, message: response.data.message || 'Login failed.' };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Invalid email or password.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // ── Register ────────────────────────────────────────────────
  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      if (response.data.success) {
        if (response.data.accessToken) {
          const { accessToken, user: registeredUser } = response.data;
          localStorage.setItem('accessToken', accessToken);
          setUser(registeredUser);
          return { success: true, role: registeredUser.role };
        }
        return { success: true, awaitingApproval: true, message: response.data.message };
      }
      return { success: false, message: response.data.message || 'Registration failed.' };
    } catch (error) {
      console.error('Registration error:', error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        'Registration failed.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ──────────────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setLoading(false);
      // Redirect to login after clearing session
      if (navigateRef.current) navigateRef.current('/login', { replace: true });
    }
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    fetchCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      <NavigateCapture navigateRef={navigateRef} />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
