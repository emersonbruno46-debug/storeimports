-- =============================================================================
-- STORE IMPORTS - 002: OPERATIONAL TABLES + SECURITY HARDENING
-- Target: Supabase / PostgreSQL 14+   |   Requires: 001_initial_schema.sql
--
-- What this migration does
--   1. Adds the tables the admin panel already uses but 001 did not model:
--      maintenances, promotions, product_images, profiles (staff), store_settings.
--   2. Replaces the "any authenticated user = admin" RLS policies with real
--      staff/role checks (is_staff / is_admin).
--   3. Closes the public write path: anonymous visitors can no longer INSERT
--      straight into reservations; they call fn_create_reservation(), which
--      recomputes prices on the server (the browser can never set the price).
--   4. Locks down the SECURITY DEFINER functions from 001 (they were callable by
--      anonymous users and trusted a client-supplied actor id).
--   5. Makes sale/reservation/maintenance codes DB-generated (no collisions).
--   6. Adds indexes for the queries the dashboard runs.
--
-- Run it in the Supabase SQL Editor, or `supabase db push`.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. STAFF PROFILES & ROLE HELPERS
-- -----------------------------------------------------------------------------
CREATE TYPE staff_role AS ENUM ('admin', 'manager', 'sales', 'stock');

CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name        VARCHAR(120) NOT NULL,
    role        staff_role   NOT NULL DEFAULT 'sales',
    active      BOOLEAN      NOT NULL DEFAULT true,
    last_access_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ  DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- STABLE + SECURITY DEFINER so policies can call them without recursing into
-- profiles' own RLS. search_path is pinned to avoid hijacking.
CREATE OR REPLACE FUNCTION public.is_staff() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND active);
$$;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (SELECT 1 FROM public.profiles
                   WHERE id = auth.uid() AND active AND role IN ('admin', 'manager'));
$$;

REVOKE ALL ON FUNCTION public.is_staff(), public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff(), public.is_admin() TO authenticated;

CREATE POLICY "Staff read profiles" ON public.profiles
    FOR SELECT TO authenticated USING (public.is_staff() OR id = auth.uid());
CREATE POLICY "Admin manage profiles" ON public.profiles
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 2. NEW OPERATIONAL TABLES
-- -----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.reservation_code_seq START 1001;
CREATE SEQUENCE IF NOT EXISTS public.sale_code_seq        START 2001;
CREATE SEQUENCE IF NOT EXISTS public.maintenance_code_seq START 1001;

CREATE TYPE maintenance_status AS ENUM ('Não iniciado', 'Aberto', 'Finalizado');

CREATE TABLE IF NOT EXISTS public.maintenances (
    id                   VARCHAR(64) PRIMARY KEY,
    code                 VARCHAR(32) UNIQUE NOT NULL,
    device               VARCHAR(150) NOT NULL,
    customer_name        VARCHAR(150) NOT NULL,
    customer_phone       VARCHAR(40),
    problem              TEXT NOT NULL,
    estimated_cost_cents BIGINT NOT NULL DEFAULT 0 CHECK (estimated_cost_cents >= 0),
    status               maintenance_status NOT NULL DEFAULT 'Não iniciado',
    entry_date           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes                TEXT,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.promotions (
    id                   VARCHAR(64) PRIMARY KEY,
    name                 VARCHAR(150) NOT NULL,
    scope                JSONB NOT NULL DEFAULT '{"categoryIds":[],"productIds":[],"variantIds":[]}'::jsonb,
    discount_type        VARCHAR(16) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value       NUMERIC(12,2) NOT NULL CHECK (discount_value >= 0),
    starts_at            TIMESTAMPTZ,
    ends_at              TIMESTAMPTZ,
    status               product_status NOT NULL DEFAULT 'active',
    base_price_snapshot  JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW(),
    CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at)
);

