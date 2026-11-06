/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import type { ApplicationGame } from '../types.ts';
import { X, PlayCircle, Gamepad2, FlaskConical, Server, Share2, Check, ExternalLink } from 'lucide-react';
import { extractGameDirectUrl } from '../utils/gameUrlHelper.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { AppIcon } from './AppIcon.tsx';

interface GameDetailModalProps {
  game: ApplicationGame | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (game: ApplicationGame) => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  isOpen,
  onClose,
  onPlay,
}) => {
  const { user, showToast, setAuthModalOpen, setAuthModalTab } = useAuth();
  const [copied, setCopied] = useState(false);
  if (!isOpen || !game) return null;

  const handleCopyLink = () => {
    if (!user) {
      showToast('Thầy/Cô vui lòng đăng nhập tài khoản để sao chép liên kết.', 'info');
      setAuthModalTab('login');
      setAuthModalOpen(true);
      return;
    }
    const { url } = extractGameDirectUrl(game.embedCode, game.id);
    const targetUrl = url || `${window.location.origin}/?play=${game.id}`;
    navigator.clipboard.writeText(targetUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const { url: directUrl } = extractGameDirectUrl(game.embedCode, game.id);
  const targetPlayUrl =
    directUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/api/play/${encodeURIComponent(game.id)}/raw`
      : `/api/play/${encodeURIComponent(game.id)}/raw`);

  const isSimulation = game.category === 'simulation';

  const handleLinkClick = () => {
    if (game.id && !game.id.startsWith('custom-')) {
      fetch(`/api/applications/${encodeURIComponent(game.id)}/play-increment`, { method: 'POST' }).catch(() => {});
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden animate-scale-up">
        {/* Header with colorful banner */}
        <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <AppIcon icon={game.iconOrImage} category={game.category} size="lg" className="bg-white/95 shadow-md" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white mb-1.5">
                {isSimulation ? <FlaskConical className="w-3.5 h-3.5" /> : <Gamepad2 className="w-3.5 h-3.5" />}
                <span>{isSimulation ? 'Thí nghiệm mô phỏng' : 'Kho ứng dụng & trò chơi'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black leading-snug">{game.title}</h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-100 flex items-center gap-3">
            <Server className="w-5 h-5 text-sky-600 shrink-0" />
            <div className="text-xs text-sky-900 leading-relaxed">
              <strong>Học liệu mã nhúng link độc lập đã được lưu trữ trên máy chủ.</strong> Khi bấm mở, học liệu sẽ được mở trong <strong>tab mới riêng biệt</strong> chỉ chạy liên kết của học liệu đó hoặc có thể trình chiếu trực tiếp toàn màn hình tại trang.
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Đóng
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Đã sao chép link!' : 'Sao chép link'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                onClose();
                onPlay(game);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              title="Trình chiếu tại chỗ trong khung toàn màn hình"
            >
              Trình chiếu tại trang
            </button>

            <a
              href={targetPlayUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-sky-500 via-blue-600 to-sky-600 hover:from-sky-600 hover:to-blue-700 shadow-md shadow-sky-200 active:scale-95 transition-all cursor-pointer"
              title="Mở riêng biệt link học liệu trong tab mới"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{isSimulation ? '▶ VÀO THÍ NGHIỆM' : '▶ VÀO TRÒ CHƠI'}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
