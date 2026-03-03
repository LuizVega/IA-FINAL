import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';
import { AppLogo } from './AppLogo';
import {
   ArrowRight, CheckCircle2, Lock, Sparkles, Plus, Minus,
   PlayCircle, LayoutGrid, MessageSquare,
   FolderRoot, BarChart3, Search, Bell, Settings,
   Scan, Zap, ShieldCheck, Database, Upload, Tag,
   CheckCircle, Clock, Trash2, Edit2, PlusCircle,
   Instagram, Twitter, Linkedin, Github, ChevronDown,
   TrendingUp, QrCode, ShoppingBag, Globe, Target, Eye, ExternalLink,
   Menu, X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { BackgroundAnimation } from './BackgroundAnimation';

interface LandingPageProps {
   onEnterDemo: () => void;
   onSwitchToCustomer?: () => void;
   isFeatures?: boolean;
   isAbout?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDemo, onSwitchToCustomer, isFeatures, isAbout }) => {
   const { setAuthModalOpen, language, setLanguage } = useStore();
   const { t } = useTranslation();
   const observerRef = useRef<IntersectionObserver | null>(null);
   const [email, setEmail] = useState('');
   const [caos, setCaos] = useState('');
   const [clickCount, setClickCount] = useState(0);
   const [formStep, setFormStep] = useState(1);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [submitted, setSubmitted] = useState(false);
   const [openFaq, setOpenFaq] = useState<number | null>(null);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

   useEffect(() => {
      const observerOptions = { threshold: 0.1 };
      observerRef.current = new IntersectionObserver((entries) => {
         entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
         });
      }, observerOptions);

      document.querySelectorAll('.reveal').forEach(el => observerRef.current?.observe(el));
      return () => observerRef.current?.disconnect();
   }, []);

   const scrollToWaitlist = () => {
      document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
   };

   const handleSecretTrigger = () => {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      if (newCount >= 3) {
         setAuthModalOpen(true);
         setClickCount(0);
      }
   };

   const handleJoinWaitlist = async (e: React.FormEvent) => {
      e.preventDefault();
      if (formStep === 1) {
         if (email.includes('@')) setFormStep(2);
         return;
      }

      setIsSubmitting(true);
      try {
         const { error } = await supabase.from('waitlist').insert([{
            email,
            caos_description: caos
         }]);
         if (error) throw error;
         setSubmitted(true);
      } catch (err) {
         console.error('Error joining waitlist:', err);
         alert('Error al unirse a la lista de espera. Reintenta pronto.');
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="bg-slate-950 text-slate-400 font-sans min-h-screen selection:bg-green-500/30 selection:text-green-900 overflow-x-hidden">
         <BackgroundAnimation />

         {/* Top Navigation Bar - Floating Pill Design */}
         <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
            <nav className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-full px-4 md:px-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between h-14 md:h-16">
               {/* Left: Logo */}
               <Link
                  to="/"
                  onClick={(e) => {
                     e.preventDefault();
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
               >
                  <AppLogo className="w-7 h-7 md:w-8 md:h-8" />
                  <span className="text-white font-black tracking-tighter text-lg md:text-xl">MyMorez</span>
               </Link>

               {/* Center: Nav Links (desktop only, absolutely centered) */}
               <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
                  <button
                     onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                     className="text-[13px] font-bold text-slate-400 hover:text-green-400 transition-colors"
                  >
                     {t('landing.features')}
                  </button>
                  <button
                     onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                     className="text-[13px] font-bold text-slate-400 hover:text-green-400 transition-colors"
                  >
                     {t('landing.aboutUs')}
                  </button>
                  <button
                     onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                     className="text-[13px] font-bold text-slate-400 hover:text-green-400 transition-colors"
                  >
                     FAQ
                  </button>
               </div>

               {/* Right: Language + CTA + Mobile Hamburger */}
               <div className="flex items-center gap-2 md:gap-3">
                  <button
                     onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                     className="hidden sm:flex p-2 text-slate-400 hover:text-white transition-colors items-center gap-1.5 text-[12px] font-bold bg-white/5 hover:bg-white/10 rounded-xl"
                  >
                     <Globe size={14} />
                     <span className="uppercase">{language}</span>
                  </button>
                  <button
                     onClick={scrollToWaitlist}
                     className="hidden sm:flex px-4 md:px-6 py-2 bg-green-500 hover:bg-green-400 text-black text-[12px] md:text-[13px] font-bold rounded-full transition-all active:scale-95 items-center gap-2 shadow-[0_10px_20px_rgba(34,197,94,0.2)]"
                  >
                     {t('landing.waitlistMainCta')}
                     <ArrowRight size={14} />
                  </button>
                  {/* Hamburger - mobile only */}
                  <button
                     onClick={() => setMobileMenuOpen(true)}
                     className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                  >
                     <Menu size={20} />
                  </button>
               </div>
            </nav>
         </div>

         {/* Mobile Sidebar Drawer */}
         {mobileMenuOpen && (
            <div className="fixed inset-0 z-[100] flex">
               {/* Backdrop */}
               <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setMobileMenuOpen(false)}
               />
               {/* Drawer */}
               <div className="relative ml-auto w-[80vw] max-w-xs h-full bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col p-8 animate-in slide-in-from-right duration-300">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-10">
                     <div className="flex items-center gap-2">
                        <AppLogo className="w-8 h-8" />
                        <span className="text-white font-black tracking-tighter text-xl">MyMorez</span>
                     </div>
                     <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                     >
                        <X size={20} />
                     </button>
                  </div>

                  {/* Nav Links */}
                  <nav className="flex flex-col gap-1 mb-8">
                     {[
                        { label: t('landing.features'), id: 'features' },
                        { label: t('landing.aboutUs'), id: 'about' },
                        { label: 'FAQ', id: 'faq' },
                     ].map(({ label, id }) => (
                        <button
                           key={id}
                           onClick={() => {
                              setMobileMenuOpen(false);
                              setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 300);
                           }}
                           className="text-left px-4 py-4 text-white text-lg font-bold rounded-2xl hover:bg-white/5 transition-colors"
                        >
                           {label}
                        </button>
                     ))}
                  </nav>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Language Toggle */}
                  <button
                     onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                     className="flex items-center gap-3 px-4 py-3 mb-4 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors font-bold"
                  >
                     <Globe size={18} />
                     <span className="uppercase">{language === 'es' ? 'Español' : 'English'}</span>
                  </button>

                  {/* CTA */}
                  <button
                     onClick={() => {
                        setMobileMenuOpen(false);
                        setTimeout(scrollToWaitlist, 300);
                     }}
                     className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black text-base rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-green-500/20"
                  >
                     {t('landing.waitlistMainCta')}
                     <ArrowRight size={18} />
                  </button>
               </div>
            </div>
         )}

         {/* Hero Section */}
         {!isFeatures && !isAbout && (
            <section className="relative pt-28 pb-16 md:pt-44 md:pb-28 overflow-hidden">
               <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center">
                  <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6 }}
                     className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-[11px] font-bold mb-8 uppercase tracking-wider"
                  >
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                     </span>
                     {t('hero.badge')}
                  </motion.div>

                  <motion.h1
                     initial={{ opacity: 0, y: 30 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.8, delay: 0.1 }}
                     className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 md:mb-8 leading-tight"
                  >
                     {t('hero.title1')} <span className="text-gradient">{t('hero.title2')}</span><br /> {t('hero.title3')}
                  </motion.h1>

                  <motion.p
                     initial={{ opacity: 0, y: 30 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.8, delay: 0.2 }}
                     className="text-base md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 md:mb-12 leading-relaxed font-light"
                  >
                     {t('hero.subtitle')}
                  </motion.p>

                  {/* Dynamic Hero Form */}
                  <div id="waitlist" className="max-w-md mx-auto bg-white/5 backdrop-blur-2xl p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-[0_30px_70px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)] relative overflow-hidden border border-white/5">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400"></div>
                     {!submitted ? (
                        <form onSubmit={handleJoinWaitlist} className="space-y-4">
                           <div className="flex flex-wrap gap-2 justify-center mb-6">
                              {[t('hero.chip1'), t('hero.chip2'), t('hero.chip3')].map(chip => (
                                 <span key={chip} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                    {chip}
                                 </span>
                              ))}
                           </div>

                           <div className="relative overflow-hidden min-h-[140px]">
                              <div className={`transition-all duration-500 ${formStep === 1 ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none absolute w-full'}`}>
                                 <input
                                    type="email"
                                    placeholder={t('landing.waitlistEmailPlaceholder')}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-slate-500 focus:outline-none focus:border-green-500/50 focus:bg-white/10 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.1)] transition-all text-lg font-bold"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && email.includes('@') && setFormStep(2)}
                                 />
                                 <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-widest text-center">Paso 1: Tu correo de contacto</p>
                              </div>
                              <div className={`transition-all duration-500 ${formStep === 2 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none absolute w-full'}`}>
                                 <textarea
                                    placeholder={t('landing.waitlistCaosPlaceholder')}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-slate-500 focus:outline-none focus:border-green-500/50 focus:bg-white/10 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.1)] transition-all h-32 resize-none text-base"
                                    value={caos}
                                    onChange={(e) => setCaos(e.target.value)}
                                    autoFocus={formStep === 2}
                                 />
                                 <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-widest text-center">Paso 2: Describe tu caos actual</p>
                              </div>
                           </div>

                           <button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full py-5 bg-slate-900 hover:bg-black text-white font-black text-xl rounded-2xl transition-all shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.3)] active:scale-98 flex items-center justify-center gap-3 group relative overflow-hidden"
                           >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                              {isSubmitting ? <Clock className="animate-spin" /> : (
                                 <>
                                    {formStep === 1 ? t('landing.nextBtn') : t('landing.waitlistMainCta')}
                                    <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                                 </>
                              )}
                           </button>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 text-center">
                              {t('landing.waitlistFootnote')}
                           </p>
                        </form>
                     ) : (
                        <div className="text-center py-8 animate-in zoom-in duration-500">
                           <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-sm">
                              <Sparkles size={40} className="text-green-500" />
                           </div>
                           <h3 className="text-2xl font-black text-white mb-2">{t('landing.waitlistTitle')}</h3>
                           <p className="text-slate-600 font-medium">Revisaremos tu caso pronto. Atento a tu email.</p>
                        </div>
                     )}
                  </div>
               </div>
            </section>
         )}

         {(isFeatures || (!isFeatures && !isAbout)) && (
            <>
               {/* Results Mockup - Premium Square View */}
               <section className="py-16 md:py-32 px-4 md:px-6 max-w-6xl mx-auto reveal animate-float">
                  <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-3xl rounded-[40px] md:rounded-[80px] p-1 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.02)] overflow-hidden">
                     <div className="bg-slate-900/40 rounded-[38px] md:rounded-[78px] overflow-hidden p-6 md:p-16 border border-white/5 shadow-inner">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                           <div>
                              <div className="flex items-center gap-2 mb-6">
                                 <span className="bg-green-500/10 text-green-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-green-500/20">Resume</span>
                              </div>
                              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 md:mb-8 tracking-tighter leading-none">Resultados<br /><span className="text-green-500">{t('landing.realTimeResults')}</span></h2>

                              {/* Income Card */}
                              <div className="bg-white/5 rounded-[40px] p-8 border border-white/10 mb-8 shadow-[0_15px_40px_rgba(0,0,0,0.2)] group hover:shadow-[0_25px_60px_rgba(34,197,94,0.1)] transition-all duration-700">
                                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">{t('landing.totalIncomeLabel')}</p>
                                 <div className="text-6xl font-black text-white tracking-tighter mb-2">$31,420</div>
                                 <div className="text-sm text-green-400 font-bold flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                                       <TrendingUp size={14} />
                                    </div>
                                    {t('landing.lastMonth')}
                                 </div>
                                 <div className="mt-8 flex items-end gap-2 h-16">
                                    {[0.4, 0.6, 0.5, 0.8, 0.65, 0.9, 0.7, 1.0].map((v, i) => (
                                       <div key={i} className="flex-1 rounded-full bg-white/5 overflow-hidden relative group/bar">
                                          <div className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-out delay-300" style={{ height: `${v * 100}%`, backgroundColor: i === 7 ? '#22c55e' : 'rgba(255,255,255,0.1)' }} />
                                       </div>
                                    ))}
                                 </div>
                              </div>

                              <div className="space-y-4">
                                 {[
                                    { n: 'Black Urban Sneakers', p: '$85', s: 'TECH-001', icon: <Scan size={20} className="text-slate-500" /> },
                                    { n: 'Wireless Pro Earbuds', p: '$42', s: 'TECH-002', icon: <Zap size={20} className="text-slate-500" /> }
                                 ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-5 bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors group shadow-sm">
                                       <div className="w-14 h-14 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center group-hover:bg-green-500 group-hover:text-black transition-all duration-500">
                                          {item.icon}
                                       </div>
                                       <div className="flex-1">
                                          <p className="text-white text-base font-bold tracking-tight">{item.n}</p>
                                          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{item.s}</p>
                                       </div>
                                       <span className="text-white font-black text-lg">{item.p}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           {/* UI Elements / Catalog View */}
                           <div className="hidden md:block relative">
                              <div className="absolute -inset-10 bg-green-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
                              <div className="relative bg-slate-900 p-10 rounded-[56px] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.4)] hover:rotate-2 transition-transform duration-1000 ease-out">
                                 <div className="flex items-center justify-between mb-10">
                                    <div>
                                       <h4 className="text-white font-black text-xl tracking-tighter">{t('landing.yourOnlineStore')}</h4>
                                       <p className="text-slate-500 text-xs font-bold">mymorez.com/tienda</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 shadow-sm">
                                       <QrCode size={24} className="text-white" />
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-6">
                                    {[1, 2, 3, 4].map(i => (
                                       <div key={i} className="aspect-square bg-white/5 rounded-3xl border border-white/5 p-4 flex flex-col justify-end gap-3 group/card overflow-hidden relative">
                                          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                                          <div className="w-10 h-1.5 bg-white/20 rounded-full"></div>
                                          <div className="w-16 h-1.5 bg-white/10 rounded-full"></div>
                                       </div>
                                    ))}
                                 </div>
                                 <button className="w-full mt-10 py-5 bg-green-500 hover:bg-green-400 text-black font-black text-sm rounded-2xl transition-all shadow-[0_15px_30px_rgba(34,197,94,0.3)] flex items-center justify-center gap-3 active:scale-95 group">
                                    <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
                                    {t('landing.buyByWhatsapp')}
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </section>

               {/* Steps Section */}
               <section className="py-16 md:py-32 px-4 md:px-6 max-w-7xl mx-auto relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 blur-[120px] rounded-full -z-10 animate-pulse"></div>
                  <div className="text-center mb-24 reveal">
                     <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter mb-4 md:mb-6 underline decoration-green-500/20 underline-offset-8">Cómo funciona</h2>
                     <p className="text-slate-400 text-base md:text-xl font-light">En solo <span className="text-green-500 font-bold">3 pasos</span> configuramos tu cuenta</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                     {[
                        { step: '01', title: t('landing.step1Title'), desc: t('landing.step1Desc'), icon: <Upload className="text-green-500" />, color: 'green' },
                        { step: '02', title: t('landing.step2Title'), desc: t('landing.step2Desc'), icon: <Zap className="text-amber-500" />, color: 'amber' },
                        { step: '03', title: t('landing.step3Title'), desc: t('landing.step3Desc'), icon: <CheckCircle className="text-blue-500" />, color: 'blue' },
                     ].map((item, i) => (
                        <div key={i} className={`reveal bg-white/5 p-10 rounded-[50px] border border-white/10 relative group hover:border-${item.color}-500/30 transition-all duration-700 hover:-translate-y-4 shadow-[0_15px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)] overflow-hidden`} style={{ transitionDelay: `${i * 150}ms` }}>
                           <div className="text-8xl font-black text-white/[0.03] absolute -top-4 -right-4 group-hover:text-white/[0.08] transition-all duration-700 uppercase italic">{item.step}</div>
                           <div className={`w-20 h-20 bg-white/5 rounded-[30px] flex items-center justify-center mb-10 border border-white/5 group-hover:scale-110 group-hover:bg-white/10 group-hover:shadow-lg transition-all duration-500`}>
                              {item.icon}
                           </div>
                           <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{item.title}</h3>
                           <p className="text-slate-400 leading-relaxed text-base font-light">{item.desc}</p>
                        </div>
                     ))}
                  </div>
               </section>

               {/* Features Section - New */}
               <section id="features" className="py-16 md:py-32 px-4 md:px-6 max-w-7xl mx-auto scroll-mt-24">
                  <div className="text-center mb-20 reveal">
                     <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4 md:mb-6">{t('landing.featuresTitle')}</h2>
                     <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-xl font-light">{t('landing.featuresDesc')}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {[
                        { title: t('landing.featStore'), desc: t('landing.featStoreDesc'), icon: <ShoppingBag className="text-emerald-500" />, delay: 0 },
                        { title: t('landing.featCart'), desc: t('landing.featCartDesc'), icon: <MessageSquare className="text-blue-500" />, delay: 100 },
                        { title: t('landing.smartInventory'), desc: t('landing.smartInventoryDesc'), icon: <Scan className="text-purple-500" />, delay: 200 },
                     ].map((f, i) => (
                        <div key={i} className="reveal bg-white/5 p-8 md:p-10 rounded-[32px] md:rounded-[40px] border border-white/10 hover:border-green-500/30 transition-all group relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(34,197,94,0.15)] hover:-translate-y-2 duration-500" style={{ transitionDelay: `${f.delay}ms` }}>
                           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 shadow-sm">
                              {f.icon}
                           </div>
                           <h4 className="text-2xl font-bold text-white mb-4 tracking-tight">{f.title}</h4>
                           <p className="text-slate-400 text-sm leading-relaxed font-medium">{f.desc}</p>
                        </div>
                     ))}
                  </div>
               </section>
            </>
         )}

         {(isAbout || (!isFeatures && !isAbout)) && (
            <>
               {/* Pain Points Section */}
               <section className="py-16 md:py-24 px-4 md:px-6 bg-slate-900/40 border-y border-white/5">
                  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                     <div className="reveal">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight leading-tight">
                           {t('landing.painTitle')}
                        </h2>
                        <div className="space-y-4">
                           {[t('landing.pain1'), t('landing.pain2'), t('landing.pain3'), t('landing.pain4')].map((p, i) => (
                              <div key={i} className="reveal flex items-start gap-4 p-5 rounded-[32px] bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:translate-x-4 transition-all duration-500 cursor-default group shadow-sm hover:shadow-md" style={{ transitionDelay: `${i * 100}ms` }}>
                                 <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-2 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse group-hover:scale-150 transition-transform"></div>
                                 <p className="text-slate-400 text-sm md:text-lg font-medium group-hover:text-white transition-colors">{p}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                     <div className="reveal flex flex-col gap-8">
                        <div className="bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-[40px] md:rounded-[48px] border border-white/10 bg-green-500/[0.02] hover:bg-green-500/[0.05] transition-all relative overflow-hidden group shadow-sm hover:shadow-xl">
                           <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/5 blur-[80px] -z-10 group-hover:bg-green-500/10 transition-all rounded-full"></div>
                           <Sparkles className="text-green-500/20 absolute -top-4 -right-4 w-24 h-24 rotate-12 group-hover:rotate-45 transition-transform" />
                           <h3 className="text-2xl font-black text-white mb-8 tracking-tight">{t('landing.benefitTitle')}</h3>
                           <div className="space-y-8">
                              {[
                                 { t: t('landing.benefit1'), icon: <Clock size={24} /> },
                                 { t: t('landing.benefit2'), icon: <CheckCircle2 size={24} /> },
                                 { t: t('landing.benefit3'), icon: <Sparkles size={24} /> }
                              ].map((b, i) => (
                                 <div key={i} className="flex items-center gap-6 group/item">
                                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-400 border border-green-500/10 group-hover/item:scale-110 transition-transform shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                                       {b.icon}
                                    </div>
                                    <p className="text-white font-bold text-lg group-hover/item:text-green-400 transition-colors uppercase tracking-[0.05em]">{b.t}</p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </section>

               {/* Mission & Vision Section - New */}
               <section id="about" className="py-20 md:py-40 px-4 md:px-6 border-y border-white/5 relative overflow-hidden bg-white/[0.02] scroll-mt-24">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/[0.02] to-transparent -z-10"></div>
                  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
                     <div className="reveal bg-white/5 p-10 md:p-16 rounded-[40px] md:rounded-[64px] border border-white/10 hover:border-blue-500/30 transition-all duration-1000 group hover:shadow-[0_50px_100px_rgba(59,130,246,0.2)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 blur-3xl -z-10 group-hover:bg-blue-500/10 transition-colors"></div>
                        <div className="w-24 h-24 bg-blue-500/10 rounded-[32px] flex items-center justify-center mb-12 border border-blue-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                           <Target className="text-blue-400" size={48} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 md:mb-10 tracking-tighter uppercase leading-none">{t('landing.missionTitle')}</h2>
                        <p className="text-slate-400 text-lg md:text-2xl leading-relaxed font-light">
                           {t('landing.missionDesc')}
                        </p>
                     </div>
                     <div className="reveal bg-white/5 p-10 md:p-16 rounded-[40px] md:rounded-[64px] border border-white/10 hover:border-purple-500/30 transition-all duration-1000 group hover:shadow-[0_50px_100px_rgba(168,85,247,0.2)] relative overflow-hidden" style={{ transitionDelay: '200ms' }}>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 blur-3xl -z-10 group-hover:bg-purple-500/10 transition-colors"></div>
                        <div className="w-24 h-24 bg-purple-500/10 rounded-[32px] flex items-center justify-center mb-12 border border-purple-500/20 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700">
                           <Eye className="text-purple-400" size={48} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 md:mb-10 tracking-tighter uppercase leading-none">{t('landing.visionTitle')}</h2>
                        <p className="text-slate-400 text-lg md:text-2xl leading-relaxed font-light">
                           {t('landing.visionDesc')}
                        </p>
                     </div>
                  </div>
               </section>

               {/* TikTok / Builder Section */}
               <section className="py-16 md:py-24 px-4 md:px-6 text-center max-w-4xl mx-auto">
                  <div className="reveal space-y-6">
                     <div className="w-20 h-20 bg-slate-900 rounded-3xl mx-auto border border-white/10 flex items-center justify-center text-white text-4xl font-black shadow-2xl animate-float overflow-hidden">
                        <img src="/perfil yo.PNG" alt="Luis" className="w-full h-full object-cover" />
                     </div>
                     <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">{t('landing.tiktokTitle')}</h2>
                     <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
                        {t('landing.tiktokDesc')}
                     </p>
                     <div className="flex flex-wrap justify-center gap-4">
                        <a
                           href="https://www.tiktok.com/@luizvegar"
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-black/10"
                        >
                           <ExternalLink size={20} />
                           {t('landing.tiktokCta')}
                        </a>
                     </div>
                  </div>
               </section>
            </>
         )}

         {!isFeatures && !isAbout && (
            <>
               {/* Premium FAQ Section */}
               <section id="faq" className="py-16 md:py-24 px-4 md:px-6 max-w-3xl mx-auto reveal scroll-mt-24">
                  <div className="text-center mb-16">
                     <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">{t('landing.faqTitle')}</h2>
                     <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Gestión Inteligente de Inventario</p>
                  </div>
                  <div className="space-y-4">
                     {[1, 2, 3].map((num) => (
                        <div key={num} className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
                           <button
                              onClick={() => setOpenFaq(openFaq === num ? null : num)}
                              className="w-full px-6 md:px-8 py-6 md:py-7 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                           >
                              <span className="font-bold text-white text-base md:text-xl pr-6 md:pr-8 tracking-tight">{t(`landing.faqQ${num}`)}</span>
                              <span className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-green-400 transition-all duration-500 ${openFaq === num ? 'rotate-180 bg-green-500 text-black shadow-[0_5px_15px_rgba(34,197,94,0.3)]' : ''}`}>
                                 {openFaq === num ? <Minus size={18} /> : <Plus size={18} />}
                              </span>
                           </button>
                           <div className={`transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${openFaq === num ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                              <div className="px-6 md:px-8 pb-6 md:pb-8 text-slate-400 leading-relaxed border-t border-white/5 pt-6 md:pt-8 text-base md:text-lg font-light">
                                 {t(`landing.faqA${num}`)}
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>

               {/* Final CTA Repeat */}
               <section className="py-16 md:py-24 px-4 md:px-6 bg-slate-900/40 border-y border-white/5">
                  <div className="max-w-xl mx-auto text-center reveal">
                     <h2 className="text-3xl md:text-4xl font-black text-white mb-6 md:mb-8 tracking-tight">{t('landing.waitlistTitle')}</h2>
                     <div className="bg-white/5 p-6 md:p-8 rounded-[32px] md:rounded-[40px] space-y-4 shadow-xl border border-white/10 backdrop-blur-xl">
                        <input
                           type="email"
                           placeholder={t('landing.waitlistEmailPlaceholder')}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-green-500/50 transition-all font-bold placeholder:text-slate-500"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                           onClick={scrollToWaitlist}
                           className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black text-lg rounded-2xl transition-all active:scale-95 shadow-lg shadow-green-500/20"
                        >
                           {t('landing.waitlistMainCta')}
                        </button>
                     </div>
                  </div>
               </section>
            </>
         )}

         {/* Footer */}
         <footer className="bg-slate-950 border-t border-white/10 pt-16 md:pt-32 pb-10 md:pb-12 overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
               <div className="flex flex-col md:flex-row justify-between items-start gap-10 md:gap-16 mb-12 md:mb-24">
                  <div className="max-w-xs">
                     <Link to="/" className="flex items-center gap-2 mb-8 group">
                        <AppLogo className="w-10 h-10 group-hover:rotate-12 transition-transform duration-500" />
                        <span className="text-white font-black tracking-tighter text-2xl">MyMorez</span>
                     </Link>
                     <p className="text-slate-400 text-lg font-light leading-relaxed mb-8">
                        {t('landing.footerDesc')}
                     </p>
                     <div className="flex gap-4">
                        <a
                           href="https://www.tiktok.com/@luizvegar"
                           target="_blank"
                           rel="noopener noreferrer"
                           className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                        >
                           <ExternalLink size={20} />
                        </a>
                        <a
                           href="https://www.instagram.com/mymorezai/?utm_source=ig_web_button_share_sheet"
                           target="_blank"
                           rel="noopener noreferrer"
                           className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                        >
                           <Instagram size={20} />
                        </a>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-16">
                     <div>
                        <h4 className="text-white font-bold mb-6 tracking-tight uppercase text-xs tracking-[0.2em]">Producto</h4>
                        <ul className="space-y-4">
                           <li>
                              <button
                                 onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                 className="text-slate-400 hover:text-green-400 transition-colors font-medium"
                              >
                                 {t('landing.features')}
                              </button>
                           </li>
                           <li>
                              <button
                                 onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                                 className="text-slate-400 hover:text-green-400 transition-colors font-medium"
                              >
                                 FAQ
                              </button>
                           </li>
                        </ul>
                     </div>
                     <div>
                        <h4 className="text-white font-bold mb-6 tracking-tight uppercase text-xs tracking-[0.2em]">Compañía</h4>
                        <ul className="space-y-4">
                           <li>
                              <button
                                 onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                                 className="text-slate-400 hover:text-green-400 transition-colors font-medium"
                              >
                                 {t('landing.aboutUs')}
                              </button>
                           </li>
                           <li>
                              <a
                                 href="https://www.instagram.com/luizvegar"
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-slate-400 hover:text-green-400 transition-colors font-medium"
                              >
                                 {t('landing.contact')}
                              </a>
                           </li>
                        </ul>
                     </div>
                  </div>
               </div>
               <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-500 font-black uppercase tracking-widest text-[10px]">
                  <p>© 2026 MyMorez Systems Inc. All rights reserved.</p>
                  <div className="flex gap-8">
                     <button className="hover:text-white transition-colors">Privacy Policy</button>
                     <button className="hover:text-white transition-colors">Terms of Service</button>
                  </div>
               </div>
            </div>
         </footer>
      </div>
   );
};
