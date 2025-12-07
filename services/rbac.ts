
import { Employee } from '../types';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'manage_stock' | 'audit' | 'apply_discount' | 'manual_item';
export type ModuleScope = 'INVENTORY' | 'POS' | 'CUSTOMERS' | 'SUPPLIERS' | 'EMPLOYEES' | 'EXPENSES' | 'SETTINGS' | 'SALES_HISTORY' | 'TOOLS' | 'STORE';

type RolePermissions = {
  [key in Employee['role']]: {
    [key in ModuleScope]?: PermissionAction[];
  };
};

// DEFINICIÓN DE PERMISOS POR ROL
const PERMISSIONS: RolePermissions = {
  'GERENTE_GENERAL': {
    // Acceso Total
    INVENTORY: ['view', 'create', 'edit', 'delete', 'manage_stock', 'audit'],
    POS: ['view', 'create', 'apply_discount', 'manual_item'],
    CUSTOMERS: ['view', 'create', 'edit', 'delete'],
    SUPPLIERS: ['view', 'create', 'edit', 'delete'],
    EMPLOYEES: ['view', 'create', 'edit', 'delete'],
    EXPENSES: ['view', 'create', 'delete'],
    SETTINGS: ['view', 'edit'],
    SALES_HISTORY: ['view', 'delete'],
    TOOLS: ['view'],
    STORE: ['view']
  },
  'ADMINISTRADOR': {
    // Gestión Operativa (Sin auditoría profunda ni eliminar historial)
    INVENTORY: ['view', 'create', 'edit', 'delete', 'manage_stock'],
    POS: ['view', 'create', 'apply_discount', 'manual_item'],
    CUSTOMERS: ['view', 'create', 'edit', 'delete'],
    SUPPLIERS: ['view', 'create', 'edit', 'delete'],
    EMPLOYEES: ['view', 'create', 'edit', 'delete'],
    EXPENSES: ['view', 'create', 'delete'],
    SETTINGS: ['view', 'edit'],
    SALES_HISTORY: ['view'], // No delete
    TOOLS: ['view'],
    STORE: ['view']
  },
  'VENDEDOR': {
    // Solo Vender y Clientes
    INVENTORY: ['view'], // Solo ver stock
    POS: ['view', 'create'], // No descuentos manuales ni items manuales por defecto
    CUSTOMERS: ['view', 'create', 'edit'], // No eliminar clientes
    SALES_HISTORY: ['view'],
    TOOLS: ['view'],
    STORE: ['view'], // Vendedores pueden usar la tienda para mostrar productos
    // Módulos ocultos:
    SUPPLIERS: [],
    EMPLOYEES: [],
    EXPENSES: [],
    SETTINGS: []
  },
  'BODEGUERO': {
    // Solo Inventario y Proveedores
    INVENTORY: ['view', 'manage_stock'], // Solo entradas/salidas, no editar precio ni crear productos
    SUPPLIERS: ['view'],
    // Módulos ocultos:
    POS: [],
    CUSTOMERS: [],
    EMPLOYEES: [],
    EXPENSES: [],
    SETTINGS: [],
    SALES_HISTORY: [],
    TOOLS: [],
    STORE: []
  }
};

/**
 * Verifica si un usuario tiene permiso para realizar una acción en un módulo específico.
 */
export const hasPermission = (user: Employee | null, module: ModuleScope, action: PermissionAction): boolean => {
  if (!user) return false;
  
  const rolePerms = PERMISSIONS[user.role];
  if (!rolePerms) return false;

  const modulePerms = rolePerms[module];
  if (!modulePerms) return false;

  return modulePerms.includes(action);
};