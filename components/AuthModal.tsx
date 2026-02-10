
import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Button } from './ui/Button';
import { Mail, Lock, AlertCircle, WifiOff, X, Sparkles } from 'lucide-react';
import { useStore } from '../store';
import { AppLogo } from './AppLogo';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setAuthModalOpen } = useStore();
  const [isLogin, setIsLogin] = useState(true);
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
        setError("Error de configuración: No se detectaron las variables de entorno de Supabase (URL y ANON_KEY). Por favor, configúralas para usar el sistema.");
        setLoading(false);
        return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setAuthModalOpen(false); 
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("¡Registro exitoso! Por favor revisa tu correo para confirmar o inicia sesión.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error en la autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
        
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
              {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </h1>
          <p className="text-gray-400 text-sm text-center">
              Accede a tu inventario inteligente en la nube.
          </p>
        </div>

        {!isSupabaseConfigured && (
            <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-xl p-3 flex items-start gap-3">
                <WifiOff className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                <div className="text-xs text-red-200">
                    <span className="font-bold block mb-1">Backend No Detectado</span>
                    Verifica que las variables <code className="bg-black/50 px-1 rounded">SUPABASE_URL</code> y <code className="bg-black/50 px-1 rounded">SUPABASE_ANON_KEY</code> estén correctamente configuradas en tu entorno.
                </div>
            </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
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
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Contraseña</label>
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
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta Gratis'}
          </Button>
        </form>

        <div className="mt-6 text-center">
        <button 
            onClick={() => setIsLogin(!isLogin)}
            disabled={!isSupabaseConfigured}
            className="text-sm text-gray-500 hover:text-green-400 transition-colors disabled:opacity-50"
        >
            {isLogin ? (
            <>¿No tienes cuenta? <span className="font-bold underline decoration-green-500/50">Regístrate gratis</span></>
            ) : (
            <>¿Ya tienes cuenta? <span className="font-bold underline decoration-green-500/50">Inicia sesión</span></>
            )}
        </button>
        </div>

        {!isLogin && (
           <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-gray-600 uppercase tracking-widest font-bold">
              <Sparkles size={12} className="text-purple-500" />
              Incluye 3 meses de plan Growth
           </div>
        )}
      </div>
    </div>
  );
};
