/**
 * Store Imports - Administrative Dashboard Logic (V3)
 * Handles tab navigation, transactional invoicing, explicit sale reversals, variant-level bulk promotions, and inventory controls.
 */

// ==========================================
// STATE MANAGEMENT
// ==========================================
let state = {
  currentTab: 'overview',
  products: [],
  categories: [],
  reservations: [],
  sales: [],
  maintenances: [],
  stockLogs: [],
  activityLogs: [],
  selectedProductToEdit: null,
  selectedCategoryToEdit: null,
  selectedMaintenanceToEdit: null,
  activeFormTab: 'form-general',
  activeProfile: 'Thallys',
  overviewPeriod: 30
};

let stateProductFormImages = [];
let categorySalesChartInstance = null;

// TAB ALIASES MAPPING FOR PORTUGUESE/ENGLISH COMPATIBILITY
const TAB_ALIASES = {
  'overview': 'overview',
  'visao-geral': 'overview',
  'products': 'products',
  'produtos': 'products',
  'categories': 'categories',
  'categorias': 'categories',
  'stock': 'stock',
  'estoque': 'stock',
  'maintenances': 'maintenances',
  'manutencoes': 'maintenances',
  'assistencia': 'maintenances',
  'reservations': 'reservations',
  'reservas': 'reservations',
  'sales': 'sales',
  'vendas': 'sales',
  'pdv': 'sales',
  'promo': 'promo',
  'promocoes': 'promo',
  'users': 'users',
  'usuarios': 'users',
  'settings': 'settings',
  'config': 'settings',
  'configuracoes': 'settings'
};

const tabs = ['overview', 'products', 'categories', 'stock', 'maintenances', 'reservations', 'sales', 'promo', 'users', 'settings'];

// ==========================================
// WHATSAPP LINK UTILITIES
// ==========================================
/**
 * Build a wa.me URL from a raw phone string.
 * Strips non-digits, prepends 55 if needed.
 * Returns null if the number is too short.
 */
function buildWhatsappLink(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  const number = digits.startsWith('55') ? digits : '55' + digits;
  return `https://wa.me/${number}`;
}

/**
 * Return a DOM node: either a clickable <a> WhatsApp link or a plain text node.
 */
function renderWhatsappCell(phone, label) {
  const link = buildWhatsappLink(phone);
  if (!link) {
    return document.createTextNode(label || 'Sem telefone');
  }
  const a = document.createElement('a');
  a.href = link;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.title = 'Abrir WhatsApp';
  a.style.cssText = 'display:inline-flex;align-items:center;gap:5px;color:#16a34a;font-weight:600;text-decoration:none;white-space:nowrap;';
  // Inline WhatsApp SVG icon
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('xmlns', svgNS);
  svg.setAttribute('width', '14');
  svg.setAttribute('height', '14');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'currentColor');
  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z');
  svg.appendChild(path);
  a.appendChild(svg);
  a.appendChild(document.createTextNode('\u00a0' + (label || phone)));
  return a;
}



// ==========================================
// DOM ELEMENTS
// ==========================================
const adminSidebar = document.getElementById('admin-sidebar');
const btnSidebarToggle = document.getElementById('btn-sidebar-toggle');
const btnAdminHamburger = document.getElementById('btn-admin-hamburger');
const workspaceTitle = document.getElementById('workspace-title');

const adminProductModalOverlay = document.getElementById('admin-product-modal-overlay');
const adminAddProductForm = document.getElementById('admin-add-product-form');

const kpiTotalProducts = document.getElementById('kpi-total-products');
const kpiPendingRes = document.getElementById('kpi-pending-res');
const kpiLowStock = document.getElementById('kpi-low-stock');

const adminSearchProducts = document.getElementById('admin-search-products');
const adminFilterProductsCategory = document.getElementById('admin-filter-products-category');
const adminSearchReservations = document.getElementById('admin-search-reservations');
const adminFilterReservationsStatus = document.getElementById('admin-filter-reservations-status');

const adminStockAdjustForm = document.getElementById('admin-stock-adjust-form');
const adminSalesRegistryForm = document.getElementById('admin-sales-registry-form');

// ==========================================
// APP INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  setupSidebar();
  loadDatabase();
  setupActiveProfile();
  setupEventListeners();
  setupOverviewListeners();
  setupCommandPalette();
  setupSettingsPanel();
  setupHashRouter();
  initChartTooltips();
  if (window.lucide) lucide.createIcons();
});

function openModal(overlay) {
  if (!overlay) return;
  overlay.classList.remove('d-none');
  requestAnimationFrame(() => {
    overlay.classList.add('active');
  });
}

function closeModal(overlay) {
  if (!overlay) return;
  overlay.classList.remove('active');
  const handler = () => {
    overlay.classList.add('d-none');
    overlay.removeEventListener('transitionend', handler);
  };
  overlay.addEventListener('transitionend', handler, { once: true });
  setTimeout(() => overlay.classList.add('d-none'), 350);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.admin-modal-overlay.active').forEach(overlay => {
      closeModal(overlay);
    });
  }
});

function loadDatabase() {
  state.products = getProducts();
  state.categories = getCategories();
  state.reservations = getReservations();
  state.sales = getSales();
  state.maintenances = getMaintenances();
  state.stockLogs = getStockMovements();
  state.activityLogs = getActivityLog();
  
  let alreadyLogged = false;
  try { alreadyLogged = sessionStorage.getItem('si_admin_session_logged') === '1'; } catch (e) { /* storage blocked */ }
  if (!alreadyLogged) {
    createActivityLog({ id: `act-${Date.now()}`, type: 'info', message: `Sessão iniciada por ${state.activeProfile}.`, actorUserId: 'user-1', createdAt: new Date().toISOString() });
    try { sessionStorage.setItem('si_admin_session_logged', '1'); } catch (e) { /* storage blocked */ }
    state.activityLogs = getActivityLog();
  }
}

function saveToLocalStorage(key, data) {
  saveStoreData(key, data);
}

// ==========================================
// SIDEBAR & RESPONSIVE DRAWER
// ==========================================
function setupSidebar() {
  if (btnSidebarToggle) {
    btnSidebarToggle.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-collapsed');
      const icon = btnSidebarToggle.querySelector('i');
      if (icon) {
        if (document.body.classList.contains('sidebar-collapsed')) {
          icon.setAttribute('data-lucide', 'chevrons-right');
        } else {
          icon.setAttribute('data-lucide', 'menu');
        }
      }
      if (window.lucide) lucide.createIcons();
    });
  }
  
  if (btnAdminHamburger) {
    btnAdminHamburger.addEventListener('click', () => {
      document.body.classList.toggle('mobile-sidebar-active');
    });
  }

  document.addEventListener('click', (e) => {
    if (document.body.classList.contains('mobile-sidebar-active')) {
      const isClickInsideSidebar = adminSidebar && adminSidebar.contains(e.target);
      const isClickHamburger = btnAdminHamburger && btnAdminHamburger.contains(e.target);
      
      if (!isClickInsideSidebar && !isClickHamburger) {
        document.body.classList.remove('mobile-sidebar-active');
      }
    }
  });
}

// ==========================================
// EVENT LISTENERS & TAB ROUTING
// ==========================================
function setupEventListeners() {
  document.querySelectorAll('.sidebar-menu .menu-item-link').forEach(link => {
    const go = () => {
      const rawTab = link.getAttribute('data-tab');
      if (TAB_ALIASES[rawTab] === 'reservations') {
        if (adminFilterReservationsStatus) adminFilterReservationsStatus.value = '';
        if (adminSearchReservations) adminSearchReservations.value = '';
      }
      switchTab(rawTab);
      document.body.classList.remove('mobile-sidebar-active');
    };
    link.addEventListener('click', go);
    link.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  });

  const viewAllResBtn = document.getElementById('btn-view-all-res');
  if (viewAllResBtn) {
    viewAllResBtn.addEventListener('click', () => switchTab('reservations'));
  }

  if (adminSearchProducts) adminSearchProducts.addEventListener('input', renderProductsTable);
  if (adminFilterProductsCategory) adminFilterProductsCategory.addEventListener('change', renderProductsTable);

  if (adminSearchReservations) adminSearchReservations.addEventListener('input', renderReservationsTable);
  if (adminFilterReservationsStatus) adminFilterReservationsStatus.addEventListener('change', renderReservationsTable);

  // Maintenances search & filter listeners
  const searchMaint = document.getElementById('admin-search-maintenances');
  if (searchMaint) searchMaint.addEventListener('input', renderMaintenancesTab);
  const filterMaintStatus = document.getElementById('admin-filter-maintenances-status');
  if (filterMaintStatus) filterMaintStatus.addEventListener('change', renderMaintenancesTab);

  const btnAddMaint = document.getElementById('btn-admin-add-maintenance');
  if (btnAddMaint) btnAddMaint.addEventListener('click', () => openMaintenanceModal());

  const btnCancelMaint = document.getElementById('btn-admin-maint-cancel');
  if (btnCancelMaint) btnCancelMaint.addEventListener('click', closeMaintenanceModal);

  const maintModalOverlay = document.getElementById('admin-maintenance-modal-overlay');
  if (maintModalOverlay) {
    maintModalOverlay.addEventListener('click', (e) => {
      if (e.target === maintModalOverlay) closeMaintenanceModal();
    });
  }

  const formMaint = document.getElementById('admin-add-maintenance-form');
  if (formMaint) formMaint.addEventListener('submit', handleMaintenanceSubmit);

  const btnAddProd = document.getElementById('btn-admin-add-product');
  if (btnAddProd) btnAddProd.addEventListener('click', () => openProductFormModal());

  const btnCancelProd = document.getElementById('btn-admin-modal-cancel');
  if (btnCancelProd) btnCancelProd.addEventListener('click', closeProductFormModal);
  if (adminProductModalOverlay) {
    adminProductModalOverlay.addEventListener('click', (e) => {
      if (e.target === adminProductModalOverlay) closeProductFormModal();
    });
  }

  const btnAddCat = document.getElementById('btn-admin-add-category');
  if (btnAddCat) btnAddCat.addEventListener('click', () => openCategoryFormModal());
  
  const adminCatModalOverlay = document.getElementById('admin-category-modal-overlay');
  const btnCatCancel = document.getElementById('btn-admin-cat-cancel');
  if (btnCatCancel) {
    btnCatCancel.addEventListener('click', closeCategoryFormModal);
    if (adminCatModalOverlay) {
      adminCatModalOverlay.addEventListener('click', (e) => {
        if (e.target === adminCatModalOverlay) closeCategoryFormModal();
      });
    }
  }
  
  const formCat = document.getElementById('admin-add-category-form');
  if (formCat) formCat.addEventListener('submit', handleCategorySubmit);
  
  const searchCat = document.getElementById('admin-search-categories');
  if (searchCat) searchCat.addEventListener('input', renderCategoriesTable);

  if (adminAddProductForm) adminAddProductForm.addEventListener('submit', handleProductFormSubmit);
  if (adminStockAdjustForm) adminStockAdjustForm.addEventListener('submit', handleStockAdjustment);
  
  const adjustProductSelect = document.getElementById('stock-adjust-product');
  if (adjustProductSelect) {
    adjustProductSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      const prodId = val.split('||')[0];
      const prod = state.products.find(p => p.id === prodId);
      const imeiGroup = document.getElementById('stock-adjust-imeis-group');
      const isPhone = prod && ['cat-iphones', 'cat-android'].includes(prod.categoryId);
      if (imeiGroup) {
        if (isPhone) imeiGroup.classList.remove('d-none');
        else imeiGroup.classList.add('d-none');
      }
    });
  }

  if (adminSalesRegistryForm) adminSalesRegistryForm.addEventListener('submit', handleSalesRegistry);
  
  setupPromoCalculatorListeners();
  setupProductImageUploadListeners();
  setupCategoryImageUpload();


  const btnReset = document.getElementById('btn-reset-demo-data');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('ATENÇÃO: Isso removerá TODAS as alterações e restaurará os dados demonstrativos originais. Deseja continuar?')) {
        resetDemoData();
        window.location.reload();
      }
    });
  }
}

