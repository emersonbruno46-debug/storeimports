/**
 * Store Imports - Administrative Dashboard Logic
 */

// ==========================================
// MOCK DATA FOR SEEDING (DEMO DATA TEMPLATE)
// ==========================================
const SEED_PRODUCTS = [
  {
    id: 'prod-001',
    internalCode: 'IP15P-256-TI',
    barcode: '7891000200013',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    model: '15 Pro Max',
    category: 'iphones',
    description: 'Aparelho em perfeito estado, tela Super Retina XDR OLED com Dynamic Island, chip A17 Pro, câmera de 48MP e acabamento em titânio.',
    cost: 5800,
    price: 7499,
    promoPrice: 6999,
    quantity: 3,
    minQuantity: 1,
    unit: 'un',
    colors: ['Titânio Natural', 'Titânio Preto'],
    selectedColor: 'Titânio Natural',
    capacities: ['256GB'],
    selectedCapacity: '256GB',
    condition: 'Novo',
    warranty: '12 meses Apple',
    boxContent: 'iPhone, Cabo USB-C',
    imeis: ['359998887776661', '359998887776662', '359998887776663']
  },
  {
    id: 'prod-002',
    internalCode: 'IP14-128-PR',
    barcode: '7891000200020',
    name: 'iPhone 14',
    brand: 'Apple',
    model: '14',
    category: 'iphones',
    description: 'Ótima relação custo-benefício. Tela de 6.1 polegadas, chip A15 Bionic, câmera dupla avançada de 12MP.',
    cost: 3200,
    price: 4399,
    promoPrice: null,
    quantity: 5,
    minQuantity: 2,
    unit: 'un',
    colors: ['Preto-Espacial', 'Estelar'],
    selectedColor: 'Preto-Espacial',
    capacities: ['128GB'],
    selectedCapacity: '128GB',
    condition: 'Seminovo',
    warranty: '3 meses loja',
    boxContent: 'iPhone, Cabo Lightning',
    imeis: ['357774443332221', '357774443332222', '357774443332223']
  },
  {
    id: 'prod-003',
    internalCode: 'S23U-256-CR',
    barcode: '7891000200037',
    name: 'Galaxy S23 Ultra 5G',
    brand: 'Samsung',
    model: 'S23 Ultra',
    category: 'android',
    description: 'A câmera de 200MP definitiva com S Pen inclusa.',
    cost: 4100,
    price: 5699,
    promoPrice: 5199,
    quantity: 1, // Alerta
    minQuantity: 2,
    unit: 'un',
    colors: ['Creme'],
    selectedColor: 'Creme',
    capacities: ['256GB'],
    selectedCapacity: '256GB',
    condition: 'Novo',
    warranty: '12 meses Samsung',
    boxContent: 'Aparelho, Carregador, Cabo',
    imeis: ['351112223334441']
  },
  {
    id: 'prod-004',
    internalCode: 'CASE-IP15P-MAG',
    barcode: '7891000200051',
    name: 'Capa Silicone MagSafe iPhone 15 Pro',
    brand: 'Custom',
    model: 'Capa MagSafe',
    category: 'capas',
    description: 'Capa protetora de silicone premium.',
    cost: 25,
    price: 89,
    promoPrice: 69,
    quantity: 12,
    minQuantity: 5,
    unit: 'un',
    colors: ['Preto'],
    selectedColor: 'Preto',
    capacities: [],
    selectedCapacity: '',
    condition: 'Novo',
    warranty: '3 meses fabricante',
    boxContent: 'Capa de Silicone'
  }
];

const SEED_RESERVATIONS = [
  {
    id: 'res-101',
    code: '#SI-4859',
    nome: 'Carlos Eduardo Souza',
    whatsapp: '(11) 98765-4321',
    email: 'carlos.edu@email.com',
    contatoPref: 'WhatsApp',
    dataRetirada: '28/07/2026',
    rawDate: '2026-07-28',
    obs: 'Gostaria que o aparelho já viesse com película aplicada se possível.',
    status: 'Aguardando confirmação',
    createdAt: '16/07/2026 14:32:10',
    items: [
      { productId: 'prod-001', name: 'iPhone 15 Pro Max', price: 6999, color: 'Titânio Natural', capacity: '256GB', quantity: 1 }
    ],
    total: 6999
  },
  {
    id: 'res-102',
    code: '#SI-9012',
    nome: 'Ana Julia Martins',
    whatsapp: '(11) 97777-8888',
    email: 'anajulia@email.com',
    contatoPref: 'WhatsApp',
    dataRetirada: '22/07/2026',
    rawDate: '2026-07-22',
    obs: 'Vou retirar no horário do almoço.',
    status: 'Confirmada',
    createdAt: '15/07/2026 10:15:45',
    items: [
      { productId: 'prod-002', name: 'iPhone 14', price: 4399, color: 'Preto-Espacial', capacity: '128GB', quantity: 1 },
      { productId: 'prod-004', name: 'Capa Silicone MagSafe iPhone 15 Pro', price: 69, color: 'Preto', capacity: '', quantity: 1 }
    ],
    total: 4468
  }
];

