import React, { useState, useEffect } from 'react';
import { Product, Sale, Supplier, Expense, ViewState, Customer, Employee, Quotation, BusinessConfig, InventoryLog } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { POS } from './components/POS';
import { SalesHistory } from './components/SalesHistory';
import { Suppliers } from './components/Suppliers';
import { Expenses } from './components/Expenses';
import { Customers } from './components/Customers';
import { Employees } from './components/Employees';
import { Tools } from './components/Tools';
import { Settings } from './components/Settings'; 
import { WhatsAppStore } from './components/WhatsAppStore';
import { Menu } from 'lucide-react';
import { db } from './services/db'; 

const App: React.FC = () => {
  // USUARIO POR DEFECTO (Autenticación Deshabilitada)
  const defaultUser: Employee = {
    id: 'default-admin',
    name: 'Administrador',
    role: 'GERENTE_GENERAL',
    email: 'admin@sistema.com',
    phone: '',
    password: ''
  };

  const [currentUser, setCurrentUser] = useState<Employee | null>(defaultUser);
  const [employees, setEmployees] = useState<Employee[]>(() => db.employees.getAll());
  
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // -- INITIALIZE STATE FROM DB SERVICE --
  const [products, setProducts] = useState<Product[]>(() => db.products.getAll());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => db.suppliers.getAll());
  const [customers, setCustomers] = useState<Customer[]>(() => db.customers.getAll());
  const [sales, setSales] = useState<Sale[]>(() => db.sales.getAll());
  const [expenses, setExpenses] = useState<Expense[]>(() => db.expenses.getAll());
  const [quotations, setQuotations] = useState<Quotation[]>(() => db.quotations.getAll());
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(() => db.config.get());
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(() => db.logs.getAll());

  // -- PERSIST CHANGES TO DB SERVICE --
  useEffect(() => { db.products.set(products); }, [products]);
  useEffect(() => { db.suppliers.set(suppliers); }, [suppliers]);
  useEffect(() => { db.sales.set(sales); }, [sales]);
  useEffect(() => { db.expenses.set(expenses); }, [expenses]);
  useEffect(() => { db.customers.set(customers); }, [customers]);
  useEffect(() => { db.employees.set(employees); }, [employees]);
  useEffect(() => { db.quotations.set(quotations); }, [quotations]);
  useEffect(() => { db.config.set(businessConfig); }, [businessConfig]);
  useEffect(() => { db.logs.set(inventoryLogs); }, [inventoryLogs]);

  // -- APPLY THEME & LANGUAGE --
  useEffect(() => {
    // Theme
    if (businessConfig.theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    // Language
    document.documentElement.lang = businessConfig.language || 'es';
  }, [businessConfig.theme, businessConfig.language]);

  // -- BUSINESS LOGIC --
  const handleCompleteSale = (newSale: Sale) => {
    setSales(prev => [...prev, newSale]);
    // Reduce Stock Automatically
    setProducts(prevProducts => prevProducts.map(p => {
      const itemInCart = newSale.items.find(item => item.id === p.id);
      if (itemInCart) {
        // Log the automatic stock reduction
        const log: InventoryLog = {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          productId: p.id,
          productName: p.name,
          type: 'VENTA',
          quantity: -itemInCart.quantity,
          userId: currentUser?.id || 'system',
          userName: currentUser?.name || 'Sistema POS'
        };
        setInventoryLogs(prev => [log, ...prev]);

        return { ...p, stock: p.stock - itemInCart.quantity };
      }
      return p;
    }));
  };

  const handleDeleteSale = (saleId: string) => {
    if (confirm('¿Está seguro de eliminar esta venta del historial? Esta acción no devuelve el stock automáticamente.')) {
      setSales(prev => prev.filter(s => s.id !== saleId));
    }
  };

  const currentLang = businessConfig.language || 'es';

  const renderView = () => {
    switch(currentView) {
      case 'DASHBOARD':
        return <Dashboard sales={sales} expenses={expenses} products={products} lang={currentLang} />;
      case 'INVENTORY':
        return <Inventory 
          products={products} 
          suppliers={suppliers} 
          setProducts={setProducts} 
          inventoryLogs={inventoryLogs}
          setInventoryLogs={setInventoryLogs}
          currentUser={currentUser}
          lang={currentLang}
        />;
      case 'POS':
        return <POS 
          products={products} 
          customers={customers} 
          onCompleteSale={handleCompleteSale} 
          setExpenses={setExpenses}
          quotations={quotations}
          setQuotations={setQuotations}
          businessConfig={businessConfig}
          currentUser={currentUser}
          lang={currentLang}
        />;
      case 'STORE':
        return <WhatsAppStore products={products} config={businessConfig} />;
      case 'EXPENSES':
        return <Expenses expenses={expenses} setExpenses={setExpenses} currentUser={currentUser} />;
      case 'SALES_HISTORY':
        return <SalesHistory sales={sales} onDeleteSale={handleDeleteSale} currentUser={currentUser} />;
      case 'SUPPLIERS':
        return <Suppliers suppliers={suppliers} setSuppliers={setSuppliers} currentUser={currentUser} />;
      case 'CUSTOMERS':
        return <Customers customers={customers} setCustomers={setCustomers} currentUser={currentUser} />;
      case 'EMPLOYEES':
        return <Employees employees={employees} setEmployees={setEmployees} currentUser={currentUser} />;
      case 'TOOLS':
        return <Tools products={products} />;
      case 'SETTINGS':
        return <Settings config={businessConfig} setConfig={setBusinessConfig} lang={currentLang} />;
      default:
        return <Dashboard sales={sales} expenses={expenses} products={products} lang={currentLang} />;
    }
  };

  return (
    <div className="flex h-[100dvh] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden fixed w-full top-0 z-30 bg-white dark:bg-slate-800 text-slate-800 dark:text-white p-4 flex justify-between items-center shadow-sm border-b border-slate-200 dark:border-slate-700 h-16">
        <span className="font-bold text-lg flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-400 rounded-md flex items-center justify-center text-xs overflow-hidden">
                 {businessConfig.logo ? <img src={businessConfig.logo} alt="Logo" className="w-full h-full object-cover" /> : "GP"}
            </div>
            {businessConfig.name}
        </span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar (Desktop & Mobile) */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
            currentView={currentView} 
            setView={(v) => { setCurrentView(v); setMobileMenuOpen(false); }} 
            businessConfig={businessConfig}
            currentUser={currentUser}
            lang={currentLang}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto md:ml-64 pt-16 md:pt-0 h-full w-full relative custom-scrollbar">
        {/* Top Bar for Desktop User Profile */}
        <div className="hidden md:flex absolute top-4 right-4 z-30 gap-3">
             <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                {currentUser?.name}
             </div>
        </div>

        {renderView()}
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default App;