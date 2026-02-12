-- =========================================================
-- CRITICAL REPAIR SCRIPT: RUN THIS IN SUPABASE SQL EDITOR
-- =========================================================

-- 1. Ensure the extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the table if it truly doesn't exist
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    tin TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Local',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FORCE-ADD ALL MISSING COLUMNS
-- This handles cases where the table exists but is missing specific fields
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS phone_office TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS phone_contact TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS phone_alternate TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS email_office TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS email_contact TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS email_alternate TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS tax_name TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS tax_bin TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS tax_address TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address_street TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address_city TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address_country TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address_postal TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS pay_acc_name TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS pay_acc_number TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS pay_bank_name TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS pay_branch_name TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS pay_routing_number TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS pay_swift_number TEXT;

-- 4. THE ULTIMATE FIX: FORCE CACHE RELOAD
-- This tells Supabase/PostgREST to clear its internal schema cache immediately.
NOTIFY pgrst, 'reload schema';

-- =========================================================
-- REMAINDER OF THE FULL SCHEMA
-- =========================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    username TEXT UNIQUE,
    role TEXT DEFAULT 'USER',
    status TEXT DEFAULT 'Active',
    last_login TIMESTAMP WITH TIME ZONE,
    granular_permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    sku TEXT,
    name TEXT NOT NULL,
    uom TEXT,
    location TEXT,
    type TEXT,
    group_name TEXT,
    last_price DECIMAL DEFAULT 0,
    avg_price DECIMAL DEFAULT 0,
    safety_stock INTEGER DEFAULT 0,
    on_hand_stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requisitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pr_no TEXT UNIQUE NOT NULL,
    reference TEXT,
    type TEXT,
    status TEXT DEFAULT 'Pending',
    req_by_name TEXT,
    contact TEXT,
    email TEXT,
    reqDpt TEXT,
    note TEXT,
    total_value DECIMAL DEFAULT 0,
    items JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    justification JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_no TEXT UNIQUE NOT NULL,
    type TEXT,
    supplier_id UUID REFERENCES suppliers(id),
    supplier_name TEXT,
    currency TEXT DEFAULT 'BDT',
    total_value DECIMAL DEFAULT 0,
    status TEXT DEFAULT 'Open',
    items JSONB DEFAULT '[]'::jsonb,
    terms JSONB DEFAULT '{}'::jsonb,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_item_stock(item_sku TEXT, qty_change INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE items
    SET on_hand_stock = on_hand_stock + qty_change
    WHERE sku = item_sku;
END;
$$ LANGUAGE plpgsql;

-- Set up Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all" ON items;
DROP POLICY IF EXISTS "Allow all" ON suppliers;
DROP POLICY IF EXISTS "Allow all" ON requisitions;
DROP POLICY IF EXISTS "Allow all" ON purchase_orders;
DROP POLICY IF EXISTS "Allow all" ON profiles;

CREATE POLICY "Allow all" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON requisitions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON purchase_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON profiles FOR ALL USING (true) WITH CHECK (true);
