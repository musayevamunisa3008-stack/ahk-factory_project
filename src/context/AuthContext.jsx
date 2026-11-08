import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Robust JSON response parser that never throws SyntaxError: Unexpected end of JSON input
const safeParseJson = async (res) => {
  try {
    const text = await res.text();
    if (!text || !text.trim()) {
      return { error: res.ok ? null : `Сервер вернул пустой ответ (HTTP ${res.status})` };
    }
    return JSON.parse(text);
  } catch (err) {
    return { error: `Ошибка ответа сервера (HTTP ${res.status})` };
  }
};

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
    return adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
  };

  // Buyer Login
  const login = async (email, password) => {
    let res;
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
    } catch (networkErr) {
      const err = new Error('Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен.');
      err.status = 503;
      throw err;
    }

    const data = await safeParseJson(res);
    if (!res.ok) {
      const err = new Error(data.error || 'Ошибка авторизации');
      err.status = res.status;
      err.data = data;
      throw err;
    }
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
  };

  // Buyer Register
  const register = async ({ first_name, last_name, email, password, phone }) => {
    let res;
    try {
      res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name, last_name, email, password, phone })
      });
    } catch (networkErr) {
      const err = new Error('Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен.');
      err.status = 503;
      throw err;
    }

    const data = await safeParseJson(res);
    if (!res.ok) {
      const err = new Error(data.error || 'Ошибка регистрации');
      err.status = res.status;
      err.data = data;
      throw err;
    }
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
  };

  // Buyer Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('furniture_user');
    localStorage.removeItem('furniture_token');
  };

  // Trigger Auth Modal with optional continuation callback (e.g. after adding to cart or trying to checkout)
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
    let res;
    try {
      res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
    } catch (networkErr) {
      const err = new Error('Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен.');
      err.status = 503;
      throw err;
    }

    const data = await safeParseJson(res);
    if (!res.ok) {
      const err = new Error(data.error || 'Неверный секретный пароль администратора');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    setAdminToken(data.adminToken);
    localStorage.setItem('furniture_admin_token', data.adminToken);
    return true;
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
