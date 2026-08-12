import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createUserSchema, updateUserSchema, changeRoleSchema } from './users.validation.js';

const router = Router();
const controller = new UsersController();

router.use(authenticate);

// User management is ADMIN-only (read, write, and modifications)
router.get('/', authorizeRoles('ADMIN'), (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', authorizeRoles('ADMIN'), (req, res, next) => controller.getById(req, res, next));
router.post('/', authorizeRoles('ADMIN'), validate(createUserSchema), (req, res, next) => controller.create(req, res, next));
router.put('/:id', authorizeRoles('ADMIN'), validate(updateUserSchema), (req, res, next) => controller.update(req, res, next));
router.patch('/:id/role', authorizeRoles('ADMIN'), validate(changeRoleSchema), (req, res, next) => controller.changeRole(req, res, next));
router.patch('/:id/deactivate', authorizeRoles('ADMIN'), (req, res, next) => controller.deactivate(req, res, next));
router.patch('/:id/activate', authorizeRoles('ADMIN'), (req, res, next) => controller.activate(req, res, next));
router.post('/:id/resend-verification', authorizeRoles('ADMIN'), (req, res, next) => controller.resendVerification(req, res, next));
router.delete('/:id', authorizeRoles('ADMIN'), (req, res, next) => controller.delete(req, res, next));

export default router;