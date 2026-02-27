import React, { useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
    Store, ShoppingBag, User, Search, Phone,
    CheckCircle, ChevronRight, Loader2, ArrowLeft,
    Zap, Lock, QrCode, Plus, Minus
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import { WhatsAppHelpButton } from './WhatsAppHelpButton';
import { CartDrawer } from './CartDrawer';
import { useStore } from '../store';

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────
export interface CustomerSession {
    name: string;
    phone: string;
    joinedStalls: Record<string, {
        stallName: string;
        joinedAt: string;
        morezCoins: number;
        purchases: number;
    }>;
}

const STORAGE_KEY = 'mymorez_customer_session';

const loadSession = (): CustomerSession | null => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
    catch { return null; }
};

const saveSession = (s: CustomerSession) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
};

// ─────────────────────────────────────────────────────
// PhoneOnboarding
// ─────────────────────────────────────────────────────
const PhoneOnboarding: React.FC<{ onDone: (s: CustomerSession) => void }> = ({ onDone }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            const session: CustomerSession = { name, phone, joinedStalls: {} };
            saveSession(session);
            onDone(session);
        }, 800);
    };

    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-end pb-safe font-sans">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-green-500/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Top branding */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8 text-center">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full scale-150"></div>
                    <AppLogo className="w-16 h-16 relative z-10" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-3">Tu Pasaporte</h1>
                <p className="text-white/40 text-base leading-relaxed max-w-xs">
                    Accede a todas las tiendas, acumula Morez y canjea recompensas exclusivas.
                </p>

                <div className="mt-8 flex gap-6">
                    {[
                        { icon: '🏪', label: 'Tiendas' },
                        { icon: '🪙', label: 'Morez' },
                        { icon: '🎁', label: 'Premios' },
                    ].map(item => (
                        <div key={item.label} className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl">{item.icon}</div>
                            <span className="text-white/30 text-xs font-bold">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form panel */}
            <div className="relative z-10 w-full bg-[#111] rounded-t-[40px] border-t border-white/10 shadow-2xl p-8">
                <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-8"></div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Tu Nombre</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            placeholder="Ej: María García"
                            className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-medium focus:border-green-500 outline-none placeholder-white/20 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">WhatsApp</label>
                        <div className="relative mt-1.5">
                            <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                required
                                placeholder="Tu número"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pl-14 text-white font-medium focus:border-green-500 outline-none placeholder-white/20 transition-colors"
                            />
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-green-500 text-black font-black text-lg rounded-2xl shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70 mt-2"
                    >
                        {loading
                            ? <Loader2 size={22} className="animate-spin" />
                            : <><span>Entrar a la Feria</span> <ChevronRight size={20} /></>}
                    </button>
                </form>
                <p className="text-center text-white/20 text-xs mt-4">Solo una vez. Sin contraseñas.</p>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────
// Mock Data for Invented Stores
// ─────────────────────────────────────────────────────
const MOCK_PRODUCTS: Record<string, any[]> = {
    'mock-1': [
        { id: 'm1-1', name: 'Polera Nirvana Smiles', price: 45, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400' },
        { id: 'm1-2', name: 'Poster Retro Pulp Fiction', price: 25, image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400' },
        { id: 'm1-3', name: 'Pack stickers Rock 90s', price: 15, image: 'https://images.unsplash.com/photo-1572375927502-132cfc2965ea?w=400' },
    ],
    'mock-2': [
        { id: 'm2-1', name: 'Figura Batman Arkham', price: 120, image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=400' },
        { id: 'm2-2', name: 'Carta Charizard Holográfica', price: 350, image: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400' },
        { id: 'm2-3', name: 'Funko Pop Mandalorian', price: 65, image: 'https://images.unsplash.com/photo-1594465919760-441fe5908ab0?w=400' },
    ],
    'mock-3': [
        { id: 'm3-1', name: 'Manta Alpaca Premium', price: 85, image: 'https://images.unsplash.com/photo-1520038410233-7141be7e6f97?w=400' },
        { id: 'm3-2', name: 'Anillo de Plata Sol Inca', price: 55, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400' },
        { id: 'm3-3', name: 'Chullo Tejido a Mano', price: 20, image: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=400' },
    ]
};

// ─────────────────────────────────────────────────────
// TIENDAS TAB
// ─────────────────────────────────────────────────────
const TiendasTab: React.FC<{ session: CustomerSession; onUpdateSession: (s: CustomerSession) => void }> = ({ session, onUpdateSession }) => {
    const {
        isCartOpen,
        setIsCartOpen,
        cart,
        addToCart,
        confirmInStallPurchase
    } = useStore();

    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeVendor, setActiveVendor] = useState<any>(null);
    const [showJoinModal, setShowJoinModal] = useState(false);

    useEffect(() => {
        const fetchVendors = async () => {
            if (!isSupabaseConfigured) {
                setVendors([
                    { id: 'v1', companyName: 'Boutique Aurora', storeDescription: 'Moda femenina elegante y accesorios selectos.', storeLogo: null },
                    { id: 'v2', companyName: 'Tech & Gadgets Pro', storeDescription: 'Los últimos gadgets y accesorios al mejor precio.', storeLogo: null },
                    { id: 'v3', companyName: 'Dulces Artesanales', storeDescription: 'Postres hechos a mano con recetas familiares.', storeLogo: null },
                ]);
                setLoading(false);
                return;
            }
            try {
                // Fetch all vendors who have a company name
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('id, company_name, store_description, store_logo, whatsapp_number')
                    .not('company_name', 'is', null)
                    .neq('company_name', 'Mi Tienda')
                    .limit(100);

                if (profileData) {
                    const fetchedVendors = profileData.map((p: any) => ({
                        id: p.id,
                        companyName: p.company_name,
                        storeDescription: p.store_description,
                        storeLogo: p.store_logo,
                        whatsapp_number: p.whatsapp_number
                    }));
                    setVendors(fetchedVendors);
                } else {
                    setVendors([]);
                }
            } catch {
                setVendors([]);
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, []);

    const filtered = vendors.filter(v => !search || (v.companyName || '').toLowerCase().includes(search.toLowerCase()));
    const isJoined = (id: string) => !!session.joinedStalls[id];

    const handleJoin = () => {
        if (!activeVendor) return;
        const updated: CustomerSession = {
            ...session,
            joinedStalls: {
                ...session.joinedStalls,
                [activeVendor.id]: {
                    stallName: activeVendor.companyName,
                    joinedAt: new Date().toISOString(),
                    morezCoins: 0,
                    purchases: 0,
                }
            }
        };
        saveSession(updated);
        onUpdateSession(updated);
        setShowJoinModal(false);
    };

    if (activeVendor) {
        const joined = isJoined(activeVendor.id);
        return (
            <div className="flex flex-col min-h-full bg-black">
                <header className="flex items-center gap-3 px-5 pt-14 pb-4">
                    <button onClick={() => setActiveVendor(null)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all">
                        <ArrowLeft size={20} className="text-white" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-white font-black text-lg truncate">{activeVendor.companyName}</h2>
                        <p className="text-white/30 text-xs">Feria MyMorez</p>
                    </div>
                    {joined && (
                        <span className="flex items-center gap-1 text-green-400 text-xs font-black bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                            <CheckCircle size={12} /> Conectado
                        </span>
                    )}
                </header>

                <div className="flex-1 px-5 space-y-4">
                    {/* Store info card */}
                    <div className="bg-[#111] border border-white/5 rounded-3xl p-6">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mb-4">
                            <Store size={32} className="text-white/20" />
                        </div>
                        <h3 className="text-white font-black text-xl mb-2">{activeVendor.companyName}</h3>
                        <p className="text-white/40 text-sm leading-relaxed">{activeVendor.storeDescription || 'Explora su catálogo completo.'}</p>
                    </div>

                    {/* Morez teaser */}
                    <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 rounded-3xl p-5 flex items-center gap-4">
                        <div className="text-3xl">🪙</div>
                        <div>
                            <p className="text-yellow-400 font-black text-sm">Gana Morez aquí</p>
                            <p className="text-white/30 text-xs">1 Morez por cada compra confirmada</p>
                        </div>
                    </div>

                    {/* CTA or Product Listing */}
                    {!joined ? (
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="w-full mt-6 py-4 bg-green-500 text-black font-black text-lg rounded-2xl shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                        >
                            <Zap size={20} fill="black" /> Unirme al Pasaporte
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <h4 className="text-white font-black text-[10px] uppercase tracking-widest mt-8 ml-1 opacity-30">Puesto Destacado</h4>
                            {activeVendor.isMock ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {(MOCK_PRODUCTS[activeVendor.id] || []).map(p => (
                                        <div key={p.id} className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-lg p-2.5">
                                            <img src={p.image} className="w-full h-32 object-cover rounded-2xl mb-3" alt={p.name} />
                                            <h5 className="text-white font-bold text-[13px] truncate px-1">{p.name}</h5>
                                            <div className="flex items-center justify-between px-1 mt-1.5">
                                                <span className="text-green-400 font-black text-sm">S/ {p.price}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(p);
                                                    }}
                                                    className="bg-white/5 p-2 rounded-xl active:scale-90 transition-all"
                                                >
                                                    <Plus size={14} className="text-white/40" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <a
                                    href={`/store/${activeVendor.id}`}
                                    className="block w-full py-4 bg-white text-black font-black text-lg rounded-2xl text-center active:scale-[0.98] transition-all"
                                >
                                    Ir a tienda completa →
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* Join Modal */}
                {showJoinModal && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center" onClick={() => setShowJoinModal(false)}>
                        <div className="w-full bg-[#111] rounded-t-[40px] border-t border-white/10 p-8" onClick={e => e.stopPropagation()}>
                            <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-6"></div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center">
                                    <Zap size={24} className="text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-lg">{activeVendor.companyName}</h3>
                                    <p className="text-white/30 text-sm">Conectar con este puesto</p>
                                </div>
                            </div>
                            <p className="text-white/40 text-sm mb-6">Te añadirán a su lista de clientes frecuentes. Ganarás 1 Morez por compra.</p>
                            <button onClick={handleJoin} className="w-full py-4 bg-green-500 text-black font-black rounded-2xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all">
                                Conectarme como {session.name.split(' ')[0]}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-black min-h-full">
            <div className="px-5 pt-14 pb-4">
                <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-1">🎪 Feria en Vivo</p>
                <h1 className="text-3xl font-black text-white italic">Puestos</h1>
            </div>
            <div className="px-5 pb-4">
                <div className="relative">
                    <input
                        type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar tienda..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 pl-11 text-white text-sm focus:border-green-500 outline-none placeholder-white/20 transition-colors"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                </div>
            </div>
            <div className="px-5 pb-24 space-y-3">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-white/20" /></div>
                ) : filtered.map(vendor => (
                    <button key={vendor.id} onClick={() => {
                        setActiveVendor(vendor);
                        useStore.getState().setShopOwnerId(vendor.id);
                        useStore.getState().updateSettings({
                            companyName: vendor.companyName,
                            whatsappNumber: vendor.whatsapp_number || (vendor.isMock ? '51987654321' : ''),
                            whatsappEnabled: true
                        });
                    }}
                        className="w-full bg-[#111] border border-white/5 rounded-3xl p-5 flex items-center gap-4 active:scale-[0.98] transition-all hover:border-white/10 text-left"
                    >
                        <div className="w-14 h-14 bg-[#1a1a1a] rounded-2xl border border-white/5 flex items-center justify-center shrink-0">
                            {vendor.storeLogo ? <img src={vendor.storeLogo} className="w-full h-full object-cover rounded-2xl" alt="" /> : <Store size={24} className="text-white/20" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-white font-black text-base truncate">{vendor.companyName}</h3>
                                {isJoined(vendor.id) && <CheckCircle size={14} className="text-green-400 shrink-0" />}
                            </div>
                            <p className="text-white/30 text-sm line-clamp-1">{vendor.storeDescription || 'Catálogo disponible'}</p>
                            <div className="flex items-center gap-1 mt-1.5">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">Activo</span>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-white/20 shrink-0" />
                    </button>
                ))}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────
// PREMIOS TAB
// ─────────────────────────────────────────────────────
const PremiosTab: React.FC<{ session: CustomerSession; onUpdateSession: (s: CustomerSession) => void }> = ({ session, onUpdateSession }) => {
    const totalCoins = Object.values(session.joinedStalls).reduce((sum, s) => sum + s.morezCoins, 0);
    const totalPurchases = Object.values(session.joinedStalls).reduce((sum, s) => sum + s.purchases, 0);

    const rewards = [
        { threshold: 5, icon: '🥤', title: 'Bebida Gratis', desc: 'Una bebida de cortesía en el puesto de tu elección.', locked: totalCoins < 5 },
        { threshold: 10, icon: '🥪', title: 'Sandwich Gratis', desc: 'Un sandwich o snack gratis a elección del vendedor.', locked: totalCoins < 10 },
        { threshold: 20, icon: '🎁', title: 'Sorpresa del Puesto', desc: 'Un producto especial gratis elegido por el vendedor.', locked: totalCoins < 20 },
        { threshold: 50, icon: '👑', title: 'Cliente VIP', desc: 'Acceso anticipado a ofertas exclusivas en todas las ferias.', locked: totalCoins < 50 },
    ];

    return (
        <div className="bg-black min-h-full px-5 pt-14 pb-24">
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-1">Tus recompensas</p>
            <h1 className="text-3xl font-black text-white italic mb-8">Premios</h1>

            {/* Morez Balance Card */}
            <div className="bg-gradient-to-br from-yellow-500/15 to-orange-600/5 border border-yellow-500/20 rounded-[32px] p-7 mb-6 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 text-[120px] opacity-10 select-none">🪙</div>
                <p className="text-yellow-400/60 text-xs font-black uppercase tracking-widest mb-2">Balance total</p>
                <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-6xl font-black text-white tracking-tight">{totalCoins}</span>
                    <span className="text-yellow-400 font-black text-xl">Morez</span>
                </div>
                <p className="text-white/30 text-sm">{totalPurchases} compras en {Object.keys(session.joinedStalls).length} puestos</p>

                {/* Progress bar to next reward */}
                <div className="mt-5">
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-white/30 font-bold">{totalCoins}/5 para primer premio</span>
                        <span className="text-yellow-400 font-black">{Math.round((Math.min(totalCoins, 5) / 5) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-700"
                            style={{ width: `${Math.min((totalCoins / 5) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* How to earn */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-5 mb-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl shrink-0">🪙</div>
                <div>
                    <p className="text-white font-black text-sm">¿Cómo ganas Morez?</p>
                    <p className="text-white/30 text-xs leading-relaxed">Cada compra confirmada en cualquier tienda = 1 Morez. ¡Sin límite!</p>
                </div>
            </div>

            {/* Rewards list */}
            <h2 className="text-white font-black text-lg mb-4">Catálogo de Recompensas</h2>
            <div className="space-y-3">
                {rewards.map((r, i) => (
                    <div key={i} className={`relative bg-[#111] border rounded-3xl p-5 flex items-center gap-4 ${r.locked ? 'border-white/5 opacity-60' : 'border-yellow-500/30'}`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${r.locked ? 'bg-white/5' : 'bg-yellow-500/10 border border-yellow-500/20'}`}>
                            {r.locked ? <Lock size={20} className="text-white/20" /> : r.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-white font-black text-sm">{r.title}</p>
                                {!r.locked && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 font-black px-2 py-0.5 rounded-full">Disponible</span>}
                            </div>
                            <p className="text-white/30 text-xs leading-snug">{r.desc}</p>
                            <p className={`text-xs font-black mt-1.5 ${r.locked ? 'text-white/20' : 'text-yellow-400'}`}>{r.threshold} Morez</p>
                        </div>
                        {!r.locked && (
                            <button className="shrink-0 bg-yellow-400 text-black text-xs font-black px-4 py-2 rounded-xl active:scale-95 transition-all">
                                Canjear
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────
// COMPRAS TAB
// ─────────────────────────────────────────────────────
const ComprasTab: React.FC<{ session: CustomerSession; onUpdateSession: (s: CustomerSession) => void }> = ({ session, onUpdateSession }) => {
    const stalls = Object.entries(session.joinedStalls);

    if (stalls.length === 0) {
        return (
            <div className="bg-black min-h-full flex flex-col items-center justify-center px-8 text-center pb-24">
                <div className="text-6xl mb-6">🛍️</div>
                <h2 className="text-white font-black text-2xl mb-3">Sin compras aún</h2>
                <p className="text-white/30 text-sm">Visita las tiendas, únete a su pasaporte y empieza a acumular Morez.</p>
            </div>
        );
    }

    // Simulate adding a purchase
    const handleSimulatePurchase = (stallId: string) => {
        const updated: CustomerSession = {
            ...session,
            joinedStalls: {
                ...session.joinedStalls,
                [stallId]: {
                    ...session.joinedStalls[stallId],
                    morezCoins: session.joinedStalls[stallId].morezCoins + 1,
                    purchases: session.joinedStalls[stallId].purchases + 1,
                }
            }
        };
        saveSession(updated);
        onUpdateSession(updated);
    };

    return (
        <div className="bg-black min-h-full px-5 pt-14 pb-24">
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-1">Historial</p>
            <h1 className="text-3xl font-black text-white italic mb-6">Compras</h1>

            <div className="space-y-3">
                {stalls.map(([id, data]) => (
                    <div key={id} className="bg-[#111] border border-white/5 rounded-3xl p-5">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-white font-black text-base">{data.stallName}</h3>
                                <p className="text-white/30 text-xs mt-0.5">Desde {new Date(data.joinedAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</p>
                            </div>
                            <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full">
                                <span className="text-sm">🪙</span>
                                <span className="text-yellow-400 font-black text-sm">{data.morezCoins}</span>
                            </div>
                        </div>

                        {/* Purchase stamps */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {Array.from({ length: Math.max(data.purchases, 5) }).map((_, i) => (
                                <div key={i} className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm ${i < data.purchases ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-white/10'}`}>
                                    {i < data.purchases ? '✓' : '·'}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <a href={`/store/${id}`} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm font-bold text-center active:scale-[0.98] transition-all">
                                Ver Tienda
                            </a>
                            <button
                                onClick={() => handleSimulatePurchase(id)}
                                className="flex-1 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-sm font-bold active:scale-[0.98] transition-all"
                            >
                                + Simular compra
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────
// PERFIL TAB
// ─────────────────────────────────────────────────────
const PerfilTab: React.FC<{ session: CustomerSession; onLogout: () => void }> = ({ session, onLogout }) => {
    const totalCoins = Object.values(session.joinedStalls).reduce((sum, s) => sum + s.morezCoins, 0);
    const totalPurchases = Object.values(session.joinedStalls).reduce((sum, s) => sum + s.purchases, 0);

    return (
        <div className="bg-black min-h-full px-5 pt-14 pb-24">
            {/* Avatar + name */}
            <div className="flex flex-col items-center text-center mb-10">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500/30 to-green-600/10 border border-green-500/20 rounded-full flex items-center justify-center mb-4 text-4xl font-black text-green-400">
                    {session.name.charAt(0).toUpperCase()}
                </div>
                <h1 className="text-white font-black text-2xl tracking-tight">{session.name}</h1>
                <p className="text-white/30 text-sm mt-1">{session.phone}</p>
                <div className="flex items-center gap-1.5 mt-3 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-full">
                    <span>🪙</span>
                    <span className="text-yellow-400 font-black">{totalCoins} Morez</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                    { label: 'Puestos', value: Object.keys(session.joinedStalls).length },
                    { label: 'Compras', value: totalPurchases },
                    { label: 'Morez', value: totalCoins },
                ].map(stat => (
                    <div key={stat.label} className="bg-[#111] border border-white/5 rounded-2xl p-4 text-center">
                        <p className="text-white font-black text-2xl">{stat.value}</p>
                        <p className="text-white/30 text-xs mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Info rows */}
            <div className="space-y-2 mb-8">
                {[
                    { icon: User, label: 'Nombre', value: session.name },
                    { icon: Phone, label: 'WhatsApp', value: session.phone },
                ].map(row => (
                    <div key={row.label} className="bg-[#111] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                            <row.icon size={18} className="text-white/30" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white/30 text-xs">{row.label}</p>
                            <p className="text-white font-bold text-sm truncate">{row.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={onLogout} className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-400 font-black rounded-2xl active:scale-[0.98] transition-all">
                Salir de mi cuenta
            </button>

            <div className="mt-6 pt-6 border-t border-white/5">
                <WhatsAppHelpButton variant="inline" />
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────
type Tab = 'tiendas' | 'premios' | 'compras' | 'perfil';

const NAV_TABS: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'tiendas', icon: <Store size={22} />, label: 'Tiendas' },
    { id: 'premios', icon: <span className="text-lg leading-none">🪙</span>, label: 'Premios' },
    { id: 'compras', icon: <ShoppingBag size={22} />, label: 'Compras' },
    { id: 'perfil', icon: <User size={22} />, label: 'Perfil' },
];

// ─────────────────────────────────────────────────────
// CartBadge Component
// ─────────────────────────────────────────────────────
export const CartBadge = () => {
    const count = useStore(state => state.cart.reduce((a, b) => a + b.quantity, 0));
    if (count === 0) return null;
    return (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[8px] text-black font-black animate-in zoom-in duration-300 shadow-lg">
            {count}
        </div>
    );
};

export const CustomerApp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [session, setSession] = useState<CustomerSession | null>(() => loadSession());
    const [activeTab, setActiveTab] = useState<Tab>('tiendas');

    const handleSessionUpdate = useCallback((s: CustomerSession) => setSession(s), []);
    const handleLogout = () => {
        localStorage.removeItem(STORAGE_KEY);
        setSession(null);
    };

    if (!session) {
        return <PhoneOnboarding onDone={setSession} />;
    }

    const renderTab = () => {
        switch (activeTab) {
            case 'tiendas': return <TiendasTab session={session} onUpdateSession={handleSessionUpdate} />;
            case 'premios': return <PremiosTab session={session} onUpdateSession={handleSessionUpdate} />;
            case 'compras': return <ComprasTab session={session} onUpdateSession={handleSessionUpdate} />;
            case 'perfil': return <PerfilTab session={session} onLogout={handleLogout} />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black font-sans flex flex-col overflow-hidden">
            {/* Top mode switcher & Cart */}
            <div className="absolute top-6 left-5 right-5 z-50 flex justify-between items-center pointer-events-none">
                <button
                    onClick={onBack}
                    className="bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full hover:text-white transition-colors active:scale-95 pointer-events-auto"
                >
                    ← Vendedor
                </button>

                <button
                    onClick={() => useStore.getState().setIsCartOpen(true)}
                    className="relative bg-white/5 border border-white/10 text-white p-2 rounded-full hover:bg-white/10 transition-colors active:scale-95 pointer-events-auto"
                >
                    <ShoppingBag size={18} />
                    <CartBadge />
                </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
                {renderTab()}
            </div>

            {/* Bottom Tab Bar */}
            <nav className="border-t border-white/5 bg-black/95 backdrop-blur-xl px-2 pt-3 pb-8 flex justify-around items-center safe-bottom shrink-0">
                {NAV_TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-2xl transition-all active:scale-95 ${isActive ? 'text-white' : 'text-white/25'}`}
                        >
                            <div className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                                {tab.icon}
                            </div>
                            <span className={`text-[10px] font-black transition-colors ${isActive ? 'text-white' : 'text-white/25'}`}>
                                {tab.label}
                            </span>
                            {isActive && <div className="w-1 h-1 bg-green-400 rounded-full"></div>}
                        </button>
                    );
                })}
            </nav>

            <CartDrawer
                isOpen={useStore(s => s.isCartOpen)}
                onClose={() => useStore.getState().setIsCartOpen(false)}
                onSuccess={() => {
                    // Logic to award points would go here if needed globally
                }}
            />
        </div>
    );
};
