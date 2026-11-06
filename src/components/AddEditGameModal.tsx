/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { ApplicationGame } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ICON_PRESETS } from '../constants/subjects.ts';
import {
  X,
  Sparkles,
  Upload,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  Save,
  Server,
  Gamepad2,
  FlaskConical,
  Share2,
  Copy,
  Check,
  PlayCircle,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { extractGameDirectUrl } from '../utils/gameUrlHelper.ts';
import { AppIcon } from './AppIcon.tsx';

interface AddEditGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (savedGame: ApplicationGame) => void;
  gameToEdit: ApplicationGame | null;
  authToken: string;
  defaultCategory?: 'game' | 'simulation';
}

export const AddEditGameModal: React.FC<AddEditGameModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  gameToEdit,
  authToken,
  defaultCategory = 'game',
}) => {
  const { user, showToast, setUpgradeModalOpen, updateUserCredits } = useAuth();
  const isAdmin = Boolean(user && user.role === 'admin');

  const [title, setTitle] = useState('');
  const [iconOrImage, setIconOrImage] = useState('preset-gamepad');
  const [iconFilter, setIconFilter] = useState<'all' | 'game' | 'app' | 'simulation' | 'subject'>('all');
  const [embedCode, setEmbedCode] = useState('');
  const [category, setCategory] = useState<'game' | 'simulation'>('game');
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (gameToEdit) {
      setTitle(gameToEdit.title);
      setIconOrImage(gameToEdit.iconOrImage || 'preset-gamepad');
      setEmbedCode(gameToEdit.embedCode);
      setCategory(gameToEdit.category || 'game');
      setIconFilter(gameToEdit.category === 'simulation' ? 'simulation' : 'game');
    } else {
      const initialCat = defaultCategory || 'game';
      setTitle('');
      setIconOrImage(initialCat === 'simulation' ? 'preset-flask' : 'preset-gamepad');
      setEmbedCode('');
      setCategory(initialCat);
      setIconFilter(initialCat === 'simulation' ? 'simulation' : 'game');
    }
    setErrorMessage(null);
    setShowPreview(false);
    setCopiedUrl(false);
  }, [gameToEdit, isOpen, defaultCategory]);

  if (!isOpen) return null;

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Kích thước ảnh không được vượt quá 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setIconOrImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Test opening the game link in a new tab
  const handleTestOpenNewTab = () => {
    if (!embedCode.trim()) {
      setErrorMessage('Vui lòng nhập Mã nhúng hoặc liên kết trước khi mở thử.');
      return;
    }
    const { url } = extractGameDirectUrl(embedCode);
    if (url) {
      try {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Đang mở liên kết học liệu trong thẻ mới...', 'info');
      } catch (err) {
        window.open(url, '_blank');
      }
    } else {
      setErrorMessage('Mã nhúng chưa chứa URL hợp lệ. Thầy/Cô vui lòng dán mã <iframe> có thuộc tính src="..." hoặc liên kết trang web.');
    }
  };

  // Admin action: Save persistently to server database
  const handleAdminServerSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập Tên trò chơi hoặc thí nghiệm mô phỏng.');
      return;
    }
    if (!embedCode.trim()) {
      setErrorMessage('Vui lòng dán Mã nhúng (Iframe hoặc toàn bộ HTML).');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = gameToEdit ? `/api/applications/${gameToEdit.id}` : '/api/applications';
      const method = gameToEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          iconOrImage,
          embedCode: embedCode.trim(),
          category,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Có lỗi xảy ra khi lưu trên hệ thống máy chủ.');
        setIsSubmitting(false);
        return;
      }

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }

      showToast(data.message || 'Đã lưu học liệu thành công!', 'success');
      onSaveSuccess(data.application);
      onClose();
    } catch (err) {
      setErrorMessage('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden my-8 animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black">
                {gameToEdit
                  ? 'Chỉnh sửa học liệu'
                  : category === 'simulation'
                  ? '+ Thêm Thí nghiệm mô phỏng'
                  : '+ Thêm Trò chơi học tập'}
              </h2>
              <p className="text-xs text-sky-100 flex items-center gap-1.5 mt-0.5">
                <Server className="w-3.5 h-3.5 text-emerald-300" />
                <span>
                  {isAdmin
                    ? 'Quyền Quản trị viên: Lưu tự động và bảo toàn vĩnh viễn trên hệ thống máy chủ'
                    : 'Tài khoản Giáo viên: Tạo và quản lý học liệu số phục vụ bài giảng'}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleAdminServerSave} className="p-6 sm:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Phân loại: Trò chơi vs Thí nghiệm */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Phân loại học liệu
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory('game')}
                className={`p-3 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  category === 'game'
                    ? 'bg-sky-50 border-sky-400 text-sky-800 ring-2 ring-sky-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Gamepad2 className="w-4 h-4 text-sky-600" />
                <span>Kho ứng dụng & Trò chơi</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory('simulation')}
                className={`p-3 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  category === 'simulation'
                    ? 'bg-blue-50 border-blue-400 text-blue-800 ring-2 ring-blue-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FlaskConical className="w-4 h-4 text-blue-600" />
                <span>Thí nghiệm mô phỏng</span>
              </button>
            </div>
          </div>

          {/* 1. Tên ứng dụng */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Tên {category === 'simulation' ? 'thí nghiệm mô phỏng' : 'trò chơi học tập'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                category === 'simulation'
                  ? 'Ví dụ: Mô phỏng Mạch điện, Vòng tuần hoàn của nước, Khúc xạ ánh sáng...'
                  : 'Ví dụ: Vòng quay may mắn, Đua xe Toán học, Đuổi hình bắt chữ...'
              }
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-hidden text-sm font-bold text-slate-800 transition-all"
            />
          </div>

          {/* 2. Biểu tượng đại diện phù hợp */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Biểu tượng học liệu
                </label>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-sky-50 border border-sky-200">
                  <AppIcon icon={iconOrImage} category={category} size="xs" />
                  <span className="text-[11px] font-bold text-sky-800">Đang chọn</span>
                </div>
              </div>

              {/* Category selector pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setIconFilter('all')}
                  className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    iconFilter === 'all'
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setIconFilter('game')}
                  className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    iconFilter === 'game'
                      ? 'bg-rose-500 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🎮 Trò chơi
                </button>
                <button
                  type="button"
                  onClick={() => setIconFilter('app')}
                  className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    iconFilter === 'app'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  📚 Ứng dụng
                </button>
                <button
                  type="button"
                  onClick={() => setIconFilter('simulation')}
                  className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    iconFilter === 'simulation'
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🧪 Thí nghiệm
                </button>
                <button
                  type="button"
                  onClick={() => setIconFilter('subject')}
                  className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    iconFilter === 'subject'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🔢 Môn học
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1.5 rounded-2xl bg-slate-50 border border-slate-200 mb-3">
              {ICON_PRESETS.filter((p) => iconFilter === 'all' || p.category === iconFilter).map((p) => {
                const isSelected = iconOrImage === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setIconOrImage(p.id)}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-sky-100 border-sky-400 ring-2 ring-sky-300 shadow-2xs scale-102'
                        : 'bg-white border-slate-200 hover:bg-sky-50/50'
                    }`}
                    title={p.label}
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="text-[10px] font-semibold text-slate-600 truncate max-w-full">
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-sky-300 bg-sky-50/50 hover:bg-sky-50 text-xs font-bold text-sky-700 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>Hoặc tải ảnh từ máy tính (PNG/JPG &lt; 2MB)</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleImageFileUpload}
                />
              </label>

              {iconOrImage.startsWith('data:') && (
                <span className="text-xs text-emerald-600 font-bold">✓ Đã tải ảnh lên</span>
              )}
            </div>
          </div>

          {/* 3. Mã nhúng / Link độc lập */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {isAdmin ? 'Mã nhúng / Link độc lập' : 'Liên kết hoặc mã nhúng trò chơi'}{' '}
                {category === 'simulation' ? 'thí nghiệm' : 'trò chơi'}{' '}
                <span className="text-rose-500">*</span>
              </label>

              <div className="flex items-center gap-3">
                {embedCode.trim() && (
                  <button
                    type="button"
                    onClick={handleTestOpenNewTab}
                    className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-800 cursor-pointer"
                    title="Mở liên kết này trong tab mới"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở thử tab mới</span>
                  </button>
                )}

                {embedCode.trim() && (
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPreview ? 'Đóng xem trước' : 'Xem thử'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-blue-900 mb-2 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                {isAdmin ? (
                  <span>
                    <strong>Mã nhúng là link độc lập:</strong> Dán link trực tiếp (<code>https://...</code>) hoặc thẻ <code>&lt;iframe src="..."&gt;&lt;/iframe&gt;</code>. Khi mở ra, hệ thống sẽ mở bằng tab mới và chỉ mở riêng biệt link độc lập của trò chơi/thí nghiệm đó.
                  </span>
                ) : (
                  <span>
                    <strong>Trò chơi của giáo viên không lưu trên máy chủ:</strong> Dán liên kết hoặc mã iframe (Wordwall, Scratch, PhET, Canva...). Hệ thống sẽ trích xuất và <strong>chỉ sao chép URL của chính trò chơi đang tạo</strong> để thầy/cô gửi cho học sinh.
                  </span>
                )}
              </div>
            </div>

            <textarea
              required
              rows={5}
              value={embedCode}
              onChange={(e) => setEmbedCode(e.target.value)}
              placeholder={
                category === 'simulation'
                  ? "https://phet.colorado.edu/sims/html/... hoặc <iframe src='https://phet.colorado.edu/...'></iframe>"
                  : "https://wordwall.net/embed/... hoặc <iframe src='https://wordwall.net/embed/...'></iframe>"
              }
              className="w-full px-4 py-3 font-mono text-xs rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-hidden bg-slate-900 text-slate-100 transition-all leading-relaxed"
            />

            {/* Detected direct URL helper badge */}
            {(() => {
              const detected = embedCode.trim() ? extractGameDirectUrl(embedCode) : null;
              if (detected && detected.url && detected.isDirectLink) {
                return (
                  <div className="mt-2.5 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-emerald-600 font-bold">✓ Link độc lập nhận diện:</span>
                      <span className="font-mono text-[11px] truncate text-slate-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                        {detected.url}
                      </span>
                    </div>
                    <a
                      href={detected.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Mở thử tab mới</span>
                    </a>
                  </div>
                );
              }
              return null;
            })()}

            {/* Sandbox preview */}
            {showPreview && embedCode.trim() && (
              <div className="mt-4 p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40">
                <div className="text-xs font-bold text-indigo-800 mb-2 flex items-center justify-between">
                  <span>Khung xem trước học liệu:</span>
                  <button
                    type="button"
                    onClick={handleTestOpenNewTab}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Mở độc lập tab mới</span>
                  </button>
                </div>
                <div className="w-full h-72 bg-white rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                  {(() => {
                    const detected = extractGameDirectUrl(embedCode);
                    if (detected.url && detected.isDirectLink) {
                      return (
                        <iframe
                          src={detected.url}
                          title="Xem trước"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                          className="w-full h-full border-none"
                        />
                      );
                    }
                    return (
                      <iframe
                        srcDoc={embedCode}
                        title="Xem trước"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                        className="w-full h-full border-none"
                      />
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>Lưu máy chủ tự động (Mở tab mới độc lập)</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 hover:from-blue-700 hover:to-sky-600 shadow-lg shadow-blue-200 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Đang lưu...'
                    : gameToEdit
                    ? 'Lưu thay đổi máy chủ'
                    : isAdmin
                    ? 'Lưu lên máy chủ'
                    : 'Tạo học liệu'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
