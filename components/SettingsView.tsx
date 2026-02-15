
import React, { useState } from 'react';
import { useStore } from '../store';
import { Building2, Coins, ReceiptText, CheckCircle2, Clock, MessageCircle, Bot, Share2, Database, Copy, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { PromoBanner } from './PromoBanner';
import { Button } from './ui/Button';
import { WhatsAppModal } from './WhatsAppModal';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, isWhatsAppModalOpen, setWhatsAppModalOpen } = useStore();
  const [showSql, setShowSql] = useState(false);

  const sqlSnippet = `
-- 1. Habilitar inserción pública en Orders (Para que lleguen los pedidos)
create policy "Public insert orders"
on public.orders for insert
to public
with check (true);

-- 2. Asegurar que el dueño pueda ver sus pedidos
create policy "Owner view orders"
on public.orders for select
to authenticated
using (auth.uid() = user_id);

-- 3. Asegurar que el dueño pueda actualizar estados
create policy "Owner update orders"
on public.orders for update
to authenticated
using (auth.uid() = user_id);

-- 4. Habilitar lectura pública de productos (Para la tienda)
create policy "Public view products"
on public.products for select
to public
using (true);

-- 5. Habilitar lectura pública de categorías
create policy "Public view categories"
on public.categories for select
to public
using (true);
  `.trim();

  const copySql = () => {
      navigator.clipboard.writeText(sqlSnippet);
      alert("SQL Copiado. Ejecútalo en el 'SQL Editor' de tu Supabase.");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto custom-scrollbar overflow-y-auto h-full pb-20 space-y-12">
      
      {/* Header */}
      <div>
         <h2 className="text-3xl font-bold text-white mb-2">Configuración del Sistema</h2>
         <p className="text-gray-500">Gestiona los parámetros de tu empresa y preferencias.</p>
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
                              <h3 className="text-xl font-bold text-white">Pedidos por WhatsApp</h3>
                              {settings.whatsappEnabled ? (
                                  <span className="text-[10px] bg-green-500 text-black font-bold px-2 py-0.5 rounded-full">CONECTADO</span>
                              ) : (
                                  <span className="text-[10px] bg-gray-800 text-gray-400 font-bold px-2 py-0.5 rounded-full">PENDIENTE</span>
                              )}
                          </div>
                          <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                              Conecta tu número para que los clientes te envíen pedidos directamente desde tu catálogo público.
                          </p>
                      </div>
                  </div>
                  
                  <Button 
                    onClick={() => setWhatsAppModalOpen(true)}
                    className={`${settings.whatsappEnabled ? 'bg-[#1a1a1a] text-white border border-white/10' : 'bg-green-600 text-black hover:bg-green-500'} font-bold shadow-xl`}
                  >
                      {settings.whatsappEnabled ? 'Cambiar Número' : 'Conectar Ahora'}
                  </Button>
              </div>
              
              {settings.whatsappEnabled && (
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-green-500" />
                          <span>Recepción de Pedidos: <span className="text-white">Activa</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                          <Share2 size={14} className="text-green-500" />
                          <span>Catálogo Vinculado</span>
                      </div>
                  </div>
              )}
          </div>

          {/* More integrations placeholder */}
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
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
        
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
              <ReceiptText size={12} /> Impuesto (IGV/IVA)
            </label>
             <div className="relative">
               <input 
                type="number" 
                value={Math.round(settings.taxRate * 100)}
                onChange={(e) => updateSettings({ taxRate: parseFloat(e.target.value) / 100 })}
                className="w-full px-4 py-3 bg-black border border-green-900/30 rounded-xl text-white focus:border-green-500 outline-none transition-all font-mono pr-8"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
             </div>
             <p className="text-[10px] text-gray-600 mt-1">Usado para cálculo de precios netos.</p>
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
             <p className="text-[10px] text-gray-600 mt-1">Días sin movimiento para alerta.</p>
          </div>
        </div>
      </div>

      {/* DATABASE TROUBLESHOOTING */}
      <div className="bg-[#111] rounded-3xl border border-white/5 p-8">
          <div className="flex justify-between items-start">
              <div>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <Database size={20} className="text-blue-500" />
                      Diagnóstico de Base de Datos
                  </h3>
                  <p className="text-gray-500 text-sm max-w-lg">
                      Si tus clientes envían pedidos pero <span className="text-white font-bold">no aparecen en tu lista</span>, es probable que falten permisos públicos en Supabase.
                  </p>
              </div>
              <Button variant="secondary" onClick={() => setShowSql(!showSql)} icon={showSql ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}>
                  {showSql ? 'Ocultar SQL' : 'Ver Solución SQL'}
              </Button>
          </div>

          {showSql && (
              <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-4 mb-4 flex items-start gap-3">
                      <AlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-amber-200">
                          <p className="font-bold mb-1">Instrucciones:</p>
                          <ol className="list-decimal pl-4 space-y-1 opacity-90">
                              <li>Copia el código de abajo.</li>
                              <li>Ve a tu proyecto en Supabase &gt; <strong>SQL Editor</strong>.</li>
                              <li>Pega el código y haz clic en <strong>RUN</strong>.</li>
                              <li>Esto habilitará los pedidos públicos.</li>
                          </ol>
                      </div>
                  </div>
                  
                  <div className="relative group">
                      <pre className="bg-black border border-white/10 rounded-xl p-4 text-xs font-mono text-green-400 overflow-x-auto">
                          {sqlSnippet}
                      </pre>
                      <button 
                        onClick={copySql}
                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
                        title="Copiar Código"
                      >
                          <Copy size={16} />
                      </button>
                  </div>
              </div>
          )}
      </div>

      {/* PROMOTIONAL BANNER */}
      <PromoBanner />

      <WhatsAppModal isOpen={isWhatsAppModalOpen} onClose={() => setWhatsAppModalOpen(false)} />
    </div>
  );
};
