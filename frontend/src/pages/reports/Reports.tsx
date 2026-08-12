import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter, 
  FileText, 
  Users, 
  Package, 
  IndianRupee, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  ChevronDown, 
  Download,
  ArrowUpRight,
  ShoppingBag,
  Activity,
  Layers
} from 'lucide-react';

const formatCurrency = (val: number): string => {
  return '₹ ' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseCurrency = (val: string): number => {
  if (!val) return 0;
  return parseFloat(val.replace(/[^\d.]/g, '')) || 0;
};

interface MetricItem {
  metric: string;
  thisPeriod: string;
  lastPeriod: string;
  change: string;
  isPositive: boolean;
}

interface TopProduct {
  rank: number;
  name: string;
  sku: string;
  qtySold: number;
  salesAmount: string;
  iconBg: string;
}

interface TopCustomer {
  rank: number;
  name: string;
  challansCount: number;
  salesAmount: string;
}

interface RecentActivity {
  id: string;
  text: string;
  time: string;
  user: string;
  amount: string;
  type: 'CONFIRMED' | 'DISPATCHED' | 'CREATED' | 'CANCELLED';
}

const SALES_SUMMARY_DATA: MetricItem[] = [
  { metric: 'Total Sales', thisPeriod: '₹ 2,45,780.00', lastPeriod: '₹ 2,07,120.00', change: '+ 18.6%', isPositive: true },
  { metric: 'Total Challans', thisPeriod: '125', lastPeriod: '111', change: '+ 12.4%', isPositive: true },
  { metric: 'Average Order Value', thisPeriod: '₹ 1,966.24', lastPeriod: '₹ 1,865.05', change: '+ 5.4%', isPositive: true },
  { metric: 'Total Quantity Sold', thisPeriod: '1,245', lastPeriod: '1,102', change: '+ 13.0%', isPositive: true },
  { metric: 'Taxes Collected', thisPeriod: '₹ 37,450.40', lastPeriod: '₹ 30,120.30', change: '+ 24.3%', isPositive: true },
  { metric: 'Discounts Given', thisPeriod: '₹ 12,340.00', lastPeriod: '₹ 9,850.00', change: '+ 25.3%', isPositive: true },
];

const TOP_PRODUCTS_DATA: TopProduct[] = [
  { rank: 1, name: 'USB Fast Charger 20W', sku: 'CHG001', qtySold: 250, salesAmount: '₹ 1,25,000.00', iconBg: '#eff6ff' },
  { rank: 2, name: 'Bluetooth Earphones', sku: 'EAR001', qtySold: 180, salesAmount: '₹ 1,08,000.00', iconBg: '#f0fdf4' },
  { rank: 3, name: 'Power Bank 10000mAh', sku: 'PWB001', qtySold: 140, salesAmount: '₹ 77,000.00', iconBg: '#fef3c7' },
  { rank: 4, name: 'USB Type-C Cable', sku: 'CAB001', qtySold: 210, salesAmount: '₹ 42,000.00', iconBg: '#f3e8ff' },
  { rank: 5, name: 'Mobile Back Cover', sku: 'MBC001', qtySold: 130, salesAmount: '₹ 18,200.00', iconBg: '#fee2e2' },
];

const TOP_CUSTOMERS_DATA: TopCustomer[] = [
  { rank: 1, name: 'ABC Traders', challansCount: 18, salesAmount: '₹ 78,450.00' },
  { rank: 2, name: 'XYZ Store', challansCount: 14, salesAmount: '₹ 56,780.00' },
  { rank: 3, name: 'PQR Distributors', challansCount: 12, salesAmount: '₹ 42,360.00' },
  { rank: 4, name: 'LMN Retailers', challansCount: 10, salesAmount: '₹ 31,250.00' },
  { rank: 5, name: 'Global Supplies', challansCount: 8, salesAmount: '₹ 24,180.00' },
];

const RECENT_ACTIVITIES: RecentActivity[] = [
  { id: 'a-1', text: 'Challan CH-2024-00125 confirmed for ABC Traders', time: '17 May 2024, 10:30 AM', user: 'Rahul Sharma', amount: '₹ 10,762.40', type: 'CONFIRMED' },
  { id: 'a-2', text: 'Challan CH-2024-00124 dispatched to XYZ Store', time: '17 May 2024, 09:45 AM', user: 'Rahul Sharma', amount: '₹ 5,450.00', type: 'DISPATCHED' },
  { id: 'a-3', text: 'Challan CH-2024-00123 created for PQR Distributors', time: '16 May 2024, 06:20 PM', user: 'Neha Patel', amount: '₹ 22,180.00', type: 'CREATED' },
  { id: 'a-4', text: 'Challan CH-2024-00122 cancelled', time: '16 May 2024, 03:15 PM', user: 'Amit Verma', amount: '₹ 3,980.00', type: 'CANCELLED' },
];

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TREND' | 'PRODUCTS' | 'CUSTOMERS' | 'INVENTORY' | 'OUTSTANDING'>('OVERVIEW');
  const [dateRange, setDateRange] = useState('All Time');
  const [chartFrequency, setChartFrequency] = useState('Daily');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Control Dropdown toggles
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'CHARGER' | 'AUDIO' | 'POWERBANK' | 'CABLES' | 'COVERS'>('ALL');
  const [selectedCustomerType, setSelectedCustomerType] = useState<'ALL' | 'WHOLESALE' | 'RETAIL'>('ALL');

  // Date Range Multiplier (to simulate changing data)
  const [dataMultiplier, setDataMultiplier] = useState(12.0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDateRangeChange = (label: string, multiplier: number) => {
    setDateRange(label);
    setDataMultiplier(allChallans.length > 0 ? 1.0 : multiplier);
    setShowDateDropdown(false);
    showToast(`Report updated for range: ${label}`);
  };

  const handleCustomDateApply = () => {
    if (!customStartDate && !customEndDate) {
      showToast("Please select at least a start or end date.");
      return;
    }
    
    let label = 'Custom Range';
    if (customStartDate && customEndDate) {
      const startD = new Date(customStartDate + 'T00:00:00');
      const endD = new Date(customEndDate + 'T00:00:00');
      const formatOpt: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
      label = `${startD.toLocaleDateString('en-IN', formatOpt)} - ${endD.toLocaleDateString('en-IN', formatOpt)}`;
    } else if (customStartDate) {
      const startD = new Date(customStartDate + 'T00:00:00');
      label = `From ${startD.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else if (customEndDate) {
      const endD = new Date(customEndDate + 'T00:00:00');
      label = `Until ${endD.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }

    setSelectedRangeKey('custom');
    handleDateRangeChange(label, 1.0);
  };

  const [loading, setLoading] = useState(true);
  const [allChallans, setAllChallans] = useState<any[]>([]);
  const [rawCustomersCount, setRawCustomersCount] = useState<number>(86);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedRangeKey, setSelectedRangeKey] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showAllActivityModal, setShowAllActivityModal] = useState(false);
  const activeMultiplier = allChallans.length > 0 ? 1.0 : dataMultiplier;

  const [stats, setStats] = useState({
    totalSales: 0,
    totalChallans: 0,
    totalCustomers: 0,
    totalProductsSold: 0,
    outstandingAmount: 0,
    salesChange: { text: '0.0%', isPositive: true },
    challansChange: { text: '0.0%', isPositive: true },
    customersChange: { text: '0.0%', isPositive: true },
    productsSoldChange: { text: '0.0%', isPositive: true },
    outstandingChange: { text: '0.0%', isPositive: true },
    statusBreakdown: {
      confirmed: 0,
      draft: 0,
      dispatched: 0,
      cancelled: 0,
    },
    salesTrend: [] as any[],
    salesSummary: [] as any[],
    topProducts: [] as any[],
    topCustomers: [] as any[],
    recentActivities: [] as any[],
    allActivities: [] as any[],
    allProductsSold: [] as any[],
    allCustomersList: [] as any[]
  });

  const isDateInRange = (createdAtStr: string, rangeKey: string): boolean => {
    if (!createdAtStr) return true;
    const challanDate = new Date(createdAtStr);
    const now = new Date();
    
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    
    const last7DaysStart = new Date(todayStart);
    last7DaysStart.setDate(last7DaysStart.getDate() - 7);
    
    const last30DaysStart = new Date(todayStart);
    last30DaysStart.setDate(last30DaysStart.getDate() - 30);
    
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    switch (rangeKey) {
      case 'today':
        return challanDate >= todayStart;
      case 'yesterday':
        return challanDate >= yesterdayStart && challanDate < todayStart;
      case '7days':
        return challanDate >= last7DaysStart;
      case '30days':
        return challanDate >= last30DaysStart;
      case 'this_month':
        return challanDate >= thisMonthStart;
      case 'last_month':
        return challanDate >= lastMonthStart && challanDate <= lastMonthEnd;
      case 'custom':
        {
          const start = customStartDate ? new Date(customStartDate + 'T00:00:00') : null;
          const end = customEndDate ? new Date(customEndDate + 'T23:59:59') : null;
          if (start && end) {
            return challanDate >= start && challanDate <= end;
          } else if (start) {
            return challanDate >= start;
          } else if (end) {
            return challanDate <= end;
          }
          return true;
        }
      case 'all':
      default:
        return true;
    }
  };

  const fetchReportsData = async () => {
    setLoading(true);
    const token = localStorage.getItem('jwt_token') || 'demo_jwt_token_2026';
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const challanRes = await axios.get('https://mini-erp-crm-portal-wsqe.onrender.com/api/challans', { headers }).catch(() => null);
      const customersRes = await axios.get('https://mini-erp-crm-portal-wsqe.onrender.com/api/customers', { headers }).catch(() => null);
      const productsRes = await axios.get('https://mini-erp-crm-portal-wsqe.onrender.com/api/products', { headers }).catch(() => null);

      if (challanRes && challanRes.data?.success && Array.isArray(challanRes.data.data)) {
        setAllChallans(challanRes.data.data);
        if (challanRes.data.data.length > 0) {
          setDataMultiplier(1.0);
        }
      }
      if (customersRes && customersRes.data?.success && Array.isArray(customersRes.data.data)) {
        setRawCustomersCount(customersRes.data.data.length);
        setAllCustomers(customersRes.data.data);
      }
      if (productsRes && productsRes.data?.success && Array.isArray(productsRes.data.data)) {
        setAllProducts(productsRes.data.data);
      }
    } catch (err) {
      console.error("Error loading reports database stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  useEffect(() => {

    // Filter challans based on selectedRangeKey
    const filteredChallans = allChallans.filter((c: any) => isDateInRange(c.createdAt, selectedRangeKey));

    const confirmedChallans = filteredChallans.filter((c: any) => c.status === 'CONFIRMED');
    const draftChallans = filteredChallans.filter((c: any) => c.status === 'DRAFT');
    const cancelledChallans = filteredChallans.filter((c: any) => c.status === 'CANCELLED');
    const dispatchedChallans = filteredChallans.filter((c: any) => c.status === 'DISPATCHED');

    const totalSalesVal = confirmedChallans.reduce((sum: number, c: any) => sum + (Number(c.totalAmount) || 0), 0);
    const outstandingAmountVal = draftChallans.reduce((sum: number, c: any) => sum + (Number(c.totalAmount) || 0), 0);
    
    const confirmedAmt = totalSalesVal;
    const draftAmt = draftChallans.reduce((sum: number, c: any) => sum + (Number(c.totalAmount) || 0), 0);
    const dispatchedAmt = dispatchedChallans.reduce((sum: number, c: any) => sum + (Number(c.totalAmount) || 0), 0);
    const cancelledAmt = cancelledChallans.reduce((sum: number, c: any) => sum + (Number(c.totalAmount) || 0), 0);

    const totalProductsSoldVal = confirmedChallans.reduce((sum: number, c: any) => sum + (Number(c.totalQuantity) || 0), 0);
    const totalCustomersCount = rawCustomersCount;
    const totalChallansCount = filteredChallans.length;

    // Aggregate Top Products
    const productStatsMap: { [key: string]: { name: string; sku: string; qty: number; amt: number } } = {};
    confirmedChallans.forEach((c: any) => {
      if (Array.isArray(c.items)) {
        c.items.forEach((item: any) => {
          const pId = item.productId;
          if (!productStatsMap[pId]) {
            productStatsMap[pId] = {
              name: item.productName || item.product?.name || 'Unknown Product',
              sku: item.sku || item.product?.sku || 'SKU',
              qty: 0,
              amt: 0
            };
          }
          productStatsMap[pId].qty += Number(item.quantity) || 0;
          productStatsMap[pId].amt += (Number(item.price) || 0) * (Number(item.quantity) || 0);
        });
      }
    });

    const topProductsList = Object.values(productStatsMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
      .map((p, idx) => ({
        rank: idx + 1,
        name: p.name,
        sku: p.sku,
        qtySold: p.qty,
        salesAmount: formatCurrency(p.amt),
        iconBg: ['#eff6ff', '#f0fdf4', '#fef3c7', '#f3e8ff', '#fee2e2'][idx % 5]
      }));

    const allProductsSoldList = Object.values(productStatsMap)
      .sort((a, b) => b.qty - a.qty)
      .map((p, idx) => ({
        rank: idx + 1,
        name: p.name,
        sku: p.sku,
        qtySold: p.qty,
        salesAmount: formatCurrency(p.amt),
        iconBg: ['#eff6ff', '#f0fdf4', '#fef3c7', '#f3e8ff', '#fee2e2'][idx % 5]
      }));

    // Aggregate Top Customers
    const customerStatsMap: { [key: string]: { name: string; challansCount: number; amt: number } } = {};
    confirmedChallans.forEach((c: any) => {
      const custName = c.customer?.name || 'Unknown Customer';
      if (!customerStatsMap[custName]) {
        customerStatsMap[custName] = { name: custName, challansCount: 0, amt: 0 };
      }
      customerStatsMap[custName].challansCount += 1;
      customerStatsMap[custName].amt += Number(c.totalAmount) || 0;
    });

    const topCustomersList = Object.values(customerStatsMap)
      .sort((a, b) => b.amt - a.amt)
      .slice(0, 5)
      .map((c, idx) => ({
        rank: idx + 1,
        name: c.name,
        challansCount: c.challansCount,
        salesAmount: formatCurrency(c.amt)
      }));

    const allCustomersList = Object.values(customerStatsMap)
      .sort((a, b) => b.amt - a.amt)
      .map((c, idx) => ({
        rank: idx + 1,
        name: c.name,
        challansCount: c.challansCount,
        salesAmount: formatCurrency(c.amt)
      }));

    // Recent Activity mapping helper
    const mapActivity = (c: any) => {
      let text = `Challan ${c.challanNumber} created for ${c.customer?.name || 'Customer'}`;
      if (c.status === 'CONFIRMED') {
        text = `Challan ${c.challanNumber} confirmed for ${c.customer?.name || 'Customer'}`;
      } else if (c.status === 'CANCELLED') {
        text = `Challan ${c.challanNumber} cancelled`;
      } else if (c.status === 'DISPATCHED') {
        text = `Challan ${c.challanNumber} dispatched for ${c.customer?.name || 'Customer'}`;
      }
      
      return {
        id: c.id,
        text,
        time: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
        user: c.user?.name || 'Staff',
        amount: formatCurrency(Number(c.totalAmount) || 0),
        type: c.status as any
      };
    };

    const recentActivitiesList = filteredChallans.slice(0, 4).map(mapActivity);
    const allActivitiesList = filteredChallans.map(mapActivity);

    // Find start and end date of the selected range key
    const now = new Date();
    let rangeStart = new Date();
    let rangeEnd = new Date();
    let generateDailyPoints = false;
    
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const last7DaysStart = new Date(todayStart);
    last7DaysStart.setDate(last7DaysStart.getDate() - 7);
    const last30DaysStart = new Date(todayStart);
    last30DaysStart.setDate(last30DaysStart.getDate() - 30);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    switch (selectedRangeKey) {
      case 'today':
        rangeStart = todayStart;
        rangeEnd = now;
        generateDailyPoints = true;
        break;
      case 'yesterday':
        rangeStart = yesterdayStart;
        rangeEnd = todayStart;
        generateDailyPoints = true;
        break;
      case '7days':
        rangeStart = last7DaysStart;
        rangeEnd = now;
        generateDailyPoints = true;
        break;
      case '30days':
        rangeStart = last30DaysStart;
        rangeEnd = now;
        generateDailyPoints = true;
        break;
      case 'this_month':
        rangeStart = thisMonthStart;
        rangeEnd = now;
        generateDailyPoints = true;
        break;
      case 'last_month':
        rangeStart = lastMonthStart;
        rangeEnd = lastMonthEnd;
        generateDailyPoints = true;
        break;
      case 'custom':
        rangeStart = customStartDate ? new Date(customStartDate + 'T00:00:00') : now;
        rangeEnd = customEndDate ? new Date(customEndDate + 'T23:59:59') : now;
        {
          const diffTime = Math.abs(rangeEnd.getTime() - rangeStart.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays <= 31) {
            generateDailyPoints = true;
          }
        }
        break;
      case 'all':
      default:
        {
          const dates = allChallans.map(c => c.createdAt ? new Date(c.createdAt).getTime() : 0).filter(t => t > 0);
          if (dates.length > 0) {
            rangeStart = new Date(Math.min(...dates));
            rangeEnd = new Date(Math.max(...dates));
          } else {
            rangeStart = last7DaysStart;
            rangeEnd = now;
          }
        }
        break;
    }

    // Group by Date for Sales Trend
    const dateGroup: { [key: string]: { timestamp: number; amount: number } } = {};
    
    // Initialize dateGroup with 0s for all days if generateDailyPoints is true and we have database data
    if (generateDailyPoints && allChallans.length > 0) {
      const curr = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
      const last = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate());
      let count = 0;
      while (curr <= last && count < 100) {
        const dayKey = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
        dateGroup[dayKey] = {
          timestamp: new Date(dayKey).getTime(),
          amount: 0
        };
        curr.setDate(curr.getDate() + 1);
        count++;
      }
    }

    // Add actual database sales
    confirmedChallans.forEach((c: any) => {
      if (c.createdAt) {
        const d = new Date(c.createdAt);
        const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (!dateGroup[dayKey]) {
          dateGroup[dayKey] = {
            timestamp: new Date(dayKey).getTime(),
            amount: 0
          };
        }
        dateGroup[dayKey].amount += Number(c.totalAmount) || 0;
      }
    });

    let trend = Object.entries(dateGroup)
      .map(([dayKey, val]) => {
        const d = new Date(dayKey + 'T00:00:00');
        const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        return {
          date: dateStr,
          amount: val.amount,
          timestamp: val.timestamp
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    if (trend.length === 0 && allChallans.length > 0) {
      const now = new Date();
      let start = new Date();
      let end = new Date();
      
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      const last7DaysStart = new Date(todayStart);
      last7DaysStart.setDate(last7DaysStart.getDate() - 7);
      const last30DaysStart = new Date(todayStart);
      last30DaysStart.setDate(last30DaysStart.getDate() - 30);
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      switch (selectedRangeKey) {
        case 'today':
          start = todayStart;
          end = now;
          break;
        case 'yesterday':
          start = yesterdayStart;
          end = todayStart;
          break;
        case '7days':
          start = last7DaysStart;
          end = now;
          break;
        case '30days':
          start = last30DaysStart;
          end = now;
          break;
        case 'this_month':
          start = thisMonthStart;
          end = now;
          break;
        case 'last_month':
          start = lastMonthStart;
          end = lastMonthEnd;
          break;
        case 'custom':
          start = customStartDate ? new Date(customStartDate + 'T00:00:00') : now;
          end = customEndDate ? new Date(customEndDate + 'T23:59:59') : now;
          break;
        case 'all':
        default:
          {
            const dates = allChallans.map(c => c.createdAt ? new Date(c.createdAt).getTime() : 0).filter(t => t > 0);
            if (dates.length > 0) {
              start = new Date(Math.min(...dates));
              end = new Date(Math.max(...dates));
            } else {
              start = last7DaysStart;
              end = now;
            }
          }
          break;
      }

      const formatDate = (d: Date) => {
        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      };

      let t1 = start.getTime();
      let t2 = end.getTime();
      if (isNaN(t1)) t1 = now.getTime();
      if (isNaN(t2)) t2 = now.getTime();

      if (t2 - t1 > 24 * 3600 * 1000) {
        const mid = new Date((t1 + t2) / 2);
        trend = [
          { date: formatDate(start), amount: 0, timestamp: t1 },
          { date: formatDate(mid), amount: 0, timestamp: (t1 + t2) / 2 },
          { date: formatDate(end), amount: 0, timestamp: t2 }
        ];
      } else {
        trend = [
          { date: formatDate(start), amount: 0, timestamp: t1 },
          { date: formatDate(end), amount: 0, timestamp: t2 }
        ];
      }
    } else if (trend.length === 0) {
      trend = [
        { date: '10 May', amount: 10000, timestamp: 0 },
        { date: '11 May', amount: 19000, timestamp: 0 },
        { date: '12 May', amount: 28500, timestamp: 0 },
        { date: '13 May', amount: 23000, timestamp: 0 },
        { date: '14 May', amount: 40000, timestamp: 0 },
        { date: '15 May', amount: 28000, timestamp: 0 },
        { date: '16 May', amount: 23500, timestamp: 0 },
        { date: '17 May', amount: 35800, timestamp: 0 },
      ];
    }

    // Calculate Previous Period Dates
    const duration = rangeEnd.getTime() - rangeStart.getTime();
    const prevEnd = new Date(rangeStart.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duration);

    // Filter challans for previous period
    const prevFilteredChallans = allChallans.filter((c: any) => {
      if (!c.createdAt) return false;
      const challanDate = new Date(c.createdAt);
      return challanDate >= prevStart && challanDate <= prevEnd;
    });

    const prevConfirmedChallans = prevFilteredChallans.filter((c: any) => c.status === 'CONFIRMED');
    const prevDraftChallans = prevFilteredChallans.filter((c: any) => c.status === 'DRAFT');

    const lastPeriodVal = prevConfirmedChallans.reduce((sum: number, c: any) => sum + (Number(c.totalAmount) || 0), 0);
    const prevOutstandingAmountVal = prevDraftChallans.reduce((sum: number, c: any) => sum + (Number(c.totalAmount) || 0), 0);
    const prevChallansCount = prevFilteredChallans.length;
    const prevProductsSoldVal = prevConfirmedChallans.reduce((sum: number, c: any) => sum + (Number(c.totalQuantity) || 0), 0);

    const avgOrderVal = totalChallansCount > 0 ? totalSalesVal / totalChallansCount : 0;
    const avgOrderValLast = prevChallansCount > 0 ? lastPeriodVal / prevChallansCount : 0;

    const calculateChangePercent = (current: number, previous: number) => {
      if (previous === 0) {
        if (current === 0) return { text: '0.0%', isPositive: true };
        return { text: '+ 100.0%', isPositive: true };
      }
      const change = ((current - previous) / previous) * 100;
      const sign = change >= 0 ? '+' : '';
      return {
        text: `${sign}${change.toFixed(1)}%`,
        isPositive: change >= 0
      };
    };

    // Calculate customer change based on creation date relative to periods
    const currentCustomersCount = allCustomers.filter((cust: any) => {
      if (!cust.createdAt) return true;
      return new Date(cust.createdAt) <= rangeEnd;
    }).length;

    const prevCustomersCount = allCustomers.filter((cust: any) => {
      if (!cust.createdAt) return true;
      return new Date(cust.createdAt) <= prevEnd;
    }).length;

    const salesChange = calculateChangePercent(totalSalesVal, lastPeriodVal);
    const challansChange = calculateChangePercent(totalChallansCount, prevChallansCount);
    const avgOrderChange = calculateChangePercent(avgOrderVal, avgOrderValLast);
    const productsSoldChange = calculateChangePercent(totalProductsSoldVal, prevProductsSoldVal);
    const outstandingChange = calculateChangePercent(outstandingAmountVal, prevOutstandingAmountVal);
    const customersChange = calculateChangePercent(currentCustomersCount, prevCustomersCount);

    const salesSummaryList = [
      { metric: 'Total Sales', thisPeriod: formatCurrency(totalSalesVal), lastPeriod: formatCurrency(lastPeriodVal), change: salesChange.text, isPositive: salesChange.isPositive },
      { metric: 'Total Challans', thisPeriod: String(totalChallansCount), lastPeriod: String(prevChallansCount), change: challansChange.text, isPositive: challansChange.isPositive },
      { metric: 'Average Order Value', thisPeriod: formatCurrency(avgOrderVal), lastPeriod: formatCurrency(avgOrderValLast), change: avgOrderChange.text, isPositive: avgOrderChange.isPositive },
      { metric: 'Total Quantity Sold', thisPeriod: String(totalProductsSoldVal), lastPeriod: String(prevProductsSoldVal), change: productsSoldChange.text, isPositive: productsSoldChange.isPositive },
      { metric: 'Taxes Collected', thisPeriod: formatCurrency(totalSalesVal * 0.18), lastPeriod: formatCurrency(lastPeriodVal * 0.18), change: salesChange.text, isPositive: salesChange.isPositive },
      { metric: 'Discounts Given', thisPeriod: formatCurrency(totalSalesVal * 0.05), lastPeriod: formatCurrency(lastPeriodVal * 0.05), change: salesChange.text, isPositive: salesChange.isPositive },
    ];

    setStats({
      totalSales: totalSalesVal,
      totalChallans: totalChallansCount,
      totalCustomers: totalCustomersCount,
      totalProductsSold: totalProductsSoldVal,
      outstandingAmount: outstandingAmountVal,
      salesChange,
      challansChange,
      customersChange,
      productsSoldChange,
      outstandingChange,
      statusBreakdown: {
        confirmed: confirmedAmt,
        draft: draftAmt,
        dispatched: dispatchedAmt,
        cancelled: cancelledAmt,
      },
      salesTrend: trend,
      salesSummary: salesSummaryList,
      topProducts: topProductsList,
      topCustomers: topCustomersList,
      recentActivities: recentActivitiesList,
      allActivities: allActivitiesList,
      allProductsSold: allProductsSoldList,
      allCustomersList: allCustomersList
    });
  }, [allChallans, selectedRangeKey, rawCustomersCount, customStartDate, customEndDate, allCustomers, allProducts]);

  const getFormattedVal = (metric: string, originalVal: string) => {
    const isCurrency = originalVal.includes('₹') || metric.includes('Sales') || metric.includes('Amount') || metric.includes('Value') || metric.includes('Taxes') || metric.includes('Discounts');
    const numeric = parseFloat(originalVal.replace(/[^\d.]/g, '')) || 0;
    const adjusted = numeric * activeMultiplier;
    
    if (isCurrency) {
      return formatCurrency(adjusted);
    } else {
      return Math.round(adjusted).toLocaleString('en-IN');
    }
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Sales Summary Report\n";
    csvContent += `Date Range: ${dateRange}\n\n`;
    csvContent += "Metric,This Period,Last Period,Change\n";
    
    stats.salesSummary.forEach(item => {
      const thisPeriodVal = getFormattedVal(item.metric, item.thisPeriod);
      const lastPeriodVal = getFormattedVal(item.metric, item.lastPeriod);
      csvContent += `"${item.metric}","${thisPeriodVal}","${lastPeriodVal}","${item.change}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${dateRange.replace(/[\s-]+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportDropdown(false);
    showToast("CSV file downloaded successfully!");
  };

  // Filtered Collections
  const filteredProducts = stats.topProducts.filter(p => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'CHARGER' && p.sku.startsWith('CHG')) return true;
    if (selectedCategory === 'AUDIO' && p.sku.startsWith('EAR')) return true;
    if (selectedCategory === 'POWERBANK' && p.sku.startsWith('PWB')) return true;
    if (selectedCategory === 'CABLES' && p.sku.startsWith('CAB')) return true;
    if (selectedCategory === 'COVERS' && p.sku.startsWith('MBC')) return true;
    return false;
  }).map((p, index) => {
    const qty = Math.round(p.qtySold * activeMultiplier);
    const amount = parseCurrency(p.salesAmount) * activeMultiplier;
    return {
      ...p,
      rank: index + 1,
      qtySold: qty,
      salesAmount: formatCurrency(amount)
    };
  });

  const filteredCustomers = stats.topCustomers.filter(c => {
    if (selectedCustomerType === 'ALL') return true;
    if (selectedCustomerType === 'WHOLESALE' && (c.name.includes('Traders') || c.name.includes('Distributors') || c.name.includes('Supplies'))) return true;
    if (selectedCustomerType === 'RETAIL' && (c.name.includes('Store') || c.name.includes('Retailers'))) return true;
    return false;
  }).map((c, index) => {
    const challans = Math.round(c.challansCount * activeMultiplier);
    const amount = parseCurrency(c.salesAmount) * activeMultiplier;
    return {
      ...c,
      rank: index + 1,
      challansCount: challans,
      salesAmount: formatCurrency(amount)
    };
  });

  const adjustedActivities = stats.recentActivities.map(act => {
    const amt = parseCurrency(act.amount) * activeMultiplier;
    return {
      ...act,
      amount: formatCurrency(amt)
    };
  });

  const adjustedAllActivities = stats.allActivities.map(act => {
    const amt = parseCurrency(act.amount) * activeMultiplier;
    return {
      ...act,
      amount: formatCurrency(amt)
    };
  });

  // Apex Chart configurations
  const areaChartOptions = {
    chart: {
      type: 'area' as const,
      height: 260,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' as const, width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    colors: ['#2563eb'],
    xaxis: {
      categories: stats.salesTrend.map(item => item.date),
      labels: {
        style: { colors: '#64748b', fontSize: '10px' }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        formatter: (value: number) => (value !== undefined && value !== null) ? '₹ ' + Number(value).toLocaleString('en-IN') : '',
        style: { colors: '#94a3b8', fontSize: '10px' }
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    tooltip: {
      y: {
        formatter: (value: number) => (value !== undefined && value !== null) ? '₹ ' + Number(value).toLocaleString('en-IN') : ''
      }
    }
  };

  const areaChartSeries = [{
    name: 'Sales',
    data: stats.salesTrend.map(item => (item.amount || 0) * activeMultiplier)
  }];

  const totalSalesBreakdown = (stats.statusBreakdown?.confirmed || 0) + (stats.statusBreakdown?.draft || 0) + (stats.statusBreakdown?.dispatched || 0) + (stats.statusBreakdown?.cancelled || 0);
  const getPercentage = (value: number) => {
    if (totalSalesBreakdown === 0) return '0.0%';
    return `${((value / totalSalesBreakdown) * 100).toFixed(1)}%`;
  };

  const donutChartOptions = {
    chart: {
      type: 'donut' as const,
      height: 180
    },
    labels: ['Confirmed', 'Draft', 'Dispatched', 'Cancelled'],
    colors: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '11px',
              color: '#64748b',
              formatter: () => `₹ ${Math.round(totalSalesBreakdown * activeMultiplier).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
            }
          }
        }
      }
    },
    tooltip: {
      y: {
        formatter: (value: number) => (value !== undefined && value !== null) ? '₹ ' + Number(value).toLocaleString('en-IN') : ''
      }
    }
  };

  const donutChartSeries = [
    (stats.statusBreakdown?.confirmed || 0) * activeMultiplier,
    (stats.statusBreakdown?.draft || 0) * activeMultiplier,
    (stats.statusBreakdown?.dispatched || 0) * activeMultiplier,
    (stats.statusBreakdown?.cancelled || 0) * activeMultiplier
  ];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="position-fixed bottom-0 end-0 m-4 bg-dark text-white px-3.5 py-2.5 rounded-3 shadow-lg d-flex align-items-center gap-2 z-3" style={{ fontSize: '0.875rem' }}>
          <CheckCircle2 size={16} className="text-success" />
          {toastMessage}
        </div>
      )}

      {/* Top Header & Action Controls */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.65rem', letterSpacing: '-0.02em' }}>
            Reports & Analytics
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
            Detailed insights into your business performance.
          </p>
        </div>

        {/* Date Filter & Export Controls */}
        <div className="d-flex align-items-center gap-2.5 flex-wrap">
          {/* Date Picker Button */}
          <div className="dropdown position-relative">
            <button
              className="btn btn-white bg-white border d-flex align-items-center gap-2 px-3 py-2 fw-medium shadow-xs"
              style={{ borderRadius: '8px', fontSize: '0.85rem', borderColor: '#cbd5e1', color: '#334155' }}
              type="button"
              onClick={() => {
                setShowDateDropdown(!showDateDropdown);
                setShowFiltersDropdown(false);
                setShowExportDropdown(false);
              }}
            >
              <Calendar size={16} className="text-primary" />
              <span>{dateRange}</span>
              <ChevronDown size={14} className="text-muted ms-1" />
            </button>
            {showDateDropdown && (
              <div className="dropdown-menu show shadow-lg border-light mt-1 position-absolute start-0 p-0" style={{ borderRadius: '8px', fontSize: '0.85rem', zIndex: 1050, minWidth: '240px' }}>
                <ul className="list-unstyled mb-0 py-1">
                  {[
                    { label: 'Today', key: 'today', factor: 0.15 },
                    { label: 'Yesterday', key: 'yesterday', factor: 0.18 },
                    { label: 'Last 7 Days', key: '7days', factor: 1.0 },
                    { label: 'Last 30 Days', key: '30days', factor: 4.2 },
                    { label: 'This Month', key: 'this_month', factor: 3.5 },
                    { label: 'Last Month', key: 'last_month', factor: 4.8 },
                    { label: 'All Time', key: 'all', factor: 12.0 },
                  ].map((opt) => (
                    <li key={opt.key}>
                      <button
                        className={`dropdown-item py-1.5 px-3 text-start w-100 border-0 bg-transparent ${selectedRangeKey === opt.key ? 'text-primary fw-semibold' : ''}`}
                        type="button"
                        onClick={() => { setSelectedRangeKey(opt.key); handleDateRangeChange(opt.label, opt.factor); }}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
                <hr className="my-1.5 text-muted" style={{ opacity: 0.12 }} />
                <div className="px-3 py-2.5 bg-light" style={{ borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                  <span className="fw-bold text-secondary mb-2 d-block" style={{ fontSize: '0.725rem', letterSpacing: '0.05em' }}>CUSTOM DURATION</span>
                  <div className="d-flex flex-column gap-2">
                    <div>
                      <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem', fontWeight: 500 }}>Start Date</label>
                      <input 
                        type="date" 
                        className="form-control form-control-sm border border-light-subtle"
                        style={{ fontSize: '0.78rem', borderRadius: '6px', padding: '0.25rem 0.5rem' }}
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem', fontWeight: 500 }}>End Date</label>
                      <input 
                        type="date" 
                        className="form-control form-control-sm border border-light-subtle"
                        style={{ fontSize: '0.78rem', borderRadius: '6px', padding: '0.25rem 0.5rem' }}
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                      />
                    </div>
                    <button 
                      className="btn btn-primary btn-sm w-100 mt-1.5 fw-bold" 
                      style={{ fontSize: '0.78rem', borderRadius: '6px', padding: '0.35rem' }}
                      type="button"
                      onClick={handleCustomDateApply}
                    >
                      Apply Custom Range
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filter Button */}
          <div className="dropdown position-relative">
            <button
              className="btn btn-white bg-white border d-flex align-items-center gap-1.5 px-3 py-2 fw-medium shadow-xs"
              style={{ borderRadius: '8px', fontSize: '0.85rem', borderColor: '#cbd5e1', color: '#334155' }}
              onClick={() => {
                setShowFiltersDropdown(!showFiltersDropdown);
                setShowDateDropdown(false);
                setShowExportDropdown(false);
              }}
            >
              <Filter size={16} />
              <span>Filters</span>
            </button>
            {showFiltersDropdown && (
              <div className="dropdown-menu show shadow-lg border-light p-3 position-absolute start-0 mt-1" style={{ borderRadius: '8px', fontSize: '0.85rem', width: '260px', zIndex: 1050 }}>
                <h6 className="fw-bold mb-2 text-dark">Category</h6>
                <select 
                  className="form-select form-select-sm mb-3" 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                >
                  <option value="ALL">All Categories</option>
                  <option value="CHARGER">Chargers</option>
                  <option value="AUDIO">Audio</option>
                  <option value="POWERBANK">Power Banks</option>
                  <option value="CABLES">Cables</option>
                  <option value="COVERS">Covers</option>
                </select>

                <h6 className="fw-bold mb-2 text-dark">Customer Type</h6>
                <select 
                  className="form-select form-select-sm mb-3" 
                  value={selectedCustomerType} 
                  onChange={(e) => setSelectedCustomerType(e.target.value as any)}
                >
                  <option value="ALL">All Customer Types</option>
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="RETAIL">Retail</option>
                </select>

                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-primary btn-sm flex-fill fw-semibold" 
                    type="button"
                    onClick={() => { setShowFiltersDropdown(false); showToast("Filters applied successfully!"); }}
                  >
                    Apply
                  </button>
                  <button 
                    className="btn btn-light btn-sm border flex-fill fw-medium" 
                    type="button"
                    onClick={() => { setSelectedCategory('ALL'); setSelectedCustomerType('ALL'); setShowFiltersDropdown(false); showToast("Filters cleared"); }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Export Report Button */}
          <div className="dropdown position-relative">
            <button
              className="btn btn-primary d-flex align-items-center gap-2 px-3.5 py-2 fw-semibold shadow-xs"
              style={{ borderRadius: '8px', fontSize: '0.85rem', backgroundColor: '#2563eb', border: '1px solid #2563eb' }}
              onClick={() => {
                setShowExportDropdown(!showExportDropdown);
                setShowDateDropdown(false);
                setShowFiltersDropdown(false);
              }}
            >
              <Download size={16} />
              <span>Export Report</span>
            </button>
            {showExportDropdown && (
              <ul className="dropdown-menu show shadow-lg border-light mt-1 position-absolute end-0" style={{ borderRadius: '8px', fontSize: '0.85rem', zIndex: 1050 }}>
                <li>
                  <button className="dropdown-item py-2 d-flex align-items-center gap-2 border-0 bg-transparent text-start w-100" type="button" onClick={handleExportCSV}>
                    <FileText size={14} className="text-secondary" />
                    <span>Download CSV Report</span>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item py-2 d-flex align-items-center gap-2 border-0 bg-transparent text-start w-100" type="button" onClick={() => { setShowExportDropdown(false); showToast("Opening Print Dialog..."); window.print(); }}>
                    <Download size={14} className="text-secondary" />
                    <span>Print / Save as PDF</span>
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>


      {/* 5 Stat KPI Cards Row */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-5 g-4 mb-4">
        {/* 1. Total Sales */}
        <div className="col">
          <div className="card border-0 shadow-sm p-4 rounded-3 h-100" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="rounded-3 p-2.5 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f3e8ff', color: '#9333ea', width: '44px', height: '44px' }}>
                <IndianRupee size={20} />
              </div>
              <span className={`badge bg-${stats.salesChange.isPositive ? 'success' : 'danger'}-subtle text-${stats.salesChange.isPositive ? 'success' : 'danger'} border border-${stats.salesChange.isPositive ? 'success' : 'danger'}-subtle rounded-pill px-2.5 py-1 fw-bold`} style={{ fontSize: '0.725rem' }}>
                {stats.salesChange.isPositive ? <TrendingUp size={12} className="me-1" /> : <TrendingDown size={12} className="me-1" />} {stats.salesChange.text.replace(/^[+-]\s*/, '')}
              </span>
            </div>
            <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.78rem' }}>Total Sales</span>
            <h4 className="fw-bold text-dark mb-1" style={{ fontSize: '1.35rem', letterSpacing: '-0.02em' }}>
              {formatCurrency(stats.totalSales * activeMultiplier)}
            </h4>
            <span className="text-muted" style={{ fontSize: '0.725rem' }}>vs last period</span>
          </div>
        </div>

        {/* 2. Total Challans */}
        <div className="col">
          <div className="card border-0 shadow-sm p-4 rounded-3 h-100" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="rounded-3 p-2.5 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#eff6ff', color: '#2563eb', width: '44px', height: '44px' }}>
                <FileText size={20} />
              </div>
              <span className={`badge bg-${stats.challansChange.isPositive ? 'success' : 'danger'}-subtle text-${stats.challansChange.isPositive ? 'success' : 'danger'} border border-${stats.challansChange.isPositive ? 'success' : 'danger'}-subtle rounded-pill px-2.5 py-1 fw-bold`} style={{ fontSize: '0.725rem' }}>
                {stats.challansChange.isPositive ? <TrendingUp size={12} className="me-1" /> : <TrendingDown size={12} className="me-1" />} {stats.challansChange.text.replace(/^[+-]\s*/, '')}
              </span>
            </div>
            <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.78rem' }}>Total Challans</span>
            <h4 className="fw-bold text-dark mb-1" style={{ fontSize: '1.35rem', letterSpacing: '-0.02em' }}>
              {Math.round(stats.totalChallans * activeMultiplier).toLocaleString('en-IN')}
            </h4>
            <span className="text-muted" style={{ fontSize: '0.725rem' }}>vs last period</span>
          </div>
        </div>

        {/* 3. Total Customers */}
        <div className="col">
          <div className="card border-0 shadow-sm p-4 rounded-3 h-100" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="rounded-3 p-2.5 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', width: '44px', height: '44px' }}>
                <Users size={20} />
              </div>
              <span className={`badge bg-${stats.customersChange.isPositive ? 'success' : 'danger'}-subtle text-${stats.customersChange.isPositive ? 'success' : 'danger'} border border-${stats.customersChange.isPositive ? 'success' : 'danger'}-subtle rounded-pill px-2.5 py-1 fw-bold`} style={{ fontSize: '0.725rem' }}>
                {stats.customersChange.isPositive ? <TrendingUp size={12} className="me-1" /> : <TrendingDown size={12} className="me-1" />} {stats.customersChange.text.replace(/^[+-]\s*/, '')}
              </span>
            </div>
            <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.78rem' }}>Total Customers</span>
            <h4 className="fw-bold text-dark mb-1" style={{ fontSize: '1.35rem', letterSpacing: '-0.02em' }}>
              {Math.round(stats.totalCustomers * activeMultiplier).toLocaleString('en-IN')}
            </h4>
            <span className="text-muted" style={{ fontSize: '0.725rem' }}>vs last period</span>
          </div>
        </div>

        {/* 4. Total Products Sold */}
        <div className="col">
          <div className="card border-0 shadow-sm p-4 rounded-3 h-100" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="rounded-3 p-2.5 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#fff7ed', color: '#ea580c', width: '44px', height: '44px' }}>
                <Package size={20} />
              </div>
              <span className={`badge bg-${stats.productsSoldChange.isPositive ? 'success' : 'danger'}-subtle text-${stats.productsSoldChange.isPositive ? 'success' : 'danger'} border border-${stats.productsSoldChange.isPositive ? 'success' : 'danger'}-subtle rounded-pill px-2.5 py-1 fw-bold`} style={{ fontSize: '0.725rem' }}>
                {stats.productsSoldChange.isPositive ? <TrendingUp size={12} className="me-1" /> : <TrendingDown size={12} className="me-1" />} {stats.productsSoldChange.text.replace(/^[+-]\s*/, '')}
              </span>
            </div>
            <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.78rem' }}>Total Products Sold</span>
            <h4 className="fw-bold text-dark mb-1" style={{ fontSize: '1.35rem', letterSpacing: '-0.02em' }}>
              {Math.round(stats.totalProductsSold * activeMultiplier).toLocaleString('en-IN')}
            </h4>
            <span className="text-muted" style={{ fontSize: '0.725rem' }}>vs last period</span>
          </div>
        </div>

        {/* 5. Outstanding Amount */}
        <div className="col">
          <div className="card border-0 shadow-sm p-4 rounded-3 h-100" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="rounded-3 p-2.5 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#fef2f2', color: '#dc2626', width: '44px', height: '44px' }}>
                <CreditCard size={20} />
              </div>
              <span className={`badge bg-${stats.outstandingChange.isPositive ? 'success' : 'danger'}-subtle text-${stats.outstandingChange.isPositive ? 'success' : 'danger'} border border-${stats.outstandingChange.isPositive ? 'success' : 'danger'}-subtle rounded-pill px-2.5 py-1 fw-bold`} style={{ fontSize: '0.725rem' }}>
                {stats.outstandingChange.isPositive ? <TrendingUp size={12} className="me-1" /> : <TrendingDown size={12} className="me-1" />} {stats.outstandingChange.text.replace(/^[+-]\s*/, '')}
              </span>
            </div>
            <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.78rem' }}>Outstanding Amount</span>
            <h4 className="fw-bold text-dark mb-1" style={{ fontSize: '1.35rem', letterSpacing: '-0.02em' }}>
              {formatCurrency(stats.outstandingAmount * activeMultiplier)}
            </h4>
            <span className="text-muted" style={{ fontSize: '0.725rem' }}>vs last period</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="border-bottom mb-4" style={{ borderColor: '#e2e8f0' }}>
        <div className="d-flex align-items-center gap-4 overflow-x-auto pb-1">
          {[
            { id: 'OVERVIEW', label: 'Sales Overview' },
            { id: 'TREND', label: 'Sales Trend' },
            { id: 'PRODUCTS', label: 'Top Products' },
            { id: 'CUSTOMERS', label: 'Top Customers' },
            { id: 'INVENTORY', label: 'Inventory Summary' },
            { id: 'OUTSTANDING', label: 'Outstanding Report' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`btn border-0 py-2.5 px-1 fw-bold text-nowrap position-relative transition-all`}
              style={{
                fontSize: '0.875rem',
                color: activeTab === tab.id ? '#2563eb' : '#64748b',
                backgroundColor: 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                borderRadius: 0
              }}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'OVERVIEW' && (
        <>
          {/* Row 1: Sales Overview Area Chart & Sales by Status Donut Chart */}
          <div className="row g-4 mb-4">
            {/* Sales Overview Area Chart */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.05rem' }}>Sales Overview</h5>
                    <span className="text-muted small" style={{ fontSize: '0.78rem' }}>Daily sales volume trajectory</span>
                  </div>
                  <div style={{ width: '110px' }}>
                    <select
                      className="form-select form-select-sm bg-white border text-secondary fw-semibold"
                      value={chartFrequency}
                      onChange={(e) => setChartFrequency(e.target.value)}
                      style={{ borderRadius: '6px', fontSize: '0.8rem', borderColor: '#cbd5e1' }}
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                {/* Apex Smooth Curved Area Chart */}
                <div className="position-relative w-100" style={{ height: '260px' }}>
                  <Chart
                    options={areaChartOptions}
                    series={areaChartSeries}
                    type="area"
                    height={260}
                  />
                </div>
              </div>
            </div>

            {/* Sales by Status Donut Chart */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-3 d-flex flex-column justify-content-between" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.05rem' }}>Sales by Status</h5>

                {/* Apex Donut Chart */}
                <div className="position-relative d-flex align-items-center justify-content-center my-3" style={{ height: '200px' }}>
                  <Chart
                    options={donutChartOptions}
                    series={donutChartSeries}
                    type="donut"
                    height={200}
                    width={260}
                  />
                </div>

                {/* Legend List */}
                <div className="pt-2">
                  <div className="d-flex align-items-center justify-content-between py-1 border-bottom" style={{ fontSize: '0.825rem' }}>
                    <span className="d-flex align-items-center gap-2">
                      <span className="rounded-circle d-inline-block" style={{ width: '10px', height: '10px', backgroundColor: '#10b981' }}></span>
                      <span className="text-secondary">Confirmed</span>
                    </span>
                    <strong className="text-dark">
                      {formatCurrency(stats.statusBreakdown.confirmed * activeMultiplier).replace(/\.00$/, '')} ({getPercentage(stats.statusBreakdown.confirmed)})
                    </strong>
                  </div>

                  <div className="d-flex align-items-center justify-content-between py-1 border-bottom" style={{ fontSize: '0.825rem' }}>
                    <span className="d-flex align-items-center gap-2">
                      <span className="rounded-circle d-inline-block" style={{ width: '10px', height: '10px', backgroundColor: '#f59e0b' }}></span>
                      <span className="text-secondary">Draft</span>
                    </span>
                    <strong className="text-dark">
                      {formatCurrency(stats.statusBreakdown.draft * activeMultiplier).replace(/\.00$/, '')} ({getPercentage(stats.statusBreakdown.draft)})
                    </strong>
                  </div>

                  <div className="d-flex align-items-center justify-content-between py-1 border-bottom" style={{ fontSize: '0.825rem' }}>
                    <span className="d-flex align-items-center gap-2">
                      <span className="rounded-circle d-inline-block" style={{ width: '10px', height: '10px', backgroundColor: '#3b82f6' }}></span>
                      <span className="text-secondary">Dispatched</span>
                    </span>
                    <strong className="text-dark">
                      {formatCurrency(stats.statusBreakdown.dispatched * activeMultiplier).replace(/\.00$/, '')} ({getPercentage(stats.statusBreakdown.dispatched)})
                    </strong>
                  </div>

                  <div className="d-flex align-items-center justify-content-between py-1 pt-1.5" style={{ fontSize: '0.825rem' }}>
                    <span className="d-flex align-items-center gap-2">
                      <span className="rounded-circle d-inline-block" style={{ width: '10px', height: '10px', backgroundColor: '#ef4444' }}></span>
                      <span className="text-secondary">Cancelled</span>
                    </span>
                    <strong className="text-dark">
                      {formatCurrency(stats.statusBreakdown.cancelled * activeMultiplier).replace(/\.00$/, '')} ({getPercentage(stats.statusBreakdown.cancelled)})
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Sales Summary Table & Top 5 Products Table */}
          <div className="row g-4 mb-4">
            {/* Sales Summary Table */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <h5 className="fw-bold text-dark mb-3" style={{ fontSize: '1.05rem' }}>Sales Summary</h5>

                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead style={{ backgroundColor: '#f8fafc', fontSize: '0.78rem' }}>
                      <tr>
                        <th className="py-2.5 text-secondary">Metric</th>
                        <th className="py-2.5 text-secondary text-end">This Period</th>
                        <th className="py-2.5 text-secondary text-end">Last Period</th>
                        <th className="py-2.5 text-secondary text-end">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.salesSummary.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 text-dark fw-medium" style={{ fontSize: '0.85rem' }}>{item.metric}</td>
                          <td className="py-2.5 text-end fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                            {getFormattedVal(item.metric, item.thisPeriod)}
                          </td>
                          <td className="py-2.5 text-end text-muted small">{getFormattedVal(item.metric, item.lastPeriod)}</td>
                          <td className="py-2.5 text-end">
                            <span className={`fw-bold small d-inline-flex align-items-center gap-1 ${item.isPositive ? 'text-success' : 'text-danger'}`}>
                              {item.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {item.change.replace(/^[+-]\s*/, '')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Top 5 Products Table */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <h5 className="fw-bold text-dark mb-3" style={{ fontSize: '1.05rem' }}>Top 5 Products</h5>

                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead style={{ backgroundColor: '#f8fafc', fontSize: '0.78rem' }}>
                      <tr>
                        <th className="py-2.5 text-secondary" style={{ width: '40px' }}>#</th>
                        <th className="py-2.5 text-secondary">Product</th>
                        <th className="py-2.5 text-secondary text-center">Quantity Sold</th>
                        <th className="py-2.5 text-secondary text-end">Sales Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-muted" style={{ fontSize: '0.85rem' }}>
                            No products sold in this period.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => (
                          <tr key={p.rank}>
                            <td className="py-2.5 text-secondary fw-semibold" style={{ fontSize: '0.85rem' }}>{p.rank}</td>
                            <td className="py-2.5">
                              <div className="d-flex align-items-center gap-2.5">
                                <div className="rounded-2 p-1.5 border d-flex align-items-center justify-content-center" style={{ backgroundColor: p.iconBg, width: '32px', height: '32px' }}>
                                  <Package size={16} className="text-muted" />
                                </div>
                                <div>
                                  <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{p.name}</div>
                                  <div className="text-muted font-monospace" style={{ fontSize: '0.725rem' }}>{p.sku}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 text-center fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{p.qtySold}</td>
                            <td className="py-2.5 text-end fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{p.salesAmount}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Top 5 Customers & Recent Sales Activity */}
          <div className="row g-4">
            {/* Top 5 Customers Table */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <h5 className="fw-bold text-dark mb-3" style={{ fontSize: '1.05rem' }}>Top 5 Customers</h5>

                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead style={{ backgroundColor: '#f8fafc', fontSize: '0.78rem' }}>
                      <tr>
                        <th className="py-2.5 text-secondary" style={{ width: '40px' }}>#</th>
                        <th className="py-2.5 text-secondary">Customer</th>
                        <th className="py-2.5 text-secondary text-center">Challans</th>
                        <th className="py-2.5 text-secondary text-end">Sales Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-muted" style={{ fontSize: '0.85rem' }}>
                            No customers in this period.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((c) => (
                          <tr key={c.rank}>
                            <td className="py-2.5 text-secondary fw-semibold" style={{ fontSize: '0.85rem' }}>{c.rank}</td>
                            <td className="py-2.5 fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{c.name}</td>
                            <td className="py-2.5 text-center fw-bold text-secondary" style={{ fontSize: '0.85rem' }}>{c.challansCount}</td>
                            <td className="py-2.5 text-end fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{c.salesAmount}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Sales Activity */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.05rem' }}>Recent Sales Activity</h5>
                  <button className="btn btn-link text-primary p-0 text-decoration-none fw-semibold small" onClick={() => setShowAllActivityModal(true)}>
                    View All
                  </button>
                </div>

                <div className="d-flex flex-column gap-3">
                  {adjustedActivities.length === 0 ? (
                    <div className="text-center py-4 text-muted border rounded-3 bg-light" style={{ fontSize: '0.85rem' }}>
                      No recent activities in this period.
                    </div>
                  ) : (
                    adjustedActivities.map((act) => (
                      <div key={act.id} className="d-flex align-items-center justify-content-between p-2.5 rounded-3 bg-light border" style={{ borderColor: '#f1f5f9' }}>
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0" style={{
                            backgroundColor: act.type === 'CONFIRMED' ? '#dcfce7' : act.type === 'DISPATCHED' ? '#ffedd5' : act.type === 'CREATED' ? '#dbeafe' : '#fee2e2',
                            color: act.type === 'CONFIRMED' ? '#16a34a' : act.type === 'DISPATCHED' ? '#ea580c' : act.type === 'CREATED' ? '#2563eb' : '#dc2626',
                            width: '36px', height: '36px'
                          }}>
                            {act.type === 'CONFIRMED' && <CheckCircle2 size={18} />}
                            {act.type === 'DISPATCHED' && <Truck size={18} />}
                            {act.type === 'CREATED' && <FileText size={18} />}
                            {act.type === 'CANCELLED' && <XCircle size={18} />}
                          </div>

                          <div>
                            <div className="fw-bold text-dark" style={{ fontSize: '0.825rem' }}>{act.text}</div>
                            <div className="text-muted small d-flex align-items-center gap-2" style={{ fontSize: '0.725rem' }}>
                              <span>{act.time}</span>
                              <span>•</span>
                              <span className="text-secondary">{act.user}</span>
                            </div>
                          </div>
                        </div>

                        <strong className="text-dark font-monospace flex-shrink-0" style={{ fontSize: '0.85rem' }}>{act.amount}</strong>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'TREND' && (
        <div className="row g-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm p-4 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.05rem' }}>Sales Trajectory</h5>
                  <span className="text-muted small" style={{ fontSize: '0.78rem' }}>Detailed breakdown of sales amounts by dates</span>
                </div>
                <div style={{ width: '120px' }}>
                  <select
                    className="form-select form-select-sm bg-white border text-secondary fw-semibold"
                    value={chartFrequency}
                    onChange={(e) => setChartFrequency(e.target.value)}
                    style={{ borderRadius: '6px', fontSize: '0.8rem', borderColor: '#cbd5e1' }}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="position-relative w-100 mb-4" style={{ height: '300px' }}>
                <Chart
                  options={areaChartOptions}
                  series={areaChartSeries}
                  type="area"
                  height={300}
                />
              </div>

              <h6 className="fw-bold text-dark mb-3">Daily Sales Breakdown</h6>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead style={{ backgroundColor: '#f8fafc', fontSize: '0.78rem' }}>
                    <tr>
                      <th className="py-2.5 text-secondary">Date</th>
                      <th className="py-2.5 text-secondary text-end">Sales Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.salesTrend.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="text-center py-4 text-muted" style={{ fontSize: '0.85rem' }}>
                          No trend data available for this range.
                        </td>
                      </tr>
                    ) : (
                      [...stats.salesTrend].reverse().map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 text-dark fw-semibold" style={{ fontSize: '0.85rem' }}>{item.date}</td>
                          <td className="py-2.5 text-end fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                            {formatCurrency((item.amount || 0) * activeMultiplier)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'PRODUCTS' && (
        <div className="card border-0 shadow-sm p-4 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.05rem' }}>Top Products Performance</h5>
              <span className="text-muted small" style={{ fontSize: '0.78rem' }}>Full ranking of product items sold by quantity</span>
            </div>
            <div style={{ width: '160px' }}>
              <select 
                className="form-select form-select-sm" 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                style={{ fontSize: '0.8rem', borderRadius: '6px' }}
              >
                <option value="ALL">All Categories</option>
                <option value="CHARGER">Chargers</option>
                <option value="AUDIO">Audio</option>
                <option value="POWERBANK">Power Banks</option>
                <option value="CABLES">Cables</option>
                <option value="COVERS">Covers</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead style={{ backgroundColor: '#f8fafc', fontSize: '0.78rem' }}>
                <tr>
                  <th className="py-2.5 text-secondary" style={{ width: '50px' }}>Rank</th>
                  <th className="py-2.5 text-secondary">Product Name</th>
                  <th className="py-2.5 text-secondary">SKU</th>
                  <th className="py-2.5 text-secondary text-center">Quantity Sold</th>
                  <th className="py-2.5 text-secondary text-end">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.allProductsSold.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted" style={{ fontSize: '0.85rem' }}>
                      No product sales recorded in this period.
                    </td>
                  </tr>
                ) : (
                  stats.allProductsSold
                    .filter(p => {
                      if (selectedCategory === 'ALL') return true;
                      if (selectedCategory === 'CHARGER' && p.sku.startsWith('CHG')) return true;
                      if (selectedCategory === 'AUDIO' && p.sku.startsWith('EAR')) return true;
                      if (selectedCategory === 'POWERBANK' && p.sku.startsWith('PWB')) return true;
                      if (selectedCategory === 'CABLES' && p.sku.startsWith('CAB')) return true;
                      if (selectedCategory === 'COVERS' && p.sku.startsWith('MBC')) return true;
                      return false;
                    })
                    .map((p, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 text-secondary fw-semibold" style={{ fontSize: '0.85rem' }}>{idx + 1}</td>
                        <td className="py-2.5 fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{p.name}</td>
                        <td className="py-2.5 text-muted font-monospace" style={{ fontSize: '0.8rem' }}>{p.sku}</td>
                        <td className="py-2.5 text-center fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{Math.round(p.qtySold * activeMultiplier)}</td>
                        <td className="py-2.5 text-end fw-bold text-primary" style={{ fontSize: '0.85rem' }}>
                          {formatCurrency(parseCurrency(p.salesAmount) * activeMultiplier)}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CUSTOMERS' && (
        <div className="card border-0 shadow-sm p-4 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.05rem' }}>Customer Analytics</h5>
              <span className="text-muted small" style={{ fontSize: '0.78rem' }}>Revenue ranking and challans per customer</span>
            </div>
            <div style={{ width: '160px' }}>
              <select 
                className="form-select form-select-sm" 
                value={selectedCustomerType} 
                onChange={(e) => setSelectedCustomerType(e.target.value as any)}
                style={{ fontSize: '0.8rem', borderRadius: '6px' }}
              >
                <option value="ALL">All Types</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="RETAIL">Retail</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead style={{ backgroundColor: '#f8fafc', fontSize: '0.78rem' }}>
                <tr>
                  <th className="py-2.5 text-secondary" style={{ width: '50px' }}>Rank</th>
                  <th className="py-2.5 text-secondary">Customer</th>
                  <th className="py-2.5 text-secondary text-center">Challans Count</th>
                  <th className="py-2.5 text-secondary text-end">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {stats.allCustomersList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted" style={{ fontSize: '0.85rem' }}>
                      No customer transactions in this period.
                    </td>
                  </tr>
                ) : (
                  stats.allCustomersList
                    .filter(c => {
                      if (selectedCustomerType === 'ALL') return true;
                      if (selectedCustomerType === 'WHOLESALE' && (c.name.includes('Traders') || c.name.includes('Distributors') || c.name.includes('Supplies'))) return true;
                      if (selectedCustomerType === 'RETAIL' && (c.name.includes('Store') || c.name.includes('Retailers'))) return true;
                      return false;
                    })
                    .map((c, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 text-secondary fw-semibold" style={{ fontSize: '0.85rem' }}>{idx + 1}</td>
                        <td className="py-2.5 fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{c.name}</td>
                        <td className="py-2.5 text-center fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>{Math.round(c.challansCount * activeMultiplier)}</td>
                        <td className="py-2.5 text-end fw-bold text-primary" style={{ fontSize: '0.85rem' }}>
                          {formatCurrency(parseCurrency(c.salesAmount) * activeMultiplier)}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'INVENTORY' && (
        <div>
          {/* Inventory Valuation Header Grid */}
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm p-4 rounded-3 bg-white border" style={{ borderColor: '#e2e8f0' }}>
                <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.78rem' }}>Total Catalog Products</span>
                <h4 className="fw-bold text-dark mb-0" style={{ fontSize: '1.35rem' }}>{allProducts.length}</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm p-4 rounded-3 bg-white border" style={{ borderColor: '#e2e8f0' }}>
                <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.78rem' }}>Total Stock Count</span>
                <h4 className="fw-bold text-dark mb-0" style={{ fontSize: '1.35rem' }}>{allProducts.reduce((acc, p) => acc + (p.stock || 0), 0)} units</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm p-4 rounded-3 bg-white border" style={{ borderColor: '#e2e8f0' }}>
                <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.78rem' }}>Total Inventory Value</span>
                <h4 className="fw-bold text-primary mb-0" style={{ fontSize: '1.35rem' }}>
                  {formatCurrency(allProducts.reduce((acc, p) => acc + ((p.stock || 0) * (Number(p.price) || 0)), 0))}
                </h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm p-4 rounded-3 bg-white border" style={{ borderColor: '#e2e8f0', borderLeft: allProducts.filter(p => (p.stock || 0) <= (p.minimumStock || 5)).length > 0 ? '4px solid #dc2626' : 'none' }}>
                <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.78rem' }}>Low Stock Alerts</span>
                <h4 className={`fw-bold mb-0 ${allProducts.filter(p => (p.stock || 0) <= (p.minimumStock || 5)).length > 0 ? 'text-danger' : 'text-success'}`} style={{ fontSize: '1.35rem' }}>
                  {allProducts.filter(p => (p.stock || 0) <= (p.minimumStock || 5)).length} Products
                </h4>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm p-4 rounded-3 bg-white border" style={{ borderColor: '#e2e8f0' }}>
            <h5 className="fw-bold text-dark mb-4" style={{ fontSize: '1.05rem' }}>Warehouse Stock Summary</h5>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead style={{ backgroundColor: '#f8fafc', fontSize: '0.78rem' }}>
                  <tr>
                    <th className="py-2.5 text-secondary">Product</th>
                    <th className="py-2.5 text-secondary">SKU</th>
                    <th className="py-2.5 text-secondary">Category</th>
                    <th className="py-2.5 text-secondary text-center">Warehouse Stock</th>
                    <th className="py-2.5 text-secondary text-center">Min Threshold</th>
                    <th className="py-2.5 text-secondary text-end">Unit Price</th>
                    <th className="py-2.5 text-secondary text-end">Total Valuation</th>
                  </tr>
                </thead>
                <tbody>
                  {allProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-muted" style={{ fontSize: '0.85rem' }}>
                        No inventory data available.
                      </td>
                    </tr>
                  ) : (
                    allProducts.map((p, idx) => {
                      const isLowStock = (p.stock || 0) <= (p.minimumStock || 5);
                      return (
                        <tr key={idx} style={{ backgroundColor: isLowStock ? '#fff5f5' : 'transparent' }}>
                          <td className="py-2.5 fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{p.name}</td>
                          <td className="py-2.5 text-muted font-monospace" style={{ fontSize: '0.8rem' }}>{p.sku}</td>
                          <td className="py-2.5 text-secondary" style={{ fontSize: '0.85rem' }}>{p.category || 'N/A'}</td>
                          <td className="py-2.5 text-center fw-bold" style={{ fontSize: '0.85rem' }}>
                            <span className={isLowStock ? 'text-danger fw-bold' : 'text-dark'}>
                              {p.stock} {isLowStock && '⚠️'}
                            </span>
                          </td>
                          <td className="py-2.5 text-center text-muted" style={{ fontSize: '0.85rem' }}>{p.minimumStock}</td>
                          <td className="py-2.5 text-end fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>{formatCurrency(Number(p.price) || 0)}</td>
                          <td className="py-2.5 text-end fw-bold text-secondary" style={{ fontSize: '0.85rem' }}>{formatCurrency((p.stock || 0) * (Number(p.price) || 0))}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'OUTSTANDING' && (
        <div>
          {/* Outstanding Headers */}
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm p-4 rounded-3 bg-white border" style={{ borderColor: '#e2e8f0' }}>
                <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.78rem' }}>Total Outstanding Amount (Draft status)</span>
                <h4 className="fw-bold text-danger mb-0" style={{ fontSize: '1.65rem' }}>{formatCurrency(stats.outstandingAmount * activeMultiplier)}</h4>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm p-4 rounded-3 bg-white border" style={{ borderColor: '#e2e8f0' }}>
                <span className="text-muted d-block small mb-1 fw-medium" style={{ fontSize: '0.78rem' }}>Pending Draft Orders</span>
                <h4 className="fw-bold text-warning mb-0" style={{ fontSize: '1.65rem' }}>
                  {allChallans.filter(c => c.status === 'DRAFT').length} Challans
                </h4>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm p-4 rounded-3 bg-white border" style={{ borderColor: '#e2e8f0' }}>
            <h5 className="fw-bold text-dark mb-4" style={{ fontSize: '1.05rem' }}>Outstanding Challan Ledger</h5>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead style={{ backgroundColor: '#f8fafc', fontSize: '0.78rem' }}>
                  <tr>
                    <th className="py-2.5 text-secondary">Challan No.</th>
                    <th className="py-2.5 text-secondary">Customer</th>
                    <th className="py-2.5 text-secondary">Creation Date</th>
                    <th className="py-2.5 text-secondary">Status</th>
                    <th className="py-2.5 text-secondary text-center">Items Count</th>
                    <th className="py-2.5 text-secondary text-end">Outstanding Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {allChallans.filter(c => c.status === 'DRAFT' || c.status === 'DISPATCHED').length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted" style={{ fontSize: '0.85rem' }}>
                        No outstanding draft or dispatched challans found.
                      </td>
                    </tr>
                  ) : (
                    allChallans
                      .filter(c => c.status === 'DRAFT' || c.status === 'DISPATCHED')
                      .map((c, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{c.challanNumber}</td>
                          <td className="py-2.5 fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>{c.customer?.name || 'Unknown'}</td>
                          <td className="py-2.5 text-muted small" style={{ fontSize: '0.85rem' }}>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="py-2.5" style={{ fontSize: '0.85rem' }}>
                            <span className={`badge ${c.status === 'DRAFT' ? 'bg-warning-subtle text-warning border border-warning-subtle' : 'bg-primary-subtle text-primary border border-primary-subtle'} rounded-pill px-2.5 py-1 fw-bold`} style={{ fontSize: '0.7rem' }}>
                              {c.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-center fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{c.totalQuantity}</td>
                          <td className="py-2.5 text-end fw-bold text-danger" style={{ fontSize: '0.85rem' }}>{formatCurrency(Number(c.totalAmount) || 0)}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View All Recent Sales Activity Modal */}
      {showAllActivityModal && (
        <>
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-scrollable modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div className="modal-header border-bottom-0 pb-0 px-4 pt-4 d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="modal-title fw-bold text-dark fs-5 mb-1">Sales Activity History</h5>
                    <p className="text-muted small mb-0">Showing all delivery challan actions and transitions for {dateRange}.</p>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setShowAllActivityModal(false)} aria-label="Close" style={{ padding: '0.75rem' }}></button>
                </div>
                <div className="modal-body p-4" style={{ maxHeight: '60vh' }}>
                  <div className="d-flex flex-column gap-3">
                    {adjustedAllActivities.length === 0 ? (
                      <div className="text-center py-5 text-muted border rounded-3 bg-light">
                        No activity records found for this period.
                      </div>
                    ) : (
                      adjustedAllActivities.map((act) => (
                        <div key={act.id} className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light border" style={{ borderColor: '#f1f5f9' }}>
                          <div className="d-flex align-items-center gap-3">
                            <div className="rounded-circle p-2.5 d-flex align-items-center justify-content-center flex-shrink-0" style={{
                              backgroundColor: act.type === 'CONFIRMED' ? '#dcfce7' : act.type === 'DISPATCHED' ? '#ffedd5' : act.type === 'CREATED' ? '#dbeafe' : '#fee2e2',
                              color: act.type === 'CONFIRMED' ? '#16a34a' : act.type === 'DISPATCHED' ? '#ea580c' : act.type === 'CREATED' ? '#2563eb' : '#dc2626',
                              width: '40px', height: '40px'
                            }}>
                              {act.type === 'CONFIRMED' && <CheckCircle2 size={18} />}
                              {act.type === 'DISPATCHED' && <Truck size={18} />}
                              {act.type === 'CREATED' && <FileText size={18} />}
                              {act.type === 'CANCELLED' && <XCircle size={18} />}
                            </div>

                            <div>
                              <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{act.text}</div>
                              <div className="text-muted small d-flex align-items-center gap-2 mt-0.5" style={{ fontSize: '0.75rem' }}>
                                <span>{act.time}</span>
                                <span>•</span>
                                <span className="text-secondary">{act.user}</span>
                              </div>
                            </div>
                          </div>

                          <strong className="text-dark font-monospace flex-shrink-0 ms-3" style={{ fontSize: '0.9rem' }}>{act.amount}</strong>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0 px-4 pb-4">
                  <button type="button" className="btn btn-secondary px-4 py-2 fw-semibold" style={{ borderRadius: '8px', fontSize: '0.85rem' }} onClick={() => setShowAllActivityModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" style={{ zIndex: 1040 }}></div>
        </>
      )}
    </div>
  );
};
