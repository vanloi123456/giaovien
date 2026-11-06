/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { db, hashValue, generateActivationCode, maskActivationCode } from './src/server/db.ts';
import { sendActivationCodeEmail, sendRegistrationSuccessEmail } from './src/server/mailer.ts';
import type { User, ApplicationGame, ActivationCodeRecord, Subject, Grade } from './src/types.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// In-memory active sessions: token -> { userId, email, role, expiresAt }
interface SessionData {
  userId: string;
  email: string;
  role: 'teacher' | 'admin';
  fullName: string;
  expiresAt: number;
}
const activeSessions = new Map<string, SessionData>();

function createSession(userId: string, email: string, role: 'teacher' | 'admin', fullName: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  // 7 days expiration
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  activeSessions.set(token, { userId, email, role, fullName, expiresAt });
  return token;
}

function verifyAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Yêu cầu đăng nhập để thực hiện thao tác này.' });
  }
  const token = authHeader.substring(7);
  const session = activeSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' });
  }
  (req as any).user = session;
  next();
}

function verifyAdmin(req: Request, res: Response, next: NextFunction) {
  verifyAuth(req, res, () => {
    const session = (req as any).user as SessionData;
    if (session.role !== 'admin') {
      return res.status(403).json({ error: 'Bạn không có quyền quản trị viên.' });
    }
    next();
  });
}

// -------------------------------------------------------------
// PUBLIC & STATS API
// -------------------------------------------------------------
app.get('/api/public/stats', (req: Request, res: Response) => {
  const apps = db.getApplications();
  const users = db.getUsers();
  const activeTeachers = users.filter((u) => u.status === 'active');
  const subjectsWithApps = new Set(apps.map((a) => a.subject));

  res.json({
    totalApplications: apps.length,
    totalSubjects: subjectsWithApps.size,
    totalActiveTeachers: activeTeachers.length,
    recentApplications: apps.slice(-6).reverse(),
  });
});

function isAdminRequest(req: Request): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.substring(7);
  const session = activeSessions.get(token);
  return Boolean(session && session.role === 'admin');
}

// GET applications with search and filters (emails only visible to admin)
app.get('/api/applications', (req: Request, res: Response) => {
  const { search, category, creatorId } = req.query;
  let apps = db.getApplications();

  if (category && typeof category === 'string' && category !== 'all') {
    apps = apps.filter((a) => (a.category || 'game') === category);
  }
  if (creatorId && typeof creatorId === 'string') {
    apps = apps.filter((a) => a.createdBy === creatorId);
  }
  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    apps = apps.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.topic && a.topic.toLowerCase().includes(q)) ||
        (a.creatorName && a.creatorName.toLowerCase().includes(q))
    );
  }

  const isAdmin = isAdminRequest(req);
  // Email giáo viên chỉ quản trị viên mới được xem
  const sanitizedApps = apps.slice().reverse().map((a) => ({
    ...a,
    creatorEmail: isAdmin ? a.creatorEmail : undefined,
  }));

  res.json(sanitizedApps);
});

app.get('/api/applications/:id', (req: Request, res: Response) => {
  const appItem = db.findApplicationById(req.params.id);
  if (!appItem) {
    return res.status(404).json({ error: 'Không tìm thấy trò chơi học tập.' });
  }
  const isAdmin = isAdminRequest(req);
  res.json({
    ...appItem,
    creatorEmail: isAdmin ? appItem.creatorEmail : undefined,
  });
});

// Increment play count
app.post('/api/applications/:id/play-increment', (req: Request, res: Response) => {
  const apps = db.getApplications();
  const target = apps.find((a) => a.id === req.params.id);
  if (target) {
    target.playCount = (target.playCount || 0) + 1;
    db.saveApplications(apps);
    return res.json({ success: true, playCount: target.playCount });
  }
  res.status(404).json({ error: 'Not found' });
});

