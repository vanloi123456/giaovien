/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import type { User, ApplicationGame, ActivityLog, SystemSettings } from '../types.ts';
import {
  ShieldCheck,
  Users,
  Gamepad2,
  Activity,
  Settings,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  KeyRound,
  RefreshCw,
  Send,
  Lock,
  Unlock,
  Trash2,
  Edit2,
  Eye,
  Mail,
  AlertTriangle,
  Server,
  FileText,
  Copy,
  Check,
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToHome: () => void;
  onEditGame: (game: ApplicationGame) => void;
  onDeleteGame: (game: ApplicationGame) => void;
  onPlayGame: (game: ApplicationGame) => void;
}

interface UserWithCode extends User {
  activeCode: {
    id: string;
    status: string;
    codeMasked: string;
    createdAt: string;
    expiresAt: string;
    emailStatus: string;
    emailSentAt?: string;
    reissuedCount: number;
  } | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToHome,
  onEditGame,
  onDeleteGame,
  onPlayGame,
}) => {
  const { token, showToast } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'games' | 'logs' | 'settings'>('overview');

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    blockedUsers: 0,
    totalApplications: 0,
    recentApplicationsCount: 0,
  });

  // Users list
  const [users, setUsers] = useState<UserWithCode[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserWithCode | null>(null);

  // New code popup display after approval
  const [issuedCodeInfo, setIssuedCodeInfo] = useState<{
    userName: string;
    userEmail: string;
    plainCode: string;
    emailStatus: string;
    message: string;
  } | null>(null);

  // Delete user confirmation
  const [userToDelete, setUserToDelete] = useState<UserWithCode | null>(null);
  const [preserveGames, setPreserveGames] = useState(true);

  // Generic in-app confirmation dialog (replaces window.confirm)
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    actionText: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Games list
  const [games, setGames] = useState<ApplicationGame[]>([]);
  const [gameSearch, setGameSearch] = useState('');

  // Logs
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Settings
  const [settings, setSettings] = useState<SystemSettings>({
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: '',
    smtpPass: '',
    emailFrom: '',
    emailFromName: '',
    allowPublicBrowsing: true,
    maxCodeAgeDays: 30,
  });
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Overview stats
      const statsRes = await fetch('/api/admin/overview', { headers });
      if (statsRes.ok) setStats(await statsRes.json());

      // 2. Users
      const usersRes = await fetch('/api/admin/users', { headers });
      if (usersRes.ok) setUsers(await usersRes.json());

      // 3. Applications
      const gamesRes = await fetch('/api/applications');
      if (gamesRes.ok) setGames(await gamesRes.json());

      // 4. Logs
      const logsRes = await fetch('/api/admin/logs', { headers });
      if (logsRes.ok) setLogs(await logsRes.json());

      // 5. Settings
      const setRes = await fetch('/api/admin/settings', { headers });
      if (setRes.ok) setSettings(await setRes.json());
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Approve & Generate Code
  const handleApproveUser = async (user: UserWithCode) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${user.id}/approve-and-generate-code`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Đã phê duyệt tài khoản ${user.fullName} và tạo mã kích hoạt!`, 'success');
        setIssuedCodeInfo({
          userName: user.fullName,
          userEmail: user.email,
          plainCode: data.plainCode,
          emailStatus: data.emailResult.status,
          message: data.emailResult.message,
        });
        fetchData();
      } else {
        showToast(data.error || 'Lỗi khi phê duyệt.', 'error');
      }
    } catch (e) {
      showToast('Lỗi mạng.', 'error');
    }
  };

  // Reissue Code
  const handleReissueCode = (user: UserWithCode) => {
    if (!token) return;
    setConfirmDialog({
      title: 'Xác nhận cấp lại mã đăng nhập',
      message: `Xác nhận cấp lại mã đăng nhập mới cho Thầy/Cô ${user.fullName} (${user.email})? Sau khi cấp, mã cũ sẽ bị vô hiệu hóa ngay lập tức.`,
      actionText: 'Cấp mã mới',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`/api/admin/users/${user.id}/reissue-code`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok) {
            showToast(`Đã cấp lại mã thành công cho ${user.fullName}!`, 'success');
            setIssuedCodeInfo({
              userName: user.fullName,
              userEmail: user.email,
              plainCode: data.plainCode,
              emailStatus: data.emailResult.status,
              message: data.emailResult.message,
            });
            fetchData();
          } else {
            showToast(data.error || 'Lỗi khi cấp lại mã.', 'error');
          }
        } catch (e) {
          showToast('Lỗi mạng.', 'error');
        }
      },
    });
  };

  // Toggle user lock/unlock status
  const handleToggleLockUser = (user: UserWithCode) => {
    if (!token) return;
    const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
    const actionLabel = newStatus === 'blocked' ? 'khóa' : 'mở khóa';

    setConfirmDialog({
      title: `Xác nhận ${actionLabel} tài khoản`,
      message: `Thầy/Cô có chắc chắn muốn ${actionLabel} tài khoản ${user.fullName} (${user.email})?`,
      actionText: `Xác nhận ${actionLabel}`,
      isDestructive: newStatus === 'blocked',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`/api/admin/users/${user.id}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus }),
          });
          if (res.ok) {
            showToast(`Đã ${actionLabel} tài khoản thành công!`, 'success');
            fetchData();
          }
        } catch (e) {
          showToast('Lỗi kết nối.', 'error');
        }
      },
    });
  };

  // Delete User
  const handleConfirmDeleteUser = async () => {
    if (!token || !userToDelete) return;
    try {
      const res = await fetch(
        `/api/admin/users/${userToDelete.id}?preserveGames=${preserveGames}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        showToast(`Đã xóa tài khoản ${userToDelete.fullName}.`, 'info');
        setUserToDelete(null);
        fetchData();
      }
    } catch (e) {
      showToast('Lỗi khi xóa người dùng.', 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showToast('Đã lưu cấu hình máy chủ thành công!', 'success');
        fetchData();
      }
    } catch (e) {
      showToast('Lỗi khi lưu cấu hình.', 'error');
    }
  };

  // Test SMTP
  const handleTestSmtp = async () => {
    if (!token || !testEmailAddress) {
      showToast('Vui lòng nhập email nhận thử nghiệm.', 'error');
      return;
    }
    setIsTestingSmtp(true);
    try {
      const res = await fetch('/api/admin/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ testEmail: testEmailAddress }),
      });
      const data = await res.json();
      if (data.status === 'sent') {
        showToast(`Thành công! ${data.message}`, 'success');
      } else {
        showToast(data.message, data.success ? 'info' : 'error');
      }
    } catch (e) {
      showToast('Lỗi gửi email thử nghiệm.', 'error');
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const handleBackupServer = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/applications/save-server', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Đã lưu giữ và sao lưu toàn bộ kho ứng dụng & thí nghiệm trên hệ thống máy chủ an toàn!', 'success');
      } else {
        showToast('Có lỗi xảy ra khi sao lưu dữ liệu máy chủ.', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ.', 'error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (userStatusFilter !== 'all' && u.status !== userStatusFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.school.toLowerCase().includes(q) ||
        u.province.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter games (only title and creator since subject, grade, topic are removed)
  const filteredGames = games.filter((g) => {
    if (gameSearch.trim()) {
      const q = gameSearch.toLowerCase();
      return (
        g.title.toLowerCase().includes(q) ||
        (g.creatorName && g.creatorName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-200/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-purple-200 mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Khu vực Quản trị Hệ thống Cấp cao</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            MÁY CHỦ QUẢN LÝ GIÁO VIÊN SÁNG TẠO
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-2xl">
            Quản lý tài khoản giáo viên, phê duyệt và cấp mã kích hoạt đăng nhập, kiểm duyệt học liệu số và cấu hình hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
          <button
            onClick={onBackToHome}
            className="px-4 py-2.5 rounded-xl bg-white text-purple-900 hover:bg-purple-50 text-xs font-black shadow-sm transition-colors cursor-pointer"
          >
            Về Trang chủ
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Tổng quan hệ thống</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Quản lý tài khoản</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-current">
            {users.length}
          </span>
          {stats.pendingUsers > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('games')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'games'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Quản lý kho ứng dụng</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-current">
            {games.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'logs'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Nhật ký hoạt động</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Cấu hình máy chủ (SMTP)</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4.1 TỔNG QUAN HỆ THỐNG */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">Tổng tài khoản</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-800">{stats.totalUsers}</div>
              <div className="text-[11px] text-slate-500 mt-1">Toàn hệ thống</div>
            </div>

            <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-200 shadow-xs">
              <div className="text-xs font-bold uppercase text-emerald-700 mb-1">Đã kích hoạt</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-800">{stats.activeUsers}</div>
              <div className="text-[11px] text-emerald-600 mt-1">Được cấp quyền dùng</div>
            </div>

            <div className="bg-amber-50 p-5 rounded-3xl border border-amber-200 shadow-xs">
              <div className="text-xs font-bold uppercase text-amber-700 mb-1">Chờ kích hoạt</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-800">{stats.pendingUsers}</div>
              <div className="text-[11px] text-amber-700 font-bold mt-1">Cần phê duyệt</div>
            </div>

            <div className="bg-rose-50 p-5 rounded-3xl border border-rose-200 shadow-xs">
              <div className="text-xs font-bold uppercase text-rose-700 mb-1">Bị khóa</div>
              <div className="text-2xl sm:text-3xl font-black text-rose-800">{stats.blockedUsers}</div>
              <div className="text-[11px] text-rose-600 mt-1">Tạm dừng truy cập</div>
            </div>

            <div className="bg-sky-50 p-5 rounded-3xl border border-sky-200 shadow-xs">
              <div className="text-xs font-bold uppercase text-sky-700 mb-1">Tổng trò chơi</div>
              <div className="text-2xl sm:text-3xl font-black text-sky-800">{stats.totalApplications}</div>
              <div className="text-[11px] text-sky-600 mt-1">Trong kho học liệu</div>
            </div>

            <div className="bg-purple-50 p-5 rounded-3xl border border-purple-200 shadow-xs">
              <div className="text-xs font-bold uppercase text-purple-700 mb-1">Thêm gần đây</div>
              <div className="text-2xl sm:text-3xl font-black text-purple-800">{stats.recentApplicationsCount}</div>
              <div className="text-[11px] text-purple-600 mt-1">Trong 7 ngày qua</div>
            </div>
          </div>

          {/* Quick Action Alerts */}
          {stats.pendingUsers > 0 && (
            <div className="p-5 rounded-3xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <div className="font-extrabold text-sm text-amber-900">
                    Có {stats.pendingUsers} tài khoản giáo viên đang chờ phê duyệt và cấp mã kích hoạt!
                  </div>
                  <div className="text-xs text-amber-700">
                    Nhấn vào nút bên cạnh để xem danh sách và cấp mã ngay cho giáo viên.
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setUserStatusFilter('pending');
                  setActiveTab('users');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs shadow-sm cursor-pointer whitespace-nowrap"
              >
                Phê duyệt ngay
              </button>
            </div>
          )}

          {/* System Security Notice */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span>Chính sách An toàn & Phân quyền Hệ thống</span>
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
              <li className="flex items-start gap-2 p-3 bg-slate-50 rounded-2xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Mã kích hoạt được tạo ngẫu nhiên, băm an toàn một chiều và lưu trữ độc quyền trên máy chủ.</span>
              </li>
              <li className="flex items-start gap-2 p-3 bg-slate-50 rounded-2xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Trò chơi học tập chạy trong sandbox độc lập, ngăn chặn rò rỉ cookie hoặc quyền truy cập tài khoản.</span>
              </li>
              <li className="flex items-start gap-2 p-3 bg-slate-50 rounded-2xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Mọi hoạt động phê duyệt, cấp mã, khóa tài khoản đều được ghi nhận vào nhật ký kiểm toán.</span>
              </li>
              <li className="flex items-start gap-2 p-3 bg-slate-50 rounded-2xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Kho ứng dụng tuân thủ chuẩn không tự sinh dữ liệu giả lập, trao quyền sáng tạo trọn vẹn cho giáo viên.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4.2 QUẢN LÝ TÀI KHOẢN */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in">
          {/* Filters & Search */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Tìm kiếm tài khoản theo tên, email, trường công tác, địa phương..."
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-hidden text-xs sm:text-sm font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-purple-500 outline-hidden text-xs sm:text-sm font-bold bg-white"
              >
                <option value="all">Tất cả trạng thái ({users.length})</option>
                <option value="pending">Chờ kích hoạt ({users.filter((u) => u.status === 'pending').length})</option>
                <option value="active">Đã kích hoạt ({users.filter((u) => u.status === 'active').length})</option>
                <option value="blocked">Bị khóa ({users.filter((u) => u.status === 'blocked').length})</option>
              </select>
            </div>
          </div>

          {/* Table of Users */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-4 px-4">STT</th>
                    <th className="py-4 px-4">Họ và tên</th>
                    <th className="py-4 px-4">Email Gmail</th>
                    <th className="py-4 px-4">Trường công tác</th>
                    <th className="py-4 px-4">Ngày đăng ký</th>
                    <th className="py-4 px-4">Trạng thái</th>
                    <th className="py-4 px-4">Mã kích hoạt</th>
                    <th className="py-4 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u, idx) => {
                      const isPending = u.status === 'pending';
                      const isBlocked = u.status === 'blocked';
                      const isActive = u.status === 'active';

                      return (
                        <tr key={u.id} className="hover:bg-purple-50/40 transition-colors">
                          <td className="py-4 px-4 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-4 px-4 font-bold text-slate-900">{u.fullName}</td>
                          <td className="py-4 px-4 font-medium text-slate-600">{u.email}</td>
                          <td className="py-4 px-4">
                            <div>{u.school}</div>
                            <div className="text-[10px] text-slate-400">{u.province}</div>
                          </td>
                          <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="py-4 px-4">
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3" /> Chờ kích hoạt
                              </span>
                            )}
                            {isActive && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Đã kích hoạt
                              </span>
                            )}
                            {isBlocked && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <XCircle className="w-3 h-3" /> Đã khóa
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {u.activeCode ? (
                              <div>
                                <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                  {u.activeCode.codeMasked}
                                </span>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Email: {u.activeCode.emailStatus === 'sent' ? '✓ Đã gửi' : 'Chờ / Lưu máy chủ'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Chưa cấp</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* If pending: Approve button */}
                              {isPending && (
                                <button
                                  onClick={() => handleApproveUser(u)}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                                  title="Phê duyệt tài khoản và cấp mã kích hoạt"
                                >
                                  Phê duyệt & Cấp mã
                                </button>
                              )}

                              {/* If active: Reissue code button */}
                              {isActive && (
                                <button
                                  onClick={() => handleReissueCode(u)}
                                  className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-100 cursor-pointer"
                                  title="Cấp lại mã đăng nhập mới (hủy mã cũ)"
                                >
                                  <KeyRound className="w-4 h-4" />
                                </button>
                              )}

                              {/* Lock / Unlock */}
                              <button
                                onClick={() => handleToggleLockUser(u)}
                                className={`p-1.5 rounded-lg cursor-pointer ${
                                  isBlocked
                                    ? 'text-emerald-600 hover:bg-emerald-100'
                                    : 'text-amber-600 hover:bg-amber-100'
                                }`}
                                title={isBlocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                              >
                                {isBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                              </button>

                              {/* View detail */}
                              <button
                                onClick={() => setSelectedUserDetail(u)}
                                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                                title="Xem chi tiết tài khoản"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => setUserToDelete(u)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 cursor-pointer"
                                title="Xóa tài khoản"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Không tìm thấy tài khoản nào khớp với bộ lọc.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4.3 QUẢN LÝ KHO ỨNG DỤNG */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'games' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={gameSearch}
                onChange={(e) => setGameSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên trò chơi, thí nghiệm hoặc người tạo..."
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-hidden text-xs sm:text-sm font-medium"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBackupServer}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer shrink-0"
                title="Lưu giữ & Sao lưu toàn bộ dữ liệu máy chủ"
              >
                <Server className="w-4 h-4 text-emerald-600" />
                <span>Sao lưu dữ liệu máy chủ</span>
              </button>

              <div className="text-xs font-bold text-slate-500 shrink-0">
                Tổng số trong kho: <strong>{games.length}</strong> học liệu
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-4 px-4">Tên học liệu</th>
                    <th className="py-4 px-4">Phân loại</th>
                    <th className="py-4 px-4">Người sáng tạo</th>
                    <th className="py-4 px-4">Lưu trữ máy chủ</th>
                    <th className="py-4 px-4">Ngày đăng</th>
                    <th className="py-4 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGames.length > 0 ? (
                    filteredGames.map((game) => (
                      <tr key={game.id} className="hover:bg-purple-50/40 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-900 max-w-xs truncate">
                          {game.title}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            game.category === 'simulation'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-sky-100 text-sky-800 border-sky-200'
                          }`}>
                            {game.category === 'simulation' ? 'Thí nghiệm mô phỏng' : 'Trò chơi học tập'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-800">{game.creatorName}</div>
                          <div className="text-[10px] text-slate-400">{game.creatorEmail}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Server className="w-3 h-3 text-emerald-600" />
                            <span>Đã lưu máy chủ</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(game.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onPlayGame(game)}
                              className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-[11px] cursor-pointer"
                              title="Mở chơi thử"
                            >
                              Vào
                            </button>
                            <button
                              onClick={() => onEditGame(game)}
                              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100 cursor-pointer"
                              title="Sửa thông tin"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteGame(game)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 cursor-pointer"
                              title="Xóa học liệu"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        {games.length === 0
                          ? 'Kho ứng dụng hiện đang trống! Quản trị viên chưa thêm học liệu nào.'
                          : 'Không tìm thấy học liệu phù hợp với tìm kiếm.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4.4 NHẬT KÝ HOẠT ĐỘNG */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Nhật ký Kiểm toán Hoạt động Hệ thống (Activity Logs)</span>
            </h3>
            <span className="text-xs text-slate-500">{logs.length} bản ghi</span>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[10px] sticky top-0">
                <tr>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Tài khoản</th>
                  <th className="py-3 px-4">Vai trò</th>
                  <th className="py-3 px-4">Hành động</th>
                  <th className="py-3 px-4">Nội dung chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 font-mono text-[11px]">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-bold">{log.actorEmail}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.actorRole === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-700">{log.action}</td>
                    <td className="py-3 px-4 text-slate-700 font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4.5 CẤU HÌNH MÁY CHỦ & SMTP GỬI MAIL */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <form
            onSubmit={handleSaveSettings}
            className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5"
          >
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-600" />
                <span>Cấu hình Máy chủ Gửi Email (SMTP)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kết nối máy chủ SMTP trực tiếp gửi email tự động cho người đăng ký tài khoản và gửi mã kích hoạt.
              </p>
            </div>

            {/* Registration email content notification banner */}
            <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="w-full">
                <strong>Nội dung email tự động gửi trực tiếp cho giáo viên khi đăng ký:</strong>
                <p className="mt-1 font-medium text-slate-800 italic bg-white/80 p-2.5 rounded-xl border border-blue-100">
                  "Để truy cập kho ứng dụng, thầy, cô vui lòng liên hệ với tác giả: Đào Văn Lợi, qua số điện thoại: 0775987267 để được tư vấn. Trân trọng cảm ơn quý thầy cô!"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Thông số máy chủ SMTP:</span>
              <button
                type="button"
                onClick={() => {
                  setSettings({
                    ...settings,
                    smtpHost: 'smtp.gmail.com',
                    smtpPort: 587,
                    smtpSecure: false,
                    smtpUser: 'daovanloi.tankhanhtrung3@gmail.com',
                    emailFrom: 'daovanloi.tankhanhtrung3@gmail.com',
                    emailFromName: 'Hệ thống Giáo Viên Sáng Tạo',
                  });
                  showToast('Đã điền mẫu Gmail của Thầy Đào Văn Lợi! Thầy nhập mật khẩu ứng dụng rồi bấm Lưu.', 'info');
                }}
                className="text-xs text-purple-700 hover:text-purple-900 font-bold underline cursor-pointer"
              >
                + Điền nhanh Gmail của Thầy Đào Văn Lợi
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  SMTP Host (Máy chủ)
                </label>
                <input
                  type="text"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold focus:border-purple-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  SMTP Port (Cổng)
                </label>
                <input
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
                  placeholder="587 hoặc 465"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold focus:border-purple-500 outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  SMTP User (Tài khoản / Email)
                </label>
                <input
                  type="text"
                  value={settings.smtpUser}
                  onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                  placeholder="giaoviensangtao@gmail.com"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold focus:border-purple-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  SMTP Password (Mật khẩu ứng dụng)
                </label>
                <input
                  type="password"
                  value={settings.smtpPass}
                  onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold focus:border-purple-500 outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Email người gửi (From Email)
                </label>
                <input
                  type="email"
                  value={settings.emailFrom}
                  onChange={(e) => setSettings({ ...settings, emailFrom: e.target.value })}
                  placeholder="no-reply@giaoviensangtao.edu.vn"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold focus:border-purple-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Tên hiển thị người gửi
                </label>
                <input
                  type="text"
                  value={settings.emailFromName}
                  onChange={(e) => setSettings({ ...settings, emailFromName: e.target.value })}
                  placeholder="Hệ thống Giáo Viên Sáng Tạo"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold focus:border-purple-500 outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={settings.smtpSecure}
                  onChange={(e) => setSettings({ ...settings, smtpSecure: e.target.checked })}
                  className="w-4 h-4 rounded-md text-purple-600 focus:ring-purple-500"
                />
                <span>Sử dụng kết nối SSL/TLS an toàn (Bật nếu dùng Port 465)</span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-200 cursor-pointer"
              >
                Lưu cấu hình máy chủ
              </button>
            </div>
          </form>

          {/* Test Dispatch Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-600" />
              <span>Kiểm tra gửi thử nghiệm</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nhập địa chỉ email bất kỳ để gửi thử mẫu thư chứa mã kích hoạt xem cấu hình SMTP đã hoạt động hay chưa.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Email nhận thử nghiệm
              </label>
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="test@gmail.com"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold focus:border-purple-500 outline-hidden"
              />
            </div>

            <button
              type="button"
              onClick={handleTestSmtp}
              disabled={isTestingSmtp}
              className="w-full py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isTestingSmtp ? 'Đang gửi...' : 'Gửi thư thử nghiệm'}
            </button>

            <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-500 leading-relaxed border border-slate-100">
              <strong>Lưu ý:</strong> Nếu máy chủ chưa cấu hình SMTP, hệ thống sẽ tự động lưu mã vào cơ sở dữ liệu và hiển thị ngay trên màn hình phê duyệt để Quản trị viên gửi cho giáo viên.
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: HIỂN THỊ MÃ VỪA CẤP (CHO ADMIN SAO CHÉP) */}
      {/* ------------------------------------------------------------- */}
      {issuedCodeInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-200 overflow-hidden animate-scale-up p-6 space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mb-3">
                🎉
              </div>
              <h3 className="text-xl font-black text-slate-800">Cấp mã kích hoạt thành công!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tài khoản của Thầy/Cô <strong>{issuedCodeInfo.userName}</strong> ({issuedCodeInfo.userEmail}) đã sẵn sàng.
              </p>
            </div>

            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-center">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                MÃ ĐĂNG NHẬP ĐỘC QUYỀN
              </div>
              <div className="font-mono text-2xl font-black tracking-widest text-sky-700 select-all my-1">
                {issuedCodeInfo.plainCode}
              </div>
              <button
                onClick={() => copyToClipboard(issuedCodeInfo.plainCode)}
                className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-800 mt-1 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Đã sao chép mã!' : 'Sao chép mã'}</span>
              </button>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div><strong>Trạng thái gửi email:</strong> {issuedCodeInfo.message}</div>
              <div className="text-slate-400 mt-1 text-[11px]">
                * Quản trị viên có thể gửi trực tiếp mã trên cho giáo viên qua Zalo, Email hoặc tin nhắn.
              </div>
            </div>

            <button
              onClick={() => setIssuedCodeInfo(null)}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer"
            >
              Đã hiểu & Đóng
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: XÁC NHẬN XÓA TÀI KHOẢN (VỚI TÙY CHỌN BẢO VỆ HỌC LIỆU) */}
      {/* ------------------------------------------------------------- */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden animate-scale-up p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-lg font-black text-slate-800">Xác nhận xóa tài khoản</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn đang chuẩn bị xóa tài khoản của Thầy/Cô <strong>{userToDelete.fullName}</strong> ({userToDelete.email}). Thao tác này sẽ vô hiệu hóa mọi mã kích hoạt của người dùng này.
            </p>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={preserveGames}
                  onChange={(e) => setPreserveGames(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600"
                />
                <span>Giữ lại các trò chơi học tập do giáo viên này đã thêm vào kho</span>
              </label>
              <p className="text-[11px] text-slate-500 mt-1 pl-6">
                (Khuyến khích chọn để tránh làm mất học liệu số phục vụ học sinh)
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDeleteUser}
                className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
              >
                Xác nhận xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: XEM CHI TIẾT TÀI KHOẢN */}
      {/* ------------------------------------------------------------- */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-800 border-b pb-2">
              Hồ sơ Giáo viên: {selectedUserDetail.fullName}
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Mã định danh ID:</span>
                <span className="font-mono text-slate-800">{selectedUserDetail.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Email:</span>
                <span className="font-bold text-slate-800">{selectedUserDetail.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Trường công tác:</span>
                <span className="font-bold text-slate-800">{selectedUserDetail.school}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Địa phương:</span>
                <span className="font-bold text-slate-800">{selectedUserDetail.province}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Trạng thái:</span>
                <span className="font-bold uppercase text-purple-700">{selectedUserDetail.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Mã kích hoạt hiện tại:</span>
                <span className="font-mono font-bold text-sky-700">
                  {selectedUserDetail.activeCode?.codeMasked || 'Chưa cấp'}
                </span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Confirmation Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-purple-100 text-purple-600'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-800">{confirmDialog.title}</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{confirmDialog.message}</p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-sm cursor-pointer ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                    : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                }`}
              >
                {confirmDialog.actionText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
