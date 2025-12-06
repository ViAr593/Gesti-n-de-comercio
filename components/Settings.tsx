
import React, { useState } from 'react';
import { BusinessConfig } from '../types';
import { Save, Building2, Receipt, Image as ImageIcon, Check } from 'lucide-react';

interface SettingsProps {
  config: BusinessConfig;
  setConfig: (config: BusinessConfig) => void;
}

export const Settings: React.FC<SettingsProps> = ({ config, setConfig }) => {
  const [formData, setFormData] = useState<BusinessConfig>(config);
  const [saved, setSaved] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfig(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Configuración del Negocio</h2>
        <p className="text-slate-500 text-sm">Personaliza la información que aparece en tus recibos y en la aplicación.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CARD 1: Business Identity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Building2 className="text-slate-500" size={20} />
            <h3 className="font-bold text-slate-700">Identidad del Negocio</h3>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 flex items-start gap-6">
              <div className="w-24 h-24 rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden group">
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="text-slate-300" size={32} />
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Cambiar Logo"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Cambiar
                </div>
              </div>
              <div className="flex-1">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Negocio</label>
                 <input 
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ej. Mi Tienda"
                 />
                 <p className="text-xs text-slate-400 mt-1">Este nombre aparecerá en la barra lateral y tickets.</p>
              </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">RUC / NIT / Identificación</label>
               <input 
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               />
            </div>
            
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono de Contacto</label>
               <input 
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               />
            </div>

            <div className="md:col-span-2">
               <label className="block text-sm font-medium text-slate-700 mb-1">Dirección Física</label>
               <input 
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               />
            </div>

             <div className="md:col-span-2">
               <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico (Visible en Ticket)</label>
               <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               />
            </div>
          </div>
        </div>

        {/* CARD 2: Receipt Customization */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <Receipt className="text-slate-500" size={20} />
                <h3 className="font-bold text-slate-700">Personalización de Recibo</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mensaje al Pie del Recibo</label>
                    <textarea 
                        name="receiptMessage"
                        value={formData.receiptMessage}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        placeholder="Ej. ¡Gracias por su preferencia!"
                    ></textarea>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Símbolo de Moneda</label>
                    <input 
                        type="text"
                        name="currencySymbol"
                        value={formData.currencySymbol}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                        placeholder="$"
                    />
                 </div>
            </div>
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white border-t border-slate-200 shadow-lg flex justify-end gap-3 z-20">
             {saved && (
                 <span className="flex items-center text-green-600 font-medium mr-4 animate-fade-in">
                     <Check size={18} className="mr-1"/> Cambios guardados
                 </span>
             )}
             <button 
                type="submit"
                className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
             >
                <Save size={20} /> Guardar Configuración
             </button>
        </div>
      </form>
    </div>
  );
};