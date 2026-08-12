import { Router } from 'express';
import { AuditController } from './audit.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';

const router = Router();
const controller = new AuditController();

router.use(authenticate);
router.use(authorizeRoles('ADMIN'));
router.get('/', (req, res, next) => controller.getLogs(req, res, next));

export default router;
