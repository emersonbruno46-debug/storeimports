/**
 * Store Imports - Data Layer & Data Architecture (V3)
 * Includes Centralized Store Config, Normalizers, LocalRepository and Supabase DataAdapter.
 */

const DEMO_CONFIG = Object.freeze({
  isDemo: true,
  label: 'AMBIENTE DEMONSTRATIVO — DADOS SIMULADOS',
  allowRealSubmissions: false,
  allowPix: false,
  locale: 'pt-BR',
  currency: 'BRL',
  storeName: 'Store Imports',
  phone: '+55 38 9134-4656',
  whatsapp: '5538991344656',
  whatsappFormatted: '+55 38 9134-4656',
  email: 'contato@storeimports.com.br',
  address: 'Rua Jovelino Pinheiro da Cruz, 02, Rio Pardo De Minas MG, 39530-000, Brasil',
  businessHours: 'Seg. a Sáb. das 09h às 19h',
  instagram: 'https://www.instagram.com/storeimports___/',
  instagramHandle: '@storeimports___',
  supabaseUrl: '',
  supabaseAnonKey: ''
});

const DEMO_SCHEMA_VERSION = 3;
const DEMO_DATA_REVISION = 3;
const PATCH_ID = 'presentation-2026-09-24-fix';
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
    id: 'prod-001', sku: 'DEMO-IP15PM-256', barcodeDemo: '7891000200013', name: 'iPhone 15 Pro Max',
    brand: 'Apple', model: '15 Pro Max', categoryId: 'cat-iphones', condition: 'new',
    shortDescription: 'Aparelho em perfeito estado, tela Super Retina XDR OLED.',
    status: 'active',
    images: [{ id: 'img-1', src: './assets/iphones.png', alt: 'iPhone 15 Pro Max', isPrimary: true }],
    variants: [{ id: 'var-1', sku: 'DEMO-IP15PM-256-V1', color: 'Titânio Natural', capacity: '256 GB', priceCents: 749900, promotionalPriceCents: 699900, costCents: 580000, stockQuantity: 3, minimumStock: 1, active: true, demoImeis: ['IMEI-DEMO-000001', 'IMEI-DEMO-000002', 'IMEI-DEMO-000003'] }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-002', sku: 'DEMO-IP14-128', barcodeDemo: '7891000200020', name: 'iPhone 14',
    brand: 'Apple', model: '14', categoryId: 'cat-iphones', condition: 'new',
    shortDescription: 'Ótima relação custo-benefício. Tela de 6.1 polegadas.',
    status: 'active',
    images: [{ id: 'img-2', src: './assets/iphones.png', alt: 'iPhone 14', isPrimary: true }],
    variants: [{ id: 'var-2', sku: 'DEMO-IP14-128-V1', color: 'Preto', capacity: '128 GB', priceCents: 439900, promotionalPriceCents: null, costCents: 320000, stockQuantity: 5, minimumStock: 2, active: true, demoImeis: ['IMEI-DEMO-000004','IMEI-DEMO-000005','IMEI-DEMO-000006','IMEI-DEMO-000007','IMEI-DEMO-000008'] }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-003', sku: 'DEMO-S23U-256', barcodeDemo: '7891000200037', name: 'Galaxy S23 Ultra 5G',
    brand: 'Samsung', model: 'S23 Ultra', categoryId: 'cat-android', condition: 'new',
    shortDescription: 'A câmera de 200MP definitiva com S Pen inclusa.',
    status: 'active',
    images: [{ id: 'img-3', src: './assets/androids.png', alt: 'Galaxy S23 Ultra 5G', isPrimary: true }],
    variants: [{ id: 'var-3', sku: 'DEMO-S23U-256-V1', color: 'Creme', capacity: '256 GB', priceCents: 569900, promotionalPriceCents: 519900, costCents: 410000, stockQuantity: 2, minimumStock: 1, active: true, demoImeis: ['IMEI-DEMO-000009','IMEI-DEMO-000010'] }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-004', sku: 'DEMO-A55-128', barcodeDemo: '7891000200044', name: 'Galaxy A55 5G',
    brand: 'Samsung', model: 'A55 5G', categoryId: 'cat-android', condition: 'new',
    shortDescription: 'Desempenho incrível e design premium.',
    status: 'active',
    images: [{ id: 'img-4', src: './assets/androids.png', alt: 'Galaxy A55 5G', isPrimary: true }],
    variants: [{ id: 'var-4', sku: 'DEMO-A55-128-V1', color: 'Azul', capacity: '128 GB', priceCents: 249900, promotionalPriceCents: 229900, costCents: 180000, stockQuantity: 6, minimumStock: 2, active: true, demoImeis: ['IMEI-DEMO-000011','IMEI-DEMO-000012','IMEI-DEMO-000013','IMEI-DEMO-000014','IMEI-DEMO-000015','IMEI-DEMO-000016'] }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-005', sku: 'DEMO-IPAD10-64', barcodeDemo: '7891000200051', name: 'iPad 10ª geração',
    brand: 'Apple', model: 'iPad 10', categoryId: 'cat-ipads', condition: 'new',
    shortDescription: 'Totalmente redesenhado e mais versátil.',
    status: 'active',
    images: [{ id: 'img-5', src: './assets/ipads.png', alt: 'iPad 10ª geração', isPrimary: true }],
    variants: [{ id: 'var-5', sku: 'DEMO-IPAD10-64-V1', color: 'Prata', capacity: '64 GB', priceCents: 359900, promotionalPriceCents: null, costCents: 280000, stockQuantity: 4, minimumStock: 2, active: true, demoImeis: [] }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-006', sku: 'DEMO-IPADAIR11-256', barcodeDemo: '7891000200068', name: 'iPad Air 11',
    brand: 'Apple', model: 'iPad Air 11', categoryId: 'cat-ipads', condition: 'new',
    shortDescription: 'Superpotente com o chip M2.',
    status: 'active',
    images: [{ id: 'img-6', src: './assets/ipads.png', alt: 'iPad Air 11', isPrimary: true }],
    variants: [{ id: 'var-6', sku: 'DEMO-IPADAIR11-256-V1', color: 'Cinza', capacity: '256 GB', priceCents: 619900, promotionalPriceCents: null, costCents: 480000, stockQuantity: 2, minimumStock: 1, active: true, demoImeis: [] }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-007', sku: 'DEMO-MBA-M2-256', barcodeDemo: '7891000200075', name: 'MacBook Air M2',
    brand: 'Apple', model: 'MacBook Air M2', categoryId: 'cat-notebooks', condition: 'new',
    shortDescription: 'Fino, leve e muito poderoso.',
    status: 'active',
    images: [{ id: 'img-7', src: './assets/notebooks.png', alt: 'MacBook Air M2', isPrimary: true }],
    variants: [{ id: 'var-7', sku: 'DEMO-MBA-M2-256-V1', color: 'Meia-noite', capacity: '256 GB', priceCents: 799900, promotionalPriceCents: 749900, costCents: 610000, stockQuantity: 3, minimumStock: 1, active: true, demoImeis: [] }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-008', sku: 'DEMO-BOOK-512', barcodeDemo: '7891000200082', name: 'Notebook Galaxy Book Demo',
    brand: 'Samsung', model: 'Galaxy Book', categoryId: 'cat-notebooks', condition: 'new',
    shortDescription: 'Desempenho máximo para o dia a dia.',
    status: 'active',
    images: [{ id: 'img-8', src: './assets/notebooks.png', alt: 'Notebook Galaxy Book Demo', isPrimary: true }],
    variants: [{ id: 'var-8', sku: 'DEMO-BOOK-512-V1', color: 'Grafite', capacity: '512 GB', priceCents: 549900, promotionalPriceCents: null, costCents: 410000, stockQuantity: 2, minimumStock: 1, active: true, demoImeis: [] }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-009', sku: 'DEMO-AWATCH9-45', barcodeDemo: '7891000200099', name: 'Apple Watch Series 9',
    brand: 'Apple', model: 'Watch Series 9', categoryId: 'cat-smartwatches', condition: 'new',
    shortDescription: 'Um passo à frente na saúde.',
    status: 'active',
    images: [{ id: 'img-9', src: './assets/relógios.png', alt: 'Apple Watch Series 9', isPrimary: true }],
    variants: [{ id: 'var-9', sku: 'DEMO-AWATCH9-45-V1', color: 'Meia-noite', capacity: '45 mm', priceCents: 319900, promotionalPriceCents: 299900, costCents: 210000, stockQuantity: 4, minimumStock: 2, active: true, demoImeis: [] }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-010', sku: 'DEMO-GWATCH6-44', barcodeDemo: '7891000200105', name: 'Galaxy Watch 6',
    brand: 'Samsung', model: 'Watch 6', categoryId: 'cat-smartwatches', condition: 'new',
    shortDescription: 'O parceiro ideal para seu bem-estar.',
    status: 'active',
    images: [{ id: 'img-10', src: './assets/relógios.png', alt: 'Galaxy Watch 6', isPrimary: true }],
    variants: [{ id: 'var-10', sku: 'DEMO-GWATCH6-44-V1', color: 'Grafite', capacity: '44 mm', priceCents: 189900, promotionalPriceCents: null, costCents: 120000, stockQuantity: 3, minimumStock: 1, active: true, demoImeis: [] }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-011', sku: 'DEMO-AIRPODS3', barcodeDemo: '7891000200112', name: 'AirPods 3ª geração',
    brand: 'Apple', model: 'AirPods 3', categoryId: 'cat-acessorios', condition: 'new',
    shortDescription: 'Áudio Espacial Personalizado.',
    status: 'active',
    images: [{ id: 'img-11', src: './assets/acessórios.png', alt: 'AirPods 3ª geração', isPrimary: true }],
    variants: [{ id: 'var-11', sku: 'DEMO-AIRPODS3-V1', color: 'Branco', capacity: '', priceCents: 169900, promotionalPriceCents: null, costCents: 110000, stockQuantity: 4, minimumStock: 1, active: true, demoImeis: [] }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-012', sku: 'DEMO-USBC20W', barcodeDemo: '7891000200129', name: 'Carregador USB-C 20 W',
    brand: 'Apple', model: 'Carregador 20W', categoryId: 'cat-acessorios', condition: 'new',
    shortDescription: 'Carregamento rápido e eficiente.',
    status: 'active',
    images: [{ id: 'img-12', src: './assets/acessórios.png', alt: 'Carregador USB-C 20 W', isPrimary: true }],
    variants: [{ id: 'var-12', sku: 'DEMO-USBC20W-V1', color: 'Branco', capacity: '', priceCents: 18900, promotionalPriceCents: 15900, costCents: 9000, stockQuantity: 15, minimumStock: 5, active: true, demoImeis: [] }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
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
  }
];

const SEED_RESERVATIONS = [
  {
    id: 'res-101',
    code: '#SI-1001',
    demoCustomerName: 'Cliente Demonstração 01',
    demoContactLabel: '(11) 98888-7777',
    items: [
      { productId: 'prod-001', variantId: 'var-1', quantity: 1, unitPriceCents: 699900 }
    ],
    estimatedTotalCents: 699900,
    status: 'new',
    requestedDate: new Date(Date.now() + 86400000).toISOString(),
    notes: 'Reserva demonstrativa.',
    history: [
      { from: null, to: 'new', actorUserId: 'customer', at: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'res-102',
    code: '#SI-1002',
    demoCustomerName: 'Cliente Demonstração 02',
    demoContactLabel: '(11) 97777-6666',
    items: [
      { productId: 'prod-003', variantId: 'var-3', quantity: 1, unitPriceCents: 519900 }
    ],
    estimatedTotalCents: 519900,
    status: 'contacted',
    requestedDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    notes: 'Aguardando cliente confirmar horário de visita.',
    history: [
      { from: null, to: 'new', actorUserId: 'customer', at: new Date(Date.now() - 3600000).toISOString() },
      { from: 'new', to: 'contacted', actorUserId: 'user-3', at: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const SEED_SALES = [
  {
    id: 'sale-101',
    code: 'VD-2001',
    items: [
      { productId: 'prod-004', variantId: 'var-4', quantity: 1, unitPriceCents: 229900, discountCents: 0, totalCents: 229900 }
    ],
    subtotalCents: 229900,
    discountCents: 0,
    totalCents: 229900,
    demoPaymentMethod: 'card_credit_demo',
    demoCustomerName: 'Cliente Balcão Demo',
    sellerUserId: 'user-3',
    status: 'completed',
    notes: 'Venda presencial realizada com sucesso',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    cancelledAt: null,
    reversalReason: null
  }
];

const SEED_STOCK_MOVEMENTS = [
  { id: 'mov-1', productId: 'prod-001', variantId: 'var-1', type: 'entry', quantity: 5, previousQuantity: 0, resultingQuantity: 5, reason: 'Estoque inicial', demoImeis: ['IMEI-DEMO-000001', 'IMEI-DEMO-000002', 'IMEI-DEMO-000003'], relatedSaleId: null, actorUserId: 'user-4', createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 'mov-2', productId: 'prod-001', variantId: 'var-1', type: 'exit', quantity: 2, previousQuantity: 5, resultingQuantity: 3, reason: 'Venda demonstrativa balcão', demoImeis: [], relatedSaleId: 'sale-100', actorUserId: 'user-3', createdAt: new Date(Date.now() - 172800000).toISOString() }
];

const SEED_ACTIVITY_LOGS = [
  { id: 'act-1', type: 'info', entityType: 'system', entityId: 'sys', message: 'Ambiente demonstrativo inicializado com sucesso (V3).', actorUserId: 'user-1', createdAt: new Date().toISOString() }
];

// ==========================================
// DATA NORMALIZATION UTILITIES (V2 -> V3)
// ==========================================

function normalizeReservation(r) {
  if (!r) return null;

  const statusMap = {
    'Aguardando confirmação': 'new',
    'Confirmada': 'confirmed',
    'Aguardando retirada': 'contacted',
    'Finalizada': 'completed',
    'Cancelada': 'cancelled',
    'novo': 'new',
    'nova': 'new'
  };

  let rawStatus = r.status || 'new';
  let normStatus = statusMap[rawStatus] || rawStatus;

  let items = [];
  if (Array.isArray(r.items) && r.items.length > 0) {
    items = r.items.map(i => ({
      productId: i.productId || i.id || '',
      variantId: i.variantId || 'v1',
      quantity: Math.max(1, parseInt(i.quantity) || 1),
      unitPriceCents: i.unitPriceCents !== undefined ? parseInt(i.unitPriceCents) : Math.round((parseFloat(i.price) || 0) * 100)
    }));
  } else if (r.productId) {
    items = [{
      productId: r.productId,
      variantId: r.variantId || 'migrated',
      quantity: Math.max(1, parseInt(r.quantity) || 1),
      unitPriceCents: Math.round((parseFloat(r.total) || 0) * 100)
    }];
  }

  const estimatedTotalCents = r.estimatedTotalCents !== undefined 
    ? parseInt(r.estimatedTotalCents) 
    : (r.total !== undefined ? Math.round(parseFloat(r.total) * 100) : items.reduce((s, i) => s + (i.unitPriceCents * i.quantity), 0));

  return {
    id: r.id || generateId('res'),
    code: r.code || `#SI-${Math.floor(1000 + Math.random() * 9000)}`,
    demoCustomerName: r.demoCustomerName || r.nome || r.client || 'Cliente Fictício',
    demoContactLabel: r.demoContactLabel || r.whatsapp || r.phone || 'Contato Demonstrativo',
    items: items,
    estimatedTotalCents: Math.max(0, estimatedTotalCents || 0),
    status: normStatus,
    requestedDate: r.requestedDate || r.displayDate || r.date || new Date().toISOString(),
    displayDate: r.displayDate || null,
    demoPaymentMethod: r.demoPaymentMethod || r.paymentMethod || 'cash_demo',
    notes: r.notes || r.obs || '',
    history: Array.isArray(r.history) ? r.history : [],
    createdAt: r.createdAt || new Date().toISOString(),
    updatedAt: r.updatedAt || new Date().toISOString()
  };
}

function normalizeProduct(p) {
  if (!p) return null;

  let variants = Array.isArray(p.variants) && p.variants.length > 0 ? p.variants : [
    {
      id: generateId('var'),
      sku: `${p.sku || p.internalCode || 'PROD'}-V1`,
      color: p.selectedColor || p.color || 'Padrão',
      capacity: p.selectedCapacity || p.capacity || '',
      priceCents: p.priceCents !== undefined ? parseInt(p.priceCents) : Math.round((parseFloat(p.price) || 0) * 100),
      promotionalPriceCents: p.promotionalPriceCents !== undefined ? p.promotionalPriceCents : (p.promoPrice ? Math.round(parseFloat(p.promoPrice) * 100) : null),
      costCents: p.costCents !== undefined ? p.costCents : (p.cost ? Math.round(parseFloat(p.cost) * 100) : null),
      stockQuantity: Math.max(0, parseInt(p.stockQuantity !== undefined ? p.stockQuantity : p.quantity) || 0),
      minimumStock: Math.max(0, parseInt(p.minimumStock !== undefined ? p.minimumStock : p.minQuantity) || 1),
      active: p.active !== undefined ? Boolean(p.active) : true,
      demoImeis: Array.isArray(p.demoImeis || p.imeis) ? (p.demoImeis || p.imeis) : []
    }
  ];

  // Ensure all variants have active flag set to true if undefined
  variants = variants.map(v => ({
    ...v,
    active: v.active !== undefined ? Boolean(v.active) : true,
    stockQuantity: Math.max(0, parseInt(v.stockQuantity) || 0),
    minimumStock: Math.max(0, parseInt(v.minimumStock) || 0),
    priceCents: Math.max(0, parseInt(v.priceCents) || 0),
    promotionalPriceCents: (v.promotionalPriceCents !== null && v.promotionalPriceCents !== undefined && !isNaN(v.promotionalPriceCents)) ? Math.max(0, parseInt(v.promotionalPriceCents)) : null
  }));

  return {
    id: p.id || generateId('prod'),
    sku: p.sku || p.internalCode || `REF-${Math.floor(100 + Math.random() * 900)}`,
    barcodeDemo: p.barcodeDemo || p.barcode || '',
    name: p.name || 'Produto sem nome',
    brand: p.brand || 'Marca',
    model: p.model || '',
    categoryId: p.categoryId || (p.category ? `cat-${p.category}` : 'cat-acessorios'),
    condition: p.condition === 'new' || p.condition === 'Novo' ? 'new' : 'used_demo',
    shortDescription: p.shortDescription || p.description || '',
    status: p.status || 'active',
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [{ id: generateId('img'), src: './assets/placeholder.png', alt: p.name, isPrimary: true }],
    variants: variants,
    mockupStyle: p.mockupStyle || { color: '#6B7280', icon: 'smartphone' },
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString()
  };
}

function normalizeSale(s) {
  if (!s) return null;

  let items = Array.isArray(s.items) && s.items.length > 0 ? s.items.map(i => ({
    productId: i.productId || '',
    variantId: i.variantId || 'v1',
    quantity: Math.max(1, parseInt(i.quantity) || 1),
    unitPriceCents: parseInt(i.unitPriceCents) || 0,
    discountCents: parseInt(i.discountCents) || 0,
    totalCents: parseInt(i.totalCents) || (parseInt(i.unitPriceCents) * parseInt(i.quantity))
  })) : [];

  const subtotalCents = s.subtotalCents !== undefined ? parseInt(s.subtotalCents) : Math.round((parseFloat(s.total) || 0) * 100);
  const discountCents = parseInt(s.discountCents) || 0;
  const totalCents = s.totalCents !== undefined ? parseInt(s.totalCents) : Math.max(0, subtotalCents - discountCents);

  return {
    id: s.id || generateId('sale'),
    code: s.code || `VD-${Math.floor(1000 + Math.random() * 9000)}`,
    items: items,
    subtotalCents: subtotalCents,
    discountCents: discountCents,
    totalCents: totalCents,
    demoPaymentMethod: s.demoPaymentMethod || s.paymentMethod || 'cash_demo',
    demoCustomerName: s.demoCustomerName || s.client || 'Cliente Fictício',
    sellerUserId: s.sellerUserId || s.seller || 'user-1',
    status: s.status === 'cancelled' || s.status === 'Cancelada' ? 'cancelled' : 'completed',
    notes: s.notes || '',
    createdAt: s.createdAt || s.date || new Date().toISOString(),
    cancelledAt: s.cancelledAt || null,
    reversalReason: s.reversalReason || null
  };
}

// ==========================================
// LOCAL REPOSITORY IMPLEMENTATION (V3)
// ==========================================

function getStoreData(key) {
  try {
    const raw = localStorage.getItem(getStorageKey(key));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Normalize collections on read
    if (key === 'reservations') return parsed.map(normalizeReservation).filter(Boolean);
    if (key === 'products') return parsed.map(normalizeProduct).filter(Boolean);
    if (key === 'sales') return parsed.map(normalizeSale).filter(Boolean);

    return parsed;
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage`, e);
    return [];
  }
}

function saveStoreData(key, data) {
  try {
    localStorage.setItem(getStorageKey(key), JSON.stringify(data));
  } catch(e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
}

function ensureDemoDataIntegrity() {
  const metaKey = getStorageKey('meta');
  let meta = null;
  try { meta = JSON.parse(localStorage.getItem(metaKey)); } catch(e) {}

  if (meta && meta.version === DEMO_SCHEMA_VERSION && meta.revision === DEMO_DATA_REVISION && meta.patchId === PATCH_ID) {
    return; // Data integrity up to date
  }

  // Merge seed data safely
  const mergeCollection = (key, seedData, normalizer = null) => {
    let existing = getStoreData(key);
    if (normalizer && Array.isArray(existing)) {
      existing = existing.map(normalizer).filter(Boolean);
    }
    
    if (!Array.isArray(existing) || existing.length === 0) {
      saveStoreData(key, seedData);
    } else {
      let modified = false;
      const validItems = [...existing];
      
      seedData.forEach(seedItem => {
        if (!validItems.find(i => i.id === seedItem.id)) {
          validItems.push(seedItem);
          modified = true;
        }
      });
      if (modified) {
        saveStoreData(key, validItems);
      }
    }
  };

  mergeCollection('categories', SEED_CATEGORIES);
  mergeCollection('products', SEED_PRODUCTS, normalizeProduct);
  mergeCollection('reservations', SEED_RESERVATIONS, normalizeReservation);
  mergeCollection('sales', SEED_SALES, normalizeSale);
  mergeCollection('stockMovements', SEED_STOCK_MOVEMENTS);
  mergeCollection('promotions', SEED_PROMOTIONS);
  mergeCollection('users', SEED_USERS);
  mergeCollection('activityLog', SEED_ACTIVITY_LOGS);

  localStorage.setItem(metaKey, JSON.stringify({ 
    version: DEMO_SCHEMA_VERSION, 
    revision: DEMO_DATA_REVISION,
    patchId: PATCH_ID,
    seededAt: new Date().toISOString() 
  }));
}

function resetDemoData() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(PREFIX) || key.startsWith(V2_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
  ensureDemoDataIntegrity();
}

// ------------------------------------------
// LOCAL REPOSITORY CRUD APIS
// ------------------------------------------

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

function getReservations() { return getStoreData('reservations'); }
function createDemoReservation(res) { 
  const list = getReservations(); 
  const norm = normalizeReservation(res);
  list.push(norm); 
  saveStoreData('reservations', list); 
  return norm;
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

function getStockMovements() { return getStoreData('stockMovements'); }
function registerStockMovement(mov) {
  const list = getStockMovements();
  list.push(mov);
  saveStoreData('stockMovements', list);
}

function getSales() { return getStoreData('sales'); }
function createDemoSale(sale) {
  const list = getSales();
  const norm = normalizeSale(sale);
  list.push(norm);
  saveStoreData('sales', list);
  return norm;
}

function getPromotions() { return getStoreData('promotions'); }
function getUsers() { return getStoreData('users'); }
function getActivityLog() { return getStoreData('activityLog'); }
function createActivityLog(log) {
  const list = getActivityLog();
  list.push(log);
  saveStoreData('activityLog', list);
}

// ==========================================
// CENTRALIZED TRANSACTIONAL BUSINESS LOGIC
// ==========================================

/**
 * Faturar Reserva (Complete Reservation)
 * - Revalidates all items & stock quantities
 * - Rejects entire operation if ANY item lacks stock
 * - Idempotency: Returns error if already completed
 * - Records Sale & Stock Movements
 */
function completeReservationTransaction(reservationId, actorUserId = 'user-1') {
  const reservations = getReservations();
  const res = reservations.find(r => r.id === reservationId);

  if (!res) {
    return { success: false, error: 'Reserva não encontrada.' };
  }

  if (res.status === 'completed') {
    return { success: false, error: 'Esta reserva já foi faturada anteriormente (operação duplicada recusada).' };
  }

  if (res.status === 'cancelled') {
    return { success: false, error: 'Não é possível faturar uma reserva que já foi cancelada.' };
  }

  const products = getProducts();
  const stockErrors = [];
  const itemsToFaturar = [];

  // Step 1: Validate all items against stock
  (res.items || []).forEach(item => {
    const prod = products.find(p => p.id === item.productId);
    if (!prod) {
      stockErrors.push(`Produto ID ${item.productId} não foi encontrado no sistema.`);
      return;
    }

    const vIdx = (prod.variants || []).findIndex(v => v.id === item.variantId || (prod.variants.length === 1 && item.variantId === 'v1'));
    if (vIdx === -1) {
      stockErrors.push(`Variação do produto "${prod.name}" não encontrada.`);
      return;
    }

    const variant = prod.variants[vIdx];
    const availableStock = variant.stockQuantity || 0;
    const requestedQty = item.quantity || 1;

    if (requestedQty > availableStock) {
      stockErrors.push(`Estoque insuficiente para "${prod.name}" (${variant.color || ''} ${variant.capacity || ''}). Solicitado: ${requestedQty} un | Disponível: ${availableStock} un.`);
    } else {
      itemsToFaturar.push({
        product: prod,
        variantIndex: vIdx,
        variant: variant,
        quantity: requestedQty,
        unitPriceCents: item.unitPriceCents || 0
      });
    }
  });

  if (stockErrors.length > 0) {
    return { 
      success: false, 
      error: `Faturamento recusado:\n- ${stockErrors.join('\n- ')}` 
    };
  }

  // Step 2: Deduct stock and register stock exit movements
  const saleItems = [];
  const now = new Date().toISOString();

  itemsToFaturar.forEach(entry => {
    const { product, variantIndex, variant, quantity, unitPriceCents } = entry;
    const previousQty = variant.stockQuantity;
    const resultingQty = previousQty - quantity; // Explicit exact deduction, NO Math.max(0, saldo) masking!

    product.variants[variantIndex].stockQuantity = resultingQty;
    updateProduct(product);

    saleItems.push({
      productId: product.id,
      variantId: variant.id,
      quantity: quantity,
      unitPriceCents: unitPriceCents,
      discountCents: 0,
      totalCents: unitPriceCents * quantity
    });

    registerStockMovement({
      id: generateId('mov'),
      productId: product.id,
      variantId: variant.id,
      type: 'exit',
      quantity: quantity,
      previousQuantity: previousQty,
      resultingQuantity: resultingQty,
      reason: `Faturamento da reserva ${res.code}`,
      demoImeis: [],
      relatedSaleId: null,
      actorUserId: actorUserId,
      createdAt: now
    });
  });

  // Step 3: Create Sale Record
  const newSale = createDemoSale({
    id: generateId('sale'),
    code: `VD-${Math.floor(1000 + Math.random() * 9000)}`,
    items: saleItems,
    subtotalCents: res.estimatedTotalCents || 0,
    discountCents: 0,
    totalCents: res.estimatedTotalCents || 0,
    demoPaymentMethod: res.demoPaymentMethod || 'cash_demo',
    demoCustomerName: res.demoCustomerName,
    sellerUserId: actorUserId,
    status: 'completed',
    notes: `Venda gerada a partir do faturamento da reserva ${res.code}`,
    createdAt: now,
    cancelledAt: null
  });

  // Step 4: Update Reservation Status
  updateReservationStatus(res.id, 'completed', actorUserId);

  createActivityLog({
    id: generateId('act'),
    type: 'success',
    entityType: 'reservation',
    entityId: res.id,
    message: `Reserva ${res.code} faturada com sucesso. Venda gerada: ${newSale.code}.`,
    actorUserId: actorUserId,
    createdAt: now
  });

  return { success: true, sale: newSale };
}

/**
 * Estorno Administrativo de Venda (Sale Reversal)
 * - Differentiates cancellation from sale reversal
 * - Requires explicit reason
 * - Restores inventory EXACTLY ONCE
 * - Idempotency: Returns error if already cancelled/reversed
 */
function reverseSaleTransaction(saleId, reason, actorUserId = 'user-1') {
  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    return { success: false, error: 'É obrigatório informar o motivo do estorno para fins de auditoria.' };
  }

  const sales = getSales();
  const sale = sales.find(s => s.id === saleId);

  if (!sale) {
    return { success: false, error: 'Venda não encontrada.' };
  }

  if (sale.status === 'cancelled') {
    return { success: false, error: 'Esta venda já foi estornada anteriormente (operação duplicada recusada).' };
  }

  const products = getProducts();
  const now = new Date().toISOString();

  // Restore inventory for each item in the sale
  (sale.items || []).forEach(item => {
    const prod = products.find(p => p.id === item.productId);
    if (prod) {
      const vIdx = (prod.variants || []).findIndex(v => v.id === item.variantId);
      if (vIdx > -1) {
        const previousQty = prod.variants[vIdx].stockQuantity || 0;
        const resultingQty = previousQty + item.quantity;
        prod.variants[vIdx].stockQuantity = resultingQty;
        updateProduct(prod);

        registerStockMovement({
          id: generateId('mov'),
          productId: prod.id,
          variantId: item.variantId,
          type: 'entry',
          quantity: item.quantity,
          previousQuantity: previousQty,
          resultingQuantity: resultingQty,
          reason: `Estorno administrativo da venda ${sale.code}: ${reason.trim()}`,
          demoImeis: [],
          relatedSaleId: sale.id,
          actorUserId: actorUserId,
          createdAt: now
        });
      }
    }
  });

  // Mark sale as cancelled / reversed
  sale.status = 'cancelled';
  sale.cancelledAt = now;
  sale.reversalReason = reason.trim();
  saveStoreData('sales', sales);

  createActivityLog({
    id: generateId('act'),
    type: 'warning',
    entityType: 'sale',
    entityId: sale.id,
    message: `Venda ${sale.code} estornada pelo operador. Motivo: "${reason.trim()}". Estoque recomposto.`,
    actorUserId: actorUserId,
    createdAt: now
  });

  return { success: true };
}

// ==========================================
// CENTRALIZED HELPERS & FORMATTERS
// ==========================================
function formatBRLFromCents(cents) {
  if (cents === null || cents === undefined || isNaN(cents)) return 'R$ 0,00';
  return (cents / 100).toLocaleString(DEMO_CONFIG.locale, { style: 'currency', currency: DEMO_CONFIG.currency });
}

function getActiveVariants(product) {
  if (!product || !Array.isArray(product.variants)) return [];
  return product.variants.filter(v => v.active !== false);
}

function getPrimaryVariant(product) {
  const active = getActiveVariants(product);
  return active.length > 0 ? active[0] : (product.variants?.[0] || null);
}

function getProductTotalStock(product) {
  return (product.variants || []).reduce((sum, v) => sum + (parseInt(v.stockQuantity) || 0), 0);
}

function getProductMinimumStock(product) {
  if (!product.variants || product.variants.length === 0) return 0;
  return Math.max(...product.variants.map(v => parseInt(v.minimumStock) || 0));
}

function getProductDisplayPriceCents(product) {
  const pVar = getPrimaryVariant(product);
  if (!pVar) return 0;
  return (pVar.promotionalPriceCents !== null && pVar.promotionalPriceCents !== undefined && !isNaN(pVar.promotionalPriceCents)) 
    ? pVar.promotionalPriceCents 
    : pVar.priceCents;
}

function getCategoryById(categoryId) {
  return getCategories().find(c => c.id === categoryId) || null;
}

function getProductById(productId) {
  return getProducts().find(p => p.id === productId) || null;
}

function getVariantById(product, variantId) {
  return (product?.variants || []).find(v => v.id === variantId) || null;
}

function getPaymentMethodLabel(code) {
  const map = {
    'pix_demo': 'Pix — demonstração',
    'card_credit_demo': 'Cartão de crédito — demonstração',
    'card_debit_demo': 'Cartão de débito — demonstração',
    'cash_demo': 'Dinheiro — demonstração',
    'other_demo': 'Outros — demonstração'
  };
  return map[code] || code || 'Outros';
}

function getReservationStatusLabel(status) {
  const map = {
    'new': 'Nova',
    'contacted': 'Contatado',
    'confirmed': 'Confirmada',
    'completed': 'Concluída',
    'cancelled': 'Cancelada'
  };
  return map[status] || status;
}

function getSaleStatusLabel(status) {
  const map = {
    'completed': 'Concluída',
    'cancelled': 'Estornada / Cancelada'
  };
  return map[status] || status;
}

function formatDateTimePtBr(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(d);
  } catch(e) {
    return isoString;
  }
}

// ==========================================
// DATA ADAPTER INTERFACE (PRODUCTION READINESS)
// ==========================================
const DataAdapter = {
  isDemo() {
    return DEMO_CONFIG.isDemo;
  },

  async getProducts() {
    if (this.isDemo()) return getProducts();
    // Production Supabase Adapter fallback
    throw new Error("Supabase Adapter: Credenciais de produção não configuradas em DEMO_CONFIG.");
  },

  async createReservation(reservationData) {
    if (this.isDemo()) return createDemoReservation(reservationData);
    throw new Error("Supabase Adapter: Backend de produção não ativado.");
  },

  async completeReservation(reservationId, actorUserId) {
    if (this.isDemo()) return completeReservationTransaction(reservationId, actorUserId);
    throw new Error("Supabase Adapter: Backend de produção não ativado.");
  },

  async reverseSale(saleId, reason, actorUserId) {
    if (this.isDemo()) return reverseSaleTransaction(saleId, reason, actorUserId);
    throw new Error("Supabase Adapter: Backend de produção não ativado.");
  }
};

// Auto-seed and initialize integrity on script load
ensureDemoDataIntegrity();
