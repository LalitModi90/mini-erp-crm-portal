import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, ShoppingBag, FileText, AlertTriangle,
  TrendingUp, TrendingDown, Calendar, ChevronDown,
  Check, RefreshCw, AlertCircle, BarChart2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../services/api';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartTooltip, Legend,
  PieChart, Pie, Cell, Tooltip as PieTooltip,
} from 'recharts';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtRupee = (v: number) =>
  '\u20B9 ' + v.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const toISO = (d: Date) => d.toISOString().slice(0, 10);

const fmtDisplay = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── Date Range Presets ────────────────────────────────────────────────────────
interface RangePreset { label: string; getRange: () => { from: Date; to: Date } }

const buildPresets = (): RangePreset[] => {
  const now = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  return [
    {
      label: 'Today',
      getRange: () => ({ from: today, to: now }),
    },
    {
      label: 'This Week',
      getRange: () => {
        const start = new Date(today);
        const day = start.getDay() || 7;
        start.setDate(start.getDate() - day + 1);
        return { from: start, to: now };
      },
    },
    {
      label: 'Last Week',
      getRange: () => {
        const end = new Date(today);
        const day = end.getDay() || 7;
        end.setDate(end.getDate() - day);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        return { from: start, to: end };
      },
    },
    {
      label: 'This Month',
      getRange: () => ({ from: new Date(now.getFullYear(), now.getMonth(), 1), to: now }),
    },
    {
      label: 'Last Month',
      getRange: () => {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end   = new Date(now.getFullYear(), now.getMonth(), 0);
        return { from: start, to: end };
      },
    },
    {
      label: 'Last 7 Days',
      getRange: () => {
        const from = new Date(today); from.setDate(today.getDate() - 6);
        return { from, to: now };
      },
    },
    {
      label: 'Last 30 Days',
      getRange: () => {
        const from = new Date(today); from.setDate(today.getDate() - 29);
        return { from, to: now };
      },
    },
  ];
};

