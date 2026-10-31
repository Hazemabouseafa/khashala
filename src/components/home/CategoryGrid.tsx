'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Layers } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CATEGORIES_DATA } from '@/lib/constants';

export const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCatSlug, setSelectedCatSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
          setSelectedCatSlug(data.categories[0].slug);
        }
      })
      .catch(() => {});
  }, []);

  const displayCategories = categories.length > 0 ? categories : CATEGORIES_DATA;
  const activeCategory = displayCategories.find((c) => c.slug === selectedCatSlug);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
      {/* Main Categories Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6 platform-icon-tint shrink-0" />
            <span>تصفح الأقسام الرئيسية والفرعية</span>
          </h2>
          <p className="text-[11px] sm:text-sm text-slate-600 mt-1">
            اسحب أفقياً واختر أي قسم لاستعراض أقسامه الفرعية أو تصفح إعلاناته فوراً
          </p>
        </div>
        <Link
          href="/ads"
          className="shrink-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800 bg-white/95 hover:bg-white px-3.5 py-2 rounded-xl border border-blue-200 shadow-2xs transition-all"
        >
          <span>الكل</span>
          <ArrowLeft className="w-4 h-4 platform-icon-tint" />
        </Link>
      </div>

      {/* 1. Main Categories — Horizontal Swipeable Row on Mobile & Tablet, Full Grid on Desktop */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3 pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-8 lg:gap-3.5">
        {displayCategories.map((cat: any, idx: number) => {
          const isSelected = selectedCatSlug === cat.slug;
          return (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: idx * 0.03 }}
              whileHover={{ y: -4 }}
              className="w-[100px] sm:w-[122px] lg:w-auto shrink-0 snap-start"
            >
              <button
                type="button"
                onClick={() => setSelectedCatSlug(isSelected ? null : cat.slug)}
                className={`w-full h-full group flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all duration-300 text-center cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-900 border-2 shadow-lg ring-2 ring-offset-1'
                    : 'bg-white/95 hover:bg-white text-slate-800 border-blue-200/80 hover:shadow-md'
                }`}
                style={
                  isSelected
                    ? {
                        borderColor: 'var(--platform-icon-color)',
                        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.09)',
                      }
                    : undefined
                }
              >
                <div
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-2.5 transition-all duration-300 ${
                    isSelected
                      ? 'platform-icon-active scale-105'
                      : 'platform-icon-box platform-icon-box-hover'
                  }`}
                >
                  <CategoryIcon name={cat.icon} className="w-6 h-6 stroke-[1.9]" />
                </div>
                <span className="text-[11px] sm:text-xs font-extrabold text-slate-900 line-clamp-1 leading-snug">
                  {cat.name}
                </span>
                <span className="text-[10px] mt-0.5 font-semibold text-slate-400 whitespace-nowrap">
                  {cat.subcategories?.length || 0} قسم فرعي
                </span>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* 2. Subcategories — Also Horizontal Swipeable Row on Mobile, Grid on Desktop */}
      <AnimatePresence mode="wait">
        {activeCategory &&
          activeCategory.subcategories &&
          activeCategory.subcategories.length > 0 && (
            <motion.div
              key={activeCategory.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="p-4 sm:p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-blue-200/90 shadow-sm space-y-4 sm:space-y-5"
            >
              <div className="flex flex-row items-center justify-between gap-3 border-b border-blue-100 pb-3.5">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl platform-icon-box flex items-center justify-center shrink-0">
                    <CategoryIcon name={activeCategory.icon} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2 flex-wrap">
                      <span className="truncate">الأقسام الفرعية في {activeCategory.name}</span>
                      <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                        {activeCategory.subcategories.length} فرعي
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 hidden sm:block">
                      اختر القسم الفرعي المطلوب لعرض إعلاناته المخصصة فوراً
                    </p>
                  </div>
                </div>

                <Link
                  href={`/ads?category=${activeCategory.slug}`}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl platform-icon-active text-xs font-bold shadow-xs transition-opacity hover:opacity-95"
                >
                  <span className="hidden sm:inline">كل إعلانات {activeCategory.name}</span>
                  <span className="sm:hidden">عرض الكل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Subcategory Cards — Horizontal Scroll on Mobile, Grid on Desktop */}
              <div className="flex flex-nowrap overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3 pb-1.5 -mx-2 px-2 md:mx-0 md:px-0 md:grid md:grid-cols-6 md:gap-3.5">
                {activeCategory.subcategories.map((sub: any, idx: number) => {
                  const subId = sub.id || sub;
                  const subName = sub.name || sub;
                  const subIcon = sub.icon || activeCategory.icon || 'Tag';
                  const adsCount = sub._count?.ads;

                  return (
                    <motion.div
                      key={subId}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: idx * 0.025 }}
                      whileHover={{ y: -4 }}
                      className="w-[106px] sm:w-[125px] md:w-auto shrink-0 snap-start"
                    >
                      <Link
                        href={`/ads?category=${activeCategory.slug}&subcategory=${encodeURIComponent(
                          sub.id || sub.slug || subName
                        )}`}
                        className="group flex flex-col items-center justify-center p-3.5 sm:p-4 bg-gradient-to-b from-slate-50/70 to-white rounded-2xl border border-blue-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-300 text-center h-full"
                      >
                        <div className="w-12 h-12 rounded-2xl platform-icon-box platform-icon-box-hover flex items-center justify-center mb-2.5">
                          <CategoryIcon name={subIcon} className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
                        </div>
                        <span className="text-[11px] sm:text-xs font-bold text-slate-800 line-clamp-1">
                          {subName}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 mt-0.5 whitespace-nowrap">
                          {adsCount !== undefined ? `${adsCount} إعلان` : 'تصفح القسم'}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </section>
  );
};
