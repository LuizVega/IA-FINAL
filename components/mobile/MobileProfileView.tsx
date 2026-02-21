import React, { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
    User,
    LogOut,
    Shield,
    Mail,
    CreditCard,
    Key,
    ExternalLink,
    Copy,
    Check,
    ChevronRight,
    Building2,
    Store
} from 'lucide-react';

export const MobileProfileView: React.FC = () => {
    const { t } = useTranslation();
    const { session, setCurrentView, settings, saveProfileSettings } = useStore() as any;

    const [userEmail, setUserEmail] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    const [displayName, setDisplayName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    useEffect(() => {
        if (session) {
            setUserEmail(session.user.email || 'No email');
            setUserId(session.user.id);
            setDisplayName(settings.displayName || '');
            setCompanyName(settings.companyName || '');
        }
    }, [session, settings]);

    const handleSignOut = async () => {
        setLoading(true);
        if (isSupabaseConfigured) {
            await supabase.auth.signOut();
        } else {
            window.location.reload();
        }
    };

    const handleResetPassword = async () => {
        if (!isSupabaseConfigured || !session) return;
        const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
            redirectTo: window.location.origin,
        });
        if (error) {
            alert(`${t('profile.emailError')} ${error.message}`);
        } else {
            alert(`${t('profile.emailSent')} ${userEmail}`);
        }
    };

    const copyStoreLink = () => {
        const url = `${window.location.origin}?shop=${userId}`;
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveProfileSettings({ displayName, companyName });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-black text-white font-sans pb-32">
            {/* Header */}
            <header className="pt-12 px-6 pb-6 sticky top-0 bg-black/80 backdrop-blur-xl z-10 border-b border-white/5">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight">{t('profile.title')}</h1>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`text-[#32D74B] font-semibold transition-opacity ${isSaving ? 'opacity-50' : 'active:opacity-70'}`}
                    >
                        {isSaving ? '...' : t('profile.saveBtn')}
                    </button>
                </div>
            </header>

            <main className="px-4 py-6 space-y-8">
                {/* Profile Identity Card */}
                <section className="flex flex-col items-center py-6">
                    <div className="w-24 h-24 rounded-full bg-[#1C1C1E] border border-[#2C2C2E] flex items-center justify-center mb-4 relative group">
                        <span className="text-4xl font-bold text-gray-500">
                            {userEmail.substring(0, 2).toUpperCase()}
                        </span>
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#32D74B] rounded-full border-4 border-black flex items-center justify-center">
                            <User size={14} className="text-black" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold">{displayName || t('profile.userPlaceholder')}</h2>
                    <p className="text-gray-500 text-sm">{userEmail}</p>
                </section>

                {/* Info Groups */}
                <div className="space-y-6">
                    {/* Public Store Link */}
                    <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl p-5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#32D74B]/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-[#32D74B]/10 rounded-xl flex items-center justify-center text-[#32D74B]">
                                <Store size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-sm tracking-wide uppercase text-gray-400">{t('profile.storeTitle')}</h3>
                                <p className="text-xs text-gray-500">{t('profile.storeDesc') || 'Tu tienda online pública'}</p>
                            </div>
                        </div>
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-3">
                            <span className="text-xs text-gray-400 truncate flex-1">
                                {window.location.origin.replace('https://', '')}/?shop={userId.substring(0, 8)}...
                            </span>
                            <button
                                onClick={copyStoreLink}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${copiedLink ? 'bg-[#32D74B] text-black' : 'bg-white/10 text-white active:scale-95'}`}
                            >
                                {copiedLink ? <Check size={14} /> : t('profile.copyBtn')}
                            </button>
                        </div>
                    </div>

                    {/* Edit Fields */}
                    <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl divide-y divide-[#2C2C2E] overflow-hidden shadow-2xl">
                        <div className="p-4 flex flex-col gap-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest ml-1">{t('profile.nameLabel')}</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="bg-transparent border-none text-white focus:ring-0 px-1 py-1 text-lg font-medium outline-none"
                                placeholder={t('profile.namePlaceholder')}
                            />
                        </div>
                        <div className="p-4 flex flex-col gap-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest ml-1">{t('profile.businessLabel')}</label>
                            <div className="flex items-center gap-2">
                                <Building2 size={18} className="text-gray-600" />
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="bg-transparent border-none text-white focus:ring-0 px-1 py-1 text-lg font-medium flex-1 outline-none"
                                    placeholder={t('profile.businessPlaceholder')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Language Selection */}
                    <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl overflow-hidden shadow-2xl p-4">
                        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest ml-1 mb-3 block">
                            {t('settings.language')}
                        </label>
                        <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5">
                            <button
                                onClick={() => {
                                    useStore.getState().setLanguage('es');
                                }}
                                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${useStore.getState().language === 'es' ? 'bg-[#32D74B] text-black shadow-lg' : 'text-gray-500'}`}
                            >
                                Español
                            </button>
                            <button
                                onClick={() => {
                                    useStore.getState().setLanguage('en');
                                }}
                                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${useStore.getState().language === 'en' ? 'bg-[#32D74B] text-black shadow-lg' : 'text-gray-500'}`}
                            >
                                English
                            </button>
                        </div>
                    </div>

                    {/* Action Rows */}
                    <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl divide-y divide-[#2C2C2E] overflow-hidden shadow-2xl">
                        <button
                            onClick={handleResetPassword}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors active:bg-white/10"
                        >
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                                    <Key size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold">{t('profile.changeBtn')}</p>
                                    <p className="text-xs text-gray-500">{t('profile.changeDesc') || 'Actualiza tu contraseña'}</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-600" />
                        </button>

                        <button
                            onClick={() => setCurrentView('pricing')}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors active:bg-white/10"
                        >
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold">{t('profile.subscriptionTitle')}</p>
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-xs text-gray-500">{t('profile.subscriptionDesc') || 'Gestiona tu plan'}</p>
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${settings.hasClaimedOffer ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-gray-400'}`}>
                                            {settings.hasClaimedOffer ? 'GROWTH' : 'STARTER'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-600" />
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <button
                        onClick={handleSignOut}
                        disabled={loading}
                        className="w-full p-5 bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl text-red-500 font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl"
                    >
                        <LogOut size={20} />
                        {loading ? (t('profile.loggingOut') || 'Cerrando sesión...') : t('profile.logoutBtn')}
                    </button>
                </div>

                <div className="text-center py-10 opacity-30">
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em]">ExO Inventory Management</p>
                    <p className="text-[8px] mt-1">v1.2.0 • 2026 Edition</p>
                </div>
            </main>
        </div>
    );
};
