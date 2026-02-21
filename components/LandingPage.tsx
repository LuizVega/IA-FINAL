import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';
import { AppLogo } from './AppLogo';
import {
   ArrowRight, PlayCircle, LayoutGrid, MessageSquare,
   FolderRoot, BarChart3, Search, Bell, Settings,
   Scan, Zap, ShieldCheck, Database, Upload, Tag,
   CheckCircle2, Lock, Bot, Rocket, Crown, Loader2,
   MessageCircle, Sparkles, ChevronDown, Globe, Plus, Minus
} from 'lucide-react';
import { Button } from './ui/Button';
import { ProductImage } from './ProductImage';
import { DEFAULT_PRODUCT_IMAGE } from '../constants';

interface LandingPageProps {
   onEnterDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDemo }) => {
   const { setAuthModalOpen, language, setLanguage } = useStore();
   const { t } = useTranslation();
   const [isLangOpen, setIsLangOpen] = React.useState(false);
   const [openFaq, setOpenFaq] = React.useState<number | null>(null);
   const observerRef = useRef<IntersectionObserver | null>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);

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

      const handleClickOutside = (event: MouseEvent) => {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsLangOpen(false);
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
         if (observerRef.current) observerRef.current.disconnect();
         document.removeEventListener('mousedown', handleClickOutside);
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
               <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                  <AppLogo className="w-8 h-8" />
                  <span className="text-white font-semibold tracking-tight text-sm group-hover:opacity-80 transition-opacity">MyMorez</span>
               </div>

               <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                  <a href="#features" className="hover:text-[#00ff88] transition-colors">{t('landing.features')}</a>
                  <a href="#vision" className="hover:text-[#00ff88] transition-colors">Vision</a>
                  <button onClick={() => (window as any).triggerRoadmap()} className="hover:text-[#00ff88] transition-colors">Roadmap</button>
                  <a href="#pricing" className="hover:text-[#00ff88] transition-colors">{t('landing.pricing')}</a>
               </div>

               <div className="flex items-center gap-2 sm:gap-4">
                  {/* Language Selector Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                     <button
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all duration-300 group"
                        title={language === 'es' ? 'Cambiar idioma' : 'Change language'}
                     >
                        <Globe size={14} className="text-[#00ff88]" />
                        <span className="text-white hidden sm:inline">{language === 'es' ? 'Español' : 'English'}</span>
                        <span className="text-white sm:hidden">{language === 'es' ? 'ES' : 'EN'}</span>
                        <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
                     </button>

                     {isLangOpen && (
                        <div className="absolute top-full right-0 mt-2 w-36 glass-panel p-1.5 z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-white/10">
                           <button
                              onClick={() => { setLanguage('es'); setIsLangOpen(false); }}
                              className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all ${language === 'es' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                           >
                              <span className="text-base">🇪🇸</span>
                              <span>Español</span>
                           </button>
                           <button
                              onClick={() => { setLanguage('en'); setIsLangOpen(false); }}
                              className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all ${language === 'en' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                           >
                              <span className="text-base">🇺🇸</span>
                              <span>English</span>
                           </button>
                        </div>
                     )}
                  </div>

                  <button
                     onClick={() => setAuthModalOpen(true)}
                     className="text-white text-sm hover:text-[#00ff88] transition-colors font-medium hidden sm:block"
                  >
                     {t('landing.login')}
                  </button>
                  <button
                     onClick={() => setAuthModalOpen(true)}
                     className="px-5 py-2 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 text-[#00ff88] text-xs font-semibold rounded-full border border-[#00ff88]/20 transition-all duration-300 backdrop-blur-sm emerald-glow-hover"
                  >
                     {t('landing.startFree')}
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
                  <h1 className="reveal delay-100 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 leading-tight title-gradient pb-2" dangerouslySetInnerHTML={{ __html: t('landing.heroTitle').replace('.', '.<br />').replace('Vende en Segundos.', '<span class="text-gradient">Vende en Segundos.</span>').replace('Sell in Seconds.', '<span class="text-gradient">Sell in Seconds.</span>') }}>
                  </h1>

                  <p className="reveal delay-200 text-lg md:text-xl text-slate-400 max-w-3xl mb-12 leading-relaxed font-light">
                     {t('landing.heroSubtitle')}
                  </p>

                  <div className="reveal delay-300 flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                     <button
                        onClick={() => setAuthModalOpen(true)}
                        className="w-full sm:w-auto group relative px-10 py-4 bg-[#00ff88] text-black text-sm font-bold rounded-full hover:bg-[#00e67a] transition-all duration-300 shadow-[0_0_30px_-5px_rgba(0,255,136,0.5)] emerald-glow-hover flex items-center justify-center gap-2"
                     >
                        {t('auth.promo')}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                     <button
                        onClick={onEnterDemo}
                        className="w-full sm:w-auto px-10 py-4 bg-transparent border border-white/10 hover:border-[#00ff88]/30 text-white text-sm font-medium rounded-full transition-all duration-300 flex items-center justify-center gap-2"
                     >
                        <PlayCircle size={18} className="text-[#00ff88]" />
                        {t('landing.seeDemo')}
                     </button>
                  </div>
                  <p className="reveal delay-300 mt-6 text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                     Oferta limitada para nuevos registros este mes.
                  </p>
               </div>
            </div>

            {/* 3D Dashboard Mockup */}
            <div className="mt-20 relative perspective-2000 group reveal delay-300 px-4">
               <div className="relative w-full max-w-6xl mx-auto glass-panel rounded-3xl p-1 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] transition-all duration-700 ease-out rotate-x-6 group-hover:rotate-x-0 border border-white/10 backdrop-blur-2xl">

                  {/* Fake Dashboard UI - Force min-width to ensure it looks like desktop even on mobile */}
                  <div className="bg-[#050507]/90 rounded-2xl overflow-x-auto overflow-y-hidden flex h-auto relative">
                     <div className="flex w-full min-w-[1000px] h-auto pb-4"> {/* Inner container enforces width */}
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
                                 <h3 className="text-white font-bold text-xl">{t('dashboard.inventorySummary', undefined) || (language === 'es' ? 'Panel de Control' : 'Dashboard')}</h3>
                                 <p className="text-slate-500 text-xs">{language === 'es' ? 'Vista general del inventario' : 'Inventory overview'}</p>
                              </div>
                              <div className="flex gap-3">
                                 <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400"><Search size={14} /></div>
                                 <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400"><Bell size={14} /></div>
                              </div>
                           </div>

                           <div className="grid grid-cols-3 gap-6 mb-8">
                              {/* POTENTIAL REVENUE BLOCK */}
                              <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-xl flex flex-col justify-center min-h-[140px] group/card hover:bg-white/[0.07] transition-all">
                                 <div className="text-[10px] text-gray-500 uppercase font-black tracking-[0.15em] mb-3">{t('landing.mockupRevenue', undefined) || (language === 'es' ? 'POTENCIAL DE VENTAS' : 'SALES POTENTIAL')}</div>
                                 <div className="text-5xl font-bold text-white tracking-tight mb-2">$31</div>
                                 <div className="text-xs text-green-500 font-medium">{t('landing.mockupGrowth')}</div>
                              </div>

                              {/* PRODUCT VARIETY BLOCK */}
                              <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-xl flex flex-col justify-center min-h-[140px] group/card hover:bg-white/[0.07] transition-all">
                                 <div className="text-[10px] text-gray-500 uppercase font-black tracking-[0.15em] mb-3">{t('landing.mockupActiveItems', undefined) || (language === 'es' ? 'VARIEDAD DE PRODUCTOS' : 'PRODUCT VARIETY')}</div>
                                 <div className="text-5xl font-bold text-white tracking-tight mb-2">52 {language === 'es' ? 'Modelos' : 'Models'}</div>
                                 <div className="text-xs text-gray-500 font-medium">{language === 'es' ? 'Total de unidades físicas: 8827' : 'Total physical units: 8827'}</div>
                              </div>

                              {/* ACTIVE STATUS BLOCK (Styled like the others for consistency) */}
                              <div className="bg-[#00ff88]/[0.03] backdrop-blur-xl p-6 rounded-[2.5rem] border border-[#00ff88]/10 shadow-xl flex flex-col justify-center min-h-[140px] group/card hover:bg-[#00ff88]/[0.05] transition-all relative overflow-hidden">
                                 <div className="absolute top-4 right-6 w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></div>
                                 <div className="text-[10px] text-[#00ff88] uppercase font-black tracking-[0.15em] mb-3">{t('landing.mockupStoreOnline', undefined) || (language === 'es' ? 'ESTADO DE TIENDA' : 'STORE STATUS')}</div>
                                 <div className="text-5xl font-bold text-white tracking-tight mb-2">{language === 'es' ? 'Activa' : 'Active'}</div>
                                 <div className="text-xs text-gray-500 font-medium">{language === 'es' ? 'Sincronizado hace 2 min' : 'Synced 2 mins ago'}</div>
                              </div>
                           </div>

                           <div className="glass-panel p-6 border border-white/5 h-full">
                              <div className="flex justify-between items-center mb-4">
                                 <h4 className="text-white font-bold text-sm">{language === 'es' ? 'Inventario Reciente' : 'Recent Inventory'}</h4>
                                 <span className="text-[#00ff88] text-xs font-bold cursor-pointer">{language === 'es' ? 'Ver Todo' : 'View All'}</span>
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
                                                <div className="text-white text-sm font-medium">{t(`landing.mockupItem${i}` as any, undefined) || `${language === 'es' ? 'Producto Tecnológico' : 'Tech Product'} ${i}`}</div>
                                                <div className="text-[10px] text-slate-500">SKU: TECH-00{i}</div>
                                             </div>
                                          </div>
                                          <div className="text-right">
                                             <div className="text-white text-sm font-bold">$120.00</div>
                                             <div className="text-[10px] text-[#00ff88]">{language === 'es' ? 'En Stock' : 'In Stock'}</div>
                                          </div>
                                       </div>
                                    )
                                 })}
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
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">{t('landing.visionTitle')}</h2>
                  <p className="text-slate-400 text-lg leading-relaxed mb-6">
                     {t('landing.visionDesc')}
                  </p>
                  <div className="flex flex-col gap-4">
                     <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="bg-green-500/20 p-2 rounded-lg text-green-400"><Rocket size={20} /></div>
                        <div>
                           <h4 className="text-white font-bold">{t('landing.visionSpeed')}</h4>
                           <p className="text-xs text-gray-500">{t('landing.visionSpeedDesc')}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400"><Crown size={20} /></div>
                        <div>
                           <h4 className="text-white font-bold">{t('landing.visionLeader')}</h4>
                           <p className="text-xs text-gray-500">{t('landing.visionLeaderDesc')}</p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="relative reveal delay-200">
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-blue-500/20 rounded-full blur-[100px]"></div>
                  <div className="relative z-10 p-12 rounded-[3rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-3xl overflow-hidden group">
                     <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors duration-700"></div>
                     <div className="relative space-y-8">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-[#00ff88]">
                              <Zap size={32} />
                           </div>
                           <h4 className="text-2xl font-bold text-white">{t('landing.visionEfficiency')}</h4>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                           {t('landing.visionEfficiencyDesc')}
                        </p>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-[#00ff88] w-4/5"></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Features Grid */}
         <section id="features" className="py-24 relative max-w-7xl mx-auto px-6">
            <div className="mb-16 md:text-center max-w-3xl md:mx-auto reveal">
               <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight" dangerouslySetInnerHTML={{ __html: t('landing.featuresTitle') }}></h2>
               <p className="text-slate-400 text-lg leading-relaxed">
                  {t('landing.featuresDesc')}
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div className="group p-8 glass-panel rounded-[2rem] hover:bg-[#00ff88]/[0.02] transition-all duration-300 relative overflow-hidden reveal delay-100 border border-white/5">
                  <div className="w-14 h-14 bg-[#00ff88]/10 rounded-xl flex items-center justify-center mb-8 border border-[#00ff88]/20">
                     <Scan size={28} className="text-[#00ff88]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{t('landing.featStore')}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                     {t('landing.featStoreDesc')}
                  </p>
               </div>

               <div className="group p-8 glass-panel rounded-[2rem] hover:bg-[#00ff88]/[0.02] transition-all duration-300 md:col-span-2 relative overflow-hidden reveal delay-200 border border-white/5">
                  <div className="flex flex-col md:flex-row gap-10 items-start md:items-center h-full">
                     <div className="flex-1 z-10">
                        <div className="w-14 h-14 bg-[#00ff88]/10 rounded-xl flex items-center justify-center mb-8 border border-[#00ff88]/20">
                           <ShieldCheck size={28} className="text-[#00ff88]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{t('landing.featCart')}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                           {t('landing.featCartDesc')}
                        </p>
                     </div>
                     <div className="flex-1 w-full bg-[#050507] border border-white/10 rounded-2xl p-6 shadow-2xl transform group-hover:translate-y-[-4px] transition-transform duration-500">
                        <div className="flex gap-2 items-center mb-4 border-b border-white/5 pb-3">
                           <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></div>
                           <span className="text-[10px] font-bold text-[#00ff88] tracking-widest uppercase">{t('landing.featCartAlert')}</span>
                        </div>
                        <div className="flex gap-4 items-center">
                           <div className="h-10 w-10 rounded-lg bg-red-900/20 flex items-center justify-center border border-red-500/20 text-red-500">
                              <ShieldCheck size={20} />
                           </div>
                           <div>
                              <div className="text-white text-xs font-bold">{t('landing.featCartCrit')}</div>
                              <div className="text-[10px] text-slate-500">{t('landing.featCartCritDesc')}</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="group p-8 glass-panel rounded-[2rem] hover:bg-[#00ff88]/[0.02] transition-all duration-300 reveal delay-100 border border-white/5">
                  <div className="w-14 h-14 bg-[#00ff88]/10 rounded-xl flex items-center justify-center mb-8 border border-[#00ff88]/20">
                     <Database size={28} className="text-[#00ff88]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{t('landing.featCloud')}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                     {t('landing.featCloudDesc')}
                  </p>
               </div>

               <div className="group p-8 glass-panel rounded-2xl hover:bg-white/[0.05] transition-all duration-300 reveal delay-200">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 border border-blue-500/20">
                     <Upload size={24} className="text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">{t('landing.featImport')}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                     {t('landing.featImportDesc')}
                  </p>
               </div>

               <div className="group p-8 glass-panel rounded-2xl hover:bg-white/[0.05] transition-all duration-300 reveal delay-300">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6 border border-purple-500/20">
                     <Tag size={24} className="text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">{t('landing.featTags')}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                     {t('landing.featTagsDesc')}
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
                  <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{t('landing.pricingTitle')}</h2>
                  <p className="text-slate-400 text-lg">{t('landing.pricingSubtitle')}</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-end reveal delay-100">

                  {/* STARTER (Free) */}
                  <div className="bg-[#111] rounded-3xl p-8 border border-white/5 flex flex-col relative group hover:border-white/10 transition-all text-left">
                     <h3 className="text-xl font-bold text-white mb-2">{t('landing.starterPlan')}</h3>
                     <div className="text-3xl font-bold text-white mb-6">{t('landing.starterPrice')} <span className="text-sm font-medium text-gray-500">/mes</span></div>
                     <p className="text-slate-400 text-sm mb-6">
                        {t('landing.starterDesc')}
                     </p>
                     <div className="space-y-4 mb-8 flex-1 whitespace-pre-line text-sm text-gray-400">
                        {t('landing.freeLimits').split('\n').map((line, i) => (
                           <FeatureItem key={i} text={line} active={true} color={i === 3 ? "text-white font-bold" : undefined} />
                        ))}
                     </div>
                     <Button
                        className="w-full bg-transparent hover:bg-white/5 border border-white/10 text-white transition-all duration-300 mt-auto"
                        onClick={() => setAuthModalOpen(true)}
                     >
                        {t('landing.startFree')}
                     </Button>
                  </div>

                  {/* GROWTH (Standard) */}
                  <div className="bg-[#111] rounded-3xl p-8 border border-[#00ff88]/50 flex flex-col relative group transition-all shadow-lg hover:shadow-[#00ff88]/20 transform md:-translate-y-4 z-10 text-left">
                     <div className="absolute top-0 inset-x-0 h-1 bg-[#00ff88] rounded-t-3xl"></div>
                     <div className="absolute top-4 right-4 bg-[#00ff88] text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        FAVORITO
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <Zap size={18} className="text-[#00ff88] fill-[#00ff88]" /> {t('landing.growthPlan')}
                     </h3>
                     <div className="text-4xl font-bold text-white mb-6">${t('landing.growthPriceValue')} <span className="text-sm font-medium text-gray-500">{t('landing.growthPricePeriod')}</span></div>
                     <p className="text-gray-300 text-sm mb-6">
                        {t('landing.growthDesc')}
                     </p>
                     <div className="space-y-4 mb-8 flex-1 whitespace-pre-line text-sm text-gray-300">
                        {t('landing.growthLimits').split('\n').map((line, i) => (
                           <FeatureItem key={i} text={line} active={true} />
                        ))}
                     </div>

                     <Button variant="primary" className="w-full py-3 text-base bg-[#00ff88] hover:bg-[#00e67a] text-black border-none font-bold mt-auto" onClick={() => setAuthModalOpen(true)}>
                        Obtener 3 Meses Gratis
                     </Button>
                  </div>

                  {/* BUSINESS (Premium) */}
                  <div className="bg-gradient-to-b from-[#1a1a1a] to-black rounded-3xl p-8 border border-white/5 flex flex-col relative group hover:border-white/10 transition-all text-left">
                     <div className="absolute top-4 right-4 bg-transparent text-purple-400 text-[10px] font-bold px-3 py-1 rounded-full border border-purple-500/30 uppercase tracking-wider">
                        PRÓXIMAMENTE
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        {t('landing.proPlan')}
                     </h3>
                     <div className="text-3xl font-bold text-white mb-6 opacity-60">${t('landing.proPriceValue')} <span className="text-sm font-medium text-gray-500">{t('landing.proPricePeriod')}</span></div>
                     <p className="text-gray-400 text-sm mb-6">
                        {t('landing.proDesc')}
                     </p>
                     <div className="space-y-4 mb-8 flex-1 opacity-60 whitespace-pre-line text-sm text-gray-400">
                        {t('landing.proLimits').split('\n').map((line, i) => (
                           <FeatureItem key={i} text={line} active={false} color="text-gray-500" />
                        ))}
                     </div>
                     <Button className="w-full bg-white/5 text-gray-500 hover:bg-white/10 border-none py-3 cursor-not-allowed uppercase text-xs font-bold tracking-widest mt-auto" disabled>
                        Próximamente
                     </Button>
                  </div>
               </div>
            </div>
         </section>

         {/* FAQ Section (SEO/GEO Optimized) */}
         <section className="py-24 relative overflow-hidden bg-black border-t border-white/5">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00ff88]/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="max-w-3xl mx-auto px-6 relative z-10">
               <div className="text-center mb-16 reveal">
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight font-sans">
                     {t('landing.faqTitle')}
                  </h2>
               </div>

               <div className="space-y-4 reveal delay-100">
                  {[1, 2, 3].map((num) => (
                     <div key={num} className="glass-panel border border-white/10 rounded-2xl overflow-hidden transition-all duration-300">
                        <button
                           onClick={() => setOpenFaq(openFaq === num ? null : num)}
                           className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                        >
                           <span className="font-semibold text-white text-lg pr-8">{t(`landing.faqQ${num}`)}</span>
                           <span className={`text-[#00ff88] transition-transform duration-300 flex-shrink-0 ${openFaq === num ? 'rotate-180' : ''}`}>
                              {openFaq === num ? <Minus size={20} /> : <Plus size={20} />}
                           </span>
                        </button>
                        <div
                           className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === num ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                           <div className="px-6 pb-6 text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                              {t(`landing.faqA${num}`)}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Founder Section */}
         <section className="py-24 relative overflow-hidden bg-[#020203]">
            <div className="max-w-7xl mx-auto px-6">
               <div className="glass-panel p-8 md:p-16 rounded-[3rem] border border-white/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[#00ff88]/5 group-hover:bg-[#00ff88]/10 transition-colors duration-700"></div>

                  <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                     <div className="reveal">
                        <h2 className="reveall text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight font-sans" dangerouslySetInnerHTML={{ __html: t('landing.founderTitle') }}>
                        </h2>
                        <p className="reveal delay-100 text-slate-400 text-lg leading-relaxed mb-8">
                           {t('landing.founderQuote')}
                        </p>

                        <div className="reveal delay-200 space-y-6">
                           <div>
                              <h4 className="text-white font-bold text-xl">Luis Vega</h4>
                              <p className="text-[#00ff88] font-medium text-sm uppercase tracking-widest">Founder & Architect</p>
                           </div>

                           <div className="flex flex-wrap gap-4">
                              <a
                                 href="https://www.tiktok.com/@luizvegar"
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 transition-all flex items-center justify-center group/btn"
                                 title="TikTok"
                              >
                                 <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                                 </svg>
                              </a>
                              <a
                                 href="https://www.instagram.com/luizvegar/"
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 transition-all flex items-center justify-center group/btn"
                                 title="Instagram"
                              >
                                 <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                 </svg>
                              </a>
                              <a
                                 href="https://x.com/LuizVegar"
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 transition-all flex items-center justify-center group/btn"
                                 title="X (Twitter)"
                              >
                                 <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                                 </svg>
                              </a>
                              <a
                                 href="https://www.linkedin.com/in/luizvegar"
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 transition-all flex items-center justify-center group/btn"
                                 title="LinkedIn"
                              >
                                 <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                 </svg>
                              </a>
                           </div>
                        </div>
                     </div>

                     <div className="relative reveal delay-200">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#00ff88]/20 to-transparent rounded-full blur-[100px] group-hover:opacity-100 transition-opacity opacity-50"></div>
                        <div className="relative aspect-square max-w-md mx-auto rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                           <img
                              src="/founder.png"
                              alt="Luis Vega"
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                              loading="lazy"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>
                     </div>
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
                     {t('landing.footerDesc')}
                  </p>
               </div>
               <div>
                  <p className="text-white font-bold mb-6">{t('landing.footerProduct')}</p>
                  <ul className="space-y-4 text-slate-500">
                     <li><a href="#features" className="hover:text-[#00ff88] transition-colors">{t('landing.features')}</a></li>
                     <li><a href="#vision" className="hover:text-[#00ff88] transition-colors">Vision</a></li>
                     <li><a href="#pricing" className="hover:text-[#00ff88] transition-colors">{t('landing.pricing')}</a></li>
                  </ul>
               </div>
               <div>
                  <p className="text-white font-bold mb-6">{t('landing.footerResources')}</p>
                  <ul className="space-y-4 text-slate-500">
                     <li><a href="#" className="hover:text-[#00ff88] transition-colors">{t('landing.footerDocs')}</a></li>
                     <li><a href="#" className="hover:text-[#00ff88] transition-colors">{t('landing.footerGuides')}</a></li>
                     <li><a href="#" className="hover:text-[#00ff88] transition-colors">{t('landing.footerSupport')}</a></li>
                  </ul>
               </div>
               <div>
                  <p className="text-white font-bold mb-6">{t('landing.footerLegal')}</p>
                  <ul className="space-y-4 text-slate-500">
                     <li><a href="#" className="hover:text-[#00ff88] transition-colors">{t('landing.footerPrivacy')}</a></li>
                     <li><a href="#" className="hover:text-[#00ff88] transition-colors">{t('landing.footerTerms')}</a></li>
                  </ul>
               </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 text-slate-600 text-[10px] font-medium uppercase tracking-[0.1em] flex justify-between">
               <p>{t('landing.footerCopyright')}</p>
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
