
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Play, Zap, Box, Barcode, TrendingUp, FolderOpen, MousePointer2, CheckCircle2, DollarSign, LogOut, Star, LayoutDashboard, Crown, Home } from 'lucide-react';
import { Button } from './ui/Button';
import { useStore } from '../store';

// Simple Confetti Component (CSS Particles)
const Confetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[150] overflow-hidden">
        {[...Array(50)].map((_, i) => (
            <div 
                key={i}
                className="absolute animate-confetti rounded-full"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10px`,
                    backgroundColor: ['#22c55e', '#a855f7', '#f59e0b', '#3b82f6'][Math.floor(Math.random() * 4)],
                    width: `${Math.random() * 8 + 4}px`,
                    height: `${Math.random() * 8 + 4}px`,
                    animationDuration: `${Math.random() * 2 + 1}s`,
                    animationDelay: `${Math.random() * 0.5}s`
                }}
            />
        ))}
        <style>{`
            @keyframes confetti {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
            .animate-confetti {
                animation-name: confetti;
                animation-timing-function: ease-out;
                animation-fill-mode: forwards;
            }
        `}</style>
    </div>
  );
};

interface Step {
  title: string;
  description: string;
  position: 'right' | 'bottom' | 'left' | 'center' | 'bottom-left' | 'top';
  action?: () => void;
  highlightId?: string;
  icon?: React.ReactNode;
  waitForAction?: boolean; 
  isCelebration?: boolean;
}

interface TourGuideProps {
    isActive: boolean;
    onClose: () => void;
    onExitDemo?: () => void;
}

export const TourGuide: React.FC<TourGuideProps> = ({ isActive, onClose, onExitDemo }) => {
  const [targetRect, setTargetRect] = useState<{top: number, left: number, width: number, height: number} | null>(null);
  
  const { 
      currentView,
      isAddProductModalOpen,
      isImporterOpen,
      isCreateMenuOpen,
      setTourStep,
      tourStep,
      setCurrentView,
      isDetailsOpen,
      setSelectedProduct,
      setAuthModalOpen
  } = useStore();

  const steps: Step[] = [
    // 0: Welcome (Dashboard) - Centered
    {
      title: 'Bienvenido a la Demo de MyMorez',
      description: 'Te guiaremos a través del flujo completo de gestión de inventario inteligente.',
      position: 'center',
      icon: <Play className="text-green-500" size={32} />,
      action: () => {
          if (currentView !== 'dashboard') setCurrentView('dashboard');
      }
    },
    // 1: Guide to File Manager (Sidebar) - Tooltip Right
    {
      title: '1. Gestor de Archivos',
      description: 'Haz clic aquí para entrar a tu espacio de trabajo principal.',
      position: 'right', 
      highlightId: 'nav-files',
      icon: <FolderOpen className="text-blue-400" size={24} />,
      waitForAction: true
    },
    // 2: Create New (Top Right Button) - Tooltip Bottom-Left
    {
      title: '2. Crear Nuevo',
      description: 'Haz clic en "Nuevo" para abrir el centro de comandos.',
      position: 'bottom-left',
      highlightId: 'tour-new-btn',
      icon: <Box className="text-green-400" size={24} />,
      waitForAction: true
    },
    // 3: Select New Item (New Modal) - Tooltip Left - UPDATED POSITION
    {
      title: 'Ingreso con IA',
      description: 'Selecciona la opción principal para usar la cámara inteligente.',
      position: 'bottom', // Changed to bottom or top depending on modal size
      highlightId: 'tour-new-item-option',
      icon: <Zap className="text-white" size={24} />,
      waitForAction: true
    },
    // 4: Highlight Name Input
    {
      title: 'Nombre del Producto',
      description: 'La IA detectará el nombre de la imagen, o puedes escribirlo tú mismo aquí.',
      position: 'right',
      highlightId: 'tour-product-name',
      icon: <CheckCircle2 className="text-green-400" size={24} />,
    },
    // 5: Highlight Cost Input
    {
      title: 'Costo y Precio',
      description: 'Ingresa el costo. El precio de venta se generará AUTOMÁTICAMENTE según la categoría.',
      position: 'top',
      highlightId: 'tour-product-cost',
      icon: <DollarSign className="text-green-400" size={24} />,
    },
    // 6: Save Product
    {
        title: 'Guardar Producto',
        description: 'Finalmente, guarda el producto en tu inventario.',
        position: 'left', 
        highlightId: 'tour-save-product-btn', 
        icon: <CheckCircle2 className="text-green-400" size={24} />,
        waitForAction: true
    },
    // 7: Import
    {
      title: '3. Importación Masiva',
      description: '¡Item creado! Ahora prueba importar desde Excel.',
      position: 'bottom-left',
      highlightId: 'tour-import-btn',
      icon: <Zap className="text-amber-400" size={24} />,
      waitForAction: true
    },
    // 8: Wait for Demo Load
    {
      title: 'Generar Datos',
      description: 'Simula una carga real con un solo clic.',
      position: 'top', 
      highlightId: 'demo-import-btn', 
      waitForAction: true
    },
    // 9: Click specific item
    {
      title: '4. Ver Detalles',
      description: 'Haz clic en este producto para ver su ficha completa y códigos.',
      position: 'right', // Changed to point at item
      highlightId: 'tour-first-item', // Added ID in Dashboard
      icon: <MousePointer2 className="text-white" size={24} />,
      waitForAction: true // Waits for isDetailsOpen
    },
    // 10: Highlight Barcode Tab
    {
      title: 'Códigos de Barras',
      description: 'Haz clic aquí para ver el código de barras generado listo para imprimir.',
      position: 'bottom-left',
      highlightId: 'tour-barcode-tab',
      icon: <Barcode className="text-purple-400" size={24} />,
      waitForAction: true // Wait for user to click the tab (Handled by ProductDetailsModal)
    },
    // 11: Return to Dashboard
    {
      title: 'Cerrar Detalles',
      description: 'Cierra esta ventana para continuar con el análisis general.',
      position: 'left',
      highlightId: 'tour-close-details',
      icon: <LogOut className="text-gray-400" size={24} />,
      waitForAction: true
    },
    // 12 (NEW): Go to Dashboard View
    {
      title: 'Ir al Dashboard',
      description: 'Entra al panel principal para ver las estadísticas globales.',
      position: 'right',
      highlightId: 'tour-nav-dashboard',
      icon: <LayoutDashboard className="text-blue-400" size={24} />,
      waitForAction: true
    },
    // 13: Financial Health KPI
    {
      title: '5. Salud Financiera',
      description: 'Haz clic en este indicador para ver el análisis de rentabilidad.',
      position: 'right', // Or bottom depending on card position
      highlightId: 'tour-financial-health-card',
      icon: <TrendingUp className="text-green-500" size={24} />,
      waitForAction: true // Waits for view change to financial-health
    },
    // 14: Finish Celebration
    {
      title: '¡Experiencia Completada!',
      description: 'Has desbloqueado el poder de la gestión inteligente. ¿Listo para empezar con tu negocio?',
      position: 'center',
      icon: <Star className="text-yellow-400" size={48} />,
      isCelebration: true
    }
  ];

  // --- Auto-advance Logic ---
  useEffect(() => {
      if (!isActive) return;
      if (tourStep === 1 && currentView === 'files') setTourStep(2);
      if (tourStep === 2 && isCreateMenuOpen) setTourStep(3);
      if (tourStep === 3 && isAddProductModalOpen) setTourStep(4);
      // Steps 4, 5 are manual Next clicks on the tooltip
      // Step 6 (Save) advances when modal CLOSES (detected below)
      if (tourStep === 6 && !isAddProductModalOpen) setTourStep(7);
      
      if (tourStep === 7 && isImporterOpen) setTourStep(8);
      // Step 8 auto-advances when import finishes (handled in InventoryImporter -> sets step to 9)
      
      if (tourStep === 9 && isDetailsOpen) setTourStep(10);
      
      // Step 10 (Barcode Tab) auto-advances from ProductDetailsModal side effect
      
      // Step 11: Close Modal. Detect if isDetailsOpen becomes false while on step 11
      if (tourStep === 11 && !isDetailsOpen) setTourStep(12);

      // Step 12: Click Dashboard. Detect view change to dashboard
      if (tourStep === 12 && currentView === 'dashboard') setTourStep(13);

      // Step 13: Click Financial Health. Detect view change to financial-health
      if (tourStep === 13 && currentView === 'financial-health') setTourStep(14);
      
  }, [currentView, isCreateMenuOpen, isAddProductModalOpen, isImporterOpen, isDetailsOpen, tourStep, setTourStep, isActive]);


  // --- Positioning Logic ---
  useEffect(() => {
    if (!isActive) return;
    if (tourStep >= steps.length) return;

    const step = steps[tourStep];
    
    // Execute immediate actions
    if (step.action) step.action();

    const updatePosition = () => {
      if (step.highlightId) {
          const el = document.getElementById(step.highlightId);
          if (el) {
              const rect = el.getBoundingClientRect();
              setTargetRect({
                  top: rect.top,
                  left: rect.left,
                  width: rect.width,
                  height: rect.height
              });
              return;
          }
      }
      setTargetRect(null);
    };

    // Poll for element presence (animations/modals taking time to appear)
    updatePosition();
    const interval = setInterval(updatePosition, 200);
    window.addEventListener('resize', updatePosition);
    
    return () => {
        clearInterval(interval);
        window.removeEventListener('resize', updatePosition);
    };
  }, [isActive, tourStep, steps]);

  if (!isActive) return null;
  if (tourStep >= steps.length) return null;

  const step = steps[tourStep];
  const isCentered = step.position === 'center';

  // --- Popover Style Calculation ---
  const getPopoverStyle = (): React.CSSProperties => {
      if (!targetRect || isCentered) return {};

      const gap = 16; // Space between target and tooltip
      const cardWidth = 320; 

      // Basic positioning logic
      if (step.position === 'right') {
          return {
              top: targetRect.top,
              left: targetRect.left + targetRect.width + gap,
              width: cardWidth
          };
      }
      if (step.position === 'left') {
          return {
              top: targetRect.top,
              left: targetRect.left - cardWidth - gap,
              width: cardWidth
          };
      }
      if (step.position === 'bottom') {
          return {
              top: targetRect.top + targetRect.height + gap,
              left: targetRect.left + (targetRect.width / 2) - (cardWidth / 2),
              width: cardWidth
          };
      }
      if (step.position === 'bottom-left') {
          return {
              top: targetRect.top + targetRect.height + gap,
              left: (targetRect.left + targetRect.width) - cardWidth,
              width: cardWidth
          };
      }
      if (step.position === 'top') {
          return {
              top: targetRect.top - gap - 150, // Approx height of card
              left: targetRect.left + (targetRect.width / 2) - (cardWidth / 2),
              width: cardWidth
          };
      }
      return {};
  };

  const handleNext = () => {
    // If waiting for action, do not advance via button (button might be hidden or just 'OK')
    // But for informational steps (4, 5, 10), user clicks Next.
    if (tourStep < steps.length - 1) setTourStep(tourStep + 1);
    else onClose();
  };

  return (
    <div className={`fixed inset-0 z-[100] overflow-hidden ${isCentered ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      
      {/* Confetti Celebration */}
      {step.isCelebration && <Confetti />}

      {/* 1. Backdrop (Allow clicks through if not centered) */}
      <div className={`absolute inset-0 bg-black/60 transition-opacity duration-500 ${isCentered ? '' : 'opacity-30'}`}></div>

      {/* 2. Spotlight (The Green Glow Border around target) */}
      {targetRect && (
        <div 
            className="absolute border-2 border-green-500 rounded-lg shadow-[0_0_40px_rgba(34,197,94,0.6)] transition-all duration-300 z-[101] pointer-events-none animate-pulse"
            style={{
                top: targetRect.top - 4,
                left: targetRect.left - 4,
                width: targetRect.width + 8,
                height: targetRect.height + 8
            }}
        />
      )}

      {/* 3. The Card (Instruction) */}
      {isCentered ? (
          // --- CENTERED MODAL MODE ---
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-[102] p-4">
              <div className="bg-[#111] border border-green-500/30 p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  
                  <div className="flex flex-col items-center text-center mb-6">
                      {step.icon && (
                          <div className={`mb-4 bg-white/5 p-4 rounded-full border border-white/10 ${step.isCelebration ? 'scale-125' : ''}`}>
                              {step.icon}
                          </div>
                      )}
                      <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-gray-400 leading-relaxed">{step.description}</p>
                      
                      {/* Offer unlocked box for last step */}
                      {step.isCelebration && (
                          <div className="mt-4 bg-green-900/20 border border-green-500/30 rounded-xl p-3 flex items-center gap-3">
                              <Crown size={20} className="text-yellow-500" />
                              <div className="text-left">
                                  <p className="text-green-400 font-bold text-sm">Oferta Desbloqueada</p>
                                  <p className="text-gray-400 text-xs">3 Meses Gratis del plan Growth</p>
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="flex flex-col gap-3 mt-6">
                      {!step.isCelebration ? (
                          <div className="flex justify-between items-center w-full">
                            <span className="text-xs text-gray-600 font-mono">PASO {tourStep + 1}/{steps.length}</span>
                            <Button onClick={handleNext} className="bg-green-600 hover:bg-green-500 text-black px-6">
                                Siguiente <ArrowRight size={16} className="ml-2"/>
                            </Button>
                          </div>
                      ) : (
                          // CUSTOM BUTTONS FOR CELEBRATION
                          <>
                              <Button 
                                onClick={() => { onClose(); setAuthModalOpen(true); }} 
                                className="w-full py-3.5 text-base font-bold bg-green-600 hover:bg-green-500 text-black shadow-lg hover:shadow-green-500/20"
                              >
                                  Reclamar Oferta y Registrarme
                              </Button>
                              
                              <Button 
                                variant="ghost"
                                onClick={() => { onClose(); if(onExitDemo) onExitDemo(); }}
                                className="w-full text-gray-500 hover:text-white"
                                icon={<Home size={16} />}
                              >
                                  Volver al Inicio
                              </Button>
                          </>
                      )}
                  </div>
                  
                  <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-white">
                      <X size={20} />
                  </button>
              </div>
          </div>
      ) : (
          // --- TOOLTIP/POPOVER MODE (Non-blocking) ---
          <div 
            className="absolute z-[102] pointer-events-auto transition-all duration-300"
            style={getPopoverStyle()}
          >
              <div className="bg-[#111] border border-green-500/30 p-5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {/* Arrow (Visual only, simplified) */}
                  <div className="flex items-start gap-4">
                      {step.icon && <div className="text-green-400 mt-1 shrink-0">{step.icon}</div>}
                      <div>
                          <h4 className="font-bold text-white text-lg leading-tight mb-1">{step.title}</h4>
                          <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                      </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center border-t border-white/10 pt-3">
                      {step.waitForAction ? (
                          <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                              <MousePointer2 size={12} /> Interactúa para continuar
                          </span>
                      ) : (
                          <Button size="sm" onClick={handleNext} className="h-7 text-xs px-3">
                              Siguiente
                          </Button>
                      )}
                      
                      <span className="text-[10px] text-gray-600 font-mono ml-auto">
                          {tourStep + 1} / {steps.length}
                      </span>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
