
import React, { useState } from 'react';
import { Product, BusinessConfig, CartItem } from '../types';
import { Search, ShoppingBag, Plus, Minus, Trash2, Send, MessageCircle, X, ImageIcon, Phone } from 'lucide-react';

interface WhatsAppStoreProps {
  products: Product[];
  config: BusinessConfig;
}

export const WhatsAppStore: React.FC<WhatsAppStoreProps> = ({ products, config }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort()];

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, discount: 0 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
        if (item.id === id) {
            const newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQty };
        }
        return item;
    }));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSendOrder = () => {
    if (cart.length === 0) return;
    
    if (!config.whatsapp) {
        alert("Por favor configure el número de WhatsApp del negocio en Configuración.");
        return;
    }

    // Build the message
    let message = `Hola *${config.name}*, me gustaría realizar el siguiente pedido:\n\n`;
    
    cart.forEach(item => {
        message += `▪️ ${item.quantity}x ${item.name} ($${item.price.toFixed(2)})\n`;
    });
    
    message += `\n*TOTAL: ${config.currencySymbol || '$'}${calculateTotal().toFixed(2)}*\n\n`;
    
    if (customerName) message += `👤 Cliente: ${customerName}\n`;
    if (customerAddress) message += `📍 Dirección: ${customerAddress}\n`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${config.whatsapp}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory && p.stock > 0;
  });

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-900 relative">
      {/* Store Header */}
      <div className="bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 shadow-sm z-20 sticky top-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                    <ShoppingBag size={20} />
                </div>
                <div>
                    <h1 className="font-bold text-lg text-slate-800 dark:text-white leading-none">Catálogo Digital</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Selecciona productos y envía tu pedido</p>
                </div>
            </div>
            
            <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
                <ShoppingBag size={24} className="text-slate-700 dark:text-slate-200" />
                {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800">
                        {cart.length}
                    </span>
                )}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="h-full flex flex-col max-w-7xl mx-auto">
            {/* Filters */}
            <div className="p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input 
                        type="text" 
                        placeholder="¿Qué estás buscando?"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
                    />
                </div>
                <div className="overflow-x-auto pb-2 md:pb-0 flex gap-2 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
                        >
                            {cat === 'ALL' ? 'Todo' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-24">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col group hover:border-green-400 transition-colors">
                            <div className="aspect-square bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                        <ImageIcon size={32} />
                                    </div>
                                )}
                                <button 
                                    onClick={() => addToCart(product)}
                                    className="absolute bottom-3 right-3 w-10 h-10 bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-all transform translate-y-full group-hover:translate-y-0"
                                >
                                    <Plus size={24} />
                                </button>
                            </div>
                            <div className="p-3 flex-1 flex flex-col">
                                <h3 className="font-bold text-slate-800 dark:text-white leading-tight mb-1 line-clamp-2">{product.name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{product.description}</p>
                                <div className="mt-auto flex justify-between items-center">
                                    <span className="font-bold text-lg text-slate-900 dark:text-green-400">${product.price.toFixed(2)}</span>
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-500 dark:text-slate-300">
                                        {product.measurementValue} {product.measurementUnit}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Cart Drawer / Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <h2 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                        <ShoppingBag className="text-green-600" /> Tu Pedido
                    </h2>
                    <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-50">
                            <ShoppingBag size={64} strokeWidth={1} />
                            <p>Tu carrito está vacío</p>
                            <button onClick={() => setIsCartOpen(false)} className="text-green-600 font-bold hover:underline">
                                Ver Productos
                            </button>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex gap-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={20}/></div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-white line-clamp-1">{item.name}</h4>
                                        <p className="text-sm font-bold text-green-600">${item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded shadow-sm text-slate-600 dark:text-white"><Minus size={14}/></button>
                                            <span className="text-sm font-bold w-4 text-center dark:text-white">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded shadow-sm text-slate-600 dark:text-white"><Plus size={14}/></button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-2">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tu Nombre (Opcional)</label>
                                <input 
                                    type="text" 
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                    placeholder="Ej. Juan Pérez"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none text-sm"
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección / Notas (Opcional)</label>
                                <textarea 
                                    value={customerAddress}
                                    onChange={e => setCustomerAddress(e.target.value)}
                                    rows={2}
                                    placeholder="Ej. Calle 123, Entregar por la tarde..."
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none text-sm resize-none"
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-4 text-lg">
                            <span className="font-bold text-slate-600 dark:text-slate-400">Total a Pagar</span>
                            <span className="font-extrabold text-2xl text-slate-900 dark:text-white">${calculateTotal().toFixed(2)}</span>
                        </div>

                        <button 
                            onClick={handleSendOrder}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
                        >
                            <MessageCircle size={24} />
                            Enviar Pedido por WhatsApp
                        </button>
                        <p className="text-center text-xs text-slate-400 mt-3">
                            Serás redirigido a WhatsApp para confirmar el envío.
                        </p>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};
