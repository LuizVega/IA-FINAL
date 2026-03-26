import React, { useState } from 'react';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { AppSettings } from '../../types';
import {
    ArrowLeft,
    Save,
    MessageCircle,
    Building2,
    Coins,
    Clock,
    Palette,
    Image as ImageIcon,
    Upload,
    AlignLeft,
    Instagram,
    Facebook,
    Globe,
    Loader2,
    Check,
    Sun,
    Moon,
    ExternalLink
} from 'lucide-react';
import { Button } from '../ui/Button';
import { WhatsAppModal } from '../WhatsAppModal';

export const MobileSettingsView: React.FC = () => {
    const { t, language } = useTranslation();
    const { settings, updateSettings, saveProfileSettings, isWhatsAppModalOpen, setWhatsAppModalOpen, setLanguage, setCurrentView } = useStore() as any;

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

    const handleUpdate = (updates: Partial<AppSettings>) => {
        setLocalSettings((prev) => ({ ...prev, ...updates }));
        updateSettings(updates);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Ensure all local changes are persisted
            await saveProfileSettings(localSettings);

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
        <div className="flex flex-col min-h-screen bg-black text-white font-sans pb-32">


            <main className="px-4 py-6 space-y-6">
                {/* WhatsApp Integration */}
                <section className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl p-5 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#32D74B]/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="flex items-start gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-[#32D74B]/10 flex items-center justify-center text-[#32D74B]">
                            <MessageCircle size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-sm tracking-wide uppercase text-gray-300">{t('settings.whatsappTitle')}</h3>
                                {settings.whatsappEnabled ? (
                                    <span className="text-[9px] bg-[#32D74B] text-black font-bold px-1.5 py-0.5 rounded-full">{t('settings.whatsappActive')}</span>
                                ) : (
                                    <span className="text-[9px] bg-gray-800 text-gray-400 font-bold px-1.5 py-0.5 rounded-full">{t('settings.whatsappInactive')}</span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{t('settings.whatsappDesc')}</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setWhatsAppModalOpen(true)}
                        className={`w-full py-3 rounded-2xl text-sm font-bold ${settings.whatsappEnabled ? 'bg-white/5 text-white border border-white/10' : 'bg-[#32D74B] text-black'}`}
                    >
                        {settings.whatsappEnabled ? t('settings.whatsappEdit') : t('settings.whatsappConnect')}
                    </Button>

                    {settings.whatsappEnabled && (
                        <div className="mt-4 bg-black/40 p-4 rounded-3xl border border-white/5">
                            <div className="flex justify-between items-center mb-3">
                                <p className="text-xs font-bold text-white uppercase tracking-wider opacity-60">PIN de Vendedor</p>
                                <span className="text-[10px] text-gray-500 italic">Opcional</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    placeholder="----"
                                    value={localSettings.sellerPin || ''}
                                    onChange={(e) => handleUpdate({ sellerPin: e.target.value.replace(/\D/g, '') })}
                                    className="bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-lg text-white font-mono tracking-[0.5em] text-center w-32 focus:outline-none focus:border-[#32D74B]/50"
                                />
                                <p className="text-[10px] text-gray-500 leading-tight flex-1">
                                    Evita que otros confirmen tus ventas sin permiso.
                                </p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Theme & Styling */}
                <section className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl p-5 shadow-xl">
                    <h3 className="font-bold text-sm tracking-wide uppercase text-gray-400 mb-5 flex items-center gap-2">
                        <Palette size={16} className="text-purple-400" /> Diseño de la Tienda
                    </h3>

                    {/* Logo */}
                    <div className="mb-6">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2 block">Logo de la Tienda</label>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                                {localSettings.storeLogo ? (
                                    <img src={localSettings.storeLogo} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon size={20} className="text-gray-600" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-2">Sube tu logo. Recomendado 1:1, máx 2MB.</p>
                                {localSettings.storeLogo && (
                                    <button
                                        onClick={() => handleUpdate({ storeLogo: '' })}
                                        className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded"
                                    >
                                        Quitar Logo
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Theme */}
                    <div className="mb-6">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2 block">Tema (Tienda Pública)</label>
                        <div className="flex bg-black p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => handleUpdate({ theme: 'light' })}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${localSettings.theme === 'light' ? 'bg-white text-black shadow-md' : 'text-gray-500'}`}
                            >
                                <Sun size={14} /> Claro
                            </button>
                            <button
                                onClick={() => handleUpdate({ theme: 'dark' })}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${localSettings.theme === 'dark' || !localSettings.theme ? 'bg-[#2C2C2E] text-white shadow-md' : 'text-gray-500'}`}
                            >
                                <Moon size={14} /> Oscuro
                            </button>
                        </div>
                    </div>

                    {/* Primary Color */}
                    <div className="mb-6">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2 block">Color de Marca Primario</label>
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-xl border border-white/10 overflow-hidden flex-shrink-0 p-0.5">
                                <input
                                    type="color"
                                    value={localSettings.primaryColor || '#32D74B'}
                                    onChange={(e) => handleUpdate({ primaryColor: e.target.value })}
                                    className="w-full h-full p-0 border-0 outline-none rounded-lg cursor-pointer"
                                    style={{ backgroundColor: localSettings.primaryColor || '#32D74B' }}
                                />
                            </div>
                            <input
                                type="text"
                                value={localSettings.primaryColor || '#32D74B'}
                                onChange={(e) => handleUpdate({ primaryColor: e.target.value })}
                                className="flex-1 bg-black border border-white/5 rounded-xl px-3 py-2 text-sm font-mono text-white outline-none uppercase"
                            />
                        </div>
                    </div>

                    {/* Secondary Color */}
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2 block">Color de Marca Secundario</label>
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-xl border border-white/10 overflow-hidden flex-shrink-0 p-0.5">
                                <input
                                    type="color"
                                    value={localSettings.secondaryColor || '#6366f1'}
                                    onChange={(e) => handleUpdate({ secondaryColor: e.target.value })}
                                    className="w-full h-full p-0 border-0 outline-none rounded-lg cursor-pointer"
                                    style={{ backgroundColor: localSettings.secondaryColor || '#6366f1' }}
                                />
                            </div>
                            <input
                                type="text"
                                value={localSettings.secondaryColor || '#6366f1'}
                                onChange={(e) => handleUpdate({ secondaryColor: e.target.value })}
                                className="flex-1 bg-black border border-white/5 rounded-xl px-3 py-2 text-sm font-mono text-white outline-none uppercase"
                            />
                        </div>
                    </div>
                </section>

                {/* About Business */}
                <section className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl p-5 shadow-xl">
                    <h3 className="font-bold text-sm tracking-wide uppercase text-gray-400 mb-4 flex items-center gap-2">
                        <AlignLeft size={16} /> Sobre tu negocio
                    </h3>
                    <textarea
                        value={localSettings.storeDescription || ''}
                        onChange={(e) => handleUpdate({ storeDescription: e.target.value })}
                        className="w-full bg-black border border-white/5 rounded-2xl px-4 py-3 text-sm text-white outline-none min-h-[100px] resize-none placeholder-gray-600"
                        placeholder="Describe tu negocio para la tienda pública y para que la IA genere mejores descripciones..."
                    />
                </section>

                {/* Social Links */}
                <section className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl p-5 shadow-xl space-y-4">
                    <h3 className="font-bold text-sm tracking-wide uppercase text-gray-400 mb-2">Redes Sociales</h3>

                    <div className="flex items-center bg-black border border-white/5 rounded-2xl overflow-hidden p-1">
                        <div className="w-10 flex items-center justify-center text-pink-500"><Instagram size={18} /></div>
                        <input
                            type="text"
                            value={localSettings.instagramUrl || ''}
                            onChange={(e) => handleUpdate({ instagramUrl: e.target.value })}
                            className="flex-1 bg-transparent border-none text-sm text-white py-2 outline-none placeholder-gray-600"
                            placeholder="instagram.com/tu_tienda"
                        />
                    </div>

                    <div className="flex items-center bg-black border border-white/5 rounded-2xl overflow-hidden p-1">
                        <div className="w-10 flex items-center justify-center text-blue-500"><Facebook size={18} /></div>
                        <input
                            type="text"
                            value={localSettings.facebookUrl || ''}
                            onChange={(e) => handleUpdate({ facebookUrl: e.target.value })}
                            className="flex-1 bg-transparent border-none text-sm text-white py-2 outline-none placeholder-gray-600"
                            placeholder="facebook.com/tu_tienda"
                        />
                    </div>

                    <div className="flex items-center bg-black border border-white/5 rounded-2xl overflow-hidden p-1">
                        <div className="w-10 flex items-center justify-center text-gray-400"><Globe size={18} /></div>
                        <input
                            type="text"
                            value={localSettings.websiteUrl || ''}
                            onChange={(e) => handleUpdate({ websiteUrl: e.target.value })}
                            className="flex-1 bg-transparent border-none text-sm text-white py-2 outline-none placeholder-gray-600"
                            placeholder="www.tutienda.com"
                        />
                    </div>
                </section>

                {/* General Settings */}
                <section className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl p-5 shadow-xl space-y-5">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-sm tracking-wide uppercase text-gray-400 flex items-center gap-2">
                            <Building2 size={16} /> Detalles Operativos
                        </h3>
                        <Button
                            onClick={() => window.open(`/${localSettings.storeSlug || settings.storeSlug}`, '_blank')}
                            size="sm"
                            className="bg-[#32D74B] text-black font-bold h-7 text-xs px-3 rounded-xl flex items-center gap-1.5"
                        >
                            <ExternalLink size={12} /> Ver Tienda
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1 block">Nombre de la Empresa</label>
                            <input
                                type="text"
                                value={localSettings.companyName}
                                onChange={(e) => handleUpdate({ companyName: e.target.value })}
                                className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#32D74B]/50 focus:ring-1 focus:ring-[#32D74B]/50 transition-all font-bold"
                                placeholder="Mi Tienda"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase font-bold text-green-500 tracking-widest mb-1 block">Enlace de tu Tienda</label>
                            <div className="flex bg-black border border-white/5 rounded-xl overflow-hidden focus-within:border-[#32D74B]/50 transition-all">
                                <span className="bg-white/5 text-gray-500 px-3 py-3 text-sm flex items-center border-r border-white/5">mymorez.com/</span>
                                <input
                                    type="text"
                                    value={localSettings.storeSlug || ''}
                                    onChange={(e) => {
                                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                        handleUpdate({ storeSlug: val })
                                    }}
                                    onBlur={() => saveProfileSettings({ storeSlug: localSettings.storeSlug })}
                                    className="w-full bg-transparent px-3 py-3 text-sm text-[#32D74B] outline-none font-bold placeholder-green-900"
                                    placeholder="mi-tienda"
                                />
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1 mt-1">Solo letras, números y guiones. Sin espacios.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1 block flex items-center gap-1">
                                <Coins size={10} /> Moneda
                            </label>
                            <select
                                value={localSettings.currency}
                                onChange={(e) => handleUpdate({ currency: e.target.value })}
                                className="w-full bg-black border border-white/5 rounded-xl px-3 py-3 text-sm text-white outline-none appearance-none"
                            >
                                <option value="USD">USD ($ - Ecuador)</option>
                                <option value="PEN">PEN (S/)</option>
                                <option value="MXN">MXN ($)</option>
                                <option value="ARS">ARS ($)</option>
                                <option value="CLP">CLP ($)</option>
                                <option value="COP">COP ($)</option>
                                <option value="BOB">BOB (Bs.)</option>
                                <option value="BRL">BRL (R$)</option>
                                <option value="EUR">EUR (€)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1 block flex items-center gap-1">
                                <Clock size={10} /> Días Inactivo
                            </label>
                            <input
                                type="number"
                                value={localSettings.stagnantDaysThreshold || 90}
                                onChange={(e) => handleUpdate({ stagnantDaysThreshold: parseInt(e.target.value) })}
                                className="w-full bg-black border border-white/5 rounded-xl px-3 py-3 text-sm text-white outline-none text-center font-mono"
                            />
                        </div>
                    </div>
                </section>
            </main>

            {/* Fixed Save Button */}
            <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-30 pb-safe">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`w-full py-4 rounded-2xl font-bold shadow-2xl flex items-center justify-center gap-2 text-base ${saveSuccess ? 'bg-[#32D74B] text-black' : 'bg-white text-black active:scale-[0.98]'}`}
                >
                    {isSaving ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : saveSuccess ? (
                        <Check size={20} />
                    ) : (
                        <Save size={20} />
                    )}
                    {isSaving ? 'Guardando...' : saveSuccess ? '¡Guardado!' : 'Guardar Cambios'}
                </Button>
            </div>

            <WhatsAppModal isOpen={isWhatsAppModalOpen} onClose={() => setWhatsAppModalOpen(false)} />
        </div>
    );
};
