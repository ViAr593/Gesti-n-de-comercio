import React, { useState, useRef } from 'react';
import { BusinessConfig, OpeningHours, DaySchedule } from '../types';
import { Save, Building2, Receipt, Image as ImageIcon, Check, Moon, Sun, Database, Download, Upload, AlertTriangle, Clock, MessageCircle, Globe } from 'lucide-react';
import { db } from '../services/db';
import { t, Language } from '../services/translations';

interface SettingsProps {
  config: BusinessConfig;
  setConfig: (config: BusinessConfig) => void;
  lang?: Language;
}

export const Settings: React.FC<SettingsProps> = ({ config, setConfig, lang = 'es' }) => {
  const [formData, setFormData] = useState<BusinessConfig>(config);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
        setSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    const updatedConfig = { ...formData, theme };
    setFormData(updatedConfig);
    setConfig(updatedConfig); 
    setSaved(false);
  };

  const handleLanguageChange = (language: 'es' | 'en') => {
    const updatedConfig = { ...formData, language };
    setFormData(updatedConfig);
    setConfig(updatedConfig); 
    setSaved(false);
  };

  const handleScheduleChange = (day: keyof OpeningHours, field: keyof DaySchedule, value: any) => {
    if (!formData.openingHours) return;

    setFormData(prev => ({
        ...prev,
        openingHours: {
            ...prev.openingHours!,
            [day]: {
                ...prev.openingHours![day],
                [field]: value
            }
        }
    }));
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfig(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportData = () => {
    const fullData = {
      config: formData, products: db.products.getAll(), suppliers: db.suppliers.getAll(), customers: db.customers.getAll(), employees: db.employees.getAll(), sales: db.sales.getAll(), expenses: db.expenses.getAll(), quotations: db.quotations.getAll(), logs: db.logs.getAll(), timestamp: new Date().toISOString(), version: '1.0'
    };
    const dataStr = JSON.stringify(fullData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_gestorpro_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm("ADVERTENCIA: Al importar un respaldo se SOBREESCRIBIRÁN todos los datos actuales. ¿Desea continuar?")) { if (fileInputRef.current) fileInputRef.current.value = ''; return; }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.version || !json.config) throw new Error("Formato inválido.");
        if (json.products) db.products.set(json.products);
        if (json.suppliers) db.suppliers.set(json.suppliers);
        if (json.customers) db.customers.set(json.customers);
        if (json.employees) db.employees.set(json.employees);
        if (json.sales) db.sales.set(json.sales);
        if (json.expenses) db.expenses.set(json.expenses);
        if (json.quotations) db.quotations.set(json.quotations);
        if (json.logs) db.logs.set(json.logs);
        if (json.config) { db.config.set(json.config); setConfig(json.config); }
        alert("Restaurado correctamente.");
        window.location.reload();
      } catch (error) { console.error(error); alert("Error al importar."); }
    };
    reader.readAsText(file);
  };

  const daysOfWeek: { key: keyof OpeningHours, label: string }[] = [
    { key: 'monday', label: lang === 'es' ? 'Lunes' : 'Monday' },
    { key: 'tuesday', label: lang === 'es' ? 'Martes' : 'Tuesday' },
    { key: 'wednesday', label: lang === 'es' ? 'Miércoles' : 'Wednesday' },
    { key: 'thursday', label: lang === 'es' ? 'Jueves' : 'Thursday' },
    { key: 'friday', label: lang === 'es' ? 'Viernes' : 'Friday' },
    { key: 'saturday', label: lang === 'es' ? 'Sábado' : 'Saturday' },
    { key: 'sunday', label: lang === 'es' ? 'Domingo' : 'Sunday' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('set_title', lang)}</h2>
        <p className="text-slate-500 text-sm dark:text-slate-400">{t('set_subtitle', lang)}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                {formData.theme === 'dark' ? <Moon className="text-slate-500" size={20}/> : <Sun className="text-slate-500" size={20}/>}
                <h3 className="font-bold text-slate-700 dark:text-slate-200">{t('set_appearance', lang)}</h3>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-2 gap-4 max-w-md">
                    <button type="button" onClick={() => handleThemeChange('light')} className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${formData.theme !== 'dark' ? 'border-amber-500 bg-amber-50 dark:bg-slate-700 text-slate-900 dark:text-white' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 text-slate-500'}`}>
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-amber-500"><Sun size={16} /></div>
                        <span className="font-medium">{t('set_theme_light', lang)}</span>
                    </button>
                    <button type="button" onClick={() => handleThemeChange('dark')} className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${formData.theme === 'dark' ? 'border-blue-500 bg-slate-900 text-white' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 text-slate-500'}`}>
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-blue-400"><Moon size={16} /></div>
                        <span className="font-medium">{t('set_theme_dark', lang)}</span>
                    </button>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                <Globe className="text-slate-500" size={20} />
                <h3 className="font-bold text-slate-700 dark:text-slate-200">{t('set_language', lang)}</h3>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-2 gap-4 max-w-md">
                    <button type="button" onClick={() => handleLanguageChange('es')} className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${formData.language === 'es' ? 'border-emerald-500 bg-emerald-50 dark:bg-slate-700 text-slate-900 dark:text-white' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 text-slate-500'}`}>
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-emerald-500 font-bold text-xs">ES</div>
                        <span className="font-medium">Español</span>
                    </button>
                    <button type="button" onClick={() => handleLanguageChange('en')} className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${formData.language === 'en' ? 'border-indigo-500 bg-indigo-50 dark:bg-slate-700 text-slate-900 dark:text-white' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 text-slate-500'}`}>
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-indigo-500 font-bold text-xs">EN</div>
                        <span className="font-medium">English</span>
                    </button>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
            <Building2 className="text-slate-500" size={20} />
            <h3 className="font-bold text-slate-700 dark:text-slate-200">{t('set_identity', lang)}</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 flex items-start gap-6">
              <div className="w-24 h-24 rounded-lg bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center relative overflow-hidden group">
                {formData.logo ? (<img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />) : (<ImageIcon className="text-slate-300" size={32} />)}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" title="Cambiar Logo" />
              </div>
              <div className="flex-1">
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('set_name', lang)}</label>
                 <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Mi Tienda" />
              </div>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('set_tax', lang)}</label><input type="text" name="taxId" value={formData.taxId} onChange={handleChange} className="w-full px-4 py-2 border dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('set_phone', lang)}</label><input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('set_address', lang)}</label><input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
             <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('set_email', lang)}</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2"><MessageCircle size={16} className="text-green-600"/>{t('set_whatsapp', lang)}</label><input type="tel" name="whatsapp" value={formData.whatsapp || ''} onChange={handleChange} className="w-full px-4 py-2 border dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="593999999999" /></div>
          </div>
        </div>

        {formData.openingHours && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Clock className="text-slate-500" size={20} /><h3 className="font-bold text-slate-700 dark:text-slate-200">{t('set_schedule', lang)}</h3></div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {daysOfWeek.map((day) => {
                            const schedule = formData.openingHours![day.key];
                            return (
                                <div key={day.key} className={`border rounded-lg p-3 flex flex-col gap-3 transition-colors ${schedule.isOpen ? 'border-green-500 bg-green-50/20 dark:border-green-700 dark:bg-green-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" checked={schedule.isOpen} onChange={(e) => handleScheduleChange(day.key, 'isOpen', e.target.checked)} className="w-4 h-4 text-green-600 rounded border-slate-300 focus:ring-green-500" />
                                            <span className={`font-medium ${schedule.isOpen ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>{day.label}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="time" value={schedule.open} disabled={!schedule.isOpen} onChange={(e) => handleScheduleChange(day.key, 'open', e.target.value)} className="flex-1 px-2 py-1 border rounded text-sm bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:dark:bg-slate-900 disabled:dark:text-slate-600" />
                                        <input type="time" value={schedule.close} disabled={!schedule.isOpen} onChange={(e) => handleScheduleChange(day.key, 'close', e.target.value)} className="flex-1 px-2 py-1 border rounded text-sm bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:dark:bg-slate-900 disabled:dark:text-slate-600" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                <Receipt className="text-slate-500" size={20} />
                <h3 className="font-bold text-slate-700 dark:text-slate-200">{t('set_receipt', lang)}</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('set_receipt_msg', lang)}</label>
                    <textarea name="receiptMessage" value={formData.receiptMessage} onChange={handleChange} rows={2} className="w-full px-4 py-2 border dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('set_currency', lang)}</label>
                    <input type="text" name="currencySymbol" value={formData.currencySymbol} onChange={handleChange} className="w-full px-4 py-2 border dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
                 </div>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                <Database className="text-slate-500" size={20} />
                <h3 className="font-bold text-slate-700 dark:text-slate-200">{t('set_backup', lang)}</h3>
            </div>
            <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <button type="button" onClick={handleExportData} className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                        <Download size={18}/> {t('set_btn_export', lang)}
                    </button>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                        <Upload size={18}/> {t('set_btn_import', lang)}
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportData} />
                </div>
            </div>
        </div>

        <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg flex justify-end gap-3 z-20 transition-colors">
             {saved && (<span className="flex items-center text-green-600 font-medium mr-4 animate-fade-in"><Check size={18} className="mr-1"/> {t('set_saved', lang)}</span>)}
             <button type="submit" className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors shadow-lg shadow-slate-900/10">
                <Save size={20} /> {t('set_btn_save', lang)}
             </button>
        </div>
      </form>
    </div>
  );
};