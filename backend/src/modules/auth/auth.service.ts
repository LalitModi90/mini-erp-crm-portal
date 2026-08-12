import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database.js';
import { generateToken } from '../../utils/jwt.js';
import { HttpError } from '../../utils/http-error.js';
import {
  generateOtp,
  hashOtp,
  verifyOtp,
  otpExpiryDate,
  OTP_MAX_ATTEMPTS,
  OtpPurpose,
} from '../../utils/otp.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from '../../services/email.service.js';

const GENERIC_OTP_SENT_MESSAGE = 'If an account exists, a verification email has been sent.';
const GENERIC_RESET_SENT_MESSAGE = 'If an account exists, a password reset email has been sent.';

export class AuthService {
  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new HttpError(401, 'Invalid email or password');

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) throw new HttpError(401, 'Invalid email or password');

    if (!user.isActive) {
      throw new HttpError(403, 'This account has been deactivated. Contact your administrator.');
    }
    if (!user.emailVerified) {
      throw new HttpError(403, 'Please verify your email before logging in.');
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    };
  }

  async profile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpError(404, 'User not found');
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  async logout() {
    return { message: 'Logged out successfully' };
  }

  async verifyEmail(data: { email: string; otp: string }) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (user && user.emailVerified) return { message: 'Email verified successfully' };

    const record = await this.getLatestOtp(data.email, 'EMAIL_VERIFY');
    await this.assertValidOtp(record, data.otp);

    await prisma.authOTP.update({ where: { id: record!.id }, data: { usedAt: new Date() } });
    if (user) {
      await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
    }
    return { message: 'Email verified successfully' };
  }

  async resendVerification(data: { email: string }) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || user.emailVerified) return { message: GENERIC_OTP_SENT_MESSAGE };

    const otp = await this.createOtp(user.email, 'EMAIL_VERIFY');
    await sendVerificationEmail(user.email, user.name, otp);
    return { message: GENERIC_OTP_SENT_MESSAGE };
  }

  async createEmailVerificationOtpForUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpError(404, 'User not found');
    if (user.emailVerified) {
      throw new HttpError(400, 'This account email is already verified.');
    }

    const otp = await this.createOtp(user.email, 'EMAIL_VERIFY');
    await sendVerificationEmail(user.email, user.name, otp);
    return { message: 'Verification email sent.' };
  }

  async forgotPassword(data: { email: string }) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (user && user.isActive) {
      const otp = await this.createOtp(user.email, 'PASSWORD_RESET');
      await sendPasswordResetEmail(user.email, user.name, otp);
    }
    return { message: GENERIC_RESET_SENT_MESSAGE };
  }

  async verifyResetOtp(data: { email: string; otp: string }) {
    const record = await this.getLatestOtp(data.email, 'PASSWORD_RESET');
    await this.assertValidOtp(record, data.otp);
    return { message: 'Code verified. You can now reset your password.' };
  }

  async resetPassword(data: { email: string; otp: string; newPassword: string }) {
    const record = await this.getLatestOtp(data.email, 'PASSWORD_RESET');
    await this.assertValidOtp(record, data.otp);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new HttpError(404, 'User not found');

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } }),
      prisma.authOTP.update({ where: { id: record!.id }, data: { usedAt: new Date() } }),
    ]);

    try {
      await sendPasswordChangedEmail(user.email, user.name);
    } catch {
      // Notify failure must not block a successful password reset.
    }
    return { message: 'Password reset successfully. You can now log in.' };
  }

  async changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpError(404, 'User not found');

    const isValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isValid) throw new HttpError(400, 'Current password is incorrect');

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

    try {
      await sendPasswordChangedEmail(user.email, user.name);
    } catch {
      // Notify failure must not block a successful password change.
    }
    return { message: 'Password changed successfully' };
  }

  private async getLatestOtp(email: string, purpose: OtpPurpose) {
    return prisma.authOTP.findFirst({
      where: { email, purpose, usedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async assertValidOtp(record: { id: string; otpHash: string; expiresAt: Date; attempts: number } | null, otp: string) {
    if (!record) throw new HttpError(400, 'Invalid or expired code. Request a new one.');

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      throw new HttpError(400, 'Too many incorrect attempts. Request a new code.');
    }
    if (record.expiresAt.getTime() < Date.now()) {
      throw new HttpError(400, 'Code has expired. Request a new one.');
    }

    const valid = await verifyOtp(otp, record.otpHash);
    if (!valid) {
      await prisma.authOTP.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      throw new HttpError(400, 'Incorrect code. Please try again.');
    }
  }

  private async createOtp(email: string, purpose: OtpPurpose) {
    await prisma.authOTP.updateMany({
      where: { email, purpose, usedAt: null },
      data: { usedAt: new Date() },
    });

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    await prisma.authOTP.create({
      data: { email, otpHash, purpose, expiresAt: otpExpiryDate() },
    });
    return otp;
  }
}