// -------------------------------------------------------------
// ISOLATED RAW GAME EMBED RENDERER
// Serves completely isolated HTML to prevent leaking host tokens
// -------------------------------------------------------------
app.get('/api/play/:id/raw', (req: Request, res: Response) => {
  let game = db.findApplicationById(req.params.id);

  // If not found by exact ID, search by partial ID or slug
  if (!game) {
    const apps = db.getApplications();
    const cleanParam = req.params.id.trim().toLowerCase();
    game = apps.find(
      (a) =>
        a.id.toLowerCase().includes(cleanParam) ||
        cleanParam.includes(a.id.toLowerCase()) ||
        a.title.toLowerCase().replace(/\s+/g, '-').includes(cleanParam)
    );
  }

  if (!game) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Kho ứng dụng học tập - Giáo viên sáng tạo</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background-color: #f0f9ff;
              color: #1e293b;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 24px;
            }
            .card {
              max-width: 480px;
              width: 100%;
              background: #ffffff;
              border-radius: 24px;
              padding: 36px 28px;
              text-align: center;
              box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.1);
              border: 1px solid #e0f2fe;
            }
            .icon { font-size: 48px; margin-bottom: 16px; }
            h2 { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 10px; }
            p { font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 24px; }
            .btn {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 12px 24px;
              background: linear-gradient(135deg, #0284c7, #2563eb);
              color: #ffffff;
              font-size: 13px;
              font-weight: 800;
              text-decoration: none;
              border-radius: 16px;
              box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">🎮</div>
            <h2>Học liệu đang được cập nhật</h2>
            <p>Trò chơi hoặc thí nghiệm mô phỏng này đang được quản trị viên cập nhật lại đường dẫn mới. Thầy/Cô vui lòng quay lại trang chủ để khám phá các học liệu khác.</p>
            <a href="/" class="btn">◀ Quay về Kho ứng dụng</a>
          </div>
        </body>
      </html>
    `);
  }

  // Increase play count asynchronously
  try {
    const apps = db.getApplications();
    const target = apps.find((a) => a.id === game.id);
    if (target) {
      target.playCount = (target.playCount || 0) + 1;
      db.saveApplications(apps);
    }
  } catch (err) {
    console.error('Error incrementing play count:', err);
  }

  // Embed rendering logic:
  let content = game.embedCode.trim();

  // Decode common HTML entities if embed was pasted with entities
  if (content.includes('&lt;') || content.includes('&gt;') || content.includes('&quot;')) {
    content = content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }

  // 1. If it's a direct URL, redirect directly to that independent link
  if (/^https?:\/\//i.test(content)) {
    let target = content;
    if (target.includes('wordwall.net/vi/embed/')) {
      target = target.replace(/wordwall\.net\/vi\/embed\//i, 'wordwall.net/embed/');
    }
    return res.redirect(target);
  }
  if (content.startsWith('//')) {
    let target = `https:${content}`;
    if (target.includes('wordwall.net/vi/embed/')) {
      target = target.replace(/wordwall\.net\/vi\/embed\//i, 'wordwall.net/embed/');
    }
    return res.redirect(target);
  }

  // 2. If it contains an iframe tag, extract the src and redirect directly to the independent game link
  const iframeMatch = content.match(/<iframe\b[^>]*?\bsrc\s*=\s*(?:["']([^"'>]+)["']|([^\s>]+))/is);
  if (iframeMatch) {
    let targetUrl = (iframeMatch[1] || iframeMatch[2] || '').trim().replace(/&amp;/g, '&');
    if (targetUrl.startsWith('//')) targetUrl = 'https:' + targetUrl;
    if (!/^https?:\/\//i.test(targetUrl) && !targetUrl.startsWith('/')) {
      targetUrl = 'https://' + targetUrl;
    }
    if (targetUrl.includes('wordwall.net/vi/embed/')) {
      targetUrl = targetUrl.replace(/wordwall\.net\/vi\/embed\//i, 'wordwall.net/embed/');
    }
    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      return res.redirect(targetUrl);
    }
  }

  // 2b. If it contains any http/https URL in other tags (embed, object, a), extract and redirect
  const anyUrlMatch = content.match(/https?:\/\/[^\s"'>]+/i);
  if (anyUrlMatch) {
    let targetUrl = anyUrlMatch[0].trim().replace(/&amp;/g, '&');
    if (targetUrl.includes('wordwall.net/vi/embed/')) {
      targetUrl = targetUrl.replace(/wordwall\.net\/vi\/embed\//i, 'wordwall.net/embed/');
    }
    return res.redirect(targetUrl);
  }

  // 3. If already a complete HTML document
  if (content.toLowerCase().includes('<!doctype') || content.toLowerCase().includes('<html')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(content);
  }

  // 4. If it's another snippet, wrap it in a full responsive, clean viewport
  const wrappedHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHtml(game.title)} - Trò chơi học tập</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .game-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    iframe {
      width: 100% !important;
      height: 100% !important;
      border: none !important;
      outline: none !important;
      flex: 1;
    }
  </style>
</head>
<body>
  <div class="game-container">
    ${content}
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(wrappedHtml);
});

function escapeHtml(str: string) {
  return str.replace(/[&<>'"]/g, (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[tag] || tag));
}

// -------------------------------------------------------------
// TEACHER REGISTRATION & AUTHENTICATION
// -------------------------------------------------------------
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { fullName, email, school, province } = req.body;

  if (!fullName || !email || !school || !province) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ tất cả các trường thông tin.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Địa chỉ Email không đúng định dạng.' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    // If existing, automatically log in and grant 10 credits if needed
    if (existing.credits === undefined) {
      existing.credits = 10;
      existing.status = 'active';
      const users = db.getUsers();
      const idx = users.findIndex((u) => u.id === existing.id);
      if (idx !== -1) {
        users[idx] = existing;
        db.saveUsers(users);
      }
    }
    const token = createSession(existing.id, existing.email, 'teacher', existing.fullName);
    return res.json({
      success: true,
      message: 'Email đã tồn tại. Đã tự động đăng nhập vào tài khoản của Thầy/Cô!',
      token,
      user: {
        ...existing,
        role: 'teacher',
      },
    });
  }

  const users = db.getUsers();
  const newUser: User = {
    id: `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    school: school.trim(),
    province: province.trim(),
    status: 'active', // Kích hoạt ngay lập tức!
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  db.saveUsers(users);

  // Tự động tạo token phiên đăng nhập
  const token = createSession(newUser.id, newUser.email, 'teacher', newUser.fullName);

  db.addActivityLog({
    actorEmail: newUser.email,
    actorRole: 'teacher',
    action: 'ĐĂNG_KÝ_TÀI_KHOẢN',
    details: `Giáo viên ${newUser.fullName} (${newUser.school}, ${newUser.province}) đăng ký tài khoản thành công.`,
    ip: req.ip,
  });

  const responseMessage = 'Đăng ký thành công! Thầy/Cô có thể bắt đầu tạo và chia sẻ học liệu số ngay.';

  res.status(201).json({
    success: true,
    message: responseMessage,
    token,
    user: {
      ...newUser,
      role: 'teacher',
    },
  });
});

