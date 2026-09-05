/**
 * Store Imports Demo - Shared Data Architecture
 * DEMO_SCHEMA_VERSION = 2
 */

const DEMO_SCHEMA_VERSION = 2;
const PREFIX = 'store_imports_demo_v2_';

const MOCK_CATEGORIES = [
  { id: 'iphones', name: 'iPhones', image: 'iphones.png', count: 6 },
  { id: 'android', name: 'Android', image: 'androids.png', count: 6 },
  { id: 'ipads', name: 'iPads', image: 'ipads.png', count: 3 },
  { id: 'notebooks', name: 'Notebooks', image: 'notebooks.png', count: 4 },
  { id: 'smartwatches', name: 'Smartwatches', image: 'relógios.png', count: 5 },
  { id: 'acessorios', name: 'Acessórios', image: 'acessórios.png', count: 20 }
];

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
    colors: ['Titânio Natural', 'Titânio Preto', 'Titânio Azul'],
    selectedColor: 'Titânio Natural',
    capacities: ['256GB', '512GB'],
    selectedCapacity: '256GB',
    condition: 'Novo',
    warranty: '12 meses',
    boxContent: 'Aparelho, Cabo USB-C',
    imeis: ['IMEI-DEMO-000001', 'IMEI-DEMO-000002', 'IMEI-DEMO-000003'],
    serialNumbers: ['S-DEMO-1', 'S-DEMO-2', 'S-DEMO-3']
  },
  {
    id: 'prod-002',
    internalCode: 'IP14-128-PR',
    barcode: '7891000200020',
    name: 'iPhone 14',
    brand: 'Apple',
    model: '14',
    category: 'iphones',
    description: 'Ótima relação custo-benefício. Tela de 6.1 polegadas, chip A15 Bionic, câmera dupla.',
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
    warranty: '3 meses',
    boxContent: 'Aparelho, Cabo',
    imeis: ['IMEI-DEMO-000004', 'IMEI-DEMO-000005', 'IMEI-DEMO-000006', 'IMEI-DEMO-000007', 'IMEI-DEMO-000008']
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
    quantity: 1, // Alerta de baixo estoque
    minQuantity: 2,
    unit: 'un',
    colors: ['Creme', 'Verde', 'Preto'],
    selectedColor: 'Creme',
    capacities: ['256GB'],
    selectedCapacity: '256GB',
    condition: 'Novo',
    warranty: '12 meses',
    boxContent: 'Aparelho, Caneta S Pen, Carregador, Cabo',
    imeis: ['IMEI-DEMO-000009']
  },
  {
    id: 'prod-004',
    internalCode: 'CASE-IP15P-MAG',
    barcode: '7891000200051',
    name: 'Capa Silicone MagSafe iPhone 15 Pro',
    brand: 'Custom',
    model: 'Capa MagSafe',
    category: 'acessorios',
    description: 'Capa protetora de silicone premium.',
    cost: 25,
    price: 89,
    promoPrice: 69,
    quantity: 12,
    minQuantity: 5,
    unit: 'un',
    colors: ['Preto', 'Azul-Escuro'],
    selectedColor: 'Preto',
    capacities: [],
    selectedCapacity: '',
    condition: 'Novo',
    warranty: 'Garantia contra defeitos',
    boxContent: 'Capa'
  },
  {
    id: 'prod-005',
    internalCode: 'FONE-AP3-AP',
    barcode: '7891000200075',
    name: 'AirPods 3ª Geração',
    brand: 'Apple',
    model: 'AirPods 3',
    category: 'acessorios',
    description: 'Fones sem fio com áudio espacial.',
    cost: 1100,
    price: 1699,
    promoPrice: null,
    quantity: 0, // Sem estoque
    minQuantity: 1,
    unit: 'un',
    colors: ['Branco'],
    selectedColor: 'Branco',
    capacities: [],
    selectedCapacity: '',
    condition: 'Novo',
    warranty: '12 meses',
    boxContent: 'AirPods, Estojo, Cabo'
  }
];

