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
  
  // Mapping ViewState to ModuleScope for permission checking
  const getModuleFromView = (view: string): ModuleScope => {
    if (view === 'DASHBOARD') return 'SALES_HISTORY'; 
    return view as ModuleScope;
  };

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

  // Filter items based on permissions
  const visibleItems = menuItems.filter(item => {
    if (item.id === 'DASHBOARD') return true; 
    return hasPermission(currentUser, item.module as ModuleScope, 'view');
  });

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
        {visibleItems.map((item) => {
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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
            {businessConfig?.logo ? (
                <img src={businessConfig.logo} alt="Logo" className="w-full h-full object-cover"/>
            ) : (
                "GP"
            )}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700 truncate">{businessConfig?.name || 'Mi Negocio'}</p>
            <p className="text-xs text-slate-500 truncate">
               {currentUser?.role === 'GERENTE_GENERAL' ? 'Gerente' : currentUser?.role.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};