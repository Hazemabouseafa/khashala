'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Plus, Star, ArrowLeft } from 'lucide-react';

const PROMO_SLIDES = [
  {
    id: 'motors',
    badge: 'سوق السيارات والمركبات',
    title: 'ابحث عن سيارتك القادمة بأفضل سعر ومباشرة من المالك',
    subtitle: 'مئات السيارات المفحوصة والجديدة والمستعملة في جميع المدن العربية بدون وسيط',
    ctaLabel: 'تصفح السيارات الآن',
    ctaHref: '/ads?category=vehicles',
    bgClass: 'from-[#1f2937] via-[#111827] to-[#7f1d1d]',
    image:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80&auto=format&fit=crop',
  },
  {
    id: 'realestate',
    badge: 'عقارات للبيع والإيجار',
    title: 'شقق، فلل، شاليهات ومكاتب تجارية في أرقى الأحياء',
    subtitle: 'قارن الأسعار وتواصل مع الملاك والمعلنين فوراً عبر الهاتف أو واتساب',
    ctaLabel: 'استكشف العقارات',
    ctaHref: '/ads?category=real-estate',
    bgClass: 'from-[#111827] via-[#1e293b] to-[#991b1b]',
    image:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop',
  },
  {
    id: 'sell-fast',
    badge: 'انشر مجاناً في 60 ثانية',
    title: 'عندك سيارة أو عقار أو موبايل حابب تبيعه بسرعة؟',
    subtitle: 'أضف إعلانك مجاناً على خشاله أو ميّزه ليظهر في صدارة القسم ويحقق أعلى المشاهدات',
    ctaLabel: 'أضف إعلانك مجاناً',
    ctaHref: '/ads/create',
    bgClass: 'from-[#b91c1c] via-[#dc2626] to-[#1f2937]',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80&auto=format&fit=crop',
  },
];

export const HeroSection: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const current = PROMO_SLIDES[activeSlide];

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-5">
      <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#111827] h-[178px] sm:h-[240px] lg:h-[280px] shadow-xs border border-slate-200/60">
        {/* Background Photo + Gradient Overlay */}
        <img
          src={current.image}
          alt={current.title}
          className="absolute inset-0 w-full h-full object-cover opacity-35 transition-all duration-500"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-l ${current.bgClass} opacity-85`}
        />

        {/* Banner Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-5 sm:px-10 lg:px-14 max-w-2xl text-white">
          <span className="inline-flex items-center gap-1.5 self-start text-[10px] sm:text-xs font-extrabold bg-white/15 backdrop-blur-xs px-2.5 py-1 rounded-md mb-2 sm:mb-3 border border-white/20">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{current.badge}</span>
          </span>

          <h1 className="text-base sm:text-2xl lg:text-3xl font-black leading-snug mb-1.5 sm:mb-2.5 line-clamp-2">
            {current.title}
          </h1>

          <p className="hidden sm:block text-xs sm:text-sm text-slate-200 mb-4 line-clamp-1">
            {current.subtitle}
          </p>

          <div className="flex items-center gap-2.5 mt-1 sm:mt-0">
            <Link
              href={current.ctaHref}
              className="inline-flex items-center gap-1.5 bg-[#e00000] hover:bg-[#c20000] text-white font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-md transition-colors"
            >
              {current.id === 'sell-fast' ? (
                <Plus className="w-4 h-4 stroke-[2.8]" />
              ) : null}
              <span>{current.ctaLabel}</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Navigation Arrows (Desktop/Tablet) */}
        <button
          type="button"
          onClick={() =>
            setActiveSlide((prev) =>
              prev === 0 ? PROMO_SLIDES.length - 1 : prev - 1
            )
          }
          aria-label="السابق"
          className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 text-white items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveSlide((prev) => (prev + 1) % PROMO_SLIDES.length)
          }
          aria-label="التالي"
          className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 text-white items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Slide Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {PROMO_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSlide(idx)}
              aria-label={`انتقل إلى الشريحة ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === activeSlide
                  ? 'w-6 bg-[#e00000]'
                  : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
