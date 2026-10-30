'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Layers, Sparkles } from 'lucide-react';
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Main Categories Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-600" />
            <span>تصفح الأقسام الرئيسية والفرعية</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            اضغط على أي قسم رئيسي لاستعراض أقسامه الفرعية بنفس التصميم أو تصفح كل إعلاناته مباشرة
          </p>
        </div>
        <Link
          href="/ads"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-700 bg-white/90 hover:bg-white px-4 py-2 rounded-xl border border-blue-200 shadow-2xs transition-all"
        >
          <span>تصفح جميع الإعلانات</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* 1. Main Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
        {displayCategories.map((cat: any, idx: number) => {
          const isSelected = selectedCatSlug === cat.slug;
          return (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              whileHover={{ y: -5 }}
            >
              <button
                type="button"
                onClick={() =>
                  setSelectedCatSlug(isSelected ? null : cat.slug)
                }
                className={`w-full group flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 text-center cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-brand-600 to-blue-700 text-white border-brand-600 shadow-lg shadow-brand-600/25'
                    : 'bg-white/95 hover:bg-white text-slate-800 border-blue-200/80 hover:border-brand-400 hover:shadow-md'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors duration-300 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-50 group-hover:bg-brand-600 text-brand-600 group-hover:text-white'
                  }`}
                >
                  <CategoryIcon name={cat.icon} className="w-6 h-6 stroke-[1.9]" />
                </div>
                <span
                  className={`text-xs font-bold transition-colors line-clamp-1 ${
                    isSelected ? 'text-white' : 'text-slate-800 group-hover:text-brand-600'
                  }`}
                >
                  {cat.name}
                </span>
                <span
                  className={`text-[10px] mt-1 font-semibold ${
                    isSelected ? 'text-sky-200' : 'text-slate-400'
                  }`}
                >
                  {cat.subcategories?.length || 0} قسم فرعي
                </span>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* 2. Subcategories Grid — Displayed in the EXACT SAME CARD STYLE as Main Categories */}
      <AnimatePresence mode="wait">
        {activeCategory &&
          activeCategory.subcategories &&
          activeCategory.subcategories.length > 0 && (
            <motion.div
              key={activeCategory.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="p-6 bg-white/85 backdrop-blur-md rounded-3xl border border-blue-200/90 shadow-sm space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-xs">
                    <CategoryIcon name={activeCategory.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>الأقسام الفرعية في {activeCategory.name}</span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-brand-700">
                        {activeCategory.subcategories.length} أقسام فرعية
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      اختر القسم الفرعي المطلوب لعرض إعلاناته المخصصة فوراً
                    </p>
                  </div>
                </div>

                <Link
                  href={`/ads?category=${activeCategory.slug}`}
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <span>عرض كل إعلانات {activeCategory.name}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Subcategory Cards (Identical Visual Design to Category Cards!) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
                {activeCategory.subcategories.map((sub: any, idx: number) => {
                  const subId = sub.id || sub;
                  const subName = sub.name || sub;
                  const subIcon = sub.icon || activeCategory.icon || 'Tag';
                  const adsCount = sub._count?.ads;

                  return (
                    <motion.div
                      key={subId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      whileHover={{ y: -5 }}
                    >
                      <Link
                        href={`/ads?category=${activeCategory.slug}&subcategory=${encodeURIComponent(
                          sub.id || sub.slug || subName
                        )}`}
                        className="group flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50/50 to-white rounded-2xl border border-blue-200/80 hover:border-brand-500 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-300 text-center h-full"
                      >
                        <div className="w-13 h-13 p-3.5 rounded-2xl bg-blue-100/80 group-hover:bg-brand-600 text-brand-600 group-hover:text-white flex items-center justify-center mb-3 transition-colors duration-300 shadow-2xs">
                          <CategoryIcon name={subIcon} className="w-6 h-6 stroke-[1.8]" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors line-clamp-1">
                          {subName}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 mt-1">
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
