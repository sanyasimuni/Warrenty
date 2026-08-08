'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  UploadCloud,
  Download,
  FileText,
  Clock,
  AlertTriangle,
  Cloud,
  LayoutGrid,
  List,
  ChevronDown,
  Plus,
  X,
  Eye,
  CheckCircle2,
  Building,
  Calendar,
  DollarSign,
  ShieldCheck,
  FileCheck,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  CreditCard,
  Check
} from 'lucide-react';
import { useRealtime } from '@/lib/realtime-context';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import { ProductItem } from '@/lib/dashboard-data';

interface InvoiceDocItem {
  id: string;
  name: string;
  merchant: string;
  purchaseDate: string;
  price: number;
  status: 'active' | 'expiring' | 'expired';
  category: 'electronics' | 'furniture' | 'vehicles' | 'appliances' | 'other';
  fileType: 'pdf' | 'jpg' | 'png';
  fileName: string;
  orderNumber?: string;
  serialNumber?: string;
}

export default function InvoicesPage() {
  const { products, addProduct } = useRealtime();

  // Filter & Search States
  const [activeCategory, setActiveCategory] = useState<'all' | 'electronics' | 'furniture' | 'vehicles' | 'appliances'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals & Feedback
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState<InvoiceDocItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload Form State
  const [uploadProductName, setUploadProductName] = useState('');
  const [uploadMerchant, setUploadMerchant] = useState('');
  const [uploadPrice, setUploadPrice] = useState('1499.00');
  const [uploadDate, setUploadDate] = useState('2026-08-01');
  const [uploadCategory, setUploadCategory] = useState<'electronics' | 'furniture' | 'vehicle' | 'appliances' | 'kitchen' | 'computer' | 'mobile'>('electronics');
  const [uploadFileType, setUploadFileType] = useState<'pdf' | 'jpg'>('pdf');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Base invoices matching screenshot examples + live synced products
  const baseInvoices: InvoiceDocItem[] = useMemo(() => {
    const curated: InvoiceDocItem[] = [
      {
        id: 'inv-macbook-m3',
        name: 'MacBook Pro M3',
        merchant: 'Apple Store',
        purchaseDate: 'Oct 12, 2023',
        price: 2499.00,
        status: 'active',
        category: 'electronics',
        fileType: 'pdf',
        fileName: 'Apple_Store_Invoice_MBP_M3.pdf',
        orderNumber: '#APP-884920',
        serialNumber: 'C02FX901MD6R'
      },
      {
        id: 'inv-sony-oled',
        name: 'Sony OLED TV',
        merchant: 'Best Buy',
        purchaseDate: 'Aug 05, 2022',
        price: 1299.99,
        status: 'expiring',
        category: 'electronics',
        fileType: 'jpg',
        fileName: 'BestBuy_Sony_OLED_Receipt.jpg',
        orderNumber: '#BBY-993812',
        serialNumber: 'SN-SNY88492'
      },
      {
        id: 'inv-herman-miller',
        name: 'Herman Miller Chair',
        merchant: 'Design Within Reach',
        purchaseDate: 'Feb 20, 2024',
        price: 1545.00,
        status: 'active',
        category: 'furniture',
        fileType: 'pdf',
        fileName: 'DWR_Aeron_Receipt_2024.pdf',
        orderNumber: '#DWR-103982',
        serialNumber: 'HM-AERON-883'
      },
      {
        id: 'inv-samsung-s26',
        name: 'Samsung Galaxy S26 Ultra',
        merchant: 'Samsung Official Store',
        purchaseDate: 'Jan 15, 2026',
        price: 1299.00,
        status: 'active',
        category: 'electronics',
        fileType: 'pdf',
        fileName: 'Samsung_S26_Official_Invoice.pdf',
        orderNumber: '#SAM-8893120',
        serialNumber: 'R5CW308X9MA'
      },
      {
        id: 'inv-tesla-wall',
        name: 'Tesla Wall Connector Gen 3',
        merchant: 'Tesla Motors',
        purchaseDate: 'May 10, 2025',
        price: 475.00,
        status: 'active',
        category: 'vehicles',
        fileType: 'pdf',
        fileName: 'Tesla_WallConnector_Invoice.pdf',
        orderNumber: '#TSLA-448102',
        serialNumber: 'TSLA-WC-992'
      },
      {
        id: 'inv-dyson-v15',
        name: 'Dyson V15 Detect',
        merchant: 'Dyson Direct',
        purchaseDate: 'Nov 02, 2024',
        price: 749.99,
        status: 'active',
        category: 'appliances',
        fileType: 'pdf',
        fileName: 'Dyson_V15_Receipt.pdf',
        orderNumber: '#DYS-339182',
        serialNumber: 'DY-V15-4491'
      }
    ];

    // Merge live products if user vaulted custom ones
    const additional = products
      .filter((p) => !curated.some((c) => c.name.toLowerCase() === p.name.toLowerCase()))
      .map((p) => ({
        id: `inv-${p.id}`,
        name: p.name,
        merchant: p.retailer || 'Retail Store',
        purchaseDate: p.purchaseDate,
        price: p.purchasePrice || 499.00,
        status: p.status,
        category: (p.category === 'vehicle' ? 'vehicles' : p.category === 'appliances' ? 'appliances' : p.category === 'furniture' ? 'furniture' : 'electronics') as any,
        fileType: (p.invoiceFileName?.endsWith('.jpg') || p.invoiceFileName?.endsWith('.png') ? 'jpg' : 'pdf') as 'pdf' | 'jpg',
        fileName: p.invoiceFileName || `${p.name.replace(/\s+/g, '_')}_Invoice.pdf`,
        orderNumber: p.orderNumber || '#ORD-88912',
        serialNumber: p.serialNumber
      }));

    return [...curated, ...additional];
  }, [products]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return baseInvoices.filter((inv) => {
      const matchCategory =
        activeCategory === 'all' ||
        inv.category === activeCategory;

      const matchSearch =
        inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.fileName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [baseInvoices, activeCategory, searchQuery]);

  // Download Handler
  const handleDownload = (invoice: InvoiceDocItem) => {
    setDownloadingId(invoice.id);
    showToast(`📥 Downloading official file: ${invoice.fileName}`);

    setTimeout(() => {
      try {
        const dummyProduct: ProductItem = {
          id: invoice.id,
          name: invoice.name,
          brand: invoice.merchant,
          model: `${invoice.name} 2026`,
          category: 'electronics',
          categoryLabel: 'Electronics',
          purchaseDate: invoice.purchaseDate,
          purchasePrice: invoice.price,
          retailer: invoice.merchant,
          orderNumber: invoice.orderNumber || '#ORD-99381',
          serialNumber: invoice.serialNumber || 'SN-884920',
          assetId: 'AP-INV-01',
          warrantyMonths: 24,
          warrantyType: 'Manufacturer',
          warrantyCoverageName: 'Standard Proof of Purchase',
          warrantyCoverageDesc: 'Full factory warranty coverage with verified authentic proof of purchase.',
          expiryDate: '2028-08-01',
          status: invoice.status,
          monthsRemainingText: '18 Months Left',
          daysRemaining: 540,
          progressPercent: 75,
          image: '',
          invoiceFileName: invoice.fileName,
          serviceHistory: []
        };
        generateInvoicePDF(dummyProduct);
        showToast(`✅ Successfully downloaded ${invoice.fileName}`);
      } catch (err) {
        console.error('PDF error', err);
        showToast('⚠️ Could not generate PDF. Please try again.');
      } finally {
        setDownloadingId(null);
      }
    }, 400);
  };

  // Upload Submit
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadProductName.trim()) return;

    const parsedPrice = parseFloat(uploadPrice) || 299;
    const ext = uploadFileType === 'jpg' ? 'jpg' : 'pdf';
    const fileName = `${uploadProductName.replace(/\s+/g, '_')}_ProofOfPurchase.${ext}`;

    await addProduct({
      name: uploadProductName,
      brand: uploadMerchant || 'Authorized Dealer',
      category: uploadCategory,
      purchaseDate: uploadDate,
      purchasePrice: parsedPrice,
      retailer: uploadMerchant || 'Direct Retail Store',
      invoiceFileName: fileName,
      warrantyMonths: 24
    });

    setIsUploadModalOpen(false);
    setUploadProductName('');
    setUploadMerchant('');
    showToast(`✨ Successfully vaulted ${fileName}!`);
  };

  return (
    <div style={{ padding: '28px 36px 60px', maxWidth: '1320px', margin: '0 auto', fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: '#0f172a' }}>
      
      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 99999,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: 600,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── TOP HEADER ROW ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '26px',
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
            Invoices &amp; Receipts
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0 }}>
            Manage your digital vault of proof-of-purchase documents.
          </p>
        </div>

        {/* Top Right Header Controls: Perfect Inline Search Bar + Upload Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search Box Input Container */}
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
              placeholder="Search invoices, merchants..."
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
          </div>

          {/* Upload New Button */}
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            style={{
              height: '40px',
              padding: '0 18px',
              backgroundColor: '#2563eb',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: '#ffffff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 1px 2px rgba(37,99,235,0.2)',
              transition: 'background-color 0.2s ease',
              flexShrink: 0
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
          >
            <UploadCloud size={16} />
            <span>Upload New</span>
          </button>
        </div>
      </div>

      {/* ── TOP 4 STATS KPI CARDS ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '18px',
          marginBottom: '26px'
        }}
      >
        {/* Card 1: TOTAL VALUE */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px 22px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb'
              }}
            >
              <FileCheck size={19} />
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', color: '#64748b' }}>
              TOTAL VALUE
            </span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginBottom: '4px' }}>
            $12,450.00
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>42 tracked items</div>
        </div>

        {/* Card 2: RECENT */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px 22px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}
            >
              <Clock size={19} />
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', color: '#64748b' }}>
              RECENT
            </span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginBottom: '4px' }}>
            12
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Last 30 days</div>
        </div>

        {/* Card 3: MISSING (Alert Card with Soft Red Highlight) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '20px 22px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}
            >
              <AlertTriangle size={19} />
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', color: '#dc2626' }}>
              MISSING
            </span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginBottom: '4px' }}>
            3
          </div>
          <div
            style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => showToast('🔍 3 items identified without proof-of-purchase invoice.')}
          >
            Action required →
          </div>
        </div>

        {/* Card 4: STORAGE */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px 22px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}
            >
              <Cloud size={19} />
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', color: '#64748b' }}>
              STORAGE
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>450MB</span>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>2GB Limit</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: '22.5%', height: '100%', backgroundColor: '#2563eb', borderRadius: '9999px' }} />
          </div>
        </div>
      </div>

      {/* ── FILTER PILLS & VIEW TOGGLE BAR ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '22px',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Files' },
            { id: 'electronics', label: 'Electronics' },
            { id: 'furniture', label: 'Furniture' },
            { id: 'vehicles', label: 'Vehicles' }
          ].map((item) => {
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveCategory(item.id as any)}
                style={{
                  height: '34px',
                  padding: '0 16px',
                  backgroundColor: isActive ? '#2563eb' : '#ffffff',
                  border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  borderRadius: '9999px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: isActive ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {item.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActiveCategory(activeCategory === 'appliances' ? 'all' : 'appliances')}
            style={{
              height: '34px',
              padding: '0 14px',
              backgroundColor: activeCategory === 'appliances' ? '#2563eb' : '#ffffff',
              border: activeCategory === 'appliances' ? '1px solid #2563eb' : '1px solid #e2e8f0',
              borderRadius: '9999px',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: activeCategory === 'appliances' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>More</span>
            <ChevronDown size={14} />
          </button>
        </div>

        {/* View Toggle (Grid / List) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '2px'
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              backgroundColor: viewMode === 'grid' ? '#eff6ff' : 'transparent',
              color: viewMode === 'grid' ? '#2563eb' : '#64748b',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            title="Grid View"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              backgroundColor: viewMode === 'list' ? '#eff6ff' : 'transparent',
              color: viewMode === 'list' ? '#2563eb' : '#64748b',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            title="List View"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* ── 4-COLUMN CARDS GRID VIEW ── */}
      {viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px'
          }}
        >
          {/* Card 1: MacBook Pro M3 */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              style={{
                height: '140px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)',
                borderBottom: '1px solid #f1f5f9'
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a'
                }}
              >
                ACTIVE
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <FileText size={38} color="#ef4444" />
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>
                  PDF
                </span>
              </div>
            </div>
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                MacBook Pro M3
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: '12px' }}>
                <span>Apple Store</span>
                <span>Oct 12, 2023</span>
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                $2,499.00
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={() => setSelectedDetailsItem(baseInvoices[0])}
                  style={{
                    height: '34px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  Details
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(baseInvoices[0])}
                  style={{
                    height: '34px',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  Download
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Sony OLED TV */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              style={{
                height: '140px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
                borderBottom: '1px solid #f1f5f9'
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#fef3c7',
                  color: '#d97706'
                }}
              >
                EXPIRING
              </span>
              {/* Slanted Receipt Graphic */}
              <div
                style={{
                  width: '80px',
                  height: '95px',
                  backgroundColor: '#ffffff',
                  borderRadius: '4px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #cbd5e1',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transform: 'rotate(-4deg)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ height: '3px', width: '90%', backgroundColor: '#e2e8f0', borderRadius: '2px' }} />
                  <div style={{ height: '3px', width: '65%', backgroundColor: '#e2e8f0', borderRadius: '2px' }} />
                  <div style={{ height: '3px', width: '45%', backgroundColor: '#e2e8f0', borderRadius: '2px' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', fontSize: '0.65rem', fontWeight: 700, color: '#3b82f6' }}>
                  <ImageIcon size={14} color="#3b82f6" />
                  <span>JPG</span>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                Sony OLED TV
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: '12px' }}>
                <span>Best Buy</span>
                <span>Aug 05, 2022</span>
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                $1,299.99
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={() => setSelectedDetailsItem(baseInvoices[1])}
                  style={{
                    height: '34px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  Details
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(baseInvoices[1])}
                  style={{
                    height: '34px',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  Download
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Herman Miller Chair */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              style={{
                height: '140px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)',
                borderBottom: '1px solid #f1f5f9'
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a'
                }}
              >
                ACTIVE
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <FileText size={38} color="#ef4444" />
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>
                  PDF
                </span>
              </div>
            </div>
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                Herman Miller Chair
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: '12px' }}>
                <span>Design Within Reach</span>
                <span>Feb 20, 2024</span>
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                $1,545.00
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={() => setSelectedDetailsItem(baseInvoices[2])}
                  style={{
                    height: '34px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  Details
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(baseInvoices[2])}
                  style={{
                    height: '34px',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  Download
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Add New Receipt (Dashed Dropzone Card) */}
          <div
            onClick={() => setIsUploadModalOpen(true)}
            style={{
              backgroundColor: '#ffffff',
              border: '2px dashed #bfdbfe',
              borderRadius: '12px',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              minHeight: '280px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f0f7ff')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}
            >
              <ImageIcon size={22} color="#2563eb" />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
              Add New Receipt
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4, maxWidth: '180px' }}>
              Drag and drop files here, or click to browse.
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsUploadModalOpen(true);
              }}
              style={{
                height: '34px',
                padding: '0 18px',
                backgroundColor: '#2563eb',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              Select File
            </button>
          </div>

          {/* Additional Filtered Invoices if searched or filtered */}
          {filteredInvoices
            .filter((inv) => !['inv-macbook-m3', 'inv-sony-oled', 'inv-herman-miller'].includes(inv.id))
            .map((inv) => (
              <div
                key={inv.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div
                  style={{
                    height: '140px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)',
                    borderBottom: '1px solid #f1f5f9'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: inv.status === 'active' ? '#dcfce7' : '#fef3c7',
                      color: inv.status === 'active' ? '#16a34a' : '#d97706'
                    }}
                  >
                    {inv.status.toUpperCase()}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <FileText size={38} color="#ef4444" />
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>
                      {inv.fileType.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                    {inv.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: '12px' }}>
                    <span>{inv.merchant}</span>
                    <span>{inv.purchaseDate}</span>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                    ${inv.price.toFixed(2)}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedDetailsItem(inv)}
                      style={{
                        height: '34px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#334155',
                        cursor: 'pointer'
                      }}
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(inv)}
                      style={{
                        height: '34px',
                        backgroundColor: '#2563eb',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        cursor: 'pointer'
                      }}
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        /* ── INVOICES LIST VIEW TABLE ── */
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Document &amp; File</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Merchant</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Purchase Date</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.88rem', color: '#334155' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '6px',
                          backgroundColor: '#fef2f2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <FileText size={18} color="#ef4444" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{inv.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{inv.fileName}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>{inv.merchant}</td>
                  <td style={{ padding: '14px 18px', textTransform: 'capitalize' }}>{inv.category}</td>
                  <td style={{ padding: '14px 18px' }}>{inv.purchaseDate}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: inv.status === 'active' ? '#dcfce7' : '#fef3c7',
                        color: inv.status === 'active' ? '#16a34a' : '#d97706'
                      }}
                    >
                      {inv.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>${inv.price.toFixed(2)}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedDetailsItem(inv)}
                        style={{
                          height: '32px',
                          padding: '0 12px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(inv)}
                        style={{
                          height: '32px',
                          padding: '0 14px',
                          backgroundColor: '#2563eb',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL: UPLOAD NEW RECEIPT ── */}
      {isUploadModalOpen && (
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
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '500px',
              padding: '24px 26px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Upload Proof of Purchase
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Save a verified receipt or invoice to your digital vault
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
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

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  border: '2px dashed #bfdbfe',
                  backgroundColor: '#eff6ff',
                  borderRadius: '10px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <Upload size={24} color="#2563eb" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
                  Drag and drop receipt file here, or click to browse
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  Supports PDF, JPEG, PNG scanned documents (max 15MB)
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    Product / Item Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sony Bravia 65 OLED TV"
                    value={uploadProductName}
                    onChange={(e) => setUploadProductName(e.target.value)}
                    style={{
                      height: '38px',
                      padding: '0 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    Merchant / Retailer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Best Buy, Apple, Amazon"
                    value={uploadMerchant}
                    onChange={(e) => setUploadMerchant(e.target.value)}
                    style={{
                      height: '38px',
                      padding: '0 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    Category
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    style={{
                      height: '38px',
                      padding: '0 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="electronics">Electronics</option>
                    <option value="furniture">Furniture</option>
                    <option value="vehicle">Vehicles</option>
                    <option value="appliances">Appliances</option>
                    <option value="computer">Computers</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    Purchase Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={uploadPrice}
                    onChange={(e) => setUploadPrice(e.target.value)}
                    style={{
                      height: '38px',
                      padding: '0 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    style={{
                      height: '38px',
                      padding: '0 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    Document Format
                  </label>
                  <select
                    value={uploadFileType}
                    onChange={(e) => setUploadFileType(e.target.value as 'pdf' | 'jpg')}
                    style={{
                      height: '38px',
                      padding: '0 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="jpg">Image Receipt (.jpg / .png)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  style={{
                    flex: 1,
                    height: '40px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    height: '40px',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: INVOICE DETAILS ── */}
      {selectedDetailsItem && (
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
          onClick={() => setSelectedDetailsItem(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '540px',
              padding: '24px 26px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Receipt Information
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Digital Proof of Purchase Certificate
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailsItem(null)}
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
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                    {selectedDetailsItem.name}
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: selectedDetailsItem.status === 'active' ? '#dcfce7' : '#fef3c7',
                      color: selectedDetailsItem.status === 'active' ? '#16a34a' : '#d97706'
                    }}
                  >
                    {selectedDetailsItem.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  File: <strong>{selectedDetailsItem.fileName}</strong>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '14px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #f1f5f9',
                  borderRadius: '8px',
                  padding: '14px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
                    MERCHANT
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                    {selectedDetailsItem.merchant}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
                    PURCHASE DATE
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                    {selectedDetailsItem.purchaseDate}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
                    ORDER / INVOICE #
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                    {selectedDetailsItem.orderNumber || '#ORD-88391'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
                    SERIAL NUMBER
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                    {selectedDetailsItem.serialNumber || 'SN-994820'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
                    CATEGORY
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', textTransform: 'capitalize' }}>
                    {selectedDetailsItem.category}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
                    TOTAL BILLED
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#2563eb' }}>
                    ${selectedDetailsItem.price.toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedDetailsItem(null)}
                  style={{
                    flex: 1,
                    height: '40px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownload(selectedDetailsItem);
                    setSelectedDetailsItem(null);
                  }}
                  style={{
                    flex: 1,
                    height: '40px',
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
                    gap: '6px'
                  }}
                >
                  <Download size={15} />
                  <span>Download PDF Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
