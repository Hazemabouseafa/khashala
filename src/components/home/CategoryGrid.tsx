'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-5 sm:pt-7 space-y-4">
      {/* Section Heading */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-xl font-black text-[#222222]">
          كل الأقسام
        </h2>
        <Link
          href="/ads"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-[#e00000] hover:underline"
        >
          <span>عرض جميع الإعلانات</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* 1. Main Categories — Horizontal Swipeable Icon Strip on Mobile, 8-Column Row on Desktop */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3 sm:gap-4 pb-1 -mx-3 px-3 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-8">
        {displayCategories.map((cat: any) => {
          const isSelected = selectedCatSlug === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setSelectedCatSlug(isSelected ? null : cat.slug)}
              className="w-[82px] sm:w-[98px] lg:w-auto shrink-0 snap-start group flex flex-col items-center text-center cursor-pointer focus:outline-none"
            >
              <div
                className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center mb-2 transition-all duration-200 ${
                  isSelected
                    ? 'platform-icon-active scale-105 ring-4 ring-red-100'
                    : 'platform-icon-box platform-icon-box-hover bg-white'
                }`}
              >
                <CategoryIcon name={cat.icon} className="w-7 h-7 stroke-[1.9]" />
              </div>
              <span
                className={`text-[11px] sm:text-xs font-extrabold leading-tight line-clamp-2 ${
                  isSelected
                    ? 'text-[#e00000]'
                    : 'text-[#222222] group-hover:text-[#e00000]'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Subcategories Horizontal Strip for Selected Category */}
      {activeCategory &&
        activeCategory.subcategories &&
        activeCategory.subcategories.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200/95 p-3 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">
                تصفح {activeCategory.name}:
              </span>
              <Link
                href={`/ads?category=${encodeURIComponent(activeCategory.slug)}`}
                className="shrink-0 inline-flex items-center gap-1 text-xs font-extrabold text-[#e00000] hover:underline"
              >
                <span>كل إعلانات {activeCategory.name}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-nowrap overflow-x-auto no-scrollbar snap-x snap-mandatory gap-2 pb-0.5">
              {activeCategory.subcategories.map((sub: any) => {
                const subId = sub.id || sub.slug || sub;
                const subName = sub.name || sub;
                const subIcon = sub.icon || activeCategory.icon || 'Tag';
                const count = sub._count?.ads;

                return (
                  <Link
                    key={subId}
                    href={`/ads?category=${encodeURIComponent(
                      activeCategory.slug
                    )}&subcategory=${encodeURIComponent(subId)}`}
                    className="group shrink-0 snap-start inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f7f8fa] hover:bg-red-50/70 border border-slate-200/90 hover:border-[#e00000]/40 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-full platform-icon-box flex items-center justify-center shrink-0">
                      <CategoryIcon name={subIcon} className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-[#e00000] whitespace-nowrap">
                      {subName}
                    </span>
                    {count !== undefined && (
                      <span className="text-[10px] font-bold text-slate-400">
                        ({count})
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
    </section>
  );
};
