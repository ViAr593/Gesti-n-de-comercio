
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
  role: 'VENDEDOR' | 'ADMINISTRADOR' | 'GERENTE_GENERAL';
  phone: string;
  email: string;
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

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO String
}

export type ViewState = 'DASHBOARD' | 'INVENTORY' | 'POS' | 'SALES_HISTORY' | 'SUPPLIERS' | 'EXPENSES' | 'CUSTOMERS' | 'EMPLOYEES';