import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../config/roles';
import { Plus, 
  Search, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Eye, 
  Printer, 
  Download,
  Calendar,
  Filter,
  RotateCcw,
  Building2,
  User,
  Phone,
  Tag,
  FileCode,
  Warehouse,
  Package,
  X,
  Check
} from 'lucide-react';

interface ChallanListItem {
  id: string;
  challanNo: string;
  customerName: string;
  dispatchDate: string;
  totalAmount: number;
  status: 'DRAFT' | 'CONFIRMED' | 'DISPATCHED';
  itemCount: number;
  reference?: string;
  businessName?: string;
  gstNumber?: string;
  mobile?: string;
  warehouse?: string;
}

interface ChallanDetailItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
}

const DEFAULT_CHALLANS: ChallanListItem[] = [
  {
    id: 'ch-1',
    challanNo: 'CH-2024-001',
    customerName: 'ABC Traders',
    dispatchDate: '17 May 2024',
    totalAmount: 10762.40,
    status: 'DRAFT',
    itemCount: 3,
    reference: 'PO-9921',
    businessName: 'ABC Electronics Pvt. Ltd.',
    gstNumber: '27ABCDE1234F1Z5',
    mobile: '9876543210',
    warehouse: 'Main Warehouse - Dock A',
  },
  {
    id: 'ch-2',
    challanNo: 'CH-2024-002',
    customerName: 'Apex Retailers',
    dispatchDate: '16 May 2024',
    totalAmount: 24500.00,
    status: 'CONFIRMED',
    itemCount: 8,
    reference: 'PO-8812',
    businessName: 'Apex Digital Store',
    gstNumber: '24APEXD5678G2Z1',
    mobile: '9123456789',
    warehouse: 'West Logistics Hub',
  },
  {
    id: 'ch-3',
    challanNo: 'CH-2024-003',
    customerName: 'Metro Distributors',
    dispatchDate: '14 May 2024',
    totalAmount: 58200.00,
    status: 'DISPATCHED',
    itemCount: 14,
    reference: 'PO-7740',
    businessName: 'Metro Logistics & Distribution',
    gstNumber: '29METRO9988H3Z4',
    mobile: '9988776655',
    warehouse: 'Central Fulfillment Center',
  },
];

const SAMPLE_ITEMS_BY_CHALLAN: Record<string, ChallanDetailItem[]> = {
  'ch-1': [
    { id: '1', name: 'USB Fast Charger 20W', sku: 'CHG001', quantity: 2, unitPrice: 500, discountPercent: 0, taxPercent: 18 },
    { id: '2', name: 'USB Type-C Braided Cable', sku: 'CAB001', quantity: 1, unitPrice: 200, discountPercent: 0, taxPercent: 18 },
    { id: '3', name: 'Power Bank 20000mAh', sku: 'PBK005', quantity: 4, unitPrice: 1800, discountPercent: 5, taxPercent: 18 },
  ],
  'ch-2': [
    { id: '4', name: 'Wireless Ergonomic Mouse', sku: 'MOU009', quantity: 10, unitPrice: 850, discountPercent: 0, taxPercent: 18 },
    { id: '5', name: 'Bluetooth Earphones', sku: 'EAR001', quantity: 10, unitPrice: 1200, discountPercent: 5, taxPercent: 18 },
  ],
  'ch-3': [
    { id: '6', name: 'Smart Fitness Tracker Watch', sku: 'WCH002', quantity: 15, unitPrice: 2499, discountPercent: 10, taxPercent: 18 },
    { id: '7', name: 'Power Bank 20000mAh', sku: 'PBK005', quantity: 10, unitPrice: 1800, discountPercent: 0, taxPercent: 18 },
  ],
};

const DEFAULT_ITEMS: ChallanDetailItem[] = [
  { id: 'd-1', name: 'USB Fast Charger 20W', sku: 'CHG001', quantity: 2, unitPrice: 500, discountPercent: 0, taxPercent: 18 },
  { id: 'd-2', name: 'Bluetooth Earphones', sku: 'EAR001', quantity: 1, unitPrice: 1200, discountPercent: 0, taxPercent: 18 },
];

