/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Lock,
  Sparkles,
  UserPlus,
  LogIn,
  Phone,
  Gamepad2,
  FlaskConical,
  Copy,
  Check,
  MessageCircle,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ApplicationGame } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface RequireAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetGame: ApplicationGame | null;
  onGoToRegister: () => void;
  onGoToLogin: () => void;
  onVerificationSuccess?: () => void;
  onOpenAdminLogin?: () => void;
}

export const RequireAuthModal: React.FC<RequireAuthModalProps> = ({
  isOpen,
  onClose,
  targetGame,
  onGoToRegister,
  onGoToLogin,
  onVerificationSuccess,
  onOpenAdminLogin,
}) => {
  const { user, showToast } = useAuth();
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isSimulation = targetGame?.category === 'simulation';
  const authorPhone = '0775987267';

  const handleCopyPhone = () => {
    navigator.clipboard
      .writeText(authorPhone)
      .then(() => {
        setCopiedPhone(true);
        showToast('✓ Đã sao chép số điện thoại tác giả Đào Văn Lợi: 0775987267', 'success');
        setTimeout(() => setCopiedPhone(false), 3000);
      })
      .catch(() => {
        showToast(`Số điện thoại tác giả: ${authorPhone}`, 'info');
      });
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationCode.trim()) {
      setVerifyError('Vui lòng nhập mã kích hoạt hoặc xác thực.');
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);

    try {
      const res = await fetch('/api/auth/verify-access-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activationCode.trim(),
          email: user?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setVerifyError(
          data.error ||
            'Mã xác thực không hợp lệ. Vui lòng liên hệ tác giả Đào Văn Lợi qua số 0775987267 để được hỗ trợ.'
        );
        return;
      }

      // Mark verified in localStorage
      localStorage.setItem('gvst_teacher_verified', 'true');

      // Trigger confetti celebrate
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore
      }

      showToast(
        data.message || 'Xác thực tài khoản thành công! Thầy/Cô đã có thể vào ứng dụng.',
        'success'
      );
      onClose();
      if (onVerificationSuccess) {
        onVerificationSuccess();
      }
    } catch (err) {
      setVerifyError('Không thể kết nối với máy chủ để xác thực mã.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden animate-scale-up my-auto">
        {/* Header Ribbon / Background */}
        <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-sky-700 px-6 py-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Đóng hộp thoại"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Graphic Icon */}
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-lg mb-3">
            {isSimulation ? (
              <FlaskConical className="w-8 h-8 text-blue-600" />
            ) : (
              <Gamepad2 className="w-8 h-8 text-sky-600" />
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow-sm">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Thông báo từ hệ thống</span>
          </span>

          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
            Thầy, cô hãy đăng ký và xác thực tài khoản để truy cập ứng dụng
          </h3>

          {targetGame && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 text-sky-50 text-xs font-medium max-w-md truncate">
              <span>Đang mở:</span>
              <strong className="text-white underline truncate">{targetGame.title}</strong>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Exact Required Vietnamese Text Prompt Card */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl border-2 border-blue-200/90 text-blue-950 space-y-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Phone className="w-4 h-4" />
              </div>
              <div className="space-y-1 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                  "Để truy cập kho ứng dụng, thầy, cô vui lòng liên hệ với tác giả: <strong className="text-blue-700 font-black">Đào Văn Lợi</strong>, qua số điện thoại: <strong className="text-blue-800 font-black tracking-wide">0775987267</strong> để được tư vấn. Trân trọng cảm ơn quý thầy cô!"
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Tác giả: <strong>Đào Văn Lợi</strong> – Trường TH&THCS Tân Khánh Trung, tỉnh Đồng Tháp
                </p>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <a
                href="tel:0775987267"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Gọi ngay: 0775987267</span>
              </a>

              <button
                type="button"
                onClick={handleCopyPhone}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-blue-700 border border-blue-300 font-bold text-xs active:scale-95 transition-all cursor-pointer"
              >
                {copiedPhone ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép SĐT</span>
                  </>
                )}
              </button>

              <a
                href="https://zalo.me/0775987267"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300 font-bold text-xs active:scale-95 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 text-sky-600" />
                <span>Nhắn tin Zalo</span>
              </a>
            </div>
          </div>

          {/* Current User Status (if logged in as teacher) */}
          {user && user.role === 'teacher' && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span>Thầy/Cô đang đăng nhập: <strong>{user.fullName}</strong> ({user.email}).</span>
                <span className="block mt-0.5 text-amber-800">
                  Vui lòng liên hệ tác giả để nhận mã kích hoạt mở khóa toàn bộ ứng dụng, hoặc nhập mã vào ô bên dưới.
                </span>
              </div>
            </div>
          )}

          {/* Instant Code Verification Form */}
          <form onSubmit={handleVerifyCode} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="modalActivationCode" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span>Thầy/Cô đã được tác giả cấp mã kích hoạt?</span>
              </label>
            </div>

            <div className="flex gap-2">
              <input
                id="modalActivationCode"
                type="text"
                value={activationCode}
                onChange={(e) => {
                  setActivationCode(e.target.value);
                  setVerifyError(null);
                }}
                placeholder="Nhập mã kích hoạt của Thầy/Cô..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs font-semibold text-slate-800 outline-hidden bg-white"
              />
              <button
                type="submit"
                disabled={isVerifying}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {isVerifying ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>Xác thực & Vào</span>
              </button>
            </div>

            {verifyError && (
              <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{verifyError}</span>
              </p>
            )}
          </form>

          {/* Registration and Login CTA Buttons */}
          <div className="space-y-2.5 pt-1">
            {!user ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToRegister();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-sky-500 via-blue-600 to-sky-600 hover:from-sky-600 hover:to-blue-700 shadow-md shadow-sky-200 active:scale-95 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Đăng ký tài khoản Giáo viên mới</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToLogin();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 active:scale-95 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-sky-600" />
                  <span>Đã đăng ký tài khoản? Đăng nhập ngay</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToLogin();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 active:scale-95 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-sky-600" />
                <span>Đổi tài khoản hoặc đăng nhập lại</span>
              </button>
            )}
          </div>

          {/* Admin bypass hint */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenAdminLogin) {
                  onOpenAdminLogin();
                }
              }}
              className="text-[11px] text-slate-400 hover:text-blue-600 font-medium transition-colors cursor-pointer"
            >
              Dành cho Tác giả & Quản trị viên hệ thống »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
