import { Router } from 'express';
import { CustomerController } from './customer.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';

const router = Router();
const controller = new CustomerController();

router.use(authenticate);
router.get('/', authorizeRoles('ADMIN', 'SALES', 'ACCOUNTS'), (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', authorizeRoles('ADMIN', 'SALES', 'ACCOUNTS'), (req, res, next) => controller.getById(req, res, next));
router.post('/', authorizeRoles('ADMIN', 'SALES'), (req, res, next) => controller.create(req, res, next));
router.put('/:id', authorizeRoles('ADMIN', 'SALES'), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', authorizeRoles('ADMIN'), (req, res, next) => controller.delete(req, res, next));

export default router;