// Teacher Login with Email
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, activationCode } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Vui lòng nhập Email đã đăng ký.' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'Email này chưa được đăng ký trong hệ thống. Thầy/Cô vui lòng chuyển sang tab Đăng ký để tạo tài khoản mới!' });
  }

  if (user.status === 'blocked') {
    return res.status(403).json({ error: 'Tài khoản này đã bị khóa bởi Quản trị viên. Vui lòng liên hệ ban quản trị.' });
  }

  // Ensure credits are initialized (10 credits default)
  if (user.credits === undefined) {
    user.credits = 10;
    user.status = 'active';
    const users = db.getUsers();
    const uIdx = users.findIndex((u) => u.id === user.id);
    if (uIdx !== -1) {
      users[uIdx].credits = 10;
      users[uIdx].status = 'active';
      db.saveUsers(users);
    }
  }

  // Generate session token
  const token = createSession(user.id, user.email, 'teacher', user.fullName);

  db.addActivityLog({
    actorEmail: user.email,
    actorRole: 'teacher',
    action: 'ĐĂNG_NHẬP_THÀNH_CÔNG',
    details: `Giáo viên ${user.fullName} đăng nhập thành công.`,
    ip: req.ip,
  });

  res.json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      school: user.school,
      province: user.province,
      status: user.status,
      credits: user.credits ?? 10,
      role: 'teacher',
    },
  });
});

