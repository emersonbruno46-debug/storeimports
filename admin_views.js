/**
 * Store Imports - Admin screens (V4 redesign)
 * Renders Produtos, Categorias, Estoque, Reservas, Vendas, Manutenções, Promoções e Equipe.
 * Business rules (stock adjustment, invoicing, refunds…) stay in admin.js / store_data.js.
 * Loaded after admin.js.
 */

// ==========================================
// SHARED UI HELPERS
// ==========================================
function icon(name, size) {
  return `<i data-lucide="${name}"${size ? ` style="width:${size}px;height:${size}px"` : ''}></i>`;
}

function initials(name) {
  const parts = String(name || '?').trim().split(/\s+/).filter(Boolean);
  return ((parts[0] || '?')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

function timeAgo(iso) {
  const t = new Date(iso).getTime();
  if (!t) return '';
  const min = Math.floor((Date.now() - t) / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} dia${d > 1 ? 's' : ''}`;
}

function productImage(p) {
  const imgs = (p && p.images) || [];
  const primary = imgs.find(i => i.isPrimary) || imgs[0];
  const src = primary && primary.src ? primary.src : './assets/placeholder.svg';
  return src;
}

function categoryImage(c) {
  if (!c.image) return '';
  return c.image.startsWith('data:') || c.image.startsWith('http') ? c.image : `./assets/${c.image}`;
}

/** Renders a row of filter chips. items: [{value,label,count}] */
function renderChips(hostId, items, active, onPick) {
  const host = document.getElementById(hostId);
  if (!host) return;
  host.innerHTML = items.map(i => `<button type="button" class="chip${i.value === active ? ' active' : ''}" data-v="${esc(i.value)}">${esc(i.label)}${i.count !== undefined ? `<b>${i.count}</b>` : ''}</button>`).join('');
  host.querySelectorAll('.chip').forEach(b => b.addEventListener('click', () => onPick(b.dataset.v)));
}

function stockMeter(qty, min) {
  const level = qty === 0 ? 'zero' : (qty <= min ? 'low' : 'ok');
  const pct = qty === 0 ? 0 : Math.min(100, Math.round(qty / Math.max(min * 3, 1) * 100));
  return { level, html: `<div class="meter-wrap"><div class="meter ${level}"><i style="width:${Math.max(pct, qty ? 6 : 0)}%"></i></div><span><b>${qty}</b> un${min ? ` <em>· mín. ${min}</em>` : ''}</span></div>` };
}

function emptyState(iconName, title, text) {
  return `<div class="ui-empty">${icon(iconName)}<strong>${esc(title)}</strong><span>${esc(text)}</span></div>`;
}

function refreshIcons() { if (window.lucide) lucide.createIcons(); }

// ==========================================
// DRAWERS
// ==========================================
function openDrawer(id) {
  const d = document.getElementById(id);
  if (!d) return;
  d.classList.add('open');
  d.setAttribute('aria-hidden', 'false');
  document.getElementById('drawer-backdrop').classList.add('open');
  refreshIcons();
}

function closeDrawer(id) {
  const targets = id ? [document.getElementById(id)] : document.querySelectorAll('.drawer.open');
  targets.forEach(d => { if (d) { d.classList.remove('open'); d.setAttribute('aria-hidden', 'true'); } });
  if (!document.querySelector('.drawer.open')) document.getElementById('drawer-backdrop').classList.remove('open');
}

// ==========================================
// PRODUTOS
// ==========================================
function renderProductsTable() {
  const tbody = document.getElementById('admin-products-table-tbody');
  if (!tbody) return;

  const query = adminSearchProducts ? adminSearchProducts.value.trim().toLowerCase() : '';
  const category = adminFilterProductsCategory ? adminFilterProductsCategory.value : '';

  const chips = [{ value: '', label: 'Todos', count: state.products.length }].concat(
    state.categories.map(c => ({ value: c.id, label: c.name, count: state.products.filter(p => p.categoryId === c.id).length })).filter(c => c.count > 0)
  );
  renderChips('products-chips', chips, category, (v) => {
    if (adminFilterProductsCategory) adminFilterProductsCategory.value = v;
    renderProductsTable();
  });

  const filtered = state.products.filter(p => {
    if (category && p.categoryId !== category) return false;
    if (!query) return true;
    return [p.name, p.brand, p.sku, p.model].some(v => String(v || '').toLowerCase().includes(query));
  });

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="6">${emptyState('package-search', 'Nenhum produto encontrado', 'Ajuste a busca ou limpe o filtro de categoria.')}</td></tr>`;
    refreshIcons();
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const total = getProductTotalStock(p);
    const min = getProductMinimumStock(p);
    const v = getPrimaryVariant(p);
    const base = v ? v.priceCents : 0;
    const hasPromo = v && v.promotionalPriceCents !== null && v.promotionalPriceCents !== undefined && v.promotionalPriceCents < base;
    const cat = (state.categories.find(c => c.id === p.categoryId) || {}).name || p.categoryId;
    const active = p.status !== 'inactive';
    const nVars = (p.variants || []).length;
    const meter = stockMeter(total, min);
    return `
      <tr class="${active ? '' : 'is-off'}">
        <td><div class="pcell"><span class="thumb"><img src="${esc(productImage(p))}" alt="" loading="lazy" onerror="this.onerror=null;this.src='./assets/placeholder.svg'"></span>
          <div><strong>${esc(p.name)}</strong><span class="sub">${esc(p.brand)} · ${esc(p.sku || 'sem código')}${nVars > 1 ? ` · ${nVars} variações` : ''}${p.condition === 'new' ? '' : ' · <b class="tag warn">Seminovo</b>'}</span></div></div></td>
        <td><span class="tag">${esc(cat)}</span></td>
        <td class="num">${hasPromo ? `<strong class="promo-price">${formatBRLFromCents(v.promotionalPriceCents)}</strong><s>${formatBRLFromCents(base)}</s>` : `<strong>${formatBRLFromCents(base)}</strong>`}</td>
        <td>${meter.html}</td>
        <td><button type="button" class="ui-switch${active ? ' on' : ''}" role="switch" aria-checked="${active}" data-toggle="${esc(p.id)}" title="${active ? 'Visível no catálogo — clique para ocultar' : 'Oculto — clique para publicar'}"><i></i></button><span class="ui-switch-label">${active ? 'No catálogo' : 'Oculto'}</span></td>
        <td class="actions-col"><button type="button" class="icon-btn" data-edit="${esc(p.id)}" title="Editar produto">${icon('pencil')}</button></td>
      </tr>`;
  }).join('');

  tbody.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openProductFormModal(b.dataset.edit)));
  tbody.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', () => deleteProduct(b.dataset.toggle)));
  refreshIcons();
}

