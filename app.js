/**
 * Store Imports - Client Catalog Application Logic
 */

// ==========================================
// MOCK DATA FOR DEMO MODE
// ==========================================
const MOCK_CATEGORIES = [
  { id: 'smartphones', name: 'Smartphones', icon: 'smartphone', count: 12 },
  { id: 'iphones', name: 'iPhones', icon: 'smartphone', count: 6 },
  { id: 'android', name: 'Android', icon: 'smartphone', count: 6 },
  { id: 'capas', name: 'Capas', icon: 'shield', count: 15 },
  { id: 'peliculas', name: 'Películas', icon: 'sparkles', count: 8 },
  { id: 'carregadores', name: 'Carregadores', icon: 'battery-charging', count: 10 },
  { id: 'fones', name: 'Fones de Ouvido', icon: 'headphones', count: 7 },
  { id: 'smartwatches', name: 'Smartwatches', icon: 'watch', count: 5 },
  { id: 'caixas-de-som', name: 'Caixas de Som', icon: 'volume-2', count: 4 },
  { id: 'acessorios', name: 'Acessórios', icon: 'usb', count: 20 }
];

const MOCK_PRODUCTS = [
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
    colors: ['Titânio Natural', 'Titânio Preto', 'Titânio Azul'],
    selectedColor: 'Titânio Natural',
    capacities: ['256GB', '512GB'],
    selectedCapacity: '256GB',
    condition: 'Novo',
    warranty: '12 meses Apple',
    boxContent: 'iPhone 15 Pro Max, Cabo USB-C de recarga rápida, manual',
    imeis: ['359998887776661', '359998887776662', '359998887776663'],
    serialNumbers: ['G123456789', 'G123456780', 'G123456781']
  },
  {
    id: 'prod-002',
    internalCode: 'IP14-128-PR',
    barcode: '7891000200020',
    name: 'iPhone 14',
    brand: 'Apple',
    model: '14',
    category: 'iphones',
    description: 'Ótima relação custo-benefício. Tela de 6.1 polegadas, chip A15 Bionic, câmera dupla avançada de 12MP e excelente bateria.',
    cost: 3200,
    price: 4399,
    promoPrice: null,
    quantity: 5,
    minQuantity: 2,
    unit: 'un',
    colors: ['Preto-Espacial', 'Estelar', 'Roxo'],
    selectedColor: 'Preto-Espacial',
    capacities: ['128GB', '256GB'],
    selectedCapacity: '128GB',
    condition: 'Seminovo',
    warranty: '3 meses loja (Store Imports)',
    boxContent: 'iPhone 14, Cabo de recarga Lightning para USB-C',
    imeis: ['357774443332221', '357774443332222', '357774443332223', '357774443332224', '357774443332225'],
    serialNumbers: ['S987654321', 'S987654322', 'S987654323', 'S987654324', 'S987654325']
  },
  {
    id: 'prod-003',
    internalCode: 'S23U-256-CR',
    barcode: '7891000200037',
    name: 'Galaxy S23 Ultra 5G',
    brand: 'Samsung',
    model: 'S23 Ultra',
    category: 'android',
    description: 'A câmera de 200MP definitiva com S Pen inclusa. Processador Snapdragon 8 Gen 2, tela Dynamic AMOLED 2X de 120Hz.',
    cost: 4100,
    price: 5699,
    promoPrice: 5199,
    quantity: 2,
    minQuantity: 1,
    unit: 'un',
    colors: ['Creme', 'Verde', 'Preto'],
    selectedColor: 'Creme',
    capacities: ['256GB', '512GB'],
    selectedCapacity: '256GB',
    condition: 'Novo',
    warranty: '12 meses Samsung',
    boxContent: 'Galaxy S23 Ultra, Caneta S Pen, Carregador 25W, Cabo USB-C',
    imeis: ['351112223334441', '351112223334442'],
    serialNumbers: ['R987654321', 'R987654322']
  },
  {
    id: 'prod-004',
    internalCode: 'REDMI13-256-AZ',
    barcode: '7891000200044',
    name: 'Redmi Note 13 Pro 5G',
    brand: 'Xiaomi',
    model: 'Note 13 Pro',
    category: 'android',
    description: 'Incrível tela AMOLED de 120Hz com sensor biométrico sob a tela, câmera tripla de 200MP e carregamento turbo de 67W.',
    cost: 1400,
    price: 2199,
    promoPrice: null,
    quantity: 1, // Últimas unidades
    minQuantity: 1,
    unit: 'un',
    colors: ['Azul Ocean', 'Preto Midnight'],
    selectedColor: 'Azul Ocean',
    capacities: ['256GB'],
    selectedCapacity: '256GB',
    condition: 'Novo',
    warranty: '6 meses importador',
    boxContent: 'Redmi Note 13 Pro, Carregador 67W, Cabo USB-C, Capa de proteção',
    imeis: ['353334445556661'],
    serialNumbers: ['X123456789']
  },
  {
    id: 'prod-005',
    internalCode: 'CASE-IP15P-MAG',
    barcode: '7891000200051',
    name: 'Capa Silicone MagSafe iPhone 15 Pro',
    brand: 'Custom',
    model: 'Capa MagSafe',
    category: 'capas',
    description: 'Capa protetora de silicone premium com anel magnético compatível com carregador MagSafe. Toque macio e forro interno de microfibra.',
    cost: 25,
    price: 89,
    promoPrice: 69,
    quantity: 15,
    minQuantity: 5,
    unit: 'un',
    colors: ['Preto', 'Azul-Escuro', 'Verde-Musgo'],
    selectedColor: 'Preto',
    capacities: [],
    selectedCapacity: '',
    condition: 'Novo',
    warranty: 'Garantia contra defeito de fabricação',
    boxContent: 'Capa de Silicone MagSafe'
  },
  {
    id: 'prod-006',
    internalCode: 'CHARGER-AN-45W',
    barcode: '7891000200068',
    name: 'Carregador USB-C Rápido 45W Duplo',
    brand: 'Anker',
    model: 'Carregador 45W',
    category: 'carregadores',
    description: 'Carregador de tomada ultra-rápido com duas portas USB-C inteligentes. Tecnologia GaN Prime para controle de temperatura.',
    cost: 75,
    price: 189,
    promoPrice: 149,
    quantity: 8,
    minQuantity: 2,
    unit: 'un',
    colors: ['Preto', 'Branco'],
    selectedColor: 'Preto',
    capacities: [],
    selectedCapacity: '',
    condition: 'Novo',
    warranty: '12 meses Anker',
    boxContent: 'Carregador de parede Anker 45W, Manual do usuário'
  },
  {
    id: 'prod-007',
    internalCode: 'FONE-AP3-AP',
    barcode: '7891000200075',
    name: 'AirPods 3ª Geração',
    brand: 'Apple',
    model: 'AirPods 3',
    category: 'fones',
    description: 'Fones sem fio com áudio espacial personalizado, equalização adaptativa, maior duração de bateria e resistência à água.',
    cost: 1100,
    price: 1699,
    promoPrice: null,
    quantity: 0, // Esgotado / Sob consulta
    minQuantity: 1,
    unit: 'un',
    colors: ['Branco'],
    selectedColor: 'Branco',
    capacities: [],
    selectedCapacity: '',
    condition: 'Novo',
    warranty: '12 meses Apple',
    boxContent: 'AirPods, Estojo de recarga Lightning, Cabo de Lightning para USB-C'
  }
];

