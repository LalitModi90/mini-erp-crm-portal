import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      const msg = res.data?.message || res.data?.data?.message || 'If an account exists, a password reset email has been sent.';
      setSentEmail(email);
      setSuccessMessage(msg);
    } catch (err: any) {
      console.error('Forgot password failed:', err);
      setErrorMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Forgot Password"
      subtitle="Enter your registered email to receive a reset code"
      footer={
        <>
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Remembered your password? </span>
          <Link to="/login" style={linkStyle}>Back to Login</Link>
        </>
      }
    >
      {successMessage && (
        <div style={successBoxStyle}>
          {successMessage}
        </div>
      )}

      {sentEmail && !successMessage ? null : null}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {isSubmitting ? 'Sending...' : 'Send Reset Code'}
        </button>
      </form>

      {sentEmail && successMessage && (
        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <Link
            to="/reset-password"
            state={{ email: sentEmail }}
            style={{ ...linkStyle, display: 'inline-block', marginTop: '0.5rem' }}
          >
            I have a code — Reset my password →
          </Link>
        </div>
      )}
    </AuthShell>
  );
};
