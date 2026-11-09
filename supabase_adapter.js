/**
 * Store Imports - Supabase adapter (preparation layer, NOT wired into the UI yet).
 *
 * The UI still reads/writes localStorage synchronously (store_data.js). This file
 * holds everything needed to move to Supabase without touching the schema again:
 *   - lazy client creation (supabase-js is only downloaded when you connect)
 *   - camelCase <-> snake_case mappers for every table in migrations/001 + 002
 *   - async repository methods mirroring the local ones
 *   - importBackup(): loads the JSON exported from Painel > Configurações > Backup
 *
 * Nothing here has been run against a real project yet. See DATABASE.md.
 */
const SupabaseAdapter = (() => {
  const SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
  let client = null;

  function isConfigured() {
    return !!(DEMO_CONFIG.supabaseUrl && DEMO_CONFIG.supabaseAnonKey);
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (window.supabase && window.supabase.createClient) return resolve();
      const el = document.createElement('script');
      el.src = src;
      el.onload = resolve;
      el.onerror = () => reject(new Error('Não foi possível carregar o supabase-js.'));
      document.head.appendChild(el);
    });
  }

  async function connect() {
    if (client) return client;
    if (!isConfigured()) throw new Error('Defina supabaseUrl e supabaseAnonKey em DEMO_CONFIG (store_data.js).');
    await loadScript(SUPABASE_JS);
    client = window.supabase.createClient(DEMO_CONFIG.supabaseUrl, DEMO_CONFIG.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
    return client;
  }

  function must({ data, error }) {
    if (error) throw new Error(error.message);
    return data;
  }

  const iso = v => (v ? new Date(v).toISOString() : null);

  // ---------------------------------------------------------------------------
  // MAPPERS (app object -> DB row) and (DB row -> app object)
  // ---------------------------------------------------------------------------
  const toRow = {
    category: c => ({ id: c.id, name: c.name, slug: c.slug, description: c.description || null, image: c.image || '', icon: c.icon || 'smartphone', status: c.status || 'active', display_order: c.displayOrder || 1 }),
    product: p => ({ id: p.id, sku: p.sku, barcode_demo: p.barcodeDemo || null, name: p.name, brand: p.brand, model: p.model || '', category_id: p.categoryId, condition: p.condition || 'new', short_description: p.shortDescription || null, status: p.status || 'active', mockup_style: p.mockupStyle || {} }),
    variant: (v, productId) => ({ id: v.id, product_id: productId, sku: v.sku, color: v.color || 'Padrão', capacity: v.capacity || '', price_cents: v.priceCents, promotional_price_cents: v.promotionalPriceCents ?? null, cost_cents: v.costCents ?? null, stock_quantity: v.stockQuantity || 0, minimum_stock: v.minimumStock ?? 1, active: v.active !== false, demo_imeis: v.demoImeis || [] }),
    reservation: r => ({ id: r.id, code: r.code, demo_customer_name: r.demoCustomerName, demo_contact_label: r.demoContactLabel || '', estimated_total_cents: r.estimatedTotalCents || 0, status: r.status, requested_date: iso(r.requestedDate) || new Date().toISOString(), display_date: r.displayDate || null, demo_payment_method: r.demoPaymentMethod || 'cash_demo', notes: r.notes || null, history: r.history || [], created_at: iso(r.createdAt) || undefined }),
    reservationItem: (i, reservationId) => ({ reservation_id: reservationId, product_id: i.productId, variant_id: i.variantId, quantity: i.quantity, unit_price_cents: i.unitPriceCents }),
    sale: s => ({ id: s.id, code: s.code, subtotal_cents: s.subtotalCents, discount_cents: s.discountCents || 0, total_cents: s.totalCents, demo_payment_method: s.demoPaymentMethod || 'cash_demo', demo_customer_name: s.demoCustomerName || 'Consumidor', seller_user_id: s.sellerUserId || 'user-1', status: s.status, notes: s.notes || null, reversal_reason: s.reversalReason || null, created_at: iso(s.createdAt) || undefined, cancelled_at: iso(s.cancelledAt) }),
    saleItem: (i, saleId) => ({ sale_id: saleId, product_id: i.productId, variant_id: i.variantId, quantity: i.quantity, unit_price_cents: i.unitPriceCents, discount_cents: i.discountCents || 0, total_cents: i.totalCents }),
    stockMovement: m => ({ id: m.id, product_id: m.productId, variant_id: m.variantId, type: m.type, quantity: m.quantity, previous_quantity: m.previousQuantity, resulting_quantity: m.resultingQuantity, reason: m.reason, demo_imeis: m.demoImeis || [], related_sale_id: m.relatedSaleId || null, related_reservation_id: m.relatedReservationId || null, actor_user_id: m.actorUserId || 'user-1', created_at: iso(m.createdAt) || undefined }),
    maintenance: m => ({ id: m.id, code: m.code, device: m.device, customer_name: m.customerName, customer_phone: m.customerPhone || null, problem: m.problem, estimated_cost_cents: m.estimatedCostCents || 0, status: m.status, entry_date: iso(m.entryDate) || new Date().toISOString(), notes: m.notes || null, created_at: iso(m.createdAt) || undefined }),
    promotion: p => ({ id: p.id, name: p.name, scope: p.scope || {}, discount_type: p.discountType, discount_value: p.discountValue, starts_at: iso(p.startsAt), ends_at: iso(p.endsAt), status: p.status || 'active', base_price_snapshot: p.basePriceSnapshot || {} }),
    activityLog: l => ({ id: l.id, type: l.type || 'info', entity_type: l.entityType || null, entity_id: l.entityId || null, message: l.message, actor_user_id: l.actorUserId || 'user-1', created_at: iso(l.createdAt) || undefined })
  };

  const fromRow = {
    category: r => ({ id: r.id, name: r.name, slug: r.slug, description: r.description, image: r.image, icon: r.icon, status: r.status, displayOrder: r.display_order, createdAt: r.created_at, updatedAt: r.updated_at }),
    variant: v => ({ id: v.id, sku: v.sku, color: v.color, capacity: v.capacity, priceCents: Number(v.price_cents), promotionalPriceCents: v.promotional_price_cents === null ? null : Number(v.promotional_price_cents), costCents: v.cost_cents === undefined || v.cost_cents === null ? null : Number(v.cost_cents), stockQuantity: v.stock_quantity, minimumStock: v.minimum_stock ?? 0, active: v.active, demoImeis: v.demo_imeis || [] }),
    product: p => ({ id: p.id, sku: p.sku, barcodeDemo: p.barcode_demo, name: p.name, brand: p.brand, model: p.model, categoryId: p.category_id, condition: p.condition, shortDescription: p.short_description, status: p.status, mockupStyle: p.mockup_style, images: (p.product_images || []).sort((a, b) => a.sort_order - b.sort_order).map(i => ({ id: i.id, src: i.src, alt: i.alt, isPrimary: i.is_primary })), variants: (p.product_variants || []).map(fromRow.variant), createdAt: p.created_at, updatedAt: p.updated_at }),
    reservation: r => ({ id: r.id, code: r.code, demoCustomerName: r.demo_customer_name, demoContactLabel: r.demo_contact_label, estimatedTotalCents: Number(r.estimated_total_cents), status: r.status, requestedDate: r.requested_date, notes: r.notes, history: r.history || [], createdAt: r.created_at, items: (r.reservation_items || []).map(i => ({ productId: i.product_id, variantId: i.variant_id, quantity: i.quantity, unitPriceCents: Number(i.unit_price_cents) })) }),
    sale: s => ({ id: s.id, code: s.code, subtotalCents: Number(s.subtotal_cents), discountCents: Number(s.discount_cents), totalCents: Number(s.total_cents), demoPaymentMethod: s.demo_payment_method, demoCustomerName: s.demo_customer_name, sellerUserId: s.seller_user_id, status: s.status, notes: s.notes, reversalReason: s.reversal_reason, createdAt: s.created_at, cancelledAt: s.cancelled_at, items: (s.sale_items || []).map(i => ({ productId: i.product_id, variantId: i.variant_id, quantity: i.quantity, unitPriceCents: Number(i.unit_price_cents), discountCents: Number(i.discount_cents), totalCents: Number(i.total_cents) })) })
  };

  // ---------------------------------------------------------------------------
  // READ API (mirrors getProducts/getSales/... but async)
  // ---------------------------------------------------------------------------
  const api = {
    async getCategories() { const c = await connect(); return must(await c.from('categories').select('*').order('display_order')).map(fromRow.category); },
    async getProducts() { const c = await connect(); return must(await c.from('products').select('*, product_variants(*), product_images(*)').order('name')).map(fromRow.product); },
    async getReservations() { const c = await connect(); return must(await c.from('reservations').select('*, reservation_items(*)').order('created_at', { ascending: false })).map(fromRow.reservation); },
    async getSales() { const c = await connect(); return must(await c.from('sales').select('*, sale_items(*)').order('created_at', { ascending: false })).map(fromRow.sale); },

    /** Public catalog entry point (anon). Server prices the order; see fn_create_reservation. */
    async createReservation({ customerName, contact, requestedDate, items, notes }) {
      const c = await connect();
      return must(await c.rpc('fn_create_reservation', {
        p_customer_name: customerName, p_contact: contact, p_requested_date: iso(requestedDate),
        p_items: items.map(i => ({ variantId: i.variantId, quantity: i.quantity })), p_notes: notes || null
      }));
    },
    async completeReservation(reservationId) { const c = await connect(); return must(await c.rpc('fn_complete_reservation', { p_reservation_id: reservationId })); },
    async reverseSale(saleId, reason) { const c = await connect(); return must(await c.rpc('fn_refund_sale', { p_sale_id: saleId, p_reason: reason })); },

    async signIn(email, password) { const c = await connect(); return must(await c.auth.signInWithPassword({ email, password })); },
    async signOut() { const c = await connect(); await c.auth.signOut(); }
  };

  // ---------------------------------------------------------------------------
  // BACKUP IMPORT (localStorage JSON -> Supabase). Run once, logged in as admin.
  // ---------------------------------------------------------------------------
  async function uploadDataUri(c, dataUri, path) {
    const blob = await (await fetch(dataUri)).blob();
    const { error } = await c.storage.from('product-images').upload(path, blob, { upsert: true, contentType: blob.type });
    if (error) throw new Error('Upload de imagem falhou: ' + error.message);
    return c.storage.from('product-images').getPublicUrl(path).data.publicUrl;
  }

  async function importBackup(payload, onProgress = () => {}) {
    if (!payload || payload.app !== 'store-imports') throw new Error('Arquivo não é um backup do Store Imports.');
    const c = await connect();
    const d = payload.data;
    const ins = async (table, rows, conflict = 'id') => {
      if (!rows.length) return;
      onProgress(`${table}: ${rows.length}`);
      must(await c.from(table).upsert(rows, { onConflict: conflict }));
    };

    await ins('categories', (d.categories || []).map(toRow.category));

    const products = d.products || [];
    await ins('products', products.map(toRow.product));
    await ins('product_variants', products.flatMap(p => (p.variants || []).map(v => toRow.variant(v, p.id))));

    const imageRows = [];
    for (const p of products) {
      let order = 0;
      for (const img of (p.images || [])) {
        if (!img.src || img.src.includes('placeholder')) continue;
        const src = img.src.startsWith('data:') ? await uploadDataUri(c, img.src, `${p.id}/${img.id}.jpg`) : img.src;
        imageRows.push({ id: img.id, product_id: p.id, src, alt: img.alt || p.name, is_primary: !!img.isPrimary, sort_order: order++ });
      }
    }
    await ins('product_images', imageRows);

    const reservations = d.reservations || [];
    await ins('reservations', reservations.map(toRow.reservation));
    // child rows have generated UUID keys: wipe-and-reinsert keeps the import re-runnable
    for (const r of reservations) {
      must(await c.from('reservation_items').delete().eq('reservation_id', r.id));
      if ((r.items || []).length) must(await c.from('reservation_items').insert(r.items.map(i => toRow.reservationItem(i, r.id))));
    }

    const sales = d.sales || [];
    await ins('sales', sales.map(toRow.sale));
    for (const s of sales) {
      must(await c.from('sale_items').delete().eq('sale_id', s.id));
      if ((s.items || []).length) must(await c.from('sale_items').insert(s.items.map(i => toRow.saleItem(i, s.id))));
    }

    // Demo seeds contain dangling links (e.g. a movement pointing at a sale that was never created);
    // drop those references so the foreign keys accept the rows.
    const saleIds = new Set(sales.map(s => s.id));
    const resIds = new Set(reservations.map(r => r.id));
    await ins('stock_movements', (d.stockMovements || []).map(m => {
      const row = toRow.stockMovement(m);
      if (row.related_sale_id && !saleIds.has(row.related_sale_id)) row.related_sale_id = null;
      if (row.related_reservation_id && !resIds.has(row.related_reservation_id)) row.related_reservation_id = null;
      return row;
    }));
    await ins('maintenances', (d.maintenances || []).map(toRow.maintenance));
    await ins('promotions', (d.promotions || []).map(toRow.promotion));
    await ins('activity_logs', (d.activityLog || []).map(toRow.activityLog));
    onProgress('Concluído');
  }

  return { isConfigured, connect, api, importBackup, toRow, fromRow };
})();
