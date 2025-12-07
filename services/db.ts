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

// Hashes pre-calculados para las contraseñas por defecto (SHA-256)
// admin@123* -> e6053eb8d35e02ae40beeeacef203c1d6492302747072efd6d712476d594b597
// user@123*  -> 553e87742d4f5556a31c6a28189601d332617f6952865918731b9d4791523498

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
    { 
      id: 'e1', 
      name: 'Administrador Principal', 
      role: 'GERENTE_GENERAL', 
      phone: '999-000-000', 
      email: 'admin@sistema.com', 
      password: 'e6053eb8d35e02ae40beeeacef203c1d6492302747072efd6d712476d594b597' // admin@123* (Hashed)
    },
    { 
      id: 'e2', 
      name: 'Vendedor Tienda 1', 
      role: 'VENDEDOR', 
      phone: '999-111-111', 
      email: 'vendedor@sistema.com', 
      password: '553e87742d4f5556a31c6a28189601d332617f6952865918731b9d4791523498' // user@123* (Hashed)
    }
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
    whatsapp: '5550000', // Default Whatsapp
    receiptMessage: '¡Gracias por su compra!',
    currencySymbol: '$',
    theme: 'light',
    language: 'es',
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

/**
 * Función segura para hashear contraseñas usando SHA-256 (Web Crypto API)
 */
export const hashPassword = async (text: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

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
    get: () => {
        const config = load<BusinessConfig>(KEYS.CONFIG, SEED_DATA.config);
        // Ensure structure for existing users without openingHours or whatsapp
        if (!config.openingHours) config.openingHours = SEED_DATA.config.openingHours;
        if (config.whatsapp === undefined) config.whatsapp = '';
        if (config.language === undefined) config.language = 'es';
        return config;
    },
    set: (data: BusinessConfig) => save(KEYS.CONFIG, data),
  },
  logs: {
    getAll: () => load<InventoryLog[]>(KEYS.LOGS, []),
    set: (data: InventoryLog[]) => save(KEYS.LOGS, data),
  },
  auth: {
    // Validate credentials against the database securely
    login: async (email: string, pass: string): Promise<Employee | null> => {
      // 1. Hash the input password to compare with stored hash
      const hashedInput = await hashPassword(pass);

      // 2. Load stored employees
      const employees = load<Employee[]>(KEYS.EMPLOYEES, SEED_DATA.employees);
      
      // 3. Find user by email
      let user = employees.find(e => e.email === email);
      
      // Fallback: If no user found in local DB (e.g., cleared), but using default admin, use SEED data
      if (!user && email === 'admin@sistema.com') {
         // Check if the hash matches the seed admin hash
         const seedAdmin = SEED_DATA.employees.find(e => e.email === 'admin@sistema.com');
         if (seedAdmin && seedAdmin.password === hashedInput) {
             return seedAdmin;
         }
      }

      if (user) {
        // Path A: The password in DB matches the hashed input (Secure, normal path)
        if (user.password === hashedInput) {
            return user;
        }

        // Path B (MIGRATION): The password in DB is legacy PLAIN TEXT and matches input
        // This allows existing users to login, and we immediately upgrade them to hash
        if (user.password === pass) {
            console.log("Migrating legacy plain-text password to hash for user:", email);
            user.password = hashedInput;
            
            // Save updated employee list to storage
            const updatedEmployees = employees.map(e => e.id === user!.id ? user! : e);
            save(KEYS.EMPLOYEES, updatedEmployees);
            
            return user;
        }
      }

      return null;
    }
  }
};