-- Product photos. The files live in Supabase Storage (bucket "product-images",
-- created in section 7); this table only keeps the path/URL and ordering.
CREATE TABLE IF NOT EXISTS public.product_images (
    id          VARCHAR(64) PRIMARY KEY,
    product_id  VARCHAR(64) NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    src         TEXT NOT NULL,
    alt         VARCHAR(200),
    is_primary  BOOLEAN NOT NULL DEFAULT false,
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
-- At most one primary photo per product.
CREATE UNIQUE INDEX IF NOT EXISTS uq_product_images_primary
    ON public.product_images (product_id) WHERE is_primary;

-- Single-row table with the store identity (replaces DEMO_CONFIG constants).
CREATE TABLE IF NOT EXISTS public.store_settings (
    id             BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),   -- forces a single row
    store_name     VARCHAR(120) NOT NULL DEFAULT 'Store Imports',
    whatsapp       VARCHAR(20),
    phone          VARCHAR(40),
    email          VARCHAR(160),
    address        TEXT,
    business_hours VARCHAR(120),
    instagram      VARCHAR(200),
    reservation_hold_hours INT NOT NULL DEFAULT 48 CHECK (reservation_hold_hours > 0),
    warranty_text  TEXT,
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO public.store_settings (store_name, whatsapp, phone, address, business_hours, instagram)
VALUES ('Store Imports', '5538991344656', '+55 38 9134-4656',
        'Rua Jovelino Pinheiro da Cruz, 02, Rio Pardo De Minas MG, 39530-000, Brasil',
        'Seg. a Sáb. das 09h às 19h', 'https://www.instagram.com/storeimports___/')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.maintenances   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 3. REPLACE THE PERMISSIVE STAFF POLICIES FROM 001
--    (FOR ALL TO authenticated USING (true) meant ANY logged-in account,
--     including a self-registered one, had full admin access.)
-- -----------------------------------------------------------------------------
DO $$
DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['categories','products','product_variants','reservations',
                             'reservation_items','sales','sale_items','stock_movements','activity_logs']
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I',
            CASE t
                WHEN 'categories'        THEN 'Staff Full Categories Access'
                WHEN 'products'          THEN 'Staff Full Products Access'
                WHEN 'product_variants'  THEN 'Staff Full Variants Access'
                WHEN 'reservations'      THEN 'Staff Full Reservations Access'
                WHEN 'reservation_items' THEN 'Staff Full Reservation Items Access'
                WHEN 'sales'             THEN 'Staff Full Sales Access'
                WHEN 'sale_items'        THEN 'Staff Full Sale Items Access'
                WHEN 'stock_movements'   THEN 'Staff Full Stock Movements Access'
                WHEN 'activity_logs'     THEN 'Staff Full Activity Logs Access'
            END, t);
    END LOOP;
END $$;

-- Reading: any active staff member. Writing: staff; deleting: admin/manager only.
DO $$
DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['categories','products','product_variants','product_images',
                             'reservations','reservation_items','sales','sale_items',
                             'stock_movements','activity_logs','maintenances','promotions']
    LOOP
        EXECUTE format('CREATE POLICY "staff_select" ON public.%I FOR SELECT TO authenticated USING (public.is_staff())', t);
        EXECUTE format('CREATE POLICY "staff_insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_staff())', t);
        EXECUTE format('CREATE POLICY "staff_update" ON public.%I FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff())', t);
        EXECUTE format('CREATE POLICY "admin_delete" ON public.%I FOR DELETE TO authenticated USING (public.is_admin())', t);
    END LOOP;
END $$;

-- product_images are shown on the public catalog, only for active products.
CREATE POLICY "public_read_images" ON public.product_images
    FOR SELECT TO anon, authenticated
    USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.status = 'active'));

CREATE POLICY "public_read_settings" ON public.store_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_write_settings" ON public.store_settings
    FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Sales and stock movements are an audit trail: nobody edits history through the
-- API, corrections go through fn_refund_sale / stock adjustments.
DROP POLICY IF EXISTS "staff_update" ON public.sales;
DROP POLICY IF EXISTS "admin_delete" ON public.sales;
DROP POLICY IF EXISTS "staff_update" ON public.sale_items;
DROP POLICY IF EXISTS "admin_delete" ON public.sale_items;
DROP POLICY IF EXISTS "staff_update" ON public.stock_movements;
DROP POLICY IF EXISTS "admin_delete" ON public.stock_movements;
DROP POLICY IF EXISTS "staff_update" ON public.activity_logs;
DROP POLICY IF EXISTS "admin_delete" ON public.activity_logs;

-- Public API must not expose cost price, minimum stock or IMEIs. RLS filters rows,
-- not columns, so restrict the anon role at column level (staff keep full access).
REVOKE SELECT ON public.product_variants FROM anon;
GRANT  SELECT (id, product_id, sku, color, capacity, price_cents, promotional_price_cents,
               stock_quantity, active) ON public.product_variants TO anon;

-- -----------------------------------------------------------------------------
-- 4. CLOSE THE PUBLIC WRITE PATH + SERVER-PRICED RESERVATIONS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Insert Reservations"      ON public.reservations;
DROP POLICY IF EXISTS "Public Insert Reservation Items" ON public.reservation_items;

