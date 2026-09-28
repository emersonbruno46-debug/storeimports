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
  activeProfile: 'Thallys'
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
  
  createActivityLog({ id: `act-${Date.now()}`, type: 'info', message: 'Sessão administrativa iniciada com sucesso.', actorUserId: 'user-1', createdAt: new Date().toISOString() });
  state.activityLogs = getActivityLog();
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
    link.addEventListener('click', () => {
      const rawTab = link.getAttribute('data-tab');
      switchTab(rawTab);
      document.body.classList.remove('mobile-sidebar-active');
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
    overview: 'Visão Geral',
    products: 'Gestão de Produtos',
    categories: 'Gestão de Categorias',
    stock: 'Controle de Estoque & Vendas por Categoria',
    maintenances: 'Controle de Manutenções',
    reservations: 'Controle de Reservas',
    sales: 'Histórico de Vendas Físicas',
    promo: 'Calculadora de Promoções',
    users: 'Cargos e Permissões',
    settings: 'Configurações Demo'
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
  
  if (state.currentTab === 'overview') {
    renderDashboardOverview();
    renderCategorySalesChart();
  } else if (state.currentTab === 'products') {
    renderProductsTable();
  } else if (state.currentTab === 'categories') {
    renderCategoriesTable();
  } else if (state.currentTab === 'stock') {
    populateProductSelects();
    renderStockLogsTable();
  } else if (state.currentTab === 'maintenances') {
    renderMaintenancesTab();
  } else if (state.currentTab === 'reservations') {
    renderReservationsTable();
  } else if (state.currentTab === 'sales') {
    populateProductSelects();
    renderSalesLogsTable();
  } else if (state.currentTab === 'promo') {
    const previewCard = document.getElementById('promo-preview-card');
    if (previewCard) previewCard.classList.add('d-none');
    
    const scopeSelect = document.getElementById('promo-scope');
    if (scopeSelect) {
      scopeSelect.dispatchEvent(new Event('change'));
    }
  }
}

// ==========================================
// VIEW RENDERING: OVERVIEW DASHBOARD
// ==========================================
function calculateOverviewKPIs() {
  const activeProds = state.products.filter(p => p.status === 'active');
  if (kpiTotalProducts) kpiTotalProducts.textContent = activeProds.length;
  
  const pending = state.reservations.filter(r => r.status === 'new' || r.status === 'contacted').length;
  if (kpiPendingRes) kpiPendingRes.textContent = pending;

  const lowStock = state.products.filter(p => {
    const totalStock = getProductTotalStock(p);
    const minStock = getProductMinimumStock(p);
    return totalStock <= minStock;
  }).length;
  if (kpiLowStock) kpiLowStock.textContent = lowStock;
  
  const totalSalesValue = state.sales
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + (s.totalCents || 0), 0);
  
  const kpiFaturamento = document.getElementById('kpi-faturamento');
  if (kpiFaturamento) {
    kpiFaturamento.textContent = formatBRLFromCents(totalSalesValue);
  }
}

