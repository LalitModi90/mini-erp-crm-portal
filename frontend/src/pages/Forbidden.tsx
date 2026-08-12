import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Forbidden: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
      <div className="text-center" style={{ maxWidth: '480px' }}>
        <div className="rounded-3 d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px', background: '#fef2f2', color: '#ef4444' }}>
          <ShieldAlert size={44} />
        </div>
        <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '3rem', letterSpacing: '-0.03em' }}>403</h1>
        <h2 className="fw-bold text-dark mb-2" style={{ fontSize: '1.4rem' }}>Access Forbidden</h2>
        <p className="text-muted mb-4" style={{ fontSize: '0.925rem', lineHeight: 1.6 }}>
          You do not have permission to access this page.
          {user?.role
            ? ` Your role (${user.role}) does not grant access to this module.`
            : ' Please sign in with an account that has the required role.'}
        </p>
        <div className="d-flex justify-content-center gap-2 flex-wrap">
          <Link to="/dashboard" className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2 fw-semibold" style={{ borderRadius: '8px', backgroundColor: '#2563eb', borderColor: '#2563eb', fontSize: '0.9rem' }}>
            <LayoutDashboard size={16} /> Go to Dashboard
          </Link>
          <button onClick={() => window.history.back()} className="btn btn-light border d-inline-flex align-items-center gap-2 px-4 py-2 fw-semibold" style={{ borderRadius: '8px', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
};