// ==========================================
// CATEGORIAS
// ==========================================
function renderCategoriesTable() {
  const grid = document.getElementById('admin-categories-grid');
  if (!grid) return;
  const query = (document.getElementById('admin-search-categories')?.value || '').trim().toLowerCase();
  const list = state.categories.filter(c => !query || c.name.toLowerCase().includes(query) || c.id.toLowerCase().includes(query));

  if (!list.length) { grid.innerHTML = emptyState('folder-search', 'Nenhuma categoria encontrada', 'Crie uma nova categoria para organizar a vitrine.'); refreshIcons(); return; }

  grid.innerHTML = list.map(c => {
    const count = state.products.filter(p => p.categoryId === c.id && p.status === 'active').length;
    const img = categoryImage(c);
    const active = c.status === 'active';
    return `
      <article class="cat-card${active ? '' : ' is-off'}">
        <div class="cat-media">${img ? `<img src="${esc(img)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='./assets/placeholder.svg'">` : icon('image')}</div>
        <div class="cat-body">
          <strong>${esc(c.name)}</strong>
          <span class="sub">${count} produto${count !== 1 ? 's' : ''} ativo${count !== 1 ? 's' : ''}</span>
        </div>
        <div class="cat-foot">
          <span class="pill ${active ? 'ok' : 'off'}">${active ? 'Visível' : 'Oculta'}</span>
          <span class="grow"></span>
          <button type="button" class="icon-btn" data-edit-cat="${esc(c.id)}" title="Editar">${icon('pencil')}</button>
          <button type="button" class="icon-btn danger" data-del-cat="${esc(c.id)}" title="Ocultar categoria">${icon('eye-off')}</button>
        </div>
      </article>`;
  }).join('');
  grid.querySelectorAll('[data-edit-cat]').forEach(b => b.addEventListener('click', () => openCategoryFormModal(b.dataset.editCat)));
  grid.querySelectorAll('[data-del-cat]').forEach(b => b.addEventListener('click', () => deleteCategory(b.dataset.delCat)));
  refreshIcons();
}

// ==========================================
// ESTOQUE
// ==========================================
const viewState = { stockFilter: '', stockView: 'position', saleFilter: '' };

function flattenVariants() {
  const rows = [];
  state.products.filter(p => p.status === 'active').forEach(p => (p.variants || []).filter(v => v.active !== false).forEach(v => rows.push({ p, v })));
  return rows;
}

function stockLevel(v) {
  const q = v.stockQuantity || 0;
  return q === 0 ? 'zero' : (q <= (v.minimumStock || 0) ? 'low' : 'ok');
}

function renderStockLogsTable() {
  state.products = getProducts();
  state.stockLogs = getStockMovements();
  const rows = flattenVariants();
  const units = rows.reduce((s, r) => s + (r.v.stockQuantity || 0), 0);
  const cost = rows.reduce((s, r) => s + (r.v.stockQuantity || 0) * (r.v.costCents || 0), 0);
  const zero = rows.filter(r => stockLevel(r.v) === 'zero').length;
  const low = rows.filter(r => stockLevel(r.v) === 'low').length;

  const sum = document.getElementById('stock-summary');
  if (sum) {
    sum.innerHTML = [
      { l: 'Unidades em estoque', v: units, s: `${rows.length} variações`, c: 'purple', i: 'boxes' },
      { l: 'Valor a custo', v: formatBRLFromCents(cost), s: 'capital parado', c: 'green', i: 'wallet' },
      { l: 'Estoque baixo', v: low, s: 'abaixo do mínimo', c: 'amber', i: 'package-minus', f: 'low' },
      { l: 'Sem estoque', v: zero, s: 'indisponíveis no site', c: 'red', i: 'package-x', f: 'zero' }
    ].map(t => `<button type="button" class="tile ${t.c}${t.f ? ' clickable' : ''}" ${t.f ? `data-stock-filter="${t.f}"` : 'tabindex="-1"'}><span class="tile-ico">${icon(t.i)}</span><span class="tile-l">${esc(t.l)}</span><strong>${esc(t.v)}</strong><span class="tile-s">${esc(t.s)}</span></button>`).join('');
    sum.querySelectorAll('[data-stock-filter]').forEach(b => b.addEventListener('click', () => { viewState.stockFilter = b.dataset.stockFilter; setStockView('position'); renderStockLogsTable(); }));
  }

  renderChips('stock-chips', [
    { value: '', label: 'Todos', count: rows.length },
    { value: 'low', label: 'Baixo', count: low },
    { value: 'zero', label: 'Sem estoque', count: zero },
    { value: 'ok', label: 'Em dia', count: rows.length - low - zero }
  ], viewState.stockFilter, (v) => { viewState.stockFilter = v; renderStockLogsTable(); });

  const q = (document.getElementById('admin-search-stock')?.value || '').trim().toLowerCase();
  const filtered = rows.filter(r => {
    if (viewState.stockFilter && stockLevel(r.v) !== viewState.stockFilter) return false;
    if (!q) return true;
    return [r.p.name, r.p.brand, r.v.color, r.v.capacity, r.v.sku].some(x => String(x || '').toLowerCase().includes(q));
  }).sort((a, b) => ({ zero: 0, low: 1, ok: 2 }[stockLevel(a.v)] - { zero: 0, low: 1, ok: 2 }[stockLevel(b.v)]) || a.p.name.localeCompare(b.p.name));

  const pos = document.getElementById('admin-stock-position-tbody');
  if (pos) {
    if (!filtered.length) pos.innerHTML = `<tr><td colspan="5">${emptyState('package-check', 'Nada por aqui', 'Nenhuma variação corresponde ao filtro.')}</td></tr>`;
    else pos.innerHTML = filtered.map(({ p, v }) => {
      const lvl = stockLevel(v);
      const label = { zero: 'Sem estoque', low: 'Baixo', ok: 'Em dia' }[lvl];
      const spec = [v.color, v.capacity].filter(Boolean).join(' · ');
      return `
        <tr>
          <td><div class="pcell"><span class="thumb"><img src="${esc(productImage(p))}" alt="" loading="lazy" onerror="this.onerror=null;this.src='./assets/placeholder.svg'"></span><div><strong>${esc(p.name)}</strong><span class="sub">${esc(spec || 'Padrão')}</span></div></div></td>
          <td><span class="mono">${esc(v.sku || p.sku)}</span></td>
          <td>${stockMeter(v.stockQuantity || 0, v.minimumStock || 0).html}</td>
          <td><span class="pill ${lvl}">${label}</span></td>
          <td class="actions-col"><div class="quick-adj">
            <button type="button" class="btn btn-secondary btn-sm" data-adj="Saída" data-p="${esc(p.id)}" data-v="${esc(v.id)}" title="Registrar saída">${icon('minus')}</button>
            <button type="button" class="btn btn-primary btn-sm" data-adj="Entrada" data-p="${esc(p.id)}" data-v="${esc(v.id)}" title="Registrar entrada">${icon('plus')} Entrada</button>
          </div></td>
        </tr>`;
    }).join('');
    pos.querySelectorAll('[data-adj]').forEach(b => b.addEventListener('click', () => openStockDrawer(b.dataset.p, b.dataset.v, b.dataset.adj)));
  }

  const hist = document.getElementById('admin-stock-logs-tbody');
  if (hist) {
    const logs = [...state.stockLogs].sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0)).slice(0, 200);
    if (!logs.length) hist.innerHTML = `<tr><td colspan="6">${emptyState('history', 'Sem movimentações', 'As entradas, saídas e vendas aparecem aqui.')}</td></tr>`;
    else hist.innerHTML = logs.map(l => {
      const out = l.type === 'exit' || l.type === 'negative_adjustment';
      const label = { entry: 'Entrada', exit: 'Saída', positive_adjustment: 'Ajuste +', negative_adjustment: 'Ajuste −' }[l.type] || l.type;
      const prod = getProductById(l.productId);
      const who = l.actorUserId === 'user-1' || !l.actorUserId ? 'Painel' : l.actorUserId;
      return `<tr>
        <td><span class="sub" style="font-size:.82rem">${esc(formatDateTimePtBr(l.createdAt || l.timestamp))}</span></td>
        <td><strong>${esc(prod ? prod.name : (l.productName || l.productId || '—'))}</strong></td>
        <td><span class="move ${out ? 'out' : 'in'}">${out ? '−' : '+'}${l.quantity || 0}</span> <span class="sub">${esc(label)}</span></td>
        <td class="sub">${l.previousQuantity ?? '—'} → <b>${l.resultingQuantity ?? '—'}</b></td>
        <td>${esc(l.reason || '—')}</td>
        <td><span class="tag">${esc(who)}</span></td></tr>`;
    }).join('');
  }
  refreshIcons();
}

