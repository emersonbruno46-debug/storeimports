/**
 * Store Imports - Client Catalog Application Logic (V3)
 * Optimized for secure DOM rendering, clear demo feedback, and robust routing.
 */

// ==========================================
// STATE MANAGEMENT
// ==========================================
let state = {
  cart: [],
  demoMode: true,
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

const productionEmptyState = document.getElementById('production-empty-state');
const catalogActiveContent = document.getElementById('catalog-active-content');

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
  initData();
  setupRouting();
  setupEventListeners();
  loadCartFromLocalStorage();
  
  // Programmatically reset browser-cached filter checkboxes on initial clean load
  resetDOMFilterInputs();

  renderCategories();
  renderSidebarFilters();
  renderCatalogGrid();
  setupDemoContactButtons();
  
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

  // Cross-tab sync: refresh catalog if another tab updates products
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('store_imports_demo_v3_')) {
      initData();
      renderCategories();
      renderSidebarFilters();
      renderCatalogGrid();
    }
  });

  initScrollAnimations();
  if (window.lucide) lucide.createIcons();
});

function initCopyright() {
  const cEl = document.getElementById('copyright-text');
  if (cEl) {
    cEl.textContent = `© ${new Date().getFullYear()} ${DEMO_CONFIG.storeName}. Todos os direitos reservados.`;
  }
}

// Reset DOM checkboxes on page load to prevent browser cache filtering products prematurely
function resetDOMFilterInputs() {
  if (mainSearchInput) mainSearchInput.value = '';
  document.querySelectorAll('.filter-checkbox, input[type="radio"]').forEach(cb => {
    cb.checked = false;
  });
}

// Initialize products from shared data store
function initData() {
  const v3Products = getProducts() || [];
  state.products = v3Products.filter(p => p.status === 'active' && getActiveVariants(p).length > 0);
  
  if (productionEmptyState && catalogActiveContent) {
    productionEmptyState.classList.add('d-none');
    catalogActiveContent.classList.remove('d-none');
  }
}

// Setup Demo Notice for Fictitious Contacts
function setupDemoContactButtons() {
  const ctaButtons = [
    'top-bar-cta', 'header-whatsapp-cta', 'm-drawer-whatsapp',
    'btn-hero-contact', 'btn-empty-contact', 'footer-whatsapp-link'
  ];

  ctaButtons.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', handleDemoContactClick);
    }
  });
}

function handleDemoContactClick(e) {
  if (DEMO_CONFIG.isDemo && !DEMO_CONFIG.whatsapp) {
    e.preventDefault();
    showToast('AMBIENTE DEMONSTRATIVO: Nenhum contato real é enviado nesta versão sem backend ativado.', 'warning');
  }
}

// ==========================================
// ROUTING ENGINE
// ==========================================
function setupRouting() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash || '#home';
  
  closeMobileDrawer();
  closeCartDrawer();
  closeProductDetailModal();
  
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
  } else if (hash === '#assistencia') {
    navigateToView('home');
    scrollToSection('assistencia');
  } else if (hash === '#contato') {
    navigateToView('home');
    scrollToSection('contato');
  } else if (hash === '#selecao') {
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
    navigateToView('home');
  }
  
  updateActiveMenuLinks(hash);
}

