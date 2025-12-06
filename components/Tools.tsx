
import React, { useState, useEffect } from 'react';
import { Calculator, Percent, CheckSquare, Banknote, Trash2, Plus, ArrowRight, MapPin, Database, Copy, Code, FileCode } from 'lucide-react';
import { Product } from '../types';

interface ToolsProps {
    products?: Product[];
}

export const Tools: React.FC<ToolsProps> = ({ products = [] }) => {
  const [activeTab, setActiveTab] = useState<'PRICE' | 'DISCOUNT' | 'TODO' | 'CHANGE' | 'MAP' | 'DB' | 'CODE'>('PRICE');
  const [codeLanguage, setCodeLanguage] = useState<'PYTHON' | 'JAVA'>('PYTHON');

  // State for Price Calculator
  const [cost, setCost] = useState('');
  const [margin, setMargin] = useState('');
  
  // State for Discount Calculator
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');

  // State for ToDo List
  const [tasks, setTasks] = useState<{id: number, text: string, done: boolean}[]>([]);
  const [newTask, setNewTask] = useState('');

  // State for Change Calculator
  const [totalToPay, setTotalToPay] = useState('');
  const [amountPaid, setAmountPaid] = useState('');

  // State for Map
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState('');

  // --- Handlers ---
  
  // Price Calc
  const calculatedPrice = cost && margin 
    ? (parseFloat(cost) * (1 + parseFloat(margin) / 100)).toFixed(2)
    : '0.00';
  const profit = cost && margin
    ? (parseFloat(cost) * (parseFloat(margin) / 100)).toFixed(2)
    : '0.00';

  // Discount Calc
  const finalDiscountPrice = originalPrice && discountPercent
    ? (parseFloat(originalPrice) * (1 - parseFloat(discountPercent) / 100)).toFixed(2)
    : '0.00';
  const savedAmount = originalPrice && discountPercent
    ? (parseFloat(originalPrice) * (parseFloat(discountPercent) / 100)).toFixed(2)
    : '0.00';

  // ToDo Handlers
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, done: false }]);
    setNewTask('');
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Change Calc
  const changeDue = totalToPay && amountPaid
    ? (parseFloat(amountPaid) - parseFloat(totalToPay)).toFixed(2)
    : '0.00';

  // Map Location
  useEffect(() => {
    if (activeTab === 'MAP' && !location) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (err) => {
                    setLocationError('No se pudo obtener la ubicación. Asegúrese de dar permisos.');
                }
            );
        } else {
            setLocationError('Geolocalización no soportada en este navegador.');
        }
    }
  }, [activeTab]);

  // Generate MySQL Schema
  const generateSQL = () => {
    const tableProducts = `
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 0,
    category VARCHAR(100),
    supplier_id VARCHAR(50),
    measurement_unit VARCHAR(10),
    measurement_value DECIMAL(10,2)
);`;

    const insertProducts = products.map(p => 
        `INSERT INTO products (id, name, price, cost, stock, category) VALUES ('${p.id}', '${p.name.replace(/'/g, "''")}', ${p.price}, ${p.cost}, ${p.stock}, '${p.category}');`
    ).join('\n');

    return `-- MySQL Database Schema & Data Export\n${tableProducts}\n\n-- Current Data\n${insertProducts}`;
  };

  // Generate Application Code (Python/Java)
  const generateAppCode = () => {
    if (codeLanguage === 'PYTHON') {
        return `# Python Data Models for GestorPro
from dataclasses import dataclass
from typing import List, Optional
import datetime

@dataclass
class Product:
    id: str
    name: str
    description: str
    price: float
    cost: float
    stock: int
    min_stock: int
    category: str
    supplier_id: str
    measurement_unit: str
    measurement_value: float

@dataclass
class SaleItem:
    product_id: str
    quantity: float
    discount: float
    subtotal: float

@dataclass
class Sale:
    id: str
    date: datetime.datetime
    total: float
    items: List[SaleItem]
    payment_method: str
    customer_name: str

# Example Service Logic
class InventoryService:
    def __init__(self):
        self.products = []

    def add_product(self, product: Product):
        self.products.append(product)
        print(f"Product {product.name} added.")

    def check_stock(self):
        low_stock = [p for p in self.products if p.stock <= p.min_stock]
        return low_stock

# Usage Example
if __name__ == "__main__":
    p1 = Product("1", "Laptop", "Gaming Laptop", 1200.0, 900.0, 5, 2, "Electronics", "s1", "UNIT", 1)
    service = InventoryService()
    service.add_product(p1)
`;
    } else {
        return `// Java POJOs for GestorPro
import java.util.List;
import java.util.Date;
import java.math.BigDecimal;

public class Product {
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal cost;
    private int stock;
    private int minStock;
    private String category;
    
    // Constructors, Getters and Setters
    public Product(String id, String name, BigDecimal price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }
    
    public BigDecimal calculateProfit() {
        return this.price.subtract(this.cost);
    }
}

public class Sale {
    private String id;
    private Date date;
    private BigDecimal total;
    private List<Product> items;
    private String paymentMethod;
    
    public void processSale() {
        // Logic to deduct stock and save transaction
        System.out.println("Processing sale ID: " + this.id);
    }
}

// Spring Boot Controller Example
/*
@RestController
@RequestMapping("/api/products")
public class ProductController {
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.findAll();
    }
}
*/
`;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
       <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Herramientas & Utilidades</h2>
          <p className="text-slate-500 text-sm">Calculadoras, ayudas y herramientas para desarrolladores</p>
       </div>

       {/* Tabs Navigation */}
       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-8">
          <button 
            onClick={() => setActiveTab('PRICE')}
            className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border ${activeTab === 'PRICE' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/20' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
          >
            <Calculator size={24} />
            <span className="font-bold text-xs md:text-sm">Calc. Precios</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('DISCOUNT')}
            className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border ${activeTab === 'DISCOUNT' ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-900/20' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
          >
            <Percent size={24} />
            <span className="font-bold text-xs md:text-sm">Descuentos</span>
          </button>

          <button 
            onClick={() => setActiveTab('TODO')}
            className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border ${activeTab === 'TODO' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-900/20' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
          >
            <CheckSquare size={24} />
            <span className="font-bold text-xs md:text-sm">Tareas</span>
          </button>

          <button 
            onClick={() => setActiveTab('CHANGE')}
            className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border ${activeTab === 'CHANGE' ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-900/20' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
          >
            <Banknote size={24} />
            <span className="font-bold text-xs md:text-sm">Calc. Cambio</span>
          </button>

          <button 
            onClick={() => setActiveTab('MAP')}
            className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border ${activeTab === 'MAP' ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-900/20' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
          >
            <MapPin size={24} />
            <span className="font-bold text-xs md:text-sm">Mapa</span>
          </button>

          <button 
            onClick={() => setActiveTab('DB')}
            className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border ${activeTab === 'DB' ? 'bg-slate-700 text-white border-slate-700 shadow-lg shadow-slate-900/20' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
          >
            <Database size={24} />
            <span className="font-bold text-xs md:text-sm">SQL Export</span>
          </button>

          <button 
            onClick={() => setActiveTab('CODE')}
            className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border ${activeTab === 'CODE' ? 'bg-pink-600 text-white border-pink-600 shadow-lg shadow-pink-900/20' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
          >
            <Code size={24} />
            <span className="font-bold text-xs md:text-sm">Generar App</span>
          </button>
       </div>

       {/* Content Area */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 min-h-[400px]">
          
          {/* PRICE CALCULATOR */}
          {activeTab === 'PRICE' && (
            <div className="max-w-lg mx-auto">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Calculator className="text-blue-600"/> Calculadora de Margen de Ganancia
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-500 mb-2">Costo del Producto ($)</label>
                    <input 
                      type="number"
                      value={cost}
                      onChange={e => setCost(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-500 mb-2">Margen Deseado (%)</label>
                    <input 
                      type="number"
                      value={margin}
                      onChange={e => setMargin(e.target.value)}
                      placeholder="30"
                      className="w-full bg-white px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                    />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Ganancia por unidad:</span>
                    <span className="text-green-600 font-bold text-xl">+${profit}</span>
                  </div>
                  <div className="h-px bg-slate-200"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-800 font-bold text-lg">Precio de Venta Sugerido:</span>
                    <span className="text-blue-600 font-bold text-3xl">${calculatedPrice}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 text-center">
                    Fórmula: Costo + (Costo * Porcentaje)
                </p>
              </div>
            </div>
          )}

          {/* DISCOUNT CALCULATOR */}
          {activeTab === 'DISCOUNT' && (
            <div className="max-w-lg mx-auto">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Percent className="text-amber-500"/> Calculadora de Descuentos
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-500 mb-2">Precio Original ($)</label>
                    <input 
                      type="number"
                      value={originalPrice}
                      onChange={e => setOriginalPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-500 mb-2">Descuento (%)</label>
                    <input 
                      type="number"
                      value={discountPercent}
                      onChange={e => setDiscountPercent(e.target.value)}
                      placeholder="20"
                      className="w-full bg-white px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none"
                    />
                  </div>
                </div>

                <div className="p-6 bg-amber-50 rounded-xl border border-amber-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-800 font-medium">Ahorro para el cliente:</span>
                    <span className="text-amber-600 font-bold text-xl">-${savedAmount}</span>
                  </div>
                  <div className="h-px bg-amber-200"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-800 font-bold text-lg">Precio Final:</span>
                    <span className="text-slate-900 font-bold text-3xl">${finalDiscountPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TODO LIST */}
          {activeTab === 'TODO' && (
            <div className="max-w-2xl mx-auto h-full flex flex-col">
               <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <CheckSquare className="text-emerald-600"/> Lista de Tareas (Checklist)
              </h3>
              
              <form onSubmit={addTask} className="flex gap-2 mb-6">
                <input 
                    type="text" 
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    placeholder="Ej. Llamar a proveedor, Pagar luz..."
                    className="flex-1 bg-white px-4 py-3 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
                />
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 rounded-xl font-bold">
                    <Plus />
                </button>
              </form>

              <div className="space-y-2">
                 {tasks.length === 0 && (
                    <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <CheckSquare className="mx-auto mb-2 w-10 h-10 opacity-20" />
                        <p>No tienes tareas pendientes.</p>
                    </div>
                 )}
                 {tasks.map(task => (
                    <div key={task.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${task.done ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => toggleTask(task.id)}
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${task.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-500'}`}
                            >
                                {task.done && <CheckSquare size={16}/>}
                            </button>
                            <span className={`font-medium ${task.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                {task.text}
                            </span>
                        </div>
                        <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-red-500 p-2">
                            <Trash2 size={18} />
                        </button>
                    </div>
                 ))}
              </div>
            </div>
          )}

          {/* CHANGE CALCULATOR */}
          {activeTab === 'CHANGE' && (
             <div className="max-w-lg mx-auto">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Banknote className="text-purple-600"/> Calculadora de Cambio
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-500 mb-2">Total a Pagar ($)</label>
                    <input 
                      type="number"
                      value={totalToPay}
                      onChange={e => setTotalToPay(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-500 mb-2">Efectivo Recibido ($)</label>
                    <input 
                      type="number"
                      value={amountPaid}
                      onChange={e => setAmountPaid(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-center text-slate-300">
                    <ArrowRight size={32} className="rotate-90 md:rotate-0" />
                </div>

                <div className={`p-8 rounded-xl border text-center transition-colors ${parseFloat(changeDue) < 0 ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'}`}>
                  <span className="block text-slate-500 font-medium mb-2">Vuelto / Cambio a entregar:</span>
                  <span className={`text-4xl font-bold ${parseFloat(changeDue) < 0 ? 'text-red-600' : 'text-purple-700'}`}>
                    ${changeDue}
                  </span>
                  {parseFloat(changeDue) < 0 && (
                    <p className="text-red-500 text-sm mt-2 font-bold">¡Falta dinero!</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MAP */}
          {activeTab === 'MAP' && (
            <div className="w-full h-full min-h-[500px] flex flex-col">
                 <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <MapPin className="text-cyan-600"/> Mapa de Región (Ubicación Actual)
                </h3>
                {location ? (
                    <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            scrolling="no" 
                            marginHeight={0} 
                            marginWidth={0} 
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng-0.01}%2C${location.lat-0.01}%2C${location.lng+0.01}%2C${location.lat+0.01}&layer=mapnik&marker=${location.lat}%2C${location.lng}`} 
                            style={{minHeight: '400px'}}
                        >
                        </iframe>
                        <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded shadow text-xs">
                            Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-12">
                        {locationError ? (
                            <p className="text-red-500 font-bold">{locationError}</p>
                        ) : (
                            <>
                                <MapPin className="animate-bounce w-12 h-12 text-cyan-500 mb-4" />
                                <p className="text-slate-500">Obteniendo tu ubicación para mostrar el mapa...</p>
                            </>
                        )}
                    </div>
                )}
            </div>
          )}

          {/* DB EXPORT */}
          {activeTab === 'DB' && (
             <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Database className="text-slate-700"/> Exportar Base de Datos (MySQL)
                </h3>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 mb-4">
                    <p>Copia el siguiente código SQL para crear tu base de datos en un servidor MySQL externo.</p>
                </div>
                <div className="relative">
                    <textarea 
                        readOnly
                        value={generateSQL()}
                        className="w-full h-96 font-mono text-xs bg-slate-900 text-green-400 p-4 rounded-xl focus:outline-none"
                    ></textarea>
                    <button 
                        onClick={() => {navigator.clipboard.writeText(generateSQL()); alert('SQL Copiado!')}}
                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded transition-colors"
                        title="Copiar SQL"
                    >
                        <Copy size={20} />
                    </button>
                </div>
            </div>
          )}

          {/* CODE GENERATOR */}
          {activeTab === 'CODE' && (
             <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <FileCode className="text-pink-600"/> Generador de Código Fuente
                </h3>
                
                <div className="flex gap-4 mb-4">
                    <button 
                        onClick={() => setCodeLanguage('PYTHON')}
                        className={`flex-1 py-3 rounded-lg font-bold transition-all ${codeLanguage === 'PYTHON' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        Python (Data Classes)
                    </button>
                    <button 
                        onClick={() => setCodeLanguage('JAVA')}
                        className={`flex-1 py-3 rounded-lg font-bold transition-all ${codeLanguage === 'JAVA' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        Java (POJOs / Spring)
                    </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 mb-4">
                    <p>
                        Este código contiene las estructuras de datos base de tu aplicación. 
                        Cópialo en tu proyecto de {codeLanguage === 'PYTHON' ? 'Python (main.py)' : 'Java (src/main/java/Models.java)'} para comenzar.
                    </p>
                </div>
                
                <div className="relative">
                    <textarea 
                        readOnly
                        value={generateAppCode()}
                        className="w-full h-96 font-mono text-xs bg-slate-900 text-blue-300 p-4 rounded-xl focus:outline-none"
                    ></textarea>
                    <button 
                        onClick={() => {navigator.clipboard.writeText(generateAppCode()); alert('Código Copiado!')}}
                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded transition-colors"
                        title="Copiar Código"
                    >
                        <Copy size={20} />
                    </button>
                </div>
            </div>
          )}

       </div>
    </div>
  );
};
