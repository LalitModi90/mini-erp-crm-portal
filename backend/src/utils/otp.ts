import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const OTP_EXPIRY_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_LENGTH = 6;

export type OtpPurpose = 'EMAIL_VERIFY' | 'PASSWORD_RESET';

export const generateOtp = (): string => {
  const value = crypto.randomInt(0, 1000000);
  return String(value).padStart(OTP_LENGTH, '0');
};

export const hashOtp = (otp: string): Promise<string> => {
  return bcrypt.hash(otp, 10);
};

export const verifyOtp = (otp: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(otp, hash);
};

export const otpExpiryDate = (): Date => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + OTP_EXPIRY_MINUTES);
  return date;
};