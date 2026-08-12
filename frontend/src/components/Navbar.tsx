import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, HelpCircle, Search, Package, ShoppingCart, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, sidebarOpen }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      icon: 'stock',
      title: 'Low Stock Alert',
      desc: 'Product "HP LaserJet 1020" is below minimum threshold (5 units remaining).',
      time: '2 min ago',
      read: false,
      color: '#ef4444',
    },
    {
      id: 2,
      icon: 'order',
      title: 'New Challan Created',
      desc: 'Sales Challan #CH-2024-0041 generated for Reliance Industries Ltd.',
      time: '18 min ago',
      read: false,
      color: '#2563eb',
    },
    {
      id: 3,
      icon: 'warning',
      title: 'Backup Reminder',
      desc: 'Scheduled daily backup has not run today. Please trigger a manual backup.',
      time: '1 hr ago',
      read: false,
      color: '#f59e0b',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotif = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);


  const getPageTitle = (path: string) => {
    switch (path) {
      case '/settings':
        return 'Settings';
      case '/customers':
        return 'Customers';
      case '/products':
        return 'Products';
      case '/inventory':
        return 'Inventory';
      case '/challans':
        return 'Sales Challans';
      case '/reports':
        return 'Reports';
      case '/users':
        return 'Users';
      default:
        return 'Dashboard';
    }
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="app-header">
      {/* Left Header Controls */}
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-link text-secondary p-0 border-0"
          title={sidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
          onClick={onToggleSidebar}
          style={{ transition: 'transform 0.2s', transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(90deg)' }}
        >
          <Menu size={22} />
        </button>
        <h4 className="fw-bold text-dark mb-0" style={{ fontSize: '1.1rem' }}>
          {pageTitle}
        </h4>
      </div>

      {/* Right Header Controls & User Profile */}
      <div className="d-flex align-items-center gap-3">
        {/* Header Search Bar */}
        <div className="position-relative d-none d-md-block" style={{ width: '280px' }}>
          <input
            type="text"
            className="form-control form-control-sm pe-4 bg-light border-0"
            placeholder={`Search ${pageTitle.toLowerCase()}...`}
            style={{ borderRadius: '8px', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          />
          <Search
            size={16}
            className="position-absolute text-muted"
            style={{ right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
        </div>

        {/* Notification Bell with Dropdown */}
        <div className="position-relative" ref={notifRef}>
          <button
            className="btn btn-link text-secondary p-1 position-relative border-0"
            title="Notifications"
            onClick={() => setShowNotifDropdown((prev) => !prev)}
            style={{ outline: 'none' }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: '0.625rem', padding: '0.2rem 0.4rem' }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifDropdown && (
            <div
              className="position-absolute shadow-lg border-0 bg-white rounded-3"
              style={{
                top: 'calc(100% + 10px)',
                right: 0,
                width: '360px',
                zIndex: 1055,
                boxShadow: '0 10px 40px rgba(0,0,0,0.13)',
                animation: 'fadeInDown 0.18s ease',
              }}
            >
              {/* Header */}
              <div
                className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom"
                style={{ background: '#f8f9ff', borderRadius: '12px 12px 0 0' }}
              >
                <div className="d-flex align-items-center gap-2">
                  <Bell size={16} className="text-primary" />
                  <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.65rem' }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  className="btn btn-link text-primary p-0"
                  style={{ fontSize: '0.75rem', textDecoration: 'none', fontWeight: 600 }}
                  onClick={markAllRead}
                >
                  Mark all read
                </button>
              </div>

              {/* Notification Items */}
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="text-center py-4 text-muted" style={{ fontSize: '0.85rem' }}>
                    <CheckCircle size={28} className="mb-2 text-success" />
                    <div>All caught up!</div>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="d-flex gap-3 px-3 py-2 border-bottom"
                      style={{
                        background: notif.read ? '#fff' : '#f0f5ff',
                        transition: 'background 0.2s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#e8f0fe')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = notif.read ? '#fff' : '#f0f5ff')
                      }
                    >
                      {/* Icon */}
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: '36px',
                          height: '36px',
                          background: notif.color + '18',
                          marginTop: '2px',
                        }}
                      >
                        {notif.icon === 'stock' && <Package size={16} style={{ color: notif.color }} />}
                        {notif.icon === 'order' && <ShoppingCart size={16} style={{ color: notif.color }} />}
                        {notif.icon === 'warning' && <AlertTriangle size={16} style={{ color: notif.color }} />}
                      </div>

                      {/* Content */}
                      <div className="flex-grow-1 min-w-0">
                        <div
                          className="fw-semibold text-dark"
                          style={{ fontSize: '0.825rem', lineHeight: 1.3 }}
                        >
                          {!notif.read && (
                            <span
                              className="me-1 rounded-circle d-inline-block bg-primary"
                              style={{ width: '6px', height: '6px', verticalAlign: 'middle' }}
                            />
                          )}
                          {notif.title}
                        </div>
                        <div
                          className="text-muted mt-1"
                          style={{ fontSize: '0.775rem', lineHeight: 1.4 }}
                        >
                          {notif.desc}
                        </div>
                        <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                          {notif.time}
                        </div>
                      </div>

                      {/* Dismiss */}
                      <button
                        className="btn btn-link text-muted p-0 flex-shrink-0 align-self-start mt-1"
                        style={{ fontSize: '0.7rem', lineHeight: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotif(notif.id);
                        }}
                        title="Dismiss"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div
                className="text-center py-2"
                style={{ borderRadius: '0 0 12px 12px', background: '#f8f9ff' }}
              >
                <button
                  className="btn btn-link text-primary p-0"
                  style={{ fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}
                  onClick={() => setShowNotifDropdown(false)}
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Circle */}
        <button className="btn btn-link text-secondary p-1 border-0" title="Help & Support">
          <HelpCircle size={20} />
        </button>

        <div className="vr bg-secondary-subtle" style={{ height: '24px' }}></div>

        {/* User Profile Card */}
        <div className="d-flex align-items-center gap-2.5">
          <div
            className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
            style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', fontSize: '0.9rem' }}
          >
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <div className="text-dark font-weight-bold" style={{ fontSize: '0.875rem', lineHeight: 1.2 }}>
              {user?.name || 'Admin User'}
            </div>
            <div className="text-muted" style={{ fontSize: '0.725rem' }}>
              {user?.role === 'ADMIN' ? 'Administrator' : user?.role || 'Sales Manager'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

