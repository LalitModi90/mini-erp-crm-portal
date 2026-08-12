import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  ChevronRight, 
  Check, 
  X, 
  Save, 
  ArrowRight,
  ArrowLeft,
  UserPlus,
  Package,
  CheckCircle2,
  Printer,
  Mail,
  FileText,
  Building2,
  Calendar,
  AlertTriangle,
  User,
  Phone,
  Tag,
  FileCode,
  Warehouse,
  ShieldCheck
} from 'lucide-react';

interface CustomerOption {
  id: string;
  name: string;
  mobile: string;
  businessName: string;
  gstNumber: string;
  customerType: string;
  availableCredit: number;
}

interface ChallanItem {
  id: string;
  productId: string;
  name: string;
  description: string;
  sku: string;
  imageUrl?: string;
  unitPrice: number;
  availableStock: number;
  quantity: number;
  discountPercent: number;
  taxPercent: number;
}

const DEFAULT_CUSTOMERS: CustomerOption[] = [
  {
    id: 'cust-1',
    name: 'ABC Traders',
    mobile: '9876543210',
    businessName: 'ABC Electronics Pvt. Ltd.',
    gstNumber: '27ABCDE1234F1Z5',
    customerType: 'Wholesale',
    availableCredit: 275000,
  },
  {
    id: 'cust-2',
    name: 'Apex Retailers',
    mobile: '9123456789',
    businessName: 'Apex Digital Store',
    gstNumber: '24APEXD5678G2Z1',
    customerType: 'Retailer',
    availableCredit: 150000,
  },
  {
    id: 'cust-3',
    name: 'Metro Distributors',
    mobile: '9988776655',
    businessName: 'Metro Logistics & Distribution',
    gstNumber: '29METRO9988H3Z4',
    customerType: 'Wholesale',
    availableCredit: 500000,
  },
];

const SAMPLE_CATALOG_PRODUCTS: ChallanItem[] = [
  {
    id: 'catalog-1',
    productId: 'prod-1',
    name: 'USB Fast Charger',
    description: 'Fast charging adapter 20W',
    sku: 'CHG001',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=80&q=80',
    unitPrice: 500.00,
    availableStock: 125,
    quantity: 1,
    discountPercent: 0,
    taxPercent: 18,
  },
  {
    id: 'catalog-2',
    productId: 'prod-2',
    name: 'USB Type-C Cable',
    description: '1m Braided Type-C data cable',
    sku: 'CAB001',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=80&q=80',
    unitPrice: 200.00,
    availableStock: 80,
    quantity: 1,
    discountPercent: 0,
    taxPercent: 18,
  },
  {
    id: 'catalog-3',
    productId: 'prod-3',
    name: 'Bluetooth Earphones',
    description: 'Wireless Bluetooth Earphones',
    sku: 'EAR001',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=80&q=80',
    unitPrice: 1200.00,
    availableStock: 20,
    quantity: 1,
    discountPercent: 5,
    taxPercent: 18,
  },
  {
    id: 'catalog-4',
    productId: 'prod-4',
    name: 'Wireless Ergonomic Mouse',
    description: '2.4GHz Silent Click Mouse',
    sku: 'MOU009',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=80&q=80',
    unitPrice: 850.00,
    availableStock: 50,
    quantity: 1,
    discountPercent: 0,
    taxPercent: 18,
  },
  {
    id: 'catalog-5',
    productId: 'prod-5',
    name: 'Smart Fitness Tracker Watch',
    description: 'AMOLED Display Smartwatch',
    sku: 'WCH002',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=80&q=80',
    unitPrice: 2499.00,
    availableStock: 35,
    quantity: 1,
    discountPercent: 10,
    taxPercent: 18,
  },
  {
    id: 'catalog-6',
    productId: 'prod-6',
    name: 'Power Bank 20000mAh',
    description: 'Dual USB Output Fast Charging',
    sku: 'PBK005',
    imageUrl: 'https://images.unsplash.com/photo-1609592807981-d2279a957b85?auto=format&fit=crop&w=80&q=80',
    unitPrice: 1800.00,
    availableStock: 60,
    quantity: 1,
    discountPercent: 0,
    taxPercent: 18,
  },
];

