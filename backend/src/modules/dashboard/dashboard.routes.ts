import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
const controller = new DashboardController();

router.use(authenticate);

router.get('/stats',          (req, res, next) => controller.getStats(req, res, next));
router.get('/sales-overview', (req, res, next) => controller.getSalesOverview(req, res, next));
router.get('/challan-status', (req, res, next) => controller.getChallanStatus(req, res, next));

export default router;