function setStockView(view) {
  viewState.stockView = view;
  document.querySelectorAll('[data-stock-view]').forEach(b => b.classList.toggle('active', b.dataset.stockView === view));
  document.getElementById('stock-view-position')?.classList.toggle('d-none', view !== 'position');
  document.getElementById('stock-view-history')?.classList.toggle('d-none', view !== 'history');
}

const STOCK_REASONS = {
  'Entrada': ['Compra do fornecedor', 'Devolução de cliente', 'Reposição'],
  'Saída': ['Avaria', 'Perda / extravio', 'Uso interno'],
  'Ajuste': ['Contagem de inventário', 'Correção de lançamento']
};

function currentStockVariant() {
  const val = document.getElementById('stock-adjust-product').value || '';
  const [pid, vid] = val.split('||');
  const p = state.products.find(x => x.id === pid);
  const v = p && (p.variants || []).find(x => x.id === vid);
  return v ? { p, v } : null;
}

function updateStockHints() {
  const cur = currentStockVariant();
  const type = document.getElementById('stock-adjust-type').value;
  const amt = parseInt(document.getElementById('stock-adjust-amount').value);
  const h1 = document.getElementById('stock-current-hint');
  const h2 = document.getElementById('stock-result-hint');
  if (!cur) { h1.textContent = ''; h2.textContent = ''; return; }
  const q = cur.v.stockQuantity || 0;
  h1.textContent = `Saldo atual: ${q} un`;
  h2.className = 'hint';
  if (isNaN(amt)) { h2.textContent = ''; return; }
  let next = q;
  if (type === 'Entrada') next = q + amt; else if (type === 'Saída') next = q - amt; else next = amt;
  if (next < 0) { h2.textContent = `Saída maior que o saldo (${q} un).`; h2.classList.add('bad'); return; }
  h2.textContent = `Saldo ficará em ${next} un`;
}

function setStockType(type) {
  document.getElementById('stock-adjust-type').value = type;
  document.querySelectorAll('#stock-type-cards .opt-card').forEach(c => c.classList.toggle('active', c.dataset.type === type));
  document.getElementById('stock-amount-label').textContent = { 'Entrada': 'Quantidade que entrou', 'Saída': 'Quantidade que saiu', 'Ajuste': 'Quantidade contada (saldo final)' }[type];
  const chips = document.getElementById('stock-reason-chips');
  chips.innerHTML = (STOCK_REASONS[type] || []).map(r => `<button type="button" class="chip" data-reason="${esc(r)}">${esc(r)}</button>`).join('');
  chips.querySelectorAll('[data-reason]').forEach(b => b.addEventListener('click', () => { document.getElementById('stock-adjust-reason').value = b.dataset.reason; }));
  updateStockHints();
}

function openStockDrawer(prodId, varId, type) {
  populateProductSelects();
  const sel = document.getElementById('stock-adjust-product');
  if (prodId && varId) sel.value = `${prodId}||${varId}`;
  sel.dispatchEvent(new Event('change'));
  document.getElementById('stock-adjust-amount').value = '';
  document.getElementById('stock-adjust-reason').value = '';
  const imeis = document.getElementById('stock-adjust-imeis'); if (imeis) imeis.value = '';
  setStockType(type || 'Entrada');
  openDrawer('drawer-stock');
  setTimeout(() => document.getElementById('stock-adjust-amount').focus(), 150);
}

