'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FileText,
  Wrench,
  Users,
  BarChart3,
  Plus,
  Shield,
  Menu,
  X,
  LogOut,
  Sparkles,
  ChevronRight,
  Bell
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Products', href: '/dashboard/products', icon: Package },
    { label: 'Invoices', href: '/dashboard/invoices', icon: FileText },
    { label: 'Service History', href: '/dashboard/service-history', icon: Wrench },
    { label: 'Family Members', href: '/dashboard/family-members', icon: Users },
    { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  ];

  return (
    <div className="dash-app-layout">
      {/* Mobile Top App Bar */}
      <div className="dash-mobile-header">
        <div className="dash-sidebar-brand">
          <div className="dash-brand-icon">
            <Shield size={20} color="#ffffff" />
          </div>
          <div>
            <div className="dash-brand-title">WarrantyWise</div>
            <div className="dash-brand-sub">The Vault</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/dashboard/products/new" className="dash-mobile-add-btn">
            <Plus size={18} />
          </Link>
          <button
            className="dash-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Sidebar"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Backdrop for Mobile Sidebar */}
      {mobileMenuOpen && (
        <div
          className="dash-sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Persistent Sidebar */}
      <aside className={`dash-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <Link href="/" className="dash-sidebar-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="dash-brand-icon">
            <Shield size={22} color="#ffffff" />
          </div>
          <div>
            <div className="dash-brand-title">WarrantyWise</div>
            <div className="dash-brand-sub">The Vault</div>
          </div>
        </Link>

        {/* Prominent "+ Add Product" Button */}
        <div className="dash-sidebar-cta-wrap">
          <Link
            href="/dashboard/products/new"
            className="dash-sidebar-add-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Plus size={18} />
            <span>Add Product</span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="dash-nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`dash-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={19} className="dash-nav-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Info Profile */}
        <div className="dash-sidebar-footer">
          <div className="dash-user-card">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
              alt={user?.name || "User"}
              className="dash-user-avatar"
            />
            <div className="dash-user-meta">
              <div className="dash-user-name">{user?.name || 'Sanyasi Muni'}</div>
              <div className="dash-user-plan">{user?.plan || 'Pro Safe'}</div>
            </div>
            <button
              onClick={handleLogout}
              className="dash-logout-btn"
              title="Sign out"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dash-main-viewport">
        {children}
      </main>
    </div>
  );
}