// Verify Access / Activation code for teachers
app.post('/api/auth/verify-access-code', (req: Request, res: Response) => {
  const { code, email } = req.body;
  if (!code || typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập mã kích hoạt hoặc xác thực.' });
  }

  const clean = code.trim().toUpperCase().replace(/[\s.-]/g, '');

  // Master author codes
  const isAuthorMaster =
    clean === 'DAUVANLOI' ||
    clean === 'GVST2025' ||
    clean === 'TANKHANHTRUNG' ||
    clean === 'GV2025';

  if (isAuthorMaster) {
    db.addActivityLog({
      actorEmail: email || 'GiaoVien@xacthuc',
      actorRole: 'teacher',
      action: 'XÁC_THỰC_TRUY_CẬP_THÀNH_CÔNG',
      details: `Giáo viên đã xác thực quyền truy cập kho ứng dụng thành công bằng mã của tác giả Đào Văn Lợi (${clean}).`,
      ip: req.ip,
    });
    return res.json({
      success: true,
      verified: true,
      message: 'Xác thực tài khoản thành công! Thầy/Cô có thể truy cập toàn bộ kho ứng dụng.',
    });
  }

  // Check codes in database
  const allCodes = db.getActivationCodes();
  const users = db.getUsers();
  const matching = allCodes.find((c) => {
    if (email) {
      const u = db.findUserByEmail(email);
      if (u && c.userId === u.id && c.codeHash === hashValue(clean, u.id)) {
        return c.status === 'unused';
      }
    }
    for (const u of users) {
      if (c.userId === u.id && c.codeHash === hashValue(clean, u.id) && c.status === 'unused') {
        return true;
      }
    }
    return false;
  });

  if (matching) {
    db.addActivityLog({
      actorEmail: matching.userEmail,
      actorRole: 'teacher',
      action: 'XÁC_THỰC_MÃ_KÍCH_HOẠT',
      details: `Giáo viên ${matching.userName} (${matching.userEmail}) đã xác thực thành công mã kích hoạt kho ứng dụng.`,
      ip: req.ip,
    });
    return res.json({
      success: true,
      verified: true,
      message: 'Mã kích hoạt hợp lệ! Thầy/Cô đã được xác thực thành công.',
    });
  }

  return res.status(400).json({
    error: 'Mã xác thực không chính xác. Thầy/Cô vui lòng liên hệ tác giả Đào Văn Lợi qua số điện thoại: 0775987267 để được tư vấn và cấp mã.',
  });
});

// Request reissue of code
app.post('/api/auth/request-code', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Vui lòng cung cấp email.' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'Email này chưa được đăng ký trong hệ thống.' });
  }

  db.addActivityLog({
    actorEmail: user.email,
    actorRole: 'teacher',
    action: 'YÊU_CẦU_CẤP_LẠI_MÃ',
    details: `Giáo viên ${user.fullName} (${user.email}) đã gửi yêu cầu cấp lại mã đăng nhập.`,
    ip: req.ip,
  });

  res.json({
    success: true,
    message: 'Yêu cầu cấp lại mã của Thầy/Cô đã được gửi đến Quản trị viên hệ thống để kiểm tra và cấp lại mã mới.',
  });
});

// Get current session
app.get('/api/auth/me', verifyAuth, (req: Request, res: Response) => {
  const session = (req as any).user as SessionData;
  if (session.role === 'admin') {
    const admin = db.findAdminByEmail(session.email);
    return res.json({
      id: session.userId,
      email: session.email,
      fullName: admin?.fullName || session.fullName,
      role: 'admin',
      credits: 999999,
    });
  }

  const user = db.findUserById(session.userId);
  if (!user) {
    return res.status(404).json({ error: 'Người dùng không tồn tại.' });
  }

  res.json({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    school: user.school,
    province: user.province,
    status: user.status,
    credits: user.credits ?? 10,
    role: 'teacher',
  });
});

app.post('/api/auth/logout', verifyAuth, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Đăng xuất thành công.' });
});

