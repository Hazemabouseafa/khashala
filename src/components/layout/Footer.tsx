import React from 'react';
import Link from 'next/link';
import { ShieldCheck, PhoneCall, CheckCircle2, Mail, MapPin } from 'lucide-react';
import { KhashalaLogo } from '@/components/ui/KhashalaLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-slate-600 mt-auto border-t border-slate-200 pb-20 md:pb-0">
      {/* Upper Marketplace Value Strip */}
      <div className="bg-[#f2f4f5] border-b border-slate-200/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full platform-icon-box flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">سوق موثوق وآمن</h4>
              <p className="text-xs text-slate-500">مراجعة مستمرة للإعلانات لضمان أفضل تجربة بيع وشراء</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full platform-icon-box flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">تواصل مباشر بدون عمولة</h4>
              <p className="text-xs text-slate-500">اتصال هاتفي أو محادثة فورية عبر واتساب مع المعلن مباشرة</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full platform-icon-box flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">انشر إعلانك في 60 ثانية</h4>
              <p className="text-xs text-slate-500">أضف صورك وتفاصيل سلعتك مجاناً أو ميّز إعلانك في الصدارة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Directory Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <KhashalaLogo size="md" theme="dark" />
            <p className="text-xs text-slate-500 leading-relaxed">
              خشاله — منصتك الأولى للبيع والشراء في جميع المدن والدول العربية. سيارات، عقارات، موبايلات، أثاث، وظائف وخدمات في مكان واحد.
            </p>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3.5">
              الأقسام الأكثر طلباً
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-600">
              <li>
                <Link href="/ads?category=vehicles" className="hover:text-[#e00000] transition-colors">
                  سيارات ومركبات للبيع
                </Link>
              </li>
              <li>
                <Link href="/ads?category=real-estate" className="hover:text-[#e00000] transition-colors">
                  عقارات للبيع والإيجار
                </Link>
              </li>
              <li>
                <Link href="/ads?category=electronics" className="hover:text-[#e00000] transition-colors">
                  موبايلات وإلكترونيات
                </Link>
              </li>
              <li>
                <Link href="/ads?category=furniture" className="hover:text-[#e00000] transition-colors">
                  أثاث وديكور منزلي
                </Link>
              </li>
              <li>
                <Link href="/ads?category=jobs" className="hover:text-[#e00000] transition-colors">
                  وظائف شاغرة
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Cities */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3.5">
              أبرز المدن النشطة
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-600">
              {['القاهرة', 'الإسكندرية', 'الرياض', 'جدة', 'دبي', 'مدينة الكويت'].map((city) => (
                <li key={city}>
                  <Link
                    href={`/ads?city=${encodeURIComponent(city)}`}
                    className="inline-flex items-center gap-1 hover:text-[#e00000] transition-colors"
                  >
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>إعلانات {city}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account & Links */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3.5">
              حسابي والخدمات
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-600">
              <li>
                <Link href="/ads/create" className="hover:text-[#e00000] transition-colors">
                  أضف إعلانك مجاناً
                </Link>
              </li>
              <li>
                <Link href="/ads?isFeatured=true" className="hover:text-[#e00000] transition-colors">
                  الإعلانات المميزة
                </Link>
              </li>
              <li>
                <Link href="/ads?favorites=true" className="hover:text-[#e00000] transition-colors">
                  المفضلة المحفوظة
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#e00000] transition-colors">
                  إدارة إعلاناتي
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#e00000] transition-colors">
                  لوحة تحكم الإدارة
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Safety */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3.5">
              الدعم والأمان
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              قابل البائع دائماً في مكان عام وعاين السلعة جيداً قبل الدفع، ولا تحوّل أي مبالغ مقدماً.
            </p>
            <a
              href="mailto:support@khashala.com"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-[#e00000]"
            >
              <Mail className="w-3.5 h-3.5 platform-icon-tint" />
              <span>support@khashala.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="bg-[#1f2937] text-slate-300 py-4 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold">© {new Date().getFullYear()} خشاله (Khashala) — جميع الحقوق محفوظة.</p>
          <p className="text-slate-400 text-[11px]">منصة الإعلانات المبوبة العربية المتكاملة</p>
        </div>
      </div>
    </footer>
  );
};
