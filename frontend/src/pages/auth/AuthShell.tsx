import React from 'react';
import { BarChart3, ShieldCheck } from 'lucide-react';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AuthShell: React.FC<AuthShellProps> = ({ title, subtitle, children, footer }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
        fontFamily: "'Inter', sans-serif",
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.18)',
          padding: '2.5rem 2.25rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '58px',
              height: '58px',
              background: '#2563eb',
              borderRadius: '16px',
              color: '#ffffff',
              boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
              marginBottom: '1rem',
            }}
          >
            <BarChart3 size={30} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem', letterSpacing: '-0.01em' }}>
            {title}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>{subtitle}</p>
        </div>

        {children}

        {footer && (
          <div style={{ textAlign: 'center', marginTop: '1.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            {footer}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={13} />
          Secured by Mini ERP + CRM Authentication
        </div>
      </div>
    </div>
  );
};

export const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.7rem 1rem',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '0.925rem',
  color: '#0f172a',
  outline: 'none',
  background: '#ffffff',
  transition: 'border-color 0.2s',
};

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.825rem',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '0.4rem',
};

export const errorBoxStyle: React.CSSProperties = {
  background: '#fee2e2',
  color: '#b91c1c',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '0.7rem 0.9rem',
  marginBottom: '1rem',
  fontSize: '0.825rem',
  fontWeight: 500,
};

export const successBoxStyle: React.CSSProperties = {
  background: '#dcfce7',
  color: '#15803d',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '0.7rem 0.9rem',
  marginBottom: '1rem',
  fontSize: '0.825rem',
  fontWeight: 500,
};

export const primaryButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.8rem',
  background: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.95rem',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.25)',
  transition: 'background 0.2s',
};

export const linkStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#2563eb',
  fontWeight: 600,
  textDecoration: 'none',
};
