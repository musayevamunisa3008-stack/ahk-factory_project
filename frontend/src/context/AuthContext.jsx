import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl, safeParseResponse } from '../config/api';
import { loginStoredUser, registerStoredUser } from '../services/storageService';

const AuthContext = createContext(null);

// Robust JSON response parser that never throws SyntaxError: Unexpected end of JSON input
const safeParseJson = safeParseResponse;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('furniture_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('furniture_token') || null);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('furniture_admin_token') || null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState('login'); // 'login' | 'register'
  const [authSuccessCallback, setAuthSuccessCallback] = useState(null);

  // Sync token to headers
  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const getAdminHeaders = () => {
    const currentToken = adminToken || localStorage.getItem('furniture_admin_token') || 'Ahk123';
    return {
      Authorization: `Bearer ${currentToken}`,
      'X-Admin-Key': 'Ahk123'
    };
  };

  // Buyer Login
  const login = async (email, password) => {
    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await safeParseJson(res);
        if (data?.user && data?.token) {
          setUser(data.user);
          setToken(data.token);
          localStorage.setItem('furniture_user', JSON.stringify(data.user));
          localStorage.setItem('furniture_token', data.token);
          if (authSuccessCallback) {
            authSuccessCallback();
            setAuthSuccessCallback(null);
          }
          setAuthModalOpen(false);
          return data.user;
        }
      } else if (res.status !== 404 && res.status !== 405 && res.status !== 500 && res.status !== 502 && res.status !== 503) {
        const data = await safeParseJson(res);
        const err = new Error(data.error || 'Ошибка авторизации');
        err.status = res.status;
        err.data = data;
        throw err;
      }
    } catch (networkErr) {
      if (networkErr.status && networkErr.status < 500) {
        throw networkErr;
      }
    }

    // Offline / GitHub Pages local storage fallback
    const result = loginStoredUser(email, password);
    setUser(result.user);
    setToken(result.token);
    localStorage.setItem('furniture_user', JSON.stringify(result.user));
    localStorage.setItem('furniture_token', result.token);

    if (authSuccessCallback) {
      authSuccessCallback();
      setAuthSuccessCallback(null);
    }
    setAuthModalOpen(false);
    return result.user;
  };

  // Buyer Register
  const register = async ({ first_name, last_name, email, password, phone }) => {
    try {
      const res = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name, last_name, email, password, phone })
      });
      if (res.ok) {
        const data = await safeParseJson(res);
        if (data?.user && data?.token) {
          setUser(data.user);
          setToken(data.token);
          localStorage.setItem('furniture_user', JSON.stringify(data.user));
          localStorage.setItem('furniture_token', data.token);
          if (authSuccessCallback) {
            authSuccessCallback();
            setAuthSuccessCallback(null);
          }
          setAuthModalOpen(false);
          return data.user;
        }
      } else if (res.status !== 404 && res.status !== 405 && res.status !== 500 && res.status !== 502 && res.status !== 503) {
        const data = await safeParseJson(res);
        const err = new Error(data.error || 'Ошибка регистрации');
        err.status = res.status;
        err.data = data;
        throw err;
      }
    } catch (networkErr) {
      if (networkErr.status && networkErr.status < 500) {
        throw networkErr;
      }
    }

    // Offline / GitHub Pages local storage fallback
    const result = registerStoredUser({ first_name, last_name, email, password, phone });
    setUser(result.user);
    setToken(result.token);
    localStorage.setItem('furniture_user', JSON.stringify(result.user));
    localStorage.setItem('furniture_token', result.token);

    if (authSuccessCallback) {
      authSuccessCallback();
      setAuthSuccessCallback(null);
    }
    setAuthModalOpen(false);
    return result.user;
  };

  // Buyer Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('furniture_user');
    localStorage.removeItem('furniture_token');
  };

  // Trigger Auth Modal with optional continuation callback
  const openAuthModal = (tab = 'login', callback = null) => {
    setAuthModalInitialTab(tab === 'register' ? 'register' : 'login');
    setAuthSuccessCallback(() => callback);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setAuthSuccessCallback(null);
  };

  // Admin Login - Ahk123
  const loginAdmin = async (password) => {
    if (password === 'Ahk123') {
      const fallbackToken = 'ahk_admin_token_master';
      setAdminToken(fallbackToken);
      localStorage.setItem('furniture_admin_token', fallbackToken);
      localStorage.setItem('ahk_admin_authenticated', 'true');
    }

    try {
      const res = await fetch(getApiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        const data = await safeParseJson(res);
        if (data.adminToken) {
          setAdminToken(data.adminToken);
          localStorage.setItem('furniture_admin_token', data.adminToken);
          return true;
        }
      } else if (res.status === 423) {
        const data = await safeParseJson(res);
        const err = new Error(data.error || 'Панель временно заблокирована');
        err.status = 423;
        err.data = data;
        throw err;
      }
    } catch (e) {
      if (e.status === 423) throw e;
    }

    if (password === 'Ahk123') {
      return true;
    }
    const err = new Error('Неверный секретный пароль администратора');
    err.status = 401;
    throw err;
  };

  // Admin Logout
  const logoutAdmin = () => {
    setAdminToken(null);
    localStorage.removeItem('furniture_admin_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!user && !!token,
        login,
        register,
        logout,
        authModalOpen,
        authModalInitialTab,
        openAuthModal,
        closeAuthModal,
        getAuthHeaders,
        adminToken,
        isAdmin: !!adminToken,
        loginAdmin,
        logoutAdmin,
        getAdminHeaders
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
