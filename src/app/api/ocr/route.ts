import { NextResponse } from 'next/server';

const sampleProducts = [
  {
    name: 'DJI Mini 4 Pro Drone (Fly More Combo)',
    category: 'Electronics',
    warranty_months: 24,
    price: 1099,
    store: 'Amazon Prime',
    confidence: 0.99
  },
  {
    name: 'DeLonghi Magnifica S Espresso Machine',
    category: 'Appliances',
    warranty_months: 36,
    price: 649,
    store: 'Target Home',
    confidence: 0.98
  },
  {
    name: 'iPad Pro 13" M4 OLED 512GB',
    category: 'Electronics',
    warranty_months: 24,
    price: 1499,
    store: 'Apple Store Fifth Ave',
    confidence: 0.99
  }
];

export async function GET() {
  const randomItem = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
  const today = new Date().toISOString().split('T')[0];

  return NextResponse.json({
    success: true,
    data: {
      ...randomItem,
      purchase_date: today,
      serial_number: `SN: ${Math.random().toString(36).substring(2, 9).toUpperCase()}-OCR`
    }
  });
}

export async function POST() {
  const randomItem = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
  const today = new Date().toISOString().split('T')[0];

  return NextResponse.json({
    success: true,
    data: {
      ...randomItem,
      purchase_date: today,
      serial_number: `SN: ${Math.random().toString(36).substring(2, 9).toUpperCase()}-OCR`
    }
  });
}
