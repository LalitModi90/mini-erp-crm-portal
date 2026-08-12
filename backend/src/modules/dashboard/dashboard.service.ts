import { prisma } from '../../config/database.js';

const DAY = 24 * 60 * 60 * 1000;

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const lastNDays = (n: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (n - 1));
  return d;
};

interface TrendPoint {
  date: string;
  sales: number;
  challans: number;
  stockIn: number;
  stockOut: number;
}

const buildTrend = (
  challans: { createdAt: Date; totalAmount: any; status: string; createdBy: string }[],
  movements: { createdAt: Date; type: string; quantity: number }[],
  userId?: string
) => {
  const labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY);
    labels.push(d.toDateString());
  }

  const points: Record<string, TrendPoint> = {};
  labels.forEach((label) => {
    points[label] = { date: label, sales: 0, challans: 0, stockIn: 0, stockOut: 0 };
  });

  challans.forEach((c) => {
    if (userId && c.createdBy !== userId) return;
    if (c.status !== 'CONFIRMED') return;
    const key = new Date(c.createdAt).toDateString();
    if (!points[key]) return;
    points[key].sales += Number(c.totalAmount) || 0;
    points[key].challans += 1;
  });

  movements.forEach((m) => {
    const key = new Date(m.createdAt).toDateString();
    if (!points[key]) return;
    if (m.type === 'IN') points[key].stockIn += m.quantity;
    if (m.type === 'OUT') points[key].stockOut += m.quantity;
  });

  return labels.map((label) => points[label]);
};

export class DashboardService {
  async getStatsForRole(userId: string, role: string) {
    const today = startOfToday();

    switch (role) {
      case 'SALES':
        return this.getSalesStats(userId, today);
      case 'WAREHOUSE':
        return this.getWarehouseStats(today);
      case 'ACCOUNTS':
        return this.getAccountsStats(today);
      case 'ADMIN':
      default:
        return this.getAdminStats(today);
    }
  }

