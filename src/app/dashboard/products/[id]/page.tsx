'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Shield,
  ShieldCheck,
  RotateCcw,
  MapPin,
  Share2,
  Send,
  Download,
  CheckCircle2,
  FileText,
  X,
  ExternalLink,
  ChevronLeft,
  Calendar,
  Wrench,
  Sparkles,
  Phone,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useRealtime } from '@/lib/realtime-context';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || '';
  const { products, renewProduct, scheduleService } = useRealtime();

  // Find product by id or fuzzy slug
  const product =
    products.find(
      (p) =>
        p.id === rawId ||
        p.id.toLowerCase() === rawId.toLowerCase() ||
        p.name.toLowerCase().replace(/\s+/g, '-').includes(rawId.toLowerCase()) ||
        rawId.toLowerCase().includes(p.id.toLowerCase())
    ) || products[0];

  // Modals & States
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isServiceLocatorModalOpen, setIsServiceLocatorModalOpen] = useState(false);
  const [extensionPeriod, setExtensionPeriod] = useState(12);
  const [transferEmail, setTransferEmail] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExtendPlan = async () => {
    if (!product) return;
    await renewProduct(product.id, extensionPeriod);
    setIsExtendModalOpen(false);
    showToast(`✨ Protection plan extended by ${extensionPeriod} months!`);
  };

  const handleTransferOwnership = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferEmail) return;
    setIsTransferModalOpen(false);
    showToast(`📨 Transfer invitation sent to ${transferEmail}!`);
    setTransferEmail('');
  };

  const handleDownloadReceipt = () => {
    if (!product) return;
    const receiptContent = `=========================================
OFFICIAL DIGITAL PROOF OF PURCHASE
=========================================
Retailer:        ${product.retailer}
Product:         ${product.brand} ${product.name}
Model:           ${product.model}
Serial Number:   ${product.serialNumber}
Asset Tag:       ${product.assetId}
Purchase Date:   ${product.purchaseDate}
Warranty Expiry: ${product.expiryDate}
Total Price:     $${product.purchasePrice.toFixed(2)}
Policy:          ${product.warrantyCoverageName}
=========================================
Generated via WarrantyWise Digital Vault
Timestamp: ${new Date().toISOString()}
`;
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${product.brand}_${product.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    showToast('📄 Proof of purchase receipt downloaded!');
  };

  if (!product) {
    return (
      <div className="pd-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>Product not found</h2>
        <Link href="/dashboard/products" className="pd-btn-primary" style={{ marginTop: '20px', textDecoration: 'none' }}>
          Back to Products
        </Link>
      </div>
    );
  }

  // Derive model display name
  const modelSubtitle = product.model.includes('Model')
    ? `${product.brand} • ${product.model}`
    : `${product.brand} • 2026 Model`;

  // Status key
  const isExpired = product.status === 'expired' || product.daysRemaining <= 0;
  const isExpiring = product.status === 'expiring' || (product.daysRemaining > 0 && product.daysRemaining <= 45);
  const statusKey = isExpired ? 'expired' : isExpiring ? 'expiring' : 'active';

  return (
    <div className="pd-container">
      {/* ── TOAST MESSAGE ── */}
      {toastMessage && (
        <div className="pd-toast">
          {toastMessage}
        </div>
      )}

      {/* ── TOP HERO CARD ── */}
      <div className="pd-hero-card">
        {/* Left: Thumbnail Image */}
        <div className="pd-hero-thumb-box">
          <img
            src={product.image}
            alt={product.name}
            className="pd-hero-thumb-img"
          />
        </div>

        {/* Middle: Title, Subtitle, Actions */}
        <div className="pd-hero-middle">
          <div className="pd-hero-title-row">
            <h1 className="pd-hero-title">
              {product.brand} {product.name.includes(product.brand) ? product.name.replace(product.brand, '').trim() : product.name}
            </h1>
            <span className={`pd-status-pill pill-${statusKey}`}>
              {statusKey.toUpperCase()}
            </span>
          </div>

          <div className="pd-hero-subtitle">
            {modelSubtitle}
          </div>

          {/* Action Buttons Row */}
          <div className="pd-hero-actions-row">
            <button
              className="pd-action-btn"
              onClick={() => setIsShareModalOpen(true)}
            >
              <Share2 size={13} />
              <span>Share</span>
            </button>

            <button
              className="pd-action-btn"
              onClick={() => setIsTransferModalOpen(true)}
            >
              <Send size={13} />
              <span>Transfer</span>
            </button>

            <button
              className="pd-action-btn"
              onClick={handleDownloadReceipt}
            >
              <Download size={13} />
              <span>Download Receipt</span>
            </button>
          </div>
        </div>

        {/* Right: Purchase Price */}
        <div className="pd-hero-price-col">
          <div className="pd-price-label">PURCHASE PRICE</div>
          <div className="pd-price-value">
            ${product.purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* ── MIDDLE 3-COLUMN SECTION ── */}
      <div className="pd-middle-grid">
        {/* COLUMN 1: WARRANTY LIFE */}
        <div className="pd-col-card">
          <div className="pd-card-header">
            <Shield size={18} className="pd-icon-blue" />
            <h2 className="pd-card-title">Warranty Life</h2>
          </div>

          <div className="pd-warranty-percent">
            {isExpired ? '0%' : `${product.progressPercent || 75}%`}
          </div>

          {/* Progress Bar */}
          <div className="pd-progress-track">
            <div
              className={`pd-progress-bar bar-${statusKey}`}
              style={{ width: `${isExpired ? 100 : product.progressPercent || 75}%` }}
            />
          </div>

          <div className="pd-remaining-days-text">
            {isExpired ? 'Warranty Ended' : `${product.daysRemaining || 540} Days Remaining`}
          </div>

          {/* Start & End Dates Table */}
          <div className="pd-dates-grid">
            <div className="pd-date-item">
              <span className="pd-date-label">START DATE</span>
              <span className="pd-date-val">{product.purchaseDate || 'Jan 15, 2026'}</span>
            </div>
            <div className="pd-date-item" style={{ textAlign: 'right' }}>
              <span className="pd-date-label">END DATE</span>
              <span className="pd-date-val">{product.expiryDate || 'Jan 15, 2028'}</span>
            </div>
          </div>
        </div>

        {/* COLUMN 2: PROTECTION PLAN */}
        <div className="pd-col-card pd-col-plan">
          <div className="pd-card-header">
            <ShieldCheck size={19} className="pd-icon-blue" />
            <h2 className="pd-card-title">Protection Plan</h2>
          </div>

          <div className="pd-plan-name">
            {product.warrantyCoverageName || 'Samsung Care+ Protection'}
          </div>

          {/* Checklist */}
          <div className="pd-plan-checklist">
            <div className="pd-check-item">
              <CheckCircle2 size={16} className="pd-icon-green" />
              <span>Hardware coverage</span>
            </div>
            <div className="pd-check-item">
              <CheckCircle2 size={16} className="pd-icon-green" />
              <span>Accidental damage from handling</span>
            </div>
            <div className="pd-check-item">
              <CheckCircle2 size={16} className="pd-icon-green" />
              <span>Battery replacement</span>
            </div>
          </div>

          {/* Extend Plan Button */}
          <button
            className="pd-btn-extend"
            onClick={() => setIsExtendModalOpen(true)}
          >
            Extend Plan
          </button>
        </div>

        {/* COLUMN 3: STACKED RECENT SERVICE + SERVICE LOCATOR */}
        <div className="pd-col-stacked">
          {/* Card 1: Recent Service */}
          <div className="pd-col-card pd-card-mini">
            <div className="pd-card-header">
              <RotateCcw size={17} className="pd-icon-blue" />
              <h2 className="pd-card-title">Recent Service</h2>
            </div>

            <div className="pd-recent-service-box">
              {product.serviceHistory && product.serviceHistory.length > 0 ? (
                <div className="pd-service-item-compact">
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
                    {product.serviceHistory[0].type}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {product.serviceHistory[0].date} • ${product.serviceHistory[0].cost.toFixed(2)}
                  </div>
                </div>
              ) : (
                <>
                  <FileText size={22} className="pd-icon-muted" style={{ marginBottom: '6px' }} />
                  <div className="pd-no-service-text">No service history yet.</div>
                </>
              )}
            </div>
          </div>

          {/* Card 2: Service Locator */}
          <div className="pd-col-card pd-card-mini">
            <div className="pd-card-header">
              <MapPin size={17} className="pd-icon-blue" />
              <h2 className="pd-card-title">Service Locator</h2>
            </div>

            {/* Map Graphic Preview */}
            <div className="pd-map-preview-wrap">
              <img
                src="/assets/service-map.png"
                alt="Service Center Map Preview"
                className="pd-map-img"
                onError={(e) => {
                  // Fallback to high quality city map preview if image loading
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="pd-locator-text">
              Find {product.brand} Certified Repair centers near you.
            </div>

            <button
              className="pd-btn-find-centers"
              onClick={() => setIsServiceLocatorModalOpen(true)}
            >
              Find Centers
            </button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM CARD: DEVICE & ORDER SPECIFICATIONS ── */}
      <div className="pd-specs-card">
        <h2 className="pd-specs-title">Device & Order Specifications</h2>

        <div className="pd-specs-row">
          <div className="pd-spec-col">
            <div className="pd-spec-label">RETAILER</div>
            <div className="pd-spec-val">{product.retailer || 'Samsung Store'}</div>
          </div>

          <div className="pd-spec-col">
            <div className="pd-spec-label">SERIAL NUMBER</div>
            <div className="pd-spec-val font-mono">{product.serialNumber || 'R5CW308X9MA'}</div>
          </div>

          <div className="pd-spec-col">
            <div className="pd-spec-label">CATEGORY</div>
            <div className="pd-spec-val">
              {product.category === 'mobile'
                ? 'Electronics / Smartphone'
                : `${product.categoryLabel} / Premium Asset`}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: EXTEND PLAN ── */}
      {isExtendModalOpen && (
        <div className="pd-modal-backdrop" onClick={() => setIsExtendModalOpen(false)}>
          <div className="pd-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-header">
              <div>
                <h3 className="pd-modal-title">Extend Warranty Coverage</h3>
                <p className="pd-modal-subtitle">Add official OEM protection to {product.name}</p>
              </div>
              <button className="pd-modal-close" onClick={() => setIsExtendModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="pd-modal-body">
              <div className="pd-form-group">
                <label className="pd-form-label">Extension Duration</label>
                <select
                  value={extensionPeriod}
                  onChange={(e) => setExtensionPeriod(Number(e.target.value))}
                  className="pd-form-select"
                >
                  <option value={12}>+ 12 Months Additional Coverage ($79.00)</option>
                  <option value={24}>+ 24 Months Extended Care ($139.00)</option>
                  <option value={36}>+ 36 Months Lifetime Shield ($189.00)</option>
                </select>
              </div>

              <div className="pd-plan-benefits-preview">
                <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#1e40af', marginBottom: '6px' }}>
                  Includes:
                </div>
                <div style={{ fontSize: '0.82rem', color: '#3b82f6', lineHeight: 1.5 }}>
                  • Unlimited certified accidental drop repairs<br />
                  • Same-day battery replacement guarantee<br />
                  • Express loaner device priority dispatch
                </div>
              </div>

              <div className="pd-modal-actions">
                <button className="pd-btn-cancel" onClick={() => setIsExtendModalOpen(false)}>
                  Cancel
                </button>
                <button className="pd-btn-submit" onClick={handleExtendPlan}>
                  Confirm & Extend
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: SHARE ASSET ── */}
      {isShareModalOpen && (
        <div className="pd-modal-backdrop" onClick={() => setIsShareModalOpen(false)}>
          <div className="pd-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-header">
              <div>
                <h3 className="pd-modal-title">Share Asset Record</h3>
                <p className="pd-modal-subtitle">Share digital proof of warranty</p>
              </div>
              <button className="pd-modal-close" onClick={() => setIsShareModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="pd-modal-body">
              <div className="pd-share-preview-box">
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{product.brand} {product.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>Asset Tag: {product.assetId}</div>
                <div style={{ fontSize: '0.82rem', color: '#2563eb', marginTop: '4px', fontWeight: 600 }}>Valid through {product.expiryDate}</div>
              </div>

              <button
                className="pd-btn-submit"
                style={{ width: '100%' }}
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  showToast('🔗 Asset link copied to clipboard!');
                  setIsShareModalOpen(false);
                }}
              >
                Copy Public Verification Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: TRANSFER ASSET ── */}
      {isTransferModalOpen && (
        <div className="pd-modal-backdrop" onClick={() => setIsTransferModalOpen(false)}>
          <div className="pd-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-header">
              <div>
                <h3 className="pd-modal-title">Transfer Ownership</h3>
                <p className="pd-modal-subtitle">Transfer warranty rights to a new owner</p>
              </div>
              <button className="pd-modal-close" onClick={() => setIsTransferModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTransferOwnership} className="pd-modal-body">
              <div className="pd-form-group">
                <label className="pd-form-label">New Owner Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="buyer@example.com"
                  value={transferEmail}
                  onChange={(e) => setTransferEmail(e.target.value)}
                  className="pd-form-input"
                />
              </div>

              <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                The recipient will receive an invitation to accept this device and its remaining active warranty coverage into their digital vault.
              </div>

              <div className="pd-modal-actions">
                <button type="button" className="pd-btn-cancel" onClick={() => setIsTransferModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="pd-btn-submit">
                  Send Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: SERVICE LOCATOR ── */}
      {isServiceLocatorModalOpen && (
        <div className="pd-modal-backdrop" onClick={() => setIsServiceLocatorModalOpen(false)}>
          <div className="pd-modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-header">
              <div>
                <h3 className="pd-modal-title">Nearby Certified Repair Centers</h3>
                <p className="pd-modal-subtitle">{product.brand} Authorized Service Network</p>
              </div>
              <button className="pd-modal-close" onClick={() => setIsServiceLocatorModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="pd-modal-body">
              <div className="pd-center-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                      {product.nearbyServiceCenter?.name || `${product.brand} Authorized Care Center`}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                      {product.nearbyServiceCenter?.address || '767 5th Ave, New York, NY 10153'}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, background: '#eff6ff', color: '#2563eb', padding: '3px 8px', borderRadius: '6px' }}>
                    {product.nearbyServiceCenter?.distance || '0.8 mi'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '14px', marginTop: '12px', fontSize: '0.8rem', color: '#16a34a' }}>
                  <span>✓ Genuine OEM Parts</span>
                  <span>✓ Walk-in Accepted</span>
                  <span>✓ Open Today</span>
                </div>
              </div>

              <div className="pd-center-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                      Premier Tech Hub & Diagnostics
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                      120 Broadway, Suite 400, New York, NY
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px' }}>
                    1.4 mi
                  </span>
                </div>
              </div>

              <button
                className="pd-btn-submit"
                style={{ width: '100%', marginTop: '6px' }}
                onClick={() => {
                  showToast('📅 Appointment booking request sent to center!');
                  setIsServiceLocatorModalOpen(false);
                }}
              >
                Schedule Appointment at Nearest Center
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STYLES ── */}
      <style jsx>{`
        .pd-container {
          padding: 32px 36px 60px;
          max-width: 1300px;
          margin: 0 auto;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #0f172a;
        }

        /* Toast notification */
        .pd-toast {
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

        /* ── HERO TOP CARD ── */
        .pd-hero-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px 28px;
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }
        .pd-hero-thumb-box {
          width: 96px;
          height: 96px;
          border-radius: 8px;
          overflow: hidden;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pd-hero-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pd-hero-middle {
          flex: 1;
        }
        .pd-hero-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }
        .pd-hero-title {
          font-size: 1.55rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .pd-status-pill {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .pill-active {
          background: #dcfce7;
          color: #16a34a;
        }
        .pill-expired {
          background: #fee2e2;
          color: #dc2626;
        }
        .pill-expiring {
          background: #fef3c7;
          color: #d97706;
        }

        .pd-hero-subtitle {
          font-size: 0.92rem;
          color: #64748b;
          margin-bottom: 14px;
        }

        /* Action buttons row */
        .pd-hero-actions-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .pd-action-btn {
          height: 32px;
          padding: 0 14px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .pd-action-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        /* Purchase price column */
        .pd-hero-price-col {
          text-align: right;
          flex-shrink: 0;
        }
        .pd-price-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }
        .pd-price-value {
          font-size: 1.45rem;
          font-weight: 800;
          color: #0f172a;
        }

        /* ── MIDDLE 3-COLUMN GRID ── */
        .pd-middle-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 22px;
          margin-bottom: 24px;
        }

        .pd-col-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 22px 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
        }
        .pd-col-plan {
          justify-content: space-between;
        }
        .pd-col-stacked {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .pd-card-mini {
          padding: 18px 20px;
        }

        /* Card Header */
        .pd-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
        }
        .pd-card-title {
          font-size: 1.02rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .pd-icon-blue {
          color: #2563eb;
        }
        .pd-icon-green {
          color: #10b981;
          flex-shrink: 0;
        }
        .pd-icon-muted {
          color: #94a3b8;
        }

        /* Warranty Life Column */
        .pd-warranty-percent {
          font-size: 1.85rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
        }
        .pd-progress-track {
          width: 100%;
          height: 6px;
          background: #f1f5f9;
          border-radius: 9999px;
          overflow: hidden;
          margin-bottom: 10px;
        }
        .pd-progress-bar {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.3s ease;
        }
        .bar-active {
          background: #2563eb;
        }
        .bar-expired {
          background: #ef4444;
        }
        .bar-expiring {
          background: #f59e0b;
        }

        .pd-remaining-days-text {
          font-size: 0.86rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 22px;
        }

        .pd-dates-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid #f1f5f9;
        }
        .pd-date-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .pd-date-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.04em;
        }
        .pd-date-val {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0f172a;
        }

        /* Protection Plan Column */
        .pd-plan-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 14px;
        }
        .pd-plan-checklist {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
        }
        .pd-check-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #334155;
        }
        .pd-btn-extend {
          width: 100%;
          height: 40px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pd-btn-extend:hover {
          background: #1d4ed8;
        }

        /* Recent Service Mini Card */
        .pd-recent-service-box {
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          background: #f8fafc;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 80px;
          text-align: center;
        }
        .pd-no-service-text {
          font-size: 0.84rem;
          color: #64748b;
        }
        .pd-service-item-compact {
          width: 100%;
          text-align: left;
        }

        /* Service Locator Mini Card */
        .pd-map-preview-wrap {
          width: 100%;
          height: 96px;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          margin-bottom: 10px;
          background: #f1f5f9;
        }
        .pd-map-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .pd-locator-text {
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 12px;
          line-height: 1.35;
        }
        .pd-btn-find-centers {
          width: 100%;
          height: 36px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.84rem;
          font-weight: 600;
          color: #2563eb;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pd-btn-find-centers:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        /* ── BOTTOM CARD: SPECS ── */
        .pd-specs-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 22px 28px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }
        .pd-specs-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 16px 0;
        }
        .pd-specs-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .pd-spec-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .pd-spec-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.04em;
        }
        .pd-spec-val {
          font-size: 0.88rem;
          font-weight: 700;
          color: #0f172a;
        }

        /* ── MODALS ── */
        .pd-modal-backdrop {
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
        .pd-modal-card {
          background: #ffffff;
          border-radius: 14px;
          width: 100%;
          max-width: 480px;
          padding: 24px 26px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          animation: modalIn 0.2s ease-out;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pd-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .pd-modal-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .pd-modal-subtitle {
          font-size: 0.82rem;
          color: #64748b;
          margin: 2px 0 0 0;
        }
        .pd-modal-close {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
        }
        .pd-modal-close:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .pd-modal-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .pd-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .pd-form-label {
          font-size: 0.84rem;
          font-weight: 600;
          color: #334155;
        }
        .pd-form-select, .pd-form-input {
          height: 40px;
          padding: 0 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.88rem;
          color: #0f172a;
          outline: none;
          background: #ffffff;
        }
        .pd-form-select:focus, .pd-form-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .pd-plan-benefits-preview {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 12px 14px;
        }

        .pd-share-preview-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px;
          text-align: center;
        }

        .pd-center-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 14px;
          margin-bottom: 8px;
        }

        .pd-modal-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 6px;
        }
        .pd-btn-cancel {
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
        .pd-btn-submit {
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
        .pd-btn-submit:hover {
          background: #1d4ed8;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .pd-middle-grid {
            grid-template-columns: 1fr;
          }
          .pd-specs-row {
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }
        @media (max-width: 768px) {
          .pd-container {
            padding: 20px 16px 40px;
          }
          .pd-hero-card {
            flex-direction: column;
            align-items: flex-start;
          }
          .pd-hero-price-col {
            text-align: left;
            width: 100%;
            border-top: 1px solid #f1f5f9;
            padding-top: 12px;
          }
        }
      `}</style>
    </div>
  );
}
