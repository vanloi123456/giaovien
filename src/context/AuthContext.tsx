/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserRole } from '../types.ts';

export interface CurrentAuthUser {
  id: string;
  fullName: string;
  email: string;
  school?: string;
  province?: string;
  role: UserRole;
  status?: string;
  credits?: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AuthContextType {
  user: CurrentAuthUser | null;
  token: string | null;
  isLoading: boolean;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  loginTeacher: (email: string, activationCode?: string) => Promise<{ success: boolean; message?: string }>;
  registerTeacher: (data: { fullName: string; email: string; school: string; province: string }) => Promise<{ success: boolean; message: string; user?: CurrentAuthUser }>;
  requestCode: (email: string) => Promise<{ success: boolean; message: string }>;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register' | 'request-code';
  setAuthModalTab: (tab: 'login' | 'register' | 'request-code') => void;
  adminLoginModalOpen: boolean;
  setAdminLoginModalOpen: (open: boolean) => void;
  upgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  updateUserCredits: (credits: number) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentAuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('gvst_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'request-code'>('login');
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('gvst_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setToken(savedToken);
      } else {
        localStorage.removeItem('gvst_token');
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error('Error refreshing session:', err);
      localStorage.removeItem('gvst_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const updateUserCredits = (newCredits: number) => {
    setUser((prev) => (prev ? { ...prev, credits: newCredits } : null));
  };

  const loginTeacher = async (email: string, activationCode?: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, activationCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Đăng nhập không thành công.' };
      }

      localStorage.setItem('gvst_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setAuthModalOpen(false);
      showToast(`Chào mừng Thầy/Cô ${data.user.fullName} đã đăng nhập thành công!`, 'success');
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Lỗi mạng hoặc máy chủ không phản hồi.' };
    }
  };

  const registerTeacher = async (data: { fullName: string; email: string; school: string; province: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resp = await res.json();
      if (!res.ok) {
        return { success: false, message: resp.error || 'Đăng ký thất bại.' };
      }

      // If server returned a session token upon registration, log in directly!
      if (resp.token && resp.user) {
        localStorage.setItem('gvst_token', resp.token);
        setToken(resp.token);
        setUser(resp.user);
        setAuthModalOpen(false);
      }

      showToast(resp.message, 'success');
      return { success: true, message: resp.message, user: resp.user };
    } catch (err) {
      return { success: false, message: 'Lỗi mạng khi gửi thông tin đăng ký.' };
    }
  };

  const requestCode = async (email: string) => {
    try {
      const res = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const resp = await res.json();
      if (!res.ok) {
        return { success: false, message: resp.error || 'Yêu cầu thất bại.' };
      }

      showToast(resp.message, 'success');
      return { success: true, message: resp.message };
    } catch (err) {
      return { success: false, message: 'Lỗi kết nối khi gửi yêu cầu.' };
    }
  };

  const loginAdmin = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Đăng nhập quản trị thất bại.' };
      }

      localStorage.setItem('gvst_token', data.token);
      setToken(data.token);
      setUser({
        id: data.admin.id,
        fullName: data.admin.fullName,
        email: data.admin.email,
        role: 'admin',
      });
      setAdminLoginModalOpen(false);
      showToast(`Đăng nhập thành công với quyền Quản trị viên hệ thống!`, 'success');
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  };

  const logout = async () => {
    const currentToken = token;
    if (currentToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${currentToken}` },
        });
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem('gvst_token');
    setToken(null);
    setUser(null);
    showToast('Đã đăng xuất khỏi hệ thống.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        toasts,
        showToast,
        removeToast,
        loginTeacher,
        registerTeacher,
        requestCode,
        loginAdmin,
        logout,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        adminLoginModalOpen,
        setAdminLoginModalOpen,
        upgradeModalOpen,
        setUpgradeModalOpen,
        updateUserCredits,
        refreshUser,
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
