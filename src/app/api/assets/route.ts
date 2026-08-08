import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, Asset } from '@/lib/supabase';

// In-memory seeded store fallback when running without live Supabase credentials
let memoryAssets: Asset[] = [
  {
    id: '1',
    name: 'Apple MacBook Pro M3',
    serial_number: 'SN: C02XG8H7MD6R',
    category: 'electronics',
    category_label: 'Electronics',
    purchase_date: '2025-11-15',
    warranty_months: 24,
    expiry_date: '2027-11-15',
    days_left: 464,
    status: 'active',
    price: 2499,
    icon: '💻'
  },
  {
    id: '2',
    name: 'Sony WH-1000XM5 Headphones',
    serial_number: 'SN: S01-8392019-B',
    category: 'electronics',
    category_label: 'Electronics',
    purchase_date: '2024-08-22',
    warranty_months: 24,
    expiry_date: '2026-08-22',
    days_left: 14,
    status: 'expiring',
    price: 399,
    icon: '🎧'
  },
  {
    id: '3',
    name: 'Samsung 65" Neo QLED 4K TV',
    serial_number: 'SN: QN65QN90B-220',
    category: 'electronics',
    category_label: 'Electronics',
    purchase_date: '2024-01-10',
    warranty_months: 36,
    expiry_date: '2027-01-10',
    days_left: 520,
    status: 'active',
    price: 1899,
    icon: '📺'
  },
  {
    id: '4',
    name: 'Bosch Series 8 Built-in Dishwasher',
    serial_number: 'SN: SMV8YCX01G/01',
    category: 'appliances',
    category_label: 'Appliances',
    purchase_date: '2023-05-18',
    warranty_months: 24,
    expiry_date: '2025-05-18',
    days_left: 0,
    status: 'expired',
    price: 1150,
    icon: '🍽️'
  },
  {
    id: '5',
    name: 'Dyson V15 Detect Vacuum',
    serial_number: 'SN: SV22-US-NKA4928',
    category: 'appliances',
    category_label: 'Appliances',
    purchase_date: '2025-03-12',
    warranty_months: 24,
    expiry_date: '2027-03-12',
    days_left: 216,
    status: 'active',
    price: 749,
    icon: '🧹'
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('assets').select('*').order('created_at', { ascending: false });
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, source: 'supabase', data });
      }
    } catch (err) {
      console.warn('Supabase fetch fallback to memory store:', err);
    }
  }

  const results = category && category !== 'all' 
    ? memoryAssets.filter(item => item.category === category)
    : memoryAssets;

  return NextResponse.json({
    success: true,
    source: 'local_database',
    isSupabaseConnected: isSupabaseConfigured(),
    data: results
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, purchase_date, warranty_months, price } = body;

    if (!name || !purchase_date) {
      return NextResponse.json({ success: false, error: 'Name and purchase date are required' }, { status: 400 });
    }

    const months = parseInt(warranty_months, 10) || 24;
    const pDate = new Date(purchase_date);
    const expDate = new Date(pDate);
    expDate.setMonth(expDate.getMonth() + months);
    const expiry_date = expDate.toISOString().split('T')[0];

    const now = new Date();
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let status: 'active' | 'expiring' | 'expired' = 'active';
    if (diffDays <= 0) {
      status = 'expired';
    } else if (diffDays <= 30) {
      status = 'expiring';
    }

    let icon = '📦';
    const catLower = (category || 'electronics').toLowerCase();
    if (catLower === 'electronics') icon = '⚡';
    if (catLower === 'appliances') icon = '🏠';
    if (catLower === 'vehicles') icon = '🚗';
    if (catLower === 'gadgets') icon = '📱';

    const newAsset: Asset = {
      id: Date.now().toString(),
      name,
      serial_number: `SN: ${Math.random().toString(36).substring(2, 9).toUpperCase()}-OCR`,
      category: catLower as any,
      category_label: category || 'Electronics',
      purchase_date,
      warranty_months: months,
      expiry_date,
      days_left: diffDays,
      status,
      price: parseFloat(price) || 0,
      icon
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('assets').insert([newAsset]).select().single();
        if (!error && data) {
          return NextResponse.json({ success: true, source: 'supabase', data });
        }
      } catch (err) {
        console.warn('Supabase insert failed, saving to local store:', err);
      }
    }

    memoryAssets.unshift(newAsset);

    return NextResponse.json({
      success: true,
      source: 'local_database',
      isSupabaseConnected: isSupabaseConfigured(),
      data: newAsset
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
