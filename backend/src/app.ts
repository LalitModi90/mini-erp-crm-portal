import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error.middleware.js';

import authRoutes from './modules/auth/auth.routes.js';
import customerRoutes from './modules/customers/customer.routes.js';
import productRoutes from './modules/products/product.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import challanRoutes from './modules/challans/challan.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import { InventoryController } from './modules/inventory/inventory.controller.js';
import { authenticate } from './middleware/auth.middleware.js';
import { authorizeRoles } from './middleware/role.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

const inventoryController = new InventoryController();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/users', usersRoutes);


// Stock Movement & Adjustment Specific Endpoints
app.post(
  '/api/products/:id/stock',
  authenticate,
  authorizeRoles('ADMIN', 'WAREHOUSE'),
  (req, res, next) => inventoryController.adjustStock(req, res, next)
);

app.get(
  '/api/stock-movement',
  authenticate,
  authorizeRoles('ADMIN', 'WAREHOUSE', 'ACCOUNTS'),
  (req, res, next) => inventoryController.getMovements(req, res, next)
);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use(errorHandler);

export default app;

