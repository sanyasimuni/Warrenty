'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertTriangle,
  FileText,
  CalendarDays,
  Tv,
  Refrigerator,
  Laptop,
  Bell,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Upload,
  Plus,
  X,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRealtime } from '@/lib/realtime-context';

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { products, metrics, addProduct, scheduleService } = useRealtime();

  // Modals & States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedReminderModal, setSelectedReminderModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Calendar State
  const [currentMonthIndex, setCurrentMonthIndex] = useState(7); // August (0-indexed)
  const [selectedDay, setSelectedDay] = useState(8);

  const monthsList = [
    'January 2026', 'February 2026', 'March 2026', 'April 2026',
    'May 2026', 'June 2026', 'July 2026', 'August 2026',
    'September 2026', 'October 2026', 'November 2026', 'December 2026'
  ];

  // Upload Bill Form State
  const [newProductName, setNewProductName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState<'electronics' | 'mobile' | 'computer' | 'kitchen' | 'furniture' | 'vehicle' | 'appliances'>('electronics');
  const [newPrice, setNewPrice] = useState('499.00');
  const [newPurchaseDate, setNewPurchaseDate] = useState('2026-08-01');
  const [newWarrantyMonths, setNewWarrantyMonths] = useState(24);

  // Schedule Service Form State
  const [serviceProductId, setServiceProductId] = useState(products[0]?.id || '');
  const [serviceType, setServiceType] = useState('Routine Inspection & Calibration');
  const [serviceDate, setServiceDate] = useState('2026-08-18');
  const [serviceNotes, setServiceNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle Upload Bill
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    await addProduct({
      name: newProductName,
      brand: newBrand || 'Custom Brand',
      model: `${newBrand || 'Universal'} Smart Device 2026`,
      category: newCategory,
      categoryLabel: newCategory.charAt(0).toUpperCase() + newCategory.slice(1),
      purchaseDate: newPurchaseDate,
      purchasePrice: parseFloat(newPrice) || 299,
      retailer: 'Official Authorized Retailer',
      orderNumber: `#ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      serialNumber: `SN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      warrantyMonths: newWarrantyMonths,
      warrantyType: 'Manufacturer',
      warrantyCoverageName: 'Standard OEM Protection',
      warrantyCoverageDesc: 'Full parts & labor coverage against manufacturer defects.',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
      invoiceFileName: `${newProductName.replace(/\s+/g, '_')}_Receipt.pdf`
    });

    setIsUploadModalOpen(false);
    setNewProductName('');
    setNewBrand('');
    showToast('✨ Invoice uploaded and new asset securely vaulted!');
  };

  // Handle Schedule Service
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetProd = products.find(p => p.id === serviceProductId) || products[0];
    if (!targetProd) return;

    await scheduleService(targetProd.id, {
      type: serviceType,
      cost: 0,
      description: serviceNotes || 'Preventative warranty checkup.'
    });

    setIsScheduleModalOpen(false);
    showToast(`📅 Service appointment confirmed for ${targetProd.name}!`);
  };

  // Dynamic calculations from metrics & live products
  const totalCount = metrics.totalProducts || 25;
  const activeCount = metrics.activeWarranties || 18;
  const expiredCount = metrics.expiredWarranties || 7;
  const upcomingServiceCount = metrics.upcomingServices || 4;
  const expiringMonthCount = metrics.expiringThisMonth || 3;

  const activePercent = Math.round((activeCount / totalCount) * 100) || 72;
  const expiredPercent = 100 - activePercent;

  // Calendar dates setup (August 2026: leading days 26..31)
  const leadingDays = [26, 27, 28, 29, 30, 31];
  const augustDays = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <div className="db-container">
      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="db-toast">
          {toastMessage}
        </div>
      )}

      {/* ── TOP HEADER ROW ── */}
      <div className="db-header-row">
        <div>
          <h1 className="db-title">Welcome {user?.name || 'Sanyasi'}</h1>
          <p className="db-subtitle">Here is the overview of your digital safe.</p>
        </div>

        <div className="db-header-actions">
          <button
            className="db-btn-upload"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <FileText size={15} />
            <span>Upload Bill</span>
          </button>

          <button
            className="db-btn-schedule"
            onClick={() => setIsScheduleModalOpen(true)}
          >
            <CalendarDays size={15} />
            <span>Schedule Service</span>
          </button>
        </div>
      </div>

      {/* ── TOP 5 STATS CARDS ── */}
      <div className="db-stats-grid">
        {/* Card 1: Total Products */}
        <div className="db-stat-card">
          <div className="db-stat-icon-wrap icon-blue">
            <Package size={20} />
          </div>
          <div className="db-stat-number">{totalCount}</div>
          <div className="db-stat-label">Total Products</div>
        </div>

        {/* Card 2: Active Warranty */}
        <div className="db-stat-card">
          <div className="db-stat-icon-wrap icon-green">
            <CheckCircle2 size={20} />
          </div>
          <div className="db-stat-number">{activeCount}</div>
          <div className="db-stat-label">Active Warranty</div>
        </div>

        {/* Card 3: Expired */}
        <div className="db-stat-card">
          <div className="db-stat-icon-wrap icon-red">
            <XCircle size={20} />
          </div>
          <div className="db-stat-number">{expiredCount}</div>
          <div className="db-stat-label">Expired</div>
        </div>

        {/* Card 4: Upcoming Service */}
        <div className="db-stat-card">
          <div className="db-stat-icon-wrap icon-orange">
            <Calendar size={20} />
          </div>
          <div className="db-stat-number">{upcomingServiceCount}</div>
          <div className="db-stat-label">Upcoming Service</div>
        </div>

        {/* Card 5: Expiring Month */}
        <div className="db-stat-card">
          <div className="db-stat-icon-wrap icon-amber">
            <AlertTriangle size={20} />
          </div>
          <div className="db-stat-number">{expiringMonthCount}</div>
          <div className="db-stat-label">Expiring Month</div>
        </div>
      </div>

      {/* ── MIDDLE 2-COLUMN SECTION: WARRANTY STATUS & CALENDAR ── */}
      <div className="db-middle-grid">
        {/* LEFT: WARRANTY STATUS */}
        <div className="db-card db-warranty-status-card">
          <h2 className="db-card-title">Warranty Status</h2>

          {/* Active Row */}
          <div className="db-status-row-block">
            <div className="db-status-header-flex">
              <div className="db-status-dot-label">
                <span className="db-dot dot-green" />
                <span className="db-status-title">Active</span>
              </div>
              <span className="db-status-count-text">
                {activeCount} Products ({activePercent}%)
              </span>
            </div>
            <div className="db-status-track">
              <div
                className="db-status-bar bar-green"
                style={{ width: `${activePercent}%` }}
              />
            </div>
          </div>

          {/* Expired Row */}
          <div className="db-status-row-block">
            <div className="db-status-header-flex">
              <div className="db-status-dot-label">
                <span className="db-dot dot-red" />
                <span className="db-status-title">Expired</span>
              </div>
              <span className="db-status-count-text">
                {expiredCount} Products ({expiredPercent}%)
              </span>
            </div>
            <div className="db-status-track">
              <div
                className="db-status-bar bar-red"
                style={{ width: `${expiredPercent}%` }}
              />
            </div>
          </div>

          {/* Bottom Protected Value & Link */}
          <div className="db-status-footer">
            <div className="db-protected-value-text">
              Total Protected Value: <strong>$14,500</strong>
            </div>
            <Link href="/dashboard/reports" className="db-view-all-link">
              View All Details
            </Link>
          </div>
        </div>

        {/* RIGHT: SERVICE CALENDAR */}
        <div className="db-card db-calendar-card">
          <div className="db-cal-header-row">
            <h2 className="db-card-title" style={{ margin: 0 }}>Service Calendar</h2>
            <div className="db-cal-controls">
              <button
                className="db-cal-nav-btn"
                onClick={() => setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : 11))}
                aria-label="Previous Month"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="db-cal-month-name">{monthsList[currentMonthIndex]}</span>
              <button
                className="db-cal-nav-btn"
                onClick={() => setCurrentMonthIndex((prev) => (prev < 11 ? prev + 1 : 0))}
                aria-label="Next Month"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Mini Calendar Grid */}
          <div className="db-cal-table">
            <div className="db-cal-weekdays">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            <div className="db-cal-days-grid">
              {/* Previous month leading days */}
              {leadingDays.map((d) => (
                <div key={`lead-${d}`} className="db-cal-day-cell cell-faded">
                  {d}
                </div>
              ))}

              {/* Current month days */}
              {augustDays.map((d) => {
                const isSelected = d === selectedDay;
                const hasAlert = d === 5 || d === 12;

                return (
                  <div
                    key={`day-${d}`}
                    onClick={() => setSelectedDay(d)}
                    className={`db-cal-day-cell ${isSelected ? 'cell-selected' : ''}`}
                  >
                    <span>{d}</span>
                    {hasAlert && !isSelected && <span className="db-day-dot" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar Event Legend */}
          <div className="db-cal-legend">
            <div className="db-legend-item">
              <span className="db-dot dot-orange" />
              <span>Sony Headphones Alert</span>
            </div>
            <div className="db-legend-item">
              <span className="db-dot dot-blue" />
              <span>Dyson Filter Maintenance</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM 2-COLUMN SECTION: RECENT UPLOADS & UPCOMING REMINDERS ── */}
      <div className="db-bottom-grid">
        {/* LEFT: RECENT UPLOADS */}
        <div className="db-card db-uploads-card">
          <div className="db-card-header-flex">
            <h2 className="db-card-title" style={{ margin: 0 }}>Recent Uploads</h2>
            <Link href="/dashboard/products" className="db-view-all-link">
              View All
            </Link>
          </div>

          <div className="db-uploads-list">
            {/* Item 1: TV */}
            <div className="db-upload-item">
              <div className="db-upload-icon-box">
                <Tv size={18} color="#475569" />
              </div>
              <div className="db-upload-info">
                <div className="db-upload-title">Samsung 65&quot; 4K TV</div>
                <div className="db-upload-sub">Invoice uploaded 2 days ago</div>
              </div>
              <span className="db-status-pill pill-active">ACTIVE</span>
            </div>

            {/* Item 2: Refrigerator */}
            <div className="db-upload-item">
              <div className="db-upload-icon-box">
                <Refrigerator size={18} color="#475569" />
              </div>
              <div className="db-upload-info">
                <div className="db-upload-title">LG Refrigerator</div>
                <div className="db-upload-sub">Invoice uploaded 5 days ago</div>
              </div>
              <span className="db-status-pill pill-active">ACTIVE</span>
            </div>

            {/* Item 3: Laptop */}
            <div className="db-upload-item">
              <div className="db-upload-icon-box">
                <Laptop size={18} color="#475569" />
              </div>
              <div className="db-upload-info">
                <div className="db-upload-title">MacBook Pro M2</div>
                <div className="db-upload-sub">Invoice uploaded 1 week ago</div>
              </div>
              <span className="db-status-pill pill-active">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* RIGHT: UPCOMING REMINDERS */}
        <div className="db-card db-reminders-card">
          <h2 className="db-card-title">Upcoming Reminders</h2>

          <div className="db-reminders-list">
            {/* Reminder 1: Sony Headphones */}
            <div className="db-reminder-box reminder-amber">
              <div className="db-reminder-icon-box">
                <Bell size={17} className="text-amber" />
              </div>
              <div className="db-reminder-content">
                <div className="db-reminder-title">Sony Headphones Expiring Soon</div>
                <div className="db-reminder-desc">Warranty expires in 12 days. Consider extending.</div>
                <button
                  className="db-reminder-link"
                  onClick={() => setSelectedReminderModal('Sony Headphones')}
                >
                  View Options →
                </button>
              </div>
            </div>

            {/* Reminder 2: Dyson Vacuum */}
            <div className="db-reminder-box reminder-amber">
              <div className="db-reminder-icon-box">
                <Bell size={17} className="text-amber" />
              </div>
              <div className="db-reminder-content">
                <div className="db-reminder-title">Dyson Vacuum Warranty</div>
                <div className="db-reminder-desc">Warranty expires in 25 days.</div>
                <button
                  className="db-reminder-link"
                  onClick={() => setSelectedReminderModal('Dyson Vacuum')}
                >
                  View Options →
                </button>
              </div>
            </div>

            {/* Reminder 3: AC Annual Service */}
            <div className="db-reminder-box reminder-blue">
              <div className="db-reminder-icon-box">
                <Wrench size={16} className="text-blue" />
              </div>
              <div className="db-reminder-content">
                <div className="db-reminder-title">AC Annual Service Due</div>
                <div className="db-reminder-desc">Scheduled for next Tuesday.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: UPLOAD BILL ── */}
      {isUploadModalOpen && (
        <div className="db-modal-backdrop" onClick={() => setIsUploadModalOpen(false)}>
          <div className="db-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <div>
                <h3 className="db-modal-title">Upload Bill / Invoice</h3>
                <p className="db-modal-subtitle">Save a new receipt to your digital vault</p>
              </div>
              <button className="db-modal-close" onClick={() => setIsUploadModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="db-modal-body">
              <div className="db-dropzone">
                <Upload size={24} color="#2563eb" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
                  Click to browse or drop invoice file
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  Supports PDF, PNG, JPG up to 10MB
                </div>
              </div>

              <div className="db-form-row">
                <div className="db-form-group">
                  <label className="db-form-label">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sony Bravia 65 Inch"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="db-form-input"
                  />
                </div>
                <div className="db-form-group">
                  <label className="db-form-label">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Sony"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="db-form-input"
                  />
                </div>
              </div>

              <div className="db-form-row">
                <div className="db-form-group">
                  <label className="db-form-label">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as 'electronics' | 'mobile' | 'computer' | 'kitchen' | 'furniture' | 'vehicle' | 'appliances')}
                    className="db-form-select"
                  >
                    <option value="electronics">Electronics</option>
                    <option value="appliances">Home Appliance</option>
                    <option value="computer">Computer</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="vehicle">Vehicle</option>
                  </select>
                </div>
                <div className="db-form-group">
                  <label className="db-form-label">Purchase Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="db-form-input"
                  />
                </div>
              </div>

              <div className="db-form-row">
                <div className="db-form-group">
                  <label className="db-form-label">Purchase Date</label>
                  <input
                    type="date"
                    value={newPurchaseDate}
                    onChange={(e) => setNewPurchaseDate(e.target.value)}
                    className="db-form-input"
                  />
                </div>
                <div className="db-form-group">
                  <label className="db-form-label">Warranty Period</label>
                  <select
                    value={newWarrantyMonths}
                    onChange={(e) => setNewWarrantyMonths(Number(e.target.value))}
                    className="db-form-select"
                  >
                    <option value={12}>12 Months (1 Year)</option>
                    <option value={24}>24 Months (2 Years)</option>
                    <option value={36}>36 Months (3 Years)</option>
                    <option value={60}>60 Months (5 Years)</option>
                  </select>
                </div>
              </div>

              <div className="db-modal-actions">
                <button type="button" className="db-btn-cancel" onClick={() => setIsUploadModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="db-btn-submit">
                  Save to Digital Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: SCHEDULE SERVICE ── */}
      {isScheduleModalOpen && (
        <div className="db-modal-backdrop" onClick={() => setIsScheduleModalOpen(false)}>
          <div className="db-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <div>
                <h3 className="db-modal-title">Schedule Certified Service</h3>
                <p className="db-modal-subtitle">Book authorized repair or routine checkup</p>
              </div>
              <button className="db-modal-close" onClick={() => setIsScheduleModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="db-modal-body">
              <div className="db-form-group">
                <label className="db-form-label">Select Registered Product</label>
                <select
                  value={serviceProductId}
                  onChange={(e) => setServiceProductId(e.target.value)}
                  className="db-form-select"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.brand} {p.name} ({p.serialNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="db-form-group">
                <label className="db-form-label">Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="db-form-select"
                >
                  <option value="Routine Inspection & Calibration">Routine Inspection & Calibration</option>
                  <option value="Battery Health & Power Optimization">Battery Replacement / Diagnostic</option>
                  <option value="Filter & Internal Component Cleaning">Filter / Cleaning Routine</option>
                  <option value="Screen & Hardware Repair">Hardware & Component Repair</option>
                </select>
              </div>

              <div className="db-form-group">
                <label className="db-form-label">Preferred Date</label>
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="db-form-input"
                />
              </div>

              <div className="db-form-group">
                <label className="db-form-label">Additional Instructions (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Courier pickup or walk-in service"
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  className="db-form-input"
                  style={{ height: 'auto', padding: '8px 12px' }}
                />
              </div>

              <div className="db-modal-actions">
                <button type="button" className="db-btn-cancel" onClick={() => setIsScheduleModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="db-btn-submit">
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: REMINDER OPTIONS ── */}
      {selectedReminderModal && (
        <div className="db-modal-backdrop" onClick={() => setSelectedReminderModal(null)}>
          <div className="db-modal-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3 className="db-modal-title">{selectedReminderModal} Protection</h3>
              <button className="db-modal-close" onClick={() => setSelectedReminderModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="db-modal-body">
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 14px 0' }}>
                Your warranty for <strong>{selectedReminderModal}</strong> is approaching expiration. You can extend official OEM coverage with 1-click.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  href="/dashboard/products"
                  className="db-btn-submit"
                  style={{ textDecoration: 'none', textAlign: 'center', lineHeight: '38px' }}
                  onClick={() => setSelectedReminderModal(null)}
                >
                  View Product in Vault
                </Link>
                <button
                  className="db-btn-cancel"
                  onClick={() => {
                    showToast(`✨ Renewal options requested for ${selectedReminderModal}!`);
                    setSelectedReminderModal(null);
                  }}
                >
                  Extend Coverage (+12 Mo)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STYLES ── */}
      <style jsx>{`
        .db-container {
          padding: 32px 36px 60px;
          max-width: 1300px;
          margin: 0 auto;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #0f172a;
        }

        /* Toast notification */
        .db-toast {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 99999;
          background: #0f172a;
          color: #ffffff;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 600;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          animation: slideIn 0.2s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Top Header */
        .db-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .db-title {
          font-size: 1.85rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.025em;
          margin: 0 0 4px 0;
        }
        .db-subtitle {
          font-size: 0.92rem;
          color: #64748b;
          margin: 0;
        }
        .db-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .db-btn-upload {
          height: 38px;
          padding: 0 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.86rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .db-btn-upload:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .db-btn-schedule {
          height: 38px;
          padding: 0 18px;
          background: #2563eb;
          border: none;
          border-radius: 8px;
          font-size: 0.86rem;
          font-weight: 600;
          color: #ffffff;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .db-btn-schedule:hover {
          background: #1d4ed8;
        }

        /* ── TOP 5 STATS CARDS ── */
        .db-stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .db-stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
        }
        .db-stat-icon-wrap {
          margin-bottom: 12px;
          display: flex;
          align-items: center;
        }
        .icon-blue { color: #2563eb; }
        .icon-green { color: #10b981; }
        .icon-red { color: #ef4444; }
        .icon-orange { color: #f59e0b; }
        .icon-amber { color: #d97706; }

        .db-stat-number {
          font-size: 1.85rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
          margin-bottom: 4px;
        }
        .db-stat-label {
          font-size: 0.78rem;
          color: #64748b;
          font-weight: 500;
        }

        /* ── CARD BASE ── */
        .db-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 22px 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }
        .db-card-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 16px 0;
        }
        .db-card-header-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .db-view-all-link {
          font-size: 0.84rem;
          font-weight: 600;
          color: #2563eb;
          text-decoration: none;
        }
        .db-view-all-link:hover {
          text-decoration: underline;
        }

        /* ── MIDDLE 2-COLUMN SECTION ── */
        .db-middle-grid {
          display: grid;
          grid-template-columns: 1.7fr 1.3fr;
          gap: 22px;
          margin-bottom: 24px;
        }

        /* Warranty Status Card */
        .db-warranty-status-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .db-status-row-block {
          margin-bottom: 20px;
        }
        .db-status-header-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .db-status-dot-label {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .db-dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          display: inline-block;
        }
        .dot-green { background: #10b981; }
        .dot-red { background: #b91c1c; }
        .dot-orange { background: #f59e0b; }
        .dot-blue { background: #2563eb; }

        .db-status-title {
          font-weight: 700;
          font-size: 0.9rem;
          color: #0f172a;
        }
        .db-status-count-text {
          font-size: 0.88rem;
          font-weight: 600;
          color: #0f172a;
        }
        .db-status-track {
          width: 100%;
          height: 8px;
          background: #f1f5f9;
          border-radius: 9999px;
          overflow: hidden;
        }
        .db-status-bar {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.4s ease;
        }
        .bar-green { background: #10b981; }
        .bar-red { background: #b91c1c; }

        .db-status-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid #f1f5f9;
          font-size: 0.88rem;
        }
        .db-protected-value-text {
          color: #475569;
        }
        .db-protected-value-text strong {
          color: #0f172a;
          font-weight: 700;
        }

        /* Service Calendar Card */
        .db-cal-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .db-cal-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .db-cal-nav-btn {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 2px 4px;
          display: flex;
          align-items: center;
        }
        .db-cal-month-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f172a;
        }

        .db-cal-table {
          margin-bottom: 14px;
        }
        .db-cal-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-size: 0.76rem;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .db-cal-days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 3px;
          text-align: center;
        }
        .db-cal-day-cell {
          height: 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          color: #1e293b;
          border-radius: 6px;
          cursor: pointer;
          position: relative;
        }
        .db-cal-day-cell:hover {
          background: #f1f5f9;
        }
        .cell-faded {
          color: #cbd5e1;
        }
        .cell-selected {
          background: #2563eb !important;
          color: #ffffff !important;
          font-weight: 700;
        }
        .db-day-dot {
          width: 4px;
          height: 4px;
          background: #f59e0b;
          border-radius: 9999px;
          position: absolute;
          bottom: 2px;
        }

        .db-cal-legend {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-top: 10px;
          border-top: 1px solid #f1f5f9;
          font-size: 0.8rem;
          color: #475569;
        }
        .db-legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── BOTTOM 2-COLUMN SECTION ── */
        .db-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }

        /* Recent Uploads List */
        .db-uploads-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .db-upload-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 10px;
          transition: all 0.2s ease;
        }
        .db-upload-item:hover {
          background: #ffffff;
          border-color: #cbd5e1;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
        }
        .db-upload-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .db-upload-info {
          flex: 1;
        }
        .db-upload-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 2px;
        }
        .db-upload-sub {
          font-size: 0.78rem;
          color: #64748b;
        }
        .db-status-pill {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .pill-active {
          background: #dcfce7;
          color: #16a34a;
        }

        /* Upcoming Reminders List */
        .db-reminders-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .db-reminder-box {
          display: flex;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
        }
        .reminder-amber {
          background: #fffbeb;
          border: 1px solid #fef08a;
        }
        .reminder-blue {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
        }
        .db-reminder-icon-box {
          margin-top: 2px;
          flex-shrink: 0;
        }
        .text-amber { color: #d97706; }
        .text-blue { color: #2563eb; }

        .db-reminder-content {
          flex: 1;
        }
        .db-reminder-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 2px;
        }
        .db-reminder-desc {
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 4px;
        }
        .db-reminder-link {
          background: transparent;
          border: none;
          padding: 0;
          font-size: 0.8rem;
          font-weight: 600;
          color: #2563eb;
          cursor: pointer;
        }
        .db-reminder-link:hover {
          text-decoration: underline;
        }

        /* ── MODALS ── */
        .db-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }
        .db-modal-card {
          background: #ffffff;
          border-radius: 14px;
          width: 100%;
          max-width: 500px;
          padding: 24px 26px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          animation: modalIn 0.2s ease-out;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0); }
        }

        .db-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .db-modal-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .db-modal-subtitle {
          font-size: 0.84rem;
          color: #64748b;
          margin: 2px 0 0 0;
        }
        .db-modal-close {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
        }
        .db-modal-close:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .db-modal-body {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .db-dropzone {
          border: 2px dashed #bfdbfe;
          background: #eff6ff;
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .db-dropzone:hover {
          background: #dbeafe;
          border-color: #93c5fd;
        }

        .db-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .db-form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .db-form-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #334155;
        }
        .db-form-input, .db-form-select {
          height: 38px;
          padding: 0 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.86rem;
          color: #0f172a;
          outline: none;
          background: #ffffff;
        }
        .db-form-input:focus, .db-form-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .db-modal-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
        }
        .db-btn-cancel {
          flex: 1;
          height: 40px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
        }
        .db-btn-submit {
          flex: 1;
          height: 40px;
          background: #2563eb;
          border: none;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 600;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .db-btn-submit:hover {
          background: #1d4ed8;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .db-stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .db-middle-grid, .db-bottom-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .db-container {
            padding: 20px 16px 40px;
          }
          .db-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .db-header-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .db-header-actions {
            width: 100%;
            justify-content: space-between;
          }
          .db-form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
