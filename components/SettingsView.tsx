import React, { useState } from 'react';
import { useStore } from '../store';
import { Building2, Coins, MessageCircle, Clock, Database, Copy, Check, Terminal, ShieldAlert, Palette, Image as ImageIcon, Upload, Instagram, Facebook, Globe, AlignLeft, Save, Loader2, Sun, Moon, ExternalLink } from 'lucide-react';
import { PromoBanner } from './PromoBanner';
import { Button } from './ui/Button';
import { WhatsAppModal } from './WhatsAppModal';
import { useTranslation } from '../hooks/useTranslation';
import { PublicStorefront } from './PublicStorefront';
import { AppSettings } from '../types';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, saveProfileSettings, isWhatsAppModalOpen, setWhatsAppModalOpen, setLanguage } = useStore();
  const { t, language } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Keep track of local config edits before hitting save for the live preview
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  // Update Global and Local states
  const handleUpdate = (updates: Partial<AppSettings>) => {
    setLocalSettings((prev) => ({ ...prev, ...updates }));
    updateSettings(updates);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveProfileSettings({});
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('El archivo es demasiado grande (máx 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdate({ storeLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1000px] mx-auto h-full overflow-y-auto pb-32 space-y-12 pr-2 hide-scrollbar">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-white mb-2">{t('settings.title')}</h2>
          <p className="text-gray-500">{t('settings.subtitle')}</p>
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
                  <h3 className="text-xl font-bold text-white">{t('settings.whatsappTitle')}</h3>
                  {settings.whatsappEnabled ? (
                    <span className="text-[10px] bg-green-500 text-black font-bold px-2 py-0.5 rounded-full">{t('settings.whatsappActive')}</span>
                  ) : (
                    <span className="text-[10px] bg-gray-800 text-gray-400 font-bold px-2 py-0.5 rounded-full">{t('settings.whatsappInactive')}</span>
                  )}
                </div>
                <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                  {t('settings.whatsappDesc')}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setWhatsAppModalOpen(true)}
              className={`${settings.whatsappEnabled ? 'bg-[#1a1a1a] text-white border border-white/10' : 'bg-green-600 text-black hover:bg-green-500'} font-bold shadow-xl`}
            >
              {settings.whatsappEnabled ? t('settings.whatsappEdit') : t('settings.whatsappConnect')}
            </Button>
          </div>
        </div>

        <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 p-6 flex flex-col justify-center items-center text-center opacity-60">
          <div className="w-12 h-12 bg-gray-800 rounded-xl mb-4 flex items-center justify-center">
            <Coins size={24} className="text-gray-500" />
          </div>
          <h4 className="font-bold text-white mb-1">{t('settings.billingTitle')}</h4>
          <p className="text-xs text-gray-500 mb-4">{t('settings.billingDesc')}</p>
          <span className="text-[10px] border border-white/10 px-2 py-1 rounded text-gray-400">{t('settings.comingSoon')}</span>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative z-10 gap-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 size={24} className="text-green-500" />
            {t('settings.companyData')}
          </h3>
          <Button
            onClick={() => window.open(`/${localSettings.storeSlug || settings.storeSlug}`, '_blank')}
            className="bg-green-600 text-black hover:bg-green-500 font-bold flex items-center gap-2"
          >
            <ExternalLink size={16} /> Ver Tienda
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('settings.companyName')}</label>
              <input
                type="text"
                value={localSettings.companyName}
                onChange={(e) => handleUpdate({ companyName: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-green-900/30 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder-gray-700 font-medium"
                placeholder={t('settings.companyNamePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-green-500 uppercase tracking-wider">Enlace Personalizado</label>
              <div className="flex bg-black border border-green-900/30 rounded-xl overflow-hidden focus-within:border-green-500 transition-all">
                <span className="bg-white/5 text-gray-500 px-3 py-3 text-xs flex items-center border-r border-white/5">mymorez.com/</span>
                <input
                  type="text"
                  value={localSettings.storeSlug || ''}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    handleUpdate({ storeSlug: val })
                  }}
                  onBlur={() => saveProfileSettings({ storeSlug: localSettings.storeSlug })}
                  className="w-full bg-transparent px-3 py-3 text-sm text-green-400 outline-none font-bold placeholder-green-900/50"
                  placeholder="mi-tienda"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Coins size={12} /> {t('settings.baseCurrency')}
            </label>
            <select
              value={localSettings.currency}
              onChange={(e) => handleUpdate({ currency: e.target.value })}
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
              <Clock size={12} /> {t('settings.stagnantDays')}
            </label>
            <div className="relative">
              <input
                type="number"
                value={localSettings.stagnantDaysThreshold || 90}
                onChange={(e) => handleUpdate({ stagnantDaysThreshold: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-black border border-green-900/30 rounded-xl text-white focus:border-green-500 outline-none transition-all font-mono pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">{t('settings.days')}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              🌐 {t('settings.language')}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'es' | 'en')}
              className="w-full px-4 py-3 bg-black border border-green-900/30 rounded-xl text-white focus:border-green-500 outline-none appearance-none"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Store Customization */}
      <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 p-8 relative overflow-hidden">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
          <Palette size={24} className="text-purple-500" />
          Personalización y Tienda
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {/* Logo Upload */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <ImageIcon size={12} /> Logo de la Tienda
            </label>
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-2 items-center">
                <div className="w-20 h-20 rounded-2xl bg-black border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                  {localSettings.storeLogo ? (
                    <img src={localSettings.storeLogo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={24} className="text-gray-600" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload size={16} className="text-white" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                {localSettings.storeLogo && (
                  <button
                    onClick={() => handleUpdate({ storeLogo: '' })}
                    className="text-xs font-bold text-red-500 hover:text-red-400"
                  >
                    Quitar Logo
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-400">
                Sube tu logo para personalizar tu catálogo. Recomendado: 1:1, máx 2MB.
              </div>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              Tema de la Aplicación
            </label>
            <div className="flex bg-black p-1 rounded-xl border border-white/10 w-fit">
              <button
                onClick={() => handleUpdate({ theme: 'light' })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${localSettings.theme === 'light' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                <Sun size={18} />
                Claro
              </button>
              <button
                onClick={() => handleUpdate({ theme: 'dark' })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${localSettings.theme === 'dark' || !localSettings.theme ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                <Moon size={18} />
                Oscuro
              </button>
            </div>
          </div>

          {/* Primary Color */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              Color de Marca
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-xl border-2 border-white/10 overflow-hidden flex-shrink-0 p-0.5">
                <input
                  type="color"
                  value={localSettings.primaryColor || '#22c55e'}
                  onChange={(e) => handleUpdate({ primaryColor: e.target.value })}
                  className="w-full h-full p-0 border-0 outline-none rounded-lg overflow-hidden shrink-0 cursor-pointer"
                  style={{ backgroundColor: localSettings.primaryColor || '#22c55e' }}
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={localSettings.primaryColor || '#22c55e'}
                  onChange={(e) => handleUpdate({ primaryColor: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-white/10 rounded-xl text-white outline-none font-mono text-sm"
                  placeholder="#22c55e"
                />
              </div>
            </div>
          </div>

          {/* Store Description (AI Analysis) */}
          <div className="space-y-3 lg:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <AlignLeft size={12} /> Sobre tu negocio (Análisis IA)
            </label>
            <textarea
              value={localSettings.storeDescription || ''}
              onChange={(e) => handleUpdate({ storeDescription: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white outline-none placeholder-gray-700 min-h-[100px] text-sm resize-none"
              placeholder="Describe tu negocio, tono de voz o instrucciones clave para que nuestra IA te genere mejores descripciones automáticamente..."
            />
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5">
          <h4 className="text-sm font-bold text-gray-400 mb-4 tracking-wider uppercase">Redes Sociales & Links</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center bg-black border border-white/10 rounded-xl p-1 overflow-hidden">
              <div className="px-3 text-pink-500"><Instagram size={18} /></div>
              <input
                type="text"
                value={localSettings.instagramUrl || ''}
                onChange={(e) => handleUpdate({ instagramUrl: e.target.value })}
                placeholder="instagram.com/tu_tienda"
                className="w-full bg-transparent text-sm text-white py-2 outline-none placeholder-gray-700"
              />
            </div>
            <div className="flex items-center bg-black border border-white/10 rounded-xl p-1 overflow-hidden">
              <div className="px-3 text-blue-500"><Facebook size={18} /></div>
              <input
                type="text"
                value={localSettings.facebookUrl || ''}
                onChange={(e) => handleUpdate({ facebookUrl: e.target.value })}
                placeholder="facebook.com/tu_tienda"
                className="w-full bg-transparent text-sm text-white py-2 outline-none placeholder-gray-700"
              />
            </div>
            <div className="flex items-center bg-black border border-white/10 rounded-xl p-1 overflow-hidden">
              <div className="px-3 text-gray-400"><Globe size={18} /></div>
              <input
                type="text"
                value={localSettings.websiteUrl || ''}
                onChange={(e) => handleUpdate({ websiteUrl: e.target.value })}
                placeholder="www.tutienda.com"
                className="w-full bg-transparent text-sm text-white py-2 outline-none placeholder-gray-700"
              />
            </div>
          </div>
        </div>
        <WhatsAppModal isOpen={isWhatsAppModalOpen} onClose={() => setWhatsAppModalOpen(false)} />

        {/* Save FAB - Fixed at bottom for easier access after removing the sidebar */}
        <div className="fixed bottom-10 right-10 z-50">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={`${saveSuccess ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-gray-200'} font-bold shadow-2xl px-10 h-16 rounded-full flex items-center justify-center gap-2`}
          >
            {isSaving ? (
              <Loader2 size={24} className="animate-spin" />
            ) : saveSuccess ? (
              <Check size={24} />
            ) : (
              <Save size={24} />
            )}
            {isSaving ? 'Guardando...' : saveSuccess ? '¡Guardado!' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
};
