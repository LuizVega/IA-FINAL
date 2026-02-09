
import React from 'react';
import { CalendarCheck, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';
import { useStore } from '../store';

export const PromoBanner: React.FC = () => {
  const { settings, claimOffer } = useStore();

  if (settings.hasClaimedOffer) return null;

  return (
    <div className="bg-gradient-to-r from-green-900/40 to-black border border-green-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="bg-green-500/20 p-6 rounded-full border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <CalendarCheck size={40} className="text-green-400" />
        </div>
        
        <div className="flex-1 text-center md:text-left z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">¡Oferta de Lanzamiento Exclusiva!</h2>
            <p className="text-gray-300 text-lg mb-1">
               Apoyamos a las Mypes. Obtén <span className="text-green-400 font-bold">3 Meses Gratis del plan Growth</span> para potenciar tu negocio hoy.
            </p>
            <p className="text-sm text-gray-500">
               Sin tarjeta de crédito. Cancela cuando quieras.
            </p>
        </div>
        
        <div className="z-10">
           <Button 
             className="px-8 py-4 text-lg bg-green-500 hover:bg-green-400 text-black shadow-xl font-bold transform hover:scale-105 transition-all" 
             onClick={claimOffer}
           >
              Quiero mis 3 meses gratis
           </Button>
        </div>
    </div>
  );
};
