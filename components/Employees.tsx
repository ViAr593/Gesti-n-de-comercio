
import React, { useState } from 'react';
import { Employee } from '../types';
import { Plus, Edit, Trash2, Shield, User, Briefcase, Mail, Phone } from 'lucide-react';

interface EmployeesProps {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
}

export const Employees: React.FC<EmployeesProps> = ({ employees, setEmployees }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    name: '',
    email: '',
    phone: '',
    role: 'VENDEDOR'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setEmployees(employees.map(emp => emp.id === editingId ? { ...formData, id: editingId } : emp));
    } else {
      setEmployees([...employees, { ...formData, id: crypto.randomUUID() }]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar empleado?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const openModal = (employee?: Employee) => {
    if (employee) {
      setEditingId(employee.id);
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.role
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', phone: '', role: 'VENDEDOR' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'GERENTE_GENERAL':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">Gerente General</span>;
      case 'ADMINISTRADOR':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">Administrador</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">Vendedor</span>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Empleados</h2>
          <p className="text-slate-500 text-sm">Gestión de personal y niveles de acceso</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} /> Agregar Empleado
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(employee => (
          <div key={employee.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{employee.name}</h3>
                  {getRoleBadge(employee.role)}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openModal(employee)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(employee.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-3 pt-2 border-t border-slate-50">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail size={16} className="text-slate-400" />
                <span className="truncate">{employee.email || 'Sin correo'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone size={16} className="text-slate-400" />
                <span>{employee.phone || 'Sin teléfono'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Shield size={16} className="text-slate-400" />
                <span className="capitalize">{employee.role.replace('_', ' ').toLowerCase()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <form onSubmit={handleSubmit} className="p-6">
              <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                <Briefcase className="text-slate-900" size={24} />
                {editingId ? 'Editar Empleado' : 'Nuevo Colaborador'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rol / Acceso</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as any})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none bg-white"
                  >
                    <option value="VENDEDOR">Vendedor</option>
                    <option value="ADMINISTRADOR">Administrador</option>
                    <option value="GERENTE_GENERAL">Gerente General</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Define los permisos dentro de la aplicación.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
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
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium"
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
