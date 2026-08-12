import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  AuthShell,
  fieldStyle,
  labelStyle,
  errorBoxStyle,
  successBoxStyle,
  primaryButtonStyle,
  linkStyle,
} from './AuthShell';

export const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = (location.state as { email?: string } | null)?.email || '';

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await api.post('/auth/verify-reset-otp', { email, otp });
      setStep(2);
    } catch (err: any) {
      console.error('Verify reset OTP failed:', err);
      setErrorMessage(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword });
      setSuccessMessage(res.data?.message || 'Password reset successfully.');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err: any) {
      console.error('Reset password failed:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={step === 1 ? 'Reset Password' : 'Set New Password'}
      subtitle={
        step === 1
          ? 'Enter the code sent to your email to verify your identity'
          : 'Choose a strong new password for your account'
      }
      footer={
        <>
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Remembered your password? </span>
          <Link to="/login" style={linkStyle}>Back to Login</Link>
        </>
      }
    >
      {successMessage && <div style={successBoxStyle}>{successMessage}</div>}

      {step === 1 ? (
        <form onSubmit={handleVerifyCode}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={Boolean(initialEmail)}
              style={{ ...fieldStyle, opacity: initialEmail ? 0.7 : 1 }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Reset Code (OTP)</label>
            <input
              type="text"
              placeholder="6-digit code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              style={fieldStyle}
            />
          </div>

          {errorMessage && <div style={errorBoxStyle}>{errorMessage}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ ...primaryButtonStyle, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          >
            {isSubmitting ? 'Verifying...' : 'Verify Code'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <Link to="/forgot-password" style={linkStyle}>Resend code</Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleReset}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              placeholder="Min 8 characters, letters & numbers"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={fieldStyle}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Confirm New Password</label>
            <input
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={fieldStyle}
            />
          </div>

          {errorMessage && <div style={errorBoxStyle}>{errorMessage}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ ...primaryButtonStyle, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </AuthShell>
  );
};
