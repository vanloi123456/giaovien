/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import type { ApplicationGame } from '../types.ts';
import {
  Sparkles,
  Gamepad2,
  FlaskConical,
  Compass,
  LayoutGrid,
  ArrowRight,
  UserPlus,
  LogIn,
  GraduationCap,
  PlayCircle,
  PlusCircle,
  Coins,
  Zap,
} from 'lucide-react';
import { AppStoreAvatar, InteractiveGamesAvatar, SimulationsAvatar } from './StoreAvatars.tsx';
import { AppIcon } from './AppIcon.tsx';

interface HomeViewProps {
  onNavigateToStore: () => void;
  onNavigateToGames: () => void;
  onNavigateToSimulations: () => void;
  onOpenAddModal?: (cat?: 'game' | 'simulation') => void;
  onOpenGamePlay?: (game: ApplicationGame) => void;
  onOpenAdmin?: () => void;
  stats?: any;
  applications?: ApplicationGame[];
  games?: ApplicationGame[];
  simulations?: ApplicationGame[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigateToStore,
  onNavigateToGames,
  onNavigateToSimulations,
  onOpenAddModal,
  onOpenGamePlay,
  applications = [],
  games = [],
  simulations = [],
}) => {
  const { user, setAuthModalOpen, setAuthModalTab, setUpgradeModalOpen } = useAuth();

  const allAppsCount = applications.length > 0 ? applications.length : (games.length + simulations.length);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Centered Welcome Hero Card in soft Azure Blue */}
      <section className="relative w-full max-w-3xl mx-auto overflow-hidden rounded-3xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white shadow-xl shadow-sky-200/50 p-6 sm:p-8 text-center border border-white/30">
        {/* Soft background glows */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/15 rounded-full blur-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-amber-300/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Graduation Cap Icon */}
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-sm mb-3 border border-white/30">
            <GraduationCap className="w-8 h-8 text-amber-200" />
          </div>

          {/* User greeting if logged in */}
          {user ? (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-200 text-xs font-bold border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  Kính chào Thầy/Cô: <strong>{user.fullName}</strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-sky-50 text-xs font-bold mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Nền tảng tương tác dành cho Giáo viên Tiểu học</span>
            </div>
          )}

          {/* Main Titles */}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-1.5 text-white">
            Chào mừng quý thầy cô
          </h1>

          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-amber-200 mb-2 font-quicksand">
            Đến với Website Giáo viên sáng tạo
          </h2>

          <p className="text-xs sm:text-sm text-sky-50 leading-relaxed mb-6 max-w-lg font-medium">
            Sáng tạo – Kết nối tri thức – Lan tỏa niềm vui học tập. Nơi lưu trữ, quản lý và chia sẻ trò chơi học tập cùng thí nghiệm mô phỏng trực quan.
          </p>

          {/* Quick Access to all 3 sections */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
            <button
              onClick={onNavigateToStore}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-white text-sky-700 hover:bg-sky-50 shadow-md shadow-sky-900/10 active:scale-95 transition-all cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4 text-sky-600" />
              <span>Kho ứng dụng</span>
            </button>

            <button
              onClick={onNavigateToGames}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-amber-300 hover:bg-amber-200 text-slate-900 shadow-md shadow-amber-900/10 active:scale-95 transition-all cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4 text-amber-700" />
              <span>Trò chơi tương tác</span>
            </button>

            <button
              onClick={onNavigateToSimulations}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-md shadow-sky-900/10 active:scale-95 transition-all cursor-pointer backdrop-blur-xs"
            >
              <FlaskConical className="w-4 h-4 text-cyan-200" />
              <span>Thí nghiệm mô phỏng</span>
            </button>

            {!user && (
              <div className="w-full flex items-center justify-center gap-2 pt-2 border-t border-white/20 mt-1">
                <button
                  onClick={() => {
                    setAuthModalTab('register');
                    setAuthModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-white shadow-sm shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Đăng ký tài khoản Giáo viên</span>
                </button>

                <button
                  onClick={() => {
                    setAuthModalTab('login');
                    setAuthModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-white/20 hover:bg-white/30 text-white border border-white/30 active:scale-95 transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng nhập</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. MÀN HÌNH CHÍNH: HIỂN THỊ ĐẦY ĐỦ 3 KHỐI MENU VỚI HÌNH ĐẠI DIỆN PHÙ HỢP */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            HỌC LIỆU SỐ & KHÔNG GIAN SÁNG TẠO
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Khám phá trọn bộ 3 phân hệ tương tác phục vụ bài giảng đổi mới phương pháp dạy học
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* KHỐI 1: KHO ỨNG DỤNG */}
          <div className="bg-white rounded-3xl border border-sky-100 shadow-xs hover:shadow-lg transition-all p-6 flex flex-col justify-between group">
            <div>
              {/* Header with Avatar đại diện phù hợp */}
              <div className="flex items-center justify-between mb-4">
                <AppStoreAvatar size="md" className="group-hover:scale-105 transition-transform" />
                <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-800 border border-sky-200">
                  {allAppsCount} ứng dụng
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
                <span>Kho ứng dụng</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Tổng hợp toàn bộ các ứng dụng giáo dục, phần mềm và học liệu số tương tác phục vụ dạy học toàn diện.
              </p>

              {/* Sample list preview */}
              {applications.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {applications.slice(0, 3).map((app) => (
                    <div
                      key={app.id}
                      onClick={() => onOpenGamePlay && onOpenGamePlay(app)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-100 transition-colors cursor-pointer group/item"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AppIcon icon={app.iconOrImage} category={app.category || 'app'} size="xs" />
                        <p className="text-xs font-bold text-slate-800 truncate group-hover/item:text-sky-700">
                          {app.title}
                        </p>
                      </div>
                      <PlayCircle className="w-4 h-4 text-sky-600 shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 bg-sky-50/60 rounded-2xl border border-dashed border-sky-200 text-center text-xs text-slate-500 mb-4">
                  Kho ứng dụng sẵn sàng. Thầy/Cô có thể vào khám phá ngay!
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={onNavigateToStore}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <span>Vào Kho ứng dụng</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {user && onOpenAddModal && (
                <button
                  onClick={() => onOpenAddModal('game')}
                  className="p-2.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold transition-colors cursor-pointer"
                  title="Thêm ứng dụng mới"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* KHỐI 2: TRÒ CHƠI TƯƠNG TÁC */}
          <div className="bg-white rounded-3xl border border-rose-100 shadow-xs hover:shadow-lg transition-all p-6 flex flex-col justify-between group">
            <div>
              {/* Header with Avatar đại diện phù hợp */}
              <div className="flex items-center justify-between mb-4">
                <InteractiveGamesAvatar size="md" className="group-hover:scale-105 transition-transform" />
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200">
                  {games.length} trò chơi
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
                <span>Trò chơi tương tác</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Kho trò chơi số hóa sinh động, kích thích tư duy, tương tác học tập hào hứng cho học sinh tiểu học.
              </p>

              {/* Sample list preview */}
              {games.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {games.slice(0, 3).map((game) => (
                    <div
                      key={game.id}
                      onClick={() => onOpenGamePlay && onOpenGamePlay(game)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-100 transition-colors cursor-pointer group/item"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AppIcon icon={game.iconOrImage} category="game" size="xs" />
                        <p className="text-xs font-bold text-slate-800 truncate group-hover/item:text-rose-700">
                          {game.title}
                        </p>
                      </div>
                      <PlayCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-dashed border-rose-200 text-center text-xs text-slate-500 mb-4">
                  Chưa có trò chơi tương tác nào. Hãy thêm trò chơi đầu tiên!
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={onNavigateToGames}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <span>Vào Trò chơi tương tác</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {user && onOpenAddModal && (
                <button
                  onClick={() => onOpenAddModal('game')}
                  className="p-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                  title="Thêm trò chơi mới"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* KHỐI 3: THÍ NGHIỆM MÔ PHỎNG */}
          <div className="bg-white rounded-3xl border border-teal-100 shadow-xs hover:shadow-lg transition-all p-6 flex flex-col justify-between group">
            <div>
              {/* Header with Avatar đại diện phù hợp */}
              <div className="flex items-center justify-between mb-4">
                <SimulationsAvatar size="md" className="group-hover:scale-105 transition-transform" />
                <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-100 text-teal-800 border border-teal-200">
                  {simulations.length} thí nghiệm
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
                <span>Thí nghiệm mô phỏng</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Mô hình thực hành thí nghiệm khoa học, vật lý, toán học trực quan (PhET, GeoGebra, Scratch, HTML5...).
              </p>

              {/* Sample list preview */}
              {simulations.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {simulations.slice(0, 3).map((sim) => (
                    <div
                      key={sim.id}
                      onClick={() => onOpenGamePlay && onOpenGamePlay(sim)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-100 transition-colors cursor-pointer group/item"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AppIcon icon={sim.iconOrImage} category="simulation" size="xs" />
                        <p className="text-xs font-bold text-slate-800 truncate group-hover/item:text-teal-700">
                          {sim.title}
                        </p>
                      </div>
                      <PlayCircle className="w-4 h-4 text-teal-600 shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 bg-teal-50/60 rounded-2xl border border-dashed border-teal-200 text-center text-xs text-slate-500 mb-4">
                  Mô hình thí nghiệm trực quan, trực tiếp thao tác thực nghiệm.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={onNavigateToSimulations}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <span>Vào Thí nghiệm mô phỏng</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {user && onOpenAddModal && (
                <button
                  onClick={() => onOpenAddModal('simulation')}
                  className="p-2.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 text-xs font-bold transition-colors cursor-pointer"
                  title="Thêm thí nghiệm mới"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
