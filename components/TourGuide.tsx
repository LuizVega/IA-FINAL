
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Play, Zap, Box, Barcode, TrendingUp } from 'lucide-react';
import { Button } from './ui/Button';
import { useStore } from '../store';

interface Step {
  title: string;
  description: string;
  position: 'right' | 'bottom' | 'left' | 'center' | 'top';
  action?: () => void;
  highlightId?: string;
  icon?: React.ReactNode;
}

export const TourGuide: React.FC<{ isActive: boolean, onClose: () => void }> = ({ isActive, onClose }) => {
  const [position, setPosition] = useState<{top: number, left: number, width: number, height: number} | null>(null);
  
  const { 
      setAddProductModalOpen, 
      setIsImporterOpen, 
      setIsDetailsOpen, 
      setCurrentView, 
      setSelectedProduct, 
      inventory,
      tourStep,
      setTourStep
  } = useStore();

  const steps: Step[] = [
    // 0: Welcome
    {
      title: 'Bienvenido a la Demo de ExO',
      description: 'Te guiaremos a través del flujo completo: desde crear un producto hasta analizar tus finanzas.',
      position: 'center',
      icon: <Play className="text-green-500" size={32} />,
      action: () => {
          setCurrentView('dashboard');
      }
    },
    // 1: Open "New Item" Modal
    {
      title: '1. Crear Nuevo Item',
      description: 'El primer paso es digitalizar tu inventario. Vamos a abrir el formulario de creación inteligente.',
      position: 'center',
      icon: <Box className="text-blue-400" size={32} />,
      action: () => {
          setCurrentView('files'); 
          setTimeout(() => setAddProductModalOpen(true), 100);
      }
    },
    // 2: Waiting for user to Save...
    {
        title: 'Formulario Inteligente',
        description: 'Aquí la IA reconoce productos. Para continuar, completa el formulario y haz clic en "Guardar Item".',
        position: 'center',
        action: () => {
            // This step just waits. The AddProductModal will call setTourStep(3) on save.
        }
    },
    // 3: Open Importer
    {
      title: '2. Importación Masiva',
      description: '¡Excelente! Ahora, si ya tienes una lista en Excel, puedes subirla aquí. Probemos el importador.',
      position: 'center',
      icon: <Zap className="text-amber-400" size={32} />,
      action: () => {
          setAddProductModalOpen(false); // Ensure closed
          setTimeout(() => setIsImporterOpen(true), 300);
      }
    },
    // 4: Waiting for user to click "Load Demo Data"...
    {
      title: 'Generar Datos',
      description: 'Haz clic en el botón "Cargar Datos de Prueba" para simular una importación real instantáneamente.',
      position: 'center',
      highlightId: 'demo-import-btn', 
      action: () => {
          // This step waits. InventoryImporter calls setTourStep(5) on demo load.
      }
    },
    // 5: Show Barcodes
    {
      title: '3. Códigos de Barras y QR',
      description: '¡Datos cargados! Ahora veamos los detalles de un producto y su etiqueta generada.',
      position: 'center',
      icon: <Barcode className="text-purple-400" size={32} />,
      action: () => {
          setIsImporterOpen(false);
          // Select the first item from inventory if exists
          setTimeout(() => {
              const state = useStore.getState();
              if (state.inventory.length > 0) {
                  setSelectedProduct(state.inventory[0]);
                  setIsDetailsOpen(true);
              }
          }, 500);
      }
    },
    // 6: Financial Health
    {
      title: '4. Salud Financiera',
      description: 'Cerremos los detalles. Finalmente, analicemos la rentabilidad en el panel financiero.',
      position: 'center',
      icon: <TrendingUp className="text-green-500" size={32} />,
      action: () => {
          setIsDetailsOpen(false);
          setCurrentView('financial-health');
      }
    },
    // 7: Finish
    {
      title: '¡Todo Listo!',
      description: 'Has visto el poder de ExO. Regístrate ahora para obtener 3 meses gratis del plan Growth.',
      position: 'center',
      icon: <Play className="text-white" size={32} />,
      action: () => {
          // End state
      }
    }
  ];

  useEffect(() => {
    if (!isActive) return;

    // Safety check for bounds
    if (tourStep >= steps.length) return;

    const step = steps[tourStep];
    
    // Execute action associated with the step
    if (step.action) {
        step.action();
    }

    const updatePosition = () => {
      // If highlighted ID exists, find it
      if (step.highlightId) {
          const el = document.getElementById(step.highlightId);
          if (el) {
              const rect = el.getBoundingClientRect();
              setPosition({
                  top: rect.top,
                  left: rect.left,
                  width: rect.width,
                  height: rect.height
              });
              return;
          }
      }
      setPosition(null);
    };

    // Small delay to allow UI to render (modals opening, views changing)
    const t = setTimeout(updatePosition, 400);

    window.addEventListener('resize', updatePosition);
    return () => {
        window.removeEventListener('resize', updatePosition);
        clearTimeout(t);
    };
  }, [isActive, tourStep]);

  if (!isActive) return null;
  
  if (tourStep >= steps.length) return null;

  const step = steps[tourStep];

  const handleNext = () => {
    if (tourStep < steps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (tourStep > 0) {
      setTourStep(tourStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 transition-all duration-500 pointer-events-auto"></div>

      {/* Spotlight for Highlighted Elements */}
      {position && (
        <div 
            className="absolute border-2 border-green-500 rounded-xl shadow-[0_0_50px_rgba(34,197,94,0.5)] transition-all duration-500 z-[101]"
            style={{
                top: position.top - 8,
                left: position.left - 8,
                width: position.width + 16,
                height: position.height + 16
            }}
        />
      )}

      {/* Card Centering Container */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[102]">
          <div className="bg-[#111] border border-green-500/30 p-8 rounded-3xl shadow-2xl max-w-md w-full pointer-events-auto relative overflow-hidden animate-in zoom-in-95 duration-300">
              
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

              <div className="flex flex-col items-center text-center mb-6">
                  {step.icon && (
                      <div className="mb-4 bg-white/5 p-4 rounded-full border border-white/10">
                          {step.icon}
                      </div>
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">
                      {step.description}
                  </p>
              </div>

              <div className="flex justify-between items-center mt-8">
                  <div className="flex gap-2">
                     <span className="text-xs text-gray-600 font-mono self-center">
                         PASO {tourStep + 1}/{steps.length}
                     </span>
                  </div>
                  <div className="flex gap-3">
                     {tourStep > 0 && (
                         <Button variant="ghost" size="sm" onClick={handlePrev}>
                            Atrás
                         </Button>
                     )}
                     <Button onClick={handleNext} className="bg-green-600 hover:bg-green-500 text-black px-6">
                         {tourStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'} <ArrowRight size={16} className="ml-2"/>
                     </Button>
                  </div>
              </div>
              
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-white">
                  <X size={20} />
              </button>
          </div>
      </div>
    </div>
  );
};
