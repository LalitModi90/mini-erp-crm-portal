import { Router } from 'express';
import { InventoryController } from './inventory.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';

const router = Router();
const controller = new InventoryController();

router.use(authenticate);
router.get('/', authorizeRoles('ADMIN', 'WAREHOUSE', 'ACCOUNTS'), (req, res, next) => controller.getAllStock(req, res, next));
router.get('/movements', (req, res, next) => controller.getMovements(req, res, next));
router.post('/stock', authorizeRoles('ADMIN', 'WAREHOUSE'), (req, res, next) => controller.adjustStock(req, res, next));
router.post('/adjust', (req, res, next) => controller.adjustStock(req, res, next));

export default router;

