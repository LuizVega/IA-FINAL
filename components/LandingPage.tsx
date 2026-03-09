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
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { BackgroundAnimation } from './BackgroundAnimation';
import { MarqueeFeatures } from './MarqueeFeatures';

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
   const [formStep, setFormStep] = useState(1);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [submitted, setSubmitted] = useState(false);
   const [openFaq, setOpenFaq] = useState<number | null>(null);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [expandedCard, setExpandedCard] = useState<'mission' | 'vision' | null>(null);
   const [isMobile, setIsMobile] = useState(false);

   useEffect(() => {
      const check = () => setIsMobile(window.innerWidth < 768);
      check();
      window.addEventListener('resize', check, { passive: true });
      return () => window.removeEventListener('resize', check);
   }, []);

   // --- Animation Variants for 3D Floating Effects ---
   const floatingVariants: any = {
      animate: (custom: { y: number; rotate: number; duration: number; delay: number }) => ({
         y: [0, custom.y, 0],
         rotate: [0, custom.rotate, 0],
         transition: {
            duration: custom.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: custom.delay
         }
      })
   };

   // Glowing orbit effect variants
   const orbitVariants: any = {
      animate: (custom: { rotateZ: number; duration: number }) => ({
         rotateZ: [0, custom.rotateZ],
         transition: {
            duration: custom.duration,
            repeat: Infinity,
            ease: "linear"
         }
      })
   };

   const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
   const [otherCategory, setOtherCategory] = useState('');
   const [socialPermission, setSocialPermission] = useState(true);
   const [files, setFiles] = useState<File[]>([]);

   const availableCategories = [
      'Ropa',
      'Moda y Accesorios',
      'Arte, Ilustración y Merch',
      'Cómics y Coleccionables',
      'Comida y Dulces',
      'Artesanías'
   ];

   const toggleCategory = (cat: string) => {
      setSelectedCategories(prev =>
         prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
      );
   };

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

   const handleJoinWaitlist = async (e: React.FormEvent) => {
      e.preventDefault();
      if (formStep === 1) {
         if (email.includes('@')) setFormStep(2);
         return;
      }
      if (formStep === 2) {
         setFormStep(3);
         return;
      }

      setIsSubmitting(true);
      try {
         const finalCategories = [...selectedCategories];
         if (otherCategory.trim()) {
            finalCategories.push(`Otros: ${otherCategory.trim()}`);
         }

         let fileUrls: string[] = [];

         if (files.length > 0) {
            for (const file of files) {
               const fileExt = file.name.split('.').pop();
               const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
               const filePath = `${email}/${fileName}`;

               const { data, error: uploadError } = await supabase.storage
                  .from('waitlist_inventory')
                  .upload(filePath, file);

               if (uploadError) {
                  console.error('File upload error:', uploadError);
                  // We continue even if file fails to not block registration
               } else if (data) {
                  fileUrls.push(data.path);
               }
            }
         }

         const finalCaosDescription = `[Rubro: ${finalCategories.join(', ')}]\n[Autoriza Redes Sociales: ${socialPermission ? 'SÍ' : 'NO'}]\n[Archivos: ${fileUrls.length > 0 ? fileUrls.join(', ') : 'Ninguno'}]\n\n${caos}`;

         const { error } = await supabase.from('waitlist').insert([{
            email,
            caos_description: finalCaosDescription
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

         {/* Top Navigation Bar - Floating Glass Pill Design */}
         <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl">
            <nav className="bg-[#0b1410]/90 backdrop-blur-md md:backdrop-blur-3xl px-6 md:px-8 border border-white/10 rounded-[64px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex items-center justify-between h-16 md:h-20">
               {/* Left: Logo */}
               <Link
                  to="/"
                  onClick={(e) => {
                     e.preventDefault();
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity w-1/3"
               >
                  <AppLogo className="w-7 h-7 md:w-8 md:h-8" />
                  <span className="text-white font-black tracking-tighter text-lg md:text-xl">MyMorez</span>
               </Link>

               {/* Center: Nav Links */}
               <div className="hidden lg:flex items-center justify-center gap-8 md:gap-10">
                  <button
                     onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                     className="text-[14px] font-bold text-white hover:text-green-400 transition-colors whitespace-nowrap tracking-wide"
                  >
                     {t('landing.features')}
                  </button>
                  <button
                     onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                     className="text-[14px] font-bold text-white hover:text-green-400 transition-colors whitespace-nowrap tracking-wide"
                  >
                     {t('landing.aboutUs')}
                  </button>
                  <button
                     onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                     className="text-[14px] font-bold text-white hover:text-green-400 transition-colors tracking-wide"
                  >
                     FAQ
                  </button>
               </div>

               {/* Right: Language + CTA + Mobile Hamburger */}
               <div className="flex items-center justify-end gap-2 md:gap-3">
                  <button
                     onClick={() => setAuthModalOpen(true)}
                     className="hidden sm:flex px-6 py-2 md:py-2.5 bg-black hover:bg-black/80 text-white text-[13px] font-bold rounded-full transition-all items-center justify-center border border-white/5 shadow-inner"
                  >
                     {t('nav.login')}
                  </button>
                  <button
                     onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                     className="hidden sm:flex px-4 py-2 bg-black hover:bg-black/80 text-white transition-colors items-center gap-2 text-[13px] font-bold rounded-full border border-white/5"
                  >
                     <span className="w-5 h-5 rounded-sm overflow-hidden flex items-center justify-center bg-slate-800 text-[10px]">{language === 'es' ? '🇪🇸' : '🇺🇸'}</span>
                     <span className="uppercase">{language === 'es' ? 'ESP' : 'ENG'}</span>
                     <ChevronDown size={14} className="text-slate-400 ml-1" />
                  </button>
                  {/* Hamburger - mobile only */}
                  <button
                     onClick={() => setMobileMenuOpen(true)}
                     className="lg:hidden w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
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

                  <button
                     onClick={() => {
                        setMobileMenuOpen(false);
                        setAuthModalOpen(true);
                     }}
                     className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-base rounded-2xl transition-all mb-4"
                  >
                     {t('nav.login')}
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

                  {/* Dynamic Hero Form - Highlighted */}
                  <div id="waitlist" className="max-w-md mx-auto bg-slate-900/95 border border-green-500/30 backdrop-blur-3xl p-6 md:p-8 rounded-[40px] shadow-[0_0_80px_rgba(34,197,94,0.15)] relative overflow-hidden">
                     <div className="absolute -top-20 -left-20 w-40 h-40 bg-green-500/20 blur-[80px] rounded-full pointer-events-none"></div>
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 opacity-80"></div>
                     {!submitted ? (
                        <form onSubmit={handleJoinWaitlist} className="space-y-4 relative z-10">
                           <div className="mb-6 flex items-center gap-2 justify-center bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-full text-xs font-bold w-fit mx-auto shadow-sm">
                              <Sparkles size={14} className="animate-pulse" />
                              <span>{t('landing.priorityAccess')}</span>
                           </div>

                           <div className="relative overflow-hidden min-h-[140px]">
                              <div className={`transition-all duration-500 ${formStep === 1 ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none absolute w-full top-0'}`}>
                                 <input
                                    type="email"
                                    placeholder={t('landing.waitlistEmailPlaceholder')}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-slate-500 focus:outline-none focus:border-green-500/50 focus:bg-white/10 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.1)] transition-all text-lg font-bold"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && email.includes('@') && setFormStep(2)}
                                 />
                              </div>
                              <div className={`transition-all duration-500 ${formStep === 2 ? 'translate-x-0 opacity-100' : formStep < 2 ? 'translate-x-full' : '-translate-x-full'} ${formStep !== 2 ? 'opacity-0 pointer-events-none absolute w-full top-0' : ''}`}>
                                 <div className="mb-2 text-center">
                                    <p className="text-white font-bold text-lg mb-1">{t('landing.waitlistCategoryTitle')}</p>
                                    <p className="text-slate-400 text-xs">{t('landing.waitlistCategoryDesc')}</p>
                                 </div>
                                 <div className="flex flex-wrap gap-2 justify-center mb-4">
                                    {availableCategories.map(cat => (
                                       <button
                                          key={cat}
                                          type="button"
                                          onClick={() => toggleCategory(cat)}
                                          className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all active:scale-95 ${selectedCategories.includes(cat)
                                             ? 'bg-green-500 text-black border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                             : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
                                             }`}
                                       >
                                          {cat}
                                       </button>
                                    ))}
                                 </div>
                                 <div className="mt-2">
                                    <input
                                       type="text"
                                       placeholder={t('landing.waitlistCategoryOther')}
                                       className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-green-500/50 transition-all text-sm"
                                       value={otherCategory}
                                       onChange={(e) => setOtherCategory(e.target.value)}
                                    />
                                 </div>
                              </div>
                              <div className={`transition-all duration-500 ${formStep === 3 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none absolute w-full top-0'}`}>
                                 <textarea
                                    placeholder={t('landing.waitlistCaosPlaceholder')}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-slate-500 focus:outline-none focus:border-green-500/50 focus:bg-white/10 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.1)] transition-all h-32 resize-none text-base"
                                    value={caos}
                                    onChange={(e) => setCaos(e.target.value)}
                                    autoFocus={formStep === 3}
                                 />

                                 <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl text-left">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                       <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                                          <input
                                             type="checkbox"
                                             checked={socialPermission}
                                             onChange={(e) => setSocialPermission(e.target.checked)}
                                             className="appearance-none w-5 h-5 border-2 border-green-500/50 rounded bg-transparent checked:bg-green-500 transition-colors cursor-pointer group-hover:border-green-400"
                                          />
                                          {socialPermission && <CheckCircle size={12} className="absolute text-black pointer-events-none" />}
                                       </div>
                                       <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors leading-tight">
                                          {t('landing.waitlistSocialAuth')}
                                       </span>
                                    </label>
                                 </div>

                                 <div className="mt-4 p-4 bg-white/5 border border-white/10 border-dashed rounded-2xl flex flex-col items-center justify-center relative cursor-pointer hover:bg-white/10 hover:border-green-500/30 transition-all min-h-[90px] group">
                                    <input
                                       type="file"
                                       multiple
                                       onChange={(e) => {
                                          if (e.target.files) {
                                             setFiles(Array.from(e.target.files));
                                          }
                                       }}
                                       className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                       title="Subir archivos de inventario"
                                    />
                                    <Upload size={22} className={`mb-2 transition-colors ${files.length > 0 ? 'text-green-400' : 'text-slate-500 group-hover:text-green-500/50'}`} />
                                    <span className="text-sm font-bold text-white text-center">
                                       {files.length > 0 ? (
                                          <span className="text-green-400">{files.length} archivo(s) seleccionado(s)</span>
                                       ) : (
                                          'Sube tu inventario (Opcional)'
                                       )}
                                    </span>
                                    <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Docs, PDFs, Excel, Fotos</span>
                                 </div>
                              </div>
                           </div>

                           <button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-black font-black text-xl rounded-2xl transition-all shadow-[0_15px_30px_rgba(34,197,94,0.3)] hover:shadow-[0_25px_50px_rgba(34,197,94,0.5)] active:scale-98 flex items-center justify-center gap-3 group relative overflow-hidden"
                           >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                              {isSubmitting ? <Clock className="animate-spin" /> : (
                                 <>
                                    {formStep === 1 || formStep === 2 ? t('landing.nextBtn') : t('landing.waitlistMainCta')}
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
                           <p className="text-slate-600 font-medium">{t('landing.waitlistSuccessDesc')}</p>
                        </div>
                     )}
                  </div>
               </div>
            </section>
         )}

         {(isFeatures || (!isFeatures && !isAbout)) && (
            <>
               <div className="mb-20">
                  <MarqueeFeatures />
               </div>

               {/* Results Mockup - Premium Square View */}
               <section className={`py-16 md:py-32 px-4 md:px-6 max-w-6xl mx-auto reveal ${!isMobile ? 'animate-float' : ''}`}>
                  <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-3xl rounded-[40px] md:rounded-[80px] p-1 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.02)] overflow-hidden">
                     <div className="bg-slate-900/40 rounded-[38px] md:rounded-[78px] overflow-hidden p-6 md:p-16 border border-white/5 shadow-inner">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                           <div>
                              <div className="flex items-center gap-2 mb-6">
                                 <span className="bg-green-500/10 text-green-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-green-500/20">{t('landing.summary')}</span>
                              </div>
                              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 md:mb-8 tracking-tighter leading-none">{t('landing.results')}<br /><span className="text-green-500">{t('landing.realTimeResults')}</span></h2>

                              {/* Income Card - Now with 3D Floating Elements (Lemon Style) */}
                              <div className="relative isolate mt-4 md:mt-8">
                                 {/* Floating Elements Around Income Card — desktop only */}
                                 {!isMobile && (
                                    <>
                                       <motion.div
                                          custom={{ y: -20, rotate: 10, duration: 4, delay: 0 }}
                                          variants={floatingVariants}
                                          animate="animate"
                                          className="absolute -top-12 -left-8 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full shadow-[0_10px_30px_rgba(34,197,94,0.4)] flex items-center justify-center border border-white/20 z-10"
                                          style={{ transformStyle: 'preserve-3d' }}
                                       >
                                          <span className="text-white font-black text-2xl drop-shadow-md">$</span>
                                       </motion.div>

                                       <motion.div
                                          custom={{ y: 25, rotate: -15, duration: 5, delay: 1 }}
                                          variants={floatingVariants}
                                          animate="animate"
                                          className="absolute -bottom-10 right-4 w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-[20px] shadow-[0_15px_35px_rgba(59,130,246,0.3)] flex items-center justify-center border border-white/20 z-10 rotate-12"
                                       >
                                          <BarChart3 size={32} className="text-white drop-shadow-md" />
                                       </motion.div>

                                       <motion.div
                                          custom={{ y: -15, rotate: 20, duration: 6, delay: 2 }}
                                          variants={floatingVariants}
                                          animate="animate"
                                          className="absolute top-1/2 -right-12 w-14 h-14 bg-gradient-to-bl from-amber-400 to-orange-500 rounded-full shadow-[0_10px_25px_rgba(245,158,11,0.3)] flex items-center justify-center border border-white/20 z-10"
                                       >
                                          <Sparkles size={24} className="text-white drop-shadow-md" />
                                       </motion.div>
                                    </>
                                 )}

                                 <div className="bg-white/5 rounded-[40px] p-8 border border-white/10 mb-8 shadow-[0_15px_40px_rgba(0,0,0,0.2)] group hover:shadow-[0_25px_60px_rgba(34,197,94,0.1)] transition-all duration-500 relative z-0 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
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
                              <div className="absolute -inset-10 bg-green-500/10 blur-[120px] rounded-full animate-pulse-slow will-change-transform"></div>
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
                  <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 blur-3xl md:blur-[120px] rounded-full -z-10 md:animate-pulse will-change-transform"></div>
                  <div className="text-center mb-24 reveal">
                     <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter mb-4 md:mb-6 underline decoration-green-500/20 underline-offset-8">{t('landing.howItWorks')}</h2>
                     <p className="text-slate-400 text-base md:text-xl font-light">{t('landing.in3Steps')}</p>
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
                        <div key={i} className="reveal bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md p-8 md:p-10 rounded-2xl border border-white/5 border-t-white/10 hover:border-green-500/40 transition-all group relative overflow-hidden shadow-xl hover:shadow-[0_20px_50px_rgba(34,197,94,0.15)] hover:-translate-y-2 duration-500 will-change-transform" style={{ transitionDelay: `${f.delay}ms` }}>
                           <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl md:blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <div className="w-16 h-16 bg-slate-950/50 rounded-2xl flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 group-hover:bg-slate-900 shadow-inner group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all duration-500">
                              {f.icon}
                           </div>
                           <h4 className="text-2xl font-black text-white mb-4 tracking-tight drop-shadow-sm">{f.title}</h4>
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
                     <div className="reveal flex flex-col gap-8 relative mt-16 md:mt-0">
                        {/* 3D Floating Safe / Security Element — desktop only */}
                        {!isMobile && (
                           <div className="absolute -top-24 -right-10 md:-top-32 md:-right-20 z-20 pointer-events-none">
                              <motion.div
                                 custom={{ y: 30, rotate: -5, duration: 7, delay: 0 }}
                                 variants={floatingVariants}
                                 animate="animate"
                                 className="relative"
                              >
                                 <div className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-slate-700 to-slate-900 rounded-3xl border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.2)] flex items-center justify-center overflow-hidden">
                                    {/* Safe Dial */}
                                    <motion.div
                                       custom={{ rotateZ: 360, duration: 20 }}
                                       variants={orbitVariants}
                                       animate="animate"
                                       className="w-24 h-24 md:w-32 md:h-32 rounded-full border-[8px] border-slate-600 bg-slate-800 shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center relative"
                                    >
                                       <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-700 border border-slate-500 shadow-xl flex items-center justify-center">
                                          <ShieldCheck size={32} className="text-green-500" />
                                       </div>
                                       <div className="absolute w-2 h-4 bg-green-500 top-2 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                                    </motion.div>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 to-transparent"></div>
                                 </div>
                              </motion.div>
                           </div>
                        )}

                        <div className="bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-[40px] md:rounded-[48px] border border-white/10 bg-green-500/[0.02] hover:bg-green-500/[0.05] transition-all relative overflow-hidden group shadow-sm hover:shadow-xl mt-12 md:mt-0">
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
                     <div
                        onClick={() => setExpandedCard(expandedCard === 'mission' ? null : 'mission')}
                        className="reveal bg-white/5 p-10 md:p-16 rounded-[40px] md:rounded-[64px] border border-white/10 hover:border-blue-500/30 transition-all duration-1000 group hover:shadow-[0_50px_100px_rgba(59,130,246,0.2)] relative overflow-hidden cursor-pointer"
                     >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 blur-2xl md:blur-3xl -z-10 group-hover:bg-blue-500/10 transition-colors"></div>
                        <div className="flex justify-between items-start mb-12">
                           <div className="w-24 h-24 bg-blue-500/10 rounded-[32px] flex items-center justify-center border border-blue-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                              <Target className="text-blue-400" size={48} />
                           </div>
                           <div className={`w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 transition-transform duration-500 ${expandedCard === 'mission' ? 'rotate-180' : ''}`}>
                              <ChevronDown size={24} />
                           </div>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 md:mb-10 tracking-tighter uppercase leading-none">{t('landing.missionTitle')}</h2>
                        <AnimatePresence>
                           {expandedCard === 'mission' && (
                              <motion.div
                                 initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                 animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                                 exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                 transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                                 className="overflow-hidden"
                              >
                                 <p className="text-slate-400 text-lg md:text-2xl leading-relaxed font-light">
                                    {t('landing.missionDesc')}
                                 </p>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>

                     <div
                        onClick={() => setExpandedCard(expandedCard === 'vision' ? null : 'vision')}
                        className="reveal bg-white/5 p-10 md:p-16 rounded-[40px] md:rounded-[64px] border border-white/10 hover:border-purple-500/30 transition-all duration-1000 group hover:shadow-[0_50px_100px_rgba(168,85,247,0.2)] relative overflow-hidden cursor-pointer"
                        style={{ transitionDelay: '200ms' }}
                     >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 blur-2xl md:blur-3xl -z-10 group-hover:bg-purple-500/10 transition-colors"></div>
                        <div className="flex justify-between items-start mb-12">
                           <div className="w-24 h-24 bg-purple-500/10 rounded-[32px] flex items-center justify-center border border-purple-500/20 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700">
                              <Eye className="text-purple-400" size={48} />
                           </div>
                           <div className={`w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 transition-transform duration-500 ${expandedCard === 'vision' ? 'rotate-180' : ''}`}>
                              <ChevronDown size={24} />
                           </div>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 md:mb-10 tracking-tighter uppercase leading-none">{t('landing.visionTitle')}</h2>
                        <AnimatePresence>
                           {expandedCard === 'vision' && (
                              <motion.div
                                 initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                 animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                                 exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                 transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                                 className="overflow-hidden"
                              >
                                 <p className="text-slate-400 text-lg md:text-2xl leading-relaxed font-light">
                                    {t('landing.visionDesc')}
                                 </p>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                  </div>
               </section>

               {/* TikTok / Builder Section */}
               <section className="py-16 md:py-24 px-4 md:px-6 text-center max-w-4xl mx-auto">
                  <div className="reveal space-y-6">
                     <div className="w-20 h-20 bg-slate-900 rounded-3xl mx-auto border border-white/10 flex items-center justify-center text-white text-4xl font-black shadow-2xl animate-float overflow-hidden">
                        <img src="/perfil_yo.png" alt="Luis" className="w-full h-full object-cover" />
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
                     <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">{t('landing.smartInventoryManagement')}</p>
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
                        <h4 className="text-white font-bold mb-6 tracking-tight uppercase text-xs tracking-[0.2em]">{t('landing.product')}</h4>
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
                        <h4 className="text-white font-bold mb-6 tracking-tight uppercase text-xs tracking-[0.2em]">{t('landing.company')}</h4>
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
