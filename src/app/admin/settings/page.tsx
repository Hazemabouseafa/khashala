'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Megaphone,
  CheckCircle,
  Save,
  Phone,
  Mail,
  Shield,
  Zap,
  Loader2,
  AlertCircle,
  HelpCircle,
  CreditCard,
  Star,
  Copy,
  ExternalLink,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'خُشـاله - Khashala',
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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

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
        setMessage('تم حفظ إعدادات المنصة وبوابة الدفع Paymob بنجاح');
      } else {
        throw new Error(data.error || 'فشل حفظ الإعدادات');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 4000);
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
            <Settings className="w-6 h-6 text-brand-600" />
            <span>إعدادات وتكوين المنصة وبوابة الدفع Paymob</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة تسعير الإعلانات المميزة، بيانات ربط Paymob، سياسة النشر، والشريط الإعلاني
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
                <span>سعر ترقية الإعلان المميز <span className="text-red-500">*</span></span>
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
                    <span className="font-mono text-slate-700 text-[10px] dir-ltr block truncate">{callbackUrl}</span>
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
                    <span className="font-mono text-slate-700 text-[10px] dir-ltr block truncate">{webhookUrl}</span>
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
              <Megaphone className="w-4 h-4 text-brand-600" />
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
              <Phone className="w-3.5 h-3.5 text-brand-600" />
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
              <Mail className="w-3.5 h-3.5 text-brand-600" />
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
            className="px-8 py-3 bg-gradient-to-l from-brand-600 to-blue-600 hover:from-brand-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>حفظ وتطبيق إعدادات المنصة وبوابة Paymob</span>
          </button>
        </div>
      </form>
    </div>
  );
}