function switchTab(rawTabName) {
  const tabName = TAB_ALIASES[rawTabName] || 'overview';
  state.currentTab = tabName;
  
  history.replaceState(null, '', `#${tabName}`);
  
  document.querySelectorAll('.sidebar-menu .menu-item-link').forEach(link => {
    const lTab = link.getAttribute('data-tab');
    if (lTab === rawTabName || TAB_ALIASES[lTab] === tabName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  
  const titles = {
    overview: 'Visão geral',
    products: 'Produtos',
    categories: 'Categorias',
    stock: 'Controle de Estoque',
    maintenances: 'Manutenções',
    reservations: 'Reservas',
    sales: 'Vendas',
    promo: 'Promoções',
    users: 'Equipe',
    settings: 'Configurações'
  };
  if (workspaceTitle) workspaceTitle.textContent = titles[tabName] || 'Painel Operacional';

  tabs.forEach(tab => {
    const pane = document.getElementById(`panel-${tab}`);
    if (pane) {
      if (tab === tabName) {
        pane.classList.remove('d-none');
      } else {
        pane.classList.add('d-none');
      }
    }
  });

  renderCurrentTab();
}

function setupHashRouter() {
  const hash = window.location.hash.replace('#', '') || 'overview';
  switchTab(hash);

  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash.replace('#', '') || 'overview';
    switchTab(newHash);
  });
}

function navTo(rawTabName, afterNavigate = null) {
  switchTab(rawTabName);
  if (afterNavigate) {
    setTimeout(afterNavigate, 150);
  }
}

function renderCurrentTab() {
  calculateOverviewKPIs();

  switch (state.currentTab) {
    case 'overview':
      renderDashboardOverview();
      renderCategorySalesChart();
      break;
    case 'products':
      populateCategorySelects();
      renderProductsTable();
      break;
    case 'categories':
      renderCategoriesTable();
      break;
    case 'stock':
      populateProductSelects();
      renderStockLogsTable();
      break;
    case 'maintenances':
      renderMaintenancesTab();
      break;
    case 'reservations':
      renderReservationsTable();
      break;
    case 'sales':
      populateProductSelects();
      renderSalesLogsTable();
      break;
    case 'promo':
      renderPromoTab();
      break;
    case 'users':
      renderTeam();
      break;
    case 'settings':
      renderSettingsStatus();
      break;
    default:
      break;
  }
  if (window.lucide) lucide.createIcons();
}

// ==========================================
// HELPERS
// ==========================================
function esc(value) {
  return String(value === null || value === undefined ? '' : value).replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

const DAY_MS = 86400000;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function findVariant(product, variantId) {
  if (!product) return null;
  const vs = product.variants || [];
  return vs.find(v => v.id === variantId) || (vs.length === 1 ? vs[0] : null);
}

function formatDelta(curr, prev) {
  if (!prev && !curr) return { text: '—', cls: 'flat' };
  if (!prev) return { text: 'novo', cls: 'up' };
  const pct = Math.round(((curr - prev) / prev) * 100);
  if (pct === 0) return { text: '0%', cls: 'flat' };
  return { text: `${pct > 0 ? '+' : ''}${pct}%`, cls: pct > 0 ? 'up' : 'down' };
}

// ==========================================
// VIEW RENDERING: OVERVIEW DASHBOARD
// ==========================================

/** Variants of active products, flattened (used by stock alerts and valuation). */
function listActiveVariants() {
  const out = [];
  state.products.filter(p => p.status === 'active').forEach(p => {
    (p.variants || []).filter(v => v.active !== false).forEach(v => out.push({ product: p, variant: v }));
  });
  return out;
}

function computeStockAlerts() {
  const zero = [];
  const low = [];
  listActiveVariants().forEach(({ product, variant }) => {
    const qty = variant.stockQuantity || 0;
    const min = variant.minimumStock || 0;
    if (qty === 0) zero.push({ product, variant });
    else if (qty <= min) low.push({ product, variant });
  });
  return { zero, low };
}

function computeOpenMaintenances() {
  return state.maintenances.filter(m => m.status !== 'Finalizado');
}

/** Keeps sidebar counters and the environment badge in sync with the data. */
function calculateOverviewKPIs() {
  const pending = state.reservations.filter(r => r.status === 'new' || r.status === 'contacted').length;
  const alerts = computeStockAlerts();
  const stockAlerts = alerts.zero.length + alerts.low.length;
  const openMaint = computeOpenMaintenances().length;

  const setBadge = (id, n, danger) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = n > 99 ? '99+' : String(n);
    el.classList.toggle('d-none', n <= 0);
    el.classList.toggle('danger', !!danger);
  };
  setBadge('badge-reservations', pending, false);
  setBadge('badge-maintenances', openMaint, false);
  setBadge('badge-stock', stockAlerts, alerts.zero.length > 0);

  const envText = document.getElementById('env-badge-text');
  if (envText) envText.textContent = (typeof DataAdapter !== 'undefined' && DataAdapter.isDemo()) ? 'Dados locais' : 'Banco online';
}

function computePeriodMetrics(days) {
  const now = Date.now();
  const start = now - days * DAY_MS;
  const prevStart = start - days * DAY_MS;
  const products = state.products;
  const completed = state.sales.filter(s => s.status === 'completed');

  const summarize = (list) => {
    let revenue = 0;
    let profit = 0;
    let profitSales = 0;
    list.forEach(s => {
      revenue += s.totalCents || 0;
      let cost = 0;
      let known = (s.items || []).length > 0;
      (s.items || []).forEach(i => {
        const v = findVariant(products.find(p => p.id === i.productId), i.variantId);
        if (!v || v.costCents === null || v.costCents === undefined) known = false;
        else cost += v.costCents * (i.quantity || 1);
      });
      if (known) { profit += (s.totalCents || 0) - cost; profitSales++; }
    });
    return { revenue, count: list.length, profit, profitSales, ticket: list.length ? Math.round(revenue / list.length) : 0 };
  };

  const inRange = (s, a, b) => { const t = new Date(s.createdAt).getTime(); return t >= a && t < b; };
  const cur = completed.filter(s => inRange(s, start, now + 1));
  const prev = completed.filter(s => inRange(s, prevStart, start));
  return { cur, prev, curM: summarize(cur), prevM: summarize(prev), start, now };
}

function handleAttentionAction(action) {
  const setResFilter = (val) => {
    if (adminFilterReservationsStatus) adminFilterReservationsStatus.value = val;
    if (adminSearchReservations) adminSearchReservations.value = '';
    renderReservationsTable();
  };
  switch (action) {
    case 'res-new': navTo('reservations', () => setResFilter('new')); break;
    case 'res-all': navTo('reservations', () => setResFilter('')); break;
    case 'stock': navTo('stock'); break;
    case 'maint': navTo('maintenances'); break;
    case 'promo': navTo('promo'); break;
    case 'products': navTo('products'); break;
    default: break;
  }
}

function handleQuickAction(action) {
  if (action === 'sale') navTo('sales', () => { const el = document.querySelector('#panel-sales select, #panel-sales input'); if (el) el.focus(); });
  else if (action === 'product') navTo('products', () => openProductFormModal());
  else if (action === 'stock') navTo('stock');
  else if (action === 'maintenance') navTo('maintenances', () => openMaintenanceModal());
}


function renderOverviewTopProducts(m) {
  const host = document.getElementById('ov-top-products');
  if (!host) return;
  const agg = {};
  m.cur.forEach(s => (s.items || []).forEach(i => {
    const p = state.products.find(x => x.id === i.productId);
    const key = i.productId + '|' + i.variantId;
    const v = findVariant(p, i.variantId);
    if (!agg[key]) agg[key] = { name: p ? p.name : 'Produto removido', spec: v ? [v.color, v.capacity].filter(Boolean).join(' · ') : '', qty: 0, revenue: 0 };
    agg[key].qty += i.quantity || 0;
    agg[key].revenue += i.totalCents || ((i.unitPriceCents || 0) * (i.quantity || 0));
  }));
  const list = Object.values(agg).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  if (!list.length) {
    host.innerHTML = '<li class="top-empty">Sem vendas no período.</li>';
    return;
  }
  const max = list[0].revenue || 1;
  host.innerHTML = list.map((x, idx) => `
    <li class="top-item">
      <span class="top-rank">${idx + 1}</span>
      <div class="top-main">
        <div class="top-line"><strong>${esc(x.name)}</strong><span>${esc(formatBRLFromCents(x.revenue))}</span></div>
        <div class="top-sub"><span>${esc(x.spec)}</span><span>${x.qty} un.</span></div>
        <div class="top-bar"><i style="width:${Math.max(6, Math.round(x.revenue / max * 100))}%"></i></div>
      </div>
    </li>`).join('');
}

function setupOverviewListeners() {
  document.querySelectorAll('.seg-btn[data-period]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.overviewPeriod = Number(btn.dataset.period);
      renderDashboardOverview();
    });
  });
  const attn = document.getElementById('ov-attention-list');
  if (attn) attn.addEventListener('click', e => {
    const b = e.target.closest('[data-attn]');
    if (b) handleAttentionAction(b.dataset.attn);
  });
  document.querySelectorAll('[data-quick]').forEach(btn => btn.addEventListener('click', () => handleQuickAction(btn.dataset.quick)));
}

