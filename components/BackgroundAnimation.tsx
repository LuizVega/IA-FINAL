import { motion } from 'framer-motion';
import { FlowAnimation } from './FlowAnimation';

export const BackgroundAnimation = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-50">
            {/* Noise Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.05] mix-blend-multiply noise-bg"></div>

            {/* Animated Light Blobs - Reduced/Hidden on mobile for performance */}
            <motion.div
                animate={{
                    x: [0, 100, -100, 0],
                    y: [0, -50, 50, 0],
                    scale: [1, 1.2, 1, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[120px] hidden md:block"
            />

            <motion.div
                animate={{
                    x: [0, -150, 150, 0],
                    y: [0, 100, -100, 0],
                    scale: [1, 1.1, 1.2, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-emerald-600/5 rounded-full blur-[150px] hidden md:block"
            />

            <motion.div
                animate={{
                    x: [0, 80, -80, 0],
                    y: [0, 120, -120, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] hidden md:block"
            />

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
