
import React, { useState } from 'react';
import { Product, CartItem, Sale, Customer, Expense, Quotation, BusinessConfig } from '../types';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, Smartphone, Printer, X, User, CheckCircle, Edit, Tag, Wallet, RefreshCw, ChevronUp, ChevronDown, FileText, Download } from 'lucide-react';

interface POSProps {
  products: Product[];
  customers?: Customer[];
  onCompleteSale: (sale: Sale) => void;
  setExpenses?: React.Dispatch<React.SetStateAction<Expense[]>>;
  quotations?: Quotation[];
  setQuotations?: React.Dispatch<React.SetStateAction<Quotation[]>>;
  businessConfig?: BusinessConfig;
}

export const POS: React.FC<POSProps> = ({ products, customers = [], onCompleteSale, setExpenses, quotations, setQuotations, businessConfig }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'>('EFECTIVO');
  const [showReceipt, setShowReceipt] = useState<Sale | null>(null);
  
  // Mobile Cart State
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Edit Item Modal State
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editQty, setEditQty] = useState<string>('');
  const [editDiscount, setEditDiscount] = useState<string>('');

  // Manual Item State
  const [showManualItemModal, setShowManualItemModal] = useState(false);
  const [manualItemName, setManualItemName] = useState('Item Manual');
  const [manualItemPrice, setManualItemPrice] = useState('');

  // Quick Expense State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseData, setExpenseData] = useState({ description: '', amount: '', category: 'Operativo' });

  // Quotation State
  const [showQuotationsModal, setShowQuotationsModal] = useState(false);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, discount: 0 }];
    });
  };

  const addManualItem = () => {
    const price = parseFloat(manualItemPrice);
    if (!manualItemName || isNaN(price) || price <= 0) return;

    const newItem: CartItem = {
      id: `manual-${Date.now()}`,
      name: manualItemName,
      price: price,
      cost: 0,
      stock: 9999,
      minStock: 0,
      category: 'General',
      supplierId: '',
      measurementUnit: 'UNIDAD',
      measurementValue: 1,
      description: 'Ingreso manual',
      quantity: 1,
      discount: 0
    };

    setCart(prev => [...prev, newItem]);
    setShowManualItemModal(false);
    setManualItemName('Item Manual');
    setManualItemPrice('');
  };

  const updateCartItem = (id: string, updates: Partial<CartItem>) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setCustomerSearch('');
    setPaymentMethod('EFECTIVO');
  };

  const resetSale = () => {
    if (cart.length > 0) {
      if (confirm('¿Reiniciar venta? Se borrarán los items actuales.')) {
        clearCart();
      }
    } else {
      clearCart();
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + ((item.price - (item.discount || 0)) * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const sale: Sale = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      total: calculateTotal(),
      items: [...cart],
      paymentMethod,
      customerName: selectedCustomer ? selectedCustomer.name : (customerSearch.trim() || 'Consumidor Final'),
      customerId: selectedCustomer?.id
    };
    onCompleteSale(sale);
    setShowReceipt(sale);
    clearCart();
    setIsMobileCartOpen(false);
  };

  const handleCreateQuotation = () => {
    if (cart.length === 0 || !setQuotations) return;
    const customerName = selectedCustomer ? selectedCustomer.name : (customerSearch.trim() || 'Cliente General');
    
    const quotation: Quotation = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        total: calculateTotal(),
        items: [...cart],
        customerName: customerName,
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
    
    setQuotations(prev => [quotation, ...prev]);
    alert('Cotización guardada exitosamente.');
    clearCart();
  };

  const loadQuotation = (q: Quotation) => {
    if (cart.length > 0) {
        if (!confirm('¿Cargar cotización? Esto reemplazará el carrito actual.')) return;
    }
    setCart(q.items);
    setCustomerSearch(q.customerName || '');
    setShowQuotationsModal(false);
    setIsMobileCartOpen(true);
  };

  const handleCreateExpense = () => {
    if (!setExpenses) return;
    const amount = parseFloat(expenseData.amount);
    if (!expenseData.description || isNaN(amount) || amount <= 0) return;

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      description: expenseData.description,
      amount: amount,
      category: expenseData.category
    };

    setExpenses(prev => [newExpense, ...prev]);
    setExpenseData({ description: '', amount: '', category: 'Operativo' });
    setShowExpenseModal(false);
    alert('Gasto registrado correctamente');
  };

  // Edit Modal Handlers
  const openEditModal = (item: CartItem) => {
    setEditingItem(item);
    setEditPrice(item.price.toString());
    setEditQty(item.quantity.toString());
    setEditDiscount(item.discount ? item.discount.toString() : '0');
  };

  const saveEditItem = () => {
    if (!editingItem) return;
    const price = parseFloat(editPrice);
    const qty = parseFloat(editQty);
    const disc = parseFloat(editDiscount);
    
    if (!isNaN(price) && !isNaN(qty) && qty > 0) {
      updateCartItem(editingItem.id, { 
        price, 
        quantity: qty,
        discount: isNaN(disc) ? 0 : disc 
      });
    }
    setEditingItem(null);
  };

  const filteredProducts = products.filter(p => 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    p.stock > 0
  );

  const filteredCustomers = customerSearch.length > 0 && !selectedCustomer
    ? customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.taxId.includes(customerSearch))
    : [];

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
  };

  // Calculations for Mobile Summary
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = calculateTotal();

  // Receipt Modal Component (Reused logic)
  if (showReceipt) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full relative overflow-hidden flex flex-col max-h-[90vh]">
          {/* Receipt Header */}
          <div className="bg-slate-900 text-white p-4 text-center relative print:bg-white print:text-black">
            <button onClick={() => setShowReceipt(null)} className="absolute top-4 right-4 p-1 hover:bg-slate-800 rounded-full print:hidden">
              <X size={20} className="text-white" />
            </button>
            <h2 className="text-xl font-bold uppercase tracking-widest">NOTA DE VENTA</h2>
            <p className="text-xs text-slate-400 mt-1">GestorPro Business</p>
          </div>
          
          <div className="p-6 overflow-y-auto font-mono text-sm bg-white">
            <div className="text-center mb-6 pb-4 border-b border-dashed border-slate-300">
              {businessConfig?.logo && (
                  <img src={businessConfig.logo} alt="Logo" className="h-12 mx-auto mb-2 opacity-80 grayscale" />
              )}
              <p className="font-bold text-lg">{businessConfig?.name || 'Mi Negocio Local'}</p>
              <p className="text-slate-500">ID: {businessConfig?.taxId || '999999999'}</p>
              <p className="text-slate-500">{businessConfig?.address || 'Dirección General'}</p>
              <p className="text-slate-500">{businessConfig?.phone}</p>
            </div>

            <div className="mb-4 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">N° Orden:</span>
                <span className="font-bold">{showReceipt.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha:</span>
                <span>{new Date(showReceipt.date).toLocaleDateString()} {new Date(showReceipt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente:</span>
                <span className="font-bold truncate max-w-[150px]">{showReceipt.customerName}</span>
              </div>
            </div>

            <table className="w-full mb-4">
              <thead className="border-b border-slate-300">
                <tr className="text-left text-xs text-slate-500">
                  <th className="pb-2">CANT</th>
                  <th className="pb-2">DESC</th>
                  <th className="pb-2 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-200">
                {showReceipt.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 align-top">
                        <div>{item.quantity.toFixed(2)}</div>
                    </td>
                    <td className="py-2 align-top pr-2">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-slate-400">
                          ${item.price.toFixed(2)}
                          {item.discount ? <span className="text-red-500 ml-1">(-${item.discount})</span> : ''}
                      </div>
                    </td>
                    <td className="py-2 align-top text-right font-medium">
                        ${((item.price - (item.discount || 0)) * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-slate-800 pt-4 space-y-2">
              <div className="flex justify-between font-bold text-xl text-slate-900 border-t border-dashed border-slate-300 pt-2 mt-2">
                <span>TOTAL</span>
                <span>${showReceipt.total.toFixed(2)}</span>
              </div>
            </div>
            
            {businessConfig?.receiptMessage && (
                <div className="mt-8 text-center text-xs text-slate-500 italic">
                    {businessConfig.receiptMessage}
                </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3 print:hidden">
            <button onClick={() => window.print()} className="flex-1 bg-slate-900 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 font-medium">
              <Printer size={18} /> Imprimir
            </button>
            <button onClick={() => setShowReceipt(null)} className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-lg hover:bg-slate-100 font-medium">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row bg-slate-100 overflow-hidden relative">
      {/* Product Grid Section */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* ACTION HEADER */}
        <div className="p-3 md:p-4 bg-white border-b border-slate-200 shadow-sm z-10 flex flex-col md:flex-row gap-3">
          <div className="flex gap-2 justify-between md:justify-start">
             <button 
              onClick={resetSale}
              className="flex-1 md:flex-none px-3 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 flex items-center justify-center gap-2 whitespace-nowrap border border-slate-300 transition-colors text-sm md:text-base bg-white"
            >
              <RefreshCw size={16} /> <span className="hidden sm:inline">Nueva Venta</span>
            </button>
            <button 
              onClick={() => setShowQuotationsModal(true)}
              className="flex-1 md:flex-none px-3 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 whitespace-nowrap border border-blue-200 transition-colors text-sm md:text-base"
            >
              <FileText size={16} /> <span className="hidden sm:inline">Ver Cotizaciones</span>
            </button>
             <button 
              onClick={() => setShowExpenseModal(true)}
              className="flex-1 md:flex-none px-3 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 flex items-center justify-center gap-2 whitespace-nowrap border border-red-200 transition-colors text-sm md:text-base"
            >
              <Wallet size={16} /> <span className="hidden sm:inline">Gasto</span>
            </button>
            <button 
                onClick={() => setShowManualItemModal(true)}
                className="flex-1 md:flex-none px-3 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 flex items-center justify-center gap-2 whitespace-nowrap md:hidden text-sm md:text-base bg-white"
            >
                <Tag size={16} /> Manual
            </button>
          </div>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowManualItemModal(true)}
            className="hidden md:flex px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 items-center gap-2 whitespace-nowrap bg-white"
          >
            <Tag size={18} /> Item Manual
          </button>
        </div>
        
        {/* Scrollable Product Grid */}
        <div className="flex-1 overflow-y-auto p-3 bg-slate-100/50 pb-24 md:pb-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map(product => (
              <button 
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-amber-300 transition-all text-left flex flex-col h-36 md:h-40 justify-between group relative overflow-hidden active:scale-95 duration-100"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-amber-400 transition-colors"></div>
                <div className="pl-2">
                  <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight text-sm mb-1">{product.name}</h3>
                  <p className="text-[10px] md:text-xs text-slate-500 mb-1">{product.category}</p>
                  <span className="text-[10px] font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                    {product.measurementValue} {product.measurementUnit}
                  </span>
                </div>
                <div className="pl-2 flex justify-between items-end">
                  <span className="text-slate-900 font-bold text-base md:text-lg">${product.price.toFixed(2)}</span>
                  <span className="text-[10px] md:text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Stock: {product.stock}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar / Mobile Drawer */}
      <div className={`
        fixed inset-0 z-50 bg-white flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:z-0 md:transform-none md:w-96 md:border-l md:border-slate-200 md:shadow-xl
        ${isMobileCartOpen ? 'translate-y-0' : 'translate-y-[110%] md:translate-y-0'}
      `}>
        {/* Mobile Handle / Header */}
        <div className="md:hidden bg-slate-50 p-2 flex justify-center border-t border-slate-200" onClick={() => setIsMobileCartOpen(false)}>
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-1"></div>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <ShoppingCart size={20} className="text-amber-500" /> Venta Actual
          </h2>
          <div className="flex items-center gap-2">
             <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
              {cart.reduce((acc, item) => acc + item.quantity, 0).toFixed(2).replace(/\.00$/, '')} items
            </span>
            {cart.length > 0 && (
              <button onClick={resetSale} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Vaciar Carrito">
                <Trash2 size={18} />
              </button>
            )}
            <button className="md:hidden p-2 text-slate-400" onClick={() => setIsMobileCartOpen(false)}>
                <ChevronDown size={24}/>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
              <div className="p-4 bg-slate-50 rounded-full">
                <ShoppingCart size={40} />
              </div>
              <p className="font-medium">Agrega productos</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm group hover:border-blue-300 transition-colors">
                <div 
                  className="flex-1 min-w-0 mr-2 cursor-pointer"
                  onClick={() => openEditModal(item)}
                >
                  <h4 className="font-medium text-slate-800 truncate text-sm flex items-center gap-1">
                    {item.name} <Edit size={12} className="text-slate-300 group-hover:text-blue-500"/>
                  </h4>
                  <div className="text-xs text-slate-500 font-mono">
                    ${item.price.toFixed(2)} x {item.quantity.toFixed(2)}
                    {item.discount ? <span className="text-red-500 ml-1">(-${item.discount})</span> : ''}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-bold text-slate-800">
                    ${((item.price - (item.discount || 0)) * item.quantity).toFixed(2)}
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-300 hover:text-red-500 p-1 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-8 md:pb-4">
           <div className="mb-4 relative">
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Cliente</label>
            <div className="relative">
              <User size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${selectedCustomer ? 'text-green-600' : 'text-slate-400'}`} />
              <input 
                type="text"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  if (selectedCustomer) setSelectedCustomer(null);
                }}
                placeholder="Buscar cliente..."
                className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all ${selectedCustomer ? 'border-green-500 bg-green-50 text-green-900 font-medium' : 'border-slate-200'}`}
              />
              {selectedCustomer && (
                <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />
              )}
            </div>
            
            {/* Customer Autocomplete Dropdown */}
            {filteredCustomers.length > 0 && (
              <div className="absolute bottom-full left-0 w-full bg-white border border-slate-200 rounded-lg shadow-xl mb-1 max-h-40 overflow-y-auto z-50">
                {filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => selectCustomer(c)}
                    className="w-full text-left px-4 py-2 hover:bg-amber-50 text-sm border-b border-slate-50 last:border-0"
                  >
                    <div className="font-bold text-slate-800">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.taxId}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Método de Pago</label>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setPaymentMethod('EFECTIVO')}
                className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 text-xs transition-all ${paymentMethod === 'EFECTIVO' ? 'bg-amber-50 border-amber-500 text-amber-800 font-bold' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                <Banknote size={18} /> Efectivo
              </button>
              <button 
                onClick={() => setPaymentMethod('TARJETA')}
                className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 text-xs transition-all ${paymentMethod === 'TARJETA' ? 'bg-amber-50 border-amber-500 text-amber-800 font-bold' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                <CreditCard size={18} /> Tarjeta
              </button>
              <button 
                onClick={() => setPaymentMethod('TRANSFERENCIA')}
                className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 text-xs transition-all ${paymentMethod === 'TRANSFERENCIA' ? 'bg-amber-50 border-amber-500 text-amber-800 font-bold' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                <Smartphone size={18} /> Transf.
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-end mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-600 font-medium text-sm">Total a Cobrar</span>
            <span className="text-3xl font-bold text-slate-800 tracking-tight">${calculateTotal().toFixed(2)}</span>
          </div>
          
          <div className="flex gap-2">
            <button 
                onClick={handleCreateQuotation}
                disabled={cart.length === 0}
                className="flex-1 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-300 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all flex justify-center items-center gap-2"
                title="Guardar como Cotización (No descuenta stock)"
            >
                <FileText size={18} /> Cotizar
            </button>
            <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="flex-[2] bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-slate-900/10 transition-all flex justify-center items-center gap-2"
            >
                Emitir Nota
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY FOOTER SUMMARY */}
      <div 
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.2)] z-40 flex items-center justify-between cursor-pointer transition-transform duration-300 ${isMobileCartOpen ? 'translate-y-full' : 'translate-y-0'}`}
        onClick={() => setIsMobileCartOpen(true)}
      >
        <div className="flex flex-col">
            <span className="text-xs text-slate-400">{totalItems.toFixed(2).replace(/\.00$/, '')} articulos</span>
            <span className="font-bold text-xl">${totalAmount.toFixed(2)}</span>
        </div>
        <button className="bg-amber-400 text-slate-900 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20">
            Ver Carrito <ChevronUp size={16}/>
        </button>
      </div>

      {/* Manual Item Modal */}
      {showManualItemModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-xl font-bold mb-4">Item Manual</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Concepto</label>
                <input 
                  autoFocus
                  type="text" 
                  value={manualItemName}
                  onChange={e => setManualItemName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Precio Unitario</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={manualItemPrice}
                    onChange={e => setManualItemPrice(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowManualItemModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button onClick={addManualItem} className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">Agregar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 border-2 border-red-500">
            <h3 className="text-xl font-bold mb-4 text-red-600 flex items-center gap-2">
                <Wallet size={24}/> Registrar Gasto
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Concepto</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Ej. Pago Proveedor, Almuerzo..."
                  value={expenseData.description}
                  onChange={e => setExpenseData({...expenseData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monto ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={expenseData.amount}
                  onChange={e => setExpenseData({...expenseData, amount: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-bold text-lg"
                />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select 
                    value={expenseData.category}
                    onChange={e => setExpenseData({...expenseData, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                  >
                    {['Operativo', 'Mercadería', 'Servicios', 'Otros'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowExpenseModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button onClick={handleCreateExpense} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Guardar Gasto</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-slate-800 pr-4">{editingItem.name}</h3>
              <button onClick={() => setEditingItem(null)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
            </div>
            
            <div className="space-y-6">
              {/* Quantity Control */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cantidad</label>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditQty(q => Math.max(0.01, parseFloat(q || '0') - 1).toFixed(2))}
                    className="p-3 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600"
                  >
                    <Minus size={20}/>
                  </button>
                  <input 
                    type="number" 
                    step="0.01"
                    value={editQty}
                    onChange={e => setEditQty(e.target.value)}
                    className="flex-1 text-center py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none font-bold text-xl"
                  />
                  <button 
                    onClick={() => setEditQty(q => (parseFloat(q || '0') + 1).toFixed(2))}
                    className="p-3 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600"
                  >
                    <Plus size={20}/>
                  </button>
                </div>
              </div>

              {/* Price Control */}
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Precio Unitario ($)</label>
                    <input 
                        type="number" 
                        step="0.01"
                        value={editPrice}
                        onChange={e => setEditPrice(e.target.value)}
                        className="w-full text-center py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none font-bold text-lg text-slate-800"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 text-red-500">Descuento ($)</label>
                    <input 
                        type="number" 
                        step="0.01"
                        value={editDiscount}
                        onChange={e => setEditDiscount(e.target.value)}
                        className="w-full text-center py-2 border-2 border-red-100 rounded-lg focus:border-red-500 outline-none font-bold text-lg text-red-600"
                    />
                 </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg text-center">
                  <span className="text-xs text-slate-500 uppercase font-bold">Total Renglón</span>
                  <div className="text-2xl font-bold text-slate-900">
                      ${((parseFloat(editPrice || '0') - parseFloat(editDiscount || '0')) * parseFloat(editQty || '0')).toFixed(2)}
                  </div>
              </div>

              <button 
                onClick={saveEditItem}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-900/10"
              >
                Actualizar Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quotations List Modal */}
      {showQuotationsModal && quotations && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2"><FileText size={20}/> Cotizaciones Guardadas</h3>
                    <button onClick={() => setShowQuotationsModal(false)}><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {quotations.length === 0 ? (
                        <p className="text-center text-slate-400 py-8">No hay cotizaciones guardadas.</p>
                    ) : (
                        quotations.map(q => (
                            <div key={q.id} className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-slate-800">{q.customerName}</p>
                                    <p className="text-xs text-slate-500">{new Date(q.date).toLocaleDateString()} - {q.items.length} items</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-900">${q.total.toFixed(2)}</span>
                                    <button 
                                        onClick={() => loadQuotation(q)}
                                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                                        title="Cargar Cotización al Carrito"
                                    >
                                        <Download size={16}/>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};