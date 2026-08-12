import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.validation.js';

const router = Router();
const controller = new AuthController();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// Public endpoints
router.post('/login', authLimiter, validate(loginSchema), (req, res, next) => controller.login(req, res, next));
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), (req, res, next) => controller.verifyEmail(req, res, next));
router.post('/resend-otp', otpLimiter, validate(resendOtpSchema), (req, res, next) => controller.resendVerification(req, res, next));
router.post('/forgot-password', otpLimiter, validate(forgotPasswordSchema), (req, res, next) => controller.forgotPassword(req, res, next));
router.post('/verify-reset-otp', otpLimiter, validate(verifyResetOtpSchema), (req, res, next) => controller.verifyResetOtp(req, res, next));
router.post('/reset-password', otpLimiter, validate(resetPasswordSchema), (req, res, next) => controller.resetPassword(req, res, next));

// Authenticated endpoints
router.get('/profile', authenticate, (req, res, next) => controller.profile(req, res, next));
router.post('/logout', (req, res, next) => controller.logout(req, res, next));
router.post('/change-password', authenticate, validate(changePasswordSchema), (req, res, next) => controller.changePassword(req, res, next));

export default router;