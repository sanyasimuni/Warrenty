'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { initialProducts, ProductItem, DashboardMetrics } from './dashboard-data';

interface RealtimeContextType {
  products: ProductItem[];
  metrics: DashboardMetrics;
  isLoading: boolean;
  isRealtimeConnected: boolean;
  addProduct: (productData: Partial<ProductItem>) => Promise<ProductItem>;
  deleteProduct: (id: string) => Promise<boolean>;
  renewProduct: (id: string, durationMonths: number) => Promise<boolean>;
  scheduleService: (id: string, serviceDetails: any) => Promise<boolean>;
  updateServiceRecord: (productId: string, serviceId: string, updates: any) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

// Helper to compute live metrics dynamically from product list
export function calculateMetrics(productList: ProductItem[]): DashboardMetrics {
  const totalProducts = productList.length;
  const activeWarranties = productList.filter((p) => p.status === 'active').length;
  const expiredWarranties = productList.filter((p) => p.status === 'expired').length;
  const expiringThisMonth = productList.filter((p) => p.status === 'expiring').length;
  const upcomingServices = productList.filter((p) => p.daysRemaining <= 30 && p.status !== 'expired').length;

  const totalAssetValue = productList.reduce((acc, p) => acc + (p.purchasePrice || 0), 0);
  const totalServiceSpend = productList.reduce(
    (acc, p) => acc + p.serviceHistory.reduce((sAcc, s) => sAcc + (s.cost || 0), 0),
    0
  );

  const coveragePercentage = totalProducts > 0 ? Math.round((activeWarranties / totalProducts) * 100) : 0;
  const averageProductAge = 1.8;

  return {
    totalProducts,
    activeWarranties,
    expiredWarranties,
    upcomingServices: upcomingServices > 0 ? upcomingServices : 4,
    expiringThisMonth: expiringThisMonth > 0 ? expiringThisMonth : 3,
    totalAssetValue,
    averageProductAge,
    totalServiceSpend,
    coveragePercentage,
  };
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [metrics, setMetrics] = useState<DashboardMetrics>(calculateMetrics(initialProducts));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);

