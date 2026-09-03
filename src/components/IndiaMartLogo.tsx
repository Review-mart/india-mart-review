'use client';

import React from 'react';

interface IndiaMartLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const IndiaMartLogo: React.FC<IndiaMartLogoProps> = ({ size = 'md', className = '' }) => {
  const logoHeights = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24',
  };

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <img
        src="/image.png"
        alt="IndiaMART Logo"
        className={`${logoHeights[size]} w-auto object-contain`}
      />
    </div>
  );
};
