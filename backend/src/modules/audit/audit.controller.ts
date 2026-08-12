import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { AuditService } from './audit.service.js';
import { sendSuccess } from '../../utils/response.js';

const auditService = new AuditService();

export class AuditController {
  async getLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;

      const result = await auditService.getLogs(page, limit, search);
      return sendSuccess(res, result, 'Audit logs fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}
