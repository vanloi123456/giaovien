/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  User,
  ApplicationGame,
  ActivationCodeRecord,
  ActivityLog,
  AdminUser,
  SystemSettings,
} from '../types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(filename: string): string {
  return path.join(DATA_DIR, filename);
}

function readJsonFile<T>(filename: string, defaultValue: T): T {
  const file = getFilePath(filename);
  if (!fs.existsSync(file)) {
    writeJsonFile(filename, defaultValue);
    return defaultValue;
  }
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultValue;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  const file = getFilePath(filename);
  const tempFile = `${file}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, file);
}

export function hashValue(val: string, salt: string = 'gvst_default_salt_2026'): string {
  return crypto.pbkdf2Sync(val, salt, 10000, 32, 'sha256').toString('hex');
}

export function generateActivationCode(): string {
  // Generate user friendly code like GVST-XXXX-YYYY (numbers and uppercase letters)
  const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const part2 = Math.floor(1000 + Math.random() * 9000);
  return `GVST-${part1}-${part2}`;
}

export function maskActivationCode(code: string): string {
  if (!code || code.length < 8) return '****';
  const prefix = code.slice(0, 5);
  const suffix = code.slice(-4);
  return `${prefix}****-${suffix}`;
}

// 1. Initial Admins
function initAdmins(): AdminUser[] {
  const defaultSalt = 'gvst_admin_salt_master';
  const adminPassHash = hashValue('Admin@123456', defaultSalt);

  const initialAdmins: AdminUser[] = [
    {
      id: 'admin-master',
      email: 'admin@giaoviensangtao.edu.vn',
      fullName: 'Chủ sở hữu hệ thống (Master Admin)',
      passwordHash: `${defaultSalt}:${adminPassHash}`,
      role: 'superadmin',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'admin-owner',
      email: 'daovanloi.tankhanhtrung3@gmail.com',
      fullName: 'Thầy Đào Văn Lợi (Quản trị viên)',
      passwordHash: `${defaultSalt}:${adminPassHash}`,
      role: 'superadmin',
      createdAt: new Date().toISOString(),
    },
  ];

  return initialAdmins;
}

// 2. Initial Settings
const defaultSettings: SystemSettings = {
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  emailFrom: process.env.EMAIL_FROM || 'no-reply@giaoviensangtao.edu.vn',
  emailFromName: 'Hệ thống Giáo Viên Sáng Tạo',
  allowPublicBrowsing: true,
  maxCodeAgeDays: 30,
};

// Database state accessor functions
export const db = {
  // Users
  getUsers(): User[] {
    return readJsonFile<User[]>('users.json', []);
  },
  saveUsers(users: User[]) {
    writeJsonFile('users.json', users);
    // Tự động sao lưu và lưu giữ tài khoản giáo viên trên máy chủ
    try {
      writeJsonFile('users_backup.json', {
        lastSavedAt: new Date().toISOString(),
        totalUsers: users.length,
        users,
      });
    } catch (e) {
      console.error('Lỗi sao lưu tài khoản giáo viên trên máy chủ:', e);
    }
  },
  findUserByEmail(email: string): User | undefined {
    return this.getUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  },
  findUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  },

  // Applications (Educational games & Simulations) with Server Persistence
  getApplications(): ApplicationGame[] {
    const primary = readJsonFile<ApplicationGame[]>('applications.json', []);
    if (Array.isArray(primary) && primary.length > 0) {
      return primary;
    }
    // Auto-recover from backup if primary is empty
    try {
      const backup = readJsonFile<{ items?: ApplicationGame[] }>('applications_backup.json', {});
      if (backup && Array.isArray(backup.items) && backup.items.length > 0) {
        writeJsonFile('applications.json', backup.items);
        return backup.items;
      }
    } catch (e) {
      // ignore
    }

    return [];
  },
  saveApplications(apps: ApplicationGame[]) {
    writeJsonFile('applications.json', apps);
    // Automatic backup on server for permanent retention
    try {
      writeJsonFile('applications_backup.json', {
        lastSavedAt: new Date().toISOString(),
        totalApplications: apps.length,
        items: apps,
      });
    } catch (err) {
      console.error('Lỗi khi sao lưu học liệu trên máy chủ:', err);
    }
  },
  getServerApplicationsStatus() {
    const apps = this.getApplications();
    const backupFile = getFilePath('applications_backup.json');
    const primaryFile = getFilePath('applications.json');
    let primarySize = 0;
    let backupExists = false;
    try {
      if (fs.existsSync(primaryFile)) {
        primarySize = fs.statSync(primaryFile).size;
      }
      backupExists = fs.existsSync(backupFile);
    } catch (e) {
      // ignore
    }
    return {
      totalApplications: apps.length,
      primaryFileSize: primarySize,
      backupExists,
      lastSaved: new Date().toISOString(),
      storageType: 'Server Persistent JSON & Atomic Disk Storage',
    };
  },
  findApplicationById(id: string): ApplicationGame | undefined {
    if (!id) return undefined;
    const cleanId = id.trim().toLowerCase();
    const apps = this.getApplications();
    const found = apps.find((a) => a.id.trim().toLowerCase() === cleanId);
    if (found) return found;

    // Check backup as secondary fallback
    try {
      const backup = readJsonFile<{ items?: ApplicationGame[] }>('applications_backup.json', {});
      if (backup && Array.isArray(backup.items)) {
        const inBackup = backup.items.find((a) => a.id.trim().toLowerCase() === cleanId);
        if (inBackup) return inBackup;
      }
    } catch (e) {
      // ignore
    }
    return undefined;
  },

  // Activation Codes
  getActivationCodes(): ActivationCodeRecord[] {
    return readJsonFile<ActivationCodeRecord[]>('activation_codes.json', []);
  },
  saveActivationCodes(codes: ActivationCodeRecord[]) {
    writeJsonFile('activation_codes.json', codes);
  },
  findCodesForUser(userId: string): ActivationCodeRecord[] {
    return this.getActivationCodes().filter((c) => c.userId === userId);
  },
  findActiveCodeForUser(userId: string): ActivationCodeRecord | undefined {
    const codes = this.getActivationCodes().filter(
      (c) => c.userId === userId && c.status === 'unused'
    );
    return codes[codes.length - 1]; // most recent
  },

  // Admins
  getAdmins(): AdminUser[] {
    return readJsonFile<AdminUser[]>('admins.json', initAdmins());
  },
  saveAdmins(admins: AdminUser[]) {
    writeJsonFile('admins.json', admins);
  },
  findAdminByEmail(email: string): AdminUser | undefined {
    return this.getAdmins().find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  },

  // Activity Logs
  getActivityLogs(): ActivityLog[] {
    return readJsonFile<ActivityLog[]>('activity_logs.json', []);
  },
  addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const logs = this.getActivityLogs();
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog); // newest first
    // keep last 500 logs
    if (logs.length > 500) logs.pop();
    writeJsonFile('activity_logs.json', logs);
    return newLog;
  },

  // Settings
  getSettings(): SystemSettings {
    return readJsonFile<SystemSettings>('settings.json', defaultSettings);
  },
  saveSettings(settings: SystemSettings) {
    writeJsonFile('settings.json', settings);
  },
};
