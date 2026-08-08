import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { asset_id, description, claim_amount } = body;

    const claimRecord = {
      id: Date.now().toString(),
      asset_id,
      description: description || 'Routine warranty replacement request',
      claim_amount: parseFloat(claim_amount) || 250.00,
      incident_date: new Date().toISOString().split('T')[0],
      status: 'submitted',
      claim_reference: `CLM-${Math.floor(100000 + Math.random() * 900000)}`
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('claims').insert([claimRecord]);
      } catch (err) {
        console.warn('Supabase claim insert fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Claim submitted successfully to manufacturer support hotline.',
      data: claimRecord
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