function navigateToView(viewName) {
  state.activeView = viewName;
  
  const views = {
    home: viewHome,
    reserva: viewReserva,
    sucesso: viewSucesso
  };
  
  Object.keys(views).forEach(key => {
    if (views[key]) {
      if (key === viewName) {
        views[key].classList.remove('d-none');
      } else {
        views[key].classList.add('d-none');
      }
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
  const links = ['home', 'catalogo', 'categorias', 'como-funciona', 'assistencia', 'diferenciais', 'contato'];
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

  // Floating Bottom NavBar (BottomNavBar component)
  const fItems = {
    '#home': 'f-nav-home',
    '#catalogo': 'f-nav-catalogo',
    '#categorias': 'f-nav-categorias',
    '#assistencia': 'f-nav-assistencia',
    '#selecao': 'f-nav-cart'
  };

  const activeHash = hash || '#home';
  Object.keys(fItems).forEach(key => {
    const item = document.getElementById(fItems[key]);
    if (item) {
      if (activeHash === key || (key === '#home' && activeHash === '#home')) {
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
  if (btnHamburger) btnHamburger.addEventListener('click', openMobileDrawer);
  if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeMobileDrawer);
  if (mobileDrawerOverlay) {
    mobileDrawerOverlay.addEventListener('click', (e) => {
      if (e.target === mobileDrawerOverlay) closeMobileDrawer();
    });
  }
  
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileDrawer);
  });
  
  const cartTrigger = document.getElementById('btn-cart-trigger');
  if (cartTrigger) cartTrigger.addEventListener('click', openCartDrawer);
  
  const bNavCart = document.getElementById('b-nav-cart');
  if (bNavCart) {
    bNavCart.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  }

  const fNavCart = document.getElementById('f-nav-cart');
  if (fNavCart) {
    fNavCart.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  }
  
  const btnCloseCart = document.getElementById('btn-close-cart-drawer');
  if (btnCloseCart) btnCloseCart.addEventListener('click', closeCartDrawer);
  
  if (cartDrawerOverlay) {
    cartDrawerOverlay.addEventListener('click', (e) => {
      if (e.target === cartDrawerOverlay) closeCartDrawer();
    });
  }
  
  if (btnMainSearch) btnMainSearch.addEventListener('click', () => {
    handleSearchSubmit();
    const dropdown = document.getElementById('search-autocomplete-dropdown');
    if (dropdown) dropdown.classList.add('d-none');
  });
  if (mainSearchInput) {
    mainSearchInput.addEventListener('input', (e) => {
      const q = e.target.value;
      state.filters.search = q.trim();
      renderCatalogGrid();
      renderSearchAutocomplete(q);
    });
    mainSearchInput.addEventListener('focus', (e) => {
      if (e.target.value.trim()) {
        renderSearchAutocomplete(e.target.value);
      }
    });
    mainSearchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        const dropdown = document.getElementById('search-autocomplete-dropdown');
        if (dropdown) dropdown.classList.add('d-none');
      } else {
        const q = e.target.value;
        state.filters.search = q.trim();
        renderCatalogGrid();
        renderSearchAutocomplete(q);
      }
    });
  }

  // Close search suggestions dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('search-autocomplete-dropdown');
    const container = document.querySelector('.search-input-container');
    if (dropdown && container && !container.contains(e.target)) {
      dropdown.classList.add('d-none');
    }
  });
  
  const btnCloseModal = document.getElementById('btn-close-product-modal');
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeProductDetailModal);
  if (productDetailModalOverlay) {
    productDetailModalOverlay.addEventListener('click', (e) => {
      if (e.target === productDetailModalOverlay) closeProductDetailModal();
    });
  }
  
  const btnClear1 = document.getElementById('btn-clear-filters');
  if (btnClear1) btnClear1.addEventListener('click', clearAllFilters);
  const btnClear2 = document.getElementById('btn-clear-filters-empty');
  if (btnClear2) btnClear2.addEventListener('click', clearAllFilters);
  
  if (btnDrawerReserveSubmit) {
    btnDrawerReserveSubmit.addEventListener('click', () => {
      window.location.hash = '#selecao';
    });
  }
  
  const btnBackCart = document.getElementById('btn-back-to-cart');
  if (btnBackCart) {
    btnBackCart.addEventListener('click', () => {
      window.location.hash = '#catalogo';
      openCartDrawer();
    });
  }
  
  if (sortSelectInput) {
    sortSelectInput.addEventListener('change', (e) => {
      state.sorting = e.target.value;
      renderCatalogGrid();
    });
  }
  
  if (formWhatsapp) formWhatsapp.addEventListener('input', formatPhoneInput);
  if (reservationSubmitForm) reservationSubmitForm.addEventListener('submit', handleReservationFormSubmit);

  const btnSearchTrig = document.getElementById('btn-search-trigger');
  if (btnSearchTrig) {
    btnSearchTrig.addEventListener('click', () => {
      window.location.hash = '#catalogo';
      setTimeout(() => {
        if (mainSearchInput) mainSearchInput.focus();
      }, 200);
    });
  }

  const btnDemoEmpty = document.getElementById('btn-activate-demo-empty');
  if (btnDemoEmpty) {
    btnDemoEmpty.addEventListener('click', () => {
      initData();
      renderCatalogGrid();
      showToast('Modo demonstração ativado com dados locais.', 'success');
    });
  }
}

function openMobileDrawer() { if (mobileDrawerOverlay) mobileDrawerOverlay.classList.add('active'); }
function closeMobileDrawer() { if (mobileDrawerOverlay) mobileDrawerOverlay.classList.remove('active'); }
function openCartDrawer() { if (cartDrawerOverlay) cartDrawerOverlay.classList.add('active'); }
function closeCartDrawer() { if (cartDrawerOverlay) cartDrawerOverlay.classList.remove('active'); }
function openProductDetailModal() { if (productDetailModalOverlay) productDetailModalOverlay.classList.add('active'); }
function closeProductDetailModal() { if (productDetailModalOverlay) productDetailModalOverlay.classList.remove('active'); }

