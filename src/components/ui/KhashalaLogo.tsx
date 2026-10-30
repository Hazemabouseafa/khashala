'use client';

import React from 'react';
import Link from 'next/link';

export interface KhashalaLogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'dark' | 'light'; // dark = for light background, light = for dark background
  showSubtitle?: boolean;
  className?: string;
  asLink?: boolean;
}

export const KhashalaLogo: React.FC<KhashalaLogoProps> = ({
  variant = 'full',
  size = 'md',
  theme = 'dark',
  className = '',
  asLink = true,
}) => {
  // Height sizing (aspect ratio of transparent logo is 334 / 351 ≈ 0.95)
  const sizes = {
    sm: { h: 'h-10', w: 'w-auto' },
    md: { h: 'h-13 sm:h-14', w: 'w-auto' },
    lg: { h: 'h-18 sm:h-20', w: 'w-auto' },
    xl: { h: 'h-24 sm:h-28', w: 'w-auto' },
  }[size];

  // Glow filter for dark backgrounds (Footer & Admin Banner) so the Navy text pops brilliantly
  const themeFilter =
    theme === 'light'
      ? 'filter drop-shadow-[0_2px_12px_rgba(255,255,255,0.45)] brightness-105'
      : 'filter drop-shadow-[0_2px_8px_rgba(15,23,42,0.08)]';

  const logoSrc = variant === 'icon' ? '/logo-icon.png' : '/logo.png';

  const imageElement = (
    <div
      className={`inline-flex items-center justify-center select-none transition-transform duration-300 hover:scale-105 ${className}`}
    >
      <img
        src={logoSrc}
        alt="شعار خُشاله - Khashala"
        className={`${sizes.h} ${sizes.w} object-contain ${themeFilter}`}
        loading="eager"
      />
    </div>
  );

  if (asLink) {
    return (
      <Link
        href="/"
        className="inline-block group focus:outline-none"
        aria-label="الصفحة الرئيسية لمنصة خُشاله"
      >
        {imageElement}
      </Link>
    );
  }

  return imageElement;
};

export default KhashalaLogo;
