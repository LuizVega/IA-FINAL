import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Button } from './ui/Button';
import { Lock, AlertCircle, WifiOff, X, Mail } from 'lucide-react';
import { useStore } from '../store';
import { AppLogo } from './AppLogo';
import { useTranslation } from '../hooks/useTranslation';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setAuthModalOpen } = useStore();
  const { t, language } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setError(language === 'es' ? "Error de configuración: No se detectaron las variables de entorno de Supabase (URL y ANON_KEY). Por favor, configúralas para usar el sistema." : "Configuration Error: Supabase environment variables (URL & ANON_KEY) not detected. Please configure them to use the system.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setAuthModalOpen(false);
    } catch (err: any) {
      setError(language === 'es'
        ? 'Acceso denegado. Verifica tus credenciales o contacta al administrador.'
        : 'Access denied. Check your credentials or contact the administrator.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900/98 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl p-8 pt-10 md:pt-8 relative animate-in zoom-in-95 duration-200 my-auto">
        {/* iOS Safe Area Spacer */}
        <div className="h-[env(safe-area-inset-top)] md:hidden"></div>

        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-1"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-green-500/30 blur-xl rounded-full"></div>
            <AppLogo className="w-20 h-20 border-2 border-green-500/30 shadow-lg relative z-10" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-gray-400 text-sm text-center">
            Acceso exclusivo para miembros aprobados de la lista de espera
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-xl p-3 flex items-start gap-3">
            <WifiOff className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
            <div className="text-xs text-red-200">
              <span className="font-bold block mb-1">{t('auth.backendError')}</span>
              {t('auth.backendErrorDesc')}
            </div>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t('auth.email')}</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!isSupabaseConfigured}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 pl-11 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder-gray-700 disabled:opacity-50"
                placeholder="nombre@empresa.com"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t('auth.password')}</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!isSupabaseConfigured}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 pl-11 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder-gray-700 disabled:opacity-50"
                placeholder="••••••••"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 flex items-start gap-2 text-red-400 text-sm">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-3 text-base mt-2 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all"
            isLoading={loading}
            disabled={!isSupabaseConfigured}
          >
            {t('auth.loginBtn')}
          </Button>
        </form>
      </div>
    </div>
  );
};