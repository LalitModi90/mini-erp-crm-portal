import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { CustomerService } from './customer.service.js';
import { sendSuccess } from '../../utils/response.js';

const customerService = new CustomerService();

export class CustomerController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string;
      const customers = await customerService.getAll(search);
      return sendSuccess(res, customers);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.getById(req.params.id);
      if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
      return sendSuccess(res, customer);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.create(req.body);
      return sendSuccess(res, customer, 'Customer created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.update(req.params.id, req.body);
      return sendSuccess(res, customer, 'Customer updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await customerService.delete(req.params.id);
      return sendSuccess(res, null, 'Customer soft-deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}