// ==========================================
// RESERVAS
// ==========================================
const RES_FLOW = ['new', 'contacted', 'confirmed', 'completed'];
const RES_NEXT = {
  new: { to: 'contacted', label: 'Registrar contato', icon: 'phone-call' },
  contacted: { to: 'confirmed', label: 'Confirmar retirada', icon: 'calendar-check' },
  confirmed: { to: 'completed', label: 'Faturar venda', icon: 'badge-dollar-sign', cls: 'success' }
};
const RES_LABEL = { new: 'Nova', contacted: 'Contatada', confirmed: 'Confirmada', completed: 'Finalizada', cancelled: 'Cancelada' };

function pickupInfo(res) {
  if (!res.requestedDate) return { text: '—', cls: '' };
  const d = new Date(res.requestedDate); d.setHours(0, 0, 0, 0);
  const days = Math.round((d.getTime() - startOfToday()) / DAY_MS);
  const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const active = ['new', 'contacted', 'confirmed'].includes(res.status);
  let rel;
  if (days === 0) rel = 'hoje'; else if (days === 1) rel = 'amanhã'; else if (days === -1) rel = 'ontem';
  else if (days > 1) rel = `em ${days} dias`; else rel = `há ${-days} dias`;
  return { text: `${date} · ${rel}`, cls: active && days < 0 ? 'late' : (active && days <= 1 ? 'soon' : '') };
}

function renderReservationsTable() {
  const host = document.getElementById('admin-reservations-list');
  if (!host) return;
  state.reservations = getReservations();
  const query = adminSearchReservations ? adminSearchReservations.value.trim().toLowerCase() : '';
  const status = adminFilterReservationsStatus ? adminFilterReservationsStatus.value : '';
  const all = state.reservations;
  const count = s => all.filter(r => r.status === s).length;

  renderChips('reservation-chips', [
    { value: '', label: 'Todas', count: all.length },
    { value: 'new', label: 'Novas', count: count('new') },
    { value: 'contacted', label: 'Contatadas', count: count('contacted') },
    { value: 'confirmed', label: 'Confirmadas', count: count('confirmed') },
    { value: 'completed', label: 'Finalizadas', count: count('completed') },
    { value: 'cancelled', label: 'Canceladas', count: count('cancelled') }
  ], status, (v) => { if (adminFilterReservationsStatus) adminFilterReservationsStatus.value = v; renderReservationsTable(); });

  const rank = { new: 0, contacted: 1, confirmed: 2, completed: 3, cancelled: 4 };
  const list = all.filter(r => {
    if (status && r.status !== status) return false;
    if (!query) return true;
    return (r.demoCustomerName || '').toLowerCase().includes(query) || (r.code || '').toLowerCase().includes(query)
      || (query.replace(/\D/g, '') && (r.demoContactLabel || '').replace(/\D/g, '').includes(query.replace(/\D/g, '')));
  }).sort((a, b) => (rank[a.status] - rank[b.status]) || (rank[a.status] < 3
    ? new Date(a.requestedDate || 0) - new Date(b.requestedDate || 0)
    : new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));

  if (!list.length) { host.innerHTML = emptyState('calendar-search', 'Nenhuma reserva por aqui', 'Quando um cliente reservar pelo catálogo, o pedido aparece nesta lista.'); refreshIcons(); return; }

  host.innerHTML = list.map(res => {
    const pickup = pickupInfo(res);
    const next = RES_NEXT[res.status];
    const wa = buildWhatsappLink(res.demoContactLabel);
    const first = (res.demoCustomerName || '').split(' ')[0];
    const itemsTxt = (res.items || []).map(i => { const p = getProductById(i.productId); return `${i.quantity}x ${p ? p.name : 'produto'}`; }).join(', ');
    const msg = {
      new: `Olá ${first}, tudo bem? Aqui é da ${DEMO_CONFIG.storeName}. Recebi sua reserva ${res.code} (${itemsTxt}). Posso confirmar a retirada?`,
      contacted: `Olá ${first}! Sobre a reserva ${res.code}: posso confirmar a retirada para ${pickup.text.split(' · ')[0]}?`,
      confirmed: `Olá ${first}! Sua reserva ${res.code} está separada e te esperando na loja.`
    }[res.status] || `Olá ${first}! Sobre a reserva ${res.code}.`;
    const progressIdx = RES_FLOW.indexOf(res.status);
    const items = (res.items || []).map(i => {
      const p = getProductById(i.productId);
      const v = p ? getVariantById(p, i.variantId) : null;
      const spec = v ? [v.color, v.capacity].filter(Boolean).join(' ') : '';
      return `<li><b>${i.quantity}×</b> ${esc(p ? p.name : 'Produto removido')}${spec ? ` <em>${esc(spec)}</em>` : ''}</li>`;
    }).join('');
    return `
      <article class="res-card s-${res.status}">
        <div class="res-main">
          <div class="res-top"><span class="avatar">${esc(initials(res.demoCustomerName))}</span>
            <div><strong>${esc(res.demoCustomerName || 'Cliente')}</strong><span class="sub">${esc(res.code)} · pedido ${esc(timeAgo(res.createdAt))}${res.demoContactLabel ? ' · ' + esc(res.demoContactLabel) : ''}</span></div>
            <span class="pill r-${res.status}">${RES_LABEL[res.status] || res.status}</span></div>
          <ul class="res-items">${items || '<li><em>Sem itens</em></li>'}</ul>
          ${res.notes ? `<p class="res-note">${icon('message-square-text', 14)} ${esc(res.notes)}</p>` : ''}
        </div>
        <div class="res-meta">
          <div><span class="lbl">Retirada</span><strong class="when ${pickup.cls}">${esc(pickup.text)}</strong></div>
          <div><span class="lbl">Valor</span><strong>${formatBRLFromCents(res.estimatedTotalCents || 0)}</strong></div>
        </div>
        <div class="res-actions">
          ${wa ? `<a class="btn btn-wa" href="${esc(wa)}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener noreferrer">${icon('message-circle')} WhatsApp</a>` : '<span class="sub">Sem telefone</span>'}
          ${next ? `<button type="button" class="btn btn-primary${next.cls ? ' ' + next.cls : ''}" data-next="${esc(res.id)}" data-to="${next.to}">${icon(next.icon)} ${next.label}</button>` : ''}
          ${next ? `<button type="button" class="icon-btn danger" data-cancel="${esc(res.id)}" title="Cancelar reserva">${icon('x')}</button>` : ''}
        </div>
        ${res.status !== 'cancelled' ? `<ol class="flow">${['Nova', 'Contato', 'Confirmada', 'Finalizada'].map((l, i) => `<li class="${i <= progressIdx ? 'done' : ''}${i === progressIdx ? ' now' : ''}">${l}</li>`).join('')}</ol>` : ''}
      </article>`;
  }).join('');

  host.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => changeReservationStatus(b.dataset.next, b.dataset.to)));
  host.querySelectorAll('[data-cancel]').forEach(b => b.addEventListener('click', () => {
    if (confirm('Cancelar esta reserva? O cliente não será avisado automaticamente.')) changeReservationStatus(b.dataset.cancel, 'cancelled');
  }));
  refreshIcons();
}