// ==========================================
// CATEGORIES & FILTERS RENDERING
// ==========================================
function renderCategories() {
  if (!categoriesContainer) return;
  categoriesContainer.innerHTML = '';
  
  const cats = getCategories() || [];
  cats.forEach(rawCat => {
    const catSlug = rawCat.id.replace('cat-', '');
    const card = document.createElement('div');
    card.className = `category-card ${state.filters.category === catSlug ? 'active' : ''} scroll-animate`;
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Categoria ${rawCat.name}`);
    
    card.innerHTML = `
      <div class="category-card-img-wrapper">
        <img src="./assets/${rawCat.image}" class="category-card-img" alt="${rawCat.name}" loading="lazy">
      </div>
      <span class="category-card-name"><i data-lucide="arrow-right" class="category-card-arrow" style="width: 14px; height: 14px;"></i></span>
    `;
    card.querySelector('.category-card-name').prepend(document.createTextNode(rawCat.name + ' '));

    const toggleCat = () => {
      if (state.filters.category === catSlug) {
        state.filters.category = '';
      } else {
        state.filters.category = catSlug;
      }
      window.location.hash = '#catalogo';
      renderCategories();
      renderSidebarFilters();
      renderCatalogGrid();
    };

    card.addEventListener('click', toggleCat);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCat();
      }
    });
    
    categoriesContainer.appendChild(card);
  });
  
  if (typeof initScrollAnimations === 'function') {
    initScrollAnimations();
  }
  if (window.lucide) lucide.createIcons();
}

function renderSidebarFilters() {
  if (!filterCategoriesList) return;
  filterCategoriesList.innerHTML = '';
  
  const cats = getCategories() || [];
  cats.forEach(rawCat => {
    const catSlug = rawCat.id.replace('cat-', '');
    const totalInCat = state.products.filter(p => p.categoryId === rawCat.id).length;
    if (totalInCat === 0) return;
    
    const label = document.createElement('label');
    label.className = 'filter-option-checkbox';
    
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'filter-cat';
    radio.value = catSlug;
    if (state.filters.category === catSlug) radio.checked = true;
    
    const textSpan = document.createElement('span');
    textSpan.appendChild(radio);
    textSpan.appendChild(document.createTextNode(` ${rawCat.name}`));
    
    const countSpan = document.createElement('span');
    countSpan.className = 'filter-count';
    countSpan.textContent = totalInCat;
    
    label.appendChild(textSpan);
    label.appendChild(countSpan);
    
    radio.addEventListener('change', (e) => {
      state.filters.category = e.target.value;
      renderCategories();
      renderCatalogGrid();
    });
    
    filterCategoriesList.appendChild(label);
  });

  if (!filterBrandsList) return;
  filterBrandsList.innerHTML = '';
  
  const brands = [...new Set(state.products.map(p => p.brand))].filter(Boolean);
  
  if (brands.length === 0) {
    filterBrandsList.innerHTML = '<span class="text-muted" style="font-size: 0.8rem;">Sem marcas</span>';
  } else {
    brands.forEach(brand => {
      const totalInBrand = state.products.filter(p => p.brand === brand).length;
      
      const label = document.createElement('label');
      label.className = 'filter-option-checkbox';
      const isChecked = state.filters.brands.includes(brand);
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = 'filter-brand';
      checkbox.value = brand;
      if (isChecked) checkbox.checked = true;
      
      const textSpan = document.createElement('span');
      textSpan.appendChild(checkbox);
      textSpan.appendChild(document.createTextNode(` ${brand}`));
      
      const countSpan = document.createElement('span');
      countSpan.className = 'filter-count';
      countSpan.textContent = totalInBrand;
      
      label.appendChild(textSpan);
      label.appendChild(countSpan);
      
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          state.filters.brands.push(brand);
        } else {
          state.filters.brands = state.filters.brands.filter(b => b !== brand);
        }
        renderCatalogGrid();
      });
      
      filterBrandsList.appendChild(label);
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
  
  if (mainSearchInput) mainSearchInput.value = '';
  resetDOMFilterInputs();
  
  renderCategories();
  renderSidebarFilters();
  renderCatalogGrid();
  
  showToast('Filtros limpos.', 'info');
}

// ==========================================
// AUTOCOMPLETE SEARCH SUGGESTIONS & GRID RENDER
// ==========================================
function renderSearchAutocomplete(query) {
  const dropdown = document.getElementById('search-autocomplete-dropdown');
  if (!dropdown) return;

  const q = query ? query.toLowerCase().trim() : '';
  if (!q) {
    dropdown.classList.add('d-none');
    dropdown.innerHTML = '';
    return;
  }

  // Filter active products whose name, brand or model contains the typed word
  const allProds = getProducts() || [];
  const activeProds = allProds.filter(p => p.status === 'active' && getActiveVariants(p).length > 0);
  
  const matches = activeProds.filter(p => {
    const nameStr = (p.name || '').toLowerCase();
    const brandStr = (p.brand || '').toLowerCase();
    const modelStr = (p.model || '').toLowerCase();
    return nameStr.includes(q) || brandStr.includes(q) || modelStr.includes(q);
  }).slice(0, 8); // Display max 8 matching suggestions

  dropdown.innerHTML = '';

  if (matches.length === 0) {
    dropdown.innerHTML = `
      <div class="search-autocomplete-empty">
        <i data-lucide="search-x" style="width: 20px; height: 20px; margin-bottom: 4px; display: inline-block;"></i>
        <div>Nenhum produto encontrado com o nome "<strong>${escapeHtml(query)}</strong>"</div>
      </div>
    `;
    dropdown.classList.remove('d-none');
    if (window.lucide) lucide.createIcons();
    return;
  }

  const header = document.createElement('div');
  header.className = 'search-autocomplete-header';
  header.textContent = `Produtos com "${query}" (${matches.length})`;
  dropdown.appendChild(header);

  matches.forEach(prod => {
    const primaryVariant = getPrimaryVariant(prod);
    const displayPriceCents = getProductDisplayPriceCents(prod);
    const primaryImg = (prod.images || []).find(i => i.isPrimary) || (prod.images || [])[0];
    const imgSrc = primaryImg ? primaryImg.src : null;

    const itemEl = document.createElement('div');
    itemEl.className = 'search-autocomplete-item';

    const colorMap = { 'Apple': '#3C1239', 'Samsung': '#1D4ED8', 'Xiaomi': '#EA580C' };
    const svgColor = colorMap[prod.brand] || '#6B7280';
    const iconType = ['cat-acessorios'].includes(prod.categoryId) ? 'package' : 'smartphone';

    const imgMarkup = imgSrc
      ? `<img src="${imgSrc}" class="search-autocomplete-img" alt="${escapeHtml(prod.name)}">`
      : `<div class="search-autocomplete-img flex-center" style="background: var(--bg-secondary);"><i data-lucide="${iconType}" style="width: 22px; height: 22px; color: ${svgColor};"></i></div>`;

    const highlightedName = highlightQueryText(prod.name, q);

    itemEl.innerHTML = `
      ${imgMarkup}
      <div class="search-autocomplete-info">
        <div class="search-autocomplete-name">${highlightedName}</div>
        <div class="search-autocomplete-meta">
          <span>${escapeHtml(prod.brand)}</span>
          ${prod.model ? `• <span>${escapeHtml(prod.model)}</span>` : ''}
        </div>
      </div>
      <div class="search-autocomplete-price">${formatBRLFromCents(displayPriceCents)}</div>
    `;

    itemEl.addEventListener('click', () => {
      if (mainSearchInput) mainSearchInput.value = prod.name;
      state.filters.search = prod.name;
      dropdown.classList.add('d-none');
      window.location.hash = '#catalogo';
      renderCatalogGrid();
      showProductDetail(prod.id);
    });

    dropdown.appendChild(itemEl);
  });

  dropdown.classList.remove('d-none');
  if (window.lucide) lucide.createIcons();
}

function highlightQueryText(text, query) {
  if (!text || !query) return escapeHtml(text || '');
  const escapedText = escapeHtml(text);
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return escapedText.replace(regex, '<mark>$1</mark>');
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function handleSearchSubmit() {
  const query = mainSearchInput ? mainSearchInput.value.trim() : '';
  state.filters.search = query;
  
  const dropdown = document.getElementById('search-autocomplete-dropdown');
  if (dropdown) dropdown.classList.add('d-none');

  window.location.hash = '#catalogo';
  renderCatalogGrid();
}

function renderCatalogGrid() {
  initData();
  if (!productsContainer) return;
  productsContainer.innerHTML = '';
  
  // Read additional filters from Sidebar DOM inputs if checked
  const conditionCheckboxes = document.querySelectorAll('input[name="condition"]:checked');
  state.filters.conditions = Array.from(conditionCheckboxes).map(c => c.value);
  
  const availabilityCheckboxes = document.querySelectorAll('input[name="availability"]:checked');
  state.filters.availabilities = Array.from(availabilityCheckboxes).map(c => c.value);
  
  const allCats = getCategories() || [];

  // Filter products
  let filtered = state.products.filter(prod => {
    // 1. Search Query Match
    if (state.filters.search) {
      const q = state.filters.search.toLowerCase();
      const matchName = (prod.name || '').toLowerCase().includes(q);
      const matchBrand = (prod.brand || '').toLowerCase().includes(q);
      const matchModel = (prod.model || '').toLowerCase().includes(q);
      const matchDesc = (prod.shortDescription || '').toLowerCase().includes(q);
      const matchCode = (prod.sku || '').toLowerCase().includes(q);
      const catObj = allCats.find(c => c.id === prod.categoryId);
      const matchCat = catObj && (catObj.name || '').toLowerCase().includes(q);
      
      if (!matchName && !matchBrand && !matchModel && !matchDesc && !matchCode && !matchCat) {
        return false;
      }
    }
    
    // 2. Category Match
    if (state.filters.category) {
      const catSlug = (prod.categoryId || '').replace('cat-', '');
      if (catSlug !== state.filters.category) return false;
    }
    
    // 3. Brand Match
    if (state.filters.brands.length > 0 && !state.filters.brands.includes(prod.brand)) {
      return false;
    }
    
    // 4. Condition Match
    const condLabel = prod.condition === 'new' ? 'Novo' : 'Seminovo';
    if (state.filters.conditions.length > 0 && !state.filters.conditions.includes(condLabel)) {
      return false;
    }
    
    // 5. Availability Match
    if (state.filters.availabilities.length > 0) {
      const totalStock = getProductTotalStock(prod);
      const isAvail = totalStock > 2;
      const isLow = totalStock > 0 && totalStock <= 2;
      const isConsult = totalStock === 0;
      
      let pass = false;
      if ((state.filters.availabilities.includes('Disponível') || state.filters.availabilities.includes('disponivel')) && isAvail) pass = true;
      if ((state.filters.availabilities.includes('Poucas unidades') || state.filters.availabilities.includes('Últimas unidades')) && isLow) pass = true;
      if ((state.filters.availabilities.includes('Consultar') || state.filters.availabilities.includes('Sob consulta')) && isConsult) pass = true;
      
      if (!pass) return false;
    }
    
    return true;
  });
  
  // Sort results
  filtered.sort((a, b) => {
    const priceA = getProductDisplayPriceCents(a);
    const priceB = getProductDisplayPriceCents(b);
    
    if (state.sorting === 'preco-crescente') {
      return priceA - priceB;
    } else if (state.sorting === 'preco-decrescente') {
      return priceB - priceA;
    } else {
      return a.id.localeCompare(b.id);
    }
  });

  // Update counts
  if (catalogResultsCount) {
    catalogResultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`;
  }
  
  if (filtered.length === 0) {
    if (catalogNoResults) catalogNoResults.classList.remove('d-none');
    productsContainer.classList.add('d-none');
  } else {
    if (catalogNoResults) catalogNoResults.classList.add('d-none');
    productsContainer.classList.remove('d-none');
    
    // Render product cards
    filtered.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const totalStock = getProductTotalStock(prod);
      const primaryVariant = getPrimaryVariant(prod);
      const displayPriceCents = getProductDisplayPriceCents(prod);
      const hasPromo = primaryVariant && primaryVariant.promotionalPriceCents !== null && primaryVariant.promotionalPriceCents !== undefined;

      // Stock Status Badge
      let stockHtml = '';
      if (totalStock > 2) {
        stockHtml = `<span class="stock-status stock-available"><span class="stock-dot"></span> Disponível para retirada</span>`;
      } else if (totalStock > 0) {
        stockHtml = `<span class="stock-status stock-low"><span class="stock-dot"></span> Últimas unidades (${totalStock})</span>`;
      } else {
        stockHtml = `<span class="stock-status stock-consult"><span class="stock-dot"></span> Sob consulta</span>`;
      }
      
      // Floating Badges
      let badgeHtml = '';
      if (hasPromo) {
        badgeHtml = `<span class="badge-capsule badge-orange-light product-badge-float">OFERTA</span>`;
      } else if (prod.condition === 'used_demo') {
        badgeHtml = `<span class="badge-capsule badge-purple-light product-badge-float">SEMINOVO</span>`;
      }

      // Display Pricing
      let priceHtml = '';
      if (hasPromo && primaryVariant) {
        priceHtml = `
          <div class="product-old-price">${formatBRLFromCents(primaryVariant.priceCents)}</div>
          <div class="product-price">${formatBRLFromCents(primaryVariant.promotionalPriceCents)}</div>
        `;
      } else {
        priceHtml = `<div class="product-price" style="margin-top: 18px;">${formatBRLFromCents(displayPriceCents)}</div>`;
      }

      // Image or icon fallback
      const primaryImg = (prod.images || []).find(i => i.isPrimary) || (prod.images || [])[0];
      const colorMap = { 'Apple': '#3C1239', 'Samsung': '#1D4ED8', 'Xiaomi': '#EA580C' };
      const svgColor = prod.mockupStyle?.color || colorMap[prod.brand] || '#6B7280';
      const iconType = prod.mockupStyle?.icon || (['cat-acessorios'].includes(prod.categoryId) ? 'package' : 'smartphone');

      const imgSrc = primaryImg ? primaryImg.src : null;
      const imgHtml = imgSrc
        ? `<img src="${imgSrc}" alt="${prod.name}" loading="lazy" style="max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 8px;">`
        : `<i data-lucide="${iconType}" style="width: 48px; height: 48px; color: ${svgColor};"></i><span style="font-size: 0.65rem; color: var(--text-secondary); font-weight: 700;">STORE IMPORTS</span>`;

      const condLabel = prod.condition === 'new' ? 'Novo' : 'Seminovo';
      const pVar = primaryVariant;

      card.innerHTML = `
        <div class="product-image-container">
          ${badgeHtml}
          <div class="mockup-placeholder" style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
            ${imgHtml}
          </div>
        </div>
        <span class="product-brand"></span>
        <h3 class="product-name"></h3>
        <div class="product-meta-specs">
          <span class="badge-capsule badge-purple-light" style="font-size: 0.65rem; padding: 2px 8px;"></span>
          ${pVar && pVar.capacity ? `<span>${pVar.capacity}</span>` : ''}
          ${pVar && pVar.color ? `<span>${pVar.color}</span>` : ''}
        </div>
        <div class="product-price-wrapper">${priceHtml}</div>
        ${stockHtml}
        <div class="product-actions">
          <button class="btn btn-secondary btn-sm btn-detail">Ver detalhes</button>
          <button class="btn btn-primary btn-sm btn-select" ${totalStock === 0 ? 'disabled' : ''}>
            ${totalStock === 0 ? 'Indisponível' : 'Selecionar'}
          </button>
        </div>
      `;
      // XSS Safe Text
      card.querySelector('.product-brand').textContent = prod.brand;
      card.querySelector('.product-name').textContent = prod.name;
      card.querySelector('.product-meta-specs .badge-capsule').textContent = condLabel;
      
      card.querySelector('.btn-detail').addEventListener('click', () => {
        showProductDetail(prod.id);
      });
      
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
  
  if (window.lucide) lucide.createIcons();
}

// ==========================================
// PRODUCT DETAIL MODAL CONTROLLER
// ==========================================
function showProductDetail(productId) {
  const prod = getProductById(productId);
  if (!prod) return;
  
  const activeVars = getActiveVariants(prod);
  const primaryVariant = getPrimaryVariant(prod);
  const totalStock = getProductTotalStock(prod);
  const hasPromo = primaryVariant && primaryVariant.promotionalPriceCents !== null && primaryVariant.promotionalPriceCents !== undefined;

  state.currentProductDetail = {
    ...prod,
    chosenVariantId: primaryVariant ? primaryVariant.id : null
  };
  
  let stockTag = '';
  if (totalStock > 2) {
    stockTag = `<span class="badge-capsule" style="background-color: var(--success-bg); color: var(--success);"><i data-lucide="check-circle" style="width: 14px; height: 14px;"></i> Disponível para retirada</span>`;
  } else if (totalStock > 0) {
    stockTag = `<span class="badge-capsule" style="background-color: var(--orange-light); color: var(--orange-primary);"><i data-lucide="alert-triangle" style="width: 14px; height: 14px;"></i> Últimas unidades (${totalStock})</span>`;
  } else {
    stockTag = `<span class="badge-capsule" style="background-color: var(--purple-light); color: var(--purple-primary);"><i data-lucide="help-circle" style="width: 14px; height: 14px;"></i> Sob consulta</span>`;
  }
  
  let priceHtml = '';
  if (hasPromo && primaryVariant) {
    priceHtml = `
      <div class="product-old-price" style="font-size: 0.9rem; margin-bottom: 2px;">${formatBRLFromCents(primaryVariant.priceCents)}</div>
      <div class="detail-price">${formatBRLFromCents(primaryVariant.promotionalPriceCents)}</div>
    `;
  } else {
    priceHtml = `<div class="detail-price">${formatBRLFromCents(primaryVariant ? primaryVariant.priceCents : 0)}</div>`;
  }

  const colors = [...new Set(activeVars.map(v => v.color).filter(Boolean))];
  const capacities = [...new Set(activeVars.map(v => v.capacity).filter(Boolean))];
  
  let colorChoices = '';
  if (colors.length > 0) {
    colorChoices = `
      <div class="variant-selector">
        <span class="variant-label">Cor disponível:</span>
        <div class="variant-options" id="detail-color-options">
          ${colors.map(col => `<button class="variant-btn ${primaryVariant && primaryVariant.color === col ? 'active' : ''}" data-type="color" data-value="${col}"></button>`).join('')}
        </div>
      </div>
    `;
  }

  let capacityChoices = '';
  if (capacities.length > 0) {
    capacityChoices = `
      <div class="variant-selector">
        <span class="variant-label">Armazenamento disponível:</span>
        <div class="variant-options" id="detail-cap-options">
          ${capacities.map(cap => `<button class="variant-btn ${primaryVariant && primaryVariant.capacity === cap ? 'active' : ''}" data-type="capacity" data-value="${cap}"></button>`).join('')}
        </div>
      </div>
    `;
  }

  const primaryImg = (prod.images || []).find(i => i.isPrimary) || (prod.images || [])[0];
  const imgSrc = primaryImg ? primaryImg.src : null;
  const colorMap = { 'Apple': '#3C1239', 'Samsung': '#1D4ED8', 'Xiaomi': '#EA580C' };
  const svgColor = colorMap[prod.brand] || '#6B7280';
  const iconType = ['cat-acessorios'].includes(prod.categoryId) ? 'package' : 'smartphone';
  const imgHtml = imgSrc
    ? `<img src="${imgSrc}" alt="${prod.name}" style="max-width: 85%; max-height: 220px; object-fit: contain;">`
    : `<i data-lucide="${iconType}" style="width: 80px; height: 80px; color: ${svgColor};"></i><span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 700; letter-spacing: 1px;">STORE IMPORTS</span>`;
  
  const condLabel = prod.condition === 'new' ? 'Novo' : 'Seminovo';

  productDetailModalBody.innerHTML = `
    <div class="product-detail-grid">
      <div class="product-detail-gallery">
        <div class="gallery-main-image">
          <div class="mock-main-svg" style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
            ${imgHtml}
          </div>
        </div>
        <div class="detail-condition">
          <span class="badge-capsule badge-purple-light" id="detail-condition-badge" style="font-weight: 700;"></span>
        </div>
      </div>

      <div class="product-detail-info">
        <div>
          <span class="detail-brand" id="detail-brand-text"></span>
          <h2 class="detail-name" id="detail-name-text"></h2>
          <span style="font-size: 0.75rem; color: var(--text-secondary);">SKU: ${prod.sku || 'N/A'}</span>
        </div>

        <div style="margin: 8px 0;">${stockTag}</div>

        <div class="detail-price-box">${priceHtml}</div>

        ${colorChoices}
        ${capacityChoices}

        <div class="detail-reservation-warning">
          <i data-lucide="info" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i>
          Este produto está disponível para solicitação de reserva. A equipe confirmará o estoque antes da retirada.
        </div>

        <div class="detail-actions">
          <button class="btn btn-primary" id="btn-modal-add-selection" ${totalStock === 0 ? 'disabled' : ''}>
            <i data-lucide="plus-circle"></i> Adicionar à seleção
          </button>
          <button class="btn btn-secondary" id="btn-modal-talk-store">
            <i data-lucide="phone"></i> Falar com a loja
          </button>
        </div>
      </div>
    </div>

    <div class="product-detail-desc">
      <h4 class="detail-desc-title">Descrição do Produto</h4>
      <p class="detail-desc-text" id="detail-desc-text"></p>
    </div>
  `;
  
  // Safe DOM values
  productDetailModalBody.querySelector('#detail-brand-text').textContent = prod.brand;
  productDetailModalBody.querySelector('#detail-name-text').textContent = prod.name;
  productDetailModalBody.querySelector('#detail-condition-badge').textContent = `Condição: ${condLabel}`;
  productDetailModalBody.querySelector('#detail-desc-text').textContent = prod.shortDescription || '';
  
  if (colors.length > 0) {
    productDetailModalBody.querySelectorAll('#detail-color-options .variant-btn').forEach((btn, idx) => {
      btn.textContent = colors[idx];
    });
  }
  if (capacities.length > 0) {
    productDetailModalBody.querySelectorAll('#detail-cap-options .variant-btn').forEach((btn, idx) => {
      btn.textContent = capacities[idx];
    });
  }

  productDetailModalBody.querySelectorAll('.variant-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.target.getAttribute('data-type');
      const val = e.target.getAttribute('data-value');
      
      productDetailModalBody.querySelectorAll(`.variant-btn[data-type="${type}"]`).forEach(b => {
        if (b.getAttribute('data-value') === val) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      
      const p = state.currentProductDetail;
      const matched = getActiveVariants(p).find(v => {
        if (type === 'color') return v.color === val;
        return v.capacity === val;
      });
      if (matched) state.currentProductDetail.chosenVariantId = matched.id;
    });
  });

  document.getElementById('btn-modal-add-selection').addEventListener('click', () => {
    const p = state.currentProductDetail;
    const variantId = p.chosenVariantId;
    addToCart(p.id, variantId);
    closeProductDetailModal();
  });

  const talkBtn = document.getElementById('btn-modal-talk-store');
  if (talkBtn) {
    talkBtn.addEventListener('click', (e) => {
      handleDemoContactClick(e);
    });
  }

  openProductDetailModal();
  if (window.lucide) lucide.createIcons();
}

// ==========================================
// CART & SELECTION ENGINE
// ==========================================
function addToCart(productId, variantId = null) {
  const prod = getProductById(productId);
  if (!prod) return;

  const activeVars = getActiveVariants(prod);
  if (activeVars.length === 0) { showToast('Produto sem variações ativas.', 'warning'); return; }

  const chosenVariant = variantId ? activeVars.find(v => v.id === variantId) : activeVars[0];
  const variant = chosenVariant || activeVars[0];
  
  if (variant.stockQuantity <= 0) {
    showToast('Produto fora de estoque.', 'warning');
    return;
  }

  const existingIndex = state.cart.findIndex(item => 
    item.productId === productId && item.variantId === variant.id
  );
  
  if (existingIndex > -1) {
    if (state.cart[existingIndex].quantity < variant.stockQuantity) {
      state.cart[existingIndex].quantity += 1;
      showToast('Quantidade atualizada na sua seleção.', 'success');
    } else {
      showToast(`Estoque limite atingido para este item (${variant.stockQuantity} un).`, 'warning');
    }
  } else {
    const priceCents = (variant.promotionalPriceCents !== null && variant.promotionalPriceCents !== undefined) ? variant.promotionalPriceCents : variant.priceCents;
    state.cart.push({
      id: `cart-item-${Date.now()}`,
      productId: productId,
      variantId: variant.id,
      name: prod.name,
      brand: prod.brand,
      priceCents: priceCents,
      color: variant.color,
      capacity: variant.capacity,
      quantity: 1,
      maxQuantity: variant.stockQuantity
    });
    showToast('Adicionado à sua seleção!', 'success');
  }
  
  saveCartToLocalStorage();
  renderCartDrawer();
  updateCartBadges();
}

function updateCartBadges() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartBadgeCount) cartBadgeCount.textContent = totalItems;
  if (cartBadgeCountMobile) cartBadgeCountMobile.textContent = totalItems;
  
  const cartBadgeFloating = document.getElementById('cart-badge-count-floating');
  if (cartBadgeFloating) {
    cartBadgeFloating.textContent = totalItems;
    if (totalItems > 0) {
      cartBadgeFloating.classList.remove('d-none');
    } else {
      cartBadgeFloating.classList.add('d-none');
    }
  }

  if (btnDrawerReserveSubmit) {
    if (totalItems > 0) {
      btnDrawerReserveSubmit.removeAttribute('disabled');
    } else {
      btnDrawerReserveSubmit.setAttribute('disabled', 'true');
    }
  }
}