// ==========================================
// COMMAND PALETTE (Ctrl+K)
// ==========================================
const CMDK_PAGES = [
  { tab: 'overview', label: 'Visão Geral', icon: 'layout-dashboard' },
  { tab: 'reservations', label: 'Reservas', icon: 'calendar-clock' },
  { tab: 'sales', label: 'Vendas / PDV', icon: 'shopping-bag' },
  { tab: 'maintenances', label: 'Manutenções', icon: 'wrench' },
  { tab: 'products', label: 'Produtos', icon: 'smartphone' },
  { tab: 'categories', label: 'Categorias', icon: 'folder-tree' },
  { tab: 'stock', label: 'Estoque', icon: 'clipboard-list' },
  { tab: 'promo', label: 'Promoções', icon: 'percent' },
  { tab: 'users', label: 'Usuários', icon: 'users' },
  { tab: 'settings', label: 'Configurações', icon: 'settings' }
];

let cmdkResults = [];
let cmdkIndex = 0;

function buildCmdkResults(query) {
  const q = query.trim().toLowerCase();
  const out = [];
  const has = (...vals) => vals.some(v => String(v || '').toLowerCase().includes(q));

  CMDK_PAGES.filter(p => !q || has(p.label)).slice(0, q ? 4 : 10).forEach(p =>
    out.push({ group: 'Ir para', icon: p.icon, title: p.label, sub: '', run: () => navTo(p.tab) }));
  if (!q) return out;

  getProducts().filter(p => has(p.name, p.sku, p.brand, p.model)).slice(0, 5).forEach(p =>
    out.push({ group: 'Produtos', icon: 'smartphone', title: p.name, sub: `${p.brand} · ${p.sku}`, run: () => navTo('products', () => { if (adminSearchProducts) { adminSearchProducts.value = p.name; renderProductsTable(); } }) }));
  getReservations().filter(r => has(r.code, r.demoCustomerName, r.demoContactLabel)).slice(0, 5).forEach(r =>
    out.push({ group: 'Reservas', icon: 'calendar-clock', title: `${r.code} · ${r.demoCustomerName}`, sub: getReservationStatusLabel(r.status), run: () => navTo('reservations', () => { if (adminFilterReservationsStatus) adminFilterReservationsStatus.value = ''; if (adminSearchReservations) { adminSearchReservations.value = r.code; renderReservationsTable(); } }) }));
  getSales().filter(s => has(s.code, s.demoCustomerName)).slice(0, 4).forEach(s =>
    out.push({ group: 'Vendas', icon: 'shopping-bag', title: `${s.code} · ${s.demoCustomerName}`, sub: formatBRLFromCents(s.totalCents), run: () => navTo('sales') }));
  getMaintenances().filter(m => has(m.code, m.device, m.customerName)).slice(0, 4).forEach(m =>
    out.push({ group: 'Manutenções', icon: 'wrench', title: `${m.code} · ${m.device}`, sub: m.customerName, run: () => navTo('maintenances', () => { const el = document.getElementById('admin-search-maintenances'); if (el) { el.value = m.code; renderMaintenancesTab(); } }) }));
  return out;
}

function renderCmdk() {
  const list = document.getElementById('cmdk-list');
  const input = document.getElementById('cmdk-input');
  if (!list || !input) return;
  cmdkResults = buildCmdkResults(input.value);
  cmdkIndex = Math.min(cmdkIndex, Math.max(0, cmdkResults.length - 1));
  if (!cmdkResults.length) { list.innerHTML = '<div class="cmdk-empty">Nada encontrado.</div>'; return; }
  let lastGroup = '';
  list.innerHTML = cmdkResults.map((r, i) => {
    const head = r.group !== lastGroup ? `<div class="cmdk-group">${esc(r.group)}</div>` : '';
    lastGroup = r.group;
    return `${head}<button type="button" class="cmdk-item ${i === cmdkIndex ? 'active' : ''}" data-i="${i}"><i data-lucide="${r.icon}"></i><span class="cmdk-title">${esc(r.title)}</span><span class="cmdk-sub">${esc(r.sub)}</span></button>`;
  }).join('');
  if (window.lucide) lucide.createIcons();
  const active = list.querySelector('.cmdk-item.active');
  if (active) active.scrollIntoView({ block: 'nearest' });
}

