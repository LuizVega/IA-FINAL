import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Search, MapPin, ShoppingBag, Loader2, Phone, X, CheckCircle, ChevronRight, Store } from 'lucide-react';

// Modal shown after a few seconds inside a vendor stall
const PhoneModal: React.FC<{ shopName: string; onClose: () => void; onJoin: (phone: string, name: string) => void }> = ({ shopName, onClose, onJoin }) => {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [step, setStep] = useState<'prompt' | 'success'>('prompt');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep('success');
            onJoin(phone, name);
        }, 1200);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-end justify-center animate-in fade-in duration-300" onClick={onClose}>
            <div className="w-full max-w-lg bg-[#111] rounded-t-[40px] border-t border-white/10 shadow-2xl p-8 animate-in slide-in-from-bottom duration-500" onClick={e => e.stopPropagation()}>
                {step === 'prompt' ? (
                    <form onSubmit={handleSubmit}>
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8"></div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center">
                                <Phone size={28} className="text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white leading-tight">¡Únete al Pasaporte!</h3>
                                <p className="text-white/40 text-sm">{shopName} quiere tenerte en su radar.</p>
                            </div>
                        </div>
                        <p className="text-white/40 text-sm mb-6 leading-relaxed">
                            Sin cuentas ni contraseñas. Solo tu nombre y número de WhatsApp para recibir ofertas y acumular sellos de esta tienda.
                        </p>
                        <div className="space-y-3 mb-6">
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                placeholder="Tu nombre"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-green-500 outline-none placeholder-white/20 font-medium"
                            />
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    required
                                    placeholder="Tu número de WhatsApp"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pl-14 text-white focus:border-green-500 outline-none placeholder-white/20 font-medium"
                                />
                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-green-500 text-black font-black text-lg rounded-2xl shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <>Conectar mi WhatsApp <ChevronRight size={20} /></>}
                        </button>
                        <button onClick={onClose} className="w-full mt-3 py-3 text-white/30 text-sm font-medium">
                            Ahora no
                        </button>
                    </form>
                ) : (
                    <div className="flex flex-col items-center text-center py-4">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
                            <CheckCircle size={40} className="text-green-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">¡Ya estás conectado!</h3>
                        <p className="text-white/40 text-sm mb-8">Recibirás actualizaciones de <b className="text-white">{shopName}</b> en tu WhatsApp.</p>
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-white text-black font-black rounded-2xl active:scale-[0.98] transition-all"
                        >
                            Comenzar a explorar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// A vendor stall card
const StallCard: React.FC<{ vendor: any; onClick: () => void }> = ({ vendor, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-left bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-xl active:scale-[0.98] transition-all group hover:border-white/10"
    >
        <div className="h-32 bg-gradient-to-br from-green-900/30 to-black relative overflow-hidden">
            {vendor.storeLogo ? (
                <img src={vendor.storeLogo} alt={vendor.companyName} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Store size={48} className="text-white/10" />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-3 left-4">
                <div className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-black px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    ACTIVO
                </div>
            </div>
        </div>
        <div className="p-5">
            <h3 className="text-white font-black text-lg mb-1 truncate">{vendor.companyName || 'Puesto sin nombre'}</h3>
            <p className="text-white/30 text-sm line-clamp-2 mb-4">{vendor.storeDescription || 'Explora su catálogo y haz tu pedido.'}</p>
            <div className="flex items-center justify-between">
                <span className="text-white/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={10} /> Feria MyMorez
                </span>
                <span className="text-green-400 text-xs font-black flex items-center gap-1">
                    Ver Tienda <ChevronRight size={12} />
                </span>
            </div>
        </div>
    </button>
);

export const FairCustomerView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeVendor, setActiveVendor] = useState<any>(null);
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [hasJoined, setHasJoined] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchVendors = async () => {
            const mockVendors = [
                { id: 'mock-1', companyName: 'Puesto La Quinta', storeDescription: 'Merch de tus bandas favoritas, posters retro y stickers únicos.', isMock: true, primaryColor: '#f59e0b', storeLogo: null },
                { id: 'mock-2', companyName: 'El Rincón del Coleccionista', storeDescription: 'Figuras de acción, cartas raras y tesoros para verdaderos fans.', isMock: true, primaryColor: '#3b82f6', storeLogo: null },
                { id: 'mock-3', companyName: 'Artesanías El Sol', storeDescription: 'Tejidos hechos a mano y joyería tradicional de plata.', isMock: true, primaryColor: '#ec4899', storeLogo: null },
            ];

            if (!isSupabaseConfigured) {
                setVendors([
                    ...mockVendors,
                    { id: '1', companyName: 'Boutique Aurora', storeDescription: 'Moda femenina elegante y accesorios únicos.', primaryColor: '#f59e0b', storeLogo: null },
                    { id: '2', companyName: 'Tech & Gadgets Pro', storeDescription: 'Los últimos gadgets y accesorios tecnológicos.', primaryColor: '#3b82f6', storeLogo: null },
                ]);
                setLoading(false);
                return;
            }

            try {
                // Fetch all vendors with a company name (no inventory filtering)
                const { data } = await supabase
                    .from('profiles')
                    .select('id, company_name, store_description, store_logo')
                    .not('company_name', 'is', null)
                    .neq('company_name', 'Mi Tienda')
                    .limit(100);

                if (data) {
                    const fetched = data.map(p => ({
                        id: p.id,
                        companyName: p.company_name,
                        storeDescription: p.store_description,
                        storeLogo: p.store_logo,
                    }));
                    setVendors([...mockVendors, ...fetched]);
                } else {
                    setVendors(mockVendors);
                }
            } catch (e) {
                setVendors(mockVendors);
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, []);

    const filtered = vendors.filter(v =>
        !search || (v.companyName || '').toLowerCase().includes(search.toLowerCase()) || (v.storeDescription || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleEnterStall = (vendor: any) => {
        setActiveVendor(vendor);
        // Show phone modal after 2.5 seconds
        if (!hasJoined[vendor.id]) {
            setTimeout(() => setShowPhoneModal(true), 2500);
        }
    };

    if (activeVendor) {
        return (
            <div className="min-h-screen bg-black text-white font-sans">
                {/* If they chose a vendor, show the storefront */}
                <header className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-4">
                    <button
                        onClick={() => { setActiveVendor(null); setShowPhoneModal(false); }}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 shrink-0 active:scale-90 transition-all"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-green-500/20 border border-green-500/20 flex items-center justify-center shrink-0">
                            <Store size={16} className="text-green-400" />
                        </div>
                        <span className="text-white font-black truncate">{activeVendor.companyName}</span>
                    </div>
                    {hasJoined[activeVendor.id] && (
                        <span className="ml-auto text-green-400 text-xs font-bold flex items-center gap-1 shrink-0">
                            <CheckCircle size={12} /> Conectado
                        </span>
                    )}
                </header>
                <div className="pt-20 flex flex-col items-center justify-center min-h-screen text-center px-8">
                    <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10">
                        <Store size={48} className="text-white/20" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-3">{activeVendor.companyName}</h2>
                    <p className="text-white/30 text-sm mb-8 max-w-xs">{activeVendor.storeDescription || 'Catálogo cargando...'}</p>
                    <a
                        href={`/store/${activeVendor.id}`}
                        className="inline-flex items-center gap-2 bg-green-500 text-black font-black px-8 py-4 rounded-2xl shadow-lg shadow-green-500/20 text-lg active:scale-95 transition-all"
                    >
                        <ShoppingBag size={20} />
                        Ver Catálogo
                    </a>
                </div>

                {showPhoneModal && !hasJoined[activeVendor.id] && (
                    <PhoneModal
                        shopName={activeVendor.companyName}
                        onClose={() => setShowPhoneModal(false)}
                        onJoin={(p, n) => {
                            setHasJoined(prev => ({ ...prev, [activeVendor.id]: true }));
                            setTimeout(() => setShowPhoneModal(false), 1500);
                        }}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-2xl mx-auto px-5 pt-12 pb-5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-1">🎪 Feria en Vivo</p>
                            <h1 className="text-3xl font-black text-white italic">Elige tu Puesto</h1>
                        </div>
                        <button onClick={onBack} className="text-white/30 text-xs font-bold hover:text-white transition-colors">
                            Soy Vendedor →
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar tienda o producto..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pl-12 text-white focus:border-green-500 outline-none placeholder-white/20 font-medium transition-colors"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    </div>
                </div>
            </header>

            {/* Vendor Grid */}
            <main className="max-w-2xl mx-auto px-5 py-6 pb-24">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-white/20">
                        <Loader2 size={40} className="animate-spin mb-4" />
                        <p className="text-sm font-bold">Cargando puestos...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-white/20">
                        <Store size={48} className="mx-auto mb-4" />
                        <p className="font-bold">No se encontraron puestos.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filtered.map(vendor => (
                            <StallCard
                                key={vendor.id}
                                vendor={vendor}
                                onClick={() => handleEnterStall(vendor)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
