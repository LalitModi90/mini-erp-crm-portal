import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { ChallanService } from './challan.service.js';
import { sendSuccess } from '../../utils/response.js';

const challanService = new ChallanService();

export class ChallanController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const challans = await challanService.getAll();
      return sendSuccess(res, challans);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const challan = await challanService.getById(req.params.id);
      if (!challan) return res.status(404).json({ success: false, message: 'Challan not found' });
      return sendSuccess(res, challan);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const challan = await challanService.create({
        ...req.body,
        createdBy: req.user?.id,
      });
      return sendSuccess(res, challan, 'Challan created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async confirm(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const confirmed = await challanService.confirmChallan(req.params.id, req.user?.id);
      return sendSuccess(res, confirmed, 'Challan confirmed and stock inventory reduced');
    } catch (error) {
      next(error);
    }
  }
}

