'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  LayoutDashboard,
  CheckSquare,
  Layers,
  Users,
  Home,
  ShieldCheck,
  Loader2,
  PlusCircle,
  AlertTriangle,
  BarChart3,
  Settings,
  History,
} from 'lucide-react';
import { KhashalaLogo } from '@/components/ui/KhashalaLogo';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingReportsCount, setPendingReportsCount] = useState<number>(0);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setUser(data.user || null);

        // Fetch reports count for badge
        if (data.user?.role === 'ADMIN') {
          const repRes = await fetch('/api/reports?status=PENDING').catch(() => null);
          if (repRes && repRes.ok) {
            const repData = await repRes.json();
            setPendingReportsCount(repData.reports?.length || 0);
          }
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdmin();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-sm font-bold text-slate-600">جاري التحقق من صلاحيات الإشراف...</p>
      </div>
    );
  }

  // Role Protection Guard
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-blue-200 text-center shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-slate-900 mb-2">
          منطقة محظورة - للمشرفين فقط
        </h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          عذراً، هذه الصفحة مخصصة فقط لمدراء منصة خشاله. يرجى تسجيل الدخول بحساب مشرف للمتابعة.
        </p>
        <Link
          href="/auth/login?redirect=/admin"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md"
        >
          <span>تسجيل الدخول كمسؤول</span>
        </Link>
      </div>
    );
  }

  const navItems = [
    { name: 'لوحة الإحصائيات العامة', href: '/admin', icon: LayoutDashboard },
    { name: 'فلترة ومراجعة الإعلانات', href: '/admin/ads', icon: CheckSquare },
    { name: 'الأقسام والأقسام الفرعية', href: '/admin/categories', icon: Layers },
    { name: 'إدارة المستخدمين والحظر', href: '/admin/users', icon: Users },
    {
      name: 'مركز البلاغات والمخالفات',
      href: '/admin/reports',
      icon: AlertTriangle,
      badge: pendingReportsCount > 0 ? pendingReportsCount : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    { name: 'التحليلات وإحصائيات النشاط', href: '/admin/analytics', icon: BarChart3 },
    { name: 'الهوية البصرية وإعدادات المنصة', href: '/admin/settings', icon: Settings },
    { name: 'سجل تدقيق المشرفين', href: '/admin/logs', icon: History },
  ];

  return (
    <div className="min-h-[85vh] border-t border-blue-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Admin Header Banner */}
        <div className="bg-gradient-to-l from-navy-950 via-navy-900 to-brand-800 rounded-3xl p-6 text-white mb-8 shadow-xl border border-blue-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <KhashalaLogo size="md" variant="full" theme="light" asLink={false} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black">لوحة تحكم خُشاله الشاملة (Enterprise Admin)</h1>
                <span className="text-[10px] bg-sky-400/20 text-sky-200 border border-sky-400/30 font-bold px-2.5 py-0.5 rounded-full">
                  صلاحيات المشرف العام
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-1">
                مرحباً بك {user.name} • تحكم كامل في الإعلانات، المستخدمين، البلاغات، التحليلات، وإعدادات المنصة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/ads/create"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>نشر إعلان</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors border border-white/10"
            >
              <Home className="w-4 h-4" />
              <span>زيارة الموقع</span>
            </Link>
          </div>
        </div>

        {/* Main Grid: Sidebar + Admin Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Admin Sidebar Navigation */}
          <aside className="lg:col-span-3">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-blue-200/80 p-4 shadow-sm space-y-1 sticky top-28">
              <div className="px-3 py-2 text-[11px] font-black text-blue-900/60 uppercase tracking-wider">
                وحدات الإدارة والتحكم
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-l from-brand-600 to-blue-600 text-white shadow-md shadow-brand-600/20'
                        : 'text-slate-700 hover:bg-blue-50/80 hover:text-brand-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-white' : 'text-brand-600'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* Admin Content Area */}
          <main className="lg:col-span-9">{children}</main>

        </div>
      </div>
    </div>
  );
}
