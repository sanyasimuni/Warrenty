'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Monitor,
  ShoppingCart,
  ShieldCheck,
  UploadCloud,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useRealtime } from '@/lib/realtime-context';

export default function AddNewProductPage() {
  const router = useRouter();
  const { addProduct } = useRealtime();

  // Form State
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('computer');
  const [brand, setBrand] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('2026-08-08');
  const [purchasePrice, setPurchasePrice] = useState('1499.00');
  const [retailer, setRetailer] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState(24);
  const [warrantyType, setWarrantyType] = useState<'Manufacturer' | 'Extended' | 'Store'>('Manufacturer');
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSimulateOCR = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setProductName('Dell XPS 15 OLED Laptop');
      setBrand('Dell');
      setModelNumber('XPS-9530-OLED');
      setSerialNumber('DL-9938210-X');
      setPurchaseDate('2026-08-01');
      setPurchasePrice('1899.00');
      setRetailer('Best Buy Electronics');
      setUploadSuccess(true);
    }, 1200);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName) {
      alert('Please enter a product name.');
      return;
    }

    setIsSaving(true);
    try {
      const categoryLabels: Record<string, string> = {
        electronics: 'Electronics',
        furniture: 'Furniture',
        kitchen: 'Kitchen',
        vehicle: 'Vehicle',
        computer: 'Computer',
        appliances: 'Home Appliance',
        mobile: 'Mobile Device',
      };

      await addProduct({
        name: productName,
        brand: brand || 'Generic Brand',
        model: modelNumber || 'Standard Model',
        serialNumber: serialNumber || `SN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        category: category as any,
        categoryLabel: categoryLabels[category] || 'General Product',
        purchaseDate,
        purchasePrice: parseFloat(purchasePrice) || 0,
        retailer: retailer || 'Official Store',
        warrantyCoverageName: `${warrantyType} Warranty`,
        // @ts-ignore
        warrantyMonths,
      });

      setIsSaving(false);
      router.push('/dashboard/products');
    } catch (err) {
      setIsSaving(false);
      router.push('/dashboard/products');
    }
  };

  return (
    <div className="dash-view-container dash-form-container">
      {/* Breadcrumb Navigation */}
      <div className="dash-breadcrumb-bar">
        <Link href="/dashboard/products" className="breadcrumb-link">
          Products
        </Link>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <span className="breadcrumb-active">Add New Product</span>
      </div>

      {/* Page Title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="dash-page-title">Add New Product</h1>
        <p className="dash-page-subtitle">
          Securely store product details, warranties, and invoices in your vault.
        </p>
      </div>

      <form onSubmit={handleSave} className="dash-form-wrapper">
        {/* Section 1: Basic Information */}
        <div className="dash-card form-section-card">
          <div className="form-section-header">
            <div className="section-step-icon">
              <Monitor size={18} />
            </div>
            <div>
              <h2 className="form-section-title">Basic Information</h2>
              <p className="form-section-subtitle">
                Enter model, brand, and device identification tags.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label" htmlFor="prod-name">
                Product Name *
              </label>
              <input
                id="prod-name"
                type="text"
                required
                placeholder="e.g. MacBook Pro 16-inch M3 Max"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                <option value="computer">Computer & Laptops</option>
                <option value="electronics">Electronics & Audio</option>
                <option value="appliances">Home Appliance</option>
                <option value="mobile">Smartphones & Tablets</option>
                <option value="kitchen">Kitchen Appliances</option>
                <option value="furniture">Furniture</option>
                <option value="vehicle">Vehicle & Transport</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Brand / Manufacturer</label>
              <input
                type="text"
                placeholder="e.g. Apple, Sony, Dyson"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Model Number</label>
              <input
                type="text"
                placeholder="e.g. A2991 / WH-1000XM5"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Serial Number / IMEI</label>
              <input
                type="text"
                placeholder="e.g. C02G89A1MD6R"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="form-input font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Purchase Details */}
        <div className="dash-card form-section-card">
          <div className="form-section-header">
            <div className="section-step-icon">
              <ShoppingCart size={18} />
            </div>
            <div>
              <h2 className="form-section-title">Purchase Details</h2>
              <p className="form-section-subtitle">
                Keep track of proof of purchase and valuation.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Purchase Date *</label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Purchase Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                placeholder="1499.00"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Retailer / Store Name</label>
              <input
                type="text"
                placeholder="e.g. Apple Store 5th Avenue, Amazon, Best Buy"
                value={retailer}
                onChange={(e) => setRetailer(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Warranty Protection */}
        <div className="dash-card form-section-card">
          <div className="form-section-header">
            <div className="section-step-icon">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="form-section-title">Warranty Protection</h2>
              <p className="form-section-subtitle">
                Set duration terms and upload proof of purchase.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Warranty Duration (Months)</label>
              <select
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                className="form-select"
              >
                <option value={12}>12 Months (1 Year)</option>
                <option value={24}>24 Months (2 Years)</option>
                <option value={36}>36 Months (3 Years)</option>
                <option value={60}>60 Months (5 Years)</option>
                <option value={120}>120 Months (10 Years)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Coverage Type</label>
              <select
                value={warrantyType}
                onChange={(e) => setWarrantyType(e.target.value as any)}
                className="form-select"
              >
                <option value="Manufacturer">Manufacturer Original Warranty</option>
                <option value="Extended">Extended Care / AppleCare+ / Protection Plan</option>
                <option value="Store">Store / Retailer Policy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="form-actions-bar">
          <Link href="/dashboard/products" className="btn btn-outline">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary"
            style={{ minWidth: '180px' }}
          >
            {isSaving ? 'Saving to Vault...' : 'Save Product & Add to Vault'}
          </button>
        </div>
      </form>
    </div>
  );
}
