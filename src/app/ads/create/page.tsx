'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ImageUploader } from '@/components/ads/ImageUploader';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ARAB_COUNTRIES, CATEGORIES_DATA, getCitiesByCountry } from '@/lib/constants';
import {
  Plus,
  Tag,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  Camera,
  Loader2,
  UserCheck,
  Globe,
  Flame,
  Star,
} from 'lucide-react';
import UpgradeToFeaturedModal from '@/components/ads/UpgradeToFeaturedModal';

export default function CreateAdPage() {
  const [user, setUser] = useState<any | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [selectedAdForUpgrade, setSelectedAdForUpgrade] = useState<any | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [country, setCountry] = useState('جمهورية مصر العربية');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('LIKE_NEW');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [isUrgent, setIsUrgent] = useState(false);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setUser(data.user || null);
      } catch {
        setUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        } else {
          setCategories(
            CATEGORIES_DATA.map((c, i) => ({ id: `cat-${i}`, ...c }))
          );
        }
      } catch {
        setCategories(CATEGORIES_DATA.map((c, i) => ({ id: `cat-${i}`, ...c })));
      }
    };

    checkSession();
    loadCategories();
  }, []);

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);
  const availableSubcategories = selectedCategoryObj?.subcategories || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !title.trim() ||
      !categoryId ||
      !city ||
      !price ||
      !description.trim()
    ) {
      setError(
        'يرجى إكمال جميع الحقول المطلوبة (القسم، العنوان، المدينة، السعر، والوصف)'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          categoryId,
          subcategoryId: subcategoryId || null,
          city,
          price: parseFloat(price),
          condition,
          isNegotiable,
          isUrgent,
          description,
          images,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل في نشر الإعلان');
      }

      setSuccessResult(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#e00000] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
        <div className="w-14 h-14 rounded-full bg-red-50 text-[#e00000] flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-[#222222] mb-2">
          سجّل دخولك لإضافة إعلانك مجاناً
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          أنشئ حسابك أو سجّل دخولك على خشاله لتتمكن من نشر إعلاناتك وإدارتها بسهولة.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/auth/login?redirect=/ads/create"
            className="px-6 py-2.5 bg-[#e00000] hover:bg-[#c20000] text-white font-extrabold text-sm rounded-lg transition-colors"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#222222] font-extrabold text-sm rounded-lg transition-colors"
          >
            إنشاء حساب جديد
          </Link>
        </div>
      </div>
    );
  }

  if (successResult) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#222222] mb-2">
          {successResult.message || 'تم إرسال إعلانك بنجاح!'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          تم ضغط الصور تلقائياً وحفظ إعلانك بنجاح.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {successResult.ad?.id && (
            <Link
              href={`/ads/${successResult.ad.id}`}
              className="px-6 py-3 bg-[#e00000] hover:bg-[#c20000] text-white font-extrabold text-sm rounded-lg transition-colors"
            >
              معاينة الإعلان
            </Link>
          )}
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-[#222222] font-extrabold text-sm rounded-lg transition-colors"
          >
            إعلاناتي وحسابي
          </Link>
        </div>

        {/* Paymob VIP Upgrade Callout */}
        {successResult.ad && (
          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-right space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>هل تريد بيع سلعتك أسرع؟ ميّز إعلانك ليظهر في أول القسم!</span>
            </div>
            <p className="text-[11px] text-slate-700">
              ترقية سريعة عبر بوابة Paymob تضع إعلانك في صدارة القسم مع شارة التمييز.
            </p>
            <button
              type="button"
              onClick={() => setSelectedAdForUpgrade(successResult.ad)}
              className="w-full py-2.5 bg-[#222222] hover:bg-black text-white font-extrabold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>ترقية لإعلان مميز الآن (Paymob)</span>
            </button>
          </div>
        )}

        {selectedAdForUpgrade && (
          <UpgradeToFeaturedModal
            isOpen={Boolean(selectedAdForUpgrade)}
            onClose={() => setSelectedAdForUpgrade(null)}
            ad={selectedAdForUpgrade}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-black text-[#222222]">
          أضف إعلانك
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          اختر القسم المناسب، أضف الصور والتفاصيل وانشر إعلانك مجاناً
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Visual Category & Subcategory Selection */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4">
          <h2 className="text-sm sm:text-base font-black text-[#222222] flex items-center gap-2 border-b border-slate-100 pb-3">
            <Tag className="w-4 h-4 text-[#e00000]" />
            <span>1. اختر القسم</span>
          </h2>

          {/* Visual Category Grid / Horizontal Mobile Row */}
          <div className="flex flex-nowrap overflow-x-auto no-scrollbar snap-x snap-mandatory gap-2.5 pb-1 sm:grid sm:grid-cols-4">
            {categories.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(cat.id);
                    setSubcategoryId('');
                  }}
                  className={`w-[98px] sm:w-auto shrink-0 snap-start group flex flex-col items-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-50/70 border-[#e00000] ring-1 ring-[#e00000]'
                      : 'bg-[#f7f8fa] hover:bg-white border-slate-200'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center mb-1.5 ${
                      isSelected
                        ? 'platform-icon-active'
                        : 'platform-icon-box platform-icon-box-hover'
                    }`}
                  >
                    <CategoryIcon name={cat.icon} className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[11px] font-extrabold line-clamp-1 ${
                      isSelected ? 'text-[#e00000]' : 'text-slate-800'
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Subcategories Pills */}
          {availableSubcategories.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-extrabold text-slate-700">
                اختر الفئة الفرعية في {selectedCategoryObj?.name}:
              </label>
              <div className="flex flex-nowrap overflow-x-auto no-scrollbar snap-x gap-2 pb-1 sm:flex-wrap">
                {availableSubcategories.map((sub: any) => {
                  const isSelected = subcategoryId === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() =>
                        setSubcategoryId(isSelected ? '' : sub.id)
                      }
                      className={`shrink-0 snap-start inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#222222] text-white border-[#222222]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <CategoryIcon
                        name={sub.icon || selectedCategoryObj?.icon || 'Tag'}
                        className="w-3.5 h-3.5 platform-icon-tint"
                      />
                      <span>{sub.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Photos Upload */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm sm:text-base font-black text-[#222222] flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#e00000]" />
              <span>2. أضف صور الإعلان</span>
            </h2>
            <span className="text-[11px] font-bold text-slate-400">
              حتى 8 صور واضحة
            </span>
          </div>

          <ImageUploader images={images} onChange={setImages} maxFiles={8} />
        </div>

        {/* Step 3: Ad Details, Price & Location */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4">
          <h2 className="text-sm sm:text-base font-black text-[#222222] flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-[#e00000]" />
            <span>3. تفاصيل الإعلان والسعر</span>
          </h2>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
              عنوان الإعلان <span className="text-[#e00000]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: تويوتا كامري 2024 فل كامل فابريكا بالكامل"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#f7f8fa] focus:bg-white text-sm rounded-lg px-4 py-3 border border-slate-200 focus:outline-none focus:border-[#222222]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                السعر (
                {ARAB_COUNTRIES.find((c) => c.name === country)
                  ?.currencySymbol || 'ج.م'}
                ) <span className="text-[#e00000]">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="any"
                placeholder="أدخل السعر"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#f7f8fa] focus:bg-white text-sm rounded-lg px-4 py-3 border border-slate-200 focus:outline-none focus:border-[#222222] font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                الحالة
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-[#f7f8fa] text-sm rounded-lg px-4 py-3 border border-slate-200 focus:outline-none focus:border-[#222222] font-bold text-slate-800 cursor-pointer"
              >
                <option value="NEW">جديد</option>
                <option value="LIKE_NEW">مستعمل - كالجديد</option>
                <option value="USED_GOOD">مستعمل بحالة جيدة</option>
                <option value="NA">لا ينطبق (عقار / وظيفة / خدمة)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>الدولة</span>
              </label>
              <select
                required
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setCity('');
                }}
                className="w-full bg-[#f7f8fa] text-sm rounded-lg px-4 py-3 border border-slate-200 focus:outline-none focus:border-[#222222] font-bold text-slate-800 cursor-pointer"
              >
                {ARAB_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  المدينة <span className="text-[#e00000]">*</span>
                </span>
              </label>
              <select
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#f7f8fa] text-sm rounded-lg px-4 py-3 border border-slate-200 focus:outline-none focus:border-[#222222] font-bold text-slate-800 cursor-pointer"
              >
                <option value="">اختر المدينة</option>
                {getCitiesByCountry(country).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 bg-[#f7f8fa] px-3.5 py-2.5 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                checked={isNegotiable}
                onChange={(e) => setIsNegotiable(e.target.checked)}
                className="w-4 h-4 accent-[#e00000]"
              />
              <span>السعر قابل للتفاوض</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#e00000] bg-red-50/60 px-3.5 py-2.5 rounded-lg border border-red-200">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-4 h-4 accent-[#e00000]"
              />
              <Flame className="w-4 h-4" />
              <span>تمييز كبيع عاجل</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
              الوصف الكامل <span className="text-[#e00000]">*</span>
            </label>
            <textarea
              required
              rows={5}
              placeholder="اذكر كافة المواصفات والحالة وطريقة التواصل والمعاينة..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#f7f8fa] focus:bg-white text-sm rounded-lg p-4 border border-slate-200 focus:outline-none focus:border-[#222222] leading-relaxed"
            />
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-1">
          <Link
            href="/"
            className="px-5 py-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-sm transition-colors"
          >
            إلغاء
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#e00000] hover:bg-[#c20000] text-white font-extrabold text-sm rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري النشر...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[2.8]" />
                <span>انشر الإعلان الآن</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