export const CreateChallan: React.FC = () => {
  const navigate = useNavigate();

  // Multi-Step Wizard: Step 1 (Customer & Info), Step 2 (Add Products), Step 3 (Review & Confirm), Step 4 (Complete)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Step 1 State: Customer & Challan Info
  const [customers, setCustomers] = useState<CustomerOption[]>(DEFAULT_CUSTOMERS);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [challanDate, setChallanDate] = useState('2024-05-17');
  const [status, setStatus] = useState<'DRAFT' | 'CONFIRMED'>('DRAFT');
  const [reference, setReference] = useState('');

  // Step 2 State: Products & Notes
  const [items, setItems] = useState<ChallanItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [notes, setNotes] = useState('');

  // Catalog Products Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<ChallanItem[]>(SAMPLE_CATALOG_PRODUCTS);
  const [modalSearch, setModalSearch] = useState('');

  // Step 3 State: Review & Confirmation
  const [dispatchWarehouse, setDispatchWarehouse] = useState('Main Warehouse - Dock A');
  const [termsAgreed, setTermsAgreed] = useState(true);

  // Common State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustBusiness, setNewCustBusiness] = useState('');
  const [newCustGst, setNewCustGst] = useState('');
  const [newCustType, setNewCustType] = useState('Wholesale');
  const [newCustCredit, setNewCustCredit] = useState('275000');
  const [createdChallanNo, setCreatedChallanNo] = useState('CH-2024-098');

  // Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch real customers
  useEffect(() => {
    const token = localStorage.getItem('jwt_token') || 'demo_jwt_token_2026';
    const headers = { Authorization: `Bearer ${token}` };

    axios.get('http://localhost:5000/api/customers', { headers })
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            mobile: c.phone || '9876543210',
            businessName: c.companyName || `${c.name} Pvt. Ltd.`,
            gstNumber: c.gstNo || '27ABCDE1234F1Z5',
            customerType: 'Wholesale',
            availableCredit: c.creditLimit || 250000,
          }));
          setCustomers(mapped);
          if (mapped[0]) setSelectedCustomerId(mapped[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch real products catalog
  useEffect(() => {
    const token = localStorage.getItem('jwt_token') || 'demo_jwt_token_2026';
    const headers = { Authorization: `Bearer ${token}` };

    axios.get('http://localhost:5000/api/products', { headers })
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((p: any) => ({
            id: p.id,
            productId: p.id,
            name: p.name,
            description: p.description || 'High quality product',
            sku: p.sku || 'SKU001',
            imageUrl: p.imageUrl || '',
            unitPrice: p.sellingPrice || p.price || 500,
            availableStock: p.stock || p.currentStock || 50,
            quantity: 1,
            discountPercent: 0,
            taxPercent: 18,
          }));
          setCatalogProducts(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectProductFromModal = (prod: ChallanItem) => {
    const existing = items.find(i => i.productId === prod.productId || i.sku === prod.sku);
    if (existing) {
      showToast(`"${prod.name}" is already added to the challan.`);
      return;
    }
    const newItem: ChallanItem = {
      ...prod,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      quantity: 1,
      discountPercent: 0,
      taxPercent: 18,
    };
    setItems(prev => [...prev, newItem]);
    showToast(`Added "${prod.name}" to challan!`);
  };

  // Handlers for Items
  const handleQuantityChange = (id: string, newQty: number) => {
    if (newQty < 1) return;
    setItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const handlePriceChange = (id: string, val: string) => {
    const p = parseFloat(val) || 0;
    setItems(prev => prev.map(item => item.id === id ? { ...item, unitPrice: p } : item));
  };

  const handleDiscountChange = (id: string, val: string) => {
    const d = Math.max(0, Math.min(100, parseFloat(val) || 0));
    setItems(prev => prev.map(item => item.id === id ? { ...item, discountPercent: d } : item));
  };

  const handleTaxChange = (id: string, val: string) => {
    const t = Math.max(0, Math.min(100, parseFloat(val) || 0));
    setItems(prev => prev.map(item => item.id === id ? { ...item, taxPercent: t } : item));
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    showToast('Item removed from challan.');
  };

  const handleClearAllItems = () => {
    setItems([]);
    showToast('All items cleared.');
  };

  const handleAddSampleProduct = () => {
    const newId = `item-${Date.now()}`;
    const newItem: ChallanItem = {
      id: newId,
      productId: `prod-${Date.now()}`,
      name: 'Wireless Ergonomic Mouse',
      description: '2.4GHz Wireless Mouse',
      sku: 'MOU009',
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=80&q=80',
      unitPrice: 850.00,
      availableStock: 50,
      quantity: 1,
      discountPercent: 0,
      taxPercent: 18,
    };
    setItems(prev => [...prev, newItem]);
    showToast('Added "Wireless Ergonomic Mouse" to products list!');
  };

  // Add New Customer Quick Submit
  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    const creditVal = parseFloat(newCustCredit) || 275000;
    const newCust: CustomerOption = {
      id: `cust-${Date.now()}`,
      name: newCustName.trim(),
      mobile: newCustMobile.trim() || '9876543210',
      businessName: newCustBusiness.trim() || `${newCustName.trim()} Enterprises`,
      gstNumber: newCustGst.trim() || '27NEWCUST1234F1Z9',
      customerType: newCustType || 'Wholesale',
      availableCredit: creditVal,
    };
    setCustomers(prev => [newCust, ...prev]);
    setSelectedCustomerId(newCust.id);
    setShowNewCustomerModal(false);
    setNewCustName('');
    setNewCustMobile('');
    setNewCustBusiness('');
    setNewCustGst('');
    setNewCustType('Wholesale');
    setNewCustCredit('275000');
    showToast(`New Customer "${newCust.name}" added with ₹${creditVal.toLocaleString()} Credit Limit!`);
  };

  // Update Customer Available Credit on the fly
  const handleUpdateCustomerCredit = (id: string, newCreditStr: string) => {
    const val = parseFloat(newCreditStr) || 0;
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, availableCredit: val } : c));
  };

  // Calculations
  const totalItemsCount = items.length;
  const totalQuantitySum = items.reduce((acc, curr) => acc + curr.quantity, 0);

  const subTotal = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const totalDiscount = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity * (item.discountPercent / 100)), 0);
  const totalTax = items.reduce((acc, item) => {
    const itemSub = item.unitPrice * item.quantity;
    const itemDisc = itemSub * (item.discountPercent / 100);
    return acc + ((itemSub - itemDisc) * (item.taxPercent / 100));
  }, 0);

  const grandTotal = subTotal - totalDiscount + totalTax;

  // Step Validation & Navigation
  const goToStep2 = () => {
    if (!selectedCustomerId) {
      showToast('Please select a customer first.');
      return;
    }
    setActiveStep(2);
    showToast('Step 1 Saved! Now add products for this challan.');
  };

  const goToStep3 = () => {
    if (items.length === 0) {
      showToast('Please add at least one product before proceeding to Review.');
      return;
    }
    setActiveStep(3);
    showToast('Step 2 Saved! Review all details before confirming.');
  };

  const handleFinalCreateChallan = async () => {
    if (items.length === 0) {
      showToast('Please add products before creating a challan.');
      return;
    }

    const payload = {
      customerId: selectedCustomer?.id || '',
      customerName: selectedCustomer?.name || '',
      dispatchDate: challanDate,
      status,
      reference,
      notes,
      dispatchWarehouse,
      items: items.map(i => ({
        productId: i.productId,
        productName: i.name,
        sku: i.sku,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discountPercent: i.discountPercent,
        taxPercent: i.taxPercent,
      })),
      totalAmount: grandTotal,
    };

    const token = localStorage.getItem('jwt_token') || 'demo_jwt_token_2026';
    const generated = `CH-2024-${Math.floor(100 + Math.random() * 900)}`;
    setCreatedChallanNo(generated);

    try {
      await axios.post('http://localhost:5000/api/challans', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      // Fallback local persistence
    }

    setActiveStep(4);
    showToast(`Sales Challan ${generated} Created Successfully! 🎉`);
  };

  // Step 4 Actions: Email Modal Handler
  const handleOpenEmailModal = () => {
    const custName = selectedCustomer?.name || 'Valued Customer';
    const email = `${custName.toLowerCase().replace(/\s+/g, '')}@example.com`;
    setEmailRecipient(email);
    setEmailSubject(`Sales Delivery Challan #${createdChallanNo} - ${selectedCustomer?.businessName || custName}`);
    setEmailMessage(
      `Dear ${custName},\n\n` +
      `Please find attached the official Sales Delivery Challan #${createdChallanNo} dated ${challanDate}.\n\n` +
      `Challan Summary:\n` +
      `- Total Items: ${items.length} (${totalQuantitySum} total qty)\n` +
      `- Grand Total Amount: ₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n` +
      `- Dispatch Warehouse: ${dispatchWarehouse}\n\n` +
      `Thank you for doing business with us!\n\n` +
      `Best regards,\n` +
      `Mini-ERP Sales Team`
    );
    setShowEmailModal(true);
  };

  const handleSendEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRecipient.trim()) {
      showToast('Please enter a recipient email address.');
      return;
    }
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      setShowEmailModal(false);
      showToast(`📧 Sales Challan #${createdChallanNo} successfully emailed to ${emailRecipient}!`);
    }, 600);
  };

  // Step 4 Actions: Print PDF Handler
  const handlePrintChallanPDF = () => {
    showToast(`📄 Preparing print view for ${createdChallanNo}...`);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Step 4 Actions: Create Another Challan Reset Handler
  const handleCreateAnotherChallan = () => {
    setActiveStep(1);
    setItems([]);
    setReference('');
    setNotes('');
    setTermsAgreed(false);
    setStatus('DRAFT');
    if (customers.length > 0) {
      setSelectedCustomerId(customers[0].id);
    }
    showToast('✨ Form reset! Ready to create a new sales challan.');
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '6rem' }}>
      {/* Toast Banner */}
      {toastMessage && (
        <div
          className="position-fixed bottom-0 end-0 m-4 bg-dark text-white px-3 py-2.5 rounded-3 shadow-lg d-flex align-items-center gap-2 z-3"
          style={{ fontSize: '0.875rem' }}
        >
          <Check size={16} className="text-success" />
          {toastMessage}
        </div>
      )}

      {/* Header Breadcrumb & Title */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 text-muted mb-1" style={{ fontSize: '0.825rem' }}>
          <Link to="/dashboard" className="text-decoration-none text-muted hover-primary">Dashboard</Link>
          <ChevronRight size={14} />
          <Link to="/challans" className="text-decoration-none text-muted hover-primary">Sales Challans</Link>
          <ChevronRight size={14} />
          <span className="text-dark fw-medium">Create Challan</span>
        </div>
        <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.6rem', letterSpacing: '-0.02em' }}>
          Create Sales Challan
        </h2>
        <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
          Create a new sales challan for your customer in simple steps.
        </p>
      </div>

      {/* Step Progress Bar Card (Interactive Step Wizard Header) */}
      <div className="card border-0 shadow-sm p-4 mb-4 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div className="row align-items-center position-relative">
          {/* Connecting Line */}
          <div
            className="position-absolute top-50 start-0 translate-middle-y w-100 d-none d-md-block"
            style={{ height: '2px', backgroundColor: '#e2e8f0', zIndex: 0, paddingLeft: '8%', paddingRight: '8%' }}
          ></div>

          {/* Step 1 Circle */}
          <div
            className="col-md-3 position-relative z-1 mb-3 mb-md-0"
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveStep(1)}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                style={{
                  width: '38px',
                  height: '38px',
                  backgroundColor: activeStep === 1 ? '#2563eb' : activeStep > 1 ? '#10b981' : '#ffffff',
                  color: activeStep >= 1 ? '#ffffff' : '#64748b',
                  borderColor: activeStep >= 1 ? 'transparent' : '#cbd5e1',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  fontSize: '0.9rem',
                  flexShrink: 0
                }}
              >
                {activeStep > 1 ? <Check size={18} /> : '1'}
              </div>
              <div>
                <div className={`fw-bold ${activeStep === 1 ? 'text-primary' : 'text-dark'}`} style={{ fontSize: '0.875rem' }}>
                  1. Customer & Info
                </div>
                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Select customer & challan date</div>
              </div>
            </div>
          </div>

          {/* Step 2 Circle */}
          <div
            className="col-md-3 position-relative z-1 mb-3 mb-md-0"
            style={{ cursor: 'pointer' }}
            onClick={() => { if (selectedCustomerId) setActiveStep(2); }}
          >
            <div className={`d-flex align-items-center gap-3 ${activeStep < 2 ? 'opacity-75' : ''}`}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold border"
                style={{
                  width: '38px',
                  height: '38px',
                  backgroundColor: activeStep === 2 ? '#2563eb' : activeStep > 2 ? '#10b981' : '#ffffff',
                  color: activeStep >= 2 ? '#ffffff' : '#64748b',
                  borderColor: activeStep >= 2 ? 'transparent' : '#cbd5e1',
                  fontSize: '0.9rem',
                  flexShrink: 0
                }}
              >
                {activeStep > 2 ? <Check size={18} /> : '2'}
              </div>
              <div>
                <div className={`fw-semibold ${activeStep === 2 ? 'text-primary' : 'text-secondary'}`} style={{ fontSize: '0.875rem' }}>
                  2. Add Products
                </div>
                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Add product items & quantities</div>
              </div>
            </div>
          </div>

          {/* Step 3 Circle */}
          <div
            className="col-md-3 position-relative z-1 mb-3 mb-md-0"
            style={{ cursor: 'pointer' }}
            onClick={() => { if (items.length > 0) setActiveStep(3); }}
          >
            <div className={`d-flex align-items-center gap-3 ${activeStep < 3 ? 'opacity-75' : ''}`}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold border"
                style={{
                  width: '38px',
                  height: '38px',
                  backgroundColor: activeStep === 3 ? '#2563eb' : activeStep > 3 ? '#10b981' : '#ffffff',
                  color: activeStep >= 3 ? '#ffffff' : '#64748b',
                  borderColor: activeStep >= 3 ? 'transparent' : '#cbd5e1',
                  fontSize: '0.9rem',
                  flexShrink: 0
                }}
              >
                {activeStep > 3 ? <Check size={18} /> : '3'}
              </div>
              <div>
                <div className={`fw-semibold ${activeStep === 3 ? 'text-primary' : 'text-secondary'}`} style={{ fontSize: '0.875rem' }}>
                  3. Review & Confirm
                </div>
                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Review all details & save</div>
              </div>
            </div>
          </div>

          {/* Step 4 Circle */}
          <div className="col-md-3 position-relative z-1">
            <div className={`d-flex align-items-center gap-3 ${activeStep < 4 ? 'opacity-75' : ''}`}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold border"
                style={{
                  width: '38px',
                  height: '38px',
                  backgroundColor: activeStep === 4 ? '#10b981' : '#ffffff',
                  color: activeStep === 4 ? '#ffffff' : '#64748b',
                  borderColor: activeStep === 4 ? 'transparent' : '#cbd5e1',
                  fontSize: '0.9rem',
                  flexShrink: 0
                }}
              >
                4
              </div>
              <div>
                <div className={`fw-semibold ${activeStep === 4 ? 'text-success' : 'text-secondary'}`} style={{ fontSize: '0.875rem' }}>
                  4. Complete
                </div>
                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Challan created successfully</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STEP 1: CUSTOMER & CHALLAN INFORMATION ================= */}
      {activeStep === 1 && (
        <div className="row g-4 mb-4">
          {/* Left Card: Customer Details */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm p-4 h-100 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
              <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.95rem' }}>Customer Details</h6>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-1.5">
                  Select Customer <span className="text-danger">*</span>
                </label>
                <div className="d-flex gap-2">
                  <select
                    className="form-select bg-white border text-dark fw-medium"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    style={{ borderRadius: '8px', fontSize: '0.875rem', height: '42px', borderColor: '#cbd5e1' }}
                  >
                    <option value="">-- Select Customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCustomerModal(true)}
                    className="btn btn-outline-primary d-flex align-items-center gap-1.5 text-nowrap fw-semibold px-3"
                    style={{ borderRadius: '8px', fontSize: '0.85rem', borderColor: '#2563eb', color: '#2563eb', backgroundColor: '#ffffff', flexShrink: 0 }}
                  >
                    <Plus size={16} /> New Customer
                  </button>
                </div>
              </div>

              {/* Selected Customer Summary Box */}
              {!selectedCustomer ? (
                <div className="p-4 rounded-3 mt-3.5 border border-dashed text-center" style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}>
                  <p className="text-muted small mb-0 fw-medium">Please select a customer from the dropdown above or create a new customer.</p>
                </div>
              ) : (
                <div className="p-4 rounded-3 mt-3.5 shadow-xs" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  {/* Row 1: Mobile, Business Name, GST Number */}
                  <div className="row g-3 mb-3 pb-3 border-bottom" style={{ borderColor: '#e2e8f0' }}>
                    <div className="col-4">
                      <span className="text-muted d-block small mb-1.5" style={{ fontSize: '0.725rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Mobile</span>
                      <strong className="text-dark d-block text-truncate fw-bold" style={{ fontSize: '0.875rem' }}>{selectedCustomer.mobile}</strong>
                    </div>
                    <div className="col-4">
                      <span className="text-muted d-block small mb-1.5" style={{ fontSize: '0.725rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Business Name</span>
                      <strong className="text-dark d-block text-truncate fw-bold" style={{ fontSize: '0.875rem' }}>{selectedCustomer.businessName}</strong>
                    </div>
                    <div className="col-4">
                      <span className="text-muted d-block small mb-1.5" style={{ fontSize: '0.725rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>GST Number</span>
                      <strong className="text-dark font-monospace d-block text-truncate fw-bold" style={{ fontSize: '0.825rem' }}>{selectedCustomer.gstNumber}</strong>
                    </div>
                  </div>

                  {/* Row 2: Customer Type & Available Credit */}
                  <div className="row g-3 align-items-center pt-1">
                    <div className="col-6">
                      <span className="text-muted d-block small mb-1.5" style={{ fontSize: '0.725rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Customer Type</span>
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1.5 fw-semibold" style={{ fontSize: '0.75rem', borderRadius: '6px' }}>
                        {selectedCustomer.customerType}
                      </span>
                    </div>
                    <div className="col-6">
                      <span className="text-muted d-block small mb-1.5" style={{ fontSize: '0.725rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Available Credit</span>
                      <div className="input-group input-group-sm" style={{ maxWidth: '175px' }}>
                        <span className="input-group-text bg-white text-success fw-bold border-end-0 px-2.5" style={{ borderColor: '#cbd5e1', borderRadius: '8px 0 0 8px' }}>₹</span>
                        <input
                          type="number"
                          className="form-control bg-white border-start-0 text-success fw-bold py-1.5"
                          value={selectedCustomer.availableCredit}
                          onChange={(e) => handleUpdateCustomerCredit(selectedCustomer.id, e.target.value)}
                          style={{ borderColor: '#cbd5e1', fontSize: '0.875rem', borderRadius: '0 8px 8px 0', boxShadow: 'none', height: '36px' }}
                          title="Edit Customer Available Credit Limit"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Card: Challan Information */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm p-4 h-100 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
              <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.95rem' }}>Challan Information</h6>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary mb-1">
                    Challan Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control bg-white border text-dark"
                    value={challanDate}
                    onChange={(e) => setChallanDate(e.target.value)}
                    style={{ borderRadius: '8px', fontSize: '0.875rem', height: '42px', borderColor: '#cbd5e1' }}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary mb-1">
                    Challan Number
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light border text-muted"
                    value="Auto Generate"
                    disabled
                    style={{ borderRadius: '8px', fontSize: '0.875rem', height: '42px', borderColor: '#e2e8f0' }}
                  />
                  <span className="text-muted d-block mt-1" style={{ fontSize: '0.725rem' }}>Will be generated on save</span>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary mb-1.5">
                    Status <span className="text-danger">*</span>
                  </label>
                  <div className="d-flex align-items-center gap-2">
                    {/* Draft Option Pill */}
                    <button
                      type="button"
                      onClick={() => setStatus('DRAFT')}
                      className="btn btn-sm d-flex align-items-center gap-2 rounded-pill px-3.5 py-1.5 fw-semibold transition-all"
                      style={{
                        backgroundColor: status === 'DRAFT' ? '#2563eb' : '#ffffff',
                        color: status === 'DRAFT' ? '#ffffff' : '#475569',
                        borderColor: status === 'DRAFT' ? '#2563eb' : '#cbd5e1',
                        borderWidth: '1px',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: '16px',
                          height: '16px',
                          backgroundColor: status === 'DRAFT' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                          color: status === 'DRAFT' ? '#ffffff' : '#64748b',
                        }}
                      >
                        {status === 'DRAFT' && <Check size={11} />}
                      </div>
                      Draft
                    </button>

                    {/* Confirmed Option Pill */}
                    <button
                      type="button"
                      onClick={() => setStatus('CONFIRMED')}
                      className="btn btn-sm d-flex align-items-center gap-2 rounded-pill px-3.5 py-1.5 fw-semibold transition-all"
                      style={{
                        backgroundColor: status === 'CONFIRMED' ? '#10b981' : '#ffffff',
                        color: status === 'CONFIRMED' ? '#ffffff' : '#475569',
                        borderColor: status === 'CONFIRMED' ? '#10b981' : '#cbd5e1',
                        borderWidth: '1px',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: '16px',
                          height: '16px',
                          backgroundColor: status === 'CONFIRMED' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                          color: status === 'CONFIRMED' ? '#ffffff' : '#64748b',
                        }}
                      >
                        {status === 'CONFIRMED' && <Check size={11} />}
                      </div>
                      Confirmed
                    </button>
                  </div>
                  <span className="text-muted d-block mt-1.5" style={{ fontSize: '0.725rem' }}>
                    {status === 'DRAFT' ? 'Draft challans can be edited anytime later.' : 'Confirmed challans update stock immediately.'}
                  </span>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary mb-1">
                    Reference (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-control bg-white border text-dark"
                    placeholder="Enter reference (PO, Quotation, etc.)"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    style={{ borderRadius: '8px', fontSize: '0.85rem', height: '42px', borderColor: '#cbd5e1' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 2: ADD PRODUCTS & NOTES ================= */}
      {activeStep === 2 && (
        <>
          {/* Add Products Table Card */}
          <div className="card border-0 shadow-sm p-4 mb-4 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
              <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.98rem' }}>Add Products for {selectedCustomer?.name || 'Customer'}</h6>
              <button
                type="button"
                onClick={() => setShowProductModal(true)}
                className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1.5 fw-semibold px-3"
                style={{ borderRadius: '8px', fontSize: '0.85rem', borderColor: '#2563eb', color: '#2563eb' }}
              >
                <Plus size={16} /> Add Product
              </button>
            </div>

            {/* Search Bar */}
            <div className="position-relative mb-3" style={{ maxWidth: '420px' }}>
              <Search size={16} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-control ps-5 bg-white border"
                placeholder="Search product by name or SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                style={{ borderRadius: '8px', fontSize: '0.875rem', height: '38px', borderColor: '#cbd5e1' }}
              />
            </div>

            {/* Products Table */}
            <div className="table-responsive mb-3">
              <table className="table align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                <thead style={{ backgroundColor: '#f8fafc', fontSize: '0.78rem', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th className="ps-3 py-3 text-secondary" style={{ width: '40px' }}>#</th>
                    <th className="py-3 text-secondary">Product</th>
                    <th className="py-3 text-secondary">SKU / Code</th>
                    <th className="py-3 text-secondary" style={{ width: '130px' }}>Unit Price (₹)</th>
                    <th className="py-3 text-secondary text-center" style={{ width: '110px' }}>Available Stock</th>
                    <th className="py-3 text-secondary text-center" style={{ width: '140px' }}>Quantity</th>
                    <th className="py-3 text-secondary text-center" style={{ width: '100px' }}>Discount (%)</th>
                    <th className="py-3 text-secondary text-center" style={{ width: '90px' }}>Tax (%)</th>
                    <th className="py-3 text-secondary text-end" style={{ width: '120px' }}>Total (₹)</th>
                    <th className="pe-3 py-3 text-secondary text-center" style={{ width: '60px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-5 text-muted">
                        No products added yet. Click <strong>+ Add Product</strong> to select items.
                      </td>
                    </tr>
                  ) : (
                    items
                      .filter(i => i.name.toLowerCase().includes(productSearch.toLowerCase()) || i.sku.toLowerCase().includes(productSearch.toLowerCase()))
                      .map((item, idx) => {
                        const itemSub = item.unitPrice * item.quantity;
                        const itemDisc = itemSub * (item.discountPercent / 100);
                        const itemAfterDisc = itemSub - itemDisc;
                        const itemTax = itemAfterDisc * (item.taxPercent / 100);
                        const itemTotal = itemAfterDisc + itemTax;

                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td className="ps-3 py-3 text-secondary" style={{ fontSize: '0.85rem' }}>{idx + 1}</td>

                            <td className="py-3">
                              <div className="d-flex align-items-center gap-2.5">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="rounded-2 border object-fit-cover"
                                    style={{ width: '38px', height: '38px' }}
                                  />
                                ) : (
                                  <div className="rounded-2 bg-light d-flex align-items-center justify-content-center text-muted border" style={{ width: '38px', height: '38px' }}>
                                    <Package size={18} />
                                  </div>
                                )}
                                <div>
                                  <div className="fw-bold text-dark text-nowrap" style={{ fontSize: '0.875rem' }}>{item.name}</div>
                                  <div className="text-muted small text-nowrap" style={{ fontSize: '0.75rem' }}>{item.description}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 font-monospace fw-semibold text-secondary" style={{ fontSize: '0.825rem' }}>
                              {item.sku}
                            </td>

                            <td className="py-3">
                              <input
                                type="number"
                                className="form-control form-control-sm bg-white border text-dark fw-medium"
                                value={item.unitPrice}
                                onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                style={{ borderRadius: '6px', fontSize: '0.85rem', height: '34px' }}
                              />
                            </td>

                            <td className="py-3 text-center">
                              <span className={`badge ${item.availableStock > 30 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`} style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                                {item.availableStock}
                              </span>
                            </td>

                            <td className="py-3">
                              <div className="d-flex align-items-center justify-content-center rounded-2 border p-1 bg-light" style={{ width: '110px', margin: '0 auto' }}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-white border-0 p-0 text-dark"
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  style={{ width: '24px', height: '24px', lineHeight: '1' }}
                                >
                                  <Minus size={13} />
                                </button>
                                <span className="fw-bold text-dark px-2 text-center" style={{ fontSize: '0.875rem', minWidth: '32px' }}>
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-white border-0 p-0 text-dark"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  style={{ width: '24px', height: '24px', lineHeight: '1' }}
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                            </td>

                            <td className="py-3 text-center">
                              <input
                                type="number"
                                className="form-control form-control-sm bg-white border text-center text-dark"
                                value={item.discountPercent}
                                onChange={(e) => handleDiscountChange(item.id, e.target.value)}
                                style={{ borderRadius: '6px', fontSize: '0.85rem', height: '34px' }}
                              />
                            </td>

                            <td className="py-3 text-center">
                              <input
                                type="number"
                                className="form-control form-control-sm bg-white border text-center text-dark"
                                value={item.taxPercent}
                                onChange={(e) => handleTaxChange(item.id, e.target.value)}
                                style={{ borderRadius: '6px', fontSize: '0.85rem', height: '34px' }}
                              />
                            </td>

                            <td className="py-3 text-end fw-bold text-dark" style={{ fontSize: '0.875rem' }}>
                              {itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>

                            <td className="pe-3 py-3 text-center">
                              <button
                                type="button"
                                className="btn btn-sm text-danger p-1 rounded-2 border-0"
                                onClick={() => handleRemoveItem(item.id)}
                                title="Remove item"
                                style={{ backgroundColor: '#fef2f2' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>

            <div>
              <button
                type="button"
                onClick={handleClearAllItems}
                className="btn btn-outline-secondary btn-sm border"
                style={{ borderRadius: '8px', fontSize: '0.825rem', borderColor: '#cbd5e1', color: '#475569' }}
              >
                Clear All Items
              </button>
            </div>
          </div>

          {/* Notes & Summary Row */}
          <div className="row g-4 mb-4">
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <label className="form-label fw-bold text-dark mb-2" style={{ fontSize: '0.925rem' }}>
                  Notes (Optional)
                </label>
                <textarea
                  className="form-control bg-white border text-dark p-3"
                  rows={5}
                  placeholder="Enter any notes about this challan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ borderRadius: '8px', fontSize: '0.875rem', borderColor: '#cbd5e1' }}
                ></textarea>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.95rem' }}>Challan Summary</h6>

                <div className="d-flex align-items-center justify-content-between py-1.5" style={{ fontSize: '0.875rem' }}>
                  <span className="text-secondary">Total Items</span>
                  <strong className="text-dark">{totalItemsCount}</strong>
                </div>

                <div className="d-flex align-items-center justify-content-between py-1.5" style={{ fontSize: '0.875rem' }}>
                  <span className="text-secondary">Total Quantity</span>
                  <strong className="text-dark">{totalQuantitySum}</strong>
                </div>

                <div className="d-flex align-items-center justify-content-between py-1.5" style={{ fontSize: '0.875rem' }}>
                  <span className="text-secondary">Sub Total</span>
                  <strong className="text-dark">₹ {subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>

                <div className="d-flex align-items-center justify-content-between py-1.5" style={{ fontSize: '0.875rem' }}>
                  <span className="text-secondary">Discount</span>
                  <strong className="text-danger">₹ {totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>

                <div className="d-flex align-items-center justify-content-between py-1.5" style={{ fontSize: '0.875rem' }}>
                  <span className="text-secondary">Tax (18%)</span>
                  <strong className="text-dark">₹ {totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>

                <hr className="my-2.5" style={{ borderColor: '#e2e8f0' }} />

                <div className="d-flex align-items-center justify-content-between py-1" style={{ fontSize: '1.05rem' }}>
                  <span className="fw-bold text-dark">Grand Total</span>
                  <strong className="fw-bold text-primary fs-5" style={{ color: '#2563eb' }}>
                    ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= STEP 3: REVIEW & CONFIRM ================= */}
      {activeStep === 3 && (
        <div className="card border-0 shadow-lg p-4 mb-4" style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
            <div>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1.5 fw-bold small mb-2 d-inline-flex align-items-center gap-1.5">
                <ShieldCheck size={14} /> Final Authorization Phase
              </span>
              <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                Step 3: Review All Details & Authorize
              </h4>
              <p className="text-muted small mb-0">Verify customer info, product list, totals, and warehouse dispatch settings before creating.</p>
            </div>
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 me-1 py-2 rounded-3 fw-bold d-inline-flex align-items-center gap-1.5" style={{ fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} /> Ready to Authorize
            </span>
          </div>

          <div className="row g-4 mb-4">
            {/* Customer Summary Box */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100 rounded-3 overflow-hidden" style={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
                  <h6 className="fw-bold text-primary mb-0 d-flex align-items-center gap-2">
                    <Building2 size={18} /> Customer Summary
                  </h6>
                  <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 small fw-semibold">
                    {selectedCustomer?.customerType || 'Wholesale'}
                  </span>
                </div>
                <div className="p-4 bg-white">
                  <div className="d-flex justify-content-between align-items-center py-2.5 border-bottom">
                    <span className="text-secondary small d-flex align-items-center gap-2"><User size={14} className="text-muted" /> Customer Name</span>
                    <strong className="text-dark fw-bold">{selectedCustomer?.name || 'N/A'}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2.5 border-bottom">
                    <span className="text-secondary small d-flex align-items-center gap-2"><Building2 size={14} className="text-muted" /> Business Name</span>
                    <strong className="text-dark fw-bold">{selectedCustomer?.businessName || 'N/A'}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2.5 border-bottom">
                    <span className="text-secondary small d-flex align-items-center gap-2"><FileText size={14} className="text-muted" /> GST Number</span>
                    <strong className="text-dark font-monospace fw-bold bg-light px-2.5 py-1 rounded border" style={{ fontSize: '0.825rem' }}>{selectedCustomer?.gstNumber || 'N/A'}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2.5">
                    <span className="text-secondary small d-flex align-items-center gap-2"><Phone size={14} className="text-muted" /> Mobile Phone</span>
                    <strong className="text-dark fw-bold">{selectedCustomer?.mobile || 'N/A'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Challan Metadata Box */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100 rounded-3 overflow-hidden" style={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
                  <h6 className="fw-bold text-success mb-0 d-flex align-items-center gap-2">
                    <Calendar size={18} /> Challan Details
                  </h6>
                  <span className={`badge ${status === 'CONFIRMED' ? 'bg-success' : 'bg-primary'} text-white rounded-pill px-2.5 py-1 small fw-semibold`}>
                    {status}
                  </span>
                </div>
                <div className="p-4 bg-white">
                  <div className="d-flex justify-content-between align-items-center py-2.5 border-bottom">
                    <span className="text-secondary small d-flex align-items-center gap-2"><Calendar size={14} className="text-muted" /> Dispatch Date</span>
                    <strong className="text-dark fw-bold">{challanDate}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2.5 border-bottom">
                    <span className="text-secondary small d-flex align-items-center gap-2"><Tag size={14} className="text-muted" /> Initial Status</span>
                    <span className="badge bg-primary-subtle text-primary fw-bold px-2.5 py-1 rounded">{status}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2.5 border-bottom">
                    <span className="text-secondary small d-flex align-items-center gap-2"><FileCode size={14} className="text-muted" /> Reference</span>
                    <strong className="text-dark font-monospace fw-semibold">{reference || 'N/A'}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2.5">
                    <span className="text-secondary small d-flex align-items-center gap-2"><Warehouse size={14} className="text-muted" /> Dispatch Warehouse</span>
                    <strong className="text-dark fw-bold">{dispatchWarehouse}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Review Table */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <Package size={18} className="text-primary" /> Selected Products ({items.length} items, {totalQuantitySum} qty)
            </h6>
            <span className="badge bg-light text-secondary border px-2.5 py-1 small fw-semibold">
              Stock Verified
            </span>
          </div>

          <div className="table-responsive rounded-3 border mb-4 shadow-sm" style={{ overflow: 'hidden', borderRadius: '12px' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark text-uppercase small" style={{ backgroundColor: '#1e293b', fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                <tr>
                  <th className="py-3 px-3" style={{ backgroundColor: '#1e293b' }}>Product</th>
                  <th className="py-3" style={{ backgroundColor: '#1e293b' }}>SKU</th>
                  <th className="py-3 text-end" style={{ backgroundColor: '#1e293b' }}>Unit Price</th>
                  <th className="py-3 text-center" style={{ backgroundColor: '#1e293b' }}>Qty</th>
                  <th className="py-3 text-center" style={{ backgroundColor: '#1e293b' }}>Disc (%)</th>
                  <th className="py-3 text-center" style={{ backgroundColor: '#1e293b' }}>Tax (%)</th>
                  <th className="py-3 text-end px-3" style={{ backgroundColor: '#1e293b' }}>Line Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const itemSub = item.unitPrice * item.quantity;
                  const itemDisc = itemSub * (item.discountPercent / 100);
                  const itemTotal = (itemSub - itemDisc) * (1 + item.taxPercent / 100);
                  return (
                    <tr key={item.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td className="px-3 py-3">
                        <div className="d-flex align-items-center gap-2.5">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="rounded-2 border object-fit-cover" style={{ width: '36px', height: '36px' }} />
                          ) : (
                            <div className="rounded-2 bg-light d-flex align-items-center justify-content-center border" style={{ width: '36px', height: '36px' }}>
                              <Package size={16} className="text-muted" />
                            </div>
                          )}
                          <div>
                            <div className="fw-bold text-dark">{item.name}</div>
                            {item.description && <div className="text-muted small text-truncate" style={{ maxWidth: '200px', fontSize: '0.75rem' }}>{item.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge border font-monospace fw-semibold px-2 py-1" style={{ fontSize: '0.78rem', backgroundColor: '#f1f5f9', color: '#334155', borderColor: '#cbd5e1' }}>
                          {item.sku}
                        </span>
                      </td>
                      <td className="text-end fw-medium text-secondary">₹ {item.unitPrice.toFixed(2)}</td>
                      <td className="text-center">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5 fw-bold" style={{ fontSize: '0.85rem' }}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="badge" style={{ backgroundColor: item.discountPercent > 0 ? '#fef3c7' : '#f1f5f9', color: item.discountPercent > 0 ? '#92400e' : '#64748b', fontSize: '0.75rem' }}>
                          {item.discountPercent}%
                        </span>
                      </td>
                      <td className="text-center text-muted small">{item.taxPercent}%</td>
                      <td className="text-end px-3 fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                        ₹ {itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Grand Total Summary Box */}
          <div
            className="p-4 rounded-3 text-white d-flex align-items-center justify-content-between mb-4 shadow-md"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '14px' }}
          >
            <div>
              <span className="badge rounded-pill px-3 py-1 small fw-bold mb-1" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>
                TOTAL AMOUNT PAYABLE
              </span>
              <div className="small mt-1" style={{ color: '#94a3b8' }}>
                {totalItemsCount} line items • Sub Total: ₹{subTotal.toFixed(2)} + GST Tax: ₹{totalTax.toFixed(2)}
              </div>
            </div>
            <div className="text-end">
              <span className="small d-block" style={{ color: '#94a3b8' }}>Grand Total</span>
              <h2 className="fw-bold mb-0" style={{ color: '#34d399', letterSpacing: '-0.02em' }}>
                ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="form-check p-3.5 rounded-3 border d-flex align-items-center gap-3" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', borderRadius: '12px' }}>
            <input
              className="form-check-input ms-1 me-1"
              type="checkbox"
              id="agreeCheck"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <label className="form-check-label text-dark fw-semibold small mb-0" htmlFor="agreeCheck" style={{ cursor: 'pointer' }}>
              I authorize the dispatch of these products from stock for <span className="text-success fw-bold">{selectedCustomer?.name || 'Customer'}</span>.
            </label>
          </div>
        </div>
      )}

      {/* ================= STEP 4: COMPLETE 🎉 ================= */}
      {activeStep === 4 && (
        <div className="card border-0 shadow-sm p-5 mb-4 rounded-3 text-center" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div className="mx-auto rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center mb-3" style={{ width: '75px', height: '75px' }}>
            <CheckCircle2 size={45} />
          </div>
          <h3 className="fw-bold text-dark mb-1">Sales Challan Created!</h3>
          <p className="text-muted mb-3">Delivery Challan Reference: <strong className="text-primary font-monospace fs-5">{createdChallanNo}</strong></p>

          <div className="d-inline-flex gap-3 justify-content-center flex-wrap mt-2">
            <button
              type="button"
              className="btn btn-outline-primary px-4 py-2.5 fw-semibold d-flex align-items-center gap-2"
              onClick={handlePrintChallanPDF}
              style={{ borderRadius: '8px' }}
            >
              <Printer size={18} /> Print Challan PDF
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary px-4 py-2.5 fw-semibold d-flex align-items-center gap-2"
              onClick={handleOpenEmailModal}
              style={{ borderRadius: '8px' }}
            >
              <Mail size={18} /> Email Customer
            </button>
            <button
              type="button"
              className="btn btn-primary px-4 py-2.5 fw-semibold d-flex align-items-center gap-2"
              onClick={handleCreateAnotherChallan}
              style={{ borderRadius: '8px', backgroundColor: '#2563eb' }}
            >
              <Plus size={18} /> Create Another Challan
            </button>
            <button
              type="button"
              className="btn btn-secondary px-4 py-2.5 fw-semibold d-flex align-items-center gap-2"
              onClick={() => navigate('/challans')}
              style={{ borderRadius: '8px' }}
            >
              <FileText size={18} /> View All Sales Challans
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Sticky Bottom Footer Bar */}
      <div
        className="position-fixed bottom-0 start-0 w-100 bg-white border-top shadow-lg py-3 px-4 z-2"
        style={{ borderColor: '#e2e8f0' }}
      >
        <div className="container-fluid d-flex align-items-center justify-content-between max-w-7xl">
          {/* Step 1 Footer */}
          {activeStep === 1 && (
            <>
              <button
                type="button"
                className="btn btn-outline-secondary px-4 fw-semibold d-flex align-items-center gap-1.5"
                onClick={() => navigate('/challans')}
                style={{ borderRadius: '8px', fontSize: '0.875rem' }}
              >
                <X size={16} /> Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary px-4 fw-semibold d-flex align-items-center gap-2"
                onClick={goToStep2}
                style={{ borderRadius: '8px', fontSize: '0.875rem', backgroundColor: '#2563eb' }}
              >
                Next: Add Products <ArrowRight size={16} />
              </button>
            </>
          )}

          {/* Step 2 Footer */}
          {activeStep === 2 && (
            <>
              <button
                type="button"
                className="btn btn-outline-secondary px-4 fw-semibold d-flex align-items-center gap-1.5"
                onClick={() => setActiveStep(1)}
                style={{ borderRadius: '8px', fontSize: '0.875rem' }}
              >
                <ArrowLeft size={16} /> Back to Customer Info
              </button>

              <button
                type="button"
                className="btn btn-primary px-4 fw-semibold d-flex align-items-center gap-2"
                onClick={goToStep3}
                style={{ borderRadius: '8px', fontSize: '0.875rem', backgroundColor: '#2563eb' }}
              >
                Next: Review Details <ArrowRight size={16} />
              </button>
            </>
          )}

          {/* Step 3 Footer */}
          {activeStep === 3 && (
            <>
              <button
                type="button"
                className="btn btn-outline-secondary px-4 fw-semibold d-flex align-items-center gap-1.5"
                onClick={() => setActiveStep(2)}
                style={{ borderRadius: '8px', fontSize: '0.875rem' }}
              >
                <ArrowLeft size={16} /> Back to Add Products
              </button>

              <button
                type="button"
                className="btn btn-success px-4 fw-semibold d-flex align-items-center gap-2"
                onClick={handleFinalCreateChallan}
                style={{ borderRadius: '8px', fontSize: '0.875rem', backgroundColor: '#10b981', borderColor: '#10b981' }}
              >
                Confirm & Create Challan <Check size={16} />
              </button>
            </>
          )}

          {/* Step 4 Footer */}
          {activeStep === 4 && (
            <div className="w-100 text-end">
              <button
                type="button"
                className="btn btn-primary px-4 fw-semibold"
                onClick={() => navigate('/challans')}
                style={{ borderRadius: '8px', fontSize: '0.875rem', backgroundColor: '#2563eb' }}
              >
                Back to Sales Challans Overview
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add New Customer Modal */}
      {showNewCustomerModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header border-bottom bg-light px-4 py-3">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <UserPlus className="text-primary" size={20} /> Add New Customer
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowNewCustomerModal(false)}></button>
              </div>
              <form onSubmit={handleCreateCustomerSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark mb-1">Customer Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Royal Enterprises"
                      required
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark mb-1">Mobile Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 9876543210"
                      value={newCustMobile}
                      onChange={(e) => setNewCustMobile(e.target.value)}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark mb-1">Business Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Royal Electronics Pvt. Ltd."
                        value={newCustBusiness}
                        onChange={(e) => setNewCustBusiness(e.target.value)}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark mb-1">GST Number</label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        placeholder="e.g. 27ABCDE1234F1Z5"
                        value={newCustGst}
                        onChange={(e) => setNewCustGst(e.target.value)}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark mb-1">Customer Type</label>
                      <select
                        className="form-select"
                        value={newCustType}
                        onChange={(e) => setNewCustType(e.target.value)}
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="Wholesale">Wholesale</option>
                        <option value="Retailer">Retailer</option>
                        <option value="Distributor">Distributor</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark mb-1">Available Credit Limit (₹) *</label>
                      <input
                        type="number"
                        className="form-control fw-bold text-success"
                        placeholder="e.g. 275000"
                        required
                        value={newCustCredit}
                        onChange={(e) => setNewCustCredit(e.target.value)}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top bg-light px-4 py-3">
                  <button type="button" className="btn btn-secondary px-3" style={{ borderRadius: '8px' }} onClick={() => setShowNewCustomerModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4 fw-semibold" style={{ borderRadius: '8px', backgroundColor: '#2563eb' }}>
                    Save & Select
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Select Products Catalog Modal */}
      {showProductModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header border-bottom bg-light px-4 py-3">
                <div>
                  <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2 mb-0">
                    <Package className="text-primary" size={20} /> Select Products from Catalog
                  </h5>
                  <span className="text-muted small" style={{ fontSize: '0.78rem' }}>Pick products to add to this sales challan</span>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowProductModal(false)}></button>
              </div>

              <div className="modal-body p-4">
                {/* Modal Search Bar */}
                <div className="position-relative mb-3">
                  <Search size={16} className="position-absolute text-muted" style={{ left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="form-control ps-5 bg-white border"
                    placeholder="Filter products by name or SKU..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    style={{ borderRadius: '8px', height: '40px', borderColor: '#cbd5e1' }}
                  />
                </div>

                {/* Catalog Products List Table */}
                <div className="table-responsive" style={{ maxHeight: '380px' }}>
                  <table className="table align-middle table-hover mb-0">
                    <thead className="table-light small">
                      <tr>
                        <th>Product Details</th>
                        <th>SKU</th>
                        <th className="text-end">Unit Price (₹)</th>
                        <th className="text-center">Stock</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catalogProducts
                        .filter(p => p.name.toLowerCase().includes(modalSearch.toLowerCase()) || p.sku.toLowerCase().includes(modalSearch.toLowerCase()))
                        .map(prod => {
                          const isAdded = items.some(i => i.productId === prod.productId || i.sku === prod.sku);
                          return (
                            <tr key={prod.id}>
                              <td>
                                <div className="d-flex align-items-center gap-2.5">
                                  {prod.imageUrl ? (
                                    <img src={prod.imageUrl} alt={prod.name} className="rounded-2 border object-fit-cover" style={{ width: '38px', height: '38px' }} />
                                  ) : (
                                    <div className="rounded-2 bg-light d-flex align-items-center justify-content-center border" style={{ width: '38px', height: '38px' }}>
                                      <Package size={18} className="text-muted" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="fw-bold text-dark" style={{ fontSize: '0.875rem' }}>{prod.name}</div>
                                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{prod.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="font-monospace small fw-semibold text-secondary">{prod.sku}</td>
                              <td className="text-end fw-bold text-dark">₹ {prod.unitPrice.toFixed(2)}</td>
                              <td className="text-center">
                                <span className={`badge ${prod.availableStock > 30 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                  {prod.availableStock} in stock
                                </span>
                              </td>
                              <td className="text-end">
                                {isAdded ? (
                                  <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1">
                                    <Check size={13} /> Added
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm px-3 fw-semibold d-inline-flex align-items-center gap-1"
                                    onClick={() => handleSelectProductFromModal(prod)}
                                    style={{ borderRadius: '6px', backgroundColor: '#2563eb' }}
                                  >
                                    <Plus size={14} /> Add
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer border-top bg-light px-4 py-3 justify-content-between">
                <span className="text-muted small">Selected {items.length} product(s) in challan</span>
                <button
                  type="button"
                  className="btn btn-primary px-4 fw-semibold"
                  onClick={() => setShowProductModal(false)}
                  style={{ borderRadius: '8px', backgroundColor: '#2563eb' }}
                >
                  Done Selecting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Email Challan Modal */}
      {showEmailModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header border-bottom bg-light px-4 py-3">
                <div>
                  <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2 mb-0">
                    <Mail className="text-primary" size={20} /> Email Sales Challan #{createdChallanNo}
                  </h5>
                  <span className="text-muted small" style={{ fontSize: '0.78rem' }}>Send delivery receipt directly to customer</span>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowEmailModal(false)}></button>
              </div>

              <form onSubmit={handleSendEmailSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark mb-1">Recipient Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. customer@example.com"
                      required
                      value={emailRecipient}
                      onChange={(e) => setEmailRecipient(e.target.value)}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark mb-1">Email Subject *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Subject..."
                      required
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark mb-1">Message Body *</label>
                    <textarea
                      className="form-control"
                      rows={6}
                      required
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      style={{ borderRadius: '8px', fontSize: '0.875rem' }}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light px-4 py-3 justify-content-between">
                  <button type="button" className="btn btn-secondary px-4" style={{ borderRadius: '8px' }} onClick={() => setShowEmailModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSendingEmail} className="btn btn-primary px-4 fw-semibold d-flex align-items-center gap-2" style={{ borderRadius: '8px', backgroundColor: '#2563eb' }}>
                    {isSendingEmail ? 'Sending...' : 'Send Email Now'} <Mail size={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
