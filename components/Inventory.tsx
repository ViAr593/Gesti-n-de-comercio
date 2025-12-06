
import React, { useState } from 'react';
import { Product, Supplier } from '../types';
import { Plus, Edit, Trash2, Search, Wand2, Loader2, AlertTriangle, Scale, Archive, ArrowDownCircle, Printer, LayoutGrid, List, DollarSign, TrendingUp, Share2, ImageIcon, Upload, X } from 'lucide-react';
import { generateProductDescription } from '../services/gemini';

interface InventoryProps {
  products: Product[];
  suppliers: Supplier[];
  setProducts: (products: Product[]) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ products, suppliers, setProducts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [showOrderPreview, setShowOrderPreview] = useState(false);
  
  const [viewMode, setViewMode] = useState<'LIST' | 'CATALOG'>('LIST');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockEntryValue, setStockEntryValue] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const initialFormState: Omit<Product, 'id'> = {
    name: '',
    description: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 5,
    category: '',
    supplierId: '',
    measurementUnit: 'UNIDAD',
    measurementValue: 1,
    image: ''
  };

  const [formData, setFormData] = useState<Omit<Product, 'id'>>(initialFormState);

  // Financial Calculations
  const totalInventoryCost = products.reduce((acc, p) => acc + (p.cost * p.stock), 0);
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const potentialProfit = totalInventoryValue - totalInventoryCost;

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.category) {
      alert("Por favor ingrese nombre y categoría primero.");
      return;
    }
    setIsGenerating(true);
    const desc = await generateProductDescription(formData.name, formData.category);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...formData, id: p.id } : p));
    } else {
      setProducts([...products, { ...formData, id: crypto.randomUUID() }]);
    }
    closeModal();
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockProduct) return;
    const qty = parseFloat(stockEntryValue);
    if (isNaN(qty) || qty <= 0) return;

    setProducts(products.map(p => p.id === stockProduct.id ? { ...p, stock: p.stock + qty } : p));
    setIsStockModalOpen(false);
    setStockProduct(null);
    setStockEntryValue('');
    alert(`Se agregaron ${qty} unidades a ${stockProduct.name}`);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        minStock: product.minStock,
        category: product.category,
        supplierId: product.supplierId,
        measurementUnit: product.measurementUnit || 'UNIDAD',
        measurementValue: product.measurementValue || 1,
        image: product.image || ''
      });
    } else {
      setEditingProduct(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const openStockModal = (product: Product) => {
    setStockProduct(product);
    setStockEntryValue('');
    setIsStockModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData(initialFormState);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventario</h2>
          <p className="text-slate-500 text-sm">Gestiona tus productos, costos y catálogo</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <button 
            onClick={() => setShowOrderPreview(true)}
            className="flex-1 md:flex-none bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors border border-amber-200 text-sm font-medium"
            >
            <Archive size={18} /> OC
            </button>
            <button 
            onClick={() => openModal()}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm text-sm font-medium"
            >
            <Plus size={18} /> Nuevo
            </button>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inversión (Costo)</p>
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                 <DollarSign size={18} className="text-slate-400 -ml-1" /> {totalInventoryCost.toFixed(2)}
              </h3>
           </div>
           <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
              <Scale size={20} />
           </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valor Venta (Ref)</p>
              <h3 className="text-xl font-bold text-blue-600 flex items-center">
                 <DollarSign size={18} className="text-blue-400 -ml-1" /> {totalInventoryValue.toFixed(2)}
              </h3>
           </div>
           <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
              <TrendingUp size={20} />
           </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between text-white">
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Margen Potencial</p>
              <h3 className="text-xl font-bold text-emerald-400 flex items-center">
                 <DollarSign size={18} className="text-emerald-500/50 -ml-1" /> {potentialProfit.toFixed(2)}
              </h3>
           </div>
           <div className="p-2 bg-slate-800 rounded-lg text-amber-400">
              <Archive size={20} />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
             <button 
                onClick={() => setViewMode('LIST')}
                className={`p-2 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Vista Lista"
             >
                <List size={18} />
             </button>
             <button 
                onClick={() => setViewMode('CATALOG')}
                className={`p-2 rounded-md transition-all ${viewMode === 'CATALOG' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Vista Catálogo Virtual"
             >
                <LayoutGrid size={18} />
             </button>
          </div>
        </div>

        {viewMode === 'LIST' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3">Medida</th>
                <th className="px-6 py-3">Costo / Precio</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Proveedor</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => {
                const supplier = suppliers.find(s => s.id === product.supplierId);
                const isLowStock = product.stock <= product.minStock;

                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         {product.image ? (
                             <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                         ) : (
                             <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs border border-slate-200">
                                 {product.name.substring(0,2).toUpperCase()}
                             </div>
                         )}
                         <div>
                            <div className="font-medium text-slate-900">{product.name}</div>
                            <div className="text-xs text-slate-400 truncate max-w-[200px]">{product.description}</div>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 mt-1">
                                {product.category}
                            </span>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Scale size={14} className="text-slate-400" />
                        <span className="font-medium">
                          {product.measurementValue} {product.measurementUnit}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-medium">${product.price.toFixed(2)}</div>
                      <div className="text-xs text-slate-400">Costo: ${product.cost.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 ${isLowStock ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                        {product.stock}
                        {isLowStock && <AlertTriangle size={14} />}
                      </div>
                      <div className="text-xs text-slate-400">Min: {product.minStock}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{supplier?.name || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => openStockModal(product)} 
                            className="p-1 hover:bg-green-100 rounded text-green-600"
                            title="Recibir Stock (Entrada)"
                        >
                          <ArrowDownCircle size={16} />
                        </button>
                        <button onClick={() => openModal(product)} className="p-1 hover:bg-slate-200 rounded text-slate-600">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-1 hover:bg-red-50 rounded text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        ) : (
            // CATALOG GRID VIEW
            <div className="p-6 bg-slate-50/50 min-h-[400px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group flex flex-col">
                            {/* Product Image */}
                            <div className="h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <>
                                        <div className="text-4xl font-bold text-slate-300 select-none">
                                            {product.name.substring(0,2).toUpperCase()}
                                        </div>
                                        <ImageIcon className="absolute top-4 right-4 text-slate-300 opacity-50" size={20} />
                                    </>
                                )}
                                <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-slate-700 shadow-sm backdrop-blur-sm">
                                    {product.category}
                                </div>
                            </div>
                            
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1">{product.name}</h3>
                                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{product.description || 'Sin descripción'}</p>
                                
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium border border-slate-200">
                                        {product.measurementValue} {product.measurementUnit}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded font-medium border ${product.stock > product.minStock ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                        Stock: {product.stock}
                                    </span>
                                </div>

                                <div className="mt-auto flex justify-between items-center pt-3 border-t border-slate-100">
                                    <div className="text-xl font-bold text-slate-900">
                                        ${product.price.toFixed(2)}
                                    </div>
                                    <button 
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        title="Compartir Producto"
                                        onClick={() => alert(`Compartir: ${product.name} - $${product.price}`)}
                                    >
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>
                            {/* Admin Quick Actions for Catalog */}
                            <div className="bg-slate-50 p-2 border-t border-slate-100 flex justify-between text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span>Costo: ${product.cost.toFixed(2)}</span>
                                <button onClick={() => openModal(product)} className="hover:text-blue-600 font-medium">Editar</button>
                            </div>
                        </div>
                    ))}
                </div>
                {filteredProducts.length === 0 && (
                     <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Search size={48} className="mb-4 opacity-20" />
                        <p>No hay productos para mostrar en el catálogo.</p>
                     </div>
                )}
            </div>
        )}
      </div>

      {/* MODAL: PRODUCT FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <h3 className="text-xl font-bold mb-6 text-slate-800">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
                
                {/* Left Column: Image Upload */}
                <div className="md:col-span-4 space-y-4">
                    <label className="block text-sm font-medium text-slate-700">Imagen del Producto</label>
                    <div className="relative w-full aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden hover:border-blue-400 transition-colors group">
                        {formData.image ? (
                            <>
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, image: ''})}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600 transition-colors"
                                >
                                    <X size={14}/>
                                </button>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                                <Upload size={32} className="mb-2"/>
                                <span className="text-xs text-center px-4">Click para subir imagen</span>
                            </div>
                        )}
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Medidas</label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <select
                                value={formData.measurementUnit}
                                onChange={e => setFormData({...formData, measurementUnit: e.target.value as any})}
                                className="w-full px-2 py-2 border rounded-lg text-xs bg-white"
                                >
                                <option value="UNIDAD">Unidad</option>
                                <option value="KG">Kg</option>
                                <option value="G">g</option>
                                <option value="L">Litros</option>
                                <option value="ML">ml</option>
                                <option value="M">Metros</option>
                                </select>
                            </div>
                            <div>
                                <input 
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.measurementValue}
                                onChange={e => setFormData({...formData, measurementValue: Number(e.target.value)})}
                                className="w-full px-2 py-2 border rounded-lg text-xs"
                                placeholder="Cant."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="md:col-span-8 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Producto</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                        <input 
                        required
                        type="text" 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor</label>
                        <select 
                        value={formData.supplierId}
                        onChange={e => setFormData({...formData, supplierId: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                        <option value="">Seleccionar...</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Costo</label>
                      <input 
                        required
                        type="number" 
                        min="0"
                        step="0.01"
                        value={formData.cost}
                        onChange={e => setFormData({...formData, cost: Number(e.target.value)})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Precio Venta</label>
                      <input 
                        required
                        type="number" 
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Stock Actual</label>
                      <input 
                        required
                        type="number" 
                        min="0"
                        value={formData.stock}
                        onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Stock Mínimo</label>
                      <input 
                        required
                        type="number" 
                        min="0"
                        value={formData.minStock}
                        onChange={e => setFormData({...formData, minStock: Number(e.target.value)})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-slate-700">Descripción</label>
                      <button 
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={isGenerating}
                        className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium"
                      >
                        {isGenerating ? <Loader2 className="animate-spin w-3 h-3"/> : <Wand2 className="w-3 h-3"/>}
                        Generar con IA
                      </button>
                    </div>
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STOCK ENTRY (REPLENISH) */}
      {isStockModalOpen && stockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2">
                <ArrowDownCircle size={24}/> Recibir Stock
            </h3>
            <p className="text-sm text-slate-600 mb-4">
                Agregando unidades a: <strong>{stockProduct.name}</strong>
            </p>
            <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad a ingresar</label>
                <input 
                  autoFocus
                  required
                  type="number" 
                  min="0.01"
                  step="0.01"
                  value={stockEntryValue}
                  onChange={e => setStockEntryValue(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-lg font-bold"
                  placeholder="0"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                    type="button"
                    onClick={() => setIsStockModalOpen(false)} 
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    Confirmar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ORDER PREVIEW (OC) */}
      {showOrderPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Archive size={24}/> Sugerencia de Compra (OC)
                </h3>
                <button onClick={() => setShowOrderPreview(false)} className="text-slate-400 hover:text-slate-600">
                    <Edit size={20} className="rotate-45" /> {/* Close icon visual hack */}
                </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
                <p className="text-slate-600 mb-4 text-sm">
                    Lista de productos con stock bajo ({lowStockProducts.length}) que necesitan reabastecimiento.
                </p>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 font-bold text-slate-700">
                        <tr>
                            <th className="p-2">Producto</th>
                            <th className="p-2">Stock Actual</th>
                            <th className="p-2">Mínimo</th>
                            <th className="p-2">Sugerido</th>
                            <th className="p-2">Proveedor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {lowStockProducts.map(p => (
                            <tr key={p.id}>
                                <td className="p-2 font-medium">{p.name}</td>
                                <td className="p-2 text-red-600 font-bold">{p.stock}</td>
                                <td className="p-2 text-slate-500">{p.minStock}</td>
                                <td className="p-2 font-bold bg-amber-50 text-amber-800 text-center rounded">
                                    {(p.minStock - p.stock) + 5}
                                </td>
                                <td className="p-2 text-xs text-slate-400">
                                    {suppliers.find(s => s.id === p.supplierId)?.name || 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button 
                    onClick={() => window.print()} 
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800"
                >
                    <Printer size={18} /> Imprimir Orden
                </button>
                <button 
                    onClick={() => setShowOrderPreview(false)} 
                    className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-white"
                >
                    Cerrar
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};