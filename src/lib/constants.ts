export interface ArabCountry {
  name: string;
  shortName: string;
  code: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  cities: string[];
}

export const ARAB_COUNTRIES: ArabCountry[] = [
  {
    name: 'المملكة العربية السعودية',
    shortName: 'السعودية',
    code: 'SA',
    flag: '🇸🇦',
    currency: 'ريال سعودي',
    currencySymbol: 'ر.س',
    cities: [
      'الرياض',
      'جدة',
      'مكة المكرمة',
      'المدينة المنورة',
      'الدمام',
      'الخبر',
      'الظهران',
      'الأحساء',
      'الطائف',
      'بريدة (القصيم)',
      'عنيزة',
      'تبوك',
      'أبها',
      'خميس مشيط',
      'حائل',
      'نجران',
      'جازان',
      'الجبيل',
      'ينبع',
      'حفر الباطن',
      'الخرج',
      'عرعر',
      'سكاكا',
    ],
  },
  {
    name: 'جمهورية مصر العربية',
    shortName: 'مصر',
    code: 'EG',
    flag: '🇪🇬',
    currency: 'جنيه مصري',
    currencySymbol: 'ج.م',
    cities: [
      'القاهرة',
      'الإسكندرية',
      'الجيزة',
      'المنصورة',
      'طنطا',
      'الزقازيق',
      'بورسعيد',
      'السويس',
      'الإسماعيلية',
      'أسيوط',
      'سوهاج',
      'أسوان',
      'الأقصر',
      'الغردقة',
      'شرم الشيخ',
      'بنها',
      'المنيا',
      'قنا',
      'دمياط',
      'الفيوم',
      'بني سويف',
      'دمنهور',
      'شبين الكوم',
    ],
  },
  {
    name: 'الإمارات العربية المتحدة',
    shortName: 'الإمارات',
    code: 'AE',
    flag: '🇦🇪',
    currency: 'درهم إماراتي',
    currencySymbol: 'د.إ',
    cities: [
      'دبي',
      'أبوظبي',
      'الشارقة',
      'عجمان',
      'رأس الخيمة',
      'الفجيرة',
      'أم القيوين',
      'العين',
      'خورفكان',
      'دبا الحصن',
    ],
  },
  {
    name: 'دولة الكويت',
    shortName: 'الكويت',
    code: 'KW',
    flag: '🇰🇼',
    currency: 'دينار كويتي',
    currencySymbol: 'د.ك',
    cities: [
      'مدينة الكويت',
      'حولي',
      'السالمية',
      'الفروانية',
      'الأحمدي',
      'الجهراء',
      'مبارك الكبير',
      'صباح الأحمد',
      'خيطان',
      'الفحيحيل',
    ],
  },
  {
    name: 'دولة قطر',
    shortName: 'قطر',
    code: 'QA',
    flag: '🇶🇦',
    currency: 'ريال قطري',
    currencySymbol: 'ر.ق',
    cities: [
      'الدوحة',
      'الريان',
      'الوكرة',
      'الخور',
      'لوسيل',
      'أم صلال',
      'الشمال',
      'مسيعيد',
      'الشحانية',
    ],
  },
  {
    name: 'مملكة البحرين',
    shortName: 'البحرين',
    code: 'BH',
    flag: '🇧🇭',
    currency: 'دينار بحريني',
    currencySymbol: 'د.ب',
    cities: [
      'المنامة',
      'المحرق',
      'الرفاع',
      'سترة',
      'مدينة عيسى',
      'مدينة حمد',
      'البديع',
      'الحد',
      'سار',
    ],
  },
  {
    name: 'سلطنة عمان',
    shortName: 'عمان',
    code: 'OM',
    flag: '🇴🇲',
    currency: 'ريال عماني',
    currencySymbol: 'ر.ع',
    cities: [
      'مسقط',
      'صلالة',
      'صحار',
      'نزوى',
      'صور',
      'السيب',
      'بوشر',
      'مطرح',
      'البريمي',
      'الرستاق',
      'خصب',
      'إبراء',
    ],
  },
  {
    name: 'المملكة الأردنية الهاشمية',
    shortName: 'الأردن',
    code: 'JO',
    flag: '🇯🇴',
    currency: 'دينار أردني',
    currencySymbol: 'د.أ',
    cities: [
      'عمان',
      'إربد',
      'الزرقاء',
      'العقبة',
      'السلط',
      'مادبا',
      'جرش',
      'الكرك',
      'المفرق',
      'الطفيلة',
      'معان',
      'عجلون',
    ],
  },
  {
    name: 'جمهورية العراق',
    shortName: 'العراق',
    code: 'IQ',
    flag: '🇮🇶',
    currency: 'دينار عراقي',
    currencySymbol: 'د.ع',
    cities: [
      'بغداد',
      'البصرة',
      'أربيل',
      'الموصل',
      'النجف',
      'كربلاء',
      'السليمانية',
      'كركوك',
      'الحلة (بابل)',
      'الناصرية',
      'العمارة',
      'الديوانية',
      'الكوت',
      'دهوك',
      'الرمادي',
      'سامراء',
    ],
  },
  {
    name: 'المملكة المغربية',
    shortName: 'المغرب',
    code: 'MA',
    flag: '🇲🇦',
    currency: 'درهم مغربي',
    currencySymbol: 'د.م',
    cities: [
      'الدار البيضاء',
      'الرباط',
      'مراكش',
      'طنجة',
      'فاس',
      'أكادير',
      'مكناس',
      'وجدة',
      'القنيطرة',
      'تطوان',
      'العيون',
      'الجديدة',
      'آسفي',
      'الناظور',
      'بني ملال',
    ],
  },
  {
    name: 'الجمهورية الجزائرية',
    shortName: 'الجزائر',
    code: 'DZ',
    flag: '🇩🇿',
    currency: 'دينار جزائري',
    currencySymbol: 'د.ج',
    cities: [
      'الجزائر العاصمة',
      'وهران',
      'قسنطينة',
      'عنابة',
      'سطيف',
      'باتنة',
      'البليدة',
      'تلمسان',
      'بجاية',
      'الشلف',
      'سيدي بلعباس',
      'بسكرة',
      'ورقلة',
      'تيزي وزو',
    ],
  },
  {
    name: 'الجمهورية التونسية',
    shortName: 'تونس',
    code: 'TN',
    flag: '🇹🇳',
    currency: 'دينار تونسي',
    currencySymbol: 'د.ت',
    cities: [
      'تونس العاصمة',
      'صفاقس',
      'سوسة',
      'القيروان',
      'بنزرت',
      'قابس',
      'أريانة',
      'المنستير',
      'نابل',
      'مدنين',
      'تطاوين',
      'باجة',
      'جندوبة',
      'الحمامات',
    ],
  },
  {
    name: 'دولة ليبيا',
    shortName: 'ليبيا',
    code: 'LY',
    flag: '🇱🇾',
    currency: 'دينار ليبي',
    currencySymbol: 'د.ل',
    cities: [
      'طرابلس',
      'بنغازي',
      'مصراتة',
      'البيضاء',
      'الزاوية',
      'طبرق',
      'سرت',
      'سبها',
      'درنة',
      'زليتن',
      'غريان',
      'صبراتة',
    ],
  },
  {
    name: 'الجمهورية اللبنانية',
    shortName: 'لبنان',
    code: 'LB',
    flag: '🇱🇧',
    currency: 'ليرة لبنانية',
    currencySymbol: 'ل.ل',
    cities: [
      'بيروت',
      'طرابلس',
      'صيدا',
      'صور',
      'جونية',
      'زحلة',
      'جبيل',
      'بعلبك',
      'النبطية',
      'عاليه',
      'بيت الدين',
    ],
  },
  {
    name: 'دولة فلسطين',
    shortName: 'فلسطين',
    code: 'PS',
    flag: '🇵🇸',
    currency: 'شيكل / دينار',
    currencySymbol: 'د.أ',
    cities: [
      'القدس الشريف',
      'رام الله',
      'غزة',
      'نابلس',
      'الخليل',
      'جنين',
      'بيت لحم',
      'طولكرم',
      'أريحا',
      'قلقيلية',
      'رفح',
      'خان يونس',
      'دير البلح',
      'يافا',
      'حيفا',
      'عكا',
    ],
  },
  {
    name: 'الجمهورية العربية السورية',
    shortName: 'سوريا',
    code: 'SY',
    flag: '🇸🇾',
    currency: 'ليرة سورية',
    currencySymbol: 'ل.س',
    cities: [
      'دمشق',
      'حلب',
      'حمص',
      'اللاذقية',
      'حماة',
      'طرطوس',
      'دير الزور',
      'درعا',
      'السويداء',
      'الحسكة',
      'الرقة',
      'إدلب',
      'القنيطرة',
    ],
  },
  {
    name: 'الجمهورية اليمنية',
    shortName: 'اليمن',
    code: 'YE',
    flag: '🇾🇪',
    currency: 'ريال يمني',
    currencySymbol: 'ر.ي',
    cities: [
      'صنعاء',
      'عدن',
      'تعز',
      'الحديدة',
      'المكلا',
      'إب',
      'ذمار',
      'سيئون',
      'مأرب',
      'عتق',
      'صعدة',
      'الغيضة',
    ],
  },
  {
    name: 'جمهورية السودان',
    shortName: 'السودان',
    code: 'SD',
    flag: '🇸🇩',
    currency: 'جنيه سوداني',
    currencySymbol: 'ج.س',
    cities: [
      'الخرطوم',
      'أم درمان',
      'بورتسودان',
      'الخرطوم بحري',
      'كسلا',
      'الأبيض',
      'ود مدني',
      'القضارف',
      'الفاشر',
      'عطبرة',
      'دنقلا',
      'نيالا',
    ],
  },
  {
    name: 'الجمهورية الإسلامية الموريتانية',
    shortName: 'موريتانيا',
    code: 'MR',
    flag: '🇲🇷',
    currency: 'أوقية موريتانية',
    currencySymbol: 'أ.م',
    cities: [
      'نواكشوط',
      'نواذيبو',
      'كيفة',
      'روصو',
      'أطار',
      'كيهيدي',
      'الزويرات',
      'لعيون',
      'سيلبابي',
    ],
  },
  {
    name: 'جمهورية الصومال الفيدرالية',
    shortName: 'الصومال',
    code: 'SO',
    flag: '🇸🇴',
    currency: 'شلن صومالي',
    currencySymbol: 'ش.ص',
    cities: [
      'مقديشو',
      'هرجيسا',
      'بوساسو',
      'كسمايو',
      'بربرة',
      'جالكعيو',
      'بيدوا',
    ],
  },
  {
    name: 'جمهورية جيبوتي',
    shortName: 'جيبوتي',
    code: 'DJ',
    flag: '🇩🇯',
    currency: 'فرنك جيبوتي',
    currencySymbol: 'ف.ج',
    cities: [
      'جيبوتي العاصمة',
      'علي صبيح',
      'تاجورة',
      'أوبوك',
      'دخيل',
      'أرتا',
    ],
  },
  {
    name: 'جمهورية جزر القمر المتحدة',
    shortName: 'جزر القمر',
    code: 'KM',
    flag: '🇰🇲',
    currency: 'فرنك قمري',
    currencySymbol: 'ف.ق',
    cities: [
      'موروني',
      'موتسامودو',
      'فومبوني',
      'دوموني',
      'تسيمبيو',
    ],
  },
];

