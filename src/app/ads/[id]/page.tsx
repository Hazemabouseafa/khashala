'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  MapPin,
  Eye,
  ShieldCheck,
  Phone,
  MessageCircle,
  Share2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Heart,
  Star,
  Flame,
  Flag,
  Sparkles,
  Loader2,
  Camera,
  Maximize2,
  X,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import {
  STATUS_LABELS,
  CONDITION_LABELS,
  getCountryByCity,
  formatRelativeTimeAr,
} from '@/lib/constants';
import { AdCard } from '@/components/ads/AdCard';
import UpgradeToFeaturedModal from '@/components/ads/UpgradeToFeaturedModal';

function AdDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const adId = params.id as string;

  const [ad, setAd] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [similarAds, setSimilarAds] = useState<any[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  // Report Modal states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('FRAUD');
  const [reportDetails, setReportDetails] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('featured') === 'success') {
      setCelebrationMessage(
        searchParams.get('msg') ||
          'تهانينا! تمت ترقية إعلانك بنجاح وسيظهر الآن في صدارة القسم.'
      );
    }
  }, [searchParams]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
        setIsReportModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adId,
          reason: reportReason,
          details: reportDetails,
          reporterName,
          reporterPhone,
        }),
      });
      if (res.ok) {
        setReportSuccess(true);
        setIsReportModalOpen(false);
        setReportDetails('');
      } else {
        alert('حدث خطأ أثناء إرسال البلاغ');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  useEffect(() => {
    if (!adId) return;

    try {
      const raw = localStorage.getItem('khashala_favorites');
      const favs: string[] = raw ? JSON.parse(raw) : [];
      setIsFavorite(favs.includes(adId));
    } catch {}

    const fetchAdData = async () => {
      setIsLoading(true);
      try {
        const [adRes, meRes] = await Promise.all([
          fetch(`/api/ads/${adId}`),
          fetch('/api/auth/me').catch(() => null),
        ]);
        const data = await adRes.json();
        if (meRes && meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user || null);
        }

        if (data.ad) {
          setAd(data.ad);
          if (data.ad.categoryId) {
            const simRes = await fetch(
              `/api/ads?category=${data.ad.categoryId}&limit=8`
            );
            const simData = await simRes.json();
            setSimilarAds(
              (simData.ads || [])
                .filter((item: any) => item.id !== data.ad.id)
                .slice(0, 4)
            );
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdData();
  }, [adId]);

  const toggleFavorite = () => {
    try {
      const raw = localStorage.getItem('khashala_favorites');
      let favs: string[] = raw ? JSON.parse(raw) : [];
      if (favs.includes(adId)) {
        favs = favs.filter((id) => id !== adId);
        setIsFavorite(false);
      } else {
        favs.push(adId);
        setIsFavorite(true);
      }
      localStorage.setItem('khashala_favorites', JSON.stringify(favs));
      window.dispatchEvent(new Event('khashala_fav_updated'));
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-10 h-10 text-[#e00000] animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-600">جاري تحميل الإعلان...</p>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center bg-white rounded-2xl border border-slate-200 my-10">
        <h2 className="text-xl font-black text-[#222222] mb-2">
          الإعلان غير متوفر
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          قد يكون قد تم بيع السلعة أو حذف الإعلان من قبل المعلن.
        </p>
        <Link
          href="/ads"
          className="inline-block px-6 py-2.5 bg-[#e00000] text-white rounded-lg text-xs font-extrabold hover:bg-[#c20000]"
        >
          تصفح الإعلانات المتاحة
        </Link>
      </div>
    );
  }

  const images: string[] =
    ad.images && ad.images.length > 0
      ? ad.images
      : ['/uploads/ads/placeholder.webp'];

  const statusInfo = STATUS_LABELS[ad.status] || STATUS_LABELS.ACTIVE;
  const conditionInfo = ad.condition ? CONDITION_LABELS[ad.condition] : null;
  const country = getCountryByCity(ad.city);
  const currencySymbol = country?.currencySymbol || 'ج.م';
  const formattedPrice = new Intl.NumberFormat('ar-EG').format(ad.price);
  const timeAgo = formatRelativeTimeAr(ad.createdAt);
  const sellerPhone = ad.user?.phone || '';
  const cleanPhone = sellerPhone.replace(/[^0-9]/g, '');

  const buildWhatsAppLink = (customMessage?: string) => {
    const msg =
      customMessage ||
      `السلام عليكم، أنا مهتم بإعلانك على منصة خشاله: "${ad.title}"`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({ title: ad.title, url: window.location.href })
        .catch(() => {});
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const quickInquiries = [
    `السلام عليكم، هل "${ad.title}" لا يزال متاحاً؟`,
    `مرحباً، كم السعر النهائي؟ أنا مشتري جاد.`,
    `السلام عليكم، متى وأين يمكن معاينة السلعة؟`,
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 pb-24 lg:pb-10">
      {/* 1. Breadcrumbs */}
      <nav
        aria-label="مسار التنقل"
        className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto no-scrollbar whitespace-nowrap"
      >
        <Link href="/" className="hover:text-[#e00000] font-semibold">
          الرئيسية
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link href="/ads" className="hover:text-[#e00000] font-semibold">
          الإعلانات
        </Link>
        {ad.category && (
          <>
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link
              href={`/ads?category=${encodeURIComponent(ad.category.slug)}`}
              className="hover:text-[#e00000] font-semibold"
            >
              {ad.category.name}
            </Link>
          </>
        )}
        {ad.subcategory && (
          <>
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link
              href={`/ads?category=${encodeURIComponent(
                ad.category?.slug || ''
              )}&subcategory=${encodeURIComponent(ad.subcategory.id)}`}
              className="hover:text-[#e00000] font-semibold"
            >
              {ad.subcategory.name}
            </Link>
          </>
        )}
        <ChevronLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-bold truncate max-w-[220px]">
          {ad.title}
        </span>
      </nav>

      {/* Celebration Alert after Paymob Payment */}
      {celebrationMessage && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
            <span>{celebrationMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setCelebrationMessage(null)}
            className="text-emerald-100 hover:text-white p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Owner / Admin Upgrade to Featured Banner */}
      {currentUser &&
        (currentUser.id === ad.userId || currentUser.role === 'ADMIN') &&
        !ad.isFeatured && (
          <div className="bg-gradient-to-l from-amber-500 to-amber-600 rounded-xl p-4 sm:p-5 text-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/35 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black">
                  ميّز إعلانك ليظهر في صدارة القسم ويحقق مشاهدات مضاعفة!
                </h4>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-900/80 mt-0.5">
                  ترقية فورية وآمنة عبر بوابة الدفع الإلكتروني Paymob
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="px-5 py-2.5 bg-[#222222] hover:bg-black text-white font-extrabold text-xs rounded-lg transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>ترقية لإعلان مميز</span>
            </button>
          </div>
        )}

      {/* ==================== MAIN 2-COLUMN GRID ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / MAIN COLUMN (8 COLS): Gallery + Mobile Price + Specs + Description */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-5">
          {/* 1. Photo Gallery */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-[#111827] flex items-center justify-center group">
              <img
                src={images[activeImageIndex]}
                alt={ad.title}
                onClick={() => setIsLightboxOpen(true)}
                className="w-full h-full object-contain cursor-zoom-in"
              />

              {/* Top Right Badges */}
              <div className="absolute top-3 right-3 z-10 flex flex-wrap gap-1.5">
                {ad.isFeatured && (
                  <span className="text-xs font-black px-2.5 py-1 rounded bg-amber-400 text-slate-950 shadow-xs flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-slate-950" />
                    <span>مميز</span>
                  </span>
                )}
                {ad.isUrgent && (
                  <span className="text-xs font-black px-2.5 py-1 rounded bg-[#e00000] text-white shadow-xs flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>عاجل</span>
                  </span>
                )}
                {ad.status !== 'ACTIVE' && (
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded border shadow-xs ${statusInfo.bg} ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                )}
              </div>

              {/* Top Left Zoom Button */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                aria-label="تكبير الصورة"
                className="absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Bottom Left Photo Counter */}
              <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-md bg-black/70 text-white text-xs font-bold flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                <span>
                  {activeImageIndex + 1} / {images.length}
                </span>
              </div>

              {/* Prev / Next Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1
                      )
                    }
                    aria-label="الصورة السابقة"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-md cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1
                      )
                    }
                    aria-label="الصورة التالية"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-md cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="p-3 bg-white border-t border-slate-100 flex gap-2.5 overflow-x-auto no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      idx === activeImageIndex
                        ? 'border-[#e00000]'
                        : 'border-transparent opacity-65 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Mobile-Only Price, Title, Location & Favorite/Share Card */}
          <div className="lg:hidden bg-white rounded-xl border border-slate-200 p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[#e00000]">
                    {formattedPrice}
                  </span>
                  <span className="text-sm font-extrabold text-[#e00000]">
                    {currencySymbol}
                  </span>
                </div>
                {ad.isNegotiable && (
                  <span className="inline-block text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded mt-1">
                    قابل للتفاوض
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleFavorite}
                  aria-label="حفظ في المفضلة"
                  className="p-2 rounded-full border border-slate-200 text-slate-700"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? 'fill-[#e00000] text-[#e00000]' : ''
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="مشاركة"
                  className="p-2 rounded-full border border-slate-200 text-slate-700"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <h1 className="text-base sm:text-lg font-black text-[#222222] leading-snug">
              {ad.title}
            </h1>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {ad.city} {country ? `(${country.shortName})` : ''}
                </span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{timeAgo}</span>
              </span>
            </div>
          </div>

          {/* 3. Key Specifications & Details Striped Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-black text-[#222222] mb-4">
              التفاصيل والمواصفات
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0 border-t border-slate-100 text-xs sm:text-sm">
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">القسم الرئيسي</span>
                <span className="font-extrabold text-[#222222]">
                  {ad.category?.name || 'عام'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">الفئة الفرعية</span>
                <span className="font-extrabold text-[#222222]">
                  {ad.subcategory?.name || 'عام'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">الحالة</span>
                <span className="font-extrabold text-[#222222]">
                  {conditionInfo?.label || 'ممتازة'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">طريقة السعر</span>
                <span className="font-extrabold text-[#222222]">
                  {ad.isNegotiable ? 'قابل للتفاوض' : 'سعر نهائي'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">المدينة / الموقع</span>
                <span className="font-extrabold text-[#222222]">
                  {ad.city} {country ? `— ${country.shortName}` : ''}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">رقم الإعلان</span>
                <span className="font-mono font-bold text-slate-700">
                  #{ad.id.slice(-7).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Full Description */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-black text-[#222222] mb-3">
              الوصف
            </h2>
            <div className="text-sm text-slate-700 leading-loose whitespace-pre-line">
              {ad.description}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR COLUMN (4 COLS): Desktop Price + Seller Card + Safety */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-[128px]">
          {/* Desktop Price & Title Box */}
          <div className="hidden lg:block bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-[#e00000]">
                    {formattedPrice}
                  </span>
                  <span className="text-sm font-extrabold text-[#e00000]">
                    {currencySymbol}
                  </span>
                </div>
                {ad.isNegotiable && (
                  <span className="inline-block text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded mt-1">
                    قابل للتفاوض
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleFavorite}
                  title="حفظ في المفضلة"
                  className="p-2 rounded-full hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? 'fill-[#e00000] text-[#e00000]' : ''
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  title="مشاركة الإعلان"
                  className="p-2 rounded-full hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors relative cursor-pointer"
                >
                  <Share2 className="w-5 h-5" />
                  {copiedLink && (
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#222222] text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">
                      تم نسخ الرابط
                    </span>
                  )}
                </button>
              </div>
            </div>

            <h1 className="text-lg font-extrabold text-[#222222] leading-snug">
              {ad.title}
            </h1>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {ad.city} {country ? `(${country.flag})` : ''}
                </span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span>{timeAgo}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {ad.views || 0}
                </span>
              </span>
            </div>
          </div>

          {/* Seller Profile & Contact Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#222222] text-white font-black text-lg flex items-center justify-center shrink-0">
                  {ad.user?.name ? ad.user.name.charAt(0) : 'م'}
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#222222]">
                    {ad.user?.name || 'معلن خشاله'}
                  </h3>
                  <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>معلن موثوق في خشاله</span>
                  </p>
                </div>
              </div>
            </div>

            {ad.userId && (
              <Link
                href={`/ads?userId=${encodeURIComponent(ad.userId)}`}
                className="flex items-center justify-between text-xs font-extrabold text-slate-700 hover:text-[#e00000] py-2 px-3 rounded-lg bg-[#f7f8fa] border border-slate-200/80 transition-colors"
              >
                <span>عرض جميع إعلانات هذا المعلن</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            )}

            {/* Desktop Contact Buttons */}
            <div className="hidden lg:flex flex-col gap-2.5 pt-1">
              {sellerPhone ? (
                <button
                  type="button"
                  onClick={() => setShowPhone((p) => !p)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#e00000] hover:bg-[#c20000] text-white rounded-lg font-extrabold text-sm transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span dir={showPhone ? 'ltr' : 'rtl'}>
                    {showPhone ? sellerPhone : 'إظهار رقم الهاتف'}
                  </span>
                </button>
              ) : null}

              {cleanPhone && (
                <a
                  href={buildWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-lg font-extrabold text-sm transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>تواصل عبر واتساب</span>
                </a>
              )}
            </div>

            {/* Quick 1-Tap WhatsApp Inquiries */}
            {cleanPhone && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">
                  رسائل سريعة للمعلن:
                </span>
                <div className="flex flex-col gap-1.5">
                  {quickInquiries.map((qText, i) => (
                    <a
                      key={i}
                      href={buildWhatsAppLink(qText)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-slate-700 hover:text-[#e00000] bg-[#f7f8fa] hover:bg-red-50/50 px-3 py-2 rounded-lg border border-slate-200/90 transition-colors flex items-center justify-between"
                    >
                      <span className="truncate">{qText}</span>
                      <MessageCircle className="w-3.5 h-3.5 text-[#16a34a] shrink-0 mr-2" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Safety Tips & Report Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center gap-2 font-extrabold text-xs text-[#222222]">
              <ShieldCheck className="w-4 h-4 text-[#e00000]" />
              <span>سلامتك تهمنا</span>
            </div>
            <ul className="text-xs space-y-1.5 text-slate-600 list-disc list-inside leading-relaxed">
              <li>قابل البائع في مكان عام ومفتوح.</li>
              <li>افحص السلعة جيداً قبل إتمام الشراء.</li>
              <li>لا تدفع أو تحوّل أي مبالغ قبل المعاينة والاستلام.</li>
            </ul>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">
                ID: {ad.id.slice(-7).toUpperCase()}
              </span>
              {reportSuccess ? (
                <span className="font-bold text-emerald-600">
                  ✓ تم إرسال البلاغ
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="font-bold text-slate-500 hover:text-[#e00000] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>الإبلاغ عن الإعلان</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SIMILAR ADS SHELF ==================== */}
      {similarAds.length > 0 && (
        <section className="pt-4">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-base sm:text-xl font-black text-[#222222]">
              إعلانات مشابهة
            </h3>
            {ad.category && (
              <Link
                href={`/ads?category=${encodeURIComponent(ad.category.slug)}`}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-[#e00000] hover:underline"
              >
                <span>المزيد في {ad.category.name}</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            )}
          </div>

          <div className="flex flex-nowrap overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3 -mx-3 px-3 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4 lg:gap-4">
            {similarAds.map((simAd) => (
              <div
                key={simAd.id}
                className="w-[215px] sm:w-[248px] lg:w-auto shrink-0 snap-start"
              >
                <AdCard ad={simAd} variant="grid" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================== MOBILE STICKY BOTTOM CALL + WHATSAPP BAR ==================== */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 px-3 py-2.5 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] pb-safe">
        <div className="grid grid-cols-2 gap-2.5 max-w-lg mx-auto">
          {sellerPhone ? (
            <a
              href={`tel:${sellerPhone}`}
              className="flex items-center justify-center gap-2 py-3 rounded-lg bg-[#e00000] active:bg-[#c20000] text-white font-extrabold text-sm shadow-xs"
            >
              <Phone className="w-4 h-4" />
              <span>اتصال</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 py-3 rounded-lg bg-slate-200 text-slate-500 font-bold text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>غير متاح</span>
            </button>
          )}

          {cleanPhone ? (
            <a
              href={buildWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-lg bg-[#16a34a] active:bg-[#15803d] text-white font-extrabold text-sm shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>واتساب</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3 rounded-lg bg-[#222222] text-white font-extrabold text-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================== FULLSCREEN IMAGE LIGHTBOX ==================== */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="إغلاق"
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <img
            src={images[activeImageIndex]}
            alt={ad.title}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[88vh] object-contain"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((p) =>
                    p === 0 ? images.length - 1 : p - 1
                  );
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((p) =>
                    p === images.length - 1 ? 0 : p + 1
                  );
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}

      {/* ==================== REPORT MODAL ==================== */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-[#222222] flex items-center gap-2">
                <Flag className="w-4 h-4 text-[#e00000]" />
                <span>الإبلاغ عن إعلان مخالف</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  سبب البلاغ <span className="text-[#e00000]">*</span>
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-[#f7f8fa] text-xs rounded-lg px-3 py-2.5 border border-slate-200 font-bold text-slate-800"
                >
                  <option value="FRAUD">اشتباه احتيال أو طلب دفع مسبق</option>
                  <option value="INAPPROPRIATE">محتوى أو صور غير لائقة</option>
                  <option value="WRONG_CATEGORY">الإعلان في قسم غير مناسب</option>
                  <option value="DUPLICATE">إعلان مكرر</option>
                  <option value="OTHER">سبب آخر</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تفاصيل إضافية
                </label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="اشرح المشكلة باختصار..."
                  className="w-full bg-[#f7f8fa] text-xs rounded-lg p-3 border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="اسمك (اختياري)"
                  className="w-full bg-[#f7f8fa] text-xs rounded-lg px-3 py-2 border border-slate-200"
                />
                <input
                  type="text"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="رقم هاتفك (اختياري)"
                  className="w-full bg-[#f7f8fa] text-xs rounded-lg px-3 py-2 border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-5 py-2 bg-[#e00000] hover:bg-[#c20000] text-white rounded-lg text-xs font-extrabold"
                >
                  {isSubmittingReport ? 'جاري الإرسال...' : 'إرسال البلاغ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Paymob Upgrade Modal */}
      {isUpgradeModalOpen && ad && (
        <UpgradeToFeaturedModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          ad={ad}
          onSuccess={() => {
            setIsUpgradeModalOpen(false);
            setAd((prev: any) => ({ ...prev, isFeatured: true }));
          }}
        />
      )}
    </div>
  );
}

export default function AdDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#e00000] animate-spin" />
        </div>
      }
    >
      <AdDetailsContent />
    </Suspense>
  );
}