function openCmdk() {
  let overlay = document.getElementById('cmdk-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'cmdk-overlay';
    overlay.className = 'cmdk-overlay';
    overlay.innerHTML = `
      <div class="cmdk" role="dialog" aria-modal="true" aria-label="Busca rápida">
        <div class="cmdk-input-row"><i data-lucide="search"></i><input id="cmdk-input" type="text" placeholder="Buscar produto, reserva, venda, manutenção ou ir para…" autocomplete="off"><kbd>Esc</kbd></div>
        <div class="cmdk-list" id="cmdk-list"></div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeCmdk(); });
    const input = overlay.querySelector('#cmdk-input');
    input.addEventListener('input', () => { cmdkIndex = 0; renderCmdk(); });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); cmdkIndex = Math.min(cmdkIndex + 1, cmdkResults.length - 1); renderCmdk(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); cmdkIndex = Math.max(cmdkIndex - 1, 0); renderCmdk(); }
      else if (e.key === 'Enter') { e.preventDefault(); runCmdk(cmdkIndex); }
      else if (e.key === 'Escape') { closeCmdk(); }
    });
    overlay.querySelector('#cmdk-list').addEventListener('click', e => {
      const b = e.target.closest('.cmdk-item');
      if (b) runCmdk(Number(b.dataset.i));
    });
  }
  overlay.classList.add('active');
  const input = overlay.querySelector('#cmdk-input');
  input.value = '';
  cmdkIndex = 0;
  renderCmdk();
  input.focus();
}

function closeCmdk() {
  const overlay = document.getElementById('cmdk-overlay');
  if (overlay) overlay.classList.remove('active');
}

function runCmdk(i) {
  const r = cmdkResults[i];
  closeCmdk();
  if (r) r.run();
}

function setupCommandPalette() {
  const btn = document.getElementById('btn-cmdk');
  if (btn) btn.addEventListener('click', openCmdk);
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openCmdk(); }
  });
}

function initChartTooltips() {
  document.querySelectorAll('.chart-tooltip-target').forEach(el => {
    el.addEventListener('mouseenter', e => {
      const tooltip = document.createElement('div');
      tooltip.className = 'chart-tooltip-dyn';
      tooltip.textContent = el.getAttribute('data-tooltip');
      tooltip.style.position = 'fixed';
      tooltip.style.background = 'var(--text-primary)';
      tooltip.style.color = 'var(--white)';
      tooltip.style.padding = '6px 10px';
      tooltip.style.borderRadius = 'var(--radius-sm)';
      tooltip.style.fontSize = '0.75rem';
      tooltip.style.pointerEvents = 'none';
      tooltip.style.zIndex = '1000';
      tooltip.style.fontWeight = 'bold';
      
      document.body.appendChild(tooltip);
      
      const rect = el.getBoundingClientRect();
      tooltip.style.top = (rect.top - 35) + 'px';
      tooltip.style.left = (rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)) + 'px';
      
      el.addEventListener('mouseleave', () => tooltip.remove(), { once: true });
    });
  });
}

// ==========================================
// CATEGORIES MANAGEMENT
// ==========================================
function openCategoryFormModal(catId = null) {
  const form = document.getElementById('admin-add-category-form');
  if (form) form.reset();
  state.selectedCategoryToEdit = catId;

  // Reset upload UI
  const imgInput = document.getElementById('c-image');
  const preview = document.getElementById('cat-img-preview');
  const previewWrapper = document.getElementById('cat-img-preview-wrapper');
  const statusEl = document.getElementById('cat-img-status');
  if (imgInput) imgInput.value = '';
  if (preview) preview.src = '';
  if (previewWrapper) previewWrapper.style.display = 'none';
  if (statusEl) statusEl.textContent = '';
  
  const titleEl = document.getElementById('admin-category-modal-title');
  if (titleEl) titleEl.textContent = catId ? 'Editar categoria' : 'Nova categoria';
  
  if (catId) {
    const cat = state.categories.find(c => c.id === catId);
    if (cat) {
      document.getElementById('c-name').value = cat.name;
      document.getElementById('c-slug').value = cat.id;
      document.getElementById('c-slug').disabled = true;
      document.getElementById('c-visible').value = cat.status === 'active' ? 'true' : 'false';
      // Restore existing image
      if (cat.image) {
        const isBase64 = cat.image.startsWith('data:');
        const isUrl = cat.image.startsWith('http') || cat.image.startsWith('./') || cat.image.startsWith('/');
        if (isBase64 || isUrl) {
          if (imgInput) imgInput.value = cat.image;
          if (preview) preview.src = isBase64 ? cat.image : `./assets/${cat.image}`;
          if (previewWrapper) previewWrapper.style.display = 'block';
          if (statusEl) statusEl.textContent = 'Imagem atual carregada.';
        } else {
          // Legacy filename reference
          if (imgInput) imgInput.value = cat.image;
          if (preview) preview.src = `./assets/${cat.image}`;
          if (previewWrapper) previewWrapper.style.display = 'block';
          if (statusEl) statusEl.textContent = `Imagem: ${cat.image}`;
        }
      }
    }
  } else {
    const slugInp = document.getElementById('c-slug');
    if (slugInp) slugInp.disabled = false;
  }
  
  openModal(document.getElementById('admin-category-modal-overlay'));
  if (window.lucide) lucide.createIcons();
}


function closeCategoryFormModal() {
  closeModal(document.getElementById('admin-category-modal-overlay'));
  state.selectedCategoryToEdit = null;
}

// ==========================================
// CATEGORY IMAGE UPLOAD (Base64 / FileReader)
// ==========================================
function setupCategoryImageUpload() {
  const fileInput = document.getElementById('cat-img-file-input');
  const zone = document.getElementById('cat-img-upload-zone');
  const preview = document.getElementById('cat-img-preview');
  const previewWrapper = document.getElementById('cat-img-preview-wrapper');
  const statusEl = document.getElementById('cat-img-status');
  const removeBtn = document.getElementById('cat-img-remove');
  const hiddenInput = document.getElementById('c-image');

  if (!fileInput) return;

  const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
  const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

  function processFile(file) {
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      if (statusEl) { statusEl.style.color = 'var(--danger)'; statusEl.textContent = 'Formato inválido. Use PNG, JPG ou WEBP.'; }
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      if (statusEl) { statusEl.style.color = 'var(--danger)'; statusEl.textContent = 'Imagem muito grande. Limite: 2 MB.'; }
      return;
    }

    if (statusEl) { statusEl.style.color = 'var(--text-secondary)'; statusEl.textContent = 'Carregando imagem…'; }
    if (zone) zone.style.borderColor = 'var(--purple-primary)';

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (hiddenInput) hiddenInput.value = dataUrl;
      if (preview) preview.src = dataUrl;
      if (previewWrapper) previewWrapper.style.display = 'block';
      if (statusEl) { statusEl.style.color = 'var(--success)'; statusEl.textContent = `✓ ${file.name} (${(file.size / 1024).toFixed(0)} KB)`; }
      if (zone) zone.style.borderColor = 'var(--success)';
    };
    reader.onerror = () => {
      if (statusEl) { statusEl.style.color = 'var(--danger)'; statusEl.textContent = 'Erro ao ler a imagem. Tente novamente.'; }
    };
    reader.readAsDataURL(file);
  }

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      processFile(fileInput.files[0]);
    }
  });

  // Drag & drop support
  if (zone) {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.style.borderColor = 'var(--purple-primary)';
    });
    zone.addEventListener('dragleave', () => {
      zone.style.borderColor = 'var(--border-color)';
    });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.style.borderColor = 'var(--border-color)';
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      if (hiddenInput) hiddenInput.value = '';
      if (preview) preview.src = '';
      if (previewWrapper) previewWrapper.style.display = 'none';
      if (statusEl) { statusEl.style.color = 'var(--text-secondary)'; statusEl.textContent = ''; }
      if (zone) zone.style.borderColor = 'var(--border-color)';
      if (fileInput) fileInput.value = '';
    });
  }
}



function handleCategorySubmit(e) {
  e.preventDefault();
  
  const idVal = document.getElementById('c-slug').value.trim();
  const nameVal = document.getElementById('c-name').value.trim();
  const imgVal = document.getElementById('c-image').value.trim();
  const visVal = document.getElementById('c-visible').value === 'true';
  
  if (!idVal || !nameVal) {
    showAdminToast("Preencha o nome e o identificador da categoria.", "danger");
    return;
  }
  
  if (state.selectedCategoryToEdit) {
    const cat = state.categories.find(c => c.id === state.selectedCategoryToEdit);
    if (cat) {
      cat.name = nameVal;
      cat.image = imgVal;
      cat.status = visVal ? 'active' : 'inactive';
      updateCategory(cat);
      state.categories = getCategories();
      createActivityLog({ id: `act-${Date.now()}`, type: 'success', message: `Categoria "${nameVal}" editada.`, actorUserId: 'user-1', createdAt: new Date().toISOString() });
    }
  } else {
    if (state.categories.some(c => c.id === idVal)) {
      showAdminToast("Já existe uma categoria com este Identificador (Slug).", "danger");
      return;
    }
    const newCat = {
      id: idVal,
      name: nameVal,
      image: imgVal,
      status: visVal ? 'active' : 'inactive',
      displayOrder: state.categories.length + 1
    };
    createCategory(newCat);
    state.categories = getCategories();
    createActivityLog({ id: `act-${Date.now()}`, type: 'success', message: `Categoria "${nameVal}" criada.`, actorUserId: 'user-1', createdAt: new Date().toISOString() });
  }
  renderCategoriesTable();
  populateCategorySelects();
  closeCategoryFormModal();
}

function deleteCategory(catId) {
  if (confirm("Inativar esta categoria? Os produtos associados continuarão armazenados.")) {
    setCategoryStatus(catId, 'inactive');
    state.categories = getCategories();
    createActivityLog({ id: `act-${Date.now()}`, type: 'warning', message: `Categoria "${catId}" desativada.`, actorUserId: 'user-1', createdAt: new Date().toISOString() });
    renderCategoriesTable();
    populateCategorySelects();
  }
}

function populateCategorySelects() {
  const pCatSelect = document.getElementById('p-category');
  const filterCatSelect = document.getElementById('admin-filter-products-category');
  
  if (pCatSelect) {
    pCatSelect.innerHTML = state.categories.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  }
  
  if (filterCatSelect) {
    const currentVal = filterCatSelect.value;
    filterCatSelect.innerHTML = `<option value="">Todas as Categorias</option>` + 
      state.categories.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
    filterCatSelect.value = currentVal;
  }
}

// ==========================================
// PRODUCTS MANAGEMENT (CRUD)
// ==========================================
let currentFormStep = 1;
let tempVariants = [];

function switchFormStep(step) {
  currentFormStep = step;
  
  document.querySelectorAll('[data-form-step]').forEach(btn => {
    const s = parseInt(btn.getAttribute('data-form-step'));
    if (s === step) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  document.querySelectorAll('.form-step-pane').forEach(pane => pane.classList.add('d-none'));
  const targetPane = document.getElementById(`form-step-${step}`);
  if (targetPane) targetPane.classList.remove('d-none');
  
  const btnPrev = document.getElementById('btn-admin-modal-prev');
  const btnNext = document.getElementById('btn-admin-modal-next');
  const btnSubmit = document.getElementById('btn-admin-modal-submit');
  
  if (btnPrev && btnNext && btnSubmit) {
    if (step === 1) {
      btnPrev.classList.add('d-none');
      btnNext.classList.remove('d-none');
      btnSubmit.classList.add('d-none');
    } else if (step === 5) {
      btnPrev.classList.remove('d-none');
      btnNext.classList.add('d-none');
      btnSubmit.classList.remove('d-none');
      buildReviewStep();
    } else {
      btnPrev.classList.remove('d-none');
      btnNext.classList.remove('d-none');
      btnSubmit.classList.add('d-none');
    }
  }
}

function openProductFormModal(prodId = null) {
  if (adminAddProductForm) adminAddProductForm.reset();
  populateCategorySelects();
  
  tempVariants = [];
  stateProductFormImages = [];
  const vCont = document.getElementById('variants-container');
  const pCont = document.getElementById('variants-pricing-container');
  if (vCont) vCont.innerHTML = '';
  if (pCont) pCont.innerHTML = '';
  
  if (prodId) {
    state.selectedProductToEdit = prodId;
    const titleEl = document.getElementById('admin-product-modal-title');
    if (titleEl) titleEl.textContent = 'Editar produto';
    
    const p = state.products.find(item => item.id === prodId);
    if (p) {
      document.getElementById('p-name').value = p.name;
      document.getElementById('p-brand').value = p.brand;
      document.getElementById('p-model').value = p.model || '';
      document.getElementById('p-category').value = p.categoryId || '';
      document.getElementById('p-condition').value = p.condition;
      const statusSelect = document.getElementById('p-status');
      if (statusSelect) statusSelect.value = p.status || 'active';
      document.getElementById('p-description').value = p.shortDescription || '';
      document.getElementById('p-sku').value = p.sku || '';
      
      const svgCol = document.getElementById('p-svg-color');
      const svgIcon = document.getElementById('p-svg-icon');
      if (svgCol) svgCol.value = p.mockupStyle?.color || '#6B7280';
      if (svgIcon) svgIcon.value = p.mockupStyle?.icon || 'smartphone';
      
      if (p.variants) {
        tempVariants = JSON.parse(JSON.stringify(p.variants));
      }
      if (p.images) {
        stateProductFormImages = JSON.parse(JSON.stringify(p.images));
      }
    }
  } else {
    state.selectedProductToEdit = null;
    const titleEl = document.getElementById('admin-product-modal-title');
    if (titleEl) titleEl.textContent = 'Novo produto';
  }
  
  renderVariantsBuilder();
  renderPricingBuilder();
  renderProductImagePreviews();
  switchFormStep(1);
  openModal(adminProductModalOverlay);
}

function closeProductFormModal() {
  closeModal(adminProductModalOverlay);
  state.selectedProductToEdit = null;
  stateProductFormImages = [];
}

document.getElementById('btn-add-variant')?.addEventListener('click', () => {
  tempVariants.push({
    id: 'var-' + Date.now(),
    color: '',
    capacity: '',
    priceCents: 0,
    promotionalPriceCents: null,
    costCents: null,
    stockQuantity: 0,
    minimumStock: 1,
    active: true,
    demoImeis: []
  });
  renderVariantsBuilder();
});

window.removeVariant = function(idx) {
  tempVariants.splice(idx, 1);
  renderVariantsBuilder();
};

function buildReviewStep() {
  const rName = document.getElementById('review-product-name');
  const rVar = document.getElementById('review-variants-count');
  const rStock = document.getElementById('review-total-stock');
  const rImg = document.getElementById('review-images-count');
  
  if (rName) rName.textContent = document.getElementById('p-name').value || 'N/A';
  if (rVar) rVar.textContent = `${tempVariants.length} variaç${tempVariants.length === 1 ? 'ão' : 'ões'}`;
  const totalStock = tempVariants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
  if (rStock) rStock.textContent = `Estoque total: ${totalStock} un`;
  if (rImg) rImg.textContent = `${stateProductFormImages.length} foto${stateProductFormImages.length === 1 ? '' : 's'}`;
}

document.getElementById('btn-admin-modal-next')?.addEventListener('click', () => {
  if (currentFormStep === 3) renderPricingBuilder();
  if (currentFormStep < 5) switchFormStep(currentFormStep + 1);
});
document.getElementById('btn-admin-modal-prev')?.addEventListener('click', () => {
  if (currentFormStep > 1) switchFormStep(currentFormStep - 1);
});
document.querySelectorAll('[data-form-step]').forEach(btn => {
  btn.addEventListener('click', () => {
    const s = parseInt(btn.getAttribute('data-form-step'));
    if (currentFormStep === 3) renderPricingBuilder();
    switchFormStep(s);
  });
});

function handleProductFormSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('p-name').value.trim();
  const brand = document.getElementById('p-brand').value.trim();
  const model = document.getElementById('p-model').value.trim();
  const category = document.getElementById('p-category').value;
  const condition = document.getElementById('p-condition').value;
  const statusSelect = document.getElementById('p-status');
  const prodStatus = statusSelect ? statusSelect.value : 'active';
  const description = document.getElementById('p-description').value.trim();
  const internalCode = document.getElementById('p-sku').value.trim();
  
  const mockupColor = document.getElementById('p-svg-color') ? document.getElementById('p-svg-color').value.trim() : '#6B7280';
  const mockupIcon = document.getElementById('p-svg-icon') ? document.getElementById('p-svg-icon').value : 'smartphone';
  
  if (!name || !brand || !model) {
    showAdminToast('Preencha todos os campos obrigatórios na Etapa 1.', 'danger');
    return;
  }
  if (tempVariants.length === 0) {
    showAdminToast('Adicione pelo menos uma variação na Etapa 3.', 'danger');
    return;
  }
  
  const finalImages = stateProductFormImages.length > 0 ? stateProductFormImages : [
    { id: `img-${Date.now()}`, src: './assets/placeholder.svg', alt: name, isPrimary: true }
  ];

  if (state.selectedProductToEdit) {
    const idx = state.products.findIndex(p => p.id === state.selectedProductToEdit);
    if (idx > -1) {
      const updatedProd = {
        ...state.products[idx],
        name, brand, model,
        categoryId: category,
        condition,
        shortDescription: description,
        status: prodStatus,
        sku: internalCode,
        images: finalImages,
        variants: JSON.parse(JSON.stringify(tempVariants.map(v => ({
          ...v,
          color: v.color || v.colorName || '',
          capacity: v.capacity || v.capacityName || '',
          sku: `${internalCode}-${v.color || ''}${v.capacity || ''}`.replace(/\s/g,''),
          active: true,
          demoImeis: v.demoImeis || []
        })))),
        mockupStyle: { color: mockupColor, icon: mockupIcon },
        updatedAt: new Date().toISOString()
      };
      updateProduct(updatedProd);
      state.products = getProducts();
      createActivityLog({ id: `act-${Date.now()}`, type: 'success', message: `Produto editado: ${name}`, actorUserId: 'user-1', createdAt: new Date().toISOString() });
    }
  } else {
    const newProd = {
      id: `prod-${Date.now()}`,
      sku: internalCode || `REF-${Math.floor(100 + Math.random() * 900)}`,
      barcodeDemo: '',
      name, brand, model,
      categoryId: category,
      condition,
      shortDescription: description,
      status: 'active',
      images: finalImages,
      variants: JSON.parse(JSON.stringify(tempVariants.map(v => ({
        id: `var-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
        sku: `${internalCode || 'PROD'}-${v.color || ''}${v.capacity || ''}`.replace(/\s/g,''),
        color: v.color || v.colorName || '',
        capacity: v.capacity || v.capacityName || '',
        priceCents: v.priceCents || 0,
        promotionalPriceCents: v.promotionalPriceCents || null,
        costCents: v.costCents || null,
        stockQuantity: Math.max(0, parseInt(v.stockQuantity) || 0),
        minimumStock: Math.max(0, parseInt(v.minimumStock) || 1),
        active: true,
        demoImeis: v.demoImeis || []
      })))),
      mockupStyle: { color: mockupColor, icon: mockupIcon },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    createProduct(newProd);
    state.products = getProducts();
    createActivityLog({ id: `act-${Date.now()}`, type: 'success', message: `Novo produto cadastrado com foto: ${name}`, actorUserId: 'user-1', createdAt: new Date().toISOString() });
  }
  renderCurrentTab();
  closeProductFormModal();
  showAdminToast('Produto e imagens salvos com sucesso!', 'success');
}

