
import React, { useState } from 'react';
import { Supplier, Employee } from '../types';
import { Plus, Edit, Trash2, Phone, Mail } from 'lucide-react';
import { hasPermission } from '../services/rbac';

interface SuppliersProps {
  suppliers: Supplier[];
  setSuppliers: (suppliers: Supplier[]) => void;
  currentUser: Employee | null;
}

export const Suppliers: React.FC<SuppliersProps> = ({ suppliers, setSuppliers, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Supplier, 'id'>>({
    name: '',
    contactName: '',
    phone: '',
    email: ''
  });

  const canCreate = hasPermission(currentUser, 'SUPPLIERS', 'create');
  const canEdit = hasPermission(currentUser, 'SUPPLIERS', 'edit');
  const canDelete = hasPermission(currentUser, 'SUPPLIERS', 'delete');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      if(!canEdit) return;
      setSuppliers(suppliers.map(s => s.id === editingId ? { ...formData, id: editingId } : s));
    } else {
      if(!canCreate) return;
      setSuppliers([...suppliers, { ...formData, id: crypto.randomUUID() }]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if(!canDelete) return;
    if (confirm('¿Eliminar proveedor?')) {
      setSuppliers(suppliers.filter(s => s.id !== id));
    }
  };

  const openModal = (supplier?: Supplier) => {
    if (supplier) {
      if(!canEdit) return;
      setEditingId(supplier.id);
      setFormData({
        name: supplier.name,
        contactName: supplier.contactName,
        phone: supplier.phone,
        email: supplier.email
      });
    } else {
      if(!canCreate) return;
      setEditingId(null);
      setFormData({ name: '', contactName: '', phone: '', email: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Proveedores</h2>
          <p className="text-slate-500 text-sm">Directorio de proveedores y contactos</p>
        </div>
        {canCreate && (
            <button 
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
            <Plus size={18} /> Agregar Proveedor
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map(supplier => (
          <div key={supplier.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{supplier.name}</h3>
                <p className="text-sm text-slate-500">Contacto: {supplier.contactName}</p>
              </div>
              <div className="flex gap-2">
                {canEdit && (
                    <button onClick={() => openModal(supplier)} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                    <Edit size={16} />
                    </button>
                )}
                {canDelete && (
                    <button onClick={() => handleDelete(supplier.id)} className="p-1 hover:bg-red-50 rounded text-red-500">
                    <Trash2 size={16} />
                    </button>
                )}
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <Phone size={16} className="text-slate-400" />
                <span>{supplier.phone || 'Sin teléfono'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Mail size={16} className="text-slate-400" />
                <span className="truncate">{supplier.email || 'Sin correo'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <form onSubmit={handleSubmit} className="p-6">
              <h3 className="text-xl font-bold mb-6 text-slate-800">
                {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Contacto</label>
                  <input 
                    required
                    type="text" 
                    value={formData.contactName}
                    onChange={e => setFormData({...formData, contactName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-2">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