function renderDashboardOverview() {
  const tbody = document.getElementById('dashboard-recent-reservations-tbody');
  if (tbody) {
    tbody.innerHTML = '';
    const sorted = [...state.reservations].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);
    
    if (sorted.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-muted" style="text-align: center;">Nenhuma solicitação recebida.</td></tr>';
    } else {
      sorted.forEach(res => {
        const tr = document.createElement('tr');
        const totalItems = res.items ? res.items.reduce((sum, i) => sum + i.quantity, 0) : 0;
        const statusLabel = getReservationStatusLabel(res.status);
        const statusClass = {
          'new': 'status-pending',
          'contacted': 'status-confirmed',
          'confirmed': 'status-confirmed',
          'completed': 'status-finished',
          'cancelled': 'status-cancelled'
        }[res.status] || 'status-pending';

        tr.innerHTML = `
          <td><strong></strong></td>
          <td></td>
          <td></td>
          <td></td>
          <td class="text-orange" style="font-weight: 700;"></td>
          <td><span class="status-pill ${statusClass}"></span></td>
          <td class="text-muted"></td>
        `;
        const cells = tr.querySelectorAll('td');
        cells[0].querySelector('strong').textContent = res.code || 'N/A';
        cells[1].textContent = res.demoCustomerName || 'N/A';
        cells[2].textContent = res.demoContactLabel || 'Demo';
        cells[3].textContent = `${totalItems} ite${totalItems !== 1 ? 'ns' : 'm'}`;
        cells[4].textContent = formatBRLFromCents(res.estimatedTotalCents || 0);
        cells[5].querySelector('span').textContent = statusLabel;
        cells[6].textContent = formatDateTimePtBr(res.createdAt);
        
        tbody.appendChild(tr);
      });
    }
  }

  const logList = document.getElementById('activity-log-list');
  if (logList) {
    logList.innerHTML = '';
    const logs = [...state.activityLogs].slice(-6).reverse();
    
    if (logs.length === 0) {
      logList.innerHTML = '<span class="text-muted" style="font-size: 0.8rem;">Sem atividades registradas.</span>';
    } else {
      logs.forEach(log => {
        const div = document.createElement('div');
        div.className = 'activity-item';
        
        let icon = 'info';
        let iconColor = 'info';
        if (log.type === 'success') {
          icon = 'check-circle';
          iconColor = 'success';
        } else if (log.type === 'warning') {
          icon = 'alert-triangle';
          iconColor = 'warning';
        }
        
        div.innerHTML = `
          <div class="activity-icon-wrapper ${iconColor}">
            <i data-lucide="${icon}" style="width: 14px; height: 14px;"></i>
          </div>
          <div class="activity-content">
            <span class="activity-text"></span>
            <span class="activity-time"></span>
          </div>
        `;
        div.querySelector('.activity-text').textContent = log.message || 'Atividade registrada';
        div.querySelector('.activity-time').textContent = formatDateTimePtBr(log.createdAt);
        
        logList.appendChild(div);
      });
    }
  }

  if (window.lucide) lucide.createIcons();
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
function renderCategoriesTable() {
  const tbody = document.getElementById('admin-categories-table-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const query = (document.getElementById('admin-search-categories')?.value || '').trim().toLowerCase();
  let filtered = state.categories.filter(c => query ? c.name.toLowerCase().includes(query) || c.id.toLowerCase().includes(query) : true);

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-muted" style="text-align: center;">Nenhuma categoria encontrada.</td></tr>';
  } else {
    filtered.forEach(c => {
      const tr = document.createElement('tr');
      const statusLabel = c.status === 'active' ? 'Ativa' : 'Inativa';
      const statusBadgeColor = c.status === 'active' ? 'var(--success)' : 'var(--danger)';
      const productCount = state.products.filter(p => p.categoryId === c.id && p.status === 'active').length;
      
      const imgSrc = c.image
        ? (c.image.startsWith('data:') || c.image.startsWith('http') ? c.image : `./assets/${c.image}`)
        : '';
      tr.innerHTML = `
        <td><div style="width: 40px; height: 40px; background: var(--bg-secondary); border-radius: 8px; display: flex; align-items: center; justify-content: center;">${imgSrc ? `<img src="${imgSrc}" alt="" style="max-width: 36px; max-height: 36px; object-fit: contain; border-radius: 4px;">` : '<i data-lucide="image" style="width:18px;height:18px;opacity:0.3;"></i>'}</div></td>
        <td><strong></strong></td>
        <td><span class="badge-capsule badge-purple-light" style="font-size: 0.75rem;"></span></td>
        <td>${productCount} produto${productCount !== 1 ? 's' : ''}</td>
        <td><span class="badge-capsule" style="background: ${statusBadgeColor}; font-size: 0.65rem;">${statusLabel}</span></td>
        <td>
          <button class="table-action-btn edit-btn-cat" data-id="${c.id}"><i data-lucide="edit"></i></button>
          <button class="table-action-btn delete-btn-cat" data-id="${c.id}"><i data-lucide="trash-2"></i></button>
        </td>
      `;

      tr.querySelector('td:nth-child(2) strong').textContent = c.name;
      tr.querySelector('.badge-purple-light').textContent = c.id;

      tr.querySelector('.edit-btn-cat').addEventListener('click', () => openCategoryFormModal(c.id));
      tr.querySelector('.delete-btn-cat').addEventListener('click', () => deleteCategory(c.id));

      tbody.appendChild(tr);
    });
  }
  if (window.lucide) lucide.createIcons();
}

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
  if (titleEl) titleEl.textContent = catId ? 'Editar Categoria' : 'Cadastrar Categoria';
  
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
    pCatSelect.innerHTML = state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  }
  
  if (filterCatSelect) {
    const currentVal = filterCatSelect.value;
    filterCatSelect.innerHTML = `<option value="">Todas as Categorias</option>` + 
      state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    filterCatSelect.value = currentVal;
  }
}

