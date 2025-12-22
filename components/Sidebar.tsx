import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users, History, Store, Wallet, UserCircle, Briefcase, Wrench, Settings, ShoppingBag } from 'lucide-react';
import { ViewState, BusinessConfig, Employee } from '../types';
import { hasPermission, ModuleScope } from '../services/rbac';
import { t, Language } from '../services/translations';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  businessConfig?: BusinessConfig;
  currentUser: Employee | null;
  lang?: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, businessConfig, currentUser, lang = 'es' }) => {
  
  const menuItems = [
    { id: 'DASHBOARD', label: t('menu_dashboard', lang), icon: LayoutDashboard, module: 'SALES_HISTORY' },
    { id: 'POS', label: t('menu_pos', lang), icon: ShoppingCart, module: 'POS' },
    { id: 'STORE', label: t('menu_store', lang), icon: ShoppingBag, module: 'STORE' },
    { id: 'INVENTORY', label: t('menu_inventory', lang), icon: Package, module: 'INVENTORY' },
    { id: 'EXPENSES', label: t('menu_expenses', lang), icon: Wallet, module: 'EXPENSES' },
    { id: 'CUSTOMERS', label: t('menu_customers', lang), icon: UserCircle, module: 'CUSTOMERS' },
    { id: 'SUPPLIERS', label: t('menu_suppliers', lang), icon: Store, module: 'SUPPLIERS' },
    { id: 'EMPLOYEES', label: t('menu_employees', lang), icon: Briefcase, module: 'EMPLOYEES' },
    { id: 'TOOLS', label: t('menu_tools', lang), icon: Wrench, module: 'TOOLS' },
    { id: 'SALES_HISTORY', label: t('menu_history', lang), icon: History, module: 'SALES_HISTORY' },
    { id: 'SETTINGS', label: t('menu_settings', lang), icon: Settings, module: 'SETTINGS' },
  ];

  const visibleItems = menuItems.filter(item => {
    if (item.id === 'DASHBOARD') return true; 
    return hasPermission(currentUser, item.module as ModuleScope, 'view');
  });

  return (
    <div className="w-64 bg-white border-r border-slate-200 text-slate-800 flex flex-col h-screen fixed left-0 top-0 shadow-lg z-10 hidden md:flex">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-slate-50 border border-slate-200 shadow-sm">
          {businessConfig?.logo ? (
            <img src={businessConfig.logo} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <Store className="w-6 h-6 text-slate-400" />
          )}
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight block leading-none text-slate-900">{businessConfig?.name || 'ViAr'}</span>
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1 block">Gestión Digital</span>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold overflow-hidden flex-shrink-0">
             {currentUser?.name.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700 truncate">{currentUser?.name || 'Usuario'}</p>
            <p className="text-[10px] text-slate-500 truncate uppercase font-medium">
               {currentUser?.role.replace('_', ' ') || 'Sesión'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};