// ==========================================
// VENDAS
// ==========================================
function renderSalesLogsTable() {
  state.sales = getSales();
  const tbody = document.getElementById('admin-sales-log-tbody');
  if (!tbody) return;

  const done = state.sales.filter(s => s.status === 'completed');
  const sumOf = (list) => list.reduce((a, s) => a + (s.totalCents || 0), 0);
  const today = startOfToday();
  const t0 = done.filter(s => new Date(s.createdAt).getTime() >= today);
  const d7 = done.filter(s => new Date(s.createdAt).getTime() >= today - 6 * DAY_MS);
  const d30 = done.filter(s => new Date(s.createdAt).getTime() >= today - 29 * DAY_MS);
  const refunds = state.sales.filter(s => s.status === 'cancelled').length;
  const sum = document.getElementById('sales-summary');
  if (sum) {
    sum.innerHTML = [
      { l: 'Hoje', v: formatBRLFromCents(sumOf(t0)), s: `${t0.length} venda${t0.length !== 1 ? 's' : ''}`, c: 'green', i: 'sun' },
      { l: 'Últimos 7 dias', v: formatBRLFromCents(sumOf(d7)), s: `${d7.length} venda${d7.length !== 1 ? 's' : ''}`, c: 'purple', i: 'calendar-range' },
      { l: 'Ticket médio (30 dias)', v: formatBRLFromCents(d30.length ? Math.round(sumOf(d30) / d30.length) : 0), s: 'por venda', c: 'orange', i: 'receipt' },
      { l: 'Estornos', v: refunds, s: 'no histórico', c: 'red', i: 'rotate-ccw' }
    ].map(t => `<div class="tile ${t.c}"><span class="tile-ico">${icon(t.i)}</span><span class="tile-l">${esc(t.l)}</span><strong>${esc(t.v)}</strong><span class="tile-s">${esc(t.s)}</span></div>`).join('');
  }

  renderChips('sales-chips', [
    { value: '', label: 'Todas', count: state.sales.length },
    { value: 'completed', label: 'Concluídas', count: done.length },
    { value: 'cancelled', label: 'Estornadas', count: refunds }
  ], viewState.saleFilter, (v) => { viewState.saleFilter = v; renderSalesLogsTable(); });

  const q = (document.getElementById('admin-search-sales')?.value || '').trim().toLowerCase();
  const list = state.sales.filter(s => (!viewState.saleFilter || s.status === viewState.saleFilter)
    && (!q || (s.code || '').toLowerCase().includes(q) || (s.demoCustomerName || '').toLowerCase().includes(q)))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!list.length) { tbody.innerHTML = `<tr><td colspan="7">${emptyState('shopping-bag', 'Nenhuma venda encontrada', 'Use “Nova venda” para registrar uma venda de balcão.')}</td></tr>`; refreshIcons(); return; }

  const payIcon = { pix: 'qr-code', credit: 'credit-card', debit: 'credit-card', cash: 'banknote' };
  tbody.innerHTML = list.map(sale => {
    const items = sale.items || [];
    const first = items[0] ? getProductById(items[0].productId) : null;
    const qty = items.reduce((a, i) => a + (i.quantity || 0), 0);
    const reversed = sale.status === 'cancelled';
    const pay = getPaymentMethodLabel(sale.demoPaymentMethod);
    const pk = /pix/i.test(pay) ? 'pix' : /créd|cred/i.test(pay) ? 'credit' : /déb|deb/i.test(pay) ? 'debit' : 'cash';
    return `<tr class="${reversed ? 'is-off' : ''}">
      <td><strong>${esc(sale.code)}</strong><span class="sub">${esc(formatDateTimePtBr(sale.createdAt))}</span></td>
      <td>${esc(first ? first.name : 'Venda')}${items.length > 1 ? ` <span class="tag">+${items.length - 1}</span>` : ''}<span class="sub">${qty} unidade${qty !== 1 ? 's' : ''}</span></td>
      <td>${esc(sale.demoCustomerName || 'Consumidor')}</td>
      <td><span class="payment">${icon(payIcon[pk], 14)} ${esc(pay)}</span></td>
      <td class="num"><strong>${formatBRLFromCents(sale.totalCents || 0)}</strong>${sale.discountCents ? `<span class="sub">desc. ${formatBRLFromCents(sale.discountCents)}</span>` : ''}</td>
      <td><span class="pill ${reversed ? 'zero' : 'ok'}">${reversed ? 'Estornada' : 'Concluída'}</span>${reversed && sale.reversalReason ? `<span class="sub" title="${esc(sale.reversalReason)}">${esc(sale.reversalReason.slice(0, 28))}${sale.reversalReason.length > 28 ? '…' : ''}</span>` : ''}</td>
      <td class="actions-col"><button type="button" class="icon-btn" data-print="${esc(sale.id)}" title="Imprimir cupom">${icon('printer')}</button>${reversed ? '' : `<button type="button" class="icon-btn danger" data-refund="${esc(sale.id)}" title="Estornar venda">${icon('rotate-ccw')}</button>`}</td>
    </tr>`;
  }).join('');
  tbody.querySelectorAll('[data-print]').forEach(b => b.addEventListener('click', () => printSaleCoupon(b.dataset.print)));
  tbody.querySelectorAll('[data-refund]').forEach(b => b.addEventListener('click', () => promptSaleReversal(b.dataset.refund)));
  refreshIcons();
}