-- Visitors call this instead of inserting rows. p_items = [{"variantId": "...", "quantity": 1}]
-- Prices, totals, code and status are decided here, never by the browser.
CREATE OR REPLACE FUNCTION public.fn_create_reservation(
    p_customer_name  TEXT,
    p_contact        TEXT,
    p_requested_date TIMESTAMPTZ,
    p_items          JSONB,
    p_notes          TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_id    VARCHAR(64) := 'res-' || uuid_generate_v4();
    v_code  VARCHAR(32) := '#SI-' || nextval('public.reservation_code_seq');
    v_total BIGINT := 0;
    v_item  JSONB;
    v_var   RECORD;
    v_qty   INT;
    v_price BIGINT;
BEGIN
    IF p_customer_name IS NULL OR length(trim(p_customer_name)) < 2 OR length(p_customer_name) > 150 THEN
        RAISE EXCEPTION 'Nome inválido.';
    END IF;
    IF p_contact IS NULL OR length(regexp_replace(p_contact, '\D', '', 'g')) NOT BETWEEN 10 AND 13 THEN
        RAISE EXCEPTION 'WhatsApp inválido.';
    END IF;
    IF p_requested_date IS NULL OR p_requested_date < NOW() - INTERVAL '1 day' THEN
        RAISE EXCEPTION 'Data de retirada inválida.';
    END IF;
    IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array'
       OR jsonb_array_length(p_items) = 0 OR jsonb_array_length(p_items) > 20 THEN
        RAISE EXCEPTION 'A reserva precisa de 1 a 20 itens.';
    END IF;

    INSERT INTO public.reservations (id, code, demo_customer_name, demo_contact_label,
        estimated_total_cents, status, requested_date, display_date, notes, history)
    VALUES (v_id, v_code, trim(p_customer_name), trim(p_contact), 0, 'new', p_requested_date,
        to_char(p_requested_date, 'DD/MM/YYYY'), left(p_notes, 500),
        jsonb_build_array(jsonb_build_object('from', NULL, 'to', 'new', 'actorUserId', 'customer', 'at', NOW())));

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        v_qty := COALESCE((v_item->>'quantity')::INT, 0);
        IF v_qty < 1 OR v_qty > 10 THEN
            RAISE EXCEPTION 'Quantidade inválida.';
        END IF;

        SELECT v.*, p.status AS product_status INTO v_var
        FROM public.product_variants v JOIN public.products p ON p.id = v.product_id
        WHERE v.id = (v_item->>'variantId') AND v.active AND p.status = 'active';
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Produto indisponível.';
        END IF;
        IF v_var.stock_quantity < v_qty THEN
            RAISE EXCEPTION 'Estoque insuficiente para %.', v_var.sku;
        END IF;

        v_price := COALESCE(v_var.promotional_price_cents, v_var.price_cents);
        v_total := v_total + v_price * v_qty;
        INSERT INTO public.reservation_items (reservation_id, product_id, variant_id, quantity, unit_price_cents)
        VALUES (v_id, v_var.product_id, v_var.id, v_qty, v_price);
    END LOOP;

    UPDATE public.reservations SET estimated_total_cents = v_total WHERE id = v_id;
    RETURN jsonb_build_object('success', true, 'reservation_id', v_id, 'code', v_code, 'total_cents', v_total);
END;
$$;
REVOKE ALL ON FUNCTION public.fn_create_reservation(TEXT, TEXT, TIMESTAMPTZ, JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_create_reservation(TEXT, TEXT, TIMESTAMPTZ, JSONB, TEXT) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 5. LOCK DOWN THE 001 TRANSACTIONAL FUNCTIONS
--    The originals are SECURITY DEFINER, executable by anon and trust a
--    client-supplied actor id. We keep them as private implementations and expose
--    thin staff-only wrappers that use the real authenticated user.
-- -----------------------------------------------------------------------------
ALTER FUNCTION public.fn_complete_reservation(VARCHAR, VARCHAR) RENAME TO _impl_complete_reservation;
ALTER FUNCTION public.fn_refund_sale(VARCHAR, TEXT, VARCHAR)    RENAME TO _impl_refund_sale;
ALTER FUNCTION public._impl_complete_reservation(VARCHAR, VARCHAR) SET search_path = public;
ALTER FUNCTION public._impl_refund_sale(VARCHAR, TEXT, VARCHAR)    SET search_path = public;
REVOKE ALL ON FUNCTION public._impl_complete_reservation(VARCHAR, VARCHAR) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._impl_refund_sale(VARCHAR, TEXT, VARCHAR)    FROM PUBLIC, anon, authenticated;

-- The p_actor_user_id argument is kept so the frontend contract does not change,
-- but it is ignored: the actor is always auth.uid().
CREATE OR REPLACE FUNCTION public.fn_complete_reservation(
    p_reservation_id VARCHAR(64), p_actor_user_id VARCHAR(64) DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_res JSONB;
BEGIN
    IF NOT public.is_staff() THEN RAISE EXCEPTION 'Acesso negado.'; END IF;
    PERFORM set_config('app.assign_code', '1', true);   -- transaction-local
    v_res := public._impl_complete_reservation(p_reservation_id, auth.uid()::text);
    -- trg_sales_code replaces the random code chosen by the 001 implementation,
    -- so report the code that was actually stored.
    RETURN v_res || jsonb_build_object('sale_code', (SELECT code FROM public.sales WHERE id = v_res->>'sale_id'));
END $$;

CREATE OR REPLACE FUNCTION public.fn_refund_sale(
    p_sale_id VARCHAR(64), p_reason TEXT, p_actor_user_id VARCHAR(64) DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Apenas administradores podem estornar vendas.'; END IF;
    RETURN public._impl_refund_sale(p_sale_id, p_reason, auth.uid()::text);
END $$;

REVOKE ALL ON FUNCTION public.fn_complete_reservation(VARCHAR, VARCHAR)  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_refund_sale(VARCHAR, TEXT, VARCHAR)     FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_complete_reservation(VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_refund_sale(VARCHAR, TEXT, VARCHAR)    TO authenticated;

-- -----------------------------------------------------------------------------
-- 6. DATABASE-OWNED CODES, updated_at, STOCK GUARD, INDEXES
-- -----------------------------------------------------------------------------
-- 001 generated sale codes with random(): 9000 possible values, so UNIQUE(code)
-- starts failing after a few hundred sales. Codes now come from sequences.
CREATE OR REPLACE FUNCTION public.trg_assign_code() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
    -- Sales: assign when the client left the code empty, or when the 001 billing
    -- function (which still picks a random code) runs through our wrapper.
    -- Imported historical sales keep the code they already have.
    IF TG_TABLE_NAME = 'sales' AND (NEW.code IS NULL OR NEW.code = ''
                                    OR current_setting('app.assign_code', true) = '1') THEN
        NEW.code := 'VD-' || nextval('public.sale_code_seq');
    ELSIF TG_TABLE_NAME = 'maintenances' AND (NEW.code IS NULL OR NEW.code = '') THEN
        NEW.code := 'MNT-' || nextval('public.maintenance_code_seq');
    END IF;
    RETURN NEW;
END $$;
CREATE TRIGGER trg_sales_code BEFORE INSERT ON public.sales
    FOR EACH ROW EXECUTE FUNCTION public.trg_assign_code();
CREATE TRIGGER trg_maintenances_code BEFORE INSERT ON public.maintenances
    FOR EACH ROW EXECUTE FUNCTION public.trg_assign_code();

CREATE OR REPLACE FUNCTION public.trg_touch_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := NOW(); RETURN NEW; END $$;

DO $$
DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['categories','products','product_variants','reservations',
                             'maintenances','promotions','profiles','store_settings']
    LOOP
        EXECUTE format('CREATE TRIGGER trg_%I_touch BEFORE UPDATE ON public.%I
                        FOR EACH ROW EXECUTE FUNCTION public.trg_touch_updated_at()', t, t);
    END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_category        ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_variants_product         ON public.product_variants (product_id);
CREATE INDEX IF NOT EXISTS idx_variants_low_stock       ON public.product_variants (stock_quantity, minimum_stock) WHERE active;
CREATE INDEX IF NOT EXISTS idx_reservations_status_date ON public.reservations (status, requested_date);
CREATE INDEX IF NOT EXISTS idx_reservation_items_res    ON public.reservation_items (reservation_id);
CREATE INDEX IF NOT EXISTS idx_sales_created            ON public.sales (created_at DESC) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_sale_items_sale          ON public.sale_items (sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_variant       ON public.sale_items (variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_mov_variant        ON public.stock_movements (variant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenances_status      ON public.maintenances (status, entry_date);
CREATE INDEX IF NOT EXISTS idx_activity_created         ON public.activity_logs (created_at DESC);

-- -----------------------------------------------------------------------------
-- 7. STORAGE BUCKET FOR PRODUCT / CATEGORY IMAGES
--    The admin currently stores photos as base64 inside localStorage. In
--    production they go to Storage; public read, staff-only write.
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 2097152,
        ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "product_images_public_read" ON storage.objects
    FOR SELECT TO anon, authenticated USING (bucket_id = 'product-images');
CREATE POLICY "product_images_staff_write" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND public.is_staff());
CREATE POLICY "product_images_staff_update" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'product-images' AND public.is_staff());
CREATE POLICY "product_images_admin_delete" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND public.is_admin());

-- -----------------------------------------------------------------------------
-- 8. FIRST ADMIN (run manually AFTER creating the user in Authentication > Users)
-- -----------------------------------------------------------------------------
-- INSERT INTO public.profiles (id, name, role)
-- SELECT id, 'Thallys', 'admin' FROM auth.users WHERE email = 'SEU-EMAIL-AQUI';
