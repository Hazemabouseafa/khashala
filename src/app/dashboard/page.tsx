'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  CheckCircle,
  Trash2,
  ExternalLink,
  CheckCheck,
  RefreshCw,
  Loader2,
  Search,
  Filter,
  Flame,
  Layers,
  Eye,
  Star,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { STATUS_LABELS, getCountryByCity } from '@/lib/constants';
import UpgradeToFeaturedModal from '@/components/ads/UpgradeToFeaturedModal';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any | null>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedAdForUpgrade, setSelectedAdForUpgrade] = useState<any | null>(null);

  // Check for successful payment callback param
  useEffect(() => {
    if (searchParams.get('featured') === 'success') {
      setMessage('🎉 تهانينا! تمت ترقية إعلانك بنجاح وأصبح الآن يظهر في صدارة القسم.');
      setTimeout(() => setMessage(null), 6000);
    }
  }, [searchParams]);

  // Dashboard Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [subcategoryFilter, setSubcategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();

      if (!userData.user) {
        router.push('/auth/login?redirect=/dashboard');
        return;
      }
      setUser(userData.user);

      const [adsRes, catsRes] = await Promise.all([
        fetch(`/api/ads?userId=${userData.user.id}&limit=100`),
        fetch('/api/categories'),
      ]);
      const adsData = await adsRes.json();
      const catsData = await catsRes.json();
      setAds(adsData.ads || []);
      setCategories(catsData.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateField = async (adId: string, payload: Record<string, any>) => {
    setActionLoadingId(adId);
    try {
      const res = await fetch(`/api/ads/${adId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMessage('تم تحديث بيانات الإعلان بنجاح!');
        setAds((prev) =>
          prev.map((ad) => (ad.id === adId ? { ...ad, ...payload } : ad))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الإعلان نهائياً؟')) return;

    setActionLoadingId(adId);
    try {
      const res = await fetch(`/api/ads/${adId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMessage('تم حذف الإعلان بنجاح');
        setAds((prev) => prev.filter((ad) => ad.id !== adId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  const activeAdsCount = ads.filter((a) => a.status === 'ACTIVE').length;
  const pendingAdsCount = ads.filter((a) => a.status === 'PENDING').length;
  const soldAdsCount = ads.filter((a) => a.status === 'SOLD').length;

  const selectedCatObj = categories.find((c) => c.id === categoryFilter);
  const availableSubcategories = selectedCatObj
    ? selectedCatObj.subcategories || []
    : categories.flatMap((c) => c.subcategories || []);

  // Client-side instant filtering for user's own ads
  const filteredAds = ads
    .filter((ad) => {
      if (statusFilter !== 'ALL' && ad.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && ad.categoryId !== categoryFilter) return false;
      if (subcategoryFilter !== 'ALL' && ad.subcategoryId !== subcategoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = ad.title?.toLowerCase().includes(q);
        const matchCity = ad.city?.toLowerCase().includes(q);
        if (!matchTitle && !matchCity) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'views_desc') return (b.views || 0) - (a.views || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile & KPI Header */}
      <div className="bg-white rounded-3xl border border-blue-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-blue-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-navy-900 text-white font-black text-2xl flex items-center justify-center shadow-md">
              {user?.name ? user.name.charAt(0) : 'م'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {user?.name}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              {user?.phone && (
                <p className="text-xs text-brand-600 font-semibold mt-0.5">
                  الهاتف: {user.phone}
                </p>
              )}
            </div>
          </div>

          <Link
            href="/ads/create"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-700 hover:to-blue-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-brand-600/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>نشر إعلان جديد</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              إجمالي إعلاناتي
            </span>
            <span className="text-2xl font-black text-slate-900">{ads.length}</span>
          </div>
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
            <span className="text-xs font-semibold text-emerald-700 block mb-1">
              إعلانات نشطة
            </span>
            <span className="text-2xl font-black text-emerald-800">{activeAdsCount}</span>
          </div>
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100">
            <span className="text-xs font-semibold text-amber-700 block mb-1">
              بانتظار المراجعة
            </span>
            <span className="text-2xl font-black text-amber-800">{pendingAdsCount}</span>
          </div>
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <span className="text-xs font-semibold text-slate-600 block mb-1">
              إعلانات مباعة
            </span>
            <span className="text-2xl font-black text-slate-800">{soldAdsCount}</span>
          </div>
        </div>
      </div>

      {/* Toast Alert Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </motion.div>
      )}

      {/* Full Filtering Bar for User Ads */}
      <div className="bg-white rounded-3xl border border-blue-200/90 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand-600" />
            <span>فلترة وبحث في إعلاناتي ({filteredAds.length})</span>
          </h2>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setCategoryFilter('ALL');
              setSubcategoryFilter('ALL');
              setSortBy('newest');
            }}
            className="text-xs font-bold text-brand-600 hover:underline"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث بالعنوان أو المدينة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-blue-50/40 text-xs rounded-xl pr-8 pl-3 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500"
            />
            <Search className="w-3.5 h-3.5 text-brand-500 absolute right-2.5 top-3" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-blue-50/40 text-xs font-bold text-slate-700 rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="ACTIVE">نشط</option>
            <option value="PENDING">بانتظار المراجعة</option>
            <option value="SOLD">تم البيع</option>
            <option value="REJECTED">مرفوض</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setSubcategoryFilter('ALL');
            }}
            className="bg-blue-50/40 text-xs font-bold text-slate-700 rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none"
          >
            <option value="ALL">جميع الأقسام الرئيسية</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={subcategoryFilter}
            onChange={(e) => setSubcategoryFilter(e.target.value)}
            className="bg-blue-50/40 text-xs font-bold text-slate-700 rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none"
          >
            <option value="ALL">جميع الأقسام الفرعية</option>
            {availableSubcategories.map((sub: any) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-blue-50/40 text-xs font-bold text-slate-700 rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none"
          >
            <option value="newest">الأحدث أولاً</option>
            <option value="price_asc">الأقل سعراً</option>
            <option value="price_desc">الأعلى سعراً</option>
            <option value="views_desc">الأكثر مشاهدة</option>
          </select>
        </div>
      </div>

      {/* Ads Management List */}
      <div className="space-y-4">
        {filteredAds.length > 0 ? (
          <div className="space-y-3">
            {filteredAds.map((ad) => {
              const statusInfo = STATUS_LABELS[ad.status] || STATUS_LABELS.ACTIVE;
              const country = getCountryByCity(ad.city);
              const adImage =
                ad.images && ad.images.length > 0
                  ? ad.images[0]
                  : '/uploads/ads/placeholder.webp';

              return (
                <div
                  key={ad.id}
                  className="bg-white rounded-2xl border border-blue-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-brand-300 transition-colors"
                >
                  {/* Thumbnail & Title */}
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={adImage}
                      alt={ad.title}
                      className="w-20 h-20 rounded-xl object-cover border border-blue-200 shrink-0 bg-blue-50"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusInfo.bg} ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                        {ad.category && (
                          <span className="text-[10px] font-bold text-brand-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            {ad.category.name}
                            {ad.subcategory ? ` / ${ad.subcategory.name}` : ''}
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          {country?.flag} {ad.city}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                          <Eye className="w-3 h-3" /> {ad.views || 0}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {ad.title}
                      </h3>
                      <div className="text-xs font-extrabold text-brand-600">
                        {new Intl.NumberFormat('ar-SA').format(ad.price)}{' '}
                        {country?.currencySymbol || 'ر.س'}
                      </div>
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-blue-100">
                    {/* Paymob Featured Status or Upgrade Button */}
                    {ad.isFeatured ? (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black flex items-center gap-1 shadow-2xs">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                        <span>مميز في أول القسم ⭐</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedAdForUpgrade(ad)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        title="ترقية الإعلان للظهور في صدارة القسم عبر Paymob"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span>ترقية لمميز (Paymob)</span>
                      </button>
                    )}

                    <Link
                      href={`/ads/${ad.id}`}
                      className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-brand-700 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="عرض الإعلان"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">معاينة</span>
                    </Link>

                    {/* Toggle Urgent Badge */}
                    <button
                      onClick={() =>
                        handleUpdateField(ad.id, { isUrgent: !ad.isUrgent })
                      }
                      disabled={actionLoadingId === ad.id}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-colors ${
                        ad.isUrgent
                          ? 'bg-orange-100 text-orange-800 border-orange-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-orange-50'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>{ad.isUrgent ? 'عاجل 🔥' : 'تمييز كعاجل'}</span>
                    </button>

                    {/* Mark Sold or Active */}
                    {ad.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleUpdateField(ad.id, { status: 'SOLD' })}
                        disabled={actionLoadingId === ad.id}
                        className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold flex items-center gap-1 border border-amber-200 transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>تحديد كمباع</span>
                      </button>
                    )}

                    {ad.status === 'SOLD' && (
                      <button
                        onClick={() => handleUpdateField(ad.id, { status: 'ACTIVE' })}
                        disabled={actionLoadingId === ad.id}
                        className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1 border border-emerald-200 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>إعادة تفعيل</span>
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteAd(ad.id)}
                      disabled={actionLoadingId === ad.id}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center gap-1 border border-rose-200 transition-colors"
                      title="حذف الإعلان"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">حذف</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-blue-200 p-12 text-center">
            <p className="text-sm font-semibold text-slate-500 mb-4">
              لا توجد إعلانات مطابقة حالياً.
            </p>
            <Link
              href="/ads/create"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>أضف إعلاناً جديداً الآن</span>
            </Link>
          </div>
        )}
      </div>

      {/* Paymob Upgrade Modal */}
      {selectedAdForUpgrade && (
        <UpgradeToFeaturedModal
          isOpen={Boolean(selectedAdForUpgrade)}
          onClose={() => setSelectedAdForUpgrade(null)}
          ad={selectedAdForUpgrade}
          onSuccess={() => {
            setSelectedAdForUpgrade(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