export const Challans: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [challans, setChallans] = useState<ChallanListItem[]>(DEFAULT_CHALLANS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // View Details Modal State
  const [selectedChallanForView, setSelectedChallanForView] = useState<ChallanListItem | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem('jwt_token') || 'demo_jwt_token_2026';
    const headers = { Authorization: `Bearer ${token}` };

    axios.get('https://mini-erp-crm-portal-wsqe.onrender.com/api/challans', { headers })
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((c: any) => ({
            id: c.id,
            challanNo: c.challanNumber || `CH-2024-${c.id.slice(-3)}`,
            customerName: c.customer?.name || c.customerName || 'ABC Traders',
            dispatchDate: c.dispatchDate ? new Date(c.dispatchDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '17 May 2024',
            totalAmount: c.totalAmount || 10762.40,
            status: c.status || 'DRAFT',
            itemCount: c.items?.length || 3,
            reference: c.reference || 'PO-001',
            businessName: c.customer?.companyName || `${c.customerName || 'Customer'} Pvt. Ltd.`,
            gstNumber: c.customer?.gstNo || '27ABCDE1234F1Z5',
            mobile: c.customer?.phone || '9876543210',
            warehouse: c.dispatchWarehouse || 'Main Warehouse - Dock A',
          }));
          setChallans(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateStatus = (id: string, newStatus: 'DRAFT' | 'CONFIRMED' | 'DISPATCHED') => {
    setChallans(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    if (selectedChallanForView && selectedChallanForView.id === id) {
      setSelectedChallanForView({ ...selectedChallanForView, status: newStatus });
    }
    showToast(`Status updated to ${newStatus} for Challan.`);
  };

  const handlePrintChallan = (c: ChallanListItem) => {
    setSelectedChallanForView(c);
    showToast(`📄 Preparing print view for ${c.challanNo}...`);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const filteredChallans = challans.filter(c => {
    const matchesSearch = c.challanNo.toLowerCase().includes(search.toLowerCase()) ||
                          c.customerName.toLowerCase().includes(search.toLowerCase()) ||
                          (c.reference && c.reference.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalChallansCount = challans.length;
  const draftCount = challans.filter(c => c.status === 'DRAFT').length;
  const confirmedCount = challans.filter(c => c.status === 'CONFIRMED').length;
  const dispatchedCount = challans.filter(c => c.status === 'DISPATCHED').length;

  const currentModalItems = selectedChallanForView ? (SAMPLE_ITEMS_BY_CHALLAN[selectedChallanForView.id] || DEFAULT_ITEMS) : DEFAULT_ITEMS;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* Toast Banner */}
      {toastMessage && (
        <div className="position-fixed bottom-0 end-0 m-4 bg-dark text-white px-3 py-2.5 rounded-3 shadow-lg d-flex align-items-center gap-2 z-3" style={{ fontSize: '0.875rem' }}>
          <CheckCircle2 size={16} className="text-success" />
          {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.6rem', letterSpacing: '-0.02em' }}>
            Sales Challans
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
            Manage delivery challans, customer dispatches, and order fulfillment.
          </p>
        </div>

        {can('challan', 'create', user?.role) && (
          <Link
            to="/challans/create"
            className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2.5 fw-semibold shadow-sm text-decoration-none"
            style={{ borderRadius: '8px', fontSize: '0.875rem', backgroundColor: '#2563eb', border: 'none' }}
          >
            <Plus size={18} /> Create Sales Challan
          </Link>
        )}
      </div>

      {/* KPI Cards (4 Stat Cards) */}
      <div className="row g-3 mb-4">
        {/* Total Challans */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.8rem' }}>Total Challans</span>
                <h3 className="fw-bold text-dark mb-0" style={{ fontSize: '1.5rem' }}>{totalChallansCount}</h3>
              </div>
              <div className="rounded-3 p-2.5 bg-primary-subtle text-primary">
                <FileText size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Drafts */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.8rem' }}>Draft Challans</span>
                <h3 className="fw-bold text-dark mb-0" style={{ fontSize: '1.5rem' }}>{draftCount}</h3>
              </div>
              <div className="rounded-3 p-2.5 bg-secondary-subtle text-secondary">
                <Clock size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Confirmed */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.8rem' }}>Confirmed Orders</span>
                <h3 className="fw-bold text-dark mb-0" style={{ fontSize: '1.5rem' }}>{confirmedCount}</h3>
              </div>
              <div className="rounded-3 p-2.5 bg-info-subtle text-info">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Dispatched */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.8rem' }}>Dispatched</span>
                <h3 className="fw-bold text-dark mb-0" style={{ fontSize: '1.5rem' }}>{dispatchedCount}</h3>
              </div>
              <div className="rounded-3 p-2.5 bg-success-subtle text-success">
                <Truck size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="card border-0 shadow-sm p-3 mb-4 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          {/* Search Box */}
          <div className="position-relative flex-grow-1" style={{ minWidth: '240px' }}>
            <Search size={16} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control ps-5 bg-white border"
              placeholder="Search by Challan #, Customer or Reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ borderRadius: '8px', fontSize: '0.875rem', height: '40px', borderColor: '#cbd5e1' }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ width: '180px', flexShrink: 0 }}>
            <select
              className="form-select bg-white border text-secondary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ borderRadius: '8px', fontSize: '0.875rem', height: '40px', borderColor: '#cbd5e1' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="DISPATCHED">Dispatched</option>
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => { setSearch(''); setStatusFilter('ALL'); }}
            className="btn btn-outline-secondary bg-white d-flex align-items-center gap-1.5 border"
            style={{ borderRadius: '8px', fontSize: '0.875rem', height: '40px', borderColor: '#cbd5e1', color: '#475569' }}
          >
            <RotateCcw size={15} /> Reset
          </button>
        </div>
      </div>

      {/* Challans Table Card */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ backgroundColor: '#f8fafc', fontSize: '0.78rem', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th className="ps-4 py-3 text-secondary">Challan #</th>
                <th className="py-3 text-secondary">Customer Name</th>
                <th className="py-3 text-secondary">Dispatch Date</th>
                <th className="py-3 text-secondary">Reference</th>
                <th className="py-3 text-secondary text-center">Items</th>
                <th className="py-3 text-secondary text-end">Total Amount (₹)</th>
                <th className="py-3 text-secondary text-center">Status</th>
                <th className="pe-4 py-3 text-secondary text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChallans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    No delivery challans found matching your search.
                  </td>
                </tr>
              ) : (
                filteredChallans.map((c) => (
                  <tr key={c.id}>
                    <td className="ps-4 py-3 font-monospace fw-bold text-primary">
                      {c.challanNo}
                    </td>
                    <td className="py-3 fw-semibold text-dark">
                      {c.customerName}
                    </td>
                    <td className="py-3 text-muted small">
                      {c.dispatchDate}
                    </td>
                    <td className="py-3 text-secondary font-monospace small">
                      {c.reference || '-'}
                    </td>
                    <td className="py-3 text-center fw-medium text-dark">
                      {c.itemCount} items
                    </td>
                    <td className="py-3 text-end fw-bold text-dark">
                      ₹ {c.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`badge ${
                        c.status === 'CONFIRMED' ? 'bg-info-subtle text-info border border-info-subtle' :
                        c.status === 'DISPATCHED' ? 'bg-success-subtle text-success border border-success-subtle' :
                        'bg-secondary-subtle text-secondary border border-secondary-subtle'
                      }`} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                        {c.status}
                      </span>
                    </td>
                    <td className="pe-4 py-3 text-end">
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        {/* Eye (View Details) Action Button */}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary p-2 rounded-2 d-inline-flex align-items-center justify-content-center"
                          onClick={() => setSelectedChallanForView(c)}
                          title="View Details"
                          style={{ width: '34px', height: '34px' }}
                        >
                          <Eye size={16} />
                        </button>
                        {/* Printer (Print Challan) Action Button */}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary p-2 rounded-2 d-inline-flex align-items-center justify-content-center"
                          onClick={() => handlePrintChallan(c)}
                          title="Print Challan PDF"
                          style={{ width: '34px', height: '34px' }}
                        >
                          <Printer size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Delivery Challan Details Modal */}
      {selectedChallanForView && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: '840px' }}>
            <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden" style={{ borderRadius: '16px' }}>
              {/* Modal Header */}
              <div className="modal-header border-bottom px-4 py-3.5 bg-white align-items-center justify-content-between">
                <div>
                  <div className="d-flex align-items-center gap-2.5 mb-1 flex-wrap">
                    <h5 className="modal-title fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <FileText className="text-primary" size={22} /> Sales Delivery Challan <span className="text-primary font-monospace">{selectedChallanForView.challanNo}</span>
                    </h5>
                    <span className={`badge ${
                      selectedChallanForView.status === 'CONFIRMED' ? 'bg-info-subtle text-info border border-info-subtle' :
                      selectedChallanForView.status === 'DISPATCHED' ? 'bg-success-subtle text-success border border-success-subtle' :
                      'bg-secondary-subtle text-secondary border border-secondary-subtle'
                    } px-3 py-1.5 rounded-pill fw-bold`} style={{ fontSize: '0.78rem' }}>
                      {selectedChallanForView.status}
                    </span>
                  </div>
                  <span className="text-muted small" style={{ fontSize: '0.8rem' }}>Issued on {selectedChallanForView.dispatchDate}</span>
                </div>
                <button type="button" className="btn-close ms-auto" onClick={() => setSelectedChallanForView(null)}></button>
              </div>

              {/* Modal Body with Generous Padding and Clear Spacing Gaps */}
              <div className="modal-body p-4 bg-slate-50" style={{ backgroundColor: '#f8fafc' }}>
                {/* Customer Details & Dispatch Summary Cards Row */}
                <div className="row g-4 mb-4">
                  {/* Customer Info Card */}
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100 rounded-3 overflow-hidden" style={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                      <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
                        <h6 className="fw-bold text-primary mb-0 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                          <Building2 size={18} /> Customer Details
                        </h6>
                        <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 small fw-semibold">
                          Customer
                        </span>
                      </div>
                      <div className="p-4 bg-white">
                        <div className="d-flex justify-content-between align-items-center py-2.5 border-bottom">
                          <span className="text-secondary small d-flex align-items-center gap-2"><User size={14} className="text-muted" /> Customer Name</span>
                          <strong className="text-dark fw-bold">{selectedChallanForView.customerName}</strong>
                        </div>
                        <div className="d-flex justify-content-between align-items-center py-2.5 border-bottom">
                          <span className="text-secondary small d-flex align-items-center gap-2"><Building2 size={14} className="text-muted" /> Business Name</span>
                          <strong className="text-dark fw-bold">{selectedChallanForView.businessName || `${selectedChallanForView.customerName} Pvt. Ltd.`}</strong>
                        </div>
                        <div className="d-flex justify-content-between align-items-center py-2.5 border-bottom">
                          <span className="text-secondary small d-flex align-items-center gap-2"><FileText size={14} className="text-muted" /> GST Number</span>
                          <strong className="text-dark font-monospace fw-bold bg-light px-2.5 py-1 rounded border" style={{ fontSize: '0.825rem' }}>{selectedChallanForView.gstNumber || '27ABCDE1234F1Z5'}</strong>
                        </div>
                        <div className="d-flex justify-content-between align-items-center py-2.5">
                          <span className="text-secondary small d-flex align-items-center gap-2"><Phone size={14} className="text-muted" /> Mobile Phone</span>
                          <strong className="text-dark fw-bold">{selectedChallanForView.mobile || '9876543210'}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dispatch Summary Card */}
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100 rounded-3 overflow-hidden" style={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                      <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
                        <h6 className="fw-bold text-success mb-0 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                          <Calendar size={18} /> Dispatch Summary
                        </h6>
                        <span className="badge bg-success text-white rounded-pill px-2.5 py-1 small fw-semibold">
                          Logistics
                        </span>
                      </div>
                      <div className="p-4 bg-white">
                        <div className="d-flex justify-content-between align-items-center py-2.5 border-bottom">
                          <span className="text-secondary small d-flex align-items-center gap-2"><Calendar size={14} className="text-muted" /> Dispatch Date</span>
                          <strong className="text-dark fw-bold">{selectedChallanForView.dispatchDate}</strong>
                        </div>
                        <div className="d-flex justify-content-between align-items-center py-2.5 border-bottom">
                          <span className="text-secondary small d-flex align-items-center gap-2"><Tag size={14} className="text-muted" /> Reference No</span>
                          <strong className="text-dark font-monospace fw-semibold">{selectedChallanForView.reference || 'N/A'}</strong>
                        </div>
                        <div className="d-flex justify-content-between align-items-center py-2.5 border-bottom">
                          <span className="text-secondary small d-flex align-items-center gap-2"><Warehouse size={14} className="text-muted" /> Dispatch Warehouse</span>
                          <strong className="text-dark fw-bold">{selectedChallanForView.warehouse || 'Main Warehouse - Dock A'}</strong>
                        </div>
                        <div className="d-flex justify-content-between align-items-center py-2.5">
                          <span className="text-secondary small d-flex align-items-center gap-2"><Package size={14} className="text-muted" /> Total Items</span>
                          <strong className="text-dark fw-bold">{selectedChallanForView.itemCount} items</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Table Section */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: '0.95rem' }}>
                    <Package size={18} className="text-primary" /> Itemized Product List
                  </h6>
                  <span className="badge bg-light text-secondary border px-2.5 py-1 small fw-semibold">
                    {currentModalItems.length} Products Verified
                  </span>
                </div>

                <div className="table-responsive rounded-3 border mb-4 shadow-sm bg-white" style={{ overflow: 'hidden', borderRadius: '12px' }}>
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark text-uppercase small" style={{ backgroundColor: '#1e293b', fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                      <tr>
                        <th className="py-3 px-3" style={{ backgroundColor: '#1e293b' }}>Product</th>
                        <th className="py-3" style={{ backgroundColor: '#1e293b' }}>SKU</th>
                        <th className="py-3 text-end" style={{ backgroundColor: '#1e293b' }}>Unit Price</th>
                        <th className="py-3 text-center" style={{ backgroundColor: '#1e293b' }}>Qty</th>
                        <th className="py-3 text-end px-3" style={{ backgroundColor: '#1e293b' }}>Line Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentModalItems.map((item, idx) => {
                        const lineTotal = item.unitPrice * item.quantity * (1 - item.discountPercent / 100) * (1 + item.taxPercent / 100);
                        return (
                          <tr key={item.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                            <td className="px-3 py-3 fw-semibold text-dark">{item.name}</td>
                            <td>
                              <span className="badge border font-monospace fw-semibold px-2 py-1" style={{ fontSize: '0.78rem', backgroundColor: '#f1f5f9', color: '#334155', borderColor: '#cbd5e1' }}>
                                {item.sku}
                              </span>
                            </td>
                            <td className="text-end fw-medium text-secondary">₹ {item.unitPrice.toFixed(2)}</td>
                            <td className="text-center">
                              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5 fw-bold" style={{ fontSize: '0.85rem' }}>
                                {item.quantity}
                              </span>
                            </td>
                            <td className="text-end px-3 fw-bold text-dark" style={{ fontSize: '0.95rem' }}>₹ {lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Grand Total & Status Actions Dark Banner Card with Generous Padding */}
                <div
                  className="p-4 rounded-3 text-white d-flex align-items-center justify-content-between flex-wrap gap-4 shadow-md mb-2"
                  style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '14px' }}
                >
                  <div>
                    <span className="badge rounded-pill px-3 py-1 small fw-bold mb-2 d-inline-block" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>
                      TOTAL PAYABLE AMOUNT
                    </span>
                    <h2 className="fw-bold mb-0" style={{ color: '#34d399', letterSpacing: '-0.02em' }}>
                      ₹ {selectedChallanForView.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                  </div>

                  {/* Status Toggle Actions */}
                  {can('challan', 'confirm', user?.role) && (
                    <div className="d-flex align-items-center gap-2 bg-slate-800 p-2.5 rounded-3 border border-slate-700" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <span className="small me-1 fw-medium" style={{ color: '#94a3b8' }}>Update Status:</span>
                      <button
                        type="button"
                        className={`btn btn-sm px-3 fw-semibold ${selectedChallanForView.status === 'CONFIRMED' ? 'btn-info text-white' : 'btn-outline-light'}`}
                        onClick={() => handleUpdateStatus(selectedChallanForView.id, 'CONFIRMED')}
                        style={{ borderRadius: '6px' }}
                      >
                        CONFIRMED
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm px-3 fw-semibold ${selectedChallanForView.status === 'DISPATCHED' ? 'btn-success text-white' : 'btn-outline-light'}`}
                        onClick={() => handleUpdateStatus(selectedChallanForView.id, 'DISPATCHED')}
                        style={{ borderRadius: '6px' }}
                      >
                        DISPATCHED
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer with Clear Border and Spacing */}
              <div className="modal-footer border-top bg-white px-4 py-3.5 justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-primary px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-xs"
                  onClick={() => handlePrintChallan(selectedChallanForView)}
                  style={{ borderRadius: '8px', fontSize: '0.875rem' }}
                >
                  <Printer size={16} /> Print Challan PDF
                </button>
                <button
                  type="button"
                  className="btn btn-secondary px-4 py-2 fw-semibold shadow-xs"
                  onClick={() => setSelectedChallanForView(null)}
                  style={{ borderRadius: '8px', fontSize: '0.875rem', backgroundColor: '#64748b', borderColor: '#64748b' }}
                >
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
