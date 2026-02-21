import React from 'react';
import { Bell } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { useTranslation } from '../hooks/useTranslation';

export const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 w-full bg-[#1E293B]/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AppLogo className="w-10 h-10 shadow-lg shadow-green-500/20 border border-green-500/30" />
          <span className="text-xl font-bold tracking-tight text-white">
            MyMorez
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
              <p className="text-sm font-medium text-white">{t('nav.admin')}</p>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">{t('nav.owner')}</p>
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