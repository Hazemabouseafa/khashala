'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, ArrowLeft, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import KhashalaLogo from '@/components/ui/KhashalaLogo';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!acceptTerms) {
      setError('يرجى الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة');
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل إنشاء الحساب');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
        
        {/* Header with Brand Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <KhashalaLogo size="md" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            إنشاء حساب جديد في خشاله
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            انضم الآن إلى أكبر منصة إعلانات مبوبة عربية حديثة
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الاسم الكامل <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="سعود المنصور"
                className="w-full bg-slate-50 text-sm rounded-xl pr-10 pl-4 py-3 border border-slate-200 focus:outline-none focus:border-brand-500 focus:bg-white font-medium transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-50 text-sm rounded-xl pr-10 pl-4 py-3 border border-slate-200 focus:outline-none focus:border-brand-500 focus:bg-white font-medium transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              رقم الجوال (للتواصل وواتساب المشترين)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+966 50 123 4567"
                className="w-full bg-slate-50 text-sm rounded-xl pr-10 pl-4 py-3 border border-slate-200 focus:outline-none focus:border-brand-500 focus:bg-white font-medium transition-all text-left dir-ltr"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              كلمة المرور (6 أحرف على الأقل) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 text-sm rounded-xl pr-10 pl-11 py-3 border border-slate-200 focus:outline-none focus:border-brand-500 focus:bg-white font-medium transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Accept Terms */}
          <div className="pt-1">
            <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer select-none leading-relaxed">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 mt-0.5"
              />
              <span>
                أوافق على{' '}
                <span className="font-bold text-brand-600">شروط الاستخدام</span>{' '}
                و{' '}
                <span className="font-bold text-brand-600">سياسة الخصوصية</span>
              </span>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>إنشاء الحساب مجاناً</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>بياناتك محمية ومشفرة ولا يتم مشاركتها مع أطراف خارجية</span>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            لديك حساب بالفعل؟{' '}
            <Link
              href="/auth/login"
              className="font-bold text-brand-600 hover:text-brand-700 hover:underline"
            >
              تسجيل الدخول
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
