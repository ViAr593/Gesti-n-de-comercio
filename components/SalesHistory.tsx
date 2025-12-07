
import React from 'react';
import { Sale, Employee } from '../types';
import { Calendar, CreditCard, DollarSign, Trash2 } from 'lucide-react';
import { hasPermission } from '../services/rbac';

interface SalesHistoryProps {
  sales: Sale[];
  onDeleteSale?: (saleId: string) => void;
  currentUser: Employee | null;
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({ sales, onDeleteSale, currentUser }) => {
  // Sort by date desc
  const sortedSales = [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const canDelete = hasPermission(currentUser, 'SALES_HISTORY', 'delete');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Historial de Ventas</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ID Transacción</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Método Pago</th>
                <th className="px-6 py-4 text-right">Total</th>
                {onDeleteSale && canDelete && <th className="px-6 py-4 text-center">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedSales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50 group">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{sale.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400"/>
                      {new Date(sale.date).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">
                      {sale.items.reduce((acc, item) => acc + item.quantity, 0).toFixed(2).replace(/\.00$/, '')} unid.
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <CreditCard size={14} className="text-slate-400"/>
                      {sale.paymentMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">
                    ${sale.total.toFixed(2)}
                  </td>
                  {onDeleteSale && canDelete && (
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => onDeleteSale(sale.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Eliminar venta del historial"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No hay ventas registradas aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
