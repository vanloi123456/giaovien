/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import type { ApplicationGame } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { GameCard } from './GameCard.tsx';
import {
  Search,
  PlusCircle,
  Gamepad2,
  LayoutGrid,
  Sparkles,
  X,
} from 'lucide-react';

import { AppStoreAvatar, InteractiveGamesAvatar } from './StoreAvatars.tsx';

interface AppStoreViewProps {
  applications: ApplicationGame[];
  onPlayGame: (game: ApplicationGame) => void;
  onViewDetail: (game: ApplicationGame) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (game: ApplicationGame) => void;
  onDeleteGame: (game: ApplicationGame) => void;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  addButtonText?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const AppStoreView: React.FC<AppStoreViewProps> = ({
  applications,
  onPlayGame,
  onViewDetail,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteGame,
  title = 'KHO ỨNG DỤNG & TRÒ CHƠI HỌC TẬP',
  subtitle = 'Tổng hợp các trò chơi trực quan phục vụ bài giảng. Mọi học liệu được lưu tự động và bảo toàn vĩnh viễn trên máy chủ.',
  badgeText = 'Kho học liệu số tương tác',
  addButtonText = '+ THÊM ỨNG DỤNG',
  emptyTitle,
  emptyDescription,
}) => {
  const { user, setAuthModalOpen, setAuthModalTab, setUpgradeModalOpen } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [onlyMyGames, setOnlyMyGames] = useState(false);

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      // Search by title or creator
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          app.title.toLowerCase().includes(q) ||
          (app.creatorName && app.creatorName.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Only my games for admin
      if (onlyMyGames && user && app.createdBy !== user.id && app.creatorEmail !== user.email) {
        return false;
      }

      return true;
    });
  }, [applications, searchQuery, onlyMyGames, user]);

  const handleAddClick = () => {
    if (!user) {
      setAuthModalTab('register');
      setAuthModalOpen(true);
      return;
    }
    // If teacher has less than 5 credits, open upgrade dialog
    if (user.role === 'teacher' && (user.credits ?? 10) < 5) {
      setUpgradeModalOpen(true);
      return;
    }
    onOpenAddModal();
  };

  const isGameSection = title.toUpperCase().includes('TRÒ CHƠI');

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header Banner with Suitable Avatar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-white border border-sky-100 shadow-xs">
        <div className="flex items-center gap-4">
          {/* Avatar representation */}
          {isGameSection ? (
            <InteractiveGamesAvatar size="lg" />
          ) : (
            <AppStoreAvatar size="lg" />
          )}

          <div>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 shadow-2xs ${
                isGameSection
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-sky-100 text-sky-800 border border-sky-200'
              }`}
            >
              {isGameSection ? (
                <Gamepad2 className="w-3.5 h-3.5 text-rose-600" />
              ) : (
                <LayoutGrid className="w-3.5 h-3.5 text-sky-600" />
              )}
              <span>{badgeText}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Action Button: Both Admin & Teacher can add */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0 w-full md:w-auto">
          <button
            onClick={handleAddClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 hover:from-blue-700 hover:to-sky-600 shadow-lg shadow-blue-200 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{addButtonText}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm trò chơi theo tên..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-hidden text-sm font-semibold text-slate-800 transition-all bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {user && user.role === 'admin' && (
            <button
              onClick={() => setOnlyMyGames(!onlyMyGames)}
              className={`px-4 py-3 rounded-2xl text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
                onlyMyGames
                  ? 'bg-sky-100 border-sky-300 text-sky-800 ring-2 ring-sky-200'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Trò chơi do tôi thêm
            </button>
          )}
        </div>
      </div>

      {/* Grid of Games or Empty State */}
      {filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPlay={onPlayGame}
              onViewDetail={onViewDetail}
              onEdit={onOpenEditModal}
              onDelete={onDeleteGame}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center max-w-xl mx-auto space-y-4">
          <div
            className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center text-3xl shadow-xs ${
              isGameSection ? 'bg-rose-50 text-rose-600' : 'bg-sky-50 text-sky-600'
            }`}
          >
            {isGameSection ? '🎮' : '📱'}
          </div>
          <h3 className="text-lg font-black text-slate-800">{emptyTitle || 'Kho ứng dụng & Trò chơi'}</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            {emptyDescription || (user?.role === 'admin'
              ? 'Kho ứng dụng hiện đang trống. Thầy/Cô hãy nhấn nút thêm bên dưới để thêm trò chơi đầu tiên vào kho.'
              : 'Hiện chưa có trò chơi nào trong kho. Quản trị viên đang cập nhật học liệu số.')}
          </p>

          {user?.role === 'admin' ? (
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-md shadow-blue-200 cursor-pointer active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{addButtonText || '+ THÊM ỨNG DỤNG ĐẦU TIÊN'}</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200">
              <Sparkles className="w-4 h-4" />
              <span>Trò chơi sẽ sớm được cập nhật</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
