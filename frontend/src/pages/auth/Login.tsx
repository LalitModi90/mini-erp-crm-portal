import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  BarChart3, 
  ShieldCheck, 
  User, 
  Boxes, 
  FileText, 
  Eye, 
  EyeOff, 
  Monitor, 
  PackageCheck 
} from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS'>('ADMIN');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS') => {
    setSelectedRole(role);
    const emails: Record<string, string> = {
      ADMIN: 'admin@erp.com',
      SALES: 'sales@erp.com',
      WAREHOUSE: 'warehouse@erp.com',
      ACCOUNTS: 'accounts@erp.com',
    };
    setEmail(emails[role]);
    setPassword('password123');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    const finalEmail = email || `${selectedRole.toLowerCase()}@erp.com`;
    const finalPassword = password || 'password123';
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email: finalEmail,
        password: finalPassword,
      });
      const data = res.data?.data;
      const newToken = data?.token || '';
      const newUser = {
        id: data?.user?.id || `usr-${selectedRole.toLowerCase()}-1`,
        name: data?.user?.name || `${selectedRole} User`,
        email: data?.user?.email || finalEmail,
        role: data?.user?.role || selectedRole,
      };
      login(newToken, newUser);
      if (newToken) {
        localStorage.setItem('jwt_token', newToken);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setErrorMessage('Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap' }}>
        
        {/* Left Side - Hero / Illustration Section */}
        <div
          style={{
            flex: '1 1 500px',
            background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
            padding: '4rem 3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
              Mini ERP <span style={{ color: '#2563eb' }}>+ CRM</span>
            </h1>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
              Operations Portal
            </h2>
            <div style={{ width: '45px', height: '4px', background: '#2563eb', borderRadius: '2px', marginBottom: '2rem' }} />

            <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, maxWidth: '440px' }}>
              Manage your customers, products, inventory, sales, and follow-ups all in one place. Simplify your business operations.
            </p>
          </div>

          {/* Graphic Artwork */}
          <div style={{ marginTop: '3rem', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
                width: '100%',
                maxWidth: '420px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Monitor size={22} color="#2563eb" />
                  <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>Realtime Analytics</span>
                </div>
                <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>
                  Active
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1, background: '#f1f5f9', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Daily Revenue</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>₹48,500</div>
                </div>
                <div style={{ flex: 1, background: '#f1f5f9', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Pending Challans</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2563eb' }}>12 Drafts</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#16a34a' }}>
                <PackageCheck size={16} /> Inventory Stock Ledger Verified
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div
          style={{
            flex: '1 1 500px',
            background: '#ffffff',
            padding: '4rem 3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ width: '100%', maxWidth: '420px' }}>
            
            {/* Logo Icon */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '64px',
                  height: '64px',
                  background: '#2563eb',
                  borderRadius: '18px',
                  color: '#ffffff',
                  boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
                  marginBottom: '1.25rem',
                }}
              >
                <BarChart3 size={34} />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                Welcome Back!
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.925rem', margin: 0 }}>
                Sign in to continue to your account
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    color: '#0f172a',
                    outline: 'none',
                    background: '#ffffff',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.75rem 0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                      color: '#0f172a',
                      outline: 'none',
                      background: '#ffffff',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#475569' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ borderRadius: '4px', accentColor: '#2563eb' }}
                  />
                  Remember me
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                  Forgot Password?
                </a>
              </div>

              {errorMessage && (
                <div style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.7rem 0.9rem', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 500 }}>
                  {errorMessage}
                </div>
              )}

              {/* Primary Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.25)',
                  transition: 'background 0.2s',
                }}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>

            {/* OR Divider */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: '#94a3b8', fontSize: '0.8rem' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ padding: '0 1rem', fontWeight: 600 }}>OR DEMO ROLES</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            {/* Quick Role Selector Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {[
                { key: 'ADMIN', label: 'Admin', icon: ShieldCheck, color: '#2563eb' },
                { key: 'SALES', label: 'Sales', icon: User, color: '#16a34a' },
                { key: 'WAREHOUSE', label: 'Warehouse', icon: Boxes, color: '#d97706' },
                { key: 'ACCOUNTS', label: 'Accounts', icon: FileText, color: '#9333ea' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = selectedRole === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleRoleSelect(item.key as any)}
                    style={{
                      padding: '0.6rem 0.25rem',
                      borderRadius: '8px',
                      border: isSelected ? `2px solid ${item.color}` : '1px solid #e2e8f0',
                      background: isSelected ? 'rgba(37, 99, 235, 0.05)' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? item.color : '#475569',
                    }}
                  >
                    <Icon size={16} color={item.color} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '2.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
              © 2026 Mini ERP + CRM. All rights reserved.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
