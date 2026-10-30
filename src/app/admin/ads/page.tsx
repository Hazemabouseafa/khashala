'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Search,
  Filter,
  Check,
  X,
  Trash2,
  ExternalLink,
  Loader2,
  Star,
  Flame,
  RotateCcw,
  SlidersHorizontal,
  MapPin,
  Layers,
  Eye,
  Download,
  Edit,
  Save,
  CheckCircle,
} from 'lucide-react';
import {
  STATUS_LABELS,
  ARAB_COUNTRIES,
  CONDITION_LABELS,
  getCitiesByCountry,
  getCountryByCity,
} from '@/lib/constants';

export default function AdminAdsModerationPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Full Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [badgeFilter, setBadgeFilter] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Bulk Selection State
  const [selectedAdIds, setSelectedAdIds] = useState<string[]>([]);
  const [isBulkOperating, setIsBulkOperating] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

  // Quick Edit Modal State
  const [editingAd, setEditingAd] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editCondition, setEditCondition] = useState('LIKE_NEW');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (subcategoryFilter !== 'all') params.set('subcategory', subcategoryFilter);
      if (countryFilter !== 'all') params.set('country', countryFilter);
      if (cityFilter !== 'all') params.set('city', cityFilter);
      if (conditionFilter !== 'all') params.set('condition', conditionFilter);
      if (minPrice.trim()) params.set('minPrice', minPrice.trim());
      if (maxPrice.trim()) params.set('maxPrice', maxPrice.trim());
      if (sortBy) params.set('sort', sortBy);

      if (badgeFilter === 'featured') params.set('isFeatured', 'true');
      if (badgeFilter === 'urgent') params.set('isUrgent', 'true');
      if (badgeFilter === 'negotiable') params.set('isNegotiable', 'true');

      params.set('limit', '200');

      const res = await fetch(`/api/ads?${params.toString()}`);
      const data = await res.json();
      setAds(data.ads || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
    setSelectedAdIds([]);
  }, [
    statusFilter,
    categoryFilter,
    subcategoryFilter,
    countryFilter,
    cityFilter,
    conditionFilter,
    badgeFilter,
    sortBy,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAds();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSubcategoryFilter('all');
    setCountryFilter('all');
    setCityFilter('all');
    setConditionFilter('all');
    setBadgeFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setTimeout(() => fetchAds(), 50);
  };

  const handleUpdateAdField = async (adId: string, payload: Record<string, any>) => {
    setActionLoadingId(adId);
    try {
      const res = await fetch(`/api/ads/${adId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setAds((prev) =>
          prev.map((ad) => (ad.id === adId ? { ...ad, ...payload } : ad))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً من قاعدة البيانات؟')) return;

    setActionLoadingId(adId);
    try {
      const res = await fetch(`/api/ads/${adId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAds((prev) => prev.filter((ad) => ad.id !== adId));
        setSelectedAdIds((prev) => prev.filter((id) => id !== adId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Bulk Operations Handler
  const handleBulkAction = async (action: 'APPROVE' | 'REJECT' | 'DELETE' | 'FEATURE' | 'UNFEATURE') => {
    if (selectedAdIds.length === 0) return;
    if (action === 'DELETE' && !confirm(`هل أنت متأكد من حذف ${selectedAdIds.length} إعلان نهائياً؟`)) return;

    setIsBulkOperating(true);
    try {
      const res = await fetch('/api/admin/ads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adIds: selectedAdIds, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setBulkMessage(data.message);
        fetchAds();
        setSelectedAdIds([]);
      } else {
        alert(data.error || 'فشل تنفيذ الإجراء الجماعي');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBulkOperating(false);
      setTimeout(() => setBulkMessage(null), 3500);
    }
  };

  // Toggle selection
  const toggleSelectAd = (id: string) => {
    setSelectedAdIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAdIds.length === ads.length) {
      setSelectedAdIds([]);
    } else {
      setSelectedAdIds(ads.map((a) => a.id));
    }
  };

  // Export Filtered Ads to CSV (with Arabic UTF-8 BOM for Excel)
  const handleExportCSV = () => {
    if (ads.length === 0) return;

    const headers = [
      'المعرف المرجعي',
      'عنوان الإعلان',
      'السعر (ر.س)',
      'القسم الرئيسي',
      'القسم الفرعي',
      'المدينة',
      'الناشر',
      'رقم الهاتف',
      'الحالة',
      'إعلان مميز',
      'إعلان عاجل',
      'المشاهدات',
      'تاريخ النشر',
    ];

    const rows = ads.map((ad) => [
      `KH-${ad.id.slice(-6).toUpperCase()}`,
      `"${(ad.title || '').replace(/"/g, '""')}"`,
      ad.price,
      `"${ad.category?.name || ''}"`,
      `"${ad.subcategory?.name || ''}"`,
      `"${ad.city || ''}"`,
      `"${ad.user?.name || ''}"`,
      `"${ad.user?.phone || ''}"`,
      ad.status,
      ad.isFeatured ? 'نعم' : 'لا',
      ad.isUrgent ? 'نعم' : 'لا',
      ad.views || 0,
      new Date(ad.createdAt).toLocaleDateString('ar-SA'),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `khashala-ads-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick edit modal
  const openEditModal = (ad: any) => {
    setEditingAd(ad);
    setEditTitle(ad.title);
    setEditPrice(String(ad.price));
    setEditStatus(ad.status);
    setEditCondition(ad.condition || 'LIKE_NEW');
  };

  const handleSaveQuickEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/ads/${editingAd.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          price: parseFloat(editPrice),
          status: editStatus,
          condition: editCondition,
        }),
      });
      if (res.ok) {
        setAds((prev) =>
          prev.map((a) =>
            a.id === editingAd.id
              ? {
                  ...a,
                  title: editTitle,
                  price: parseFloat(editPrice),
                  status: editStatus,
                  condition: editCondition,
                }
              : a
          )
        );
        setEditingAd(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const selectedCategoryObj = categories.find(
    (c) => c.id === categoryFilter || c.slug === categoryFilter
  );
  const availableSubcategories = selectedCategoryObj
    ? selectedCategoryObj.subcategories || []
    : categories.flatMap((c) => c.subcategories || []);

  const availableCities =
    countryFilter !== 'all' ? getCitiesByCountry(countryFilter) : [];

  const statuses = [
    { id: 'all', label: 'كل الإعلانات' },
    { id: 'PENDING', label: 'بانتظار المراجعة' },
    { id: 'ACTIVE', label: 'نشط' },
    { id: 'REJECTED', label: 'مرفوض' },
    { id: 'SOLD', label: 'تم البيع' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-blue-200/90 p-6 sm:p-8 shadow-sm space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-brand-600" />
            <span>الفلترة المتقدمة والعمليات الجماعية للإعلانات</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة شاملة، إجراءات جماعية سريعة (Bulk Actions)، وتصدير فوري لبيانات الإعلانات لـ Excel
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={ads.length === 0}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            title="تصدير النتائج المفلترة لملف Excel CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير Excel (CSV)</span>
          </button>

          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3.5 py-2 rounded-xl bg-blue-50 text-brand-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition-colors border border-blue-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط</span>
          </button>
        </div>
      </div>

      {bulkMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{bulkMessage}</span>
        </div>
      )}

      {/* Status Quick Tabs */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === tab.id
                ? 'bg-gradient-to-l from-brand-600 to-blue-600 text-white shadow-sm'
                : 'bg-blue-50/60 hover:bg-blue-100/70 text-slate-700 border border-blue-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Comprehensive Multi-Criteria Filter Box */}
      <form
        onSubmit={handleSearchSubmit}
        className="p-5 bg-gradient-to-br from-blue-50/80 via-sky-50/40 to-blue-50/60 rounded-2xl border border-blue-200/80 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Keyword Search */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              بحث بالكلمات المفتاحية
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن آيفون، تويوتا، شقة، ساعة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-xs rounded-xl pr-9 pl-3 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-medium"
              />
              <Search className="w-4 h-4 text-brand-500 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Main Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              القسم الرئيسي
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setSubcategoryFilter('all');
              }}
              className="w-full bg-white text-xs rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-bold text-slate-700"
            >
              <option value="all">جميع الأقسام الرئيسية</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              القسم الفرعي
            </label>
            <select
              value={subcategoryFilter}
              onChange={(e) => setSubcategoryFilter(e.target.value)}
              className="w-full bg-white text-xs rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-bold text-slate-700"
            >
              <option value="all">جميع الأقسام الفرعية</option>
              {availableSubcategories.map((sub: any) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Arab Country */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              الدولة العربية
            </label>
            <select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setCityFilter('all');
              }}
              className="w-full bg-white text-xs rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-bold text-slate-700"
            >
              <option value="all">كل الدول العربية (22 دولة)</option>
              {ARAB_COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              المدينة
            </label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              disabled={countryFilter === 'all'}
              className="w-full bg-white text-xs rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-bold text-slate-700 disabled:opacity-60"
            >
              <option value="all">
                {countryFilter === 'all' ? 'اختر الدولة أولاً' : 'كل مدن ' + countryFilter}
              </option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              حالة السلعة
            </label>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full bg-white text-xs rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-bold text-slate-700"
            >
              <option value="all">جميع الحالات</option>
              <option value="NEW">جديد (New)</option>
              <option value="LIKE_NEW">مستعمل - كالجديد</option>
              <option value="USED_GOOD">مستعمل بحالة جيدة</option>
            </select>
          </div>

          {/* Badge Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              التمييز والشارات
            </label>
            <select
              value={badgeFilter}
              onChange={(e) => setBadgeFilter(e.target.value)}
              className="w-full bg-white text-xs rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-bold text-slate-700"
            >
              <option value="all">الكل (مميز وعادي)</option>
              <option value="featured">⭐ إعلانات مميزة فقط</option>
              <option value="urgent">🔥 إعلانات عاجلة فقط</option>
              <option value="negotiable">🤝 قابل للتفاوض فقط</option>
            </select>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 pt-2 border-t border-blue-200/60">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              السعر من
            </label>
            <input
              type="number"
              placeholder="الحد الأدنى"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-white text-xs rounded-xl px-3 py-2 border border-blue-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              السعر إلى
            </label>
            <input
              type="number"
              placeholder="الحد الأعلى"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-white text-xs rounded-xl px-3 py-2 border border-blue-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              ترتيب النتائج
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white text-xs rounded-xl px-3 py-2 border border-blue-200 font-bold text-slate-700"
            >
              <option value="newest">الأحدث نشراً</option>
              <option value="featured_first">المميزة والعاجلة أولاً ⭐</option>
              <option value="price_asc">السعر: من الأقل للأعلى</option>
              <option value="price_desc">السعر: من الأعلى للأقل</option>
              <option value="views_desc">الأكثر مشاهدة 👁️</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>تطبيق الفلترة والبحث</span>
            </button>
          </div>
        </div>
      </form>

      {/* Floating Bulk Action Bar when 1+ ads selected */}
      {selectedAdIds.length > 0 && (
        <div className="sticky top-24 z-30 bg-gradient-to-l from-navy-900 to-brand-800 text-white p-4 rounded-2xl shadow-xl border border-blue-400/40 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-sky-300" />
            <span className="text-xs font-black">
              تم تحديد ({selectedAdIds.length}) إعلان
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleBulkAction('APPROVE')}
              disabled={isBulkOperating}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>موافقة جماعية</span>
            </button>

            <button
              type="button"
              onClick={() => handleBulkAction('REJECT')}
              disabled={isBulkOperating}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>رفض جماعي</span>
            </button>

            <button
              type="button"
              onClick={() => handleBulkAction('FEATURE')}
              disabled={isBulkOperating}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1 shadow-xs transition-colors"
            >
              <Star className="w-3.5 h-3.5 fill-slate-950" />
              <span>تمييز كـ ⭐</span>
            </button>

            <button
              type="button"
              onClick={() => handleBulkAction('DELETE')}
              disabled={isBulkOperating}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف جماعي</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedAdIds([])}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-blue-200 rounded-xl text-xs font-bold transition-colors"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      {/* Ads Moderation Table */}
      {isLoading ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      ) : ads.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-blue-200/90 shadow-2xs">
          <table className="w-full min-w-[960px] text-right text-xs">
            <thead className="bg-blue-50/80 text-slate-700 font-bold border-b border-blue-200">
              <tr>
                <th className="py-3.5 px-3 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedAdIds.length > 0 && selectedAdIds.length === ads.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded accent-brand-600 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4 min-w-[280px]">الإعلان والمعلومات</th>
                <th className="py-3.5 px-4 min-w-[140px]">القسم والتصنيف</th>
                <th className="py-3.5 px-4 min-w-[130px]">الموقع والسعر</th>
                <th className="py-3.5 px-4 min-w-[130px]">الترقية والتمييز</th>
                <th className="py-3.5 px-4 min-w-[100px]">الحالة</th>
                <th className="py-3.5 px-4 min-w-[140px] text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100 bg-white">
              {ads.map((ad) => {
                const statusInfo = STATUS_LABELS[ad.status] || STATUS_LABELS.ACTIVE;
                const countryObj = getCountryByCity(ad.city);
                const isSelected = selectedAdIds.includes(ad.id);
                const image =
                  ad.images && ad.images.length > 0
                    ? ad.images[0]
                    : '/uploads/ads/placeholder.webp';

                return (
                  <tr
                    key={ad.id}
                    className={`hover:bg-blue-50/50 transition-colors ${
                      isSelected ? 'bg-blue-50/90' : ad.isFeatured ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-4 px-3 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectAd(ad.id)}
                        className="w-4 h-4 rounded accent-brand-600 cursor-pointer"
                      />
                    </td>

                    {/* Ad Info */}
                    <td className="py-4 px-4 align-middle">
                      <div className="flex items-center gap-3">
                        <img
                          src={image}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover border border-blue-200 shrink-0 shadow-2xs"
                        />
                        <div className="min-w-0 max-w-[240px] space-y-1">
                          <Link
                            href={`/ads/${ad.id}`}
                            target="_blank"
                            className="font-bold text-slate-900 hover:text-brand-600 block truncate"
                            title={ad.title}
                          >
                            <span className="truncate">{ad.title}</span>
                          </Link>
                          <div className="text-[11px] text-slate-500 truncate">
                            الناشر: <span className="font-bold text-slate-700">{ad.user?.name || 'مستخدم'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>{new Date(ad.createdAt).toLocaleDateString('ar-SA')}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Eye className="w-3 h-3" /> {ad.views || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 align-middle whitespace-nowrap">
                      <div className="font-bold text-slate-800">{ad.category?.name}</div>
                      {ad.subcategory ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md mt-1">
                          <Layers className="w-2.5 h-2.5" />
                          <span>{ad.subcategory.name}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block mt-1">بدون قسم فرعي</span>
                      )}
                    </td>

                    {/* Location & Price */}
                    <td className="py-4 px-4 align-middle whitespace-nowrap">
                      <div className="font-black text-brand-600 text-sm">
                        {new Intl.NumberFormat('ar-SA').format(ad.price)}{' '}
                        <span className="text-[10px] font-bold">
                          {countryObj?.currency || 'ر.س'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-brand-500 shrink-0" />
                        <span>
                          {countryObj ? `${countryObj.flag} ` : ''}
                          {ad.city}
                        </span>
                      </div>
                    </td>

                    {/* Featured / VIP Badges */}
                    <td className="py-4 px-4 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateAdField(ad.id, { isFeatured: !ad.isFeatured })
                          }
                          disabled={actionLoadingId === ad.id}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all ${
                            ad.isFeatured
                              ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-2xs'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                          title="تبديل تمييز الإعلان"
                        >
                          <Star className={`w-3 h-3 ${ad.isFeatured ? 'fill-amber-500 text-amber-600' : ''}`} />
                          <span>{ad.isFeatured ? 'مميز ⭐' : 'تمييز'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateAdField(ad.id, { isUrgent: !ad.isUrgent })
                          }
                          disabled={actionLoadingId === ad.id}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all ${
                            ad.isUrgent
                              ? 'bg-orange-100 text-orange-800 border-orange-300 shadow-2xs'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-orange-50 hover:text-orange-700'
                          }`}
                          title="تبديل علامة عاجل"
                        >
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span>{ad.isUrgent ? 'عاجل 🔥' : 'عاجل'}</span>
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 align-middle whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${statusInfo.bg} ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 align-middle whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(ad)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-brand-700 rounded-lg border border-blue-200 transition-colors"
                          title="تعديل سريع للإعلان"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {ad.status !== 'ACTIVE' && (
                          <button
                            onClick={() => handleUpdateAdField(ad.id, { status: 'ACTIVE' })}
                            disabled={actionLoadingId === ad.id}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-colors"
                            title="الموافقة والتفعيل"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {ad.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleUpdateAdField(ad.id, { status: 'REJECTED' })}
                            disabled={actionLoadingId === ad.id}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 transition-colors"
                            title="رفض الإعلان"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteAd(ad.id)}
                          disabled={actionLoadingId === ad.id}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition-colors"
                          title="حذف الإعلان"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        <div className="p-12 text-center bg-blue-50/40 rounded-2xl border border-blue-100 text-slate-600 text-xs font-bold">
          لا توجد إعلانات مطابقة لمعايير الفلترة.
        </div>
      )}

      {/* Quick Edit Modal */}
      {editingAd && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-blue-200 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-brand-600" />
                <span>تعديل سريع للإعلان</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingAd(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  عنوان الإعلان
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-blue-50/40 text-xs rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  السعر (ر.س)
                </label>
                <input
                  type="number"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full bg-blue-50/40 text-xs rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الحالة
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-blue-50/40 text-xs rounded-xl px-3 py-2 border border-blue-200 font-bold text-slate-700"
                  >
                    <option value="ACTIVE">نشط</option>
                    <option value="PENDING">معلق</option>
                    <option value="SOLD">مباع</option>
                    <option value="REJECTED">مرفوض</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    حالة السلعة
                  </label>
                  <select
                    value={editCondition}
                    onChange={(e) => setEditCondition(e.target.value)}
                    className="w-full bg-blue-50/40 text-xs rounded-xl px-3 py-2 border border-blue-200 font-bold text-slate-700"
                  >
                    <option value="NEW">جديد</option>
                    <option value="LIKE_NEW">كالجديد</option>
                    <option value="USED_GOOD">مستعمل</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAd(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  {isSavingEdit ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
