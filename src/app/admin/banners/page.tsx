'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  Type,
  Link2,
  Sparkles,
  ExternalLink,
  Star,
  ArrowLeft,
} from 'lucide-react';
import {
  BANNER_OVERLAY_CLASSES,
  BANNER_OVERLAY_STYLES,
  DEFAULT_HOME_BANNERS,
  HomeBannerItem,
} from '@/lib/banners';

const OVERLAY_OPTIONS: {
  value: HomeBannerItem['overlayTheme'];
  label: string;
  previewClass: string;
}[] = [
  {
    value: 'light_scrim',
    label: 'تظليل خفيف متوازن (موصى به)',
    previewClass: 'bg-gradient-to-l from-black/60 to-black/20',
  },
  {
    value: 'dark',
    label: 'تظليل داكن هادئ',
    previewClass: 'bg-gradient-to-l from-[#111827] to-[#374151]',
  },
  {
    value: 'crimson',
    label: 'تظليل أحمر خفيف',
    previewClass: 'bg-gradient-to-l from-[#7f1d1d] to-[#991b1b]',
  },
  {
    value: 'slate',
    label: 'تظليل رمادي عصري',
    previewClass: 'bg-gradient-to-l from-[#1f2937] to-[#475569]',
  },
  {
    value: 'none',
    label: 'بدون تظليل نهائياً',
    previewClass: 'bg-slate-100 border border-slate-300',
  },
];

