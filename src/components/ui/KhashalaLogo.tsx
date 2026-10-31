'use client';

import React from 'react';
import Link from 'next/link';
import { useBranding } from '@/components/providers/BrandingProvider';

export interface KhashalaLogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'dark' | 'light'; // dark = for light background, light = for dark background
  showSubtitle?: boolean;
  className?: string;
  asLink?: boolean;
  overrideSrc?: string;
}

export const KhashalaLogo: React.FC<KhashalaLogoProps> = ({
  variant = 'full',
  size = 'md',
  theme = 'dark',
  className = '',
  asLink = true,
  overrideSrc,
}) => {
  const { siteLogoUrl } = useBranding();

  // Height sizing
  const sizes = {
    sm: { h: 'h-10', w: 'w-auto max-w-[150px]' },
    md: { h: 'h-12 sm:h-14', w: 'w-auto max-w-[190px]' },
    lg: { h: 'h-18 sm:h-20', w: 'w-auto max-w-[240px]' },
    xl: { h: 'h-24 sm:h-28', w: 'w-auto max-w-[300px]' },
  }[size];

  // Glow filter for dark backgrounds (Footer & Admin Banner)
  const themeFilter =
    theme === 'light'
      ? 'filter drop-shadow-[0_2px_12px_rgba(255,255,255,0.45)] brightness-105'
      : 'filter drop-shadow-[0_2px_8px_rgba(15,23,42,0.08)]';

  const defaultSrc = variant === 'icon' ? '/logo-icon.png' : '/logo.png';
  const logoSrc = overrideSrc !== undefined
    ? overrideSrc || defaultSrc
    : siteLogoUrl && siteLogoUrl.trim().length > 0
    ? siteLogoUrl.trim()
    : defaultSrc;

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
