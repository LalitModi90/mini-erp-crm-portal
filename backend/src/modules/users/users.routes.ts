import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';

const router = Router();
const controller = new UsersController();

router.use(authenticate);

// User management is ADMIN-only (read, write, and modifications)
router.get('/', authorizeRoles('ADMIN'), (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', authorizeRoles('ADMIN'), (req, res, next) => controller.getById(req, res, next));
router.post('/', authorizeRoles('ADMIN'), (req, res, next) => controller.create(req, res, next));
router.put('/:id', authorizeRoles('ADMIN'), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', authorizeRoles('ADMIN'), (req, res, next) => controller.delete(req, res, next));

export default router;
