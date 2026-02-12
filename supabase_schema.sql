
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles / Users Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    username TEXT UNIQUE,
    role TEXT DEFAULT 'USER',
    status TEXT DEFAULT 'Active',
    last_login TIMESTAMP WITH TIME ZONE,
    permissions JSONB DEFAULT '[]'::jsonb,
    granular_permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers Table (Explicitly including address_city)
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    tin TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Local',
    
    -- Phone Numbers
    phone_office TEXT,
    phone_contact TEXT,
    phone_alternate TEXT,
    
    -- Email Addresses
    email_office TEXT,
    email_contact TEXT,
    email_alternate TEXT,
    
    -- Tax Information
    tax_name TEXT,
    tax_bin TEXT,
    tax_address TEXT,
    
    -- Office Address
    address_street TEXT,
    address_city TEXT,
    address_country TEXT,
    address_postal TEXT,
    
    -- Payment Information
    pay_acc_name TEXT,
    pay_acc_number TEXT,
    pay_bank_name TEXT,
    pay_branch_name TEXT,
    pay_routing_number TEXT,
    pay_swift_number TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items Table
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

-- Requisitions Table
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

-- Purchase Orders Table
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

-- Stock Update Function
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

-- Simple public access policies (for development - tighten these for production)
CREATE POLICY "Allow public access items" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access requisitions" ON requisitions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access po" ON purchase_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
