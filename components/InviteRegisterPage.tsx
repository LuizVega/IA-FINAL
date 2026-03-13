import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AppLogo } from './AppLogo';
import { Mail, Lock, User, Briefcase, Sparkles, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

/**
 * InviteRegisterPage — Página de registro exclusivo por invitación.
 * Accesible únicamente copiando y pegando el link (/registro).
 * NO está enlazada desde la landing ni desde ningún lugar público.
 * Una vez registrado el usuario, la sesión de Supabase lo redirige automáticamente al dashboard.
 */
export const InviteRegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password || !name) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            business_name: businessName || name,
          }
        }
      });
      if (signUpError) throw signUpError;
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-green-500/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">

        {/* Invite badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-[11px] font-bold uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Acceso por invitación — Beta cerrada
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-[0_40px_80px_rgba(0,0,0,0.5)] p-8 md:p-10">
          {/* Logo + title */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-green-500/30 blur-xl rounded-full" />
              <AppLogo className="w-16 h-16 border-2 border-green-500/30 shadow-lg relative z-10" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">Crea tu cuenta</h1>
            <p className="text-slate-400 text-sm text-center">
              Fuiste seleccionado para el acceso anticipado a MyMorez.
            </p>
          </div>

          {done ? (
            /* Success state */
            <div className="text-center py-6 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-black text-white mb-3">¡Cuenta creada!</h2>
              <p className="text-slate-400 mb-2">
                Revisa tu email <span className="text-white font-bold">{email}</span> para confirmar tu cuenta.
              </p>
              <p className="text-slate-500 text-sm">
                Una vez confirmado, inicia sesión para acceder a la plataforma.
              </p>
              <a
                href="/"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-green-500/20"
              >
                Ir a MyMorez
                <ArrowRight size={18} />
              </a>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tu Nombre *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Luis Vega"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pl-11 text-white focus:border-green-500/60 focus:ring-1 focus:ring-green-500/40 outline-none transition-all placeholder:text-slate-600"
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                </div>
              </div>

              {/* Business Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre de tu Negocio</label>
                <div className="relative">
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Mi Tiendita (Opcional)"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pl-11 text-white focus:border-green-500/60 focus:ring-1 focus:ring-green-500/40 outline-none transition-all placeholder:text-slate-600"
                  />
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email *</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="tu@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pl-11 text-white focus:border-green-500/60 focus:ring-1 focus:ring-green-500/40 outline-none transition-all placeholder:text-slate-600"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Contraseña *</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pl-11 text-white focus:border-green-500/60 focus:ring-1 focus:ring-green-500/40 outline-none transition-all placeholder:text-slate-600"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-3 flex items-start gap-2 text-red-400 text-sm">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-black font-black text-lg rounded-2xl transition-all shadow-[0_15px_30px_rgba(34,197,94,0.25)] hover:shadow-[0_20px_40px_rgba(34,197,94,0.4)] active:scale-98 flex items-center justify-center gap-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Creando cuenta...
                  </span>
                ) : (
                  <>
                    Crear mi Cuenta
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 uppercase tracking-widest font-bold mt-2">
                <Sparkles size={10} className="text-green-500/50" />
                Incluye 3 meses de plan Growth gratis
              </div>
            </form>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Esta página es exclusiva para invitados de la beta de MyMorez.
        </p>
      </div>
    </div>
  );
};
