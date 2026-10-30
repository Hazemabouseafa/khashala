'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, MapPin, Layers, Sparkles, ArrowLeft, Globe } from 'lucide-react';
import { ARAB_COUNTRIES, CATEGORIES_DATA, getCitiesByCountry } from '@/lib/constants';

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [liveCategories, setLiveCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setLiveCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  const handleCountryChange = (countryName: string) => {
    setSelectedCountry(countryName);
    setSelectedCity('');
  };

  const handleCategoryChange = (catSlug: string) => {
    setSelectedCategory(catSlug);
    setSelectedSubcategory('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (selectedCountry && selectedCountry !== 'all') params.append('country', selectedCountry);
    if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
    if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
    if (selectedSubcategory && selectedSubcategory !== 'all')
      params.append('subcategory', selectedSubcategory);

    router.push(`/ads?${params.toString()}`);
  };

  const currentCities = selectedCountry ? getCitiesByCountry(selectedCountry) : [];
  const categoriesList = liveCategories.length > 0 ? liveCategories : CATEGORIES_DATA;
  const activeCatObj = liveCategories.find((c) => c.slug === selectedCategory);
  const currentSubcategories = activeCatObj?.subcategories || [];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-brand-800 text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-blue-800/40">
      {/* Decorative Blue & Cyan Glows */}
      <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 text-center">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 backdrop-blur-md border border-sky-400/30 text-xs font-bold text-sky-200 mb-6 shadow-inner"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>منصة خشاله (Khashala) • السوق المبوب الأول في جميع الدول العربية الـ 22</span>
        </motion.div>

        {/* Animated Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight sm:leading-tight mb-4"
        >
          كل ما تبحث عنه للبيع والشراء، <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-200 to-amber-300">
            تلقاه فوراً في خشاله
          </span>
        </motion.h1>

        {/* Animated Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="text-base sm:text-lg text-blue-100/90 max-w-2xl mx-auto mb-9 leading-relaxed font-normal"
        >
          آلاف الإعلانات الموثوقة للسيارات، العقارات، الجوالات، والأثاث في السعودية، مصر، الإمارات، الكويت، وجميع أنحاء الوطن العربي.
        </motion.p>

        {/* Animated Main Search Box */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
          className="bg-white/95 backdrop-blur-md p-3.5 rounded-3xl shadow-2xl border border-blue-200 text-slate-900 space-y-2.5 text-right"
        >
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            {/* Keyword Search Input */}
            <div className="sm:col-span-4 relative flex items-center">
              <Search className="w-5 h-5 text-brand-500 absolute right-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="عن ماذا تبحث؟ (لاندكروزر، آيفون، شقة)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-11 pl-3 py-3.5 bg-blue-50/60 hover:bg-blue-50 focus:bg-white rounded-2xl border border-blue-100 focus:border-brand-500 outline-none text-xs sm:text-sm font-medium transition-colors"
              />
            </div>

            {/* Country Dropdown */}
            <div className="sm:col-span-2 relative flex items-center">
              <Globe className="w-4 h-4 text-brand-600 absolute right-3 pointer-events-none" />
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full pr-8 pl-2 py-3.5 bg-blue-50/60 hover:bg-blue-50 focus:bg-white rounded-2xl border border-blue-100 focus:border-brand-500 outline-none text-xs font-bold text-slate-700 transition-colors appearance-none cursor-pointer truncate"
              >
                <option value="">كل الدول 🌍</option>
                {ARAB_COUNTRIES.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.flag} {country.shortName}
                  </option>
                ))}
              </select>
            </div>

            {/* City Dropdown */}
            <div className="sm:col-span-2 relative flex items-center">
              <MapPin className="w-4 h-4 text-brand-600 absolute right-3 pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pr-8 pl-2 py-3.5 bg-blue-50/60 hover:bg-blue-50 focus:bg-white rounded-2xl border border-blue-100 focus:border-brand-500 outline-none text-xs font-bold text-slate-700 transition-colors appearance-none cursor-pointer truncate"
              >
                <option value="">
                  {selectedCountry ? 'جميع مدن الدولة' : 'جميع المدن'}
                </option>
                {selectedCountry ? (
                  currentCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))
                ) : (
                  ARAB_COUNTRIES.map((country) => (
                    <optgroup key={country.code} label={`${country.flag} ${country.shortName}`}>
                      {country.cities.map((city) => (
                        <option key={`${country.code}-${city}`} value={city}>
                          {city}
                        </option>
                      ))}
                    </optgroup>
                  ))
                )}
              </select>
            </div>

            {/* Category Dropdown */}
            <div className="sm:col-span-2 relative flex items-center">
              <Layers className="w-4 h-4 text-brand-600 absolute right-3 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full pr-8 pl-2 py-3.5 bg-blue-50/60 hover:bg-blue-50 focus:bg-white rounded-2xl border border-blue-100 focus:border-brand-500 outline-none text-xs font-bold text-slate-700 transition-colors appearance-none cursor-pointer truncate"
              >
                <option value="">كل الأقسام</option>
                {categoriesList.map((cat: any) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Search Button */}
            <div className="sm:col-span-2 flex">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-brand-600 via-blue-600 to-sky-500 hover:from-brand-700 hover:to-blue-700 text-white font-bold text-xs sm:text-sm py-3.5 px-3 rounded-2xl shadow-lg shadow-brand-600/30 flex items-center justify-center gap-1.5 transition-all duration-200"
              >
                <span>ابحث الآن</span>
                <ArrowLeft className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Subcategory Quick Row if a Category with Subcategories is Selected */}
          {currentSubcategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-blue-100 px-1">
              <span className="text-[11px] font-bold text-brand-700">
                اختر القسم الفرعي في {activeCatObj?.name}:
              </span>
              <button
                type="button"
                onClick={() => setSelectedSubcategory('')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                  selectedSubcategory === ''
                    ? 'bg-brand-600 text-white'
                    : 'bg-blue-50 text-slate-700 hover:bg-blue-100'
                }`}
              >
                الكل
              </button>
              {currentSubcategories.map((sub: any) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubcategory(sub.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                    selectedSubcategory === sub.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-blue-50 text-slate-700 hover:bg-blue-100'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </motion.form>

        {/* Quick Search Tag Chips with Arab Cities */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-blue-100"
        >
          <span className="font-bold text-sky-300">المدن الأكثر نشاطاً:</span>
          {[
            'الرياض 🇸🇦',
            'القاهرة 🇪🇬',
            'دبي 🇦🇪',
            'الكويت 🇰🇼',
            'الدوحة 🇶🇦',
            'عمان 🇯🇴',
            'الدار البيضاء 🇲🇦',
            'بغداد 🇮🇶',
          ].map((chip) => {
            const cityName = chip.split(' ')[0];
            return (
              <button
                key={chip}
                onClick={() => {
                  router.push(`/ads?city=${encodeURIComponent(cityName)}`);
                }}
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15 font-medium"
              >
                {chip}
              </button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};
