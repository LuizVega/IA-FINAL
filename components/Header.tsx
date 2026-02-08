import React from 'react';
import { Box, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/70 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-1.5 rounded-lg shadow-lg shadow-gray-200">
            <Box size={20} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            AutoStock AI
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="relative text-gray-400 hover:text-gray-900 transition-colors">
            <Bell size={20} strokeWidth={2} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>
          
          <div className="h-6 w-px bg-gray-200"></div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">Propietario</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-gray-100 ring-2 ring-white shadow-sm flex items-center justify-center text-gray-500 font-medium text-sm">
              AD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
