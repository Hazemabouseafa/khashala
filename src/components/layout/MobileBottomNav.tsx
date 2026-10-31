'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Search, Plus, Heart, User } from 'lucide-react';

function MobileBottomNavInner() {
  const pathname = usePathname() || '/';
  const searchParams = useSearchParams();
  const [favCount, setFavCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const syncFavs = () => {
      try {
        const raw = localStorage.getItem('khashala_favorites');
        const parsed = raw ? JSON.parse(raw) : [];
        setFavCount(Array.isArray(parsed) ? parsed.length : 0);
      } catch {
        setFavCount(0);
      }
    };

    syncFavs();
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setIsLoggedIn(Boolean(d?.user)))
      .catch(() => {});

    window.addEventListener('khashala_fav_updated', syncFavs);
    window.addEventListener('storage', syncFavs);
    return () => {
      window.removeEventListener('khashala_fav_updated', syncFavs);
      window.removeEventListener('storage', syncFavs);
    };
  }, [pathname]);

  // Hide inside Admin panel and on individual Ad Details pages (where sticky Call/WhatsApp bar sits)
  const isAdDetail =
    pathname.startsWith('/ads/') && pathname !== '/ads/create';
  if (pathname.startsWith('/admin') || isAdDetail) {
    return null;
  }

  const isFavoritesTab =
    pathname === '/ads' && searchParams.get('favorites') === 'true';
  const isExploreTab = pathname === '/ads' && !isFavoritesTab;
  const isHomeTab = pathname === '/';
  const isAccountTab =
    pathname.startsWith('/dashboard') || pathname.startsWith('/auth');

  return (
    <nav
      aria-label="شريط التنقل السفلي"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200/95 shadow-[0_-4px_20px_rgba(15,23,42,0.07)] pb-safe"
    >
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
            isHomeTab ? 'text-[#e00000] font-extrabold' : 'text-slate-500 font-semibold'
          }`}
        >
          <Home className={`w-5 h-5 ${isHomeTab ? 'stroke-[2.5]' : 'stroke-[1.9]'}`} />
          <span className="text-[10px]">الرئيسية</span>
        </Link>

        {/* 2. Search / Browse */}
        <Link
          href="/ads"
          className={`flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
            isExploreTab ? 'text-[#e00000] font-extrabold' : 'text-slate-500 font-semibold'
          }`}
        >
          <Search className={`w-5 h-5 ${isExploreTab ? 'stroke-[2.5]' : 'stroke-[1.9]'}`} />
          <span className="text-[10px]">البحث</span>
        </Link>

        {/* 3. Post Ad (Elevated Center CTA) */}
        <Link
          href="/ads/create"
          className="flex flex-col items-center justify-center h-full -mt-5 group"
        >
          <span className="w-12 h-12 rounded-full bg-[#e00000] group-active:scale-95 text-white flex items-center justify-center shadow-lg shadow-red-600/35 ring-4 ring-white transition-transform">
            <Plus className="w-6 h-6 stroke-[2.8]" />
          </span>
          <span className="text-[10px] font-extrabold text-slate-800 mt-0.5">
            أضف إعلانك
          </span>
        </Link>

        {/* 4. Favorites */}
        <Link
          href="/ads?favorites=true"
          className={`relative flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
            isFavoritesTab ? 'text-[#e00000] font-extrabold' : 'text-slate-500 font-semibold'
          }`}
        >
          <div className="relative">
            <Heart
              className={`w-5 h-5 ${
                isFavoritesTab
                  ? 'fill-[#e00000] text-[#e00000]'
                  : 'stroke-[1.9]'
              }`}
            />
            {favCount > 0 && (
              <span className="absolute -top-1.5 -left-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#e00000] text-white text-[9px] font-black flex items-center justify-center">
                {favCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">المفضلة</span>
        </Link>

        {/* 5. My Account */}
        <Link
          href={isLoggedIn ? '/dashboard' : '/auth/login'}
          className={`flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
            isAccountTab ? 'text-[#e00000] font-extrabold' : 'text-slate-500 font-semibold'
          }`}
        >
          <User className={`w-5 h-5 ${isAccountTab ? 'stroke-[2.5]' : 'stroke-[1.9]'}`} />
          <span className="text-[10px]">{isLoggedIn ? 'حسابي' : 'دخول'}</span>
        </Link>
      </div>
    </nav>
  );
}

export const MobileBottomNav: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <MobileBottomNavInner />
    </Suspense>
  );
};
