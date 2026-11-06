/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  LogIn,
  UserPlus,
  KeyRound,
  Mail,
  School,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    loginTeacher,
    registerTeacher,
    requestCode,
    setAdminLoginModalOpen,
  } = useAuth();

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginCode, setLoginCode] = useState('');

  // Register states
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [regProvince, setRegProvince] = useState('');

  // Request code state
  const [reqEmail, setReqEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const result = await loginTeacher(loginEmail, loginCode);
    setLoading(false);
    if (!result.success) {
      setErrorMessage(result.message || 'Đăng nhập không thành công.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);
    setLoading(true);

    const result = await registerTeacher({
      fullName: regFullName,
      email: regEmail,
      school: regSchool,
      province: regProvince,
    });

    setLoading(false);
    if (result.success) {
      setSuccessInfo(result.message);
      // clear inputs
      setRegFullName('');
      setRegEmail('');
      setRegSchool('');
      setRegProvince('');
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleRequestCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);
    setLoading(true);

    const result = await requestCode(reqEmail);
    setLoading(false);
    if (result.success) {
      setSuccessInfo(result.message);
      setReqEmail('');
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden animate-scale-up my-8">
        {/* Header with Title and Tabs */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 p-6 text-white relative">
          <button
            onClick={() => {
              setAuthModalOpen(false);
              setErrorMessage(null);
              setSuccessInfo(null);
            }}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-black">Cổng xác thực Giáo viên</h2>
              <p className="text-xs text-sky-100">Hệ thống Giáo Viên Sáng Tạo</p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-black/20 p-1 rounded-2xl">
            <button
              onClick={() => {
                setAuthModalTab('login');
                setErrorMessage(null);
                setSuccessInfo(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authModalTab === 'login' ? 'bg-white text-indigo-700 shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => {
                setAuthModalTab('register');
                setErrorMessage(null);
                setSuccessInfo(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authModalTab === 'register' ? 'bg-white text-indigo-700 shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              Đăng ký mới
            </button>
            <button
              onClick={() => {
                setAuthModalTab('request-code');
                setErrorMessage(null);
                setSuccessInfo(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authModalTab === 'request-code' ? 'bg-white text-indigo-700 shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              Cấp lại mã
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 mb-5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successInfo && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 text-xs sm:text-sm space-y-2.5 mb-5 shadow-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{successInfo}</span>
              </div>
              {successInfo.includes('0775987267') && (
                <div className="pt-2 border-t border-blue-200/80 flex items-center justify-between">
                  <span className="text-[11px] text-blue-700 font-semibold">Tác giả Đào Văn Lợi:</span>
                  <a
                    href="tel:0775987267"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    <span>📞 Gọi ngay: 0775987267</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {authModalTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email đăng ký của Thầy/Cô <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nguyenvana@gmail.com"
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-hidden text-sm font-semibold text-slate-800 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  * Nhập email Thầy/Cô đã đăng ký để đăng nhập trực tiếp vào hệ thống.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Mã kích hoạt / xác thực (nếu có)</span>
                  <span className="text-[10px] text-slate-400 font-normal lowercase">(không bắt buộc)</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value)}
                    placeholder="Không bắt buộc hoặc nhập mã GVST-..."
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-hidden text-sm font-mono font-bold tracking-wider text-sky-700 uppercase transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-md shadow-blue-200 active:scale-95 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP VÀO HỆ THỐNG'}</span>
              </button>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('register');
                    setErrorMessage(null);
                  }}
                  className="text-sky-600 hover:underline font-bold"
                >
                  Chưa có tài khoản? Đăng ký ngay
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('request-code');
                    setErrorMessage(null);
                  }}
                  className="text-slate-500 hover:underline"
                >
                  Cần hỗ trợ tài khoản?
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {authModalTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Teacher Register Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 text-xs text-sky-950 leading-relaxed shadow-2xs">
                <p className="font-extrabold text-sky-800 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>Dành cho Giáo viên sáng tạo</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  Đăng ký tài khoản giáo viên để tạo trò chơi tương tác, thí nghiệm mô phỏng và chia sẻ học liệu số phục vụ giảng dạy.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Họ và tên giáo viên <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Cô Nguyễn Thị Mai"
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-hidden text-sm font-semibold text-slate-800 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Địa chỉ Email Gmail <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nguyenthimai@gmail.com"
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-hidden text-sm font-semibold text-slate-800 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Trường công tác <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <School className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regSchool}
                      onChange={(e) => setRegSchool(e.target.value)}
                      placeholder="TH Chu Văn An"
                      className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-hidden text-sm font-semibold text-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Tỉnh / Thành phố <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regProvince}
                      onChange={(e) => setRegProvince(e.target.value)}
                      placeholder="Hà Nội, TP.HCM..."
                      className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-hidden text-sm font-semibold text-slate-800 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-emerald-500 via-teal-600 to-sky-600 hover:from-emerald-600 hover:to-sky-700 shadow-md shadow-emerald-200 active:scale-95 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Đang khởi tạo tài khoản...' : 'ĐĂNG KÝ VÀ NHẬN 10 TÍN CHỈ MIỄN PHÍ'}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-slate-600 hover:text-sky-600 font-bold"
                >
                  Đã có tài khoản? Chuyển sang Đăng nhập
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: REQUEST CODE REISSUE */}
          {authModalTab === 'request-code' && (
            <form onSubmit={handleRequestCodeSubmit} className="space-y-4">
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                Nếu Thầy/Cô quên mã, làm mất email hoặc mã đăng nhập bị hết hạn, vui lòng nhập lại email đăng ký để Quản trị viên cấp lại mã mới.
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email đã đăng ký
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={reqEmail}
                    onChange={(e) => setReqEmail(e.target.value)}
                    placeholder="nguyenvana@gmail.com"
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-hidden text-sm font-semibold text-slate-800 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 shadow-md shadow-amber-200 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Đang gửi yêu cầu...' : 'GỬI YÊU CẦU CẤP LẠI MÃ'}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-slate-600 hover:text-sky-600 font-bold"
                >
                  ← Quay lại Đăng nhập
                </button>
              </div>
            </form>
          )}

          {/* Quick link to Admin Portal */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setAuthModalOpen(false);
                setAdminLoginModalOpen(true);
              }}
              className="text-xs text-purple-600 hover:text-purple-800 font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Chủ sở hữu hệ thống? Đăng nhập quản trị tại đây</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
