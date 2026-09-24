-- =============================================================================
-- STORE IMPORTS - INITIAL DATABASE SCHEMA & SECURITY MIGRATION (V3)
-- Target: Supabase / PostgreSQL 14+
-- Version: 001_initial_schema.sql
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & TYPES
CREATE TYPE product_status AS ENUM ('active', 'inactive');
CREATE TYPE product_condition AS ENUM ('new', 'used_demo');
CREATE TYPE reservation_status AS ENUM ('new', 'contacted', 'confirmed', 'completed', 'cancelled');
CREATE TYPE sale_status AS ENUM ('completed', 'cancelled');
CREATE TYPE stock_movement_type AS ENUM ('entry', 'exit', 'positive_adjustment', 'negative_adjustment');

-- 3. TABLES DEFINITION

-- 3.1 CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(255) NOT NULL,
    icon VARCHAR(64) DEFAULT 'smartphone',
    status product_status DEFAULT 'active',
    display_order INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id VARCHAR(64) PRIMARY KEY,
    sku VARCHAR(64) UNIQUE NOT NULL,
    barcode_demo VARCHAR(64),
    name VARCHAR(180) NOT NULL,
    brand VARCHAR(80) NOT NULL,
    model VARCHAR(80) NOT NULL,
    category_id VARCHAR(64) REFERENCES public.categories(id) ON DELETE RESTRICT,
    condition product_condition DEFAULT 'new',
    short_description TEXT,
    status product_status DEFAULT 'active',
    mockup_style JSONB DEFAULT '{"color": "#6B7280", "icon": "smartphone"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS public.product_variants (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku VARCHAR(64) UNIQUE NOT NULL,
    color VARCHAR(60) NOT NULL DEFAULT 'Padrão',
    capacity VARCHAR(60) DEFAULT '',
    price_cents BIGINT NOT NULL CHECK (price_cents >= 0),
    promotional_price_cents BIGINT CHECK (promotional_price_cents IS NULL OR promotional_price_cents >= 0),
    cost_cents BIGINT CHECK (cost_cents IS NULL OR cost_cents >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    minimum_stock INT NOT NULL DEFAULT 1 CHECK (minimum_stock >= 0),
    active BOOLEAN DEFAULT true,
    demo_imeis TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 RESERVATIONS
CREATE TABLE IF NOT EXISTS public.reservations (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL,
    demo_customer_name VARCHAR(150) NOT NULL,
    demo_contact_label VARCHAR(80) NOT NULL,
    estimated_total_cents BIGINT NOT NULL CHECK (estimated_total_cents >= 0),
    status reservation_status DEFAULT 'new',
    requested_date TIMESTAMPTZ NOT NULL,
    display_date VARCHAR(32),
    demo_payment_method VARCHAR(50) DEFAULT 'cash_demo',
    notes TEXT,
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 RESERVATION ITEMS
CREATE TABLE IF NOT EXISTS public.reservation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id VARCHAR(64) NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES public.products(id),
    variant_id VARCHAR(64) NOT NULL REFERENCES public.product_variants(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price_cents BIGINT NOT NULL CHECK (unit_price_cents >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.6 SALES
CREATE TABLE IF NOT EXISTS public.sales (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL,
    subtotal_cents BIGINT NOT NULL CHECK (subtotal_cents >= 0),
    discount_cents BIGINT NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
    total_cents BIGINT NOT NULL CHECK (total_cents >= 0),
    demo_payment_method VARCHAR(50) NOT NULL DEFAULT 'cash_demo',
    demo_customer_name VARCHAR(150) NOT NULL DEFAULT 'Consumidor',
    seller_user_id VARCHAR(64) NOT NULL DEFAULT 'user-1',
    status sale_status DEFAULT 'completed',
    notes TEXT,
    reversal_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ
);

-- 3.7 SALE ITEMS
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id VARCHAR(64) NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES public.products(id),
    variant_id VARCHAR(64) NOT NULL REFERENCES public.product_variants(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price_cents BIGINT NOT NULL CHECK (unit_price_cents >= 0),
    discount_cents BIGINT NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
    total_cents BIGINT NOT NULL CHECK (total_cents >= 0)
);

-- 3.8 STOCK MOVEMENTS
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES public.products(id),
    variant_id VARCHAR(64) NOT NULL REFERENCES public.product_variants(id),
    type stock_movement_type NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 0),
    previous_quantity INT NOT NULL CHECK (previous_quantity >= 0),
    resulting_quantity INT NOT NULL CHECK (resulting_quantity >= 0),
    reason TEXT NOT NULL,
    demo_imeis TEXT[] DEFAULT '{}',
    related_sale_id VARCHAR(64) REFERENCES public.sales(id),
    related_reservation_id VARCHAR(64) REFERENCES public.reservations(id),
    actor_user_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.9 ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(32) NOT NULL DEFAULT 'info',
    entity_type VARCHAR(32),
    entity_id VARCHAR(64),
    message TEXT NOT NULL,
    actor_user_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS) & PRIVILEGES
-- =============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- PUBLIC POLICIES (Read catalog, submit reservations)
CREATE POLICY "Public Read Active Categories" ON public.categories 
    FOR SELECT USING (status = 'active');

CREATE POLICY "Public Read Active Products" ON public.products 
    FOR SELECT USING (status = 'active');

CREATE POLICY "Public Read Active Variants" ON public.product_variants 
    FOR SELECT USING (active = true);

-- Public can submit a reservation, but cannot query or read existing reservations!
CREATE POLICY "Public Insert Reservations" ON public.reservations 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Insert Reservation Items" ON public.reservation_items 
    FOR INSERT WITH CHECK (true);

-- AUTHENTICATED STAFF POLICIES (Full administrative access)
CREATE POLICY "Staff Full Categories Access" ON public.categories 
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Staff Full Products Access" ON public.products 
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Staff Full Variants Access" ON public.product_variants 
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Staff Full Reservations Access" ON public.reservations 
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Staff Full Reservation Items Access" ON public.reservation_items 
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Staff Full Sales Access" ON public.sales 
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Staff Full Sale Items Access" ON public.sale_items 
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Staff Full Stock Movements Access" ON public.stock_movements 
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Staff Full Activity Logs Access" ON public.activity_logs 
    FOR ALL TO authenticated USING (true);

-- =============================================================================
-- 5. TRANSACTIONAL & IDEMPOTENT SERVER STORED PROCEDURES
-- =============================================================================

-- 5.1 FATURAR RESERVA (COMPLETE RESERVATION)
CREATE OR REPLACE FUNCTION public.fn_complete_reservation(
    p_reservation_id VARCHAR(64),
    p_actor_user_id VARCHAR(64)
) RETURNS JSONB AS $$
DECLARE
    v_res RECORD;
    v_item RECORD;
    v_variant RECORD;
    v_new_sale_id VARCHAR(64);
    v_sale_code VARCHAR(32);
    v_total_cents BIGINT := 0;
    v_now TIMESTAMPTZ := NOW();
BEGIN
    -- 1. Check reservation existence and status
    SELECT * INTO v_res FROM public.reservations WHERE id = p_reservation_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reserva ID % não encontrada.', p_reservation_id;
    END IF;

    IF v_res.status = 'completed' THEN
        RAISE EXCEPTION 'Reserva % já foi faturada anteriormente.', v_res.code;
    END IF;

    IF v_res.status = 'cancelled' THEN
        RAISE EXCEPTION 'Não é possível faturar uma reserva que foi cancelada.';
    END IF;

    -- 2. Validate stock for all items
    FOR v_item IN SELECT * FROM public.reservation_items WHERE reservation_id = p_reservation_id LOOP
        SELECT * INTO v_variant FROM public.product_variants WHERE id = v_item.variant_id FOR UPDATE;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Variação ID % não encontrada.', v_item.variant_id;
        END IF;

        IF v_variant.stock_quantity < v_item.quantity THEN
            RAISE EXCEPTION 'Estoque insuficiente para a variação %. Solicitado: %, Disponível: %.', 
                v_variant.sku, v_item.quantity, v_variant.stock_quantity;
        END IF;
    END LOOP;

    -- 3. Create Sale Record
    v_new_sale_id := 'sale-' || uuid_generate_v4();
    v_sale_code := 'VD-' || (FLOOR(1000 + random() * 9000))::text;

    INSERT INTO public.sales (id, code, subtotal_cents, discount_cents, total_cents, demo_payment_method, demo_customer_name, seller_user_id, status, notes, created_at)
    VALUES (
        v_new_sale_id,
        v_sale_code,
        v_res.estimated_total_cents,
        0,
        v_res.estimated_total_cents,
        v_res.demo_payment_method,
        v_res.demo_customer_name,
        p_actor_user_id,
        'completed',
        'Venda gerada a partir do faturamento da reserva ' || v_res.code,
        v_now
    );

    -- 4. Deduct Stock & Register Movements & Create Sale Items
    FOR v_item IN SELECT * FROM public.reservation_items WHERE reservation_id = p_reservation_id LOOP
        SELECT * INTO v_variant FROM public.product_variants WHERE id = v_item.variant_id FOR UPDATE;
        
        -- Deduct stock explicitly (No Math.max masking!)
        UPDATE public.product_variants 
        SET stock_quantity = stock_quantity - v_item.quantity,
            updated_at = v_now
        WHERE id = v_item.variant_id;

        INSERT INTO public.stock_movements (id, product_id, variant_id, type, quantity, previous_quantity, resulting_quantity, reason, related_sale_id, related_reservation_id, actor_user_id, created_at)
        VALUES (
            'mov-' || uuid_generate_v4(),
            v_item.product_id,
            v_item.variant_id,
            'exit',
            v_item.quantity,
            v_variant.stock_quantity,
            v_variant.stock_quantity - v_item.quantity,
            'Faturamento da reserva ' || v_res.code,
            v_new_sale_id,
            p_reservation_id,
            p_actor_user_id,
            v_now
        );

        INSERT INTO public.sale_items (sale_id, product_id, variant_id, quantity, unit_price_cents, discount_cents, total_cents)
        VALUES (
            v_new_sale_id,
            v_item.product_id,
            v_item.variant_id,
            v_item.quantity,
            v_item.unit_price_cents,
            0,
            v_item.unit_price_cents * v_item.quantity
        );
    END LOOP;

    -- 5. Update Reservation Status
    UPDATE public.reservations 
    SET status = 'completed',
        updated_at = v_now,
        history = history || jsonb_build_object('from', status, 'to', 'completed', 'actorUserId', p_actor_user_id, 'at', v_now)
    WHERE id = p_reservation_id;

    RETURN jsonb_build_object('success', true, 'sale_id', v_new_sale_id, 'sale_code', v_sale_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.2 ESTORNO ADMINISTRATIVO DE VENDA (REFUND SALE)
CREATE OR REPLACE FUNCTION public.fn_refund_sale(
    p_sale_id VARCHAR(64),
    p_reason TEXT,
    p_actor_user_id VARCHAR(64)
) RETURNS JSONB AS $$
DECLARE
    v_sale RECORD;
    v_item RECORD;
    v_variant RECORD;
    v_now TIMESTAMPTZ := NOW();
BEGIN
    IF p_reason IS NULL OR TRIM(p_reason) = '' THEN
        RAISE EXCEPTION 'Motivo do estorno é obrigatório.';
    END IF;

    SELECT * INTO v_sale FROM public.sales WHERE id = p_sale_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Venda ID % não encontrada.', p_sale_id;
    END IF;

    IF v_sale.status = 'cancelled' THEN
        RAISE EXCEPTION 'Venda % já foi estornada anteriormente.', v_sale.code;
    END IF;

    -- Restore stock for each item in the sale
    FOR v_item IN SELECT * FROM public.sale_items WHERE sale_id = p_sale_id LOOP
        SELECT * INTO v_variant FROM public.product_variants WHERE id = v_item.variant_id FOR UPDATE;

        UPDATE public.product_variants
        SET stock_quantity = stock_quantity + v_item.quantity,
            updated_at = v_now
        WHERE id = v_item.variant_id;

        INSERT INTO public.stock_movements (id, product_id, variant_id, type, quantity, previous_quantity, resulting_quantity, reason, related_sale_id, actor_user_id, created_at)
        VALUES (
            'mov-' || uuid_generate_v4(),
            v_item.product_id,
            v_item.variant_id,
            'entry',
            v_item.quantity,
            v_variant.stock_quantity,
            v_variant.stock_quantity + v_item.quantity,
            'Estorno administrativo da venda ' || v_sale.code || ': ' || TRIM(p_reason),
            p_sale_id,
            p_actor_user_id,
            v_now
        );
    END LOOP;

    -- Mark sale as cancelled
    UPDATE public.sales
    SET status = 'cancelled',
        cancelled_at = v_now,
        reversal_reason = TRIM(p_reason)
    WHERE id = p_sale_id;

    RETURN jsonb_build_object('success', true, 'message', 'Venda estornada e estoque recomposto.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
