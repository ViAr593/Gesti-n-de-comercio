import React, { useState, useMemo } from 'react';
import { Sale, Product, Expense } from '../types';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Sparkles, Loader2, ChevronLeft, ChevronRight, X, Clock, User, PieChart as PieIcon } from 'lucide-react';
import { analyzeSalesTrends } from '../services/gemini';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { t, Language } from '../services/translations';

interface DashboardProps {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  lang?: Language;
}

type DateRange = 'today' | 'week' | 'month';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export const Dashboard: React.FC<DashboardProps> = ({ sales, expenses, products, lang = 'es' }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('week');
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDayDetails, setSelectedDayDetails] = useState<{date: Date, sales: Sale[], total: number} | null>(null);

  // --- DATA PROCESSING LOGIC ---
  const { filteredSales, filteredExpenses, totalRevenue, totalExpenses, netProfit, chartData, categoryData } = useMemo(() => {
    const now = new Date();
    let fSales: Sale[] = [];
    let fExpenses: Expense[] = [];
    let cData: any[] = [];
    const categoryMap = new Map<string, number>();

    if (dateRange === 'today') {
      const todayStr = now.toDateString();
      fSales = sales.filter(s => new Date(s.date).toDateString() === todayStr);
      fExpenses = expenses.filter(e => new Date(e.date).toDateString() === todayStr);
      
      const hoursMap = new Map<number, {income: number, expense: number}>();
      for(let i=8; i<=22; i++) hoursMap.set(i, {income: 0, expense: 0}); 
      
      fSales.forEach(s => {
          const h = new Date(s.date).getHours();
          if (hoursMap.has(h)) {
            const cur = hoursMap.get(h)!;
            cur.income += s.total;
          }
      });
      
      fExpenses.forEach(e => {
          const h = new Date(e.date).getHours();
          if (hoursMap.has(h)) {
            const cur = hoursMap.get(h)!;
            cur.expense += e.amount;
          }
      });
      
      cData = Array.from(hoursMap.entries()).map(([h, val]) => ({
          name: `${h}:00`,
          ingresos: val.income,
          egresos: val.expense
      }));

    } else if (dateRange === 'week') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0,0,0,0);
      
      fSales = sales.filter(s => new Date(s.date) >= sevenDaysAgo);
      fExpenses = expenses.filter(e => new Date(e.date) >= sevenDaysAgo);
      
      const daysMap = new Map<string, {name: string, income: number, expense: number}>();
      for(let i=6; i>=0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toDateString();
          daysMap.set(key, {
              name: d.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {weekday: 'short'}),
              income: 0, 
              expense: 0
          });
      }
      
      fSales.forEach(s => {
          const key = new Date(s.date).toDateString();
          if(daysMap.has(key)) daysMap.get(key)!.income += s.total;
      });
      fExpenses.forEach(e => {
          const key = new Date(e.date).toDateString();
          if(daysMap.has(key)) daysMap.get(key)!.expense += e.amount;
      });
      
      cData = Array.from(daysMap.values());

    } else if (dateRange === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); 
      
      fSales = sales.filter(s => {
          const d = new Date(s.date);
          return d >= monthStart && d <= monthEnd;
      });
      fExpenses = expenses.filter(e => {
          const d = new Date(e.date);
          return d >= monthStart && d <= monthEnd;
      });

      const daysMap = new Map<number, {income: number, expense: number}>();
      const daysInMonth = monthEnd.getDate();
      for(let i=1; i<=daysInMonth; i++) daysMap.set(i, {income: 0, expense: 0});
      
      fSales.forEach(s => {
          const d = new Date(s.date);
          daysMap.get(d.getDate())!.income += s.total;
      });
      fExpenses.forEach(e => {
          const d = new Date(e.date);
          daysMap.get(d.getDate())!.expense += e.amount;
      });
      
      cData = Array.from(daysMap.entries()).map(([day, val]) => ({
          name: `${day}`,
          ingresos: val.income,
          egresos: val.expense
      }));
    }

    // Category calculation
    fSales.forEach(s => {
        s.items.forEach(item => {
            const cat = item.category || 'General';
            const value = (item.price - (item.discount || 0)) * item.quantity;
            categoryMap.set(cat, (categoryMap.get(cat) || 0) + value);
        });
    });

    const catData = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const tRevenue = fSales.reduce((acc, s) => acc + s.total, 0);
    const tExpenses = fExpenses.reduce((acc, e) => acc + e.amount, 0);
    const nProfit = tRevenue - tExpenses;

    return {
        filteredSales: fSales,
        filteredExpenses: fExpenses,
        totalRevenue: tRevenue,
        totalExpenses: tExpenses,
        netProfit: nProfit,
        chartData: cData,
        categoryData: catData
    };
  }, [sales, expenses, dateRange, lang]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const result = await analyzeSalesTrends(sales, products); 
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-24 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800"></div>);
    }

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
                <div className="flex justify-between items-start">
                    <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400'}`}>{d}</span>
                    {daySales.length > 0 && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded-full font-bold">
                            {daySales.length}
                        </span>
                    )}
                </div>
                
                {dayTotal > 0 && (
                    <div className="text-right">
                        <span className="block font-bold text-slate-800 dark:text-green-400 text-sm">${dayTotal.toFixed(0)}</span>
                    </div>
                )}
            </div>
        );
    }
    return days;
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const monthNamesEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const dayNamesEn = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('dash_title', lang)}</h2>
          <p className="text-slate-500 text-sm dark:text-slate-400">{t('dash_subtitle', lang)}</p>
        </div>
        
        <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <button 
                onClick={() => setDateRange('today')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${dateRange === 'today' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
                {t('dash_period_today', lang)}
            </button>
            <button 
                onClick={() => setDateRange('week')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${dateRange === 'week' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
                {t('dash_period_week', lang)}
            </button>
            <button 
                onClick={() => setDateRange('month')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${dateRange === 'month' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
                {t('dash_period_month', lang)}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{t('dash_income', lang)}</p>
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
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{t('dash_expenses', lang)}</p>
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
              <p className="text-sm text-slate-300 font-semibold uppercase tracking-wider">{t('dash_profit', lang)}</p>
              <h3 className={`text-3xl font-bold mt-1 ${netProfit >= 0 ? 'text-white' : 'text-red-300'}`}>
                ${netProfit.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 bg-slate-800 text-amber-400 rounded-xl">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="text-xs text-slate-400 relative z-10">
            {netProfit >= 0 ? t('dash_profit_positive', lang) : t('dash_profit_negative', lang)}
          </div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500 rounded-full blur-3xl opacity-10"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[400px]">
          <h3 className="font-bold text-slate-700 dark:text-white mb-6 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            {t('dash_chart_title', lang)}
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
              <Bar name={lang === 'es' ? "Ingresos" : "Income"} dataKey="ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={30} />
              <Bar name={lang === 'es' ? "Gastos" : "Expenses"} dataKey="egresos" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[400px]">
            <h3 className="font-bold text-slate-700 dark:text-white mb-6 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-slate-400" />
                {t('dash_category_title', lang)}
            </h3>
            <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                    <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, lang === 'es' ? 'Ventas' : 'Sales']}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                    <Calendar className="text-blue-600" size={20}/> {t('dash_calendar', lang)}
                </h3>
                <div className="flex items-center gap-4">
                    <span className="text-slate-900 dark:text-white font-bold capitalize w-32 text-center">
                        {lang === 'es' ? monthNames[currentMonth.getMonth()] : monthNamesEn[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </span>
                    <div className="flex gap-1">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"><ChevronLeft size={20}/></button>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"><ChevronRight size={20}/></button>
                    </div>
                </div>
            </div>
            
            <div className="p-6">
                <div className="grid grid-cols-7 gap-px mb-2 text-center">
                    {(lang === 'es' ? dayNames : dayNamesEn).map(d => (
                        <div key={d} className="text-xs font-bold text-slate-400 uppercase pb-2">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    {renderCalendar()}
                </div>
            </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl shadow-sm border border-amber-100 dark:border-slate-700 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-amber-100 dark:bg-slate-700 rounded-lg text-amber-600 dark:text-amber-400">
                <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">{t('dash_ai_title', lang)}</h3>
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
            {analyzing ? t('dash_ai_analyzing', lang) : t('dash_ai_btn', lang)}
          </button>
        </div>
      </div>

      {selectedDayDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900 rounded-t-xl">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                            {selectedDayDetails.date.toLocaleDateString()}
                        </h3>
                        <p className="text-sm text-slate-500">Resumen</p>
                    </div>
                    <button onClick={() => setSelectedDayDetails(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-slate-700/50 border-b border-blue-100 dark:border-slate-600 flex justify-between items-center">
                    <span className="font-medium text-blue-800 dark:text-blue-300">Total</span>
                    <span className="font-bold text-2xl text-blue-700 dark:text-white">${selectedDayDetails.total.toFixed(2)}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {selectedDayDetails.sales.length === 0 ? (
                        <p className="text-center text-slate-400">Sin movimientos.</p>
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
