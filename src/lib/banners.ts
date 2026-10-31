export interface HomeBannerItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  overlayTheme: 'light_scrim' | 'dark' | 'crimson' | 'slate' | 'none';
  displayMode: 'with_text' | 'image_only';
  isActive: boolean;
}

export const BANNER_OVERLAY_CLASSES: Record<HomeBannerItem['overlayTheme'], string> = {
  light_scrim: 'bg-gradient-to-l from-black/55 via-black/35 to-black/15',
  dark: 'bg-gradient-to-l from-slate-950/65 via-slate-900/40 to-black/20',
  crimson: 'bg-gradient-to-l from-red-950/60 via-black/40 to-black/15',
  slate: 'bg-gradient-to-l from-slate-900/60 via-slate-800/35 to-black/15',
  none: 'bg-transparent',
};

export const BANNER_OVERLAY_STYLES: Record<HomeBannerItem['overlayTheme'], string> = {
  light_scrim:
    'linear-gradient(to left, rgba(0, 0, 0, 0.56) 0%, rgba(0, 0, 0, 0.34) 52%, rgba(0, 0, 0, 0.16) 100%)',
  dark:
    'linear-gradient(to left, rgba(15, 23, 42, 0.66) 0%, rgba(15, 23, 42, 0.42) 55%, rgba(0, 0, 0, 0.20) 100%)',
  crimson:
    'linear-gradient(to left, rgba(105, 18, 18, 0.60) 0%, rgba(17, 24, 39, 0.38) 55%, rgba(0, 0, 0, 0.16) 100%)',
  slate:
    'linear-gradient(to left, rgba(30, 41, 59, 0.62) 0%, rgba(30, 41, 59, 0.36) 55%, rgba(0, 0, 0, 0.15) 100%)',
  none: 'none',
};

export const DEFAULT_HOME_BANNERS: HomeBannerItem[] = [
  {
    id: 'banner-motors',
    badge: 'سوق السيارات والمركبات',
    title: 'ابحث عن سيارتك القادمة بأفضل سعر ومباشرة من المالك',
    subtitle: 'مئات السيارات المفحوصة والجديدة والمستعملة في جميع المدن العربية بدون وسيط',
    ctaLabel: 'تصفح السيارات الآن',
    ctaHref: '/ads?category=vehicles',
    image:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=80&auto=format&fit=crop',
    overlayTheme: 'light_scrim',
    displayMode: 'with_text',
    isActive: true,
  },
  {
    id: 'banner-realestate',
    badge: 'عقارات للبيع والإيجار',
    title: 'شقق، فلل، شاليهات ومكاتب تجارية في أرقى الأحياء',
    subtitle: 'قارن الأسعار وتواصل مع الملاك والمعلنين فوراً عبر الهاتف أو واتساب',
    ctaLabel: 'استكشف العقارات',
    ctaHref: '/ads?category=real-estate',
    image:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1400&q=80&auto=format&fit=crop',
    overlayTheme: 'light_scrim',
    displayMode: 'with_text',
    isActive: true,
  },
  {
    id: 'banner-sell-fast',
    badge: 'انشر مجاناً في 60 ثانية',
    title: 'عندك سيارة أو عقار أو موبايل حابب تبيعه بسرعة؟',
    subtitle:
      'أضف إعلانك مجاناً على خشاله أو ميّزه ليظهر في صدارة القسم ويحقق أعلى المشاهدات',
    ctaLabel: 'أضف إعلانك مجاناً',
    ctaHref: '/ads/create',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1400&q=80&auto=format&fit=crop',
    overlayTheme: 'light_scrim',
    displayMode: 'with_text',
    isActive: true,
  },
];

export function parseHomeBanners(rawValue?: string | null): HomeBannerItem[] {
  if (!rawValue || !rawValue.trim()) {
    return DEFAULT_HOME_BANNERS;
  }
  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return DEFAULT_HOME_BANNERS;
    }
    return parsed.map((item: any, index: number) => ({
      id: String(item.id || `banner-${index + 1}`),
      badge: typeof item.badge === 'string' ? item.badge : '',
      title: typeof item.title === 'string' ? item.title : '',
      subtitle: typeof item.subtitle === 'string' ? item.subtitle : '',
      ctaLabel: typeof item.ctaLabel === 'string' ? item.ctaLabel : '',
      ctaHref: typeof item.ctaHref === 'string' && item.ctaHref.trim() ? item.ctaHref.trim() : '/ads',
      image:
        typeof item.image === 'string' && item.image.trim()
          ? item.image.trim()
          : DEFAULT_HOME_BANNERS[0].image,
      overlayTheme:
        item.overlayTheme && item.overlayTheme in BANNER_OVERLAY_CLASSES
          ? item.overlayTheme
          : 'light_scrim',
      displayMode: item.displayMode === 'image_only' ? 'image_only' : 'with_text',
      isActive: item.isActive !== false,
    }));
  } catch {
    return DEFAULT_HOME_BANNERS;
  }
}
