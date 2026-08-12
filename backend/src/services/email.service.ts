import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

const TRANSPORT_TYPE = 'SMTP';
const APP_NAME = 'Mini ERP + CRM Portal';

const isConfigured = () => Boolean(config.smtp.host && config.smtp.user && config.smtp.pass);

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }
  return transporter;
};

const baseHtml = (content: string) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
    <div style="background:#1e40af;color:#ffffff;padding:20px 24px">
      <h2 style="margin:0;font-size:18px">${APP_NAME}</h2>
    </div>
    <div style="padding:24px 24px 8px">${content}</div>
    <div style="padding:16px 24px;background:#f8fafc;color:#64748b;font-size:12px;border-top:1px solid #e2e8f0">
      This is an automated email. Please do not reply. &copy; ${new Date().getFullYear()} ${APP_NAME}
    </div>
  </div>
`;

const otpBoxHtml = (otp: string) => `
  <div style="display:inline-block;background:#eff6ff;border:1px solid #dbeafe;border-radius:8px;padding:14px 20px;font-size:26px;font-weight:700;letter-spacing:8px;color:#1e40af;margin:12px 0">${otp}</div>
`;

const verificationTemplate = (name: string, otp: string) => baseHtml(`
  <p style="color:#0f172a;font-size:15px">Hi ${name},</p>
  <p style="color:#334155;font-size:14px;line-height:1.6">
    An administrator has created an account for you on the <strong>${APP_NAME}</strong>.
    Verify your email address to activate your account using the one-time password (OTP) below. It expires in 10 minutes.
  </p>
  <div style="text-align:center">${otpBoxHtml(otp)}</div>
  <p style="color:#64748b;font-size:12px">If you did not expect this email, you can safely ignore it.</p>
`);

const resetTemplate = (name: string, otp: string) => baseHtml(`
  <p style="color:#0f172a;font-size:15px">Hi ${name},</p>
  <p style="color:#334155;font-size:14px;line-height:1.6">
    We received a request to reset your password for the <strong>${APP_NAME}</strong>.
    Use the one-time password (OTP) below to set a new password. It expires in 10 minutes.
  </p>
  <div style="text-align:center">${otpBoxHtml(otp)}</div>
  <p style="color:#64748b;font-size:12px">If you did not request this, no changes will be made to your account.</p>
`);

const passwordChangedTemplate = (name: string) => baseHtml(`
  <p style="color:#0f172a;font-size:15px">Hi ${name},</p>
  <p style="color:#334155;font-size:14px;line-height:1.6">
    Your password for the <strong>${APP_NAME}</strong> was successfully changed. If this wasn't you, contact your administrator immediately.
  </p>
`);

const send = async (to: string, subject: string, html: string) => {
  if (!isConfigured()) {
    if (config.nodeEnv !== 'production') {
      console.warn(`[email] SMTP not configured. Email to ${to} would be sent: ${subject}`);
    } else {
      throw new Error('Email service is not configured');
    }
    return;
  }

  await getTransporter().sendMail({
    from: `"${APP_NAME}" <${config.smtp.from}>`,
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (to: string, name: string, otp: string) => {
  if (config.nodeEnv !== 'production') {
    console.log(`[DEV] Email verification OTP for ${to}: ${otp}`);
  }
  await send(to, 'Verify your email address', verificationTemplate(name, otp));
};

export const sendPasswordResetEmail = async (to: string, name: string, otp: string) => {
  if (config.nodeEnv !== 'production') {
    console.log(`[DEV] Password reset OTP for ${to}: ${otp}`);
  }
  await send(to, 'Reset your password', resetTemplate(name, otp));
};

export const sendPasswordChangedEmail = async (to: string, name: string) => {
  await send(to, 'Your password has been changed', passwordChangedTemplate(name));
};

export { TRANSPORT_TYPE };