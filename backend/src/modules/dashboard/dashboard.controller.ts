import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { DashboardService } from './dashboard.service.js';
import { sendSuccess } from '../../utils/response.js';

const dashboardService = new DashboardService();

export class DashboardController {
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || '';
      const role = req.user?.role || 'SALES';

      const stats = await dashboardService.getStatsForRole(userId, role);
      return sendSuccess(res, stats, 'Dashboard statistics fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}
