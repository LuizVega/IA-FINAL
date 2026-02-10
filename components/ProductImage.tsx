
import React, { useState } from 'react';
import { AppLogo } from './AppLogo';
import { DEFAULT_PRODUCT_IMAGE } from '../constants';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ src, alt, className }) => {
  const [hasError, setHasError] = useState(false);

  // Aggressive check: If null, empty, default constant, or too short to be a URL
  const shouldShowDefault = !src || src.trim() === '' || src === DEFAULT_PRODUCT_IMAGE || src.length < 5 || hasError;

  if (shouldShowDefault) {
    return (
      <div className={`flex items-center justify-center bg-[#080808] relative overflow-hidden ${className}`}>
        {/* Subtle background glow for aesthetics */}
        <div className="absolute inset-0 bg-green-900/10 blur-xl"></div> 
        <AppLogo className="w-1/2 h-1/2 relative z-10" withGlow />
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};
