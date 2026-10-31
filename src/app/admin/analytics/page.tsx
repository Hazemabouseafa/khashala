'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Eye,
  ShoppingBag,
  Users,
  Star,
  Flame,
  Layers,
  MapPin,
  Loader2,
  CreditCard,
} from 'lucide-react';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then((d) => setData(d.analytics || null))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  const {
    realPaymentsRevenue = 0,
    realPaymentsCount = 0,
    totalViews = 0,
    totalUsers = 0,
    bannedUsers = 0,
    totalAds = 0,
    statusCounts = {},
    featuredCount = 0,
    urgentCount = 0,
    topCities = [],
    categoryStats = [],
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Platform Activity & Engagement Banner */}
      <div className="bg-gradient-to-l from-navy-950 via-blue-950 to-brand-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-blue-800/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="inline-block text-[11px] font-bold px-3 py-1 rounded-full bg-sky-400/20 text-sky-200 border border-sky-400/30 mb-2">
              إحصائيات التفاعل والزيارات المباشرة
            </span>
            <div className="flex items-baseline gap-2">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                {new Intl.NumberFormat('ar-SA').format(totalViews)}
              </h1>
              <span className="text-lg font-bold text-sky-300">مشاهدة للإعلانات</span>
            </div>
            <p className="text-xs text-blue-200/80 mt-1">
              إجمالي تفاعل الزوار والمشاهدات المسجلة على الإعلانات المنشورة عبر جميع الأقسام والمدن
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
              <span className="text-[11px] text-blue-200 block">إعلانات نشطة حالياً</span>
              <span className="text-lg font-black text-white">
                {statusCounts.ACTIVE || 0} إعلان
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
              <span className="text-[11px] text-blue-200 block">مدفوعات Paymob الفعلية</span>
              <span className="text-lg font-black text-emerald-300 flex items-center justify-center gap-1">
                <CreditCard className="w-4 h-4" />
                {realPaymentsRevenue} ({realPaymentsCount})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">إجمالي الإعلانات</span>
            <div className="w-8 h-8 rounded-xl platform-icon-box flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{totalAds}</span>
          <span className="text-[11px] text-emerald-600 font-bold block mt-1">
            {statusCounts.ACTIVE || 0} نشط • {statusCounts.SOLD || 0} مباع
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-800">إعلانات مميزة ⭐</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{featuredCount}</span>
          <span className="text-[11px] text-slate-400 block mt-1">تظهر في صدارة الأقسام</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-orange-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-orange-800">إعلانات عاجلة 🔥</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{urgentCount}</span>
          <span className="text-[11px] text-slate-400 block mt-1">بيع وتصفية سريعة</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">الأعضاء المسجلين</span>
            <div className="w-8 h-8 rounded-xl platform-icon-box flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{totalUsers}</span>
          <span className="text-[11px] text-slate-400 block mt-1">
            {bannedUsers > 0 ? `${bannedUsers} محظورين` : 'جميع الحسابات نشطة'}
          </span>
        </div>
      </div>

      {/* Visual Analytics Grid: Category Breakdown + Top Cities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-blue-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-blue-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 platform-icon-tint" />
                <span>توزيع الإعلانات والمشاهدات حسب الأقسام</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                نسبة وحجم انتشار الإعلانات والمشاهدات داخل كل قسم رئيسي
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {categoryStats.map((cat: any) => (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg platform-icon-box flex items-center justify-center">
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({cat.adsCount} إعلان • {cat.subcategoriesCount} فرعي)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-bold flex items-center gap-1 text-[11px]">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {new Intl.NumberFormat('ar-SA').format(cat.viewsCount)}
                    </span>
                    <span className="text-brand-600 font-mono text-[11px] font-black">
                      %{cat.percentage}
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-2.5 bg-blue-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-l from-brand-600 to-sky-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(cat.percentage, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Cities & Status Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Top Arab Cities */}
          <div className="bg-white rounded-3xl border border-blue-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-blue-100 pb-3">
              <MapPin className="w-5 h-5 platform-icon-tint" />
              <span>المدن الأكثر نشاطاً في الإعلانات</span>
            </h3>

            <div className="space-y-2.5">
              {topCities.map((city: any, idx: number) => (
                <div
                  key={city.name}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100 text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-black">
                      {idx + 1}
                    </span>
                    <span>{city.name}</span>
                  </div>
                  <span className="font-black text-brand-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                    {city.count} إعلان
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution Card */}
          <div className="bg-white rounded-3xl border border-blue-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-blue-100 pb-3">
              <BarChart3 className="w-5 h-5 platform-icon-tint" />
              <span>توزيع حالات الإعلانات</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-emerald-700 font-bold block mb-1">إعلانات نشطة</span>
                <span className="text-xl font-black text-emerald-900">
                  {statusCounts.ACTIVE || 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-amber-700 font-bold block mb-1">بانتظار المراجعة</span>
                <span className="text-xl font-black text-amber-900">
                  {statusCounts.PENDING || 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-blue-700 font-bold block mb-1">تم البيع</span>
                <span className="text-xl font-black text-blue-900">
                  {statusCounts.SOLD || 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                <span className="text-rose-700 font-bold block mb-1">مرفوضة</span>
                <span className="text-xl font-black text-rose-900">
                  {statusCounts.REJECTED || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
