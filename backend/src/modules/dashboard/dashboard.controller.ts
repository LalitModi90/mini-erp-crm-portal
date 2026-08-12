import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { DashboardService } from './dashboard.service.js';
import { sendSuccess } from '../../utils/response.js';

const dashboardService = new DashboardService();

/** Parse YYYY-MM-DD → start of that day */
const parseDate = (s: string | undefined): Date | null => {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + 'T00:00:00.000');
  return isNaN(d.getTime()) ? null : d;
};

export class DashboardController {
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || '';
      const role   = req.user?.role || 'SALES';
      const stats  = await dashboardService.getStatsForRole(userId, role);
      return sendSuccess(res, stats, 'Dashboard statistics fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async getSalesOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const from  = parseDate(req.query.from as string);
      const toRaw = parseDate(req.query.to   as string);

      if (!from || !toRaw) {
        return res.status(400).json({
          success: false,
          message: 'Query params `from` and `to` are required in YYYY-MM-DD format',
        });
      }

      // Make `to` end-of-day so the full last day is included
      const to = new Date(toRaw);
      to.setHours(23, 59, 59, 999);

      if (from > to) {
        return res.status(400).json({
          success: false,
          message: '`from` date must not be after `to` date',
        });
      }

      const data = await dashboardService.getSalesOverview(from, to);
      return sendSuccess(res, data, 'Sales overview fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async getChallanStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const from  = parseDate(req.query.from as string);
      const toRaw = parseDate(req.query.to   as string);

      if (!from || !toRaw) {
        return res.status(400).json({
          success: false,
          message: 'Query params `from` and `to` are required in YYYY-MM-DD format',
        });
      }

      const to = new Date(toRaw);
      to.setHours(23, 59, 59, 999);

      if (from > to) {
        return res.status(400).json({
          success: false,
          message: '`from` date must not be after `to` date',
        });
      }

      const data = await dashboardService.getChallanStatus(from, to);
      return sendSuccess(res, data, 'Challan status fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}
