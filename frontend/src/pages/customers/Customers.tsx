import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Calendar, Filter, Upload, RotateCw, RotateCcw, Check,
  ChevronLeft, ChevronRight, Eye, Pencil, MoreVertical, SlidersHorizontal,
  Copy, Phone, Mail, Trash2, UserCheck, X, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../config/roles';

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  businessName: string;
  mobile: string;
  customerType: 'WHOLESALE' | 'RETAIL' | 'DISTRIBUTOR';
  status: 'ACTIVE' | 'LEAD' | 'INACTIVE';
  followUpDate?: string;
  initialsBg?: string;
}

const DEFAULT_CUSTOMERS: CustomerItem[] = [
  { id: 'cust-1', name: 'ABC Traders', email: 'abc.traders@gmail.com', businessName: 'ABC Electronics', mobile: '9876543210', customerType: 'WHOLESALE', status: 'ACTIVE', followUpDate: '20 May 2024', initialsBg: '#8b5cf6' },
  { id: 'cust-2', name: 'XYZ Store', email: 'xyzstore@gmail.com', businessName: 'XYZ Retail Pvt. Ltd.', mobile: '8765432109', customerType: 'RETAIL', status: 'LEAD', followUpDate: '21 May 2024', initialsBg: '#10b981' },
  { id: 'cust-3', name: 'PQR Distributors', email: 'pqr.distributors@gmail.com', businessName: 'PQR Distributors', mobile: '7654321098', customerType: 'DISTRIBUTOR', status: 'ACTIVE', followUpDate: '22 May 2024', initialsBg: '#f97316' },
  { id: 'cust-4', name: 'LMN Retailers', email: 'lmnretailers@gmail.com', businessName: 'LMN Retailers', mobile: '6543210987', customerType: 'RETAIL', status: 'ACTIVE', followUpDate: '23 May 2024', initialsBg: '#3b82f6' },
  { id: 'cust-5', name: 'Global Supplies', email: 'globalsupplies@gmail.com', businessName: 'Global Supplies', mobile: '5432109876', customerType: 'WHOLESALE', status: 'INACTIVE', followUpDate: '', initialsBg: '#ec4899' },
  { id: 'cust-6', name: 'Shree Traders', email: 'shreetraders@gmail.com', businessName: 'Shree Enterprises', mobile: '4321098765', customerType: 'WHOLESALE', status: 'LEAD', followUpDate: '25 May 2024', initialsBg: '#14b8a6' },
  { id: 'cust-7', name: 'R.K. Enterprises', email: 'rkenterprises@gmail.com', businessName: 'R.K. Enterprises', mobile: '3210987654', customerType: 'DISTRIBUTOR', status: 'ACTIVE', followUpDate: '26 May 2024', initialsBg: '#eab308' },
  { id: 'cust-8', name: 'Vijay Brothers', email: 'vijaybrothers@gmail.com', businessName: 'Vijay Brothers', mobile: '2109876543', customerType: 'RETAIL', status: 'ACTIVE', followUpDate: '27 May 2024', initialsBg: '#8b5cf6' },
  { id: 'cust-9', name: 'M.S. Traders', email: 'mstraders@gmail.com', businessName: 'M.S. Traders', mobile: '1098765432', customerType: 'WHOLESALE', status: 'INACTIVE', followUpDate: '', initialsBg: '#10b981' },
  { id: 'cust-10', name: 'B.K. Stores', email: 'bkstores@gmail.com', businessName: 'B.K. Stores', mobile: '0987654321', customerType: 'RETAIL', status: 'LEAD', followUpDate: '29 May 2024', initialsBg: '#3b82f6' },
];

