import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { AppLogo } from './AppLogo';
import { 
  ArrowRight, PlayCircle, LayoutGrid, MessageSquare, 
  FolderRoot, BarChart3, Search, Bell, Settings, 
  Scan, Zap, ShieldCheck, Database, Upload, Tag,
  CheckCircle2, Lock, Bot, Rocket, Crown, Loader2
} from 'lucide-react';
import { Button } from './ui/Button';
import { ProductImage } from './ProductImage';
import { DEFAULT_PRODUCT_IMAGE } from '../constants';

interface LandingPageProps {
  onEnterDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDemo }) => {
  const { setAuthModalOpen } = useStore();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observerRef.current?.observe(el));

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  return (
    <div className="bg-[#020203] text-slate-400 font-sans min-h-screen selection:bg-[#00ff88]/30 selection:text-emerald-200 overflow-x-hidden">
      <style>{`
        .glass-panel {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(12px) saturate(180%);
            -webkit-backdrop-filter: blur(12px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 2rem;
            will-change: transform, opacity;
        }
        .text-gradient {
            background: linear-gradient(to right, #00ff88, #00bd65);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .title-gradient {
            background: linear-gradient(135deg, #FFFFFF 0%, #00ff88 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .hero-glow {
            background: radial-gradient(circle at center, rgba(0, 255, 136, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
        }
        .emerald-glow-hover:hover {
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
        }
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            display: flex;
            width: max-content;
            animation: marquee 40s linear infinite;
        }
        .reveal {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.active {
            opacity: 1;
            transform: translateY(0);
        }
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }
        
        .rotate-x-6 { transform: perspective(2000px) rotateX(6deg); }
        .group:hover .rotate-x-0 { transform: perspective(2000px) rotateX(0deg); }
        .perspective-2000 { perspective: 2000px; }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030304]/80 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <AppLogo className="w-8 h-8" />
            <span className="text-white font-semibold tracking-tight text-sm group-hover:opacity-80 transition-opacity">MyMorez</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-[#00ff88] transition-colors">Características</a>
            <a href="#vision" className="hover:text-[#00ff88] transition-colors">Visión</a>
            <a href="#pricing" className="hover:text-[#00ff88] transition-colors">Precios</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setAuthModalOpen(true)}
              className="text-white text-sm hover:text-[#00ff88] transition-colors font-medium hidden sm:block"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => setAuthModalOpen(true)}
              className="px-5 py-2 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 text-[#00ff88] text-xs font-semibold rounded-full border border-[#00ff88]/20 transition-all duration-300 backdrop-blur-sm emerald-glow-hover"
            >
              Empezar Gratis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] hero-glow pointer-events-none opacity-60"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] text-[11px] font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88]/40 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
              </span>
              Vende directamente por WhatsApp
            </div>

            {/* Added pb-2 to prevent descenders (g, j, p) from being cut off */}
            <h1 className="reveal delay-100 text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-tight title-gradient pb-2">
              Convierte tu Stock en <br/> <span className="text-gradient">Ventas Reales</span>
            </h1>

            <p className="reveal delay-200 text-lg md:text-xl text-slate-400 max-w-3xl mb-12 leading-relaxed font-light">
              La forma más rápida de <span className="text-white font-medium">lanzar tu tienda online.</span> Gestiona tu stock internamente y deja que tus clientes compren externamente desde tu catálogo digital.
            </p>

            <div className="reveal delay-300 flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="w-full sm:w-auto group relative px-10 py-4 bg-[#00ff88] text-black text-sm font-bold rounded-full hover:bg-[#00e67a] transition-all duration-300 shadow-[0_0_30px_-5px_rgba(0,255,136,0.5)] emerald-glow-hover flex items-center justify-center gap-2"
              >
                Obtener 3 Meses Gratis
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={onEnterDemo}
                className="w-full sm:w-auto px-10 py-4 bg-transparent border border-white/10 hover:border-[#00ff88]/30 text-white text-sm font-medium rounded-full transition-all duration-300 flex items-center justify-center gap-2"
              >
                <PlayCircle size={18} className="text-[#00ff88]" />
                Ver Demo Interactiva
              </button>
            </div>
            <p className="reveal delay-300 mt-6 text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
              Oferta limitada para nuevos registros este mes.
            </p>
          </div>
        </div>

        {/* 3D Dashboard Mockup */}
        <div className="mt-20 relative perspective-2000 group reveal delay-300 px-4">
          <div className="relative w-full max-w-6xl mx-auto glass-panel rounded-3xl p-1 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] transition-all duration-700 ease-out rotate-x-6 group-hover:rotate-x-0 overflow-hidden border border-white/10 backdrop-blur-2xl">
            
            {/* Fake Dashboard UI - Force min-width to ensure it looks like desktop even on mobile */}
            <div className="bg-[#050507]/90 rounded-2xl overflow-x-auto flex h-[400px] md:h-[600px] relative">
               <div className="flex w-full min-w-[1000px] h-full"> {/* Inner container enforces width */}
                   {/* Sidebar */}
                   <div className="w-16 md:w-20 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-[#030304]/50 flex-shrink-0">
                      <AppLogo className="w-8 h-8" />
                      <div className="flex flex-col gap-4 mt-4">
                         <div className="p-2 bg-[#00ff88]/10 rounded-lg text-[#00ff88]"><LayoutGrid size={20} /></div>
                         <div className="p-2 text-slate-600"><FolderRoot size={20} /></div>
                         <div className="p-2 text-slate-600"><BarChart3 size={20} /></div>
                      </div>
                   </div>
                   
                   {/* Main Content Area */}
                   <div className="flex-1 p-6 md:p-8 bg-gradient-to-br from-[#08080A] to-[#050507] min-w-0">
                      <div className="flex justify-between items-center mb-8">
                          <div>
                             <h3 className="text-white font-bold text-xl">Panel de Control</h3>
                             <p className="text-slate-500 text-xs">Vista general del inventario</p>
                          </div>
                          <div className="flex gap-3">
                             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400"><Search size={14}/></div>
                             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400"><Bell size={14}/></div>
                          </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6 mb-8">
                         <div className="glass-panel p-5 border border-white/5">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-2">Ventas del Mes</div>
                            <div className="text-2xl font-bold text-white">$42,940</div>
                            <div className="text-[10px] text-[#00ff88] mt-1">+8.2% vs mes anterior</div>
                         </div>
                         <div className="glass-panel p-5 border border-white/5">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-2">Pedidos Recientes</div>
                            <div className="text-2xl font-bold text-white">1,245</div>
                            <div className="text-[10px] text-slate-500 mt-1">50 Categorías</div>
                         </div>
                         <div className="glass-panel p-5 border border-white/5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[#00ff88]/5"></div>
                            <div className="text-xs text-[#00ff88] uppercase font-bold mb-2 flex items-center gap-2"><Zap size={12}/> Tienda Online: Activa</div>
                            <div className="text-sm text-white font-medium">Escaneando...</div>
                            <div className="mt-3 h-1 bg-[#00ff88]/20 rounded-full overflow-hidden">
                               <div className="h-full bg-[#00ff88] w-2/3 animate-pulse"></div>
                            </div>
                         </div>
                      </div>

                      <div className="glass-panel p-6 border border-white/5 h-full">
                         <div className="flex justify-between items-center mb-4">
                            <h4 className="text-white font-bold text-sm">Inventario Reciente</h4>
                            <span className="text-[#00ff88] text-xs font-bold cursor-pointer">Ver Todo</span>
                         </div>
                         <div className="space-y-3">
                            {[1, 2, 3].map((i) => {
                               const isDefault = i === 2; // Make the second item use default logo
                               const imgUrl = isDefault ? DEFAULT_PRODUCT_IMAGE : `https://source.unsplash.com/random/100x100?tech&sig=${i}`;
                               return (
                               <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden">
                                        <ProductImage src={imgUrl} className="w-full h-full object-cover opacity-60 rounded-lg" alt="" />
                                     </div>
                                     <div>
                                        <div className="text-white text-sm font-medium">Producto Tecnológico {i}</div>
                                        <div className="text-[10px] text-slate-500">SKU: TECH-00{i}</div>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <div className="text-white text-sm font-bold">$120.00</div>
                                     <div className="text-[10px] text-[#00ff88]">En Stock</div>
                                  </div>
                               </div>
                            )})}
                         </div>
                      </div>
                   </div>
               </div>
            </div>

            {/* Reflection */}
            <div className="absolute -bottom-20 left-0 right-0 h-40 bg-[#00ff88]/10 blur-[100px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"></div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-24 max-w-7xl mx-auto px-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
             <div className="reveal">
                 <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Todo lo que necesitas para crecer</h2>
                 <p className="text-slate-400 text-lg leading-relaxed mb-6">
                    Centraliza tus operaciones. Desde que llega la mercadería hasta que el cliente final hace el pedido por WhatsApp. Todo conectado.
                 </p>
                 <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                       <div className="bg-green-500/20 p-2 rounded-lg text-green-400"><Rocket size={20} /></div>
                       <div>
                          <h4 className="text-white font-bold">Velocidad Extrema</h4>
                          <p className="text-xs text-gray-500">Procesamiento de datos en milisegundos.</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                       <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400"><Crown size={20} /></div>
                       <div>
                          <h4 className="text-white font-bold">Liderazgo de Mercado</h4>
                          <p className="text-xs text-gray-500">Herramientas de nivel empresarial para todos.</p>
                       </div>
                    </div>
                 </div>
             </div>
             <div className="relative reveal delay-200">
                 <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-blue-500/20 rounded-full blur-[100px]"></div>
                 <div className="glass-panel p-8 border border-white/10 relative z-10 flex flex-col gap-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <span className="text-white font-bold">Roadmap 2026</span>
                        <span className="text-green-500 text-xs font-bold px-2 py-1 bg-green-500/10 rounded">En Progreso</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                           <Loader2 size={16} className="text-green-500 animate-spin"/> App Móvil Nativa (iOS/Android) 
                           <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 rounded">En Desarrollo</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                           <CheckCircle2 size={16} className="text-green-500"/> Integración con Shopify
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                           <CheckCircle2 size={16} className="text-green-500"/> Predicción de Demanda con IA
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                           <div className="w-4 h-4 rounded-full border border-gray-600"></div> Facturación Electrónica
                        </div>
                    </div>
                 </div>
             </div>
          </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 relative max-w-7xl mx-auto px-6">
         <div className="mb-16 md:text-center max-w-3xl md:mx-auto reveal">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Tu inventario, <br/> en piloto automático.</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
               Elimina el error humano. MyMorez utiliza visión por computadora para identificar productos, leer códigos de barras y organizar tu almacén instantáneamente.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-8 glass-panel rounded-[2rem] hover:bg-[#00ff88]/[0.02] transition-all duration-300 relative overflow-hidden reveal delay-100 border border-white/5">
               <div className="w-14 h-14 bg-[#00ff88]/10 rounded-xl flex items-center justify-center mb-8 border border-[#00ff88]/20">
                  <Scan size={28} className="text-[#00ff88]" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">Tu Tienda Web</h3>
               <p className="text-sm text-slate-400 leading-relaxed">
                  Olvídate de pagar desarrolladores. Tu inventario se convierte en una página web elegante lista para compartir.
               </p>
            </div>

            <div className="group p-8 glass-panel rounded-[2rem] hover:bg-[#00ff88]/[0.02] transition-all duration-300 md:col-span-2 relative overflow-hidden reveal delay-200 border border-white/5">
               <div className="flex flex-col md:flex-row gap-10 items-start md:items-center h-full">
                  <div className="flex-1 z-10">
                     <div className="w-14 h-14 bg-[#00ff88]/10 rounded-xl flex items-center justify-center mb-8 border border-[#00ff88]/20">
                        <ShieldCheck size={28} className="text-[#00ff88]" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-3">Carrito de Compras Simple</h3>
                     <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                        Tus clientes seleccionan productos, ven el total y te envían el detalle listo para confirmar el pago y envío.
                     </p>
                  </div>
                  <div className="flex-1 w-full bg-[#050507] border border-white/10 rounded-2xl p-6 shadow-2xl transform group-hover:translate-y-[-4px] transition-transform duration-500">
                     <div className="flex gap-2 items-center mb-4 border-b border-white/5 pb-3">
                        <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></div>
                        <span className="text-[10px] font-bold text-[#00ff88] tracking-widest uppercase">Sistema Activo</span>
                     </div>
                     <div className="flex gap-4 items-center">
                        <div className="h-10 w-10 rounded-lg bg-red-900/20 flex items-center justify-center border border-red-500/20 text-red-500">
                           <ShieldCheck size={20} />
                        </div>
                        <div>
                           <div className="text-white text-xs font-bold">Stock Crítico Detectado</div>
                           <div className="text-[10px] text-slate-500">3 items requieren reorden</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="group p-8 glass-panel rounded-[2rem] hover:bg-[#00ff88]/[0.02] transition-all duration-300 reveal delay-100 border border-white/5">
               <div className="w-14 h-14 bg-[#00ff88]/10 rounded-xl flex items-center justify-center mb-8 border border-[#00ff88]/20">
                  <Database size={28} className="text-[#00ff88]" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">Base de Datos Cloud</h3>
               <p className="text-sm text-slate-400 leading-relaxed">
                  Tus datos sincronizados en tiempo real. Accede desde tu móvil en el almacén o desde tu laptop en la oficina.
               </p>
            </div>

            <div className="group p-8 glass-panel rounded-2xl hover:bg-white/[0.05] transition-all duration-300 reveal delay-200">
               <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 border border-blue-500/20">
                  <Upload size={24} className="text-blue-400" />
               </div>
               <h3 className="text-lg font-medium text-white mb-2">Importación Masiva</h3>
               <p className="text-sm text-slate-400 leading-relaxed">
                  Sube tus Excel o CSV existentes y la IA organizará y limpiará los datos por ti.
               </p>
            </div>

             <div className="group p-8 glass-panel rounded-2xl hover:bg-white/[0.05] transition-all duration-300 reveal delay-300">
               <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6 border border-purple-500/20">
                  <Tag size={24} className="text-purple-400" />
               </div>
               <h3 className="text-lg font-medium text-white mb-2">Etiquetado Inteligente</h3>
               <p className="text-sm text-slate-400 leading-relaxed">
                  Generación automática de códigos SKU, QR y de barras listos para imprimir.
               </p>
            </div>
         </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative overflow-hidden bg-black/50 border-t border-white/5">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16 reveal">
                <span className="bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                    Planes Flexibles
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Crece sin límites</h2>
                <p className="text-slate-400 text-lg">Elige el plan que mejor se adapte a tu etapa actual.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end reveal delay-100">
                
                {/* STARTER (Free) */}
                <div className="bg-[#111] rounded-3xl p-8 border border-white/5 flex flex-col relative group hover:border-white/10 transition-all h-[500px]">
                    <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                    <div className="text-3xl font-bold text-white mb-6">$0 <span className="text-sm font-medium text-gray-500">/mes</span></div>
                    <p className="text-gray-400 text-sm mb-6">
                        Perfecto para empezar. Importa tu inventario y organízate sin coste.
                    </p>
                    <div className="space-y-4 mb-8 flex-1">
                        <FeatureItem text="50 Items" active />
                        <FeatureItem text="1 Usuario" active />
                        <FeatureItem text="Importación Excel/CSV" active color="text-gray-200 font-bold" />
                        <FeatureItem text="Generación QR Básica" active={false} />
                        <FeatureItem text="Códigos de Barras" active={false} />
                    </div>
                    <Button 
                        className="w-full bg-white/10 text-white hover:bg-white/20 border-none"
                        onClick={() => setAuthModalOpen(true)}
                    >
                        Comenzar Gratis
                    </Button>
                </div>

                {/* GROWTH (Standard) */}
                <div className="bg-[#111] rounded-3xl p-8 border border-green-500/30 flex flex-col relative group hover:border-green-400 transition-all shadow-lg hover:shadow-green-900/20 transform md:-translate-y-4 h-[540px] z-10">
                    <div className="absolute top-0 inset-x-0 h-1 bg-green-500 rounded-t-3xl"></div>
                    <div className="absolute top-4 right-4 bg-green-500 text-black text-[10px] font-bold px-3 py-1 rounded-full">
                        MYPE FAVORITO
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <Zap size={18} className="text-green-500" /> Growth
                    </h3>
                    <div className="text-4xl font-bold text-white mb-6">$9.90 <span className="text-sm font-medium text-gray-500">/mes</span></div>
                    <p className="text-gray-300 text-sm mb-6">
                        Herramientas profesionales de etiquetado y alertas para negocios activos.
                    </p>
                    <div className="space-y-4 mb-8 flex-1">
                        <FeatureItem text="2,000 Items" active />
                        <FeatureItem text="Importación Ilimitada" active />
                        <FeatureItem text="Generación Códigos de Barras" active color="text-green-400 font-bold" icon={<Zap size={14}/>} />
                        <FeatureItem text="Códigos QR" active />
                        <FeatureItem text="Alertas Stock Bajo" active />
                        <FeatureItem text="Marca Personalizada" active />
                    </div>
                    
                    <Button variant="primary" className="w-full py-3 text-base" onClick={() => setAuthModalOpen(true)}>
                        Obtener 3 Meses Gratis
                    </Button>
                </div>

                {/* BUSINESS (Premium) */}
                <div className="bg-gradient-to-b from-[#1a1a1a] to-black rounded-3xl p-8 border border-purple-500/20 flex flex-col relative group hover:border-purple-500/50 transition-all h-[500px]">
                    <div className="absolute top-4 right-4 bg-purple-500/20 text-purple-400 text-[10px] font-bold px-3 py-1 rounded-full border border-purple-500/50">
                        PRÓXIMAMENTE
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <Bot size={18} className="text-purple-500" /> Business
                    </h3>
                    <div className="text-3xl font-bold text-white mb-6 opacity-60">$29.90 <span className="text-sm font-medium text-gray-500">/mes</span></div>
                    <p className="text-gray-400 text-sm mb-6">
                        Automatización completa e integraciones para empresas consolidadas.
                    </p>
                    <div className="space-y-4 mb-8 flex-1 opacity-60">
                        <FeatureItem text="Items Ilimitados" active />
                        <FeatureItem text="Todo lo de Growth" active />
                        <FeatureItem text="API & Webhooks" active color="text-purple-400" />
                        <FeatureItem text="Multi-Sucursal" active />
                        <FeatureItem text="Predicción Demanda (IA)" active color="text-purple-400" />
                    </div>
                    <Button className="w-full bg-white/5 text-gray-500 hover:bg-white/10 border-none py-3 cursor-not-allowed" disabled>
                        Notificarme
                    </Button>
                </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#020203] py-20 text-sm reveal">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="col-span-2 md:col-span-1">
               <div className="flex items-center gap-3 mb-6">
                  <AppLogo className="w-6 h-6" />
                  <span className="text-white font-bold tracking-tight">MyMorez</span>
               </div>
               <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">
                  El Sistema Operativo de Inventario para la era de la IA.
               </p>
            </div>
            <div>
               <p className="text-white font-bold mb-6">Producto</p>
               <ul className="space-y-4 text-slate-500">
                  <li><a href="#features" className="hover:text-[#00ff88] transition-colors">Características</a></li>
                  <li><a href="#vision" className="hover:text-[#00ff88] transition-colors">Visión</a></li>
                  <li><a href="#pricing" className="hover:text-[#00ff88] transition-colors">Precios</a></li>
               </ul>
            </div>
            <div>
               <p className="text-white font-bold mb-6">Recursos</p>
               <ul className="space-y-4 text-slate-500">
                  <li><a href="#" className="hover:text-[#00ff88] transition-colors">Documentación</a></li>
                  <li><a href="#" className="hover:text-[#00ff88] transition-colors">Guías</a></li>
                  <li><a href="#" className="hover:text-[#00ff88] transition-colors">Soporte</a></li>
               </ul>
            </div>
            <div>
               <p className="text-white font-bold mb-6">Legal</p>
               <ul className="space-y-4 text-slate-500">
                  <li><a href="#" className="hover:text-[#00ff88] transition-colors">Privacidad</a></li>
                  <li><a href="#" className="hover:text-[#00ff88] transition-colors">Términos</a></li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 text-slate-600 text-[10px] font-medium uppercase tracking-[0.1em] flex justify-between">
            <p>© 2026 MyMorez Systems Inc.</p>
         </div>
      </footer>
    </div>
  );
};

const FeatureItem = ({ text, active, color, icon }: { text: string, active: boolean, color?: string, icon?: React.ReactNode }) => (
    <div className={`flex items-center gap-3 text-sm ${active ? (color || 'text-gray-300') : 'text-gray-600'}`}>
        {active ? (
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${color ? 'bg-transparent' : 'bg-green-500/20'}`}>
                {icon ? icon : <CheckCircle2 size={14} className={color ? 'text-inherit' : 'text-green-500'} />}
            </div>
        ) : (
            <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center">
                <Lock size={12} />
            </div>
        )}
        <span className={!active ? 'line-through decoration-gray-700' : ''}>{text}</span>
    </div>
);
