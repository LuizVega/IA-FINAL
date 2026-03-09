import React, { useEffect, useState } from 'react';
import { Sparkles, Scan, Zap, Gift, ShoppingBag, Bell } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export const MarqueeFeatures: React.FC = () => {
    const { t } = useTranslation();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check, { passive: true });
        return () => window.removeEventListener('resize', check);
    }, []);

    const upperCards = [
        { title: t('marquee.upper1'), icon: <Zap className="text-green-500 w-8 h-8" /> },
        { title: t('marquee.upper2'), icon: <ShoppingBag className="text-emerald-500 w-8 h-8" /> },
        { title: t('marquee.upper3'), icon: <Scan className="text-teal-500 w-8 h-8" /> },
        { title: t('marquee.upper4'), icon: <Sparkles className="text-green-400 w-8 h-8" /> },
        { title: t('marquee.upper5'), icon: <Bell className="text-lime-500 w-8 h-8" /> },
    ];

    const lowerCards = [
        { title: t('marquee.lower1'), icon: <Scan className="text-green-500 w-8 h-8" /> },
        { title: t('marquee.lower2'), icon: <Gift className="text-emerald-500 w-8 h-8" /> },
        { title: t('marquee.lower3'), icon: <Zap className="text-teal-500 w-8 h-8" /> },
        { title: t('marquee.lower4'), icon: <ShoppingBag className="text-green-400 w-8 h-8" /> },
        { title: t('marquee.lower5'), icon: <Sparkles className="text-lime-500 w-8 h-8" /> },
    ];

    // On mobile: 2 clones (10 cards total), smaller cards, no hover effects, no heavy shadows
    // On desktop: 3 clones (15 cards total), full sizing
    const clones = isMobile ? 2 : 3;
    const cardClass = isMobile
        ? "w-44 h-36 bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-end relative overflow-hidden"
        : "w-72 h-48 bg-gradient-to-br from-slate-900 to-[#0a0a0c] border border-white/5 hover:border-green-500/30 rounded-3xl p-6 flex flex-col justify-end relative group overflow-hidden transition-colors";
    const lowerCardClass = isMobile
        ? "w-44 h-36 bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-end relative overflow-hidden"
        : "w-72 h-48 bg-gradient-to-br from-slate-900 to-[#0a0a0c] border border-white/5 hover:border-emerald-500/30 rounded-3xl p-6 flex flex-col justify-end relative group overflow-hidden transition-colors";

    return (
        <section className="py-16 md:py-24 relative overflow-hidden bg-[#020203]">
            {/* Glow — desktop only (blur-[120px] is expensive on mobile) */}
            {!isMobile && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-500/10 blur-[80px] rounded-full pointer-events-none -z-10 translate-z-0"></div>
            )}

            <div className="text-center mb-12 md:mb-16 relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
                    {t('marquee.titlePrefix')}<span className="text-green-500">{t('marquee.titleHighlight')}</span>
                </h2>
            </div>

            <div className="relative flex flex-col gap-5 md:gap-8">

                {/* Upper Marquee (Right to Left) */}
                <div className="flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] will-change-transform">
                    <div className="flex shrink-0 gap-4 md:gap-6 w-max animate-marquee-left">
                        {Array.from({ length: clones }, () => upperCards).flat().map((card, i) => (
                            <div
                                key={i}
                                className={cardClass}
                                style={!isMobile ? { boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)' } : undefined}
                            >
                                <div className={`absolute top-4 left-4 md:top-6 md:left-6 opacity-80 ${!isMobile ? 'group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500' : ''}`}>
                                    <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full bg-gradient-to-b from-green-500/20 to-transparent flex items-center justify-center border border-green-500/20`}>
                                        {card.icon}
                                    </div>
                                </div>
                                <h3 className={`text-white font-bold ${isMobile ? 'text-sm' : 'text-lg'} mt-auto z-10`}>{card.title}</h3>
                                {!isMobile && <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/5 transition-colors duration-500"></div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lower Marquee (Left to Right) */}
                <div className="flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] will-change-transform">
                    <div className="flex shrink-0 gap-4 md:gap-6 w-max animate-marquee-right">
                        {Array.from({ length: clones }, () => lowerCards).flat().map((card, i) => (
                            <div
                                key={i}
                                className={lowerCardClass}
                                style={!isMobile ? { boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)' } : undefined}
                            >
                                <div className={`absolute top-4 left-4 md:top-6 md:left-6 opacity-80 ${!isMobile ? 'group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500' : ''}`}>
                                    <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full bg-gradient-to-b from-emerald-500/20 to-transparent flex items-center justify-center border border-emerald-500/20`}>
                                        {card.icon}
                                    </div>
                                </div>
                                <h3 className={`text-white font-bold ${isMobile ? 'text-sm' : 'text-lg'} mt-auto z-10`}>{card.title}</h3>
                                {!isMobile && <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-500"></div>}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};
