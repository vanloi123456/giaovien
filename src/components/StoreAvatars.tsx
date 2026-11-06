/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface AvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * 1. Hình đại diện Kho ứng dụng (App Store Avatar)
 * Biểu tượng bảng ứng dụng học tập, máy tính bảng giáo dục, biểu tượng ứng dụng số
 */
export const AppStoreAvatar: React.FC<AvatarProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  }[size];

  return (
    <div
      className={`relative rounded-3xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 p-0.5 shadow-md shadow-sky-200/60 flex items-center justify-center shrink-0 overflow-hidden ${sizeClasses} ${className}`}
    >
      {/* Background glow & subtle pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent pointer-events-none" />
      <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-700 flex items-center justify-center text-white relative">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4 drop-shadow-md"
        >
          {/* Tablet frame */}
          <rect x="8" y="6" width="32" height="36" rx="6" fill="#0f172a" fillOpacity="0.25" />
          <rect x="10" y="8" width="28" height="32" rx="4" fill="white" fillOpacity="0.95" />
          {/* Tablet screen content: 4 colorful app icons */}
          <rect x="13" y="12" width="9" height="9" rx="2.5" fill="#0284c7" />
          <path d="M17.5 14.5v4M15.5 16.5h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="26" y="12" width="9" height="9" rx="2.5" fill="#f59e0b" />
          <circle cx="30.5" cy="16.5" r="2.5" fill="white" />
          <rect x="13" y="24" width="9" height="9" rx="2.5" fill="#10b981" />
          <path d="M15.5 28.5l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="26" y="24" width="9" height="9" rx="2.5" fill="#8b5cf6" />
          <polygon points="30.5,26 33.5,31 27.5,31" fill="white" />
          {/* Tablet home button */}
          <circle cx="24" cy="37" r="1.5" fill="#cbd5e1" />
        </svg>
        {/* Floating badge */}
        <span className="absolute -top-1 -right-1 text-xs">✨</span>
      </div>
    </div>
  );
};

/**
 * 2. Hình đại diện Trò chơi tương tác (Interactive Games Avatar)
 * Biểu tượng tay cầm trò chơi arcade, xúc xắc, ngôi sao và màu sắc rực rỡ
 */
export const InteractiveGamesAvatar: React.FC<AvatarProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  }[size];

  return (
    <div
      className={`relative rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-0.5 shadow-md shadow-rose-200/60 flex items-center justify-center shrink-0 overflow-hidden ${sizeClasses} ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent pointer-events-none" />
      <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-600 flex items-center justify-center text-white relative">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4 drop-shadow-md"
        >
          {/* Game Controller Body */}
          <path
            d="M12 18C7.58 18 4 21.58 4 26C4 29.5 6.2 34 10 34C12 34 14 31 16 31H32C34 31 36 34 38 34C41.8 34 44 29.5 44 26C44 21.58 40.42 18 36 18H12Z"
            fill="white"
            fillOpacity="0.95"
          />
          {/* D-Pad (Left) */}
          <rect x="12" y="23" width="2" height="6" rx="1" fill="#f43f5e" />
          <rect x="10" y="25" width="6" height="2" rx="1" fill="#f43f5e" />
          {/* Action Buttons (Right) */}
          <circle cx="34" cy="23.5" r="1.5" fill="#f59e0b" />
          <circle cx="37" cy="26" r="1.5" fill="#3b82f6" />
          <circle cx="34" cy="28.5" r="1.5" fill="#10b981" />
          <circle cx="31" cy="26" r="1.5" fill="#8b5cf6" />
          {/* Center Screen / Logo */}
          <circle cx="24" cy="24.5" r="2.5" fill="#0f172a" fillOpacity="0.15" />
          <polygon points="23.5,23.5 25.5,24.5 23.5,25.5" fill="#e11d48" />
        </svg>
        {/* Sparkle */}
        <span className="absolute -top-1 -right-1 text-xs">🎮</span>
      </div>
    </div>
  );
};

/**
 * 3. Hình đại diện Thí nghiệm mô phỏng (Simulations Avatar)
 * Biểu tượng ống nghiệm phát sáng, nguyên tử khoa học, phản ứng hóa học & vật lý
 */
export const SimulationsAvatar: React.FC<AvatarProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  }[size];

  return (
    <div
      className={`relative rounded-3xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-600 p-0.5 shadow-md shadow-teal-200/60 flex items-center justify-center shrink-0 overflow-hidden ${sizeClasses} ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent pointer-events-none" />
      <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-emerald-400 via-teal-600 to-cyan-700 flex items-center justify-center text-white relative">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4 drop-shadow-md"
        >
          {/* Flask glass neck & rim */}
          <path d="M21 8H27" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M22 8V18L13 34C11.5 36.5 13.5 40 16.5 40H31.5C34.5 40 36.5 36.5 35 34L26 18V8" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
          {/* Liquid content */}
          <path
            d="M15.5 35L22 24.5C23.5 24 24.5 24.5 26 24.5L32.5 35C33.8 37 32.2 39 30.5 39H17.5C15.8 39 14.2 37 15.5 35Z"
            fill="#a7f3d0"
            fillOpacity="0.9"
          />
          {/* Bubbles */}
          <circle cx="21" cy="32" r="1.8" fill="white" />
          <circle cx="27" cy="30" r="1.3" fill="white" />
          <circle cx="23" cy="27" r="1" fill="white" />
          <circle cx="24" cy="14" r="1.2" fill="#fed7aa" />
          {/* Atom orbit ring */}
          <ellipse cx="24" cy="24" rx="14" ry="5" transform="rotate(-30 24 24)" stroke="white" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.7" />
        </svg>
        {/* Flask Sparkle */}
        <span className="absolute -top-1 -right-1 text-xs">🧪</span>
      </div>
    </div>
  );
};