function updateSaleTotal() {
  const el = document.getElementById('sale-total-preview');
  if (!el) return;
  const [pid, vid] = (document.getElementById('sale-select-product').value || '').split('||');
  const p = state.products.find(x => x.id === pid);
  const v = p && (p.variants || []).find(x => x.id === vid);
  const qty = Math.max(0, parseInt(document.getElementById('sale-qty').value) || 0);
  const disc = Math.max(0, Math.round((parseFloat(document.getElementById('sale-discount').value) || 0) * 100));
  const unit = v ? (v.promotionalPriceCents ?? v.priceCents) : 0;
  el.textContent = formatBRLFromCents(Math.max(0, unit * qty - disc));
}

function openSaleDrawer() {
  populateProductSelects();
  const pay = document.getElementById('sale-payment-method').value;
  document.querySelectorAll('#sale-pay-cards .opt-card').forEach(c => c.classList.toggle('active', c.dataset.pay === pay));
  updateSaleTotal();
  openDrawer('drawer-sale');
}

// ==========================================
// MANUTENÇÕES (quadro kanban)
// ==========================================
const MAINT_COLS = [
  { status: 'Não iniciado', title: 'Na fila', hint: 'Aguardando começar', cls: 'queue', next: { to: 'Aberto', label: 'Iniciar serviço', icon: 'play' } },
  { status: 'Aberto', title: 'Em andamento', hint: 'Na bancada', cls: 'doing', next: { to: 'Finalizado', label: 'Marcar como pronto', icon: 'check' } },
  { status: 'Finalizado', title: 'Prontos', hint: 'Avisar cliente / entregar', cls: 'done', next: null }
];

function renderMaintenancesTab() {
  state.maintenances = getMaintenances();
  const board = document.getElementById('maint-board');
  if (!board) return;
  const q = (document.getElementById('admin-search-maintenances')?.value || '').toLowerCase().trim();
  const list = state.maintenances.filter(m => !q || [m.device, m.customerName, m.code, m.problem].some(x => String(x || '').toLowerCase().includes(q)));

  board.innerHTML = MAINT_COLS.map(col => {
    const items = list.filter(m => m.status === col.status).sort((a, b) => new Date(a.entryDate || a.createdAt) - new Date(b.entryDate || b.createdAt));
    const total = items.reduce((s, m) => s + (m.estimatedCostCents || 0), 0);
    const cards = items.map(m => {
      const days = Math.floor((Date.now() - new Date(m.entryDate || m.createdAt).getTime()) / DAY_MS);
      const late = col.status !== 'Finalizado' && days > 3;
      const wa = buildWhatsappLink(m.customerPhone);
      const msg = col.status === 'Finalizado'
        ? `Olá ${(m.customerName || '').split(' ')[0]}! Seu ${m.device} já está pronto para retirada na ${DEMO_CONFIG.storeName}.`
        : `Olá ${(m.customerName || '').split(' ')[0]}! Sobre o conserto do seu ${m.device}.`;
      return `
        <article class="m-card">
          <div class="m-top"><strong>${esc(m.device)}</strong><span class="mono">${esc(m.code)}</span></div>
          <p class="m-problem">${esc(m.problem)}</p>
          <div class="m-cust"><span class="avatar sm">${esc(initials(m.customerName))}</span><span>${esc(m.customerName)}</span></div>
          <div class="m-meta"><strong>${formatBRLFromCents(m.estimatedCostCents || 0)}</strong><span class="${late ? 'late' : 'sub'}">${late ? icon('alarm-clock', 13) + ' ' : ''}${days === 0 ? 'entrou hoje' : `na loja há ${days} dia${days > 1 ? 's' : ''}`}</span></div>
          <div class="m-actions">
            ${col.next ? `<button type="button" class="btn btn-primary btn-sm" data-move="${esc(m.id)}" data-to="${esc(col.next.to)}">${icon(col.next.icon)} ${col.next.label}</button>` : `<button type="button" class="btn btn-secondary btn-sm" data-move="${esc(m.id)}" data-to="Aberto">${icon('undo-2')} Reabrir</button>`}
            ${wa ? `<a class="icon-btn wa" href="${esc(wa)}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener noreferrer" title="Chamar no WhatsApp">${icon('message-circle')}</a>` : ''}
            <button type="button" class="icon-btn" data-edit-m="${esc(m.id)}" title="Editar">${icon('pencil')}</button>
            <button type="button" class="icon-btn danger" data-del-m="${esc(m.id)}" title="Excluir">${icon('trash-2')}</button>
          </div>
        </article>`;
    }).join('');
    return `<section class="col ${col.cls}"><header class="col-head"><div><strong>${col.title}</strong><span class="sub">${col.hint}</span></div><div class="col-sum"><b>${items.length}</b><span>${formatBRLFromCents(total)}</span></div></header><div class="col-body">${cards || `<div class="col-empty">Nenhum aparelho aqui</div>`}</div></section>`;
  }).join('');

  board.querySelectorAll('[data-move]').forEach(b => b.addEventListener('click', () => {
    const m = state.maintenances.find(x => x.id === b.dataset.move);
    updateMaintenanceStatus(b.dataset.move, b.dataset.to);
    createActivityLog({ id: generateId('act'), type: 'info', message: `Manutenção ${m ? m.code : ''} (${m ? m.device : ''}) → ${b.dataset.to}`, actorUserId: 'user-1', createdAt: new Date().toISOString() });
    showAdminToast(`Manutenção movida para "${b.dataset.to}".`, 'success');
    renderMaintenancesTab();
    renderCategorySalesChart();
  }));
  board.querySelectorAll('[data-edit-m]').forEach(b => b.addEventListener('click', () => openMaintenanceModal(b.dataset.editM)));
  board.querySelectorAll('[data-del-m]').forEach(b => b.addEventListener('click', () => {
    const m = state.maintenances.find(x => x.id === b.dataset.delM);
    if (m && confirm(`Excluir a manutenção "${m.code} - ${m.device}"? Esta ação não pode ser desfeita.`)) {
      deleteMaintenance(m.id);
      showAdminToast('Manutenção removida.', 'warning');
      renderMaintenancesTab();
      renderCategorySalesChart();
    }
  }));
  refreshIcons();
}

