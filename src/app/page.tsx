import React from 'react';
import Link from 'next/link';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { AdCard } from '@/components/ads/AdCard';
import { prisma } from '@/lib/prisma';
import { ensureSampleDataSeeded } from '@/lib/auto-seed';
import { parseHomeBanners } from '@/lib/banners';
import { ArrowLeft, Star, Plus } from 'lucide-react';

export const revalidate = 0;

const HOME_CATEGORY_SHELVES = [
  { slug: 'vehicles', title: 'سيارات ومركبات للبيع' },
  { slug: 'real-estate', title: 'عقارات للبيع والإيجار' },
  { slug: 'electronics', title: 'موبايلات وإلكترونيات' },
  { slug: 'furniture', title: 'أثاث وديكور منزلي' },
  { slug: 'fashion', title: 'أزياء وساعات فاخرة' },
  { slug: 'jobs', title: 'وظائف وفرص عمل' },
];

function normalizeAds(ads: any[]) {
  return ads.map((ad: any) => ({
    ...ad,
    images: Array.isArray(ad.images)
      ? ad.images
      : typeof ad.images === 'string'
      ? JSON.parse(ad.images || '[]')
      : [],
  }));
}

async function getHomeMarketplaceData() {
  try {
    await ensureSampleDataSeeded();

    const adInclude = {
      category: true,
      subcategory: true,
      user: { select: { id: true, name: true, phone: true } },
    };

    const [bannersSetting, featuredRaw, latestRaw, ...shelfResults] = await Promise.all([
      prisma.platformSetting.findUnique({ where: { key: 'homeBanners' } }),
      prisma.ad.findMany({
        where: { status: 'ACTIVE' as any, isFeatured: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: adInclude,
      }),
      prisma.ad.findMany({
        where: { status: 'ACTIVE' as any },
        orderBy: { createdAt: 'desc' },
        take: 12,
        include: adInclude,
      }),
      ...HOME_CATEGORY_SHELVES.map((shelf) =>
        prisma.ad.findMany({
          where: {
            status: 'ACTIVE' as any,
            category: { slug: shelf.slug },
          },
          orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
          take: 8,
          include: adInclude,
        })
      ),
    ]);

    const shelves = HOME_CATEGORY_SHELVES.map((shelf, idx) => ({
      ...shelf,
      ads: normalizeAds(shelfResults[idx] || []),
    })).filter((s) => s.ads.length > 0);

    return {
      homeBanners: parseHomeBanners(bannersSetting?.value),
      featuredAds: normalizeAds(featuredRaw),
      latestAds: normalizeAds(latestRaw),
      shelves,
    };
  } catch (err) {
    console.error('Error loading homepage marketplace data:', err);
    return { homeBanners: parseHomeBanners(null), featuredAds: [], latestAds: [], shelves: [] };
  }
}

export default async function HomePage() {
  const { homeBanners, featuredAds, latestAds, shelves } = await getHomeMarketplaceData();

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* 1. Promotional Banner Slider (Admin-Managed Posters) */}
      <HeroSection initialBanners={homeBanners} />

      {/* 2. All Categories Horizontal Strip & Subcategory Pills */}
      <CategoryGrid />

      {/* 3. Featured VIP Ads Horizontal Shelf */}
      {featuredAds.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-400 text-slate-950">
                <Star className="w-3.5 h-3.5 fill-slate-950" />
              </span>
              <h2 className="text-base sm:text-xl font-black text-[#222222]">
                إعلانات مميزة ومختارة
              </h2>
            </div>

            <Link
              href="/ads?isFeatured=true"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-[#e00000] hover:underline"
            >
              <span>المزيد</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Horizontal Scroll on Mobile/Tablet, 4-Column Grid on Desktop */}
          <div className="flex flex-nowrap overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3 -mx-3 px-3 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4 lg:gap-4">
            {featuredAds.slice(0, 8).map((ad: any) => (
              <div
                key={ad.id}
                className="w-[215px] sm:w-[248px] lg:w-auto shrink-0 snap-start"
              >
                <AdCard ad={ad} variant="grid" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Per-Category Horizontal Shelves (Vehicles, Real Estate, Electronics, Furniture, Fashion, Jobs) */}
      {shelves.map((shelf) => (
        <section
          key={shelf.slug}
          className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-1"
        >
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-base sm:text-xl font-black text-[#222222]">
              {shelf.title}
            </h2>
            <Link
              href={`/ads?category=${encodeURIComponent(shelf.slug)}`}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-[#e00000] hover:underline"
            >
              <span>عرض المزيد</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Swipeable Horizontal Cards on Mobile, 4-Col Row on Desktop */}
          <div className="flex flex-nowrap overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3 -mx-3 px-3 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4 lg:gap-4">
            {shelf.ads.slice(0, 4).map((ad: any) => (
              <div
                key={ad.id}
                className="w-[215px] sm:w-[248px] lg:w-auto shrink-0 snap-start"
              >
                <AdCard ad={ad} variant="grid" />
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* 5. Mid-Page Sell Your Item Banner */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="text-center sm:text-right">
            <h3 className="text-base sm:text-xl font-black text-[#222222] mb-1">
              عندك غرض ما تحتاجه؟ حوّله لكاش اليوم!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              انشر إعلانك مجاناً في ثوانٍ واستقبل عروض الشراء مباشرة عبر الهاتف أو واتساب.
            </p>
          </div>

          <Link
            href="/ads/create"
            className="shrink-0 inline-flex items-center gap-2 bg-[#e00000] hover:bg-[#c20000] text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.8]" />
            <span>أضف إعلانك الآن</span>
          </Link>
        </div>
      </section>

      {/* 6. Freshly Added Ads Grid */}
      {latestAds.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-1">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-base sm:text-xl font-black text-[#222222]">
              أحدث الإعلانات المضافة
            </h2>
            <Link
              href="/ads"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-[#e00000] hover:underline"
            >
              <span>كل الإعلانات</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {latestAds.map((ad: any) => (
              <AdCard key={ad.id} ad={ad} variant="grid" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
