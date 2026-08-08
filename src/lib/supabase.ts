import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Asset {
  id: string | number;
  name: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  category: 'electronics' | 'appliances' | 'vehicles' | 'gadgets' | 'furniture' | 'kitchen' | 'computer' | 'mobile' | 'other';
  category_label?: string;
  purchase_date: string;
  warranty_months?: number;
  expiry_date: string;
  price: number;
  retailer?: string;
  store?: string;
  icon?: string;
  status: 'active' | 'expiring' | 'expired';
  days_left?: number;
  invoice_url?: string;
  notes?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Claim {
  id: string | number;
  asset_id: string | number;
  claim_amount: number;
  incident_date: string;
  description: string;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'settled';
  created_at?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    !supabaseUrl.includes('placeholder') &&
    Boolean(supabaseAnonKey) &&
    !supabaseAnonKey.includes('placeholder')
  );
};

// Standard Public Client (Frontend / Browser / Client components)
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://ogjyhzkgvvsscyapybal.supabase.co',
  supabaseAnonKey || 'sb_publishable_1-jqkPjnZ2wLS_7xqDmbBg_onupn-NI',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Server-side / Admin Client (API Routes with Elevated Privileges)
export const getServiceSupabase = (): SupabaseClient => {
  const key = supabaseServiceKey || supabaseAnonKey;
  return createClient(
    supabaseUrl || 'https://ogjyhzkgvvsscyapybal.supabase.co',
    key,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
};
