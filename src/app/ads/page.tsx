'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AdCard } from '@/components/ads/AdCard';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ARAB_COUNTRIES, CATEGORIES_DATA, getCitiesByCountry } from '@/lib/constants';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  MapPin,
  Tag,
  Loader2,
  X,
  Globe,
  Layers,
  Star,
  Flame,
  Heart,
} from 'lucide-react';

function SearchAndFilterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search & Filter states
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [subcategory, setSubcategory] = useState(searchParams.get('subcategory') || '');
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [isFeatured, setIsFeatured] = useState(searchParams.get('isFeatured') === 'true');
  const [isUrgent, setIsUrgent] = useState(searchParams.get('isUrgent') === 'true');
  const [isNegotiable, setIsNegotiable] = useState(searchParams.get('isNegotiable') === 'true');
  const [onlyFavorites, setOnlyFavorites] = useState(searchParams.get('favorites') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'featured_first');

  // Categories from DB (including subcategories with icons)
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

  // Sync state when URL params change
  useEffect(() => {
    setQ(searchParams.get('q') || '');
    setCategory(searchParams.get('category') || '');
    setSubcategory(searchParams.get('subcategory') || '');
    setCountry(searchParams.get('country') || '');
    setCity(searchParams.get('city') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setCondition(searchParams.get('condition') || '');
    setIsFeatured(searchParams.get('isFeatured') === 'true');
    setIsUrgent(searchParams.get('isUrgent') === 'true');
    setIsNegotiable(searchParams.get('isNegotiable') === 'true');
    setOnlyFavorites(searchParams.get('favorites') === 'true');
    setSort(searchParams.get('sort') || 'featured_first');
  }, [searchParams]);

  // Fetch ads
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            {onlyFavorites ? (
              <>
                <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
                <span>إعلاناتي المفضلة المحفوظة</span>
              </>
            ) : activeCatObj ? (
              <>
                <span>إعلانات {activeCatObj.name}</span>
              </>
            ) : (
              <span>تصفح وفلترة الإعلانات المبوبة</span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {isLoading
              ? 'جاري تحميل النتائج...'
              : `تم العثور على ${ads.length} إعلان مطابق لمعاييرك`}
          </p>
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden flex items-center justify-center gap-2 bg-white border border-blue-200 px-4 py-2.5 rounded-xl font-bold text-sm text-brand-700 shadow-xs"
        >
          <SlidersHorizontal className="w-4 h-4 text-brand-600" />
          <span>الفلترة المتقدمة</span>
        </button>
      </div>

      {/* Subcategories Cards Bar (Identical Visual Style to Main Category Cards!) */}
      {activeCatObj && currentSubcategories.length > 0 && (
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-blue-200/90 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" />
              <span>تصفية حسب القسم الفرعي في {activeCatObj.name}:</span>
            </h2>
            {subcategory && (
              <button
                type="button"
                onClick={() => setSubcategory('')}
                className="text-xs font-bold text-brand-600 hover:underline"
              >
                عرض كل {activeCatObj.name}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
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
                  className={`group flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-200 text-center cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-brand-600 to-blue-700 text-white border-brand-600 shadow-md'
                      : 'bg-blue-50/40 hover:bg-white text-slate-800 border-blue-200/80 hover:border-brand-400 hover:shadow-sm'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2 transition-colors ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-100/80 group-hover:bg-brand-600 text-brand-600 group-hover:text-white'
                    }`}
                  >
                    <CategoryIcon name={subIcon} className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs font-bold line-clamp-1 ${
                      isSelected ? 'text-white' : 'text-slate-800 group-hover:text-brand-600'
                    }`}
                  >
                    {subName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-blue-200/90 p-6 sticky top-28 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-blue-100">
              <div className="flex items-center gap-2 font-black text-slate-900 text-base">
                <Filter className="w-4 h-4 text-brand-600" />
                <span>تصفية شاملة</span>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-slate-400 hover:text-brand-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط</span>
              </button>
            </div>

            {/* Keyword Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الكلمة المفتاحية
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو الوصف..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                  className="w-full bg-blue-50/50 text-xs rounded-xl pr-9 pl-3 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-medium"
                />
                <Search className="w-3.5 h-3.5 text-brand-500 absolute right-3 top-3" />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                القسم الرئيسي
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubcategory('');
                }}
                className="w-full bg-blue-50/50 text-xs rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-bold text-slate-700 cursor-pointer"
              >
                <option value="">جميع الأقسام الرئيسية</option>
                {categoriesList.map((cat: any) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Filter */}
            {currentSubcategories.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  القسم الفرعي
                </label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full bg-blue-50/50 text-xs rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-bold text-slate-700 cursor-pointer"
                >
                  <option value="">كل الأقسام الفرعية</option>
                  {currentSubcategories.map((sub: any) => (
                    <option key={sub.id || sub} value={sub.id || sub}>
                      {sub.name || sub}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Country Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-brand-600" />
                <span>الدولة العربية</span>
              </label>
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setCity('');
                }}
                className="w-full bg-blue-50/50 text-xs rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-bold text-slate-700 cursor-pointer"
              >
                <option value="">كل الدول العربية 🌍</option>
                {ARAB_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.shortName}
                  </option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>المدينة / المنطقة</span>
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-blue-50/50 text-xs rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-bold text-slate-700 cursor-pointer"
              >
                <option value="">
                  {country ? 'جميع مدن الدولة' : 'جميع المدن'}
                </option>
                {country ? (
                  getCitiesByCountry(country).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))
                ) : (
                  ARAB_COUNTRIES.map((c) => (
                    <optgroup key={c.code} label={`${c.flag} ${c.shortName}`}>
                      {c.cities.map((cty) => (
                        <option key={`${c.code}-${cty}`} value={cty}>
                          {cty}
                        </option>
                      ))}
                    </optgroup>
                  ))
                )}
              </select>
            </div>

            {/* Condition Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                حالة السلعة
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-blue-50/50 text-xs rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-bold text-slate-700 cursor-pointer"
              >
                <option value="">جميع الحالات</option>
                <option value="NEW">جديد (New)</option>
                <option value="LIKE_NEW">مستعمل - كالجديد</option>
                <option value="USED_GOOD">مستعمل بحالة جيدة</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نطاق السعر
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="من"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-blue-50/50 text-xs rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-medium"
                />
                <input
                  type="number"
                  placeholder="إلى"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-blue-50/50 text-xs rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>
            </div>

            {/* Quick Status Checkboxes */}
            <div className="space-y-2.5 pt-2 border-t border-blue-100">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded accent-brand-600"
                />
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>إعلانات مميزة فقط</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 rounded accent-brand-600"
                />
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span>إعلانات بيع عاجل 🔥</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="w-4 h-4 rounded accent-brand-600"
                />
                <span>قابل للتفاوض فقط 🤝</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-rose-600">
                <input
                  type="checkbox"
                  checked={onlyFavorites}
                  onChange={(e) => setOnlyFavorites(e.target.checked)}
                  className="w-4 h-4 rounded accent-rose-600"
                />
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>المفضلة المحفوظة فقط</span>
              </label>
            </div>

            {/* Apply Button */}
            <button
              onClick={applyFilters}
              className="w-full py-3 bg-gradient-to-l from-brand-600 to-blue-600 hover:from-brand-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/20 transition-all duration-200 active:scale-95"
            >
              تطبيق التصفية
            </button>
          </div>
        </aside>

        {/* Ads Main Content */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Sort & Quick Info Bar */}
          <div className="bg-white/95 p-3.5 rounded-2xl border border-blue-200/80 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-semibold">
              <Tag className="w-4 h-4 text-brand-600" />
              <span>
                {activeCatObj ? `القسم: ${activeCatObj.name}` : 'جميع الأقسام'}
              </span>
              {country && (
                <>
                  <span className="text-blue-300">•</span>
                  <span className="text-navy-900 font-bold">
                    {ARAB_COUNTRIES.find((c) => c.name === country)?.flag} {country}
                  </span>
                </>
              )}
              {city && (
                <>
                  <span className="text-blue-300">•</span>
                  <span>المدينة: {city}</span>
                </>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">ترتيب حسب:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-blue-50/70 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 border border-blue-200 focus:outline-none cursor-pointer"
              >
                <option value="featured_first">المميزة والأحدث أولاً ⭐</option>
                <option value="newest">الأحدث نشراً</option>
                <option value="price_asc">السعر: الأقل أولاً</option>
                <option value="price_desc">السعر: الأعلى أولاً</option>
                <option value="views_desc">الأكثر مشاهدة 👁️</option>
                <option value="oldest">الأقدم</option>
              </select>
            </div>
          </div>

          {/* Loading Skeleton */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-blue-200 overflow-hidden shadow-xs animate-pulse"
                >
                  <div className="aspect-[4/3] bg-blue-100/60" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-blue-100 rounded-md w-1/3" />
                    <div className="h-4 bg-blue-50 rounded-md w-3/4" />
                    <div className="h-4 bg-blue-50 rounded-md w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : ads.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-blue-200 p-12 text-center max-w-lg mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-brand-500 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {onlyFavorites
                  ? 'قائمة المفضلة فارغة حالياً'
                  : 'لم نجد أي إعلانات تطابق بحثك'}
              </h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                {onlyFavorites
                  ? 'اضغط على أيقونة القلب ❤️ الموجودة على أي إعلان لحفظه هنا والرجوع إليه في أي وقت.'
                  : 'جرب تغيير الكلمات المفتاحية، أو اختيار قسم آخر أو مسح عوامل التصفية للوصول لنتائج أكثر.'}
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
              >
                عرض جميع الإعلانات
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex justify-end"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-white h-full p-6 overflow-y-auto space-y-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-blue-100">
                <span className="font-black text-slate-900">تصفية الإعلانات</span>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-lg hover:bg-blue-50 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الكلمة المفتاحية
                </label>
                <input
                  type="text"
                  placeholder="ابحث..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full bg-blue-50/50 text-sm rounded-xl px-3 py-2.5 border border-blue-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  القسم الرئيسي
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSubcategory('');
                  }}
                  className="w-full bg-blue-50/50 text-sm rounded-xl px-3 py-2.5 border border-blue-200"
                >
                  <option value="">جميع الأقسام</option>
                  {categoriesList.map((cat: any) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الدولة العربية
                </label>
                <select
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setCity('');
                  }}
                  className="w-full bg-blue-50/50 text-sm rounded-xl px-3 py-2.5 border border-blue-200"
                >
                  <option value="">كل الدول العربية 🌍</option>
                  {ARAB_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.shortName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={applyFilters}
                  className="flex-1 py-3 bg-brand-600 text-white font-bold text-sm rounded-xl"
                >
                  تطبيق
                </button>
                <button
                  onClick={resetFilters}
                  className="py-3 px-4 bg-blue-50 text-brand-700 font-bold text-sm rounded-xl"
                >
                  إعادة ضبط
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SearchAndFilterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      }
    >
      <SearchAndFilterContent />
    </Suspense>
  );
}
