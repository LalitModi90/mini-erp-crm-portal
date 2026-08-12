import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MENU_ACCESS, hasRole } from '../config/roles';
import { 
  BarChart3, 
  LayoutDashboard, 
  Users, 
  Package, 
  Boxes, 
  FileText, 
  UserCheck, 
  Settings, 
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/inventory', label: 'Inventory', icon: Boxes },
    { path: '/challans', label: 'Sales Challans', icon: FileText },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/users', label: 'Users', icon: UserCheck },
    { path: '/settings', label: 'Settings', icon: Settings },
  ].filter((item) => hasRole(user?.role, MENU_ACCESS[item.path] || []));

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // best-effort; token is cleared regardless
    }
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className={`app-sidebar${isOpen ? '' : ' sidebar-mini'}`}>
      {/* Brand Header */}
      <NavLink to="/dashboard" className="brand-link">
        <div className="brand-logo-icon">
          <BarChart3 size={24} />
        </div>
        <div className="brand-text">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
            Mini ERP <span style={{ color: '#60a5fa' }}>+ CRM</span>
          </h2>
          <span style={{ fontSize: '0.725rem', color: '#94a3b8', display: 'block' }}>Operations Portal</span>
        </div>
      </NavLink>

      {/* Navigation Menu */}
      <div className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              data-label={item.label}
              className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              <span className="nav-link-label">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Logout Footer Button */}
      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          data-label="Logout"
          className="nav-link-custom border-0 bg-transparent w-100 text-start"
          style={{ cursor: 'pointer' }}
        >
          <LogOut size={18} color="#ef4444" style={{ flexShrink: 0 }} />
          <span className="nav-link-label" style={{ color: '#ef4444', fontWeight: 600 }}>Logout</span>
        </button>
      </div>
    </aside>
  );
};
