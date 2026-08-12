import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      setSuccessMessage(res.data?.message || 'Email verified successfully.');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err: any) {
      console.error('Verify OTP failed:', err);
      setErrorMessage(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setErrorMessage('Please enter your email address first.');
      return;
    }
    setIsResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await api.post('/auth/resend-otp', { email });
      setSuccessMessage('If an account exists, a new verification email has been sent.');
    } catch (err: any) {
      console.error('Resend OTP failed:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthShell
      title="Verify Your Email"
      subtitle="Enter the 6-digit code we emailed you to activate your account"
      footer={
        <>
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Already verified? </span>
          <Link to="/login" style={linkStyle}>Back to Login</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={fieldStyle}
          />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Verification Code (OTP)</label>
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
        {successMessage && <div style={successBoxStyle}>{successMessage}</div>}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{ ...primaryButtonStyle, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
        >
          {isSubmitting ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          style={{ background: 'none', border: 'none', cursor: isResending ? 'not-allowed' : 'pointer', ...linkStyle }}
        >
          {isResending ? 'Resending...' : "Didn't receive the code? Resend"}
        </button>
      </div>
    </AuthShell>
  );
};
