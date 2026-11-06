/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ICON_PRESETS } from '../constants/subjects.ts';

interface AppIconProps {
  icon?: string;
  category?: 'game' | 'simulation' | 'app' | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

/**
 * Resolves an icon string (preset ID, direct emoji, or image URL) to display data
 */
export function resolveAppIconData(icon?: string, category?: string) {
  const cat = category === 'simulation' ? 'simulation' : category === 'app' ? 'app' : 'game';

  if (!icon || !icon.trim()) {
    return {
      type: 'emoji' as const,
      value: cat === 'simulation' ? '🧪' : cat === 'app' ? '📱' : '🎮',
      isImage: false,
    };
  }

  const trimmed = icon.trim();

  // 1. Check if it matches an ICON_PRESETS ID
  const presetById = ICON_PRESETS.find((p) => p.id === trimmed);
  if (presetById) {
    return {
      type: 'emoji' as const,
      value: presetById.emoji,
      label: presetById.label,
      isImage: false,
    };
  }

  // 2. Check if it matches an ICON_PRESETS emoji
  const presetByEmoji = ICON_PRESETS.find((p) => p.emoji === trimmed);
  if (presetByEmoji) {
    return {
      type: 'emoji' as const,
      value: presetByEmoji.emoji,
      label: presetByEmoji.label,
      isImage: false,
    };
  }

  // 3. Check if it's an image URL or base64 string
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
    return {
      type: 'url' as const,
      value: trimmed,
      isImage: true,
    };
  }

  // 4. If it's a short string (1 to 4 unicode chars, e.g. emoji or unicode symbol)
  if (trimmed.length <= 8) {
    return {
      type: 'emoji' as const,
      value: trimmed,
      isImage: false,
    };
  }

  // Fallback by category
  return {
    type: 'emoji' as const,
    value: cat === 'simulation' ? '🧪' : cat === 'app' ? '📱' : '🎮',
    isImage: false,
  };
}

export const AppIcon: React.FC<AppIconProps> = ({
  icon,
  category = 'game',
  size = 'md',
  className = '',
  alt = 'Biểu tượng ứng dụng',
}) => {
  const [imageError, setImageError] = useState(false);
  const iconData = resolveAppIconData(icon, category);

  const sizeClasses = {
    xs: 'w-7 h-7 text-sm rounded-lg',
    sm: 'w-9 h-9 text-lg rounded-xl',
    md: 'w-12 h-12 text-2xl rounded-2xl',
    lg: 'w-16 h-16 text-3xl rounded-2xl',
    xl: 'w-20 h-20 text-4xl rounded-3xl',
  }[size];

  // Soft themed container styling based on category
  const themeBg =
    category === 'simulation'
      ? 'bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-100 border-teal-200/80 shadow-teal-100/50'
      : category === 'app'
      ? 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 border-sky-200/80 shadow-sky-100/50'
      : 'bg-gradient-to-br from-rose-50 via-amber-50 to-orange-100 border-rose-200/80 shadow-rose-100/50';

  if (iconData.isImage && !imageError) {
    return (
      <div
        className={`relative border shadow-xs flex items-center justify-center shrink-0 overflow-hidden transition-transform ${sizeClasses} ${themeBg} ${className}`}
      >
        <img
          src={iconData.value}
          alt={alt}
          className="w-full h-full object-cover rounded-inherit"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative border shadow-xs flex items-center justify-center shrink-0 overflow-hidden select-none transition-transform ${sizeClasses} ${themeBg} ${className}`}
    >
      <span className="drop-shadow-xs transform-gpu hover:scale-110 transition-transform duration-200 leading-none">
        {iconData.value}
      </span>
    </div>
  );
};