// -------------------------------------------------------------
// TEACHER & ADMIN APPLICATION CRUD
// -------------------------------------------------------------
app.post('/api/applications', verifyAuth, (req: Request, res: Response) => {
  const session = (req as any).user as SessionData;

  const { title, iconOrImage, embedCode, category } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập Tên trò chơi / thí nghiệm mô phỏng.' });
  }

  if (!embedCode || !embedCode.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập Mã nhúng hoặc liên kết ứng dụng.' });
  }

  const trimmedEmbed = embedCode.trim();
  if (trimmedEmbed.length < 5) {
    return res.status(400).json({ error: 'Mã nhúng không hợp lệ. Vui lòng kiểm tra lại.' });
  }

  const embedType = trimmedEmbed.includes('<iframe') ? 'iframe' : 'html';

  const apps = db.getApplications();
  const newApp: ApplicationGame = {
    id: `game-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    title: title.trim(),
    subject: 'Toán',
    grade: 'Lớp 1',
    topic: '',
    description: '',
    iconOrImage: iconOrImage?.trim() || 'preset-star',
    embedCode: trimmedEmbed,
    embedType,
    createdBy: session.userId,
    creatorName: session.fullName,
    creatorEmail: session.email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    playCount: 0,
    category: category === 'simulation' ? 'simulation' : 'game',
  };

  apps.push(newApp);
  // Tự động lưu và lưu giữ vĩnh viễn trên máy chủ
  db.saveApplications(apps);

  db.addActivityLog({
    actorEmail: session.email,
    actorRole: session.role,
    action: 'THÊM_ỨNG_DỤNG_MỚI',
    details: `${session.role === 'admin' ? 'Quản trị viên' : 'Giáo viên'} thêm ${newApp.category === 'simulation' ? 'thí nghiệm' : 'trò chơi'} "${newApp.title}".`,
    ip: req.ip,
  });

  const serverStatus = db.getServerApplicationsStatus();

  res.status(201).json({
    success: true,
    application: newApp,
    message: 'Đã lưu tự động và bảo toàn thành công trên hệ thống máy chủ.',
    serverStatus,
  });
});

app.put('/api/applications/:id', verifyAuth, (req: Request, res: Response) => {
  const session = (req as any).user as SessionData;

  const apps = db.getApplications();
  const index = apps.findIndex((a) => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy trò chơi học tập.' });
  }

  const appItem = apps[index];

  // Quyền hạn: Quản trị viên HOẶC chính tác giả tạo trò chơi
  if (session.role !== 'admin' && appItem.createdBy !== session.userId) {
    return res.status(403).json({
      error: 'Thầy/Cô chỉ có quyền chỉnh sửa học liệu do chính mình tạo.',
    });
  }

  const { title, iconOrImage, embedCode, category } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập Tên trò chơi / thí nghiệm.' });
  }
  if (!embedCode || !embedCode.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập Mã nhúng.' });
  }

  const trimmedEmbed = embedCode.trim();
  const embedType = trimmedEmbed.includes('<iframe') ? 'iframe' : 'html';

  apps[index] = {
    ...appItem,
    title: title.trim(),
    iconOrImage: iconOrImage?.trim() || appItem.iconOrImage,
    embedCode: trimmedEmbed,
    embedType,
    category: category ? (category === 'simulation' ? 'simulation' : 'game') : appItem.category || 'game',
    updatedAt: new Date().toISOString(),
  };

  db.saveApplications(apps);

  db.addActivityLog({
    actorEmail: session.email,
    actorRole: session.role,
    action: 'CẬP_NHẬT_ỨNG_DỤNG',
    details: `Cập nhật thông tin "${apps[index].title}" và lưu giữ trên máy chủ.`,
    ip: req.ip,
  });

  res.json({
    success: true,
    application: apps[index],
    message: 'Đã lưu thay đổi vào hệ thống máy chủ.',
  });
});

// Chức năng lưu giữ và sao lưu máy chủ thủ công cho Quản trị viên
app.post('/api/applications/save-server', verifyAdmin, (req: Request, res: Response) => {
  const apps = db.getApplications();
  db.saveApplications(apps);
  const status = db.getServerApplicationsStatus();
  res.json({
    success: true,
    message: 'Đã lưu giữ và sao lưu toàn bộ kho ứng dụng & thí nghiệm trên hệ thống máy chủ an toàn!',
    status,
  });
});

app.get('/api/applications/server-status', verifyAdmin, (req: Request, res: Response) => {
  res.json(db.getServerApplicationsStatus());
});

app.delete('/api/applications/:id', verifyAuth, (req: Request, res: Response) => {
  const session = (req as any).user as SessionData;

  const apps = db.getApplications();
  const index = apps.findIndex((a) => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy trò chơi học tập.' });
  }

  const appItem = apps[index];

  // Quyền hạn: Quản trị viên HOẶC chính tác giả tạo trò chơi
  if (session.role !== 'admin' && appItem.createdBy !== session.userId) {
    return res.status(403).json({
      error: 'Thầy/Cô chỉ có quyền xóa học liệu do chính mình tạo.',
    });
  }

  apps.splice(index, 1);
  db.saveApplications(apps);

  db.addActivityLog({
    actorEmail: session.email,
    actorRole: session.role,
    action: 'XÓA_ỨNG_DỤNG',
    details: `Đã xóa trò chơi "${appItem.title}" (${appItem.subject}).`,
    ip: req.ip,
  });

  res.json({ success: true, message: 'Đã xóa trò chơi thành công.' });
});

// -------------------------------------------------------------
// DEDICATED ADMIN BACKEND ("DÀNH CHO MÁY CHỦ QUẢN LÝ")
// -------------------------------------------------------------
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập Email và Mật khẩu quản trị.' });
  }

  const admin = db.findAdminByEmail(email);
  if (!admin) {
    return res.status(401).json({ error: 'Email quản trị không tồn tại trong hệ thống.' });
  }

  const [salt, storedHash] = admin.passwordHash.split(':');
  const inputHash = hashValue(password, salt);

  if (inputHash !== storedHash) {
    return res.status(401).json({ error: 'Mật khẩu quản trị không chính xác.' });
  }

  const token = createSession(admin.id, admin.email, 'admin', admin.fullName);

  db.addActivityLog({
    actorEmail: admin.email,
    actorRole: 'admin',
    action: 'QUẢN_TRỊ_ĐĂNG_NHẬP',
    details: `Quản trị viên ${admin.fullName} đăng nhập thành công vào trang quản trị.`,
    ip: req.ip,
  });

  res.json({
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
    },
  });
});

app.get('/api/admin/overview', verifyAdmin, (req: Request, res: Response) => {
  const users = db.getUsers();
  const apps = db.getApplications();
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentAppsCount = apps.filter((a) => new Date(a.createdAt).getTime() > oneWeekAgo).length;

  res.json({
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === 'active').length,
    pendingUsers: users.filter((u) => u.status === 'pending').length,
    blockedUsers: users.filter((u) => u.status === 'blocked').length,
    totalApplications: apps.length,
    recentApplicationsCount: recentAppsCount,
  });
});

// List users with activation code info
app.get('/api/admin/users', verifyAdmin, (req: Request, res: Response) => {
  const users = db.getUsers();
  const codes = db.getActivationCodes();

  const userItems = users.map((user) => {
    const userCodes = codes.filter((c) => c.userId === user.id);
    const activeCode = userCodes.find((c) => c.status === 'unused') || userCodes[userCodes.length - 1];
    return {
      ...user,
      activeCode: activeCode
        ? {
            id: activeCode.id,
            status: activeCode.status,
            codeMasked: activeCode.codeMasked,
            createdAt: activeCode.createdAt,
            expiresAt: activeCode.expiresAt,
            emailStatus: activeCode.emailStatus,
            emailSentAt: activeCode.emailSentAt,
            reissuedCount: activeCode.reissuedCount,
          }
        : null,
    };
  });

  res.json(userItems);
});

// Approve teacher account and generate activation code
app.post('/api/admin/users/:id/approve-and-generate-code', verifyAdmin, async (req: Request, res: Response) => {
  const session = (req as any).user as SessionData;
  const users = db.getUsers();
  const user = users.find((u) => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
  }

  // Generate plain activation code
  const plainCode = generateActivationCode();
  const hashedCode = hashValue(plainCode, user.id);
  const masked = maskActivationCode(plainCode);

  // Invalidate any prior codes
  const codes = db.getActivationCodes();
  codes.forEach((c) => {
    if (c.userId === user.id && c.status === 'unused') {
      c.status = 'revoked';
    }
  });

  const settings = db.getSettings();
  const expiresAt = new Date(Date.now() + settings.maxCodeAgeDays * 24 * 60 * 60 * 1000).toISOString();

  // Dispatch email
  const emailResult = await sendActivationCodeEmail({
    toEmail: user.email,
    toName: user.fullName,
    activationCode: plainCode,
    expiresAt,
  });

  const newCodeRecord: ActivationCodeRecord = {
    id: `code-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    userId: user.id,
    userEmail: user.email,
    userName: user.fullName,
    codeHash: hashedCode,
    codeMasked: masked,
    status: 'unused',
    createdAt: new Date().toISOString(),
    expiresAt,
    emailStatus: emailResult.status,
    emailSentAt: emailResult.status === 'sent' ? new Date().toISOString() : undefined,
    emailError: emailResult.status === 'failed' ? emailResult.message : undefined,
    reissuedCount: 0,
  };

  codes.push(newCodeRecord);
  db.saveActivationCodes(codes);

  // Mark user as active
  user.status = 'active';
  user.updatedAt = new Date().toISOString();
  db.saveUsers(users);

  db.addActivityLog({
    actorEmail: session.email,
    actorRole: 'admin',
    action: 'PHÊ_DUYỆT_VÀ_CẤP_MÃ',
    details: `Phê duyệt tài khoản cho ${user.fullName} (${user.email}) và cấp mã kích hoạt ${masked}. Email: ${emailResult.status}.`,
    ip: req.ip,
  });

  res.json({
    success: true,
    plainCode, // Returned once so admin can see and deliver directly if SMTP is pending
    emailResult,
    codeRecord: newCodeRecord,
    user,
  });
});