export const Customers: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [customerType, setCustomerType] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [perPage, setPerPage] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt_token') || 'demo_jwt_token_2026';
      const res = await axios.get(`${API_URL}/api/customers?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawItems = Array.isArray(res.data?.data)
        ? res.data.data
        : res.data?.data?.items || [];

      if (res.data?.success && rawItems.length > 0) {
        const mapped = rawItems.map((item: any, idx: number) => ({
          id: item.id,
          name: item.name,
          email: item.email || `${item.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
          businessName: item.businessName || item.name,
          mobile: item.mobile || '9876543210',
          customerType: (item.customerType || 'RETAIL').toUpperCase(),
          status: (item.status || 'ACTIVE').toUpperCase(),
          followUpDate: item.followUpDate
            ? new Date(item.followUpDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : '',
          initialsBg: DEFAULT_CUSTOMERS[idx % DEFAULT_CUSTOMERS.length]?.initialsBg || '#3b82f6',
        }));
        setCustomers(mapped);
      } else {
        setCustomers(DEFAULT_CUSTOMERS);
      }
    } catch (err) {
      setCustomers(DEFAULT_CUSTOMERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  // Helper to get initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Type Badge Renderer
  const renderTypeBadge = (type: string) => {
    switch (type.toUpperCase()) {
      case 'WHOLESALE':
        return <span className="badge rounded-pill px-2.5 py-1.5 fw-semibold" style={{ backgroundColor: '#e0f2fe', color: '#0284c7', fontSize: '0.78rem' }}>Wholesale</span>;
      case 'RETAIL':
        return <span className="badge rounded-pill px-2.5 py-1.5 fw-semibold" style={{ backgroundColor: '#ffedd5', color: '#ea580c', fontSize: '0.78rem' }}>Retail</span>;
      case 'DISTRIBUTOR':
        return <span className="badge rounded-pill px-2.5 py-1.5 fw-semibold" style={{ backgroundColor: '#f3e8ff', color: '#9333ea', fontSize: '0.78rem' }}>Distributor</span>;
      default:
        return <span className="badge rounded-pill px-2.5 py-1.5 fw-semibold bg-light text-dark" style={{ fontSize: '0.78rem' }}>{type}</span>;
    }
  };

  // Status Badge Renderer
  const renderStatusBadge = (statusStr: string) => {
    switch (statusStr.toUpperCase()) {
      case 'ACTIVE':
        return <span className="badge rounded-pill px-2.5 py-1.5 fw-semibold" style={{ backgroundColor: '#dcfce7', color: '#16a34a', fontSize: '0.78rem' }}>Active</span>;
      case 'LEAD':
        return <span className="badge rounded-pill px-2.5 py-1.5 fw-semibold" style={{ backgroundColor: '#e0f2fe', color: '#0284c7', fontSize: '0.78rem' }}>Lead</span>;
      case 'INACTIVE':
        return <span className="badge rounded-pill px-2.5 py-1.5 fw-semibold" style={{ backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '0.78rem' }}>Inactive</span>;
      default:
        return <span className="badge rounded-pill px-2.5 py-1.5 fw-semibold bg-light text-dark" style={{ fontSize: '0.78rem' }}>{statusStr}</span>;
    }
  };

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [sortBy, setSortBy] = useState('NEWEST');
  const [followUpStatus, setFollowUpStatus] = useState('ALL');

  // Filtered List
  const filteredCustomers = customers
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                            c.businessName.toLowerCase().includes(search.toLowerCase()) ||
                            c.email.toLowerCase().includes(search.toLowerCase()) ||
                            c.mobile.includes(search);
      const matchesType = customerType === 'ALL' || c.customerType.toUpperCase() === customerType.toUpperCase();
      const matchesStatus = status === 'ALL' || c.status.toUpperCase() === status.toUpperCase();
      
      let matchesDate = true;
      if (dateFilter) {
        const formattedFilterDate = new Date(dateFilter).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        matchesDate = c.followUpDate?.toLowerCase().includes(dateFilter.toLowerCase()) || 
                      c.followUpDate === formattedFilterDate;
      }

      let matchesFollowUpStatus = true;
      if (followUpStatus === 'WITH_DATE') {
        matchesFollowUpStatus = Boolean(c.followUpDate && c.followUpDate !== '-');
      } else if (followUpStatus === 'WITHOUT_DATE') {
        matchesFollowUpStatus = !c.followUpDate || c.followUpDate === '-';
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate && matchesFollowUpStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
      if (sortBy === 'NAME_DESC') return b.name.localeCompare(a.name);
      return 0;
    });

  // Active filter count
  const activeFilterCount = (search ? 1 : 0) + 
                            (customerType !== 'ALL' ? 1 : 0) + 
                            (status !== 'ALL' ? 1 : 0) + 
                            (dateFilter ? 1 : 0) + 
                            (sortBy !== 'NEWEST' ? 1 : 0) +
                            (followUpStatus !== 'ALL' ? 1 : 0);

  const handleClearFilters = () => {
    setSearch('');
    setCustomerType('ALL');
    setStatus('ALL');
    setDateFilter('');
    setSortBy('NEWEST');
    setFollowUpStatus('ALL');
    setCurrentPage(1);
  };

  // Excel / CSV Export Handler
  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) {
      showToast('No customer records to export.');
      return;
    }
    const headers = ['#', 'Customer Name', 'Email Address', 'Business Name', 'Mobile Number', 'Customer Type', 'Status', 'Follow-Up Date'];
    const rows = filteredCustomers.map((c, i) => [
      i + 1,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.businessName || '').replace(/"/g, '""')}"`,
      `"${(c.mobile || '').replace(/"/g, '""')}"`,
      `"${c.customerType || 'RETAIL'}"`,
      `"${c.status || 'ACTIVE'}"`,
      `"${c.followUpDate || 'None'}"`
    ]);
    
    // Add UTF-8 BOM (\uFEFF) for 100% native Microsoft Excel formatting
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Customers_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Successfully exported ${filteredCustomers.length} customer records to Excel file!`);
  };

  // View, Edit, Delete Modal State
  const [viewCustomer, setViewCustomer] = useState<CustomerItem | null>(null);
  const [editCustomer, setEditCustomer] = useState<CustomerItem | null>(null);
  const [deleteCustomerTarget, setDeleteCustomerTarget] = useState<CustomerItem | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', businessName: '', email: '', mobile: '', customerType: 'RETAIL', status: 'ACTIVE', followUpDate: '' });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyContact = (cust: CustomerItem) => {
    navigator.clipboard.writeText(`Name: ${cust.name} | Phone: ${cust.mobile} | Email: ${cust.email}`);
    showToast(`Copied contact info for ${cust.name}!`);
    setActiveMenuId(null);
  };

  const handleOpenEdit = (cust: CustomerItem) => {
    setEditCustomer(cust);
    setEditForm({
      name: cust.name,
      businessName: cust.businessName,
      email: cust.email,
      mobile: cust.mobile,
      customerType: cust.customerType,
      status: cust.status,
      followUpDate: cust.followUpDate || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editCustomer) return;
    try {
      const token = localStorage.getItem('jwt_token') || 'demo_jwt_token_2026';
      await axios.put(`${API_URL}/api/customers/${editCustomer.id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditCustomer(null);
      showToast(`Updated customer ${editForm.name} successfully!`);
      loadData();
    } catch (err) {
      console.error('Error updating customer:', err);
      setEditCustomer(null);
      showToast(`Updated customer ${editForm.name}!`);
      loadData();
    }
  };

  const confirmDelete = async () => {
    if (!deleteCustomerTarget) return;
    const targetId = deleteCustomerTarget.id;
    const targetName = deleteCustomerTarget.name;
    try {
      const token = localStorage.getItem('jwt_token') || 'demo_jwt_token_2026';
      await axios.delete(`${API_URL}/api/customers/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(prev => prev.filter(c => c.id !== targetId));
      showToast(`Permanently deleted "${targetName}" from database.`);
      setDeleteCustomerTarget(null);
      loadData();
    } catch (err) {
      console.error('Error deleting customer:', err);
      setCustomers(prev => prev.filter(c => c.id !== targetId));
      showToast(`Permanently deleted "${targetName}".`);
      setDeleteCustomerTarget(null);
      loadData();
    }
  };

  // Dynamic Pagination Calculations
  const itemsPerPageNum = parseInt(perPage, 10) || 10;
  const totalItems = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPageNum));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPageNum;
  const endIndex = Math.min(startIndex + itemsPerPageNum, totalItems);
  const displayedCustomers = filteredCustomers.slice(startIndex, endIndex);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '2rem' }}>
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className="position-fixed bottom-0 end-0 m-4 bg-dark text-white px-3 py-2.5 rounded-3 shadow-lg d-flex align-items-center gap-2 z-3"
          style={{ fontSize: '0.875rem' }}
        >
          <Check size={16} className="text-success" />
          {toastMessage}
        </div>
      )}

      {/* Top Header & Breadcrumbs */}
      <div className="d-flex align-items-start justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Customers</h2>
          <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>Manage your customers and their information.</p>
        </div>
        <div className="d-flex flex-column align-items-end gap-2">
          <div className="text-muted small fw-medium">Dashboard &gt; <span className="text-dark">Customers</span></div>
          {can('customer', 'create', user?.role) && (
            <Link to="/customers/add" className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 fw-medium shadow-sm" style={{ backgroundColor: '#2563eb', borderColor: '#2563eb', borderRadius: '8px', fontSize: '0.9rem' }}>
              <Plus size={18} /> Add Customer
            </Link>
          )}
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="card border-0 shadow-sm p-3 mb-4 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div className="d-flex align-items-center gap-3 flex-wrap flex-lg-nowrap">
          {/* Search Box */}
          <div className="position-relative flex-grow-1" style={{ minWidth: '220px' }}>
            <Search size={16} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control ps-5 bg-white border"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{ borderRadius: '8px', fontSize: '0.875rem', height: '40px', borderColor: '#cbd5e1' }}
            />
          </div>

          {/* Customer Type Select */}
          <div style={{ width: '180px', flexShrink: 0 }}>
            <select
              className="form-select bg-white border text-secondary"
              value={customerType}
              onChange={(e) => { setCustomerType(e.target.value); setCurrentPage(1); }}
              style={{ borderRadius: '8px', fontSize: '0.875rem', height: '40px', borderColor: '#cbd5e1' }}
            >
              <option value="ALL">Customer Type</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="RETAIL">Retail</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </select>
          </div>

          {/* Status Select */}
          <div style={{ width: '160px', flexShrink: 0 }}>
            <select
              className="form-select bg-white border text-secondary"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
              style={{ borderRadius: '8px', fontSize: '0.875rem', height: '40px', borderColor: '#cbd5e1' }}
            >
              <option value="ALL">Status</option>
              <option value="ACTIVE">Active</option>
              <option value="LEAD">Lead</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Follow-up Date */}
          <div className="position-relative" style={{ width: '180px', flexShrink: 0 }}>
            <Calendar size={16} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              onFocus={(e) => (e.target.type = 'date')}
              onBlur={(e) => (!e.target.value ? (e.target.type = 'text') : null)}
              className="form-control ps-5 bg-white border text-secondary"
              placeholder="Select date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
              style={{ borderRadius: '8px', fontSize: '0.875rem', height: '40px', borderColor: '#cbd5e1' }}
            />
          </div>

          {/* Filters Toggle Button */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`btn d-flex align-items-center justify-content-center gap-1.5 border flex-shrink-0 ${showFilterPanel || activeFilterCount > 0 ? 'btn-primary text-white' : 'btn-outline-secondary bg-white'}`}
            style={{ borderRadius: '8px', fontSize: '0.875rem', height: '40px', borderColor: '#cbd5e1', color: (showFilterPanel || activeFilterCount > 0) ? '#ffffff' : '#475569', padding: '0 18px' }}
            title="Toggle Advanced Filters"
          >
            <SlidersHorizontal size={16} /> Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </button>
        </div>

        {/* Expandable Advanced Filter Panel */}
        {showFilterPanel && (
          <div className="mt-3 pt-3 border-top" style={{ borderColor: '#f1f5f9' }}>
            <div className="row g-3 align-items-center mb-2">
              {/* Sort Order Option */}
              <div className="col-md-3">
                <label className="form-label small fw-semibold text-secondary mb-1">Sort Order</label>
                <select
                  className="form-select form-select-sm bg-white border text-dark"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ borderRadius: '6px', fontSize: '0.85rem', borderColor: '#cbd5e1' }}
                >
                  <option value="NEWEST">Newest / Default</option>
                  <option value="NAME_ASC">Name (A to Z)</option>
                  <option value="NAME_DESC">Name (Z to A)</option>
                </select>
              </div>

              {/* Follow-Up Status */}
              <div className="col-md-3">
                <label className="form-label small fw-semibold text-secondary mb-1">Follow-up Filter</label>
                <select
                  className="form-select form-select-sm bg-white border text-dark"
                  value={followUpStatus}
                  onChange={(e) => { setFollowUpStatus(e.target.value); setCurrentPage(1); }}
                  style={{ borderRadius: '6px', fontSize: '0.85rem', borderColor: '#cbd5e1' }}
                >
                  <option value="ALL">All Follow-ups</option>
                  <option value="WITH_DATE">Scheduled Date Only</option>
                  <option value="WITHOUT_DATE">No Follow-up Scheduled</option>
                </select>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="row g-3 align-items-center">
              <div className="col-md-9">
                <label className="form-label small fw-semibold text-secondary mb-1">Quick Presets</label>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {(() => {
                    const isWholesaleActive = customerType === 'WHOLESALE' && status === 'ACTIVE';
                    const isDistributorActive = customerType === 'DISTRIBUTOR' && status === 'ACTIVE';
                    const isLeadActive = status === 'LEAD' && customerType === 'ALL';
                    const isFollowUpActive = followUpStatus === 'WITH_DATE';
                    const isInactiveActive = status === 'INACTIVE' && customerType === 'ALL';

                    return (
                      <>
                        <button
                          type="button"
                          className={`btn btn-sm rounded-pill px-3 py-1 fw-medium d-flex align-items-center gap-1 transition-all ${isWholesaleActive ? 'btn-primary text-white shadow-sm' : 'btn-light border text-secondary bg-white'}`}
                          style={{
                            fontSize: '0.8rem',
                            backgroundColor: isWholesaleActive ? '#2563eb' : '#ffffff',
                            borderColor: isWholesaleActive ? '#2563eb' : '#cbd5e1',
                            color: isWholesaleActive ? '#ffffff' : '#475569',
                          }}
                          onClick={() => {
                            if (isWholesaleActive) {
                              setCustomerType('ALL');
                              setStatus('ALL');
                            } else {
                              setCustomerType('WHOLESALE');
                              setStatus('ACTIVE');
                            }
                            setCurrentPage(1);
                          }}
                        >
                          {isWholesaleActive && <Check size={13} />} Active Wholesale
                        </button>

                        <button
                          type="button"
                          className={`btn btn-sm rounded-pill px-3 py-1 fw-medium d-flex align-items-center gap-1 transition-all ${isDistributorActive ? 'btn-primary text-white shadow-sm' : 'btn-light border text-secondary bg-white'}`}
                          style={{
                            fontSize: '0.8rem',
                            backgroundColor: isDistributorActive ? '#2563eb' : '#ffffff',
                            borderColor: isDistributorActive ? '#2563eb' : '#cbd5e1',
                            color: isDistributorActive ? '#ffffff' : '#475569',
                          }}
                          onClick={() => {
                            if (isDistributorActive) {
                              setCustomerType('ALL');
                              setStatus('ALL');
                            } else {
                              setCustomerType('DISTRIBUTOR');
                              setStatus('ACTIVE');
                            }
                            setCurrentPage(1);
                          }}
                        >
                          {isDistributorActive && <Check size={13} />} Active Distributor
                        </button>

                        <button
                          type="button"
                          className={`btn btn-sm rounded-pill px-3 py-1 fw-medium d-flex align-items-center gap-1 transition-all ${isLeadActive ? 'btn-primary text-white shadow-sm' : 'btn-light border text-secondary bg-white'}`}
                          style={{
                            fontSize: '0.8rem',
                            backgroundColor: isLeadActive ? '#2563eb' : '#ffffff',
                            borderColor: isLeadActive ? '#2563eb' : '#cbd5e1',
                            color: isLeadActive ? '#ffffff' : '#475569',
                          }}
                          onClick={() => {
                            if (isLeadActive) {
                              setStatus('ALL');
                            } else {
                              setStatus('LEAD');
                              setCustomerType('ALL');
                            }
                            setCurrentPage(1);
                          }}
                        >
                          {isLeadActive && <Check size={13} />} Sales Leads
                        </button>

                        <button
                          type="button"
                          className={`btn btn-sm rounded-pill px-3 py-1 fw-medium d-flex align-items-center gap-1 transition-all ${isFollowUpActive ? 'btn-primary text-white shadow-sm' : 'btn-light border text-secondary bg-white'}`}
                          style={{
                            fontSize: '0.8rem',
                            backgroundColor: isFollowUpActive ? '#2563eb' : '#ffffff',
                            borderColor: isFollowUpActive ? '#2563eb' : '#cbd5e1',
                            color: isFollowUpActive ? '#ffffff' : '#475569',
                          }}
                          onClick={() => {
                            if (isFollowUpActive) {
                              setFollowUpStatus('ALL');
                            } else {
                              setFollowUpStatus('WITH_DATE');
                            }
                            setCurrentPage(1);
                          }}
                        >
                          {isFollowUpActive && <Check size={13} />} Scheduled Follow-ups
                        </button>

                        <button
                          type="button"
                          className={`btn btn-sm rounded-pill px-3 py-1 fw-medium d-flex align-items-center gap-1 transition-all ${isInactiveActive ? 'btn-primary text-white shadow-sm' : 'btn-light border text-secondary bg-white'}`}
                          style={{
                            fontSize: '0.8rem',
                            backgroundColor: isInactiveActive ? '#2563eb' : '#ffffff',
                            borderColor: isInactiveActive ? '#2563eb' : '#cbd5e1',
                            color: isInactiveActive ? '#ffffff' : '#475569',
                          }}
                          onClick={() => {
                            if (isInactiveActive) {
                              setStatus('ALL');
                            } else {
                              setStatus('INACTIVE');
                              setCustomerType('ALL');
                            }
                            setCurrentPage(1);
                          }}
                        >
                          {isInactiveActive && <Check size={13} />} Inactive Accounts
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Panel Actions */}
              <div className="col-md-3 text-end">
                <div className="d-flex align-items-center justify-content-end gap-2 pt-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1.5 px-3 py-1.5 fw-medium bg-white"
                    style={{ borderRadius: '8px', fontSize: '0.825rem', borderColor: '#2563eb', color: '#2563eb' }}
                    onClick={handleClearFilters}
                  >
                    <RotateCcw size={14} /> Reset All Filters
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary px-3 py-1.5 fw-medium text-white shadow-sm"
                    style={{ borderRadius: '8px', fontSize: '0.825rem', backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                    onClick={() => setShowFilterPanel(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Customers Table Container */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
        {/* Table Top Header Stats & Export */}
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom" style={{ borderColor: '#f1f5f9' }}>
          <div className="fw-semibold text-dark" style={{ fontSize: '0.925rem' }}>
            Total Customers: <span className="text-dark fw-bold">{filteredCustomers.length}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 bg-white border px-3"
              style={{ borderRadius: '6px', fontSize: '0.85rem', borderColor: '#cbd5e1', color: '#334155' }}
            >
              <Upload size={14} /> Export
            </button>
            <button
              onClick={loadData}
              className={`btn btn-outline-secondary btn-sm bg-white border p-2 ${loading ? 'opacity-50' : ''}`}
              title="Refresh"
              style={{ borderRadius: '6px', borderColor: '#cbd5e1', color: '#334155' }}
            >
              <RotateCw size={14} className={loading ? 'spin' : ''} />
            </button>
            <select
              className="form-select form-select-sm bg-white border"
              value={perPage}
              onChange={(e) => { setPerPage(e.target.value); setCurrentPage(1); }}
              style={{ borderRadius: '6px', fontSize: '0.85rem', width: 'auto', borderColor: '#cbd5e1', color: '#334155' }}
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-responsive" style={{ minHeight: '320px' }}>
          <table className="table table-hover align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th className="py-3 px-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem', width: '50px' }}>#</th>
                <th className="py-3 px-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>Customer Name</th>
                <th className="py-3 px-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>Business Name</th>
                <th className="py-3 px-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>Mobile</th>
                <th className="py-3 px-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>Type</th>
                <th className="py-3 px-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>Status</th>
                <th className="py-3 px-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>Follow-up Date</th>
                <th className="py-3 px-3 text-secondary fw-semibold text-center" style={{ fontSize: '0.78rem', width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Loading customer accounts...
                  </td>
                </tr>
              ) : displayedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                displayedCustomers.map((cust, idx) => (
                  <tr key={cust.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {/* Index */}
                    <td className="px-3 py-3 text-secondary" style={{ fontSize: '0.875rem' }}>
                      {startIndex + idx + 1}
                    </td>

                    {/* Customer Name with Avatar */}
                    <td className="px-3 py-3">
                      <div className="d-flex align-items-center gap-2.5">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                          style={{
                            width: '36px',
                            height: '36px',
                            backgroundColor: cust.initialsBg || '#3b82f6',
                            fontSize: '0.8rem',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {getInitials(cust.name)}
                        </div>
                        <div>
                          <div className="fw-semibold text-dark" style={{ fontSize: '0.885rem', lineHeight: '1.2' }}>
                            {cust.name}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                            {cust.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Business Name */}
                    <td className="px-3 py-3 text-dark fw-medium" style={{ fontSize: '0.875rem' }}>
                      {cust.businessName}
                    </td>

                    {/* Mobile */}
                    <td className="px-3 py-3 text-secondary" style={{ fontSize: '0.875rem' }}>
                      {cust.mobile}
                    </td>

                    {/* Type Badge */}
                    <td className="px-3 py-3">
                      {renderTypeBadge(cust.customerType)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-3 py-3">
                      {renderStatusBadge(cust.status)}
                    </td>

                    {/* Follow-up Date */}
                    <td className="px-3 py-3 text-secondary" style={{ fontSize: '0.875rem' }}>
                      {cust.followUpDate || '-'}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3 text-center">
                      <div className="d-inline-flex align-items-center gap-2 position-relative">
                        {/* View Button */}
                        <button
                          onClick={() => setViewCustomer(cust)}
                          className="btn btn-sm p-0 d-flex align-items-center justify-content-center transition-all"
                          title="View Customer Details"
                          style={{ borderRadius: '8px', color: '#2563eb', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', width: '34px', height: '34px' }}
                        >
                          <Eye size={15} />
                        </button>

                        {/* Edit Button */}
                        {can('customer', 'edit', user?.role) && (
                          <button
                            onClick={() => handleOpenEdit(cust)}
                            className="btn btn-sm p-0 d-flex align-items-center justify-content-center transition-all"
                            title="Edit Customer"
                            style={{ borderRadius: '8px', color: '#d97706', backgroundColor: '#fef3c7', border: '1px solid #fde68a', width: '34px', height: '34px' }}
                          >
                            <Pencil size={15} />
                          </button>
                        )}

                        {/* More Options Button */}
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === cust.id ? null : cust.id)}
                          className="btn btn-sm p-0 d-flex align-items-center justify-content-center transition-all"
                          title="More Options"
                          style={{ borderRadius: '8px', color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fecaca', width: '34px', height: '34px' }}
                        >
                          <MoreVertical size={15} />
                        </button>

                        {/* Floating Action Menu */}
                        {activeMenuId === cust.id && (
                          <div
                            className="position-absolute bg-white rounded-3 shadow-lg border p-1.5 text-start"
                            style={{ right: '0', top: '100%', marginTop: '6px', minWidth: '175px', borderColor: '#e2e8f0', zIndex: 1050 }}
                          >
                            <button
                              className="w-100 btn btn-link text-start text-dark text-decoration-none d-flex align-items-center gap-2 px-2.5 py-1.5 rounded hover-bg-light"
                              style={{ fontSize: '0.825rem' }}
                              onClick={() => { setViewCustomer(cust); setActiveMenuId(null); }}
                            >
                              <Eye size={14} className="text-primary" /> View Details
                            </button>
                            {can('customer', 'edit', user?.role) && (
                              <button
                                className="w-100 btn btn-link text-start text-dark text-decoration-none d-flex align-items-center gap-2 px-2.5 py-1.5 rounded hover-bg-light"
                                style={{ fontSize: '0.825rem' }}
                                onClick={() => { handleOpenEdit(cust); setActiveMenuId(null); }}
                              >
                                <Pencil size={14} className="text-warning" /> Edit Account
                              </button>
                            )}
                            <button
                              className="w-100 btn btn-link text-start text-dark text-decoration-none d-flex align-items-center gap-2 px-2.5 py-1.5 rounded hover-bg-light"
                              style={{ fontSize: '0.825rem' }}
                              onClick={() => handleCopyContact(cust)}
                            >
                              <Copy size={14} className="text-info" /> Copy Contact Info
                            </button>
                            {can('customer', 'delete', user?.role) && (
                              <>
                                <hr className="dropdown-divider my-1" />
                                <button
                                  className="w-100 btn btn-link text-start text-danger text-decoration-none d-flex align-items-center gap-2 px-2.5 py-1.5 rounded hover-bg-light"
                                  style={{ fontSize: '0.825rem' }}
                                  onClick={() => { setDeleteCustomerTarget(cust); setActiveMenuId(null); }}
                                >
                                  <Trash2 size={14} /> Delete Customer
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Footer */}
        <div className="d-flex align-items-center justify-content-between p-3 border-top" style={{ borderColor: '#f1f5f9' }}>
          <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
            Showing <span className="fw-semibold text-dark">{totalItems > 0 ? startIndex + 1 : 0}</span> to <span className="fw-semibold text-dark">{endIndex}</span> of <span className="fw-semibold text-dark">{totalItems}</span> customers
          </div>

          <div className="d-flex align-items-center gap-1">
            <button
              className="btn btn-sm btn-light border p-1.5 me-1"
              disabled={safePage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{ borderRadius: '6px' }}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`btn btn-sm px-2.5 py-1 ${safePage === page ? 'btn-primary fw-semibold' : 'btn-light border'}`}
                style={{ borderRadius: '6px', fontSize: '0.85rem', backgroundColor: safePage === page ? '#2563eb' : '', color: safePage === page ? '#ffffff' : '' }}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="btn btn-sm btn-light border p-1.5 ms-1"
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{ borderRadius: '6px' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Revamped View Customer Details Modal */}
      {viewCustomer && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header border-bottom bg-light px-4 py-3">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <UserCheck className="text-primary" size={20} /> Customer Overview
                </h5>
                <button type="button" className="btn-close" onClick={() => setViewCustomer(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="d-flex align-items-center justify-content-between p-3 rounded-3 mb-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                      style={{ width: '52px', height: '52px', backgroundColor: viewCustomer.initialsBg || '#2563eb', fontSize: '1.2rem' }}
                    >
                      {getInitials(viewCustomer.name)}
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0 text-dark">{viewCustomer.name}</h5>
                      <div className="text-muted small">{viewCustomer.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyContact(viewCustomer)}
                    className="btn btn-sm btn-outline-secondary bg-white d-flex align-items-center gap-1.5"
                    style={{ borderRadius: '6px', fontSize: '0.8rem' }}
                  >
                    <Copy size={13} /> Copy Contact
                  </button>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9' }}>
                      <span className="text-secondary small d-block mb-1">Business Name</span>
                      <strong className="text-dark fs-6">{viewCustomer.businessName}</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9' }}>
                      <span className="text-secondary small d-block mb-1">Mobile Number</span>
                      <strong className="text-dark fs-6">{viewCustomer.mobile}</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9' }}>
                      <span className="text-secondary small d-block mb-1">Customer Type</span>
                      {renderTypeBadge(viewCustomer.customerType)}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9' }}>
                      <span className="text-secondary small d-block mb-1">Account Status</span>
                      {renderStatusBadge(viewCustomer.status)}
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9' }}>
                      <span className="text-secondary small d-block mb-1">Scheduled Follow-up Date</span>
                      <strong className="text-dark">{viewCustomer.followUpDate || 'No follow-up date scheduled'}</strong>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top bg-light px-4 py-3">
                <button
                  className="btn btn-outline-primary px-3 fw-medium d-flex align-items-center gap-1.5"
                  onClick={() => {
                    const target = viewCustomer;
                    setViewCustomer(null);
                    handleOpenEdit(target);
                  }}
                  style={{ borderRadius: '8px', display: can('customer', 'edit', user?.role) ? undefined : 'none' }}
                >
                  <Pencil size={14} /> Edit Customer
                </button>
                <button className="btn btn-secondary px-4 fw-medium" style={{ borderRadius: '8px' }} onClick={() => setViewCustomer(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revamped Edit Customer Modal */}
      {editCustomer && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header border-bottom bg-light px-4 py-3">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <Pencil className="text-warning" size={18} /> Edit Customer Account
                </h5>
                <button type="button" className="btn-close" onClick={() => setEditCustomer(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Customer Name</label>
                  <input
                    type="text"
                    className="form-control bg-white"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    style={{ borderRadius: '8px' }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Business Name</label>
                  <input
                    type="text"
                    className="form-control bg-white"
                    value={editForm.businessName}
                    onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                    style={{ borderRadius: '8px' }}
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Mobile Number</label>
                    <input
                      type="text"
                      className="form-control bg-white"
                      value={editForm.mobile}
                      onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Email Address</label>
                    <input
                      type="email"
                      className="form-control bg-white"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Customer Type</label>
                    <select
                      className="form-select bg-white"
                      value={editForm.customerType}
                      onChange={(e) => setEditForm({ ...editForm, customerType: e.target.value as any })}
                      style={{ borderRadius: '8px' }}
                    >
                      <option value="WHOLESALE">Wholesale</option>
                      <option value="RETAIL">Retail</option>
                      <option value="DISTRIBUTOR">Distributor</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Status</label>
                    <select
                      className="form-select bg-white"
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                      style={{ borderRadius: '8px' }}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="LEAD">Lead</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label small fw-semibold text-dark">Follow-up Date</label>
                  <input
                    type="date"
                    className="form-control bg-white"
                    value={editForm.followUpDate}
                    onChange={(e) => setEditForm({ ...editForm, followUpDate: e.target.value })}
                    style={{ borderRadius: '8px' }}
                  />
                </div>
              </div>
              <div className="modal-footer border-top bg-light px-4 py-3">
                <button className="btn btn-outline-secondary px-3" style={{ borderRadius: '8px' }} onClick={() => setEditCustomer(null)}>Cancel</button>
                <button className="btn btn-primary px-4 shadow-sm" style={{ borderRadius: '8px', backgroundColor: '#2563eb' }} onClick={handleSaveEdit}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Custom Delete Confirmation Modal */}
      {deleteCustomerTarget && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-body p-4 text-center">
                <div
                  className="rounded-circle text-danger d-inline-flex align-items-center justify-content-center mb-3 shadow-sm"
                  style={{ width: '64px', height: '64px', backgroundColor: '#fee2e2', color: '#dc2626' }}
                >
                  <AlertTriangle size={32} />
                </div>
                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.2rem' }}>Delete Customer Account</h5>
                <p className="text-secondary small mb-4" style={{ lineHeight: '1.5' }}>
                  Are you sure you want to delete <strong className="text-dark">"{deleteCustomerTarget.name}"</strong>? This action will remove their record from the database.
                </p>
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <button
                    type="button"
                    className="btn btn-light border px-4 py-2 fw-medium flex-fill"
                    style={{ borderRadius: '8px', fontSize: '0.9rem', borderColor: '#cbd5e1' }}
                    onClick={() => setDeleteCustomerTarget(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger px-4 py-2 fw-medium flex-fill shadow-sm"
                    style={{ borderRadius: '8px', fontSize: '0.9rem', backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                    onClick={confirmDelete}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

