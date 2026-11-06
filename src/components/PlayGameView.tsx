/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import type { ApplicationGame } from '../types.ts';
import {
  ArrowLeft,
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sparkles,
  Share2,
  Check,
  Gamepad2,
  FlaskConical,
} from 'lucide-react';
import { extractGameDirectUrl, openGameInIndependentNewTab } from '../utils/gameUrlHelper.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface PlayGameViewProps {
  game: ApplicationGame;
  onBack: () => void;
}

export const PlayGameView: React.FC<PlayGameViewProps> = ({ game, onBack }) => {
  const { user, showToast, setAuthModalOpen, setAuthModalTab } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(1);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { url: directUrl, isDirectLink } = extractGameDirectUrl(game.embedCode, game.id);

  const handleCopyShareLink = () => {
    if (!user) {
      showToast('Thầy/Cô vui lòng đăng nhập tài khoản để sao chép liên kết trò chơi.', 'info');
      setAuthModalTab('login');
      setAuthModalOpen(true);
      return;
    }
    const targetUrl = directUrl || `${window.location.origin}/?play=${game.id}`;
    navigator.clipboard.writeText(targetUrl).then(() => {
      setCopiedShareUrl(true);
      setTimeout(() => setCopiedShareUrl(false), 2500);
    });
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error('Fullscreen request error:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Exit fullscreen error:', err);
      });
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenNewTab = () => {
    openGameInIndependentNewTab(game);
  };

  useEffect(() => {
    // Automatically clear loading overlay after 2 seconds in case onLoad is delayed or suppressed
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, [iframeKey]);

  const isSimulation = game.category === 'simulation';
  const isGeminiShare = directUrl && (directUrl.includes('share.gemini.google') || directUrl.includes('gemini.google.com'));

  const targetUrl = directUrl || (typeof window !== 'undefined' ? `${window.location.origin}/api/play/${encodeURIComponent(game.id)}/raw` : `/api/play/${encodeURIComponent(game.id)}/raw`);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white overflow-hidden select-none"
    >
      {/* Top Header Bar */}
      <div className="h-16 px-4 sm:px-6 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between shrink-0 backdrop-blur-md">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors cursor-pointer active:scale-95"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                {game.title}
              </h2>
              <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-950 text-sky-300 border border-sky-800">
                {isSimulation ? (
                  <>
                    <FlaskConical className="w-3 h-3 text-sky-400" />
                    <span>Thí nghiệm mô phỏng</span>
                  </>
                ) : (
                  <>
                    <Gamepad2 className="w-3 h-3 text-sky-400" />
                    <span>Trò chơi học tập</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Open in independent new tab */}
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white transition-all cursor-pointer shadow-md shadow-sky-900/30 active:scale-95"
            title="Mở độc lập trong một thẻ (tab) mới"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Mở tab mới</span>
          </a>

          {/* Copy direct link */}
          <button
            onClick={handleCopyShareLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-400/30 transition-colors cursor-pointer"
            title="Sao chép link trò chơi"
          >
            {copiedShareUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{copiedShareUrl ? 'Đã sao chép' : 'Sao chép link'}</span>
          </button>

          {/* Reload button */}
          <button
            onClick={handleReload}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Tải lại trò chơi"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer border border-slate-700 active:scale-95"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
          </button>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="relative flex-1 w-full h-full bg-slate-900 overflow-hidden flex items-center justify-center">
        {/* Quick Open in New Tab Floating Banner */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-slate-900/90 border border-sky-500/40 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md">
          <span className="text-xs text-sky-200 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Mở trực tiếp link độc lập để tương tác mượt mà nhất</span>
          </span>
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Mở tab mới</span>
          </a>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xs gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
            <div className="text-sm font-bold text-sky-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Đang tải học liệu tương tác...</span>
            </div>
            <div className="text-xs text-slate-400">Tự động tương thích và hiển thị trực quan</div>
          </div>
        )}

        {/* Seamless Iframe Container */}
        {isDirectLink && directUrl ? (
          <iframe
            key={iframeKey}
            src={directUrl}
            title={game.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            onLoad={() => setIsLoading(false)}
            className="w-full h-full border-none bg-white"
          />
        ) : (
          <iframe
            key={iframeKey}
            srcDoc={game.embedCode}
            title={game.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            onLoad={() => setIsLoading(false)}
            className="w-full h-full border-none bg-white"
          />
        )}
      </div>
    </div>
  );
};
