/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Sparkles,
  Gamepad2,
  Home,
  ShieldCheck,
  PlusCircle,
  LogIn,
  LogOut,
  UserCheck,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';

import type { NavTab } from '../types.ts';

interface NavbarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  onOpenAddModal: () => void;
  gameCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAddModal,
  gameCount,
}) => {
  const {
    user,
    logout,
    setAuthModalOpen,
    setAuthModalTab,
    setAdminLoginModalOpen,
  } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAddClick = () => {
    if (!user) {
      setAuthModalTab('login');
      setAuthModalOpen(true);
      return;
    }
    onOpenAddModal();
  };

  const handleAdminClick = () => {
    if (user?.role === 'admin') {
      setCurrentTab('admin');
    } else {
      setAdminLoginModalOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-sky-200 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  GIÁO VIÊN SÁNG TẠO
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-500" /> Tiểu học
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden md:block">
                Sáng tạo học liệu – Kết nối tri thức – Lan tỏa niềm vui học tập
              </p>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setCurrentTab('home')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                currentTab === 'home'
                  ? 'bg-sky-50 text-sky-700 shadow-xs border border-sky-200/80 font-bold'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Trang chủ</span>
            </button>

            <button
              onClick={() => setCurrentTab('store')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                currentTab === 'store'
                  ? 'bg-sky-50 text-sky-700 shadow-xs border border-sky-200/80 font-bold'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Kho ứng dụng</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-sky-200 text-sky-800">
                {gameCount}
              </span>
            </button>

            <button
              onClick={handleAdminClick}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                currentTab === 'admin'
                  ? 'bg-purple-50 text-purple-700 shadow-xs border border-purple-200/80 font-bold'
                  : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              <span>Dành cho máy chủ quản lý</span>
              {user?.role === 'admin' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          </nav>

          {/* Action buttons on the right */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-md shadow-sky-200 hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Thêm ứng dụng</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800 flex items-center justify-end gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{user.fullName}</span>
                  </div>
                  <div className="text-xs text-slate-500 truncate max-w-[150px]">
                    {user.role === 'admin' ? 'Quản trị viên' : user.school || user.email}
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Đăng xuất"
                  className="p-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => {
                    setAuthModalTab('login');
                    setAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </button>
                <button
                  onClick={() => {
                    setAuthModalTab('register');
                    setAuthModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-200"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => {
              setCurrentTab('home');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm ${
              currentTab === 'home' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Trang chủ</span>
          </button>

          <button
            onClick={() => {
              setCurrentTab('store');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm ${
              currentTab === 'store' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-5 h-5" />
              <span>Kho ứng dụng</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-200 text-sky-800">
              {gameCount}
            </span>
          </button>

          <button
            onClick={() => {
              handleAdminClick();
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm ${
              currentTab === 'admin' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <span>Dành cho máy chủ quản lý</span>
          </button>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                handleAddClick();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600"
            >
              <PlusCircle className="w-5 h-5" />
              <span>+ Thêm ứng dụng</span>
            </button>

            {user ? (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-bold text-sm text-slate-800">{user.fullName}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setAuthModalTab('login');
                    setAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 text-center text-sm font-bold text-sky-700 bg-sky-50 rounded-xl"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => {
                    setAuthModalTab('register');
                    setAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 text-center text-sm font-bold text-white bg-indigo-600 rounded-xl"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
