import React from 'react';
import Link from 'next/link';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { AdCard } from '@/components/ads/AdCard';
import { prisma } from '@/lib/prisma';
import { PlusCircle, Flame, Star, Shield, Zap, HeartHandshake } from 'lucide-react';

export const revalidate = 0;

async function getHomeAds() {
  try {
    const [featuredRaw, latestRaw] = await Promise.all([
      prisma.ad.findMany({
        where: { status: 'ACTIVE' as any, isFeatured: true },
        orderBy: { createdAt: 'desc' },
        take: 4,
        include: {
          category: true,
          subcategory: true,
        },
      }),
      prisma.ad.findMany({
        where: { status: 'ACTIVE' as any },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          category: true,
          subcategory: true,
        },
      }),
    ]);

    const normalize = (ads: any[]) =>
      ads.map((ad: any) => ({
        ...ad,
        images: Array.isArray(ad.images)
          ? ad.images
          : typeof ad.images === 'string'
          ? JSON.parse(ad.images || '[]')
          : [],
      }));

    return {
      featuredAds: normalize(featuredRaw),
      latestAds: normalize(latestRaw),
    };
  } catch (err) {
    console.error('Error loading ads:', err);
    return { featuredAds: [], latestAds: [] };
  }
}

export default async function HomePage() {
  const { featuredAds, latestAds } = await getHomeAds();

  return (
    <div className="space-y-6 pb-16">
      {/* Hero Section */}
      <HeroSection />

      {/* Categories & Subcategories Grid (Identical Card Style) */}
      <CategoryGrid />

      {/* 1. Featured Ads Section */}
      {featuredAds.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-gradient-to-br from-white/90 via-blue-50/70 to-sky-50/80 backdrop-blur-md rounded-3xl border border-blue-200/90 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700 bg-amber-100/90 border border-amber-300 px-3 py-1 rounded-full mb-2">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  <span>إعلانات مميزة وموثقة (VIP Featured)</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  عروض النخبة المميزة ⭐
                </h2>
              </div>

              <Link
                href="/ads?isFeatured=true"
                className="self-start sm:self-auto text-xs sm:text-sm font-bold text-brand-700 hover:text-brand-800 bg-white hover:bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl transition-colors shadow-2xs"
              >
                عرض كل الإعلانات المميزة ←
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {featuredAds.map((ad: any) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. Latest Ads Listing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 mb-1">
              <Flame className="w-4 h-4 fill-brand-600" />
              <span>متجدد على مدار الساعة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              أحدث الإعلانات المضافة
            </h2>
          </div>

          <Link
            href="/ads"
            className="self-start sm:self-auto text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            مشاهدة جميع الإعلانات ←
          </Link>
        </div>

        {/* Ads Grid */}
        {latestAds.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {latestAds.map((ad: any) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-blue-200">
            <p className="text-base text-slate-500 font-medium">لا توجد إعلانات منشورة حتى الآن.</p>
            <Link
              href="/ads/create"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl text-sm"
            >
              كن أول من يضيف إعلاناً!
            </Link>
          </div>
        )}
      </section>

      {/* Post Ad CTA Banner (Harmonized Royal & Sky Blue) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
        <div className="bg-gradient-to-l from-navy-900 via-brand-700 to-sky-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-brand-700/20 border border-blue-400/30 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="relative z-10 max-w-xl text-center md:text-right">
            <span className="inline-block text-xs font-extrabold uppercase tracking-wider bg-sky-400/20 text-sky-200 border border-sky-300/30 px-3.5 py-1 rounded-full mb-3 backdrop-blur-xs">
              مجاناً وبدون أي عمولة
            </span>
            <h3 className="text-2xl sm:text-4xl font-black mb-3">
              عندك سيارة، عقار، أو جهاز تبي تبيعه بسرعة؟
            </h3>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              انشر إعلانك الآن على خشاله في أقل من دقيقة، واستقبل اتصالات ورسائل المشترين مباشرة عبر واتساب في 22 دولة عربية.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link
              href="/ads/create"
              className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-brand-700 font-black text-base px-8 py-4 rounded-2xl shadow-xl transition-all duration-200 active:scale-95"
            >
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              <span>أضف إعلانك مجاناً</span>
            </Link>
          </div>

          {/* Decorative circle */}
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />
        </div>
      </section>

      {/* Why Khashala Feature Blocks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-black text-slate-900">
            لماذا يتفوق &quot;خشاله&quot; في سوق الإعلانات المبوبة؟
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            صممنا المنصة بأحدث المعايير العالمية لتمنحك أسهل وأسرع تجربة بيع وشراء في الوطن العربي
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/95 p-6 rounded-2xl border border-blue-200/80 shadow-xs flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">سرعة فائقة وضغط صور ذكي</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              تقنية Sharp المدمجة تقوم بتحويل وضغط الصور تلقائياً لـ WebP لسرعة تصفح فائقة وتوفير استهلاك البيانات.
            </p>
          </div>

          <div className="bg-white/95 p-6 rounded-2xl border border-blue-200/80 shadow-xs flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">فلترة شاملة وأقسام فرعية دقيقة</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              تصفح عبر الأقسام الرئيسية والفرعية مع فلاتر متقدمة تشمل الدولة، المدينة، الحالة، السعر، والتمييز.
            </p>
          </div>

          <div className="bg-white/95 p-6 rounded-2xl border border-blue-200/80 shadow-xs flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">تواصل مباشر وعروض واتساب فورية</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              إمكانية إرسال استفسارات وعروض أسعار جاهزة للبائع عبر واتساب أو الاتصال المباشر بضغطة زر واحدة.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
