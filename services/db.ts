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

// Datos Semilla (Initial/Seed Data) para cuando la app inicia por primera vez
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
      name: 'Coca Cola 500ml', 
      description: 'Refresco sabor cola original', 
      price: 1.50, 
      cost: 0.80, 
      stock: 48, 
      minStock: 12, 
      category: 'Bebidas', 
      supplierId: 's1', 
      measurementUnit: 'ML', 
      measurementValue: 500 
    },
    { 
      id: '3', 
      name: 'Arroz Premium Grano Largo', 
      description: 'Bolsa de 1kg calidad superior', 
      price: 2.20, 
      cost: 1.10, 
      stock: 100, 
      minStock: 20, 
      category: 'Abarrotes', 
      supplierId: 's2', 
      measurementUnit: 'KG', 
      measurementValue: 1 
    }
  ] as Product[],

  suppliers: [
    { id: 's1', name: 'Distribuidora Central', contactName: 'Carlos Ruiz', phone: '555-0101', email: 'ventas@distcentral.com' },
    { id: 's2', name: 'Importaciones Globales', contactName: 'Ana Campos', phone: '555-0202', email: 'ana@globalimport.com' }
  ] as Supplier[],

  customers: [
    { id: 'c1', name: 'Consumidor Final', taxId: '00000000', email: '', phone: '', address: '' },
    { id: 'c2', name: 'Empresa Ejemplo S.A.', taxId: '20123456789', email: 'contacto@empresa.com', phone: '555-9000', address: 'Av. Empresarial 100' }
  ] as Customer[],

  employees: [
    { id: 'e1', name: 'Administrador Principal', role: 'GERENTE_GENERAL', phone: '999-000-000', email: 'admin@sistema.com', password: 'admin@123*' },
    { id: 'e2', name: 'Vendedor Tienda 1', role: 'VENDEDOR', phone: '999-111-111', email: 'vendedor@sistema.com', password: 'user@123*' }
  ] as Employee[],

  sales: [] as Sale[],
  
  expenses: [] as Expense[],
  
  quotations: [] as Quotation[],

  config: {
    name: 'Mi Negocio Local',
    taxId: '123456789001',
    address: 'Dirección Principal #123',
    phone: '555-0000',
    email: 'contacto@negocio.com',
    receiptMessage: '¡Gracias por su compra!',
    currencySymbol: '$',
    theme: 'light'
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

// Objeto DB exportado
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
    get: () => load<BusinessConfig>(KEYS.CONFIG, SEED_DATA.config),
    set: (data: BusinessConfig) => save(KEYS.CONFIG, data),
  },
  logs: {
    getAll: () => load<InventoryLog[]>(KEYS.LOGS, []),
    set: (data: InventoryLog[]) => save(KEYS.LOGS, data),
  },
  auth: {
    // Validate credentials against the database
    login: (email: string, pass: string): Employee | null => {
      // 1. Try hardcoded fallback if db fails or is empty, though seed data handles this.
      if (email === 'admin' && pass === 'admin123') {
        return {
          id: 'admin_master',
          name: 'Super Admin',
          role: 'GERENTE_GENERAL',
          email: 'admin',
          phone: '',
          password: ''
        };
      } 

      // 2. Check against stored employees
      const employees = load<Employee[]>(KEYS.EMPLOYEES, SEED_DATA.employees);
      const found = employees.find(e => e.email === email && e.password === pass);
      return found || null;
    }
  }
};