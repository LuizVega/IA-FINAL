import React from 'react';
import { Sparkles, Scan, Zap, Gift, ShoppingBag, Bell } from 'lucide-react';

import { useTranslation } from '../hooks/useTranslation';

export const MarqueeFeatures: React.FC = () => {
    const { t } = useTranslation();

    const upperCards = [
        {
            title: t('marquee.upper1'),
            icon: <Zap className="text-green-500 w-10 h-10" />,
        },
        {
            title: t('marquee.upper2'),
            icon: <ShoppingBag className="text-emerald-500 w-10 h-10" />,
        },
        {
            title: t('marquee.upper3'),
            icon: <Scan className="text-teal-500 w-10 h-10" />,
        },
        {
            title: t('marquee.upper4'),
            icon: <Sparkles className="text-green-400 w-10 h-10" />,
        },
        {
            title: t('marquee.upper5'),
            icon: <Bell className="text-lime-500 w-10 h-10" />,
        },
    ];

    const lowerCards = [
        {
            title: t('marquee.lower1'),
            icon: <Scan className="text-green-500 w-10 h-10" />,
        },
        {
            title: t('marquee.lower2'),
            icon: <Gift className="text-emerald-500 w-10 h-10" />,
        },
        {
            title: t('marquee.lower3'),
            icon: <Zap className="text-teal-500 w-10 h-10" />,
        },
        {
            title: t('marquee.lower4'),
            icon: <ShoppingBag className="text-green-400 w-10 h-10" />,
        },
        {
            title: t('marquee.lower5'),
            icon: <Sparkles className="text-lime-500 w-10 h-10" />,
        },
    ];

    return (
        <section className="py-24 relative overflow-hidden bg-[#020203]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

            <div className="text-center mb-16 relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">{t('marquee.titlePrefix')}<span className="text-green-500">{t('marquee.titleHighlight')}</span></h2>
            </div>

            <div className="relative flex flex-col gap-8">

                {/* Upper Marquee (Right to Left) */}
                <div className="flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                    <div className="flex shrink-0 gap-6 w-max animate-marquee-left">
                        {[...upperCards, ...upperCards, ...upperCards].map((card, i) => (
                            <div
                                key={i}
                                className="w-72 h-48 bg-gradient-to-br from-slate-900 to-[#0a0a0c] border border-white/5 hover:border-green-500/30 rounded-3xl p-6 flex flex-col justify-end relative group overflow-hidden transition-colors"
                                style={{
                                    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
                                }}
                            >
                                <div className="absolute top-6 left-6 opacity-80 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-b from-green-500/20 to-transparent flex items-center justify-center border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                                        {card.icon}
                                    </div>
                                </div>
                                <h3 className="text-white font-bold text-lg mt-auto z-10">{card.title}</h3>
                                <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/5 transition-colors duration-500"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lower Marquee (Left to Right) */}
                <div className="flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                    <div className="flex shrink-0 gap-6 w-max animate-marquee-right">
                        {[...lowerCards, ...lowerCards, ...lowerCards].map((card, i) => (
                            <div
                                key={i}
                                className="w-72 h-48 bg-gradient-to-br from-slate-900 to-[#0a0a0c] border border-white/5 hover:border-emerald-500/30 rounded-3xl p-6 flex flex-col justify-end relative group overflow-hidden transition-colors"
                                style={{
                                    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
                                }}
                            >
                                <div className="absolute top-6 left-6 opacity-80 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-b from-emerald-500/20 to-transparent flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                        {card.icon}
                                    </div>
                                </div>
                                <h3 className="text-white font-bold text-lg mt-auto z-10">{card.title}</h3>
                                <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-500"></div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};