function renderCartDrawer() {
  if (!cartItemsContainer) return;
  cartItemsContainer.innerHTML = '';
  
  if (state.cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-state">
        <i data-lucide="shopping-bag" class="cart-empty-icon"></i>
        <h4 style="font-weight: 700; color: var(--purple-primary);">Sua seleção está vazia</h4>
        <p style="font-size: 0.85rem; max-width: 240px; margin: 0 auto;">Navegue pelos produtos e adicione os itens que deseja reservar.</p>
      </div>
    `;
    if (cartEstimatedTotal) cartEstimatedTotal.textContent = 'R$ 0,00';
    if (window.lucide) lucide.createIcons();
    return;
  }
  
  let totalCents = 0;
  
  state.cart.forEach(item => {
    const itemTotalCents = (item.priceCents || 0) * item.quantity;
    totalCents += itemTotalCents;
    
    const card = document.createElement('div');
    card.className = 'cart-item';
    
    let metaStr = '';
    if (item.color) metaStr += `Cor: ${item.color}`;
    if (item.capacity) metaStr += (metaStr ? ' | ' : '') + `Arm.: ${item.capacity}`;
    
    card.innerHTML = `
      <div class="cart-item-image">
        <i data-lucide="smartphone" style="width: 24px; height: 24px; color: var(--purple-primary);"></i>
      </div>
      <div class="cart-item-details">
        <h4 class="cart-item-name"></h4>
        <span class="cart-item-meta"></span>
        <span class="cart-item-price">${formatBRLFromCents(item.priceCents)}</span>
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
    card.querySelector('.cart-item-name').textContent = item.name;
    card.querySelector('.cart-item-meta').textContent = metaStr;
    
    card.querySelector('.btn-qty-minus').addEventListener('click', () => {
      adjustCartItemQuantity(item.id, -1);
    });
    card.querySelector('.btn-qty-plus').addEventListener('click', () => {
      adjustCartItemQuantity(item.id, 1);
    });
    card.querySelector('.btn-remove-item').addEventListener('click', () => {
      removeCartItem(item.id);
    });
    
    cartItemsContainer.appendChild(card);
  });
  
  if (cartEstimatedTotal) cartEstimatedTotal.textContent = formatBRLFromCents(totalCents);
  if (window.lucide) lucide.createIcons();
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
  saveStoreData('cart', state.cart);
}

