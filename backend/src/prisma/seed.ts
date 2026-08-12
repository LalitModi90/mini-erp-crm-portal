import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear existing seed data in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned previous test database records.');

  // 2. Password Hash
  const passwordHash = await bcrypt.hash('password123', 10);

  // 3. Seed Users
  const adminUser = await prisma.user.create({
    data: {
      id: 'usr-admin-101',
      name: 'Alexander Pierce (Admin)',
      email: 'admin@erp.com',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      id: 'usr-sales-102',
      name: 'Rahul Sharma (Sales)',
      email: 'sales@erp.com',
      password: passwordHash,
      role: 'SALES',
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      id: 'usr-wh-103',
      name: 'Neha Patel (Warehouse)',
      email: 'warehouse@erp.com',
      password: passwordHash,
      role: 'WAREHOUSE',
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      id: 'usr-acc-104',
      name: 'Amit Verma (Accounts)',
      email: 'accounts@erp.com',
      password: passwordHash,
      role: 'ACCOUNTS',
    },
  });

  const salesUser2 = await prisma.user.create({
    data: {
      id: 'usr-sales-201',
      name: 'Vikram Kumar (Sales)',
      email: 'vikram@erp.com',
      password: passwordHash,
      role: 'SALES',
    },
  });

  const salesUser3 = await prisma.user.create({
    data: {
      id: 'usr-sales-202',
      name: 'Arjun Bhatt (Sales)',
      email: 'arjun@erp.com',
      password: passwordHash,
      role: 'SALES',
    },
  });

  const warehouseUser2 = await prisma.user.create({
    data: {
      id: 'usr-wh-203',
      name: 'Yogesh Patel (Warehouse)',
      email: 'yogesh@erp.com',
      password: passwordHash,
      role: 'WAREHOUSE',
    },
  });

  const accountsUser2 = await prisma.user.create({
    data: {
      id: 'usr-acc-204',
      name: 'Pooja Shah (Accounts)',
      email: 'pooja@erp.com',
      password: passwordHash,
      role: 'ACCOUNTS',
    },
  });

  const salesUser4 = await prisma.user.create({
    data: {
      id: 'usr-sales-205',
      name: 'Rohan Sen (Sales)',
      email: 'rohan@erp.com',
      password: passwordHash,
      role: 'SALES',
    },
  });

  const warehouseUser3 = await prisma.user.create({
    data: {
      id: 'usr-wh-206',
      name: 'Manish Jain (Warehouse)',
      email: 'manish@erp.com',
      password: passwordHash,
      role: 'WAREHOUSE',
    },
  });

  console.log('✅ Created 10 System Users (Admin, Sales, Warehouse, Accounts)');

  // 4. Seed Customers
  const customer1 = await prisma.customer.create({
    data: {
      id: 'cust-101',
      name: 'ABC Traders',
      mobile: '+91 98765 43210',
      email: 'contact@abctraders.com',
      businessName: 'ABC Wholesale Logistics',
      gstNumber: '27AAAAA0000A1Z5',
      customerType: 'WHOLESALE',
      address: 'Plot 45, MIDC Industrial Area, Mumbai',
      status: 'ACTIVE',
      followUpDate: new Date('2026-05-20'),
      notes: 'Key distributor for Western Region',
      isActive: true,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      id: 'cust-102',
      name: 'XYZ Store',
      mobile: '+91 98123 45678',
      email: 'info@xyzstore.com',
      businessName: 'XYZ Supermarket Chain',
      gstNumber: '07BBBBB1111B1Z2',
      customerType: 'RETAIL',
      address: 'Shop 12, Main Market, Delhi',
      status: 'LEAD',
      followUpDate: new Date('2026-05-21'),
      notes: 'Interested in buying bulk USB accessories',
      isActive: true,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      id: 'cust-103',
      name: 'PQR Distributors',
      mobile: '+91 97654 32109',
      email: 'sales@pqrdistributors.in',
      businessName: 'PQR National Supply Corp',
      gstNumber: '29CCCCC2222C1Z8',
      customerType: 'DISTRIBUTOR',
      address: 'Electronic City Phase 1, Bengaluru',
      status: 'ACTIVE',
      followUpDate: new Date('2026-05-22'),
      notes: 'Monthly bulk orders executed on 15th',
      isActive: true,
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      id: 'cust-104',
      name: 'LMN Retailers',
      mobile: '+91 96543 21098',
      email: 'orders@lmnretail.com',
      businessName: 'LMN Retail Outlets',
      gstNumber: '33DDDDD3333D1Z4',
      customerType: 'RETAIL',
      address: 'Anna Salai, Chennai',
      status: 'INACTIVE',
      followUpDate: new Date('2026-05-23'),
      notes: 'Deactivated account due to payment delay',
      isActive: false,
    },
  });

  const customer5 = await prisma.customer.create({
    data: {
      id: 'cust-105',
      name: 'Global Supplies',
      mobile: '+91 95432 10987',
      email: 'admin@globalsupplies.com',
      businessName: 'Global Tech & Spares Ltd',
      gstNumber: '19EEEEE4444E1Z1',
      customerType: 'DISTRIBUTOR',
      address: 'Salt Lake Sector 5, Kolkata',
      status: 'ACTIVE',
      followUpDate: new Date('2026-05-24'),
      notes: 'Special discounts on bulk mechanical keyboards',
      isActive: true,
    },
  });

  console.log('✅ Created 5 Customer Accounts');

  // 5. Seed Products
  const prod1 = await prisma.product.create({
    data: {
      id: 'prod-201',
      name: 'USB Cable Type-C (2m)',
      sku: 'SKU-USB-001',
      category: 'Cables & Adapters',
      price: 500.00,
      stock: 150,
      minimumStock: 10,
      warehouse: 'Main Warehouse A',
      isActive: true,
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      id: 'prod-202',
      name: 'Wireless Optical Mouse',
      sku: 'SKU-MSE-002',
      category: 'Computer Peripherals',
      price: 1200.00,
      stock: 45,
      minimumStock: 10,
      warehouse: 'Main Warehouse A',
      isActive: true,
    },
  });

  const prod3 = await prisma.product.create({
    data: {
      id: 'prod-203',
      name: 'Mechanical Keyboard RGB',
      sku: 'SKU-KBD-003',
      category: 'Computer Peripherals',
      price: 3500.00,
      stock: 3, // Low stock alert!
      minimumStock: 5,
      warehouse: 'Main Warehouse B',
      isActive: true,
    },
  });

  const prod4 = await prisma.product.create({
    data: {
      id: 'prod-204',
      name: 'HDMI Cable 4K High-Speed',
      sku: 'SKU-HDM-004',
      category: 'Cables & Adapters',
      price: 750.00,
      stock: 2, // Low stock alert!
      minimumStock: 5,
      warehouse: 'Main Warehouse B',
      isActive: true,
    },
  });

  const prod5 = await prisma.product.create({
    data: {
      id: 'prod-205',
      name: 'USB Hub 4-Port Ultra Slim',
      sku: 'SKU-HUB-005',
      category: 'Computer Peripherals',
      price: 1499.00,
      stock: 80,
      minimumStock: 15,
      warehouse: 'Main Warehouse A',
      isActive: true,
    },
  });

  console.log('✅ Created 5 Catalog Products');

  // 6. Seed Stock Movements (Ledger Integrity)
  await prisma.stockMovement.createMany({
    data: [
      {
        id: 'sm-301',
        productId: prod1.id,
        quantity: 200,
        type: 'IN',
        reason: 'Initial stock intake batch #101',
        createdBy: warehouseUser.id,
      },
      {
        id: 'sm-302',
        productId: prod2.id,
        quantity: 55,
        type: 'IN',
        reason: 'Supplier delivery receipt',
        createdBy: warehouseUser.id,
      },
      {
        id: 'sm-303',
        productId: prod1.id,
        quantity: 50,
        type: 'OUT',
        reason: 'Dispatched for Challan CH-00123',
        createdBy: warehouseUser.id,
      },
    ],
  });

  console.log('✅ Created Stock Movements (Ledger Records)');

  // Relative dates calculation (so data remains relative to run-time)
  const d0 = new Date(); // Today
  const d1 = new Date(Date.now() - 1 * 24 * 3600000); // Yesterday
  const d2 = new Date(Date.now() - 2 * 24 * 3600000); // 2 days ago
  const d3 = new Date(Date.now() - 3 * 24 * 3600000); // 3 days ago
  const d4 = new Date(Date.now() - 4 * 24 * 3600000); // 4 days ago
  const d5 = new Date(Date.now() - 5 * 24 * 3600000); // 5 days ago
  const d6 = new Date(Date.now() - 6 * 24 * 3600000); // 6 days ago
  const d7 = new Date(Date.now() - 7 * 24 * 3600000); // 7 days ago
  const d8 = new Date(Date.now() - 10 * 24 * 3600000); // 10 days ago
  const d9 = new Date(Date.now() - 12 * 24 * 3600000); // 12 days ago
  const d10 = new Date(Date.now() - 15 * 24 * 3600000); // 15 days ago
  const d11 = new Date(Date.now() - 20 * 24 * 3600000); // 20 days ago
  const d12 = new Date(Date.now() - 25 * 24 * 3600000); // 25 days ago
  const d13 = new Date(Date.now() - 40 * 24 * 3600000); // 40 days ago (Last Month)

  // 7. Seed Challans & ChallanItems with custom dates for graph visualization
  const challanData = [
    {
      id: 'ch-401',
      challanNumber: 'CH-00123',
      customerId: customer1.id,
      status: 'CONFIRMED',
      totalQuantity: 25,
      totalAmount: 12500.00,
      createdBy: salesUser.id,
      createdAt: d2,
      items: {
        create: [
          { productId: prod1.id, productName: prod1.name, sku: prod1.sku, price: 500.00, quantity: 25 }
        ]
      }
    },
    {
      id: 'ch-402',
      challanNumber: 'CH-00122',
      customerId: customer2.id,
      status: 'DRAFT',
      totalQuantity: 10,
      totalAmount: 12500.00,
      createdBy: salesUser.id,
      createdAt: d1,
      items: {
        create: [
          { productId: prod2.id, productName: prod2.name, sku: prod2.sku, price: 1250.00, quantity: 10 }
        ]
      }
    },
    {
      id: 'ch-403',
      challanNumber: 'CH-00121',
      customerId: customer3.id,
      status: 'CONFIRMED',
      totalQuantity: 9,
      totalAmount: 31500.00,
      createdBy: salesUser.id,
      createdAt: d2,
      items: {
        create: [
          { productId: prod3.id, productName: prod3.name, sku: prod3.sku, price: 3500.00, quantity: 9 }
        ]
      }
    },
    {
      id: 'ch-404',
      challanNumber: 'CH-00124',
      customerId: customer1.id,
      status: 'CONFIRMED',
      totalQuantity: 38,
      totalAmount: 19000.00,
      createdBy: salesUser.id,
      createdAt: d3,
      items: {
        create: [
          { productId: prod1.id, productName: prod1.name, sku: prod1.sku, price: 500.00, quantity: 38 }
        ]
      }
    },
    {
      id: 'ch-405',
      challanNumber: 'CH-00125',
      customerId: customer3.id,
      status: 'CONFIRMED',
      totalQuantity: 8,
      totalAmount: 28000.00,
      createdBy: salesUser.id,
      createdAt: d4,
      items: {
        create: [
          { productId: prod3.id, productName: prod3.name, sku: prod3.sku, price: 3500.00, quantity: 8 }
        ]
      }
    },
    {
      id: 'ch-406',
      challanNumber: 'CH-00126',
      customerId: customer5.id,
      status: 'CONFIRMED',
      totalQuantity: 30,
      totalAmount: 22500.00,
      createdBy: salesUser.id,
      createdAt: d5,
      items: {
        create: [
          { productId: prod4.id, productName: prod4.name, sku: prod4.sku, price: 750.00, quantity: 30 }
        ]
      }
    },
    {
      id: 'ch-407',
      challanNumber: 'CH-00127',
      customerId: customer2.id,
      status: 'CONFIRMED',
      totalQuantity: 27,
      totalAmount: 40473.00,
      createdBy: salesUser.id,
      createdAt: d6,
      items: {
        create: [
          { productId: prod5.id, productName: prod5.name, sku: prod5.sku, price: 1499.00, quantity: 27 }
        ]
      }
    },
    {
      id: 'ch-408',
      challanNumber: 'CH-00128',
      customerId: customer1.id,
      status: 'CONFIRMED',
      totalQuantity: 56,
      totalAmount: 28000.00,
      createdBy: salesUser.id,
      createdAt: d7,
      items: {
        create: [
          { productId: prod1.id, productName: prod1.name, sku: prod1.sku, price: 500.00, quantity: 56 }
        ]
      }
    },
    {
      id: 'ch-409',
      challanNumber: 'CH-00129',
      customerId: customer5.id,
      status: 'CONFIRMED',
      totalQuantity: 19,
      totalAmount: 28481.00,
      createdBy: salesUser.id,
      createdAt: d8,
      items: {
        create: [
          { productId: prod5.id, productName: prod5.name, sku: prod5.sku, price: 1499.00, quantity: 19 }
        ]
      }
    },
    {
      id: 'ch-410',
      challanNumber: 'CH-00130',
      customerId: customer3.id,
      status: 'CONFIRMED',
      totalQuantity: 10,
      totalAmount: 35000.00,
      createdBy: salesUser.id,
      createdAt: d0,
      items: {
        create: [
          { productId: prod3.id, productName: prod3.name, sku: prod3.sku, price: 3500.00, quantity: 10 }
        ]
      }
    },
    {
      id: 'ch-411',
      challanNumber: 'CH-00131',
      customerId: customer2.id,
      status: 'CANCELLED',
      totalQuantity: 5,
      totalAmount: 6000.00,
      createdBy: salesUser.id,
      createdAt: d9,
      items: {
        create: [
          { productId: prod2.id, productName: prod2.name, sku: prod2.sku, price: 1200.00, quantity: 5 }
        ]
      }
    },
    {
      id: 'ch-412',
      challanNumber: 'CH-00132',
      customerId: customer4.id,
      status: 'DRAFT',
      totalQuantity: 12,
      totalAmount: 9000.00,
      createdBy: salesUser.id,
      createdAt: d10,
      items: {
        create: [
          { productId: prod4.id, productName: prod4.name, sku: prod4.sku, price: 750.00, quantity: 12 }
        ]
      }
    },
    {
      id: 'ch-413',
      challanNumber: 'CH-00133',
      customerId: customer5.id,
      status: 'DISPATCHED',
      totalQuantity: 15,
      totalAmount: 22485.00,
      createdBy: salesUser.id,
      createdAt: d13,
      items: {
        create: [
          { productId: prod5.id, productName: prod5.name, sku: prod5.sku, price: 1499.00, quantity: 15 }
        ]
      }
    }
  ];

  for (const item of challanData) {
    await prisma.challan.create({
      data: item
    });
  }

  console.log('✅ Created Delivery Challans & Snapshotted Items');

  // 8. Seed Audit Logs (Structured JSON Details)
  await prisma.auditLog.createMany({
    data: [
      {
        id: 'aud-501',
        userId: adminUser.id,
        action: 'USER_CREATED',
        entity: 'User',
        entityId: salesUser.id,
        details: JSON.stringify({ role: 'SALES', createdByAdmin: true }),
      },
      {
        id: 'aud-502',
        userId: warehouseUser.id,
        action: 'STOCK_IN',
        entity: 'Product',
        entityId: prod1.id,
        details: JSON.stringify({ quantityAdded: 200, warehouse: 'Main Warehouse A' }),
      },
      {
        id: 'aud-503',
        userId: salesUser.id,
        action: 'CHALLAN_CONFIRMED',
        entity: 'Challan',
        entityId: 'ch-401',
        details: JSON.stringify({ challanNumber: 'CH-00123', totalAmount: 12500.00 }),
      },
    ],
  });

  console.log('✅ Created Structured JSON Audit Logs');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
