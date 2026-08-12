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
      mobile: '9876543210',
      email: 'abc.traders@gmail.com',
      businessName: 'ABC Electronics',
      gstNumber: '27AAAAA0000A1Z5',
      customerType: 'WHOLESALE',
      address: 'Plot 45, MIDC Industrial Area, Mumbai',
      status: 'ACTIVE',
      followUpDate: new Date('2024-05-20'),
      notes: 'Key distributor for Western Region',
      isActive: true,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      id: 'cust-102',
      name: 'XYZ Store',
      mobile: '8765432109',
      email: 'xyzstore@gmail.com',
      businessName: 'XYZ Retail Pvt. Ltd.',
      gstNumber: '07BBBBB1111B1Z2',
      customerType: 'RETAIL',
      address: 'Shop 12, Main Market, Delhi',
      status: 'LEAD',
      followUpDate: new Date('2024-05-21'),
      notes: 'Interested in buying bulk USB accessories',
      isActive: true,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      id: 'cust-103',
      name: 'PQR Distributors',
      mobile: '7654321098',
      email: 'pqr.distributors@gmail.com',
      businessName: 'PQR Distributors',
      gstNumber: '29CCCCC2222C1Z8',
      customerType: 'DISTRIBUTOR',
      address: 'Electronic City Phase 1, Bengaluru',
      status: 'ACTIVE',
      followUpDate: new Date('2024-05-22'),
      notes: 'Monthly bulk orders executed on 15th',
      isActive: true,
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      id: 'cust-104',
      name: 'LMN Retailers',
      mobile: '6543210987',
      email: 'lmnretailers@gmail.com',
      businessName: 'LMN Retailers',
      gstNumber: '33DDDDD3333D1Z4',
      customerType: 'RETAIL',
      address: 'Anna Salai, Chennai',
      status: 'ACTIVE',
      followUpDate: new Date('2024-05-23'),
      notes: 'Retail outlet partner',
      isActive: true,
    },
  });

  const customer5 = await prisma.customer.create({
    data: {
      id: 'cust-105',
      name: 'Global Supplies',
      mobile: '5432109876',
      email: 'globalsupplies@gmail.com',
      businessName: 'Global Supplies',
      gstNumber: '19EEEEE4444E1Z1',
      customerType: 'WHOLESALE',
      address: 'Salt Lake Sector 5, Kolkata',
      status: 'INACTIVE',
      followUpDate: null,
      notes: 'Inactive wholesale account',
      isActive: true,
    },
  });

  const customer6 = await prisma.customer.create({
    data: {
      id: 'cust-106',
      name: 'Shree Traders',
      mobile: '4321098765',
      email: 'shreetraders@gmail.com',
      businessName: 'Shree Enterprises',
      gstNumber: '27FFFFFF5555F1Z9',
      customerType: 'WHOLESALE',
      address: 'Ring Road, Surat',
      status: 'LEAD',
      followUpDate: new Date('2024-05-25'),
      notes: 'New textile & spares lead',
      isActive: true,
    },
  });

  const customer7 = await prisma.customer.create({
    data: {
      id: 'cust-107',
      name: 'R.K. Enterprises',
      mobile: '3210987654',
      email: 'rkenterprises@gmail.com',
      businessName: 'R.K. Enterprises',
      gstNumber: '08GGGGG6666G1Z3',
      customerType: 'DISTRIBUTOR',
      address: 'MI Road, Jaipur',
      status: 'ACTIVE',
      followUpDate: new Date('2024-05-26'),
      notes: 'Regional distributor',
      isActive: true,
    },
  });

  const customer8 = await prisma.customer.create({
    data: {
      id: 'cust-108',
      name: 'Vijay Brothers',
      mobile: '2109876543',
      email: 'vijaybrothers@gmail.com',
      businessName: 'Vijay Brothers',
      gstNumber: '09HHHHH7777H1Z7',
      customerType: 'RETAIL',
      address: 'Hazratganj, Lucknow',
      status: 'ACTIVE',
      followUpDate: new Date('2024-05-27'),
      notes: 'Retail chain partner',
      isActive: true,
    },
  });

  const customer9 = await prisma.customer.create({
    data: {
      id: 'cust-109',
      name: 'M.S. Traders',
      mobile: '1098765432',
      email: 'mstraders@gmail.com',
      businessName: 'M.S. Traders',
      gstNumber: '36JJJJJ8888J1Z6',
      customerType: 'WHOLESALE',
      address: 'Banjara Hills, Hyderabad',
      status: 'INACTIVE',
      followUpDate: null,
      notes: 'Temporal inactive state',
      isActive: true,
    },
  });

  const customer10 = await prisma.customer.create({
    data: {
      id: 'cust-110',
      name: 'B.K. Stores',
      mobile: '0987654321',
      email: 'bkstores@gmail.com',
      businessName: 'B.K. Stores',
      gstNumber: '24KKKKK9999K1Z0',
      customerType: 'RETAIL',
      address: 'CG Road, Ahmedabad',
      status: 'LEAD',
      followUpDate: new Date('2024-05-29'),
      notes: 'Retail store prospect',
      isActive: true,
    },
  });

  const extraCustomers = [
    { id: 'cust-111', name: 'Apex Electronics', email: 'apex.electronics@gmail.com', businessName: 'Apex Wholesale Ltd', mobile: '9876500001', customerType: 'WHOLESALE', status: 'ACTIVE', followUpDate: new Date('2024-06-01') },
    { id: 'cust-112', name: 'Bright Retailers', email: 'bright.retail@gmail.com', businessName: 'Bright Mart Chain', mobile: '9876500002', customerType: 'RETAIL', status: 'LEAD', followUpDate: new Date('2024-06-02') },
    { id: 'cust-113', name: 'Crown Distributors', email: 'crown.dist@gmail.com', businessName: 'Crown Logistics Corp', mobile: '9876500003', customerType: 'DISTRIBUTOR', status: 'ACTIVE', followUpDate: new Date('2024-06-03') },
    { id: 'cust-114', name: 'Delta Spares', email: 'delta.spares@gmail.com', businessName: 'Delta Tech & Tools', mobile: '9876500004', customerType: 'WHOLESALE', status: 'INACTIVE', followUpDate: null },
    { id: 'cust-115', name: 'Elite Mart', email: 'elitemart@gmail.com', businessName: 'Elite Super Stores', mobile: '9876500005', customerType: 'RETAIL', status: 'ACTIVE', followUpDate: new Date('2024-06-05') },
    { id: 'cust-116', name: 'Frontier Corp', email: 'frontier@gmail.com', businessName: 'Frontier National Supplies', mobile: '9876500006', customerType: 'DISTRIBUTOR', status: 'LEAD', followUpDate: new Date('2024-06-06') },
    { id: 'cust-117', name: 'Galaxy Digital', email: 'galaxy.digital@gmail.com', businessName: 'Galaxy Retail Hub', mobile: '9876500007', customerType: 'RETAIL', status: 'ACTIVE', followUpDate: new Date('2024-06-07') },
    { id: 'cust-118', name: 'Horizon Wholesale', email: 'horizon@gmail.com', businessName: 'Horizon Traders Group', mobile: '9876500008', customerType: 'WHOLESALE', status: 'ACTIVE', followUpDate: new Date('2024-06-08') },
    { id: 'cust-119', name: 'Imperial Goods', email: 'imperial@gmail.com', businessName: 'Imperial Enterprises', mobile: '9876500009', customerType: 'DISTRIBUTOR', status: 'INACTIVE', followUpDate: null },
    { id: 'cust-120', name: 'Jupiter Tech', email: 'jupiter.tech@gmail.com', businessName: 'Jupiter Supplies Pvt Ltd', mobile: '9876500010', customerType: 'WHOLESALE', status: 'LEAD', followUpDate: new Date('2024-06-10') },
    { id: 'cust-121', name: 'Kavya Enterprises', email: 'kavya@gmail.com', businessName: 'Kavya Retail Outlets', mobile: '9876500011', customerType: 'RETAIL', status: 'ACTIVE', followUpDate: new Date('2024-06-11') },
    { id: 'cust-122', name: 'Lotus Traders', email: 'lotus@gmail.com', businessName: 'Lotus Wholesale Mart', mobile: '9876500012', customerType: 'WHOLESALE', status: 'ACTIVE', followUpDate: new Date('2024-06-12') },
    { id: 'cust-123', name: 'Matrix Supply', email: 'matrix.supply@gmail.com', businessName: 'Matrix Logistics Corp', mobile: '9876500013', customerType: 'DISTRIBUTOR', status: 'LEAD', followUpDate: new Date('2024-06-13') },
    { id: 'cust-124', name: 'Nova Hardware', email: 'nova.hw@gmail.com', businessName: 'Nova Hardware & Spares', mobile: '9876500014', customerType: 'RETAIL', status: 'ACTIVE', followUpDate: new Date('2024-06-14') },
    { id: 'cust-125', name: 'Omkar Logistics', email: 'omkar@gmail.com', businessName: 'Omkar Wholesale Hub', mobile: '9876500015', customerType: 'WHOLESALE', status: 'INACTIVE', followUpDate: null },
    { id: 'cust-126', name: 'Prime Systems', email: 'prime.sys@gmail.com', businessName: 'Prime Retail Chain', mobile: '9876500016', customerType: 'RETAIL', status: 'ACTIVE', followUpDate: new Date('2024-06-16') },
    { id: 'cust-127', name: 'Quantum Goods', email: 'quantum@gmail.com', businessName: 'Quantum Distributors', mobile: '9876500017', customerType: 'DISTRIBUTOR', status: 'LEAD', followUpDate: new Date('2024-06-17') },
    { id: 'cust-128', name: 'Royal Digital', email: 'royal.digital@gmail.com', businessName: 'Royal Electronics & Spares', mobile: '9876500018', customerType: 'WHOLESALE', status: 'ACTIVE', followUpDate: new Date('2024-06-18') },
    { id: 'cust-129', name: 'Sunlight Mart', email: 'sunlight@gmail.com', businessName: 'Sunlight Super Stores', mobile: '9876500019', customerType: 'RETAIL', status: 'ACTIVE', followUpDate: new Date('2024-06-19') },
    { id: 'cust-130', name: 'Titan Wholesale', email: 'titan.ws@gmail.com', businessName: 'Titan National Enterprises', mobile: '9876500020', customerType: 'WHOLESALE', status: 'LEAD', followUpDate: new Date('2024-06-20') },
  ];

  for (const c of extraCustomers) {
    await prisma.customer.create({
      data: {
        id: c.id,
        name: c.name,
        email: c.email,
        businessName: c.businessName,
        mobile: c.mobile,
        gstNumber: `27EXT${c.id.replace('cust-', '')}0001Z9`,
        customerType: c.customerType,
        address: 'Commercial Hub, Tech City',
        status: c.status,
        followUpDate: c.followUpDate,
        notes: 'Seeded customer record',
        isActive: true,
      }
    });
  }

  console.log('✅ Created 30 Customer Accounts in Database');

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
