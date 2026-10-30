'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Layers,
  Calendar,
  Hash,
  CreditCard,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { STATUS_LABELS, CONDITION_LABELS, getCountryByCity } from '@/lib/constants';
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
  const [showPhone, setShowPhone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('featured') === 'success') {
      setCelebrationMessage(
        searchParams.get('msg') || 'تهانينا! تمت ترقية إعلانك بنجاح وسيظهر الآن في المرتبة الأولى في القسم.'
      );
    }
  }, [searchParams]);
  
  // Interactive Report Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('FRAUD');
  const [reportDetails, setReportDetails] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

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
            const simRes = await fetch(`/api/ads?category=${data.ad.categoryId}&limit=5`);
            const simData = await simRes.json();
            setSimilarAds(
              (simData.ads || []).filter((item: any) => item.id !== data.ad.id).slice(0, 4)
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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-slate-600">جاري تحميل تفاصيل الإعلان...</p>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center bg-white rounded-3xl border border-blue-200 my-10">
        <h2 className="text-xl font-bold text-slate-800 mb-2">الإعلان غير موجود</h2>
        <p className="text-xs text-slate-500 mb-6">قد يكون الإعلان قد حذف أو انتهت صلاحيته.</p>
        <Link
          href="/ads"
          className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700"
        >
          العودة لكل الإعلانات
        </Link>
      </div>
    );
  }

  const images: string[] =
    ad.images && ad.images.length > 0 ? ad.images : ['/uploads/ads/placeholder.webp'];

  const statusInfo = STATUS_LABELS[ad.status] || STATUS_LABELS.ACTIVE;
  const conditionInfo = ad.condition ? CONDITION_LABELS[ad.condition] : null;
  const country = getCountryByCity(ad.city);
  const currencySymbol = country?.currencySymbol || 'ر.س';
  const formattedPrice = new Intl.NumberFormat('ar-SA').format(ad.price);
  const sellerPhone = ad.user?.phone || 'غير متوفر';
  const cleanPhone = (ad.user?.phone || '').replace(/[^0-9]/g, '');

  const buildWhatsAppLink = (customMessage?: string) => {
    const msg =
      customMessage ||
      `السلام عليكم، أنا مهتم بإعلانك المعروض على منصة خشاله: "${ad.title}"`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const quickInquiries = [
    `السلام عليكم، هل إعلان "${ad.title}" لا يزال متوفراً؟`,
    `مرحباً، كم السعر النهائي لـ "${ad.title}"؟ أنا مشتري جاد.`,
    `السلام عليكم، أرغب في معاينة "${ad.title}"، متى الوقت المناسب لك؟`,
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-600 bg-white/80 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-blue-200/80">
        <Link href="/" className="hover:text-brand-600 font-semibold">
          الرئيسية
        </Link>
        <span className="text-blue-300">/</span>
        <Link href="/ads" className="hover:text-brand-600 font-semibold">
          الإعلانات
        </Link>
        {ad.category && (
          <>
            <span className="text-blue-300">/</span>
            <Link
              href={`/ads?category=${ad.category.slug}`}
              className="hover:text-brand-600 font-bold text-brand-700"
            >
              {ad.category.name}
            </Link>
          </>
        )}
        {ad.subcategory && (
          <>
            <span className="text-blue-300">/</span>
            <Link
              href={`/ads?category=${ad.category?.slug || ''}&subcategory=${ad.subcategory.id}`}
              className="hover:text-brand-600 font-bold text-sky-700"
            >
              {ad.subcategory.name}
            </Link>
          </>
        )}
        <span className="text-blue-300">/</span>
        <span className="text-slate-800 font-bold truncate max-w-xs">{ad.title}</span>
      </nav>

      {/* Celebration Alert (After Successful Paymob Payment) */}
      {celebrationMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-l from-emerald-500 to-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
            <span>{celebrationMessage}</span>
          </div>
          <button
            onClick={() => setCelebrationMessage(null)}
            className="text-emerald-100 hover:text-white p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Owner VIP Upgrade Banner */}
      {currentUser && (currentUser.id === ad.userId || currentUser.role === 'ADMIN') && !ad.isFeatured && (
        <div className="mb-6 bg-gradient-to-l from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-amber-400/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-xs">
              <Star className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black">أنت ناشر هذا الإعلان! هل ترغب في ظهوره في أول القسم؟</h4>
                <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-bold">بوابة Paymob</span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                رَقِّ إعلانك الآن ليظهر دائماً في صدارة نتائج البحث والقسم مع الشارة الذهبية لمضاعفة اتصالات المشترين
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsUpgradeModalOpen(true)}
            className="px-6 py-2.5 bg-white hover:bg-amber-50 text-amber-900 font-black text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
            <span>ترقية لإعلان مميز (Paymob)</span>
          </button>
        </div>
      )}

      {/* Main Grid: Gallery + Info Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Image Gallery, Specs Table & Description (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Image Viewer */}
          <div className="bg-white rounded-3xl border border-blue-200/90 overflow-hidden shadow-xs relative">
            <div className="relative aspect-[16/10] bg-navy-950 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={images[activeImageIndex]}
                  alt={ad.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full object-contain"
                />
              </AnimatePresence>

              {/* Top Badges Overlay */}
              <div className="absolute top-4 right-4 z-10 flex flex-wrap gap-2">
                {ad.isFeatured && (
                  <span className="text-xs font-black px-3 py-1.5 rounded-full bg-amber-400 text-slate-950 shadow-md flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-slate-950" />
                    <span>إعلان مميز</span>
                  </span>
                )}
                {ad.isUrgent && (
                  <span className="text-xs font-black px-3 py-1.5 rounded-full bg-orange-600 text-white shadow-md flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>بيع عاجل</span>
                  </span>
                )}
                {ad.status !== 'ACTIVE' && (
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border shadow-md backdrop-blur-md ${statusInfo.bg} ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                )}
              </div>

              {/* Next/Prev Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="p-4 bg-blue-50/50 border-t border-blue-100 flex gap-3 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      idx === activeImageIndex
                        ? 'border-brand-600 ring-2 ring-brand-500/20 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Structured Specs Grid */}
          <div className="bg-white rounded-3xl border border-blue-200/90 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 border-b border-blue-100 pb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-600" />
              <span>بطاقة معلومات ومواصفات الإعلان</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
                <span className="text-slate-500 block mb-1">القسم الرئيسي</span>
                <span className="font-black text-slate-900">{ad.category?.name || 'عام'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
                <span className="text-slate-500 block mb-1">القسم الفرعي</span>
                <span className="font-black text-brand-700">
                  {ad.subcategory?.name || 'غير محدد'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
                <span className="text-slate-500 block mb-1">حالة السلعة</span>
                <span className="font-black text-slate-900">
                  {conditionInfo?.label || 'بحالة ممتازة'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
                <span className="text-slate-500 block mb-1">الموقع والدولة</span>
                <span className="font-black text-slate-900">
                  {country ? `${country.flag} ${country.shortName} - ` : ''}
                  {ad.city}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
                <span className="text-slate-500 block mb-1">تاريخ النشر</span>
                <span className="font-black text-slate-900 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-500" />
                  {new Date(ad.createdAt).toLocaleDateString('ar-SA')}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
                <span className="text-slate-500 block mb-1">رقم الإعلان المرجعي</span>
                <span className="font-mono font-black text-slate-800 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-brand-500" />
                  KH-{ad.id.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white rounded-3xl border border-blue-200/90 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-lg font-black text-slate-900 border-b border-blue-100 pb-3">
              الوصف والتفاصيل الكاملة
            </h2>
            <div className="text-sm text-slate-700 leading-loose whitespace-pre-line font-normal">
              {ad.description}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Seller & Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Price & Title Card */}
          <div className="bg-white rounded-3xl border border-blue-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-black text-brand-600">
                  {formattedPrice}
                  <span className="text-sm font-bold text-slate-500 mr-1.5">
                    {currencySymbol}
                  </span>
                </span>
                {ad.isNegotiable && (
                  <span className="block text-[11px] font-bold text-emerald-700 mt-1">
                    ✓ السعر قابل للتفاوض مع البائع
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFavorite}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isFavorite
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-blue-50/60 border-blue-200 text-slate-600 hover:text-rose-500'
                  }`}
                  title="حفظ في المفضلة"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl bg-blue-50/60 hover:bg-blue-100 border border-blue-200 text-brand-700 transition-colors relative"
                  title="مشاركة الإعلان"
                >
                  <Share2 className="w-5 h-5" />
                  {copiedLink && (
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-navy-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap shadow-md">
                      تم نسخ الرابط!
                    </span>
                  )}
                </button>
              </div>
            </div>

            <h1 className="text-lg font-black text-slate-900 leading-snug">
              {ad.title}
            </h1>

            <div className="pt-4 border-t border-blue-100 grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 truncate" title={country?.name}>
                <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
                <span className="truncate font-semibold">
                  {ad.city} {country ? `(${country.flag})` : ''}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-brand-500" />
                <span className="font-semibold">{ad.views || 0} مشاهدة</span>
              </div>
            </div>
          </div>

          {/* Seller Card & Direct Contact Buttons */}
          <div className="bg-white rounded-3xl border border-blue-200/90 p-6 shadow-xs space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              معلومات البائع والتواصل السريع
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-navy-900 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                {ad.user?.name ? ad.user.name.charAt(0) : 'م'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {ad.user?.name || 'مستخدم خشاله'}
                </h4>
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>حساب موثوق ومفعل</span>
                </p>
              </div>
            </div>

            {/* Direct Contact Buttons */}
            <div className="space-y-3 pt-1">
              {ad.user?.phone && (
                <a
                  href={buildWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all duration-200 active:scale-95"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>محادثة فورية عبر واتساب</span>
                </a>
              )}

              <button
                onClick={() => setShowPhone(!showPhone)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-navy-900 hover:bg-navy-800 text-white rounded-2xl font-bold text-sm shadow-md transition-all duration-200 active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>{showPhone ? sellerPhone : 'إظهار رقم الهاتف للاتصال'}</span>
              </button>
            </div>

            {/* Quick WhatsApp Inquiry Chips */}
            {ad.user?.phone && (
              <div className="pt-3 border-t border-blue-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">
                  إرسال استفسار سريع للبائع بضغطة زر:
                </span>
                <div className="flex flex-col gap-1.5">
                  {quickInquiries.map((qText, i) => (
                    <a
                      key={i}
                      href={buildWhatsAppLink(qText)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-brand-700 bg-blue-50/70 hover:bg-blue-100 px-3 py-2 rounded-xl border border-blue-200/80 transition-colors flex items-center justify-between"
                    >
                      <span className="truncate">{qText}</span>
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mr-2" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Safety Advice Box & Report Ad */}
          <div className="bg-white border border-blue-200/90 rounded-3xl p-5 space-y-3 text-slate-700 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-xs text-brand-700">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>إرشادات الأمان في خشاله</span>
            </div>
            <ul className="text-xs space-y-1.5 text-slate-600 list-disc list-inside leading-relaxed">
              <li>قابل البائع في مكان عام ومعروف دائماً.</li>
              <li>عاين السلعة بنفسك وافحصها بدقة قبل الدفع.</li>
              <li>لا تقم بتحويل أي مبالغ مالية أو عربون مسبقاً.</li>
            </ul>

            <div className="pt-2 border-t border-blue-100 flex items-center justify-between">
              {reportSuccess ? (
                <span className="text-[11px] font-bold text-emerald-600">
                  ✓ تم استلام بلاغك بنجاح وسيقوم المشرف بمراجعته
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="text-[11px] font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>الإبلاغ عن محتوى مخالف في الإعلان</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Report Abuse Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-blue-200 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-500" />
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
                  سبب البلاغ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-blue-50/50 text-xs rounded-xl px-3 py-2.5 border border-blue-200 font-bold text-slate-800"
                >
                  <option value="FRAUD">اشتباه احتيال أو طلب دفع مسبق</option>
                  <option value="INAPPROPRIATE">محتوى أو صور غير لائقة</option>
                  <option value="WRONG_CATEGORY">السلعة معروضة في قسم مضلل</option>
                  <option value="DUPLICATE">إعلان مكرر أو منسوخ</option>
                  <option value="OTHER">سبب آخر</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  توضيح إضافي وملاحظات
                </label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="اشرح المشكلة باختصار لمساعدة المشرفين..."
                  className="w-full bg-blue-50/40 text-xs rounded-xl p-3 border border-blue-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    اسمك (اختياري)
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="مثال: فهد"
                    className="w-full bg-blue-50/40 text-xs rounded-xl px-3 py-2 border border-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    رقم هاتفك (اختياري)
                  </label>
                  <input
                    type="text"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="للتواصل معك"
                    className="w-full bg-blue-50/40 text-xs rounded-xl px-3 py-2 border border-blue-200 text-left dir-ltr"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {isSubmittingReport ? 'جاري الإرسال...' : 'إرسال البلاغ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Similar Ads Section */}
      {similarAds.length > 0 && (
        <section className="pt-8 border-t border-blue-200/80">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-900">
              إعلانات مشابهة في {ad.category?.name}
            </h3>
            {ad.category && (
              <Link
                href={`/ads?category=${ad.category.slug}`}
                className="text-xs font-bold text-brand-700 hover:underline"
              >
                المزيد في {ad.category.name} ←
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarAds.map((simAd) => (
              <AdCard key={simAd.id} ad={simAd} />
            ))}
          </div>
        </section>
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
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      }
    >
      <AdDetailsContent />
    </Suspense>
  );
}
