'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { AdCard } from '@/components/ads/AdCard';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ARAB_COUNTRIES, CATEGORIES_DATA, getCitiesByCountry } from '@/lib/constants';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  MapPin,
  Loader2,
  X,
  Globe,
  Star,
  Flame,
  Heart,
  LayoutList,
  LayoutGrid,
  ChevronLeft,
  ArrowUpDown,
} from 'lucide-react';

function SearchAndFilterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter States
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [subcategory, setSubcategory] = useState(searchParams.get('subcategory') || '');
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [userIdFilter, setUserIdFilter] = useState(searchParams.get('userId') || '');
  const [isFeatured, setIsFeatured] = useState(searchParams.get('isFeatured') === 'true');
  const [isUrgent, setIsUrgent] = useState(searchParams.get('isUrgent') === 'true');
  const [isNegotiable, setIsNegotiable] = useState(searchParams.get('isNegotiable') === 'true');
  const [onlyFavorites, setOnlyFavorites] = useState(searchParams.get('favorites') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'featured_first');

  // View Mode: 'list' (default classifieds horizontal rows) | 'grid' (2-col mobile / 3-col desktop)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const [liveCategories, setLiveCategories] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setLiveCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  // Close mobile drawer on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileFilterOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Sync states from URL params
  useEffect(() => {
    setQ(searchParams.get('q') || '');
    setCategory(searchParams.get('category') || '');
    setSubcategory(searchParams.get('subcategory') || '');
    setCountry(searchParams.get('country') || '');
    setCity(searchParams.get('city') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setCondition(searchParams.get('condition') || '');
    setUserIdFilter(searchParams.get('userId') || '');
    setIsFeatured(searchParams.get('isFeatured') === 'true');
    setIsUrgent(searchParams.get('isUrgent') === 'true');
    setIsNegotiable(searchParams.get('isNegotiable') === 'true');
    setOnlyFavorites(searchParams.get('favorites') === 'true');
    setSort(searchParams.get('sort') || 'featured_first');
  }, [searchParams]);

  // Fetch matching ads
  useEffect(() => {
    const fetchAds = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (category && category !== 'all') params.set('category', category);
        if (subcategory && subcategory !== 'all') params.set('subcategory', subcategory);
        if (country && country !== 'all') params.set('country', country);
        if (city && city !== 'all') params.set('city', city);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (condition && condition !== 'all') params.set('condition', condition);
        if (userIdFilter) params.set('userId', userIdFilter);
        if (isFeatured) params.set('isFeatured', 'true');
        if (isUrgent) params.set('isUrgent', 'true');
        if (isNegotiable) params.set('isNegotiable', 'true');
        if (sort) params.set('sort', sort);

        if (onlyFavorites) {
          const raw = localStorage.getItem('khashala_favorites');
          const favIds: string[] = raw ? JSON.parse(raw) : [];
          if (favIds.length === 0) {
            setAds([]);
            setIsLoading(false);
            return;
          }
          params.set('ids', favIds.join(','));
        }

        const res = await fetch(`/api/ads?${params.toString()}`);
        const data = await res.json();
        setAds(data.ads || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAds();
  }, [
    q,
    category,
    subcategory,
    country,
    city,
    minPrice,
    maxPrice,
    condition,
    userIdFilter,
    isFeatured,
    isUrgent,
    isNegotiable,
    onlyFavorites,
    sort,
  ]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (subcategory) params.set('subcategory', subcategory);
    if (country) params.set('country', country);
    if (city) params.set('city', city);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (condition) params.set('condition', condition);
    if (userIdFilter) params.set('userId', userIdFilter);
    if (isFeatured) params.set('isFeatured', 'true');
    if (isUrgent) params.set('isUrgent', 'true');
    if (isNegotiable) params.set('isNegotiable', 'true');
    if (onlyFavorites) params.set('favorites', 'true');
    if (sort) params.set('sort', sort);

    router.push(`/ads?${params.toString()}`);
    setIsMobileFilterOpen(false);
  };

  const resetFilters = () => {
    setQ('');
    setCategory('');
    setSubcategory('');
    setCountry('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setCondition('');
    setUserIdFilter('');
    setIsFeatured(false);
    setIsUrgent(false);
    setIsNegotiable(false);
    setOnlyFavorites(false);
    setSort('featured_first');
    router.push('/ads');
    setIsMobileFilterOpen(false);
  };

  const categoriesList = liveCategories.length > 0 ? liveCategories : CATEGORIES_DATA;
  const activeCatObj = categoriesList.find(
    (c: any) => c.slug === category || c.id === category
  );
  const currentSubcategories: any[] = activeCatObj?.subcategories || [];
  const activeSubObj = currentSubcategories.find(
    (s: any) => s.id === subcategory || s.slug === subcategory || s.name === subcategory
  );

  const activeFiltersCount = [
    category,
    subcategory,
    country,
    city,
    minPrice,
    maxPrice,
    condition,
    isFeatured ? '1' : '',
    isUrgent ? '1' : '',
    isNegotiable ? '1' : '',
  ].filter(Boolean).length;

  const sellerName =
    userIdFilter && ads.length > 0 && ads[0]?.user?.name
      ? ads[0].user.name
      : null;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
      {/* 1. Breadcrumbs */}
      <nav
        aria-label="مسار التنقل"
        className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto no-scrollbar whitespace-nowrap"
      >
        <Link href="/" className="hover:text-[#e00000] font-semibold">
          الرئيسية
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link
          href="/ads"
          onClick={() => {
            if (category) {
              setCategory('');
              setSubcategory('');
            }
          }}
          className={`hover:text-[#e00000] ${
            !activeCatObj ? 'font-bold text-slate-900' : 'font-semibold'
          }`}
        >
          جميع الإعلانات
        </Link>
        {activeCatObj && (
          <>
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              type="button"
              onClick={() => setSubcategory('')}
              className={`hover:text-[#e00000] cursor-pointer ${
                !activeSubObj ? 'font-bold text-slate-900' : 'font-semibold'
              }`}
            >
              {activeCatObj.name}
            </button>
          </>
        )}
        {activeSubObj && (
          <>
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-bold text-slate-900">{activeSubObj.name}</span>
          </>
        )}
      </nav>

      {/* 2. Page Heading & Result Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-[#222222] flex items-center gap-2 flex-wrap">
            {onlyFavorites ? (
              <>
                <Heart className="w-6 h-6 text-[#e00000] fill-[#e00000]" />
                <span>إعلاناتي المفضلة</span>
              </>
            ) : sellerName ? (
              <span>جميع إعلانات المعلن: {sellerName}</span>
            ) : activeSubObj ? (
              <span>
                {activeSubObj.name} {city ? `في ${city}` : 'للبيع'}
              </span>
            ) : activeCatObj ? (
              <span>
                {activeCatObj.name} {city ? `في ${city}` : ''}
              </span>
            ) : q ? (
              <span>نتائج البحث عن &quot;{q}&quot;</span>
            ) : (
              <span>جميع الإعلانات المبوبة {city ? `في ${city}` : ''}</span>
            )}
            {!isLoading && (
              <span className="text-xs sm:text-sm font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
                {ads.length} إعلان
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* 3. Mobile Sticky Filter & Sort Quick Pills Bar */}
      <div className="lg:hidden sticky top-[106px] z-30 -mx-3 px-3 py-2 bg-[#f7f8fa]/95 backdrop-blur-md border-y border-slate-200/80">
        <div className="flex items-center flex-nowrap overflow-x-auto no-scrollbar gap-2">
          {/* Open Full Filter Drawer */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border transition-colors ${
              activeFiltersCount > 0
                ? 'bg-[#222222] text-white border-[#222222]'
                : 'bg-white text-slate-800 border-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>فلترة</span>
            {activeFiltersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#e00000] text-white text-[10px]">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Quick Sort Select Pill */}
          <div className="shrink-0 relative inline-flex items-center bg-white border border-slate-300 rounded-full px-3 py-1.5 text-xs font-bold text-slate-800">
            <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-slate-500" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent outline-none font-bold text-xs cursor-pointer"
            >
              <option value="featured_first">المميزة والأحدث</option>
              <option value="newest">الأحدث نشراً</option>
              <option value="price_asc">الأقل سعراً</option>
              <option value="price_desc">الأعلى سعراً</option>
            </select>
          </div>

          {/* Quick Featured Toggle */}
          <button
            type="button"
            onClick={() => setIsFeatured((p) => !p)}
            className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              isFeatured
                ? 'bg-amber-400 text-slate-950 border-amber-400 font-extrabold'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>مميز</span>
          </button>

          {/* Quick Condition Pills */}
          <button
            type="button"
            onClick={() => setCondition(condition === 'NEW' ? '' : 'NEW')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              condition === 'NEW'
                ? 'bg-[#e00000] text-white border-[#e00000]'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            جديد
          </button>

          <button
            type="button"
            onClick={() =>
              setCondition(condition === 'LIKE_NEW' ? '' : 'LIKE_NEW')
            }
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              condition === 'LIKE_NEW'
                ? 'bg-[#e00000] text-white border-[#e00000]'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            مستعمل
          </button>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-[#e00000] bg-red-50 border border-red-200"
            >
              <RotateCcw className="w-3 h-3" />
              <span>مسح الكل</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Subcategories Horizontal Strip (when a Category is active) */}
      {activeCatObj && currentSubcategories.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
          <div className="flex items-center flex-nowrap overflow-x-auto no-scrollbar snap-x snap-mandatory gap-2">
            <button
              type="button"
              onClick={() => setSubcategory('')}
              className={`shrink-0 snap-start px-3.5 py-2 rounded-lg text-xs font-extrabold border transition-colors cursor-pointer ${
                !subcategory
                  ? 'bg-[#222222] text-white border-[#222222]'
                  : 'bg-[#f7f8fa] text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              كل {activeCatObj.name}
            </button>

            {currentSubcategories.map((sub: any) => {
              const subId = sub.id || sub.slug || sub;
              const subName = sub.name || sub;
              const subIcon = sub.icon || activeCatObj.icon || 'Tag';
              const isSelected =
                subcategory === sub.id ||
                subcategory === sub.slug ||
                subcategory === subName;

              return (
                <button
                  key={subId}
                  type="button"
                  onClick={() => setSubcategory(isSelected ? '' : subId)}
                  className={`shrink-0 snap-start inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-red-50 text-[#e00000] border-[#e00000] font-extrabold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full platform-icon-box flex items-center justify-center shrink-0">
                    <CategoryIcon name={subIcon} className="w-3.5 h-3.5" />
                  </span>
                  <span className="whitespace-nowrap">{subName}</span>
                  {sub._count?.ads !== undefined && (
                    <span className="text-[10px] text-slate-400">
                      ({sub._count.ads})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Main Layout: Right Sidebar Filters (Desktop) + Left Listings Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ==================== DESKTOP SIDEBAR FILTERS (3 COLS) ==================== */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-[128px]">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-black text-sm text-[#222222]">الفلاتر</span>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-extrabold text-[#e00000] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>مسح الكل</span>
                </button>
              )}
            </div>

            {/* Categories Tree */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-900 uppercase">الأقسام</h3>
              <ul className="space-y-1 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCategory('');
                      setSubcategory('');
                    }}
                    className={`w-full text-right py-1.5 px-2 rounded-md transition-colors cursor-pointer ${
                      !category
                        ? 'font-black text-[#e00000] bg-red-50/70'
                        : 'font-semibold text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    جميع الأقسام
                  </button>
                </li>
                {categoriesList.map((cat: any) => {
                  const isActive = category === cat.slug || category === cat.id;
                  return (
                    <li key={cat.slug}>
                      <button
                        type="button"
                        onClick={() => {
                          setCategory(isActive ? '' : cat.slug);
                          setSubcategory('');
                        }}
                        className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md transition-colors cursor-pointer ${
                          isActive
                            ? 'font-black text-[#e00000] bg-red-50/70'
                            : 'font-semibold text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <CategoryIcon
                            name={cat.icon}
                            className="w-3.5 h-3.5 platform-icon-tint shrink-0"
                          />
                          <span className="truncate">{cat.name}</span>
                        </span>
                        {cat._count?.ads !== undefined && (
                          <span className="text-[10px] text-slate-400">
                            ({cat._count.ads})
                          </span>
                        )}
                      </button>

                      {/* Nested Subcategories when active */}
                      {isActive &&
                        cat.subcategories &&
                        cat.subcategories.length > 0 && (
                          <ul className="mr-5 mt-1 space-y-0.5 border-r border-slate-200 pr-2">
                            {cat.subcategories.map((sub: any) => {
                              const subId = sub.id || sub.slug;
                              const isSubActive =
                                subcategory === sub.id || subcategory === sub.slug;
                              return (
                                <li key={subId}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSubcategory(isSubActive ? '' : subId)
                                    }
                                    className={`w-full text-right py-1 px-2 rounded text-[11px] transition-colors cursor-pointer ${
                                      isSubActive
                                        ? 'font-black text-[#e00000]'
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                  >
                                    {sub.name}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Country & City */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-black text-slate-900">الموقع</h3>
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setCity('');
                }}
                className="w-full bg-[#f7f8fa] text-xs rounded-lg px-3 py-2.5 border border-slate-200 focus:outline-none focus:border-[#222222] font-bold text-slate-800 cursor-pointer"
              >
                <option value="">كل الدول العربية 🌍</option>
                {ARAB_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.shortName}
                  </option>
                ))}
              </select>

              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#f7f8fa] text-xs rounded-lg px-3 py-2.5 border border-slate-200 focus:outline-none focus:border-[#222222] font-bold text-slate-800 cursor-pointer"
              >
                <option value="">{country ? 'كل مدن الدولة' : 'كل المدن'}</option>
                {country
                  ? getCitiesByCountry(country).map((cty) => (
                      <option key={cty} value={cty}>
                        {cty}
                      </option>
                    ))
                  : ARAB_COUNTRIES.map((c) => (
                      <optgroup key={c.code} label={`${c.flag} ${c.shortName}`}>
                        {c.cities.map((cty) => (
                          <option key={`${c.code}-${cty}`} value={cty}>
                            {cty}
                          </option>
                        ))}
                      </optgroup>
                    ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <h3 className="text-xs font-black text-slate-900">السعر</h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="الحد الأدنى"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-[#f7f8fa] text-xs rounded-lg px-3 py-2 border border-slate-200 focus:outline-none focus:border-[#222222]"
                />
                <input
                  type="number"
                  placeholder="الحد الأقصى"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-[#f7f8fa] text-xs rounded-lg px-3 py-2 border border-slate-200 focus:outline-none focus:border-[#222222]"
                />
              </div>
            </div>

            {/* Item Condition */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h3 className="text-xs font-black text-slate-900">الحالة</h3>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { val: '', label: 'الكل' },
                  { val: 'NEW', label: 'جديد' },
                  { val: 'LIKE_NEW', label: 'مستعمل كالجديد' },
                  { val: 'USED_GOOD', label: 'مستعمل جيد' },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setCondition(opt.val)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                      condition === opt.val
                        ? 'bg-[#222222] text-white border-[#222222]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Badges & Options */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#e00000]"
                />
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>إعلانات مميزة فقط</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#e00000]"
                />
                <Flame className="w-3.5 h-3.5 text-[#e00000]" />
                <span>بيع عاجل</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#e00000]"
                />
                <span>قابل للتفاوض</span>
              </label>
            </div>

            <button
              type="button"
              onClick={applyFilters}
              className="w-full py-2.5 bg-[#e00000] hover:bg-[#c20000] text-white font-extrabold text-xs rounded-lg transition-colors cursor-pointer"
            >
              تطبيق الفلاتر
            </button>
          </div>
        </aside>

        {/* ==================== LISTINGS MAIN AREA (9 COLS) ==================== */}
        <div className="lg:col-span-9 space-y-4">
          {/* Desktop Sort & View Switcher Toolbar */}
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            {/* View Mode Toggle (List vs Grid) */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 ml-1 hidden sm:inline">
                طريقة العرض:
              </span>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="عرض قائمة"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#222222] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <LayoutList className="w-4 h-4" />
                <span className="hidden xs:inline sm:inline">قائمة</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="عرض شبكي"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#222222] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden xs:inline sm:inline">شبكة</span>
              </button>
            </div>

            {/* Desktop Sort Select */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">الترتيب حسب:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-[#f7f8fa] text-xs font-extrabold text-slate-800 rounded-lg px-3 py-1.5 border border-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="featured_first">المميزة والأحدث أولاً</option>
                <option value="newest">الأحدث نشراً</option>
                <option value="price_asc">السعر: الأقل للأعلى</option>
                <option value="price_desc">السعر: الأعلى للأقل</option>
                <option value="views_desc">الأكثر مشاهدة</option>
              </select>
            </div>

            {userIdFilter && (
              <button
                type="button"
                onClick={() => {
                  setUserIdFilter('');
                  router.push('/ads');
                }}
                className="text-xs font-bold text-[#e00000] hover:underline cursor-pointer"
              >
                إلغاء فلتر المعلن ✕
              </button>
            )}
          </div>

          {/* Loading Skeleton */}
          {isLoading ? (
            <div
              className={
                viewMode === 'list'
                  ? 'space-y-3'
                  : 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'
              }
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse ${
                    viewMode === 'list' ? 'flex h-40 sm:h-48' : ''
                  }`}
                >
                  <div
                    className={
                      viewMode === 'list'
                        ? 'w-36 sm:w-64 bg-slate-200 shrink-0'
                        : 'aspect-[4/3] bg-slate-200'
                    }
                  />
                  <div className="p-4 flex-1 space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : ads.length > 0 ? (
            viewMode === 'list' ? (
              <div className="space-y-3">
                {ads.map((ad) => (
                  <AdCard key={ad.id} ad={ad} variant="list" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {ads.map((ad) => (
                  <AdCard key={ad.id} ad={ad} variant="grid" />
                ))}
              </div>
            )
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 sm:p-14 text-center max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#222222] mb-2">
                {onlyFavorites
                  ? 'لم تقم بحفظ أي إعلانات في المفضلة بعد'
                  : 'لا توجد إعلانات مطابقة لبحثك حالياً'}
              </h3>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                {onlyFavorites
                  ? 'اضغط على أيقونة القلب على أي إعلان يعجبك لحفظه والرجوع إليه بسهولة.'
                  : 'جرّب توسيع نطاق البحث أو إزالة بعض الفلاتر لعرض جميع الإعلانات المتاحة.'}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-2.5 bg-[#e00000] hover:bg-[#c20000] text-white font-extrabold text-xs rounded-lg transition-colors cursor-pointer"
              >
                عرض كل الإعلانات
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================== COMPLETE MOBILE FILTER DRAWER ==================== */}
      {isMobileFilterOpen && (
        <div
          onClick={() => setIsMobileFilterOpen(false)}
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-2xs flex items-end sm:items-stretch sm:justify-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-none max-h-[88vh] sm:max-h-full sm:h-full flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200">
              <span className="font-black text-base text-[#222222]">
                فلترة النتائج
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-extrabold text-[#e00000]"
                >
                  إعادة ضبط
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  aria-label="إغلاق"
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Filter Fields */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  البحث بالكلمة
                </label>
                <input
                  type="text"
                  placeholder="مثال: تويوتا، شقة، آيفون..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full bg-[#f7f8fa] text-sm rounded-lg px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-[#222222]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  القسم الرئيسي
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSubcategory('');
                  }}
                  className="w-full bg-[#f7f8fa] text-sm rounded-lg px-3.5 py-2.5 border border-slate-200 font-bold"
                >
                  <option value="">جميع الأقسام</option>
                  {categoriesList.map((cat: any) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {currentSubcategories.length > 0 && (
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    القسم الفرعي
                  </label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full bg-[#f7f8fa] text-sm rounded-lg px-3.5 py-2.5 border border-slate-200 font-bold"
                  >
                    <option value="">الكل</option>
                    {currentSubcategories.map((sub: any) => (
                      <option key={sub.id || sub.slug} value={sub.id || sub.slug}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>الدولة</span>
                  </label>
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setCity('');
                    }}
                    className="w-full bg-[#f7f8fa] text-xs rounded-lg px-2.5 py-2.5 border border-slate-200 font-bold"
                  >
                    <option value="">الكل 🌍</option>
                    {ARAB_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.shortName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>المدينة</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#f7f8fa] text-xs rounded-lg px-2.5 py-2.5 border border-slate-200 font-bold"
                  >
                    <option value="">الكل</option>
                    {country
                      ? getCitiesByCountry(country).map((cty) => (
                          <option key={cty} value={cty}>
                            {cty}
                          </option>
                        ))
                      : ARAB_COUNTRIES.map((c) => (
                          <optgroup
                            key={c.code}
                            label={`${c.flag} ${c.shortName}`}
                          >
                            {c.cities.map((cty) => (
                              <option key={`${c.code}-${cty}`} value={cty}>
                                {cty}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  نطاق السعر
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="number"
                    placeholder="السعر من"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-[#f7f8fa] text-sm rounded-lg px-3 py-2.5 border border-slate-200"
                  />
                  <input
                    type="number"
                    placeholder="السعر إلى"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-[#f7f8fa] text-sm rounded-lg px-3 py-2.5 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  الحالة
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: '', label: 'جميع الحالات' },
                    { val: 'NEW', label: 'جديد' },
                    { val: 'LIKE_NEW', label: 'مستعمل كالجديد' },
                    { val: 'USED_GOOD', label: 'مستعمل جيد' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setCondition(opt.val)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border ${
                        condition === opt.val
                          ? 'bg-[#222222] text-white border-[#222222]'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#e00000]"
                  />
                  <span>إعلانات مميزة فقط ⭐</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#e00000]"
                  />
                  <span>بيع عاجل 🔥</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#e00000]"
                  />
                  <span>قابل للتفاوض</span>
                </label>
              </div>
            </div>

            {/* Sticky Bottom Apply CTA */}
            <div className="p-4 border-t border-slate-200 bg-white pb-safe">
              <button
                type="button"
                onClick={applyFilters}
                className="w-full py-3 bg-[#e00000] hover:bg-[#c20000] text-white font-extrabold text-sm rounded-lg shadow-md"
              >
                عرض النتائج ({ads.length} إعلان)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchAndFilterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#e00000] animate-spin" />
        </div>
      }
    >
      <SearchAndFilterContent />
    </Suspense>
  );
}
