
import React from 'react';

interface AppLogoProps {
  className?: string;
  withGlow?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = "w-10 h-10", withGlow = false }) => {
  return (
    <div className={`relative flex items-center justify-center rounded-full bg-black overflow-hidden ${className}`}>
       {/* Glow Effect Background */}
       {withGlow && (
         <div className="absolute inset-0 bg-green-500/20 blur-xl"></div>
       )}
       
       <svg 
         viewBox="0 0 512 512" 
         fill="none" 
         xmlns="http://www.w3.org/2000/svg"
         className="w-full h-full relative z-10"
       >
        <defs>
          <radialGradient id="logoGrad" cx="50%" cy="0%" r="100%" fx="50%" fy="0%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#064e3b" />
          </radialGradient>
          <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background Circle */}
        <circle cx="256" cy="256" r="256" fill="#022c22"/>
        
        {/* Outer Ring */}
        <circle cx="256" cy="256" r="248" stroke="url(#logoGrad)" strokeWidth="10" opacity="0.8"/>
        <circle cx="256" cy="256" r="230" stroke="#22c55e" strokeWidth="2" opacity="0.3"/>

        {/* Chevron / Arrow Shape */}
        <path 
          d="M128 340 L256 160 L384 340" 
          stroke="#22c55e" 
          strokeWidth="45" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          filter="url(#logoGlow)"
        />
        <path 
          d="M128 340 L256 160 L384 340" 
          stroke="#ffffff" 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          opacity="0.9"
        />
        
        {/* Inner Detail */}
        <circle cx="256" cy="280" r="30" fill="#4ade80" fillOpacity="0.2" filter="url(#logoGlow)"/>
      </svg>
    </div>
  );
};
