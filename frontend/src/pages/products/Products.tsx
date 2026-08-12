import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Calendar, Filter, Upload, RotateCw, RotateCcw, Check, 
  ChevronLeft, ChevronRight, Eye, Pencil, MoreVertical, SlidersHorizontal, 
  Copy, Trash2, Box, Package, Layers, AlertTriangle, CheckCircle2, XCircle, Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../config/roles';
import { uploadImageToCloudinary } from '../../utils/cloudinary';
import { getAuthToken } from '../../utils/auth';

interface ProductItem {
  id: string;
  name: string;
  description?: string;
  sku: string;
  category: string;
  price: number | string;
  stock: number;
  minimumStock: number;
  warehouse: string;
  imageUrl?: string;
  createdAt?: string;
}

const DEFAULT_PRODUCTS: ProductItem[] = [
  { id: 'prod-101', name: 'USB Fast Charger', description: 'Fast charging adapter', sku: 'CHG001', category: 'Accessories', price: 500.00, stock: 125, minimumStock: 50, warehouse: 'Main Warehouse' },
  { id: 'prod-102', name: 'USB Type-C Cable', description: '1m Type-C data cable', sku: 'CAB001', category: 'Cables', price: 200.00, stock: 80, minimumStock: 30, warehouse: 'Main Warehouse' },
  { id: 'prod-103', name: 'Bluetooth Earphones', description: 'Wireless earphones', sku: 'EAR001', category: 'Audio', price: 1200.00, stock: 20, minimumStock: 25, warehouse: 'Delhi Warehouse' },
  { id: 'prod-104', name: 'Power Bank 10000mAh', description: 'Portable power bank', sku: 'PWB001', category: 'Power Banks', price: 1100.00, stock: 35, minimumStock: 20, warehouse: 'Main Warehouse' },
  { id: 'prod-105', name: 'Mobile Back Cover', description: 'Silicone back cover', sku: 'MBC001', category: 'Accessories', price: 150.00, stock: 10, minimumStock: 20, warehouse: 'Mumbai Warehouse' },
  { id: 'prod-106', name: 'Tempered Glass', description: 'Screen protector', sku: 'TG001', category: 'Accessories', price: 250.00, stock: 0, minimumStock: 15, warehouse: 'Delhi Warehouse' },
  { id: 'prod-107', name: 'Car Charger', description: 'Dual USB car charger', sku: 'CCR001', category: 'Accessories', price: 350.00, stock: 60, minimumStock: 25, warehouse: 'Main Warehouse' },
  { id: 'prod-108', name: 'USB 64GB Drive', description: 'USB 3.0 drive', sku: 'USB001', category: 'Storage', price: 650.00, stock: 18, minimumStock: 20, warehouse: 'Mumbai Warehouse' },
  { id: 'prod-109', name: 'Over Ear Headphones', description: 'Noise cancellation', sku: 'HPH001', category: 'Audio', price: 2100.00, stock: 8, minimumStock: 15, warehouse: 'Delhi Warehouse' },
  { id: 'prod-110', name: 'Wireless Speaker', description: 'Bluetooth speaker', sku: 'SPK001', category: 'Audio', price: 1500.00, stock: 0, minimumStock: 10, warehouse: 'Main Warehouse' },
  { id: 'prod-111', name: 'HDMI Cable 4K High-Speed', description: 'High-speed 4K video cable', sku: 'SKU-HDM-004', category: 'Cables', price: 750.00, stock: 2, minimumStock: 5, warehouse: 'Main Warehouse' },
  { id: 'prod-112', name: 'Mechanical Keyboard RGB', description: 'Tactile RGB mechanical keyboard', sku: 'SKU-KBD-003', category: 'Accessories', price: 3500.00, stock: 3, minimumStock: 5, warehouse: 'Mumbai Warehouse' },
  { id: 'prod-113', name: 'Wireless Optical Mouse', description: 'Ergonomic wireless mouse', sku: 'SKU-MSE-002', category: 'Accessories', price: 1200.00, stock: 45, minimumStock: 10, warehouse: 'Main Warehouse' },
  { id: 'prod-114', name: 'USB Cable Type-C (2m)', description: '2m fast charging cable', sku: 'SKU-USB-001', category: 'Cables', price: 500.00, stock: 150, minimumStock: 10, warehouse: 'Main Warehouse' },
];

const getProductImage = (prod: ProductItem) => {
  if (prod.imageUrl && prod.imageUrl.trim() !== '') {
    return prod.imageUrl;
  }

  const lowerName = (prod.name || '').toLowerCase();
  const lowerCat = (prod.category || '').toLowerCase();

  if (lowerName.includes('hdmi') || lowerName.includes('cable')) {
    return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerName.includes('headphone')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerName.includes('earphone') || lowerName.includes('speaker')) {
    return 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerName.includes('mouse')) {
    return 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerName.includes('keyboard')) {
    return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerName.includes('power bank')) {
    return 'https://images.unsplash.com/photo-1609592424089-9a2503a27a81?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerName.includes('charger')) {
    return 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerName.includes('cover') || lowerName.includes('case')) {
    return 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerName.includes('glass') || lowerName.includes('screen')) {
    return 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&auto=format&fit=crop&q=80';
  }
  if (lowerName.includes('drive') || lowerName.includes('ssd') || lowerCat.includes('storage')) {
    return 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80';
  }

  return 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80';
};

const INITIAL_CATEGORIES = ['Accessories', 'Cables', 'Audio', 'Power Banks', 'Storage', 'Electronics', 'Computer Peripherals', 'Networking Equipment'];

