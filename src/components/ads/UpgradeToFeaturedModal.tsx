'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  CheckCircle,
  CreditCard,
  ShieldCheck,
  Loader2,
  Sparkles,
  Zap,
  TrendingUp,
} from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ad: {
    id: string;
    title: string;
    price: number;
    category?: { name: string };
    images?: string[];
  };
  onSuccess?: () => void;
}

export const UpgradeToFeaturedModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  ad,
  onSuccess,
}) => {
  const [paymobConfig, setPaymobConfig] = useState<{
    enabled: boolean;
    price: number;
    currency: string;
    durationDays: number;
    isSandbox: boolean;
  }>({
    enabled: true,
    price: 150,
    currency: 'EGP',
    durationDays: 30,
    isSandbox: true,
  });

  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingConfig(true);
      setError(null);
      fetch('/api/payments/paymob/config')
        .then((res) => res.json())
        .then((data) => {
          setPaymobConfig({
            enabled: data.enabled ?? true,
            price: data.price ?? 150,
            currency: data.currency ?? 'EGP',
            durationDays: data.durationDays ?? 30,
            isSandbox: data.isSandbox ?? true,
          });
        })
        .catch(() => {})
        .finally(() => setIsLoadingConfig(false));
    }
  }, [isOpen]);

  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/payments/paymob/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل بدء عملية الدفع');
      }

      if (data.paymentUrl) {
        // Redirect to Paymob checkout URL
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('لم يتم استلام رابط الدفع من الخادم');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الاتصال ببوابة الدفع');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl border border-blue-200 w-full max-w-lg overflow-hidden shadow-2xl relative"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-l from-amber-500 via-amber-600 to-amber-700 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                <Star className="w-5 h-5 fill-white text-white" />
              </span>
              <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
                ترقية الإعلان المميز VIP
              </span>
            </div>

            <h3 className="text-xl font-black">اجعل إعلانك يظهر في صدارة القسم ⭐</h3>
            <p className="text-xs text-amber-100 mt-1">
              ضاعف فرص البيع واجذب آلاف المشترين عبر تثبيت إعلانك في أول نتائج القسم
            </p>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-5">
            {/* Ad preview chip */}
            <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200/80 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-blue-200">
                <img
                  src={ad.images && ad.images.length > 0 ? ad.images[0] : '/uploads/ads/placeholder.webp'}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-slate-900 truncate">{ad.title}</h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                  <span>القسم: {ad.category?.name || 'عام'}</span>
                </div>
              </div>
            </div>

            {/* Benefits Checklist */}
            <div className="space-y-2.5">
              <span className="text-xs font-black text-slate-800 block">
                مزايا ترقية الإعلان المميز:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-slate-700 text-[11px]">الظهور في أول القسم دائماً</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-bold text-slate-700 text-[11px]">شارة ذهبية مميزة وملفتة</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <TrendingUp className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="font-bold text-slate-700 text-[11px]">مشاهدات أعلى حتى 10 أضعاف</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <Zap className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="font-bold text-slate-700 text-[11px]">مدة التمييز: {paymobConfig.durationDays} يوماً</span>
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-sky-50 rounded-2xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">رسوم الترقية الإجمالية:</span>
                <span className="text-2xl font-black text-slate-900">
                  {paymobConfig.price}{' '}
                  <span className="text-xs text-amber-700 font-bold">{paymobConfig.currency}</span>
                </span>
              </div>
              <div className="text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-xl border border-amber-300 text-[11px] font-bold text-slate-700 shadow-2xs">
                  <CreditCard className="w-3.5 h-3.5 text-brand-600" />
                  <span>دفع آمن عبر Paymob</span>
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold">
                {error}
              </div>
            )}

            {/* Payment Button */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleInitiatePayment}
                disabled={isProcessing || isLoadingConfig}
                className="w-full py-3.5 bg-gradient-to-l from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ الانتقال لبوابة الدفع Paymob...</span>
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 fill-white" />
                    <span>الدفع وترقية الإعلان الآن ({paymobConfig.price} {paymobConfig.currency})</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>دفع إلكتروني فوري ومؤمَّن بالكامل بواسطة بوابة Paymob المعتمَدة</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UpgradeToFeaturedModal;
