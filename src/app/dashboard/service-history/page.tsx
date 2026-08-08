'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Wrench,
  CheckCircle2,
  Calendar,
  Clock,
  Plus,
  ArrowRight,
  Search,
  Download,
  FileText,
  Filter,
  ChevronDown,
  Car,
  Laptop,
  Smartphone,
  Tv,
  Home,
  Check,
  AlertCircle,
  X,
  TrendingUp,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  DollarSign,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useRealtime } from '@/lib/realtime-context';
import { ProductItem } from '@/lib/dashboard-data';

interface FlattenedService {
  id: string;
  productId: string;
  productName: string;
  productBrand: string;
  category: string;
  categoryLabel: string;
  warrantyName: string;
  date: string;
  rawDate: string;
  type: string;
  description: string;
  cost: number;
  completed: boolean;
  status: 'completed' | 'in_progress' | 'scheduled';
  provider: string;
  isCovered: boolean;
}

export default function ServiceHistoryPage() {
  const { products, scheduleService, updateServiceRecord } = useRealtime();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'all' | '6months' | '30days' | '12months'>('6months');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'covered' | 'completed' | 'in_progress' | 'scheduled'>('all');

  // Dropdown open states
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Modal States
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<FlattenedService | null>(null);

  // Log Service Form State
  const [logProductId, setLogProductId] = useState<string>(products[0]?.id || '');
  const [logServiceType, setLogServiceType] = useState('');
  const [logProvider, setLogProvider] = useState('');
  const [logCost, setLogCost] = useState('0');
  const [logStatus, setLogStatus] = useState<'completed' | 'in_progress' | 'scheduled'>('completed');
  const [logIsCovered, setLogIsCovered] = useState(true);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logDescription, setLogDescription] = useState('');

  // Status Modal Form State
  const [newStatus, setNewStatus] = useState<'completed' | 'in_progress' | 'scheduled'>('completed');
  const [newCost, setNewCost] = useState<number>(0);

  // Reschedule Form State
  const [rescheduleDate, setRescheduleDate] = useState('2026-09-15');

  // Flatten all services across all products
  const allServices: FlattenedService[] = useMemo(() => {
    const list: FlattenedService[] = [];
    products.forEach((p) => {
      p.serviceHistory.forEach((s) => {
        const isCov = s.isCovered !== undefined ? s.isCovered : s.cost === 0;
        let st: 'completed' | 'in_progress' | 'scheduled' = 'completed';
        if (s.status) {
          st = s.status;
        } else if (!s.completed) {
          st = 'scheduled';
        }

        list.push({
          id: s.id,
          productId: p.id,
          productName: p.name,
          productBrand: p.brand,
          category: p.category,
          categoryLabel: p.categoryLabel,
          warrantyName: p.warrantyCoverageName,
          date: s.date,
          rawDate: s.date,
          type: s.type,
          description: s.description,
          cost: s.cost,
          completed: s.completed,
          status: st,
          provider: s.provider || (isCov ? `${p.brand} Authorized Service` : 'Certified Service Center'),
          isCovered: isCov,
        });
      });
    });
    return list;
  }, [products]);

  // Derived Metrics for KPI Cards
  const totalServiceSpend = useMemo(() => {
    return allServices.reduce((sum, item) => sum + (item.cost || 0), 0);
  }, [allServices]);

  const totalServiceVisits = allServices.length;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, { label: string; count: number }> = {};
    allServices.forEach((s) => {
      const cat = s.categoryLabel || 'General';
      if (!counts[cat]) {
        counts[cat] = { label: cat, count: 0 };
      }
      counts[cat].count += 1;
    });
    return counts;
  }, [allServices]);

  const mostServicedCategory = useMemo(() => {
    const entries = Object.values(categoryCounts);
    if (entries.length === 0) return { label: 'Vehicles', count: 6 };
    entries.sort((a, b) => b.count - a.count);
    return entries[0];
  }, [categoryCounts]);

  const pendingRequestsCount = useMemo(() => {
    return allServices.filter((s) => s.status === 'in_progress' || s.status === 'scheduled').length;
  }, [allServices]);

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return allServices.filter((item) => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesProduct = item.productName.toLowerCase().includes(q);
        const matchesBrand = item.productBrand.toLowerCase().includes(q);
        const matchesType = item.type.toLowerCase().includes(q);
        const matchesProvider = item.provider.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesProduct && !matchesBrand && !matchesType && !matchesProvider && !matchesDesc) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'all') {
        if (item.category !== categoryFilter && item.categoryLabel.toLowerCase() !== categoryFilter.toLowerCase()) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === 'covered') {
        if (!item.isCovered && item.cost > 0) return false;
      } else if (statusFilter !== 'all') {
        if (item.status !== statusFilter) return false;
      }

      return true;
    });
  }, [allServices, searchQuery, categoryFilter, statusFilter]);

  // Export handlers
  const handleExportCSV = () => {
    const header = 'Date,Product,Brand,Category,Service Type,Provider,Cost,Status,Warranty Covered\n';
    const rows = filteredServices
      .map(
        (s) =>
          `"${s.date}","${s.productName}","${s.productBrand}","${s.categoryLabel}","${s.type}","${s.provider}",${s.cost},"${s.status}","${s.isCovered ? 'Yes' : 'No'}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WarrantyWise_Service_History_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Submit Log Service
  const handleLogServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logProductId || !logServiceType) {
      alert('Please select a product and enter the service type.');
      return;
    }

    const costNum = logIsCovered ? 0 : parseFloat(logCost) || 0;
    const formattedDate = new Date(logDate).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });

    await scheduleService(logProductId, {
      type: logServiceType,
      provider: logProvider || 'Authorized Service Provider',
      cost: costNum,
      date: formattedDate,
      description: logDescription || 'Scheduled service and routine diagnostic inspection.',
      status: logStatus,
      isCovered: logIsCovered,
      completed: logStatus === 'completed'
    });

    setIsLogModalOpen(false);
    // Reset Form
    setLogServiceType('');
    setLogProvider('');
    setLogCost('0');
    setLogDescription('');
  };

  // Submit Update Status
  const handleUpdateStatusSubmit = async () => {
    if (!selectedService) return;
    await updateServiceRecord(selectedService.productId, selectedService.id, {
      status: newStatus,
      cost: newCost,
    });
    setIsStatusModalOpen(false);
    setSelectedService(null);
  };

  // Submit Reschedule
  const handleRescheduleSubmit = async () => {
    if (!selectedService) return;
    const formattedDate = new Date(rescheduleDate).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
    await updateServiceRecord(selectedService.productId, selectedService.id, {
      date: formattedDate,
      status: 'scheduled'
    });
    setIsRescheduleModalOpen(false);
    setSelectedService(null);
  };

  // Format date display for timeline (e.g. OCT 24, 2023)
  const formatTimelineDate = (dateStr: string) => {
    if (!dateStr) return 'RECENT';
    return dateStr.toUpperCase();
  };

  return (
    <div className="sh-container">
      {/* ── TOP HEADER ── */}
      <div className="sh-header-row">
        <div>
          <h1 className="sh-title">Service History & Maintenance</h1>
          <p className="sh-subtitle">
            Track repairs, maintenance costs, and technician feedback across all registered assets.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Box with Guaranteed Centered Icon */}
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
              placeholder="Search services, products..."
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

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            title="Export full service records as CSV"
            style={{
              height: '40px',
              padding: '0 16px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              transition: 'all 0.15s ease'
            }}
          >
            <Download size={14} />
            <span>Export</span>
          </button>

          {/* Log New Service Button */}
          <button
            type="button"
            onClick={() => {
              if (products.length > 0) setLogProductId(products[0].id);
              setIsLogModalOpen(true);
            }}
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
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
          >
            <Wrench size={15} />
            <span>Log New Service</span>
          </button>
        </div>
      </div>

      {/* ── 4 KPI METRIC CARDS ── */}
      <div className="sh-kpi-grid">
        {/* Card 1: Total Service Spend */}
        <div className="sh-kpi-card">
          <div className="sh-kpi-label">Total Service Spend</div>
          <div className="sh-kpi-value">${totalServiceSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="sh-kpi-mini-chart">
            <span className="sh-bar" style={{ height: '35%' }} />
            <span className="sh-bar" style={{ height: '55%' }} />
            <span className="sh-bar" style={{ height: '40%' }} />
            <span className="sh-bar" style={{ height: '90%' }} />
            <span className="sh-bar" style={{ height: '65%' }} />
            <span className="sh-bar sh-bar-active" style={{ height: '100%' }} />
            <span className="sh-bar" style={{ height: '45%' }} />
          </div>
        </div>

        {/* Card 2: Total Service Visits */}
        <div className="sh-kpi-card">
          <div className="sh-kpi-card-header">
            <div className="sh-kpi-label">Total Service Visits</div>
            <div className="sh-kpi-icon-badge">
              <Wrench size={14} color="#64748b" />
            </div>
          </div>
          <div className="sh-kpi-value">{totalServiceVisits}</div>
          <div className="sh-kpi-trend">
            <TrendingUp size={13} />
            <span>+2 this month</span>
          </div>
        </div>

        {/* Card 3: Most Serviced Category */}
        <div className="sh-kpi-card">
          <div className="sh-kpi-label">Most Serviced Category</div>
          <div className="sh-kpi-value">{mostServicedCategory.label}</div>
          <div className="sh-kpi-tag-pill">
            <Car size={14} color="#475569" />
            <span>{mostServicedCategory.count} services</span>
          </div>
        </div>

        {/* Card 4: Pending Requests */}
        <div className="sh-kpi-card sh-kpi-card-accent">
          <div className="sh-kpi-accent-shape" />
          <div className="sh-kpi-label">Pending Requests</div>
          <div className="sh-kpi-value">{pendingRequestsCount}</div>
          <button
            className="sh-kpi-action-link"
            onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
          >
            <span>View action items</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* ── FILTER PILLS BAR ── */}
      <div className="sh-filter-bar">
        {/* Time Range Filter */}
        <div className="sh-filter-dropdown-container">
          <button
            className={`sh-filter-pill ${timeRange !== 'all' ? 'active' : ''}`}
            onClick={() => {
              setTimeDropdownOpen(!timeDropdownOpen);
              setCategoryDropdownOpen(false);
              setStatusDropdownOpen(false);
            }}
          >
            <Calendar size={14} />
            <span>{timeRange === '6months' ? 'Last 6 Months' : timeRange === '30days' ? 'Last 30 Days' : timeRange === '12months' ? 'Last 12 Months' : 'All Time'}</span>
            <ChevronDown size={14} className={`sh-chevron ${timeDropdownOpen ? 'rotate' : ''}`} />
          </button>

          {timeDropdownOpen && (
            <div className="sh-dropdown-menu">
              <button
                className={`sh-dropdown-item ${timeRange === '30days' ? 'selected' : ''}`}
                onClick={() => { setTimeRange('30days'); setTimeDropdownOpen(false); }}
              >
                Last 30 Days
              </button>
              <button
                className={`sh-dropdown-item ${timeRange === '6months' ? 'selected' : ''}`}
                onClick={() => { setTimeRange('6months'); setTimeDropdownOpen(false); }}
              >
                Last 6 Months
              </button>
              <button
                className={`sh-dropdown-item ${timeRange === '12months' ? 'selected' : ''}`}
                onClick={() => { setTimeRange('12months'); setTimeDropdownOpen(false); }}
              >
                Last 12 Months
              </button>
              <button
                className={`sh-dropdown-item ${timeRange === 'all' ? 'selected' : ''}`}
                onClick={() => { setTimeRange('all'); setTimeDropdownOpen(false); }}
              >
                All Time
              </button>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="sh-filter-dropdown-container">
          <button
            className={`sh-filter-pill ${categoryFilter !== 'all' ? 'active' : ''}`}
            onClick={() => {
              setCategoryDropdownOpen(!categoryDropdownOpen);
              setTimeDropdownOpen(false);
              setStatusDropdownOpen(false);
            }}
          >
            <Layers size={14} />
            <span>{categoryFilter === 'all' ? 'All Categories' : categoryFilter}</span>
            <ChevronDown size={14} className={`sh-chevron ${categoryDropdownOpen ? 'rotate' : ''}`} />
          </button>

          {categoryDropdownOpen && (
            <div className="sh-dropdown-menu">
              <button
                className={`sh-dropdown-item ${categoryFilter === 'all' ? 'selected' : ''}`}
                onClick={() => { setCategoryFilter('all'); setCategoryDropdownOpen(false); }}
              >
                All Categories
              </button>
              <button
                className={`sh-dropdown-item ${categoryFilter === 'vehicle' ? 'selected' : ''}`}
                onClick={() => { setCategoryFilter('vehicle'); setCategoryDropdownOpen(false); }}
              >
                Vehicles
              </button>
              <button
                className={`sh-dropdown-item ${categoryFilter === 'computer' ? 'selected' : ''}`}
                onClick={() => { setCategoryFilter('computer'); setCategoryDropdownOpen(false); }}
              >
                Computers & Laptops
              </button>
              <button
                className={`sh-dropdown-item ${categoryFilter === 'mobile' ? 'selected' : ''}`}
                onClick={() => { setCategoryFilter('mobile'); setCategoryDropdownOpen(false); }}
              >
                Mobile Devices
              </button>
              <button
                className={`sh-dropdown-item ${categoryFilter === 'appliances' ? 'selected' : ''}`}
                onClick={() => { setCategoryFilter('appliances'); setCategoryDropdownOpen(false); }}
              >
                Home Appliances
              </button>
              <button
                className={`sh-dropdown-item ${categoryFilter === 'electronics' ? 'selected' : ''}`}
                onClick={() => { setCategoryFilter('electronics'); setCategoryDropdownOpen(false); }}
              >
                Consumer Electronics
              </button>
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="sh-filter-dropdown-container">
          <button
            className={`sh-filter-pill ${statusFilter !== 'all' ? 'active' : ''}`}
            onClick={() => {
              setStatusDropdownOpen(!statusDropdownOpen);
              setTimeDropdownOpen(false);
              setCategoryDropdownOpen(false);
            }}
          >
            <SlidersHorizontal size={14} />
            <span>
              {statusFilter === 'all'
                ? 'Status'
                : statusFilter === 'covered'
                ? 'Covered by Warranty'
                : statusFilter === 'completed'
                ? 'Completed'
                : statusFilter === 'in_progress'
                ? 'In Progress'
                : 'Scheduled'}
            </span>
            <ChevronDown size={14} className={`sh-chevron ${statusDropdownOpen ? 'rotate' : ''}`} />
          </button>

          {statusDropdownOpen && (
            <div className="sh-dropdown-menu">
              <button
                className={`sh-dropdown-item ${statusFilter === 'all' ? 'selected' : ''}`}
                onClick={() => { setStatusFilter('all'); setStatusDropdownOpen(false); }}
              >
                All Statuses
              </button>
              <button
                className={`sh-dropdown-item ${statusFilter === 'covered' ? 'selected' : ''}`}
                onClick={() => { setStatusFilter('covered'); setStatusDropdownOpen(false); }}
              >
                Covered by Warranty
              </button>
              <button
                className={`sh-dropdown-item ${statusFilter === 'completed' ? 'selected' : ''}`}
                onClick={() => { setStatusFilter('completed'); setStatusDropdownOpen(false); }}
              >
                Completed
              </button>
              <button
                className={`sh-dropdown-item ${statusFilter === 'in_progress' ? 'selected' : ''}`}
                onClick={() => { setStatusFilter('in_progress'); setStatusDropdownOpen(false); }}
              >
                In Progress
              </button>
              <button
                className={`sh-dropdown-item ${statusFilter === 'scheduled' ? 'selected' : ''}`}
                onClick={() => { setStatusFilter('scheduled'); setStatusDropdownOpen(false); }}
              >
                Scheduled
              </button>
            </div>
          )}
        </div>

        {/* Active filter reset */}
        {(categoryFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
          <button
            className="sh-clear-filters-btn"
            onClick={() => {
              setCategoryFilter('all');
              setStatusFilter('all');
              setSearchQuery('');
            }}
          >
            <X size={13} />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* ── MAIN TIMELINE SECTION ── */}
      <div className="sh-timeline-wrapper">
        <div className="sh-timeline-line" />

        <div className="sh-timeline-entries">
          {filteredServices.length === 0 ? (
            <div className="sh-empty-state">
              <AlertCircle size={36} color="#94a3b8" />
              <h3>No service records found</h3>
              <p>Try adjusting your search query or filter criteria.</p>
              <button
                className="btn btn-primary"
                style={{ marginTop: '12px' }}
                onClick={() => {
                  setCategoryFilter('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredServices.map((item, index) => {
              const isInProgress = item.status === 'in_progress';
              const isScheduled = item.status === 'scheduled';
              const isCovered = item.isCovered || item.cost === 0;

              return (
                <div
                  key={item.id || index}
                  className={`sh-timeline-row ${isInProgress ? 'is-active-row' : ''}`}
                >
                  {/* Timeline Dot Node */}
                  <div className="sh-timeline-node-container">
                    {isInProgress ? (
                      <div className="sh-timeline-dot sh-dot-progress">
                        <Wrench size={13} color="#ffffff" />
                      </div>
                    ) : isScheduled ? (
                      <div className="sh-timeline-dot sh-dot-scheduled">
                        <div className="sh-dot-inner" />
                      </div>
                    ) : (
                      <div className="sh-timeline-dot sh-dot-completed">
                        <Check size={13} color="#ffffff" strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  {/* Card Container */}
                  <div className={`sh-service-card ${isInProgress ? 'sh-card-highlighted' : ''}`}>
                    {/* Left details */}
                    <div className="sh-card-left">
                      {/* Date / Status Tag */}
                      <div className="sh-card-meta-top">
                        {isInProgress ? (
                          <span className="sh-tag-inprogress-label">IN PROGRESS</span>
                        ) : (
                          <span className="sh-date-label">{formatTimelineDate(item.date)}</span>
                        )}
                      </div>

                      {/* Title: Product Name - Service Type */}
                      <h2 className="sh-service-title">
                        {item.productName} — {item.type}
                      </h2>

                      {/* Subtitle: Store • Service Category / Claim */}
                      <div className="sh-service-provider-line">
                        <span>{item.provider}</span>
                      </div>
                    </div>

                    {/* Right action & badge */}
                    <div className="sh-card-right">
                      {/* Badge / Status Indicator */}
                      <div className="sh-card-status-price-box">
                        {isCovered && !isInProgress && (
                          <span className="sh-badge-covered">COVERED BY WARRANTY</span>
                        )}
                        {!isCovered && !isInProgress && !isScheduled && (
                          <span className="sh-badge-completed">COMPLETED</span>
                        )}
                        {isScheduled && (
                          <span className="sh-badge-scheduled">SCHEDULED</span>
                        )}

                        {/* Price */}
                        <span className="sh-price-value">
                          ${item.cost.toFixed(2)}
                        </span>
                      </div>

                      {/* Action Button */}
                      {isInProgress && (
                        <button
                          className="sh-btn-update-status"
                          onClick={() => {
                            setSelectedService(item);
                            setNewStatus('completed');
                            setNewCost(item.cost);
                            setIsStatusModalOpen(true);
                          }}
                        >
                          Update Status
                        </button>
                      )}

                      {isScheduled && (
                        <button
                          className="sh-btn-reschedule"
                          onClick={() => {
                            setSelectedService(item);
                            setIsRescheduleModalOpen(true);
                          }}
                        >
                          Reschedule
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── MODAL: LOG NEW SERVICE ── */}
      {isLogModalOpen && (
        <div className="sh-modal-backdrop" onClick={() => setIsLogModalOpen(false)}>
          <div
            className="sh-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sh-modal-header">
              <div>
                <h3 className="sh-modal-title">Log New Service Record</h3>
                <p className="sh-modal-subtitle">Track repairs, warranty claims, and scheduled inspections.</p>
              </div>
              <button className="sh-modal-close" onClick={() => setIsLogModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogServiceSubmit} className="sh-modal-form">
              {/* Product Selection */}
              <div className="sh-form-group">
                <label className="sh-form-label">Registered Asset / Product</label>
                <select
                  value={logProductId}
                  onChange={(e) => setLogProductId(e.target.value)}
                  className="sh-form-select"
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.brand}) • {p.categoryLabel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Type & Provider */}
              <div className="sh-form-row">
                <div className="sh-form-group">
                  <label className="sh-form-label">Service / Repair Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Screen Replacement, Battery Check"
                    value={logServiceType}
                    onChange={(e) => setLogServiceType(e.target.value)}
                    className="sh-form-input"
                    required
                  />
                </div>
                <div className="sh-form-group">
                  <label className="sh-form-label">Service Provider / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Apple Store • Warranty Claim"
                    value={logProvider}
                    onChange={(e) => setLogProvider(e.target.value)}
                    className="sh-form-input"
                  />
                </div>
              </div>

              {/* Date & Status */}
              <div className="sh-form-row">
                <div className="sh-form-group">
                  <label className="sh-form-label">Service Date</label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="sh-form-input"
                    required
                  />
                </div>
                <div className="sh-form-group">
                  <label className="sh-form-label">Initial Status</label>
                  <select
                    value={logStatus}
                    onChange={(e) => setLogStatus(e.target.value as any)}
                    className="sh-form-select"
                  >
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              {/* Cost & Covered Checkbox */}
              <div className="sh-form-row" style={{ alignItems: 'flex-end' }}>
                <div className="sh-form-group">
                  <label className="sh-form-label">Service Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={logIsCovered ? '0.00' : logCost}
                    disabled={logIsCovered}
                    onChange={(e) => setLogCost(e.target.value)}
                    className="sh-form-input"
                  />
                </div>
                <div className="sh-form-group" style={{ paddingBottom: '8px' }}>
                  <label className="sh-checkbox-label">
                    <input
                      type="checkbox"
                      checked={logIsCovered}
                      onChange={(e) => setLogIsCovered(e.target.checked)}
                      className="sh-checkbox"
                    />
                    <span>Covered by Warranty ($0.00)</span>
                  </label>
                </div>
              </div>

              {/* Notes / Description */}
              <div className="sh-form-group">
                <label className="sh-form-label">Technician Feedback / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Details regarding repairs, parts replaced, or inspection results..."
                  value={logDescription}
                  onChange={(e) => setLogDescription(e.target.value)}
                  className="sh-form-textarea"
                />
              </div>

              {/* Submit Buttons */}
              <div className="sh-modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsLogModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="sh-btn-primary">
                  Save Service Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: UPDATE STATUS ── */}
      {isStatusModalOpen && selectedService && (
        <div className="sh-modal-backdrop" onClick={() => setIsStatusModalOpen(false)}>
          <div className="sh-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="sh-modal-header">
              <div>
                <h3 className="sh-modal-title">Update Service Status</h3>
                <p className="sh-modal-subtitle">{selectedService.productName} — {selectedService.type}</p>
              </div>
              <button className="sh-modal-close" onClick={() => setIsStatusModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="sh-modal-form" style={{ marginTop: '16px' }}>
              <div className="sh-form-group">
                <label className="sh-form-label">Change Status To</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="sh-form-select"
                >
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              <div className="sh-form-group">
                <label className="sh-form-label">Final Billed Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newCost}
                  onChange={(e) => setNewCost(parseFloat(e.target.value) || 0)}
                  className="sh-form-input"
                />
              </div>

              <div className="sh-modal-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => setIsStatusModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="sh-btn-primary"
                  onClick={handleUpdateStatusSubmit}
                >
                  Apply Status Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: RESCHEDULE ── */}
      {isRescheduleModalOpen && selectedService && (
        <div className="sh-modal-backdrop" onClick={() => setIsRescheduleModalOpen(false)}>
          <div className="sh-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="sh-modal-header">
              <div>
                <h3 className="sh-modal-title">Reschedule Maintenance</h3>
                <p className="sh-modal-subtitle">{selectedService.productName} — {selectedService.type}</p>
              </div>
              <button className="sh-modal-close" onClick={() => setIsRescheduleModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="sh-modal-form" style={{ marginTop: '16px' }}>
              <div className="sh-form-group">
                <label className="sh-form-label">Select New Appointment Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="sh-form-input"
                  required
                />
              </div>

              <div className="sh-modal-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => setIsRescheduleModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="sh-btn-primary"
                  onClick={handleRescheduleSubmit}
                >
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STYLES ── */}
      <style jsx>{`
        .sh-container {
          padding: 28px 36px 60px;
          max-width: 1400px;
          margin: 0 auto;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #0f172a;
        }

        /* Top Header */
        .sh-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }
        .sh-title {
          font-size: 1.85rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.025em;
          margin: 0 0 6px 0;
        }
        .sh-subtitle {
          font-size: 0.95rem;
          color: #64748b;
          margin: 0;
        }

        .sh-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* Search Box */
        .sh-search-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .sh-search-icon {
          position: absolute;
          left: 14px;
          color: #94a3b8;
          pointer-events: none;
        }
        .sh-search-input {
          height: 42px;
          width: 250px;
          padding: 0 34px 0 38px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.88rem;
          color: #0f172a;
          outline: none;
          transition: all 0.2s ease;
        }
        .sh-search-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          width: 280px;
        }
        .sh-search-clear {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        /* Action Buttons */
        .sh-btn-export {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 42px;
          padding: 0 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .sh-btn-export:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .sh-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 42px;
          padding: 0 20px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
          transition: all 0.2s ease;
        }
        .sh-btn-primary:hover {
          background: #1d4ed8;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
          transform: translateY(-1px);
        }

        /* ── 4 KPI METRIC CARDS ── */
        .sh-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }
        .sh-kpi-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 22px 24px;
          position: relative;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 140px;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        .sh-kpi-card:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
          transform: translateY(-2px);
        }
        .sh-kpi-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .sh-kpi-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: #64748b;
        }
        .sh-kpi-value {
          font-size: 1.85rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin: 6px 0 10px 0;
        }
        .sh-kpi-icon-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sh-kpi-trend {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #2563eb;
        }
        .sh-kpi-tag-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #334155;
          width: fit-content;
        }

        /* Mini Bar Histogram */
        .sh-kpi-mini-chart {
          display: flex;
          align-items: flex-end;
          gap: 5px;
          height: 24px;
          margin-top: 4px;
        }
        .sh-bar {
          width: 14px;
          background: #dbeafe;
          border-radius: 2px 2px 0 0;
          transition: height 0.3s ease;
        }
        .sh-bar-active {
          background: #2563eb;
        }

        /* Accent Peach shape on Card 4 */
        .sh-kpi-card-accent {
          position: relative;
        }
        .sh-kpi-accent-shape {
          position: absolute;
          top: 0;
          right: 0;
          width: 90px;
          height: 90px;
          background: radial-gradient(circle at top right, rgba(254, 215, 202, 0.45) 0%, rgba(255, 237, 213, 0.1) 70%, transparent 100%);
          border-top-right-radius: 12px;
          pointer-events: none;
        }
        .sh-kpi-action-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: #d97706;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-top: auto;
          transition: gap 0.2s ease;
        }
        .sh-kpi-action-link:hover {
          color: #b45309;
          gap: 9px;
        }

        /* ── FILTER PILLS BAR ── */
        .sh-filter-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .sh-filter-dropdown-container {
          position: relative;
        }
        .sh-filter-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 38px;
          padding: 0 14px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .sh-filter-pill:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }
        .sh-filter-pill.active {
          border-color: #93c5fd;
          background: #eff6ff;
          color: #1d4ed8;
          font-weight: 600;
        }
        .sh-chevron {
          transition: transform 0.2s ease;
        }
        .sh-chevron.rotate {
          transform: rotate(180deg);
        }

        .sh-dropdown-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          min-width: 190px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          padding: 6px;
          z-index: 50;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .sh-dropdown-item {
          text-align: left;
          padding: 8px 12px;
          font-size: 0.85rem;
          color: #334155;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .sh-dropdown-item:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .sh-dropdown-item.selected {
          background: #eff6ff;
          color: #2563eb;
          font-weight: 600;
        }

        .sh-clear-filters-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 0.82rem;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 6px;
        }
        .sh-clear-filters-btn:hover {
          background: #f1f5f9;
          color: #ef4444;
        }

        /* ── MAIN TIMELINE CONTAINER ── */
        .sh-timeline-wrapper {
          position: relative;
          margin-top: 10px;
        }
        .sh-timeline-line {
          position: absolute;
          top: 36px;
          bottom: 36px;
          left: 13px;
          width: 2px;
          background: #e2e8f0;
          z-index: 1;
        }

        .sh-timeline-entries {
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          z-index: 2;
        }

        .sh-timeline-row {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        /* Node Dot */
        .sh-timeline-node-container {
          flex-shrink: 0;
          width: 28px;
          display: flex;
          justify-content: center;
        }
        .sh-timeline-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 4px #ffffff;
        }
        .sh-dot-completed {
          background: #2563eb;
        }
        .sh-dot-progress {
          background: #2563eb;
          box-shadow: 0 0 0 4px #dbeafe;
        }
        .sh-dot-scheduled {
          background: #ffffff;
          border: 2px solid #cbd5e1;
        }
        .sh-dot-inner {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #94a3b8;
        }

        /* ── SERVICE CARD ── */
        .sh-service-card {
          flex: 1;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
        }
        .sh-service-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }

        /* Highlighted In-Progress Card */
        .sh-card-highlighted {
          border: 2px solid #2563eb !important;
          background: #ffffff;
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.08) !important;
        }

        .sh-card-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sh-card-meta-top {
          margin-bottom: 2px;
        }
        .sh-date-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.05em;
        }
        .sh-tag-inprogress-label {
          font-size: 0.82rem;
          font-weight: 800;
          color: #2563eb;
          letter-spacing: 0.04em;
        }

        .sh-service-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .sh-service-provider-line {
          font-size: 0.85rem;
          color: #64748b;
        }

        /* Right Section */
        .sh-card-right {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-shrink: 0;
        }
        .sh-card-status-price-box {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* Badges */
        .sh-badge-covered {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          background: #ecfdf5;
          color: #059669;
          font-size: 0.72rem;
          font-weight: 700;
          border-radius: 9999px;
          letter-spacing: 0.04em;
        }
        .sh-badge-completed {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 0.72rem;
          font-weight: 700;
          border-radius: 9999px;
          letter-spacing: 0.04em;
        }
        .sh-badge-scheduled {
          display: inline-flex;
          align-items: center;
          padding: 3px 12px;
          border: 1px solid #cbd5e1;
          color: #64748b;
          font-size: 0.72rem;
          font-weight: 700;
          border-radius: 9999px;
          letter-spacing: 0.04em;
        }

        .sh-price-value {
          font-size: 1.05rem;
          font-weight: 600;
          color: #0f172a;
          min-width: 60px;
          text-align: right;
        }

        /* Buttons inside cards */
        .sh-btn-update-status {
          height: 38px;
          padding: 0 18px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 7px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
          transition: all 0.2s ease;
        }
        .sh-btn-update-status:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .sh-btn-reschedule {
          height: 38px;
          padding: 0 18px;
          background: transparent;
          color: #2563eb;
          border: 1.5px solid #2563eb;
          border-radius: 7px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .sh-btn-reschedule:hover {
          background: #eff6ff;
        }

        /* Empty State */
        .sh-empty-state {
          padding: 60px 20px;
          text-align: center;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-left: 48px;
        }
        .sh-empty-state h3 {
          font-size: 1.15rem;
          font-weight: 600;
          margin: 12px 0 4px 0;
          color: #1e293b;
        }
        .sh-empty-state p {
          color: #64748b;
          font-size: 0.9rem;
          margin: 0;
        }

        /* ── MODALS ── */
        .sh-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          padding: 20px;
        }
        .sh-modal-box {
          background: #ffffff;
          border-radius: 14px;
          width: 100%;
          max-width: 520px;
          padding: 24px 28px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          animation: modalSlideUp 0.2s ease-out;
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .sh-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .sh-modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px 0;
        }
        .sh-modal-subtitle {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
        }
        .sh-modal-close {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
        }
        .sh-modal-close:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .sh-modal-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .sh-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .sh-form-row {
          display: flex;
          gap: 14px;
        }
        .sh-form-label {
          font-size: 0.84rem;
          font-weight: 600;
          color: #334155;
        }
        .sh-form-input, .sh-form-select, .sh-form-textarea {
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.88rem;
          color: #0f172a;
          outline: none;
          background: #ffffff;
          transition: all 0.15s ease;
        }
        .sh-form-input:focus, .sh-form-select:focus, .sh-form-textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .sh-checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #334155;
          cursor: pointer;
          user-select: none;
        }
        .sh-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #2563eb;
          cursor: pointer;
        }

        .sh-modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 10px;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1100px) {
          .sh-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .sh-container {
            padding: 20px 16px 40px;
          }
          .sh-header-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .sh-header-right {
            width: 100%;
          }
          .sh-search-input {
            width: 100%;
          }
          .sh-kpi-grid {
            grid-template-columns: 1fr;
          }
          .sh-service-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }
          .sh-card-right {
            width: 100%;
            justify-content: space-between;
          }
          .sh-form-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