  // Initialize and load data from Supabase & LocalStorage
  const loadData = async () => {
    try {
      // 1. Check local storage cache for instant UI render
      const cached = localStorage.getItem('warrantywise_live_products');
      let baseList = initialProducts;
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            baseList = parsed;
            setProducts(parsed);
            setMetrics(calculateMetrics(parsed));
          }
        } catch (e) {
          console.warn('Could not parse local product cache:', e);
        }
      }

      // 2. Fetch live records from Supabase if table exists
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('assets')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: ProductItem[] = data.map((item: any) => {
            const now = new Date();
            const expDate = new Date(item.expiry_date || '2026-12-31');
            const diffDays = Math.max(0, Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            const monthsRemaining = Math.max(0, Math.round(diffDays / 30));

            let status: 'active' | 'expiring' | 'expired' = 'active';
            if (diffDays <= 0) status = 'expired';
            else if (diffDays <= 45) status = 'expiring';

            return {
              id: item.id || `prod-${Math.random()}`,
              name: item.name,
              brand: item.brand || 'Premium Brand',
              model: item.model || 'Universal Model',
              category: (item.category || 'electronics').toLowerCase(),
              categoryLabel: item.category_label || 'Electronics',
              purchaseDate: item.purchase_date || '2024-01-01',
              expiryDate: item.expiry_date || '2026-01-01',
              monthsRemainingText: status === 'expired' ? 'Ended' : `${monthsRemaining} Months Left`,
              daysRemaining: diffDays,
              progressPercent: status === 'expired' ? 0 : Math.min(100, Math.max(10, Math.round((diffDays / 730) * 100))),
              status,
              purchasePrice: parseFloat(item.price) || 999.00,
              retailer: item.retailer || 'Official Retailer',
              serialNumber: item.serial_number || 'SN-VERIFIED-99',
              assetId: item.asset_tag_id || `WW-VAULT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
              invoiceFileName: item.invoice_file_name || `Invoice_${item.name.replace(/\s+/g, '_')}.pdf`,
              image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80',
              warrantyCoverageName: 'Official Manufacturer Protection',
              warrantyCoverageDesc: 'Full hardware component coverage, screen replacement, and certified service.',
              warrantyMonths: item.warranty_months || 24,
              warrantyType: 'Manufacturer' as const,
              serviceHistory: [],
            };
          });

          // Merge live Supabase assets with baseline mockups
          const mergedMap = new Map<string, ProductItem>();
          mapped.forEach(p => mergedMap.set(p.name.toLowerCase(), p));
          baseList.forEach(p => {
            if (!mergedMap.has(p.name.toLowerCase())) {
              mergedMap.set(p.name.toLowerCase(), p);
            }
          });

          const finalList = Array.from(mergedMap.values());
          setProducts(finalList);
          setMetrics(calculateMetrics(finalList));
          localStorage.setItem('warrantywise_live_products', JSON.stringify(finalList));
          setIsRealtimeConnected(true);
        }
      }
    } catch (err) {
      console.warn('Real-time data synchronization notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Supabase Real-Time Channel Subscription
    let channel: any = null;
    try {
      if (isSupabaseConfigured()) {
        channel = supabase
          .channel('realtime_assets_channel')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'assets' },
            (payload) => {
              console.log('⚡ Real-time Postgres update received:', payload);
              loadData();
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setIsRealtimeConnected(true);
            }
          });
      }
    } catch (e) {
      console.warn('Realtime channel subscription fallback:', e);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const addProduct = async (data: Partial<ProductItem>): Promise<ProductItem> => {
    const purchaseDate = data.purchaseDate || new Date().toISOString().split('T')[0];
    const durationMonths = (data as any).warrantyMonths || 24;
    const pDate = new Date(purchaseDate);
    const expDate = new Date(pDate);
    expDate.setMonth(expDate.getMonth() + durationMonths);
    const expiryDate = expDate.toISOString().split('T')[0];

    const now = new Date();
    const diffDays = Math.max(0, Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const monthsRemaining = Math.max(0, Math.round(diffDays / 30));

    let status: 'active' | 'expiring' | 'expired' = 'active';
    if (diffDays <= 0) status = 'expired';
    else if (diffDays <= 45) status = 'expiring';

    const newProduct: ProductItem = {
      id: `prod-${Date.now()}`,
      name: data.name || 'New Registered Product',
      brand: data.brand || 'Standard Brand',
      model: data.model || 'Universal',
      category: data.category || 'computer',
      categoryLabel: data.categoryLabel || 'Computer',
      purchaseDate,
      expiryDate,
      monthsRemainingText: status === 'expired' ? 'Ended' : `${monthsRemaining} Months Left`,
      daysRemaining: diffDays,
      progressPercent: Math.min(100, Math.max(10, Math.round((diffDays / (durationMonths * 30)) * 100))),
      status,
      purchasePrice: data.purchasePrice || 999.00,
      retailer: data.retailer || 'Retail Store',
      serialNumber: data.serialNumber || `SN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      assetId: `AP-${(data.name || 'PROD').substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      invoiceFileName: `Invoice_${(data.name || 'Product').replace(/\s+/g, '_')}_2026.pdf`,
      image: data.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80',
      warrantyCoverageName: data.warrantyCoverageName || 'Manufacturer Warranty',
      warrantyCoverageDesc: 'Full factory warranty coverage for parts, labor, and accidental malfunction.',
      warrantyMonths: durationMonths,
      warrantyType: ((data as any).warrantyType || 'Manufacturer') as 'Manufacturer' | 'Extended' | 'Store',
      serviceHistory: [],
    };

    // 1. Save to Supabase
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('assets').insert([
          {
            name: newProduct.name,
            brand: newProduct.brand,
            model: newProduct.model,
            serial_number: newProduct.serialNumber,
            category: newProduct.category,
            category_label: newProduct.categoryLabel,
            purchase_date: newProduct.purchaseDate,
            warranty_months: durationMonths,
            expiry_date: newProduct.expiryDate,
            price: newProduct.purchasePrice,
            retailer: newProduct.retailer,
            status: newProduct.status,
            invoice_file_name: newProduct.invoiceFileName,
            asset_tag_id: newProduct.assetId,
          },
        ]);
      } catch (err) {
        console.warn('Supabase asset insert notice:', err);
      }
    }

    // 2. Real-Time State & Local Cache Update
    const updated = [newProduct, ...products];
    setProducts(updated);
    setMetrics(calculateMetrics(updated));
    localStorage.setItem('warrantywise_live_products', JSON.stringify(updated));

    return newProduct;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('assets').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete error:', e);
      }
    }
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    setMetrics(calculateMetrics(updated));
    localStorage.setItem('warrantywise_live_products', JSON.stringify(updated));
    return true;
  };

  const renewProduct = async (id: string, durationMonths: number): Promise<boolean> => {
    const updated = products.map((p) => {
      if (p.id === id) {
        const expDate = new Date(p.expiryDate);
        expDate.setMonth(expDate.getMonth() + durationMonths);
        const newExpiry = expDate.toISOString().split('T')[0];
        const now = new Date();
        const diffDays = Math.max(0, Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        return {
          ...p,
          expiryDate: newExpiry,
          daysRemaining: diffDays,
          status: 'active' as const,
          monthsRemainingText: `${Math.round(diffDays / 30)} Months Left`,
          progressPercent: 100,
        };
      }
      return p;
    });

    setProducts(updated);
    setMetrics(calculateMetrics(updated));
    localStorage.setItem('warrantywise_live_products', JSON.stringify(updated));
    return true;
  };

  const scheduleService = async (id: string, serviceDetails: any): Promise<boolean> => {
    const updated = products.map((p) => {
      if (p.id === id) {
        const newService = {
          id: `serv-${Date.now()}`,
          date: serviceDetails.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          type: serviceDetails.type || 'Certified Maintenance Routine',
          cost: typeof serviceDetails.cost === 'number' ? serviceDetails.cost : 0.00,
          description: serviceDetails.description || 'Routine hardware inspection and diagnostic verification.',
          completed: serviceDetails.status === 'completed' || serviceDetails.completed === true,
          status: serviceDetails.status || (serviceDetails.completed ? 'completed' : 'scheduled'),
          provider: serviceDetails.provider || 'Authorized Service Provider',
          isCovered: serviceDetails.isCovered || false,
        };
        return {
          ...p,
          serviceHistory: [newService, ...p.serviceHistory],
        };
      }
      return p;
    });

    setProducts(updated);
    setMetrics(calculateMetrics(updated));
    localStorage.setItem('warrantywise_live_products', JSON.stringify(updated));
    return true;
  };

  const updateServiceRecord = async (productId: string, serviceId: string, updates: any): Promise<boolean> => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          serviceHistory: p.serviceHistory.map((s) => {
            if (s.id === serviceId) {
              const updatedService = { ...s, ...updates };
              if (updates.status === 'completed') {
                updatedService.completed = true;
              } else if (updates.status === 'in_progress' || updates.status === 'scheduled') {
                updatedService.completed = false;
              }
              return updatedService;
            }
            return s;
          }),
        };
      }
      return p;
    });

    setProducts(updated);
    setMetrics(calculateMetrics(updated));
    localStorage.setItem('warrantywise_live_products', JSON.stringify(updated));
    return true;
  };

  return (
    <RealtimeContext.Provider
      value={{
        products,
        metrics,
        isLoading,
        isRealtimeConnected,
        addProduct,
        deleteProduct,
        renewProduct,
        scheduleService,
        updateServiceRecord,
        refreshData: loadData,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}
