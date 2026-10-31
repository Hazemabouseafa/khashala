'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  User as UserIcon,
  Search,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  X,
  Compass,
  Heart,
  Megaphone,
  Layers,
} from 'lucide-react';
import { KhashalaLogo } from '@/components/ui/KhashalaLogo';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CATEGORIES_DATA } from '@/lib/constants';

interface UserState {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

function HeaderCategoryStrip() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  // Hide category strip inside /admin panel to keep admin header clean
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const list = categories.length > 0 ? categories : CATEGORIES_DATA;
  const activeCat = pathname === '/ads' ? searchParams.get('category') || '' : '';

  return (
    <div className="border-t border-blue-100/90 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <nav
          aria-label="تصفح الأقسام أفقياً"
          className="flex items-center flex-nowrap overflow-x-auto no-scrollbar snap-x snap-mandatory gap-2 py-2"
        >
          <Link
            href="/ads"
            className={`shrink-0 snap-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
              pathname === '/ads' && !activeCat
                ? 'platform-icon-active'
                : 'bg-slate-50/90 hover:bg-white text-slate-800 border-slate-200/80 hover:shadow-2xs'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                pathname === '/ads' && !activeCat ? 'bg-white/20 text-white' : 'platform-icon-box'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </span>
            <span>كل الأقسام</span>
          </Link>

          {list.map((cat: any) => {
            const isCurrent = activeCat === cat.slug || activeCat === cat.id;
            return (
              <Link
                key={cat.slug}
                href={`/ads?category=${encodeURIComponent(cat.slug)}`}
                className={`group shrink-0 snap-start inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                  isCurrent
                    ? 'platform-icon-active'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-blue-100 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? 'bg-white/20 text-white'
                      : 'platform-icon-box platform-icon-box-hover'
                  }`}
                >
                  <CategoryIcon name={cat.icon} className="w-3.5 h-3.5 stroke-[2]" />
                </span>
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export const Header: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserState | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favCount, setFavCount] = useState(0);
  const [announcement, setAnnouncement] = useState<{ active: boolean; text: string } | null>(null);

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    }
  };

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

  useEffect(() => {
    refreshUser();
    updateFavCount();
    loadAnnouncement();
    window.addEventListener('khashala_fav_updated', updateFavCount);
    window.addEventListener('khashala_branding_updated', loadAnnouncement);
    window.addEventListener('storage', updateFavCount);
    return () => {
      window.removeEventListener('khashala_fav_updated', updateFavCount);
      window.removeEventListener('khashala_branding_updated', loadAnnouncement);
      window.removeEventListener('storage', updateFavCount);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setIsUserDropdownOpen(false);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/ads?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/ads');
    }
  };

  return (
    <>
      {/* Platform Announcement Bar (controlled via Admin Settings) */}
      {announcement?.active && announcement.text && (
        <div className="bg-gradient-to-r from-brand-700 via-blue-600 to-sky-600 text-white text-xs font-bold py-2 px-4 text-center shadow-xs flex items-center justify-center gap-2">
          <Megaphone className="w-3.5 h-3.5 animate-bounce shrink-0" />
          <span className="truncate">{announcement.text}</span>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-blue-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20 gap-3 sm:gap-4">
            {/* Logo & Brand */}
            <div className="flex items-center gap-4">
              <KhashalaLogo size="md" variant="full" theme="dark" />

              {/* Quick Explore Link */}
              <Link
                href="/ads"
                className="hidden md:flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-brand-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-blue-50"
              >
                <Compass className="w-4 h-4 platform-icon-tint" />
                <span>تصفح الإعلانات</span>
              </Link>
            </div>

            {/* Quick Header Search Bar (Desktop) */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden lg:flex flex-1 max-w-md items-center relative"
            >
              <input
                type="text"
                placeholder="ابحث عن سيارات، شقق، جوالات، أثاث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-blue-50/70 hover:bg-blue-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm rounded-full py-2.5 pr-10 pl-4 border border-blue-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all duration-200"
              />
              <Search className="w-4 h-4 platform-icon-tint absolute right-3.5 pointer-events-none" />
            </form>

            {/* User Actions & CTA */}
            <div className="flex items-center gap-2">
              {/* Favorites Quick Link */}
              <Link
                href="/ads?favorites=true"
                className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-slate-700 border border-blue-200/80 transition-colors text-xs font-bold shadow-2xs"
                title="الإعلانات المفضلة المحفوظة"
              >
                <Heart
                  className={`w-4 h-4 ${
                    favCount > 0 ? 'fill-rose-500 text-rose-500' : 'platform-icon-tint'
                  }`}
                />
                <span className="hidden sm:inline">المفضلة</span>
                {favCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-brand-600 text-white text-[10px] font-black rounded-full">
                    {favCount}
                  </span>
                )}
              </Link>

              {/* Post Ad Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/ads/create"
                  className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-brand-600 via-blue-600 to-sky-500 hover:from-brand-700 hover:to-blue-700 text-white font-bold text-xs sm:text-sm px-3.5 sm:px-5 py-2.5 rounded-xl shadow-md shadow-brand-600/25 transition-all duration-200 active:scale-95 whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                  <span>أضف إعلانك</span>
                </Link>
              </motion.div>

              {/* User Account / Login State */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:pr-3 sm:pl-2 rounded-xl border border-blue-200 hover:border-brand-300 bg-white hover:bg-blue-50/50 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-navy-900 text-white font-bold text-sm flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate">
                        {user.name}
                      </span>
                      <span className="text-[10px] font-medium text-brand-600">
                        {user.role === 'ADMIN' ? 'مشرف المنصة' : 'مستخدم'}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-blue-100 py-2 z-50 text-right"
                      >
                        <div className="px-4 py-2.5 border-b border-blue-50">
                          <p className="text-sm font-bold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-brand-600 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 platform-icon-tint" />
                            <span>إعلاناتي وحسابي</span>
                          </Link>

                          <Link
                            href="/ads?favorites=true"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-brand-600 transition-colors"
                          >
                            <Heart className="w-4 h-4 text-rose-500" />
                            <span>الإعلانات المفضلة ({favCount})</span>
                          </Link>

                          {user.role === 'ADMIN' && (
                            <Link
                              href="/admin"
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-brand-700 bg-blue-50/60 hover:bg-blue-100/80 transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4 platform-icon-tint" />
                              <span>لوحة تحكم المشرف (Admin)</span>
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-blue-50 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-right"
                          >
                            <LogOut className="w-4 h-4 text-red-500" />
                            <span>تسجيل الخروج</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-brand-600 px-2.5 sm:px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 platform-icon-tint" />
                    <span>دخول</span>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-blue-50"
                aria-label="القائمة"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Swipeable Categories Bar (Mobile & Desktop) */}
        <React.Suspense fallback={null}>
          <HeaderCategoryStrip />
        </React.Suspense>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-blue-200 bg-white px-4 py-4 space-y-3"
            >
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن أي شيء..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-blue-50/70 text-sm rounded-xl py-2.5 pr-10 pl-4 border border-blue-200 focus:outline-none focus:border-brand-500"
                />
                <Search className="w-4 h-4 platform-icon-tint absolute right-3.5 top-3" />
              </form>

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/ads"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-slate-700 font-semibold"
                >
                  <Compass className="w-5 h-5 platform-icon-tint" />
                  <span>كل الإعلانات المبوبة</span>
                </Link>

                <Link
                  href="/ads?favorites=true"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-slate-700 font-semibold"
                >
                  <Heart className="w-5 h-5 text-rose-500" />
                  <span>المفضلة ({favCount})</span>
                </Link>

                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 py-2 text-slate-700 font-semibold"
                    >
                      <LayoutDashboard className="w-5 h-5 platform-icon-tint" />
                      <span>لوحة التحكم وإعلاناتي</span>
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 py-2 text-brand-700 font-bold"
                      >
                        <ShieldCheck className="w-5 h-5 platform-icon-tint" />
                        <span>لوحة تحكم المشرف (Admin)</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 py-2 text-red-600 font-semibold text-right"
                    >
                      <LogOut className="w-5 h-5 text-red-500" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 text-center py-2.5 border border-blue-200 rounded-xl font-bold text-sm text-slate-700 hover:bg-blue-50"
                    >
                      تسجيل الدخول
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 text-center py-2.5 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700"
                    >
                      إنشاء حساب
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