// ==========================================
// PROMOÇÕES
// ==========================================
function promoScopeLabel() {
  const scope = document.getElementById('promo-scope').value;
  const detailSel = document.getElementById('promo-scope-detail');
  if (scope === 'all') return 'Toda a loja';
  if (scope === 'selected') return 'Produtos escolhidos';
  const txt = detailSel && detailSel.selectedOptions[0] ? detailSel.selectedOptions[0].textContent : '';
  return (scope === 'category' ? 'Categoria: ' : 'Marca: ') + txt;
}

function generatePromoPreview(opts) {
  const silent = !!(opts && opts.silent);
  const scope = document.getElementById('promo-scope').value;
  const detail = document.getElementById('promo-scope-detail') ? document.getElementById('promo-scope-detail').value : '';
  const type = document.getElementById('promo-discount-type').value;
  const value = parseFloat(document.getElementById('promo-discount-value').value);
  const tbody = document.getElementById('promo-preview-tbody');
  const summary = document.getElementById('promo-summary-body');
  const applyBtn = document.getElementById('btn-promo-apply-submit');
  promoPreviewProducts = [];

  let prods = [];
  if (scope === 'all') prods = [...state.products];
  else if (scope === 'category') prods = state.products.filter(p => p.categoryId === detail || p.categoryId === `cat-${detail}`);
  else if (scope === 'brand') prods = state.products.filter(p => p.brand === detail);
  else if (scope === 'selected') {
    const ids = Array.from(document.querySelectorAll('input[name="promo-select-product"]:checked')).map(cb => cb.value);
    prods = state.products.filter(p => ids.includes(p.id));
  }

  const valid = !isNaN(value) && value > 0 && !(type === 'percent' && value >= 100);
  if (valid) {
    prods.forEach(prod => (prod.variants || []).forEach(v => {
      const base = v.priceCents || 0;
      const next = type === 'percent' ? Math.round(base * (1 - value / 100)) : Math.max(0, base - Math.round(value * 100));
      promoPreviewProducts.push({
        productId: prod.id, variantId: v.id, productName: prod.name,
        variantLabel: [v.color, v.capacity].filter(Boolean).join(' ') || 'Padrão', sku: v.sku || prod.sku,
        basePriceCents: base, oldPromoPriceCents: v.promotionalPriceCents, costCents: v.costCents,
        newPromoPriceCents: Math.min(next, base), discountCents: base - Math.min(next, base)
      });
    }));
  }

  if (tbody) {
    tbody.innerHTML = promoPreviewProducts.length ? promoPreviewProducts.map(i => `<tr>
      <td><strong>${esc(i.productName)}</strong><span class="sub">${esc(i.variantLabel)}</span></td>
      <td class="num">${formatBRLFromCents(i.basePriceCents)}</td>
      <td class="num sub">${i.oldPromoPriceCents != null ? formatBRLFromCents(i.oldPromoPriceCents) : '—'}</td>
      <td class="num"><strong class="promo-price">${formatBRLFromCents(i.newPromoPriceCents)}</strong></td></tr>`).join('')
      : `<tr><td colspan="4">${emptyState('mouse-pointer-click', 'Nada para mostrar ainda', scope === 'selected' ? 'Marque ao menos um produto no passo 1.' : 'Informe um desconto válido no passo 2.')}</td></tr>`;
  }

  if (summary) {
    const n = promoPreviewProducts.length;
    const prodCount = new Set(promoPreviewProducts.map(i => i.productId)).size;
    const avg = n ? Math.round(promoPreviewProducts.reduce((a, i) => a + i.discountCents, 0) / n) : 0;
    const below = promoPreviewProducts.filter(i => i.costCents != null && i.newPromoPriceCents < i.costCents).length;
    const sample = promoPreviewProducts[0];
    summary.innerHTML = `
      <dl class="sum-list">
        <div><dt>Onde</dt><dd>${esc(promoScopeLabel())}</dd></div>
        <div><dt>Desconto</dt><dd>${type === 'percent' ? (isNaN(value) ? '—' : value + '%') : (isNaN(value) ? '—' : formatBRLFromCents(Math.round(value * 100)))}</dd></div>
        <div><dt>Atinge</dt><dd>${prodCount} produto${prodCount !== 1 ? 's' : ''} · ${n} variaç${n !== 1 ? 'ões' : 'ão'}</dd></div>
        <div><dt>Desconto médio</dt><dd>${formatBRLFromCents(avg)}</dd></div>
      </dl>
      ${sample ? `<div class="sum-sample"><span>Exemplo</span><strong>${esc(sample.productName)}</strong><div><s>${formatBRLFromCents(sample.basePriceCents)}</s> → <b>${formatBRLFromCents(sample.newPromoPriceCents)}</b></div></div>` : ''}
      ${below ? `<div class="warn-box">${icon('alert-triangle', 16)} ${below} variaç${below > 1 ? 'ões ficariam' : 'ão ficaria'} abaixo do preço de custo.</div>` : ''}
      ${!valid && !isNaN(value) && type === 'percent' && value >= 100 ? '<div class="warn-box">O desconto percentual precisa ser menor que 100%.</div>' : ''}`;
  }
  if (applyBtn) applyBtn.disabled = promoPreviewProducts.length === 0;
  refreshIcons();
}

