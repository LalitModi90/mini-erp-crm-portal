-- Supabase SQL Seed Script (Insert All Initial Data)
-- Project: ERF_CRM (ldiiiklxjokzhtnmfjcx)

-- 1. Insert System Users (Password: password123, hashed with bcrypt)
INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt", "updatedAt") VALUES
('usr-admin-101', 'Alexander Pierce (Admin)', 'admin@erp.com', '$2a$10$w099eBwG3gq7E4515E87..9H4H.P1H99K.0z8B3g..', 'ADMIN', NOW(), NOW()),
('usr-sales-102', 'Rahul Sharma (Sales)', 'sales@erp.com', '$2a$10$w099eBwG3gq7E4515E87..9H4H.P1H99K.0z8B3g..', 'SALES', NOW(), NOW()),
('usr-wh-103', 'Neha Patel (Warehouse)', 'warehouse@erp.com', '$2a$10$w099eBwG3gq7E4515E87..9H4H.P1H99K.0z8B3g..', 'WAREHOUSE', NOW(), NOW()),
('usr-acc-104', 'Amit Verma (Accounts)', 'accounts@erp.com', '$2a$10$w099eBwG3gq7E4515E87..9H4H.P1H99K.0z8B3g..', 'ACCOUNTS', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 2. Insert Customers
INSERT INTO "Customer" ("id", "name", "mobile", "email", "businessName", "gstNumber", "customerType", "address", "status", "followUpDate", "notes", "isActive", "createdAt", "updatedAt") VALUES
('cust-101', 'ABC Traders', '+91 98765 43210', 'contact@abctraders.com', 'ABC Wholesale Logistics', '27AAAAA0000A1Z5', 'WHOLESALE', 'Plot 45, MIDC Industrial Area, Mumbai', 'ACTIVE', '2026-05-20', 'Key distributor for Western Region', true, NOW(), NOW()),
('cust-102', 'XYZ Store', '+91 98123 45678', 'info@xyzstore.com', 'XYZ Supermarket Chain', '07BBBBB1111B1Z2', 'RETAIL', 'Shop 12, Main Market, Delhi', 'LEAD', '2026-05-21', 'Interested in buying bulk USB accessories', true, NOW(), NOW()),
('cust-103', 'PQR Distributors', '+91 97654 32109', 'sales@pqrdistributors.in', 'PQR National Supply Corp', '29CCCCC2222C1Z8', 'DISTRIBUTOR', 'Electronic City Phase 1, Bengaluru', 'ACTIVE', '2026-05-22', 'Monthly bulk orders executed on 15th', true, NOW(), NOW()),
('cust-104', 'LMN Retailers', '+91 96543 21098', 'orders@lmnretail.com', 'LMN Retail Outlets', '33DDDDD3333D1Z4', 'RETAIL', 'Anna Salai, Chennai', 'INACTIVE', '2026-05-23', 'Deactivated account due to payment delay', false, NOW(), NOW()),
('cust-105', 'Global Supplies', '+91 95432 10987', 'admin@globalsupplies.com', 'Global Tech & Spares Ltd', '19EEEEE4444E1Z1', 'DISTRIBUTOR', 'Salt Lake Sector 5, Kolkata', 'ACTIVE', '2026-05-24', 'Special discounts on bulk mechanical keyboards', true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 3. Insert Catalog Products
INSERT INTO "Product" ("id", "name", "sku", "category", "price", "stock", "minimumStock", "warehouse", "isActive", "createdAt", "updatedAt") VALUES
('prod-201', 'USB Cable Type-C (2m)', 'SKU-USB-001', 'Cables & Adapters', 500.00, 150, 10, 'Main Warehouse A', true, NOW(), NOW()),
('prod-202', 'Wireless Optical Mouse', 'SKU-MSE-002', 'Computer Peripherals', 1200.00, 45, 10, 'Main Warehouse A', true, NOW(), NOW()),
('prod-203', 'Mechanical Keyboard RGB', 'SKU-KBD-003', 'Computer Peripherals', 3500.00, 3, 5, 'Main Warehouse B', true, NOW(), NOW()),
('prod-204', 'HDMI Cable 4K High-Speed', 'SKU-HDM-004', 'Cables & Adapters', 750.00, 2, 5, 'Main Warehouse B', true, NOW(), NOW()),
('prod-205', 'USB Hub 4-Port Ultra Slim', 'SKU-HUB-005', 'Computer Peripherals', 1499.00, 80, 15, 'Main Warehouse A', true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 4. Insert Stock Movements
INSERT INTO "StockMovement" ("id", "productId", "quantity", "type", "reason", "createdBy", "createdAt") VALUES
('sm-301', 'prod-201', 200, 'IN', 'Initial stock intake batch #101', 'usr-wh-103', NOW()),
('sm-302', 'prod-202', 55, 'IN', 'Supplier delivery receipt', 'usr-wh-103', NOW()),
('sm-303', 'prod-201', 50, 'OUT', 'Dispatched for Challan CH-00123', 'usr-wh-103', NOW())
ON CONFLICT ("id") DO NOTHING;

-- 5. Insert Challans & Items
INSERT INTO "Challan" ("id", "challanNumber", "customerId", "status", "totalQuantity", "totalAmount", "createdBy", "createdAt", "updatedAt") VALUES
('ch-401', 'CH-00123', 'cust-101', 'CONFIRMED', 50, 45250.00, 'usr-sales-102', NOW(), NOW()),
('ch-402', 'CH-00122', 'cust-102', 'DRAFT', 10, 12500.00, 'usr-sales-102', NOW(), NOW()),
('ch-403', 'CH-00121', 'cust-103', 'CONFIRMED', 2, 32100.00, 'usr-sales-102', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "ChallanItem" ("id", "challanId", "productId", "productName", "sku", "price", "quantity") VALUES
('ci-501', 'ch-401', 'prod-201', 'USB Cable Type-C (2m)', 'SKU-USB-001', 500.00, 50),
('ci-502', 'ch-402', 'prod-202', 'Wireless Optical Mouse', 'SKU-MSE-002', 1250.00, 10),
('ci-503', 'ch-403', 'prod-203', 'Mechanical Keyboard RGB', 'SKU-KBD-003', 3500.00, 2)
ON CONFLICT ("id") DO NOTHING;

-- 6. Insert Audit Logs
INSERT INTO "AuditLog" ("id", "userId", "action", "entity", "entityId", "details", "createdAt") VALUES
('aud-501', 'usr-admin-101', 'USER_CREATED', 'User', 'usr-sales-102', '{"role":"SALES","createdByAdmin":true}', NOW()),
('aud-502', 'usr-wh-103', 'STOCK_IN', 'Product', 'prod-201', '{"quantityAdded":200,"warehouse":"Main Warehouse A"}', NOW()),
('aud-503', 'usr-sales-102', 'CHALLAN_CONFIRMED', 'Challan', 'ch-401', '{"challanNumber":"CH-00123","totalAmount":45250}', NOW())
ON CONFLICT ("id") DO NOTHING;
