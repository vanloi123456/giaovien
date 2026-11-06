/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { ApplicationGame } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { AppIcon } from './AppIcon.tsx';
import { PlayCircle, Edit2, Trash2, Info, Gamepad2, FlaskConical, LayoutGrid, Share2, ExternalLink } from 'lucide-react';
import { extractGameDirectUrl } from '../utils/gameUrlHelper.ts';

interface GameCardProps {
  game: ApplicationGame;
  onPlay: (game: ApplicationGame) => void;
  onViewDetail: (game: ApplicationGame) => void;
  onEdit: (game: ApplicationGame) => void;
  onDelete: (game: ApplicationGame) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onPlay,
  onViewDetail,
  onEdit,
  onDelete,
}) => {
  const { user, showToast, setAuthModalOpen, setAuthModalTab } = useAuth();

  const handleCopyShareLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showToast('Thầy/Cô vui lòng đăng nhập tài khoản để sao chép liên kết học liệu.', 'info');
      setAuthModalTab('login');
      setAuthModalOpen(true);
      return;
    }
    const { url } = extractGameDirectUrl(game.embedCode, game.id);
    const targetUrl = url || `${window.location.origin}/?play=${game.id}`;
    navigator.clipboard.writeText(targetUrl).then(() => {
      showToast(`✓ Đã sao chép link: ${targetUrl}`, 'success');
    }).catch(() => {
      showToast(`Link: ${targetUrl}`, 'info');
    });
  };

  // Can this user edit or delete? Admin or creator
  const canModify = Boolean(
    user &&
      (user.role === 'admin' ||
        (game.createdBy && (game.createdBy === user.id || game.createdBy === user.email)))
  );

  const isSimulation = game.category === 'simulation';
  const isGame = !game.category || game.category === 'game';

  const { url: directUrl } = extractGameDirectUrl(game.embedCode, game.id);
  const targetPlayUrl =
    directUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/api/play/${encodeURIComponent(game.id)}/raw`
      : `/api/play/${encodeURIComponent(game.id)}/raw`);

  const handleLinkClick = () => {
    if (game.id && !game.id.startsWith('custom-')) {
      fetch(`/api/applications/${encodeURIComponent(game.id)}/play-increment`, { method: 'POST' }).catch(() => {});
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 hover:border-sky-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner & Title */}
      <div className="p-6 pb-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          {/* Enhanced App Icon with soft gradient container */}
          <div className="group-hover:scale-105 transition-transform duration-200">
            <AppIcon icon={game.iconOrImage} category={game.category} size="lg" />
          </div>

          {/* Contextual Category Badge */}
          {isSimulation ? (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs">
              <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
              <span>Thí nghiệm mô phỏng</span>
            </div>
          ) : isGame ? (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs">
              <Gamepad2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Trò chơi tương tác</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs">
              <LayoutGrid className="w-3.5 h-3.5 text-sky-600" />
              <span>Kho ứng dụng</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3
          onClick={() => onViewDetail(game)}
          className="text-base sm:text-lg font-black text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
          title={game.title}
        >
          {game.title}
        </h3>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewDetail(game)}
            className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            title="Xem thông tin chi tiết"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">Chi tiết</span>
          </button>

          <button
            onClick={handleCopyShareLink}
            className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            title="Sao chép liên kết để chia sẻ cho học sinh"
          >
            <Share2 className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">Sao chép link</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {canModify && (
            <>
              <button
                onClick={() => onEdit(game)}
                className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer"
                title="Chỉnh sửa học liệu"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(game)}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                title="Xóa học liệu"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          <a
            href={targetPlayUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-md shadow-blue-200 active:scale-95 transition-all cursor-pointer"
            title="Mở riêng biệt link học liệu trong tab mới"
          >
            <PlayCircle className="w-4 h-4" />
            <span>
              {isSimulation ? '▶ VÀO THÍ NGHIỆM' : isGame ? '▶ VÀO TRÒ CHƠI' : '▶ VÀO ỨNG DỤNG'}
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </div>
    </div>
  );
};
