'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  FolderPlus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Edit,
  X,
  Save,
} from 'lucide-react';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { AVAILABLE_ICONS } from '@/lib/constants';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedParentFilter, setSelectedParentFilter] = useState<string>('all');

  // 1. New Main Category Form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('Car');
  const [subcategories, setSubcategories] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // 2. New Subcategory Form
  const [parentCatId, setParentCatId] = useState('');
  const [subName, setSubName] = useState('');
  const [subSlug, setSubSlug] = useState('');
  const [subIcon, setSubIcon] = useState('Tag');
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);

  // 3. Edit Modals State
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [editingSub, setEditingSub] = useState<any | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      const cats = data.categories || [];
      setCategories(cats);
      if (cats.length > 0 && !parentCatId) {
        setParentCatId(cats[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!name.trim() || !slug.trim()) {
      setError('يرجى إدخال اسم القسم والرابط المختصر');
      return;
    }

    setIsSubmittingCat(true);
    try {
      const subs = subcategories
        ? subcategories
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          icon,
          subcategories: subs,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل إضافة القسم');
      }

      setMessage('تمت إضافة القسم الرئيسي الجديد بنجاح!');
      setName('');
      setSlug('');
      setSubcategories('');
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إضافة القسم');
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!parentCatId || !subName.trim()) {
      setError('يرجى اختيار القسم الرئيسي وإدخال اسم القسم الفرعي');
      return;
    }

    setIsSubmittingSub(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_subcategory',
          categoryId: parentCatId,
          name: subName.trim(),
          slug: subSlug.trim() || undefined,
          icon: subIcon,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل إضافة القسم الفرعي');
      }

      setMessage(`تمت إضافة القسم الفرعي "${subName}" بنجاح!`);
      setSubName('');
      setSubSlug('');
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إضافة القسم الفرعي');
    } finally {
      setIsSubmittingSub(false);
    }
  };

  const handleSaveCategoryEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit_category',
          id: editingCat.id,
          name: editingCat.name,
          slug: editingCat.slug,
          icon: editingCat.icon,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('تم تعديل القسم الرئيسي بنجاح');
        setEditingCat(null);
        fetchCategories();
      } else {
        alert(data.error || 'فشل التعديل');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSaveSubcategoryEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit_subcategory',
          id: editingSub.id,
          name: editingSub.name,
          slug: editingSub.slug,
          icon: editingSub.icon,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('تم تعديل القسم الفرعي بنجاح');
        setEditingSub(null);
        fetchCategories();
      } else {
        alert(data.error || 'فشل التعديل');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`هل أنت متأكد من حذف القسم الرئيسي "${catName}"؟`)) return;
    try {
      const res = await fetch(`/api/categories?categoryId=${catId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`تم حذف القسم الرئيسي "${catName}"`);
        fetchCategories();
      } else {
        alert(data.error || 'لا يمكن حذف القسم لوجود إعلانات مرتبطة به');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubcategory = async (subId: string, subTitle: string) => {
    if (!confirm(`هل أنت متأكد من حذف القسم الفرعي "${subTitle}"؟`)) return;
    try {
      const res = await fetch(`/api/categories?subcategoryId=${subId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMessage(`تم حذف القسم الفرعي "${subTitle}" بنجاح`);
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const displayedCategories =
    selectedParentFilter === 'all'
      ? categories
      : categories.filter((c) => c.id === selectedParentFilter);

  return (
    <div className="space-y-8">
      {/* Alerts */}
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dual Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form 1: Add Subcategory */}
        <div className="bg-white rounded-3xl border-2 border-brand-200 p-6 shadow-sm space-y-5 relative overflow-hidden">
          <div className="border-b border-blue-100 pb-3.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-[10px] font-black mb-2 border border-brand-200">
              <Sparkles className="w-3 h-3" />
              <span>تصنيف فرعي احترافي</span>
            </div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-brand-600" />
              <span>إضافة قسم فرعي (Subcategory) داخل قسم رئيسي</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              اختر القسم الرئيسي وأضف بداخله قسماً فرعياً بأيقونته الخاصة ليظهر بنفس بطاقة القسم الرئيسي
            </p>
          </div>

          <form onSubmit={handleAddSubcategory} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اختر القسم الرئيسي الأب <span className="text-brand-600">*</span>
              </label>
              <select
                value={parentCatId}
                onChange={(e) => setParentCatId(e.target.value)}
                required
                className="w-full bg-blue-50/50 text-xs rounded-xl px-3.5 py-3 border border-blue-200 focus:outline-none focus:border-brand-500 font-bold text-slate-800 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.subcategories?.length || 0} قسم فرعي)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم القسم الفرعي (بالعربية) <span className="text-brand-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سيارات كهربائية"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full bg-blue-50/40 text-xs rounded-xl px-3.5 py-3 border border-blue-200 focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الرابط المختصر (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: electric-cars"
                  value={subSlug}
                  onChange={(e) => setSubSlug(e.target.value)}
                  className="w-full bg-blue-50/40 text-xs rounded-xl px-3.5 py-3 border border-blue-200 focus:outline-none focus:border-brand-500 font-medium text-left dir-ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                أيقونة القسم الفرعي
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={subIcon}
                  onChange={(e) => setSubIcon(e.target.value)}
                  className="w-full bg-blue-50/40 text-xs rounded-xl px-3.5 py-3 border border-blue-200 focus:outline-none focus:border-brand-500 font-medium cursor-pointer"
                >
                  {AVAILABLE_ICONS.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
                <div className="w-11 h-11 rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CategoryIcon name={subIcon} className="w-5 h-5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingSub}
              className="w-full py-3 bg-gradient-to-l from-brand-600 to-blue-600 hover:from-brand-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmittingSub ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>إضافة القسم الفرعي داخل القسم المختار</span>
            </button>
          </form>
        </div>

        {/* Form 2: Add Main Category */}
        <div className="bg-white rounded-3xl border border-blue-200/80 p-6 shadow-sm space-y-5">
          <div className="border-b border-blue-100 pb-3.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black mb-2">
              <span>قسم رئيسي جديد</span>
            </div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-600" />
              <span>إنشاء قسم رئيسي جديد (Main Category)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              أنشئ قسماً رئيسياً جديداً للمنصة مع إمكانية إدراج أقسام فرعية أولية
            </p>
          </div>

          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم القسم الرئيسي <span className="text-brand-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: قوارب ودراجات مائية"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-blue-50/40 text-xs rounded-xl px-3.5 py-3 border border-blue-200 focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الرابط المختصر (Slug) <span className="text-brand-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: boats-marine"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-blue-50/40 text-xs rounded-xl px-3.5 py-3 border border-blue-200 focus:outline-none focus:border-brand-500 font-medium text-left dir-ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                أيقونة القسم الرئيسي
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-blue-50/40 text-xs rounded-xl px-3.5 py-3 border border-blue-200 focus:outline-none focus:border-brand-500 font-medium cursor-pointer"
                >
                  {AVAILABLE_ICONS.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0 border border-blue-200">
                  <CategoryIcon name={icon} className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                أقسام فرعية أولية (مفصولة بفاصلة ,)
              </label>
              <input
                type="text"
                placeholder="مثال: يخوت, جت سكي, قوارب صيد"
                value={subcategories}
                onChange={(e) => setSubcategories(e.target.value)}
                className="w-full bg-blue-50/40 text-xs rounded-xl px-3.5 py-3 border border-blue-200 focus:outline-none focus:border-brand-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingCat}
              className="w-full py-3 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmittingCat ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>إنشاء القسم الرئيسي</span>
            </button>
          </form>
        </div>
      </div>

      {/* Categories & Subcategories Unified Cards Display */}
      <div className="bg-white rounded-3xl border border-blue-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-600" />
              <span>هيكل الأقسام الرئيسية والأقسام الفرعية ({categories.length} أقسام رئيسية)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              تظهر الأقسام الفرعية بنفس تصميم بطاقات الأقسام الرئيسية تماماً مع إمكانية التعديل السريع
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">عرض قسم:</span>
            <select
              value={selectedParentFilter}
              onChange={(e) => setSelectedParentFilter(e.target.value)}
              className="bg-blue-50 text-xs font-bold text-brand-700 rounded-xl px-3 py-2 border border-blue-200 focus:outline-none"
            >
              <option value="all">جميع الأقسام ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.subcategories?.length || 0})
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="min-h-[20vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {displayedCategories.map((cat) => (
              <div
                key={cat.id}
                className="p-5 sm:p-6 bg-gradient-to-br from-blue-50/70 via-white to-sky-50/50 rounded-3xl border border-blue-200/80 space-y-5 shadow-xs"
              >
                {/* Main Category Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-600/20">
                      <CategoryIcon name={cat.icon} className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-base font-black text-slate-900">{cat.name}</h3>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700">
                          {cat._count?.ads || 0} إعلان
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                          {cat.subcategories?.length || 0} قسم فرعي
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">/{cat.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setEditingCat({ ...cat })}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-blue-50 text-brand-700 border border-blue-200 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="تعديل القسم الرئيسي"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setParentCatId(cat.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة فرعي</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs transition-colors"
                      title="حذف القسم الرئيسي"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subcategories Grid */}
                {cat.subcategories && cat.subcategories.length > 0 ? (
                  <div>
                    <div className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1.5">
                      <span>الأقسام الفرعية التابعة لـ {cat.name}:</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
                      {cat.subcategories.map((sub: any) => (
                        <div
                          key={sub.id}
                          className="group relative flex flex-col items-center p-4 bg-white rounded-2xl border border-blue-100 shadow-xs hover:shadow-md hover:border-brand-300 hover:-translate-y-1 transition-all duration-200 text-center"
                        >
                          {/* Subcategory Action Buttons */}
                          <div className="absolute top-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => setEditingSub({ ...sub })}
                              title="تعديل القسم الفرعي"
                              className="p-1 rounded-lg bg-blue-50 text-brand-700 hover:bg-blue-100"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubcategory(sub.id, sub.name)}
                              title="حذف القسم الفرعي"
                              className="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Identical Category Card Icon Box */}
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center mb-3 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
                            <CategoryIcon name={sub.icon || cat.icon || 'Tag'} className="w-6 h-6" />
                          </div>

                          {/* Subcategory Title */}
                          <h4 className="font-bold text-slate-800 text-xs group-hover:text-brand-600 transition-colors line-clamp-1">
                            {sub.name}
                          </h4>

                          {/* Subcategory Ad Count */}
                          <span className="text-[10px] font-semibold text-slate-400 mt-1">
                            {sub._count?.ads !== undefined
                              ? `${sub._count.ads} إعلان`
                              : 'قسم فرعي'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-slate-400 bg-white/60 rounded-2xl border border-dashed border-blue-200">
                    لا توجد أقسام فرعية مضافة بعد في هذا القسم.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Category Modal */}
      {editingCat && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-blue-200 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                تعديل القسم الرئيسي
              </h3>
              <button
                type="button"
                onClick={() => setEditingCat(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategoryEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم القسم الرئيسي
                </label>
                <input
                  type="text"
                  required
                  value={editingCat.name}
                  onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                  className="w-full bg-blue-50/40 text-xs rounded-xl px-3 py-2.5 border border-blue-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الرابط المختصر (Slug)
                </label>
                <input
                  type="text"
                  required
                  value={editingCat.slug}
                  onChange={(e) => setEditingCat({ ...editingCat, slug: e.target.value })}
                  className="w-full bg-blue-50/40 text-xs rounded-xl px-3 py-2.5 border border-blue-200 text-left dir-ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الأيقونة
                </label>
                <select
                  value={editingCat.icon}
                  onChange={(e) => setEditingCat({ ...editingCat, icon: e.target.value })}
                  className="w-full bg-blue-50/40 text-xs rounded-xl px-3 py-2 border border-blue-200"
                >
                  {AVAILABLE_ICONS.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  {isSavingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>حفظ التعديل</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subcategory Modal */}
      {editingSub && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-blue-200 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                تعديل القسم الفرعي
              </h3>
              <button
                type="button"
                onClick={() => setEditingSub(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubcategoryEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم القسم الفرعي
                </label>
                <input
                  type="text"
                  required
                  value={editingSub.name}
                  onChange={(e) => setEditingSub({ ...editingSub, name: e.target.value })}
                  className="w-full bg-blue-50/40 text-xs rounded-xl px-3 py-2.5 border border-blue-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الرابط المختصر
                </label>
                <input
                  type="text"
                  value={editingSub.slug}
                  onChange={(e) => setEditingSub({ ...editingSub, slug: e.target.value })}
                  className="w-full bg-blue-50/40 text-xs rounded-xl px-3 py-2.5 border border-blue-200 text-left dir-ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الأيقونة
                </label>
                <select
                  value={editingSub.icon || 'Tag'}
                  onChange={(e) => setEditingSub({ ...editingSub, icon: e.target.value })}
                  className="w-full bg-blue-50/40 text-xs rounded-xl px-3 py-2 border border-blue-200"
                >
                  {AVAILABLE_ICONS.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSub(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  {isSavingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>حفظ التعديل</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