function loadCartFromLocalStorage() {
  const stored = getStoreData('cart');
  if (stored && stored.length > 0) {
    state.cart = stored;
    renderCartDrawer();
    updateCartBadges();
  }
}

// ==========================================
// RESERVATION SUBMIT VIEW
// ==========================================
function renderReservationPreview() {
  if (!reservationItemsPreviewList) return;
  reservationItemsPreviewList.innerHTML = '';
  
  let totalCents = 0;
  state.cart.forEach(item => {
    const itemTotalCents = (item.priceCents || 0) * item.quantity;
    totalCents += itemTotalCents;
    
    const div = document.createElement('div');
    div.className = 'preview-item';
    
    let specs = '';
    if (item.color) specs += `(${item.color})`;
    if (item.capacity) specs += (specs ? ' ' : '') + `(${item.capacity})`;
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = `${item.name} ${specs}`;
    const qtyBold = document.createElement('strong');
    qtyBold.textContent = ` x${item.quantity}`;
    nameSpan.appendChild(qtyBold);
    
    const priceSpan = document.createElement('span');
    priceSpan.textContent = formatBRLFromCents(itemTotalCents);
    
    div.appendChild(nameSpan);
    div.appendChild(priceSpan);
    reservationItemsPreviewList.appendChild(div);
  });
  
  if (reservationPreviewTotalValue) reservationPreviewTotalValue.textContent = formatBRLFromCents(totalCents);
}

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
  const dataRetirada = document.getElementById('form-data').value;
  const obs = document.getElementById('form-obs').value.trim();
  const consentimento = document.getElementById('form-consentimento').checked;
  
  document.querySelectorAll('.form-error-msg').forEach(el => el.classList.add('d-none'));
  
  let hasErrors = false;
  
  if (!nome) {
    const err = document.getElementById('error-nome');
    if (err) err.classList.remove('d-none');
    hasErrors = true;
  }
  
  const cleanPhone = whatsapp.replace(/\D/g, "");
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    const err = document.getElementById('error-whatsapp');
    if (err) err.classList.remove('d-none');
    hasErrors = true;
  }
  
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const err = document.getElementById('error-email');
    if (err) err.classList.remove('d-none');
    hasErrors = true;
  }
  
  if (!dataRetirada) {
    const err = document.getElementById('error-data');
    if (err) err.classList.remove('d-none');
    hasErrors = true;
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosenDate = new Date(dataRetirada + "T00:00:00");
    if (chosenDate < today) {
      const err = document.getElementById('error-data');
      if (err) {
        err.textContent = "Selecione uma data futura para a retirada.";
        err.classList.remove('d-none');
      }
      hasErrors = true;
    }
  }
  
  if (!consentimento) {
    const err = document.getElementById('error-consentimento');
    if (err) err.classList.remove('d-none');
    hasErrors = true;
  }
  
  if (hasErrors) {
    showToast('Corrija os campos obrigatórios em vermelho.', 'danger');
    return;
  }
  
  const code = `#SI-${Math.floor(1000 + Math.random() * 9000)}`;
  const paymentMethodInput = document.querySelector('input[name="payment-method"]:checked');
  const paymentMethod = paymentMethodInput ? paymentMethodInput.value : 'cash_demo';
  
  const totalCents = state.cart.reduce((sum, item) => sum + ((item.priceCents || 0) * item.quantity), 0);
  const newReservation = {
    id: `res-${Date.now()}`,
    code: code,
    demoCustomerName: nome,
    demoContactLabel: whatsapp,
    items: state.cart.map(i => ({
      productId: i.productId,
      variantId: i.variantId || null,
      quantity: i.quantity,
      unitPriceCents: i.priceCents || 0
    })),
    estimatedTotalCents: totalCents,
    status: 'new',
    requestedDate: new Date(dataRetirada + "T12:00:00").toISOString(),
    displayDate: formatDisplayDate(dataRetirada),
    demoPaymentMethod: paymentMethod,
    notes: obs,
    history: [{ from: null, to: 'new', actorUserId: 'customer', at: new Date().toISOString() }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  createDemoReservation(newReservation);
  
  state.cart = [];
  saveCartToLocalStorage();
  renderCartDrawer();
  updateCartBadges();
  
  reservationSubmitForm.reset();
  
  window.location.hash = `#sucesso/${newReservation.code.slice(1)}`;
}

// ==========================================
// SUCCESS SCREEN ENGINE
// ==========================================
function renderSuccessScreen(codeNum) {
  const code = `#${codeNum}`;
  
  const reservations = getReservations();
  const res = reservations.find(r => r.code === code);
  
  const codeEl = document.getElementById('success-code');
  const nameEl = document.getElementById('success-client-name');
  const phoneEl = document.getElementById('success-client-whatsapp');
  const dateEl = document.getElementById('success-retrieval-date');
  const countEl = document.getElementById('success-products-count');
  const totalEl = document.getElementById('success-total-value');
  const payEl = document.getElementById('success-payment-method');
  const badge = document.getElementById('success-status-badge');
  const wBtn = document.getElementById('btn-success-whatsapp');

  if (!res) {
    if (codeEl) codeEl.textContent = code;
    if (nameEl) nameEl.textContent = 'Erro ao carregar';
    if (totalEl) totalEl.textContent = 'R$ 0,00';
    return;
  }
  
  if (codeEl) codeEl.textContent = res.code;
  if (nameEl) nameEl.textContent = res.demoCustomerName;
  if (phoneEl) phoneEl.textContent = res.demoContactLabel || 'N/A';
  if (dateEl) dateEl.textContent = res.displayDate || formatDateTimePtBr(res.requestedDate) || 'Não informada';
  
  const totalItems = (res.items || []).reduce((sum, item) => sum + item.quantity, 0);
  if (countEl) countEl.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`;
  if (totalEl) totalEl.textContent = formatBRLFromCents(res.estimatedTotalCents);
  
  if (payEl) {
    payEl.textContent = `Forma escolhida: ${getPaymentMethodLabel(res.demoPaymentMethod)}. Nenhuma cobrança foi realizada nesta simulação.`;
  }
  
  if (badge) {
    badge.className = 'badge-status';
    let statusHtml = '';
    if (res.status === 'new') {
      badge.classList.add('badge-status-pending');
      statusHtml = `<i data-lucide="clock" style="width: 12px; height: 12px; display: inline;"></i> Nova Simulação`;
    } else if (res.status === 'contacted') {
      badge.classList.add('badge-status-confirmed');
      statusHtml = `<i data-lucide="check" style="width: 12px; height: 12px; display: inline;"></i> Contato Simulado`;
    } else {
      badge.classList.add('badge-status-pending');
      statusHtml = `<i data-lucide="info" style="width: 12px; height: 12px; display: inline;"></i> Status: ${res.status}`;
    }
    badge.innerHTML = statusHtml;
  }

  if (wBtn) {
    wBtn.onclick = (e) => {
      handleDemoContactClick(e);
    };
  }
  
  if (window.lucide) lucide.createIcons();
}

// ==========================================
// HELPER UTILITIES
// ==========================================
function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
}

function showToast(message, type = 'info') {
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
  toast.innerHTML = `${icons[type] || icons.info} <span></span>`;
  toast.querySelector('span').textContent = message;
  
  document.body.appendChild(toast);
  if (window.lucide) lucide.createIcons();
  
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);
  
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(100px)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.benefit-item, .category-card, .step-card, .diferencial-card, .contato-cta, .reservation-form-container');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });
  
  animatedElements.forEach(el => {
    if (!el.classList.contains('scroll-animate')) {
      el.classList.add('scroll-animate');
    }
    observer.observe(el);
  });
}