// ==========================================
// STATE MANAGEMENT
// ==========================================
let state = {
  cart: [],
  demoMode: false,
  activeView: 'home',
  products: [],
  filters: {
    search: '',
    category: '',
    brands: [],
    conditions: [],
    availabilities: []
  },
  sorting: 'recentes',
  currentProductDetail: null
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const viewHome = document.getElementById('view-home');
const viewReserva = document.getElementById('view-reserva');
const viewSucesso = document.getElementById('view-sucesso');
const appViewport = document.getElementById('app-viewport');

const mainHeader = document.getElementById('main-header');
const cartBadgeCount = document.getElementById('cart-badge-count');
const cartBadgeCountMobile = document.getElementById('cart-badge-count-mobile');
const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartEstimatedTotal = document.getElementById('cart-estimated-total');
const btnDrawerReserveSubmit = document.getElementById('btn-drawer-reserve-submit');

const mobileDrawerOverlay = document.getElementById('mobile-drawer-overlay');
const btnHamburger = document.getElementById('btn-hamburger');
const btnCloseDrawer = document.getElementById('btn-close-drawer');

const productDetailModalOverlay = document.getElementById('product-detail-modal-overlay');
const productDetailModalBody = document.getElementById('product-detail-modal-body');

const demoModeCheckbox = document.getElementById('demo-mode-checkbox');
const demoToggleTrigger = document.getElementById('demo-toggle-trigger');
const productionEmptyState = document.getElementById('production-empty-state');
const catalogActiveContent = document.getElementById('catalog-active-content');
const btnActivateDemoEmpty = document.getElementById('btn-activate-demo-empty');

const mainSearchInput = document.getElementById('main-search-input');
const btnMainSearch = document.getElementById('btn-main-search');

const categoriesContainer = document.getElementById('categories-container');
const filterCategoriesList = document.getElementById('filter-categories-list');
const filterBrandsList = document.getElementById('filter-brands-list');
const productsContainer = document.getElementById('products-container');
const catalogResultsCount = document.getElementById('catalog-results-count');
const sortSelectInput = document.getElementById('sort-select-input');
const catalogNoResults = document.getElementById('catalog-no-results');

const reservationItemsPreviewList = document.getElementById('reservation-items-preview-list');
const reservationPreviewTotalValue = document.getElementById('reservation-preview-total-value');
const reservationSubmitForm = document.getElementById('reservation-submit-form');
const formWhatsapp = document.getElementById('form-whatsapp');

// ==========================================
// APP INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initCopyright();
  initLocalStorage();
  setupRouting();
  setupEventListeners();
  loadCartFromLocalStorage();
  renderCategories();
  
  // Set date picker min value to today
  const dateInput = document.getElementById('form-data');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }
  
  // Dynamic header on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }
  });

  lucide.createIcons();
});

// Update Copyright Year dynamically
function initCopyright() {
  const cEl = document.getElementById('copyright-text');
  if (cEl) {
    cEl.textContent = `© ${new Date().getFullYear()} Store Imports. Todos os direitos reservados.`;
  }
}

// Initial LocalStorage setup
function initLocalStorage() {
  // Load products database if not existing, or initialize with mock database if they want it
  const storedProducts = localStorage.getItem('store_imports_products');
  if (!storedProducts) {
    // If not existing, keep it empty or prepare it empty for actual admin CRUD.
    // In our JS, we fallback to MOCK_PRODUCTS when demoMode is active.
    localStorage.setItem('store_imports_products', JSON.stringify([]));
  }
  
  const storedReservations = localStorage.getItem('store_imports_reservations');
  if (!storedReservations) {
    localStorage.setItem('store_imports_reservations', JSON.stringify([]));
  }
}