// Flat list of all cities across all Arab countries for quick lookups & search
export const CITIES = ARAB_COUNTRIES.flatMap((c) => c.cities);

// Helper functions
export function getCitiesByCountry(countryNameOrCode: string): string[] {
  if (!countryNameOrCode || countryNameOrCode === 'all') return CITIES;
  const match = ARAB_COUNTRIES.find(
    (c) =>
      c.name === countryNameOrCode ||
      c.shortName === countryNameOrCode ||
      c.code.toLowerCase() === countryNameOrCode.toLowerCase()
  );
  return match ? match.cities : [];
}

export function getCountryByCity(cityName: string): ArabCountry | undefined {
  if (!cityName) return undefined;
  return ARAB_COUNTRIES.find((c) => c.cities.includes(cityName));
}

export function getCountryByName(countryName: string): ArabCountry | undefined {
  if (!countryName) return undefined;
  return ARAB_COUNTRIES.find(
    (c) =>
      c.name === countryName ||
      c.shortName === countryName ||
      c.code.toLowerCase() === countryName.toLowerCase()
  );
}

export const CATEGORIES_DATA = [
  {
    name: 'سيارات ومركبات',
    slug: 'vehicles',
    icon: 'Car',
    subcategories: ['سيارات للبيع', 'قطع غيار واكسسوارات', 'دراجات نارية', 'قوارب ويخوت', 'مركبات ثقيلة'],
  },
  {
    name: 'عقارات',
    slug: 'real-estate',
    icon: 'Building2',
    subcategories: ['شقق للإيجار', 'شقق للبيع', 'فلل وقصور', 'أراضي ومزارع', 'عقارات تجارية'],
  },
  {
    name: 'إلكترونيات وأجهزة',
    slug: 'electronics',
    icon: 'Smartphone',
    subcategories: ['هواتف ذكية', 'أجهزة لوحية', 'كمبيوتر ولابتوب', 'أجهزة منزلية', 'تلفزيونات وصوتيات'],
  },
  {
    name: 'أثاث وديكور',
    slug: 'furniture',
    icon: 'Sofa',
    subcategories: ['غرف نوم', 'كنب ومجالس', 'طاولات وكراسي', 'سجاد ومفروشات', 'ديكورات وإضاءة'],
  },
  {
    name: 'أزياء وموضة',
    slug: 'fashion',
    icon: 'Shirt',
    subcategories: ['ملابس رجالية', 'ملابس نسائية', 'ساعات وإكسسوارات', 'أحذية وحقائب', 'عطور وتجميل'],
  },
  {
    name: 'وظائف',
    slug: 'jobs',
    icon: 'Briefcase',
    subcategories: ['وظائف هندسية وتكنولوجيا', 'مبيعات وتسويق', 'محاسبة ومالية', 'خدمة عملاء', 'تدريس وتدريب'],
  },
  {
    name: 'خدمات وأعمال',
    slug: 'services',
    icon: 'Wrench',
    subcategories: ['صيانة وترميم', 'نقل عفش وتخزين', 'تنظيف ومكافحة حشرات', 'خدمات تعليمية', 'حفلات ومناسبات'],
  },
  {
    name: 'حيوانات أليفة',
    slug: 'pets',
    icon: 'Dog',
    subcategories: ['قطط', 'طيور', 'كلاب', 'مستلزمات حيوانات', 'أعلاف وأسماك'],
  },
];