const SEED_SALES = [
  {
    id: 'sale-101',
    code: 'VD-8472',
    productName: 'iPhone 15 Pro Max',
    productId: 'prod-001',
    quantity: 1,
    client: 'Pedro Henrique Silva',
    paymentMethod: 'Pix',
    discount: 100,
    total: 6899,
    date: '16/07/2026 11:20:00',
    seller: 'Lucas (Vendedor)'
  },
  {
    id: 'sale-102',
    code: 'VD-1290',
    productName: 'Capa Silicone MagSafe iPhone 15 Pro',
    productId: 'prod-004',
    quantity: 2,
    client: 'Venda rápida avulsa',
    paymentMethod: 'Dinheiro',
    discount: 0,
    total: 138,
    date: '15/07/2026 16:45:00',
    seller: 'Mariana (Vendedora)'
  }
];

const SEED_STOCK_LOGS = [
  {
    id: 'log-101',
    productName: 'iPhone 15 Pro Max',
    amount: 5,
    type: 'Entrada',
    reason: 'Importação lote fiscal #9482',
    operator: 'Administrador',
    timestamp: '15/07/2026 09:00'
  },
  {
    id: 'log-102',
    productName: 'iPhone 14',
    amount: 3,
    type: 'Entrada',
    reason: 'Lançamento estoque consignado',
    operator: 'Gerente',
    timestamp: '15/07/2026 09:12'
  },
  {
    id: 'log-103',
    productName: 'Galaxy S23 Ultra 5G',
    amount: 1,
    type: 'Saída',
    reason: 'Venda presencial rápida no balcão',
    operator: 'Administrador',
    timestamp: '16/07/2026 11:22'
  }
];

// ==========================================
// STATE MANAGEMENT
// ==========================================
let state = {
  currentTab: 'overview',
  products: [],
  reservations: [],
  sales: [],
  stockLogs: [],
  activityLogs: [],
  selectedProductToEdit: null,
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
const tabs = ['overview', 'products', 'stock', 'reservations', 'sales', 'promo', 'users'];

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
  
  lucide.createIcons();
});

// Load variables from localStorage, seed if empty
function loadDatabase() {
  let products = JSON.parse(localStorage.getItem('store_imports_products')) || [];
  let reservations = JSON.parse(localStorage.getItem('store_imports_reservations')) || [];
  let sales = JSON.parse(localStorage.getItem('store_imports_sales')) || [];
  let stockLogs = JSON.parse(localStorage.getItem('store_imports_stock_logs')) || [];
  let activityLogs = JSON.parse(localStorage.getItem('store_imports_activity_logs')) || [];

  // Seed default items if databases are completely empty, giving a populated dashboard initial look
  if (products.length === 0 && reservations.length === 0) {
    products = SEED_PRODUCTS;
    reservations = SEED_RESERVATIONS;
    sales = SEED_SALES;
    stockLogs = SEED_STOCK_LOGS;
    
    activityLogs = [
      { text: 'Sistema operacional Store Imports inicializado com sucesso.', type: 'info', time: '14/07/2026 08:00' },
      { text: 'Dados de teste populados para demonstração comercial.', type: 'success', time: '14/07/2026 08:05' }
    ];
    
    saveToLocalStorage('products', products);
    saveToLocalStorage('reservations', reservations);
    saveToLocalStorage('sales', sales);
    saveToLocalStorage('stock_logs', stockLogs);
    saveToLocalStorage('activity_logs', activityLogs);
  }

  state.products = products;
  state.reservations = reservations;
  state.sales = sales;
  state.stockLogs = stockLogs;
  state.activityLogs = activityLogs;

  // Log workspace details
  addActivityLog('Sessão administrativa iniciada.', 'info');
}

