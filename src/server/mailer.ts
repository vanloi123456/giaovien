/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import nodemailer from 'nodemailer';
import { db } from './db.ts';

export interface SendActivationCodeParams {
  toEmail: string;
  toName: string;
  activationCode: string;
  expiresAt: string;
}

export async function sendActivationCodeEmail(
  params: SendActivationCodeParams
): Promise<{ success: boolean; status: 'sent' | 'not_configured' | 'failed'; message: string }> {
  const settings = db.getSettings();

  // Check if SMTP is configured
  const hasSmtp = Boolean(settings.smtpHost && settings.smtpUser && settings.smtpPass);

  const emailSubject = 'Mã kích hoạt tài khoản hệ thống GIÁO VIÊN SÁNG TẠO';
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0284c7; margin: 0; font-size: 24px;">GIÁO VIÊN SÁNG TẠO</h1>
        <p style="color: #64748b; margin-top: 4px; font-size: 14px; font-style: italic;">
          Sáng tạo học liệu – Kết nối tri thức – Lan tỏa niềm vui học tập
        </p>
      </div>

      <div style="padding: 20px; background-color: #f0f9ff; border-radius: 12px; margin-bottom: 24px;">
        <h3 style="color: #0369a1; margin-top: 0;">Kính chào Thầy/Cô ${params.toName},</h3>
        <p style="color: #334155; line-height: 1.6;">
          Yêu cầu đăng ký tài khoản của Thầy/Cô trên hệ thống <strong>Giáo Viên Sáng Tạo</strong> đã được Chủ sở hữu hệ thống phê duyệt.
        </p>
        <p style="color: #334155; line-height: 1.6;">
          Dưới đây là <strong>MÃ ĐĂNG NHẬP / MÃ KÍCH HOẠT</strong> độc quyền dành riêng cho tài khoản của Thầy/Cô:
        </p>
        
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-family: monospace; font-size: 28px; font-weight: bold; letter-spacing: 2px; color: #0284c7; background-color: #ffffff; padding: 12px 28px; border: 2px dashed #38bdf8; border-radius: 8px;">
            ${params.activationCode}
          </span>
        </div>

        <p style="color: #64748b; font-size: 13px; text-align: center;">
          * Mã có hiệu lực đến ngày: <strong>${new Date(params.expiresAt).toLocaleDateString('vi-VN')}</strong>. Vui lòng không chia sẻ mã này cho người khác.
        </p>
      </div>

      <div style="margin-bottom: 24px;">
        <h4 style="color: #1e293b; margin-bottom: 8px;">Hướng dẫn đăng nhập:</h4>
        <ol style="color: #475569; line-height: 1.8; padding-left: 20px;">
          <li>Truy cập trang web <strong>Giáo Viên Sáng Tạo</strong>.</li>
          <li>Chọn mục <strong>Đăng nhập</strong>.</li>
          <li>Nhập email: <code>${params.toEmail}</code> và dán mã ở trên.</li>
          <li>Bắt đầu khai thác kho học liệu và nhúng trò chơi học tập của Thầy/Cô!</li>
        </ol>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p>Email này được gửi tự động từ Ban quản trị Hệ thống Giáo Viên Sáng Tạo.</p>
      </div>
    </div>
  `;

  if (!hasSmtp) {
    console.log(`[MAIL NOT CONFIGURED] Activation code for ${params.toEmail}: ${params.activationCode}`);
    return {
      success: true,
      status: 'not_configured',
      message: 'Hệ thống chưa cấu hình máy chủ SMTP gửi mail trực tiếp. Mã kích hoạt đã được cấp, lưu an toàn và hiển thị trên màn hình quản trị để gửi cho giáo viên.',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: `"${settings.emailFromName}" <${settings.emailFrom}>`,
      to: params.toEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    return {
      success: true,
      status: 'sent',
      message: `Đã gửi mã kích hoạt thành công đến email ${params.toEmail}.`,
    };
  } catch (error) {
    console.error('Lỗi khi gửi email qua SMTP:', error);
    return {
      success: false,
      status: 'failed',
      message: `Lỗi kết nối máy chủ gửi mail: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export interface SendRegistrationEmailParams {
  toEmail: string;
  toName: string;
  school: string;
  province: string;
}

export async function sendRegistrationSuccessEmail(
  params: SendRegistrationEmailParams
): Promise<{ success: boolean; status: 'sent' | 'not_configured' | 'failed'; message: string }> {
  const settings = db.getSettings();
  const hasSmtp = Boolean(settings.smtpHost && settings.smtpUser && settings.smtpPass);

  const directContent = 'Để truy cập kho ứng dụng, thầy, cô vui lòng liên hệ với tác giả: Đào Văn Lợi, qua số điện thoại: 0775987267 để được tư vấn. Trân trọng cảm ơn quý thầy cô!';
  const emailSubject = 'Thông báo đăng ký tài khoản - Giáo Viên Sáng Tạo';
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #bae6fd; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0284c7; margin: 0; font-size: 22px;">GIÁO VIÊN SÁNG TẠO</h1>
        <p style="color: #64748b; font-size: 13px; margin-top: 4px; font-style: italic;">
          Sáng tạo – Kết nối tri thức – Lan tỏa niềm vui học tập
        </p>
      </div>

      <div style="padding: 20px; background-color: #f0f9ff; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #0284c7;">
        <h3 style="color: #0369a1; margin-top: 0;">Kính chào Thầy/Cô ${params.toName},</h3>
        <p style="color: #1e293b; line-height: 1.8; font-size: 15px; font-weight: 500;">
          Để truy cập kho ứng dụng, thầy, cô vui lòng liên hệ với tác giả: <strong>Đào Văn Lợi</strong>, qua số điện thoại: <strong style="color: #0284c7; font-size: 16px;">0775987267</strong> để được tư vấn. Trân trọng cảm ơn quý thầy cô!
        </p>
      </div>

      <div style="color: #475569; font-size: 13px; line-height: 1.7; background-color: #f8fafc; padding: 16px; border-radius: 10px;">
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #1e293b;">Thông tin đăng ký của Thầy/Cô:</p>
        <p style="margin: 4px 0;">• Họ và tên: <strong>${params.toName}</strong></p>
        <p style="margin: 4px 0;">• Email: <strong>${params.toEmail}</strong></p>
        <p style="margin: 4px 0;">• Đơn vị: <strong>${params.school}</strong> (${params.province})</p>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; margin-top: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0; font-weight: bold; color: #0284c7;">Tác giả Đào Văn Lợi - Trường TH&THCS Tân Khánh Trung, tỉnh Đồng Tháp</p>
        <p style="margin: 4px 0 0 0;">Điện thoại liên hệ: <strong>0775987267</strong></p>
      </div>
    </div>
  `;

  const emailText = `Kính chào Thầy/Cô ${params.toName},\n\n${directContent}\n\nThông tin đăng ký của Thầy/Cô:\n- Họ và tên: ${params.toName}\n- Email: ${params.toEmail}\n- Đơn vị: ${params.school} (${params.province})\n\nTác giả Đào Văn Lợi - Trường TH&THCS Tân Khánh Trung, tỉnh Đồng Tháp\nĐiện thoại: 0775987267`;

  if (!hasSmtp) {
    console.log(`[SMTP DIRECT MAIL TO ${params.toEmail}]: ${directContent}`);
    return {
      success: true,
      status: 'not_configured',
      message: directContent,
    };
  }

  try {
    const isGmail = settings.smtpHost.toLowerCase().includes('gmail');
    const transporterConfig: any = {
      host: settings.smtpHost,
      port: settings.smtpPort || (settings.smtpSecure ? 465 : 587),
      secure: Boolean(settings.smtpSecure),
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
    };

    if (isGmail) {
      transporterConfig.service = 'gmail';
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    await transporter.sendMail({
      from: `"${settings.emailFromName || 'Hệ thống Giáo Viên Sáng Tạo'}" <${settings.emailFrom || settings.smtpUser}>`,
      to: params.toEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    });

    console.log(`[SMTP DIRECT MAIL SENT] Successfully dispatched to ${params.toEmail}`);
    return {
      success: true,
      status: 'sent',
      message: directContent,
    };
  } catch (error) {
    console.error('Lỗi khi gửi email trực tiếp qua SMTP:', error);
    return {
      success: false,
      status: 'failed',
      message: directContent,
    };
  }
}
