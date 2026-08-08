'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  FileText,
  Download,
  Plus,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Calendar,
  DollarSign,
  Tv,
  Refrigerator,
  Laptop,
  Smartphone,
  Car,
  Utensils,
  Layers,
  Wrench
} from 'lucide-react';
import { useRealtime } from '@/lib/realtime-context';
import { ProductItem } from '@/lib/dashboard-data';
import { generateInvoicePDF } from '@/lib/pdf-generator';

export default function ProductsCatalogPage() {
  const { products, deleteProduct, renewProduct } = useRealtime();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProductDetails, setSelectedProductDetails] = useState<ProductItem | null>(null);
  const [activeInvoiceModal, setActiveInvoiceModal] = useState<ProductItem | null>(null);

  const categories = [
    { key: 'all', label: 'All Products' },
    { key: 'electronics', label: 'Electronics' },
    { key: 'furniture', label: 'Furniture' },
    { key: 'kitchen', label: 'Kitchen' },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'computer', label: 'Computer' },
    { key: 'appliances', label: 'Home Appliance' },
  ];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase() ||
        item.categoryLabel.toLowerCase().includes(selectedCategory.toLowerCase());

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        item.serialNumber.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const getProductIcon = (item: ProductItem) => {
    const name = (item.name + ' ' + item.category).toLowerCase();
    if (name.includes('tv')) return <Tv size={22} color="#2563eb" />;
    if (name.includes('fridge') || name.includes('refrigerator')) return <Refrigerator size={22} color="#0284c7" />;
    if (name.includes('macbook') || name.includes('laptop') || name.includes('dell')) return <Laptop size={22} color="#6366f1" />;
    if (name.includes('phone') || name.includes('galaxy') || name.includes('iphone')) return <Smartphone size={22} color="#3b82f6" />;
    if (name.includes('car') || name.includes('vehicle') || name.includes('tesla')) return <Car size={22} color="#10b981" />;
    return <Layers size={22} color="#2563eb" />;
  };

  return (
    <div style={{ padding: '28px 36px 60px', maxWidth: '1380px', margin: '0 auto', fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: '#0f172a' }}>
      
      {/* ── TOP HEADER ROW ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          gap: '20px',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.85rem',
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.025em',
              margin: '0 0 4px 0'
            }}
          >
            Your Products
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0 }}>
            Manage all your warrantied items in one place.
          </p>
        </div>

        {/* Search Bar on Top Right with Guaranteed Inline Centering */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0 14px',
            height: '40px',
            width: '280px',
            gap: '10px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            transition: 'all 0.2s ease'
          }}
        >
          <Search size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.86rem',
              color: '#0f172a',
              backgroundColor: 'transparent',
              padding: 0
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── CATEGORY FILTER PILLS ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '28px',
          flexWrap: 'wrap'
        }}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              style={{
                padding: '8px 18px',
                backgroundColor: isActive ? '#2563eb' : '#ffffff',
                border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                borderRadius: '9999px',
                fontSize: '0.86rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 8px rgba(37, 99, 235, 0.25)' : 'none'
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── PRODUCT CARDS 3-COL GRID ── */}
      {filteredProducts.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            color: '#64748b'
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📦</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
            No products match your criteria
          </h3>
          <p style={{ fontSize: '0.9rem', margin: '0 0 20px 0' }}>
            Try clearing the search or choosing a different category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            style={{
              padding: '8px 20px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '22px'
          }}
        >
          {filteredProducts.map((item) => {
            const isExpired = item.status === 'expired' || item.daysRemaining <= 0;
            const isExpiring = item.status === 'expiring' || (item.daysRemaining > 0 && item.daysRemaining <= 45);
            const statusKey = isExpired ? 'expired' : isExpiring ? 'expiring' : 'active';

            // Warranty text & percent
            const warrantyText = isExpired
              ? 'Ended'
              : item.monthsRemainingText || `${Math.max(1, Math.round(item.daysRemaining / 30))} Months Left`;
            const progressVal = isExpired
              ? 0
              : Math.min(100, Math.max(10, Math.round(item.progressPercent || 70)));

            const statusColors = {
              active: { bg: '#dcfce7', text: '#16a34a', bar: '#22c55e', border: '#bbf7d0' },
              expiring: { bg: '#fef3c7', text: '#d97706', bar: '#f59e0b', border: '#fde68a' },
              expired: { bg: '#fee2e2', text: '#dc2626', bar: '#ef4444', border: '#fecaca' }
            }[statusKey];

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.25s ease',
                  minHeight: '260px'
                }}
              >
                <div>
                  {/* Top Row: Thumbnail + Title/Brand + Status Pill */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '10px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                            onError={(e) => {
                              // Fallback to icon if image fails
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          getProductIcon(item)
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {item.brand}
                        </div>
                        <Link
                          href={`/dashboard/products/${item.id}`}
                          style={{
                            fontSize: '1.02rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            textDecoration: 'none',
                            lineHeight: 1.3,
                            display: 'block'
                          }}
                        >
                          {item.name}
                        </Link>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: statusColors.bg,
                        color: statusColors.text,
                        border: `1px solid ${statusColors.border}`,
                        flexShrink: 0
                      }}
                    >
                      {statusKey.toUpperCase()}
                    </span>
                  </div>

                  {/* Metadata Row: Serial + Purchase Date */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      color: '#64748b',
                      marginBottom: '16px'
                    }}
                  >
                    <span>SN: <strong style={{ color: '#334155' }}>{item.serialNumber}</strong></span>
                    <span>Purchased: <strong style={{ color: '#334155' }}>{item.purchaseDate}</strong></span>
                  </div>

                  {/* Warranty Progress Track */}
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Warranty Life</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: statusColors.text }}>{warrantyText}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.74rem' }}>
                          {isExpired ? '0%' : `${progressVal}%`}
                        </span>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${isExpired ? 100 : progressVal}%`,
                          height: '100%',
                          backgroundColor: statusColors.bar,
                          borderRadius: '9999px'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions Bottom Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedProductDetails(item)}
                    style={{
                      height: '36px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveInvoiceModal(item)}
                    style={{
                      height: '36px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <FileText size={15} color="#2563eb" />
                    <span>Invoice</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL: PRODUCT DETAILS ── */}
      {selectedProductDetails && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setSelectedProductDetails(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '520px',
              padding: '24px 26px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  {selectedProductDetails.brand}
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '2px 0 0 0' }}>
                  {selectedProductDetails.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductDetails(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block' }}>ASSET TAG</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{selectedProductDetails.assetId}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block' }}>SERIAL NUMBER</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{selectedProductDetails.serialNumber}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block' }}>PURCHASE DATE</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{selectedProductDetails.purchaseDate}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block' }}>EXPIRY DATE</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2563eb' }}>{selectedProductDetails.expiryDate}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block' }}>PURCHASE PRICE</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>${selectedProductDetails.purchasePrice.toFixed(2)}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block' }}>RETAILER</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{selectedProductDetails.retailer}</span>
                </div>
              </div>

              {/* Policy Box */}
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '12px 14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#1e40af', fontSize: '0.88rem', marginBottom: '4px' }}>
                  <ShieldCheck size={16} color="#2563eb" />
                  <span>{selectedProductDetails.warrantyCoverageName}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#3b82f6', margin: 0, lineHeight: 1.4 }}>
                  {selectedProductDetails.warrantyCoverageDesc}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginTop: '6px' }}>
                <Link
                  href={`/dashboard/products/${selectedProductDetails.id}`}
                  style={{
                    height: '40px',
                    backgroundColor: '#2563eb',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Open Full Asset File</span>
                  <ArrowRight size={15} />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const item = selectedProductDetails;
                    setSelectedProductDetails(null);
                    setActiveInvoiceModal(item);
                  }}
                  style={{
                    height: '40px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <FileText size={15} color="#2563eb" />
                  <span>View Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: PROOF OF PURCHASE INVOICE ── */}
      {activeInvoiceModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setActiveInvoiceModal(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '480px',
              padding: '24px 26px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Proof of Purchase
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Official Digital Invoice Record
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveInvoiceModal(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Receipt Box */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                  {activeInvoiceModal.retailer}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Verified Purchase Receipt
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '12px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Asset:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{activeInvoiceModal.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Brand / Model:</span>
                  <span style={{ color: '#334155' }}>{activeInvoiceModal.brand} ({activeInvoiceModal.model})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Serial Number:</span>
                  <span style={{ color: '#334155' }}>{activeInvoiceModal.serialNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Purchase Date:</span>
                  <span style={{ color: '#334155' }}>{activeInvoiceModal.purchaseDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Warranty Expiration:</span>
                  <span style={{ fontWeight: 700, color: '#2563eb' }}>{activeInvoiceModal.expiryDate}</span>
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '12px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>Total Paid:</span>
                <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>
                  ${activeInvoiceModal.purchasePrice.toFixed(2)}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '18px' }}>
              <button
                type="button"
                style={{
                  width: '100%',
                  height: '42px',
                  backgroundColor: '#2563eb',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onClick={() => {
                  try {
                    generateInvoicePDF(activeInvoiceModal);
                  } catch (err) {
                    console.error(err);
                  }
                  setActiveInvoiceModal(null);
                }}
              >
                <Download size={16} />
                <span>Download PDF Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
