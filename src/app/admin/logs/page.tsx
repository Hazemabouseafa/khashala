'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  ShieldCheck,
  UserCheck,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  Settings,
  FolderPlus,
  Loader2,
  Calendar,
} from 'lucide-react';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/logs?limit=100')
      .then((res) => res.json())
      .then((data) => setLogs(data.logs || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const getActionBadge = (action: string) => {
    if (action.includes('APPROVE')) {
      return { icon: CheckCircle, label: 'موافقة وتفعيل', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
    if (action.includes('REJECT')) {
      return { icon: XCircle, label: 'رفض إعلان', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    }
    if (action.includes('DELETE')) {
      return { icon: Trash2, label: 'حذف عنصر', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    }
    if (action.includes('FEATURE')) {
      return { icon: Star, label: 'تمييز إعلان ⭐', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    }
    if (action.includes('BAN')) {
      return { icon: ShieldCheck, label: 'حظر مستخدم', color: 'bg-rose-900 text-white border-rose-900' };
    }
    if (action.includes('CATEGORY') || action.includes('SUBCATEGORY')) {
      return { icon: FolderPlus, label: 'إدارة الأقسام', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
    if (action.includes('SETTINGS')) {
      return { icon: Settings, label: 'تعديل الإعدادات', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    }
    return { icon: History, label: action, color: 'bg-slate-100 text-slate-800 border-slate-200' };
  };

  return (
    <div className="bg-white rounded-3xl border border-blue-200/90 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-brand-600" />
            <span>سجل الرقابة والعمليات الإدارية (Audit Trail Logs)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            سجل زمني دقيق لكافة الإجراءات المتخذة من قبل المشرفين على الإعلانات والأقسام والمستخدمين
          </p>
        </div>

        <span className="text-xs font-bold text-brand-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
          إجمالي السجلات: {logs.length}
        </span>
      </div>

      {isLoading ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      ) : logs.length > 0 ? (
        <div className="space-y-3">
          {logs.map((log) => {
            const badge = getActionBadge(log.action);
            const Icon = badge.icon;

            return (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/40 via-white to-sky-50/20 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-brand-300 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      <strong className="text-xs text-slate-900">{log.target}</strong>
                    </div>
                    {log.details && (
                      <p className="text-xs text-slate-500 mt-0.5">{log.details}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-slate-400">
                  <span className="font-semibold text-slate-700">بواسطة: {log.adminName}</span>
                  <span>•</span>
                  <span className="font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(log.createdAt).toLocaleString('ar-SA')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-blue-50/40 rounded-2xl border border-blue-100 text-slate-500 text-xs">
          لا توجد سجلات مسجلة حتى الآن.
        </div>
      )}
    </div>
  );
}
