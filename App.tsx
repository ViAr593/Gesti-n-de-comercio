
import React, { useState, useEffect } from 'react';
import { Product, Sale, Supplier, Expense, ViewState, Customer, Employee } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { POS } from './components/POS';
import { SalesHistory } from './components/SalesHistory';
import { Suppliers } from './components/Suppliers';
import { Expenses } from './components/Expenses';
import { Customers } from './components/Customers';
import { Employees } from './components/Employees';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // -- STATE MOCKED PERSISTENCE --
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Laptop Gaming', description: 'Alta potencia', price: 1200, cost: 800, stock: 5, minStock: 2, category: 'Electrónica', supplierId: 's1', measurementUnit: 'UNIDAD', measurementValue: 1 },
      { id: '2', name: 'Coca Cola', description: 'Refresco', price: 2, cost: 1, stock: 50, minStock: 10, category: 'Bebidas', supplierId: 's1', measurementUnit: 'ML', measurementValue: 500 }
    ];
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('suppliers');
    return saved ? JSON.parse(saved) : [
      { id: 's1', name: 'TechDistribuidora S.A.', contactName: 'Juan Pérez', phone: '555-1234', email: 'ventas@tech.com' }
    ];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : [
      { id: 'c1', name: 'Consumidor Final', taxId: '999999999', email: '', phone: '', address: '' }
    ];
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('employees');
    return saved ? JSON.parse(saved) : [
      { id: 'e1', name: 'Admin', email: 'admin@gestorpro.com', phone: '', role: 'GERENTE_GENERAL' }
    ];
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  // -- LOGIC --
  const handleCompleteSale = (newSale: Sale) => {
    setSales(prev => [...prev, newSale]);
    // Reduce Stock
    setProducts(prevProducts => prevProducts.map(p => {
      const itemInCart = newSale.items.find(item => item.id === p.id);
      if (itemInCart) {
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

  const renderView = () => {
    switch(currentView) {
      case 'DASHBOARD':
        return <Dashboard sales={sales} expenses={expenses} products={products} />;
      case 'INVENTORY':
        return <Inventory products={products} suppliers={suppliers} setProducts={setProducts} />;
      case 'POS':
        return <POS 
          products={products} 
          customers={customers} 
          onCompleteSale={handleCompleteSale} 
          setExpenses={setExpenses} // Passed prop
        />;
      case 'EXPENSES':
        return <Expenses expenses={expenses} setExpenses={setExpenses} />;
      case 'SALES_HISTORY':
        return <SalesHistory sales={sales} onDeleteSale={handleDeleteSale} />;
      case 'SUPPLIERS':
        return <Suppliers suppliers={suppliers} setSuppliers={setSuppliers} />;
      case 'CUSTOMERS':
        return <Customers customers={customers} setCustomers={setCustomers} />;
      case 'EMPLOYEES':
        return <Employees employees={employees} setEmployees={setEmployees} />;
      default:
        return <Dashboard sales={sales} expenses={expenses} products={products} />;
    }
  };

  return (
    <div className="flex h-[100dvh] bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed w-full top-0 z-30 bg-white text-slate-800 p-4 flex justify-between items-center shadow-sm border-b border-slate-200 h-16">
        <span className="font-bold text-lg flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-400 rounded-md flex items-center justify-center text-xs">GP</div>
            GestorPro
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
        <Sidebar currentView={currentView} setView={(v) => { setCurrentView(v); setMobileMenuOpen(false); }} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto md:ml-64 pt-16 md:pt-0 h-full w-full relative">
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
