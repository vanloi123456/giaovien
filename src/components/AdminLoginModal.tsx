/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { X, ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onSuccess }) => {
  const { adminLoginModalOpen, setAdminLoginModalOpen, loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!adminLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const result = await loginAdmin(email, password);
    setLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      setErrorMessage(result.message || 'Email hoặc Mật khẩu quản trị không đúng.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-sky-600 p-6 text-white relative">
          <button
            onClick={() => {
              setAdminLoginModalOpen(false);
              setErrorMessage(null);
            }}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <ShieldCheck className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-black">Máy chủ Quản lý</h2>
              <p className="text-xs text-purple-200">Khu vực dành riêng cho Chủ sở hữu</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900">
            <strong>Khu vực quản trị riêng:</strong> Dùng để phê duyệt tài khoản, cấp và cấp lại mã kích hoạt, quản lý kho trò chơi và cấu hình hệ thống.
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Quản trị viên
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email quản trị..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-hidden text-sm font-semibold text-slate-800 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Mật khẩu Quản trị
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu quản trị..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-hidden text-sm font-semibold text-slate-800 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 hover:from-blue-800 hover:to-blue-700 shadow-md shadow-blue-200 active:scale-95 transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP QUẢN TRỊ'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
