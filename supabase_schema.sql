
-- =========================================================
-- SYSTEM SCHEMA SYNCHRONIZATION & REPAIR
-- =========================================================

-- Ensure the extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLEANUP: Drop existing versions of update_item_stock to avoid signature conflicts
DROP FUNCTION IF EXISTS public.update_item_stock(text, integer);
DROP FUNCTION IF EXISTS public.update_item_stock(text, integer, boolean);

-- 2. Ensure the items table has all required columns for inventory tracking
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    sku TEXT,
    name TEXT NOT NULL,
    uom TEXT,
    location TEXT,
    type TEXT,
    group_name TEXT,
    source TEXT,
    department TEXT,
    opening_stock INTEGER DEFAULT 0,
    last_price DECIMAL DEFAULT 0,
    avg_price DECIMAL DEFAULT 0,
    safety_stock INTEGER DEFAULT 0,
    on_hand_stock INTEGER DEFAULT 0,
    issued_qty INTEGER DEFAULT 0,
    received_qty INTEGER DEFAULT 0,
    last_issued TIMESTAMP WITH TIME ZONE,
    last_received TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE items ADD COLUMN IF NOT EXISTS issued_qty INTEGER DEFAULT 0;
ALTER TABLE items ADD COLUMN IF NOT EXISTS received_qty INTEGER DEFAULT 0;
ALTER TABLE items ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS opening_stock INTEGER DEFAULT 0;
ALTER TABLE items ADD COLUMN IF NOT EXISTS last_issued TIMESTAMP WITH TIME ZONE;
ALTER TABLE items ADD COLUMN IF NOT EXISTS last_received TIMESTAMP WITH TIME ZONE;

-- Ensure grns table has bl_container column if it already exists
ALTER TABLE grns ADD COLUMN IF NOT EXISTS bl_container TEXT;

-- 3. Standardize the update_item_stock function
CREATE OR REPLACE FUNCTION public.update_item_stock(item_sku text, qty_change integer, is_receive boolean, ref_no text DEFAULT NULL, dept text DEFAULT NULL, unit_price decimal DEFAULT NULL)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_item_code TEXT;
BEGIN
    -- Get item code for reference
    SELECT code INTO v_item_code FROM items WHERE sku = item_sku LIMIT 1;

    IF is_receive THEN
        UPDATE items 
        SET on_hand_stock = on_hand_stock + qty_change,
            received_qty = COALESCE(received_qty, 0) + qty_change,
            last_received = NOW(),
            last_price = COALESCE(unit_price, last_price)
        WHERE sku = item_sku;

        INSERT INTO transactions (item_sku, item_code, type, quantity, reference_no, department)
        VALUES (item_sku, v_item_code, 'Receive', qty_change, ref_no, dept);
    ELSE
        UPDATE items 
        SET on_hand_stock = on_hand_stock + qty_change,
            issued_qty = COALESCE(issued_qty, 0) + ABS(qty_change),
            last_issued = NOW()
        WHERE sku = item_sku;

        INSERT INTO transactions (item_sku, item_code, type, quantity, reference_no, department)
        VALUES (item_sku, v_item_code, 'Issue', ABS(qty_change), ref_no, dept);
    END IF;
END;
$function$;

-- 4. Move Orders Table
CREATE TABLE IF NOT EXISTS move_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mo_no TEXT UNIQUE NOT NULL,
    reference TEXT,
    header_text TEXT,
    department TEXT,
    status TEXT DEFAULT 'Pending',
    total_value DECIMAL DEFAULT 0,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Cost Centers Table
CREATE TABLE IF NOT EXISTS cost_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Row Level Security setup
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all" ON items;
DROP POLICY IF EXISTS "Allow all" ON move_orders;
DROP POLICY IF EXISTS "Allow all" ON cost_centers;

CREATE POLICY "Allow all" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON move_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON cost_centers FOR ALL USING (true) WITH CHECK (true);

-- Initial Data for Cost Centers if empty
INSERT INTO cost_centers (name, department)
SELECT name, dept FROM (
    VALUES 
    ('Maintenance', 'Operations'),
    ('Security', 'Admin'),
    ('Safety', 'EHS'),
    ('QC', 'Quality'),
    ('PDI', 'Operations'),
    ('Paint Shop', 'Production'),
    ('Outbound Logistic', 'Supply Chain'),
    ('MMT', 'Operations'),
    ('Medical', 'HR'),
    ('IT', 'Technology'),
    ('HR', 'Human Resources'),
    ('Finance', 'Accounts'),
    ('Civil', 'Maintenance'),
    ('Audit', 'Management'),
    ('Assembly', 'Production'),
    ('Admin', 'Administration')
) AS t(name, dept)
ON CONFLICT (name) DO NOTHING;

-- 7. Cycle Counting Table
CREATE TABLE IF NOT EXISTS cycle_counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    counting_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id TEXT,
    sku TEXT,
    item_name TEXT,
    location TEXT,
    uom TEXT,
    physical_qty INTEGER DEFAULT 0,
    system_qty INTEGER DEFAULT 0,
    pending_receive INTEGER DEFAULT 0,
    pending_issue INTEGER DEFAULT 0,
    short_over INTEGER DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Goods Receive Notes (GRN) Table
CREATE TABLE IF NOT EXISTS grns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_no TEXT UNIQUE NOT NULL,
    document_date DATE,
    receive_date DATE,
    transaction_type TEXT,
    source_type TEXT,
    source_ref TEXT,
    header_text TEXT,
    invoice_no TEXT,
    bl_mushok_no TEXT,
    bl_container TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE grns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON grns;
CREATE POLICY "Allow all" ON grns FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE cycle_counts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON cycle_counts;
CREATE POLICY "Allow all" ON cycle_counts FOR ALL USING (true) WITH CHECK (true);

-- 9. Profiles Table for User Management
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    full_name TEXT,
    username TEXT UNIQUE,
    password TEXT DEFAULT '123456',
    office_id TEXT,
    contact_number TEXT,
    department TEXT,
    role_template TEXT,
    role TEXT DEFAULT 'USER',
    status TEXT DEFAULT 'Active',
    last_login TIMESTAMP WITH TIME ZONE,
    avatar_url TEXT,
    granular_permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IMPORTANT: Remove the foreign key constraint that blocks manual user creation
-- This allows us to manage users directly in the profiles table without auth.users
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Ensure all columns exist even if table was created earlier
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password TEXT DEFAULT '123456';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS office_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role_template TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'USER';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS granular_permissions JSONB DEFAULT '{}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Break infinite recursion by dropping ALL existing policies first
DO $$ 
DECLARE 
    pol record;
BEGIN 
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public' 
    LOOP
        EXECUTE format('DROP POLICY %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- 10. Transactions Table for detailed history
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_sku TEXT NOT NULL,
    item_code TEXT,
    type TEXT NOT NULL, -- 'Receive' or 'Issue'
    quantity INTEGER NOT NULL,
    reference_no TEXT,
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON transactions;
CREATE POLICY "Allow all" ON transactions FOR ALL USING (true) WITH CHECK (true);

-- FORCE CACHE RELOAD
NOTIFY pgrst, 'reload schema';
