
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to ensure clean schema application
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS requisitions CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS items CASCADE;

-- Items Table
CREATE TABLE items (
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

-- Suppliers Table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    tin TEXT,
    type TEXT DEFAULT 'Local',
    phone_office TEXT,
    phone_contact TEXT,
    phone_alternate TEXT,
    email_office TEXT,
    email_contact TEXT,
    email_alternate TEXT,
    tax_name TEXT,
    tax_bin TEXT,
    tax_address TEXT,
    address_street TEXT,
    address_city TEXT,
    address_country TEXT,
    address_postal TEXT,
    pay_acc_name TEXT,
    pay_acc_no TEXT,
    pay_bank TEXT,
    pay_branch TEXT,
    pay_routing TEXT,
    pay_swift TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Requisitions Table
CREATE TABLE requisitions (
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
CREATE TABLE purchase_orders (
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

-- Stock Update Function for Inventory Transactions
CREATE OR REPLACE FUNCTION update_item_stock(item_sku TEXT, qty_change INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE items
    SET on_hand_stock = on_hand_stock + qty_change
    WHERE sku = item_sku;
END;
$$ LANGUAGE plpgsql;

-- Set up Row Level Security (RLS) - Basic public access for development
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access items" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access requisitions" ON requisitions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access po" ON purchase_orders FOR ALL USING (true) WITH CHECK (true);