// ─── Date Range Picker ────────────────────────────────────────────────────────
interface DateRangePickerProps {
  from: string; to: string;
  activePreset: string;
  onPresetSelect: (preset: RangePreset) => void;
  onCustomApply: (from: string, to: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  from, to, activePreset, onPresetSelect, onCustomApply,
}) => {
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo,   setCustomTo]   = useState(to);
  const ref = useRef<HTMLDivElement>(null);
  const PRESETS = buildPresets();

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const fromDate = from ? new Date(from) : new Date();
  const toDate   = to   ? new Date(to)   : new Date();

  return (
    <div className="position-relative" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        className="btn btn-outline-secondary btn-sm bg-white d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
        style={{ borderRadius: '10px', fontSize: '0.85rem', fontWeight: 500, border: '1.5px solid #e2e8f0' }}
      >
        <Calendar size={15} className="text-primary" />
        <span className="text-dark">{fmtDisplay(fromDate)} – {fmtDisplay(toDate)}</span>
        <ChevronDown size={14} className="text-muted" style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div
          className="position-absolute bg-white border rounded-3 shadow-lg"
          style={{ top: 'calc(100% + 8px)', right: 0, width: '310px', zIndex: 1055 }}
        >
          {/* Preset buttons */}
          <div className="p-3 border-bottom">
            <p className="text-muted mb-2" style={{ fontSize: '.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>Quick Select</p>
            <div className="d-flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => { onPresetSelect(p); setOpen(false); }}
                  className="btn btn-sm d-flex align-items-center gap-1 px-2 py-1"
                  style={{
                    borderRadius: '7px', fontSize: '.775rem', fontWeight: 500, border: 'none', transition: 'all .15s',
                    background: activePreset === p.label ? '#2563eb' : '#f1f5f9',
                    color:      activePreset === p.label ? '#fff'    : '#334155',
                  }}
                >
                  {activePreset === p.label && <Check size={11} />}
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom range */}
          <div className="p-3">
            <p className="text-muted mb-2" style={{ fontSize: '.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>Custom Range</p>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label mb-1" style={{ fontSize: '.75rem', color: '#64748b', fontWeight: 500 }}>From</label>
                <input type="date" className="form-control form-control-sm" value={customFrom} max={customTo}
                  onChange={e => setCustomFrom(e.target.value)} style={{ borderRadius: '7px', fontSize: '.8rem' }} />
              </div>
              <div className="col-6">
                <label className="form-label mb-1" style={{ fontSize: '.75rem', color: '#64748b', fontWeight: 500 }}>To</label>
                <input type="date" className="form-control form-control-sm" value={customTo} min={customFrom}
                  onChange={e => setCustomTo(e.target.value)} style={{ borderRadius: '7px', fontSize: '.8rem' }} />
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm w-100"
              style={{ borderRadius: '8px', fontWeight: 600, fontSize: '.825rem' }}
              onClick={() => { if (customFrom && customTo) { onCustomApply(customFrom, customTo); setOpen(false); } }}
            >Apply Date Range</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Custom Recharts Tooltips ─────────────────────────────────────────────────
const SalesTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', color: '#fff', padding: '.5rem .85rem', borderRadius: '8px', fontSize: '.8rem', boxShadow: '0 8px 24px rgba(0,0,0,.35)' }}>
      <p style={{ margin: 0, fontWeight: 600, color: '#94a3b8' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ margin: '2px 0 0', fontWeight: 700, color: p.stroke || p.fill }}>
          {p.name}: <span style={{ color: '#fff' }}>{fmtRupee(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

const PieTooltipContent: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{ background: '#0f172a', color: '#fff', padding: '.5rem .85rem', borderRadius: '8px', fontSize: '.8rem', boxShadow: '0 8px 24px rgba(0,0,0,.35)' }}>
      <p style={{ margin: 0, fontWeight: 700 }}>{d.name}: {d.value} ({((d.value / d.payload.total) * 100).toFixed(1)}%)</p>
    </div>
  );
};

// ─── Donut centre label ───────────────────────────────────────────────────────
const PieCentreLabel: React.FC<{ total: number }> = ({ total }) => (
  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
    <tspan x="50%" dy="-0.5em" fill="#64748b" fontSize="11">Total</tspan>
    <tspan x="50%" dy="1.4em" fill="#0f172a" fontSize="26" fontWeight="700">{total}</tspan>
  </text>
);

const PIE_COLORS = { CONFIRMED: '#2563eb', DRAFT: '#f59e0b', DISPATCHED: '#0ea5e9', CANCELLED: '#ef4444' };

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  // Date range state
  const defaultPreset = buildPresets().find(p => p.label === 'Last 7 Days')!;
  const defaultRange  = defaultPreset.getRange();

  const [activePreset, setActivePreset] = useState('Last 7 Days');
  const [fromDate, setFromDate] = useState(toISO(defaultRange.from));
  const [toDate,   setToDate]   = useState(toISO(defaultRange.to));

  // Chart data states
  const [salesData, setSalesData] = useState<{
    chartRows: { label: string; current: number; previous: number }[];
    totalSales: number;
  } | null>(null);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError,   setSalesError]   = useState<string | null>(null);

  const [statusData, setStatusData] = useState<{
    slices: { name: string; value: number; total: number }[];
    total: number;
  } | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError,   setStatusError]   = useState<string | null>(null);

  // Stat cards state (raw data)
  const [stats, setStats] = useState({ totalCustomers: 0, totalProducts: 0, lowStockProducts: 0, todayChallans: 0 });
  const [recentChallans,  setRecentChallans]  = useState<any[]>([]);
  const [upcomingFollowups, setUpcomingFollowups] = useState<any[]>([]);

  // ── Auth header ──
  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ── Fetch Sales Overview chart ──
  const fetchSalesOverview = useCallback(async (from: string, to: string) => {
    setSalesLoading(true);
    setSalesError(null);
    try {
      const res = await axios.get(`${API_URL}/api/dashboard/sales-overview`, {
        headers: authHeaders(),
        params: { from, to },
      });
      if (res.data?.success) {
        const d = res.data.data;
        const rows = (d.labels as string[]).map((label: string, i: number) => ({
          label,
          current:  d.currentPeriod[i]  ?? 0,
          previous: d.previousPeriod[i] ?? 0,
        }));
        setSalesData({ chartRows: rows, totalSales: d.totalSales });
      }
    } catch (e: any) {
      setSalesError(e?.response?.data?.message || 'Failed to load sales data');
    } finally {
      setSalesLoading(false);
    }
  }, []);

  // ── Fetch Challan Status donut ──
  const fetchChallanStatus = useCallback(async (from: string, to: string) => {
    setStatusLoading(true);
    setStatusError(null);
    try {
      const res = await axios.get(`${API_URL}/api/dashboard/challan-status`, {
        headers: authHeaders(),
        params: { from, to },
      });
      if (res.data?.success) {
        const d = res.data.data;
        const total = d.total || 0;
        const slices = [
          { name: 'Confirmed',  value: d.confirmed,  total },
          { name: 'Draft',      value: d.draft,       total },
          { name: 'Dispatched', value: d.dispatched,  total },
          { name: 'Cancelled',  value: d.cancelled,   total },
        ].filter(s => s.value > 0);
        setStatusData({ slices, total });
      }
    } catch (e: any) {
      setStatusError(e?.response?.data?.message || 'Failed to load challan status');
    } finally {
      setStatusLoading(false);
    }
  }, []);

  // ── Fetch stat cards + tables (raw API data) ──
  const fetchStatCards = useCallback(async () => {
    const headers = authHeaders();
    try {
      const [challanRes, customerRes, productRes] = await Promise.all([
        axios.get(`${API_URL}/api/challans`,  { headers }).catch(() => null),
        axios.get(`${API_URL}/api/customers`, { headers }).catch(() => null),
        axios.get(`${API_URL}/api/products`,  { headers }).catch(() => null),
      ]);

      const challans  = challanRes?.data?.success  ? (challanRes.data.data  ?? []) : [];
      const customers = customerRes?.data?.success ? (customerRes.data.data ?? []) : [];
      const products  = productRes?.data?.success  ? (productRes.data.data  ?? []) : [];

      const today = new Date(); today.setHours(0,0,0,0);
      setStats({
        totalCustomers:   customers.length,
        totalProducts:    products.length,
        lowStockProducts: products.filter((p: any) => p.stock <= (p.minimumStock ?? 5)).length,
        todayChallans:    challans.filter((c: any) => new Date(c.createdAt) >= today).length,
      });

      // Recent challans (last 5)
      const sorted = [...challans].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecentChallans(sorted.slice(0, 5).map((c: any) => ({
        challanNumber: c.challanNumber,
        customerName:  c.customer?.name ?? '—',
        createdAt:     c.createdAt,
        status:        c.status,
        totalAmount:   Number(c.totalAmount) || 0,
      })));

      // Upcoming follow-ups
      const withFollowup = customers
        .filter((c: any) => c.followUpDate && new Date(c.followUpDate) >= today)
        .sort((a: any, b: any) => new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime())
        .slice(0, 5);
      setUpcomingFollowups(withFollowup.map((c: any) => ({
        customer: c.name,
        date:     new Date(c.followUpDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        type:     c.customerType === 'WHOLESALE' ? 'Call' : c.customerType === 'RETAIL' ? 'Meeting' : 'Email',
        assigned: 'Rahul Sharma',
      })));
    } catch {}
  }, []);

  // ── Initial load ──
  useEffect(() => {
    fetchStatCards();
  }, [fetchStatCards]);

  // ── Refetch charts whenever date range changes ──
  useEffect(() => {
    fetchSalesOverview(fromDate, toDate);
    fetchChallanStatus(fromDate, toDate);
  }, [fromDate, toDate, fetchSalesOverview, fetchChallanStatus]);

  // ── Date range handlers ──
  const handlePresetSelect = (preset: RangePreset) => {
    const { from, to } = preset.getRange();
    setActivePreset(preset.label);
    setFromDate(toISO(from));
    setToDate(toISO(to));
  };

  const handleCustomApply = (from: string, to: string) => {
    setActivePreset('Custom');
    setFromDate(from);
    setToDate(to);
  };

  // ── Recharts Y-axis formatter ──
  const yAxisFmt = (v: number) => v >= 1000 ? `\u20B9${(v / 1000).toFixed(0)}K` : `\u20B9${v}`;

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.65rem' }}>Dashboard</h2>
          <p className="text-muted small mb-0">Welcome back, Admin! Here's what's happening with your business.</p>
        </div>
        <DateRangePicker
          from={fromDate} to={toDate}
          activePreset={activePreset}
          onPresetSelect={handlePresetSelect}
          onCustomApply={handleCustomApply}
        />
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Customers', value: stats.totalCustomers, icon: <Users size={24} />, bg: '#dbeafe', color: '#2563eb', trend: 'up', pct: '12.5%' },
          { label: 'Total Products',  value: stats.totalProducts,  icon: <ShoppingBag size={24} />, bg: '#dcfce7', color: '#16a34a', trend: 'up', pct: '8.3%' },
          { label: "Today's Challans",value: stats.todayChallans,  icon: <FileText size={24} />, bg: '#fef3c7', color: '#d97706', trend: 'up', pct: '18.7%' },
          { label: 'Low Stock Items', value: stats.lowStockProducts,icon: <AlertTriangle size={24} />, bg: '#fee2e2', color: '#ef4444', trend: 'down', pct: '5.2%' },
        ].map(card => (
          <div key={card.label} className="col-12 col-sm-6 col-lg-3">
            <div className="stat-card d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small font-weight-semibold">{card.label}</span>
                <h3 className="fw-bold text-dark mb-1 mt-1">{card.value}</h3>
                <span className={`small font-weight-semibold d-flex align-items-center gap-1 ${card.trend === 'up' ? 'text-success' : 'text-danger'}`} style={{ fontSize: '.775rem' }}>
                  {card.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {card.pct} from last week
                </span>
              </div>
              <div className="stat-icon-box" style={{ background: card.bg, color: card.color }}>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">

        {/* ── Sales Overview (AreaChart) ── */}
        <div className="col-12 col-lg-8">
          <div className="chart-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold text-dark mb-1">Sales Overview</h5>
                <p className="text-muted small mb-0">
                  {salesData ? <>{fmtRupee(salesData.totalSales)} total confirmed sales</> : 'CONFIRMED challans only'}
                </p>
              </div>
              <div className="d-flex align-items-center gap-2">
                {salesLoading && <RefreshCw size={14} className="text-primary" style={{ animation: 'spin 1s linear infinite' }} />}
                <DateRangePicker
                  from={fromDate} to={toDate}
                  activePreset={activePreset}
                  onPresetSelect={handlePresetSelect}
                  onCustomApply={handleCustomApply}
                />
              </div>
            </div>

            <div style={{ height: '240px' }}>
              {salesLoading ? (
                <div className="d-flex align-items-center justify-content-center h-100 gap-2 text-muted">
                  <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '.9rem' }}>Loading sales data…</span>
                </div>
              ) : salesError ? (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 gap-2">
                  <AlertCircle size={28} className="text-danger" />
                  <span className="text-danger small">{salesError}</span>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => fetchSalesOverview(fromDate, toDate)}>Retry</button>
                </div>
              ) : !salesData || salesData.chartRows.every(r => r.current === 0 && r.previous === 0) ? (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 gap-2 text-muted">
                  <BarChart2 size={32} />
                  <span style={{ fontSize: '.9rem' }}>No confirmed sales in this period</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData.chartRows} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                    <defs>
                      <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradPrev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#94a3b8" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={yAxisFmt} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={55} />
                    <RechartTooltip content={<SalesTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
                      formatter={(value) => value === 'current' ? `${activePreset}` : 'Previous Period'}
                    />
                    <Area type="monotone" dataKey="previous" name="previous" stroke="#94a3b8" strokeWidth={2}
                      strokeDasharray="5 4" fill="url(#gradPrev)" dot={false} activeDot={{ r: 4 }} />
                    <Area type="monotone" dataKey="current"  name="current"  stroke="#2563eb" strokeWidth={2.5}
                      fill="url(#gradCurrent)" dot={{ r: 4, fill: '#fff', stroke: '#2563eb', strokeWidth: 2 }}
                      activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ── Challan Status (PieChart) ── */}
        <div className="col-12 col-lg-4">
          <div className="chart-card h-100 d-flex flex-column">
            <h5 className="fw-bold text-dark mb-3">Challan Status</h5>

            <div style={{ flex: 1, minHeight: '170px' }}>
              {statusLoading ? (
                <div className="d-flex align-items-center justify-content-center h-100 gap-2 text-muted">
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '.85rem' }}>Loading…</span>
                </div>
              ) : statusError ? (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 gap-2">
                  <AlertCircle size={22} className="text-danger" />
                  <span className="text-danger" style={{ fontSize: '.8rem' }}>{statusError}</span>
                </div>
              ) : !statusData || statusData.total === 0 ? (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 gap-2 text-muted">
                  <BarChart2 size={28} />
                  <span style={{ fontSize: '.85rem' }}>No challans in this period</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={statusData.slices}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.slices.map((entry, i) => (
                        <Cell key={i} fill={PIE_COLORS[entry.name.toUpperCase() as keyof typeof PIE_COLORS] ?? '#6366f1'} />
                      ))}
                      <PieCentreLabel total={statusData.total} />
                    </Pie>
                    <PieTooltip content={<PieTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Legend */}
            {statusData && statusData.total > 0 && (
              <div className="mt-2">
                {statusData.slices.map(s => (
                  <div key={s.name} className="d-flex align-items-center justify-content-between mb-2">
                    <span className="d-flex align-items-center gap-2 small text-dark fw-medium">
                      <span className="d-inline-block rounded-circle" style={{
                        width: 10, height: 10,
                        background: PIE_COLORS[s.name.toUpperCase() as keyof typeof PIE_COLORS] ?? '#6366f1',
                      }} />
                      {s.name}
                    </span>
                    <span className="small fw-bold text-dark">
                      {s.value} ({s.total ? ((s.value / s.total) * 100).toFixed(1) : '0'}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Tables */}
      <div className="row g-3">
        {/* Recent Challans */}
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
                    <th>Challan No.</th><th>Customer</th><th>Date</th><th>Status</th><th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentChallans.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-muted py-4">No challans found</td></tr>
                  ) : recentChallans.map((row, idx) => (
                    <tr key={idx}>
                      <td className="fw-semibold text-secondary">{row.challanNumber}</td>
                      <td className="fw-bold text-dark">{row.customerName}</td>
                      <td className="text-secondary">
                        {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td>
                        {row.status === 'CONFIRMED'  && <span className="badge-confirmed">Confirmed</span>}
                        {row.status === 'DRAFT'       && <span className="badge-draft">Draft</span>}
                        {row.status === 'CANCELLED'   && <span className="badge-cancelled">Cancelled</span>}
                        {row.status === 'DISPATCHED'  && <span className="badge bg-info text-white px-2 py-1 rounded" style={{ fontSize: '.75rem' }}>Dispatched</span>}
                      </td>
                      <td className="fw-bold text-dark">{fmtRupee(row.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Upcoming Follow-ups */}
        <div className="col-12 col-lg-6">
          <div className="chart-card h-100 p-0 overflow-hidden">
            <div className="p-3 d-flex align-items-center justify-content-between border-bottom">
              <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.05rem' }}>Upcoming Follow-ups</h5>
              <Link to="/customers" className="small text-primary text-decoration-none fw-semibold">View All</Link>
            </div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr><th>Customer</th><th>Follow-up Date</th><th>Type</th><th>Assigned To</th></tr>
                </thead>
                <tbody>
                  {upcomingFollowups.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-muted py-4">No upcoming follow-ups</td></tr>
                  ) : upcomingFollowups.map((row, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold text-dark">{row.customer}</td>
                      <td className="text-secondary">{row.date}</td>
                      <td>
                        {row.type === 'Call'    && <span className="badge-type-call">Call</span>}
                        {row.type === 'Meeting' && <span className="badge-type-meeting">Meeting</span>}
                        {row.type === 'Email'   && <span className="badge-type-email">Email</span>}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center"
                            style={{ width: 26, height: 26, fontSize: '.7rem' }}>
                            {row.assigned ? row.assigned.charAt(0) : 'A'}
                          </div>
                          <span className="small text-dark">{row.assigned}</span>
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

      {/* Footer */}
      <div className="d-flex align-items-center justify-content-between text-muted small mt-4 pt-3 border-top" style={{ fontSize: '.8rem' }}>
        <div>© 2026 Mini ERP + CRM. All rights reserved.</div>
        <div>Version 1.0.0</div>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
