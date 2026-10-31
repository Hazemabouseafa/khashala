'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Settings,
  Megaphone,
  CheckCircle,
  Save,
  Phone,
  Mail,
  Zap,
  Loader2,
  AlertCircle,
  CreditCard,
  Star,
  Copy,
  Palette,
  Upload,
  RotateCcw,
  Image as ImageIcon,
} from 'lucide-react';
import { useBranding } from '@/components/providers/BrandingProvider';
import { KhashalaLogo } from '@/components/ui/KhashalaLogo';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

const ICON_COLOR_PRESETS = [
  { label: 'أحمر مع أرضية بيضاء', iconColor: '#dc2626', iconBgColor: '#ffffff' },
  { label: 'قرمزي مع أرضية بيضاء', iconColor: '#e11d48', iconBgColor: '#ffffff' },
  { label: 'أزرق ملكي مع أرضية بيضاء', iconColor: '#2563eb', iconBgColor: '#ffffff' },
  { label: 'أزرق مع أرضية سماوية', iconColor: '#2563eb', iconBgColor: '#eff6ff' },
  { label: 'أخضر زمردي مع أرضية بيضاء', iconColor: '#059669', iconBgColor: '#ffffff' },
  { label: 'برتقالي مع أرضية بيضاء', iconColor: '#ea580c', iconBgColor: '#ffffff' },
  { label: 'بنفسجي مع أرضية بيضاء', iconColor: '#7c3aed', iconBgColor: '#ffffff' },
  { label: 'كحلي فخم مع أرضية بيضاء', iconColor: '#0f172a', iconBgColor: '#ffffff' },
];

const PREVIEW_CATEGORIES = [
  { name: 'سيارات ومركبات', icon: 'Car' },
  { name: 'عقارات', icon: 'Building2' },
  { name: 'إلكترونيات', icon: 'Smartphone' },
  { name: 'أثاث وديكور', icon: 'Sofa' },
  { name: 'أزياء وموضة', icon: 'Shirt' },
  { name: 'وظائف', icon: 'Briefcase' },
];

