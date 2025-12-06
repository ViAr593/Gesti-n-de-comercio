
import React, { useState } from 'react';
import { Customer } from '../types';
import { Plus, Edit, Trash2, User, Phone, Mail, MapPin, FileText, Smartphone, Contact } from 'lucide-react';

interface CustomersProps {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
}

export const Customers: React.FC<CustomersProps> = ({ customers, setCustomers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    name: '',
    taxId: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setCustomers(customers.map(c => c.id === editingId ? { ...formData, id: editingId } : c));
    } else {
      setCustomers([...customers, { ...formData, id: crypto.randomUUID() }]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar cliente?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({
        name: customer.name,
        taxId: customer.taxId,
        email: customer.email,
        phone: customer.phone,
        address: customer.address
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', taxId: '', email: '', phone: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleImportContact = async () => {
    // Feature detection for Mobile Contacts API
    // Note: This only works in secure contexts (HTTPS) and supported mobile browsers (Chrome Android, iOS Safari 14.5+)
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['name', 'tel', 'email'];
        const opts = { multiple: false };
        
        // @ts-ignore - The contacts API is experimental in some TS libs
        const contacts = await navigator.contacts.select(props, opts);
        
        if (contacts && contacts.length > 0) {
          const contact = contacts[0];
          setFormData(prev => ({
            ...prev,
            name: contact.name ? contact.name[0] : prev.name,
            phone: contact.tel ? contact.tel[0] : prev.phone,
            email: contact.email ? contact.email[0] : prev.email
          }));
        }
      } catch (ex) {
        // User cancelled or error
        console.log(ex);
      }
    } else {
      alert("Esta función requiere un dispositivo móvil compatible (Android/iOS) y conexión segura (HTTPS).");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Clientes</h2>
          <p className="text-slate-500 text-sm">Base de datos de compradores frecuentes</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} /> Agregar Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Nombre / Razón Social</th>
                <th className="px-6 py-3">Identificación</th>
                <th className="px-6 py-3">Contacto</th>
                <th className="px-6 py-3">Ubicación</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map(customer => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {customer.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="font-medium text-slate-900">{customer.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <FileText size={14} />
                      <span className="font-mono text-xs">{customer.taxId || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-slate-500">
                        <Mail size={14} /> {customer.email || '-'}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Phone size={14} /> {customer.phone || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500 max-w-xs truncate">
                      <MapPin size={14} />
                      <span className="truncate">{customer.address || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(customer)} className="p-1.5 hover:bg-slate-200 rounded text-slate-500">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(customer.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <User className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                    <p>No hay clientes registrados.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <form onSubmit={handleSubmit} className="p-6">
              <h3 className="text-xl font-bold mb-6 text-slate-800">
                {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h3>
              
              <div className="space-y-4">
                {/* Mobile Import Button */}
                {!editingId && (
                  <button 
                    type="button" 
                    onClick={handleImportContact}
                    className="w-full bg-indigo-50 text-indigo-700 py-3 rounded-xl border border-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors mb-2 font-medium"
                    title="Importar desde la agenda de tu teléfono"
                  >
                      <Smartphone size={20} />
                      Importar desde Agenda Móvil
                  </button>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo / Razón Social</label>
                    <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Documento (RUT/NIT/DNI)</label>
                  <input 
                    type="text" 
                    value={formData.taxId}
                    onChange={e => setFormData({...formData, taxId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
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
