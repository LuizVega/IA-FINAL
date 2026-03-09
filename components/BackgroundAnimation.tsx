import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FlowAnimation } from './FlowAnimation';

export const BackgroundAnimation = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check, { passive: true });
        return () => window.removeEventListener('resize', check);
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-50">
            {/* Noise Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.05] mix-blend-multiply noise-bg"></div>

            {/* Animated Light Blobs — desktop only (skipped entirely on mobile to avoid JS animation loops) */}
            {!isMobile && (
                <>
                    <motion.div
                        animate={{
                            x: [0, 80, -80, 0],
                            y: [0, -40, 40, 0],
                        }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[80px] will-change-transform"
                    />

                    <motion.div
                        animate={{
                            x: [0, -100, 100, 0],
                            y: [0, 80, -80, 0],
                        }}
                        transition={{
                            duration: 35,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[100px] will-change-transform"
                    />

                    <motion.div
                        animate={{
                            x: [0, 60, -60, 0],
                            y: [0, 100, -100, 0],
                        }}
                        transition={{
                            duration: 28,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="absolute top-[20%] right-[10%] w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-[80px] will-change-transform"
                    />
                </>
            )}

            {/* Flow Animation Integration */}
            <FlowAnimation />

            {/* Grid Pattern */}
            <div
                className="absolute inset-0 opacity-[0.1]"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                }}
            />
        </div>
    );
};