export default function AdminSettingsPage() {
  const { updateBranding } = useBranding();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [settings, setSettings] = useState({
    siteName: 'خُشـاله - Khashala',
    siteLogoUrl: '',
    iconColor: '#dc2626',
    iconBgColor: '#ffffff',
    supportEmail: 'support@khashala.com',
    supportPhone: '+966500000001',
    autoApproveAds: 'false',
    announcementActive: 'true',
    announcementText: 'مرحباً بكم في منصة خُشـاله! تم إطلاق الهوية الجديدة ومميزات الترقية وتمييز الإعلانات 🚀',
    maintenanceMode: 'false',
    // Paymob Payment Gateway & Featured Ads Pricing
    paymobEnabled: 'true',
    featuredAdPrice: '150',
    featuredAdCurrency: 'EGP',
    featuredDurationDays: '30',
    paymobApiKey: '',
    paymobIntegrationId: '',
    paymobIframeId: '',
    paymobHmac: '',
    paymobSandbox: 'true',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings((prev) => ({
            ...prev,
            ...data.settings,
            iconColor: data.settings.iconColor || prev.iconColor,
            iconBgColor: data.settings.iconBgColor || prev.iconBgColor,
          }));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const res = await fetch('/api/admin/logo', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل رفع الشعار');
      }

      const newLogoUrl = data.logoUrl || '';
      setSettings((prev) => ({ ...prev, siteLogoUrl: newLogoUrl }));
      updateBranding({ siteLogoUrl: newLogoUrl });
      window.dispatchEvent(new Event('khashala_branding_updated'));
      setMessage('تم رفع وتحديث شعار المنصة بنجاح في جميع الصفحات!');
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء رفع الشعار');
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResetLogo = () => {
    setSettings((prev) => ({ ...prev, siteLogoUrl: '' }));
    updateBranding({ siteLogoUrl: '' });
  };

  const handleColorChange = (field: 'iconColor' | 'iconBgColor', val: string) => {
    setSettings((prev) => {
      const next = { ...prev, [field]: val };
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        updateBranding({
          iconColor: next.iconColor,
          iconBgColor: next.iconBgColor,
        });
      }
      return next;
    });
  };

  const applyColorPreset = (iconColor: string, iconBgColor: string) => {
    setSettings((prev) => ({ ...prev, iconColor, iconBgColor }));
    updateBranding({ iconColor, iconBgColor });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (res.ok) {
        updateBranding({
          siteLogoUrl: settings.siteLogoUrl,
          iconColor: settings.iconColor,
          iconBgColor: settings.iconBgColor,
        });
        window.dispatchEvent(new Event('khashala_branding_updated'));
        setMessage('تم حفظ وتطبيق الهوية البصرية (اللوجو وألوان الأيقونات) وإعدادات المنصة بنجاح!');
      } else {
        throw new Error(data.error || 'فشل حفظ الإعدادات');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 4500);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(label);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://khashala.com';
  const callbackUrl = `${currentOrigin}/api/payments/paymob/callback`;
  const webhookUrl = `${currentOrigin}/api/payments/paymob/webhook`;

  return (
    <div className="bg-white rounded-3xl border border-blue-200/90 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 platform-icon-tint" />
            <span>الهوية البصرية وإعدادات المنصة وبوابة الدفع</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تحكم كامل في لوجو المنصة، ألوان الأيقونات وأرضيتها، بوابة Paymob، والشريط الإعلاني
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Quick Shortcut to Homepage Posters Studio */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-l from-[#111827] to-[#1f2937] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e00000] flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black">
                بوسترات وبنرات الصفحة الرئيسية المتحركة
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                أضف بوسترات جديدة، ارفع صورك الخاصة، وعدّل الكتابة والأزرار والروابط من استوديو البوسترات المخصص
              </p>
            </div>
          </div>
          <Link
            href="/admin/banners"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#e00000] hover:bg-[#c20000] text-white text-xs font-extrabold transition-colors shrink-0"
          >
            فتح استوديو البوسترات ←
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 0: VISUAL BRANDING STUDIO (LOGO UPLOADER + ICON COLORS) */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-rose-50/50 via-white to-blue-50/60 border-2 border-blue-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl platform-icon-box flex items-center justify-center shrink-0">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>تخصيص الهوية البصرية (تغيير اللوجو وألوان الأيقونات)</span>
                  <span className="text-[10px] bg-blue-100 text-brand-800 font-black px-2.5 py-0.5 rounded-full">
                    معاينة فورية حية
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  غيّر شعار المنصة الرسمي ولون الأيقونات ولون أرضيتها ليتم تطبيقهما في كامل الموقع فوراً
                </p>
              </div>
            </div>
          </div>

          {/* Part A: Platform Logo Upload & Preview */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 platform-icon-tint" />
                  <span>شعار المنصة الرسمي (Logo)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ارفع صورة شفافـة (PNG / WebP / SVG) وسيتم الحفاظ على شفافيتها وتحديث الهيدر والفوتر تلقائياً
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/webp,image/svg+xml,image/jpeg"
                  onChange={handleLogoFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isUploadingLogo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>رفع لوجو جديد من جهازك</span>
                </button>

                {settings.siteLogoUrl && (
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>استعادة اللوجو الافتراضي</span>
                  </button>
                )}
              </div>
            </div>

            {/* Dual Preview Boxes (Light & Dark) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col items-center justify-center min-h-[110px]">
                <span className="text-[10px] font-bold text-slate-400 mb-2">
                  معاينة اللوجو على الخلفية الفاتحة (الهيدر)
                </span>
                <KhashalaLogo
                  size="md"
                  theme="dark"
                  asLink={false}
                  overrideSrc={settings.siteLogoUrl}
                />
              </div>

              <div className="rounded-2xl border border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 p-4 flex flex-col items-center justify-center min-h-[110px]">
                <span className="text-[10px] font-bold text-blue-200/70 mb-2">
                  معاينة اللوجو على الخلفية الداكنة (الفوتر والإدارة)
                </span>
                <KhashalaLogo
                  size="md"
                  theme="light"
                  asLink={false}
                  overrideSrc={settings.siteLogoUrl}
                />
              </div>
            </div>

            {/* Optional Direct Logo URL */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                أو أدخل رابط مباشر لصورة اللوجو (اختياري — اتركه فارغاً لاستخدام اللوجو المرفوع أو الافتراضي):
              </label>
              <input
                type="text"
                placeholder="https://example.com/my-logo.png"
                value={settings.siteLogoUrl.startsWith('data:') ? '' : settings.siteLogoUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  setSettings((prev) => ({ ...prev, siteLogoUrl: val }));
                  updateBranding({ siteLogoUrl: val });
                }}
                className="w-full bg-slate-50 text-xs font-mono rounded-xl px-3.5 py-2 border border-slate-200 focus:outline-none focus:border-brand-500 text-left dir-ltr"
              />
              {settings.siteLogoUrl.startsWith('data:') && (
                <p className="text-[11px] text-emerald-700 font-bold mt-1">
                  ✓ يتم حالياً استخدام ملف الشعار المخصص المرفوع من جهازك (محفوظ بدقة عالية وشفافية كاملة).
                </p>
              )}
            </div>
          </div>

          {/* Part B: Platform Icon Color & Icon Background Color */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-4">
            <div>
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 platform-icon-tint" />
                <span>تخصيص لون الأيقونات ولون أرضيتها في المنصة</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                اختر لون الأيقونة ولون الأرضية (مثال: أيقونات حمراء مع أرضية بيضاء) أو اختر من القوالب السريعة الجاهزة
              </p>
            </div>

            {/* Quick One-Click Color Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">
                ثيمات سريعة بنقرة واحدة:
              </span>
              <div className="flex flex-wrap gap-2">
                {ICON_COLOR_PRESETS.map((preset) => {
                  const isActivePreset =
                    settings.iconColor.toLowerCase() === preset.iconColor.toLowerCase() &&
                    settings.iconBgColor.toLowerCase() === preset.iconBgColor.toLowerCase();
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyColorPreset(preset.iconColor, preset.iconBgColor)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isActivePreset
                          ? 'border-brand-600 bg-blue-50/80 text-slate-900 ring-2 ring-brand-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-md border border-slate-300 flex items-center justify-center shadow-2xs"
                        style={{ backgroundColor: preset.iconBgColor }}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: preset.iconColor }}
                        />
                      </span>
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-black text-slate-800 block">
                    لون الأيقونات (Icon Color)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    لون رسمة الأيقونة نفسها في الأقسام والمنصة
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={settings.iconColor}
                    onChange={(e) => handleColorChange('iconColor', e.target.value)}
                    className="w-24 bg-white text-xs font-mono font-bold rounded-lg px-2.5 py-1.5 border border-slate-300 text-center dir-ltr"
                  />
                  <input
                    type="color"
                    value={
                      /^#[0-9a-fA-F]{6}$/.test(settings.iconColor)
                        ? settings.iconColor
                        : '#dc2626'
                    }
                    onChange={(e) => handleColorChange('iconColor', e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-black text-slate-800 block">
                    لون أرضية الأيقونات (Background)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    لون المربع/الأرضية الخلفية الحاضنة للأيقونة
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={settings.iconBgColor}
                    onChange={(e) => handleColorChange('iconBgColor', e.target.value)}
                    className="w-24 bg-white text-xs font-mono font-bold rounded-lg px-2.5 py-1.5 border border-slate-300 text-center dir-ltr"
                  />
                  <input
                    type="color"
                    value={
                      /^#[0-9a-fA-F]{6}$/.test(settings.iconBgColor)
                        ? settings.iconBgColor
                        : '#ffffff'
                    }
                    onChange={(e) => handleColorChange('iconBgColor', e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Live Horizontal Preview of Category Icons */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-100/70 via-blue-50/70 to-sky-100/70 border border-blue-200/80 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-700 block">
                معاينة حية لشكل الأيقونات في شريط الأقسام الأفقي على الموبايل والكمبيوتر:
              </span>
              <div className="flex items-center flex-nowrap overflow-x-auto no-scrollbar gap-3 pb-1">
                {PREVIEW_CATEGORIES.map((item) => (
                  <div
                    key={item.name}
                    className="shrink-0 w-[104px] bg-white rounded-2xl border border-blue-200/80 p-3 flex flex-col items-center text-center shadow-2xs"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2 border border-slate-900/10 shadow-2xs transition-colors"
                      style={{
                        backgroundColor: settings.iconBgColor,
                        color: settings.iconColor,
                      }}
                    >
                      <CategoryIcon name={item.icon} className="w-6 h-6 stroke-[1.9]" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 line-clamp-1">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: PAYMOB PAYMENT GATEWAY & FEATURED ADS PRICING */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-50/70 via-sky-50/40 to-blue-50/70 border-2 border-amber-300/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/70 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shrink-0 shadow-md">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>بوابة الدفع Paymob & تمييز الإعلانات في أول القسم</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-black px-2 py-0.5 rounded-full">
                    ميزة VIP
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  يتيح للمستخدمين ترقية إعلاناتهم لتظهر دائماً في المرتبة الأولى في القسم وتثبيت الشارة الذهبية
                </p>
              </div>
            </div>

            {/* Toggle Enable Paymob */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none bg-white px-3.5 py-2 rounded-xl border border-amber-300 shadow-2xs">
              <input
                type="checkbox"
                checked={settings.paymobEnabled === 'true'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    paymobEnabled: e.target.checked ? 'true' : 'false',
                  })
                }
                className="w-4 h-4 accent-amber-600 rounded"
              />
              <span className="text-xs font-black text-slate-800">تفعيل بوابة Paymob</span>
            </label>
          </div>

          {/* Pricing Settings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Featured Ad Price */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>
                  سعر ترقية الإعلان المميز <span className="text-red-500">*</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  required
                  value={settings.featuredAdPrice}
                  onChange={(e) =>
                    setSettings({ ...settings, featuredAdPrice: e.target.value })
                  }
                  className="w-full bg-white text-sm font-black rounded-xl pr-3 pl-12 py-2.5 border border-amber-300 focus:outline-none focus:border-brand-500 text-slate-900 shadow-2xs"
                />
                <span className="absolute left-3 top-2.5 text-xs font-black text-amber-700 pointer-events-none">
                  {settings.featuredAdCurrency}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">المبلغ المطلوب من المستخدم لكل إعلان</p>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                عملة الدفع
              </label>
              <select
                value={settings.featuredAdCurrency}
                onChange={(e) =>
                  setSettings({ ...settings, featuredAdCurrency: e.target.value })
                }
                className="w-full bg-white text-xs font-bold rounded-xl px-3 py-2.5 border border-amber-300 focus:outline-none focus:border-brand-500 text-slate-900 shadow-2xs"
              >
                <option value="EGP">جنيه مصري (EGP)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="AED">درهم إماراتي (AED)</option>
                <option value="KWD">دينار كويتي (KWD)</option>
                <option value="USD">دولار أمريكي (USD)</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1">العملة المسجلة في حساب Paymob الخاص بك</p>
            </div>

            {/* Featured Duration */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                مدة التمييز (بالأيام)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={settings.featuredDurationDays}
                onChange={(e) =>
                  setSettings({ ...settings, featuredDurationDays: e.target.value })
                }
                className="w-full bg-white text-xs font-bold rounded-xl px-3 py-2.5 border border-amber-300 focus:outline-none focus:border-brand-500 text-slate-900 shadow-2xs"
              />
              <p className="text-[10px] text-slate-500 mt-1">مدة بقاء الإعلان في صدارة القسم (افتراضي 30 يوماً)</p>
            </div>
          </div>

          {/* Paymob API Credentials */}
          <div className="space-y-3 pt-2 border-t border-amber-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">بيانات الربط والاعتماد من حساب Paymob:</span>

              {/* Sandbox Toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={settings.paymobSandbox === 'true'}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymobSandbox: e.target.checked ? 'true' : 'false',
                    })
                  }
                  className="w-3.5 h-3.5 accent-brand-600 rounded"
                />
                <span>وضع التجربة (Sandbox Test Mode)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Paymob API Key */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Paymob API Key (المفتاح السري)
                </label>
                <input
                  type="password"
                  placeholder="ZXlKaGJHY2lPaUpTVXpVeE1pSXNJbi..."
                  value={settings.paymobApiKey}
                  onChange={(e) =>
                    setSettings({ ...settings, paymobApiKey: e.target.value })
                  }
                  className="w-full bg-white text-xs font-mono rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-brand-500 text-left dir-ltr"
                />
              </div>

              {/* Paymob Integration ID */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Card Integration ID (معرف وسيلة الدفع)
                </label>
                <input
                  type="text"
                  placeholder="مثال: 4192842"
                  value={settings.paymobIntegrationId}
                  onChange={(e) =>
                    setSettings({ ...settings, paymobIntegrationId: e.target.value })
                  }
                  className="w-full bg-white text-xs font-mono rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-brand-500 text-left dir-ltr"
                />
              </div>

              {/* Paymob Iframe ID */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Iframe ID (معرف إطار الدفع - اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: 843921"
                  value={settings.paymobIframeId}
                  onChange={(e) =>
                    setSettings({ ...settings, paymobIframeId: e.target.value })
                  }
                  className="w-full bg-white text-xs font-mono rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-brand-500 text-left dir-ltr"
                />
              </div>

              {/* Paymob HMAC Secret */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  HMAC Secret (لتأمين Webhook - اختياري)
                </label>
                <input
                  type="password"
                  placeholder="1234ABCD5678EFGH..."
                  value={settings.paymobHmac}
                  onChange={(e) =>
                    setSettings({ ...settings, paymobHmac: e.target.value })
                  }
                  className="w-full bg-white text-xs font-mono rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-brand-500 text-left dir-ltr"
                />
              </div>
            </div>

            {/* Paymob Dashboard URLs helper */}
            <div className="bg-white/90 p-3.5 rounded-2xl border border-amber-200 text-xs space-y-2 mt-2">
              <span className="font-bold text-slate-700 block">
                روابط الربط التي يجب نسخها في لوحة تحكم Paymob الخاصة بك:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="truncate pr-1">
                    <span className="font-bold text-slate-500 block">Transaction Response Callback:</span>
                    <span className="font-mono text-slate-700 text-[10px] dir-ltr block truncate">
                      {callbackUrl}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(callbackUrl, 'callback')}
                    className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors shrink-0"
                    title="نسخ الرابط"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="truncate pr-1">
                    <span className="font-bold text-slate-500 block">Transaction Processed Webhook:</span>
                    <span className="font-mono text-slate-700 text-[10px] dir-ltr block truncate">
                      {webhookUrl}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                    className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors shrink-0"
                    title="نسخ الرابط"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {copiedUrl && (
                <span className="text-[10px] font-bold text-emerald-600 block text-left dir-ltr">
                  ✓ Copied to clipboard!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: PLATFORM ANNOUNCEMENT BAR */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 platform-icon-tint" />
              <span>الشريط الإعلاني العلوي العام للموقع</span>
            </h3>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <span>تفعيل الشريط</span>
              <input
                type="checkbox"
                checked={settings.announcementActive === 'true'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcementActive: e.target.checked ? 'true' : 'false',
                  })
                }
                className="w-4 h-4 accent-brand-600 rounded"
              />
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              نص الإعلان أو التنبيه (يظهر أعلى الهيدر لجميع الزوار)
            </label>
            <input
              type="text"
              value={settings.announcementText}
              onChange={(e) =>
                setSettings({ ...settings, announcementText: e.target.value })
              }
              className="w-full bg-white text-xs rounded-xl px-3.5 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-medium"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: ADS APPROVAL POLICY */}
        {/* ========================================================================= */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <strong className="text-xs text-slate-900 block flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>سياسة مراجعة ونشر الإعلانات</span>
              </strong>
              <p className="text-[11px] text-slate-500 mt-0.5">
                عند التفعيل، يتم نشر إعلانات المستخدمين فورياً دون الحاجة لموافقة المشرف اليدوية
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <span>نشر تلقائي فوري</span>
              <input
                type="checkbox"
                checked={settings.autoApproveAds === 'true'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    autoApproveAds: e.target.checked ? 'true' : 'false',
                  })
                }
                className="w-4 h-4 accent-emerald-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: CONTACT & SUPPORT */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 platform-icon-tint" />
              <span>رقم واتساب الدعم الفني المعتمد</span>
            </label>
            <input
              type="text"
              value={settings.supportPhone}
              onChange={(e) =>
                setSettings({ ...settings, supportPhone: e.target.value })
              }
              className="w-full bg-blue-50/40 text-xs rounded-xl px-3.5 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-mono text-left dir-ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 platform-icon-tint" />
              <span>البريد الإلكتروني الرسمي للدعم</span>
            </label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) =>
                setSettings({ ...settings, supportEmail: e.target.value })
              }
              className="w-full bg-blue-50/40 text-xs rounded-xl px-3.5 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-medium text-left dir-ltr"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 5: MAINTENANCE MODE */}
        {/* ========================================================================= */}
        <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 flex items-center justify-between">
          <div>
            <strong className="text-xs text-rose-950 block">وضع الصيانة (Maintenance Mode)</strong>
            <p className="text-[11px] text-rose-700 mt-0.5">
              إغلاق المنصة مؤقتاً أمام الزوار لإجراء تحديثات مهمة مع إتاحة لوحة الإدارة فقط للمشرفين
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-900">
            <span>تفعيل الصيانة</span>
            <input
              type="checkbox"
              checked={settings.maintenanceMode === 'true'}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maintenanceMode: e.target.checked ? 'true' : 'false',
                })
              }
              className="w-4 h-4 accent-rose-600 rounded"
            />
          </label>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-gradient-to-l from-brand-600 to-blue-600 hover:from-brand-700 hover:to-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>حفظ وتطبيق الهوية البصرية وإعدادات المنصة</span>
          </button>
        </div>
      </form>
    </div>
  );
}