function deleteProduct(prodId) {
  const p = state.products.find(item => item.id === prodId);
  if (!p) return;
  
  const isInactive = p.status === 'inactive';
  const newStatus = isInactive ? 'active' : 'inactive';
  const actionText = isInactive ? 'Ativar' : 'Inativar';
  
  if (confirm(`${actionText} o produto "${p.name}"?`)) {
    setProductStatus(prodId, newStatus);
    state.products = getProducts();
    createActivityLog({ id: `act-${Date.now()}`, type: isInactive ? 'success' : 'warning', message: `Produto ${isInactive ? 'ativado' : 'inativado'}: ${p.name}`, actorUserId: 'user-1', createdAt: new Date().toISOString() });
    showAdminToast(`Produto ${isInactive ? 'ativado' : 'inativado'}.`, isInactive ? 'success' : 'warning');
    renderCurrentTab();
  }
}

// ==========================================
// INVENTORY CONTROL & ABSOLUTE ADJUSTMENT
// ==========================================
function populateProductSelects() {
  const adjustSelect = document.getElementById('stock-adjust-product');
  const saleSelect = document.getElementById('sale-select-product');
  
  const activeProducts = state.products.filter(p => p.status === 'active');
  const optionsHtml = activeProducts.map(p => {
    const activeVars = getActiveVariants(p);
    return activeVars.map(v => 
      `<option value="${esc(p.id)}||${esc(v.id)}">${esc(p.name)} (${esc(p.brand)}) — ${esc(v.color || '')} ${esc(v.capacity || '')} [Estoque: ${v.stockQuantity} un]</option>`
    ).join('');
  }).join('');
  
  if (adjustSelect) adjustSelect.innerHTML = optionsHtml || '<option value="">Nenhum produto disponível</option>';
  if (saleSelect) saleSelect.innerHTML = optionsHtml || '<option value="">Nenhum produto disponível</option>';
}

function handleStockAdjustment(e) {
  e.preventDefault();
  
  const selectVal = document.getElementById('stock-adjust-product').value;
  if (!selectVal || !selectVal.includes('||')) {
    showAdminToast('Selecione um produto e variação válida.', 'danger');
    return;
  }
  const [prodId, variantId] = selectVal.split('||');
  const typeVal = document.getElementById('stock-adjust-type').value;
  const rawAmount = document.getElementById('stock-adjust-amount').value;
  const amount = parseInt(rawAmount);
  const reason = document.getElementById('stock-adjust-reason').value.trim();
  const rawImeis = document.getElementById('stock-adjust-imeis') ? document.getElementById('stock-adjust-imeis').value : '';

  if (!prodId || !variantId || isNaN(amount) || amount < 0 || !reason) {
    showAdminToast('Preencha uma quantidade válida e o motivo do ajuste.', 'danger');
    return;
  }
  
  const prod = getProductById(prodId);
  if (!prod) { showAdminToast('Produto não encontrado.', 'danger'); return; }
  
  const varIdx = prod.variants.findIndex(v => v.id === variantId);
  if (varIdx === -1) { showAdminToast('Variação não encontrada.', 'danger'); return; }
  
  const oldQty = prod.variants[varIdx].stockQuantity || 0;
  let newQty = oldQty;
  let movType = 'positive_adjustment';
  let movQty = amount;

  if (typeVal === 'Entrada') {
    if (amount <= 0) { showAdminToast('A quantidade de entrada deve ser positiva.', 'danger'); return; }
    newQty = oldQty + amount;
    movType = 'entry';
    movQty = amount;
  } else if (typeVal === 'Saída') {
    if (amount <= 0) { showAdminToast('A quantidade de saída deve ser positiva.', 'danger'); return; }
    if (amount > oldQty) {
      showAdminToast(`Quantidade de saída (${amount} un) excede estoque disponível (${oldQty} un).`, 'danger');
      return;
    }
    newQty = oldQty - amount;
    movType = 'exit';
    movQty = amount;
  } else {
    // Ajuste Direto (=) — Permite zerar inventário (amount = 0)
    newQty = amount;
    const diff = newQty - oldQty;
    movType = diff >= 0 ? 'positive_adjustment' : 'negative_adjustment';
    movQty = Math.abs(diff);
  }

  const imeisArr = rawImeis ? rawImeis.split(',').map(i => i.trim()).filter(Boolean) : [];
  if (imeisArr.length > 0) {
    if (typeVal === 'Entrada') {
      prod.variants[varIdx].demoImeis = [...(prod.variants[varIdx].demoImeis || []), ...imeisArr];
    } else if (typeVal === 'Ajuste') {
      prod.variants[varIdx].demoImeis = imeisArr;
    }
  }

  prod.variants[varIdx].stockQuantity = newQty;
  updateProduct(prod);
  state.products = getProducts();

  registerStockMovement({
    id: generateId('mov'),
    productId: prodId,
    variantId: variantId,
    type: movType,
    quantity: movQty,
    previousQuantity: oldQty,
    resultingQuantity: newQty,
    reason: reason,
    demoImeis: imeisArr,
    relatedSaleId: null,
    actorUserId: 'user-1',
    createdAt: new Date().toISOString()
  });
  state.stockLogs = getStockMovements();

  createActivityLog({ id: generateId('act'), type: 'info', message: `Ajuste de estoque (${typeVal}): ${prod.name} — ${prod.variants[varIdx].color || ''} [Anterior: ${oldQty} un | Novo: ${newQty} un]`, actorUserId: 'user-1', createdAt: new Date().toISOString() });

  adminStockAdjustForm.reset();
  closeDrawer('drawer-stock');
  showAdminToast('Estoque atualizado com sucesso!', 'success');
  renderCurrentTab();
}

