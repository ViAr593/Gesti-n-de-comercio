import React, { useState } from 'react';
import { Lock, ArrowRight, User } from 'lucide-react';
import { db } from '../services/db';
import { Employee } from '../types';

interface LoginProps {
  onLoginSuccess: (user: Employee) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = db.auth.login(email, password);
    if (user) {
      onLoginSuccess(user);
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-amber-600"></div>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Bienvenido a GestorPro</h1>
          <p className="text-slate-500 text-sm mt-2">Sistema de Control de Inventarios y Ventas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Usuario (Email)</label>
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                <input 
                  autoFocus
                  type="text" 
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(false); }}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  placeholder="admin@sistema.com"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña</label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(false); }}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  placeholder="••••••••"
                />
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2 font-medium animate-pulse">
                Credenciales incorrectas. Verifique email y contraseña.
              </p>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all mt-4"
          >
            Ingresar al Sistema <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500 mb-1">Credenciales Demo:</p>
            <p className="text-xs font-mono bg-slate-100 px-2 py-1 rounded inline-block text-slate-600">admin@sistema.com / admin@123*</p>
        </div>
      </div>
    </div>
  );
};