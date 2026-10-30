import React from 'react';
import Link from 'next/link';
import { ShieldCheck, HeartHandshake, CheckCircle2, Mail } from 'lucide-react';
import { KhashalaLogo } from '@/components/ui/KhashalaLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-navy-900 to-navy-950 text-blue-100/80 mt-auto border-t border-blue-900/60">
      {/* Trust & Safety Banner */}
      <div className="border-b border-white/10 bg-navy-800/70 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 border border-sky-400/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">إعلانات مفحوصة وموثوقة</h4>
              <p className="text-xs text-blue-200/70">فريق مراجعة متخصص للتحقق من سلامة وجودة المحتوى</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/20">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">تواصل مباشر بدون وسيط</h4>
              <p className="text-xs text-blue-200/70">تحدث مع البائعين مباشرة عبر الهاتف أو واتساب السريع</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">سرعة وسهولة النشر</h4>
              <p className="text-xs text-blue-200/70">انشر إعلانك في دقائق معدودة مع ضغط الصور الفوري WebP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info with New Official Logo */}
          <div className="space-y-4">
            <KhashalaLogo size="md" theme="light" />
            <p className="text-xs text-blue-200/70 leading-relaxed">
              المنصة العربية الرائدة للإعلانات المبوبة في 22 دولة عربية. نربط البائعين والمشترين في كل مكان لبيع وشراء السيارات، العقارات، الأجهزة، والأثاث بكل سلاسة وموثوقية.
            </p>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">أشهر الأقسام</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/ads?category=vehicles" className="hover:text-sky-300 transition-colors">
                  سيارات ومركبات للبيع
                </Link>
              </li>
              <li>
                <Link href="/ads?category=real-estate" className="hover:text-sky-300 transition-colors">
                  شقق وعقارات للإيجار والبيع
                </Link>
              </li>
              <li>
                <Link href="/ads?category=electronics" className="hover:text-sky-300 transition-colors">
                  جوالات وإلكترونيات حديثة
                </Link>
              </li>
              <li>
                <Link href="/ads?category=furniture" className="hover:text-sky-300 transition-colors">
                  أثاث منزلي ومفروشات
                </Link>
              </li>
              <li>
                <Link href="/ads?category=jobs" className="hover:text-sky-300 transition-colors">
                  وظائف وفرص عمل
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/ads/create" className="hover:text-sky-300 transition-colors">
                  أضف إعلان مجاني
                </Link>
              </li>
              <li>
                <Link href="/ads" className="hover:text-sky-300 transition-colors">
                  تصفح جميع الإعلانات
                </Link>
              </li>
              <li>
                <Link href="/ads?favorites=true" className="hover:text-sky-300 transition-colors">
                  إعلاناتي المفضلة
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-sky-300 transition-colors">
                  لوحة تحكم إعلاناتي
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-sky-300 transition-colors">
                  بوابة الإدارة (Admin)
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Help */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">إرشادات الأمان</h4>
            <p className="text-xs text-blue-200/70 leading-relaxed mb-3">
              احرص دائماً على مقابلة البائع في مكان عام، وفحص السلعة جيداً قبل إتمام عملية الدفع. تجنب تحويل الأموال قبل الاستلام.
            </p>
            <div className="flex items-center gap-2 text-xs text-sky-300">
              <Mail className="w-4 h-4" />
              <span>support@khashala.com</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-900/80 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-300/60 gap-4">
          <p>© {new Date().getFullYear()} خشاله (Khashala). جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-1">
            <span>مدعوم بتقنيات Next.js و Tailwind CSS و Sharp و Framer Motion</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
