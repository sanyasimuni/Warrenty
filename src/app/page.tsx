'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Zap,
  Bell,
  Smartphone,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  Play,
  Check,
  Lock,
  ChevronDown,
  FileText,
  Clock,
  Trash2,
  Tv,
  Home,
  Car,
  Upload,
  Database,
  Server,
  Code,
  Shield,
  CreditCard,
  Building,
  ShoppingBag,
  Utensils,
  Wrench,
  Truck,
  Layers,
  BarChart2,
  RefreshCw,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Asset } from '@/lib/supabase';

export default function LandingPage() {
  // ==================== State ====================
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModal, setActiveModal] = useState<'ocr-scan' | 'demo-video' | 'invoice-preview' | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Asset | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [scanningProgress, setScanningProgress] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial Mock Assets matching the real-time simulator
  useEffect(() => {
    const initialAssets: Asset[] = [
      {
        id: '1',
        name: 'MacBook Pro 16" M3 Max',
        serial_number: 'C02G89A1MD6R',
        category: 'electronics',
        purchase_date: '2024-01-15',
        expiry_date: '2026-01-15',
        status: 'active',
        price: 3499,
        store: 'Apple Store Fifth Ave',
        invoice_url: '/invoices/inv-001.pdf'
      },
      {
        id: '2',
        name: 'Samsung 65" OLED 4K Smart TV',
        serial_number: 'QN65S90CAFXZA-8821',
        category: 'electronics',
        purchase_date: '2023-08-10',
        expiry_date: '2026-08-10',
        status: 'active',
        price: 1899,
        store: 'Best Buy Electronics',
        invoice_url: '/invoices/inv-002.pdf'
      },
      {
        id: '3',
        name: 'Bosch 800 Series Dishwasher',
        serial_number: 'SHPM88Z75N-44910',
        category: 'appliances',
        purchase_date: '2022-09-01',
        expiry_date: '2026-09-01',
        status: 'expiring',
        price: 1299,
        store: 'Home Depot Appliances',
        invoice_url: '/invoices/inv-003.pdf'
      },
      {
        id: '4',
        name: 'Sony WH-1000XM5 Headphones',
        serial_number: 'SN-77821094-B',
        category: 'electronics',
        purchase_date: '2023-03-20',
        expiry_date: '2025-03-20',
        status: 'expired',
        price: 399,
        store: 'Amazon Prime',
        invoice_url: '/invoices/inv-004.pdf'
      },
      {
        id: '5',
        name: 'Tesla Wall Connector Gen 3',
        serial_number: 'TPC-992184-US',
        category: 'vehicles',
        purchase_date: '2023-11-05',
        expiry_date: '2027-11-05',
        status: 'active',
        price: 475,
        store: 'Tesla Direct',
        invoice_url: '/invoices/inv-005.pdf'
      }
    ];

    setAssets(initialAssets);
  }, []);

  // Filtered Assets
  const filteredAssets = assets.filter((item) => {
    const matchesCategory = filter === 'all' || item.category === filter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serial_number?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalValue = assets.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const activeCount = assets.filter((a) => a.status === 'active').length;
  const expiringCount = assets.filter((a) => a.status === 'expiring').length;

  // AI OCR Scanning Simulator
  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanningProgress(10);

    const interval = setInterval(() => {
      setScanningProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setIsScanning(false);
            setScanningProgress(100);

            const newProduct: Asset = {
              id: Date.now().toString(),
              name: 'Dyson V15 Detect Cordless Vacuum',
              serial_number: 'DYSON-V15-' + Math.floor(1000 + Math.random() * 9000),
              category: 'appliances',
              purchase_date: new Date().toISOString().split('T')[0],
              expiry_date: '2028-08-08',
              status: 'active',
              price: 749,
              store: 'Dyson Direct',
              invoice_url: '/invoices/dyson-scan.pdf'
            };

            setAssets((prevAssets) => [newProduct, ...prevAssets]);
            setActiveModal(null);
            showToast('✨ AI OCR extracted: Dyson V15 vacuum added to your vault!');
          }, 600);
          return 95;
        }
        return prev + 25;
      });
    }, 250);
  };

  return (
    <div className="landing-page-root">
      {/* ==================== 1. Header / Navbar ==================== */}
      <header className="site-header">
        <div className="container navbar">
          <Link href="/" className="brand-logo">
            <ShieldCheck className="brand-logo-icon" />
            <span>WarrantyWise</span>
          </Link>

          <nav className="desktop-nav">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it Works</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#faq" className="nav-link">FAQ</a>
          </nav>

          <div className="nav-actions">
            <Link href="/login" className="nav-login-link">
              Login
            </Link>
            <Link href="/register" className="nav-start-btn">
              Registration
            </Link>
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-drawer open" style={{
            padding: '20px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <a href="#features" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="nav-link" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
            <a href="#pricing" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#faq" className="nav-link" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <Link href="/login" className="btn btn-outline w-100" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link href="/register" className="btn btn-primary w-100" onClick={() => setMobileMenuOpen(false)}>
                Registration
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ==================== 2. Hero Section ==================== */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <h1 className="hero-title">
              Never Lose a <br />
              <span className="text-highlight">Warranty</span> Again.
            </h1>

            <p className="hero-subtitle">
              Securely store invoices, track warranty expirations, and receive smart reminders before coverages expire. All of your product documents in one organized digital safe.
            </p>

            <div className="hero-cta-group">
              <Link href="/register" className="btn btn-primary btn-lg">
                Start Free
              </Link>
              <button
                className="btn btn-outline btn-lg"
                onClick={() => setActiveModal('demo-video')}
              >
                <Play size={16} />
                <span>Watch Demo</span>
              </button>
            </div>

            <div className="hero-trust-bullets">
              <div className="hero-trust-item">
                <Check size={16} />
                <span>14-day free trial</span>
              </div>
              <div className="hero-trust-item">
                <Check size={16} />
                <span>No credit card</span>
              </div>
              <div className="hero-trust-item">
                <Check size={16} />
                <span>Bank-level security</span>
              </div>
            </div>
          </div>

          <div className="hero-visual-wrapper">
            {/* Ambient Background Glow */}
            <div className="hero-ambient-glow" />

            {/* Main Premium Monitor Frame */}
            <div className="hero-mockup-frame">
              <img
                src="/assets/image.png"
                alt="WarrantyWise Modern Dashboard UI on Desktop Monitor"
                className="hero-mockup-img"
              />
            </div>

            {/* Floating Premium Feature Badges */}
            <div className="hero-floating-badge badge-top-left animate-float">
              <div className="badge-icon-box bg-emerald">
                <ShieldCheck size={18} color="#059669" />
              </div>
              <div>
                <div className="badge-title">99.4% Approval</div>
                <div className="badge-subtitle">● Claim Protection Active</div>
              </div>
            </div>

            <div className="hero-floating-badge badge-bottom-right animate-float-delay">
              <div className="badge-icon-box bg-blue">
                <Sparkles size={18} color="#2563eb" />
              </div>
              <div>
                <div className="badge-title">Smart AI Auto-OCR</div>
                <div className="badge-subtitle">● Instant Receipt Sync</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 3. Trusted By Social Proof Bar ==================== */}
      <section className="trusted-by-section">
        <div className="container">
          <div className="trusted-by-label">TRUSTED BY</div>
          <div className="trusted-logos-row">
            <div className="trusted-logo-item">
              <Building size={20} />
              <span>TechStart</span>
            </div>
            <div className="trusted-logo-item">
              <ShoppingBag size={20} />
              <span>UrbanGoods</span>
            </div>
            <div className="trusted-logo-item">
              <Utensils size={20} />
              <span>Retail Association</span>
            </div>
            <div className="trusted-logo-item">
              <Wrench size={20} />
              <span>ProTool Logistics</span>
            </div>
            <div className="trusted-logo-item">
              <Truck size={20} />
              <span>RT Auto</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 4. Problem Section ==================== */}
      <section className="problem-section">
        <div className="container text-center">
          <h2 className="section-title">Managing warranties shouldn't be this difficult</h2>
          <p className="section-subtitle">
            The old way of tracking paper receipts in drawers is costing you time and money.
          </p>

          <div className="problem-cards-grid">
            <div className="problem-card">
              <div className="problem-icon-wrapper pink">
                <FileText size={24} />
              </div>
              <h3 className="problem-card-title">Lost Bills</h3>
              <p className="problem-card-desc">
                Paper receipts fade and disappear precisely when you need them most.
              </p>
            </div>

            <div className="problem-card">
              <div className="problem-icon-wrapper amber">
                <Clock size={24} />
              </div>
              <h3 className="problem-card-title">Missed Deadlines</h3>
              <p className="problem-card-desc">
                Realizing the warranty expired just a few days ago.
              </p>
            </div>

            <div className="problem-card">
              <div className="problem-icon-wrapper rose">
                <CreditCard size={24} />
              </div>
              <h3 className="problem-card-title">Out-of-pocket</h3>
              <p className="problem-card-desc">
                Paying for regular repairs because of mismanaged warranty claims.
              </p>
            </div>

            <div className="problem-card">
              <div className="problem-icon-wrapper cyan">
                <Layers size={24} />
              </div>
              <h3 className="problem-card-title">Scattered Invoices</h3>
              <p className="problem-card-desc">
                Receipts spread across drawers, email, or physical folders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 5. One Place For Every Product Flow ==================== */}
      <section className="one-place-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '36px' }}>
            <h2 className="section-title">One Place For Every Product</h2>
          </div>

          <div className="flow-container-card">
            {/* Left 2x2 Categories */}
            <div className="flow-categories-grid">
              <div className="flow-cat-pill">
                <Smartphone size={20} color="#2563eb" />
                <span>Electronics</span>
              </div>
              <div className="flow-cat-pill">
                <Tv size={20} color="#2563eb" />
                <span>Appliances</span>
              </div>
              <div className="flow-cat-pill">
                <Car size={20} color="#2563eb" />
                <span>Vehicles</span>
              </div>
              <div className="flow-cat-pill">
                <Home size={20} color="#2563eb" />
                <span>Furniture</span>
              </div>
            </div>

            {/* Middle Animated Arrow */}
            <div className="flow-arrow-wrapper">
              <ArrowRight className="flow-arrow-icon" />
            </div>

            {/* Right Destination Card */}
            <div className="flow-destination-card">
              <ShieldCheck className="flow-shield-icon" />
              <h3 className="flow-dest-title">Your Digital Safe</h3>
              <p className="flow-dest-desc">
                Secure, organized, and accessible from everywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 6. Features Grid Section ==================== */}
      <section className="features-section" id="features">
        <div className="container text-center">
          <h2 className="section-title">Everything you need to stay protected</h2>
          <p className="section-subtitle">
            Powerful features designed to save you money and give you peace of mind.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">
                <FileSpreadsheet size={22} />
              </div>
              <h3 className="feature-title">Invoice Storage</h3>
              <p className="feature-desc">
                Upload PDFs, photos, or email receipts. We OCR and extract the important details automatically.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <ShieldCheck size={22} />
              </div>
              <h3 className="feature-title">Warranty Tracking</h3>
              <p className="feature-desc">
                Track standard, extended, and third-party warranties effortlessly across any brand.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Bell size={22} />
              </div>
              <h3 className="feature-title">Smart Reminders</h3>
              <p className="feature-desc">
                Get notified 30, 15, and 7 days before a warranty expires or a return window closes.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <RefreshCw size={22} />
              </div>
              <h3 className="feature-title">Service History</h3>
              <p className="feature-desc">
                Log repairs and maintenance. Keep full tracking records that maintain device resale value.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <BarChart2 size={22} />
              </div>
              <h3 className="feature-title">Asset Analytics</h3>
              <p className="feature-desc">
                Visualize the total value of your assets and monitor potential costs across all categories.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Users size={22} />
              </div>
              <h3 className="feature-title">Family Sharing</h3>
              <p className="feature-desc">
                Share your safe with family members so everyone has access to household receipts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 7. How It Works (4 Steps) ==================== */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="container text-center">
          <h2 className="section-title">How it works</h2>
          <p className="section-subtitle">
            Four simple steps to total organization.
          </p>

          <div className="steps-row">
            <div className="step-card">
              <div className="step-badge">1</div>
              <h3 className="step-title">Add Product</h3>
              <p className="step-desc">Snap a receipt or upload product files.</p>
            </div>

            <div className="step-card">
              <div className="step-badge">2</div>
              <h3 className="step-title">Auto-Extraction</h3>
              <p className="step-desc">Smart engine extracts data from receipt.</p>
            </div>

            <div className="step-card">
              <div className="step-badge">3</div>
              <h3 className="step-title">Track Warranty</h3>
              <p className="step-desc">We calculate the next expiration date.</p>
            </div>

            <div className="step-card">
              <div className="step-badge">4</div>
              <h3 className="step-title">Receive Reminder</h3>
              <p className="step-desc">Get notified before coverage ends.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 8. See Your Assets at a Glance (Interactive Live Demo) ==================== */}
      <section className="dashboard-showcase-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '40px' }}>
            <h2 className="section-title">See your assets at a glance</h2>
            <p className="section-subtitle">
              A clean, real-time dashboard that gives you complete visibility.
            </p>
          </div>

          <div className="dashboard-showcase-wrapper">
            {/* Top Toolbar */}
            <div className="dash-top-bar">
              <div className="dash-user-info">
                <div className="dash-avatar">JD</div>
                <div>
                  <div className="dash-user-title">Jane Doe's Smart Vault</div>
                  <div className="dash-user-sub">● Protected & Encrypted</div>
                </div>
              </div>

              <div className="dash-filter-btn-group">
                <button
                  className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setFilter('all')}
                >
                  All Items
                </button>
                <button
                  className={`btn btn-sm ${filter === 'electronics' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setFilter('electronics')}
                >
                  Electronics
                </button>
                <button
                  className={`btn btn-sm ${filter === 'appliances' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setFilter('appliances')}
                >
                  Appliances
                </button>
                <button
                  className={`btn btn-sm ${filter === 'vehicles' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setFilter('vehicles')}
                >
                  Vehicles
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setActiveModal('ocr-scan')}
                >
                  + Add Product / Scan
                </button>
              </div>
            </div>

            {/* Live Stats */}
            <div className="dash-stats-row">
              <div className="d-stat-card">
                <div className="d-stat-label">Total Asset Value</div>
                <div className="d-stat-val">${totalValue.toLocaleString()}</div>
                <div className="d-stat-badge text-primary">Protected by Vault</div>
              </div>
              <div className="d-stat-card">
                <div className="d-stat-label">Active Warranties</div>
                <div className="d-stat-val">{activeCount}</div>
                <div className="d-stat-badge text-success">● In Good Standing</div>
              </div>
              <div className="d-stat-card">
                <div className="d-stat-label">Expiring Soon (30d)</div>
                <div className="d-stat-val">{expiringCount}</div>
                <div className="d-stat-badge text-warning">● Action Recommended</div>
              </div>
              <div className="d-stat-card">
                <div className="d-stat-label">Claim Success Rate</div>
                <div className="d-stat-val">99.4%</div>
                <div className="d-stat-badge text-success">● Zero Denied Claims</div>
              </div>
            </div>

            {/* Interactive Assets Table */}
            <div className="dash-table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Product & Serial</th>
                    <th>Category</th>
                    <th>Purchase Date</th>
                    <th>Warranty Expiry</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id}>
                      <td>
                        <div className="item-main-name">{asset.name}</div>
                        <div className="item-serial-sub">SN: {asset.serial_number}</div>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{asset.category}</td>
                      <td>{asset.purchase_date}</td>
                      <td>{asset.expiry_date}</td>
                      <td>
                        <span className={`status-badge ${asset.status}`}>
                          {asset.status === 'active' && '● Active'}
                          {asset.status === 'expiring' && '▲ Expiring'}
                          {asset.status === 'expired' && '✕ Expired'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            setSelectedInvoice(asset);
                            setActiveModal('invoice-preview');
                          }}
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 9. Why Choose Section ==================== */}
      <section className="why-choose-section">
        <div className="container why-choose-grid">
          <div className="why-choose-visual-wrapper">
            <div className="why-choose-img-wrapper">
              <img
                src="/assets/why-choose.png"
                alt="Woman using smartphone to track warranties"
                className="why-choose-img"
              />
            </div>

            {/* Floating Live Verification Badge */}
            <div className="why-floating-badge animate-float">
              <div className="why-badge-icon">
                <ShieldCheck size={18} color="#2563eb" />
              </div>
              <div>
                <div className="why-badge-title">Bosch Series 8 Washer</div>
                <div className="why-badge-sub">● Under Active Warranty · $0 Repair</div>
              </div>
            </div>
          </div>

          <div className="why-choose-content">
            <h2 className="why-choose-title">Why choose WarrantyWise?</h2>
            <p className="why-choose-sub">
              Stop paying for repairs & replacements when items are still under warranty.
            </p>

            <div className="why-bullet-list">
              <div className="why-bullet-item">
                <div className="why-bullet-icon">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="why-bullet-heading">Zero out repair costs</h3>
                  <p className="why-bullet-desc">Claim free repairs for problems that your warranty covers.</p>
                </div>
              </div>

              <div className="why-bullet-item">
                <div className="why-bullet-icon">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="why-bullet-heading">Get expiration alerts</h3>
                  <p className="why-bullet-desc">Never miss a warranty or return coverage window again.</p>
                </div>
              </div>

              <div className="why-bullet-item">
                <div className="why-bullet-icon">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="why-bullet-heading">Simplify records</h3>
                  <p className="why-bullet-desc">Everything in one place; accessible anytime, anywhere.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 10. Simple, Transparent Pricing Section ==================== */}
      <section className="pricing-section" id="pricing">
        <div className="container text-center">
          <h2 className="section-title">Simple, transparent pricing</h2>
          <p className="section-subtitle">
            Start for free; upgrade when you need more.
          </p>

          <div className="pricing-cards-grid">
            {/* Free Plan */}
            <div className="pricing-card">
              <h3 className="plan-title">Free</h3>
              <div className="plan-price-row">
                <span className="plan-currency">₹</span>
                <span className="plan-amount">0</span>
                <span className="plan-period">/ forever</span>
              </div>
              <ul className="plan-feature-items">
                <li><Check size={18} /> <span>Up to 15 Products</span></li>
                <li><Check size={18} /> <span>Basic Reminders</span></li>
                <li><Check size={18} /> <span>Single-User Access</span></li>
              </ul>
              <Link href="/register" className="btn btn-outline w-100">
                Current Plan
              </Link>
            </div>

            {/* Featured Premium Card (Solid Blue from design mockup) */}
            <div className="pricing-card featured-blue">
              <div className="featured-gold-badge">MOST POPULAR</div>
              <h3 className="plan-title" style={{ color: '#ffffff' }}>Premium</h3>
              <div className="plan-price-row">
                <span className="plan-currency" style={{ color: '#ffffff' }}>₹</span>
                <span className="plan-amount" style={{ color: '#ffffff' }}>99</span>
                <span className="plan-period">/ mo</span>
              </div>
              <ul className="plan-feature-items">
                <li><Check size={18} /> <span>Unlimited Products</span></li>
                <li><Check size={18} /> <span>Smart Auto-Scan</span></li>
                <li><Check size={18} /> <span>Family Sharing (Up to 5)</span></li>
                <li><Check size={18} /> <span>Priority Support</span></li>
              </ul>
              <Link href="/register" className="btn btn-white w-100">
                Start 14-Day Trial
              </Link>
            </div>

            {/* Business Plan */}
            <div className="pricing-card">
              <h3 className="plan-title">Business</h3>
              <div className="plan-price-row">
                <span className="plan-currency">₹</span>
                <span className="plan-amount">999</span>
                <span className="plan-period">/ mo</span>
              </div>
              <ul className="plan-feature-items">
                <li><Check size={18} /> <span>Everything in Premium</span></li>
                <li><Check size={18} /> <span>Multi-Tenancy</span></li>
                <li><Check size={18} /> <span>Advanced Analytics</span></li>
                <li><Check size={18} /> <span>API Access</span></li>
              </ul>
              <Link href="/register" className="btn btn-outline w-100">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 11. Testimonials Section ==================== */}
      <section className="testimonials-section">
        <div className="container text-center">
          <h2 className="section-title">Trusted by thousands</h2>
          <div style={{ height: '32px' }} />

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-quote">
                "This app saved me $450 on a fridge repair because I had my warranty handy. Best management app."
              </p>
              <div>
                <div className="testimonial-author-name">Marcus R.</div>
                <div className="testimonial-author-role">Software Engineer</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-quote">
                "Finally, I don't have to worry about lost or fading receipts. Everything is organized in one place!"
              </p>
              <div>
                <div className="testimonial-author-name">Tina M.</div>
                <div className="testimonial-author-role">Small Business Owner</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-quote">
                "The family sharing feature is brilliant. My wife and I both know when our home appliances expire."
              </p>
              <div>
                <div className="testimonial-author-name">David K.</div>
                <div className="testimonial-author-role">Homeowner</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 12. FAQ Section ==================== */}
      <section className="faq-section" id="faq">
        <div className="container text-center">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div style={{ height: '36px' }} />

          <div className="faq-list-wrapper">
            {[
              {
                q: 'Can I export PDF invoices?',
                a: 'Yes, you can download all original invoice PDFs, proof-of-purchase documents, and claim summary packets at any time with a single click.'
              },
              {
                q: 'How does family sharing work?',
                a: 'On our Premium plan, you can invite up to 5 family members. Everyone can view receipts and check warranty statuses across your household products.'
              },
              {
                q: 'Is my data secure?',
                a: 'Yes. All data and receipts are encrypted with 256-bit AES encryption at rest and TLS in transit. We maintain strict privacy and never share your data.'
              }
            ].map((faq, index) => (
              <div
                key={index}
                className={`faq-card-item ${openFaq === index ? 'open' : ''}`}
              >
                <button
                  className="faq-btn-trigger"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span>{faq.q}</span>
                  <ChevronDown className="faq-chevron" size={18} />
                </button>
                {openFaq === index && (
                  <div className="faq-panel-content">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 13. Final CTA Banner ==================== */}
      <section className="final-cta-section">
        <div className="container">
          <div className="final-cta-blue-card">
            <h2 className="final-cta-title">Start Organizing Your Products Today</h2>
            <p className="final-cta-subtitle">
              Join thousands of smart consumers who never lose a warranty.
            </p>
            <Link href="/register" className="btn btn-white btn-lg">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== 14. Footer ==================== */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top-grid">
            <div className="footer-brand-info">
              <Link href="/" className="brand-logo">
                <ShieldCheck className="brand-logo-icon" />
                <span>WarrantyWise</span>
              </Link>
              <p>
                The easiest way to track and store your warranties, receipts, and product information.
              </p>
              <div className="footer-social-icons">
                <a href="#twitter" className="footer-social-icon" aria-label="Twitter">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#github" className="footer-social-icon" aria-label="GitHub">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="footer-col-title">Product</h4>
              <ul className="footer-col-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#security">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-col-title">Company</h4>
              <ul className="footer-col-links">
                <li><a href="#about">About Us</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-col-title">Resources</h4>
              <ul className="footer-col-links">
                <li><a href="#blog">Blog</a></li>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-bar">
            © 2026 WarrantyWise. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ==================== Modal: AI OCR Receipt Scanner ==================== */}
      {activeModal === 'ocr-scan' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="#2563eb" />
                <h3 className="modal-title">AI OCR Receipt Scanner</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
                Upload an image or PDF invoice. Our AI neural scanner will automatically extract the store, purchase date, price, and warranty duration.
              </p>

              <div className="scanner-dropzone" onClick={handleSimulateScan}>
                {isScanning && <div className="scanner-line" />}
                <Upload size={36} color="#2563eb" style={{ marginBottom: '10px' }} />
                <div style={{ fontWeight: 600, color: '#0f172a' }}>
                  {isScanning ? `Scanning receipt text (${scanningProgress}%)...` : 'Click to Upload Receipt / Invoice'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                  Supports PNG, JPG, PDF up to 25MB
                </div>
              </div>

              {isScanning && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        background: '#2563eb',
                        width: `${scanningProgress}%`,
                        transition: 'width 0.2s linear'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== Modal: Watch Demo Video ==================== */}
      {activeModal === 'demo-video' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">WarrantyWise Platform Walkthrough</h3>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body text-center">
              <div style={{
                background: '#0f172a',
                borderRadius: '12px',
                padding: '48px 24px',
                color: '#ffffff',
                marginBottom: '16px'
              }}>
                <Play size={48} color="#60a5fa" style={{ marginBottom: '12px' }} />
                <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Interactive Video Demo</h4>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  See how fast you can add appliances, categorize warranties, and receive automated expiration warnings.
                </p>
              </div>
              <button className="btn btn-primary" onClick={() => setActiveModal(null)}>
                Explore Live Demo on Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== Modal: Invoice Preview ==================== */}
      {activeModal === 'invoice-preview' && selectedInvoice && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Receipt & Warranty Document</h3>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{selectedInvoice.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Store: {selectedInvoice.store}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Serial: {selectedInvoice.serial_number}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Coverage Valid Until: {selectedInvoice.expiry_date}</div>
              </div>
              <button
                className="btn btn-primary w-100"
                onClick={() => {
                  showToast('📄 Downloaded official warranty proof packet!');
                  setActiveModal(null);
                }}
              >
                Download PDF Proof
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== Toast Notifications ==================== */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
