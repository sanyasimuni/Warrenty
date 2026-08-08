-- ==============================================================================
-- WarrantyWise Supabase Database Schema & Tables
-- Project: ogjyhzkgvvsscyapybal (ap-southeast-1)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Assets Table (Products, Warranties, Devices)
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    category TEXT NOT NULL DEFAULT 'electronics',
    category_label TEXT,
    purchase_date DATE NOT NULL,
    warranty_months INTEGER DEFAULT 12,
    expiry_date DATE NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0.00,
    retailer TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expiring', 'expired')),
    invoice_url TEXT,
    invoice_file_name TEXT,
    asset_tag_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing for fast search & filtering
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_category ON public.assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_expiry_date ON public.assets(expiry_date);

-- 3. Claims & Repair Tickets Table
CREATE TABLE IF NOT EXISTS public.claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    claim_amount NUMERIC(10, 2) DEFAULT 0.00,
    incident_date DATE NOT NULL,
    service_center TEXT,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'settled', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Service History & Maintenance Logs Table
CREATE TABLE IF NOT EXISTS public.service_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    service_type TEXT NOT NULL,
    cost NUMERIC(10, 2) DEFAULT 0.00,
    provider TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Invoices & Proof of Purchase Vault Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type TEXT DEFAULT 'application/pdf',
    total_amount NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Household & Family Member Access
CREATE TABLE IF NOT EXISTS public.household_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    member_email TEXT NOT NULL,
    member_name TEXT,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

-- 8. Sample RLS Policies (Users can manage their own data)
CREATE POLICY "Users can manage own assets"
ON public.assets
FOR ALL
USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can manage own claims"
ON public.claims
FOR ALL
USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 9. Insert Sample Baseline Assets (Optional Seed)
INSERT INTO public.assets (name, brand, model, serial_number, category, category_label, purchase_date, warranty_months, expiry_date, price, retailer, status)
VALUES 
('MacBook Pro 16" M3 Max', 'Apple', 'A2991', 'C02G89A1MD6R', 'computer', 'Computer', '2023-11-12', 24, '2025-11-11', 2499.00, 'Apple Store, 5th Avenue', 'active'),
('Samsung 65" Neo QLED 4K Smart TV', 'Samsung', 'QN65QN90C', 'QN65-882194B', 'electronics', 'Electronics', '2024-02-15', 36, '2027-02-15', 1799.00, 'Best Buy', 'active'),
('Dyson V15 Detect Cordless Vacuum', 'Dyson', 'V15-Absolute', 'DY-V15-99210', 'appliances', 'Home Appliance', '2023-09-10', 24, '2025-09-10', 749.00, 'Target', 'expiring')
ON CONFLICT DO NOTHING;