// ==========================================
// PRODUCTS MANAGEMENT (CRUD)
// ==========================================
function renderProductsTable() {
  const tbody = document.getElementById('admin-products-table-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const query = adminSearchProducts ? adminSearchProducts.value.trim().toLowerCase() : '';
  const category = adminFilterProductsCategory ? adminFilterProductsCategory.value : '';
  
  let filtered = state.products.filter(p => {
    if (category && p.categoryId !== category) return false;
    if (query) {
      const matchName = (p.name || '').toLowerCase().includes(query);
      const matchBrand = (p.brand || '').toLowerCase().includes(query);
      const matchCode = (p.sku || '').toLowerCase().includes(query);
      if (!matchName && !matchBrand && !matchCode) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-muted" style="text-align: center;">Nenhum produto cadastrado correspondente aos filtros.</td></tr>';
  } else {
    filtered.forEach(p => {
      const tr = document.createElement('tr');

      const totalStock = getProductTotalStock(p);
      const minStock = getProductMinimumStock(p);
      const primaryVar = getPrimaryVariant(p);
      const displayPriceCents = getProductDisplayPriceCents(p);
      const hasPromo = primaryVar && primaryVar.promotionalPriceCents !== null && primaryVar.promotionalPriceCents !== undefined;
      const condLabel = p.condition === 'new' ? 'Novo' : 'Seminovo';
      const catName = (state.categories.find(c => c.id === p.categoryId) || {}).name || p.categoryId;
      const isInactive = p.status === 'inactive';
      const statusLabel = isInactive ? 'Inativo' : 'Ativo';
      const statusBadgeColor = isInactive ? 'var(--danger)' : 'var(--success)';
      
      let stockColorStyle = '';
      if (totalStock <= minStock && totalStock > 0) stockColorStyle = 'color: var(--alert); font-weight: 700;';
      if (totalStock === 0) stockColorStyle = 'color: var(--danger); font-weight: 700;';

      tr.innerHTML = `
        <td><span class="badge-capsule badge-purple-light" style="font-size: 0.75rem;"></span></td>
        <td><strong></strong></td>
        <td class="prod-name-cell"></td>
        <td class="text-muted" style="font-size: 0.8rem;"></td>
        <td></td>
        <td class="text-orange" style="font-weight: 700;"></td>
        <td style="${stockColorStyle}"></td>
        <td><span class="badge-capsule" style="background: ${statusBadgeColor}; font-size: 0.65rem; color: #fff;">${statusLabel}</span></td>
        <td>
          <button class="table-action-btn edit-btn" data-id="${p.id}" title="Editar"><i data-lucide="edit"></i></button>
          <button class="table-action-btn delete-btn" data-id="${p.id}" title="${isInactive ? 'Ativar Produto' : 'Inativar Produto'}"><i data-lucide="${isInactive ? 'check-circle' : 'archive'}"></i></button>
        </td>
      `;
      const cells = tr.querySelectorAll('td');
      cells[0].querySelector('span').textContent = p.sku || 'N/A';
      cells[1].querySelector('strong').textContent = p.brand;
      cells[2].textContent = `${p.name} (${condLabel})`;
      cells[3].textContent = catName;
      cells[4].textContent = formatBRLFromCents(primaryVar ? primaryVar.priceCents : 0);
      cells[5].textContent = hasPromo ? formatBRLFromCents(primaryVar.promotionalPriceCents) : '—';
      cells[6].textContent = `${totalStock} un (Min: ${minStock})`;

      tr.querySelector('.edit-btn').addEventListener('click', () => openProductFormModal(p.id));
      tr.querySelector('.delete-btn').addEventListener('click', () => deleteProduct(p.id));

      tbody.appendChild(tr);
    });
  }
  
  if (window.lucide) lucide.createIcons();
}

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
    if (titleEl) titleEl.textContent = 'Editar Produto';
    
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
    if (titleEl) titleEl.textContent = 'Cadastrar Novo Produto';
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

function renderVariantsBuilder() {
  const c = document.getElementById('variants-container');
  if (!c) return;
  c.innerHTML = '';
  if (tempVariants.length === 0) {
    c.innerHTML = '<div class="text-muted" style="font-size:0.8rem;">Nenhuma variação adicionada. Clique em "Adicionar Variação" acima.</div>';
    return;
  }
  tempVariants.forEach((v, index) => {
    const div = document.createElement('div');
    div.style.padding = '12px';
    div.style.border = '1px solid var(--border-color)';
    div.style.borderRadius = 'var(--radius-md)';
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.gap = '8px';
    
    div.innerHTML = `
      <div style="display:flex; justify-space-between; align-items:center;">
        <strong>Variação #${index+1}</strong>
        <button type="button" class="btn btn-secondary btn-sm" onclick="removeVariant(${index})" style="padding:4px 8px; color:var(--danger);"><i data-lucide="trash-2"></i></button>
      </div>
      <div class="grid-2-col">
        <div>
          <label class="form-label" style="font-size:0.75rem;">Cor</label>
          <input type="text" class="form-control var-color" value="${v.color || v.colorName || ''}" placeholder="Ex: Preto" data-idx="${index}">
        </div>
        <div>
          <label class="form-label" style="font-size:0.75rem;">Capacidade</label>
          <input type="text" class="form-control var-cap" value="${v.capacity || v.capacityName || ''}" placeholder="Ex: 256 GB" data-idx="${index}">
        </div>
      </div>
      <div class="grid-2-col">
        <div>
          <label class="form-label" style="font-size:0.75rem;">Estoque Inicial (un)</label>
          <input type="number" class="form-control var-stock" value="${v.stockQuantity}" placeholder="Ex: 5" min="0" data-idx="${index}">
        </div>
        <div>
          <label class="form-label" style="font-size:0.75rem;">Mín. Estoque</label>
          <input type="number" class="form-control var-min-stock" value="${v.minimumStock}" min="0" data-idx="${index}">
        </div>
      </div>
      <div>
        <label class="form-label" style="font-size:0.75rem;">IMEIs / Serials (Separados por vírgula)</label>
        <textarea class="form-control var-imeis" rows="1" placeholder="Ex: IMEI-001, IMEI-002" data-idx="${index}">${(v.demoImeis || []).join(', ')}</textarea>
      </div>
    `;
    c.appendChild(div);
  });
  
  c.querySelectorAll('.var-color').forEach(el => el.addEventListener('input', e => tempVariants[e.target.dataset.idx].color = e.target.value));
  c.querySelectorAll('.var-cap').forEach(el => el.addEventListener('input', e => tempVariants[e.target.dataset.idx].capacity = e.target.value));
  c.querySelectorAll('.var-stock').forEach(el => el.addEventListener('input', e => tempVariants[e.target.dataset.idx].stockQuantity = Math.max(0, parseInt(e.target.value) || 0)));
  c.querySelectorAll('.var-min-stock').forEach(el => el.addEventListener('input', e => tempVariants[e.target.dataset.idx].minimumStock = Math.max(0, parseInt(e.target.value) || 0)));
  c.querySelectorAll('.var-imeis').forEach(el => el.addEventListener('input', e => {
    tempVariants[e.target.dataset.idx].demoImeis = e.target.value.split(',').map(i=>i.trim()).filter(Boolean);
  }));
  if (window.lucide) lucide.createIcons();
}

window.removeVariant = function(idx) {
  tempVariants.splice(idx, 1);
  renderVariantsBuilder();
};

function renderPricingBuilder() {
  const c = document.getElementById('variants-pricing-container');
  if (!c) return;
  c.innerHTML = '';
  if (tempVariants.length === 0) {
    c.innerHTML = '<div class="text-muted" style="font-size:0.8rem;">Adicione variações na etapa 3 primeiro.</div>';
    return;
  }
  tempVariants.forEach((v, index) => {
    const div = document.createElement('div');
    div.style.padding = '12px';
    div.style.border = '1px solid var(--border-color)';
    div.style.borderRadius = 'var(--radius-md)';
    const label = `${v.color || v.colorName || ''} ${v.capacity || v.capacityName || ''}`.trim() || `Variação #${index+1}`;
    
    div.innerHTML = `
      <strong style="display:block; margin-bottom: 8px;">${label}</strong>
      <div class="grid-2-col">
        <div>
          <label class="form-label" style="font-size:0.75rem;">Preço Base (R$)</label>
          <input type="number" step="0.01" class="form-control var-price" value="${v.priceCents ? (v.priceCents / 100).toFixed(2) : ''}" placeholder="Ex: 5000.00" data-idx="${index}">
        </div>
        <div>
          <label class="form-label" style="font-size:0.75rem;">Preço Promo (R$)</label>
          <input type="number" step="0.01" class="form-control var-promo" value="${v.promotionalPriceCents ? (v.promotionalPriceCents / 100).toFixed(2) : ''}" placeholder="Ex: 4800.00 (opcional)" data-idx="${index}">
        </div>
      </div>
      <div class="grid-2-col" style="margin-top:8px;">
        <div>
          <label class="form-label" style="font-size:0.75rem;">Custo Interno (R$)</label>
          <input type="number" step="0.01" class="form-control var-cost" value="${v.costCents ? (v.costCents / 100).toFixed(2) : ''}" placeholder="Ex: 4000.00 (opcional)" data-idx="${index}">
        </div>
      </div>
    `;
    c.appendChild(div);
  });
  
  c.querySelectorAll('.var-price').forEach(el => el.addEventListener('input', e => tempVariants[e.target.dataset.idx].priceCents = Math.round(parseFloat(e.target.value) * 100) || 0));
  c.querySelectorAll('.var-promo').forEach(el => el.addEventListener('input', e => tempVariants[e.target.dataset.idx].promotionalPriceCents = e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null));
  c.querySelectorAll('.var-cost').forEach(el => el.addEventListener('input', e => tempVariants[e.target.dataset.idx].costCents = e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null));
}

function buildReviewStep() {
  const rName = document.getElementById('review-product-name');
  const rVar = document.getElementById('review-variants-count');
  const rStock = document.getElementById('review-total-stock');
  const rImg = document.getElementById('review-images-count');
  
  if (rName) rName.textContent = document.getElementById('p-name').value || 'N/A';
  if (rVar) rVar.textContent = `${tempVariants.length} Variações Mapeadas`;
  const totalStock = tempVariants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
  if (rStock) rStock.textContent = `Estoque Total: ${totalStock} un`;
  if (rImg) rImg.textContent = `${stateProductFormImages.length} Fotos Anexadas`;
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
    { id: `img-${Date.now()}`, src: './assets/placeholder.png', alt: name, isPrimary: true }
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
      `<option value="${p.id}||${v.id}">${p.name} (${p.brand}) — ${v.color || ''} ${v.capacity || ''} [Estoque: ${v.stockQuantity} un]</option>`
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
  showAdminToast('Estoque atualizado com sucesso!', 'success');
  renderCurrentTab();
}

function renderStockLogsTable() {
  const tbody = document.getElementById('admin-stock-logs-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const sorted = [...state.stockLogs].reverse();
  
  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-muted" style="text-align: center;">Sem movimentações registradas.</td></tr>';
  } else {
    sorted.forEach(log => {
      const tr = document.createElement('tr');
      
      const typeLabels = { 'entry': 'Entrada (+)', 'exit': 'Saída (-)', 'positive_adjustment': 'Ajuste (+)', 'negative_adjustment': 'Ajuste (-)' };
      const typeLabel = typeLabels[log.type] || log.type || 'N/A';
      
      let typeStyle = 'color: var(--success); font-weight: 700;';
      if (log.type === 'exit' || log.type === 'negative_adjustment') typeStyle = 'color: var(--danger); font-weight: 700;';
      if (log.type === 'positive_adjustment') typeStyle = 'color: var(--purple-primary); font-weight: 700;';
      
      const prod = getProductById(log.productId);
      const productName = prod ? prod.name : (log.productName || log.productId || 'N/A');
      
      tr.innerHTML = `
        <td class="text-muted"></td>
        <td><strong></strong></td>
        <td>${log.quantity || 0} un</td>
        <td style="${typeStyle}"></td>
        <td></td>
        <td><span class="badge-capsule badge-purple-light" style="font-size: 0.7rem; padding: 2px 8px;">Admin</span></td>
      `;
      const cells = tr.querySelectorAll('td');
      cells[0].textContent = formatDateTimePtBr(log.createdAt || log.timestamp);
      cells[1].querySelector('strong').textContent = productName;
      cells[3].textContent = typeLabel;
      cells[4].textContent = log.reason || 'N/A';
      
      tbody.appendChild(tr);
    });
  }
}

// ==========================================
// RESERVATIONS CONTROLLER
// ==========================================
function renderReservationsTable() {
  const tbody = document.getElementById('admin-reservations-table-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const query = adminSearchReservations ? adminSearchReservations.value.trim().toLowerCase() : '';
  const status = adminFilterReservationsStatus ? adminFilterReservationsStatus.value : '';
  
  let filtered = state.reservations.filter(res => {
    if (status && res.status !== status) return false;
    
    if (query) {
      const matchName = (res.demoCustomerName || '').toLowerCase().includes(query);
      const matchCode = (res.code || '').toLowerCase().includes(query);
      const matchPhone = (res.demoContactLabel || '').replace(/\D/g, '').includes(query.replace(/\D/g, ''));
      if (!matchName && !matchCode && !matchPhone) return false;
    }
    
    return true;
  });

  filtered.sort((a, b) => b.id.localeCompare(a.id));

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-muted" style="text-align: center;">Nenhuma reserva encontrada correspondente aos filtros.</td></tr>';
  } else {
    filtered.forEach(res => {
      const tr = document.createElement('tr');
      
      const statusLabel = getReservationStatusLabel(res.status);
      const statusClass = {
        'new': 'status-pending',
        'contacted': 'status-confirmed',
        'confirmed': 'status-confirmed',
        'completed': 'status-finished',
        'cancelled': 'status-cancelled'
      }[res.status] || 'status-pending';
      
      const totalItems = (res.items || []).reduce((s, i) => s + (i.quantity || 0), 0);

      tr.innerHTML = `
        <td><strong></strong></td>
        <td></td>
        <td></td>
        <td></td>
        <td class="text-orange" style="font-weight: 700;"></td>
        <td><span class="status-pill ${statusClass}"></span></td>
        <td class="text-muted"></td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${res.status === 'new' ? `<button class="btn btn-primary btn-sm btn-status-change" data-id="${res.id}" data-to="contacted" style="padding: 4px 8px; font-size: 0.75rem;">Contatar</button>` : ''}
            ${res.status === 'contacted' ? `<button class="btn btn-primary btn-sm btn-status-change" data-id="${res.id}" data-to="confirmed" style="padding: 4px 8px; font-size: 0.75rem;">Confirmar</button>` : ''}
            ${res.status === 'confirmed' ? `<button class="btn btn-primary btn-sm btn-status-change" data-id="${res.id}" data-to="completed" style="background-color: var(--success); padding: 4px 8px; font-size: 0.75rem;">Faturar</button>` : ''}
            ${['new','contacted','confirmed'].includes(res.status) ? `<button class="btn btn-secondary btn-sm btn-status-change" data-id="${res.id}" data-to="cancelled" style="padding: 4px 8px; font-size: 0.75rem; border-color: var(--danger); color: var(--danger);">Cancelar</button>` : ''}
          </div>
        </td>
      `;
      const cells = tr.querySelectorAll('td');
      cells[0].querySelector('strong').textContent = res.code || 'N/A';
      cells[1].textContent = res.demoCustomerName || 'N/A';
      // Clickable WhatsApp link for contact number
      cells[2].innerHTML = '';
      cells[2].appendChild(renderWhatsappCell(res.demoContactLabel, res.demoContactLabel));
      cells[3].textContent = formatDateTimePtBr(res.requestedDate);
      cells[4].textContent = formatBRLFromCents(res.estimatedTotalCents || 0);
      cells[5].querySelector('span').textContent = statusLabel;
      cells[6].textContent = formatDateTimePtBr(res.createdAt);

      tr.querySelectorAll('.btn-status-change').forEach(btn => {
        btn.addEventListener('click', () => {
          const toStatus = btn.getAttribute('data-to');
          changeReservationStatus(res.id, toStatus);
        });
      });

      tbody.appendChild(tr);
    });
  }

  if (window.lucide) lucide.createIcons();
}

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
  showAdminToast('Venda registrada com sucesso!', 'success');
  renderCurrentTab();
}

function renderSalesLogsTable() {
  const tbody = document.getElementById('admin-sales-log-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const sorted = [...state.sales].reverse();
  
  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-muted" style="text-align: center;">Sem vendas registradas.</td></tr>';
  } else {
    sorted.forEach(sale => {
      const tr = document.createElement('tr');
      
      const totalItems = (sale.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
      const prodName = sale.items && sale.items.length > 0 ? (() => {
        const prod = getProductById(sale.items[0].productId);
        return prod ? prod.name : 'Produto';
      })() : 'Venda';
      
      const isReversed = sale.status === 'cancelled';
      const statusBadge = isReversed 
        ? `<span class="badge-capsule" style="background-color: var(--danger); font-size: 0.7rem;">Estornada</span>`
        : `<span class="badge-capsule" style="background-color: var(--success-bg); color: var(--success); font-size: 0.7rem;">Concluída</span>`;

      tr.innerHTML = `
        <td><strong></strong></td>
        <td class="text-muted" style="max-width:180px;"></td>
        <td></td>
        <td></td>
        <td class="text-muted"></td>
        <td class="text-orange" style="font-weight: 700;"></td>
        <td>${statusBadge}</td>
        <td class="text-muted" style="font-size: 0.8rem;"></td>
        <td>
          <div style="display: flex; gap: 4px;">
            <button class="table-action-btn print-btn" data-id="${sale.id}" title="Imprimir Cupom"><i data-lucide="printer"></i></button>
            ${!isReversed ? `<button class="table-action-btn refund-btn" data-id="${sale.id}" title="Estornar Venda" style="color: var(--danger);"><i data-lucide="rotate-ccw"></i></button>` : ''}
          </div>
        </td>
      `;
      const cells = tr.querySelectorAll('td');
      cells[0].querySelector('strong').textContent = sale.code || 'N/A';
      cells[1].textContent = prodName;
      cells[2].textContent = `${totalItems}x`;
      cells[3].textContent = sale.demoCustomerName || 'Consumidor';
      cells[4].textContent = getPaymentMethodLabel(sale.demoPaymentMethod);
      cells[5].textContent = formatBRLFromCents(sale.totalCents || 0);
      cells[7].textContent = formatDateTimePtBr(sale.createdAt);
      
      tr.querySelector('.print-btn').addEventListener('click', () => {
        printSaleCoupon(sale.id);
      });

      const refundBtn = tr.querySelector('.refund-btn');
      if (refundBtn) {
        refundBtn.addEventListener('click', () => {
          promptSaleReversal(sale.id);
        });
      }
      
      tbody.appendChild(tr);
    });
  }
  if (window.lucide) lucide.createIcons();
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
    avatarEl.style.backgroundColor = 'var(--purple-primary)';
    nameEl.textContent = 'Thallys';
    roleEl.textContent = 'Gerente Geral';
  } else {
    avatarEl.textContent = 'J';
    avatarEl.style.backgroundColor = 'var(--orange-primary)';
    nameEl.textContent = 'Joice';
    roleEl.textContent = 'Gerente Comercial';
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
        <td>${pName}${spec}</td>
        <td class="right">${i.quantity}x</td>
        <td class="right">${formatBRLFromCents(i.totalCents)}</td>
      </tr>
    `;
  }).join('');
  
  const receiptHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cupom de Venda - ${sale.code}</title>
        ${receiptStyles}
      </head>
      <body>
        <div class="center bold" style="font-size: 16px;">${DEMO_CONFIG.storeName.toUpperCase()}</div>
        <div class="center">${DEMO_CONFIG.address}</div>
        <div class="center">Ambiente Demonstrativo</div>
        <div class="divider"></div>
        <div><strong>CUPOM DE VENDA:</strong> ${sale.code}</div>
        <div><strong>DATA:</strong> ${formatDateTimePtBr(sale.createdAt)}</div>
        <div><strong>CLIENTE:</strong> ${sale.demoCustomerName || 'Consumidor Presencial'}</div>
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
      if (label) label.textContent = 'Selecione a Categoria:';
      
      if (scopeDetailSelect) {
        scopeDetailSelect.innerHTML = state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      }
    } else if (scope === 'brand') {
      if (scopeDetailGroup) scopeDetailGroup.classList.remove('d-none');
      if (manualSelectGroup) manualSelectGroup.classList.add('d-none');
      const label = document.getElementById('promo-scope-detail-label');
      if (label) label.textContent = 'Selecione a Marca:';
      
      const brands = [...new Set(state.products.map(p => p.brand))].filter(Boolean);
      if (scopeDetailSelect) {
        scopeDetailSelect.innerHTML = brands.map(b => `<option value="${b}">${b}</option>`).join('');
      }
    } else if (scope === 'selected') {
      if (scopeDetailGroup) scopeDetailGroup.classList.add('d-none');
      if (manualSelectGroup) manualSelectGroup.classList.remove('d-none');
      
      if (manualProductsList) {
        manualProductsList.innerHTML = state.products.map(p => {
          const displayPrice = getProductDisplayPriceCents(p);
          return `
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; margin-bottom: 4px;">
              <input type="checkbox" name="promo-select-product" value="${p.id}" style="width: 16px; height: 16px; accent-color: var(--purple-primary);">
              <span>${p.name} (${p.brand}) — ${formatBRLFromCents(displayPrice)}</span>
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

function generatePromoPreview() {
  const scope = document.getElementById('promo-scope').value;
  const detail = document.getElementById('promo-scope-detail') ? document.getElementById('promo-scope-detail').value : '';
  const discountType = document.getElementById('promo-discount-type').value;
  const discountValue = parseFloat(document.getElementById('promo-discount-value').value);
  const previewCard = document.getElementById('promo-preview-card');
  const tbody = document.getElementById('promo-preview-tbody');
  
  if (isNaN(discountValue) || discountValue <= 0) {
    showAdminToast('Insira um valor de desconto positivo e válido.', 'danger');
    return;
  }
  
  let productsToApply = [];
  if (scope === 'all') {
    productsToApply = [...state.products];
  } else if (scope === 'category') {
    productsToApply = state.products.filter(p => p.categoryId === detail || p.categoryId === `cat-${detail}`);
  } else if (scope === 'brand') {
    productsToApply = state.products.filter(p => p.brand === detail);
  } else if (scope === 'selected') {
    const checkedBoxes = document.querySelectorAll('input[name="promo-select-product"]:checked');
    const selectedIds = Array.from(checkedBoxes).map(cb => cb.value);
    productsToApply = state.products.filter(p => selectedIds.includes(p.id));
  }
  
  if (productsToApply.length === 0) {
    showAdminToast('Nenhum produto elegível encontrado para o escopo selecionado.', 'warning');
    return;
  }
  
  promoPreviewProducts = [];
  
  productsToApply.forEach(prod => {
    (prod.variants || []).forEach(variant => {
      const baseCents = variant.priceCents || 0;
      let newPromoCents = baseCents;
      
      if (discountType === 'percent') {
        newPromoCents = Math.round(baseCents * (1 - (discountValue / 100)));
      } else {
        const discountCents = Math.round(discountValue * 100);
        newPromoCents = Math.max(0, baseCents - discountCents);
      }
      
      if (newPromoCents >= baseCents) newPromoCents = baseCents;

      promoPreviewProducts.push({
        productId: prod.id,
        variantId: variant.id,
        productName: prod.name,
        variantLabel: `${variant.color || ''} ${variant.capacity || ''}`.trim() || 'Padrão',
        sku: variant.sku || prod.sku,
        basePriceCents: baseCents,
        oldPromoPriceCents: variant.promotionalPriceCents,
        newPromoPriceCents: newPromoCents,
        discountCents: baseCents - newPromoCents
      });
    });
  });

  if (tbody) {
    tbody.innerHTML = promoPreviewProducts.map(item => `
      <tr>
        <td><span class="badge-capsule badge-purple-light" style="font-size: 0.75rem;">${item.sku}</span></td>
        <td><strong>${item.productName}</strong> <span class="text-muted" style="font-size: 0.75rem;">(${item.variantLabel})</span></td>
        <td>${formatBRLFromCents(item.basePriceCents)}</td>
        <td class="text-muted">${item.oldPromoPriceCents !== null && item.oldPromoPriceCents !== undefined ? formatBRLFromCents(item.oldPromoPriceCents) : '—'}</td>
        <td class="text-orange" style="font-weight: 700;">${formatBRLFromCents(item.newPromoPriceCents)}</td>
        <td class="text-purple" style="font-weight: 700;">${formatBRLFromCents(item.discountCents)}</td>
      </tr>
    `).join('');
  }
  
  if (previewCard) previewCard.classList.remove('d-none');
  showAdminToast(`Prévia de promoção gerada para ${promoPreviewProducts.length} variações.`, 'info');
}

function applyPromoDiscount() {
  if (promoPreviewProducts.length === 0) {
    showAdminToast('Gere a prévia de alterações antes de aplicar.', 'warning');
    return;
  }
  
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
  const previewCard = document.getElementById('promo-preview-card');
  if (previewCard) previewCard.classList.add('d-none');
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
function renderMaintenancesTab() {
  state.maintenances = getMaintenances();
  
  // KPIs
  const kpiTotal = document.getElementById('kpi-maint-total');
  const kpiOpen = document.getElementById('kpi-maint-open');
  const kpiNotStarted = document.getElementById('kpi-maint-not-started');
  const kpiFinished = document.getElementById('kpi-maint-finished');
  
  const total = state.maintenances.length;
  const openCount = state.maintenances.filter(m => m.status === 'Aberto').length;
  const notStartedCount = state.maintenances.filter(m => m.status === 'Não iniciado').length;
  const finishedCount = state.maintenances.filter(m => m.status === 'Finalizado').length;

  if (kpiTotal) kpiTotal.textContent = total;
  if (kpiOpen) kpiOpen.textContent = openCount;
  if (kpiNotStarted) kpiNotStarted.textContent = notStartedCount;
  if (kpiFinished) kpiFinished.textContent = finishedCount;

  // Filter list
  const searchVal = (document.getElementById('admin-search-maintenances')?.value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('admin-filter-maintenances-status')?.value || '';

  let filtered = state.maintenances.filter(m => {
    if (searchVal) {
      const matchDevice = (m.device || '').toLowerCase().includes(searchVal);
      const matchClient = (m.customerName || '').toLowerCase().includes(searchVal);
      const matchCode = (m.code || '').toLowerCase().includes(searchVal);
      const matchProb = (m.problem || '').toLowerCase().includes(searchVal);
      if (!matchDevice && !matchClient && !matchCode && !matchProb) return false;
    }
    if (statusFilter && m.status !== statusFilter) return false;
    return true;
  });

  const tbody = document.getElementById('admin-maintenances-table-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-muted" style="text-align: center; padding: 24px;">Nenhuma manutenção cadastrada ou encontrada.</td></tr>';
    return;
  }

  filtered.forEach(m => {
    const tr = document.createElement('tr');
    
    let statusClass = 'maint-badge-aberto';
    let iconName = 'clock';
    if (m.status === 'Não iniciado') {
      statusClass = 'maint-badge-nao-iniciado';
      iconName = 'pause-circle';
    } else if (m.status === 'Finalizado') {
      statusClass = 'maint-badge-finalizado';
      iconName = 'check-circle-2';
    }

    const costFormatted = formatBRLFromCents(m.estimatedCostCents || 0);

    tr.innerHTML = `
      <td><strong>${m.code || 'N/A'}</strong></td>
      <td style="font-weight: 700; color: var(--purple-primary);">${m.device}</td>
      <td>
        <div style="display: flex; flex-direction: column;">
          <span>${m.customerName}</span>
          <span class="whatsapp-cell-maint" style="font-size: 0.75rem; color: var(--text-secondary);"></span>
        </div>
      </td>
      <td style="max-width: 220px; white-space: normal; font-size: 0.82rem;">${m.problem}</td>
      <td style="font-weight: 700; color: var(--purple-primary);">${costFormatted}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="${statusClass}"><i data-lucide="${iconName}" style="width: 12px; height: 12px;"></i> ${m.status}</span>
          <select class="form-control btn-sm status-quick-select" data-id="${m.id}" style="width: auto; padding: 2px 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer;">
            <option value="Aberto" ${m.status === 'Aberto' ? 'selected' : ''}>Aberto</option>
            <option value="N\u00e3o iniciado" ${m.status === 'Não iniciado' ? 'selected' : ''}>Não iniciado</option>
            <option value="Finalizado" ${m.status === 'Finalizado' ? 'selected' : ''}>Finalizado</option>
          </select>
        </div>
      </td>
      <td class="text-muted" style="font-size: 0.8rem;">${formatDateTimePtBr(m.entryDate)}</td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-secondary btn-sm btn-edit-maint" data-id="${m.id}" title="Editar"><i data-lucide="edit-3"></i></button>
          <button class="btn btn-secondary btn-sm btn-delete-maint" data-id="${m.id}" title="Excluir" style="color: var(--danger); border-color: var(--danger);"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    `;

    // Render clickable WhatsApp phone link in maintenance table
    const whatsappCellMaint = tr.querySelector('.whatsapp-cell-maint');
    if (whatsappCellMaint) {
      whatsappCellMaint.appendChild(renderWhatsappCell(m.customerPhone, m.customerPhone || 'Sem tel.'));
    }

    // Quick status select event
    const selectEl = tr.querySelector('.status-quick-select');
    selectEl.addEventListener('change', (e) => {
      const newStatus = e.target.value;
      updateMaintenanceStatus(m.id, newStatus);
      showAdminToast(`Status da manutenção ${m.code} alterado para "${newStatus}".`, 'success');
      createActivityLog({ id: `act-${Date.now()}`, type: 'info', message: `Manutenção ${m.code} (${m.device}) atualizada para: ${newStatus}`, actorUserId: 'user-1', createdAt: new Date().toISOString() });
      renderMaintenancesTab();
      renderCategorySalesChart();
    });

    // Edit event
    tr.querySelector('.btn-edit-maint').addEventListener('click', () => {
      openMaintenanceModal(m.id);
    });

    // Delete event
    tr.querySelector('.btn-delete-maint').addEventListener('click', () => {
      if (confirm(`Deseja excluir a manutenção "${m.code} - ${m.device}"?`)) {
        deleteMaintenance(m.id);
        showAdminToast('Manutenção removida com sucesso.', 'warning');
        renderMaintenancesTab();
        renderCategorySalesChart();
      }
    });

    tbody.appendChild(tr);
  });

  if (window.lucide) lucide.createIcons();
}

function openMaintenanceModal(maintId = null) {
  state.selectedMaintenanceToEdit = maintId;
  const overlay = document.getElementById('admin-maintenance-modal-overlay');
  const title = document.getElementById('admin-maintenance-modal-title');
  const form = document.getElementById('admin-add-maintenance-form');

  if (maintId) {
    const item = state.maintenances.find(m => m.id === maintId);
    if (item) {
      if (title) title.textContent = `Editar Manutenção (${item.code})`;
      document.getElementById('m-device').value = item.device || '';
      document.getElementById('m-customer-name').value = item.customerName || '';
      document.getElementById('m-customer-phone').value = item.customerPhone || '';
      document.getElementById('m-problem').value = item.problem || '';
      document.getElementById('m-cost').value = item.estimatedCostCents ? (item.estimatedCostCents / 100).toFixed(2) : '';
      document.getElementById('m-status').value = item.status || 'Aberto';
      document.getElementById('m-notes').value = item.notes || '';
    }
  } else {
    if (title) title.textContent = 'Cadastrar Nova Manutenção';
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
function renderCategorySalesChart() {
  const listContainer = document.getElementById('category-sales-breakdown-list');
  const canvas = document.getElementById('category-sales-chart');
  if (!canvas) return;

  const sales = getSales().filter(s => s.status === 'completed');
  const products = getProducts();
  const categories = getCategories();
  const finishedMaintenances = getMaintenances().filter(m => m.status === 'Finalizado');

  let totalCelularesCents = 0;
  let totalAcessoriosCents = 0;
  let totalManutencaoCents = 0;
  let totalOutrosCents = 0;

  sales.forEach(sale => {
    (sale.items || []).forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const itemTotal = item.totalCents || (item.unitPriceCents * item.quantity);
      
      if (prod) {
        const catSlug = prod.categoryId || '';
        if (['cat-iphones', 'cat-android'].includes(catSlug)) {
          totalCelularesCents += itemTotal;
        } else if (['cat-acessorios'].includes(catSlug)) {
          totalAcessoriosCents += itemTotal;
        } else {
          totalOutrosCents += itemTotal;
        }
      } else {
        totalOutrosCents += itemTotal;
      }
    });
  });

  // Include finished maintenances revenue
  finishedMaintenances.forEach(m => {
    totalManutencaoCents += (m.estimatedCostCents || 0);
  });

  const grandTotalCents = totalCelularesCents + totalAcessoriosCents + totalManutencaoCents + totalOutrosCents;

  // Render Breakdown List
  if (listContainer) {
    const categoriesData = [
      { name: 'Celulares (iPhones & Android)', amountCents: totalCelularesCents, color: '#6D28D9' },
      { name: 'Acessórios & Periféricos', amountCents: totalAcessoriosCents, color: '#F97316' },
      { name: 'Manutenção & Assistência', amountCents: totalManutencaoCents, color: '#059669' }
    ];

    if (totalOutrosCents > 0) {
      categoriesData.push({ name: 'Outros (Smartwatches, Notebooks, etc.)', amountCents: totalOutrosCents, color: '#2563EB' });
    }

    listContainer.innerHTML = '';
    
    categoriesData.forEach(item => {
      const pct = grandTotalCents > 0 ? Math.round((item.amountCents / grandTotalCents) * 100) : 0;
      const div = document.createElement('div');
      div.className = 'cat-sales-item';
      div.innerHTML = `
        <div class="cat-sales-header">
          <span style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background-color: ${item.color};"></span>
            ${item.name}
          </span>
          <span style="color: var(--purple-primary); font-weight: 700;">${formatBRLFromCents(item.amountCents)} (${pct}%)</span>
        </div>
        <div class="cat-sales-bar-wrapper">
          <div class="cat-sales-bar-fill" style="width: ${pct}%; background-color: ${item.color};"></div>
        </div>
      `;
      listContainer.appendChild(div);
    });

    const totalDiv = document.createElement('div');
    totalDiv.style.marginTop = '12px';
    totalDiv.style.paddingTop = '12px';
    totalDiv.style.borderTop = '1px solid var(--border-color)';
    totalDiv.style.display = 'flex';
    totalDiv.style.justifyContent = 'space-between';
    totalDiv.style.fontWeight = '800';
    totalDiv.style.fontSize = '0.95rem';
    totalDiv.innerHTML = `
      <span>Total Faturado</span>
      <span style="color: var(--purple-primary);">${formatBRLFromCents(grandTotalCents)}</span>
    `;
    listContainer.appendChild(totalDiv);
  }

  // Render Chart.js Chart
  if (window.Chart) {
    if (categorySalesChartInstance) {
      categorySalesChartInstance.destroy();
    }

    const labels = ['Celulares', 'Acessórios', 'Manutenção'];
    const dataValues = [
      totalCelularesCents / 100,
      totalAcessoriosCents / 100,
      totalManutencaoCents / 100
    ];
    const bgColors = ['#6D28D9', '#F97316', '#059669'];

    if (totalOutrosCents > 0) {
      labels.push('Outros');
      dataValues.push(totalOutrosCents / 100);
      bgColors.push('#2563EB');
    }

    const ctx = canvas.getContext('2d');
    categorySalesChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: bgColors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'Inter', size: 12, weight: '600' },
              padding: 12
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const val = context.raw || 0;
                return ` ${context.label}: R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              }
            }
          }
        },
        cutout: '65%'
      }
    });
  }
}

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
      <img src="${imgObj.src}" alt="${imgObj.alt || 'Foto'}">
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