// ==========================================
// ROUTING ENGINE
// ==========================================
function setupRouting() {
  // Hash Routing trigger
  window.addEventListener('hashchange', handleRoute);
  
  // Initial route
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash || '#home';
  
  // Close drawer and modals on navigate
  closeMobileDrawer();
  closeCartDrawer();
  closeProductDetailModal();
  
  // Scroll to target if navigation is internal (e.g. scroll to elements)
  if (hash === '#home' || hash.startsWith('#home-')) {
    navigateToView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (hash === '#catalogo') {
    navigateToView('home');
    scrollToSection('catalogo');
  } else if (hash === '#categorias') {
    navigateToView('home');
    scrollToSection('categorias');
  } else if (hash === '#como-funciona') {
    navigateToView('home');
    scrollToSection('como-funciona');
  } else if (hash === '#diferenciais') {
    navigateToView('home');
    scrollToSection('diferenciais');
  } else if (hash === '#contato') {
    navigateToView('home');
    scrollToSection('contato');
  } else if (hash === '#selecao') {
    // Open selection reservation form view
    if (state.cart.length === 0) {
      window.location.hash = '#catalogo';
      showToast('Adicione itens à sua seleção primeiro.', 'warning');
    } else {
      navigateToView('reserva');
      renderReservationPreview();
    }
  } else if (hash.startsWith('#sucesso/')) {
    const resId = hash.split('/')[1];
    navigateToView('sucesso');
    renderSuccessScreen(resId);
  } else {
    // Fallback to home
    navigateToView('home');
  }
  
  updateActiveMenuLinks(hash);
}

function navigateToView(viewName) {
  state.activeView = viewName;
  
  // Toggle Views in DOM
  const views = {
    home: viewHome,
    reserva: viewReserva,
    sucesso: viewSucesso
  };
  
  Object.keys(views).forEach(key => {
    if (key === viewName) {
      views[key].classList.remove('d-none');
    } else {
      views[key].classList.add('d-none');
    }
  });
  
  window.scrollTo(0, 0);
}

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    setTimeout(() => {
      const headerOffset = 90;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }, 100);
  }
}

function updateActiveMenuLinks(hash) {
  // Update desktop links
  const links = ['home', 'catalogo', 'categorias', 'como-funciona', 'diferenciais', 'contato'];
  links.forEach(link => {
    const el = document.getElementById(`nav-${link}`);
    if (el) {
      if (hash === `#${link}` || (hash === '#home' && link === 'home')) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }
  });

  // Update bottom bar items
  const bItems = {
    '#home': 'b-nav-home',
    '#catalogo': 'b-nav-search',
    '#categorias': 'b-nav-categories',
    '#selecao': 'b-nav-cart'
  };
  
  Object.keys(bItems).forEach(key => {
    const item = document.getElementById(bItems[key]);
    if (item) {
      if (hash.startsWith(key)) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    }
  });
}

// ==========================================
// INTERACTIVE EVENT LISTENERS
// ==========================================
function setupEventListeners() {
  // Mobile drawer menu toggles
  btnHamburger.addEventListener('click', openMobileDrawer);
  btnCloseDrawer.addEventListener('click', closeMobileDrawer);
  mobileDrawerOverlay.addEventListener('click', (e) => {
    if (e.target === mobileDrawerOverlay) closeMobileDrawer();
  });
  
  // Close drawer links
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileDrawer);
  });
  
  // Cart drawer toggles
  document.getElementById('btn-cart-trigger').addEventListener('click', openCartDrawer);
  document.getElementById('b-nav-cart').addEventListener('click', (e) => {
    e.preventDefault();
    openCartDrawer();
  });
  document.getElementById('btn-close-cart-drawer').addEventListener('click', closeCartDrawer);
  cartDrawerOverlay.addEventListener('click', (e) => {
    if (e.target === cartDrawerOverlay) closeCartDrawer();
  });
  
  // Demo Mode Switch
  demoModeCheckbox.addEventListener('change', (e) => {
    toggleDemoMode(e.target.checked);
  });
  demoToggleTrigger.addEventListener('click', (e) => {
    // Prevent clicking nested slider elements from double toggling
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SPAN') {
      demoModeCheckbox.checked = !demoModeCheckbox.checked;
      toggleDemoMode(demoModeCheckbox.checked);
    }
  });
  btnActivateDemoEmpty.addEventListener('click', () => {
    demoModeCheckbox.checked = true;
    toggleDemoMode(true);
  });
  
  // Search
  btnMainSearch.addEventListener('click', handleSearchSubmit);
  mainSearchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearchSubmit();
  });
  
  // Modal detail close
  document.getElementById('btn-close-product-modal').addEventListener('click', closeProductDetailModal);
  productDetailModalOverlay.addEventListener('click', (e) => {
    if (e.target === productDetailModalOverlay) closeProductDetailModal();
  });
  
  // Clear filters
  document.getElementById('btn-clear-filters').addEventListener('click', clearAllFilters);
  document.getElementById('btn-clear-filters-empty').addEventListener('click', clearAllFilters);
  
  // Checkout button inside cart drawer
  btnDrawerReserveSubmit.addEventListener('click', () => {
    window.location.hash = '#selecao';
  });
  
  // Go back button inside reservation form
  document.getElementById('btn-back-to-cart').addEventListener('click', () => {
    window.location.hash = '#catalogo';
    openCartDrawer();
  });
  
  // Sort selectors
  sortSelectInput.addEventListener('change', (e) => {
    state.sorting = e.target.value;
    renderCatalogGrid();
  });
  
  // Reservation Form submit & formatting
  formWhatsapp.addEventListener('input', formatPhoneInput);
  reservationSubmitForm.addEventListener('submit', handleReservationFormSubmit);

  // Search button header trigger
  document.getElementById('btn-search-trigger').addEventListener('click', () => {
    window.location.hash = '#catalogo';
    setTimeout(() => {
      mainSearchInput.focus();
    }, 200);
  });
}

function openMobileDrawer() { mobileDrawerOverlay.classList.add('active'); }
function closeMobileDrawer() { mobileDrawerOverlay.classList.remove('active'); }
function openCartDrawer() { cartDrawerOverlay.classList.add('active'); }
function closeCartDrawer() { cartDrawerOverlay.classList.remove('active'); }
function openProductDetailModal() { productDetailModalOverlay.classList.add('active'); }
function closeProductDetailModal() { productDetailModalOverlay.classList.remove('active'); }

// ==========================================
// DEMO MODE CONTROLLER
// ==========================================
function toggleDemoMode(isActive) {
  state.demoMode = isActive;
  
  if (isActive) {
    productionEmptyState.classList.add('d-none');
    catalogActiveContent.classList.remove('d-none');
    
    // Load products database: mix of localStorage created products + MOCK_PRODUCTS
    const stored = JSON.parse(localStorage.getItem('store_imports_products')) || [];
    state.products = [...stored, ...MOCK_PRODUCTS];
    
    renderCategories();
    renderSidebarFilters();
    renderCatalogGrid();
    
    showToast('Modo Demonstração ativado. Catálogo populado.', 'success');
  } else {
    productionEmptyState.classList.remove('d-none');
    catalogActiveContent.classList.add('d-none');
    state.products = [];
    showToast('Modo Demonstração desativado.', 'info');
  }
}

