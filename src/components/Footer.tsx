/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const { user } = useAuth();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-sky-200/80 bg-white/95 backdrop-blur-md py-2.5 sm:py-3 shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          {/* Bên trái: "Giáo viên sáng tạo" chữ đậm màu sáng */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="font-black text-sm sm:text-base tracking-tight bg-gradient-to-r from-sky-500 via-blue-600 to-sky-600 bg-clip-text text-transparent">
              Giáo viên sáng tạo
            </span>
          </div>

          {/* Bên phải: "Tác giả: Đào Văn Lợi - Trường TH&THCS Tân Khánh Trung, tỉnh Đồng Tháp" */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
            <span>Tác giả: Đào Văn Lợi - Trường TH&THCS Tân Khánh Trung, tỉnh Đồng Tháp</span>

            {/* Subtle owner access icon */}
            {user?.role !== 'teacher' && (
              <button
                onClick={onOpenAdmin}
                className="opacity-30 hover:opacity-100 text-slate-500 hover:text-sky-600 transition-opacity p-1 rounded cursor-pointer ml-1"
                title={user?.role === 'admin' ? 'Quản trị hệ thống' : 'Cổng quản trị viên'}
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
