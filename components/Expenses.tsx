
import React, { useState } from 'react';
import { Expense, Employee } from '../types';
import { Plus, Trash2, Calendar, Wallet, Search } from 'lucide-react';
import { hasPermission } from '../services/rbac';

interface ExpensesProps {
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  currentUser: Employee | null;
}

export const Expenses: React.FC<ExpensesProps> = ({ expenses, setExpenses, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Omit<Expense, 'id' | 'date'>>({
    description: '',
    amount: 0,
    category: 'Operativo'
  });

  const canCreate = hasPermission(currentUser, 'EXPENSES', 'create');
  const canDelete = hasPermission(currentUser, 'EXPENSES', 'delete');

  const categories = ['Operativo', 'Mercadería', 'Servicios', 'Alquiler', 'Nómina', 'Otros'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      ...formData
    };
    setExpenses([newExpense, ...expenses]);
    setFormData({ description: '', amount: 0, category: 'Operativo' });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if(!canDelete) return;
    if (confirm('¿Borrar este gasto?')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gastos & Egresos</h2>
          <p className="text-slate-500 text-sm">Registra salidas de dinero para cuadrar tu balance</p>
        </div>
        <div className="flex gap-4 items-center">
           <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100">
             <span className="text-xs text-red-600 font-bold block">TOTAL GASTOS</span>
             <span className="text-lg font-bold text-red-700">${totalExpenses.toFixed(2)}</span>
           </div>
           {canCreate && (
             <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
                <Plus size={18} /> Registrar Gasto
            </button>
           )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar gastos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Concepto</th>
                <th className="px-6 py-3">Categoría</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3 text-right">Monto</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{expense.description}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar size={14} />
                      {new Date(expense.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-red-600">
                    -${expense.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {canDelete && (
                        <button onClick={() => handleDelete(expense.id)} className="p-2 hover:bg-red-50 rounded text-red-500 transition-colors">
                            <Trash2 size={16} />
                        </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <Wallet className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                    <p>No hay gastos registrados.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && canCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <form onSubmit={handleSubmit} className="p-6">
              <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                <div className="bg-red-100 p-2 rounded-lg text-red-600">
                    <Wallet size={20} />
                </div>
                Registrar Nuevo Gasto
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Concepto</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ej. Alquiler local, Pago de luz..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Monto ($)</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-lg font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-lg shadow-red-900/20"
                >
                  Guardar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