const QUICK_LINK_PRESETS = [
  { label: 'كل الإعلانات', href: '/ads' },
  { label: 'نشر إعلان جديد', href: '/ads/create' },
  { label: 'الإعلانات المميزة', href: '/ads?isFeatured=true' },
  { label: 'قسم السيارات', href: '/ads?category=vehicles' },
  { label: 'قسم العقارات', href: '/ads?category=real-estate' },
  { label: 'الإلكترونيات والموبايلات', href: '/ads?category=electronics' },
  { label: 'الأثاث والديكور', href: '/ads?category=furniture' },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<HomeBannerItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch('/api/admin/banners', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.banners)) {
          setBanners(data.banners);
          setSelectedIndex(0);
        } else {
          setBanners(DEFAULT_HOME_BANNERS);
        }
      })
      .catch(() => {
        setBanners(DEFAULT_HOME_BANNERS);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persistBanners = async (
    nextBanners: HomeBannerItem[],
    customSuccessMsg?: string
  ) => {
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners: nextBanners }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'تعذر حفظ تعديلات البوسترات');
      }
      const saved = Array.isArray(data.banners) ? data.banners : nextBanners;
      setBanners(saved);
      setHasUnsavedChanges(false);
      setMessage(
        customSuccessMsg || 'تم حفظ ونشر البوسترات في الصفحة الرئيسية بنجاح!'
      );
      window.dispatchEvent(new Event('khashala_banners_updated'));
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ البوسترات');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSelectedBanner = (patch: Partial<HomeBannerItem>) => {
    setBanners((prev) =>
      prev.map((item, idx) =>
        idx === selectedIndex ? { ...item, ...patch } : item
      )
    );
    setHasUnsavedChanges(true);
    setMessage(null);
  };

  const handleAddBanner = () => {
    const newBanner: HomeBannerItem = {
      id: `banner-${Date.now()}`,
      badge: 'عرض جديد على خشاله',
      title: 'أكتب عنوان البوستر الرئيسي هنا',
      subtitle: 'أضف وصفاً قصيراً جذاباً يشجع الزوار على تصفح القسم أو نشر إعلاناتهم',
      ctaLabel: 'تصفح الآن',
      ctaHref: '/ads',
      image:
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1400&q=80&auto=format&fit=crop',
      overlayTheme: 'light_scrim',
      displayMode: 'with_text',
      isActive: true,
    };
    const updated = [...banners, newBanner];
    setBanners(updated);
    setSelectedIndex(updated.length - 1);
    setHasUnsavedChanges(true);
    setMessage(null);
  };

  const handleDuplicateBanner = (index: number) => {
    const source = banners[index];
    if (!source) return;
    const copy: HomeBannerItem = {
      ...source,
      id: `banner-${Date.now()}`,
      title: source.title ? `${source.title} (نسخة)` : '',
    };
    const updated = [
      ...banners.slice(0, index + 1),
      copy,
      ...banners.slice(index + 1),
    ];
    setBanners(updated);
    setSelectedIndex(index + 1);
    setHasUnsavedChanges(true);
    setMessage(null);
  };

  const handleDeleteBanner = (index: number) => {
    const updated = banners.filter((_, idx) => idx !== index);
    setBanners(updated);
    if (selectedIndex >= updated.length) {
      setSelectedIndex(Math.max(0, updated.length - 1));
    }
    setHasUnsavedChanges(true);
    setMessage(null);
  };

  const handleMoveBanner = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;
    const updated = [...banners];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setBanners(updated);
    setSelectedIndex(targetIndex);
    setHasUnsavedChanges(true);
    setMessage(null);
  };

  const handleToggleActive = (index: number) => {
    const updated = banners.map((item, idx) =>
      idx === index ? { ...item, isActive: !item.isActive } : item
    );
    setBanners(updated);
    setHasUnsavedChanges(true);
    setMessage(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/admin/banners/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل رفع صورة البوستر');
      }

      const uploadedUrl = data.imageUrl;
      const updated = banners.map((item, idx) =>
        idx === selectedIndex ? { ...item, image: uploadedUrl } : item
      );
      setBanners(updated);

      // Persist immediately so uploaded poster image is live right away
      await persistBanners(
        updated,
        'تم رفع صورة البوستر وحفظها في الصفحة الرئيسية بنجاح!'
      );
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء رفع صورة البوستر');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResetDefaults = async () => {
    if (
      !window.confirm(
        'هل أنت متأكد من استعادة البوسترات الافتراضية؟ سيتم استبدال التعديلات الحالية.'
      )
    ) {
      return;
    }
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_defaults' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل استعادة البوسترات الافتراضية');
      }
      setBanners(data.banners || DEFAULT_HOME_BANNERS);
      setSelectedIndex(0);
      setHasUnsavedChanges(false);
      setMessage('تمت استعادة البوسترات الافتراضية بنجاح');
      window.dispatchEvent(new Event('khashala_banners_updated'));
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الاستعادة');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#e00000] animate-spin" />
        <p className="text-sm font-bold text-slate-600">
          جاري تحميل بوسترات الصفحة الرئيسية...
        </p>
      </div>
    );
  }

  const currentBanner = banners[selectedIndex] || null;
  const activeCount = banners.filter((b) => b.isActive !== false).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Primary Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#e00000] border border-red-100 flex items-center justify-center shrink-0">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  إدارة بوسترات وبنرات الصفحة الرئيسية
                </h2>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {activeCount} بوستر نشط من {banners.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                أضف بوسترات جديدة، ارفع صورك الخاصة من جهازك، عدّل العناوين والأزرار والروابط أو اعرض بوستر مصمم جاهز بدون كتابة.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleAddBanner}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة بوستر جديد</span>
            </button>

            <button
              type="button"
              onClick={() => persistBanners(banners)}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#e00000] hover:bg-[#c20000] text-white text-xs font-extrabold transition-colors cursor-pointer shadow-sm disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>حفظ ونشر التعديلات</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>معاينة الرئيسية</span>
            </Link>
          </div>
        </div>

        {/* Status Alerts */}
        {hasUnsavedChanges && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>لديك تعديلات غير محفوظة بعد — اضغط &quot;حفظ ونشر التعديلات&quot; لاعتمادها في الصفحة الرئيسية.</span>
            </div>
            <button
              type="button"
              onClick={() => persistBanners(banners)}
              disabled={isSaving}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shrink-0 cursor-pointer"
            >
              حفظ الآن
            </button>
          </div>
        )}

        {message && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Main Studio Grid: Poster List (4 cols) + Live Preview & Form Editor (8 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left/Right Sidebar in RTL: Posters List & Ordering */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                قائمة البوسترات ({banners.length})
              </h3>
              <button
                type="button"
                onClick={handleAddBanner}
                className="text-xs font-extrabold text-[#e00000] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>بوستر جديد</span>
              </button>
            </div>

            {banners.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <p className="text-xs font-bold text-slate-500">
                  لا توجد بوسترات حالياً (سيختفي شريط البوسترات من الصفحة الرئيسية).
                </p>
                <button
                  type="button"
                  onClick={handleAddBanner}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e00000] text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة أول بوستر</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {banners.map((banner, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={banner.id}
                      onClick={() => setSelectedIndex(idx)}
                      className={`group rounded-xl border p-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#e00000] bg-red-50/40 ring-2 ring-[#e00000]/15'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                          <img
                            src={banner.image}
                            alt={banner.title || `بوستر ${idx + 1}`}
                            className={`w-full h-full object-cover ${
                              banner.isActive === false ? 'opacity-40 grayscale' : ''
                            }`}
                          />
                          <span className="absolute top-1 right-1 bg-black/70 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                            #{idx + 1}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                              className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                                banner.isActive !== false
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-300'
                              }`}
                            />
                            <p className="text-xs font-extrabold text-slate-900 truncate">
                              {banner.displayMode === 'image_only'
                                ? banner.title || 'بوستر صورة كاملة بدون نص'
                                : banner.title || 'بوستر بدون عنوان'}
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {banner.displayMode === 'image_only'
                              ? 'عرض: صورة كاملة فقط'
                              : banner.badge || 'عرض: صورة + كتابة وزر'}
                          </p>
                        </div>
                      </div>

                      {/* Quick Item Controls */}
                      <div
                        className="flex items-center justify-between gap-1 mt-2.5 pt-2 border-t border-slate-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveBanner(idx, 'up')}
                            disabled={idx === 0}
                            title="تحريك للأعلى"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveBanner(idx, 'down')}
                            disabled={idx === banners.length - 1}
                            title="تحريك للأسفل"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateBanner(idx)}
                            title="تكرار البوستر"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(idx)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                              banner.isActive !== false
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {banner.isActive !== false ? (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>نشط</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>مخفي</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBanner(idx)}
                            title="حذف البوستر"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reset to Default Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetDefaults}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة البوسترات الافتراضية</span>
              </button>
            </div>
          </div>
        </div>

        {/* Editor & Live Preview Column */}
        <div className="xl:col-span-8 space-y-6">
          {currentBanner ? (
            <>
              {/* Live Real-Time Poster Preview */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#e00000]" />
                    <span>معاينة حية للبوستر رقم #{selectedIndex + 1} كما سيظهر للزوار</span>
                  </span>
                  {currentBanner.isActive === false && (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      هذا البوستر مخفي حالياً ولن يظهر للزوار
                    </span>
                  )}
                </div>

                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#111827] h-[184px] sm:h-[240px] border border-slate-200 select-none">
                  {currentBanner.displayMode === 'image_only' ? (
                    <img
                      src={currentBanner.image}
                      alt={currentBanner.title || 'معاينة البوستر'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <img
                        src={currentBanner.image}
                        alt={currentBanner.title || 'معاينة البوستر'}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {(currentBanner.overlayTheme || 'light_scrim') !== 'none' && (
                        <>
                          <div
                            className={`absolute inset-0 pointer-events-none ${
                              BANNER_OVERLAY_CLASSES[
                                currentBanner.overlayTheme || 'light_scrim'
                              ]
                            }`}
                            style={{
                              backgroundImage:
                                BANNER_OVERLAY_STYLES[
                                  currentBanner.overlayTheme || 'light_scrim'
                                ],
                            }}
                          />
                          <div
                            className="absolute inset-x-0 bottom-0 h-14 pointer-events-none"
                            style={{
                              backgroundImage:
                                'linear-gradient(to top, rgba(0,0,0,0.32) 0%, transparent 100%)',
                            }}
                          />
                        </>
                      )}
                      <div className="relative z-10 h-full flex flex-col justify-center px-5 sm:px-10 max-w-xl text-white">
                        {currentBanner.badge && (
                          <span className="inline-flex items-center gap-1.5 self-start text-[10px] sm:text-xs font-extrabold bg-black/35 backdrop-blur-sm px-2.5 py-1 rounded-md mb-2 border border-white/25 shadow-sm">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                            <span>{currentBanner.badge}</span>
                          </span>
                        )}
                        {currentBanner.title && (
                          <h4
                            className="text-base sm:text-2xl font-black leading-snug mb-1.5 line-clamp-2 drop-shadow-md"
                            style={{ textShadow: '0 2px 12px rgba(0, 0, 0, 0.55)' }}
                          >
                            {currentBanner.title}
                          </h4>
                        )}
                        {currentBanner.subtitle && (
                          <p
                            className="hidden sm:block text-xs text-white/95 font-medium mb-3.5 line-clamp-2 drop-shadow"
                            style={{ textShadow: '0 1px 8px rgba(0, 0, 0, 0.5)' }}
                          >
                            {currentBanner.subtitle}
                          </p>
                        )}
                        {currentBanner.ctaLabel && (
                          <div>
                            <span className="inline-flex items-center gap-1.5 bg-[#e00000] text-white font-extrabold text-xs px-4 py-2 rounded-lg shadow-lg">
                              <span>{currentBanner.ctaLabel}</span>
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Detailed Poster Form */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
                {/* 1. Image Upload & Source */}
                <div className="space-y-3 pb-5 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#e00000]" />
                        <span>1. صورة البوستر</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        يُنصح بصورة عرضية واضحة (مقاس 1400×500 بكسل تقريباً — PNG أو JPG أو WebP)
                      </p>
                    </div>

                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e00000] hover:bg-[#c20000] text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>
                          {isUploading
                            ? 'جاري رفع وضغط الصورة...'
                            : 'رفع صورة من جهازك'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                      أو أدخل رابط مباشر لصورة البوستر (Image URL):
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={currentBanner.image}
                      onChange={(e) =>
                        updateSelectedBanner({ image: e.target.value })
                      }
                      placeholder="https://example.com/banner.jpg أو /uploads/branding/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono text-slate-800 focus:outline-none focus:border-[#e00000]"
                    />
                  </div>
                </div>

                {/* 2. Display Mode (Image + Text vs Image Only) */}
                <div className="space-y-3 pb-5 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Type className="w-4 h-4 text-[#e00000]" />
                    <span>2. نمط عرض البوستر والكتابة</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        updateSelectedBanner({ displayMode: 'with_text' })
                      }
                      className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                        currentBanner.displayMode !== 'image_only'
                          ? 'border-[#e00000] bg-red-50/40 ring-2 ring-[#e00000]/15'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="text-xs font-black text-slate-900">
                        صورة خلفية + كتابة وزر تفاعلي
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        اكتب العنوان والوصف ونص الزر من لوحة التحكم فوق صورة البوستر
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateSelectedBanner({ displayMode: 'image_only' })
                      }
                      className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                        currentBanner.displayMode === 'image_only'
                          ? 'border-[#e00000] bg-red-50/40 ring-2 ring-[#e00000]/15'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="text-xs font-black text-slate-900">
                        صورة بوستر كاملة بدون كتابة إضافية
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        مثالي للبوسترات المصممة مسبقاً (فوتوشوب / كانفا) والقابلة للضغط بالكامل
                      </p>
                    </button>
                  </div>
                </div>

                {/* 3. Text & Copy Fields (when with_text) */}
                {currentBanner.displayMode !== 'image_only' && (
                  <div className="space-y-4 pb-5 border-b border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                          الشارة العلوية الصغيرة (اختياري)
                        </label>
                        <input
                          type="text"
                          value={currentBanner.badge}
                          onChange={(e) =>
                            updateSelectedBanner({ badge: e.target.value })
                          }
                          placeholder="مثال: عروض حصرية / سوق السيارات"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#e00000]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                          نص الزر (اتركه فارغاً لإخفاء الزر)
                        </label>
                        <input
                          type="text"
                          value={currentBanner.ctaLabel}
                          onChange={(e) =>
                            updateSelectedBanner({ ctaLabel: e.target.value })
                          }
                          placeholder="مثال: تصفح الإعلانات الآن"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#e00000]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                        العنوان الرئيسي للبوستر
                      </label>
                      <input
                        type="text"
                        value={currentBanner.title}
                        onChange={(e) =>
                          updateSelectedBanner({ title: e.target.value })
                        }
                        placeholder="اكتب العنوان الكبير البارز على البوستر..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-900 focus:outline-none focus:border-[#e00000]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                        الوصف الفرعي تحت العنوان (اختياري)
                      </label>
                      <textarea
                        rows={2}
                        value={currentBanner.subtitle}
                        onChange={(e) =>
                          updateSelectedBanner({ subtitle: e.target.value })
                        }
                        placeholder="سطر توضيحي يظهر أسفل العنوان الرئيسي..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#e00000]"
                      />
                    </div>

                    {/* Overlay Color Picker */}
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-2">
                        لون التدرج خلف النص (لوضوح القراءة فوق الصورة)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {OVERLAY_OPTIONS.map((opt) => {
                          const selected =
                            (currentBanner.overlayTheme || 'light_scrim') ===
                            opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                updateSelectedBanner({
                                  overlayTheme: opt.value,
                                })
                              }
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                selected
                                  ? 'border-[#e00000] bg-red-50 text-[#e00000]'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full shrink-0 ${opt.previewClass}`}
                              />
                              <span>{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Target Link URL */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-[#e00000]" />
                    <span>الرابط عند الضغط على البوستر</span>
                  </h3>

                  <input
                    type="text"
                    dir="ltr"
                    value={currentBanner.ctaHref}
                    onChange={(e) =>
                      updateSelectedBanner({ ctaHref: e.target.value })
                    }
                    placeholder="/ads?category=vehicles أو https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono text-slate-800 focus:outline-none focus:border-[#e00000]"
                  />

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 ml-1">
                      روابط سريعة جاهزة:
                    </span>
                    {QUICK_LINK_PRESETS.map((preset) => (
                      <button
                        key={preset.href}
                        type="button"
                        onClick={() =>
                          updateSelectedBanner({ ctaHref: preset.href })
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                          currentBanner.ctaHref === preset.href
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bottom Save Bar */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleDeleteBanner(selectedIndex)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف هذا البوستر</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => persistBanners(banners)}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#e00000] hover:bg-[#c20000] text-white text-xs sm:text-sm font-black shadow-md transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>حفظ ونشر جميع البوسترات</span>
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