function renderPromoActive() {
  const tbody = document.getElementById('promo-active-tbody');
  if (!tbody) return;
  const rows = [];
  state.products.forEach(p => (p.variants || []).forEach(v => {
    if (v.promotionalPriceCents != null && v.promotionalPriceCents < v.priceCents) rows.push({ p, v });
  }));
  const cnt = document.getElementById('promo-active-count');
  if (cnt) cnt.textContent = rows.length ? `${rows.length} variaç${rows.length > 1 ? 'ões' : 'ão'}` : '';
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="5">${emptyState('badge-percent', 'Nenhuma promoção ativa', 'Os preços promocionais aplicados aparecem aqui.')}</td></tr>`; refreshIcons(); return; }
  tbody.innerHTML = rows.map(({ p, v }) => {
    const pct = Math.round((1 - v.promotionalPriceCents / v.priceCents) * 100);
    const spec = [v.color, v.capacity].filter(Boolean).join(' · ');
    return `<tr>
      <td><div class="pcell"><span class="thumb"><img src="${esc(productImage(p))}" alt="" loading="lazy" onerror="this.onerror=null;this.src='./assets/placeholder.svg'"></span><div><strong>${esc(p.name)}</strong><span class="sub">${esc(spec || 'Padrão')}</span></div></div></td>
      <td class="num sub">${formatBRLFromCents(v.priceCents)}</td>
      <td class="num"><strong class="promo-price">${formatBRLFromCents(v.promotionalPriceCents)}</strong></td>
      <td class="num"><span class="pill ok">−${pct}%</span></td>
      <td class="actions-col"><button type="button" class="btn btn-secondary btn-sm" data-rm-promo="${esc(p.id)}||${esc(v.id)}">Remover</button></td></tr>`;
  }).join('');
  tbody.querySelectorAll('[data-rm-promo]').forEach(b => b.addEventListener('click', () => {
    const [pid, vid] = b.dataset.rmPromo.split('||');
    const prod = state.products.find(x => x.id === pid);
    const variant = prod && prod.variants.find(x => x.id === vid);
    if (!variant) return;
    variant.promotionalPriceCents = null;
    updateProduct(prod);
    state.products = getProducts();
    showAdminToast('Promoção removida.', 'success');
    renderCurrentTab();
  }));
  refreshIcons();
}

function renderPromoTab() {
  state.products = getProducts();
  document.getElementById('promo-scope').dispatchEvent(new Event('change'));
  renderPromoQuickValues();
  generatePromoPreview({ silent: true });
  renderPromoActive();
}

function renderPromoQuickValues() {
  const type = document.getElementById('promo-discount-type').value;
  const vals = type === 'percent' ? [5, 10, 15, 20] : [50, 100, 200, 500];
  document.getElementById('promo-affix').textContent = type === 'percent' ? '%' : 'R$';
  const host = document.getElementById('promo-quick-values');
  host.innerHTML = vals.map(v => `<button type="button" class="chip" data-qv="${v}">${type === 'percent' ? v + '%' : 'R$ ' + v}</button>`).join('');
  host.querySelectorAll('[data-qv]').forEach(b => b.addEventListener('click', () => { document.getElementById('promo-discount-value').value = b.dataset.qv; generatePromoPreview({ silent: true }); }));
}

function setupPromoV2() {
  const scopeSel = document.getElementById('promo-scope');
  if (!scopeSel) return;
  document.querySelectorAll('#promo-scope-cards .opt-card').forEach(card => card.addEventListener('click', () => {
    scopeSel.value = card.dataset.scope;
    document.querySelectorAll('#promo-scope-cards .opt-card').forEach(c => c.classList.toggle('active', c === card));
    scopeSel.dispatchEvent(new Event('change'));
    generatePromoPreview({ silent: true });
  }));
  document.querySelectorAll('#promo-type-seg [data-dtype]').forEach(btn => btn.addEventListener('click', () => {
    document.getElementById('promo-discount-type').value = btn.dataset.dtype;
    document.querySelectorAll('#promo-type-seg [data-dtype]').forEach(b => b.classList.toggle('active', b === btn));
    document.getElementById('promo-discount-value').value = btn.dataset.dtype === 'percent' ? 10 : 100;
    renderPromoQuickValues();
    generatePromoPreview({ silent: true });
  }));
  ['promo-discount-value', 'promo-scope-detail'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(id === 'promo-discount-value' ? 'input' : 'change', () => generatePromoPreview({ silent: true }));
  });
  const manual = document.getElementById('promo-manual-products-list');
  if (manual) manual.addEventListener('change', () => generatePromoPreview({ silent: true }));
  scopeSel.addEventListener('change', () => setTimeout(() => generatePromoPreview({ silent: true }), 0));
}

// ==========================================
// EQUIPE
// ==========================================
function renderTeam() {
  const host = document.getElementById('team-list');
  if (!host) return;
  const roles = { admin: 'Administrador', manager: 'Gerente', sales: 'Vendedor', stock: 'Estoquista' };
  const users = getUsers();
  host.innerHTML = users.map(u => `
    <div class="team-row"><span class="avatar">${esc(initials(u.name))}</span>
      <div class="grow"><strong>${esc(u.name)}</strong><span class="sub">${esc(u.email)}</span></div>
      <span class="tag">${esc(roles[u.roleId] || u.roleId)}</span>
      <span class="pill ${u.status === 'active' ? 'ok' : 'off'}">${u.status === 'active' ? 'Ativo' : 'Inativo'}</span></div>`).join('')
    || emptyState('users', 'Nenhum usuário', 'Os usuários reais serão criados no banco de dados.');
  refreshIcons();
}

// ==========================================
// WIRING
// ==========================================
function setupViewsV2() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-drawer]') || e.target.id === 'drawer-backdrop') closeDrawer();
    const step = e.target.closest('.stepper [data-step]');
    if (step) {
      const input = step.parentElement.querySelector('input');
      const min = input.min !== '' ? Number(input.min) : 0;
      input.value = Math.max(min, (parseInt(input.value) || 0) + Number(step.dataset.step));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

  // Estoque
  document.getElementById('btn-stock-new-movement')?.addEventListener('click', () => openStockDrawer(null, null, 'Entrada'));
  document.querySelectorAll('[data-stock-view]').forEach(b => b.addEventListener('click', () => setStockView(b.dataset.stockView)));
  document.getElementById('admin-search-stock')?.addEventListener('input', renderStockLogsTable);
  document.querySelectorAll('#stock-type-cards .opt-card').forEach(c => c.addEventListener('click', () => setStockType(c.dataset.type)));
  ['stock-adjust-amount'].forEach(id => document.getElementById(id)?.addEventListener('input', updateStockHints));
  document.getElementById('stock-adjust-product')?.addEventListener('change', updateStockHints);

  // Vendas
  document.getElementById('btn-sale-new')?.addEventListener('click', openSaleDrawer);
  document.getElementById('admin-search-sales')?.addEventListener('input', renderSalesLogsTable);
  document.querySelectorAll('#sale-pay-cards .opt-card').forEach(c => c.addEventListener('click', () => {
    document.getElementById('sale-payment-method').value = c.dataset.pay;
    document.querySelectorAll('#sale-pay-cards .opt-card').forEach(x => x.classList.toggle('active', x === c));
  }));
  ['sale-select-product', 'sale-qty', 'sale-discount'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.addEventListener('input', updateSaleTotal); el.addEventListener('change', updateSaleTotal); }
  });

  setupPromoV2();
}

document.addEventListener('DOMContentLoaded', setupViewsV2);
