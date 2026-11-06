/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import type { NavTab } from '../types.ts';
import {
  GraduationCap,
  Sparkles,
  Home,
  Gamepad2,
  FlaskConical,
  ShieldCheck,
  LogIn,
  LogOut,
  UserCheck,
  X,
  Compass,
  LayoutGrid,
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  gameCount: number;
  totalAppsCount?: number;
  simulationsCount?: number;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  gameCount,
  totalAppsCount,
  simulationsCount,
  mobileOpen,
  setMobileOpen,
}) => {
  const { user, logout, setAuthModalOpen, setAuthModalTab, setAdminLoginModalOpen, setUpgradeModalOpen } = useAuth();

  const handleNavClick = (tab: NavTab) => {
    if (tab === 'admin') {
      if (user?.role === 'admin') {
        setCurrentTab('admin');
      } else {
        setAdminLoginModalOpen(true);
      }
    } else {
      setCurrentTab(tab);
    }
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-5 overflow-y-auto bg-gradient-to-b from-white via-sky-50/30 to-blue-50/30">
      {/* Top Brand & Menu Header */}
      <div className="space-y-6">
        {/* Brand header */}
        <div className="flex items-center justify-between">
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-200/60 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 bg-clip-text text-transparent">
                  GIÁO VIÊN SÁNG TẠO
                </span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200 mt-0.5">
                <Sparkles className="w-2.5 h-2.5 mr-1 text-sky-500" /> Tiểu học 4.0
              </span>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slogan */}
        <div className="p-3 bg-sky-50/90 rounded-2xl border border-sky-100 text-xs text-sky-950 leading-relaxed font-medium shadow-2xs">
          <p className="font-extrabold text-sky-700 mb-0.5 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            <span>Sáng tạo học liệu số</span>
          </p>
          <p className="text-[11px] text-slate-600">
            Kết nối tri thức – Lan tỏa niềm vui học tập
          </p>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-1.5">
          {/* Trang chủ */}
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer ${
              currentTab === 'home'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-200 font-extrabold'
                : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/70'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${currentTab === 'home' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <Home className="w-4 h-4" />
            </div>
            <span>Trang chủ</span>
          </button>

          {/* Trò chơi tương tác */}
          <button
            onClick={() => handleNavClick('games')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer ${
              currentTab === 'games'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-200 font-extrabold'
                : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-xl ${currentTab === 'games' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Gamepad2 className="w-4 h-4" />
              </div>
              <span>Trò chơi tương tác</span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                currentTab === 'games' ? 'bg-white text-sky-700' : 'bg-sky-100 text-sky-800'
              }`}
            >
              {gameCount}
            </span>
          </button>

          {/* Kho ứng dụng */}
          <button
            onClick={() => handleNavClick('store')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer ${
              currentTab === 'store'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-200 font-extrabold'
                : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-xl ${currentTab === 'store' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <LayoutGrid className="w-4 h-4" />
              </div>
              <span>Kho ứng dụng</span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                currentTab === 'store' ? 'bg-white text-sky-700' : 'bg-sky-100 text-sky-800'
              }`}
            >
              {totalAppsCount ?? gameCount}
            </span>
          </button>

          {/* Thí nghiệm mô phỏng */}
          <button
            onClick={() => handleNavClick('simulations')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer ${
              currentTab === 'simulations'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-200 font-extrabold'
                : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-xl ${currentTab === 'simulations' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <FlaskConical className="w-4 h-4" />
              </div>
              <span>Thí nghiệm mô phỏng</span>
            </div>
            {simulationsCount !== undefined && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                  currentTab === 'simulations' ? 'bg-white text-sky-700' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {simulationsCount}
              </span>
            )}
          </button>

          {/* Phân hệ Quản trị máy chủ */}
          <div className="pt-2">
            <button
              onClick={() => handleNavClick('admin')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl font-semibold text-xs transition-all duration-200 cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-200 font-bold'
                  : 'text-slate-500 hover:text-blue-700 hover:bg-blue-50/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1 rounded-lg ${currentTab === 'admin' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Dành cho máy chủ quản lý</span>
              </div>
              {user?.role === 'admin' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom User Profile Section */}
      <div className="pt-4 border-t border-blue-100">
        {user ? (
          <div className="p-3 bg-white rounded-2xl border border-blue-100 shadow-2xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="truncate">
                <div className="text-xs font-extrabold text-slate-800 truncate flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{user.fullName}</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {user.role === 'admin' ? 'Quản trị viên' : user.school || user.email}
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                title="Đăng xuất"
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => {
                setAuthModalTab('login');
                setAuthModalOpen(true);
                setMobileOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập</span>
            </button>
            <button
              onClick={() => {
                setAuthModalTab('register');
                setAuthModalOpen(true);
                setMobileOpen(false);
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer text-center shadow-xs"
            >
              Đăng ký Giáo viên
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Navigation Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 h-screen sticky top-0 bg-white/95 backdrop-blur-md border-r border-blue-100 shadow-xs z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl z-50 animate-slide-right flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
