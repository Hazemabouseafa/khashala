'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ImageUploader } from '@/components/ads/ImageUploader';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ARAB_COUNTRIES, CATEGORIES_DATA, getCitiesByCountry } from '@/lib/constants';
import {
  PlusCircle,
  Tag,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Loader2,
  UserCheck,
  Globe,
  Layers,
  Flame,
  Star,
  CreditCard,
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
  const [country, setCountry] = useState('المملكة العربية السعودية');
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
          setCategories(CATEGORIES_DATA.map((c, i) => ({ id: `cat-${i}`, ...c })));
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

    if (!title.trim() || !categoryId || !city || !price || !description.trim()) {
      setError('يرجى تعبئة جميع الحقول المطلوبة (العنوان، القسم، المدينة، السعر، والتفاصيل)');
      return;
    }

    if (images.length === 0) {
      setError('يرجى إضافة صورة واحدة على الأقل لإعلانك');
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
        throw new Error(data.error || 'فشل نشر الإعلان');
      }

      setSuccessResult(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ الإعلان');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 bg-white rounded-3xl border border-blue-200 text-center shadow-xs">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          تسجيل الدخول مطلوب
        </h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          يجب تسجيل الدخول أو إنشاء حساب جديد على خشاله لتتمكن من نشر إعلاناتك والتواصل مع المشترين.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/auth/login"
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition-colors"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-2.5 bg-blue-50 hover:bg-blue-100 text-brand-700 font-bold text-sm rounded-xl transition-colors"
          >
            حساب جديد
          </Link>
        </div>
      </div>
    );
  }

  if (successResult) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-blue-200 text-center shadow-md">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          {successResult.message || 'تم تقديم الإعلان بنجاح!'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          تمت معالجة صورك وضغطها تلقائياً بصيغة WebP وتم حفظ الإعلان في قاعدة البيانات.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {successResult.ad?.id && (
            <Link
              href={`/ads/${successResult.ad.id}`}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition-colors"
            >
              معاينة الإعلان
            </Link>
          )}
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-50 hover:bg-blue-100 text-brand-700 font-bold text-sm rounded-xl transition-colors"
          >
            الذهاب للوحة التحكم
          </Link>
        </div>

        {/* Paymob VIP Upgrade Callout */}
        {successResult.ad && (
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/70 border border-amber-300 text-right space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-amber-900">
              <Star className="w-4 h-4 fill-amber-500 text-amber-600" />
              <span>هل ترغب في مضاعفة اتصالات المشترين؟ اجعل إعلانك في أول القسم!</span>
            </div>
            <p className="text-[11px] text-amber-800">
              يمكنك ترقية إعلانك الآن عبر Paymob ليظهر في صدارة القسم وتثبيت شارة VIP الذهبية.
            </p>
            <button
              type="button"
              onClick={() => setSelectedAdForUpgrade(successResult.ad)}
              className="w-full py-2.5 bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 fill-white" />
              <span>ترقية لإعلان مميز في أول القسم الآن (Paymob)</span>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
          إعلان مبوب جديد
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          أضف إعلانك على خشاله
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          اختر القسم والقسم الفرعي وحدد حالة السلعة والمدينة وسيتم ضغط الصور تلقائياً عبر Sharp
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Basic Information */}
        <div className="bg-white rounded-3xl border border-blue-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-blue-100 pb-3">
            <Tag className="w-5 h-5 text-brand-600" />
            <span>المعلومات الأساسية والقسم</span>
          </h2>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              عنوان الإعلان <span className="text-brand-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: تويوتا كامري 2024 فل كامل بحالة الوكالة"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-blue-50/40 text-sm rounded-2xl px-4 py-3.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-medium"
            />
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                القسم الرئيسي <span className="text-brand-600">*</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubcategoryId('');
                }}
                className="w-full bg-blue-50/40 text-sm rounded-2xl px-4 py-3.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-bold text-slate-800 cursor-pointer"
              >
                <option value="">اختر القسم الرئيسي</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-600" />
                <span>القسم الفرعي (Subcategory)</span>
              </label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                disabled={!categoryId || availableSubcategories.length === 0}
                className="w-full bg-blue-50/40 text-sm rounded-2xl px-4 py-3.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-bold text-slate-800 cursor-pointer disabled:opacity-60"
              >
                <option value="">
                  {!categoryId
                    ? 'اختر القسم الرئيسي أولاً'
                    : 'اختر القسم الفرعي (اختياري)'}
                </option>
                {availableSubcategories.map((sub: any) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Subcategory Cards Preview when Category is chosen */}
          {availableSubcategories.length > 0 && (
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200/80 space-y-2.5">
              <span className="text-xs font-bold text-slate-700 block">
                أو اختر القسم الفرعي مباشرة من البطاقات:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {availableSubcategories.map((sub: any) => {
                  const isSelected = subcategoryId === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSubcategoryId(isSelected ? '' : sub.id)}
                      className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-white hover:bg-blue-50 text-slate-700 border-blue-200'
                      }`}
                    >
                      <CategoryIcon
                        name={sub.icon || selectedCategoryObj?.icon || 'Tag'}
                        className={`w-5 h-5 mb-1.5 ${
                          isSelected ? 'text-white' : 'text-brand-600'
                        }`}
                      />
                      <span className="text-[11px] font-bold line-clamp-1">{sub.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Country & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-brand-600" />
                <span>
                  الدولة العربية <span className="text-brand-600">*</span>
                </span>
              </label>
              <select
                required
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setCity('');
                }}
                className="w-full bg-blue-50/40 text-sm rounded-2xl px-4 py-3.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-bold text-slate-800 cursor-pointer"
              >
                {ARAB_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>
                  المدينة <span className="text-brand-600">*</span>
                </span>
              </label>
              <select
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-blue-50/40 text-sm rounded-2xl px-4 py-3.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-bold text-slate-800 cursor-pointer"
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

          {/* Price, Condition & Featured Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                السعر ({ARAB_COUNTRIES.find((c) => c.name === country)?.currencySymbol || 'ر.س'}){' '}
                <span className="text-brand-600">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="any"
                placeholder="مثال: 45000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-blue-50/40 text-sm rounded-2xl px-4 py-3.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                حالة السلعة
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-blue-50/40 text-sm rounded-2xl px-4 py-3.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-bold text-slate-800 cursor-pointer"
              >
                <option value="NEW">جديد تماماً (New)</option>
                <option value="LIKE_NEW">مستعمل - كالجديد</option>
                <option value="USED_GOOD">مستعمل بحالة جيدة</option>
                <option value="NA">غير منطبق (عقار / وظيفة / خدمة)</option>
              </select>
            </div>
          </div>

          {/* Checkboxes: Negotiable & Urgent */}
          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 bg-blue-50/60 px-4 py-3 rounded-xl border border-blue-200">
              <input
                type="checkbox"
                checked={isNegotiable}
                onChange={(e) => setIsNegotiable(e.target.checked)}
                className="w-4 h-4 accent-brand-600"
              />
              <span>السعر قابل للتفاوض 🤝</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-orange-800 bg-orange-50/70 px-4 py-3 rounded-xl border border-orange-200">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-4 h-4 accent-orange-600"
              />
              <Flame className="w-4 h-4 text-orange-600" />
              <span>تمييز كإعلان بيع عاجل 🔥</span>
            </label>
          </div>
        </div>

        {/* Step 2: Image Uploads with Sharp Compression */}
        <div className="bg-white rounded-3xl border border-blue-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <span>صور الإعلان (مع ضغط Sharp الفوري)</span>
            </h2>
            <span className="text-xs text-brand-600 font-bold">
              أقصى عرض 1200px • صيغة WebP
            </span>
          </div>

          <ImageUploader images={images} onChange={setImages} maxFiles={8} />
        </div>

        {/* Step 3: Description */}
        <div className="bg-white rounded-3xl border border-blue-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-blue-100 pb-3">
            <FileText className="w-5 h-5 text-brand-600" />
            <span>تفاصيل ووصف الإعلان</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              الوصف الكامل والمواصفات <span className="text-brand-600">*</span>
            </label>
            <textarea
              required
              rows={6}
              placeholder="اكتب وصفاً مفصلاً يوضح حالة السلعة، الموديل، طريقة الاستلام، وأي ملحقات مرفقة..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-blue-50/40 text-sm rounded-2xl p-4 border border-blue-200 focus:outline-none focus:border-brand-500 font-medium leading-relaxed"
            />
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex justify-end gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-blue-50 text-slate-700 border border-blue-200 font-bold text-sm transition-colors"
          >
            إلغاء
          </Link>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-brand-600 via-blue-600 to-sky-500 hover:from-brand-700 hover:to-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-600/30 transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري حفظ ونشر الإعلان...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>نشر الإعلان الآن</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
