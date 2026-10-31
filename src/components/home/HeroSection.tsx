'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Star, ArrowLeft } from 'lucide-react';
import {
  BANNER_OVERLAY_CLASSES,
  BANNER_OVERLAY_STYLES,
  BannerPlacement,
  DEFAULT_HOME_BANNERS,
  DEFAULT_SECONDARY_BANNERS,
  HomeBannerItem,
} from '@/lib/banners';

interface HeroSectionProps {
  initialBanners?: HomeBannerItem[];
  placement?: BannerPlacement;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  initialBanners,
  placement = 'top',
}) => {
  const defaultList =
    placement === 'after_categories'
      ? DEFAULT_SECONDARY_BANNERS
      : DEFAULT_HOME_BANNERS;

  const [banners, setBanners] = useState<HomeBannerItem[]>(
    initialBanners !== undefined ? initialBanners : defaultList
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (initialBanners !== undefined) {
      setBanners(initialBanners);
    }
  }, [initialBanners]);

  useEffect(() => {
    const refreshFromApi = async () => {
      try {
        const res = await fetch('/api/admin/banners', { cache: 'no-store' });
        const data = await res.json();
        const targetList =
          placement === 'after_categories'
            ? data.secondaryBanners
            : data.banners;
        if (Array.isArray(targetList)) {
          setBanners(targetList);
        }
      } catch {}
    };

    window.addEventListener('khashala_banners_updated', refreshFromApi);
    return () => {
      window.removeEventListener('khashala_banners_updated', refreshFromApi);
    };
  }, [placement]);

  const activeBanners = banners.filter((b) => b.isActive !== false);

  useEffect(() => {
    if (activeSlide >= activeBanners.length) {
      setActiveSlide(0);
    }
  }, [activeBanners.length, activeSlide]);

  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;
    const intervalMs = placement === 'after_categories' ? 6200 : 5500;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % activeBanners.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [activeBanners.length, isPaused, placement]);

  if (activeBanners.length === 0) {
    return null;
  }

  const safeIndex = activeSlide < activeBanners.length ? activeSlide : 0;
  const current = activeBanners[safeIndex];
  const themeKey = current.overlayTheme || 'light_scrim';
  const overlayClass =
    BANNER_OVERLAY_CLASSES[themeKey] || BANNER_OVERLAY_CLASSES.light_scrim;
  const overlayStyle =
    BANNER_OVERLAY_STYLES[themeKey] ?? BANNER_OVERLAY_STYLES.light_scrim;

  const goPrev = () => {
    setActiveSlide((prev) =>
      prev === 0 ? activeBanners.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    setActiveSlide((prev) => (prev + 1) % activeBanners.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || activeBanners.length <= 1) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(diff) < 40) return;
    if (diff > 0) {
      goNext();
    } else {
      goPrev();
    }
  };

  return (
    <section
      className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 ${
        placement === 'top' ? 'pt-3 sm:pt-5' : 'pt-1'
      }`}
    >
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#111827] h-[184px] sm:h-[248px] lg:h-[296px] shadow-xs border border-slate-200/70 select-none"
      >
        {current.displayMode === 'image_only' ? (
          /* Full-Bleed Image-Only Poster (Clickable Entire Banner) */
          <Link
            href={current.ctaHref || '/ads'}
            className="block w-full h-full relative"
          >
            <img
              src={current.image}
              alt={current.title || 'بوستر خشاله'}
              className="w-full h-full object-cover"
            />
          </Link>
        ) : (
          /* Poster Image + Subtle Scrim & Crisp Text */
          <>
            <img
              src={current.image}
              alt={current.title || 'بوستر خشاله'}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
            />
            {themeKey !== 'none' && (
              <>
                <div
                  className={`absolute inset-0 pointer-events-none ${overlayClass}`}
                  style={{ backgroundImage: overlayStyle }}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(to top, rgba(0,0,0,0.32) 0%, transparent 100%)',
                  }}
                />
              </>
            )}

            <div className="relative z-10 h-full flex flex-col justify-center px-5 sm:px-10 lg:px-14 max-w-2xl text-white">
              {current.badge && (
                <span className="inline-flex items-center gap-1.5 self-start text-[10px] sm:text-xs font-extrabold bg-black/35 backdrop-blur-sm px-2.5 py-1 rounded-md mb-2 sm:mb-3 border border-white/25 shadow-sm">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                  <span>{current.badge}</span>
                </span>
              )}

              {current.title && (
                <h2
                  className="text-base sm:text-2xl lg:text-3xl font-black leading-snug mb-1.5 sm:mb-2.5 line-clamp-2 drop-shadow-md"
                  style={{ textShadow: '0 2px 12px rgba(0, 0, 0, 0.55)' }}
                >
                  {current.title}
                </h2>
              )}

              {current.subtitle && (
                <p
                  className="hidden sm:block text-xs sm:text-sm text-white/95 font-medium mb-4 line-clamp-2 drop-shadow"
                  style={{ textShadow: '0 1px 8px rgba(0, 0, 0, 0.5)' }}
                >
                  {current.subtitle}
                </p>
              )}

              {current.ctaLabel && (
                <div className="flex items-center gap-2.5 mt-1 sm:mt-0">
                  <Link
                    href={current.ctaHref || '/ads'}
                    className="inline-flex items-center gap-1.5 bg-[#e00000] hover:bg-[#c20000] text-white font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-lg transition-colors"
                  >
                    <span>{current.ctaLabel}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </>
        )}

        {/* Navigation Arrows (when > 1 active poster) */}
        {activeBanners.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="السابق"
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/45 hover:bg-black/70 text-white items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="التالي"
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/45 hover:bg-black/70 text-white items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Slide Indicator Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
              {activeBanners.map((b, idx) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  aria-label={`انتقل إلى البوستر ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === safeIndex
                      ? 'w-6 bg-[#e00000]'
                      : 'w-2 bg-white/55 hover:bg-white/90'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
