import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../utils/auth';
import { 
  Search, UserPlus, Filter, RotateCcw, Edit2, Trash2, Crown, 
  CheckCircle2, XCircle, MoreVertical, Download, Eye, Columns, 
  ChevronLeft, ChevronRight, AlertCircle, Users as UsersIcon, UserCheck, UserX, Shield
} from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  empCode: string;
  phone: string;
  lastLogin: string;
  department: string;
  createdAt?: string;
}

// Strictly using database user accounts

export const Users: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Columns visibility & dropdown
  const [visibleColumns, setVisibleColumns] = useState({
    user: true,
    role: true,
    department: true,
    emailPhone: true,
    status: true,
    lastLogin: true,
    actions: true
  });
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

  // View permissions modal states
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [permissionsUser, setPermissionsUser] = useState<UserItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('SALES');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);

  const getHeaders = () => {
    return getAuthHeaders();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/users', { headers: getHeaders() });
      if (res.data?.success && Array.isArray(res.data.data)) {
        const mapped: UserItem[] = res.data.data.map((u: any, idx: number) => {
          let dept = 'Sales';
          if (u.role === 'ADMIN') dept = 'Administration';
          if (u.role === 'WAREHOUSE') dept = 'Inventory';
          if (u.role === 'ACCOUNTS') dept = 'Accounts';

          return {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            status: 'Active', // DB doesn't have status, default to Active
            empCode: `EMP-${String(idx + 1).padStart(3, '0')}`,
            phone: `98765432${String(idx).padStart(2, '0')}`,
            lastLogin: 'Recently logged in',
            department: dept,
            createdAt: u.createdAt
          };
        });
        setUsers(mapped);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("API Error fetching system users:", err);
      setUsers([]);
      showToast("Error loading users list from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter logic
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.phone.includes(searchQuery);
    const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
    const matchesStatus = selectedStatus === 'ALL' || u.status === selectedStatus;
    const matchesDept = selectedDept === 'ALL' || u.department.toUpperCase() === selectedDept.toUpperCase();
    return matchesSearch && matchesRole && matchesStatus && matchesDept;
  });

  // Pagination index
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRole('ALL');
    setSelectedStatus('ALL');
    setSelectedDept('ALL');
    setCurrentPage(1);
    showToast("Filters reset successfully");
  };

  // CSV Export Action
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      showToast("No data to export");
      return;
    }

    const headers = ['Employee Code', 'Name', 'Email', 'Role', 'Department', 'Phone', 'Status', 'Last Login'];
    const rows = filteredUsers.map(u => [
      u.empCode,
      u.name,
      u.email,
      u.role,
      u.department,
      u.phone,
      u.status,
      u.lastLogin
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV exported successfully!");
  };

  // Add User
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formPassword) {
      alert("Please fill in name, email and password.");
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/users', {
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole
      }, { headers: getHeaders() });

      if (res.data?.success) {
        showToast("User created successfully in database!");
        fetchUsers();
      } else {
        // Fallback local update
        throw new Error("API failed");
      }
    } catch (err: any) {
      console.error("API add user failed:", err);
      const errMsg = err.response?.data?.message || "Failed to add system user. Check permissions.";
      alert(errMsg);
    } finally {
      setShowAddModal(false);
      resetForm();
    }
  };

  // Edit User
  const handleEditOpen = (user: UserItem) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormPassword('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const payload: any = { name: formName, email: formEmail, role: formRole };
      if (formPassword) payload.password = formPassword;

      const res = await axios.put(`http://localhost:5000/api/users/${selectedUser.id}`, payload, { headers: getHeaders() });

      if (res.data?.success) {
        showToast("User updated successfully in database!");
        fetchUsers();
      } else {
        throw new Error("API update failed");
      }
    } catch (err: any) {
      console.error("API edit user failed:", err);
      const errMsg = err.response?.data?.message || "Failed to update user details. Check permissions.";
      alert(errMsg);
    } finally {
      setShowEditModal(false);
      resetForm();
    }
  };

  // Delete User
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await axios.delete(`http://localhost:5000/api/users/${id}`, { headers: getHeaders() });
      if (res.data?.success) {
        showToast("User deleted from database!");
        fetchUsers();
      } else {
        throw new Error("API delete failed");
      }
    } catch (err: any) {
      console.error("API delete user failed:", err);
      const errMsg = err.response?.data?.message || "Failed to delete user. Check permissions.";
      alert(errMsg);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('SALES');
    setFormStatus('Active');
    setSelectedUser(null);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'SALES': return 'Sales Executive';
      case 'WAREHOUSE': return 'Warehouse Staff';
      case 'ACCOUNTS': return 'Accountant';
      default: return role;
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'ADMIN': return { backgroundColor: '#f3e8ff', color: '#7e22ce', borderColor: '#d8b4fe' };
      case 'SALES': return { backgroundColor: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0' };
      case 'WAREHOUSE': return { backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' };
      case 'ACCOUNTS': return { backgroundColor: '#fef3c7', color: '#b45309', borderColor: '#fde68a' };
      default: return { backgroundColor: '#f1f5f9', color: '#475569', borderColor: '#e2e8f0' };
    }
  };

  const getPermissionsForRole = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return [
          { module: 'User Management', read: true, write: true, delete: true },
          { module: 'Challan Creation & Editing', read: true, write: true, delete: true },
          { module: 'Product Catalog Management', read: true, write: true, delete: true },
          { module: 'Inventory Stock Adjustment', read: true, write: true, delete: true },
          { module: 'Customer & Lead CRM', read: true, write: true, delete: true },
          { module: 'Reports & Business Analytics', read: true, write: true, delete: true },
        ];
      case 'SALES':
        return [
          { module: 'User Management', read: false, write: false, delete: false },
          { module: 'Challan Creation & Editing', read: true, write: true, delete: false },
          { module: 'Product Catalog Management', read: true, write: false, delete: false },
          { module: 'Inventory Stock Adjustment', read: false, write: false, delete: false },
          { module: 'Customer & Lead CRM', read: true, write: true, delete: false },
          { module: 'Reports & Business Analytics', read: true, write: false, delete: false },
        ];
      case 'WAREHOUSE':
        return [
          { module: 'User Management', read: false, write: false, delete: false },
          { module: 'Challan Creation & Editing', read: false, write: false, delete: false },
          { module: 'Product Catalog Management', read: true, write: false, delete: false },
          { module: 'Inventory Stock Adjustment', read: true, write: true, delete: false },
          { module: 'Customer & Lead CRM', read: false, write: false, delete: false },
          { module: 'Reports & Business Analytics', read: false, write: false, delete: false },
        ];
      case 'ACCOUNTS':
        return [
          { module: 'User Management', read: false, write: false, delete: false },
          { module: 'Challan Creation & Editing', read: true, write: false, delete: false },
          { module: 'Product Catalog Management', read: true, write: false, delete: false },
          { module: 'Inventory Stock Adjustment', read: false, write: false, delete: false },
          { module: 'Customer & Lead CRM', read: true, write: false, delete: false },
          { module: 'Reports & Business Analytics', read: true, write: false, delete: false },
        ];
      default:
        return [];
    }
  };

  const handleViewPermissions = (user: UserItem) => {
    setPermissionsUser(user);
    setShowPermissionsModal(true);
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-subtle text-purple border-purple-subtle';
      case 'SALES': return 'bg-success-subtle text-success border-success-subtle';
      case 'WAREHOUSE': return 'bg-primary-subtle text-primary border-primary-subtle';
      case 'ACCOUNTS': return 'bg-warning-subtle text-warning border-warning-subtle';
      default: return 'bg-light text-secondary';
    }
  };

  // Stats Counters
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const inactiveUsers = users.filter(u => u.status === 'Inactive').length;
  const adminsCount = users.filter(u => u.role === 'ADMIN').length;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const newUsersCount = users.filter(u => {
    if (!u.createdAt) return false;
    const createdDate = new Date(u.createdAt);
    return createdDate >= thirtyDaysAgo;
  }).length;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Toast banner */}
      {toastMessage && (
        <div className="position-fixed bottom-0 end-0 m-4 bg-dark text-white px-3.5 py-2.5 rounded-3 shadow-lg d-flex align-items-center gap-2 z-3" style={{ fontSize: '0.875rem' }}>
          <CheckCircle2 size={16} className="text-success" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.65rem', letterSpacing: '-0.02em' }}>
            Users
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
            Manage system users and their access permissions.
          </p>
        </div>

        <button 
          className="btn btn-primary d-flex align-items-center gap-2 px-3.5 py-2 fw-semibold shadow-xs"
          style={{ borderRadius: '8px', fontSize: '0.85rem', backgroundColor: '#2563eb', border: '1px solid #2563eb' }}
          onClick={() => { resetForm(); setShowAddModal(true); }}
        >
          <UserPlus size={16} />
          <span>Add User</span>
        </button>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="row g-4 mb-4">
        {/* Card 1: Total Users */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm p-4 rounded-3 h-100 animate-hover" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.78rem' }}>Total Users</span>
                <h3 className="fw-bold text-dark mb-1" style={{ fontSize: '1.65rem', letterSpacing: '-0.02em' }}>{totalUsers}</h3>
                <span className="text-success fw-bold" style={{ fontSize: '0.725rem' }}>
                  {newUsersCount} new <span className="text-secondary fw-normal">in last 30 days</span>
                </span>
              </div>
              <div className="rounded-3 p-2.5 d-flex align-items-center justify-content-center flex-shrink-0" style={{ backgroundColor: '#eff6ff', color: '#2563eb', width: '46px', height: '46px' }}>
                <UsersIcon size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm p-4 rounded-3 h-100 animate-hover" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.78rem' }}>Active Users</span>
                <h3 className="fw-bold text-dark mb-1" style={{ fontSize: '1.65rem', letterSpacing: '-0.02em' }}>{activeUsers}</h3>
                <span className="text-success fw-bold" style={{ fontSize: '0.725rem' }}>
                  {activeUsers} <span className="text-secondary fw-normal">active accounts</span>
                </span>
              </div>
              <div className="rounded-3 p-2.5 d-flex align-items-center justify-content-center flex-shrink-0" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', width: '46px', height: '46px' }}>
                <UserCheck size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Inactive Users */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm p-4 rounded-3 h-100 animate-hover" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.78rem' }}>Inactive Users</span>
                <h3 className="fw-bold text-dark mb-1" style={{ fontSize: '1.65rem', letterSpacing: '-0.02em' }}>{inactiveUsers}</h3>
                <span className="text-secondary fw-bold" style={{ fontSize: '0.725rem' }}>
                  {inactiveUsers} <span className="text-secondary fw-normal">inactive accounts</span>
                </span>
              </div>
              <div className="rounded-3 p-2.5 d-flex align-items-center justify-content-center flex-shrink-0" style={{ backgroundColor: '#fff7ed', color: '#ea580c', width: '46px', height: '46px' }}>
                <UserX size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Admins */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm p-4 rounded-3 h-100 animate-hover" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.78rem' }}>Admins</span>
                <h3 className="fw-bold text-dark mb-1" style={{ fontSize: '1.65rem', letterSpacing: '-0.02em' }}>{adminsCount}</h3>
                <span className="text-primary fw-bold" style={{ fontSize: '0.725rem' }}>
                  {adminsCount} <span className="text-secondary fw-normal">system admin(s)</span>
                </span>
              </div>
              <div className="rounded-3 p-2.5 d-flex align-items-center justify-content-center flex-shrink-0" style={{ backgroundColor: '#f0f9ff', color: '#0284c7', width: '46px', height: '46px' }}>
                <Shield size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card border-0 shadow-sm p-3.5 mb-4 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div className="row g-3 align-items-end">
          {/* Search bar */}
          <div className="col-12 col-md-3">
            <label className="text-muted small mb-1.5 d-block fw-semibold" style={{ fontSize: '0.725rem', letterSpacing: '0.03em' }}>SEARCH USER</label>
            <div className="position-relative">
              <span className="position-absolute start-0 top-50 translate-middle-y ps-3 text-muted">
                <Search size={15} />
              </span>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem', borderRadius: '8px', fontSize: '0.85rem', borderColor: '#cbd5e1' }}
                placeholder="Search by name, email, phone..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="col-12 col-sm-6 col-md-2">
            <label className="text-muted small mb-1.5 d-block fw-semibold" style={{ fontSize: '0.725rem', letterSpacing: '0.03em' }}>ROLE</label>
            <select
              className="form-select"
              style={{ borderRadius: '8px', fontSize: '0.85rem', borderColor: '#cbd5e1' }}
              value={selectedRole}
              onChange={(e) => { setSelectedRole(e.target.value); setCurrentPage(1); }}
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Administrator</option>
              <option value="SALES">Sales Executive</option>
              <option value="WAREHOUSE">Warehouse Staff</option>
              <option value="ACCOUNTS">Accountant</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="col-12 col-sm-6 col-md-2">
            <label className="text-muted small mb-1.5 d-block fw-semibold" style={{ fontSize: '0.725rem', letterSpacing: '0.03em' }}>STATUS</label>
            <select
              className="form-select"
              style={{ borderRadius: '8px', fontSize: '0.85rem', borderColor: '#cbd5e1' }}
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="col-12 col-sm-6 col-md-3">
            <label className="text-muted small mb-1.5 d-block fw-semibold" style={{ fontSize: '0.725rem', letterSpacing: '0.03em' }}>DEPARTMENT</label>
            <select
              className="form-select"
              style={{ borderRadius: '8px', fontSize: '0.85rem', borderColor: '#cbd5e1' }}
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
            >
              <option value="ALL">All Departments</option>
              <option value="Administration">Administration</option>
              <option value="Sales">Sales</option>
              <option value="Inventory">Inventory</option>
              <option value="Accounts">Accounts</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="col-12 col-md-2">
            <button 
              className="btn btn-light border d-flex align-items-center gap-1.5 w-100 py-2 justify-content-center fw-medium shadow-xs"
              style={{ borderRadius: '8px', fontSize: '0.85rem', borderColor: '#cbd5e1', color: '#475569' }}
              onClick={handleResetFilters}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card border-0 shadow-sm rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div className="p-4 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.05rem' }}>Users List</h5>
          
          <div className="d-flex align-items-center gap-2 position-relative">
            <button 
              className="btn btn-sm btn-white border d-flex align-items-center gap-1.5 fw-semibold px-3 py-1.8 text-secondary" 
              style={{ borderRadius: '6px', fontSize: '0.78rem' }}
              onClick={handleExportCSV}
            >
              <Download size={13} /> Export
            </button>
            
            <div className="dropdown position-relative">
              <button 
                className="btn btn-sm btn-white border d-flex align-items-center gap-1.5 fw-semibold px-3 py-1.8 text-secondary" 
                style={{ borderRadius: '6px', fontSize: '0.78rem' }}
                onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
              >
                <Columns size={13} /> Columns
              </button>
              
              {showColumnsDropdown && (
                <div className="dropdown-menu show shadow-lg border-light mt-1 position-absolute end-0 p-3" style={{ borderRadius: '8px', fontSize: '0.825rem', zIndex: 1050, minWidth: '180px' }}>
                  <span className="fw-bold text-secondary mb-2.5 d-block" style={{ fontSize: '0.725rem', letterSpacing: '0.05em' }}>TOGGLE COLUMNS</span>
                  <div className="d-flex flex-column gap-2">
                    <label className="d-flex align-items-center gap-2 text-dark pointer mb-0">
                      <input type="checkbox" checked={visibleColumns.user} onChange={(e) => setVisibleColumns({ ...visibleColumns, user: e.target.checked })} />
                      <span>User Info</span>
                    </label>
                    <label className="d-flex align-items-center gap-2 text-dark pointer mb-0">
                      <input type="checkbox" checked={visibleColumns.role} onChange={(e) => setVisibleColumns({ ...visibleColumns, role: e.target.checked })} />
                      <span>Role Badge</span>
                    </label>
                    <label className="d-flex align-items-center gap-2 text-dark pointer mb-0">
                      <input type="checkbox" checked={visibleColumns.department} onChange={(e) => setVisibleColumns({ ...visibleColumns, department: e.target.checked })} />
                      <span>Department</span>
                    </label>
                    <label className="d-flex align-items-center gap-2 text-dark pointer mb-0">
                      <input type="checkbox" checked={visibleColumns.emailPhone} onChange={(e) => setVisibleColumns({ ...visibleColumns, emailPhone: e.target.checked })} />
                      <span>Email / Phone</span>
                    </label>
                    <label className="d-flex align-items-center gap-2 text-dark pointer mb-0">
                      <input type="checkbox" checked={visibleColumns.status} onChange={(e) => setVisibleColumns({ ...visibleColumns, status: e.target.checked })} />
                      <span>Status</span>
                    </label>
                    <label className="d-flex align-items-center gap-2 text-dark pointer mb-0">
                      <input type="checkbox" checked={visibleColumns.lastLogin} onChange={(e) => setVisibleColumns({ ...visibleColumns, lastLogin: e.target.checked })} />
                      <span>Last Login</span>
                    </label>
                    <label className="d-flex align-items-center gap-2 text-dark pointer mb-0">
                      <input type="checkbox" checked={visibleColumns.actions} onChange={(e) => setVisibleColumns({ ...visibleColumns, actions: e.target.checked })} />
                      <span>Actions Menu</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <select 
              className="form-select form-select-sm" 
              style={{ width: '120px', borderRadius: '6px', fontSize: '0.78rem' }}
              value={usersPerPage}
              onChange={(e) => { setUsersPerPage(Number(e.target.value)); setCurrentPage(1); }}
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead style={{ backgroundColor: '#f8fafc', fontSize: '0.78rem' }}>
              <tr>
                <th className="py-3 px-4 text-secondary" style={{ width: '40px' }}>
                  <input type="checkbox" className="form-check-input" />
                </th>
                {visibleColumns.user && <th className="py-3 text-secondary">User</th>}
                {visibleColumns.role && <th className="py-3 text-secondary">Role</th>}
                {visibleColumns.department && <th className="py-3 text-secondary">Department</th>}
                {visibleColumns.emailPhone && <th className="py-3 text-secondary">Email / Phone</th>}
                {visibleColumns.status && <th className="py-3 text-secondary">Status</th>}
                {visibleColumns.lastLogin && <th className="py-3 text-secondary">Last Login</th>}
                {visibleColumns.actions && <th className="py-3 text-secondary text-end">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={1 + Object.values(visibleColumns).filter(Boolean).length} className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={1 + Object.values(visibleColumns).filter(Boolean).length} className="text-center py-5 text-muted" style={{ fontSize: '0.85rem' }}>
                    <AlertCircle size={20} className="text-muted mb-2 d-block mx-auto" />
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                currentUsers.map((u) => {
                  const initials = u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                  const avatarColor = ['#eff6ff', '#f0fdf4', '#fef3c7', '#f3e8ff', '#fee2e2'][u.name.length % 5];
                  const avatarTextColor = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#dc2626'][u.name.length % 5];
                  const isAdmin = u.role === 'ADMIN';

                  return (
                    <tr key={u.id}>
                      <td className="py-3 px-4">
                        <input type="checkbox" className="form-check-input" />
                      </td>
                      {visibleColumns.user && (
                        <td className="py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center fw-bold font-monospace"
                              style={{ 
                                width: '40px', 
                                height: '40px', 
                                backgroundColor: avatarColor, 
                                color: avatarTextColor,
                                fontSize: '0.9rem',
                                border: '1px solid rgba(0,0,0,0.06)'
                              }}
                            >
                              {initials}
                            </div>
                            <div>
                              <div className="fw-bold text-dark d-flex align-items-center gap-1.5" style={{ fontSize: '0.85rem' }}>
                                <span>{u.name}</span>
                                {isAdmin && <span title="Admin user" className="d-inline-flex"><Crown size={13} className="text-warning fill-warning" /></span>}
                              </div>
                              <div className="text-muted font-monospace" style={{ fontSize: '0.725rem' }}>{u.empCode}</div>
                            </div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.role && (
                        <td className="py-3">
                          <span className="badge border rounded-pill px-2.5 py-1 fw-bold" style={{ fontSize: '0.725rem', ...getRoleBadgeStyle(u.role) }}>
                            {getRoleLabel(u.role)}
                          </span>
                        </td>
                      )}
                      {visibleColumns.department && (
                        <td className="py-3 text-secondary fw-medium" style={{ fontSize: '0.85rem' }}>
                          {u.department}
                        </td>
                      )}
                      {visibleColumns.emailPhone && (
                        <td className="py-3">
                          <div className="text-dark fw-medium" style={{ fontSize: '0.825rem' }}>{u.email}</div>
                          <div className="text-muted small" style={{ fontSize: '0.725rem' }}>{u.phone}</div>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="py-3" style={{ fontSize: '0.85rem' }}>
                          <span className={`d-inline-flex align-items-center gap-1.5 fw-semibold ${u.status === 'Active' ? 'text-success' : 'text-secondary'}`}>
                            <span className="rounded-circle d-inline-block" style={{ width: '8px', height: '8px', backgroundColor: u.status === 'Active' ? '#10b981' : '#94a3b8' }}></span>
                            {u.status}
                          </span>
                        </td>
                      )}
                      {visibleColumns.lastLogin && (
                        <td className="py-3 text-muted" style={{ fontSize: '0.825rem' }}>
                          {u.lastLogin}
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="py-3 text-end">
                          <div className="d-flex align-items-center justify-content-end gap-1.5">
                            <button 
                              className="btn btn-sm btn-light border p-1.5" 
                              style={{ borderRadius: '6px' }} 
                              onClick={() => handleViewPermissions(u)}
                              title="View Permissions"
                            >
                              <Eye size={14} className="text-secondary" />
                            </button>
                            <button className="btn btn-sm btn-light border p-1.5" style={{ borderRadius: '6px' }} onClick={() => handleEditOpen(u)} title="Edit User">
                              <Edit2 size={14} className="text-secondary" />
                            </button>
                            <button className="btn btn-sm btn-light border p-1.5" style={{ borderRadius: '6px' }} onClick={() => handleDeleteUser(u.id)} title="Delete User">
                              <Trash2 size={14} className="text-danger" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-4 border-top d-flex align-items-center justify-content-between flex-wrap gap-3">
          <span className="text-muted" style={{ fontSize: '0.825rem' }}>
            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
          </span>

          <nav>
            <ul className="pagination mb-0 gap-1">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link border rounded-2 p-1.5 d-flex align-items-center justify-content-center" onClick={() => setCurrentPage(currentPage - 1)}>
                  <ChevronLeft size={16} />
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link border rounded-2 px-3 py-1.5 fw-semibold" style={{ fontSize: '0.825rem' }} onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link border rounded-2 p-1.5 d-flex align-items-center justify-content-center" onClick={() => setCurrentPage(currentPage + 1)}>
                  <ChevronRight size={16} />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
              <div className="modal-header border-bottom py-3.5 px-4">
                <h5 className="modal-title fw-bold text-dark" style={{ fontSize: '1.05rem' }}>Create System User</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>

              <form onSubmit={handleAddSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">FULL NAME</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                      placeholder="e.g. Rahul Sharma"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">EMAIL ADDRESS</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                      placeholder="e.g. rahul@company.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">PASSWORD</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                      placeholder="Min 6 characters"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">SYSTEM ROLE</label>
                      <select 
                        className="form-select" 
                        style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value)}
                      >
                        <option value="SALES">Sales Executive</option>
                        <option value="WAREHOUSE">Warehouse Staff</option>
                        <option value="ACCOUNTS">Accountant</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">STATUS</label>
                      <select 
                        className="form-select" 
                        style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as any)}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top py-3.5 px-4 bg-light" style={{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                  <button type="button" className="btn btn-light border px-4 py-2 fw-medium" style={{ borderRadius: '8px', fontSize: '0.85rem' }} onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4 py-2 fw-semibold" style={{ borderRadius: '8px', fontSize: '0.85rem', backgroundColor: '#2563eb' }}>
                    Save User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
              <div className="modal-header border-bottom py-3.5 px-4">
                <h5 className="modal-title fw-bold text-dark" style={{ fontSize: '1.05rem' }}>Edit System User</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">FULL NAME</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">EMAIL ADDRESS</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">NEW PASSWORD (LEAVE BLANK TO KEEP UNCHANGED)</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                      placeholder="Min 6 characters"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">SYSTEM ROLE</label>
                      <select 
                        className="form-select" 
                        style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value)}
                      >
                        <option value="SALES">Sales Executive</option>
                        <option value="WAREHOUSE">Warehouse Staff</option>
                        <option value="ACCOUNTS">Accountant</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">STATUS</label>
                      <select 
                        className="form-select" 
                        style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as any)}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top py-3.5 px-4 bg-light" style={{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                  <button type="button" className="btn btn-light border px-4 py-2 fw-medium" style={{ borderRadius: '8px', fontSize: '0.85rem' }} onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4 py-2 fw-semibold" style={{ borderRadius: '8px', fontSize: '0.85rem', backgroundColor: '#2563eb' }}>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* View Permissions Modal */}
      {showPermissionsModal && permissionsUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
              <div className="modal-header border-bottom py-3.5 px-4">
                <div className="d-flex align-items-center gap-2">
                  <Shield size={18} className="text-primary" />
                  <h5 className="modal-title fw-bold text-dark" style={{ fontSize: '1.05rem' }}>
                    Role Access Permissions
                  </h5>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowPermissionsModal(false)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="p-3 bg-light rounded-3 mb-4 border d-flex align-items-center justify-content-between">
                  <div>
                    <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{permissionsUser.name}</div>
                    <div className="text-muted small">{permissionsUser.email}</div>
                  </div>
                  <div className="text-end">
                    <span className="badge border rounded-pill px-2.5 py-1 fw-bold" style={{ fontSize: '0.725rem', ...getRoleBadgeStyle(permissionsUser.role) }}>
                      {getRoleLabel(permissionsUser.role)}
                    </span>
                    <div className="text-muted small mt-1" style={{ fontSize: '0.7rem' }}>Dept: {permissionsUser.department}</div>
                  </div>
                </div>

                <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.9rem' }}>Permissions Matrix</h6>
                <div className="table-responsive">
                  <table className="table align-middle mb-0 border">
                    <thead style={{ backgroundColor: '#f8fafc', fontSize: '0.78rem' }}>
                      <tr>
                        <th className="py-2.5 px-3 text-secondary">System Module</th>
                        <th className="py-2.5 text-secondary text-center" style={{ width: '100px' }}>Read</th>
                        <th className="py-2.5 text-secondary text-center" style={{ width: '100px' }}>Write / Edit</th>
                        <th className="py-2.5 text-secondary text-center" style={{ width: '100px' }}>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPermissionsForRole(permissionsUser.role).map((perm, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 fw-bold text-dark" style={{ fontSize: '0.825rem' }}>{perm.module}</td>
                          <td className="py-2.5 text-center">
                            {perm.read ? (
                              <span className="text-success fw-bold">✓</span>
                            ) : (
                              <span className="text-danger fw-bold">✗</span>
                            )}
                          </td>
                          <td className="py-2.5 text-center">
                            {perm.write ? (
                              <span className="text-success fw-bold">✓</span>
                            ) : (
                              <span className="text-danger fw-bold">✗</span>
                            )}
                          </td>
                          <td className="py-2.5 text-center">
                            {perm.delete ? (
                              <span className="text-success fw-bold">✓</span>
                            ) : (
                              <span className="text-danger fw-bold">✗</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer border-top py-3 px-4 bg-light" style={{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                <button type="button" className="btn btn-secondary px-4 py-2 fw-semibold" style={{ borderRadius: '8px', fontSize: '0.85rem' }} onClick={() => setShowPermissionsModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
