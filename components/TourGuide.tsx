
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';

interface Step {
  targetId: string;
  title: string;
  description: string;
  position: 'right' | 'bottom' | 'left' | 'center';
}

const steps: Step[] = [
  {
    targetId: 'tour-welcome',
    title: 'Bienvenido a ExO',
    description: 'Este es tu nuevo Centro de Mando. Aquí tienes una visión general en tiempo real de todo tu inventario y finanzas.',
    position: 'center'
  },
  {
    targetId: 'tour-sidebar',
    title: 'Navegación Principal',
    description: 'Desde aquí accedes a tus carpetas, categorías, configuración y perfil. Todo organizado jerárquicamente.',
    position: 'right'
  },
  {
    targetId: 'tour-search',
    title: 'Búsqueda Inteligente',
    description: 'Encuentra cualquier producto por nombre, SKU o marca instantáneamente. También puedes aplicar filtros avanzados.',
    position: 'bottom'
  },
  {
    targetId: 'tour-stats',
    title: 'KPIs en Tiempo Real',
    description: 'Monitorea el valor total de tu stock, items activos y alertas críticas como garantías por vencer o stock estancado.',
    position: 'bottom'
  },
  {
    targetId: 'tour-grid',
    title: 'Gestión de Inventario',
    description: 'Haz clic derecho en cualquier item para editarlo, moverlo o ver detalles. Las alertas visuales te indican problemas.',
    position: 'left'
  }
];

export const TourGuide: React.FC<{ isActive: boolean, onClose: () => void }> = ({ isActive, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState<{top: number, left: number, width: number, height: number} | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const updatePosition = () => {
      const step = steps[currentStep];
      // Special case for center welcome message (no target needed)
      if (step.position === 'center') {
         setPosition(null);
         return;
      }

      const element = document.getElementById(step.targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    // Slight delay to ensure DOM is ready
    setTimeout(updatePosition, 500);

    return () => window.removeEventListener('resize', updatePosition);
  }, [isActive, currentStep]);

  if (!isActive) return null;

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Dark Overlay with cutout using box-shadow trick or distinct divs */}
      <div className="absolute inset-0 bg-black/70 transition-all duration-500" style={{
         clipPath: position ? `polygon(
            0% 0%, 0% 100%, 
            ${position.left}px 100%, 
            ${position.left}px ${position.top}px, 
            ${position.left + position.width}px ${position.top}px, 
            ${position.left + position.width}px ${position.top + position.height}px, 
            ${position.left}px ${position.top + position.height}px, 
            ${position.left}px 100%, 
            100% 100%, 100% 0%
         )` : 'none'
      }}></div>

      {/* Spotlight Border (The Light) */}
      {position && (
        <div 
            className="absolute border-2 border-green-500 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-all duration-500 pointer-events-none"
            style={{
                top: position.top - 4,
                left: position.left - 4,
                width: position.width + 8,
                height: position.height + 8
            }}
        />
      )}

      {/* Tooltip Card */}
      <div 
        className={`absolute max-w-sm w-full bg-[#111] border border-green-500/30 p-6 rounded-2xl shadow-2xl transition-all duration-500 ${step.position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}`}
        style={step.position !== 'center' && position ? {
            top: step.position === 'bottom' ? position.top + position.height + 20 : position.top,
            left: step.position === 'right' ? position.left + position.width + 20 : (step.position === 'left' ? position.left - 400 : position.left),
        } : {}}
      >
        <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-green-500 uppercase tracking-widest">
                Paso {currentStep + 1} de {steps.length}
            </span>
            <button onClick={onClose} className="text-gray-500 hover:text-white">
                <X size={16} />
            </button>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {step.description}
        </p>

        <div className="flex justify-between items-center">
             <div className="flex gap-2">
                 {currentStep > 0 && (
                     <Button variant="secondary" size="sm" onClick={handlePrev} icon={<ArrowLeft size={14}/>}>
                         Anterior
                     </Button>
                 )}
             </div>
             <Button onClick={handleNext} size="sm" className="bg-green-600 hover:bg-green-500 text-black">
                 {currentStep === steps.length - 1 ? 'Finalizar Tour' : 'Siguiente'} <ArrowRight size={14} className="ml-1"/>
             </Button>
        </div>
      </div>
    </div>
  );
};
