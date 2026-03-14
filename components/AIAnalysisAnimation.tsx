
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Cpu, Layers, BarChart3, Search } from 'lucide-react';

interface AIAnalysisAnimationProps {
    isVisible: boolean;
}

const steps = [
    { icon: Search, text: "Escaneando documentos...", color: "text-blue-400" },
    { icon: Layers, text: "Extrayendo estructura...", color: "text-purple-400" },
    { icon: Cpu, text: "Analizando con Gemini AI...", color: "text-green-400" },
    { icon: BarChart3, text: "Estimando precios y stock...", color: "text-orange-400" },
    { icon: Sparkles, text: "Finalizando inventario...", color: "text-yellow-400" }
];

export const AIAnalysisAnimation: React.FC<AIAnalysisAnimationProps> = ({ isVisible }) => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (!isVisible) {
            setCurrentStep(0);
            return;
        }

        const interval = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % steps.length);
        }, 2500);

        return () => clearInterval(interval);
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[100] bg-[#0a0a0a]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center"
                >
                    {/* Background Glows */}
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />

                    {/* Main Animation Container */}
                    <div className="relative w-32 h-32 mb-8">
                        {/* Rotating Rings */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-2 border-dashed border-green-500/30 rounded-full"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-2 border-2 border-dotted border-blue-500/20 rounded-full"
                        />
                        
                        {/* Central Scanning Line */}
                        <motion.div 
                            animate={{ 
                                top: ["10%", "90%", "10%"],
                                opacity: [0.3, 1, 0.3]
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent z-10 shadow-[0_0_15px_rgba(34,197,94,0.8)]"
                        />

                        {/* Animated Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                    exit={{ scale: 1.5, opacity: 0, rotate: 20 }}
                                    className={`p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl ${steps[currentStep].color}`}
                                >
                                    {React.createElement(steps[currentStep].icon, { size: 40 })}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Status Text Block */}
                    <div className="space-y-3 max-w-sm">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -10, opacity: 0 }}
                                className="space-y-1"
                            >
                                <h3 className="text-2xl font-black text-white tracking-tight">
                                    {steps[currentStep].text}
                                </h3>
                                <p className="text-gray-400 text-sm font-medium">
                                    Inteligencia Artificial Procesando
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Progress Bar Dots */}
                        <div className="flex justify-center gap-1.5 pt-4">
                            {steps.map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ 
                                        scale: i === currentStep ? 1.2 : 1,
                                        backgroundColor: i === currentStep ? '#22c55e' : '#333'
                                    }}
                                    className="w-2 h-2 rounded-full"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Technical Metadata (Premium feel) */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-12 grid grid-cols-2 gap-8 border-t border-white/5 pt-8"
                    >
                        <div className="text-left">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Motor IA</p>
                            <p className="text-xs text-green-500 font-mono">Gemini 2.5 Flash Lite</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Estado</p>
                            <p className="text-xs text-blue-400 font-mono italic animate-pulse">Analizando Patrones...</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