  private async getAdminStats(today: Date) {
    const activeCustomerWhere = { isActive: true };

    const [totalCustomers, totalProducts, lowStockProducts, todayChallans, pendingFollowUps, confirmedChallans] =
      await Promise.all([
        prisma.customer.count({ where: activeCustomerWhere }),
        prisma.product.count({ where: { isActive: true } }),
        prisma.product.count({ where: { isActive: true, stock: { lte: 5 } } }),
        prisma.challan.count({ where: { createdAt: { gte: today } } }),
        prisma.customer.count({ where: { isActive: true, followUpDate: { gte: today } } }),
        prisma.challan.count({ where: { status: 'CONFIRMED' } }),
      ]);

    const [confirmedChallanRows, allChallans, recentCustomers, recentChallanRows, recentMovements, recentActivity, allProducts] =
      await Promise.all([
        prisma.challan.findMany({
          where: { status: 'CONFIRMED' },
          select: { totalAmount: true },
        }),
        prisma.challan.findMany({
          select: { createdAt: true, totalAmount: true, status: true, createdBy: true },
        }),
        prisma.customer.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.challan.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { customer: { select: { name: true } } },
        }),
        prisma.stockMovement.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { product: { select: { name: true, sku: true } }, user: { select: { name: true } } },
        }),
        prisma.auditLog.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { user: { select: { name: true, role: true } } },
        }),
        prisma.product.findMany({
          where: { isActive: true },
          select: { id: true, name: true, sku: true, price: true, stock: true, minimumStock: true },
        }),
      ]);

    const allMovements = await prisma.stockMovement.findMany({
      select: { createdAt: true, type: true, quantity: true },
    });

    const [challanConfirmedCount, challanDraftCount, challanDispatchedCount, challanCancelledCount] =
      await Promise.all([
        prisma.challan.count({ where: { status: 'CONFIRMED' } }),
        prisma.challan.count({ where: { status: 'DRAFT' } }),
        prisma.challan.count({ where: { status: 'DISPATCHED' } }),
        prisma.challan.count({ where: { status: 'CANCELLED' } }),
      ]);

    const totalRevenue = confirmedChallanRows.reduce((sum, c) => sum + Number(c.totalAmount), 0);
    const inventoryValue = allProducts.reduce((sum, p) => sum + Number(p.price) * p.stock, 0);

    const trend = buildTrend(allChallans as any, allMovements as any);
    const salesTrend = trend.map((p) => ({ date: p.date, amount: p.sales }));
    const inventoryChart = trend.map((p) => ({ date: p.date, stockIn: p.stockIn, stockOut: p.stockOut }));

    const challanStatusTotal = challanConfirmedCount + challanDraftCount + challanDispatchedCount + challanCancelledCount;

    return {
      role: 'ADMIN',
      totalCustomers,
      totalProducts,
      lowStockProducts,
      todayChallans,
      pendingFollowUps,
      totalRevenue,
      inventoryValue,
      confirmedChallans,
      salesTrend,
      challanStatusBreakdown: {
        confirmed: challanConfirmedCount,
        draft: challanDraftCount,
        dispatched: challanDispatchedCount,
        cancelled: challanCancelledCount,
        total: challanStatusTotal,
      },
      recentCustomers,
      recentChallans: recentChallanRows.map((c) => ({
        id: c.id,
        challanNumber: c.challanNumber,
        customerName: c.customer?.name,
        status: c.status,
        totalAmount: Number(c.totalAmount),
        createdAt: c.createdAt,
      })),
      recentStockMovements: recentMovements,
      recentActivity,
      lowStockProductsList: allProducts
        .filter((p) => p.stock <= p.minimumStock)
        .map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          stock: p.stock,
          minimumStock: p.minimumStock,
        })),
    };
  }

  private async getSalesStats(userId: string, today: Date) {
    const [myCustomers, pendingFollowUps, myChallans, confirmedChallanRows, upcomingFollowUps, recentCustomers, myChallanRows, myChallanCount] =
      await Promise.all([
        prisma.customer.count({ where: { isActive: true } }),
        prisma.customer.count({ where: { isActive: true, followUpDate: { gte: today } } }),
        prisma.challan.count({ where: { createdBy: userId } }),
        prisma.challan.findMany({
          where: { status: 'CONFIRMED', createdBy: userId },
          select: { totalAmount: true },
        }),
        prisma.customer.findMany({
          where: { isActive: true, followUpDate: { gte: today } },
          orderBy: { followUpDate: 'asc' },
          take: 5,
        }),
        prisma.customer.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.challan.findMany({
          where: { createdBy: userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { customer: { select: { name: true } } },
        }),
        prisma.challan.count({ where: { createdBy: userId, createdAt: { gte: today } } }),
      ]);

    const myChallanRowsWithDates = await prisma.challan.findMany({
      where: { createdBy: userId },
      select: { createdAt: true, totalAmount: true, status: true, createdBy: true },
    });
    const allMovements: any[] = [];
    const trend = buildTrend(myChallanRowsWithDates as any, allMovements, userId);
    const salesChart = trend.map((p) => ({ date: p.date, sales: p.sales, challans: p.challans }));

    const todaySales = confirmedChallanRows.reduce((sum, c) => sum + Number(c.totalAmount), 0);
    const todayChallans = await prisma.challan.count({
      where: { createdBy: userId, status: 'CONFIRMED', createdAt: { gte: today } },
    });

    return {
      role: 'SALES',
      myCustomers,
      pendingFollowUps,
      myChallans,
      todaySales,
      todayChallans,
      salesChart,
      upcomingFollowUps,
      recentCustomers,
      recentChallans: myChallanRows.map((c) => ({
        id: c.id,
        challanNumber: c.challanNumber,
        customerName: c.customer?.name,
        status: c.status,
        totalAmount: Number(c.totalAmount),
        createdAt: c.createdAt,
      })),
      myChallanCount,
    };
  }

  private async getWarehouseStats(today: Date) {
    const [products, todayStockIn, todayStockOut] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true, sku: true, stock: true, minimumStock: true, price: true },
      }),
      prisma.stockMovement.count({ where: { type: 'IN', createdAt: { gte: today } } }),
      prisma.stockMovement.count({ where: { type: 'OUT', createdAt: { gte: today } } }),
    ]);

    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStockProductsList = products.filter((p) => p.stock <= p.minimumStock).map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      minimumStock: p.minimumStock,
    }));

    const movements = await prisma.stockMovement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { product: { select: { name: true, sku: true } }, user: { select: { name: true } } },
    });

    const movementData = await prisma.stockMovement.findMany({
      select: { createdAt: true, type: true, quantity: true },
    });
    const emptyChallans: any[] = [];
    const trend = buildTrend(emptyChallans as any, movementData as any);
    const inventoryChart = trend.map((p) => ({ date: p.date, stockIn: p.stockIn, stockOut: p.stockOut }));

    return {
      role: 'WAREHOUSE',
      totalStock,
      lowStockProducts: lowStockProductsList.length,
      todayStockIn,
      todayStockOut,
      inventoryChart,
      lowStockProductsList,
      recentStockMovements: movements.map((m) => ({
        id: m.id,
        productName: m.product?.name,
        sku: m.product?.sku,
        quantity: m.quantity,
        type: m.type,
        reason: m.reason,
        createdByName: m.user?.name,
        createdAt: m.createdAt,
      })),
    };
  }

  private async getAccountsStats(today: Date) {
    const [confirmedChallans, confirmedRows, recentChallans, products] = await Promise.all([
      prisma.challan.count({ where: { status: 'CONFIRMED' } }),
      prisma.challan.findMany({ where: { status: 'CONFIRMED' }, select: { totalAmount: true } }),
      prisma.challan.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { customer: { select: { name: true } } },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { price: true, stock: true, minimumStock: true },
      }),
    ]);

    const allChallans = await prisma.challan.findMany({
      select: { createdAt: true, totalAmount: true, status: true, createdBy: true },
    });
    const allMovements: any[] = [];
    const trend = buildTrend(allChallans as any, allMovements);
    const revenueChart = trend.map((p) => ({ date: p.date, sales: p.sales, challans: p.challans }));

    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const inventoryValue = products.reduce((sum, p) => sum + Number(p.price) * p.stock, 0);
    const totalSalesAmount = confirmedRows.reduce((sum, c) => sum + Number(c.totalAmount), 0);

    return {
      role: 'ACCOUNTS',
      confirmedChallans,
      totalSalesAmount,
      totalRevenue: totalSalesAmount,
      revenueChart,
      recentChallans: recentChallans.map((c) => ({
        id: c.id,
        challanNumber: c.challanNumber,
        customerName: c.customer?.name,
        status: c.status,
        totalAmount: Number(c.totalAmount),
        totalQuantity: c.totalQuantity,
        createdAt: c.createdAt,
      })),
      inventorySummary: {
        totalProducts: products.length,
        totalStock,
        inventoryValue,
        lowStockProducts: products.filter((p) => p.stock <= p.minimumStock).length,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/dashboard/sales-overview?from=YYYY-MM-DD&to=YYYY-MM-DD
  // ─────────────────────────────────────────────────────────────────────────
  async getSalesOverview(from: Date, to: Date) {
    const durationMs = to.getTime() - from.getTime();
    const prevFrom   = new Date(from.getTime() - durationMs);
    const prevTo     = new Date(from.getTime() - 1); // 1ms before current from

    // Fetch current + previous period CONFIRMED challans in parallel
    const [current, previous] = await Promise.all([
      prisma.challan.findMany({
        where: { status: 'CONFIRMED', createdAt: { gte: from, lte: to } },
        select: { createdAt: true, totalAmount: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.challan.findMany({
        where: { status: 'CONFIRMED', createdAt: { gte: prevFrom, lte: prevTo } },
        select: { createdAt: true, totalAmount: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const durationDays = Math.ceil(durationMs / (24 * 60 * 60 * 1000));

    // Decide grouping: daily ≤ 60 days, weekly ≤ 365 days, monthly otherwise
    let groupBy: 'daily' | 'weekly' | 'monthly' = 'daily';
    if (durationDays > 365) groupBy = 'monthly';
    else if (durationDays > 60) groupBy = 'weekly';

    const getGroupKey = (d: Date): string => {
      if (groupBy === 'monthly') {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }
      if (groupBy === 'weekly') {
        // ISO week start (Monday)
        const day = d.getDay() || 7;
        const monday = new Date(d);
        monday.setDate(d.getDate() - day + 1);
        monday.setHours(0, 0, 0, 0);
        return monday.toISOString().slice(0, 10);
      }
      return d.toISOString().slice(0, 10); // daily: YYYY-MM-DD
    };

    const formatLabel = (key: string): string => {
      if (groupBy === 'monthly') {
        const [y, m] = key.split('-');
        return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      }
      if (groupBy === 'weekly') {
        const d = new Date(key + 'T00:00:00');
        return `W/o ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
      }
      const d = new Date(key + 'T00:00:00');
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    // Build ordered bucket list for the CURRENT period
    const buckets: string[] = [];
    if (groupBy === 'daily') {
      const cur = new Date(from);
      cur.setHours(0, 0, 0, 0);
      const end = new Date(to);
      end.setHours(0, 0, 0, 0);
      while (cur <= end) {
        buckets.push(cur.toISOString().slice(0, 10));
        cur.setDate(cur.getDate() + 1);
      }
    } else if (groupBy === 'weekly') {
      const cur = new Date(from);
      const day = cur.getDay() || 7;
      cur.setDate(cur.getDate() - day + 1);
      cur.setHours(0, 0, 0, 0);
      while (cur <= to) {
        buckets.push(cur.toISOString().slice(0, 10));
        cur.setDate(cur.getDate() + 7);
      }
    } else {
      const cur = new Date(from.getFullYear(), from.getMonth(), 1);
      while (cur <= to) {
        buckets.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`);
        cur.setMonth(cur.getMonth() + 1);
      }
    }

    // Aggregate amounts into buckets
    const aggregate = (rows: { createdAt: Date; totalAmount: any }[], bktList: string[]) => {
      const map: Record<string, number> = {};
      bktList.forEach((b) => (map[b] = 0));
      rows.forEach((r) => {
        const k = getGroupKey(new Date(r.createdAt));
        if (k in map) map[k] += Number(r.totalAmount) || 0;
        else map[k] = Number(r.totalAmount) || 0; // out-of-bucket (shouldn't happen)
      });
      return bktList.map((b) => map[b] ?? 0);
    };

    const currentAmounts  = aggregate(current,  buckets);

    // Build PREVIOUS period buckets with same count
    const prevBuckets = buckets.map((_, i) => {
      const offset = -buckets.length + i;
      if (groupBy === 'daily') {
        const d = new Date(from.getTime() + offset * 24 * 60 * 60 * 1000);
        return d.toISOString().slice(0, 10);
      }
      if (groupBy === 'weekly') {
        const d = new Date(from.getTime() + offset * 7 * 24 * 60 * 60 * 1000);
        const day = d.getDay() || 7;
        d.setDate(d.getDate() - day + 1);
        return d.toISOString().slice(0, 10);
      }
      const d = new Date(prevFrom.getFullYear(), prevFrom.getMonth() + i, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const prevAmounts = aggregate(previous, prevBuckets);

    const totalSales = current.reduce((s, c) => s + Number(c.totalAmount), 0);

    return {
      labels:         buckets.map(formatLabel),
      currentPeriod:  currentAmounts,
      previousPeriod: prevAmounts,
      totalSales,
      groupBy,
      durationDays,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/dashboard/challan-status?from=YYYY-MM-DD&to=YYYY-MM-DD
  // ─────────────────────────────────────────────────────────────────────────
  async getChallanStatus(from: Date, to: Date) {
    const [confirmed, draft, dispatched, cancelled] = await Promise.all([
      prisma.challan.count({ where: { status: 'CONFIRMED',  createdAt: { gte: from, lte: to } } }),
      prisma.challan.count({ where: { status: 'DRAFT',      createdAt: { gte: from, lte: to } } }),
      prisma.challan.count({ where: { status: 'DISPATCHED', createdAt: { gte: from, lte: to } } }),
      prisma.challan.count({ where: { status: 'CANCELLED',  createdAt: { gte: from, lte: to } } }),
    ]);
    const total = confirmed + draft + dispatched + cancelled;
    return { confirmed, draft, dispatched, cancelled, total };
  }
}