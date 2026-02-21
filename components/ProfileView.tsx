
import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Button } from './ui/Button';
import { User, LogOut, Shield, Mail, CreditCard, Key, AlertTriangle, Sparkles, Rocket, Crown, ExternalLink, Copy, Check } from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';

export const ProfileView: React.FC = () => {
    const { t } = useTranslation();
    const { session, setAuthModalOpen, settings, saveProfileSettings } = useStore();
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
            // Mock logout
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

    // ---------------- GUEST VIEW ----------------
    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in fade-in duration-500">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full animate-pulse"></div>
                    <div className="relative bg-[#111] p-8 rounded-full border border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.15)]">
                        <Rocket size={64} className="text-green-500" />
                    </div>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                    {t('profile.guestTitle')} <span className="text-green-500">ExO</span>
                </h2>
                <p className="text-gray-400 text-lg max-w-lg mb-10 leading-relaxed">
                    {t('profile.guestDesc')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-10">
                    <div className="bg-[#111] p-5 rounded-2xl border border-white/5 flex items-center gap-4 text-left">
                        <div className="bg-green-900/20 p-3 rounded-lg text-green-400"><Sparkles size={20} /></div>
                        <div>
                            <h4 className="font-bold text-white">{t('profile.guestAiTitle')}</h4>
                            <p className="text-xs text-gray-500">{t('profile.guestAiDesc')}</p>
                        </div>
                    </div>
                    <div className="bg-[#111] p-5 rounded-2xl border border-white/5 flex items-center gap-4 text-left">
                        <div className="bg-purple-900/20 p-3 rounded-lg text-purple-400"><Crown size={20} /></div>
                        <div>
                            <h4 className="font-bold text-white">{t('profile.guestOfferTitle')}</h4>
                            <p className="text-xs text-gray-500">{t('profile.guestOfferDesc')}</p>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={() => setAuthModalOpen(true)}
                    className="px-10 py-4 text-lg bg-green-500 hover:bg-green-400 text-black font-bold shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transform hover:scale-105 transition-all"
                >
                    {t('profile.guestCreateBtn')}
                </Button>
                <p className="mt-4 text-sm text-gray-500">
                    {t('profile.guestLoginPrompt')} <button onClick={() => setAuthModalOpen(true)} className="text-green-500 hover:underline">{t('profile.guestLoginBtn')}</button>
                </p>
            </div>
        );
    }

    // ---------------- LOGGED IN VIEW ----------------
    return (
        <div className="p-6 max-w-4xl mx-auto h-full overflow-y-auto">
            <h2 className="text-3xl font-bold text-white mb-2">{t('profile.title')}</h2>
            <p className="text-gray-500 mb-8">{t('profile.description')}</p>

            {/* User Card */}
            <div className="bg-[#111] rounded-3xl border border-white/5 p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 to-black border-2 border-white/10 flex items-center justify-center shadow-2xl">
                        <span className="text-3xl font-bold text-gray-400">
                            {userEmail.substring(0, 2).toUpperCase()}
                        </span>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">{t('profile.nameLabel')}</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2 text-white focus:border-green-500 outline-none transition-all"
                                placeholder={t('profile.namePlaceholder')}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">{t('profile.businessLabel')}</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2 text-white focus:border-green-500 outline-none transition-all"
                                placeholder={t('profile.businessPlaceholder')}
                            />
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Mail size={14} />
                                <span>{userEmail}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <Button
                            onClick={async () => {
                                setIsSaving(true);
                                try {
                                    await saveProfileSettings({ displayName, companyName });
                                } finally {
                                    setIsSaving(false);
                                }
                            }}
                            isLoading={isSaving}
                            className="bg-green-600 text-black hover:bg-green-500"
                        >
                            {t('profile.saveBtn')}
                        </Button>
                        <Button variant="secondary" onClick={handleSignOut} isLoading={loading} icon={<LogOut size={16} />}>
                            {t('profile.logoutBtn')}
                        </Button>
                    </div>
                </div>

                {/* Store Link Section */}
                <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><ExternalLink size={16} className="text-green-500" /> {t('profile.storeTitle')}</h4>
                    <div className="bg-black/50 p-4 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <p className="text-xs text-gray-400 text-center md:text-left max-w-md">
                            {t('profile.storeDesc')}
                        </p>
                        <Button
                            onClick={copyStoreLink}
                            size="sm"
                            className={copiedLink ? "bg-white text-black" : "bg-green-600 text-black hover:bg-green-500"}
                            icon={copiedLink ? <Check size={14} /> : <Copy size={14} />}
                        >
                            {copiedLink ? t('profile.copiedBtn') : t('profile.copyBtn')}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Security */}
                <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Shield size={20} className="text-blue-500" /> {t('profile.securityTitle')}
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-800 p-2 rounded-lg text-gray-400">
                                    <Key size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{t('profile.passwordLabel')}</p>
                                    <p className="text-xs text-gray-500">{t('profile.passwordDesc')}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleResetPassword}>{t('profile.changeBtn')}</Button>
                        </div>
                    </div>
                </div>

                {/* Subscription */}
                <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <CreditCard size={20} className="text-purple-500" /> {t('profile.subscriptionTitle')}
                    </h3>

                    <div className="bg-gradient-to-br from-[#111] to-black p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{t('profile.currentPlan')}</p>
                                <p className="text-xl font-bold text-white mt-1">Starter Free</p>
                            </div>
                            <span className="text-2xl font-bold text-gray-600">$0</span>
                        </div>
                        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-2">
                            <div className="bg-green-500 h-full w-[10%]"></div>
                        </div>
                        <p className="text-xs text-gray-500">{t('profile.renewal')}</p>

                        <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                            <Button size="sm" className="w-full text-xs" variant="secondary">{t('profile.managePlanBtn')}</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
