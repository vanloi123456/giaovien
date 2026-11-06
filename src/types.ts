/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'guest' | 'teacher' | 'admin';

export type NavTab = 'home' | 'store' | 'games' | 'simulations' | 'admin';

export type UserStatus = 'pending' | 'active' | 'blocked';

export interface User {
  id: string;
  fullName: string;
  email: string;
  school: string;
  province: string;
  status: UserStatus;
  credits: number;
  createdAt: string;
  updatedAt: string;
  hasActivationCode?: boolean;
}

export type Subject =
  | 'Toán'
  | 'Tiếng Việt'
  | 'Tiếng Anh'
  | 'Đạo đức'
  | 'Tự nhiên và Xã hội'
  | 'Khoa học'
  | 'Lịch sử và Địa lí'
  | 'Tin học'
  | 'Công nghệ'
  | 'Âm nhạc'
  | 'Mĩ thuật'
  | 'Giáo dục thể chất'
  | 'Hoạt động trải nghiệm'
  | 'Môn học khác';

export type Grade = 'Lớp 1' | 'Lớp 2' | 'Lớp 3' | 'Lớp 4' | 'Lớp 5' | 'Mọi khối lớp';

export interface ApplicationGame {
  id: string;
  title: string;
  subject: Subject;
  grade: Grade;
  topic: string;
  description: string;
  iconOrImage: string;
  embedCode: string;
  embedType: 'iframe' | 'html';
  createdBy: string;
  creatorName: string;
  creatorEmail: string;
  createdAt: string;
  updatedAt: string;
  playCount?: number;
  category?: 'game' | 'simulation';
}

export interface ActivationCodeRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  codeHash: string;
  codeMasked: string; // e.g. GVST-****-9182 for display
  status: 'unused' | 'used' | 'revoked' | 'expired';
  createdAt: string;
  expiresAt: string;
  emailStatus: 'pending' | 'sent' | 'not_configured' | 'failed';
  emailSentAt?: string;
  emailError?: string;
  reissuedCount: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  details: string;
  ip?: string;
}

export interface SystemSettings {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  emailFrom: string;
  emailFromName: string;
  allowPublicBrowsing: boolean;
  maxCodeAgeDays: number;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  role: 'superadmin' | 'admin';
  createdAt: string;
}
