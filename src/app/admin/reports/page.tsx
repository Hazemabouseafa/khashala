'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Filter,
  UserX,
  Phone,
  Calendar,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const url = statusFilter !== 'ALL' ? `/api/reports?status=${statusFilter}` : '/api/reports';
      const res = await fetch(url);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleAction = async (reportId: string, action: string, newStatus: string = 'RESOLVED') => {
    setActionLoadingId(reportId);
    try {
      const res = await fetch('/api/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('تم اتخاذ الإجراء بنجاح وتحديث حالة البلاغ');
        fetchReports();
      } else {
        alert(data.error || 'فشل تنفيذ الإجراء');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setMessage(null), 3500);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا البلاغ؟')) return;
    try {
      const res = await fetch(`/api/reports?reportId=${reportId}`, { method: 'DELETE' });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
        setMessage('تم حذف البلاغ');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getReasonLabel = (reason: string) => {
    const map: Record<string, { label: string; color: string }> = {
      FRAUD: { label: 'اشتباه احتيال أو سعر وهمي', color: 'bg-rose-100 text-rose-800 border-rose-200' },
      INAPPROPRIATE: { label: 'محتوى غير لائق أو مخالف', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      WRONG_CATEGORY: { label: 'قسم غير مناسب أو مضلل', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      DUPLICATE: { label: 'إعلان مكرر أو منسوخ', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      OTHER: { label: 'بلاغ وملاحظة أخرى', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    };
    return map[reason] || { label: reason, color: 'bg-slate-100 text-slate-800 border-slate-200' };
  };

  return (
    <div className="bg-white rounded-3xl border border-blue-200/90 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
            <span>مركز البلاغات والمحتوى المخالف (Abuse Moderation)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            مراجعة بلاغات المستخدمين ضد الإعلانات المشبوهة أو المخالفة واتخاذ إجراءات الحظر والحذف الفوري
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-blue-50/70 p-1 rounded-xl border border-blue-200/80">
          {[
            { id: 'ALL', label: 'الكل' },
            { id: 'PENDING', label: 'معلقة (بحاجة لمراجعة)' },
            { id: 'RESOLVED', label: 'تمت معالجتها' },
            { id: 'DISMISSED', label: 'مرفوضة / متجاهلة' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-brand-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {isLoading ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      ) : reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => {
            const reasonObj = getReasonLabel(report.reason);
            const ad = report.ad;
            const image =
              ad?.images && ad.images.length > 0
                ? ad.images[0]
                : '/uploads/ads/placeholder.webp';

            return (
              <div
                key={report.id}
                className="p-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/30 via-white to-sky-50/20 space-y-4 hover:border-brand-300 transition-colors shadow-2xs"
              >
                {/* Top Info Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-50">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-black px-2.5 py-1 rounded-lg border ${reasonObj.color}`}
                    >
                      {reasonObj.label}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        report.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : report.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {report.status === 'PENDING'
                        ? '⏳ قيد المراجعة'
                        : report.status === 'RESOLVED'
                        ? '✓ تم اتخاذ الإجراء'
                        : 'تجاهل البلاغ'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(report.createdAt).toLocaleString('ar-SA')}
                    </span>
                  </div>

                  {/* Reporter details */}
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>
                      المبلغ: <strong className="text-slate-800">{report.reporterName || 'مجهول'}</strong>
                    </span>
                    {report.reporterPhone && (
                      <span className="font-mono text-[11px]">({report.reporterPhone})</span>
                    )}
                  </div>
                </div>

                {/* Details note */}
                {report.details && (
                  <div className="p-3 bg-white rounded-xl border border-blue-100 text-xs text-slate-700 leading-relaxed font-medium">
                    <strong className="text-slate-900 block mb-1">تفاصيل وملاحظة البلاغ:</strong>
                    {report.details}
                  </div>
                )}

                {/* Reported Ad Preview */}
                {ad ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 bg-blue-50/50 rounded-xl border border-blue-200/70">
                    <div className="flex items-center gap-3">
                      <img
                        src={image}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover border border-blue-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/ads/${ad.id}`}
                            target="_blank"
                            className="font-bold text-slate-900 hover:text-brand-600 text-sm flex items-center gap-1"
                          >
                            <span>{ad.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                          {ad.user?.isBanned && (
                            <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded">
                              ناشر محظور
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          القسم: <strong className="text-brand-700">{ad.category?.name}</strong> • السعر:{' '}
                          <strong className="text-brand-600">
                            {new Intl.NumberFormat('ar-SA').format(ad.price)} ر.س
                          </strong>{' '}
                          • الناشر: <strong>{ad.user?.name}</strong> ({ad.user?.phone || ad.user?.email})
                        </div>
                      </div>
                    </div>

                    {/* Quick Moderation Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleAction(report.id, 'DELETE_AD')}
                        disabled={actionLoadingId === report.id}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف الإعلان المخالف</span>
                      </button>

                      <button
                        onClick={() => handleAction(report.id, 'REJECT_AD')}
                        disabled={actionLoadingId === report.id}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>رفض الإعلان</span>
                      </button>

                      <button
                        onClick={() => handleAction(report.id, 'BAN_SELLER')}
                        disabled={actionLoadingId === report.id}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>حظر الناشر</span>
                      </button>

                      <button
                        onClick={() => handleAction(report.id, 'DISMISS', 'DISMISSED')}
                        disabled={actionLoadingId === report.id}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        تجاهل
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 p-3 bg-slate-50 rounded-xl">
                    تم حذف الإعلان المرتبط بهذا البلاغ مسبقاً.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-blue-50/40 rounded-2xl border border-blue-100 text-slate-500 text-xs">
          لا توجد بلاغات تطابق التصفية المختارة. المنصة آمنة ومستقرة!
        </div>
      )}
    </div>
  );
}
