import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { sendError } from '../utils/response.js';

export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return sendError(res, 'Validation error', 400, result.error.flatten().fieldErrors);
    }
    req.body = result.data;
    next();
  };
};