// Reissue activation code
app.post('/api/admin/users/:id/reissue-code', verifyAdmin, async (req: Request, res: Response) => {
  const session = (req as any).user as SessionData;
  const user = db.findUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
  }

  const plainCode = generateActivationCode();
  const hashedCode = hashValue(plainCode, user.id);
  const masked = maskActivationCode(plainCode);

  const codes = db.getActivationCodes();
  let prevCount = 0;
  codes.forEach((c) => {
    if (c.userId === user.id) {
      if (c.status === 'unused') c.status = 'revoked';
      prevCount = Math.max(prevCount, c.reissuedCount || 0);
    }
  });

  const settings = db.getSettings();
  const expiresAt = new Date(Date.now() + settings.maxCodeAgeDays * 24 * 60 * 60 * 1000).toISOString();

  const emailResult = await sendActivationCodeEmail({
    toEmail: user.email,
    toName: user.fullName,
    activationCode: plainCode,
    expiresAt,
  });

  const newCodeRecord: ActivationCodeRecord = {
    id: `code-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    userId: user.id,
    userEmail: user.email,
    userName: user.fullName,
    codeHash: hashedCode,
    codeMasked: masked,
    status: 'unused',
    createdAt: new Date().toISOString(),
    expiresAt,
    emailStatus: emailResult.status,
    emailSentAt: emailResult.status === 'sent' ? new Date().toISOString() : undefined,
    emailError: emailResult.status === 'failed' ? emailResult.message : undefined,
    reissuedCount: prevCount + 1,
  };

  codes.push(newCodeRecord);
  db.saveActivationCodes(codes);

  db.addActivityLog({
    actorEmail: session.email,
    actorRole: 'admin',
    action: 'CẤP_LẠI_MÃ_ĐĂNG_NHẬP',
    details: `Cấp lại mã đăng nhập mới cho ${user.fullName} (${user.email}). Mã cũ đã bị vô hiệu hóa. Email: ${emailResult.status}.`,
    ip: req.ip,
  });

  res.json({
    success: true,
    plainCode,
    emailResult,
    codeRecord: newCodeRecord,
  });
});

// Update user status (lock / unlock / pending)
app.put('/api/admin/users/:id/status', verifyAdmin, (req: Request, res: Response) => {
  const session = (req as any).user as SessionData;
  const { status } = req.body;
  if (!['active', 'blocked', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Trạng thái không hợp lệ.' });
  }

  const users = db.getUsers();
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
  }

  const oldStatus = user.status;
  user.status = status;
  user.updatedAt = new Date().toISOString();
  db.saveUsers(users);

  db.addActivityLog({
    actorEmail: session.email,
    actorRole: 'admin',
    action: 'THAY_ĐỔI_TRẠNG_THÁI_NGƯỜI_DÙNG',
    details: `Đổi trạng thái tài khoản ${user.email} từ "${oldStatus}" sang "${status}".`,
    ip: req.ip,
  });

  res.json({ success: true, user });
});

// Delete user with options for their games
app.delete('/api/admin/users/:id', verifyAdmin, (req: Request, res: Response) => {
  const session = (req as any).user as SessionData;
  const { preserveGames } = req.query;
  const users = db.getUsers();
  const index = users.findIndex((u) => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
  }

  const user = users[index];
  users.splice(index, 1);
  db.saveUsers(users);

  // Invalidate codes
  const codes = db.getActivationCodes().filter((c) => c.userId !== user.id);
  db.saveActivationCodes(codes);

  // Handle their created applications: if not preserving, delete them; otherwise retain
  if (preserveGames !== 'true') {
    const apps = db.getApplications().filter((a) => a.createdBy !== user.id);
    db.saveApplications(apps);
  }

  db.addActivityLog({
    actorEmail: session.email,
    actorRole: 'admin',
    action: 'XÓA_TÀI_KHOẢN',
    details: `Đã xóa tài khoản giáo viên ${user.fullName} (${user.email}). Giữ lại học liệu: ${preserveGames === 'true'}.`,
    ip: req.ip,
  });

  res.json({ success: true, message: 'Đã xóa tài khoản thành công.' });
});

// Activity logs
app.get('/api/admin/logs', verifyAdmin, (req: Request, res: Response) => {
  res.json(db.getActivityLogs());
});

// System Settings
app.get('/api/admin/settings', verifyAdmin, (req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json({
    ...settings,
    smtpPass: settings.smtpPass ? '••••••••' : '',
  });
});

app.put('/api/admin/settings', verifyAdmin, (req: Request, res: Response) => {
  const session = (req as any).user as SessionData;
  const current = db.getSettings();
  const body = req.body;

  const newSettings = {
    ...current,
    smtpHost: body.smtpHost !== undefined ? body.smtpHost : current.smtpHost,
    smtpPort: body.smtpPort !== undefined ? Number(body.smtpPort) : current.smtpPort,
    smtpSecure: body.smtpSecure !== undefined ? Boolean(body.smtpSecure) : current.smtpSecure,
    smtpUser: body.smtpUser !== undefined ? body.smtpUser : current.smtpUser,
    smtpPass: body.smtpPass && body.smtpPass !== '••••••••' ? body.smtpPass : current.smtpPass,
    emailFrom: body.emailFrom || current.emailFrom,
    emailFromName: body.emailFromName || current.emailFromName,
    maxCodeAgeDays: body.maxCodeAgeDays || current.maxCodeAgeDays,
  };

  db.saveSettings(newSettings);

  db.addActivityLog({
    actorEmail: session.email,
    actorRole: 'admin',
    action: 'CẬP_NHẬT_CẤU_HÌNH_HỆ_THỐNG',
    details: 'Cập nhật cấu hình máy chủ SMTP và thiết lập bảo mật.',
    ip: req.ip,
  });

  res.json({ success: true, settings: newSettings });
});

// Test SMTP
app.post('/api/admin/test-smtp', verifyAdmin, async (req: Request, res: Response) => {
  const { testEmail } = req.body;
  if (!testEmail) {
    return res.status(400).json({ error: 'Vui lòng nhập địa chỉ email nhận thư thử nghiệm.' });
  }

  const result = await sendActivationCodeEmail({
    toEmail: testEmail,
    toName: 'Quý Thầy/Cô Thử Nghiệm',
    activationCode: 'GVST-TEST-8888',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });

  res.json(result);
});

// -------------------------------------------------------------
// VITE INTEGRATION & SERVER STARTUP
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    // In dev: mount Vite dev server as middleware with HMR disabled to prevent WebSocket errors
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    // Serve transformed index.html for all SPA routes in dev
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Giáo Viên Sáng Tạo running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