const SEED_RESERVATIONS = [
  {
    id: 'res-101',
    code: 'DEMO-RES-1001',
    nome: 'Cliente Demonstração 01',
    whatsapp: 'Não informado — demonstração',
    email: 'cliente01@example.invalid',
    contatoPref: 'WhatsApp',
    dataRetirada: '28/07/2026',
    rawDate: '2026-07-28',
    obs: 'Esta é uma reserva demonstrativa.',
    status: 'Aguardando confirmação',
    createdAt: '16/07/2026 14:32:10',
    items: [
      { productId: 'prod-001', name: 'iPhone 15 Pro Max', price: 6999, color: 'Titânio Natural', capacity: '256GB', quantity: 1 }
    ],
    total: 6999
  }
];

const SEED_SALES = [
  {
    id: 'sale-101',
    code: 'DEMO-VDA-2001',
    productName: 'iPhone 15 Pro Max',
    productId: 'prod-001',
    quantity: 1,
    client: 'Cliente Demonstração 02',
    paymentMethod: 'other_demo',
    discount: 100,
    total: 6899,
    date: '16/07/2026 11:20:00',
    seller: 'Vendedor Demonstração'
  }
];

const SEED_STOCK_LOGS = [
  {
    id: 'log-101',
    productName: 'iPhone 15 Pro Max',
    amount: 5,
    type: 'Entrada',
    reason: 'Estoque inicial de demonstração',
    operator: 'Administrador Demo',
    timestamp: '15/07/2026 09:00'
  }
];

const SEED_ACTIVITY_LOGS = [
  { id: 'act-1', text: 'Ambiente demonstrativo inicializado com sucesso.', type: 'info', time: '14/07/2026 08:00' },
  { id: 'act-2', text: 'Dados fictícios populados para demonstração comercial.', type: 'success', time: '14/07/2026 08:05' }
];

const SEED_USERS = [
  { id: 'user-1', name: 'Administrador Demo', email: 'admin@example.invalid', role: 'Administrador', status: 'Ativo' },
  { id: 'user-2', name: 'Gerente Demo', email: 'gerente@example.invalid', role: 'Gerente', status: 'Ativo' },
  { id: 'user-3', name: 'Vendedor Demo', email: 'vendas@example.invalid', role: 'Vendedor', status: 'Ativo' }
];

function generateId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
}

function getStorageKey(key) {
  return `${PREFIX}${key}`;
}

function seedDemoDataOnce() {
  const metaKey = getStorageKey('meta');
  let meta = null;
  try {
    meta = JSON.parse(localStorage.getItem(metaKey));
  } catch(e) {}

  if (meta && meta.version === DEMO_SCHEMA_VERSION) {
    // Already seeded for this version
    return;
  }

  // Clear ONLY known legacy keys that might interfere (optional, but good for cleanup)
  localStorage.removeItem('store_imports_products');
  localStorage.removeItem('store_imports_reservations');
  localStorage.removeItem('store_imports_sales');
  localStorage.removeItem('store_imports_stock_logs');
  localStorage.removeItem('store_imports_activity_logs');
  
  // Clean up any older V1 keys if they existed (just in case)
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('store_imports_demo_v1_')) {
      localStorage.removeItem(key);
    }
  });

  // Seed data
  localStorage.setItem(getStorageKey('products'), JSON.stringify(SEED_PRODUCTS));
  localStorage.setItem(getStorageKey('reservations'), JSON.stringify(SEED_RESERVATIONS));
  localStorage.setItem(getStorageKey('sales'), JSON.stringify(SEED_SALES));
  localStorage.setItem(getStorageKey('stock_logs'), JSON.stringify(SEED_STOCK_LOGS));
  localStorage.setItem(getStorageKey('activity_logs'), JSON.stringify(SEED_ACTIVITY_LOGS));
  localStorage.setItem(getStorageKey('users'), JSON.stringify(SEED_USERS));

  // Write meta
  localStorage.setItem(metaKey, JSON.stringify({ version: DEMO_SCHEMA_VERSION, seededAt: new Date().toISOString() }));
}

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

function addActivityLog(text, type = 'info') {
  const logs = getStoreData('activity_logs');
  logs.push({
    id: generateId('act'),
    text,
    type,
    time: new Date().toLocaleString('pt-BR')
  });
  saveStoreData('activity_logs', logs);
}

function resetDemoData() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(PREFIX)) {
      localStorage.removeItem(key);
    }
  });
  seedDemoDataOnce();
}

// Automatically try to seed when included
seedDemoDataOnce();
