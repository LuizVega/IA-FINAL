
import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Button } from './ui/Button';
import { Mail, Lock, Loader2, ArrowRight, Sparkles, AlertCircle, WifiOff } from 'lucide-react';

export const AuthView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
        // Mock Login for Demo
        setTimeout(() => {
            alert("Modo Demo: Ingresando sin backend. Los cambios no se guardarán.");
            // Trigger a page reload or let App.tsx handle state based on session check loop
            window.location.reload(); 
        }, 1000);
        return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("¡Registro exitoso! Por favor inicia sesión.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
             <div className="absolute inset-0 bg-green-500/30 blur-xl rounded-full"></div>
             <img 
               src="https://media.discordapp.net/attachments/1392377430030811289/1470252808837136589/WhatsApp_Image_2026-02-08_at_9.59.30_PM.jpeg?ex=698a9f21&is=69894da1&hm=e8fe7fa45567bf2709c0a28d6133cd5a49dfe778229ea289d92b03b717509c07&=&format=webp"
               alt="ExO Logo"
               className="w-16 h-16 rounded-full relative z-10 border-2 border-white/10 shadow-lg object-cover"
             />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">ExO</h1>
          <p className="text-gray-400 text-sm">Sistema de Inventario Inteligente</p>
        </div>

        {!isSupabaseConfigured && (
            <div className="mb-6 bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                <WifiOff className="text-amber-500 mt-0.5 flex-shrink-0" size={18} />
                <div className="text-sm text-amber-200">
                    <span className="font-bold block mb-1">Sin Conexión a Base de Datos</span>
                    El sistema funcionará en <span className="font-bold text-white">Modo Demo Local</span>. Los datos no se guardarán al recargar.
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
                required={isSupabaseConfigured}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 pl-11 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder-gray-700"
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
                required={isSupabaseConfigured}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 pl-11 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder-gray-700"
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
            className="w-full py-3.5 text-base mt-4 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all"
            isLoading={loading}
          >
            {isSupabaseConfigured ? (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta') : 'Ingresar (Modo Demo)'}
          </Button>
        </form>

        {isSupabaseConfigured && (
            <div className="mt-6 text-center">
            <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-500 hover:text-green-400 transition-colors"
            >
                {isLogin ? (
                <>¿No tienes cuenta? <span className="font-bold underline decoration-green-500/50">Regístrate gratis</span></>
                ) : (
                <>¿Ya tienes cuenta? <span className="font-bold underline decoration-green-500/50">Inicia sesión</span></>
                )}
            </button>
            </div>
        )}

        {isSupabaseConfigured && !isLogin && (
           <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-gray-600 uppercase tracking-widest font-bold">
              <Sparkles size={12} className="text-purple-500" />
              Incluye 3 meses de plan Growth
           </div>
        )}
      </div>
    </div>
  );
};
