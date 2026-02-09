
import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Button } from './ui/Button';
import { User, LogOut, Shield, Mail, CreditCard, Key, AlertTriangle, Sparkles, Rocket, Crown } from 'lucide-react';
import { useStore } from '../store';

export const ProfileView: React.FC = () => {
  const { session, setAuthModalOpen } = useStore();
  const [userEmail, setUserEmail] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      setUserEmail(session.user.email || 'No email');
      setUserId(session.user.id);
    }
  }, [session]);

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
        alert("Error al enviar correo: " + error.message);
    } else {
        alert(`Se ha enviado un correo de recuperación a ${userEmail}`);
    }
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
              Únete a <span className="text-green-500">ExO</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-lg mb-10 leading-relaxed">
              Lleva el control de tu inventario al siguiente nivel con Inteligencia Artificial.
              Guarda tus datos en la nube y accede desde cualquier lugar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-10">
              <div className="bg-[#111] p-5 rounded-2xl border border-white/5 flex items-center gap-4 text-left">
                  <div className="bg-green-900/20 p-3 rounded-lg text-green-400"><Sparkles size={20}/></div>
                  <div>
                      <h4 className="font-bold text-white">IA Integrada</h4>
                      <p className="text-xs text-gray-500">Reconocimiento automático de productos.</p>
                  </div>
              </div>
              <div className="bg-[#111] p-5 rounded-2xl border border-white/5 flex items-center gap-4 text-left">
                  <div className="bg-purple-900/20 p-3 rounded-lg text-purple-400"><Crown size={20}/></div>
                  <div>
                      <h4 className="font-bold text-white">Oferta Exclusiva</h4>
                      <p className="text-xs text-gray-500">3 meses gratis del plan Growth al registrarte.</p>
                  </div>
              </div>
          </div>

          <Button 
             onClick={() => setAuthModalOpen(true)}
             className="px-10 py-4 text-lg bg-green-500 hover:bg-green-400 text-black font-bold shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transform hover:scale-105 transition-all"
          >
              Crear Cuenta Gratis
          </Button>
          <p className="mt-4 text-sm text-gray-500">
              ¿Ya tienes cuenta? <button onClick={() => setAuthModalOpen(true)} className="text-green-500 hover:underline">Inicia Sesión</button>
          </p>
      </div>
    );
  }

  // ---------------- LOGGED IN VIEW ----------------
  return (
    <div className="p-6 max-w-4xl mx-auto h-full overflow-y-auto custom-scrollbar">
      <h2 className="text-3xl font-bold text-white mb-2">Mi Perfil</h2>
      <p className="text-gray-500 mb-8">Administra tu cuenta y preferencias de seguridad.</p>

      {/* User Card */}
      <div className="bg-[#111] rounded-3xl border border-white/5 p-8 mb-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
         
         <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 to-black border-2 border-white/10 flex items-center justify-center shadow-2xl">
                <span className="text-3xl font-bold text-gray-400">
                    {userEmail.substring(0, 2).toUpperCase()}
                </span>
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-1">
                <h3 className="text-2xl font-bold text-white">Administrador</h3>
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400">
                    <Mail size={16} />
                    <span>{userEmail}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-gray-600 font-mono mt-2">
                    ID: {userId}
                </div>
                <div className="pt-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold uppercase tracking-wider">
                        <Sparkles size={12} /> Plan Starter
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
                 <Button variant="secondary" onClick={handleSignOut} isLoading={loading} icon={<LogOut size={16}/>}>
                    Cerrar Sesión
                 </Button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Security */}
          <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-blue-500" /> Seguridad
              </h3>
              
              <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                          <div className="bg-gray-800 p-2 rounded-lg text-gray-400">
                              <Key size={18} />
                          </div>
                          <div>
                              <p className="text-sm font-medium text-white">Contraseña</p>
                              <p className="text-xs text-gray-500">Gestionada por Supabase</p>
                          </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleResetPassword}>Cambiar</Button>
                  </div>
              </div>
          </div>

           {/* Subscription */}
           <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CreditCard size={20} className="text-purple-500" /> Suscripción
              </h3>
              
              <div className="bg-gradient-to-br from-[#111] to-black p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Plan Actual</p>
                          <p className="text-xl font-bold text-white mt-1">Starter Free</p>
                      </div>
                      <span className="text-2xl font-bold text-gray-600">$0</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-2">
                      <div className="bg-green-500 h-full w-[10%]"></div>
                  </div>
                  <p className="text-xs text-gray-500">Renovación automática: Nunca</p>
                  
                  <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                      <Button size="sm" className="w-full text-xs" variant="secondary">Gestionar Plan</Button>
                  </div>
              </div>
          </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="mt-8 bg-amber-900/10 border border-amber-900/30 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="text-amber-500 flex-shrink-0" size={20} />
            <div>
                <h4 className="text-amber-500 font-bold text-sm">Modo Demostración</h4>
                <p className="text-amber-200/70 text-xs mt-1">
                    Estás utilizando una versión local de prueba. Las funciones de autenticación (cambio de contraseña, persistencia de sesión real) están simuladas.
                </p>
            </div>
        </div>
      )}
    </div>
  );
};
