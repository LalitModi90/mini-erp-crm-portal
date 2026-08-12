import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { InventoryService } from './inventory.service.js';
import { sendSuccess } from '../../utils/response.js';

const inventoryService = new InventoryService();

export class InventoryController {
  async getAllStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stock = await inventoryService.getAllStock();
      return sendSuccess(res, stock);
    } catch (error) {
      next(error);
    }
  }

  async adjustStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = req.params.id || req.body.productId;
      const { quantity, type, reason } = req.body;
      const result = await inventoryService.adjustStock(productId, quantity, type, reason, req.user?.id);
      return sendSuccess(res, result, 'Stock updated and movement logged');
    } catch (error) {
      next(error);
    }
  }

  async getMovements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const movements = await inventoryService.getMovements();
      return sendSuccess(res, movements);
    } catch (error) {
      next(error);
    }
  }
}

