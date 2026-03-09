import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, DollarSign, Check } from 'lucide-react';

const FloatingElement = ({ children, delay = 0, duration = 3, x = 0, y = 0, className = "" }: any) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
            opacity: 1,
            scale: 1,
            y: [y, y - 20, y],
        }}
        transition={{
            opacity: { duration: 1 },
            scale: { duration: 1 },
            y: {
                duration: duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay
            }
        }}
        className={`absolute ${className}`}
        style={{ left: `calc(50% + ${x}px)`, top: `${y}px` }}
    >
        {children}
    </motion.div>
);

const UserLabel = ({ text, icon: Icon, color = "bg-blue-500" }: any) => (
    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-slate-100 whitespace-nowrap">
        <div className={`w-5 h-5 ${color} rounded-full flex items-center justify-center shadow-inner`}>
            <Icon size={12} className="text-white" />
        </div>
        <span className="text-[10px] font-bold text-slate-700">{text}</span>
    </div>
);

const AvatarFlow = ({ imgSrc, active = false }: any) => (
    <div className="relative">
        <div className={`w-10 h-10 rounded-full border-2 ${active ? 'border-green-400' : 'border-slate-100'} p-0.5 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)]`}>
            <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center overflow-hidden">
                {imgSrc ? (
                    <img src={imgSrc} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                    <User size={20} className="text-slate-400" />
                )}
            </div>
        </div>
        {active && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <Check size={8} className="text-white" />
            </div>
        )}
    </div>
);

export const FlowAnimation = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check, { passive: true });
        return () => window.removeEventListener('resize', check);
    }, []);

    // Completely skip on mobile — no DOM nodes, no animation loops, no repaints
    if (isMobile) return null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Central Gradient Line */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-[300px] bg-gradient-to-b from-blue-500 via-green-500 to-indigo-600 rounded-full blur-[1px] opacity-100 shadow-[0_0_20px_rgba(59,130,246,0.5)]" />

            {/* Background Curves */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
                <path d="M-100,300 C200,250 400,350 1200,300" stroke="black" strokeWidth="1" fill="none" />
                <path d="M-100,500 C200,550 400,450 1200,500" stroke="black" strokeWidth="1" fill="none" />
                <path d="M-100,700 C200,650 400,750 1200,700" stroke="black" strokeWidth="1" fill="none" />
            </svg>

            {/* Floating Elements - Left Side */}
            <FloatingElement x={-400} y={400} delay={0} duration={4}>
                <UserLabel text="Visitors" icon={User} color="bg-cyan-500" />
            </FloatingElement>

            <FloatingElement x={-250} y={250} delay={1} duration={5}>
                <UserLabel text="One-time Buyers" icon={User} color="bg-blue-500" />
            </FloatingElement>

            <FloatingElement x={-450} y={150} delay={0.5} duration={4.5}>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100">
                    <User size={24} className="text-slate-300" />
                </div>
            </FloatingElement>

            {/* Floating Elements - Right Side */}
            <FloatingElement x={150} y={450} delay={2} duration={4}>
                <UserLabel text="New Subscriber" icon={User} color="bg-indigo-500" />
            </FloatingElement>

            <FloatingElement x={180} y={150} delay={1.5} duration={5}>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                    <DollarSign size={28} className="text-white" />
                </div>
            </FloatingElement>

            {/* Avatars near the center */}
            <FloatingElement x={20} y={280} delay={0.2} duration={3}>
                <AvatarFlow active={true} />
            </FloatingElement>

            <FloatingElement x={120} y={480} delay={1.2} duration={3.5}>
                <AvatarFlow active={true} />
            </FloatingElement>

            <FloatingElement x={-100} y={550} delay={0.8} duration={4}>
                <UserLabel text="Visitors" icon={User} color="bg-cyan-500" />
            </FloatingElement>
        </div>
    );
};
