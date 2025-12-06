
import React, { useState } from 'react';
import { Sale, Product, Expense } from '../types';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Sparkles, Loader2, Filter } from 'lucide-react';
import { analyzeSalesTrends } from '../services/gemini';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DashboardProps {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
}

type DateRange = 'today' | 'week' | 'month';

export const Dashboard: React.FC<DashboardProps> = ({ sales, expenses, products }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('week');

  const filterByDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    if (dateRange === 'today') {
      return date.toDateString() === now.toDateString();
    } else if (dateRange === 'week') {
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
      return date >= oneWeekAgo;
    } else if (dateRange === 'month') {
      return date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();
    }
    return true;
  };

  const filteredSales = sales.filter(s => filterByDate(s.date));
  const filteredExpenses = expenses.filter(e => filterByDate(e.date));

  const totalRevenue = filteredSales.reduce((acc, sale) => acc + sale.total, 0);
  const totalExpenses = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  
  // Prepare data for chart
  const getChartData = () => {
    const dataMap = new Map<string, { name: string, ingresos: number, egresos: number }>();
    
    // Initialize last 7 days keys if week view, or dynamic based on range
    const days = 7; 
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString();
        dataMap.set(key, { name: key.slice(0, 5), ingresos: 0, egresos: 0 });
    }

    filteredSales.forEach(s => {
        const key = new Date(s.date).toLocaleDateString();
        if (dataMap.has(key)) {
            const entry = dataMap.get(key)!;
            entry.ingresos += s.total;
        }
    });

    filteredExpenses.forEach(e => {
        const key = new Date(e.date).toLocaleDateString();
        if (dataMap.has(key)) {
            const entry = dataMap.get(key)!;
            entry.egresos += e.amount;
        }
    });

    return Array.from(dataMap.values());
  };

  const chartData = getChartData();

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const summary = {
        sales: totalRevenue,
        expenses: totalExpenses,
        profit: netProfit,
        salesCount: filteredSales.length,
        topProducts: products.sort((a,b) => b.stock - a.stock).slice(0, 3).map(p => p.name) // Simple mock
    };
    // We update the prompt content slightly in logic, but passing the object is enough for now
    const result = await analyzeSalesTrends(sales, products); 
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Balance Financiero</h2>
          <p className="text-slate-500 text-sm">Resumen de ingresos, gastos y utilidad</p>
        </div>
        
        <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button 
                onClick={() => setDateRange('today')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${dateRange === 'today' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
            >
                Hoy
            </button>
            <button 
                onClick={() => setDateRange('week')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${dateRange === 'week' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
            >
                Semana
            </button>
            <button 
                onClick={() => setDateRange('month')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${dateRange === 'month' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
            >
                Mes
            </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Ingresos (Ventas)</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">${totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Egresos (Gastos)</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">${totalExpenses.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingDown size={24} />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full rounded-full" style={{ width: `${Math.min((totalExpenses / (totalRevenue || 1)) * 100, 100)}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl shadow-lg shadow-slate-900/10 text-white relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm text-slate-300 font-semibold uppercase tracking-wider">Utilidad Neta</p>
              <h3 className={`text-3xl font-bold mt-1 ${netProfit >= 0 ? 'text-white' : 'text-red-300'}`}>
                ${netProfit.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 bg-slate-800 text-amber-400 rounded-xl">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="text-xs text-slate-400 relative z-10">
            {netProfit >= 0 ? 'Tu negocio es rentable en este periodo' : 'Atención: Los gastos superan los ingresos'}
          </div>
          {/* Decorative gradients */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500 rounded-full blur-3xl opacity-10"></div>
        </div>
      </div>

      {/* AI Insights & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
          <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            Flujo de Caja - {dateRange === 'today' ? 'Hoy' : dateRange === 'week' ? 'Últimos 7 días' : 'Este Mes'}
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
              <YAxis stroke="#94a3b8" tick={{fontSize: 12}} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Legend />
              <Bar name="Ingresos" dataKey="ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={30} />
              <Bar name="Gastos" dataKey="egresos" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Analysis Box */}
        <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-xl shadow-sm border border-amber-100 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">Consejero IA</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar">
            {aiAnalysis ? (
              <div className="prose prose-sm prose-amber text-slate-600 leading-relaxed text-sm">
                {aiAnalysis}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-4 border-2 border-dashed border-amber-100 rounded-lg">
                <p className="text-sm">Solicita un análisis de tu balance financiero para mejorar la rentabilidad.</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-70"
          >
            {analyzing ? <Loader2 className="animate-spin w-4 h-4"/> : <Sparkles className="w-4 h-4 text-amber-400" />}
            {analyzing ? 'Analizando datos...' : 'Analizar Balance'}
          </button>
        </div>
      </div>
    </div>
  );
};
