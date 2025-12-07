
import React, { useState } from 'react';
import { Sale, Product, Expense } from '../types';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Sparkles, Loader2, Filter, ChevronLeft, ChevronRight, X, Clock, User } from 'lucide-react';
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
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDayDetails, setSelectedDayDetails] = useState<{date: Date, sales: Sale[], total: number} | null>(null);

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

  // --- CALENDAR LOGIC ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month); // 0 = Sunday
    
    const days = [];
    
    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-24 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800"></div>);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = new Date(year, month, d).toDateString();
        const daySales = sales.filter(s => new Date(s.date).toDateString() === dateStr);
        const dayTotal = daySales.reduce((sum, s) => sum + s.total, 0);
        const isToday = new Date().toDateString() === dateStr;

        days.push(
            <div 
                key={d} 
                onClick={() => daySales.length > 0 && setSelectedDayDetails({ date: new Date(year, month, d), sales: daySales, total: dayTotal })}
                className={`h-24 border border-slate-100 dark:border-slate-700 p-2 flex flex-col justify-between transition-all relative group
                    ${daySales.length > 0 ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800' : 'bg-white dark:bg-slate-900'}
                    ${isToday ? 'ring-2 ring-inset ring-blue-400' : ''}
                `}
            >
                <span className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-slate-500 dark:text-slate-400'}`}>{d}</span>
                {dayTotal > 0 && (
                    <div className="text-right">
                        <span className="block text-xs text-slate-400">Ventas</span>
                        <span className="block font-bold text-slate-800 dark:text-green-400">${dayTotal.toFixed(2)}</span>
                    </div>
                )}
                {daySales.length > 0 && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500"></div>
                )}
            </div>
        );
    }
    return days;
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Balance Financiero</h2>
          <p className="text-slate-500 text-sm dark:text-slate-400">Resumen de ingresos, gastos y utilidad</p>
        </div>
        
        <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <button 
                onClick={() => setDateRange('today')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${dateRange === 'today' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
                Hoy
            </button>
            <button 
                onClick={() => setDateRange('week')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${dateRange === 'week' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
                Semana
            </button>
            <button 
                onClick={() => setDateRange('month')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${dateRange === 'month' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
                Mes
            </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Ingresos (Ventas)</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">${totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Egresos (Gastos)</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">${totalExpenses.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingDown size={24} />
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full rounded-full" style={{ width: `${Math.min((totalExpenses / (totalRevenue || 1)) * 100, 100)}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-slate-950 p-6 rounded-xl shadow-lg shadow-slate-900/10 text-white relative overflow-hidden group">
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
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[400px]">
          <h3 className="font-bold text-slate-700 dark:text-white mb-6 flex items-center gap-2">
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
        <div className="bg-gradient-to-br from-amber-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl shadow-sm border border-amber-100 dark:border-slate-700 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-amber-100 dark:bg-slate-700 rounded-lg text-amber-600 dark:text-amber-400">
                <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">Consejero IA</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar">
            {aiAnalysis ? (
              <div className="prose prose-sm prose-amber text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                {aiAnalysis}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-4 border-2 border-dashed border-amber-100 dark:border-slate-700 rounded-lg">
                <p className="text-sm">Solicita un análisis de tu balance financiero para mejorar la rentabilidad.</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-70"
          >
            {analyzing ? <Loader2 className="animate-spin w-4 h-4"/> : <Sparkles className="w-4 h-4 text-amber-400" />}
            {analyzing ? 'Analizando datos...' : 'Analizar Balance'}
          </button>
        </div>
      </div>

      {/* SALES CALENDAR */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar className="text-blue-600" size={20}/> Calendario de Ventas
            </h3>
            <div className="flex items-center gap-4">
                <span className="text-slate-900 dark:text-white font-bold capitalize w-32 text-center">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"><ChevronLeft size={20}/></button>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"><ChevronRight size={20}/></button>
                </div>
            </div>
        </div>
        
        <div className="p-6">
            <div className="grid grid-cols-7 gap-px mb-2 text-center">
                {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => (
                    <div key={d} className="text-xs font-bold text-slate-400 uppercase pb-2">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                {renderCalendar()}
            </div>
        </div>
      </div>

      {/* MODAL: DAILY DETAILS */}
      {selectedDayDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900 rounded-t-xl">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                            {selectedDayDetails.date.toLocaleDateString()}
                        </h3>
                        <p className="text-sm text-slate-500">Resumen del día</p>
                    </div>
                    <button onClick={() => setSelectedDayDetails(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-slate-700/50 border-b border-blue-100 dark:border-slate-600 flex justify-between items-center">
                    <span className="font-medium text-blue-800 dark:text-blue-300">Total Vendido</span>
                    <span className="font-bold text-2xl text-blue-700 dark:text-white">${selectedDayDetails.total.toFixed(2)}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {selectedDayDetails.sales.length === 0 ? (
                        <p className="text-center text-slate-400">Sin movimientos registrados.</p>
                    ) : (
                        selectedDayDetails.sales.map(s => (
                            <div key={s.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-lg shadow-sm">
                                <div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                        <Clock size={12} /> {new Date(s.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                    </div>
                                    <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                                        <User size={14} className="text-slate-400"/>
                                        <span className="truncate w-32">{s.customerName || 'Cliente Final'}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 pl-6">
                                        {s.items.length} items
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-slate-800 dark:text-white">${s.total.toFixed(2)}</span>
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-600 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-300 uppercase">{s.paymentMethod}</span>
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
