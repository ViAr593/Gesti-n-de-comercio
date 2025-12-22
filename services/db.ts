import { Product, Supplier, Customer, Employee, Sale, Expense, Quotation, BusinessConfig, InventoryLog } from '../types';

// Claves de almacenamiento (Storage Keys)
const KEYS = {
  PRODUCTS: 'gp_db_products',
  SUPPLIERS: 'gp_db_suppliers',
  CUSTOMERS: 'gp_db_customers',
  EMPLOYEES: 'gp_db_employees',
  SALES: 'gp_db_sales',
  EXPENSES: 'gp_db_expenses',
  QUOTATIONS: 'gp_db_quotations',
  CONFIG: 'gp_db_config',
  LOGS: 'gp_db_inventory_logs',
};

// Logotipo ViAr en Base64 (SVG optimizado para carga rápida)
const VIAR_LOGO = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjRThFOUUxIi8+CjxwYXRoIGQ9Ik0yMTAgMTYwQzIxMCAxNjAgMjQwIDE5MCAyNDAgMjQwQzI0MCAyOTAgMjEwIDMzMCAyMTAgMzMwQzIxMCAzMzAgMTgwIDI5MCAxODAgMjQwQzE4MCAxOTAgMjEwIDE2MCAyMTAgMTYwWiIgZmlsbD0iIzVFN0E1RSIvPgo8cGF0aCBkPSJNMjQwIDI0MEMyNDAgMjQwIDI3MCAyMTAgMzAwIDIxMEMzMzAgMjEwIDM2MCAyNDAgMzYwIDI0MEMzNjAgMjQwIDMzMCAyNzAgMzAwIDI3MEMyNzAgMjcwIDI0MCAyNDAgMjQwIDI0MFoiIGZpbGw9IiM1RTdBNUUiLz4KPHRleHQgeD0iNTAiIHk9IjM1MCIgZmlsbD0iIzVFN0E1RSIgc3R5bGU9ImZvbnQtZmFtaWx5OnNlcmlmOyBmb250LXNpemU6MTYwcHg7IGZvbnQtd2VpZ2h0OmJvbGQ7Ij5WaUFyPC90ZXh0Pgo8L3N2Zz4=";

// Datos Semilla (Initial/Seed Data)
const SEED_DATA = {
  products: [
    { 
      id: '1', 
      name: 'Laptop Gamer Xtreme', 
      description: 'RTX 4060, 16GB RAM, 512GB SSD', 
      price: 1250.00, 
      cost: 950.00, 
      stock: 5, 
      minStock: 2, 
      category: 'Electrónica', 
      supplierId: 's1', 
      measurementUnit: 'UNIDAD', 
      measurementValue: 1 
    },
    { 
      id: '2', 
      name: 'Refresco Orgánico 500ml', 
      description: 'Bebida natural sin conservantes', 
      price: 1.50, 
      cost: 0.80, 
      stock: 48, 
      minStock: 12, 
      category: 'Bebidas', 
      supplierId: 's1', 
      measurementUnit: 'ML', 
      measurementValue: 500 
    }
  ] as Product[],

  suppliers: [
    { id: 's1', name: 'Distribuidora Central', contactName: 'Carlos Ruiz', phone: '555-0101', email: 'ventas@distcentral.com' }
  ] as Supplier[],

  customers: [
    { id: 'c1', name: 'Consumidor Final', taxId: '00000000', email: '', phone: '', address: '' }
  ] as Customer[],

  employees: [
    { 
      id: 'e1', 
      name: 'Administrador Principal', 
      role: 'GERENTE_GENERAL', 
      phone: '999-000-000', 
      email: 'admin@sistema.com', 
      password: 'e6053eb8d35e02ae40beeeacef203c1d6492302747072efd6d712476d594b597' // admin@123* (Hashed)
    }
  ] as Employee[],

  sales: [] as Sale[],
  expenses: [] as Expense[],
  quotations: [] as Quotation[],

  config: {
    name: 'ViAr',
    taxId: '123456789001',
    address: 'Av. Ecológica 456',
    phone: '555-9876',
    email: 'contacto@viar.com',
    whatsapp: '5559876',
    receiptMessage: 'Gracias por preferir ViAr - Calidad Natural.',
    currencySymbol: '$',
    theme: 'light',
    language: 'es',
    logo: VIAR_LOGO,
    openingHours: {
        monday: { isOpen: true, open: '09:00', close: '18:00' },
        tuesday: { isOpen: true, open: '09:00', close: '18:00' },
        wednesday: { isOpen: true, open: '09:00', close: '18:00' },
        thursday: { isOpen: true, open: '09:00', close: '18:00' },
        friday: { isOpen: true, open: '09:00', close: '18:00' },
        saturday: { isOpen: true, open: '09:00', close: '13:00' },
        sunday: { isOpen: false, open: '09:00', close: '13:00' }
    }
  } as BusinessConfig
};

// Funciones Helper Genéricas
function load<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error loading database key: ${key}`, e);
    return defaultValue;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving database key: ${key}`, e);
  }
}

export const hashPassword = async (text: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const db = {
  products: {
    getAll: () => load<Product[]>(KEYS.PRODUCTS, SEED_DATA.products),
    set: (data: Product[]) => save(KEYS.PRODUCTS, data),
  },
  suppliers: {
    getAll: () => load<Supplier[]>(KEYS.SUPPLIERS, SEED_DATA.suppliers),
    set: (data: Supplier[]) => save(KEYS.SUPPLIERS, data),
  },
  customers: {
    getAll: () => load<Customer[]>(KEYS.CUSTOMERS, SEED_DATA.customers),
    set: (data: Customer[]) => save(KEYS.CUSTOMERS, data),
  },
  employees: {
    getAll: () => load<Employee[]>(KEYS.EMPLOYEES, SEED_DATA.employees),
    set: (data: Employee[]) => save(KEYS.EMPLOYEES, data),
  },
  sales: {
    getAll: () => load<Sale[]>(KEYS.SALES, SEED_DATA.sales),
    set: (data: Sale[]) => save(KEYS.SALES, data),
  },
  expenses: {
    getAll: () => load<Expense[]>(KEYS.EXPENSES, SEED_DATA.expenses),
    set: (data: Expense[]) => save(KEYS.EXPENSES, data),
  },
  quotations: {
    getAll: () => load<Quotation[]>(KEYS.QUOTATIONS, SEED_DATA.quotations),
    set: (data: Quotation[]) => save(KEYS.QUOTATIONS, data),
  },
  config: {
    get: () => {
        const config = load<BusinessConfig>(KEYS.CONFIG, SEED_DATA.config);
        if (!config.openingHours) config.openingHours = SEED_DATA.config.openingHours;
        if (config.whatsapp === undefined) config.whatsapp = SEED_DATA.config.whatsapp;
        if (config.language === undefined) config.language = 'es';
        if (!config.logo) config.logo = VIAR_LOGO;
        if (config.name === 'Mi Negocio Local') config.name = 'ViAr';
        return config;
    },
    set: (data: BusinessConfig) => save(KEYS.CONFIG, data),
  },
  logs: {
    getAll: () => load<InventoryLog[]>(KEYS.LOGS, []),
    set: (data: InventoryLog[]) => save(KEYS.LOGS, data),
  },
  auth: {
    login: async (email: string, password: string): Promise<Employee | null> => {
        const employees = load<Employee[]>(KEYS.EMPLOYEES, SEED_DATA.employees);
        const hash = await hashPassword(password);
        const user = employees.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === hash);
        return user || null;
    }
  }
};