export const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'نشط', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  PENDING: { label: 'بانتظار المراجعة', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  REJECTED: { label: 'مرفوض', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  SOLD: { label: 'تم البيع', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
};

export const CONDITION_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  NEW: { label: 'جديد', color: 'text-emerald-700 border-emerald-200 bg-emerald-50', bg: 'bg-emerald-50 border-emerald-200' },
  LIKE_NEW: { label: 'مستعمل - كالجديد', color: 'text-slate-700 border-slate-200 bg-slate-100', bg: 'bg-slate-100 border-slate-200' },
  USED_GOOD: { label: 'مستعمل بحالة جيدة', color: 'text-slate-600 border-slate-200 bg-slate-50', bg: 'bg-slate-50 border-slate-200' },
  NA: { label: 'لا ينطبق', color: 'text-slate-500 border-slate-200 bg-slate-50', bg: 'bg-slate-50 border-slate-200' },
};

export function formatRelativeTimeAr(dateInput?: string | Date): string {
  if (!dateInput) return 'اليوم';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return 'اليوم';

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 5) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return 'منذ ساعة';
  if (diffHours === 2) return 'منذ ساعتين';
  if (diffHours <= 10) return `منذ ${diffHours} ساعات`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'أمس';
  if (diffDays === 2) return 'منذ يومين';
  if (diffDays <= 10) return `منذ ${diffDays} أيام`;
  if (diffDays < 30) return `منذ ${diffDays} يوماً`;

  return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
}

export const AVAILABLE_ICONS = [
  'Car',
  'Building2',
  'Smartphone',
  'Sofa',
  'Shirt',
  'Briefcase',
  'Wrench',
  'Dog',
  'Home',
  'Laptop',
  'Gamepad2',
  'Tv',
  'Zap',
  'Camera',
  'Watch',
  'Compass',
  'ShoppingBag',
  'Sparkles',
  'Star',
  'Flame',
  'Award',
  'Gift',
  'Layers',
  'Tag',
];

