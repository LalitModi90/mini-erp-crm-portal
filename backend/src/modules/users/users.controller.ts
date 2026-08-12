import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { UsersService } from './users.service.js';
import { sendSuccess } from '../../utils/response.js';

const usersService = new UsersService();

export class UsersController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string;
      const users = await usersService.getAll(search);
      return sendSuccess(res, users);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.getById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.create(req.body);
      return sendSuccess(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.update(req.params.id, req.body);
      return sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async changeRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.changeRole(req.params.id, req.body.role, req.user!.id);
      return sendSuccess(res, user, 'User role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.deactivate(req.params.id, req.user!.id);
      return sendSuccess(res, user, 'User deactivated successfully');
    } catch (error) {
      next(error);
    }
  }

  async activate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.activate(req.params.id);
      return sendSuccess(res, user, 'User activated successfully');
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await new UsersService().createVerificationEmail(req.params.id);
      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.getById(req.params.id);
      if (user && user.id === req.user!.id) {
        return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
      }
      await usersService.delete(req.params.id);
      return sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}