

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
  supplierId: string;
  measurementUnit: 'UNIDAD' | 'KG' | 'G' | 'L' | 'ML' | 'M';
  measurementValue: number;
  image?: string; // Base64 string for product image
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
}

export interface Customer {
  id: string;
  name: string;
  taxId: string; // DNI/RUC/NIT
  email: string;
  phone: string;
  address: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'VENDEDOR' | 'ADMINISTRADOR' | 'GERENTE_GENERAL' | 'BODEGUERO';
  phone: string;
  email: string;
  password?: string; // Optional for legacy data, required for new
}

export interface CartItem extends Product {
  quantity: number;
  discount?: number; // Discount per unit
}

export interface Sale {
  id: string;
  date: string; // ISO String
  total: number;
  items: CartItem[];
  paymentMethod: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  customerName?: string;
  customerId?: string;
}

// Quotation is similar to Sale but doesn't affect stock immediately
export interface Quotation {
  id: string;
  date: string;
  total: number;
  items: CartItem[];
  customerName?: string;
  expirationDate: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO String
}

export interface DaySchedule {
  isOpen: boolean;
  open: string;
  close: string;
}

export interface OpeningHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface BusinessConfig {
  name: string;
  taxId: string;
  phone: string;
  email: string;
  address: string;
  receiptMessage: string;
  currencySymbol: string;
  logo?: string; // Base64 string
  theme?: 'light' | 'dark';
  openingHours?: OpeningHours;
}

export interface InventoryLog {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: 'ENTRADA' | 'VENTA' | 'AJUSTE' | 'ELIMINACION';
  quantity: number;
  userId: string;
  userName: string;
}

export type ViewState = 'DASHBOARD' | 'INVENTORY' | 'POS' | 'SALES_HISTORY' | 'SUPPLIERS' | 'EXPENSES' | 'CUSTOMERS' | 'EMPLOYEES' | 'TOOLS' | 'SETTINGS';