// ==========================================
// RESERVATIONS CONTROLLER
// ==========================================
function changeReservationStatus(resId, nextStatus) {
  if (nextStatus === 'completed') {
    // Use centralized transactional invoicing with full stock validation
    const result = completeReservationTransaction(resId, 'user-1');
    if (!result.success) {
      alert(result.error);
      showAdminToast(result.error, 'danger');
      return;
    }
    state.reservations = getReservations();
    state.sales = getSales();
    state.products = getProducts();
    state.stockLogs = getStockMovements();
    showAdminToast(`Reserva faturada com sucesso! Venda ${result.sale.code} gerada.`, 'success');
  } else {
    updateReservationStatus(resId, nextStatus, 'user-1');
    state.reservations = getReservations();
    showAdminToast(`Status da reserva alterado para "${getReservationStatusLabel(nextStatus)}".`, 'info');
  }

  renderCurrentTab();
}

// ==========================================
// SALES REGISTRY & ADMINISTRATIVE REVERSAL
// ==========================================
function handleSalesRegistry(e) {
  e.preventDefault();
  
  const selectVal = document.getElementById('sale-select-product').value;
  if (!selectVal || !selectVal.includes('||')) {
    showAdminToast('Selecione um produto/variação válido.', 'danger');
    return;
  }
  const [prodId, variantId] = selectVal.split('||');
  const qty = parseInt(document.getElementById('sale-qty').value);
  const paymentMethod = document.getElementById('sale-payment-method').value || 'cash_demo';
  const seller = document.getElementById('sale-seller').value;
  const discountStr = document.getElementById('sale-discount').value;
  const discountCents = discountStr ? Math.round(parseFloat(discountStr) * 100) : 0;
  const clientName = document.getElementById('sale-client').value.trim() || 'Consumidor Presencial';

  if (!prodId || !variantId || isNaN(qty) || qty <= 0) {
    showAdminToast('Selecione um produto e quantidade válida.', 'danger');
    return;
  }

  const prod = getProductById(prodId);
  if (!prod) { showAdminToast('Produto não encontrado.', 'danger'); return; }
  
  const varIdx = prod.variants.findIndex(v => v.id === variantId);
  if (varIdx === -1) { showAdminToast('Variação não encontrada.', 'danger'); return; }

  const variant = prod.variants[varIdx];
  if (qty > variant.stockQuantity) {
    showAdminToast(`Quantidade solictada (${qty} un) excede estoque disponível (${variant.stockQuantity} un).`, 'danger');
    return;
  }

  const oldQty = variant.stockQuantity;
  const newQty = oldQty - qty; // NO Math.max(0, saldo) hiding!
  prod.variants[varIdx].stockQuantity = newQty;
  updateProduct(prod);
  state.products = getProducts();

  const priceCents = (variant.promotionalPriceCents !== null && variant.promotionalPriceCents !== undefined) ? variant.promotionalPriceCents : variant.priceCents;
  const unitCents = priceCents || 0;
  const subtotalCents = unitCents * qty;

  if (discountCents > subtotalCents) {
    showAdminToast('O valor do desconto não pode ser maior do que o subtotal da venda.', 'danger');
    return;
  }

  const totalCents = subtotalCents - discountCents;

  const newSale = createDemoSale({
    id: generateId('sale'),
    code: `VD-${Math.floor(1000 + Math.random() * 9000)}`,
    items: [{ productId: prodId, variantId, quantity: qty, unitPriceCents: unitCents, discountCents: 0, totalCents: subtotalCents }],
    subtotalCents,
    discountCents,
    totalCents,
    demoPaymentMethod: paymentMethod,
    demoCustomerName: clientName,
    sellerUserId: seller || 'user-1',
    status: 'completed',
    notes: 'Venda presencial registrada no balcão',
    createdAt: new Date().toISOString(),
    cancelledAt: null,
    reversalReason: null
  });

  state.sales = getSales();

  registerStockMovement({
    id: generateId('mov'),
    productId: prodId,
    variantId,
    type: 'exit',
    quantity: qty,
    previousQuantity: oldQty,
    resultingQuantity: newQty,
    reason: `Venda direta no balcão ${newSale.code}`,
    demoImeis: [],
    relatedSaleId: newSale.id,
    actorUserId: 'user-1',
    createdAt: new Date().toISOString()
  });
  state.stockLogs = getStockMovements();

  createActivityLog({ id: generateId('act'), type: 'success', message: `Venda presencial registrada: ${newSale.code} [${formatBRLFromCents(totalCents)}]`, actorUserId: 'user-1', createdAt: new Date().toISOString() });

  adminSalesRegistryForm.reset();
  document.getElementById('sale-discount').value = 0;
  document.getElementById('sale-qty').value = 1;
  closeDrawer('drawer-sale');
  showAdminToast('Venda registrada com sucesso!', 'success');
  renderCurrentTab();
}

/**
 * Render a real-data Chart.js line chart in the Vendas tab.
 * Groups sales by day over the last 30 days and plots quantity and revenue.
 */
let salesChartInstance = null;

