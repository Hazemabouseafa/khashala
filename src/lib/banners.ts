export interface HomeBannerItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  overlayTheme: 'dark' | 'crimson' | 'slate' | 'light_scrim' | 'none';
  displayMode: 'with_text' | 'image_only';
  isActive: boolean;
}

export const BANNER_OVERLAY_CLASSES: Record<HomeBannerItem['overlayTheme'], string> = {
  dark: 'bg-gradient-to-l from-[#111827]/90 via-[#111827]/70 to-black/25',
  crimson: 'bg-gradient-to-l from-[#7f1d1d]/90 via-[#991b1b]/75 to-[#111827]/40',
  slate: 'bg-gradient-to-l from-[#1f2937]/90 via-[#1e293b]/70 to-transparent',
  light_scrim: 'bg-gradient-to-l from-black/55 via-black/30 to-transparent',
  none: 'bg-transparent',
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
    overlayTheme: 'crimson',
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
    overlayTheme: 'dark',
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
    overlayTheme: 'crimson',
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
          : 'dark',
      displayMode: item.displayMode === 'image_only' ? 'image_only' : 'with_text',
      isActive: item.isActive !== false,
    }));
  } catch {
    return DEFAULT_HOME_BANNERS;
  }
}