// ==========================================
// CATEGORIES & FILTERS RENDERING
// ==========================================
function renderCategories() {
  categoriesContainer.innerHTML = '';
  
  MOCK_CATEGORIES.forEach(cat => {
    const card = document.createElement('div');
    card.className = `category-card ${state.filters.category === cat.id ? 'active' : ''}`;
    card.innerHTML = `
      <div class="category-card-icon">
        <i data-lucide="${cat.icon}"></i>
      </div>
      <span class="category-card-name">${cat.name} <i data-lucide="arrow-right" class="category-card-arrow" style="width: 14px; height: 14px;"></i></span>
    `;
    
    card.addEventListener('click', () => {
      if (state.filters.category === cat.id) {
        state.filters.category = '';
      } else {
        state.filters.category = cat.id;
        // Make sure demo mode is on to see items
        if (!state.demoMode) {
          demoModeCheckbox.checked = true;
          toggleDemoMode(true);
        }
      }
      window.location.hash = '#catalogo';
      renderCategories();
      renderSidebarFilters();
      renderCatalogGrid();
    });
    
    categoriesContainer.appendChild(card);
  });
  
  lucide.createIcons();
}

function renderSidebarFilters() {
  // 1. Render Categories Filter list
  const catList = document.getElementById('filter-categories-list');
  catList.innerHTML = '';
  
  MOCK_CATEGORIES.forEach(cat => {
    const totalInCat = state.products.filter(p => p.category === cat.id).length;
    if (totalInCat === 0 && state.demoMode) return; // skip empty categories in filter list
    
    const label = document.createElement('label');
    label.className = 'filter-option-checkbox';
    label.innerHTML = `
      <span>
        <input type="radio" name="filter-cat" value="${cat.id}" ${state.filters.category === cat.id ? 'checked' : ''}>
        ${cat.name}
      </span>
      <span class="filter-count">${totalInCat}</span>
    `;
    
    label.querySelector('input').addEventListener('change', (e) => {
      state.filters.category = e.target.value;
      renderCategories();
      renderCatalogGrid();
    });
    
    catList.appendChild(label);
  });

  // 2. Render Brands Filter list
  const brandList = document.getElementById('filter-brands-list');
  brandList.innerHTML = '';
  
  // Extract unique brands from products database
  const brands = [...new Set(state.products.map(p => p.brand))].filter(Boolean);
  
  if (brands.length === 0) {
    brandList.innerHTML = '<span class="text-muted" style="font-size: 0.8rem;">Sem marcas</span>';
  } else {
    brands.forEach(brand => {
      const totalInBrand = state.products.filter(p => p.brand === brand).length;
      
      const label = document.createElement('label');
      label.className = 'filter-option-checkbox';
      const isChecked = state.filters.brands.includes(brand);
      label.innerHTML = `
        <span>
          <input type="checkbox" name="filter-brand" value="${brand}" ${isChecked ? 'checked' : ''}>
          ${brand}
        </span>
        <span class="filter-count">${totalInBrand}</span>
      `;
      
      label.querySelector('input').addEventListener('change', (e) => {
        if (e.target.checked) {
          state.filters.brands.push(brand);
        } else {
          state.filters.brands = state.filters.brands.filter(b => b !== brand);
        }
        renderCatalogGrid();
      });
      
      brandList.appendChild(label);
    });
  }
}

function clearAllFilters() {
  state.filters = {
    search: '',
    category: '',
    brands: [],
    conditions: [],
    availabilities: []
  };
  
  mainSearchInput.value = '';
  
  // Reset all sidebar checkbox DOM states
  document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);
  
  renderCategories();
  renderSidebarFilters();
  renderCatalogGrid();
  
  showToast('Filtros limpos.', 'info');
}

// ==========================================
// SEARCH & RENDER CATALOG GRID
// ==========================================
function handleSearchSubmit() {
  const query = mainSearchInput.value.trim();
  state.filters.search = query;
  
  if (query) {
    // If not in demo mode, activate it so they can see search working
    if (!state.demoMode) {
      demoModeCheckbox.checked = true;
      toggleDemoMode(true);
    }
  }
  
  window.location.hash = '#catalogo';
  renderCatalogGrid();
}

