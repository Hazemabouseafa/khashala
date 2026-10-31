'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Plus,
  User as UserIcon,
  Search,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  X,
  Heart,
  Megaphone,
  Layers,
  MapPin,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';
import { KhashalaLogo } from '@/components/ui/KhashalaLogo';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ARAB_COUNTRIES, CATEGORIES_DATA } from '@/lib/constants';

interface UserState {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

function HeaderInner() {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const searchParams = useSearchParams();

  const [user, setUser] = useState<UserState | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [hoveredCatSlug, setHoveredCatSlug] = useState<string | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationFilterText, setLocationFilterText] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    label: string;
    city?: string;
    country?: string;
  }>({ label: 'كل الدول والمدن' });

  const [searchQuery, setSearchQuery] = useState('');
  const [favCount, setFavCount] = useState(0);
  const [announcement, setAnnouncement] = useState<{ active: boolean; text: string } | null>(null);

  const locationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    const urlCity = searchParams.get('city');
    const urlCountry = searchParams.get('country');
    if (urlCity) {
      setSelectedLocation({ label: urlCity, city: urlCity });
    } else if (urlCountry) {
      const found = ARAB_COUNTRIES.find((c) => c.name === urlCountry);
      setSelectedLocation({
        label: found ? `${found.flag} ${found.shortName}` : urlCountry,
        country: urlCountry,
      });
    } else {
      try {
        const saved = localStorage.getItem('khashala_selected_location');
        if (saved) {
          setSelectedLocation(JSON.parse(saved));
        }
      } catch {}
    }
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null));

    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});

    const loadAnnouncement = async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        const data = await res.json();
        if (data.settings) {
          setAnnouncement({
            active: data.settings.announcementActive === 'true',
            text: data.settings.announcementText || '',
          });
        }
      } catch {}
    };

    const updateFavCount = () => {
      try {
        const raw = localStorage.getItem('khashala_favorites');
        const arr = raw ? JSON.parse(raw) : [];
        setFavCount(Array.isArray(arr) ? arr.length : 0);
      } catch {
        setFavCount(0);
      }
    };

    loadAnnouncement();
    updateFavCount();

    const handleClickOutside = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setIsLocationOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    window.addEventListener('khashala_fav_updated', updateFavCount);
    window.addEventListener('khashala_branding_updated', loadAnnouncement);
    window.addEventListener('storage', updateFavCount);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('khashala_fav_updated', updateFavCount);
      window.removeEventListener('khashala_branding_updated', loadAnnouncement);
      window.removeEventListener('storage', updateFavCount);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setIsUserDropdownOpen(false);
      setIsMenuOpen(false);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePickLocation = (loc: { label: string; city?: string; country?: string }) => {
    setSelectedLocation(loc);
    setIsLocationOpen(false);
    try {
      localStorage.setItem('khashala_selected_location', JSON.stringify(loc));
    } catch {}

    const params = new URLSearchParams(searchParams.toString());
    params.delete('city');
    params.delete('country');
    if (loc.city) params.set('city', loc.city);
    else if (loc.country) params.set('country', loc.country);

    router.push(`/ads?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedLocation.city) params.set('city', selectedLocation.city);
    else if (selectedLocation.country) params.set('country', selectedLocation.country);
    router.push(`/ads?${params.toString()}`);
  };

  const categoryList = categories.length > 0 ? categories : CATEGORIES_DATA;
  const activeCatSlug = pathname === '/ads' ? searchParams.get('category') || '' : '';
  const hoveredCategoryObj = categoryList.find((c: any) => c.slug === hoveredCatSlug);

  // Filterable popular locations for dropdown
  const filteredCountries = ARAB_COUNTRIES.slice(0, 12)
    .map((country) => {
      const q = locationFilterText.trim();
      if (!q) return { ...country, matchedCities: country.cities.slice(0, 5) };
      const countryMatches =
        country.name.includes(q) || country.shortName.includes(q);
      const matchedCities = country.cities.filter((ct) => ct.includes(q));
      if (countryMatches) {
        return { ...country, matchedCities: country.cities.slice(0, 6) };
      }
      if (matchedCities.length > 0) {
        return { ...country, matchedCities };
      }
      return null;
    })
    .filter(Boolean) as Array<(typeof ARAB_COUNTRIES)[0] & { matchedCities: string[] }>;

  return (
    <>
      {/* Optional Announcement Strip */}
      {!isAdminRoute && announcement?.active && announcement.text && (
        <div className="bg-[#1f2937] text-white text-[11px] sm:text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <Megaphone className="w-3.5 h-3.5 text-[#ef4444] shrink-0" />
          <span className="truncate">{announcement.text}</span>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-white border-b border-slate-200/95 shadow-[0_1px_6px_rgba(15,23,42,0.04)]">
        {/* ==================== MAIN TOP BAR ==================== */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-[72px] gap-2.5 sm:gap-4">
            {/* Right: Brand Logo + Location Selector */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <KhashalaLogo size="md" variant="full" theme="dark" />

              {!isAdminRoute && (
                <div ref={locationRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsLocationOpen((prev) => !prev)}
                    className="flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-xs sm:text-sm font-bold text-slate-800 min-w-[118px] sm:min-w-[175px] max-w-[165px] sm:max-w-[210px] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-4 h-4 text-[#e00000] shrink-0" />
                      <span className="truncate">{selectedLocation.label}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                        isLocationOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Location Dropdown Popover */}
                  {isLocationOpen && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                      <div className="p-3 border-b border-slate-100 bg-slate-50/70">
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                          <input
                            type="text"
                            placeholder="ابحث عن دولة أو مدينة..."
                            value={locationFilterText}
                            onChange={(e) => setLocationFilterText(e.target.value)}
                            className="w-full bg-white text-xs rounded-lg py-2 pr-9 pl-3 border border-slate-200 focus:outline-none focus:border-[#e00000]"
                          />
                        </div>
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        <button
                          type="button"
                          onClick={() => handlePickLocation({ label: 'كل الدول والمدن' })}
                          className="w-full text-right px-4 py-2.5 text-xs font-extrabold text-[#e00000] hover:bg-red-50/60 flex items-center justify-between"
                        >
                          <span>🌍 كل الدول والمدن العربية</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>

                        {filteredCountries.map((country) => (
                          <div key={country.code} className="py-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handlePickLocation({
                                  label: `${country.flag} ${country.shortName}`,
                                  country: country.name,
                                })
                              }
                              className="w-full text-right px-4 py-1.5 text-xs font-black text-slate-900 hover:bg-slate-50 flex items-center justify-between"
                            >
                              <span>
                                {country.flag} كل {country.shortName}
                              </span>
                            </button>
                            <div className="flex flex-wrap gap-1.5 px-4 py-1">
                              {country.matchedCities.map((ct) => (
                                <button
                                  key={ct}
                                  type="button"
                                  onClick={() =>
                                    handlePickLocation({ label: ct, city: ct })
                                  }
                                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                                    selectedLocation.city === ct
                                      ? 'bg-[#e00000] text-white border-[#e00000]'
                                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  {ct}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Center: Wide Desktop Search Input */}
            {!isAdminRoute && (
              <form
                onSubmit={handleSearchSubmit}
                className="hidden lg:flex flex-1 max-w-2xl items-center"
              >
                <div className="flex w-full rounded-lg border border-slate-300 focus-within:border-[#222222] overflow-hidden bg-white transition-colors">
                  <input
                    type="text"
                    placeholder="ابحث عن سيارات، شقق، موبايلات، أثاث وأكثر..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm py-2.5 px-4 outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="بحث"
                    className="bg-[#222222] hover:bg-black text-white px-4 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}

            {/* Left: Favorites, Account, Admin & Red "أضف إعلانك" Button */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Favorites */}
              {!isAdminRoute && (
                <Link
                  href="/ads?favorites=true"
                  className="hidden sm:inline-flex relative items-center justify-center p-2.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                  title="الإعلانات المفضلة"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      favCount > 0 ? 'fill-[#e00000] text-[#e00000]' : 'text-slate-700'
                    }`}
                  />
                  {favCount > 0 && (
                    <span className="absolute top-1 left-1 min-w-[16px] h-4 px-1 bg-[#e00000] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                      {favCount}
                    </span>
                  )}
                </Link>
              )}

              {/* User Account / Login */}
              {user ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen((p) => !p)}
                    className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-right">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-sm font-extrabold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-500" />
                          <span>إعلاناتي وحسابي</span>
                        </Link>

                        <Link
                          href="/ads?favorites=true"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Heart className="w-4 h-4 text-[#e00000]" />
                          <span>المفضلة ({favCount})</span>
                        </Link>

                        {user.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-extrabold text-[#e00000] bg-red-50/60 hover:bg-red-50"
                          >
                            <ShieldCheck className="w-4 h-4 text-[#e00000]" />
                            <span>لوحة تحكم الإدارة</span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 text-right cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>تسجيل الخروج</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden sm:inline-flex items-center gap-1.5 text-sm font-extrabold text-slate-800 hover:text-[#e00000] px-2.5 py-2 transition-colors"
                >
                  <span>تسجيل الدخول</span>
                </Link>
              )}

              {/* Primary Red "ضع إعلانك / أضف إعلانك" CTA (Desktop & Tablet) */}
              <Link
                href="/ads/create"
                className="hidden md:inline-flex items-center gap-1.5 bg-[#e00000] hover:bg-[#c20000] text-white font-extrabold text-sm px-4 lg:px-5 py-2.5 rounded-lg shadow-xs transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[2.8]" />
                <span>أضف إعلانك</span>
              </Link>

              {/* Mobile Drawer Button */}
              <button
                type="button"
                onClick={() => setIsMenuOpen((p) => !p)}
                className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
                aria-label="القائمة"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Embedded Search Bar (Row 2 on Mobile/Tablet) */}
          {!isAdminRoute && (
            <form onSubmit={handleSearchSubmit} className="lg:hidden pb-2.5">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ابحث عن سيارات، عقارات، موبايلات وأكثر..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#f2f4f5] focus:bg-white text-slate-900 placeholder-slate-500 text-xs sm:text-sm rounded-lg py-2.5 pr-10 pl-16 border border-slate-200 focus:border-[#222222] outline-none transition-colors"
                />
                {searchQuery.trim() && (
                  <button
                    type="submit"
                    className="absolute left-1.5 px-2.5 py-1 bg-[#e00000] text-white text-[11px] font-bold rounded-md"
                  >
                    بحث
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* ==================== TIER 2: CATEGORY NAVIGATION BAR ==================== */}
        {!isAdminRoute && (
          <div
            className="border-t border-slate-200/85 bg-white relative"
            onMouseLeave={() => setHoveredCatSlug(null)}
          >
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
              <nav
                aria-label="أقسام السوق"
                className="flex items-center flex-nowrap overflow-x-auto no-scrollbar snap-x snap-mandatory gap-1 sm:gap-2 lg:gap-5 py-2 lg:py-0"
              >
                {/* All Categories Link */}
                <Link
                  href="/ads"
                  onMouseEnter={() => setHoveredCatSlug(null)}
                  className={`shrink-0 snap-start inline-flex items-center gap-1.5 px-3 py-1.5 lg:px-1 lg:py-3 rounded-full lg:rounded-none text-xs lg:text-[13px] font-extrabold transition-colors whitespace-nowrap border lg:border-0 lg:border-b-2 ${
                    pathname === '/ads' && !activeCatSlug
                      ? 'bg-[#222222] text-white border-[#222222] lg:bg-transparent lg:text-[#e00000] lg:border-[#e00000]'
                      : 'bg-slate-100/90 text-slate-800 border-slate-200/80 lg:bg-transparent lg:border-transparent hover:text-[#e00000]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 platform-icon-tint" />
                  <span>جميع الأقسام</span>
                </Link>

                {categoryList.map((cat: any) => {
                  const isCurrent =
                    activeCatSlug === cat.slug || activeCatSlug === cat.id;
                  const isHovered = hoveredCatSlug === cat.slug;

                  return (
                    <Link
                      key={cat.slug}
                      href={`/ads?category=${encodeURIComponent(cat.slug)}`}
                      onMouseEnter={() => setHoveredCatSlug(cat.slug)}
                      className={`group shrink-0 snap-start inline-flex items-center gap-1.5 px-3 py-1.5 lg:px-1.5 lg:py-3 rounded-full lg:rounded-none text-xs lg:text-[13px] font-bold transition-all whitespace-nowrap border lg:border-0 lg:border-b-2 ${
                        isCurrent || isHovered
                          ? 'bg-red-50 text-[#e00000] border-[#e00000]/40 lg:bg-transparent lg:text-[#e00000] lg:border-[#e00000]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 lg:border-transparent hover:text-[#e00000]'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full platform-icon-box flex items-center justify-center lg:hidden shrink-0">
                        <CategoryIcon name={cat.icon} className="w-3 h-3 stroke-[2.2]" />
                      </span>
                      <span>{cat.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#e00000] hidden lg:inline-block" />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Desktop Subcategory Mega-Menu Dropdown on Hover */}
            {hoveredCategoryObj &&
              hoveredCategoryObj.subcategories &&
              hoveredCategoryObj.subcategories.length > 0 && (
                <div
                  onMouseEnter={() => setHoveredCatSlug(hoveredCategoryObj.slug)}
                  onMouseLeave={() => setHoveredCatSlug(null)}
                  className="hidden lg:block absolute inset-x-0 top-full bg-white border-b border-slate-200 shadow-xl z-50"
                >
                  <div className="max-w-7xl mx-auto px-8 py-6 flex items-start justify-between gap-8">
                    <div className="w-60 shrink-0 border-l border-slate-100 pl-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl platform-icon-box flex items-center justify-center">
                          <CategoryIcon
                            name={hoveredCategoryObj.icon}
                            className="w-5 h-5"
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900">
                            {hoveredCategoryObj.name}
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            {hoveredCategoryObj.subcategories.length} أقسام فرعية
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/ads?category=${encodeURIComponent(hoveredCategoryObj.slug)}`}
                        onClick={() => setHoveredCatSlug(null)}
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#e00000] hover:underline"
                      >
                        <span>عرض كل إعلانات {hoveredCategoryObj.name}</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="flex-1 grid grid-cols-4 gap-3">
                      {hoveredCategoryObj.subcategories.map((sub: any) => {
                        const subId = sub.id || sub.slug || sub;
                        const subName = sub.name || sub;
                        const subIcon = sub.icon || hoveredCategoryObj.icon || 'Tag';
                        return (
                          <Link
                            key={subId}
                            href={`/ads?category=${encodeURIComponent(
                              hoveredCategoryObj.slug
                            )}&subcategory=${encodeURIComponent(subId)}`}
                            onClick={() => setHoveredCatSlug(null)}
                            className="group flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <span className="w-8 h-8 rounded-lg platform-icon-box platform-icon-box-hover flex items-center justify-center shrink-0">
                              <CategoryIcon name={subIcon} className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 group-hover:text-[#e00000] truncate">
                                {subName}
                              </p>
                              {sub._count?.ads !== undefined && (
                                <p className="text-[10px] text-slate-400">
                                  {sub._count.ads} إعلان
                                </p>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* ==================== MOBILE SLIDE-DOWN MENU ==================== */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-xl max-h-[75vh] overflow-y-auto">
            {user ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-center py-2.5 border border-slate-300 rounded-lg font-extrabold text-xs text-slate-800 hover:bg-slate-50"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-center py-2.5 bg-[#222222] text-white rounded-lg font-extrabold text-xs"
                >
                  إنشاء حساب جديد
                </Link>
              </div>
            )}

            <Link
              href="/ads/create"
              onClick={() => setIsMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#e00000] text-white font-extrabold text-sm rounded-lg shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.8]" />
              <span>أضف إعلانك مجاناً</span>
            </Link>

            <div className="divide-y divide-slate-100 text-sm">
              <Link
                href="/ads"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 py-2.5 font-bold text-slate-800"
              >
                <Layers className="w-4 h-4 platform-icon-tint" />
                <span>تصفح جميع الإعلانات</span>
              </Link>
              <Link
                href="/ads?favorites=true"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 py-2.5 font-bold text-slate-800"
              >
                <Heart className="w-4 h-4 text-[#e00000]" />
                <span>الإعلانات المفضلة ({favCount})</span>
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 py-2.5 font-bold text-slate-800"
                >
                  <LayoutDashboard className="w-4 h-4 platform-icon-tint" />
                  <span>إعلاناتي وحسابي</span>
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 py-2.5 font-extrabold text-[#e00000]"
                >
                  <ShieldCheck className="w-4 h-4 text-[#e00000]" />
                  <span>لوحة تحكم الإدارة (Admin)</span>
                </Link>
              )}
              {user && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 py-2.5 font-bold text-red-600 text-right"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export const Header: React.FC = () => {
  return (
    <Suspense fallback={<div className="h-16 bg-white border-b border-slate-200" />}>
      <HeaderInner />
    </Suspense>
  );
};
