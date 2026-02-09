
import React from 'react';
import { Box, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#1E293B]/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://media.discordapp.net/attachments/1392377430030811289/1470252808837136589/WhatsApp_Image_2026-02-08_at_9.59.30_PM.jpeg?ex=698a9f21&is=69894da1&hm=e8fe7fa45567bf2709c0a28d6133cd5a49dfe778229ea289d92b03b717509c07&=&format=webp"
            alt="Logo"
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-lg font-semibold tracking-tight text-white">
            ExO
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="relative text-slate-400 hover:text-white transition-colors">
            <Bell size={20} strokeWidth={2} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#1E293B]"></span>
          </button>
          
          <div className="h-6 w-px bg-slate-700"></div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Propietario</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-800 ring-2 ring-slate-700 shadow-sm flex items-center justify-center text-slate-400 font-medium text-sm">
              AD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
