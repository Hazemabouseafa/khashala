'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  Tag,
  ArrowRight,
  Check,
  X,
  ExternalLink,
  Loader2,
  Star,
  Flame,
  Layers,
  AlertTriangle,
  BarChart3,
  Settings,
  History,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any | null>(null);
  const [pendingAds, setPendingAds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setStats(statsData.stats || null);

      const adsRes = await fetch('/api/ads?status=PENDING&limit=8');
      const adsData = await adsRes.json();
      setPendingAds(adsData.ads || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleModerate = async (adId: string, status: 'ACTIVE' | 'REJECTED') => {
    setActionLoadingId(adId);
    try {
      const res = await fetch(`/api/ads/${adId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setPendingAds((prev) => prev.filter((a) => a.id !== adId));
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Alert Banner if there are pending reports */}
      {stats?.pendingReportsCount > 0 && (
        <div className="bg-gradient-to-r from-rose-600 to-red-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black">
                يوجد ({stats.pendingReportsCount}) بلاغ معلق بانتظار المراجعة والتدقيق!
              </h3>
              <p className="text-xs text-rose-100">
                قام بعض المستخدمين بالإبلاغ عن إعلانات مشبوهة، تفقد مركز البلاغات لاتخاذ إجراءات فورية.
              </p>
            </div>
          </div>
          <Link
            href="/admin/reports"
            className="px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-black shrink-0 transition-colors shadow-sm"
          >
            مراجعة البلاغات الآن ←
          </Link>
        </div>
      )}

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              المستخدمين
            </span>
            <span className="text-2xl font-black text-slate-900">
              {stats?.totalUsers || 0}
            </span>
            {stats?.bannedUsersCount > 0 && (
              <span className="text-[10px] text-rose-600 font-bold block">
                {stats.bannedUsersCount} محظورين
              </span>
            )}
          </div>
        </div>

        {/* Total Ads */}
        <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              إجمالي الإعلانات
            </span>
            <span className="text-2xl font-black text-slate-900">
              {stats?.totalAds || 0}
            </span>
          </div>
        </div>

        {/* Pending Review Ads */}
        <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-amber-700 block">
              بانتظار المراجعة
            </span>
            <span className="text-2xl font-black text-amber-800">
              {stats?.pendingAds || 0}
            </span>
          </div>
        </div>

        {/* Active Ads */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-emerald-700 block">
              إعلانات نشطة
            </span>
            <span className="text-2xl font-black text-emerald-800">
              {stats?.activeAds || 0}
            </span>
          </div>
        </div>

        {/* Featured Ads */}
        <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              إعلانات مميزة ⭐
            </span>
            <span className="text-2xl font-black text-slate-900">
              {stats?.featuredAds || 0}
            </span>
          </div>
        </div>

        {/* Urgent Ads */}
        <div className="bg-white p-5 rounded-3xl border border-orange-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              إعلانات عاجلة 🔥
            </span>
            <span className="text-2xl font-black text-slate-900">
              {stats?.urgentAds || 0}
            </span>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              الأقسام الرئيسية
            </span>
            <span className="text-2xl font-black text-slate-900">
              {stats?.categoriesCount || 0}
            </span>
          </div>
        </div>

        {/* Subcategories */}
        <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              الأقسام الفرعية
            </span>
            <span className="text-2xl font-black text-slate-900">
              {stats?.subcategoriesCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid (6 Enterprise Admin Modules) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Link
          href="/admin/ads"
          className="bg-gradient-to-l from-navy-900 to-blue-900 text-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-black flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>الفلترة المتقدمة وتصدير Excel</span>
            </h3>
            <p className="text-[11px] text-blue-200">
              إجراءات جماعية، فلترة دقيقة، وتصدير فوري
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-sky-200 group-hover:-translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/categories"
          className="bg-gradient-to-l from-brand-600 to-blue-700 text-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-black flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-300" />
              <span>الأقسام والأقسام الفرعية</span>
            </h3>
            <p className="text-[11px] text-blue-100">
              إضافة وتعديل الأقسام والفرعيات بأيقوناتها
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-sky-200 group-hover:-translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/reports"
          className="bg-gradient-to-l from-rose-700 to-red-800 text-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-black flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-300" />
              <span>مركز البلاغات والمخالفات</span>
            </h3>
            <p className="text-[11px] text-rose-100">
              فحص الشكاوى، حظر البائعين وحذف الإعلانات
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-rose-200 group-hover:-translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/analytics"
          className="bg-gradient-to-l from-slate-900 to-navy-900 text-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-black flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>التحليلات والقيمة السوقية</span>
            </h3>
            <p className="text-[11px] text-slate-300">
              مؤشرات مالية ورسوم بيانية لتوزيع الأقسام
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-sky-200 group-hover:-translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/users"
          className="bg-gradient-to-l from-blue-900 to-brand-800 text-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-black flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-300" />
              <span>إدارة المستخدمين والحظر</span>
            </h3>
            <p className="text-[11px] text-blue-200">
              ترقية الصلاحيات، حظر الحسابات، والبحث
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-sky-200 group-hover:-translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/settings"
          className="bg-gradient-to-l from-indigo-900 to-blue-900 text-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-black flex items-center gap-2">
              <Settings className="w-4 h-4 text-sky-300" />
              <span>إعدادات المنصة والشريط</span>
            </h3>
            <p className="text-[11px] text-blue-200">
              النشر الفوري، رسائل التنبيه، وأرقام الدعم
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-sky-200 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Pending Ads Action Queue */}
      <div className="bg-white rounded-3xl border border-blue-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-blue-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>إعلانات تنتظر المراجعة والموافقة</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              تحقق من صحة المحتوى والصور قبل تفعيل ظهور الإعلان للعامة
            </p>
          </div>

          <Link
            href="/admin/ads"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>كل الإعلانات والفلترة الشاملة</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingAds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-blue-50/60 text-slate-600 font-bold border-b border-blue-100">
                <tr>
                  <th className="py-3 px-4">الإعلان</th>
                  <th className="py-3 px-4">الناشر</th>
                  <th className="py-3 px-4">القسم والمدينة</th>
                  <th className="py-3 px-4">السعر</th>
                  <th className="py-3 px-4 text-center">إجراءات المراجعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {pendingAds.map((ad) => {
                  const image =
                    ad.images && ad.images.length > 0
                      ? ad.images[0]
                      : '/uploads/ads/placeholder.webp';

                  return (
                    <tr key={ad.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={image}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-blue-100 shrink-0"
                          />
                          <div>
                            <Link
                              href={`/ads/${ad.id}`}
                              target="_blank"
                              className="font-bold text-slate-900 hover:text-brand-600 line-clamp-1 flex items-center gap-1"
                            >
                              <span>{ad.title}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </Link>
                            <span className="text-[10px] text-slate-400">
                              {new Date(ad.createdAt).toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {ad.user?.name || 'مستخدم'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-bold text-slate-800">
                          {ad.category?.name}
                          {ad.subcategory && (
                            <span className="text-brand-600"> / {ad.subcategory.name}</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{ad.city}</div>
                      </td>

                      <td className="py-3.5 px-4 font-black text-brand-600">
                        {new Intl.NumberFormat('ar-SA').format(ad.price)} ر.س
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleModerate(ad.id, 'ACTIVE')}
                            disabled={actionLoadingId === ad.id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>موافقة</span>
                          </button>
                          <button
                            onClick={() => handleModerate(ad.id, 'REJECTED')}
                            disabled={actionLoadingId === ad.id}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl font-bold flex items-center gap-1 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>رفض</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 font-semibold text-xs bg-blue-50/40 rounded-2xl border border-blue-100">
            لا توجد إعلانات معلقة حالياً بحاجة للمراجعة. كل شيء منظم ومحدث!
          </div>
        )}
      </div>
    </div>
  );
}