function renderSalesChart() {
  const canvas = document.getElementById('sales-timeline-chart');
  if (!canvas) return;

  const sales = (getSales() || []).filter(s => s.status === 'completed');

  // Build last-30-days date labels
  const labels = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push(d.toISOString().split('T')[0]);
  }

  // Aggregate data per day
  const revenueByDay = {};
  const quantityByDay = {};
  labels.forEach(l => { revenueByDay[l] = 0; quantityByDay[l] = 0; });

  sales.forEach(sale => {
    const day = (sale.createdAt || '').split('T')[0];
    if (revenueByDay[day] !== undefined) {
      revenueByDay[day] += (sale.totalCents || 0) / 100;
      quantityByDay[day] += (sale.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
    }
  });

  const revenueData = labels.map(l => revenueByDay[l]);
  const quantityData = labels.map(l => quantityByDay[l]);

  // Short date labels for display (DD/MM)
  const shortLabels = labels.map(l => {
    const [, mm, dd] = l.split('-');
    return `${dd}/${mm}`;
  });

  // Empty state
  const totalRevenue = revenueData.reduce((a, b) => a + b, 0);
  const emptyEl = document.getElementById('sales-chart-empty');
  if (emptyEl) {
    emptyEl.style.display = totalRevenue === 0 ? 'flex' : 'none';
  }
  canvas.style.display = totalRevenue === 0 ? 'none' : 'block';

  // Destroy previous instance
  if (salesChartInstance) {
    salesChartInstance.destroy();
    salesChartInstance = null;
  }

  if (totalRevenue === 0) return;

  salesChartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: shortLabels,
      datasets: [
        {
          label: 'Faturamento (R$)',
          data: revenueData,
          borderColor: '#6D28D9',
          backgroundColor: 'rgba(109,40,217,0.08)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          yAxisID: 'yRevenue'
        },
        {
          label: 'Qtd. Vendida',
          data: quantityData,
          borderColor: '#F97316',
          backgroundColor: 'rgba(249,115,22,0.07)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          yAxisID: 'yQty'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', labels: { font: { size: 12 }, color: '#374151' } },
        tooltip: {
          callbacks: {
            label: ctx => {
              if (ctx.dataset.yAxisID === 'yRevenue') {
                return ` R$ ${ctx.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
              }
              return ` ${ctx.parsed.y} un`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#6B7280', font: { size: 11 }, maxTicksLimit: 10 },
          grid: { color: 'rgba(0,0,0,0.04)' }
        },
        yRevenue: {
          type: 'linear',
          position: 'left',
          ticks: {
            color: '#6D28D9',
            callback: v => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })
          },
          grid: { color: 'rgba(109,40,217,0.07)' }
        },
        yQty: {
          type: 'linear',
          position: 'right',
          ticks: { color: '#F97316', callback: v => v + ' un' },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}

/**
 * Prompt Administrative Sale Reversal
 */
function promptSaleReversal(saleId) {

  const reason = prompt("Informe o motivo do estorno administrativo (ex: Erro de lançamento pelo operador, cliente desistiu no balcão):");
  if (reason === null) return; // Cancelled prompt
  
  if (!reason.trim()) {
    alert("É obrigatório preencher o motivo do estorno.");
    return;
  }

  const result = reverseSaleTransaction(saleId, reason, 'user-1');
  if (!result.success) {
    showAdminToast(result.error, 'danger');
    return;
  }

  state.sales = getSales();
  state.products = getProducts();
  state.stockLogs = getStockMovements();
  
  showAdminToast("Venda estornada com sucesso! Estoque recomposto.", "success");
  alert("AVISO DE ESTORNO ADMINISTRATIVO:\nA venda foi marcada como estornada e a quantidade foi devolvida ao estoque.\n\nNota: Devolução física ou ressarcimento financeiro devem ser efetuados manualmente.");
  
  renderCurrentTab();
}

// ==========================================
// OPERATOR PROFILE MANAGEMENT
// ==========================================
function setupActiveProfile() {
  const trigger = document.getElementById('profile-dropdown-trigger');
  const menu = document.getElementById('profile-dropdown-menu');
  
  if (!trigger || !menu) return;
  
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('d-none');
  });
  
  document.addEventListener('click', () => {
    menu.classList.add('d-none');
  });
  
  state.activeProfile = localStorage.getItem('store_imports_active_profile') || 'Thallys';
  updateProfileDisplay();
  
  menu.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const profile = item.getAttribute('data-profile');
      state.activeProfile = profile;
      localStorage.setItem('store_imports_active_profile', profile);
      updateProfileDisplay();
      menu.classList.add('d-none');
      showAdminToast(`Perfil alterado para ${profile}`, 'success');
      createActivityLog({ id: generateId('act'), type: 'info', message: `Perfil do operador alterado para: ${profile}`, actorUserId: 'user-1', createdAt: new Date().toISOString() });
    });
  });
}

function updateProfileDisplay() {
  const avatarEl = document.getElementById('active-profile-avatar');
  const nameEl = document.getElementById('active-profile-name');
  const roleEl = document.getElementById('active-profile-role');
  
  if (!avatarEl || !nameEl || !roleEl) return;
  
  if (state.activeProfile === 'Thallys') {
    avatarEl.textContent = 'T';
    nameEl.textContent = 'Thallys';
    roleEl.textContent = 'Gerente geral';
  } else {
    avatarEl.textContent = 'J';
    nameEl.textContent = 'Joice';
    roleEl.textContent = 'Gerente comercial';
  }
}

// ==========================================
// RECEIPT PRINTING FOR SALES
// ==========================================
function printSaleCoupon(saleId) {
  const sale = state.sales.find(s => s.id === saleId);
  if (!sale) {
    showAdminToast('Venda não encontrada.', 'danger');
    return;
  }
  
  const printWindow = window.open('', '_blank', 'width=380,height=650');
  if (!printWindow) {
    showAdminToast('Bloqueador de popups ativo. Permita popups para visualizar e imprimir o cupom.', 'warning');
    return;
  }
  
  const receiptStyles = `
    <style>
      body { font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #000; margin: 0; padding: 12px; width: 300px; }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      .divider { border-top: 1px dashed #000; margin: 8px 0; }
      table { width: 100%; border-collapse: collapse; }
      th { text-align: left; border-bottom: 1px dashed #000; font-size: 11px; }
      td { padding: 4px 0; font-size: 11px; }
      .right { text-align: right; }
      .footer { font-size: 10px; margin-top: 16px; }
    </style>
  `;
  
  const itemsHtml = (sale.items || []).map(i => {
    const prod = getProductById(i.productId);
    const pName = prod ? prod.name : 'Produto';
    const variant = prod ? getVariantById(prod, i.variantId) : null;
    const spec = variant ? ` (${variant.color || ''} ${variant.capacity || ''})`.trim() : '';
    
    return `
      <tr>
        <td>${esc(pName)}${esc(spec)}</td>
        <td class="right">${i.quantity}x</td>
        <td class="right">${formatBRLFromCents(i.totalCents)}</td>
      </tr>
    `;
  }).join('');
  
  const receiptHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cupom de Venda - ${esc(sale.code)}</title>
        ${receiptStyles}
      </head>
      <body>
        <div class="center bold" style="font-size: 16px;">${esc(DEMO_CONFIG.storeName.toUpperCase())}</div>
        <div class="center">${esc(DEMO_CONFIG.address)}</div>
        <div class="center">Ambiente Demonstrativo</div>
        <div class="divider"></div>
        <div><strong>CUPOM DE VENDA:</strong> ${esc(sale.code)}</div>
        <div><strong>DATA:</strong> ${formatDateTimePtBr(sale.createdAt)}</div>
        <div><strong>CLIENTE:</strong> ${esc(sale.demoCustomerName || 'Consumidor Presencial')}</div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="right">Qtd</th>
              <th class="right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="divider"></div>
        <div class="right"><strong>Subtotal:</strong> ${formatBRLFromCents(sale.subtotalCents)}</div>
        <div class="right"><strong>Desconto:</strong> ${formatBRLFromCents(sale.discountCents)}</div>
        <div class="right" style="font-size: 13px; margin-top: 4px;"><strong>VALOR TOTAL:</strong> ${formatBRLFromCents(sale.totalCents)}</div>
        <div class="divider"></div>
        <div><strong>Forma de Pagamento:</strong> ${getPaymentMethodLabel(sale.demoPaymentMethod)}</div>
        <div class="divider"></div>
        <div class="center footer">
          OBRIGADO PELA PREFERÊNCIA!<br>
          Conserve este cupom para conferência de garantia.<br>
          ${DEMO_CONFIG.label}
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;
  
  printWindow.document.write(receiptHtml);
  printWindow.document.close();
}

// ==========================================
// BULK PROMOTIONS CALCULATOR (VARIANT LEVEL)
// ==========================================
let promoPreviewProducts = [];

function setupPromoCalculatorListeners() {
  const scopeSelect = document.getElementById('promo-scope');
  const scopeDetailGroup = document.getElementById('promo-scope-detail-group');
  const scopeDetailSelect = document.getElementById('promo-scope-detail');
  const manualSelectGroup = document.getElementById('promo-manual-select-group');
  const manualProductsList = document.getElementById('promo-manual-products-list');
  const formPromo = document.getElementById('admin-promo-calc-form');
  const btnPreview = document.getElementById('btn-promo-preview');
  const btnClear = document.getElementById('btn-promo-clear');
  
  if (!scopeSelect) return;
  
  scopeSelect.addEventListener('change', () => {
    const scope = scopeSelect.value;
    
    if (scope === 'all') {
      if (scopeDetailGroup) scopeDetailGroup.classList.add('d-none');
      if (manualSelectGroup) manualSelectGroup.classList.add('d-none');
    } else if (scope === 'category') {
      if (scopeDetailGroup) scopeDetailGroup.classList.remove('d-none');
      if (manualSelectGroup) manualSelectGroup.classList.add('d-none');
      const label = document.getElementById('promo-scope-detail-label');
      if (label) label.textContent = 'Categoria';
      
      if (scopeDetailSelect) {
        scopeDetailSelect.innerHTML = state.categories.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
      }
    } else if (scope === 'brand') {
      if (scopeDetailGroup) scopeDetailGroup.classList.remove('d-none');
      if (manualSelectGroup) manualSelectGroup.classList.add('d-none');
      const label = document.getElementById('promo-scope-detail-label');
      if (label) label.textContent = 'Selecione a Marca:';
      
      const brands = [...new Set(state.products.map(p => p.brand))].filter(Boolean);
      if (scopeDetailSelect) {
        scopeDetailSelect.innerHTML = brands.map(b => `<option value="${esc(b)}">${esc(b)}</option>`).join('');
      }
    } else if (scope === 'selected') {
      if (scopeDetailGroup) scopeDetailGroup.classList.add('d-none');
      if (manualSelectGroup) manualSelectGroup.classList.remove('d-none');
      
      if (manualProductsList) {
        manualProductsList.innerHTML = state.products.map(p => {
          const displayPrice = getProductDisplayPriceCents(p);
          return `
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; margin-bottom: 4px;">
              <input type="checkbox" name="promo-select-product" value="${esc(p.id)}" style="width: 16px; height: 16px; accent-color: var(--purple-primary);">
              <span>${esc(p.name)} (${esc(p.brand)}) — ${formatBRLFromCents(displayPrice)}</span>
            </label>
          `;
        }).join('');
      }
    }
  });

  if (btnPreview) btnPreview.addEventListener('click', generatePromoPreview);
  if (formPromo) {
    formPromo.addEventListener('submit', (e) => {
      e.preventDefault();
      applyPromoDiscount();
    });
  }
  if (btnClear) btnClear.addEventListener('click', clearPromoDiscounts);
}

function applyPromoDiscount() {
  generatePromoPreview({ silent: true });
  if (promoPreviewProducts.length === 0) {
    showAdminToast('Defina onde aplicar e um desconto válido antes de aplicar.', 'warning');
    return;
  }
  if (!confirm(`Aplicar a promoção em ${promoPreviewProducts.length} variações? Os preços promocionais atuais serão substituídos.`)) return;
  
  let appliedCount = 0;
  promoPreviewProducts.forEach(item => {
    const prod = state.products.find(p => p.id === item.productId);
    if (prod) {
      const vIdx = (prod.variants || []).findIndex(v => v.id === item.variantId);
      if (vIdx > -1) {
        prod.variants[vIdx].promotionalPriceCents = item.newPromoPriceCents;
        updateProduct(prod);
        appliedCount++;
      }
    }
  });
  
  state.products = getProducts();
  createActivityLog({ id: generateId('act'), type: 'success', message: `Desconto promocional em lote aplicado para ${appliedCount} variações de produtos. Operador: ${state.activeProfile}.`, actorUserId: 'user-1', createdAt: new Date().toISOString() });
  showAdminToast(`Promoção aplicada com sucesso em ${appliedCount} variações!`, 'success');
  
  promoPreviewProducts = [];
  renderCurrentTab();
}

function clearPromoDiscounts() {
  const scope = document.getElementById('promo-scope').value;
  const detail = document.getElementById('promo-scope-detail') ? document.getElementById('promo-scope-detail').value : '';
  
  let clearedCount = 0;
  
  state.products.forEach(prod => {
    let match = false;
    if (scope === 'all') {
      match = true;
    } else if (scope === 'category' && (prod.categoryId === detail || prod.categoryId === `cat-${detail}`)) {
      match = true;
    } else if (scope === 'brand' && prod.brand === detail) {
      match = true;
    } else if (scope === 'selected') {
      const checkedBoxes = document.querySelectorAll('input[name="promo-select-product"]:checked');
      const selectedIds = Array.from(checkedBoxes).map(cb => cb.value);
      if (selectedIds.includes(prod.id)) match = true;
    }
    
    if (match && Array.isArray(prod.variants)) {
      prod.variants.forEach(v => {
        if (v.promotionalPriceCents !== null) {
          v.promotionalPriceCents = null;
          clearedCount++;
        }
      });
      updateProduct(prod);
    }
  });
  
  if (clearedCount === 0) {
    showAdminToast('Nenhuma promoção ativa para remover no escopo selecionado.', 'warning');
    return;
  }
  
  state.products = getProducts();
  createActivityLog({ id: generateId('act'), type: 'warning', message: `Descontos promocionais removidos de ${clearedCount} variações. Operador: ${state.activeProfile}.`, actorUserId: 'user-1', createdAt: new Date().toISOString() });
  showAdminToast(`${clearedCount} promoções removidas.`, 'success');
  
  const previewCard = document.getElementById('promo-preview-card');
  if (previewCard) previewCard.classList.add('d-none');
  renderCurrentTab();
}

function showAdminToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.zIndex = '9999';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '8px';
  toast.style.color = 'var(--white)';
  toast.style.fontSize = '0.9rem';
  toast.style.fontWeight = '600';
  toast.style.boxShadow = 'var(--shadow-lg)';
  toast.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '8px';
  
  const colors = {
    success: 'var(--success)',
    warning: 'var(--alert)',
    danger: 'var(--danger)',
    info: 'var(--purple-primary)'
  };
  
  const icons = {
    success: '<i data-lucide="check" style="width: 16px; height: 16px;"></i>',
    warning: '<i data-lucide="alert-triangle" style="width: 16px; height: 16px;"></i>',
    danger: '<i data-lucide="x" style="width: 16px; height: 16px;"></i>',
    info: '<i data-lucide="info" style="width: 16px; height: 16px;"></i>'
  };
  
  toast.style.backgroundColor = colors[type] || colors.info;
  toast.innerHTML = `${icons[type] || icons.info} <span></span>`;
  toast.querySelector('span').textContent = message;
  
  document.body.appendChild(toast);
  if (window.lucide) lucide.createIcons();
  
  toast.style.transform = 'translateY(100px)';
  setTimeout(() => {
    toast.style.transform = 'translateY(0)';
  }, 10);
  
  setTimeout(() => {
    toast.style.transform = 'translateY(150px)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

// ==========================================
// MAINTENANCES TAB & MANAGEMENT CONTROLLER
// ==========================================
function openMaintenanceModal(maintId = null) {
  state.selectedMaintenanceToEdit = maintId;
  const overlay = document.getElementById('admin-maintenance-modal-overlay');
  const title = document.getElementById('admin-maintenance-modal-title');
  const form = document.getElementById('admin-add-maintenance-form');

  if (maintId) {
    const item = state.maintenances.find(m => m.id === maintId);
    if (item) {
      if (title) title.textContent = `Editar manutenção ${item.code}`;
      document.getElementById('m-device').value = item.device || '';
      document.getElementById('m-customer-name').value = item.customerName || '';
      document.getElementById('m-customer-phone').value = item.customerPhone || '';
      document.getElementById('m-problem').value = item.problem || '';
      document.getElementById('m-cost').value = item.estimatedCostCents ? (item.estimatedCostCents / 100).toFixed(2) : '';
      document.getElementById('m-status').value = item.status || 'Aberto';
      document.getElementById('m-notes').value = item.notes || '';
    }
  } else {
    if (title) title.textContent = 'Nova manutenção';
    if (form) form.reset();
  }

  openModal(overlay);
}

function closeMaintenanceModal() {
  const overlay = document.getElementById('admin-maintenance-modal-overlay');
  closeModal(overlay);
  state.selectedMaintenanceToEdit = null;
}

function handleMaintenanceSubmit(e) {
  e.preventDefault();

  const device = document.getElementById('m-device').value.trim();
  const customerName = document.getElementById('m-customer-name').value.trim();
  const customerPhone = document.getElementById('m-customer-phone').value.trim();
  const problem = document.getElementById('m-problem').value.trim();
  const costVal = parseFloat(document.getElementById('m-cost').value) || 0;
  const status = document.getElementById('m-status').value;
  const notes = document.getElementById('m-notes').value.trim();

  if (!device || !customerName || !problem) {
    showAdminToast('Preencha os campos obrigatórios: Aparelho, Cliente e Defeito.', 'danger');
    return;
  }

  const estimatedCostCents = Math.round(costVal * 100);

  if (state.selectedMaintenanceToEdit) {
    updateMaintenance({
      id: state.selectedMaintenanceToEdit,
      device, customerName, customerPhone, problem, estimatedCostCents, status, notes
    });
    showAdminToast('Manutenção atualizada com sucesso!', 'success');
  } else {
    createMaintenance({
      device, customerName, customerPhone, problem, estimatedCostCents, status, notes
    });
    showAdminToast('Nova manutenção cadastrada com sucesso!', 'success');
  }

  closeMaintenanceModal();
  renderMaintenancesTab();
  renderCategorySalesChart();
}

// ==========================================
// CATEGORY SALES BREAKDOWN & CHART CONTROLLER
// ==========================================
// ==========================================
// MARKETPLACE IMAGE UPLOAD CONTROLLER
// ==========================================
function setupProductImageUploadListeners() {
  const dropzone = document.getElementById('image-upload-dropzone');
  const fileInput = document.getElementById('product-image-file-input');

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-active');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-active');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-active');
    if (e.dataTransfer && e.dataTransfer.files) {
      handleProductImageFiles(e.dataTransfer.files);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files) {
      handleProductImageFiles(e.target.files);
    }
  });
}

function handleProductImageFiles(files) {
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) {
      showAdminToast('Apenas arquivos de imagem são permitidos.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target.result;
      
      compressImage(rawDataUrl, 1000, 1000, 0.85, (compressedDataUrl) => {
        const isPrimary = stateProductFormImages.length === 0;
        stateProductFormImages.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          src: compressedDataUrl,
          alt: file.name,
          isPrimary: isPrimary
        });
        renderProductImagePreviews();
      });
    };
    reader.readAsDataURL(file);
  });
}

function compressImage(src, maxWidth, maxHeight, quality, callback) {
  const img = new Image();
  img.onload = () => {
    let width = img.width;
    let height = img.height;

    if (width > maxWidth || height > maxHeight) {
      if (width > height) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      } else {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    callback(canvas.toDataURL('image/jpeg', quality));
  };
  img.src = src;
}

function renderProductImagePreviews() {
  const grid = document.getElementById('product-images-preview-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (stateProductFormImages.length === 0) {
    grid.innerHTML = '<span class="text-muted" style="font-size: 0.8rem; grid-column: 1/-1;">Nenhuma imagem enviada ainda.</span>';
    return;
  }

  stateProductFormImages.forEach((imgObj, idx) => {
    const card = document.createElement('div');
    card.className = 'preview-thumb-card';
    
    if (idx === 0) {
      imgObj.isPrimary = true;
    } else {
      imgObj.isPrimary = false;
    }

    const primaryBadge = imgObj.isPrimary ? '<span class="primary-badge">Principal</span>' : '';

    card.innerHTML = `
      ${primaryBadge}
      <img src="${esc(imgObj.src)}" alt="${esc(imgObj.alt || 'Foto')}">
      <div class="preview-thumb-actions">
        ${!imgObj.isPrimary ? `<button type="button" class="btn-thumb-action btn-make-primary" data-idx="${idx}" title="Definir como Principal"><i data-lucide="star" style="width:12px;height:12px;"></i></button>` : '<span></span>'}
        <button type="button" class="btn-thumb-action delete btn-remove-img" data-idx="${idx}" title="Remover Foto"><i data-lucide="trash-2" style="width:12px;height:12px;"></i></button>
      </div>
    `;

    const btnPrimary = card.querySelector('.btn-make-primary');
    if (btnPrimary) {
      btnPrimary.addEventListener('click', () => {
        const item = stateProductFormImages.splice(idx, 1)[0];
        stateProductFormImages.unshift(item);
        renderProductImagePreviews();
      });
    }

    const btnRemove = card.querySelector('.btn-remove-img');
    if (btnRemove) {
      btnRemove.addEventListener('click', () => {
        stateProductFormImages.splice(idx, 1);
        renderProductImagePreviews();
      });
    }

    grid.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}


// ==========================================
// SETTINGS: DATABASE STATUS, BACKUP & RESTORE
// ==========================================
const BACKUP_COLLECTIONS = ['categories', 'products', 'reservations', 'sales', 'maintenances', 'stockMovements', 'promotions', 'users', 'activityLog'];

function renderSettingsStatus() {
  const host = document.getElementById('settings-db-status');
  if (!host) return;
  const labels = { categories: 'Categorias', products: 'Produtos', reservations: 'Reservas', sales: 'Vendas', maintenances: 'Manutenções', stockMovements: 'Mov. de estoque', promotions: 'Promoções', users: 'Usuários', activityLog: 'Logs' };
  let bytes = 0;
  BACKUP_COLLECTIONS.forEach(k => { try { bytes += (localStorage.getItem(getStorageKey(k)) || '').length * 2; } catch (e) { /* ignore */ } });
  const cfg = typeof DEMO_CONFIG !== 'undefined' ? DEMO_CONFIG : {};
  const online = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);
  host.innerHTML = `
    <div class="db-mode ${online ? 'online' : 'local'}">
      <i data-lucide="${online ? 'cloud' : 'hard-drive'}"></i>
      <div><strong>${online ? 'Supabase configurado' : 'Armazenamento local (navegador)'}</strong>
      <span>${online ? 'Credenciais presentes em DEMO_CONFIG.' : 'Os dados existem só neste navegador. Faça backup antes de limpar o cache.'}</span></div>
    </div>
    <div class="db-grid">${BACKUP_COLLECTIONS.map(k => `<div class="db-stat"><span>${esc(labels[k])}</span><strong>${getStoreData(k).length}</strong></div>`).join('')}</div>
    <p class="text-muted" style="font-size:0.78rem;margin-top:10px;">Uso estimado: ${(bytes / 1024).toFixed(1)} KB de ~5.000 KB disponíveis no navegador.</p>`;
  if (window.lucide) lucide.createIcons();
}

function exportBackup() {
  const payload = { app: 'store-imports', schemaVersion: DEMO_SCHEMA_VERSION, exportedAt: new Date().toISOString(), data: {} };
  BACKUP_COLLECTIONS.forEach(k => { payload.data[k] = getStoreData(k); });
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `store-imports-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  showAdminToast('Backup exportado.', 'success');
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      if (!payload || payload.app !== 'store-imports' || typeof payload.data !== 'object') throw new Error('Arquivo não é um backup do Store Imports.');
      const found = BACKUP_COLLECTIONS.filter(k => Array.isArray(payload.data[k]));
      if (!found.length) throw new Error('Backup sem coleções válidas.');
      if (!confirm(`Restaurar ${found.length} coleções do backup de ${payload.exportedAt || 'data desconhecida'}? Os dados atuais serão substituídos.`)) return;
      found.forEach(k => saveStoreData(k, payload.data[k]));
      window.location.reload();
    } catch (err) {
      showAdminToast('Falha ao importar: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

function setupSettingsPanel() {
  const btnExport = document.getElementById('btn-export-backup');
  if (btnExport) btnExport.addEventListener('click', exportBackup);
  const input = document.getElementById('input-import-backup');
  if (input) input.addEventListener('change', () => { if (input.files[0]) importBackup(input.files[0]); input.value = ''; });
  const btnImport = document.getElementById('btn-import-backup');
  if (btnImport && input) btnImport.addEventListener('click', () => input.click());
}
