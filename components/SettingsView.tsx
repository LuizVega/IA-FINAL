
import React, { useState } from 'react';
import { useStore } from '../store';
import { Building2, Coins, ReceiptText, CheckCircle2, Clock, MessageCircle, Database, Copy, AlertTriangle, ChevronDown, ChevronUp, Terminal, Play, ShieldAlert } from 'lucide-react';
import { PromoBanner } from './PromoBanner';
import { Button } from './ui/Button';
import { WhatsAppModal } from './WhatsAppModal';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, isWhatsAppModalOpen, setWhatsAppModalOpen } = useStore();
  const [showSql, setShowSql] = useState(true); // Default to open if troubleshooting

  const sqlSnippet = `
-- EJECUTA ESTO EN EL 'SQL EDITOR' DE SUPABASE PARA ACTIVAR PEDIDOS

-- 1. Permitir que CUALQUIERA (público) cree un pedido
create policy "Enable insert for public" 
on public.orders for insert 
to public 
with check (true);

-- 2. Permitir que el DUEÑO vea sus propios pedidos
create policy "Enable read for owner" 
on public.orders for select 
to authenticated 
using (auth.uid() = user_id);

-- 3. Permitir que el DUEÑO actualice sus pedidos (completar/cancelar)
create policy "Enable update for owner" 
on public.orders for update 
to authenticated 
using (auth.uid() = user_id);

-- 4. Hacer públicos los productos (para que se vean en la tienda)
create policy "Enable read products for public" 
on public.products for select 
to public 
using (true);

-- 5. Hacer públicas las categorías
create policy "Enable read categories for public" 
on public.categories for select 
to public 
using (true);
  `.trim();

  const copySql = () => {
      navigator.clipboard.writeText(sqlSnippet);
      alert("CÓDIGO COPIADO.\n\nAHORA:\n1. Ve a Supabase > SQL Editor\n2. Pega el código\n3. Dale clic a 'Run'");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto custom-scrollbar overflow-y-auto h-full pb-20 space-y-12">
      
      <div>
         <h2 className="text-3xl font-bold text-white mb-2">Configuración</h2>
         <p className="text-gray-500">Ajustes generales y diagnóstico del sistema.</p>
      </div>

      {/* --- CRITICAL FIX SECTION --- */}
      <div className="bg-gradient-to-r from-amber-900/20 to-black border border-amber-500/40 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="relative z-10">
              <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-amber-500/20 rounded-xl text-amber-500 border border-amber-500/30 animate-pulse">
                      <Database size={32} />
                  </div>
                  <div>
                      <h3 className="text-2xl font-bold text-white mb-1">¿No te llegan los pedidos?</h3>
                      <p className="text-amber-200 text-sm max-w-xl">
                          Por seguridad, la base de datos bloquea escrituras públicas por defecto. 
                          Debes ejecutar este comando <strong>una sola vez</strong> para permitir que tus clientes guarden pedidos.
                      </p>
                  </div>
              </div>

              <div className="bg-[#050505] rounded-xl border border-white/10 overflow-hidden">
                  <div className="flex justify-between items-center px-4 py-2 bg-[#1a1a1a] border-b border-white/5">
                      <span className="text-xs font-mono text-gray-400 flex items-center gap-2">
                          <Terminal size={12} /> SQL Query
                      </span>
                      <Button size="sm" onClick={copySql} icon={<Copy size={14} />} className="h-8 text-xs bg-amber-600 hover:bg-amber-500 text-black border-none font-bold">
                          Copiar Solución
                      </Button>
                  </div>
                  <pre className="p-4 text-[10px] sm:text-xs font-mono text-green-400 overflow-x-auto whitespace-pre leading-relaxed opacity-90">
                      {sqlSnippet}
                  </pre>
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                  <ShieldAlert size={14} />
                  <span>Este código configura las "Row Level Security Policies" (RLS) necesarias.</span>
              </div>
          </div>
      </div>
      
      {/* Integrations Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0a0a0a] rounded-3xl border border-green-500/20 p-6 relative overflow-hidden group md:col-span-2">
              <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/5 rounded-full blur-[60px] -mr-10 -mt-10 group-hover:bg-green-500/10 transition-all"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                  <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-500 shadow-lg shadow-green-900/20">
                          <MessageCircle size={32} strokeWidth={1.5} />
                      </div>
                      <div>
                          <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold text-white">WhatsApp Business</h3>
                              {settings.whatsappEnabled ? (
                                  <span className="text-[10px] bg-green-500 text-black font-bold px-2 py-0.5 rounded-full">ACTIVO</span>
                              ) : (
                                  <span className="text-[10px] bg-gray-800 text-gray-400 font-bold px-2 py-0.5 rounded-full">INACTIVO</span>
                              )}
                          </div>
                          <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                              El canal principal de ventas. Los clientes enviarán el detalle de su carrito a este número.
                          </p>
                      </div>
                  </div>
                  
                  <Button 
                    onClick={() => setWhatsAppModalOpen(true)}
                    className={`${settings.whatsappEnabled ? 'bg-[#1a1a1a] text-white border border-white/10' : 'bg-green-600 text-black hover:bg-green-500'} font-bold shadow-xl`}
                  >
                      {settings.whatsappEnabled ? 'Editar Número' : 'Conectar Ahora'}
                  </Button>
              </div>
          </div>

          <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 p-6 flex flex-col justify-center items-center text-center opacity-60">
              <div className="w-12 h-12 bg-gray-800 rounded-xl mb-4 flex items-center justify-center">
                  <Coins size={24} className="text-gray-500" />
              </div>
              <h4 className="font-bold text-white mb-1">Facturación</h4>
              <p className="text-xs text-gray-500 mb-4">Integración con SUNAT/DIAN</p>
              <span className="text-[10px] border border-white/10 px-2 py-1 rounded text-gray-400">Próximamente</span>
          </div>
      </div>

      {/* General Settings */}
      <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 p-8 relative overflow-hidden">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
          <Building2 size={24} className="text-green-500" />
          Datos de la Empresa
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre Comercial</label>
            <input 
              type="text" 
              value={settings.companyName}
              onChange={(e) => updateSettings({ companyName: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-green-900/30 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder-gray-700 font-medium"
              placeholder="Mi Empresa S.A."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Coins size={12} /> Moneda Base
            </label>
            <select 
              value={settings.currency}
              onChange={(e) => updateSettings({ currency: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-green-900/30 rounded-xl text-white focus:border-green-500 outline-none appearance-none"
            >
              <option value="USD">Dólar (USD)</option>
              <option value="PEN">Sol Peruano (PEN)</option>
              <option value="MXN">Peso Mexicano (MXN)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="COP">Peso Colombiano (COP)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Clock size={12} /> Umbral de Estancamiento
            </label>
             <div className="relative">
               <input 
                type="number" 
                value={settings.stagnantDaysThreshold || 90}
                onChange={(e) => updateSettings({ stagnantDaysThreshold: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-black border border-green-900/30 rounded-xl text-white focus:border-green-500 outline-none transition-all font-mono pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">DÍAS</span>
             </div>
          </div>
        </div>
      </div>

      <PromoBanner />
      <WhatsAppModal isOpen={isWhatsAppModalOpen} onClose={() => setWhatsAppModalOpen(false)} />
    </div>
  );
};
