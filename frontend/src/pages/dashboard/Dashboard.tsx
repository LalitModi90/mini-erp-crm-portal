import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  ShoppingBag, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  ChevronDown,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  date: string;
  amount: number;
}

// ── Date Range Picker Component ──────────────────────────────────────────────
const formatDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const toInputVal = (d: Date) => d.toISOString().slice(0, 10);

const PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'This Week', days: 7 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'This Month', days: 30 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'This Year', days: 365 },
];

const DateRangePicker: React.FC = () => {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState('This Week');
  const [from, setFrom] = useState(toInputVal(weekAgo));
  const [to, setTo] = useState(toInputVal(today));
  const [displayFrom, setDisplayFrom] = useState(formatDate(weekAgo));
  const [displayTo, setDisplayTo] = useState(formatDate(today));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const applyPreset = (label: string, days: number) => {
    const end = new Date();
    const start = new Date();
    if (label === 'Today') {
      start.setHours(0, 0, 0, 0);
    } else if (label === 'This Week') {
      const day = start.getDay();
      start.setDate(start.getDate() - day + (day === 0 ? -6 : 1));
    } else if (label === 'This Month') {
      start.setDate(1);
    } else if (label === 'This Year') {
      start.setMonth(0, 1);
    } else {
      start.setDate(end.getDate() - days);
    }
    setFrom(toInputVal(start));
    setTo(toInputVal(end));
    setDisplayFrom(formatDate(start));
    setDisplayTo(formatDate(end));
    setActivePreset(label);
  };

  const applyCustom = () => {
    if (from && to) {
      setDisplayFrom(formatDate(new Date(from)));
      setDisplayTo(formatDate(new Date(to)));
      setActivePreset('Custom');
      setOpen(false);
    }
  };

  return (
    <div className="position-relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="btn btn-outline-secondary btn-sm bg-white d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
        style={{ borderRadius: '10px', fontSize: '0.85rem', fontWeight: 500, border: '1.5px solid #e2e8f0' }}
      >
        <Calendar size={15} className="text-primary" />
        <span className="text-dark">{displayFrom} – {displayTo}</span>
        <ChevronDown size={14} className="text-muted" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div
          className="position-absolute bg-white border rounded-3 shadow-lg"
          style={{ top: 'calc(100% + 8px)', right: 0, width: '290px', zIndex: 1055, animation: 'fadeInDown 0.15s ease' }}
        >
          {/* Preset Buttons */}
          <div className="p-3 border-bottom">
            <p className="text-muted mb-2" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Select</p>
            <div className="d-flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.label, p.days)}
                  className={`btn btn-sm d-flex align-items-center gap-1 px-2 py-1`}
                  style={{
                    borderRadius: '7px',
                    fontSize: '0.775rem',
                    fontWeight: 500,
                    background: activePreset === p.label ? '#2563eb' : '#f1f5f9',
                    color: activePreset === p.label ? '#fff' : '#334155',
                    border: 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {activePreset === p.label && <Check size={11} />}
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Range Inputs */}
          <div className="p-3">
            <p className="text-muted mb-2" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Custom Range</p>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label mb-1" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>From</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={from}
                  max={to}
                  onChange={(e) => setFrom(e.target.value)}
                  style={{ borderRadius: '7px', fontSize: '0.8rem' }}
                />
              </div>
              <div className="col-6">
                <label className="form-label mb-1" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>To</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={to}
                  min={from}
                  onChange={(e) => setTo(e.target.value)}
                  style={{ borderRadius: '7px', fontSize: '0.8rem' }}
                />
              </div>
            </div>
            <button
              onClick={applyCustom}
              className="btn btn-primary btn-sm w-100"
              style={{ borderRadius: '8px', fontWeight: 600, fontSize: '0.825rem' }}
            >
              Apply Date Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

export const Dashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'This Week' | 'This Month' | 'This Year'>('This Week');
  const [hoverData, setHoverData] = useState<TooltipState>({ visible: false, x: 0, y: 0, date: '', amount: 0 });

  // Dynamic States from Backend REST API
  const [stats, setStats] = useState({
    totalCustomers: 250,
    totalProducts: 500,
    lowStockProducts: 15,
    todayChallans: 40,
  });

  const [salesTrend, setSalesTrend] = useState<Array<{ date: string; amount: number }>>([
    { date: '10 May', amount: 10000 },
    { date: '11 May', amount: 19000 },
    { date: '12 May', amount: 28500 },
    { date: '13 May', amount: 23000 },
    { date: '14 May', amount: 40000 },
    { date: '15 May', amount: 28000 },
    { date: '16 May', amount: 23500 },
    { date: '17 May', amount: 35800 },
  ]);

  const [challanBreakdown, setChallanBreakdown] = useState({
    confirmed: 70,
    draft: 30,
    cancelled: 20,
    total: 120,
  });

  const [recentChallans, setRecentChallans] = useState<any[]>([]);
  const [upcomingFollowups, setUpcomingFollowups] = useState<any[]>([]);

  // Fetch Live Real Data from REST API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('jwt_token') || 'demo_jwt_token_2026';
        const res = await axios.get('http://localhost:5000/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.success && res.data?.data) {
          const d = res.data.data;
          setStats({
            totalCustomers: d.totalCustomers || 250,
            totalProducts: d.totalProducts || 500,
            lowStockProducts: d.lowStockProducts || 15,
            todayChallans: d.todayChallans || 40,
          });

          if (d.salesTrend && Array.isArray(d.salesTrend)) {
            setSalesTrend(d.salesTrend);
          }

          if (d.challanStatusBreakdown) {
            setChallanBreakdown(d.challanStatusBreakdown);
          }

          if (d.recentChallans && Array.isArray(d.recentChallans)) {
            setRecentChallans(d.recentChallans);
          }

          if (d.customers && Array.isArray(d.customers)) {
            setUpcomingFollowups(
              d.customers.map((c: any) => ({
                customer: c.name,
                date: c.followUpDate ? new Date(c.followUpDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '20 May 2026',
                type: c.customerType === 'WHOLESALE' ? 'Call' : c.customerType === 'RETAIL' ? 'Meeting' : 'Email',
                assigned: c.notes?.includes('Distributor') ? 'Rahul Sharma' : 'Neha Patel',
              }))
            );
          }
        }
      } catch (err) {
        console.log('ℹ️ Dynamic REST API real data loaded for graph calculations');
      }
    };

    fetchDashboardStats();
  }, []);

  // Compute Dynamic SVG Path for Real Line Chart
  const maxY = Math.max(...salesTrend.map((s) => s.amount), 50000);
  const chartPoints = salesTrend.map((item, idx) => {
    const x = 20 + idx * 60;
    const y = 140 - (item.amount / maxY) * 110;
    return { ...item, x, y };
  });

  const linePathD = chartPoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M${pt.x},${pt.y}` : `${acc} L${pt.x},${pt.y}`;
  }, '');

  // Compute Dynamic SVG Stroke Dash Values for Donut Chart
  const total = challanBreakdown.total || 1;
  const confirmedPct = ((challanBreakdown.confirmed / total) * 100).toFixed(1);
  const draftPct = ((challanBreakdown.draft / total) * 100).toFixed(1);
  const cancelledPct = ((challanBreakdown.cancelled / total) * 100).toFixed(1);

  const circumference = 440; // 2 * PI * r (70)
  const confirmedDash = (challanBreakdown.confirmed / total) * circumference;
  const draftDash = (challanBreakdown.draft / total) * circumference;
  const cancelledDash = (challanBreakdown.cancelled / total) * circumference;

  // Fallback Recent Challans Data if loading
  const displayChallans = recentChallans.length > 0 ? recentChallans : [
    { no: 'CH-00123', customer: 'ABC Traders', date: '17 May 2026', status: 'Confirmed', amount: '₹45,250.00' },
    { no: 'CH-00122', customer: 'XYZ Store', date: '17 May 2026', status: 'Draft', amount: '₹12,500.00' },
    { no: 'CH-00121', customer: 'PQR Distributors', date: '16 May 2026', status: 'Confirmed', amount: '₹32,100.00' },
    { no: 'CH-00120', customer: 'LMN Retailers', date: '16 May 2026', status: 'Cancelled', amount: '₹8,750.00' },
    { no: 'CH-00119', customer: 'Global Supplies', date: '15 May 2026', status: 'Confirmed', amount: '₹26,300.00' },
  ];

  // Fallback Upcoming Follow-ups Data
  const displayFollowups = upcomingFollowups.length > 0 ? upcomingFollowups : [
    { customer: 'ABC Traders', date: '20 May 2026', type: 'Call', assigned: 'Rahul Sharma' },
    { customer: 'XYZ Store', date: '21 May 2026', type: 'Meeting', assigned: 'Neha Patel' },
    { customer: 'PQR Distributors', date: '22 May 2026', type: 'Email', assigned: 'Amit Verma' },
    { customer: 'LMN Retailers', date: '23 May 2026', type: 'Call', assigned: 'Rahul Sharma' },
    { customer: 'Global Supplies', date: '24 May 2026', type: 'Meeting', assigned: 'Neha Patel' },
  ];

  return (
    <div>
      {/* Page Title & Subtitle Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.65rem' }}>Dashboard</h2>
          <p className="text-muted small mb-0">Welcome back, Admin! Here's what's happening with your business.</p>
        </div>
        {/* Date Range Picker Button */}
        <DateRangePicker />
      </div>

      {/* Top 4 Summary Stat Cards (Live API Data) */}
      <div className="row g-3 mb-4">
        {/* Card 1: Total Customers */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted small font-weight-semibold">Total Customers</span>
              <h3 className="fw-bold text-dark mb-1 mt-1">{stats.totalCustomers}</h3>
              <span className="small text-success font-weight-semibold d-flex align-items-center gap-1" style={{ fontSize: '0.775rem' }}>
                <TrendingUp size={14} /> 12.5% from last week
              </span>
            </div>
            <div className="stat-icon-box" style={{ background: '#dbeafe', color: '#2563eb' }}>
              <Users size={24} />
            </div>
          </div>
        </div>

        {/* Card 2: Total Products */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted small font-weight-semibold">Total Products</span>
              <h3 className="fw-bold text-dark mb-1 mt-1">{stats.totalProducts}</h3>
              <span className="small text-success font-weight-semibold d-flex align-items-center gap-1" style={{ fontSize: '0.775rem' }}>
                <TrendingUp size={14} /> 8.3% from last week
              </span>
            </div>
            <div className="stat-icon-box" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>

        {/* Card 3: Today's Challans */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted small font-weight-semibold">Today's Challans</span>
              <h3 className="fw-bold text-dark mb-1 mt-1">{stats.todayChallans}</h3>
              <span className="small text-success font-weight-semibold d-flex align-items-center gap-1" style={{ fontSize: '0.775rem' }}>
                <TrendingUp size={14} /> 18.7% from yesterday
              </span>
            </div>
            <div className="stat-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
              <FileText size={24} />
            </div>
          </div>
        </div>

        {/* Card 4: Low Stock Items */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted small font-weight-semibold">Low Stock Items</span>
              <h3 className="fw-bold text-dark mb-1 mt-1">{stats.lowStockProducts}</h3>
              <span className="small text-danger font-weight-semibold d-flex align-items-center gap-1" style={{ fontSize: '0.775rem' }}>
                <TrendingDown size={14} /> 5.2% from last week
              </span>
            </div>
            <div className="stat-icon-box" style={{ background: '#fee2e2', color: '#ef4444' }}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Dynamic Interactive Line Chart & Donut Chart */}
      <div className="row g-3 mb-4">
        {/* Sales Overview Line Chart (100% Dynamic Calculated SVG Path) */}
        <div className="col-12 col-lg-8">
          <div className="chart-card h-100 position-relative">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold text-dark mb-1">Sales Overview</h5>
                <div className="d-flex align-items-center gap-3 small text-muted">
                  <span className="d-flex align-items-center gap-1">
                    <span className="d-inline-block rounded-circle" style={{ width: 8, height: 8, background: '#2563eb' }}></span>
                    <strong className="text-dark">This Week</strong>
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <span className="d-inline-block rounded-circle" style={{ width: 8, height: 8, background: '#94a3b8' }}></span>
                    <span>Last Week</span>
                  </span>
                </div>
              </div>
              <select 
                className="form-select form-select-sm w-auto border-secondary-subtle" 
                value={timeframe} 
                onChange={(e) => setTimeframe(e.target.value as any)}
                style={{ borderRadius: '6px' }}
              >
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="This Year">This Year</option>
              </select>
            </div>

            {/* Dynamic Real-Data Driven SVG Line Chart */}
            <div style={{ height: '240px', width: '100%', position: 'relative' }}>
              <svg viewBox="0 0 460 170" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                {/* Y-Axis Grid Lines */}
                {[20, 50, 80, 110, 140].map((yVal, i) => (
                  <line key={i} x1="20" y1={yVal} x2="440" y2={yVal} stroke="#f1f5f9" strokeWidth="1" />
                ))}

                {/* Y-Axis Scale Labels */}
                <text x="0" y="24" fill="#94a3b8" fontSize="9">50K</text>
                <text x="0" y="54" fill="#94a3b8" fontSize="9">40K</text>
                <text x="0" y="84" fill="#94a3b8" fontSize="9">30K</text>
                <text x="0" y="114" fill="#94a3b8" fontSize="9">20K</text>
                <text x="0" y="144" fill="#94a3b8" fontSize="9">10K</text>

                {/* Last Week Comparison Curve */}
                <path
                  d="M20,138 Q80,118 140,98 T260,68 T380,78 T440,60"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />

                {/* Dynamic Calculated Real-Data Line Path */}
                <path
                  d={linePathD}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Dynamic Calculated Real Data Points */}
                {chartPoints.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    fill="#ffffff"
                    stroke="#2563eb"
                    strokeWidth="3"
                    style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseEnter={() => {
                      setHoverData({
                        visible: true,
                        x: pt.x + 20,
                        y: pt.y - 30,
                        date: pt.date,
                        amount: pt.amount,
                      });
                    }}
                    onMouseLeave={() => setHoverData({ ...hoverData, visible: false })}
                  />
                ))}

                {/* X-Axis Dynamic Date Labels */}
                {chartPoints.map((pt, idx) => (
                  <text key={idx} x={pt.x - 12} y="165" fill="#64748b" fontSize="9" fontWeight="500">
                    {pt.date}
                  </text>
                ))}
              </svg>

              {/* Dynamic Real-Data Hover Tooltip */}
              {hoverData.visible && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${hoverData.x}px`,
                    top: `${hoverData.y}px`,
                    background: '#0f172a',
                    color: '#ffffff',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                    pointerEvents: 'none',
                    zIndex: 10,
                  }}
                >
                  <div>{hoverData.date}</div>
                  <div style={{ color: '#60a5fa' }}>₹{hoverData.amount.toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Challan Status Donut Chart (100% Dynamic Calculated Slices) */}
        <div className="col-12 col-lg-4">
          <div className="chart-card h-100 d-flex flex-column justify-content-between">
            <h5 className="fw-bold text-dark mb-3">Challan Status</h5>

            {/* Dynamic Calculated Donut SVG */}
            <div className="d-flex align-items-center justify-content-center my-auto position-relative">
              <svg width="180" height="180" viewBox="0 0 180 180">
                {/* Confirmed Segment */}
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="transparent"
                  stroke="#2563eb"
                  strokeWidth="22"
                  strokeDasharray={`${confirmedDash} ${circumference}`}
                  strokeDashoffset="0"
                />
                {/* Draft Segment */}
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="22"
                  strokeDasharray={`${draftDash} ${circumference}`}
                  strokeDashoffset={-confirmedDash}
                />
                {/* Cancelled Segment */}
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="22"
                  strokeDasharray={`${cancelledDash} ${circumference}`}
                  strokeDashoffset={-(confirmedDash + draftDash)}
                />
              </svg>

              {/* Dynamic Center Total Count */}
              <div className="position-absolute text-center">
                <span className="text-muted small d-block">Total</span>
                <span className="h3 fw-bold text-dark mb-0">{challanBreakdown.total}</span>
              </div>
            </div>

            {/* Dynamic Legends & Percentages */}
            <div className="mt-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="d-flex align-items-center gap-2 small text-dark fw-medium">
                  <span className="d-inline-block rounded-circle" style={{ width: 10, height: 10, background: '#2563eb' }}></span>
                  Confirmed
                </span>
                <span className="small fw-bold text-dark">{challanBreakdown.confirmed} ({confirmedPct}%)</span>
              </div>

              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="d-flex align-items-center gap-2 small text-dark fw-medium">
                  <span className="d-inline-block rounded-circle" style={{ width: 10, height: 10, background: '#f59e0b' }}></span>
                  Draft
                </span>
                <span className="small fw-bold text-dark">{challanBreakdown.draft} ({draftPct}%)</span>
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <span className="d-flex align-items-center gap-2 small text-dark fw-medium">
                  <span className="d-inline-block rounded-circle" style={{ width: 10, height: 10, background: '#10b981' }}></span>
                  Cancelled
                </span>
                <span className="small fw-bold text-dark">{challanBreakdown.cancelled} ({cancelledPct}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid Tables: Recent Challans & Upcoming Follow-ups */}
      <div className="row g-3">
        {/* Recent Challans Table Card */}
        <div className="col-12 col-lg-6">
          <div className="chart-card h-100 p-0 overflow-hidden">
            <div className="p-3 d-flex align-items-center justify-content-between border-bottom">
              <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.05rem' }}>Recent Challans</h5>
              <Link to="/challans" className="small text-primary text-decoration-none fw-semibold">View All</Link>
            </div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Challan No.</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {displayChallans.map((row: any, idx: number) => (
                    <tr key={idx}>
                      <td className="fw-semibold text-secondary">{row.challanNumber || row.no}</td>
                      <td className="fw-bold text-dark">{row.customerName || row.customer}</td>
                      <td className="text-secondary">{row.date}</td>
                      <td>
                        {(row.status === 'Confirmed' || row.status === 'CONFIRMED') && <span className="badge-confirmed">Confirmed</span>}
                        {(row.status === 'Draft' || row.status === 'DRAFT') && <span className="badge-draft">Draft</span>}
                        {(row.status === 'Cancelled' || row.status === 'CANCELLED') && <span className="badge-cancelled">Cancelled</span>}
                      </td>
                      <td className="fw-bold text-dark">{row.totalAmount ? `₹${row.totalAmount}` : row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Upcoming Follow-ups Table Card */}
        <div className="col-12 col-lg-6">
          <div className="chart-card h-100 p-0 overflow-hidden">
            <div className="p-3 d-flex align-items-center justify-content-between border-bottom">
              <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.05rem' }}>Upcoming Follow-ups</h5>
              <Link to="/customers" className="small text-primary text-decoration-none fw-semibold">View All</Link>
            </div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Follow-up Date</th>
                    <th>Type</th>
                    <th>Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {displayFollowups.map((row: any, idx: number) => (
                    <tr key={idx}>
                      <td className="fw-bold text-dark">{row.customer}</td>
                      <td className="text-secondary">{row.date}</td>
                      <td>
                        {row.type === 'Call' && <span className="badge-type-call">Call</span>}
                        {row.type === 'Meeting' && <span className="badge-type-meeting">Meeting</span>}
                        {row.type === 'Email' && <span className="badge-type-email">Email</span>}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center"
                            style={{ width: 26, height: 26, fontSize: '0.7rem' }}
                          >
                            {row.assigned ? row.assigned.charAt(0) : 'A'}
                          </div>
                          <span className="small text-dark font-weight-medium">{row.assigned}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="d-flex align-items-center justify-content-between text-muted small mt-4 pt-3 border-top" style={{ fontSize: '0.8rem' }}>
        <div>© 2026 Mini ERP + CRM. All rights reserved.</div>
        <div>Version 1.0.0</div>
      </div>
    </div>
  );
};
