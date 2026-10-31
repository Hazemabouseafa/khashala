'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Star,
  Flame,
  Heart,
  Camera,
  Phone,
  MessageCircle,
  Clock,
} from 'lucide-react';
import {
  STATUS_LABELS,
  CONDITION_LABELS,
  getCountryByCity,
  formatRelativeTimeAr,
} from '@/lib/constants';

export interface AdCardProps {
  ad: {
    id: string;
    title: string;
    description?: string;
    price: number;
    city: string;
    images?: string[];
    status?: string;
    views?: number;
    condition?: string;
    isFeatured?: boolean;
    isUrgent?: boolean;
    isNegotiable?: boolean;
    createdAt?: string | Date;
    category?: {
      name: string;
      slug: string;
    };
    subcategory?: {
      id: string;
      name: string;
      slug: string;
    } | null;
    user?: {
      id?: string;
      name?: string;
      phone?: string | null;
    } | null;
  };
  variant?: 'grid' | 'list';
}

export const AdCard: React.FC<AdCardProps> = ({ ad, variant = 'grid' }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('khashala_favorites');
      const favs: string[] = raw ? JSON.parse(raw) : [];
      setIsFavorite(favs.includes(ad.id));
    } catch {
      setIsFavorite(false);
    }
  }, [ad.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const raw = localStorage.getItem('khashala_favorites');
      let favs: string[] = raw ? JSON.parse(raw) : [];
      if (favs.includes(ad.id)) {
        favs = favs.filter((id) => id !== ad.id);
        setIsFavorite(false);
      } else {
        favs.push(ad.id);
        setIsFavorite(true);
      }
      localStorage.setItem('khashala_favorites', JSON.stringify(favs));
      window.dispatchEvent(new Event('khashala_fav_updated'));
    } catch (err) {
      console.error(err);
    }
  };

  const rawImage =
    ad.images && ad.images.length > 0
      ? ad.images[0]
      : '/uploads/ads/placeholder.webp';
  const statusInfo = STATUS_LABELS[ad.status || 'ACTIVE'] || STATUS_LABELS.ACTIVE;
  const conditionInfo = ad.condition ? CONDITION_LABELS[ad.condition] : null;

  const country = getCountryByCity(ad.city);
  const currencySymbol = country?.currencySymbol || 'ج.م';
  const formattedPrice = new Intl.NumberFormat('ar-EG').format(ad.price);
  const timeAgo = formatRelativeTimeAr(ad.createdAt);

  const cleanPhone = (ad.user?.phone || '').replace(/[^0-9]/g, '');
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `السلام عليكم، بخصوص إعلانك على خشاله: "${ad.title}"`
      )}`
    : null;

  // ==================== HORIZONTAL LIST CARD (SEARCH & CATEGORY VIEW) ====================
  if (variant === 'list') {
    return (
      <div
        className={`group bg-white rounded-xl border transition-all duration-200 overflow-hidden hover:shadow-md ${
          ad.isFeatured
            ? 'border-amber-400/90 ring-1 ring-amber-300/40'
            : 'border-slate-200/95 hover:border-slate-300'
        }`}
      >
        <div className="flex flex-row items-stretch">
          {/* Right Image Thumbnail */}
          <Link
            href={`/ads/${ad.id}`}
            className="relative w-36 sm:w-64 md:w-72 shrink-0 bg-slate-100 overflow-hidden block"
          >
            <img
              src={rawImage}
              alt={ad.title}
              loading="lazy"
              className="w-full h-full min-h-[138px] sm:min-h-[195px] max-h-[220px] object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Featured / Urgent Badges */}
            <div className="absolute top-2 right-2 z-10 flex flex-wrap gap-1">
              {ad.isFeatured && (
                <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded bg-amber-400 text-slate-950 shadow-xs flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-slate-950" />
                  <span>مميز</span>
                </span>
              )}
              {ad.isUrgent && (
                <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded bg-[#e00000] text-white shadow-xs flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5 fill-white" />
                  <span>عاجل</span>
                </span>
              )}
            </div>

            {/* Photo Counter */}
            {ad.images && ad.images.length > 0 && (
              <div className="absolute bottom-2 left-2 z-10">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  <span>{ad.images.length}</span>
                </span>
              </div>
            )}
          </Link>

          {/* Left Details & Direct Contact Actions */}
          <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
            <div>
              {/* Top Row: Price + Favorite Button */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <Link href={`/ads/${ad.id}`} className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-base sm:text-2xl font-black text-[#e00000] leading-none">
                    {formattedPrice}
                  </span>
                  <span className="text-[11px] sm:text-xs font-extrabold text-[#e00000]">
                    {currencySymbol}
                  </span>
                  {ad.isNegotiable && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      قابل للتفاوض
                    </span>
                  )}
                </Link>

                <button
                  type="button"
                  onClick={toggleFavorite}
                  aria-label="حفظ في المفضلة"
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-[#e00000] transition-colors shrink-0 cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      isFavorite ? 'fill-[#e00000] text-[#e00000]' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Ad Title */}
              <Link href={`/ads/${ad.id}`}>
                <h3 className="text-xs sm:text-base font-extrabold text-[#222222] group-hover:text-[#e00000] transition-colors line-clamp-2 leading-snug mb-1.5">
                  {ad.title}
                </h3>
              </Link>

              {/* Category / Subcategory / Condition Tags */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 mb-2">
                {ad.category?.name && (
                  <span className="font-semibold text-slate-600">
                    {ad.category.name}
                    {ad.subcategory?.name ? ` • ${ad.subcategory.name}` : ''}
                  </span>
                )}
                {conditionInfo && ad.condition !== 'NA' && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                    {conditionInfo.label}
                  </span>
                )}
                {ad.status && ad.status !== 'ACTIVE' && (
                  <span className={`px-1.5 py-0.5 rounded border font-bold text-[10px] ${statusInfo.bg} ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                )}
              </div>

              {/* Short Description on Desktop/Tablet */}
              {ad.description && (
                <p className="hidden sm:line-clamp-2 text-xs text-slate-500 leading-relaxed mb-2">
                  {ad.description}
                </p>
              )}
            </div>

            {/* Bottom Row: Location + Date & Direct Call / WhatsApp Buttons */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 min-w-0">
                <span className="inline-flex items-center gap-1 truncate font-semibold text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{ad.city}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 text-slate-400 shrink-0">
                  <Clock className="w-3 h-3 hidden sm:inline" />
                  <span>{timeAgo}</span>
                </span>
              </div>

              {/* Direct Call & WhatsApp Quick Buttons */}
              <div className="flex items-center gap-1.5">
                {ad.user?.phone ? (
                  <>
                    <a
                      href={`tel:${ad.user.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-red-50 hover:bg-[#e00000] text-[#e00000] hover:text-white border border-red-200 hover:border-[#e00000] text-[11px] sm:text-xs font-extrabold transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>اتصل</span>
                    </a>
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 text-[11px] sm:text-xs font-extrabold transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline sm:inline">واتساب</span>
                      </a>
                    )}
                  </>
                ) : (
                  <Link
                    href={`/ads/${ad.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-colors"
                  >
                    التفاصيل
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== VERTICAL GRID CARD (HOMEPAGE SHELVES & GRID VIEW) ====================
  return (
    <div
      className={`group bg-white rounded-xl border transition-all duration-200 flex flex-col overflow-hidden h-full hover:shadow-md ${
        ad.isFeatured
          ? 'border-amber-400/90 ring-1 ring-amber-300/35'
          : 'border-slate-200/95 hover:border-slate-300'
      }`}
    >
      <Link href={`/ads/${ad.id}`} className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
          <img
            src={rawImage}
            alt={ad.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Top Right Badges */}
          <div className="absolute top-2.5 right-2.5 z-10 flex flex-wrap gap-1">
            {ad.isFeatured && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-400 text-slate-950 shadow-xs flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-slate-950" />
                <span>مميز</span>
              </span>
            )}
            {ad.isUrgent && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#e00000] text-white shadow-xs flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5 fill-white" />
                <span>عاجل</span>
              </span>
            )}
            {ad.status && ad.status !== 'ACTIVE' && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border shadow-xs ${statusInfo.bg} ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            )}
          </div>

          {/* Top Left Favorite Heart */}
          <button
            type="button"
            onClick={toggleFavorite}
            aria-label="إضافة للمفضلة"
            className="absolute top-2.5 left-2.5 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? 'fill-[#e00000] text-[#e00000]' : 'text-slate-700'
              }`}
            />
          </button>

          {/* Bottom Left Photo Count */}
          {ad.images && ad.images.length > 1 && (
            <div className="absolute bottom-2 left-2 z-10">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/65 text-white flex items-center gap-1">
                <Camera className="w-3 h-3" />
                <span>{ad.images.length}</span>
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
          <div>
            {/* Price Row */}
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <div className="flex items-baseline gap-1 min-w-0">
                <span className="text-base sm:text-lg font-black text-[#e00000] truncate">
                  {formattedPrice}
                </span>
                <span className="text-[11px] font-extrabold text-[#e00000] shrink-0">
                  {currencySymbol}
                </span>
              </div>
              {ad.isNegotiable && (
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                  تفاوض
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xs sm:text-sm font-bold text-[#222222] group-hover:text-[#e00000] transition-colors line-clamp-2 leading-snug mb-1.5">
              {ad.title}
            </h3>

            {/* Subcategory / Condition Meta */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-2 truncate">
              {ad.subcategory?.name ? (
                <span className="truncate">{ad.subcategory.name}</span>
              ) : ad.category?.name ? (
                <span className="truncate">{ad.category.name}</span>
              ) : null}
              {conditionInfo && ad.condition !== 'NA' && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-slate-600 shrink-0">
                    {conditionInfo.label}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Bottom Location & Relative Time */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 gap-2">
            <span className="inline-flex items-center gap-1 truncate text-slate-500 font-medium">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{ad.city}</span>
            </span>
            <span className="shrink-0 text-[10px]">{timeAgo}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};
