/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import type { ApplicationGame } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ICON_PRESETS } from '../constants/subjects.ts';
import {
  FlaskConical,
  Search,
  Sparkles,
  PlayCircle,
  PlusCircle,
  Edit2,
  Trash2,
  Info,
  X,
  Server,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { extractGameDirectUrl } from '../utils/gameUrlHelper.ts';
import { SimulationsAvatar } from './StoreAvatars.tsx';
import { AppIcon } from './AppIcon.tsx';

interface SimulationsViewProps {
  simulations: ApplicationGame[];
  onOpenSimulation: (sim: ApplicationGame) => void;
  onViewDetail: (sim: ApplicationGame) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (sim: ApplicationGame) => void;
  onDeleteSimulation: (sim: ApplicationGame) => void;
}

export const SimulationsView: React.FC<SimulationsViewProps> = ({
  simulations,
  onOpenSimulation,
  onViewDetail,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteSimulation,
}) => {
  const { user, setAuthModalOpen, setAuthModalTab, setUpgradeModalOpen, showToast } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyMySims, setOnlyMySims] = useState(false);

  const handleCopyShareLink = (sim: ApplicationGame, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showToast('Thầy/Cô vui lòng đăng nhập tài khoản để sao chép liên kết thí nghiệm.', 'info');
      setAuthModalTab('login');
      setAuthModalOpen(true);
      return;
    }
    const { url } = extractGameDirectUrl(sim.embedCode, sim.id);
    const targetUrl = url || `${window.location.origin}/?play=${sim.id}`;
    navigator.clipboard.writeText(targetUrl).then(() => {
      showToast(`✓ Đã sao chép link thí nghiệm: ${targetUrl}`, 'success');
    }).catch(() => {
      showToast(`Link thí nghiệm: ${targetUrl}`, 'info');
    });
  };

  const handleAddClick = () => {
    if (!user) {
      setAuthModalTab('register');
      setAuthModalOpen(true);
      return;
    }
    if (user.role === 'teacher' && (user.credits ?? 10) < 5) {
      setUpgradeModalOpen(true);
      return;
    }
    onOpenAddModal();
  };

  const getPresetEmoji = (iconOrImage: string) => {
    const preset = ICON_PRESETS.find((p) => p.id === iconOrImage);
    if (preset) return preset.emoji;
    if (iconOrImage?.startsWith('http') || iconOrImage?.startsWith('data:')) {
      return null;
    }
    return '🧪';
  };

  const filteredSimulations = useMemo(() => {
    return simulations.filter((sim) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          sim.title.toLowerCase().includes(q) ||
          (sim.creatorName && sim.creatorName.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (onlyMySims && user && sim.createdBy !== user.id && sim.creatorEmail !== user.email) {
        return false;
      }

      return true;
    });
  }, [simulations, searchQuery, onlyMySims, user]);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner with Simulations Avatar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-white border border-blue-100 shadow-xs">
        <div className="flex items-center gap-4">
          <SimulationsAvatar size="lg" />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 mb-2">
              <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
              <span>Kho thí nghiệm mô phỏng trực quan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              THÍ NGHIỆM MÔ PHỎNG
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Các mô hình thí nghiệm tương tác (PhET, GeoGebra, Scratch, HTML/JS...). Dữ liệu được lưu trữ tự động và bảo toàn vĩnh viễn trên máy chủ.
            </p>
          </div>
        </div>

        {/* Action Button: Both Admin & Teacher can add */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0 w-full md:w-auto">
          <button
            onClick={handleAddClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-teal-600 via-sky-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-lg shadow-teal-200 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            <span>+ THÊM THÍ NGHIỆM MÔ PHỎNG</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thí nghiệm mô phỏng theo tên..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-hidden text-sm font-semibold text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {user && user.role === 'admin' && (
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 shrink-0">
              <input
                type="checkbox"
                checked={onlyMySims}
                onChange={(e) => setOnlyMySims(e.target.checked)}
                className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Thí nghiệm do tôi tải lên</span>
            </label>
          )}
        </div>
      </div>

      {/* Grid of Simulations or Empty State */}
      {filteredSimulations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSimulations.map((sim) => {
            const isCreatorOrAdmin = Boolean(
              user &&
                (user.role === 'admin' ||
                  (sim.createdBy && (sim.createdBy === user.id || sim.createdBy === user.email)))
            );

            return (
              <div
                key={sim.id}
                className="bg-white rounded-3xl border border-slate-200/80 hover:border-teal-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6 pb-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="group-hover:scale-105 transition-transform duration-200">
                      <AppIcon icon={sim.iconOrImage} category="simulation" size="lg" />
                    </div>

                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs">
                      <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
                      <span>Thí nghiệm mô phỏng</span>
                    </span>
                  </div>

                  <h3
                    onClick={() => onViewDetail(sim)}
                    className="text-base sm:text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
                    title={sim.title}
                  >
                    {sim.title}
                  </h3>
                </div>

                {/* Action Footer */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewDetail(sim)}
                      className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Xem chi tiết thí nghiệm"
                    >
                      <Info className="w-4 h-4" />
                      <span className="hidden sm:inline">Chi tiết</span>
                    </button>

                    <button
                      onClick={(e) => handleCopyShareLink(sim, e)}
                      className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Sao chép liên kết thí nghiệm"
                    >
                      <Share2 className="w-4 h-4 text-blue-600" />
                      <span className="hidden sm:inline">Sao chép link</span>
                    </button>

                    {isCreatorOrAdmin && (
                      <>
                        <button
                          onClick={() => onOpenEditModal(sim)}
                          className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Sửa thí nghiệm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteSimulation(sim)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Xóa thí nghiệm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {(() => {
                    const { url: directUrl } = extractGameDirectUrl(sim.embedCode, sim.id);
                    const targetPlayUrl =
                      directUrl ||
                      (typeof window !== 'undefined'
                        ? `${window.location.origin}/api/play/${encodeURIComponent(sim.id)}/raw`
                        : `/api/play/${encodeURIComponent(sim.id)}/raw`);

                    return (
                      <a
                        href={targetPlayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          if (sim.id && !sim.id.startsWith('custom-')) {
                            fetch(`/api/applications/${encodeURIComponent(sim.id)}/play-increment`, { method: 'POST' }).catch(() => {});
                          }
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-md shadow-blue-200 active:scale-95 transition-all cursor-pointer"
                        title="Mở riêng biệt link thí nghiệm trong tab mới"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>▶ VÀO THÍ NGHIỆM</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </a>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-dashed border-blue-200 p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl">
            🧪
          </div>
          <h3 className="text-lg font-black text-slate-800">Kho thí nghiệm mô phỏng</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            {user?.role === 'admin'
              ? 'Kho thí nghiệm hiện chưa có mô hình nào. Thầy/Cô hãy nhấn nút thêm bên dưới để nhúng mô hình thí nghiệm đầu tiên.'
              : 'Hiện chưa có thí nghiệm mô phỏng nào. Quản trị viên đang cập nhật các học liệu thí nghiệm mới lên hệ thống.'}
          </p>

          {user?.role === 'admin' ? (
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-md shadow-blue-200 cursor-pointer active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ THÊM THÍ NGHIỆM ĐẦU TIÊN</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <Sparkles className="w-4 h-4" />
              <span>Học liệu sẽ sớm được cập nhật</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