function renderCatalogGrid() {
  if (!state.demoMode) return;
  
  productsContainer.innerHTML = '';
  
  // Read additional filters from Sidebar DOM inputs
  const conditionCheckboxes = document.querySelectorAll('input[name="condition"]:checked');
  state.filters.conditions = Array.from(conditionCheckboxes).map(c => c.value);
  
  const availabilityCheckboxes = document.querySelectorAll('input[name="availability"]:checked');
  state.filters.availabilities = Array.from(availabilityCheckboxes).map(c => c.value);
  
  // Filter products
  let filtered = state.products.filter(prod => {
    // 1. Search Query Match
    if (state.filters.search) {
      const q = state.filters.search.toLowerCase();
      const matchName = prod.name.toLowerCase().includes(q);
      const matchBrand = prod.brand.toLowerCase().includes(q);
      const matchModel = prod.model.toLowerCase().includes(q);
      const matchDesc = prod.description ? prod.description.toLowerCase().includes(q) : false;
      const matchCode = prod.internalCode ? prod.internalCode.toLowerCase().includes(q) : false;
      
      if (!matchName && !matchBrand && !matchModel && !matchDesc && !matchCode) {
        return false;
      }
    }
    
    // 2. Category Match
    if (state.filters.category && prod.category !== state.filters.category) {
      return false;
    }
    
    // 3. Brand Match
    if (state.filters.brands.length > 0 && !state.filters.brands.includes(prod.brand)) {
      return false;
    }
    
    // 4. Condition Match
    if (state.filters.conditions.length > 0 && !state.filters.conditions.includes(prod.condition)) {
      return false;
    }
    
    // 5. Availability Match
    if (state.filters.availabilities.length > 0) {
      const isAvail = prod.quantity > 2;
      const isLow = prod.quantity > 0 && prod.quantity <= 2;
      const isConsult = prod.quantity === 0;
      
      let pass = false;
      if (state.filters.availabilities.includes('Disponível') && isAvail) pass = true;
      if (state.filters.availabilities.includes('Poucas unidades') && isLow) pass = true;
      if (state.filters.availabilities.includes('Consultar') && isConsult) pass = true;
      
      if (!pass) return false;
    }
    
    return true;
  });
  
  // Sort results
  filtered.sort((a, b) => {
    const priceA = a.promoPrice !== null ? a.promoPrice : a.price;
    const priceB = b.promoPrice !== null ? b.promoPrice : b.price;
    
    if (state.sorting === 'preco-crescente') {
      return priceA - priceB;
    } else if (state.sorting === 'preco-decrescente') {
      return priceB - priceA;
    } else {
      // 'recentes' (default mock id order or code ordering)
      return a.id.localeCompare(b.id);
    }
  });

  // Update counts
  catalogResultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`;
  
  if (filtered.length === 0) {
    catalogNoResults.classList.remove('d-none');
    productsContainer.classList.add('d-none');
  } else {
    catalogNoResults.classList.add('d-none');
    productsContainer.classList.remove('d-none');
    
    // Render individual cards
    filtered.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'product-card';
      
      // Stock Status text & dot
      let stockHtml = '';
      if (prod.quantity > 2) {
        stockHtml = `<span class="stock-status stock-available"><span class="stock-dot"></span> Disponível para retirada</span>`;
      } else if (prod.quantity > 0 && prod.quantity <= 2) {
        stockHtml = `<span class="stock-status stock-low"><span class="stock-dot"></span> Últimas unidades</span>`;
      } else {
        stockHtml = `<span class="stock-status stock-consult"><span class="stock-dot"></span> Sob consulta</span>`;
      }
      
      // Badges
      let badgeHtml = '';
      if (prod.promoPrice) {
        badgeHtml = `<span class="badge-capsule badge-orange-light product-badge-float">OFERTA</span>`;
      } else if (prod.condition === 'Seminovo') {
        badgeHtml = `<span class="badge-capsule badge-purple-light product-badge-float">SEMINOVO</span>`;
      }

      // Display Pricing
      let priceHtml = '';
      if (prod.promoPrice) {
        priceHtml = `
          <div class="product-old-price">R$ ${prod.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div class="product-price">R$ ${prod.promoPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        `;
      } else {
        priceHtml = `
          <div class="product-price" style="margin-top: 18px;">R$ ${prod.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        `;
      }

      // Card SVG Mock Image (dynamic color depending on product brand/condition)
      const colorMap = {
        'Apple': '#3C1239',
        'Samsung': '#1D4ED8',
        'Xiaomi': '#EA580C'
      };
      const svgColor = colorMap[prod.brand] || '#6B7280';
      const isAccessory = ['capas', 'peliculas', 'carregadores', 'acessorios'].includes(prod.category);
      const iconType = isAccessory ? 'package' : 'smartphone';

      card.innerHTML = `
        <div class="product-image-container">
          ${badgeHtml}
          <!-- CSS Mockup Image -->
          <div class="mockup-placeholder" style="color: ${svgColor}; display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <i data-lucide="${iconType}" style="width: 48px; height: 48px;"></i>
            <span style="font-size: 0.65rem; color: var(--text-secondary); font-weight: 700;">STORE IMPORTS</span>
          </div>
        </div>
        
        <span class="product-brand">${prod.brand}</span>
        <h3 class="product-name">${prod.name}</h3>
        
        <div class="product-meta-specs">
          ${prod.condition ? `<span class="badge-capsule badge-purple-light" style="font-size: 0.65rem; padding: 2px 8px;">${prod.condition}</span>` : ''}
          ${prod.selectedCapacity ? `<span>${prod.selectedCapacity}</span>` : ''}
          ${prod.selectedColor ? `<span>${prod.selectedColor}</span>` : ''}
        </div>
        
        <div class="product-price-wrapper">
          ${priceHtml}
        </div>
        
        ${stockHtml}
        
        <div class="product-actions">
          <button class="btn btn-secondary btn-sm btn-detail" data-id="${prod.id}">Ver detalhes</button>
          <button class="btn btn-primary btn-sm btn-select" data-id="${prod.id}" ${prod.quantity === 0 ? 'disabled' : ''}>
            ${prod.quantity === 0 ? 'Indisponível' : 'Selecionar'}
          </button>
        </div>
      `;
      
      // Detail click
      card.querySelector('.btn-detail').addEventListener('click', () => {
        showProductDetail(prod.id);
      });
      
      // Select click
      const btnSel = card.querySelector('.btn-select');
      if (btnSel) {
        btnSel.addEventListener('click', (e) => {
          e.stopPropagation();
          addToCart(prod.id);
        });
      }
      
      productsContainer.appendChild(card);
    });
  }
  
  lucide.createIcons();
}

// ==========================================
// PRODUCT DETAIL MODAL CONTROLLER
// ==========================================
function showProductDetail(productId) {
  const prod = state.products.find(p => p.id === productId);
  if (!prod) return;
  
  state.currentProductDetail = {
    ...prod,
    chosenColor: prod.colors && prod.colors.length > 0 ? prod.colors[0] : null,
    chosenCapacity: prod.capacities && prod.capacities.length > 0 ? prod.capacities[0] : null
  };
  
  const p = state.currentProductDetail;
  
  // Stock Tag HTML
  let stockTag = '';
  if (p.quantity > 2) {
    stockTag = `<span class="badge-capsule" style="background-color: var(--success-bg); color: var(--success);"><i data-lucide="check-circle" style="width: 14px; height: 14px;"></i> Disponível para retirada</span>`;
  } else if (p.quantity > 0 && p.quantity <= 2) {
    stockTag = `<span class="badge-capsule" style="background-color: var(--orange-light); color: var(--orange-primary);"><i data-lucide="alert-triangle" style="width: 14px; height: 14px;"></i> Últimas unidades</span>`;
  } else {
    stockTag = `<span class="badge-capsule" style="background-color: var(--purple-light); color: var(--purple-primary);"><i data-lucide="help-circle" style="width: 14px; height: 14px;"></i> Sob consulta</span>`;
  }
  
  // Price formatting
  let priceHtml = '';
  if (p.promoPrice) {
    priceHtml = `
      <div class="product-old-price" style="font-size: 0.9rem; margin-bottom: 2px;">R$ ${p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
      <div class="detail-price">R$ ${p.promoPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
    `;
  } else {
    priceHtml = `
      <div class="detail-price">R$ ${p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
    `;
  }

  // Variant choices html
  let colorChoices = '';
  if (p.colors && p.colors.length > 0) {
    colorChoices = `
      <div class="variant-selector">
        <span class="variant-label">Cor disponível:</span>
        <div class="variant-options">
          ${p.colors.map(col => `
            <button class="variant-btn ${p.chosenColor === col ? 'active' : ''}" data-type="color" data-value="${col}">${col}</button>
          `).join('')}
        </div>
      </div>
    `;
  }

  let capacityChoices = '';
  if (p.capacities && p.capacities.length > 0) {
    capacityChoices = `
      <div class="variant-selector">
        <span class="variant-label">Armazenamento disponível:</span>
        <div class="variant-options">
          ${p.capacities.map(cap => `
            <button class="variant-btn ${p.chosenCapacity === cap ? 'active' : ''}" data-type="capacity" data-value="${cap}">${cap}</button>
          `).join('')}
        </div>
      </div>
    `;
  }

  const isAccessory = ['capas', 'peliculas', 'carregadores', 'acessorios'].includes(p.category);
  const iconType = isAccessory ? 'package' : 'smartphone';

  productDetailModalBody.innerHTML = `
    <div class="product-detail-grid">
      <!-- Gallery Column -->
      <div class="product-detail-gallery">
        <div class="gallery-main-image">
          <div class="mock-main-svg" style="color: var(--purple-primary); display: flex; flex-direction: column; align-items: center; gap: 12px;">
            <i data-lucide="${iconType}" style="width: 80px; height: 80px;"></i>
            <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 700; letter-spacing: 1px;">STORE IMPORTS</span>
          </div>
        </div>
        <div class="detail-condition">
          <span class="badge-capsule badge-purple-light" style="font-weight: 700;">Condição: ${p.condition}</span>
          ${p.warranty ? `<span class="badge-capsule badge-orange-light" style="margin-left: 8px;">Garantia: ${p.warranty}</span>` : ''}
        </div>
      </div>

      <!-- Info Column -->
      <div class="product-detail-info">
        <div>
          <span class="detail-brand">${p.brand}</span>
          <h2 class="detail-name">${p.name}</h2>
          <span style="font-size: 0.75rem; color: var(--text-secondary);">Cód. Ref: ${p.internalCode}</span>
        </div>

        <div style="margin: 8px 0;">
          ${stockTag}
        </div>

        <div class="detail-price-box">
          ${priceHtml}
        </div>

        <!-- Variants -->
        ${colorChoices}
        ${capacityChoices}

        <div class="detail-reservation-warning">
          <i data-lucide="info" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i>
          Este produto está disponível para solicitação de reserva. A equipe confirmará o estoque antes da retirada.
        </div>

        <div class="detail-actions">
          <button class="btn btn-primary" id="btn-modal-add-selection" ${p.quantity === 0 ? 'disabled' : ''}>
            <i data-lucide="plus-circle"></i> Adicionar à seleção
          </button>
          <a href="https://wa.me/5500000000000" target="_blank" class="btn btn-secondary" id="btn-modal-talk-store">
            <i data-lucide="phone"></i> Falar com a loja
          </a>
        </div>
      </div>
    </div>

    <!-- Description & Specs Box -->
    <div class="product-detail-desc">
      <h4 class="detail-desc-title">Descrição do Produto</h4>
      <p class="detail-desc-text">${p.description}</p>
      
      ${p.boxContent ? `
        <h4 class="detail-desc-title" style="margin-top: 20px;">Conteúdo da Embalagem</h4>
        <p class="detail-desc-text" style="font-size: 0.85rem;"><i data-lucide="package-check" style="width: 14px; height: 14px; display: inline; vertical-align: middle; margin-right: 4px;"></i> ${p.boxContent}</p>
      ` : ''}
    </div>
  `;

  // Attach button variant handlers
  productDetailModalBody.querySelectorAll('.variant-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.target.getAttribute('data-type');
      const val = e.target.getAttribute('data-value');
      
      if (type === 'color') {
        state.currentProductDetail.chosenColor = val;
      } else {
        state.currentProductDetail.chosenCapacity = val;
      }
      
      // Update UI button active states
      productDetailModalBody.querySelectorAll(`.variant-btn[data-type="${type}"]`).forEach(b => {
        if (b.getAttribute('data-value') === val) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
    });
  });

  // Attach Add to selection handler
  document.getElementById('btn-modal-add-selection').addEventListener('click', () => {
    const p = state.currentProductDetail;
    addToCart(p.id, p.chosenColor, p.chosenCapacity);
    closeProductDetailModal();
  });

  openProductDetailModal();
  lucide.createIcons();
}

// ==========================================
// CART & SELECTION ENGINE
// ==========================================
function addToCart(productId, color = null, capacity = null) {
  const prod = state.products.find(p => p.id === productId);
  if (!prod) return;
  
  // Set default values if not specified
  const chosenColor = color || (prod.colors && prod.colors.length > 0 ? prod.colors[0] : null);
  const chosenCapacity = capacity || (prod.capacities && prod.capacities.length > 0 ? prod.capacities[0] : null);
  
  // Check if item with exact specs already in selection
  const existingIndex = state.cart.findIndex(item => 
    item.productId === productId && 
    item.color === chosenColor && 
    item.capacity === chosenCapacity
  );
  
  if (existingIndex > -1) {
    // Check stock limit
    if (state.cart[existingIndex].quantity < prod.quantity) {
      state.cart[existingIndex].quantity += 1;
      showToast('Quantidade atualizada na sua seleção.', 'success');
    } else {
      showToast(`Estoque limite atingido para este item (${prod.quantity} un).`, 'warning');
    }
  } else {
    state.cart.push({
      id: `cart-item-${Date.now()}`,
      productId: productId,
      name: prod.name,
      brand: prod.brand,
      price: prod.promoPrice !== null ? prod.promoPrice : prod.price,
      color: chosenColor,
      capacity: chosenCapacity,
      quantity: 1,
      maxQuantity: prod.quantity
    });
    showToast('Adicionado à sua seleção!', 'success');
  }
  
  saveCartToLocalStorage();
  renderCartDrawer();
  updateCartBadges();
}

function updateCartBadges() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadgeCount.textContent = totalItems;
  cartBadgeCountMobile.textContent = totalItems;
  
  if (totalItems > 0) {
    btnDrawerReserveSubmit.removeAttribute('disabled');
  } else {
    btnDrawerReserveSubmit.setAttribute('disabled', 'true');
  }
}

function renderCartDrawer() {
  cartItemsContainer.innerHTML = '';
  
  if (state.cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-state">
        <i data-lucide="shopping-bag" class="cart-empty-icon"></i>
        <h4 style="font-weight: 700; color: var(--purple-primary);">Sua seleção está vazia</h4>
        <p style="font-size: 0.85rem; max-width: 240px; margin: 0 auto;">Navegue pelos produtos e adicione os itens que deseja reservar.</p>
      </div>
    `;
    cartEstimatedTotal.textContent = 'R$ 0,00';
    lucide.createIcons();
    return;
  }
  
  let total = 0;
  
  state.cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    const card = document.createElement('div');
    card.className = 'cart-item';
    
    // Meta string colors/capacity
    let metaStr = '';
    if (item.color) metaStr += `Cor: ${item.color}`;
    if (item.capacity) metaStr += (metaStr ? ' | ' : '') + `Armazenamento: ${item.capacity}`;
    
    card.innerHTML = `
      <div class="cart-item-image">
        <i data-lucide="smartphone" style="width: 24px; height: 24px; color: var(--purple-primary);"></i>
      </div>
      <div class="cart-item-details">
        <h4 class="cart-item-name">${item.name}</h4>
        <span class="cart-item-meta">${metaStr}</span>
        <span class="cart-item-price">R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      </div>
      <div class="cart-item-actions">
        <button class="btn-remove-item" data-id="${item.id}" title="Remover item">
          <i data-lucide="trash-2"></i>
        </button>
        <div class="quantity-control">
          <button class="btn-qty btn-qty-minus" data-id="${item.id}">-</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="btn-qty btn-qty-plus" data-id="${item.id}">+</button>
        </div>
      </div>
    `;
    
    // Quantity handlers
    card.querySelector('.btn-qty-minus').addEventListener('click', () => {
      adjustCartItemQuantity(item.id, -1);
    });
    card.querySelector('.btn-qty-plus').addEventListener('click', () => {
      adjustCartItemQuantity(item.id, 1);
    });
    // Remove handler
    card.querySelector('.btn-remove-item').addEventListener('click', () => {
      removeCartItem(item.id);
    });
    
    cartItemsContainer.appendChild(card);
  });
  
  cartEstimatedTotal.textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  lucide.createIcons();
}

function adjustCartItemQuantity(itemId, amount) {
  const index = state.cart.findIndex(i => i.id === itemId);
  if (index === -1) return;
  
  const item = state.cart[index];
  const newQty = item.quantity + amount;
  
  if (newQty <= 0) {
    removeCartItem(itemId);
  } else if (newQty <= item.maxQuantity) {
    item.quantity = newQty;
    saveCartToLocalStorage();
    renderCartDrawer();
    updateCartBadges();
  } else {
    showToast(`Desculpe, estoque limite de ${item.maxQuantity} unidades atingido para este produto.`, 'warning');
  }
}

function removeCartItem(itemId) {
  state.cart = state.cart.filter(item => item.id !== itemId);
  saveCartToLocalStorage();
  renderCartDrawer();
  updateCartBadges();
  showToast('Item removido da seleção.', 'info');
}

function saveCartToLocalStorage() {
  localStorage.setItem('store_imports_cart', JSON.stringify(state.cart));
}

function loadCartFromLocalStorage() {
  const stored = localStorage.getItem('store_imports_cart');
  if (stored) {
    state.cart = JSON.parse(stored);
    renderCartDrawer();
    updateCartBadges();
  }
}

// ==========================================
// RESERVATION SUBMIT VIEW
// ==========================================
function renderReservationPreview() {
  reservationItemsPreviewList.innerHTML = '';
  
  let total = 0;
  state.cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    const div = document.createElement('div');
    div.className = 'preview-item';
    
    let specs = '';
    if (item.color) specs += `(${item.color})`;
    if (item.capacity) specs += (specs ? ' ' : '') + `(${item.capacity})`;
    
    div.innerHTML = `
      <span>${item.name} ${specs} <strong>x${item.quantity}</strong></span>
      <span>R$ ${itemTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
    `;
    
    reservationItemsPreviewList.appendChild(div);
  });
  
  reservationPreviewTotalValue.textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

// Auto format phone (XX) XXXXX-XXXX
function formatPhoneInput(e) {
  let val = e.target.value.replace(/\D/g, "");
  
  if (val.length > 0) {
    val = "(" + val;
  }
  if (val.length > 3) {
    val = val.slice(0, 3) + ") " + val.slice(3);
  }
  if (val.length > 10) {
    val = val.slice(0, 10) + "-" + val.slice(10, 14);
  }
  
  e.target.value = val.slice(0, 15);
}

function handleReservationFormSubmit(e) {
  e.preventDefault();
  
  const nome = document.getElementById('form-nome').value.trim();
  const whatsapp = document.getElementById('form-whatsapp').value.trim();
  const email = document.getElementById('form-email').value.trim();
  const contatoPref = document.getElementById('form-contato-pref').value;
  const dataRetirada = document.getElementById('form-data').value;
  const obs = document.getElementById('form-obs').value.trim();
  const consentimento = document.getElementById('form-consentimento').checked;
  
  // Reset errors
  document.querySelectorAll('.form-error-msg').forEach(el => el.classList.add('d-none'));
  
  let hasErrors = false;
  
  if (!nome) {
    document.getElementById('error-nome').classList.remove('d-none');
    hasErrors = true;
  }
  
  // Phone regex (XX) XXXXX-XXXX or similar formats
  const cleanPhone = whatsapp.replace(/\D/g, "");
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    document.getElementById('error-whatsapp').classList.remove('d-none');
    hasErrors = true;
  }
  
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('error-email').classList.remove('d-none');
    hasErrors = true;
  }
  
  if (!dataRetirada) {
    document.getElementById('error-data').classList.remove('d-none');
    hasErrors = true;
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosenDate = new Date(dataRetirada + "T00:00:00");
    if (chosenDate < today) {
      document.getElementById('error-data').textContent = "Selecione uma data futura para a retirada.";
      document.getElementById('error-data').classList.remove('d-none');
      hasErrors = true;
    }
  }
  
  if (!consentimento) {
    document.getElementById('error-consentimento').classList.remove('d-none');
    hasErrors = true;
  }
  
  if (hasErrors) {
    showToast('Corrija os campos obrigatórios.', 'danger');
    return;
  }
  
  // Generate random order code
  const code = `#SI-${Math.floor(1000 + Math.random() * 9000)}`;
  
  // Create reservation object
  const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const newReservation = {
    id: `res-${Date.now()}`,
    code: code,
    nome: nome,
    whatsapp: whatsapp,
    email: email,
    contatoPref: contatoPref,
    dataRetirada: formatDisplayDate(dataRetirada),
    rawDate: dataRetirada,
    obs: obs,
    status: 'Aguardando confirmação',
    createdAt: new Date().toLocaleString('pt-BR'),
    items: [...state.cart],
    total: total
  };
  
  // Save to localStorage under reservations database
  const stored = JSON.parse(localStorage.getItem('store_imports_reservations')) || [];
  stored.push(newReservation);
  localStorage.setItem('store_imports_reservations', JSON.stringify(stored));
  
  // Clear cart
  state.cart = [];
  saveCartToLocalStorage();
  renderCartDrawer();
  updateCartBadges();
  
  // Reset form inputs
  reservationSubmitForm.reset();
  
  // Go to success view
  window.location.hash = `#sucesso/${newReservation.code.slice(1)}`;
}

