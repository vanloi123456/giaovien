/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import type { NavTab } from '../types.ts';
import {
  Menu,
  UserCheck,
  LogOut,
  LogIn,
  Home,
  Gamepad2,
  LayoutGrid,
  FlaskConical,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';

interface TopBarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  onToggleMobileMenu: () => void;
  gameCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  setCurrentTab,
  onToggleMobileMenu,
  gameCount,
}) => {
  const { user, logout, setAuthModalOpen, setAuthModalTab, setAdminLoginModalOpen, setUpgradeModalOpen } = useAuth();

  const getTabTitle = () => {
    switch (currentTab) {
      case 'home':
        return { title: 'Trang chủ', subtitle: 'Tổng quan hệ thống học liệu số', icon: Home };
      case 'games':
        return { title: 'Trò chơi tương tác', subtitle: 'Kho trò chơi số tương tác sinh động, trực quan phục vụ dạy học', icon: Gamepad2 };
      case 'store':
        return { title: 'Kho ứng dụng', subtitle: 'Khám phá và tham gia các trò chơi học tập', icon: LayoutGrid };
      case 'simulations':
        return { title: 'Thí nghiệm mô phỏng', subtitle: 'Mô hình thí nghiệm khoa học trực quan', icon: FlaskConical };
      case 'admin':
        return { title: 'Máy chủ quản lý', subtitle: 'Bảng điều khiển dành cho Chủ sở hữu hệ thống', icon: ShieldCheck };
    }
  };

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
  };

  const currentMeta = getTabTitle();
  const IconComponent = currentMeta.icon;

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-2xs h-16 sm:h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left side: Hamburger button + Page Title */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl text-blue-700 hover:text-blue-900 hover:bg-blue-50 transition-colors"
          title="Mở menu điều hướng"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* View title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0 shadow-2xs">
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 leading-tight flex items-center gap-2">
              <span>{currentMeta.title}</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-blue-600/70 hidden sm:block">
              {currentMeta.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Center: Quick navigation menu: Trang chủ, Trò chơi tương tác, Kho ứng dụng, Thí nghiệm mô phỏng */}
      <nav className="hidden lg:flex items-center gap-1.5 bg-blue-50/70 p-1 rounded-2xl border border-blue-100">
        <button
          onClick={() => handleNavClick('home')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentTab === 'home'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100/60'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Trang chủ</span>
        </button>

        <button
          onClick={() => handleNavClick('games')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentTab === 'games'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100/60'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Trò chơi tương tác</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${currentTab === 'games' ? 'bg-white text-sky-700' : 'bg-sky-200 text-sky-800'}`}>
            {gameCount}
          </span>
        </button>

        <button
          onClick={() => handleNavClick('store')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentTab === 'store'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100/60'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Kho ứng dụng</span>
        </button>

        <button
          onClick={() => handleNavClick('simulations')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentTab === 'simulations'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100/60'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Thí nghiệm mô phỏng</span>
        </button>
      </nav>

      {/* Right side: Thanh thông tin tài khoản */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* User Account info */}
        {user ? (
          <div className="flex items-center gap-2.5 bg-white p-1.5 sm:px-3 sm:py-2 rounded-2xl border border-blue-100 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate max-w-[130px]">{user.fullName}</span>
              </div>
              <div className="text-[10px] text-blue-700 font-semibold truncate max-w-[130px]">
                {user.role === 'admin' ? 'Quản trị viên' : user.school || user.email}
              </div>
            </div>
            <button
              onClick={logout}
              title="Đăng xuất"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAuthModalTab('login');
                setAuthModalOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
            <button
              onClick={() => {
                setAuthModalTab('register');
                setAuthModalOpen(true);
              }}
              className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Đăng ký</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
