/**
 * Store Imports - Administrative Dashboard Logic
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
  stockLogs: [],
  activityLogs: [],
  selectedProductToEdit: null,
  selectedCategoryToEdit: null,
  activeFormTab: 'form-general'
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const adminSidebar = document.getElementById('admin-sidebar');
const btnSidebarToggle = document.getElementById('btn-sidebar-toggle');
const btnAdminHamburger = document.getElementById('btn-admin-hamburger');
const workspaceTitle = document.getElementById('workspace-title');

// Tabs Views
const tabs = ['overview', 'products', 'categories', 'stock', 'reservations', 'sales', 'promo', 'users', 'settings'];

// Modals
const adminProductModalOverlay = document.getElementById('admin-product-modal-overlay');
const adminAddProductForm = document.getElementById('admin-add-product-form');
const adminProductModalTitle = document.getElementById('admin-product-modal-title');

// KPI elements
const kpiTotalProducts = document.getElementById('kpi-total-products');
const kpiPendingRes = document.getElementById('kpi-pending-res');
const kpiLowStock = document.getElementById('kpi-low-stock');
const kpiSalesValue = document.getElementById('kpi-sales-value');

// Search and filters
const adminSearchProducts = document.getElementById('admin-search-products');
const adminFilterProductsCategory = document.getElementById('admin-filter-products-category');
const adminSearchReservations = document.getElementById('admin-search-reservations');
const adminFilterReservationsStatus = document.getElementById('admin-filter-reservations-status');

// Forms inside tabs
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
  renderCurrentTab();
  initChartTooltips();
  
  lucide.createIcons();
});

// Load variables from shared store
function loadDatabase() {
  state.products = getStoreData('products');
  state.categories = getStoreData('categories');
  state.reservations = getStoreData('reservations');
  state.sales = getStoreData('sales');
  state.stockLogs = getStoreData('stock_logs');
  state.activityLogs = getStoreData('activity_logs');
  
  // Log workspace details
  addActivityLog('Sessão administrativa iniciada.', 'info');
}

function saveToLocalStorage(key, data) {
  saveStoreData(key, data);
}

// ==========================================
// SIDEBAR COLLAPSE & RESPONSIVE DRAWER
// ==========================================
function setupSidebar() {
  btnSidebarToggle.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-collapsed');
    
    // Toggle menu icon
    const icon = btnSidebarToggle.querySelector('i');
    if (document.body.classList.contains('sidebar-collapsed')) {
      icon.setAttribute('data-lucide', 'chevrons-right');
    } else {
      icon.setAttribute('data-lucide', 'menu');
    }
    lucide.createIcons();
  });
  
  btnAdminHamburger.addEventListener('click', () => {
    document.body.classList.toggle('mobile-sidebar-active');
  });

  // Close mobile sidebar on click overlay wrapper outside
  document.addEventListener('click', (e) => {
    if (document.body.classList.contains('mobile-sidebar-active')) {
      const isClickInsideSidebar = adminSidebar.contains(e.target);
      const isClickHamburger = btnAdminHamburger.contains(e.target);
      
      if (!isClickInsideSidebar && !isClickHamburger) {
        document.body.classList.remove('mobile-sidebar-active');
      }
    }
  });
}

// ==========================================
// EVENT LISTENERS & SWITCH TABS
// ==========================================
function setupEventListeners() {
  // Sidebar tab click handles
  document.querySelectorAll('.sidebar-menu .menu-item-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const tabName = link.getAttribute('data-tab');
      switchTab(tabName);
      document.body.classList.remove('mobile-sidebar-active');
    });
  });

  // KPI Quick Buttons
  const viewAllResBtn = document.getElementById('btn-view-all-res');
  if (viewAllResBtn) {
    viewAllResBtn.addEventListener('click', () => switchTab('reservations'));
  }

  // Search/Filters in Products List
  adminSearchProducts.addEventListener('input', renderProductsTable);
  adminFilterProductsCategory.addEventListener('change', renderProductsTable);

  // Search/Filters in Reservations List
  adminSearchReservations.addEventListener('input', renderReservationsTable);
  adminFilterReservationsStatus.addEventListener('change', renderReservationsTable);

  // Add Product Modal trigger
  document.getElementById('btn-admin-add-product').addEventListener('click', () => {
    openProductFormModal();
  });

  // Modal Cancel
  document.getElementById('btn-admin-modal-cancel').addEventListener('click', closeProductFormModal);
  document.getElementById('admin-product-modal-overlay').addEventListener('click', (e) => {
    if (e.target === adminProductModalOverlay) closeProductFormModal();
  });

  // Categories Listeners
  const btnAddCat = document.getElementById('btn-admin-add-category');
  if (btnAddCat) {
    btnAddCat.addEventListener('click', () => openCategoryFormModal());
  }
  const adminCatModalOverlay = document.getElementById('admin-category-modal-overlay');
  const btnCatCancel = document.getElementById('btn-admin-cat-cancel');
  if (btnCatCancel) {
    btnCatCancel.addEventListener('click', closeCategoryFormModal);
    adminCatModalOverlay.addEventListener('click', (e) => {
      if (e.target === adminCatModalOverlay) closeCategoryFormModal();
    });
  }
  
  const formCat = document.getElementById('admin-add-category-form');
  if (formCat) {
    formCat.addEventListener('submit', handleCategorySubmit);
  }
  
  const searchCat = document.getElementById('admin-search-categories');
  if (searchCat) {
    searchCat.addEventListener('input', renderCategoriesTable);
  }

  // Modal Form Switch Tab-Panes
  document.querySelectorAll('[data-form-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const formTab = btn.getAttribute('data-form-tab');
      switchFormTab(formTab);
    });
  });

  // Form Submit (Add / Edit Product)
  adminAddProductForm.addEventListener('submit', handleProductFormSubmit);

  // Stock Adjustment Form Submit
  adminStockAdjustForm.addEventListener('submit', handleStockAdjustment);
  
  // Conditionally show/hide IMEI input depending on selected product category in Stock Adjust Form
  const adjustProductSelect = document.getElementById('stock-adjust-product');
  adjustProductSelect.addEventListener('change', (e) => {
    const prodId = e.target.value;
    const prod = state.products.find(p => p.id === prodId);
    const imeiGroup = document.getElementById('stock-adjust-imeis-group');
    
    if (prod && ['iphones', 'android'].includes(prod.category)) {
      imeiGroup.classList.remove('d-none');
    } else {
      imeiGroup.classList.add('d-none');
    }
  });

  // Sales Registry Form Submit
  adminSalesRegistryForm.addEventListener('submit', handleSalesRegistry);
  
  // Promo calculator setup
  setupPromoCalculatorListeners();

  // Reset Demo Data
  const btnReset = document.getElementById('btn-reset-demo-data');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('ATENÇÃO: Isso removerá TODAS as alterações (produtos editados, vendas, reservas, logs) e restaurará os dados demonstrativos originais. Deseja continuar?')) {
        localStorage.removeItem('store_imports_demo_v2_initialized');
        localStorage.removeItem('store_imports_demo_v2_products');
        localStorage.removeItem('store_imports_demo_v2_reservations');
        localStorage.removeItem('store_imports_demo_v2_sales');
        localStorage.removeItem('store_imports_demo_v2_stock_logs');
        localStorage.removeItem('store_imports_demo_v2_activity_logs');
        alert('Banco de dados resetado com sucesso! O painel será recarregado.');
        window.location.reload();
      }
    });
  }
}

function switchTab(tabName) {
  state.currentTab = tabName;
  
  // Update sidebar active classes
  document.querySelectorAll('.sidebar-menu .menu-item-link').forEach(link => {
    if (link.getAttribute('data-tab') === tabName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  
  // Set navbar title
  const titles = {
    overview: 'Visão Geral',
    products: 'Gestão de Produtos',
    stock: 'Ajuste de Estoque e IMEI',
    reservations: 'Controle de Reservas',
    sales: 'Histórico de Vendas Físicas',
    promo: 'Calculadora de Promoções',
    users: 'Cargos e Permissões',
    settings: 'Configurações Demo'
  };
  workspaceTitle.textContent = titles[tabName] || 'Painel Operacional';

  // Toggle DOM tabs
  tabs.forEach(tab => {
    const pane = document.getElementById(`panel-${tab}`);
    if (tab === tabName) {
      pane.classList.remove('d-none');
    } else {
      pane.classList.add('d-none');
    }
  });

  renderCurrentTab();
}

function renderCurrentTab() {
  // Update Overview metrics always
  calculateOverviewKPIs();
  
  if (state.currentTab === 'overview') {
    renderDashboardOverview();
  } else if (state.currentTab === 'products') {
    renderProductsTable();
  } else if (state.currentTab === 'categories') {
    renderCategoriesTable();
  } else if (state.currentTab === 'stock') {
    populateProductSelects();
    renderStockLogsTable();
  } else if (state.currentTab === 'reservations') {
    renderReservationsTable();
  } else if (state.currentTab === 'sales') {
    populateProductSelects();
    renderSalesLogsTable();
  } else if (state.currentTab === 'promo') {
    // Reset preview tables
    const previewCard = document.getElementById('promo-preview-card');
    if (previewCard) previewCard.classList.add('d-none');
    
    // Refresh scope lists
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
  // 1. Total products (V3 format uses p.variants array for stock calculation)
  kpiTotalProducts.textContent = state.products.length;
  
  // 2. Pending Reservations (V3 status 'new')
  const pending = state.reservations.filter(r => r.status === 'new').length;
  kpiPendingRes.textContent = pending;

  // 3. Low stock warning (stock <= minQuantity)
  const lowStock = state.products.filter(p => {
    const totalStock = p.variants ? p.variants.reduce((acc, v) => acc + v.stockQuantity, 0) : 0;
    const minStock = (p.variants && p.variants[0]) ? p.variants[0].minimumStock : 1;
    return totalStock <= minStock;
  }).length;
  kpiLowStock.textContent = lowStock;
  
  // 4. Faturamento Simulado (Sum of estimatedTotalCents for contacted/finished)
  const totalSales = state.reservations
    .filter(r => ['contacted', 'finished'].includes(r.status))
    .reduce((sum, r) => sum + (r.estimatedTotalCents || 0), 0) / 100;
  
  const kpiFaturamento = document.getElementById('kpi-faturamento');
  if (kpiFaturamento) {
    kpiFaturamento.textContent = `R$ ${totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }
}

function renderDashboardOverview() {
  // Render Recent Reservations inside overview
  const tbody = document.getElementById('dashboard-recent-reservations-tbody');
  tbody.innerHTML = '';
  
  // Get 5 most recent
  const sorted = [...state.reservations].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);
  
  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-muted" style="text-align: center;">Nenhuma simulação recebida.</td></tr>';
  } else {
    sorted.forEach(res => {
      const tr = document.createElement('tr');
      
      const totalItems = res.items ? res.items.reduce((sum, i) => sum + i.quantity, 0) : 0;
      const prodNamePreview = res.items ? res.items.map(i => `${i.name || i.productId} (${i.quantity}x)`).join(', ') : '';
      
      let statusClass = 'status-pending';
      let statusLabel = 'Nova Simulação';
      if (res.status === 'contacted') {
        statusClass = 'status-confirmed';
        statusLabel = 'Contato Simulado';
      }
      if (res.status === 'finished') {
        statusClass = 'status-finished';
        statusLabel = 'Finalizada';
      }
      if (res.status === 'Cancelada') statusClass = 'status-cancelled';

      tr.innerHTML = `
        <td><strong>${res.code}</strong></td>
        <td>${res.demoCustomerName || res.nome || 'N/A'}</td>
        <td>${res.demoContactLabel || res.whatsapp || ''}</td>
        <td style="max-width: 200px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${prodNamePreview}</td>
        <td class="text-orange" style="font-weight: 700;">R$ ${(res.estimatedTotalCents ? res.estimatedTotalCents / 100 : res.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td><span class="status-pill ${statusClass}">${statusLabel}</span></td>
        <td class="text-muted">${res.createdAt ? new Date(res.createdAt).toLocaleDateString('pt-BR') : ''}</td>
      `;
      
      tbody.appendChild(tr);
    });
  }

  // Render recent activity logs inside overview
  const logList = document.getElementById('activity-log-list');
  logList.innerHTML = '';
  
  // Show 6 most recent
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
          <span class="activity-text">${log.text}</span>
          <span class="activity-time">${log.time}</span>
        </div>
      `;
      
      logList.appendChild(div);
    });
  }

  lucide.createIcons();
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
// VIEW RENDERING: CATEGORIES MANAGEMENT (CRUD)
// ==========================================
function renderCategoriesTable() {
  const tbody = document.getElementById('admin-categories-table-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const query = (document.getElementById('admin-search-categories')?.value || '').trim().toLowerCase();
  
  let filtered = state.categories.filter(c => {
    if (query) {
      return c.name.toLowerCase().includes(query) || c.id.toLowerCase().includes(query);
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-muted" style="text-align: center;">Nenhuma categoria encontrada.</td></tr>';
  } else {
    filtered.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><div class="category-icon-preview" style="width: 40px; height: 40px; background: var(--bg-secondary); border-radius: 8px; display: flex; align-items: center; justify-content: center;"><img src="./assets/${c.image}" alt="${c.name}" style="max-width: 24px; max-height: 24px;"></div></td>
        <td><strong>${c.name}</strong> ${!c.visible ? '<span class="badge-capsule" style="background: var(--danger); font-size: 0.65rem;">Oculta</span>' : ''}</td>
        <td><span class="badge-capsule badge-purple-light" style="font-size: 0.75rem;">${c.id}</span></td>
        <td>
          <button class="table-action-btn edit-btn-cat" data-id="${c.id}" title="Editar"><i data-lucide="edit"></i></button>
          <button class="table-action-btn delete-btn-cat" data-id="${c.id}" title="Excluir"><i data-lucide="trash-2"></i></button>
        </td>
      `;

      tr.querySelector('.edit-btn-cat').addEventListener('click', () => {
        openCategoryFormModal(c.id);
      });
      tr.querySelector('.delete-btn-cat').addEventListener('click', () => {
        deleteCategory(c.id);
      });

      tbody.appendChild(tr);
    });
  }
  lucide.createIcons();
}

function openCategoryFormModal(catId = null) {
  const form = document.getElementById('admin-add-category-form');
  form.reset();
  state.selectedCategoryToEdit = catId;
  
  document.getElementById('admin-category-modal-title').textContent = catId ? 'Editar Categoria' : 'Cadastrar Categoria';
  
  if (catId) {
    const cat = state.categories.find(c => c.id === catId);
    if (cat) {
      document.getElementById('c-name').value = cat.name;
      document.getElementById('c-slug').value = cat.id;
      document.getElementById('c-slug').disabled = true; // Cannot edit ID after creation easily
      document.getElementById('c-image').value = cat.image;
      document.getElementById('c-visible').value = cat.visible !== false ? 'true' : 'false';
    }
  } else {
    document.getElementById('c-slug').disabled = false;
  }
  
  document.getElementById('admin-category-modal-overlay').classList.remove('d-none');
}

function closeCategoryFormModal() {
  document.getElementById('admin-category-modal-overlay').classList.add('d-none');
  state.selectedCategoryToEdit = null;
}

function handleCategorySubmit(e) {
  e.preventDefault();
  
  const idVal = document.getElementById('c-slug').value.trim();
  const nameVal = document.getElementById('c-name').value.trim();
  const imgVal = document.getElementById('c-image').value.trim();
  const visVal = document.getElementById('c-visible').value === 'true';
  
  if (!idVal || !nameVal || !imgVal) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }
  
  if (state.selectedCategoryToEdit) {
    const cat = state.categories.find(c => c.id === state.selectedCategoryToEdit);
    if (cat) {
      cat.name = nameVal;
      cat.image = imgVal;
      cat.visible = visVal;
      addActivityLog(`Categoria "${nameVal}" editada.`, 'success');
    }
  } else {
    // Check if ID exists
    if (state.categories.some(c => c.id === idVal)) {
      alert("Já existe uma categoria com este Identificador (Slug).");
      return;
    }
    state.categories.push({
      id: idVal,
      name: nameVal,
      image: imgVal,
      visible: visVal,
      displayOrder: state.categories.length + 1
    });
    addActivityLog(`Categoria "${nameVal}" criada.`, 'success');
  }
  
  saveToLocalStorage('categories', state.categories);
  renderCategoriesTable();
  
  // Re-populate category selects in Products if needed
  populateCategorySelects();
  
  closeCategoryFormModal();
}

function deleteCategory(catId) {
  if (confirm("Tem certeza que deseja excluir esta categoria? Produtos associados a ela poderão não ser exibidos corretamente.")) {
    state.categories = state.categories.filter(c => c.id !== catId);
    saveToLocalStorage('categories', state.categories);
    addActivityLog(`Categoria "${catId}" removida.`, 'warning');
    renderCategoriesTable();
    populateCategorySelects();
  }
}

// Add a helper to populate the category select inside the products modal
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
// VIEW RENDERING: PRODUCTS MANAGEMENT (CRUD)
// ==========================================
function renderProductsTable() {
  const tbody = document.getElementById('admin-products-table-tbody');
  tbody.innerHTML = '';
  
  const query = adminSearchProducts.value.trim().toLowerCase();
  const category = adminFilterProductsCategory.value;
  
  let filtered = state.products.filter(p => {
    if (category && p.category !== category) return false;
    
    if (query) {
      const matchName = p.name.toLowerCase().includes(query);
      const matchBrand = p.brand.toLowerCase().includes(query);
      const matchCode = p.internalCode ? p.internalCode.toLowerCase().includes(query) : false;
      if (!matchName && !matchBrand && !matchCode) return false;
    }
    
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-muted" style="text-align: center;">Nenhum produto cadastrado correspondente aos filtros.</td></tr>';
  } else {
    filtered.forEach(p => {
      const tr = document.createElement('tr');
      
      let stockColorStyle = '';
      if (p.quantity <= p.minQuantity) {
        stockColorStyle = 'color: var(--alert); font-weight: 700;';
      }
      if (p.quantity === 0) {
        stockColorStyle = 'color: var(--danger); font-weight: 700;';
      }

      tr.innerHTML = `
        <td><span class="badge-capsule badge-purple-light" style="font-size: 0.75rem;">${p.internalCode || 'N/A'}</span></td>
        <td><strong>${p.brand}</strong></td>
        <td>${p.name} <span class="text-muted" style="font-size: 0.7rem;">(${p.condition})</span></td>
        <td>${p.category}</td>
        <td>R$ ${p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td class="text-orange" style="font-weight: 700;">${p.promoPrice ? `R$ ${p.promoPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}</td>
        <td style="${stockColorStyle}">${p.quantity} un <span style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 400;">(Min: ${p.minQuantity})</span></td>
        <td>
          <button class="table-action-btn edit-btn" data-id="${p.id}" title="Editar Produto"><i data-lucide="edit"></i></button>
          <button class="table-action-btn delete-btn delete" data-id="${p.id}" title="Excluir Produto"><i data-lucide="trash-2"></i></button>
        </td>
      `;

      // Hook click handlers
      tr.querySelector('.edit-btn').addEventListener('click', () => {
        openProductFormModal(p.id);
      });
      tr.querySelector('.delete-btn').addEventListener('click', () => {
        deleteProduct(p.id);
      });

      tbody.appendChild(tr);
    });
  }
  
  lucide.createIcons();
}

let currentFormStep = 1;
let tempVariants = [];

function switchFormStep(step) {
  currentFormStep = step;
  
  // Update Tabs style
  document.querySelectorAll('[data-form-step]').forEach(btn => {
    const s = parseInt(btn.getAttribute('data-form-step'));
    if (s === step) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  // Toggle form panes
  document.querySelectorAll('.form-step-pane').forEach(pane => pane.classList.add('d-none'));
  document.getElementById(`form-step-${step}`).classList.remove('d-none');
  
  // Toggle buttons
  const btnPrev = document.getElementById('btn-admin-modal-prev');
  const btnNext = document.getElementById('btn-admin-modal-next');
  const btnSubmit = document.getElementById('btn-admin-modal-submit');
  
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

function openProductFormModal(prodId = null) {
  adminAddProductForm.reset();
  populateCategorySelects();
  
  tempVariants = [];
  document.getElementById('variants-container').innerHTML = '';
  document.getElementById('variants-pricing-container').innerHTML = '';
  
  if (prodId) {
    // EDIT MODE
    state.selectedProductToEdit = prodId;
    document.getElementById('admin-product-modal-title').textContent = 'Editar Produto';
    
    const p = state.products.find(item => item.id === prodId);
    if (p) {
      document.getElementById('p-name').value = p.name;
      document.getElementById('p-brand').value = p.brand;
      document.getElementById('p-model').value = p.model;
      document.getElementById('p-category').value = p.category;
      document.getElementById('p-condition').value = p.condition;
      document.getElementById('p-description').value = p.description || '';
      document.getElementById('p-sku').value = p.internalCode || '';
      
      document.getElementById('p-svg-color').value = p.mockupStyle?.color || '#6B7280';
      document.getElementById('p-svg-icon').value = p.mockupStyle?.icon || 'smartphone';
      
      // Load variants
      if (p.variants) {
        tempVariants = JSON.parse(JSON.stringify(p.variants)); // clone
      }
    }
  } else {
    // ADD MODE
    state.selectedProductToEdit = null;
    document.getElementById('admin-product-modal-title').textContent = 'Cadastrar Novo Produto (V3)';
  }
  
  renderVariantsBuilder();
  renderPricingBuilder();
  switchFormStep(1);
  adminProductModalOverlay.classList.remove('d-none');
}

function closeProductFormModal() {
  adminProductModalOverlay.classList.add('d-none');
  state.selectedProductToEdit = null;
}

// ----------------- VARIANTS LOGIC -----------------
document.getElementById('btn-add-variant')?.addEventListener('click', () => {
  tempVariants.push({
    id: 'var-' + Date.now(),
    colorName: '',
    capacityName: '',
    priceCents: 0,
    promoPriceCents: null,
    costCents: null,
    stockQuantity: 0,
    minimumStock: 1,
    imeis: []
  });
  renderVariantsBuilder();
});

function renderVariantsBuilder() {
  const c = document.getElementById('variants-container');
  if (!c) return;
  c.innerHTML = '';
  if (tempVariants.length === 0) {
    c.innerHTML = '<div class="text-muted" style="font-size:0.8rem;">Nenhuma variação adicionada.</div>';
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
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>Variação #${index+1}</strong>
        <button type="button" class="btn btn-secondary btn-sm" onclick="removeVariant(${index})" style="padding:4px; color:var(--danger);"><i data-lucide="trash-2"></i></button>
      </div>
      <div class="grid-2-col">
        <div>
          <label class="form-label" style="font-size:0.75rem;">Cor</label>
          <input type="text" class="form-control var-color" value="${v.colorName || ''}" placeholder="Ex: Preto" data-idx="${index}">
        </div>
        <div>
          <label class="form-label" style="font-size:0.75rem;">Capacidade</label>
          <input type="text" class="form-control var-cap" value="${v.capacityName || ''}" placeholder="Ex: 256GB" data-idx="${index}">
        </div>
      </div>
      <div class="grid-2-col">
        <div>
          <label class="form-label" style="font-size:0.75rem;">Estoque Inicial (un)</label>
          <input type="number" class="form-control var-stock" value="${v.stockQuantity}" placeholder="Ex: 5" data-idx="${index}">
        </div>
        <div>
          <label class="form-label" style="font-size:0.75rem;">Min. Estoque</label>
          <input type="number" class="form-control var-min-stock" value="${v.minimumStock}" data-idx="${index}">
        </div>
      </div>
      <div>
        <label class="form-label" style="font-size:0.75rem;">IMEIs / Serials (Separados por vírgula)</label>
        <textarea class="form-control var-imeis" rows="1" placeholder="Ex: 3599..., 3588..." data-idx="${index}">${(v.imeis || []).join(', ')}</textarea>
      </div>
    `;
    c.appendChild(div);
  });
  
  // Attach events
  c.querySelectorAll('.var-color').forEach(el => el.addEventListener('input', e => tempVariants[e.target.dataset.idx].colorName = e.target.value));
  c.querySelectorAll('.var-cap').forEach(el => el.addEventListener('input', e => tempVariants[e.target.dataset.idx].capacityName = e.target.value));
  c.querySelectorAll('.var-stock').forEach(el => el.addEventListener('input', e => tempVariants[e.target.dataset.idx].stockQuantity = parseInt(e.target.value) || 0));
  c.querySelectorAll('.var-min-stock').forEach(el => el.addEventListener('input', e => tempVariants[e.target.dataset.idx].minimumStock = parseInt(e.target.value) || 1));
  c.querySelectorAll('.var-imeis').forEach(el => el.addEventListener('input', e => {
    tempVariants[e.target.dataset.idx].imeis = e.target.value.split(',').map(i=>i.trim()).filter(Boolean);
  }));
  lucide.createIcons();
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
    c.innerHTML = '<div class="text-muted" style="font-size:0.8rem;">Adicione variações no passo 3.</div>';
    return;
  }
  tempVariants.forEach((v, index) => {
    const div = document.createElement('div');
    div.style.padding = '12px';
    div.style.border = '1px solid var(--border-color)';
    div.style.borderRadius = 'var(--radius-md)';
    const label = `${v.colorName} ${v.capacityName}`.trim() || `Variação #${index+1}`;
    
    div.innerHTML = `
      <strong style="display:block; margin-bottom: 8px;">${label}</strong>
      <div class="grid-2-col">
        <div>
          <label class="form-label" style="font-size:0.75rem;">Preço Base (R$)</label>
          <input type="number" step="0.01" class="form-control var-price" value="${v.priceCents ? v.priceCents / 100 : ''}" placeholder="Ex: 5000.00" data-idx="${index}">
        </div>
        <div>
          <label class="form-label" style="font-size:0.75rem;">Preço Promo (R$)</label>
          <input type="number" step="0.01" class="form-control var-promo" value="${v.promoPriceCents ? v.promoPriceCents / 100 : ''}" placeholder="Ex: 4800.00" data-idx="${index}">
        </div>
      </div>
      <div class="grid-2-col" style="margin-top:8px;">
        <div>
          <label class="form-label" style="font-size:0.75rem;">Custo Interno (R$)</label>
          <input type="number" step="0.01" class="form-control var-cost" value="${v.costCents ? v.costCents / 100 : ''}" placeholder="Ex: 4000.00" data-idx="${index}">
        </div>
      </div>
    `;
    c.appendChild(div);
  });
  
  c.querySelectorAll('.var-price').forEach(el => el.addEventListener('input', e => tempVariants[e.target.dataset.idx].priceCents = Math.round(parseFloat(e.target.value) * 100) || 0));
  c.querySelectorAll('.var-promo').forEach(el => el.addEventListener('input', e => tempVariants[e.target.dataset.idx].promoPriceCents = e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null));
  c.querySelectorAll('.var-cost').forEach(el => el.addEventListener('input', e => tempVariants[e.target.dataset.idx].costCents = e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null));
}

function buildReviewStep() {
  document.getElementById('review-product-name').textContent = document.getElementById('p-name').value || 'N/A';
  document.getElementById('review-variants-count').textContent = `${tempVariants.length} Variações Mapeadas`;
  const totalStock = tempVariants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
  document.getElementById('review-total-stock').textContent = `Estoque Total: ${totalStock} un`;
}

// Nav Buttons
document.getElementById('btn-admin-modal-next')?.addEventListener('click', () => {
  if (currentFormStep === 3) renderPricingBuilder(); // refresh pricing before entering step 4
  if (currentFormStep < 5) switchFormStep(currentFormStep + 1);
});
document.getElementById('btn-admin-modal-prev')?.addEventListener('click', () => {
  if (currentFormStep > 1) switchFormStep(currentFormStep - 1);
});
document.querySelectorAll('[data-form-step]').forEach(btn => {
  btn.addEventListener('click', (e) => {
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
  const description = document.getElementById('p-description').value.trim();
  const internalCode = document.getElementById('p-sku').value.trim();
  
  const mockupColor = document.getElementById('p-svg-color').value.trim();
  const mockupIcon = document.getElementById('p-svg-icon').value;
  
  if (!name || !brand || !model) {
    alert('Preencha os campos obrigatórios na Etapa 1.');
    return;
  }
  if (tempVariants.length === 0) {
    alert('Adicione pelo menos uma variação na Etapa 3.');
    return;
  }
  
  // Backwards compatibility for price, quantity (use variant 0 as fallback)
  const basePrice = (tempVariants[0].priceCents || 0) / 100;
  const totalStock = tempVariants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
  
  if (state.selectedProductToEdit) {
    // EDIT SAVE
    const idx = state.products.findIndex(p => p.id === state.selectedProductToEdit);
    if (idx > -1) {
      state.products[idx] = {
        ...state.products[idx],
        name, brand, model, category, condition, description, internalCode,
        price: basePrice, // legacy UI compatibility
        quantity: totalStock, // legacy UI compatibility
        minQuantity: tempVariants[0].minimumStock,
        variants: JSON.parse(JSON.stringify(tempVariants)),
        mockupStyle: { color: mockupColor, icon: mockupIcon }
      };
      addActivityLog(`Produto editado: ${name}`, 'success');
    }
  } else {
    // NEW CREATE
    const newProd = {
      id: `prod-${Date.now()}`,
      internalCode: internalCode || `REF-${Math.floor(100 + Math.random() * 900)}`,
      name, brand, model, category, condition, description,
      price: basePrice,
      quantity: totalStock,
      minQuantity: tempVariants[0].minimumStock,
      variants: JSON.parse(JSON.stringify(tempVariants)),
      mockupStyle: { color: mockupColor, icon: mockupIcon },
      isFeatured: false
    };
    state.products.push(newProd);
    addActivityLog(`Novo produto cadastrado: ${name}`, 'success');
  }

  saveToLocalStorage('products', state.products);
  renderCurrentTab();
  closeProductFormModal();
}

function deleteProduct(prodId) {
  const p = state.products.find(item => item.id === prodId);
  if (!p) return;
  
  if (confirm(`Tem certeza que deseja excluir o produto "${p.name}"? Isso removerá o item do catálogo.`)) {
    // Log stock removal
    registerStockLog(p.name, p.quantity, 'Saída', 'Exclusão do produto do sistema');
    
    state.products = state.products.filter(item => item.id !== prodId);
    saveToLocalStorage('products', state.products);
    
    addActivityLog(`Produto excluído: ${p.name}`, 'warning');
    showAdminToast('Produto excluído com sucesso.', 'warning');
    renderCurrentTab();
  }
}

// ==========================================
// VIEW RENDERING: STOCK INVENTORY CONTROL
// ==========================================
function populateProductSelects() {
  const adjustSelect = document.getElementById('stock-adjust-product');
  const saleSelect = document.getElementById('sale-select-product');
  
  const optionsHtml = state.products.map(p => `
    <option value="${p.id}">${p.name} (${p.brand}) [Disponível: ${p.quantity} un]</option>
  `).join('');
  
  adjustSelect.innerHTML = optionsHtml;
  saleSelect.innerHTML = optionsHtml;
}

function handleStockAdjustment(e) {
  e.preventDefault();
  
  const prodId = document.getElementById('stock-adjust-product').value;
  const type = document.getElementById('stock-adjust-type').value;
  const amount = parseInt(document.getElementById('stock-adjust-amount').value);
  const reason = document.getElementById('stock-adjust-reason').value.trim();
  const rawImeis = document.getElementById('stock-adjust-imeis').value;

  const prodIdx = state.products.findIndex(p => p.id === prodId);
  if (prodIdx === -1 || isNaN(amount) || amount <= 0 || !reason) {
    showAdminToast('Preencha todos os campos do ajuste.', 'danger');
    return;
  }
  
  const p = state.products[prodIdx];
  const oldQty = p.quantity;
  let newQty = oldQty;

  if (type === 'Entrada') {
    newQty = oldQty + amount;
  } else if (type === 'Saída') {
    if (amount > oldQty) {
      showAdminToast('Quantidade de saída excede estoque disponível.', 'danger');
      return;
    }
    newQty = oldQty - amount;
  } else if (type === 'Ajuste') {
    newQty = amount;
  }

  // Handle IMEIs if phone
  if (['iphones', 'android'].includes(p.category) && rawImeis) {
    const imeisArr = rawImeis.split(',').map(i => i.trim()).filter(Boolean);
    if (type === 'Entrada') {
      p.imeis = [...(p.imeis || []), ...imeisArr];
    } else if (type === 'Ajuste') {
      p.imeis = imeisArr;
    }
  }

  p.quantity = newQty;
  saveToLocalStorage('products', state.products);

  // Register logs
  const diff = Math.abs(newQty - oldQty);
  registerStockLog(p.name, diff, type, reason);
  addActivityLog(`Ajuste de estoque (${type}): ${p.name} [De: ${oldQty} Para: ${newQty}]`, 'info');

  adminStockAdjustForm.reset();
  showAdminToast('Estoque atualizado com sucesso!', 'success');
  renderCurrentTab();
}

function registerStockLog(productName, amount, type, reason) {
  const newLog = {
    id: `log-${Date.now()}`,
    productName: productName,
    amount: amount,
    type: type,
    reason: reason,
    operator: 'Administrador',
    timestamp: new Date().toLocaleString('pt-BR').slice(0, 16)
  };
  
  state.stockLogs.push(newLog);
  saveToLocalStorage('stock_logs', state.stockLogs);
}

function renderStockLogsTable() {
  const tbody = document.getElementById('admin-stock-logs-tbody');
  tbody.innerHTML = '';
  
  const sorted = [...state.stockLogs].reverse();
  
  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-muted" style="text-align: center;">Sem movimentações no histórico.</td></tr>';
  } else {
    sorted.forEach(log => {
      const tr = document.createElement('tr');
      
      let typeStyle = 'color: var(--success); font-weight: 700;';
      if (log.type === 'Saída') typeStyle = 'color: var(--danger); font-weight: 700;';
      if (log.type === 'Ajuste') typeStyle = 'color: var(--purple-primary); font-weight: 700;';

      tr.innerHTML = `
        <td class="text-muted">${log.timestamp}</td>
        <td><strong>${log.productName}</strong></td>
        <td>${log.amount} un</td>
        <td style="${typeStyle}">${log.type}</td>
        <td>${log.reason}</td>
        <td><span class="badge-capsule badge-purple-light" style="font-size: 0.7rem; padding: 2px 8px;">${log.operator}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }
}

// ==========================================
// VIEW RENDERING: RESERVATIONS CONTROLLER
// ==========================================
function renderReservationsTable() {
  const tbody = document.getElementById('admin-reservations-table-tbody');
  tbody.innerHTML = '';
  
  const query = adminSearchReservations.value.trim().toLowerCase();
  const status = adminFilterReservationsStatus.value;
  
  let filtered = state.reservations.filter(res => {
    if (status && res.status !== status) return false;
    
    if (query) {
      const matchName = res.nome.toLowerCase().includes(query);
      const matchCode = res.code.toLowerCase().includes(query);
      const matchPhone = res.whatsapp.replace(/\D/g, "").includes(query.replace(/\D/g, ""));
      if (!matchName && !matchCode && !matchPhone) return false;
    }
    
    return true;
  });

  // Sort descending (most recent first)
  filtered.sort((a, b) => b.id.localeCompare(a.id));

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-muted" style="text-align: center;">Nenhuma reserva correspondente aos filtros.</td></tr>';
  } else {
    filtered.forEach(res => {
      const tr = document.createElement('tr');
      
      let statusClass = 'status-pending';
      if (res.status === 'Confirmada') statusClass = 'status-confirmed';
      if (res.status === 'Aguardando retirada') statusClass = 'status-waiting';
      if (res.status === 'Finalizada') statusClass = 'status-finished';
      if (res.status === 'Cancelada') statusClass = 'status-cancelled';
      
      const itemsPreview = res.items.map(i => `${i.name} (${i.quantity}x)`).join('<br>');

      tr.innerHTML = `
        <td><strong>${res.code}</strong></td>
        <td>${res.nome}</td>
        <td>
          <a href="https://wa.me/${res.whatsapp.replace(/\D/g, "")}" target="_blank" class="text-purple" style="font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
            ${res.whatsapp} <i data-lucide="message-circle" style="width: 14px; height: 14px;"></i>
          </a>
        </td>
        <td>${res.dataRetirada}</td>
        <td class="text-orange" style="font-weight: 700;">R$ ${res.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td><span class="status-pill ${statusClass}">${res.status}</span></td>
        <td class="text-muted">${res.createdAt}</td>
        <td>
          <!-- Change Status triggers -->
          <div style="display: flex; gap: 4px;">
            ${res.status === 'Aguardando confirmação' ? `
              <button class="btn btn-primary btn-sm btn-status-change" data-id="${res.id}" data-to="Confirmada" title="Confirmar Reserva" style="padding: 6px 10px; font-size: 0.75rem;">Confirmar</button>
            ` : ''}
            ${res.status === 'Confirmada' ? `
              <button class="btn btn-secondary btn-sm btn-status-change" data-id="${res.id}" data-to="Aguardando retirada" title="Marcar p/ Retirada" style="padding: 6px 10px; font-size: 0.75rem; border-color: var(--purple-primary); color: var(--purple-primary);">Retirar</button>
            ` : ''}
            ${res.status === 'Aguardando retirada' ? `
              <button class="btn btn-primary btn-sm btn-status-change" data-id="${res.id}" data-to="Finalizada" title="Finalizar Venda" style="background-color: var(--success); padding: 6px 10px; font-size: 0.75rem;">Faturar</button>
            ` : ''}
            ${['Aguardando confirmação', 'Confirmada', 'Aguardando retirada'].includes(res.status) ? `
              <button class="btn btn-secondary btn-sm btn-status-change" data-id="${res.id}" data-to="Cancelada" title="Cancelar Reserva" style="padding: 6px 10px; font-size: 0.75rem; border-color: var(--danger); color: var(--danger);">Cancelar</button>
            ` : ''}
          </div>
        </td>
      `;

      // Status change click triggers
      tr.querySelectorAll('.btn-status-change').forEach(btn => {
        btn.addEventListener('click', () => {
          const toStatus = btn.getAttribute('data-to');
          changeReservationStatus(res.id, toStatus);
        });
      });

      tbody.appendChild(tr);
    });
  }

  lucide.createIcons();
}

function changeReservationStatus(resId, nextStatus) {
  const idx = state.reservations.findIndex(r => r.id === resId);
  if (idx === -1) return;
  
  const res = state.reservations[idx];
  const oldStatus = res.status;
  res.status = nextStatus;

  // If finalized/fatured, register a physical sale and deduct stock automatically!
  if (nextStatus === 'Finalizada') {
    res.items.forEach(item => {
      // Find matching products
      const pIdx = state.products.findIndex(p => p.id === item.productId);
      if (pIdx > -1) {
        const prod = state.products[pIdx];
        const oldQty = prod.quantity;
        const newQty = Math.max(0, oldQty - item.quantity);
        prod.quantity = newQty;
        
        // Log stock output
        registerStockLog(prod.name, item.quantity, 'Saída', `Faturamento de reserva ${res.code}`);
      }
    });
    
    // Register physical sale
    const saleCode = `VD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSale = {
      id: `sale-${Date.now()}`,
      code: saleCode,
      productName: res.items.map(i => `${i.name} (${i.quantity}x)`).join(', '),
      productId: res.items[0].productId,
      quantity: res.items.reduce((s, i) => s + i.quantity, 0),
      client: res.nome,
      paymentMethod: 'Pix', // Default mockup
      discount: 0,
      total: res.total,
      date: new Date().toLocaleString('pt-BR'),
      seller: 'Administrador'
    };
    state.sales.push(newSale);
    
    saveToLocalStorage('products', state.products);
    saveToLocalStorage('sales', state.sales);
  }

  saveToLocalStorage('reservations', state.reservations);
  
  // Log activity
  addActivityLog(`Status da reserva ${res.code} alterado [De: ${oldStatus} Para: ${nextStatus}]`, 'success');
  showAdminToast(`Reserva ${res.code} atualizada para "${nextStatus}".`, 'success');
  
  renderCurrentTab();
}

// ==========================================
// VIEW RENDERING: REGISTRY PRESENCIAL SALES
// ==========================================
function handleSalesRegistry(e) {
  e.preventDefault();
  
  const prodId = document.getElementById('sale-select-product').value;
  const qty = parseInt(document.getElementById('sale-qty').value);
  const paymentMethod = document.getElementById('sale-payment-method').value;
  const seller = document.getElementById('sale-seller').value;
  const discount = parseFloat(document.getElementById('sale-discount').value) || 0;
  const clientName = document.getElementById('sale-client').value.trim() || 'Consumidor Presencial';

  const prodIdx = state.products.findIndex(p => p.id === prodId);
  if (prodIdx === -1 || isNaN(qty) || qty <= 0) {
    showAdminToast('Selecione um produto e quantidade válida.', 'danger');
    return;
  }

  const p = state.products[prodIdx];
  
  // Check stock limit
  if (qty > p.quantity) {
    showAdminToast(`Quantidade excede estoque disponível (${p.quantity} un).`, 'danger');
    return;
  }

  // Update stock
  p.quantity = p.quantity - qty;
  saveToLocalStorage('products', state.products);

  // Compute sale total
  const itemPrice = p.promoPrice !== null ? p.promoPrice : p.price;
  const total = (itemPrice * qty) - discount;

  const saleCode = `VD-${Math.floor(1000 + Math.random() * 9000)}`;
  const newSale = {
    id: `sale-${Date.now()}`,
    code: saleCode,
    productName: p.name,
    productId: p.id,
    quantity: qty,
    client: clientName,
    paymentMethod: paymentMethod,
    discount: discount,
    total: total,
    date: new Date().toLocaleString('pt-BR'),
    seller: seller
  };

  state.sales.push(newSale);
  saveToLocalStorage('sales', state.sales);

  // Logs
  registerStockLog(p.name, qty, 'Saída', `Venda direta registrada no balcão (${saleCode})`);
  addActivityLog(`Venda registrada no balcão: ${saleCode} [Total R$ ${total.toFixed(2)}]`, 'success');

  adminSalesRegistryForm.reset();
  document.getElementById('sale-discount').value = 0;
  document.getElementById('sale-qty').value = 1;
  showAdminToast('Venda registrada com sucesso!', 'success');
  renderCurrentTab();
}

function renderSalesLogsTable() {
  const tbody = document.getElementById('admin-sales-log-tbody');
  tbody.innerHTML = '';
  
  const sorted = [...state.sales].reverse();
  
  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-muted" style="text-align: center;">Sem vendas registradas no balcão.</td></tr>';
  } else {
    sorted.forEach(sale => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${sale.code}</strong></td>
        <td>${sale.productName}</td>
        <td>${sale.quantity}x</td>
        <td>${sale.client}</td>
        <td>${sale.paymentMethod}</td>
        <td class="text-orange" style="font-weight: 700;">R$ ${sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td class="text-muted">${sale.date}</td>
        <td><span class="badge-capsule badge-purple-light" style="font-size: 0.7rem; padding: 2px 8px;">${sale.seller}</span></td>
        <td>
          <button class="table-action-btn print-btn" data-id="${sale.id}" title="Imprimir Cupom PDF"><i data-lucide="printer"></i></button>
        </td>
      `;
      
      tr.querySelector('.print-btn').addEventListener('click', () => {
        printSaleCoupon(sale.id);
      });
      
      tbody.appendChild(tr);
    });
  }
}

// ==========================================
// UTILITIES AND HELPERS
// ==========================================
function addActivityLog(text, type = 'info') {
  const newLog = {
    text: text,
    type: type,
    time: new Date().toLocaleString('pt-BR').slice(0, 16)
  };
  
  state.activityLogs.push(newLog);
  // Keep only last 30 logs
  if (state.activityLogs.length > 30) {
    state.activityLogs.shift();
  }
  
  saveToLocalStorage('activity_logs', state.activityLogs);
}

// Toast specific for Admin Views
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
  toast.innerHTML = `${icons[type] || icons.info} <span>${message}</span>`;
  
  document.body.appendChild(toast);
  lucide.createIcons();
  
  // Animate in
  toast.style.transform = 'translateY(100px)';
  setTimeout(() => {
    toast.style.transform = 'translateY(0)';
  }, 10);
  
  // Animate out & remove
  setTimeout(() => {
    toast.style.transform = 'translateY(150px)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

// ==========================================
// ACTIVE OPERATOR PROFILE CONTROLLER
// ==========================================
function setupActiveProfile() {
  const trigger = document.getElementById('profile-dropdown-trigger');
  const menu = document.getElementById('profile-dropdown-menu');
  
  if (!trigger || !menu) return;
  
  // Toggle profile dropdown
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('d-none');
  });
  
  document.addEventListener('click', () => {
    menu.classList.add('d-none');
  });
  
  // Select active profile
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
      addActivityLog(`Perfil de operador alterado para: ${profile}`, 'info');
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
// PHYSICAL SALES RECEIPT PRINTING (PDF)
// ==========================================
function printSaleCoupon(saleId) {
  const sale = state.sales.find(s => s.id === saleId);
  if (!sale) {
    showAdminToast('Venda não encontrada.', 'danger');
    return;
  }
  
  const printWindow = window.open('', '_blank', 'width=350,height=600');
  if (!printWindow) {
    showAdminToast('Bloqueador de popups ativo. Permita popups para imprimir o cupom.', 'warning');
    return;
  }
  
  const receiptStyles = `
    <style>
      body {
        font-family: 'Courier New', Courier, monospace;
        font-size: 12px;
        color: #000;
        margin: 0;
        padding: 10px;
        width: 280px;
      }
      .center {
        text-align: center;
      }
      .bold {
        font-weight: bold;
      }
      .divider {
        border-top: 1px dashed #000;
        margin: 8px 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        text-align: left;
        border-bottom: 1px dashed #000;
      }
      td {
        padding: 4px 0;
      }
      .right {
        text-align: right;
      }
      .footer {
        font-size: 10px;
        margin-top: 20px;
      }
    </style>
  `;
  
  const items = sale.productName.split(',').map(itemStr => {
    return `
      <tr>
        <td>${itemStr.trim()}</td>
        <td class="right">${sale.quantity}x</td>
        <td class="right">R$ ${sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
      </tr>
    `;
  }).join('');
  
  const receiptHtml = `
    <html>
      <head>
        <title>Cupom de Venda - ${sale.code}</title>
        ${receiptStyles}
      </head>
      <body>
        <div class="center bold" style="font-size: 16px;">STORE IMPORTS</div>
        <div class="center">Av. Central de Compras, 1200 - Centro</div>
        <div class="center">Telefone: (11) 99999-9999</div>
        <div class="divider"></div>
        <div><strong>CUPOM DE VENDA:</strong> ${sale.code}</div>
        <div><strong>DATA:</strong> ${sale.date}</div>
        <div><strong>VENDEDOR:</strong> ${sale.seller}</div>
        <div><strong>CLIENTE:</strong> ${sale.client}</div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th class="right">Qtd</th>
              <th class="right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items}
          </tbody>
        </table>
        <div class="divider"></div>
        <div class="right"><strong>Desconto:</strong> R$ ${sale.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        <div class="right" style="font-size: 14px; margin-top: 4px;"><strong>VALOR TOTAL:</strong> R$ ${sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        <div class="divider"></div>
        <div><strong>Forma de Pagamento:</strong> ${sale.paymentMethod}</div>
        <div class="divider"></div>
        <div class="center footer">
          OBRIGADO PELA PREFERÊNCIA!<br>
          Store Imports agradece seu contato.<br>
          Conserve este cupom para sua garantia.
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
    </html>
  `;
  
  printWindow.document.write(receiptHtml);
  printWindow.document.close();
}

// ==========================================
// BULK PROMOTIONS CALCULATOR ENGINE
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
      scopeDetailGroup.classList.add('d-none');
      manualSelectGroup.classList.add('d-none');
    } else if (scope === 'category') {
      scopeDetailGroup.classList.remove('d-none');
      manualSelectGroup.classList.add('d-none');
      document.getElementById('promo-scope-detail-label').textContent = 'Selecione a Categoria:';
      
      const categories = [...new Set(state.products.map(p => p.category))].filter(Boolean);
      scopeDetailSelect.innerHTML = categories.map(c => `<option value="${c}">${c.toUpperCase()}</option>`).join('');
    } else if (scope === 'brand') {
      scopeDetailGroup.classList.remove('d-none');
      manualSelectGroup.classList.add('d-none');
      document.getElementById('promo-scope-detail-label').textContent = 'Selecione a Marca:';
      
      const brands = [...new Set(state.products.map(p => p.brand))].filter(Boolean);
      scopeDetailSelect.innerHTML = brands.map(b => `<option value="${b}">${b}</option>`).join('');
    } else if (scope === 'selected') {
      scopeDetailGroup.classList.add('d-none');
      manualSelectGroup.classList.remove('d-none');
      
      manualProductsList.innerHTML = state.products.map(p => `
        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; margin-bottom: 4px;">
          <input type="checkbox" name="promo-select-product" value="${p.id}" style="width: 16px; height: 16px; accent-color: var(--purple-primary);">
          <span>${p.name} (${p.brand}) - R$ ${p.price.toLocaleString('pt-BR')}</span>
        </label>
      `).join('');
    }
  });

  btnPreview.addEventListener('click', generatePromoPreview);
  
  formPromo.addEventListener('submit', (e) => {
    e.preventDefault();
    applyPromoDiscount();
  });
  
  btnClear.addEventListener('click', clearPromoDiscounts);
}

function generatePromoPreview() {
  const scope = document.getElementById('promo-scope').value;
  const detail = document.getElementById('promo-scope-detail').value;
  const discountType = document.getElementById('promo-discount-type').value;
  const discountValue = parseFloat(document.getElementById('promo-discount-value').value);
  const previewCard = document.getElementById('promo-preview-card');
  const tbody = document.getElementById('promo-preview-tbody');
  
  if (isNaN(discountValue) || discountValue < 0) {
    showAdminToast('Insira um valor de desconto válido.', 'danger');
    return;
  }
  
  let productsToApply = [];
  if (scope === 'all') {
    productsToApply = [...state.products];
  } else if (scope === 'category') {
    productsToApply = state.products.filter(p => p.category === detail);
  } else if (scope === 'brand') {
    productsToApply = state.products.filter(p => p.brand === detail);
  } else if (scope === 'selected') {
    const checkedBoxes = document.querySelectorAll('input[name="promo-select-product"]:checked');
    const selectedIds = Array.from(checkedBoxes).map(cb => cb.value);
    productsToApply = state.products.filter(p => selectedIds.includes(p.id));
  }
  
  if (productsToApply.length === 0) {
    showAdminToast('Nenhum produto selecionado ou elegível.', 'warning');
    return;
  }
  
  promoPreviewProducts = productsToApply.map(p => {
    let newPromoPrice = 0;
    if (discountType === 'percent') {
      newPromoPrice = Math.round(p.price * (1 - discountValue / 100));
    } else {
      newPromoPrice = Math.max(0, p.price - discountValue);
    }
    
    const realDiscount = p.price - newPromoPrice;
    
    return {
      product: p,
      newPromoPrice: newPromoPrice,
      realDiscount: realDiscount
    };
  });
  
  tbody.innerHTML = promoPreviewProducts.map(item => `
    <tr>
      <td><span class="badge-capsule badge-purple-light" style="font-size: 0.75rem;">${item.product.internalCode || 'N/A'}</span></td>
      <td><strong>${item.product.name}</strong></td>
      <td>R$ ${item.product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
      <td class="text-muted">${item.product.promoPrice ? `R$ ${item.product.promoPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}</td>
      <td class="text-orange" style="font-weight: 700;">R$ ${item.newPromoPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
      <td class="text-purple" style="font-weight: 700;">R$ ${item.realDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');
  
  if (previewCard) previewCard.classList.remove('d-none');
  showAdminToast(`Prévia gerada para ${productsToApply.length} produtos.`, 'info');
}

function applyPromoDiscount() {
  if (promoPreviewProducts.length === 0) {
    showAdminToast('Gere a prévia de alterações antes de aplicar.', 'warning');
    return;
  }
  
  promoPreviewProducts.forEach(item => {
    const idx = state.products.findIndex(p => p.id === item.product.id);
    if (idx > -1) {
      state.products[idx].promoPrice = item.newPromoPrice;
    }
  });
  
  saveToLocalStorage('products', state.products);
  addActivityLog(`Promoção aplicada para ${promoPreviewProducts.length} produtos. Operador: ${state.activeProfile}.`, 'success');
  showAdminToast('Promoção aplicada com sucesso!', 'success');
  
  promoPreviewProducts = [];
  document.getElementById('promo-preview-card').classList.add('d-none');
  renderCurrentTab();
}

function clearPromoDiscounts() {
  const scope = document.getElementById('promo-scope').value;
  const detail = document.getElementById('promo-scope-detail').value;
  
  let clearedCount = 0;
  
  state.products.forEach(p => {
    let match = false;
    if (scope === 'all') {
      match = true;
    } else if (scope === 'category' && p.category === detail) {
      match = true;
    } else if (scope === 'brand' && p.brand === detail) {
      match = true;
    } else if (scope === 'selected') {
      const checkedBoxes = document.querySelectorAll('input[name="promo-select-product"]:checked');
      const selectedIds = Array.from(checkedBoxes).map(cb => cb.value);
      if (selectedIds.includes(p.id)) match = true;
    }
    
    if (match && p.promoPrice !== null) {
      p.promoPrice = null;
      clearedCount++;
    }
  });
  
  if (clearedCount === 0) {
    showAdminToast('Nenhuma promoção ativa para remover no escopo selecionado.', 'warning');
    return;
  }
  
  saveToLocalStorage('products', state.products);
  addActivityLog(`Descontos promocionais limpos de ${clearedCount} produtos. Operador: ${state.activeProfile}.`, 'warning');
  showAdminToast(`${clearedCount} promoções removidas.`, 'success');
  
  document.getElementById('promo-preview-card').classList.add('d-none');
  renderCurrentTab();
}