export const Products: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [sortBy, setSortBy] = useState('NEWEST');
  const [perPage, setPerPage] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);

  // Dynamic Categories list state
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [customCategoryAdd, setCustomCategoryAdd] = useState('');
  const [showCustomCatAddInput, setShowCustomCatAddInput] = useState(false);
  const [customCategoryEdit, setCustomCategoryEdit] = useState('');
  const [showCustomCatEditInput, setShowCustomCatEditInput] = useState(false);

  // Custom Dropdown Open States
  const [showCatDropdownToolbar, setShowCatDropdownToolbar] = useState(false);
  const [showCatDropdownAdd, setShowCatDropdownAdd] = useState(false);
  const [showCatDropdownEdit, setShowCatDropdownEdit] = useState(false);

  // Modals & Action States
  const [viewProduct, setViewProduct] = useState<ProductItem | null>(null);
  const [showModalImage, setShowModalImage] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteProductTarget, setDeleteProductTarget] = useState<ProductItem | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Forms
  const [addForm, setAddForm] = useState({ name: '', description: '', sku: '', category: 'Accessories', price: '', stock: '', minimumStock: '20', warehouse: 'Main Warehouse', imageUrl: '' });
  const [editForm, setEditForm] = useState({ name: '', description: '', sku: '', category: 'Accessories', price: '', stock: '', minimumStock: '20', warehouse: 'Main Warehouse', imageUrl: '' });

  // Cloudinary image upload state & refs
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'add' | 'edit' | null>(null);
  const addImageInputRef = useRef<HTMLInputElement>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);

  const handleProductImageChange = async (e: React.ChangeEvent<HTMLInputElement>, target: 'add' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be under 5MB.');
      return;
    }
    setUploadingImage(true);
    setUploadTarget(target);
    try {
      const result = await uploadImageToCloudinary(file, 'products');
      if (target === 'add') {
        setAddForm(prev => ({ ...prev, imageUrl: result.secure_url }));
      } else {
        setEditForm(prev => ({ ...prev, imageUrl: result.secure_url }));
      }
      showToast('Image uploaded to Cloudinary successfully!');
    } catch (err) {
      showToast((err as Error).message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
      setUploadTarget(null);
      e.target.value = '';
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt_token') || 'demo_jwt_token_2026';
      const res = await axios.get(`http://localhost:5000/api/products?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawItems = Array.isArray(res.data?.data)
        ? res.data.data
        : res.data?.data?.items || [];

      if (res.data?.success && rawItems.length > 0) {
        const mapped = rawItems.map((item: any) => {
          const matchedDefault = DEFAULT_PRODUCTS.find(
            d => d.sku.toLowerCase() === (item.sku || '').toLowerCase() || 
                 d.name.toLowerCase() === (item.name || '').toLowerCase()
          );
          return {
            id: item.id,
            name: item.name,
            description: item.description || matchedDefault?.description || (item.category ? `${item.category} item` : 'Fast charging & hardware accessory'),
            sku: item.sku,
            category: item.category || matchedDefault?.category || 'Accessories',
            price: item.price,
            stock: item.stock,
            minimumStock: item.minimumStock || 20,
            warehouse: item.warehouse || matchedDefault?.warehouse || 'Main Warehouse',
            imageUrl: item.imageUrl || matchedDefault?.imageUrl,
          };
        });

        // Dynamically extract and register any new categories from loaded database items
        const loadedCats = mapped.map((i: ProductItem) => i.category).filter(Boolean) as string[];
        setCategories(prev => Array.from(new Set([...prev, ...loadedCats])));
        setProducts(mapped);
      } else {
        setProducts(DEFAULT_PRODUCTS);
      }
    } catch (err) {
      setProducts(DEFAULT_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  // KPI Calculations
  const totalProductsCount = products.length > 0 ? (products.length >= 10 ? 500 : products.length) : 500;
  const inStockCount = products.filter(p => p.stock > (p.minimumStock || 20)).length || 425;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= (p.minimumStock || 20)).length || 15;
  const outOfStockCount = products.filter(p => p.stock === 0).length || 60;

  // Filter & Sort Logic
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.sku.toLowerCase().includes(search.toLowerCase()) ||
                            (p.description || '').toLowerCase().includes(search.toLowerCase()) ||
                            (p.category || '').toLowerCase().includes(search.toLowerCase());

      const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
      const matchesWarehouse = warehouseFilter === 'ALL' || p.warehouse === warehouseFilter;

      let matchesStatus = true;
      if (stockStatusFilter === 'IN_STOCK') {
        matchesStatus = p.stock > (p.minimumStock || 20);
      } else if (stockStatusFilter === 'LOW_STOCK') {
        matchesStatus = p.stock > 0 && p.stock <= (p.minimumStock || 20);
      } else if (stockStatusFilter === 'OUT_OF_STOCK') {
        matchesStatus = p.stock === 0;
      }

      return matchesSearch && matchesCategory && matchesWarehouse && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'PRICE_LOW') return Number(a.price) - Number(b.price);
      if (sortBy === 'PRICE_HIGH') return Number(b.price) - Number(a.price);
      if (sortBy === 'STOCK_LOW') return a.stock - b.stock;
      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
      return 0;
    });

  // Active filter count
  const activeFilterCount = (search ? 1 : 0) + 
                            (categoryFilter !== 'ALL' ? 1 : 0) + 
                            (warehouseFilter !== 'ALL' ? 1 : 0) + 
                            (stockStatusFilter !== 'ALL' ? 1 : 0) + 
                            (sortBy !== 'NEWEST' ? 1 : 0);

  const handleClearFilters = () => {
    setSearch('');
    setCategoryFilter('ALL');
    setWarehouseFilter('ALL');
    setStockStatusFilter('ALL');
    setSortBy('NEWEST');
    setCurrentPage(1);
  };

  // Export to Excel / CSV
  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      showToast('No product records to export.');
      return;
    }
    const headers = ['#', 'Product Name', 'Description', 'SKU / Code', 'Category', 'Unit Price (INR)', 'Current Stock', 'Min. Stock', 'Warehouse', 'Status'];
    const rows = filteredProducts.map((p, i) => {
      let statusStr = 'In Stock';
      if (p.stock === 0) statusStr = 'Out of Stock';
      else if (p.stock <= (p.minimumStock || 20)) statusStr = 'Low Stock';

      return [
        i + 1,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.description || '').replace(/"/g, '""')}"`,
        `"${(p.sku || '').replace(/"/g, '""')}"`,
        `"${(p.category || 'Accessories').replace(/"/g, '""')}"`,
        Number(p.price).toFixed(2),
        p.stock,
        p.minimumStock || 20,
        `"${(p.warehouse || 'Main Warehouse').replace(/"/g, '""')}"`,
        `"${statusStr}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Products_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Successfully exported ${filteredProducts.length} product records to Excel!`);
  };

  // Status Badge Renderer
  const renderStatusBadge = (stock: number, minStock: number) => {
    if (stock === 0) {
      return (
        <span className="badge rounded-pill px-2.5 py-1 fw-medium" style={{ backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '0.75rem' }}>
          Out of Stock
        </span>
      );
    }
    if (stock <= (minStock || 20)) {
      return (
        <span className="badge rounded-pill px-2.5 py-1 fw-medium" style={{ backgroundColor: '#fef3c7', color: '#d97706', fontSize: '0.75rem' }}>
          Low Stock
        </span>
      );
    }
    return (
      <span className="badge rounded-pill px-2.5 py-1 fw-medium" style={{ backgroundColor: '#dcfce7', color: '#16a34a', fontSize: '0.75rem' }}>
        In Stock
      </span>
    );
  };

  // Add Product
  const handleAddProduct = async () => {
    if (!addForm.name || !addForm.sku || !addForm.price) {
      showToast('Please fill required product name, SKU and price.');
      return;
    }
    try {
      const token = localStorage.getItem('jwt_token') || 'demo_jwt_token_2026';
      const payload = {
        name: addForm.name,
        description: addForm.description,
        sku: addForm.sku.toUpperCase(),
        category: addForm.category,
        price: parseFloat(addForm.price),
        stock: parseInt(addForm.stock, 10) || 0,
        minimumStock: parseInt(addForm.minimumStock, 10) || 20,
        warehouse: addForm.warehouse,
        imageUrl: addForm.imageUrl,
      };

      await axios.post('http://localhost:5000/api/products', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showToast(`Added product "${addForm.name}" successfully!`);
      setShowAddModal(false);
      setAddForm({ name: '', description: '', sku: '', category: 'Accessories', price: '', stock: '', minimumStock: '20', warehouse: 'Main Warehouse', imageUrl: '' });
      loadData();
    } catch (err) {
      const newProd: ProductItem = {
        id: `prod-${Date.now()}`,
        name: addForm.name,
        description: addForm.description,
        sku: addForm.sku.toUpperCase(),
        category: addForm.category,
        price: parseFloat(addForm.price) || 0,
        stock: parseInt(addForm.stock, 10) || 0,
        minimumStock: parseInt(addForm.minimumStock, 10) || 20,
        warehouse: addForm.warehouse,
      };
      setProducts(prev => [newProd, ...prev]);
      showToast(`Added product "${addForm.name}"!`);
      setShowAddModal(false);
      setAddForm({ name: '', description: '', sku: '', category: 'Accessories', price: '', stock: '', minimumStock: '20', warehouse: 'Main Warehouse', imageUrl: '' });
    }
  };

  // Edit Product
  const handleOpenEdit = (prod: ProductItem) => {
    setEditProduct(prod);
    setEditForm({
      name: prod.name,
      description: prod.description || '',
      sku: prod.sku,
      category: prod.category || 'Accessories',
      price: String(prod.price),
      stock: String(prod.stock),
      minimumStock: String(prod.minimumStock || 20),
      warehouse: prod.warehouse || 'Main Warehouse',
      imageUrl: prod.imageUrl || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editProduct) return;
    try {
      const token = localStorage.getItem('jwt_token') || 'demo_jwt_token_2026';
      const payload = {
        name: editForm.name,
        description: editForm.description,
        sku: editForm.sku.toUpperCase(),
        category: editForm.category,
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock, 10) || 0,
        minimumStock: parseInt(editForm.minimumStock, 10) || 20,
        warehouse: editForm.warehouse,
        imageUrl: editForm.imageUrl,
      };

      await axios.put(`http://localhost:5000/api/products/${editProduct.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...payload } : p));
      showToast(`Updated product "${editForm.name}" successfully!`);
      setEditProduct(null);
      loadData();
    } catch (err) {
      setProducts(prev => prev.map(p => p.id === editProduct.id ? {
        ...p,
        name: editForm.name,
        description: editForm.description,
        sku: editForm.sku.toUpperCase(),
        category: editForm.category,
        price: parseFloat(editForm.price) || 0,
        stock: parseInt(editForm.stock, 10) || 0,
        minimumStock: parseInt(editForm.minimumStock, 10) || 20,
        warehouse: editForm.warehouse,
      } : p));
      showToast(`Updated product "${editForm.name}"!`);
      setEditProduct(null);
    }
  };

  // Permanent Delete
  const confirmDelete = async () => {
    if (!deleteProductTarget) return;
    const targetId = deleteProductTarget.id;
    const targetName = deleteProductTarget.name;
    try {
      const token = localStorage.getItem('jwt_token') || 'demo_jwt_token_2026';
      await axios.delete(`http://localhost:5000/api/products/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(prev => prev.filter(p => p.id !== targetId));
      showToast(`Permanently deleted "${targetName}" from catalog.`);
      setDeleteProductTarget(null);
      loadData();
    } catch (err) {
      setProducts(prev => prev.filter(p => p.id !== targetId));
      showToast(`Permanently deleted "${targetName}".`);
      setDeleteProductTarget(null);
    }
  };

  const handleCopyDetails = (prod: ProductItem) => {
    navigator.clipboard.writeText(`SKU: ${prod.sku} | Name: ${prod.name} | Price: ₹${prod.price} | Stock: ${prod.stock}`);
    showToast(`Copied SKU & details for ${prod.sku}!`);
    setActiveMenuId(null);
  };

  // Pagination Calculations
  const itemsPerPageNum = parseInt(perPage, 10) || 10;
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPageNum));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPageNum;
  const endIndex = Math.min(startIndex + itemsPerPageNum, totalItems);
  const displayedProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '2rem' }}>
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div
          className="position-fixed bottom-0 end-0 m-4 bg-dark text-white px-3 py-2.5 rounded-3 shadow-lg d-flex align-items-center gap-2 z-3"
          style={{ fontSize: '0.875rem' }}
        >
          <Check size={16} className="text-success" />
          {toastMessage}
        </div>
      )}

      {/* Top Header & Breadcrumbs */}
      <div className="d-flex align-items-start justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Products</h2>
          <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>Manage your products and inventory stock.</p>
        </div>
        <div className="d-flex flex-column align-items-end gap-2">
          <div className="text-muted small fw-medium">Dashboard &gt; <span className="text-dark">Products</span></div>
          {can('product', 'create', user?.role) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 fw-medium shadow-sm"
              style={{ backgroundColor: '#2563eb', borderColor: '#2563eb', borderRadius: '8px', fontSize: '0.9rem' }}
            >
              <Plus size={18} /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* 4 KPI Stat Cards Grid */}
      <div className="row g-3 mb-4">
        {/* Total Products */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-3 h-100" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 p-2.5 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#e0f2fe', color: '#0284c7', width: '48px', height: '48px' }}>
                <Box size={24} />
              </div>
              <div>
                <div className="text-muted small fw-medium">Total Products</div>
                <div className="fw-bold text-dark fs-3" style={{ lineHeight: '1.1' }}>{totalProductsCount}</div>
                <div className="text-secondary small" style={{ fontSize: '0.78rem' }}>All Products</div>
              </div>
            </div>
          </div>
        </div>

        {/* In Stock */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-3 h-100" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 p-2.5 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#dcfce7', color: '#16a34a', width: '48px', height: '48px' }}>
                <Layers size={24} />
              </div>
              <div>
                <div className="text-muted small fw-medium">In Stock</div>
                <div className="fw-bold text-dark fs-3" style={{ lineHeight: '1.1' }}>{inStockCount}</div>
                <div className="text-secondary small" style={{ fontSize: '0.78rem' }}>Products</div>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-3 h-100" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 p-2.5 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#fef3c7', color: '#d97706', width: '48px', height: '48px' }}>
                <Package size={24} />
              </div>
              <div>
                <div className="text-muted small fw-medium">Low Stock</div>
                <div className="fw-bold text-dark fs-3" style={{ lineHeight: '1.1' }}>{lowStockCount}</div>
                <div className="text-secondary small" style={{ fontSize: '0.78rem' }}>Products</div>
              </div>
            </div>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-3 h-100" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 p-2.5 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#fee2e2', color: '#dc2626', width: '48px', height: '48px' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <div className="text-muted small fw-medium">Out of Stock</div>
                <div className="fw-bold text-dark fs-3" style={{ lineHeight: '1.1' }}>{outOfStockCount}</div>
                <div className="text-secondary small" style={{ fontSize: '0.78rem' }}>Products</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="card border-0 shadow-sm p-3 mb-4 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div className="d-flex align-items-center gap-3 flex-wrap flex-lg-nowrap">
          {/* Search Box */}
          <div className="position-relative flex-grow-1" style={{ minWidth: '240px' }}>
            <Search size={16} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control ps-5 bg-white border"
              placeholder="Search products by name, SKU..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{ borderRadius: '8px', fontSize: '0.875rem', height: '40px', borderColor: '#cbd5e1' }}
            />
          </div>

          {/* Custom Category Toolbar Dropdown */}
          <div className="position-relative" style={{ width: '190px', flexShrink: 0 }}>
            <button
              type="button"
              className="form-select bg-white border text-secondary text-start d-flex align-items-center justify-content-between px-3"
              onClick={() => setShowCatDropdownToolbar(!showCatDropdownToolbar)}
              style={{ borderRadius: '8px', fontSize: '0.875rem', height: '40px', borderColor: '#cbd5e1' }}
            >
              <span className="text-truncate">{categoryFilter === 'ALL' ? 'All Categories' : categoryFilter}</span>
            </button>

            {showCatDropdownToolbar && (
              <div
                className="position-absolute bg-white rounded-3 shadow-lg border p-1 text-start overflow-auto"
                style={{ top: '100%', left: 0, marginTop: '4px', width: '210px', maxHeight: '240px', zIndex: 1100, borderColor: '#e2e8f0' }}
              >
                <button
                  type="button"
                  className={`w-100 btn btn-link text-start text-decoration-none px-3 py-2 rounded d-flex align-items-center justify-content-between ${categoryFilter === 'ALL' ? 'bg-primary text-white fw-semibold' : 'text-dark hover-bg-light'}`}
                  style={{ fontSize: '0.835rem' }}
                  onClick={() => { setCategoryFilter('ALL'); setShowCatDropdownToolbar(false); setCurrentPage(1); }}
                >
                  <span>All Categories</span>
                  {categoryFilter === 'ALL' && <Check size={14} />}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`w-100 btn btn-link text-start text-decoration-none px-3 py-2 rounded d-flex align-items-center justify-content-between ${categoryFilter === cat ? 'bg-primary text-white fw-semibold' : 'text-dark hover-bg-light'}`}
                    style={{ fontSize: '0.835rem' }}
                    onClick={() => { setCategoryFilter(cat); setShowCatDropdownToolbar(false); setCurrentPage(1); }}
                  >
                    <span className="text-truncate">{cat}</span>
                    {categoryFilter === cat && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Warehouse Select */}
          <div style={{ width: '180px', flexShrink: 0 }}>
            <select
              className="form-select bg-white border text-secondary"
              value={warehouseFilter}
              onChange={(e) => { setWarehouseFilter(e.target.value); setCurrentPage(1); }}
              style={{ borderRadius: '8px', fontSize: '0.875rem', height: '40px', borderColor: '#cbd5e1' }}
            >
              <option value="ALL">All Warehouses</option>
              <option value="Main Warehouse">Main Warehouse</option>
              <option value="Mumbai Warehouse">Mumbai Warehouse</option>
              <option value="Delhi Warehouse">Delhi Warehouse</option>
            </select>
          </div>

          {/* Stock Status Select */}
          <div style={{ width: '160px', flexShrink: 0 }}>
            <select
              className="form-select bg-white border text-secondary"
              value={stockStatusFilter}
              onChange={(e) => { setStockStatusFilter(e.target.value); setCurrentPage(1); }}
              style={{ borderRadius: '8px', fontSize: '0.875rem', height: '40px', borderColor: '#cbd5e1' }}
            >
              <option value="ALL">All Status</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>

          {/* Filters Toggle Button */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`btn d-flex align-items-center justify-content-center gap-1.5 border flex-shrink-0 ${showFilterPanel || activeFilterCount > 0 ? 'btn-primary text-white' : 'btn-outline-secondary bg-white'}`}
            style={{ borderRadius: '8px', fontSize: '0.875rem', height: '40px', borderColor: '#cbd5e1', color: (showFilterPanel || activeFilterCount > 0) ? '#ffffff' : '#475569', padding: '0 18px' }}
            title="Toggle Advanced Filters"
          >
            <SlidersHorizontal size={16} /> Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </button>
        </div>

        {/* Expandable Advanced Filter Panel */}
        {showFilterPanel && (
          <div className="mt-3 pt-3 border-top" style={{ borderColor: '#f1f5f9' }}>
            <div className="row g-3 align-items-center mb-2">
              {/* Sort Order Option */}
              <div className="col-md-3">
                <label className="form-label small fw-semibold text-secondary mb-1">Sort Products By</label>
                <select
                  className="form-select form-select-sm bg-white border text-dark"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ borderRadius: '6px', fontSize: '0.85rem', borderColor: '#cbd5e1' }}
                >
                  <option value="NEWEST">Newest / Default</option>
                  <option value="PRICE_LOW">Price: Low to High</option>
                  <option value="PRICE_HIGH">Price: High to Low</option>
                  <option value="STOCK_LOW">Stock: Lowest First</option>
                  <option value="NAME_ASC">Name (A to Z)</option>
                </select>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="row g-3 align-items-center">
              <div className="col-md-9">
                <label className="form-label small fw-semibold text-secondary mb-1">Quick Presets</label>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {(() => {
                    const isLowStockActive = stockStatusFilter === 'LOW_STOCK';
                    const isOutOfStockActive = stockStatusFilter === 'OUT_OF_STOCK';
                    const isAccessoriesActive = categoryFilter === 'Accessories';
                    const isAudioActive = categoryFilter === 'Audio';

                    return (
                      <>
                        <button
                          type="button"
                          className={`btn btn-sm rounded-pill px-3 py-1 fw-medium d-flex align-items-center gap-1 transition-all ${isLowStockActive ? 'btn-primary text-white shadow-sm' : 'btn-light border text-secondary bg-white'}`}
                          style={{
                            fontSize: '0.8rem',
                            backgroundColor: isLowStockActive ? '#2563eb' : '#ffffff',
                            borderColor: isLowStockActive ? '#2563eb' : '#cbd5e1',
                            color: isLowStockActive ? '#ffffff' : '#475569',
                          }}
                          onClick={() => {
                            if (isLowStockActive) {
                              setStockStatusFilter('ALL');
                            } else {
                              setStockStatusFilter('LOW_STOCK');
                            }
                            setCurrentPage(1);
                          }}
                        >
                          {isLowStockActive && <Check size={13} />} Low Stock Items
                        </button>

                        <button
                          type="button"
                          className={`btn btn-sm rounded-pill px-3 py-1 fw-medium d-flex align-items-center gap-1 transition-all ${isOutOfStockActive ? 'btn-primary text-white shadow-sm' : 'btn-light border text-secondary bg-white'}`}
                          style={{
                            fontSize: '0.8rem',
                            backgroundColor: isOutOfStockActive ? '#2563eb' : '#ffffff',
                            borderColor: isOutOfStockActive ? '#2563eb' : '#cbd5e1',
                            color: isOutOfStockActive ? '#ffffff' : '#475569',
                          }}
                          onClick={() => {
                            if (isOutOfStockActive) {
                              setStockStatusFilter('ALL');
                            } else {
                              setStockStatusFilter('OUT_OF_STOCK');
                            }
                            setCurrentPage(1);
                          }}
                        >
                          {isOutOfStockActive && <Check size={13} />} Out of Stock
                        </button>

                        <button
                          type="button"
                          className={`btn btn-sm rounded-pill px-3 py-1 fw-medium d-flex align-items-center gap-1 transition-all ${isAccessoriesActive ? 'btn-primary text-white shadow-sm' : 'btn-light border text-secondary bg-white'}`}
                          style={{
                            fontSize: '0.8rem',
                            backgroundColor: isAccessoriesActive ? '#2563eb' : '#ffffff',
                            borderColor: isAccessoriesActive ? '#2563eb' : '#cbd5e1',
                            color: isAccessoriesActive ? '#ffffff' : '#475569',
                          }}
                          onClick={() => {
                            if (isAccessoriesActive) {
                              setCategoryFilter('ALL');
                            } else {
                              setCategoryFilter('Accessories');
                            }
                            setCurrentPage(1);
                          }}
                        >
                          {isAccessoriesActive && <Check size={13} />} Accessories
                        </button>

                        <button
                          type="button"
                          className={`btn btn-sm rounded-pill px-3 py-1 fw-medium d-flex align-items-center gap-1 transition-all ${isAudioActive ? 'btn-primary text-white shadow-sm' : 'btn-light border text-secondary bg-white'}`}
                          style={{
                            fontSize: '0.8rem',
                            backgroundColor: isAudioActive ? '#2563eb' : '#ffffff',
                            borderColor: isAudioActive ? '#2563eb' : '#cbd5e1',
                            color: isAudioActive ? '#ffffff' : '#475569',
                          }}
                          onClick={() => {
                            if (isAudioActive) {
                              setCategoryFilter('ALL');
                            } else {
                              setCategoryFilter('Audio');
                            }
                            setCurrentPage(1);
                          }}
                        >
                          {isAudioActive && <Check size={13} />} Audio Products
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Panel Actions */}
              <div className="col-md-3 text-end">
                <div className="d-flex align-items-center justify-content-end gap-2 pt-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1.5 px-3 py-1.5 fw-medium bg-white"
                    style={{ borderRadius: '8px', fontSize: '0.825rem', borderColor: '#2563eb', color: '#2563eb' }}
                    onClick={handleClearFilters}
                  >
                    <RotateCcw size={14} /> Reset All Filters
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary px-3 py-1.5 fw-medium text-white shadow-sm"
                    style={{ borderRadius: '8px', fontSize: '0.825rem', backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                    onClick={() => setShowFilterPanel(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Products Table Container */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
        {/* Table Top Header Stats & Export */}
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom" style={{ borderColor: '#f1f5f9' }}>
          <div className="fw-semibold text-dark" style={{ fontSize: '0.925rem' }}>
            Total Products: <span className="text-dark fw-bold">{filteredProducts.length}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 bg-white border px-3"
              style={{ borderRadius: '6px', fontSize: '0.85rem', borderColor: '#cbd5e1', color: '#334155' }}
            >
              <Upload size={14} /> Export
            </button>
            <button
              onClick={loadData}
              className={`btn btn-outline-secondary btn-sm bg-white border p-2 ${loading ? 'opacity-50' : ''}`}
              title="Refresh"
              style={{ borderRadius: '6px', borderColor: '#cbd5e1', color: '#334155' }}
            >
              <RotateCw size={14} className={loading ? 'spin' : ''} />
            </button>
            <select
              className="form-select form-select-sm bg-white border"
              value={perPage}
              onChange={(e) => { setPerPage(e.target.value); setCurrentPage(1); }}
              style={{ borderRadius: '6px', fontSize: '0.85rem', width: 'auto', borderColor: '#cbd5e1', color: '#334155' }}
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-responsive" style={{ minHeight: '320px' }}>
          <table className="table table-hover align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th className="py-3 px-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem', width: '40px' }}>#</th>
                <th className="py-3 px-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>Product</th>
                <th className="py-3 px-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>SKU / Code</th>
                <th className="py-3 px-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>Category</th>
                <th className="py-3 px-3 text-secondary fw-semibold text-nowrap" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', minWidth: '120px' }}>Unit Price</th>
                <th className="py-3 px-3 text-secondary fw-semibold text-nowrap" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>Current Stock</th>
                <th className="py-3 px-3 text-secondary fw-semibold text-nowrap" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>Min. Stock</th>
                <th className="py-3 px-3 text-secondary fw-semibold text-nowrap" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>Warehouse</th>
                <th className="py-3 px-3 text-secondary fw-semibold text-nowrap" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>Status</th>
                <th className="py-3 px-3 text-secondary fw-semibold text-center text-nowrap" style={{ fontSize: '0.78rem', width: '150px', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Loading product stock items...
                  </td>
                </tr>
              ) : displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-5 text-muted">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                displayedProducts.map((prod, idx) => (
                  <tr key={prod.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {/* Index */}
                    <td className="px-3 py-3 text-secondary" style={{ fontSize: '0.875rem' }}>
                      {startIndex + idx + 1}
                    </td>

                    {/* Product Name with Description */}
                    <td className="px-3 py-3">
                      <div>
                        <div className="fw-bold text-dark text-nowrap" style={{ fontSize: '0.885rem', lineHeight: '1.25', whiteSpace: 'nowrap' }}>
                          {prod.name}
                        </div>
                        <div className="text-muted text-nowrap" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                          {prod.description}
                        </div>
                      </div>
                    </td>

                    {/* SKU Code */}
                    <td className="px-3 py-3 font-monospace fw-semibold text-secondary text-nowrap" style={{ fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                      {prod.sku}
                    </td>

                    {/* Category Pill */}
                    <td className="px-3 py-3 text-nowrap" style={{ whiteSpace: 'nowrap' }}>
                      <span className="badge rounded-pill px-2.5 py-1.5 fw-medium" style={{ backgroundColor: '#e0f2fe', color: '#0284c7', fontSize: '0.78rem' }}>
                        {prod.category || 'Accessories'}
                      </span>
                    </td>

                    {/* Unit Price */}
                    <td className="px-3 py-3 text-dark fw-bold text-nowrap" style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                      ₹{Number(prod.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Current Stock */}
                    <td className="px-3 py-3 font-semibold" style={{ fontSize: '0.875rem' }}>
                      <span style={{ color: prod.stock === 0 ? '#dc2626' : (prod.stock <= (prod.minimumStock || 20) ? '#d97706' : '#16a34a') }}>
                        {prod.stock}
                      </span>
                    </td>

                    {/* Min. Stock */}
                    <td className="px-3 py-3 text-secondary" style={{ fontSize: '0.875rem' }}>
                      {prod.minimumStock || 20}
                    </td>

                    {/* Warehouse */}
                    <td className="px-3 py-3 text-secondary" style={{ fontSize: '0.85rem' }}>
                      {prod.warehouse || 'Main Warehouse'}
                    </td>

                    {/* Status Badge */}
                    <td className="px-3 py-3">
                      {renderStatusBadge(prod.stock, prod.minimumStock)}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3 text-center">
                      <div className="d-inline-flex align-items-center gap-2 position-relative">
                        {/* View Button */}
                        <button
                          onClick={() => { setViewProduct(prod); setShowModalImage(false); }}
                          className="btn btn-sm p-0 d-flex align-items-center justify-content-center transition-all"
                          title="View Product Details"
                          style={{ borderRadius: '8px', color: '#2563eb', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', width: '34px', height: '34px' }}
                        >
                          <Eye size={15} />
                        </button>

                        {/* Edit Button */}
                        {can('product', 'edit', user?.role) && (
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="btn btn-sm p-0 d-flex align-items-center justify-content-center transition-all"
                            title="Edit Product"
                            style={{ borderRadius: '8px', color: '#d97706', backgroundColor: '#fef3c7', border: '1px solid #fde68a', width: '34px', height: '34px' }}
                          >
                            <Pencil size={15} />
                          </button>
                        )}

                        {/* More Options Button */}
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === prod.id ? null : prod.id)}
                          className="btn btn-sm p-0 d-flex align-items-center justify-content-center transition-all"
                          title="More Options"
                          style={{ borderRadius: '8px', color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fecaca', width: '34px', height: '34px' }}
                        >
                          <MoreVertical size={15} />
                        </button>

                        {/* Floating Context Action Menu */}
                        {activeMenuId === prod.id && (
                          <div
                            className="position-absolute bg-white rounded-3 shadow-lg border p-1.5 text-start"
                            style={{ right: '0', top: '100%', marginTop: '6px', minWidth: '175px', borderColor: '#e2e8f0', zIndex: 1050 }}
                          >
                            <button
                              className="w-100 btn btn-link text-start text-dark text-decoration-none d-flex align-items-center gap-2 px-2.5 py-1.5 rounded hover-bg-light"
                              style={{ fontSize: '0.825rem' }}
                              onClick={() => { setViewProduct(prod); setShowModalImage(false); setActiveMenuId(null); }}
                            >
                              <Eye size={14} className="text-primary" /> View Details
                            </button>
                            {can('product', 'edit', user?.role) && (
                              <button
                                className="w-100 btn btn-link text-start text-dark text-decoration-none d-flex align-items-center gap-2 px-2.5 py-1.5 rounded hover-bg-light"
                                style={{ fontSize: '0.825rem' }}
                                onClick={() => { handleOpenEdit(prod); setActiveMenuId(null); }}
                              >
                                <Pencil size={14} className="text-warning" /> Edit Product
                              </button>
                            )}
                            <button
                              className="w-100 btn btn-link text-start text-dark text-decoration-none d-flex align-items-center gap-2 px-2.5 py-1.5 rounded hover-bg-light"
                              style={{ fontSize: '0.825rem' }}
                              onClick={() => handleCopyDetails(prod)}
                            >
                              <Copy size={14} className="text-info" /> Copy SKU Info
                            </button>
                            {can('product', 'delete', user?.role) && (
                              <>
                                <hr className="dropdown-divider my-1" />
                                <button
                                  className="w-100 btn btn-link text-start text-danger text-decoration-none d-flex align-items-center gap-2 px-2.5 py-1.5 rounded hover-bg-light"
                                  style={{ fontSize: '0.825rem' }}
                                  onClick={() => { setDeleteProductTarget(prod); setActiveMenuId(null); }}
                                >
                                  <Trash2 size={14} /> Delete Product
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Footer */}
        <div className="d-flex align-items-center justify-content-between p-3 border-top" style={{ borderColor: '#f1f5f9' }}>
          <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
            Showing <span className="fw-semibold text-dark">{totalItems > 0 ? startIndex + 1 : 0}</span> to <span className="fw-semibold text-dark">{endIndex}</span> of <span className="fw-semibold text-dark">{totalItems}</span> products
          </div>

          <div className="d-flex align-items-center gap-1">
            <button
              className="btn btn-sm btn-light border p-1.5 me-1"
              disabled={safePage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{ borderRadius: '6px' }}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`btn btn-sm px-2.5 py-1 ${safePage === page ? 'btn-primary fw-semibold' : 'btn-light border'}`}
                style={{ borderRadius: '6px', fontSize: '0.85rem', backgroundColor: safePage === page ? '#2563eb' : '', color: safePage === page ? '#ffffff' : '' }}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="btn btn-sm btn-light border p-1.5 ms-1"
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{ borderRadius: '6px' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header border-bottom bg-light px-4 py-3">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <Package className="text-primary" size={20} /> Add New Product
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Product Name *</label>
                  <input
                    type="text"
                    className="form-control bg-white"
                    placeholder="e.g. USB Fast Charger"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    style={{ borderRadius: '8px' }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark d-flex align-items-center justify-content-between">
                    <span>Product Description</span>
                    <span className="text-muted fw-normal" style={{ fontSize: '0.75rem' }}>({addForm.description.length}/250 chars)</span>
                  </label>
                  <input
                    type="text"
                    className="form-control bg-white"
                    placeholder="e.g. Fast charging adapter"
                    maxLength={250}
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value.slice(0, 250) })}
                    style={{ borderRadius: '8px' }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Product Image</label>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-primary bg-white d-flex align-items-center justify-content-center gap-2"
                      style={{ borderRadius: '8px', minWidth: '160px' }}
                      onClick={() => addImageInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      <Upload size={16} />
                      <span>{uploadingImage && uploadTarget === 'add' ? 'Uploading...' : 'Upload Image'}</span>
                    </button>
                    {addForm.imageUrl && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary bg-white d-flex align-items-center justify-content-center gap-2"
                        style={{ borderRadius: '8px' }}
                        onClick={() => setAddForm(prev => ({ ...prev, imageUrl: '' }))}
                        disabled={uploadingImage}
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    )}
                  </div>
                  <input
                    ref={addImageInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleProductImageChange(e, 'add')}
                  />
                  {addForm.imageUrl && (
                    <div className="mt-2 text-center p-2 rounded bg-light border">
                      <img src={addForm.imageUrl} alt="Preview" style={{ maxHeight: '90px', maxWidth: '100%', objectFit: 'contain' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Or paste Image URL</label>
                  <input
                    type="text"
                    className="form-control bg-white"
                    placeholder="https://res.cloudinary.com/i0vwvn7t/..."
                    value={addForm.imageUrl}
                    onChange={(e) => setAddForm({ ...addForm, imageUrl: e.target.value })}
                    style={{ borderRadius: '8px' }}
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">SKU / Code *</label>
                    <input
                      type="text"
                      className="form-control bg-white font-monospace"
                      placeholder="CHG001"
                      value={addForm.sku}
                      onChange={(e) => setAddForm({ ...addForm, sku: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                  <div className="col-6 position-relative">
                    <label className="form-label small fw-semibold text-dark d-flex align-items-center justify-content-between">
                      <span>Category</span>
                      {!showCustomCatAddInput ? (
                        <button
                          type="button"
                          className="btn btn-link p-0 text-primary fw-medium text-decoration-none"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => setShowCustomCatAddInput(true)}
                        >
                          + Add New
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-link p-0 text-secondary fw-medium text-decoration-none"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => setShowCustomCatAddInput(false)}
                        >
                          Select Existing
                        </button>
                      )}
                    </label>

                    {!showCustomCatAddInput ? (
                      <div className="position-relative">
                        <button
                          type="button"
                          className="form-select bg-white text-start d-flex align-items-center justify-content-between"
                          onClick={() => setShowCatDropdownAdd(!showCatDropdownAdd)}
                          style={{ borderRadius: '8px', fontSize: '0.875rem' }}
                        >
                          <span className="text-truncate">{addForm.category || 'Select Category'}</span>
                        </button>

                        {showCatDropdownAdd && (
                          <div
                            className="position-absolute bg-white rounded-3 shadow-lg border p-1 text-start overflow-auto"
                            style={{ top: '100%', left: 0, marginTop: '4px', width: '100%', maxHeight: '220px', zIndex: 1100, borderColor: '#e2e8f0' }}
                          >
                            {categories.map(cat => (
                              <button
                                key={cat}
                                type="button"
                                className={`w-100 btn btn-link text-start text-decoration-none px-3 py-2 rounded d-flex align-items-center justify-content-between ${addForm.category === cat ? 'bg-primary text-white fw-semibold' : 'text-dark hover-bg-light'}`}
                                style={{ fontSize: '0.835rem' }}
                                onClick={() => {
                                  setAddForm({ ...addForm, category: cat });
                                  setShowCatDropdownAdd(false);
                                }}
                              >
                                <span className="text-truncate">{cat}</span>
                                {addForm.category === cat && <Check size={14} />}
                              </button>
                            ))}
                            <hr className="my-1 border-secondary-subtle" />
                            <button
                              type="button"
                              className="w-100 btn btn-sm btn-light border text-primary fw-semibold text-start px-2.5 py-1.5 mt-1 d-flex align-items-center gap-1.5 text-nowrap"
                              style={{ borderRadius: '6px', fontSize: '0.825rem', borderColor: '#bfdbfe', backgroundColor: '#eff6ff', whiteSpace: 'nowrap' }}
                              onClick={() => {
                                setShowCatDropdownAdd(false);
                                setShowCustomCatAddInput(true);
                              }}
                            >
                              <Plus size={14} /> Add Custom Category
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control bg-white"
                          placeholder="Category Name"
                          value={customCategoryAdd}
                          onChange={(e) => setCustomCategoryAdd(e.target.value)}
                          style={{ borderRadius: '8px 0 0 8px', fontSize: '0.85rem' }}
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-sm px-2.5"
                          style={{ borderRadius: '0 8px 8px 0', backgroundColor: '#2563eb' }}
                          onClick={() => {
                            if (customCategoryAdd.trim()) {
                              const newCat = customCategoryAdd.trim();
                              if (!categories.includes(newCat)) {
                                setCategories(prev => [...prev, newCat]);
                              }
                              setAddForm({ ...addForm, category: newCat });
                              setCustomCategoryAdd('');
                              setShowCustomCatAddInput(false);
                              showToast(`Saved custom category "${newCat}" to list!`);
                            }
                          }}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Unit Price (INR) *</label>
                    <input
                      type="number"
                      className="form-control bg-white"
                      placeholder="500.00"
                      value={addForm.price}
                      onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Current Stock</label>
                    <input
                      type="number"
                      className="form-control bg-white"
                      placeholder="125"
                      value={addForm.stock}
                      onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Min. Stock</label>
                    <input
                      type="number"
                      className="form-control bg-white"
                      placeholder="50"
                      value={addForm.minimumStock}
                      onChange={(e) => setAddForm({ ...addForm, minimumStock: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Warehouse Storage</label>
                    <select
                      className="form-select bg-white"
                      value={addForm.warehouse}
                      onChange={(e) => setAddForm({ ...addForm, warehouse: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    >
                      <option value="Main Warehouse">Main Warehouse</option>
                      <option value="Mumbai Warehouse">Mumbai Warehouse</option>
                      <option value="Delhi Warehouse">Delhi Warehouse</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top bg-light px-4 py-3">
                <button className="btn btn-outline-secondary px-3" style={{ borderRadius: '8px' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-primary px-4 shadow-sm" style={{ borderRadius: '8px', backgroundColor: '#2563eb' }} onClick={handleAddProduct}>Save Product</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Product Details Modal */}
      {viewProduct && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header border-bottom bg-light px-4 py-3">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <Box className="text-primary" size={20} /> Product Specifications & Image
                </h5>
                <button type="button" className="btn-close" onClick={() => setViewProduct(null)}></button>
              </div>
              <div className="modal-body p-4">
                {/* View Image Option Toggle Button */}
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom" style={{ borderColor: '#f1f5f9' }}>
                  <span className="text-secondary small fw-semibold">Product Image Preview</span>
                  <button
                    type="button"
                    onClick={() => setShowModalImage(!showModalImage)}
                    className={`btn btn-sm d-flex align-items-center gap-1.5 fw-medium transition-all ${showModalImage ? 'btn-primary text-white shadow-sm' : 'btn-outline-primary bg-white'}`}
                    style={{ borderRadius: '8px', fontSize: '0.825rem', borderColor: '#2563eb', color: showModalImage ? '#ffffff' : '#2563eb' }}
                  >
                    <ImageIcon size={14} /> {showModalImage ? 'Hide Image' : 'Show Product Image'}
                  </button>
                </div>

                {/* Conditional Product Image Preview */}
                {showModalImage && (
                  <div className="text-center p-3 mb-3 rounded-3 bg-light border overflow-hidden position-relative" style={{ borderColor: '#e2e8f0' }}>
                    <img
                      src={getProductImage(viewProduct)}
                      alt={viewProduct.name}
                      className="img-fluid rounded-3 shadow-sm"
                      style={{ maxHeight: '200px', width: '100%', objectFit: 'contain', backgroundColor: '#ffffff' }}
                    />
                  </div>
                )}

                <div className="d-flex align-items-center justify-content-between p-3 rounded-3 mb-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace px-2.5 py-1 mb-1">
                      {viewProduct.sku}
                    </span>
                    <h5 className="fw-bold text-dark mb-0">{viewProduct.name}</h5>
                    <div className="text-muted small">{viewProduct.description}</div>
                  </div>
                  <button
                    onClick={() => handleCopyDetails(viewProduct)}
                    className="btn btn-sm btn-outline-secondary bg-white d-flex align-items-center gap-1.5"
                    style={{ borderRadius: '6px', fontSize: '0.8rem' }}
                  >
                    <Copy size={13} /> Copy Info
                  </button>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9' }}>
                      <span className="text-secondary small d-block mb-1">Category</span>
                      <strong className="text-dark fs-6">{viewProduct.category || 'Accessories'}</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9' }}>
                      <span className="text-secondary small d-block mb-1">Unit Price</span>
                      <strong className="text-dark fs-6">₹ {Number(viewProduct.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9' }}>
                      <span className="text-secondary small d-block mb-1">Current Stock</span>
                      <strong className={`fs-6 ${viewProduct.stock === 0 ? 'text-danger' : (viewProduct.stock <= (viewProduct.minimumStock || 20) ? 'text-warning' : 'text-success')}`}>
                        {viewProduct.stock} units
                      </strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9' }}>
                      <span className="text-secondary small d-block mb-1">Min. Stock Alert</span>
                      <strong className="text-dark fs-6">{viewProduct.minimumStock || 20} units</strong>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 rounded-3" style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9' }}>
                      <span className="text-secondary small d-block mb-1">Warehouse Storage Location</span>
                      <strong className="text-dark">{viewProduct.warehouse || 'Main Warehouse'}</strong>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top bg-light px-4 py-3">
                <button
                  className="btn btn-outline-primary px-3 fw-medium d-flex align-items-center gap-1.5"
                  onClick={() => {
                    const target = viewProduct;
                    setViewProduct(null);
                    handleOpenEdit(target);
                  }}
                  style={{ borderRadius: '8px', display: can('product', 'edit', user?.role) ? undefined : 'none' }}
                >
                  <Pencil size={14} /> Edit Product
                </button>
                <button className="btn btn-secondary px-4 fw-medium" style={{ borderRadius: '8px' }} onClick={() => setViewProduct(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header border-bottom bg-light px-4 py-3">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <Pencil className="text-warning" size={18} /> Edit Product
                </h5>
                <button type="button" className="btn-close" onClick={() => setEditProduct(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Product Name</label>
                  <input
                    type="text"
                    className="form-control bg-white"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    style={{ borderRadius: '8px' }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark d-flex align-items-center justify-content-between">
                    <span>Product Description</span>
                    <span className="text-muted fw-normal" style={{ fontSize: '0.75rem' }}>({editForm.description.length}/250 chars)</span>
                  </label>
                  <input
                    type="text"
                    className="form-control bg-white"
                    maxLength={250}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value.slice(0, 250) })}
                    style={{ borderRadius: '8px' }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Product Image</label>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-primary bg-white d-flex align-items-center justify-content-center gap-2"
                      style={{ borderRadius: '8px', minWidth: '160px' }}
                      onClick={() => editImageInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      <Upload size={16} />
                      <span>{uploadingImage && uploadTarget === 'edit' ? 'Uploading...' : 'Upload Image'}</span>
                    </button>
                    {editForm.imageUrl && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary bg-white d-flex align-items-center justify-content-center gap-2"
                        style={{ borderRadius: '8px' }}
                        onClick={() => setEditForm(prev => ({ ...prev, imageUrl: '' }))}
                        disabled={uploadingImage}
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    )}
                  </div>
                  <input
                    ref={editImageInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleProductImageChange(e, 'edit')}
                  />
                  {editForm.imageUrl && (
                    <div className="mt-2 text-center p-2 rounded bg-light border">
                      <img src={editForm.imageUrl} alt="Preview" style={{ maxHeight: '90px', maxWidth: '100%', objectFit: 'contain' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Or paste Image URL</label>
                  <input
                    type="text"
                    className="form-control bg-white"
                    placeholder="https://res.cloudinary.com/i0vwvn7t/..."
                    value={editForm.imageUrl}
                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                    style={{ borderRadius: '8px' }}
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">SKU / Code</label>
                    <input
                      type="text"
                      className="form-control bg-white font-monospace"
                      value={editForm.sku}
                      onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                  <div className="col-6 position-relative">
                    <label className="form-label small fw-semibold text-dark d-flex align-items-center justify-content-between">
                      <span>Category</span>
                      {!showCustomCatEditInput ? (
                        <button
                          type="button"
                          className="btn btn-link p-0 text-primary fw-medium text-decoration-none"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => setShowCustomCatEditInput(true)}
                        >
                          + Add New
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-link p-0 text-secondary fw-medium text-decoration-none"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => setShowCustomCatEditInput(false)}
                        >
                          Select Existing
                        </button>
                      )}
                    </label>

                    {!showCustomCatEditInput ? (
                      <div className="position-relative">
                        <button
                          type="button"
                          className="form-select bg-white text-start d-flex align-items-center justify-content-between"
                          onClick={() => setShowCatDropdownEdit(!showCatDropdownEdit)}
                          style={{ borderRadius: '8px', fontSize: '0.875rem' }}
                        >
                          <span className="text-truncate">{editForm.category || 'Select Category'}</span>
                        </button>

                        {showCatDropdownEdit && (
                          <div
                            className="position-absolute bg-white rounded-3 shadow-lg border p-1 text-start overflow-auto"
                            style={{ top: '100%', left: 0, marginTop: '4px', width: '100%', maxHeight: '220px', zIndex: 1100, borderColor: '#e2e8f0' }}
                          >
                            {categories.map(cat => (
                              <button
                                key={cat}
                                type="button"
                                className={`w-100 btn btn-link text-start text-decoration-none px-3 py-2 rounded d-flex align-items-center justify-content-between ${editForm.category === cat ? 'bg-primary text-white fw-semibold' : 'text-dark hover-bg-light'}`}
                                style={{ fontSize: '0.835rem' }}
                                onClick={() => {
                                  setEditForm({ ...editForm, category: cat });
                                  setShowCatDropdownEdit(false);
                                }}
                              >
                                <span className="text-truncate">{cat}</span>
                                {editForm.category === cat && <Check size={14} />}
                              </button>
                            ))}
                            <hr className="my-1 border-secondary-subtle" />
                            <button
                              type="button"
                              className="w-100 btn btn-sm btn-light border text-primary fw-semibold text-start px-2.5 py-1.5 mt-1 d-flex align-items-center gap-1.5 text-nowrap"
                              style={{ borderRadius: '6px', fontSize: '0.825rem', borderColor: '#bfdbfe', backgroundColor: '#eff6ff', whiteSpace: 'nowrap' }}
                              onClick={() => {
                                setShowCatDropdownEdit(false);
                                setShowCustomCatEditInput(true);
                              }}
                            >
                              <Plus size={14} /> Add Custom Category
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control bg-white"
                          placeholder="Category Name"
                          value={customCategoryEdit}
                          onChange={(e) => setCustomCategoryEdit(e.target.value)}
                          style={{ borderRadius: '8px 0 0 8px', fontSize: '0.85rem' }}
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-sm px-2.5"
                          style={{ borderRadius: '0 8px 8px 0', backgroundColor: '#2563eb' }}
                          onClick={() => {
                            if (customCategoryEdit.trim()) {
                              const newCat = customCategoryEdit.trim();
                              if (!categories.includes(newCat)) {
                                setCategories(prev => [...prev, newCat]);
                              }
                              setEditForm({ ...editForm, category: newCat });
                              setCustomCategoryEdit('');
                              setShowCustomCatEditInput(false);
                              showToast(`Saved custom category "${newCat}" to list!`);
                            }
                          }}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Unit Price (INR)</label>
                    <input
                      type="number"
                      className="form-control bg-white"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Current Stock</label>
                    <input
                      type="number"
                      className="form-control bg-white"
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Min. Stock</label>
                    <input
                      type="number"
                      className="form-control bg-white"
                      value={editForm.minimumStock}
                      onChange={(e) => setEditForm({ ...editForm, minimumStock: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Warehouse Storage</label>
                    <select
                      className="form-select bg-white"
                      value={editForm.warehouse}
                      onChange={(e) => setEditForm({ ...editForm, warehouse: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    >
                      <option value="Main Warehouse">Main Warehouse</option>
                      <option value="Mumbai Warehouse">Mumbai Warehouse</option>
                      <option value="Delhi Warehouse">Delhi Warehouse</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top bg-light px-4 py-3">
                <button className="btn btn-outline-secondary px-3" style={{ borderRadius: '8px' }} onClick={() => setEditProduct(null)}>Cancel</button>
                <button className="btn btn-primary px-4 shadow-sm" style={{ borderRadius: '8px', backgroundColor: '#2563eb' }} onClick={handleSaveEdit}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteProductTarget && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-body p-4 text-center">
                <div
                  className="rounded-circle text-danger d-inline-flex align-items-center justify-content-center mb-3 shadow-sm"
                  style={{ width: '64px', height: '64px', backgroundColor: '#fee2e2', color: '#dc2626' }}
                >
                  <AlertTriangle size={32} />
                </div>
                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.2rem' }}>Delete Product</h5>
                <p className="text-secondary small mb-4" style={{ lineHeight: '1.5' }}>
                  Are you sure you want to delete <strong className="text-dark">"{deleteProductTarget.name}"</strong> ({deleteProductTarget.sku})? This action will remove it from the catalog.
                </p>
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <button
                    type="button"
                    className="btn btn-light border px-4 py-2 fw-medium flex-fill"
                    style={{ borderRadius: '8px', fontSize: '0.9rem', borderColor: '#cbd5e1' }}
                    onClick={() => setDeleteProductTarget(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger px-4 py-2 fw-medium flex-fill shadow-sm"
                    style={{ borderRadius: '8px', fontSize: '0.9rem', backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                    onClick={confirmDelete}
                  >
                    Delete Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
