import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, RotateCw, X, Save } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../services/api';

export const AddCustomer: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    customerType: '',
    countryCode: '+91',
    mobile: '',
    email: '',
    gstNumber: '',
    status: '',
    followUpDate: '',
    assignedTo: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFormData({
      name: '',
      businessName: '',
      customerType: '',
      countryCode: '+91',
      mobile: '',
      email: '',
      gstNumber: '',
      status: '',
      followUpDate: '',
      assignedTo: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullAddress = [formData.address, formData.city, formData.state, formData.pincode]
        .filter(Boolean)
        .join(', ');

      const token = localStorage.getItem('jwt_token') || 'demo_jwt_token_2026';
      
      await axios.post(
        `${API_URL}/api/customers`,
        {
          name: formData.name,
          email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
          mobile: formData.mobile ? `${formData.countryCode} ${formData.mobile}` : undefined,
          businessName: formData.businessName || formData.name,
          gstNumber: formData.gstNumber || undefined,
          customerType: formData.customerType || 'RETAIL',
          address: fullAddress || undefined,
          status: formData.status || 'ACTIVE',
          followUpDate: formData.followUpDate || undefined,
          notes: formData.notes || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate('/customers');
    } catch (err: any) {
      console.error('Error creating customer:', err);
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* Top Header & Breadcrumbs */}
      <div className="d-flex align-items-start justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Add Customer</h2>
          <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>Enter customer details below to add a new customer.</p>
        </div>
        <div className="text-muted small fw-medium">
          Dashboard &gt; Customers &gt; <span className="text-dark">Add Customer</span>
        </div>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit}>
        <div className="card border-0 shadow-sm p-4 rounded-3 mb-4" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          
          {/* Section 1: Customer Information */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3" style={{ color: '#2563eb', fontSize: '1rem' }}>Customer Information</h5>
            
            {/* Row 1 */}
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label fw-medium text-dark" style={{ fontSize: '0.875rem' }}>Customer Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="name"
                  required
                  className="form-control bg-white border"
                  placeholder="Enter customer name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ borderRadius: '8px', fontSize: '0.875rem', height: '42px', borderColor: '#cbd5e1' }}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-medium text-dark" style={{ fontSize: '0.875rem' }}>Business Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="businessName"
                  required
                  className="form-control bg-white border"
                  placeholder="Enter business name"
                  value={formData.businessName}
                  onChange={handleChange}
                  style={{ borderRadius: '8px', fontSize: '0.875rem', height: '42px', borderColor: '#cbd5e1' }}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-medium text-dark" style={{ fontSize: '0.875rem' }}>Customer Type <span className="text-danger">*</span></label>
                <select
                  name="customerType"
                  required
                  className="form-select bg-white border text-secondary"
                  value={formData.customerType}
                  onChange={handleChange}
                  style={{ borderRadius: '8px', fontSize: '0.875rem', height: '42px', borderColor: '#cbd5e1' }}
                >
                  <option value="">Select customer type</option>
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="RETAIL">Retail</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                </select>
              </div>
            </div>

            {/* Row 2 */}
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label fw-medium text-dark" style={{ fontSize: '0.875rem' }}>Mobile Number <span className="text-danger">*</span></label>
                <div className="input-group">
                  <select
                    name="countryCode"
                    className="form-select bg-white border text-secondary"
                    value={formData.countryCode}
                    onChange={handleChange}
                    style={{ maxWidth: '80px', borderRadius: '8px 0 0 8px', fontSize: '0.875rem', height: '42px', borderColor: '#cbd5e1' }}
                  >
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                  </select>
                  <input
                    type="text"
                    name="mobile"
                    required
                    className="form-control bg-white border"
                    placeholder="Enter mobile number"
                    value={formData.mobile}
                    onChange={handleChange}
                    style={{ borderRadius: '0 8px 8px 0', fontSize: '0.875rem', height: '42px', borderColor: '#cbd5e1' }}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-medium text-dark" style={{ fontSize: '0.875rem' }}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control bg-white border"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ borderRadius: '8px', fontSize: '0.875rem', height: '42px', borderColor: '#cbd5e1' }}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-medium text-dark" style={{ fontSize: '0.875rem' }}>GST Number (Optional)</label>
                <input
                  type="text"
                  name="gstNumber"
                  className="form-control bg-white border"
                  placeholder="Enter GST number"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  style={{ borderRadius: '8px', fontSize: '0.875rem', height: '42px', borderColor: '#cbd5e1' }}
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-medium text-dark" style={{ fontSize: '0.875rem' }}>Status <span className="text-danger">*</span></label>
                <select
                  name="status"
                  required
                  className="form-select bg-white border text-secondary"
                  value={formData.status}
                  onChange={handleChange}
                  style={{ borderRadius: '8px', fontSize: '0.875rem', height: '42px', borderColor: '#cbd5e1' }}
                >
                  <option value="">Select status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="LEAD">Lead</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-medium text-dark" style={{ fontSize: '0.875rem' }}>Follow-up Date</label>
                <div className="position-relative">
                  <input
                    type="date"
                    name="followUpDate"
                    className="form-control bg-white border text-secondary pe-5"
                    value={formData.followUpDate}
                    onChange={handleChange}
                    style={{ borderRadius: '8px', fontSize: '0.875rem', height: '42px', borderColor: '#cbd5e1' }}
                  />
                  <Calendar size={18} className="position-absolute text-muted" style={{ right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-medium text-dark" style={{ fontSize: '0.875rem' }}>Assigned To</label>
                <select
                  name="assignedTo"
                  className="form-select bg-white border text-secondary"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  style={{ borderRadius: '8px', fontSize: '0.875rem', height: '42px', borderColor: '#cbd5e1' }}
                >
                  <option value="">Select user</option>
                  <option value="Admin User">Admin User</option>
                  <option value="Sales Manager">Sales Manager</option>
                  <option value="Warehouse Head">Warehouse Head</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="my-4" style={{ borderColor: '#f1f5f9' }} />

          {/* Section 2: Address Information */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3" style={{ color: '#2563eb', fontSize: '1rem' }}>Address Information</h5>
            
            <div className="row g-3 mb-3">
              <div className="col-12">
                <label className="form-label fw-medium text-dark" style={{ fontSize: '0.875rem' }}>Address <span className="text-danger">*</span></label>
                <textarea
                  name="address"
                  rows={2}
                  className="form-control bg-white border"
                  placeholder="Enter complete address"
                  value={formData.address}
                  onChange={handleChange}
                  style={{ borderRadius: '8px', fontSize: '0.875rem', borderColor: '#cbd5e1' }}
                ></textarea>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-medium text-dark" style={{ fontSize: '0.875rem' }}>City <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="city"
                  className="form-control bg-white border"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                  style={{ borderRadius: '8px', fontSize: '0.875rem', height: '42px', borderColor: '#cbd5e1' }}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-medium text-dark" style={{ fontSize: '0.875rem' }}>State <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="state"
                  className="form-control bg-white border"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={handleChange}
                  style={{ borderRadius: '8px', fontSize: '0.875rem', height: '42px', borderColor: '#cbd5e1' }}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-medium text-dark" style={{ fontSize: '0.875rem' }}>Pincode <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="pincode"
                  className="form-control bg-white border"
                  placeholder="Enter pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  style={{ borderRadius: '8px', fontSize: '0.875rem', height: '42px', borderColor: '#cbd5e1' }}
                />
              </div>
            </div>
          </div>

          <hr className="my-4" style={{ borderColor: '#f1f5f9' }} />

          {/* Section 3: Additional Information */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3" style={{ color: '#2563eb', fontSize: '1rem' }}>Additional Information</h5>
            
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-medium text-dark" style={{ fontSize: '0.875rem' }}>Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  className="form-control bg-white border"
                  placeholder="Enter notes about this customer..."
                  value={formData.notes}
                  onChange={handleChange}
                  style={{ borderRadius: '8px', fontSize: '0.875rem', borderColor: '#cbd5e1' }}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Form Action Footer Buttons */}
          <div className="d-flex align-items-center justify-content-between pt-3 border-top" style={{ borderColor: '#f1f5f9' }}>
            <Link
              to="/customers"
              className="btn btn-outline-secondary d-flex align-items-center gap-1.5 bg-white border px-3 py-2 fw-medium"
              style={{ borderRadius: '8px', fontSize: '0.875rem', borderColor: '#cbd5e1', color: '#475569' }}
            >
              <X size={16} /> Cancel
            </Link>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-outline-secondary d-flex align-items-center gap-1.5 bg-white border px-3 py-2 fw-medium"
                style={{ borderRadius: '8px', fontSize: '0.875rem', borderColor: '#cbd5e1', color: '#475569' }}
              >
                <RotateCw size={16} /> Reset
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary d-flex align-items-center gap-1.5 px-4 py-2 fw-medium text-white shadow-sm"
                style={{ backgroundColor: '#2563eb', borderColor: '#2563eb', borderRadius: '8px', fontSize: '0.875rem' }}
              >
                <Save size={16} /> {loading ? 'Saving...' : 'Save Customer'}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

