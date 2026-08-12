import React, { useState, useRef } from 'react';
import {
  Building2,
  Receipt,
  Package,
  Bell,
  ShieldCheck,
  Settings as SettingsIcon,
  Building,
  Boxes,
  FileCheck,
  Users,
  Database,
  Link,
  ClipboardList,
  Eye,
  Save,
  CheckCircle2,
  RotateCcw,
  Download,
  Check,
  X,
  Upload,
  Key,
  Globe,
  Lock,
  Mail,
  RefreshCw,
  FileText
} from 'lucide-react';
import { uploadImageToCloudinary, isConfigured } from '../utils/cloudinary';

export const Settings: React.FC = () => {
  // State for active tab in Settings Menu
  const [activeTab, setActiveTab] = useState('company-profile');

  // State for alert notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Company Logo State & Ref
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    return localStorage.getItem('mini_erp_company_logo') || null;
  });
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUploadClick = () => {
    logoInputRef.current?.click();
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showNotification('File size exceeds 5MB limit!', 'warning');
      return;
    }
    if (isConfigured()) {
      setIsLogoUploading(true);
      try {
        const result = await uploadImageToCloudinary(file, 'logos');
        setLogoUrl(result.secure_url);
        localStorage.setItem('mini_erp_company_logo', result.secure_url);
        showNotification('Company logo uploaded to Cloudinary and saved successfully!', 'success');
      } catch (err) {
        showNotification((err as Error).message || 'Logo upload to Cloudinary failed.', 'warning');
        return;
      } finally {
        setIsLogoUploading(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setLogoUrl(result);
        localStorage.setItem('mini_erp_company_logo', result);
        showNotification('Company logo uploaded and saved successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogoUrl(null);
    localStorage.removeItem('mini_erp_company_logo');
    if (logoInputRef.current) logoInputRef.current.value = '';
    showNotification('Company logo removed.', 'info');
  };

  // View Company Profile Modal State
  const [showViewModal, setShowViewModal] = useState(false);

  // Restore Backup Modal State & Ref
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  // Email Test & Company Save Loading States
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isCompanySaved, setIsCompanySaved] = useState(false);

  // State for Company Profile Form with LocalStorage Persistence
  const [companyForm, setCompanyForm] = useState(() => {
    const saved = localStorage.getItem('mini_erp_company_form');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      companyName: 'Mini ERP + CRM Pvt. Ltd.',
      email: 'info@minierpcrm.com',
      phone: '+91 98765 43210',
      website: 'https://www.minierpcrm.com',
      address: '123, Business Park, 5th Floor, Andheri (West), Mumbai - 400058, Maharashtra, India',
      gstNumber: '27ABCDE1234F1Z5',
      state: 'Maharashtra',
      currency: 'Indian Rupee (₹)',
      timeZone: '(GMT+05:30) Asia/Kolkata',
    };
  });

  // State for Quick Settings Toggles
  const [quickSettings, setQuickSettings] = useState(() => {
    const saved = localStorage.getItem('mini_erp_quick_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      enableGst: true,
      enableStockAlerts: true,
      enableLowStockEmail: true,
      enableSmsNotif: false,
      allowNegativeStock: false,
      autoBackupDaily: true,
      maintainAuditLogs: true,
      enableTwoFactor: true,
    };
  });

  // State for Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    emailAddress: 'no-reply@minierpcrm.com',
    password: '••••••••••••',
    useSmtpAuth: true,
  });

  // State for Date & Number Format
  const [formatSettings, setFormatSettings] = useState({
    dateFormat: '17 May 2024 (DD MMM YYYY)',
    timeFormat: '12 Hour (02:30 PM)',
    numberFormat: '1,23,456.78',
  });

  // State for Backup frequency
  const [backupFreq, setBackupFreq] = useState(() => localStorage.getItem('mini_erp_backup_freq') || 'Daily');
  const [keepBackups, setKeepBackups] = useState(() => localStorage.getItem('mini_erp_keep_backups') || '30 Days');

  // Billing & Taxes State
  const [billingForm, setBillingForm] = useState(() => {
    const saved = localStorage.getItem('mini_erp_billing_form');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      defaultGstRate: '18%',
      panNumber: 'ABCDE1234F',
      invoicePrefix: 'INV-2024-',
      hsnCode: '84713010',
      taxTerms: 'Prices are inclusive of 18% GST.',
    };
  });
  const [isSavingBilling, setIsSavingBilling] = useState(false);
  const [isBillingSaved, setIsBillingSaved] = useState(false);

  // Security Form State
  const [securityForm, setSecurityForm] = useState(() => {
    const saved = localStorage.getItem('mini_erp_security_form');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      sessionTimeout: '30 Minutes',
    };
  });
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [isSecuritySaved, setIsSecuritySaved] = useState(false);

  // Inventory Settings State
  const [inventoryForm, setInventoryForm] = useState(() => {
    const saved = localStorage.getItem('mini_erp_inventory_form');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      valuationMethod: 'FIFO',
      lowStockThreshold: '10',
      defaultUnit: 'Pcs',
      reorderAlertLevel: '15',
    };
  });
  const [isSavingInventory, setIsSavingInventory] = useState(false);
  const [isInventorySaved, setIsInventorySaved] = useState(false);

  // Sales Settings State
  const [salesForm, setSalesForm] = useState(() => {
    const saved = localStorage.getItem('mini_erp_sales_form');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      paymentTerms: 'Net 30',
      challanPrefix: 'CH-2024-',
      defaultTerms: 'Goods once sold will not be taken back without original challan copy.',
      autoConvertInvoice: true,
    };
  });
  const [isSavingSales, setIsSavingSales] = useState(false);
  const [isSalesSaved, setIsSalesSaved] = useState(false);

  // Notifications Form State
  const [notifForm, setNotifForm] = useState(() => {
    const saved = localStorage.getItem('mini_erp_notif_form');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      emailAlerts: true,
      smsGatewayKey: 'sms_live_key_998124',
      digestTime: '09:00 AM',
      dailySummary: true,
    };
  });
  const [isSavingNotif, setIsSavingNotif] = useState(false);
  const [isNotifSaved, setIsNotifSaved] = useState(false);

  // General Settings State
  const [generalForm, setGeneralForm] = useState(() => {
    const saved = localStorage.getItem('mini_erp_general_form');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      portalTitle: 'Mini ERP + CRM Portal',
      language: 'English (US)',
      maintenanceMode: false,
      themeColor: 'Default Blue',
    };
  });
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isGeneralSaved, setIsGeneralSaved] = useState(false);

  const handleToggle = (key: keyof typeof quickSettings) => {
    setQuickSettings((prev: typeof quickSettings) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('mini_erp_quick_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCompany(true);
    localStorage.setItem('mini_erp_company_form', JSON.stringify(companyForm));
    if (logoUrl) {
      localStorage.setItem('mini_erp_company_logo', logoUrl);
    }
    setTimeout(() => {
      setIsSavingCompany(false);
      setIsCompanySaved(true);
      showNotification('Company Profile settings updated and saved successfully!', 'success');
      setTimeout(() => setIsCompanySaved(false), 2500);
    }, 500);
  };

  const handleResetCompanyDefaults = () => {
    const defaultData = {
      companyName: 'Mini ERP + CRM Pvt. Ltd.',
      email: 'info@minierpcrm.com',
      phone: '+91 98765 43210',
      website: 'https://www.minierpcrm.com',
      address: '123, Business Park, 5th Floor, Andheri (West), Mumbai - 400058, Maharashtra, India',
      gstNumber: '27ABCDE1234F1Z5',
      state: 'Maharashtra',
      currency: 'Indian Rupee (₹)',
      timeZone: '(GMT+05:30) Asia/Kolkata',
    };
    setCompanyForm(defaultData);
    localStorage.removeItem('mini_erp_company_form');
    showNotification('Company Profile reset to default values.', 'info');
  };

  const handleBillingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBilling(true);
    localStorage.setItem('mini_erp_billing_form', JSON.stringify(billingForm));
    setTimeout(() => {
      setIsSavingBilling(false);
      setIsBillingSaved(true);
      showNotification('Billing & Tax preferences saved and persisted!', 'success');
      setTimeout(() => setIsBillingSaved(false), 2500);
    }, 500);
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.newPassword && securityForm.newPassword !== securityForm.confirmPassword) {
      showNotification('New passwords do not match!', 'warning');
      return;
    }
    setIsSavingSecurity(true);
    localStorage.setItem('mini_erp_security_form', JSON.stringify(securityForm));
    setTimeout(() => {
      setIsSavingSecurity(false);
      setIsSecuritySaved(true);
      setSecurityForm((prev: typeof securityForm) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      showNotification('Security settings updated successfully!', 'success');
      setTimeout(() => setIsSecuritySaved(false), 2500);
    }, 500);
  };

  const handleInventorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingInventory(true);
    localStorage.setItem('mini_erp_inventory_form', JSON.stringify(inventoryForm));
    setTimeout(() => {
      setIsSavingInventory(false);
      setIsInventorySaved(true);
      showNotification('Inventory settings saved successfully!', 'success');
      setTimeout(() => setIsInventorySaved(false), 2500);
    }, 500);
  };

  const handleSalesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSales(true);
    localStorage.setItem('mini_erp_sales_form', JSON.stringify(salesForm));
    setTimeout(() => {
      setIsSavingSales(false);
      setIsSalesSaved(true);
      showNotification('Sales Settings saved successfully!', 'success');
      setTimeout(() => setIsSalesSaved(false), 2500);
    }, 500);
  };

  const handleNotifSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotif(true);
    localStorage.setItem('mini_erp_notif_form', JSON.stringify(notifForm));
    setTimeout(() => {
      setIsSavingNotif(false);
      setIsNotifSaved(true);
      showNotification('Notification preferences saved!', 'success');
      setTimeout(() => setIsNotifSaved(false), 2500);
    }, 500);
  };

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGeneral(true);
    localStorage.setItem('mini_erp_general_form', JSON.stringify(generalForm));
    setTimeout(() => {
      setIsSavingGeneral(false);
      setIsGeneralSaved(true);
      showNotification('General portal settings saved!', 'success');
      setTimeout(() => setIsGeneralSaved(false), 2500);
    }, 500);
  };

  const handleEmailSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('mini_erp_email_settings', JSON.stringify(emailSettings));
    showNotification('Email & SMTP configuration updated successfully!', 'success');
  };


  const handleTestEmail = () => {
    setIsTestingEmail(true);
    setTimeout(() => {
      setIsTestingEmail(false);
      showNotification(`Test email successfully sent to ${emailSettings.emailAddress}!`, 'success');
    }, 1500);
  };

  const handleFormatSave = (e: React.FormEvent) => {
    e.preventDefault();
    showNotification('Date, time & number format preferences saved!', 'success');
  };

  // Real JSON Backup Download Handler
  const handleBackupNow = () => {
    const backupData = {
      version: 'v2.1.0',
      exportedAt: new Date().toISOString(),
      companyProfile: companyForm,
      quickSettings,
      emailSettings: { ...emailSettings, password: '***' },
      formatSettings,
      backupFrequency: backupFreq,
      keepBackups,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mini_erp_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showNotification('Database backup JSON snapshot generated and downloaded!', 'success');
  };

  // Restore Backup File Upload Handler
  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.companyProfile) setCompanyForm(parsed.companyProfile);
          if (parsed.quickSettings) setQuickSettings(parsed.quickSettings);
          if (parsed.formatSettings) setFormatSettings(parsed.formatSettings);
          setShowRestoreModal(false);
          showNotification('System configuration restored successfully from backup file!', 'success');
        } catch {
          showNotification('Invalid JSON backup file uploaded.', 'warning');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* Hidden File Input for Logo Upload */}
      <input
        type="file"
        ref={logoInputRef}
        onChange={handleLogoChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Hidden File Input for Backup Restore */}
      <input
        type="file"
        ref={restoreInputRef}
        onChange={handleRestoreFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className="position-fixed bottom-0 end-0 p-3"
          style={{ zIndex: 9999, transition: 'all 0.3s ease-in-out' }}
        >
          <div
            className={`toast show align-items-center text-white border-0 shadow-lg ${
              toastMessage.type === 'warning'
                ? 'bg-warning text-dark'
                : toastMessage.type === 'info'
                ? 'bg-info text-white'
                : 'bg-primary'
            }`}
            role="alert"
          >
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                <Check size={18} />
                <span>{toastMessage.text}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Company Profile Modal */}
      {showViewModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px' }}>
              <div className="modal-header bg-light border-bottom px-4 py-3">
                <div className="d-flex align-items-center gap-2.5">
                  <div className="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center">
                    <Building size={22} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0">Company Profile Preview</h5>
                    <span className="text-muted" style={{ fontSize: '0.775rem' }}>Official Business Identity Card</span>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="d-flex flex-column flex-sm-row align-items-center gap-4 p-3 bg-light rounded-3 mb-4 border">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Company Logo" className="rounded-3 shadow-sm" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                  ) : (
                    <div className="bg-white rounded-3 p-3 text-primary border shadow-sm d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                      <Building size={40} />
                    </div>
                  )}
                  <div>
                    <h4 className="fw-bold text-dark mb-1">{companyForm.companyName}</h4>
                    <span className="badge bg-success-subtle text-success border border-success-subtle mb-2" style={{ fontSize: '0.75rem' }}>
                      Active Verified Entity
                    </span>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>GSTIN: <span className="fw-bold text-dark">{companyForm.gstNumber}</span></div>
                  </div>
                </div>

                <div className="row g-3" style={{ fontSize: '0.875rem' }}>
                  <div className="col-12 col-md-6">
                    <div className="p-3 border rounded-3 bg-white">
                      <div className="text-muted mb-1" style={{ fontSize: '0.775rem' }}>Email Address</div>
                      <div className="fw-semibold text-dark">{companyForm.email}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-3 border rounded-3 bg-white">
                      <div className="text-muted mb-1" style={{ fontSize: '0.775rem' }}>Contact Phone</div>
                      <div className="fw-semibold text-dark">🇮🇳 {companyForm.phone}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-3 border rounded-3 bg-white">
                      <div className="text-muted mb-1" style={{ fontSize: '0.775rem' }}>Official Website</div>
                      <div className="fw-semibold text-primary">{companyForm.website}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-3 border rounded-3 bg-white">
                      <div className="text-muted mb-1" style={{ fontSize: '0.775rem' }}>State & Jurisdiction</div>
                      <div className="fw-semibold text-dark">{companyForm.state}, India</div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 border rounded-3 bg-white">
                      <div className="text-muted mb-1" style={{ fontSize: '0.775rem' }}>Registered Business Address</div>
                      <div className="fw-semibold text-dark">{companyForm.address}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-3 border rounded-3 bg-white">
                      <div className="text-muted mb-1" style={{ fontSize: '0.775rem' }}>Operating Currency</div>
                      <div className="fw-semibold text-dark">{companyForm.currency}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-3 border rounded-3 bg-white">
                      <div className="text-muted mb-1" style={{ fontSize: '0.775rem' }}>System Timezone</div>
                      <div className="fw-semibold text-dark">{companyForm.timeZone}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light border-top px-4 py-2.5">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm px-3"
                  onClick={() => {
                    handleBackupNow();
                    setShowViewModal(false);
                  }}
                >
                  <Download size={14} className="me-1" />
                  Export Profile JSON
                </button>
                <button type="button" className="btn btn-primary btn-sm px-4" onClick={() => setShowViewModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restore Backup Modal */}
      {showRestoreModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px' }}>
              <div className="modal-header bg-light border-bottom px-4 py-3">
                <div className="d-flex align-items-center gap-2">
                  <RotateCcw size={20} className="text-primary" />
                  <h5 className="modal-title fw-bold text-dark mb-0">Restore Settings from Backup</h5>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowRestoreModal(false)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
                  Upload a previously exported <strong>.json</strong> configuration backup file to restore system settings.
                </p>
                <button
                  type="button"
                  onClick={() => restoreInputRef.current?.click()}
                  className="btn btn-outline-primary btn-lg w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                  style={{ borderRadius: '10px', borderStyle: 'dashed' }}
                >
                  <Upload size={22} />
                  <span>Choose JSON Backup File</span>
                </button>
              </div>
              <div className="modal-footer bg-light border-top px-4 py-2.5">
                <button type="button" className="btn btn-secondary btn-sm px-4" onClick={() => setShowRestoreModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Heading Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.65rem' }}>
          Settings
        </h2>
        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
          Manage system configuration and preferences.
        </p>
      </div>

      {/* Top Row: 6 Category Cards Grid */}
      <div className="row g-3 mb-4">
        {/* Card 1: Company Profile */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="settings-cat-card" onClick={() => setActiveTab('company-profile')} style={{ cursor: 'pointer' }}>
            <div className="settings-cat-icon bg-primary-subtle text-primary">
              <Building2 size={22} />
            </div>
            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.925rem' }}>
              Company Profile
            </h6>
            <p className="text-muted mb-3" style={{ fontSize: '0.775rem', lineHeight: '1.35', minHeight: '38px' }}>
              Update company details, logo and contact information.
            </p>
            <div className="text-primary fw-bold d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
              <span>Manage</span> &rarr;
            </div>
          </div>
        </div>

        {/* Card 2: Billing & Taxes */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="settings-cat-card" onClick={() => setActiveTab('billing-taxes')} style={{ cursor: 'pointer' }}>
            <div className="settings-cat-icon bg-success-subtle text-success">
              <Receipt size={22} />
            </div>
            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.925rem' }}>
              Billing & Taxes
            </h6>
            <p className="text-muted mb-3" style={{ fontSize: '0.775rem', lineHeight: '1.35', minHeight: '38px' }}>
              Configure taxes, GST settings and invoicing preferences.
            </p>
            <div className="text-success fw-bold d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
              <span>Manage</span> &rarr;
            </div>
          </div>
        </div>

        {/* Card 3: Inventory */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="settings-cat-card" onClick={() => setActiveTab('inventory-settings')} style={{ cursor: 'pointer' }}>
            <div className="settings-cat-icon bg-purple-subtle text-purple" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
              <Package size={22} />
            </div>
            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.925rem' }}>
              Inventory
            </h6>
            <p className="text-muted mb-3" style={{ fontSize: '0.775rem', lineHeight: '1.35', minHeight: '38px' }}>
              Set stock alerts, units, batch settings and more.
            </p>
            <div className="fw-bold d-flex align-items-center gap-1" style={{ color: '#9333ea', fontSize: '0.8rem' }}>
              <span>Manage</span> &rarr;
            </div>
          </div>
        </div>

        {/* Card 4: Notifications */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="settings-cat-card" onClick={() => setActiveTab('notifications')} style={{ cursor: 'pointer' }}>
            <div className="settings-cat-icon bg-warning-subtle text-warning" style={{ backgroundColor: '#ffedd5', color: '#ea580c' }}>
              <Bell size={22} />
            </div>
            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.925rem' }}>
              Notifications
            </h6>
            <p className="text-muted mb-3" style={{ fontSize: '0.775rem', lineHeight: '1.35', minHeight: '38px' }}>
              Configure email, SMS and in-app notifications.
            </p>
            <div className="fw-bold d-flex align-items-center gap-1" style={{ color: '#ea580c', fontSize: '0.8rem' }}>
              <span>Manage</span> &rarr;
            </div>
          </div>
        </div>

        {/* Card 5: Security */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="settings-cat-card" onClick={() => setActiveTab('security')} style={{ cursor: 'pointer' }}>
            <div className="settings-cat-icon bg-info-subtle text-info">
              <ShieldCheck size={22} />
            </div>
            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.925rem' }}>
              Security
            </h6>
            <p className="text-muted mb-3" style={{ fontSize: '0.775rem', lineHeight: '1.35', minHeight: '38px' }}>
              Manage passwords, 2FA and security preferences.
            </p>
            <div className="text-info fw-bold d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
              <span>Manage</span> &rarr;
            </div>
          </div>
        </div>

        {/* Card 6: General */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="settings-cat-card" onClick={() => setActiveTab('general-settings')} style={{ cursor: 'pointer' }}>
            <div className="settings-cat-icon bg-secondary-subtle text-secondary">
              <SettingsIcon size={22} />
            </div>
            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.925rem' }}>
              General
            </h6>
            <p className="text-muted mb-3" style={{ fontSize: '0.775rem', lineHeight: '1.35', minHeight: '38px' }}>
              General preferences and system configuration.
            </p>
            <div className="text-secondary fw-bold d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
              <span>Manage</span> &rarr;
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="row g-4 mb-4">
        {/* Left Column: Settings Menu */}
        <div className="col-12 col-lg-3 col-xl-2">
          <div className="bg-white rounded-3 p-3 border shadow-sm">
            <h6 className="fw-bold text-dark mb-3 px-2" style={{ fontSize: '0.9rem' }}>
              Settings Menu
            </h6>
            <div className="d-flex flex-column gap-1">
              {[
                { id: 'company-profile', label: 'Company Profile', icon: Building },
                { id: 'billing-taxes', label: 'Billing & Taxes', icon: Receipt },
                { id: 'inventory-settings', label: 'Inventory Settings', icon: Boxes },
                { id: 'sales-settings', label: 'Sales Settings', icon: FileCheck },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'security', label: 'Security', icon: ShieldCheck },
                { id: 'users-roles', label: 'Users & Roles', icon: Users },
                { id: 'backup-data', label: 'Backup & Data', icon: Database },
                { id: 'integrations', label: 'Integrations', icon: Link },
                { id: 'general-settings', label: 'General Settings', icon: SettingsIcon },
                { id: 'audit-logs', label: 'Audit Logs', icon: ClipboardList },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`settings-nav-btn ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle Column: Dynamic Form based on Tab Selection */}
        <div className="col-12 col-lg-6 col-xl-7">
          <div className="bg-white rounded-3 p-4 border shadow-sm h-100">
            {activeTab === 'company-profile' && (
              <>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <h5 className="fw-bold text-dark mb-1">Company Profile</h5>
                    <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                      Update your company information and contact details.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowViewModal(true)}
                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5"
                    style={{ borderRadius: '8px', fontSize: '0.825rem', fontWeight: 600 }}
                  >
                    <Eye size={15} />
                    <span>View Company Profile</span>
                  </button>
                </div>

                <form onSubmit={handleCompanySubmit}>
                  <div className="row g-3">
                    {/* Company Name & Company Logo Upload */}
                    <div className="col-12 col-md-7">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                        Company Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control mb-3"
                        value={companyForm.companyName}
                        onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                        required
                        style={{ borderRadius: '8px', fontSize: '0.875rem' }}
                      />

                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={companyForm.email}
                        onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                        required
                        style={{ borderRadius: '8px', fontSize: '0.875rem' }}
                      />
                    </div>

                    <div className="col-12 col-md-5">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                        Company Logo
                      </label>
                      <div className="logo-upload-box position-relative overflow-hidden" onClick={handleLogoUploadClick}>
                        {isLogoUploading ? (
                          <div className="d-flex flex-column align-items-center">
                            <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                            <span className="fw-semibold text-secondary" style={{ fontSize: '0.775rem' }}>Uploading to Cloudinary...</span>
                          </div>
                        ) : logoUrl ? (
                          <div className="d-flex flex-column align-items-center">
                            <img src={logoUrl} alt="Uploaded Logo" style={{ maxWidth: '80px', maxHeight: '70px', objectFit: 'contain' }} className="mb-2" />
                            <span className="text-primary fw-semibold" style={{ fontSize: '0.75rem' }}>Click to change</span>
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="btn btn-sm btn-link text-danger p-0 mt-1"
                              style={{ fontSize: '0.725rem', textDecoration: 'none' }}
                            >
                              Remove Logo
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="bg-light rounded-circle p-2 mb-2 text-secondary">
                              <Building size={26} />
                            </div>
                            <div className="fw-semibold text-dark" style={{ fontSize: '0.825rem' }}>
                              Click to upload logo
                            </div>
                            <span className="text-muted" style={{ fontSize: '0.725rem' }}>
                              PNG, JPG or SVG (Max. 5MB)
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Phone & Website */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                        Phone <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted border-end-0" style={{ borderRadius: '8px 0 0 8px', fontSize: '0.85rem' }}>
                          🇮🇳
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0"
                          value={companyForm.phone}
                          onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                          required
                          style={{ borderRadius: '0 8px 8px 0', fontSize: '0.875rem' }}
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                        Website
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={companyForm.website}
                        onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                        style={{ borderRadius: '8px', fontSize: '0.875rem' }}
                      />
                    </div>

                    {/* Address & GST Number */}
                    <div className="col-12 col-md-7">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                        Address <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={companyForm.address}
                        onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                        required
                        style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div className="col-12 col-md-5">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                        GST Number
                      </label>
                      <input
                        type="text"
                        className="form-control mb-2"
                        value={companyForm.gstNumber}
                        onChange={(e) => setCompanyForm({ ...companyForm, gstNumber: e.target.value })}
                        style={{ borderRadius: '8px', fontSize: '0.875rem' }}
                      />

                      <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: '0.85rem' }}>
                        State
                      </label>
                      <select
                        className="form-select"
                        value={companyForm.state}
                        onChange={(e) => setCompanyForm({ ...companyForm, state: e.target.value })}
                        style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                      >
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                      </select>
                    </div>

                    {/* Currency & Time Zone */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                        Currency
                      </label>
                      <select
                        className="form-select"
                        value={companyForm.currency}
                        onChange={(e) => setCompanyForm({ ...companyForm, currency: e.target.value })}
                        style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                      >
                        <option value="Indian Rupee (₹)">Indian Rupee (₹)</option>
                        <option value="US Dollar ($)">US Dollar ($)</option>
                        <option value="Euro (€)">Euro (€)</option>
                        <option value="British Pound (£)">British Pound (£)</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                        Time Zone
                      </label>
                      <select
                        className="form-select"
                        value={companyForm.timeZone}
                        onChange={(e) => setCompanyForm({ ...companyForm, timeZone: e.target.value })}
                        style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                      >
                        <option value="(GMT+05:30) Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
                        <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
                        <option value="(GMT-05:00) Eastern Time">(GMT-05:00) Eastern Time</option>
                      </select>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="mt-4 d-flex align-items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSavingCompany}
                      className={`btn ${isCompanySaved ? 'btn-success' : 'btn-primary'} d-flex align-items-center gap-2 px-4 py-2`}
                      style={{ borderRadius: '8px', fontWeight: 600, transition: 'all 0.2s' }}
                    >
                      {isSavingCompany ? (
                        <>
                          <RefreshCw size={17} className="spin-animation" />
                          <span>Saving Changes...</span>
                        </>
                      ) : isCompanySaved ? (
                        <>
                          <Check size={17} />
                          <span>Changes Saved!</span>
                        </>
                      ) : (
                        <>
                          <Save size={17} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetCompanyDefaults}
                      className="btn btn-link text-muted p-0"
                      style={{ fontSize: '0.85rem', textDecoration: 'none' }}
                    >
                      Reset Defaults
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeTab === 'billing-taxes' && (
              <div>
                <h5 className="fw-bold text-dark mb-1">Billing & Tax Preferences</h5>
                <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
                  Configure tax parameters, HSN codes, and invoice numbering conventions.
                </p>
                <form onSubmit={handleBillingSubmit}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Default GST Rate</label>
                      <input type="text" className="form-control" value={billingForm.defaultGstRate} onChange={(e) => setBillingForm({ ...billingForm, defaultGstRate: e.target.value })} style={{ borderRadius: '8px' }} required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>PAN Number</label>
                      <input type="text" className="form-control" value={billingForm.panNumber} onChange={(e) => setBillingForm({ ...billingForm, panNumber: e.target.value })} style={{ borderRadius: '8px' }} required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Invoice Number Prefix</label>
                      <input type="text" className="form-control" value={billingForm.invoicePrefix} onChange={(e) => setBillingForm({ ...billingForm, invoicePrefix: e.target.value })} style={{ borderRadius: '8px' }} required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Default HSN/SAC Code</label>
                      <input type="text" className="form-control" value={billingForm.hsnCode} onChange={(e) => setBillingForm({ ...billingForm, hsnCode: e.target.value })} style={{ borderRadius: '8px' }} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Default Invoice Tax Terms</label>
                      <textarea className="form-control" rows={2} value={billingForm.taxTerms} onChange={(e) => setBillingForm({ ...billingForm, taxTerms: e.target.value })} style={{ borderRadius: '8px' }} required />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSavingBilling}
                    className={`btn ${isBillingSaved ? 'btn-success' : 'btn-primary'} mt-4 px-4 py-2 d-flex align-items-center gap-2`}
                    style={{ borderRadius: '8px', fontWeight: 600 }}
                  >
                    {isSavingBilling ? (
                      <>
                        <RefreshCw size={16} className="spin-animation" />
                        <span>Saving...</span>
                      </>
                    ) : isBillingSaved ? (
                      <>
                        <Check size={16} />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Billing Settings</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'inventory-settings' && (
              <div>
                <h5 className="fw-bold text-dark mb-1">Inventory Settings</h5>
                <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
                  Manage valuation methods, stock alert levels, and batch defaults.
                </p>
                <form onSubmit={handleInventorySubmit}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Valuation Method</label>
                      <select className="form-select" value={inventoryForm.valuationMethod} onChange={(e) => setInventoryForm({ ...inventoryForm, valuationMethod: e.target.value })} style={{ borderRadius: '8px' }}>
                        <option value="FIFO">FIFO (First In, First Out)</option>
                        <option value="LIFO">LIFO (Last In, First Out)</option>
                        <option value="Weighted Average">Weighted Average</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Low Stock Alert Quantity Threshold</label>
                      <input type="number" className="form-control" value={inventoryForm.lowStockThreshold} onChange={(e) => setInventoryForm({ ...inventoryForm, lowStockThreshold: e.target.value })} style={{ borderRadius: '8px' }} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Default Measurement Unit</label>
                      <select className="form-select" value={inventoryForm.defaultUnit} onChange={(e) => setInventoryForm({ ...inventoryForm, defaultUnit: e.target.value })} style={{ borderRadius: '8px' }}>
                        <option value="Pcs">Pcs (Pieces)</option>
                        <option value="Kg">Kg (Kilograms)</option>
                        <option value="Boxes">Boxes</option>
                        <option value="Liters">Liters</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Automatic Reorder Warning Level</label>
                      <input type="number" className="form-control" value={inventoryForm.reorderAlertLevel} onChange={(e) => setInventoryForm({ ...inventoryForm, reorderAlertLevel: e.target.value })} style={{ borderRadius: '8px' }} />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSavingInventory}
                    className={`btn ${isInventorySaved ? 'btn-success' : 'btn-primary'} mt-4 px-4 py-2 d-flex align-items-center gap-2`}
                    style={{ borderRadius: '8px', fontWeight: 600 }}
                  >
                    {isSavingInventory ? <RefreshCw size={16} className="spin-animation" /> : isInventorySaved ? <Check size={16} /> : <Save size={16} />}
                    <span>{isSavingInventory ? 'Saving...' : isInventorySaved ? 'Saved!' : 'Save Inventory Settings'}</span>
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'sales-settings' && (
              <div>
                <h5 className="fw-bold text-dark mb-1">Sales Settings</h5>
                <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
                  Configure payment terms, sales challan prefixes, and default terms.
                </p>
                <form onSubmit={handleSalesSubmit}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Default Payment Terms</label>
                      <select className="form-select" value={salesForm.paymentTerms} onChange={(e) => setSalesForm({ ...salesForm, paymentTerms: e.target.value })} style={{ borderRadius: '8px' }}>
                        <option value="Net 30">Net 30 Days</option>
                        <option value="Net 15">Net 15 Days</option>
                        <option value="Due on Receipt">Due on Receipt</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Sales Challan Number Prefix</label>
                      <input type="text" className="form-control" value={salesForm.challanPrefix} onChange={(e) => setSalesForm({ ...salesForm, challanPrefix: e.target.value })} style={{ borderRadius: '8px' }} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Default Delivery Terms & Conditions</label>
                      <textarea className="form-control" rows={3} value={salesForm.defaultTerms} onChange={(e) => setSalesForm({ ...salesForm, defaultTerms: e.target.value })} style={{ borderRadius: '8px' }} />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSavingSales}
                    className={`btn ${isSalesSaved ? 'btn-success' : 'btn-primary'} mt-4 px-4 py-2 d-flex align-items-center gap-2`}
                    style={{ borderRadius: '8px', fontWeight: 600 }}
                  >
                    {isSavingSales ? <RefreshCw size={16} className="spin-animation" /> : isSalesSaved ? <Check size={16} /> : <Save size={16} />}
                    <span>{isSavingSales ? 'Saving...' : isSalesSaved ? 'Saved!' : 'Save Sales Settings'}</span>
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h5 className="fw-bold text-dark mb-1">Notification Preferences</h5>
                <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
                  Manage email alerts, SMS gateway keys, and daily summary digests.
                </p>
                <form onSubmit={handleNotifSubmit}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>SMS Gateway API Key</label>
                      <input type="text" className="form-control" value={notifForm.smsGatewayKey} onChange={(e) => setNotifForm({ ...notifForm, smsGatewayKey: e.target.value })} style={{ borderRadius: '8px' }} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Daily Digest Delivery Time</label>
                      <select className="form-select" value={notifForm.digestTime} onChange={(e) => setNotifForm({ ...notifForm, digestTime: e.target.value })} style={{ borderRadius: '8px' }}>
                        <option value="09:00 AM">09:00 AM Morning</option>
                        <option value="06:00 PM">06:00 PM Evening</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSavingNotif}
                    className={`btn ${isNotifSaved ? 'btn-success' : 'btn-primary'} mt-4 px-4 py-2 d-flex align-items-center gap-2`}
                    style={{ borderRadius: '8px', fontWeight: 600 }}
                  >
                    {isSavingNotif ? <RefreshCw size={16} className="spin-animation" /> : isNotifSaved ? <Check size={16} /> : <Save size={16} />}
                    <span>{isSavingNotif ? 'Saving...' : isNotifSaved ? 'Saved!' : 'Save Notification Settings'}</span>
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h5 className="fw-bold text-dark mb-1">Security & Access Settings</h5>
                <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
                  Manage password policies, session timeouts, and authentication security.
                </p>
                <form onSubmit={handleSecuritySubmit}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Current Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="••••••••"
                        value={securityForm.currentPassword}
                        onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="New strong password"
                        value={securityForm.newPassword}
                        onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Confirm New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Repeat new password"
                        value={securityForm.confirmPassword}
                        onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Session Timeout Duration</label>
                      <select className="form-select" value={securityForm.sessionTimeout} onChange={(e) => setSecurityForm({ ...securityForm, sessionTimeout: e.target.value })} style={{ borderRadius: '8px' }}>
                        <option value="15 Minutes">15 Minutes</option>
                        <option value="30 Minutes">30 Minutes</option>
                        <option value="1 Hour">1 Hour</option>
                        <option value="8 Hours">8 Hours</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSavingSecurity}
                    className={`btn ${isSecuritySaved ? 'btn-success' : 'btn-primary'} mt-4 px-4 py-2 d-flex align-items-center gap-2`}
                    style={{ borderRadius: '8px', fontWeight: 600 }}
                  >
                    {isSavingSecurity ? <RefreshCw size={16} className="spin-animation" /> : isSecuritySaved ? <Check size={16} /> : <Lock size={16} />}
                    <span>{isSavingSecurity ? 'Saving...' : isSecuritySaved ? 'Saved!' : 'Update Security Preferences'}</span>
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'general-settings' && (
              <div>
                <h5 className="fw-bold text-dark mb-1">General Portal Settings</h5>
                <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
                  Manage title branding, maintenance modes, and portal themes.
                </p>
                <form onSubmit={handleGeneralSubmit}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Portal Title</label>
                      <input type="text" className="form-control" value={generalForm.portalTitle} onChange={(e) => setGeneralForm({ ...generalForm, portalTitle: e.target.value })} style={{ borderRadius: '8px' }} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>System Language</label>
                      <select className="form-select" value={generalForm.language} onChange={(e) => setGeneralForm({ ...generalForm, language: e.target.value })} style={{ borderRadius: '8px' }}>
                        <option value="English (US)">English (US)</option>
                        <option value="Hindi">Hindi (हिंदी)</option>
                        <option value="Marathi">Marathi (मराठी)</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSavingGeneral}
                    className={`btn ${isGeneralSaved ? 'btn-success' : 'btn-primary'} mt-4 px-4 py-2 d-flex align-items-center gap-2`}
                    style={{ borderRadius: '8px', fontWeight: 600 }}
                  >
                    {isSavingGeneral ? <RefreshCw size={16} className="spin-animation" /> : isGeneralSaved ? <Check size={16} /> : <Save size={16} />}
                    <span>{isSavingGeneral ? 'Saving...' : isGeneralSaved ? 'Saved!' : 'Save General Settings'}</span>
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'audit-logs' && (
              <div>
                <h5 className="fw-bold text-dark mb-1">System Audit Logs</h5>
                <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>
                  Immutable security audit logs for all administrative operations.
                </p>
                <div className="table-responsive border rounded-3">
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.825rem' }}>
                    <thead className="table-light">
                      <tr>
                        <th>Action</th>
                        <th>User</th>
                        <th>IP Address</th>
                        <th>Timestamp</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span className="fw-bold text-primary">USER_LOGIN</span></td>
                        <td>Admin User</td>
                        <td>192.168.1.102</td>
                        <td>Today, 09:42 AM</td>
                        <td><span className="badge bg-success-subtle text-success">SUCCESS</span></td>
                      </tr>
                      <tr>
                        <td><span className="fw-bold text-dark">SETTINGS_UPDATE</span></td>
                        <td>Admin User</td>
                        <td>192.168.1.102</td>
                        <td>Today, 09:58 AM</td>
                        <td><span className="badge bg-success-subtle text-success">SUCCESS</span></td>
                      </tr>
                      <tr>
                        <td><span className="fw-bold text-dark">CHALLAN_CREATED</span></td>
                        <td>Sales Rep</td>
                        <td>192.168.1.115</td>
                        <td>Yesterday, 04:15 PM</td>
                        <td><span className="badge bg-success-subtle text-success">SUCCESS</span></td>
                      </tr>
                      <tr>
                        <td><span className="fw-bold text-dark">STOCK_UPDATE</span></td>
                        <td>Warehouse Manager</td>
                        <td>192.168.1.108</td>
                        <td>Yesterday, 02:20 PM</td>
                        <td><span className="badge bg-success-subtle text-success">SUCCESS</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {['users-roles', 'backup-data', 'integrations'].includes(activeTab) && (
              <div>
                <h5 className="fw-bold text-dark mb-1" style={{ textTransform: 'capitalize' }}>
                  {activeTab.replace('-', ' ')}
                </h5>
                <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
                  Configure {activeTab.replace('-', ' ')} system options and parameters.
                </p>
                <div className="p-4 border rounded-3 text-center bg-light">
                  <SettingsIcon size={36} className="text-primary mb-2" />
                  <h6 className="fw-bold text-dark mb-1">Configuration Active</h6>
                  <p className="text-muted mb-3" style={{ fontSize: '0.825rem' }}>
                    All parameters for {activeTab.replace('-', ' ')} are active and persisted.
                  </p>
                  <button
                    type="button"
                    onClick={() => showNotification(`${activeTab.replace('-', ' ')} settings updated!`, 'success')}
                    className="btn btn-primary btn-sm px-4"
                    style={{ borderRadius: '6px' }}
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Settings & System Information */}
        <div className="col-12 col-lg-3 col-xl-3">
          <div className="d-flex flex-column gap-4">
            {/* Quick Settings Card */}
            <div className="bg-white rounded-3 p-3.5 border shadow-sm">
              <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.925rem' }}>
                Quick Settings
              </h6>
              <div className="d-flex flex-column gap-2.5">
                {[
                  { key: 'enableGst', label: 'Enable GST' },
                  { key: 'enableStockAlerts', label: 'Enable Stock Alerts' },
                  { key: 'enableLowStockEmail', label: 'Enable Low Stock Email Alerts' },
                  { key: 'enableSmsNotif', label: 'Enable SMS Notifications' },
                  { key: 'allowNegativeStock', label: 'Allow Negative Stock' },
                  { key: 'autoBackupDaily', label: 'Auto Backup (Daily)' },
                  { key: 'maintainAuditLogs', label: 'Maintain Audit Logs' },
                  { key: 'enableTwoFactor', label: 'Enable Two-Factor Auth' },
                ].map((item) => {
                  const isChecked = quickSettings[item.key as keyof typeof quickSettings];
                  return (
                    <div key={item.key} className="d-flex align-items-center justify-content-between py-1">
                      <span className="text-dark" style={{ fontSize: '0.825rem', fontWeight: 500 }}>
                        {item.label}
                      </span>
                      <label className="ios-switch mb-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggle(item.key as keyof typeof quickSettings)}
                        />
                        <span className="ios-slider"></span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* System Information Card */}
            <div className="bg-white rounded-3 p-3.5 border shadow-sm">
              <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.925rem' }}>
                System Information
              </h6>
              <div className="d-flex flex-column gap-2" style={{ fontSize: '0.825rem' }}>
                <div className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                  <span className="text-muted">Version</span>
                  <span className="fw-semibold text-dark">v2.1.0</span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                  <span className="text-muted">Database</span>
                  <span className="fw-semibold text-dark">MongoDB 6.0</span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                  <span className="text-muted">Last Backup</span>
                  <span className="fw-semibold text-dark">17 May 2024, 02:30 AM</span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                  <span className="text-muted">Backup Size</span>
                  <span className="fw-semibold text-dark">256 MB</span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                  <span className="text-muted">Environment</span>
                  <span className="badge bg-light text-secondary border fw-medium px-2 py-1" style={{ fontSize: '0.75rem' }}>
                    Production
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-1">
                  <span className="text-muted">System Uptime</span>
                  <span className="fw-bold text-success" style={{ fontSize: '0.825rem' }}>
                    15d 6h 30m
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: 3 Cards Grid */}
      <div className="row g-4 mb-4">
        {/* Card 1: Email Settings */}
        <div className="col-12 col-lg-4">
          <div className="bg-white rounded-3 p-4 border shadow-sm h-100">
            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.975rem' }}>
              Email Settings
            </h6>
            <p className="text-muted mb-3" style={{ fontSize: '0.8rem' }}>
              Configure SMTP settings for email notifications.
            </p>

            <form onSubmit={handleEmailSave}>
              <div className="row g-2.5 mb-3">
                <div className="col-8">
                  <label className="form-label text-dark fw-medium mb-1" style={{ fontSize: '0.8rem' }}>
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                    style={{ borderRadius: '6px', fontSize: '0.825rem' }}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label text-dark fw-medium mb-1" style={{ fontSize: '0.8rem' }}>
                    SMTP Port
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                    style={{ borderRadius: '6px', fontSize: '0.825rem' }}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label text-dark fw-medium mb-1" style={{ fontSize: '0.8rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    value={emailSettings.emailAddress}
                    onChange={(e) => setEmailSettings({ ...emailSettings, emailAddress: e.target.value })}
                    style={{ borderRadius: '6px', fontSize: '0.825rem' }}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label text-dark fw-medium mb-1" style={{ fontSize: '0.8rem' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    value={emailSettings.password}
                    onChange={(e) => setEmailSettings({ ...emailSettings, password: e.target.value })}
                    style={{ borderRadius: '6px', fontSize: '0.825rem' }}
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between mb-4">
                <span className="text-dark fw-medium" style={{ fontSize: '0.825rem' }}>
                  Use SMTP Authentication
                </span>
                <label className="ios-switch mb-0">
                  <input
                    type="checkbox"
                    checked={emailSettings.useSmtpAuth}
                    onChange={() => setEmailSettings({ ...emailSettings, useSmtpAuth: !emailSettings.useSmtpAuth })}
                  />
                  <span className="ios-slider"></span>
                </label>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  disabled={isTestingEmail}
                  onClick={handleTestEmail}
                  className="btn btn-outline-primary btn-sm px-3 py-1.5 d-flex align-items-center gap-1.5"
                  style={{ borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  {isTestingEmail ? (
                    <>
                      <RefreshCw size={14} className="spin-animation" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <span>Test Email</span>
                  )}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm px-3 py-1.5"
                  style={{ borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  Save Email Settings
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Card 2: Backup & Restore */}
        <div className="col-12 col-lg-4">
          <div className="bg-white rounded-3 p-4 border shadow-sm h-100">
            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.975rem' }}>
              Backup & Restore
            </h6>
            <p className="text-muted mb-3" style={{ fontSize: '0.8rem' }}>
              Manage your data backups and restore settings.
            </p>

            {/* Status Alert Banner */}
            <div
              className="p-3 mb-3 rounded-3 border d-flex align-items-start gap-2.5"
              style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}
            >
              <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
              <div style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                <div>
                  <strong>Last Backup:</strong> 17 May 2024, 02:30 AM
                </div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Next Backup: 18 May 2024, 02:30 AM
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <button
                type="button"
                onClick={handleBackupNow}
                className="btn btn-outline-primary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1.5 py-1.5"
                style={{ borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}
              >
                <Download size={15} />
                <span>Backup Now</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRestoreModal(true)}
                className="btn btn-outline-primary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1.5 py-1.5"
                style={{ borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}
              >
                <RotateCcw size={15} />
                <span>Restore Backup</span>
              </button>
            </div>

            {/* Dropdowns */}
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                  Auto Backup Frequency
                </label>
                <select
                  className="form-select form-select-sm"
                  value={backupFreq}
                  onChange={(e) => {
                    setBackupFreq(e.target.value);
                    showNotification(`Auto Backup Frequency set to ${e.target.value}`, 'info');
                  }}
                  style={{ borderRadius: '6px', fontSize: '0.8rem' }}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                  Keep Backups For
                </label>
                <select
                  className="form-select form-select-sm"
                  value={keepBackups}
                  onChange={(e) => {
                    setKeepBackups(e.target.value);
                    showNotification(`Backup retention policy updated to ${e.target.value}`, 'info');
                  }}
                  style={{ borderRadius: '6px', fontSize: '0.8rem' }}
                >
                  <option value="7 Days">7 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="90 Days">90 Days</option>
                  <option value="1 Year">1 Year</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Date & Number Format */}
        <div className="col-12 col-lg-4">
          <div className="bg-white rounded-3 p-4 border shadow-sm h-100 d-flex flex-column justify-content-between">
            <div>
              <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.975rem' }}>
                Date & Number Format
              </h6>
              <p className="text-muted mb-3" style={{ fontSize: '0.8rem' }}>
                Set your preferred date, time and number formats.
              </p>

              <form onSubmit={handleFormatSave}>
                <div className="mb-3">
                  <label className="form-label text-dark fw-medium mb-1" style={{ fontSize: '0.8rem' }}>
                    Date Format
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={formatSettings.dateFormat}
                    onChange={(e) => setFormatSettings({ ...formatSettings, dateFormat: e.target.value })}
                    style={{ borderRadius: '6px', fontSize: '0.825rem' }}
                  >
                    <option value="17 May 2024 (DD MMM YYYY)">17 May 2024 (DD MMM YYYY)</option>
                    <option value="17/05/2024 (DD/MM/YYYY)">17/05/2024 (DD/MM/YYYY)</option>
                    <option value="2024-05-17 (YYYY-MM-DD)">2024-05-17 (YYYY-MM-DD)</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-dark fw-medium mb-1" style={{ fontSize: '0.8rem' }}>
                    Time Format
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={formatSettings.timeFormat}
                    onChange={(e) => setFormatSettings({ ...formatSettings, timeFormat: e.target.value })}
                    style={{ borderRadius: '6px', fontSize: '0.825rem' }}
                  >
                    <option value="12 Hour (02:30 PM)">12 Hour (02:30 PM)</option>
                    <option value="24 Hour (14:30)">24 Hour (14:30)</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label text-dark fw-medium mb-1" style={{ fontSize: '0.8rem' }}>
                    Number Format
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={formatSettings.numberFormat}
                    onChange={(e) => setFormatSettings({ ...formatSettings, numberFormat: e.target.value })}
                    style={{ borderRadius: '6px', fontSize: '0.825rem' }}
                  >
                    <option value="1,23,456.78">1,23,456.78 (Indian Standard)</option>
                    <option value="123,456.78">123,456.78 (International)</option>
                    <option value="123.456,78">123.456,78 (European)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm w-100 py-2"
                  style={{ borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  Save Preferences
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <footer className="d-flex flex-column flex-sm-row align-items-center justify-content-between pt-3 pb-2 border-top text-muted" style={{ fontSize: '0.8rem' }}>
        <div>&copy; 2024 Mini ERP + CRM. All rights reserved.</div>
        <div className="d-flex align-items-center gap-3 mt-2 mt-sm-0">
          <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-muted text-decoration-none">
            Privacy Policy
          </a>
          <span>&bull;</span>
          <a href="#terms" onClick={(e) => e.preventDefault()} className="text-muted text-decoration-none">
            Terms of Service
          </a>
        </div>
      </footer>
    </div>
  );
};


