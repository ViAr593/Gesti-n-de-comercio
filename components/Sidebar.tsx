
import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users, History, Store, Wallet, UserCircle, Briefcase, Wrench } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'Balance', icon: LayoutDashboard },
    { id: 'POS', label: 'Vender (POS)', icon: ShoppingCart },
    { id: 'INVENTORY', label: 'Inventario', icon: Package },
    { id: 'EXPENSES', label: 'Gastos', icon: Wallet },
    { id: 'CUSTOMERS', label: 'Clientes', icon: UserCircle },
    { id: 'SUPPLIERS', label: 'Proveedores', icon: Store },
    { id: 'EMPLOYEES', label: 'Empleados', icon: Briefcase },
    { id: 'TOOLS', label: 'Herramientas', icon: Wrench },
    { id: 'SALES_HISTORY', label: 'Movimientos', icon: History },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 text-slate-800 flex flex-col h-screen fixed left-0 top-0 shadow-lg z-10 hidden md:flex">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-100">
        <div className="bg-amber-400 p-2 rounded-lg">
          <Store className="w-6 h-6 text-slate-900" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight block leading-none">GestorPro</span>
          <span className="text-xs text-slate-500 font-medium">Business Control</span>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            GP
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-700 truncate">Mi Negocio</p>
            <p className="text-xs text-slate-500 truncate">Plan Gratuito</p>
          </div>
        </div>
      </div>
    </div>
  );
};
