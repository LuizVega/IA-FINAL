import React, { useState } from 'react';
import { AppLogo } from './AppLogo';
import { CustomerApp } from './CustomerApp';
import { LandingPage } from './LandingPage';
import { WhatsAppHelpButton } from './WhatsAppHelpButton';
import {
    ShoppingBag, ArrowRight, Zap, QrCode, Users, Star,
    MapPin, ChevronRight, StoreIcon
} from 'lucide-react';

interface LandingGatewayProps { onEnterDemo: () => void; }
type GatewayMode = 'choose' | 'customer' | 'vendor';
const GATEWAY_MODE_KEY = 'mymorez_gateway_mode';

const PARTNER_FERIAS = [
    { name: 'FeriaPlanet', emoji: '🌍', note: 'Lima, Perú' },
    { name: 'Alameda Fest', emoji: '🎪', note: 'San Isidro, Lima' },
    { name: 'Feria Fortuna', emoji: '🍀', note: 'Miraflores, Lima' },
];

export const LandingGateway: React.FC<LandingGatewayProps> = ({ onEnterDemo }) => {
    const [mode, setMode] = useState<GatewayMode>(() => {
        const saved = localStorage.getItem(GATEWAY_MODE_KEY) as GatewayMode | null;
        return (saved === 'customer' || saved === 'vendor') ? saved : 'choose';
    });
    const [isExiting, setIsExiting] = useState(false);

    const navigate = (target: GatewayMode) => {
        if (target !== 'choose') localStorage.setItem(GATEWAY_MODE_KEY, target);
        setIsExiting(true);
        setTimeout(() => { setMode(target); setIsExiting(false); }, 250);
    };

    if (mode === 'customer') return <CustomerApp onBack={() => navigate('choose')} />;

    if (mode === 'vendor') {
        return <LandingPage onEnterDemo={onEnterDemo} onSwitchToCustomer={() => navigate('customer')} />;
    }

    // ── CUSTOMER-FOCUSED GATEWAY LANDING ─────────────────────────────────────
    return (
        <div className={`fixed inset-0 bg-black font-sans overflow-y-auto transition-opacity duration-250 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            <WhatsAppHelpButton variant="fixed" className="bottom-4" />

            {/* ── HERO ─────────────────────────────────────────────── */}
            <div className="relative min-h-screen flex flex-col items-center justify-center px-5 py-20">
                {/* Background glows */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[140px]"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]"></div>
                </div>

                {/* Logo + header */}
                <div className="relative z-10 text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-500/30 blur-xl rounded-full scale-150"></div>
                            <AppLogo className="w-12 h-12 relative z-10" />
                        </div>
                        <span className="text-white font-black text-2xl tracking-tight">MyMorez</span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-1.5 rounded-full mb-6">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-green-400 text-xs font-black uppercase tracking-widest">Ferias en Vivo</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-[1.1] mb-4">
                        El Pasaporte Digital<br />
                        <span className="text-green-400">de las Ferias</span>
                    </h1>
                    <p className="text-white/40 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                        Explora todos los puestos, acumula <span className="text-yellow-400 font-bold">Morez</span> con cada compra y canjea premios en cientos de ferias.
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className="relative z-10 w-full max-w-sm space-y-3 mb-16">
                    <button
                        onClick={() => navigate('customer')}
                        className="w-full group flex items-center justify-between bg-green-500 hover:bg-green-400 text-black p-5 rounded-[24px] shadow-2xl shadow-green-500/30 active:scale-[0.97] transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-black/15 rounded-xl flex items-center justify-center">
                                <ShoppingBag size={26} className="text-white" />
                            </div>
                            <div className="text-left">
                                <p className="font-black text-xl text-black">Entrar como Cliente</p>
                                <p className="text-black/60 text-xs font-medium">Explora · Acumula Morez · Gana</p>
                            </div>
                        </div>
                        <ArrowRight size={22} className="text-black/60 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => navigate('vendor')}
                        className="w-full group flex items-center justify-between bg-[#111] border border-white/10 hover:border-white/20 p-5 rounded-[24px] active:scale-[0.97] transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                <Users size={26} className="text-white" />
                            </div>
                            <div className="text-left">
                                <p className="font-black text-xl text-white">Soy Vendedor</p>
                                <p className="text-white/30 text-xs font-medium">QR · Panel · CRM Gratis</p>
                            </div>
                        </div>
                        <ArrowRight size={22} className="text-white/20 group-hover:translate-x-1 group-hover:text-white/50 transition-all" />
                    </button>
                </div>

                {/* Benefits row */}
                <div className="relative z-10 flex flex-wrap gap-4 justify-center max-w-md">
                    {[
                        { emoji: '🪙', text: 'Morez por compra' },
                        { emoji: '🥤', text: 'Bebida gratis' },
                        { emoji: '🎁', text: 'Premios canjeable' },
                        { emoji: '📲', text: 'Sin contraseñas' },
                    ].map(b => (
                        <div key={b.text} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-full">
                            <span className="text-sm">{b.emoji}</span>
                            <span className="text-white/50 text-xs font-bold">{b.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── PARTNER FERIAS SECTION ────────────────────────────── */}
            <div className="px-5 py-16 border-t border-white/5">
                <div className="max-w-2xl mx-auto">
                    <p className="text-white/30 text-xs font-black uppercase tracking-widest text-center mb-2">Red de Ferias</p>
                    <h2 className="text-white font-black text-3xl text-center mb-3 tracking-tight">
                        Ya estamos en las<br /><span className="text-green-400">mejores ferias</span>
                    </h2>
                    <p className="text-white/30 text-sm text-center max-w-xs mx-auto mb-10">
                        MyMorez trabaja con FeriaPlanet, Alameda Fest, Feria Fortuna y decenas de ferias más en todo Perú y LATAM.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        {PARTNER_FERIAS.map(f => (
                            <div key={f.name} className="flex items-center gap-3 bg-[#111] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all">
                                <span className="text-2xl">{f.emoji}</span>
                                <div className="min-w-0">
                                    <p className="text-white font-black text-sm truncate">{f.name}</p>
                                    <p className="text-white/30 text-xs flex items-center gap-1">
                                        <MapPin size={9} /> {f.note}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 text-center">
                        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full">
                            <Zap size={14} className="text-green-400" />
                            <span className="text-green-400 text-sm font-black">+50 ferias más en toda LATAM</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
            <div className="px-5 py-16 border-t border-white/5">
                <div className="max-w-2xl mx-auto">
                    <p className="text-white/30 text-xs font-black uppercase tracking-widest text-center mb-2">¿Cómo funciona?</p>
                    <h2 className="text-white font-black text-3xl text-center mb-10 tracking-tight">Simple como 1, 2, 3</h2>

                    <div className="space-y-4">
                        {[
                            { step: '01', emoji: '📲', title: 'Entra con tu WhatsApp', desc: 'Solo tu nombre y número. Sin contraseñas ni emails.' },
                            { step: '02', emoji: '🏪', title: 'Explora los puestos', desc: 'Navega todos los vendedores de la feria y elige tus favoritos.' },
                            { step: '03', emoji: '🪙', title: 'Acumula Morez', desc: 'Cada compra suma 1 Morez. Canjéalos por bebidas, snacks y más.' },
                        ].map(s => (
                            <div key={s.step} className="flex items-start gap-5 bg-[#111] border border-white/5 rounded-3xl p-5">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 font-black text-xs shrink-0 border border-white/10">{s.step}</div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">{s.emoji}</span>
                                        <p className="text-white font-black text-base">{s.title}</p>
                                    </div>
                                    <p className="text-white/30 text-sm leading-relaxed">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── FINAL CTA ───────────────────────────────────────────────── */}
            <div className="px-5 py-16 border-t border-white/5">
                <div className="max-w-sm mx-auto text-center">
                    <h2 className="text-white font-black text-3xl mb-4">¿Listo para explorar?</h2>
                    <p className="text-white/30 text-sm mb-8">Sin registro tedioso. Solo tú y las mejores ferias de la región.</p>
                    <button
                        onClick={() => navigate('customer')}
                        className="w-full py-5 bg-green-500 text-black font-black text-xl rounded-2xl shadow-2xl shadow-green-500/20 active:scale-[0.98] transition-all"
                    >
                        Entrar ahora →
                    </button>
                    <button onClick={() => navigate('vendor')} className="mt-4 text-white/20 text-xs font-bold hover:text-white/40 transition-colors">
                        Soy vendedor →
                    </button>
                </div>
            </div>
        </div>
    );
};