// ==========================================
// SUCCESS SCREEN ENGINE
// ==========================================
function renderSuccessScreen(codeNum) {
  const code = `#${codeNum}`;
  
  const reservations = JSON.parse(localStorage.getItem('store_imports_reservations')) || [];
  const res = reservations.find(r => r.code === code);
  
  if (!res) {
    // If not found, show dummy placeholders
    document.getElementById('success-code').textContent = code;
    document.getElementById('success-client-name').textContent = 'Erro ao carregar';
    document.getElementById('success-total-value').textContent = 'R$ 0,00';
    return;
  }
  
  document.getElementById('success-code').textContent = res.code;
  document.getElementById('success-client-name').textContent = res.nome;
  document.getElementById('success-client-whatsapp').textContent = res.whatsapp;
  document.getElementById('success-retrieval-date').textContent = res.dataRetirada;
  
  const totalItems = res.items.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('success-products-count').textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`;
  document.getElementById('success-total-value').textContent = `R$ ${res.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  
  // Status Badge Rendering
  const badge = document.getElementById('success-status-badge');
  badge.className = 'badge-status';
  
  let statusHtml = '';
  if (res.status === 'Aguardando confirmação') {
    badge.classList.add('badge-status-pending');
    statusHtml = `<i data-lucide="clock" style="width: 12px; height: 12px; display: inline;"></i> Aguardando confirmação`;
  } else if (res.status === 'Confirmada') {
    badge.classList.add('badge-status-confirmed');
    statusHtml = `<i data-lucide="check" style="width: 12px; height: 12px; display: inline;"></i> Confirmada`;
  } else if (res.status === 'Aguardando retirada') {
    badge.classList.add('badge-status-waiting');
    statusHtml = `<i data-lucide="store" style="width: 12px; height: 12px; display: inline;"></i> Aguardando retirada`;
  } else if (res.status === 'Finalizada') {
    badge.classList.add('badge-status-finished');
    statusHtml = `<i data-lucide="shopping-bag" style="width: 12px; height: 12px; display: inline;"></i> Finalizada`;
  } else {
    badge.classList.add('badge-status-cancelled');
    statusHtml = `<i data-lucide="x-circle" style="width: 12px; height: 12px; display: inline;"></i> Cancelada`;
  }
  badge.innerHTML = statusHtml;

  // Configure Whatsapp button link dynamically with custom reservation text!
  const wBtn = document.getElementById('btn-success-whatsapp');
  
  const itemsText = res.items.map(item => {
    let spec = '';
    if (item.color) spec += ` (${item.color})`;
    if (item.capacity) spec += ` (${item.capacity})`;
    return `- ${item.name}${spec} x${item.quantity}`;
  }).join('%0A');
  
  const textMsg = `Olá! Enviei uma solicitação de reserva no site da Store Imports.%0A%0A*Código:* ${res.code}%0A*Cliente:* ${res.nome}%0A*Itens:*%0A${itemsText}%0A%0A*Data Prevista de Retirada:* ${res.dataRetirada}%0A%0AAguardando confirmação! Obrigado.`;
  
  wBtn.href = `https://wa.me/5511999999999?text=${textMsg}`;
  
  lucide.createIcons();
}

// ==========================================
// HELPER UTILITIES
// ==========================================
function formatDisplayDate(dateStr) {
  // input is YYYY-MM-DD -> output DD/MM/YYYY
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Dynamic Toast Notifications
function showToast(message, type = 'info') {
  // Simple custom toast utilizing framer-motion-like CSS animations
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%) translateY(100px)';
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
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);
  
  // Animate out & remove
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(100px)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}
