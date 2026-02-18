import React from 'react';
import {
    MessageCircle, Database, Rocket,
    ChevronLeft, Star, Trophy, Target,
    Globe, Sparkles, Zap, Shield
} from 'lucide-react';
import { Button } from './ui/Button';

interface RoadmapViewProps {
    onBack: () => void;
}

interface QuestNodeProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    status: string;
    isCompleted?: boolean;
    isPrimary?: boolean;
    position: 'left' | 'right' | 'center';
    color: string;
}

const QuestNode: React.FC<QuestNodeProps> = ({
    icon, title, description, status, isCompleted, isPrimary, position, color
}) => {
    const alignClass = position === 'left' ? 'md:mr-auto' : position === 'right' ? 'md:ml-auto' : 'mx-auto';

    return (
        <div className={`relative flex flex-col items-center mb-24 w-full max-w-lg ${alignClass} group`}>
            {/* Node Circle */}
            <div className={`
        relative z-10 w-20 h-20 rounded-full flex items-center justify-center
        ${isCompleted ? 'bg-green-500' : 'bg-[#111]'}
        border-4 ${isPrimary ? `border-${color}-500 shadow-[0_0_20px_rgba(var(--${color}-500-rgb),0.5)]` : 'border-white/10'}
        group-hover:scale-110 transition-all duration-500 cursor-pointer
      `}>
                {isCompleted ? <Trophy className="text-black" size={28} /> :
                    <div className={`text-${color}-500`}>{icon}</div>
                }

                {/* Floating status label */}
                <div className={`
          absolute -top-12 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide whitespace-nowrap z-20
          ${isCompleted ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]' : `bg-slate-900 text-${color}-400 border border-${color}-500/50 shadow-2xl shadow-black`}
        `}>
                    {status}
                </div>
            </div>

            {/* Info Card */}
            <div className={`
        mt-6 p-6 rounded-2xl glass-panel text-center
        group-hover:border-${color}-500/50 transition-all duration-300
        bg-black/40 border border-white/5
      `}>
                <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
            </div>

            {/* Decorative Stars */}
            {isPrimary && (
                <>
                    <Star className="absolute -top-4 -left-8 text-yellow-500 animate-pulse opacity-40" size={16} />
                    <Star className="absolute top-10 -right-12 text-yellow-500 animate-pulse delay-700 opacity-40" size={14} />
                </>
            )}
        </div>
    );
};

export const RoadmapView: React.FC<RoadmapViewProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-[#020203] text-gray-200 py-20 px-6 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-900/10 rounded-full blur-[120px] opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px] opacity-20"></div>
            </div>

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-20 relative z-10">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors mb-8 group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Volver al Inicio
                </button>

                <div className="flex items-center gap-4 mb-4">
                    <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest">
                        Level up Your Business
                    </div>
                    <div className="h-px flex-1 bg-white/5"></div>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
                    ROADMAP <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">2026</span>
                </h1>
                <p className="text-xl text-gray-400 font-light max-w-2xl">
                    Nuestra misión es construir el sistema operativo definitivo para el comercio moderno. Sigue el camino del éxito.
                </p>
            </div>

            {/* Main Path Container */}
            <div className="max-w-4xl mx-auto relative px-4">
                {/* Animated Path Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500/50 via-blue-500/50 to-purple-500/50 -translate-x-1/2 opacity-20 hidden md:block"></div>

                {/* SVG Dash Line for "Game Path" effect */}
                <svg className="absolute left-1/2 top-0 h-full w-2 -translate-x-1/2 opacity-30 hidden md:block" style={{ zIndex: 0 }}>
                    <line x1="1" y1="0" x2="1" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="10 15" className="animate-[dash_20s_linear_infinite]" />
                </svg>

                <div className="relative z-10">
                    <QuestNode
                        icon={<Shield size={24} />}
                        title="Core Infra & Sync"
                        description="Lanzamiento estable de la nube y sincronización en tiempo real entre múltiples dispositivos."
                        status="Completado"
                        isCompleted={true}
                        position="center"
                        color="green"
                    />

                    <QuestNode
                        icon={<Zap size={32} />}
                        title="App Móvil Nativa"
                        description="Lleva tu negocio en el bolsillo. App nativa para iOS y Android con notificaciones push de ventas en tiempo real."
                        status="En Desarrollo (Alpha)"
                        isPrimary={true}
                        position="right"
                        color="blue"
                    />

                    <QuestNode
                        icon={<MessageCircle size={32} />}
                        title="Bot de Pedidos IA"
                        description="Integración profunda con WhatsApp. Tu asistente IA toma pedidos, responde dudas sobre stock y confirma ventas mientras duermes."
                        status="En Desarrollo (Level 2)"
                        isPrimary={true}
                        position="left"
                        color="green"
                    />

                    <QuestNode
                        icon={<Database size={32} />}
                        title="Integración Shopify"
                        description="Sincroniza MyMorez con tu tienda Shopify existente. Una sola base de datos para controlar todo tu ecosistema."
                        status="Próxima Misión"
                        position="right"
                        color="blue"
                    />

                    <QuestNode
                        icon={<Target size={32} />}
                        title="Predicción de Demanda IA"
                        description="Nuestro motor IA analiza tendencias de venta para sugerirte qué productos comprar y cuándo liquidar stock estancado."
                        status="Fase de Entrenamiento"
                        position="left"
                        color="purple"
                    />

                    <QuestNode
                        icon={<Rocket size={32} />}
                        title="Global Scale & API"
                        description="Infraestructura escalable para gestionar cientos de sucursales. Apertura de API para integración con terceros."
                        status="Boss Level (Q3 2026)"
                        position="center"
                        color="purple"
                    />

                    <QuestNode
                        icon={<Globe size={32} />}
                        title="MyMorez Marketplace"
                        description="Red de proveedores conectada. Compra stock a precios preferenciales directamente desde tu panel."
                        status="Expansión Final"
                        position="left"
                        color="yellow"
                    />
                </div>
            </div>

            {/* Footer Decoration */}
            <div className="text-center mt-20 opacity-30 flex flex-col items-center gap-4">
                <Target className="text-white" size={40} />
                <div className="text-[10px] font-bold uppercase tracking-[0.4em]">Checkpoint • Ready Player One</div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes dash {
          to { stroke-dashoffset: -1000; }
        }
        .animate-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
        </div>
    );
};
