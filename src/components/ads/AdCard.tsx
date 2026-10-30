'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Eye, Star, Flame, Heart, CheckCircle2 } from 'lucide-react';
import { STATUS_LABELS, CONDITION_LABELS, getCountryByCity } from '@/lib/constants';

export interface AdCardProps {
  ad: {
    id: string;
    title: string;
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
  };
}

export const AdCard: React.FC<AdCardProps> = ({ ad }) => {
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
  const currencySymbol = country?.currencySymbol || 'ر.س';
  const formattedPrice = new Intl.NumberFormat('ar-SA').format(ad.price);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`group bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden will-change-transform transform-gpu ${
        ad.isFeatured
          ? 'border-amber-300 ring-1 ring-amber-300/50'
          : 'border-blue-200/80 hover:border-brand-400'
      }`}
    >
      <Link href={`/ads/${ad.id}`} className="flex flex-col h-full">
        {/* Image Container with Smooth Zoom effect */}
        <div className="relative aspect-[4/3] w-full bg-blue-50 overflow-hidden">
          <img
            src={rawImage}
            alt={ad.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108 will-change-transform"
          />

          {/* Top Right Badges: Featured / Urgent / Status */}
          <div className="absolute top-3 right-3 z-10 flex flex-wrap gap-1.5">
            {ad.isFeatured && (
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 shadow-md flex items-center gap-1">
                <Star className="w-3 h-3 fill-slate-950" />
                <span>مميز</span>
              </span>
            )}
            {ad.isUrgent && (
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-orange-600 text-white shadow-md flex items-center gap-1">
                <Flame className="w-3 h-3 fill-white" />
                <span>عاجل</span>
              </span>
            )}
            {ad.status && ad.status !== 'ACTIVE' && (
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md ${statusInfo.bg} ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            )}
          </div>

          {/* Top Left: Favorite Heart Toggle */}
          <button
            type="button"
            onClick={toggleFavorite}
            aria-label="إضافة للمفضلة"
            className={`absolute top-3 left-3 z-20 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm ${
              isFavorite
                ? 'bg-rose-500 text-white scale-105'
                : 'bg-white/85 hover:bg-white text-slate-700 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
          </button>

          {/* Bottom Right: Category + Subcategory Tag overlay */}
          {ad.category?.name && (
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-navy-900/85 text-white backdrop-blur-md shadow-xs">
                {ad.category.name}
                {ad.subcategory?.name ? ` • ${ad.subcategory.name}` : ''}
              </span>
            </div>
          )}

          {/* Photo count indicator if multiple */}
          {ad.images && ad.images.length > 1 && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-navy-950/75 text-white backdrop-blur-xs flex items-center gap-1">
                <span>{ad.images.length} صور</span>
              </span>
            </div>
          )}
        </div>

        {/* Ad Details */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Price + Negotiable Badge */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-brand-600">
                  {formattedPrice}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {currencySymbol}
                </span>
              </div>

              {ad.isNegotiable && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-brand-700 border border-blue-200">
                  قابل للتفاوض
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug mb-2">
              {ad.title}
            </h3>

            {/* Condition Pill */}
            {conditionInfo && ad.condition !== 'NA' && (
              <div className="mb-2.5">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${conditionInfo.color}`}
                >
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>{conditionInfo.label}</span>
                </span>
              </div>
            )}
          </div>

          {/* Meta footer: City, Country Flag & Views */}
          <div className="pt-3 border-t border-blue-100/80 flex items-center justify-between text-xs text-slate-500">
            <div
              className="flex items-center gap-1 truncate max-w-[180px]"
              title={`${ad.city} - ${country?.name || ''}`}
            >
              <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              <span className="truncate font-semibold text-slate-700">{ad.city}</span>
              {country && (
                <span className="text-[11px] text-slate-400 shrink-0">
                  {country.flag} {country.shortName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {ad.views !== undefined && (
                <div className="flex items-center gap-1 text-slate-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{ad.views}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
