/**
 * Store Imports Demo - Shared Data Architecture (V3)
 */

const DEMO_CONFIG = Object.freeze({
  isDemo: true,
  label: 'AMBIENTE DEMONSTRATIVO — DADOS FICTÍCIOS',
  allowRealSubmissions: false,
  allowPix: false,
  locale: 'pt-BR',
  currency: 'BRL',
  contacts: {
    whatsapp: null,
    phone: null,
    email: null,
    address: null,
    businessHours: null
  }
});

const DEMO_SCHEMA_VERSION = 3;
const PREFIX = 'store_imports_demo_v3_';
const V2_PREFIX = 'store_imports_demo_v2_';

function generateId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
}

function getStorageKey(key) {
  return `${PREFIX}${key}`;
}

// ==========================================
// SEED DATA (V3)
// ==========================================
const SEED_CATEGORIES = [
  { id: 'cat-iphones', name: 'iPhones', slug: 'iphones', description: 'Smartphones Apple', image: 'iphones.png', icon: 'smartphone', status: 'active', displayOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-android', name: 'Android', slug: 'android', description: 'Smartphones Android', image: 'androids.png', icon: 'smartphone', status: 'active', displayOrder: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-ipads', name: 'iPads', slug: 'ipads', description: 'Tablets Apple', image: 'ipads.png', icon: 'tablet', status: 'active', displayOrder: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-notebooks', name: 'Notebooks', slug: 'notebooks', description: 'Laptops de alta performance', image: 'notebooks.png', icon: 'laptop', status: 'active', displayOrder: 4, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-smartwatches', name: 'Smartwatches', slug: 'smartwatches', description: 'Relógios inteligentes', image: 'relógios.png', icon: 'watch', status: 'active', displayOrder: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-acessorios', name: 'Acessórios', slug: 'acessorios', description: 'Capas, películas e periféricos', image: 'acessórios.png', icon: 'headphones', status: 'active', displayOrder: 6, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

const SEED_PRODUCTS = [
  {
    id: 'prod-001',
    sku: 'IP15P-256',
    barcodeDemo: '7891000200013',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    model: '15 Pro Max',
    categoryId: 'cat-iphones',
    condition: 'new',
    shortDescription: 'Aparelho em perfeito estado, tela Super Retina XDR OLED.',
    status: 'active',
    images: [{ id: 'img-1', src: './assets/iphones.png', alt: 'iPhone 15 Pro Max', isPrimary: true }],
    variants: [
      { id: 'var-1', sku: 'IP15P-256-TI', color: 'Titânio Natural', capacity: '256GB', priceCents: 749900, promotionalPriceCents: 699900, costCents: 580000, stockQuantity: 3, minimumStock: 1, active: true, demoImeis: ['IMEI-DEMO-000001', 'IMEI-DEMO-000002', 'IMEI-DEMO-000003'] },
      { id: 'var-2', sku: 'IP15P-512-TI', color: 'Titânio Preto', capacity: '512GB', priceCents: 849900, promotionalPriceCents: null, costCents: 680000, stockQuantity: 1, minimumStock: 2, active: true, demoImeis: ['IMEI-DEMO-000004'] } // Baixo estoque
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-002',
    sku: 'IP14-128',
    barcodeDemo: '7891000200020',
    name: 'iPhone 14',
    brand: 'Apple',
    model: '14',
    categoryId: 'cat-iphones',
    condition: 'used_demo',
    shortDescription: 'Ótima relação custo-benefício. Tela de 6.1 polegadas.',
    status: 'active',
    images: [{ id: 'img-2', src: './assets/iphones.png', alt: 'iPhone 14', isPrimary: true }],
    variants: [
      { id: 'var-3', sku: 'IP14-128-PR', color: 'Preto-Espacial', capacity: '128GB', priceCents: 439900, promotionalPriceCents: null, costCents: 320000, stockQuantity: 5, minimumStock: 2, active: true, demoImeis: ['IMEI-DEMO-000005', 'IMEI-DEMO-000006'] }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-003',
    sku: 'S23U-256',
    barcodeDemo: '7891000200037',
    name: 'Galaxy S23 Ultra 5G',
    brand: 'Samsung',
    model: 'S23 Ultra',
    categoryId: 'cat-android',
    condition: 'new',
    shortDescription: 'A câmera de 200MP definitiva com S Pen inclusa.',
    status: 'active',
    images: [{ id: 'img-3', src: './assets/androids.png', alt: 'Galaxy S23 Ultra', isPrimary: true }],
    variants: [
      { id: 'var-4', sku: 'S23U-256-CR', color: 'Creme', capacity: '256GB', priceCents: 569900, promotionalPriceCents: 519900, costCents: 410000, stockQuantity: 1, minimumStock: 2, active: true, demoImeis: ['IMEI-DEMO-000007'] } // Baixo estoque
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-004',
    sku: 'CASE-IP15P-MAG',
    barcodeDemo: '7891000200051',
    name: 'Capa Silicone MagSafe iPhone 15 Pro',
    brand: 'Custom',
    model: 'Capa MagSafe',
    categoryId: 'cat-acessorios',
    condition: 'new',
    shortDescription: 'Capa protetora de silicone premium.',
    status: 'active',
    images: [{ id: 'img-4', src: './assets/acessórios.png', alt: 'Capa MagSafe', isPrimary: true }],
    variants: [
      { id: 'var-5', sku: 'CASE-IP15P-MAG-PT', color: 'Preto', capacity: '', priceCents: 8900, promotionalPriceCents: 6900, costCents: 2500, stockQuantity: 12, minimumStock: 5, active: true, demoImeis: [] }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-005',
    sku: 'FONE-AP3-AP',
    barcodeDemo: '7891000200075',
    name: 'AirPods 3ª Geração',
    brand: 'Apple',
    model: 'AirPods 3',
    categoryId: 'cat-acessorios',
    condition: 'new',
    shortDescription: 'Fones sem fio com áudio espacial.',
    status: 'active',
    images: [{ id: 'img-5', src: './assets/acessórios.png', alt: 'AirPods 3', isPrimary: true }],
    variants: [
      { id: 'var-6', sku: 'FONE-AP3-AP-BR', color: 'Branco', capacity: '', priceCents: 169900, promotionalPriceCents: null, costCents: 110000, stockQuantity: 0, minimumStock: 1, active: true, demoImeis: [] } // Sem estoque
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-006',
    sku: 'IP13-128',
    barcodeDemo: '7891000200099',
    name: 'iPhone 13',
    brand: 'Apple',
    model: '13',
    categoryId: 'cat-iphones',
    condition: 'new',
    shortDescription: 'Modelo anterior, inativo na demonstração.',
    status: 'inactive', // Inativo
    images: [{ id: 'img-6', src: './assets/iphones.png', alt: 'iPhone 13', isPrimary: true }],
    variants: [
      { id: 'var-7', sku: 'IP13-128-AZ', color: 'Azul', capacity: '128GB', priceCents: 399900, promotionalPriceCents: null, costCents: 290000, stockQuantity: 2, minimumStock: 2, active: true, demoImeis: ['IMEI-DEMO-000008', 'IMEI-DEMO-000009'] }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const SEED_USERS = [
  { id: 'user-1', name: 'Administrador Demo', email: 'admin@example.invalid', roleId: 'admin', status: 'active', lastAccessAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'user-2', name: 'Gerente Demo', email: 'gerente@example.invalid', roleId: 'manager', status: 'active', lastAccessAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'user-3', name: 'Vendedor Demo', email: 'vendas@example.invalid', roleId: 'sales', status: 'active', lastAccessAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'user-4', name: 'Estoquista Demo', email: 'estoque@example.invalid', roleId: 'stock', status: 'active', lastAccessAt: new Date().toISOString(), createdAt: new Date().toISOString() }
];

const SEED_PROMOTIONS = [
  {
    id: 'promo-1',
    name: 'Esquenta Black Friday',
    scope: { categoryIds: ['cat-iphones'], productIds: [], variantIds: [] },
    discountType: 'percentage',
    discountValue: 5,
    startsAt: new Date(Date.now() - 86400000).toISOString(),
    endsAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: 'active',
    basePriceSnapshot: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'promo-2',
    name: 'Cyber Monday Antecipada',
    scope: { categoryIds: [], productIds: ['prod-004'], variantIds: [] },
    discountType: 'fixed',
    discountValue: 2000, // R$ 20,00
    startsAt: new Date(Date.now() + 86400000 * 10).toISOString(),
    endsAt: new Date(Date.now() + 86400000 * 15).toISOString(),
    status: 'scheduled',
    basePriceSnapshot: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const SEED_RESERVATIONS = [
  {
    id: 'res-101',
    code: 'DEMO-RES-1001',
    demoCustomerName: 'Cliente Demonstração 01',
    demoContactLabel: 'Não informado — demonstração',
    items: [
      { productId: 'prod-001', variantId: 'var-1', quantity: 1, unitPriceCents: 699900 }
    ],
    estimatedTotalCents: 699900,
    status: 'new',
    requestedDate: new Date(Date.now() + 86400000).toISOString(),
    notes: 'Reserva demonstrativa.',
    history: [
      { from: null, to: 'new', actorUserId: 'user-1', at: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'res-102',
    code: 'DEMO-RES-1002',
    demoCustomerName: 'Cliente Demonstração 03',
    demoContactLabel: 'WhatsApp Demo',
    items: [
      { productId: 'prod-003', variantId: 'var-4', quantity: 1, unitPriceCents: 519900 }
    ],
    estimatedTotalCents: 519900,
    status: 'contacted',
    requestedDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    notes: 'Aguardando cliente responder.',
    history: [
      { from: null, to: 'new', actorUserId: 'user-1', at: new Date(Date.now() - 3600000).toISOString() },
      { from: 'new', to: 'contacted', actorUserId: 'user-3', at: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const SEED_SALES = [
  {
    id: 'sale-101',
    code: 'DEMO-VDA-2001',
    items: [
      { productId: 'prod-004', variantId: 'var-5', quantity: 2, unitPriceCents: 6900, discountCents: 0, totalCents: 13800 }
    ],
    subtotalCents: 13800,
    discountCents: 0,
    totalCents: 13800,
    demoPaymentMethod: 'card_demo',
    demoCustomerName: 'Cliente Demonstração 02',
    sellerUserId: 'user-3',
    status: 'completed',
    notes: 'Venda de balcão',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    cancelledAt: null
  },
  {
    id: 'sale-102',
    code: 'DEMO-VDA-2002',
    items: [
      { productId: 'prod-002', variantId: 'var-3', quantity: 1, unitPriceCents: 439900, discountCents: 0, totalCents: 439900 }
    ],
    subtotalCents: 439900,
    discountCents: 0,
    totalCents: 439900,
    demoPaymentMethod: 'other_demo',
    demoCustomerName: 'Cliente Demonstração 04',
    sellerUserId: 'user-3',
    status: 'cancelled',
    notes: 'Cancelado a pedido do cliente.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    cancelledAt: new Date().toISOString()
  }
];

const SEED_STOCK_MOVEMENTS = [
  { id: 'mov-1', productId: 'prod-001', variantId: 'var-1', type: 'entry', quantity: 5, previousQuantity: 0, resultingQuantity: 5, reason: 'Estoque inicial', demoImeis: ['IMEI-DEMO-000001', 'IMEI-DEMO-000002', 'IMEI-DEMO-000003', 'IMEI-DEMO-000010', 'IMEI-DEMO-000011'], relatedSaleId: null, actorUserId: 'user-4', createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 'mov-2', productId: 'prod-001', variantId: 'var-1', type: 'exit', quantity: 2, previousQuantity: 5, resultingQuantity: 3, reason: 'Venda demonstrativa', demoImeis: ['IMEI-DEMO-000010', 'IMEI-DEMO-000011'], relatedSaleId: 'sale-100', actorUserId: 'user-3', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'mov-3', productId: 'prod-004', variantId: 'var-5', type: 'positive_adjustment', quantity: 2, previousQuantity: 10, resultingQuantity: 12, reason: 'Contagem de inventário', demoImeis: [], relatedSaleId: null, actorUserId: 'user-4', createdAt: new Date(Date.now() - 86400000).toISOString() }
];

const SEED_ACTIVITY_LOGS = [
  { id: 'act-1', type: 'info', entityType: 'user', entityId: 'user-1', message: 'Ambiente demonstrativo inicializado com schema V3.', actorUserId: 'user-1', createdAt: new Date().toISOString() },
  { id: 'act-2', type: 'success', entityType: 'product', entityId: 'prod-001', message: 'Estoque inicial populado.', actorUserId: 'user-4', createdAt: new Date().toISOString() }
];

// ==========================================
// LOCAL REPOSITORY (V3)
// ==========================================

function getStoreData(key) {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey(key))) || [];
  } catch (e) {
    return [];
  }
}

function saveStoreData(key, data) {
  try {
    localStorage.setItem(getStorageKey(key), JSON.stringify(data));
  } catch(e) {
    console.error('Failed to save to localStorage', e);
  }
}

// ------------------------------------------
// Core Initialization & Migration
// ------------------------------------------
function migrateDemoData() {
  const v2ProductsStr = localStorage.getItem(`${V2_PREFIX}products`);
  if (!v2ProductsStr) return; // No v2 data to migrate
  
  try {
    const v2Products = JSON.parse(v2ProductsStr);
    const v3Categories = [...SEED_CATEGORIES];
    const v3Products = [...SEED_PRODUCTS];
    
    // Convert V2 products if they don't exist by SKU
    v2Products.forEach(p2 => {
      const existing = v3Products.find(p3 => p3.sku === p2.internalCode);
      if (!existing) {
        // Map category
        let catId = `cat-${p2.category}`;
        if (!v3Categories.find(c => c.id === catId)) {
          catId = 'cat-acessorios'; // Fallback
        }
        
        v3Products.push({
          id: p2.id,
          sku: p2.internalCode,
          barcodeDemo: p2.barcode || '',
          name: p2.name,
          brand: p2.brand,
          model: p2.model || '',
          categoryId: catId,
          condition: p2.condition === 'Novo' ? 'new' : 'used_demo',
          shortDescription: p2.description || '',
          status: 'active',
          images: [{ id: generateId('img'), src: './assets/placeholder.png', alt: p2.name, isPrimary: true }],
          variants: [
            {
              id: generateId('var'),
              sku: `${p2.internalCode}-V1`,
              color: p2.selectedColor || 'Padrão',
              capacity: p2.selectedCapacity || '',
              priceCents: Math.round(p2.price * 100),
              promotionalPriceCents: p2.promoPrice ? Math.round(p2.promoPrice * 100) : null,
              costCents: p2.cost ? Math.round(p2.cost * 100) : null,
              stockQuantity: p2.quantity || 0,
              minimumStock: p2.minQuantity || 0,
              active: true,
              demoImeis: p2.imeis || []
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });

    saveStoreData('categories', v3Categories);
    saveStoreData('products', v3Products);
    
    // Convert V2 Sales PIX to other_demo
    const v2SalesStr = localStorage.getItem(`${V2_PREFIX}sales`);
    if (v2SalesStr) {
      const v2Sales = JSON.parse(v2SalesStr);
      const v3Sales = [...SEED_SALES];
      v2Sales.forEach(s2 => {
        const method = s2.paymentMethod === 'pix' ? 'other_demo' : 'cash_demo';
        v3Sales.push({
          id: s2.id,
          code: s2.code,
          items: [{ productId: s2.productId, variantId: 'migrated', quantity: s2.quantity, unitPriceCents: Math.round(s2.total * 100), discountCents: 0, totalCents: Math.round(s2.total * 100) }],
          subtotalCents: Math.round(s2.total * 100),
          discountCents: 0,
          totalCents: Math.round(s2.total * 100),
          demoPaymentMethod: method,
          demoCustomerName: s2.client,
          sellerUserId: 'user-3',
          status: 'completed',
          notes: 'Migrado da V2',
          createdAt: new Date().toISOString(),
          cancelledAt: null
        });
      });
      saveStoreData('sales', v3Sales);
    }
    
    // Clear only V2 keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(V2_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    
  } catch (e) {
    console.error("Migration failed", e);
  }
}

function seedDemoDataOnce() {
  const metaKey = getStorageKey('meta');
  let meta = null;
  try {
    meta = JSON.parse(localStorage.getItem(metaKey));
  } catch(e) {}

  if (meta && meta.version === DEMO_SCHEMA_VERSION) {
    return; // Already V3
  }

  // Attempt migration first
  migrateDemoData();

  // If no products exist after migration (or if migration didn't happen), seed fresh
  const existingProducts = getStoreData('products');
  if (existingProducts.length === 0) {
    saveStoreData('categories', SEED_CATEGORIES);
    saveStoreData('products', SEED_PRODUCTS);
    saveStoreData('reservations', SEED_RESERVATIONS);
    saveStoreData('sales', SEED_SALES);
    saveStoreData('stockMovements', SEED_STOCK_MOVEMENTS);
    saveStoreData('promotions', SEED_PROMOTIONS);
    saveStoreData('users', SEED_USERS);
    saveStoreData('activityLog', SEED_ACTIVITY_LOGS);
  }

  localStorage.setItem(metaKey, JSON.stringify({ version: DEMO_SCHEMA_VERSION, seededAt: new Date().toISOString() }));
}

function resetDemoData() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(PREFIX)) {
      localStorage.removeItem(key);
    }
  });
  seedDemoDataOnce();
}

// ------------------------------------------
// API Implementations
// ------------------------------------------

// CATEGORIES
function getCategories() { return getStoreData('categories'); }
function createCategory(cat) { 
  const list = getCategories(); 
  list.push(cat); 
  saveStoreData('categories', list); 
}
function updateCategory(cat) { 
  const list = getCategories(); 
  const idx = list.findIndex(c => c.id === cat.id); 
  if(idx > -1) { list[idx] = cat; saveStoreData('categories', list); } 
}
function setCategoryStatus(id, status) {
  const list = getCategories(); 
  const idx = list.findIndex(c => c.id === id); 
  if(idx > -1) { list[idx].status = status; saveStoreData('categories', list); } 
}
function reorderCategories(orderedIds) {
  const list = getCategories();
  orderedIds.forEach((id, index) => {
    const cat = list.find(c => c.id === id);
    if (cat) cat.displayOrder = index + 1;
  });
  list.sort((a,b) => a.displayOrder - b.displayOrder);
  saveStoreData('categories', list);
}

// PRODUCTS
function getProducts() { return getStoreData('products'); }
function createProduct(prod) { 
  const list = getProducts(); 
  list.push(prod); 
  saveStoreData('products', list); 
}
function updateProduct(prod) { 
  const list = getProducts(); 
  const idx = list.findIndex(p => p.id === prod.id); 
  if(idx > -1) { list[idx] = prod; saveStoreData('products', list); } 
}
function setProductStatus(id, status) {
  const list = getProducts(); 
  const idx = list.findIndex(p => p.id === id); 
  if(idx > -1) { list[idx].status = status; saveStoreData('products', list); } 
}

// RESERVATIONS
function getReservations() { return getStoreData('reservations'); }
function createDemoReservation(res) { 
  const list = getReservations(); 
  list.push(res); 
  saveStoreData('reservations', list); 
}
function updateReservationStatus(id, status, actorId) {
  const list = getReservations();
  const res = list.find(r => r.id === id);
  if (res) {
    res.history.push({ from: res.status, to: status, actorUserId: actorId, at: new Date().toISOString() });
    res.status = status;
    res.updatedAt = new Date().toISOString();
    saveStoreData('reservations', list);
  }
}

// STOCK MOVEMENTS
function getStockMovements() { return getStoreData('stockMovements'); }
function registerStockMovement(mov) {
  const list = getStockMovements();
  list.push(mov);
  saveStoreData('stockMovements', list);
}

// SALES
function getSales() { return getStoreData('sales'); }
function createDemoSale(sale) {
  const list = getSales();
  list.push(sale);
  saveStoreData('sales', list);
}
function cancelDemoSale(id) {
  const list = getSales();
  const sale = list.find(s => s.id === id);
  if (sale && sale.status !== 'cancelled') {
    sale.status = 'cancelled';
    sale.cancelledAt = new Date().toISOString();
    saveStoreData('sales', list);
  }
}

// PROMOTIONS
function getPromotions() { return getStoreData('promotions'); }
// ... further promo logic implemented in admin.js

// USERS & LOGS
function getUsers() { return getStoreData('users'); }
function getActivityLog() { return getStoreData('activityLog'); }
function createActivityLog(log) {
  const list = getActivityLog();
  list.push(log);
  saveStoreData('activityLog', list);
}

// Auto-seed
seedDemoDataOnce();