function saveToLocalStorage(key, data) {
  localStorage.setItem(`store_imports_${key}`, JSON.stringify(data));
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
    users: 'Cargos e Permissões'
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
  // 1. Total products
  kpiTotalProducts.textContent = state.products.length;
  
  // 2. Pending Reservations
  const pending = state.reservations.filter(r => r.status === 'Aguardando confirmação').length;
  kpiPendingRes.textContent = pending;

  // 3. Low stock warning (stock <= minQuantity)
  const lowStock = state.products.filter(p => p.quantity <= p.minQuantity).length;
  kpiLowStock.textContent = lowStock;
  
  // 4. Faturamento (Sales total)
  const totalSales = state.sales.reduce((sum, s) => sum + s.total, 0);
  const kpiFaturamento = document.getElementById('kpi-faturamento');
  if (kpiFaturamento) {
    kpiFaturamento.textContent = `R$ ${totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }
  
  // 5. Sold/Reserved estimated value (for active reservations)
  const activeValue = state.reservations
    .filter(r => ['Aguardando confirmação', 'Confirmada', 'Aguardando retirada'].includes(r.status))
    .reduce((sum, r) => sum + r.total, 0);
  kpiSalesValue.textContent = `R$ ${activeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function renderDashboardOverview() {
  // Render Recent Reservations inside overview
  const tbody = document.getElementById('dashboard-recent-reservations-tbody');
  tbody.innerHTML = '';
  
  // Get 5 most recent
  const sorted = [...state.reservations].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);
  
  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-muted" style="text-align: center;">Nenhuma solicitação recebida.</td></tr>';
  } else {
    sorted.forEach(res => {
      const tr = document.createElement('tr');
      
      const totalItems = res.items.reduce((sum, i) => sum + i.quantity, 0);
      const prodNamePreview = res.items.map(i => `${i.name} (${i.quantity}x)`).join(', ');
      
      let statusClass = 'status-pending';
      if (res.status === 'Confirmada') statusClass = 'status-confirmed';
      if (res.status === 'Aguardando retirada') statusClass = 'status-waiting';
      if (res.status === 'Finalizada') statusClass = 'status-finished';
      if (res.status === 'Cancelada') statusClass = 'status-cancelled';

      tr.innerHTML = `
        <td><strong>${res.code}</strong></td>
        <td>${res.nome}</td>
        <td>${res.whatsapp}</td>
        <td style="max-width: 200px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${prodNamePreview}</td>
        <td class="text-orange" style="font-weight: 700;">R$ ${res.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td><span class="status-pill ${statusClass}">${res.status}</span></td>
        <td class="text-muted">${res.createdAt}</td>
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

function openProductFormModal(prodId = null) {
  adminAddProductForm.reset();
  switchFormTab('form-general');
  
  // Show/Hide IMEI tracker block dynamically
  const pCatSelect = document.getElementById('p-category');
  const pImeiBlock = document.getElementById('p-imei-tracker');
  
  pCatSelect.addEventListener('change', () => {
    if (['iphones', 'android'].includes(pCatSelect.value)) {
      pImeiBlock.classList.remove('d-none');
    } else {
      pImeiBlock.classList.add('d-none');
    }
  });

  if (prodId) {
    // EDIT MODE
    state.selectedProductToEdit = prodId;
    adminProductModalTitle.textContent = 'Editar Produto';
    
    const p = state.products.find(item => item.id === prodId);
    if (p) {
      document.getElementById('p-name').value = p.name;
      document.getElementById('p-brand').value = p.brand;
      document.getElementById('p-model').value = p.model;
      document.getElementById('p-category').value = p.category;
      document.getElementById('p-condition').value = p.condition;
      document.getElementById('p-description').value = p.description || '';
      
      document.getElementById('p-price').value = p.price;
      document.getElementById('p-promo').value = p.promoPrice || '';
      document.getElementById('p-cost').value = p.cost || '';
      
      document.getElementById('p-quantity').value = p.quantity;
      document.getElementById('p-min-qty').value = p.minQuantity;
      document.getElementById('p-code').value = p.internalCode || '';
      document.getElementById('p-imeis-list').value = p.imeis ? p.imeis.join(', ') : '';
      
      document.getElementById('p-colors').value = p.colors ? p.colors.join(', ') : '';
      document.getElementById('p-capacities').value = p.capacities ? p.capacities.join(', ') : '';
      document.getElementById('p-warranty').value = p.warranty || '';
      document.getElementById('p-box').value = p.boxContent || '';
      
      // Trigger dynamic category block view initially
      if (['iphones', 'android'].includes(p.category)) {
        pImeiBlock.classList.remove('d-none');
      } else {
        pImeiBlock.classList.add('d-none');
      }
    }
  } else {
    // ADD MODE
    state.selectedProductToEdit = null;
    adminProductModalTitle.textContent = 'Adicionar Novo Produto';
    pImeiBlock.classList.remove('d-none'); // default is iphone, show it
  }
  
  adminProductModalOverlay.classList.add('active');
}

function closeProductFormModal() {
  adminProductModalOverlay.classList.remove('active');
  state.selectedProductToEdit = null;
}

function switchFormTab(tabPaneName) {
  state.activeFormTab = tabPaneName;
  
  // Update form tab button states
  document.querySelectorAll('[data-form-tab]').forEach(btn => {
    if (btn.getAttribute('data-form-tab') === tabPaneName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Toggle form panes
  const panes = ['form-general', 'form-prices', 'form-stock', 'form-variations'];
  panes.forEach(p => {
    const block = document.getElementById(`form-tab-${p.replace('form-', '')}`);
    if (p === tabPaneName) {
      block.classList.remove('d-none');
    } else {
      block.classList.add('d-none');
    }
  });
}

function handleProductFormSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('p-name').value.trim();
  const brand = document.getElementById('p-brand').value.trim();
  const model = document.getElementById('p-model').value.trim();
  const category = document.getElementById('p-category').value;
  const condition = document.getElementById('p-condition').value;
  const description = document.getElementById('p-description').value.trim();
  
  const price = parseFloat(document.getElementById('p-price').value);
  const promoVal = document.getElementById('p-promo').value;
  const promoPrice = promoVal ? parseFloat(promoVal) : null;
  const costVal = document.getElementById('p-cost').value;
  const cost = costVal ? parseFloat(costVal) : null;
  
  const quantity = parseInt(document.getElementById('p-quantity').value);
  const minQuantity = parseInt(document.getElementById('p-min-qty').value);
  const internalCode = document.getElementById('p-code').value.trim();
  const rawImeis = document.getElementById('p-imeis-list').value;
  
  const rawColors = document.getElementById('p-colors').value;
  const rawCapacities = document.getElementById('p-capacities').value;
  const warranty = document.getElementById('p-warranty').value.trim();
  const boxContent = document.getElementById('p-box').value.trim();

  // Basic validate
  if (!name || !brand || !model || isNaN(price) || isNaN(quantity)) {
    showAdminToast('Preencha os campos obrigatórios em todas as abas.', 'danger');
    return;
  }
  
  // Format arrays
  const imeis = rawImeis ? rawImeis.split(',').map(i => i.trim()).filter(Boolean) : [];
  const colors = rawColors ? rawColors.split(',').map(c => c.trim()).filter(Boolean) : [];
  const capacities = rawCapacities ? rawCapacities.split(',').map(c => c.trim()).filter(Boolean) : [];
  
  if (state.selectedProductToEdit) {
    // EDIT SAVE
    const idx = state.products.findIndex(p => p.id === state.selectedProductToEdit);
    if (idx > -1) {
      const originalQty = state.products[idx].quantity;
      
      state.products[idx] = {
        ...state.products[idx],
        name, brand, model, category, condition, description,
        price, promoPrice, cost,
        quantity, minQuantity, internalCode, imeis,
        colors, capacities, warranty, boxContent
      };
      
      // Stock log if quantity was altered
      if (originalQty !== quantity) {
        const diff = quantity - originalQty;
        registerStockLog(
          state.products[idx].name, 
          Math.abs(diff), 
          diff > 0 ? 'Entrada' : 'Saída', 
          'Correção na edição de cadastro do produto'
        );
      }
      
      addActivityLog(`Produto editado: ${name}`, 'success');
      showAdminToast('Produto atualizado com sucesso.', 'success');
    }
  } else {
    // NEW CREATE
    const newProd = {
      id: `prod-${Date.now()}`,
      internalCode: internalCode || `REF-${Math.floor(100 + Math.random() * 900)}`,
      barcode: `789${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      name, brand, model, category, condition, description,
      price, promoPrice, cost,
      quantity, minQuantity, unit: 'un', imeis,
      colors, capacities, warranty, boxContent
    };
    
    state.products.push(newProd);
    
    // Register initial stock log
    registerStockLog(name, quantity, 'Entrada', 'Lançamento de cadastro inicial');
    
    addActivityLog(`Novo produto cadastrado: ${name}`, 'success');
    showAdminToast('Produto cadastrado com sucesso.', 'success');
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
