/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Subject, Grade } from '../types.ts';

export const SUBJECTS_LIST: { id: Subject; name: string; color: string; bg: string; icon: string }[] = [
  { id: 'Toán', name: 'Toán', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200', icon: 'Calculator' },
  { id: 'Tiếng Việt', name: 'Tiếng Việt', color: 'text-sky-700', bg: 'bg-sky-100 border-sky-200', icon: 'BookOpen' },
  { id: 'Tiếng Anh', name: 'Tiếng Anh', color: 'text-indigo-700', bg: 'bg-indigo-100 border-indigo-200', icon: 'Globe' },
  { id: 'Đạo đức', name: 'Đạo đức', color: 'text-rose-700', bg: 'bg-rose-100 border-rose-200', icon: 'Heart' },
  { id: 'Tự nhiên và Xã hội', name: 'Tự nhiên và Xã hội', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200', icon: 'Leaf' },
  { id: 'Khoa học', name: 'Khoa học', color: 'text-teal-700', bg: 'bg-teal-100 border-teal-200', icon: 'FlaskConical' },
  { id: 'Lịch sử và Địa lí', name: 'Lịch sử và Địa lí', color: 'text-orange-700', bg: 'bg-orange-100 border-orange-200', icon: 'Compass' },
  { id: 'Tin học', name: 'Tin học', color: 'text-cyan-700', bg: 'bg-cyan-100 border-cyan-200', icon: 'Monitor' },
  { id: 'Công nghệ', name: 'Công nghệ', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200', icon: 'Cpu' },
  { id: 'Âm nhạc', name: 'Âm nhạc', color: 'text-purple-700', bg: 'bg-purple-100 border-purple-200', icon: 'Music' },
  { id: 'Mĩ thuật', name: 'Mĩ thuật', color: 'text-fuchsia-700', bg: 'bg-fuchsia-100 border-fuchsia-200', icon: 'Palette' },
  { id: 'Giáo dục thể chất', name: 'Giáo dục thể chất', color: 'text-red-700', bg: 'bg-red-100 border-red-200', icon: 'Trophy' },
  { id: 'Hoạt động trải nghiệm', name: 'Hoạt động trải nghiệm', color: 'text-green-700', bg: 'bg-green-100 border-green-200', icon: 'Sparkles' },
  { id: 'Môn học khác', name: 'Môn học khác', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-200', icon: 'Bookmark' },
];

export const GRADES_LIST: Grade[] = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Mọi khối lớp'];

export interface IconPreset {
  id: string;
  emoji: string;
  label: string;
  category: 'game' | 'app' | 'simulation' | 'subject';
}

export const ICON_PRESETS: IconPreset[] = [
  // 1. Trò chơi tương tác (Games)
  { id: 'preset-gamepad', emoji: '🎮', label: 'Tay cầm trò chơi', category: 'game' },
  { id: 'preset-joystick', emoji: '🕹️', label: 'Cần gạt Arcade', category: 'game' },
  { id: 'preset-dice', emoji: '🎲', label: 'Xúc xắc may mắn', category: 'game' },
  { id: 'preset-puzzle', emoji: '🧩', label: 'Mảnh ghép trí tuệ', category: 'game' },
  { id: 'preset-target', emoji: '🎯', label: 'Bắn trúng mục tiêu', category: 'game' },
  { id: 'preset-trophy', emoji: '🏆', label: 'Cúp quán quân', category: 'game' },
  { id: 'preset-medal', emoji: '🥇', label: 'Huy chương vàng', category: 'game' },
  { id: 'preset-circus', emoji: '🎪', label: 'Rạp xiếc vui nhộn', category: 'game' },
  { id: 'preset-bowling', emoji: '🎳', label: 'Ném bóng Bowling', category: 'game' },
  { id: 'preset-cards', emoji: '🃏', label: 'Thẻ bài ma thuật', category: 'game' },
  { id: 'preset-invader', emoji: '👾', label: 'Quái vật trò chơi', category: 'game' },
  { id: 'preset-crown', emoji: '👑', label: 'Vương miện chiến thắng', category: 'game' },

  // 2. Kho ứng dụng & Học liệu số (Apps & Learning)
  { id: 'preset-star', emoji: '🌟', label: 'Ngôi sao tri thức', category: 'app' },
  { id: 'preset-book', emoji: '📚', label: 'Sách giáo trình', category: 'app' },
  { id: 'preset-computer', emoji: '💻', label: 'Máy vi tính', category: 'app' },
  { id: 'preset-tablet', emoji: '📱', label: 'Máy tính bảng', category: 'app' },
  { id: 'preset-grad', emoji: '🎓', label: 'Mũ cử nhân', category: 'app' },
  { id: 'preset-pencil', emoji: '✏️', label: 'Bút chì luyện viết', category: 'app' },
  { id: 'preset-bulb', emoji: '💡', label: 'Bóng đèn sáng tạo', category: 'app' },
  { id: 'preset-rocket', emoji: '🚀', label: 'Tên lửa vươn xa', category: 'app' },
  { id: 'preset-palette', emoji: '🎨', label: 'Bảng màu Mĩ thuật', category: 'app' },
  { id: 'preset-music', emoji: '🎵', label: 'Giai điệu Âm nhạc', category: 'app' },
  { id: 'preset-robot', emoji: '🤖', label: 'Robot thông minh', category: 'app' },
  { id: 'preset-magic', emoji: '🪄', label: 'Đũa phép tri thức', category: 'app' },

  // 3. Thí nghiệm mô phỏng & Khoa học (Simulations & Science)
  { id: 'preset-flask', emoji: '🧪', label: 'Ống nghiệm Hóa học', category: 'simulation' },
  { id: 'preset-microscope', emoji: '🔬', label: 'Kính hiển vi', category: 'simulation' },
  { id: 'preset-dna', emoji: '🧬', label: 'Chuỗi gen ADN', category: 'simulation' },
  { id: 'preset-atom', emoji: '⚛️', label: 'Nguyên tử Vật lý', category: 'simulation' },
  { id: 'preset-magnet', emoji: '🧲', label: 'Nam châm từ trường', category: 'simulation' },
  { id: 'preset-bolt', emoji: '⚡', label: 'Tia chớp năng lượng', category: 'simulation' },
  { id: 'preset-planet', emoji: '🪐', label: 'Hành tinh vũ trụ', category: 'simulation' },
  { id: 'preset-globe', emoji: '🌍', label: 'Quả địa cầu', category: 'simulation' },
  { id: 'preset-telescope', emoji: '🔭', label: 'Kính thiên văn', category: 'simulation' },
  { id: 'preset-plant', emoji: '🌱', label: 'Mầm cây Sinh học', category: 'simulation' },
  { id: 'preset-volcano', emoji: '🌋', label: 'Núi lửa mô phỏng', category: 'simulation' },
  { id: 'preset-thermometer', emoji: '🌡️', label: 'Nhiệt kế đo đạc', category: 'simulation' },

  // 4. Môn học & Tư duy (Subjects & Logic)
  { id: 'preset-abacus', emoji: '🧮', label: 'Bàn tính Toán học', category: 'subject' },
  { id: 'preset-math', emoji: '🔢', label: 'Con số kỳ diệu', category: 'subject' },
  { id: 'preset-ruler', emoji: '📐', label: 'Thước kẻ Ê-ke', category: 'subject' },
  { id: 'preset-compass', emoji: '🧭', label: 'La bàn định hướng', category: 'subject' },
  { id: 'preset-brain', emoji: '🧠', label: 'Bộ não tư duy', category: 'subject' },
  { id: 'preset-chart', emoji: '📊', label: 'Biểu đồ trực quan', category: 'subject' },
];
