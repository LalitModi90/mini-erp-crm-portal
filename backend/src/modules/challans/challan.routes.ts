import { Router } from 'express';
import { ChallanController } from './challan.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';

const router = Router();
const controller = new ChallanController();

router.use(authenticate);
router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));
router.post('/', authorizeRoles('ADMIN', 'SALES'), (req, res, next) => controller.create(req, res, next));
router.patch('/:id/confirm', authorizeRoles('ADMIN', 'SALES'), (req, res, next) => controller.confirm(req, res, next));

export default router;

