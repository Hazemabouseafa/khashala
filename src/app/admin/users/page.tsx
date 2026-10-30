'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Check,
  Loader2,
  UserX,
  UserCheck,
  Trash2,
  ExternalLink,
  ShieldAlert,
  AlertCircle,
  Filter,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [bannedFilter, setBannedFilter] = useState('ALL');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (bannedFilter === 'BANNED') params.set('banned', 'true');
      if (bannedFilter === 'ACTIVE') params.set('banned', 'false');

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, bannedFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`هل أنت متأكد من تغيير صلاحية هذا المستخدم إلى "${nextRole === 'ADMIN' ? 'مشرف' : 'مستخدم عادي'}"؟`)) {
      return;
    }

    setActionLoadingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: nextRole }),
      });
      if (res.ok) {
        setMessage('تم تعديل الصلاحية بنجاح');
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleBanToggle = async (userId: string, isBanned: boolean, userName: string) => {
    const actionText = isBanned ? 'فك الحظر عن' : 'حظر';
    if (!confirm(`هل أنت متأكد من ${actionText} المستخدم "${userName}"؟`)) return;

    setActionLoadingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isBanned: !isBanned }),
      });
      if (res.ok) {
        setMessage(`تم ${actionText} المستخدم بنجاح`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isBanned: !isBanned } : u))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`تحذير: هل أنت متأكد من حذف حساب "${userName}" وجميع إعلاناته نهائياً؟`)) return;

    setActionLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`تم حذف حساب "${userName}" بنجاح`);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        alert(data.error || 'فشل حذف المستخدم');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-blue-200/90 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" />
            <span>إدارة المستخدمين والحظر والصلاحيات</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            البحث في الأعضاء، تعديل الصلاحيات، حظر الحسابات المخالفة، أو حذف المستخدمين
          </p>
        </div>

        <span className="text-xs font-bold text-brand-700 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl">
          إجمالي النتائج: {users.length} مستخدم
        </span>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <form
        onSubmit={handleSearch}
        className="p-4 bg-gradient-to-br from-blue-50/60 to-white rounded-2xl border border-blue-200/80 flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="بحث بالاسم، البريد الإلكتروني، أو الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-xs rounded-xl pr-9 pl-3 py-2.5 border border-blue-200 focus:outline-none focus:border-brand-500 font-medium"
          />
          <Search className="w-4 h-4 text-brand-500 absolute right-3 top-2.5" />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-white text-xs font-bold text-slate-700 rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none"
        >
          <option value="ALL">جميع الصلاحيات</option>
          <option value="ADMIN">المشرفين فقط (Admins)</option>
          <option value="USER">المستخدمين العاديين</option>
        </select>

        <select
          value={bannedFilter}
          onChange={(e) => setBannedFilter(e.target.value)}
          className="bg-white text-xs font-bold text-slate-700 rounded-xl px-3 py-2.5 border border-blue-200 focus:outline-none"
        >
          <option value="ALL">جميع الحالات</option>
          <option value="ACTIVE">حسابات نشطة</option>
          <option value="BANNED">حسابات محظورة 🚫</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>بحث</span>
        </button>
      </form>

      {isLoading ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      ) : users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-blue-50/70 text-slate-600 font-bold border-b border-blue-200">
              <tr>
                <th className="py-3 px-4">المستخدم</th>
                <th className="py-3 px-4">البريد الإلكتروني</th>
                <th className="py-3 px-4">رقم الهاتف</th>
                <th className="py-3 px-4">الصلاحية</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">الإعلانات</th>
                <th className="py-3 px-4">تاريخ التسجيل</th>
                <th className="py-3 px-4 text-center">إجراءات التحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100/70">
              {users.map((u) => {
                const isAdmin = u.role === 'ADMIN';
                const isBanned = Boolean(u.isBanned);

                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      isBanned ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-2xs ${
                            isAdmin
                              ? 'bg-gradient-to-br from-brand-600 to-navy-900'
                              : isBanned
                              ? 'bg-rose-600'
                              : 'bg-slate-700'
                          }`}
                        >
                          {u.name ? u.name.charAt(0) : 'م'}
                        </div>
                        <div>
                          <div className="line-clamp-1">{u.name}</div>
                          {isBanned && (
                            <span className="text-[10px] text-rose-600 font-bold">
                              حساب محظور
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {u.email}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {u.phone || '—'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          isAdmin
                            ? 'bg-blue-100 text-brand-800 border-blue-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {isAdmin ? 'مشرف (Admin)' : 'مستخدم'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          isBanned
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {isBanned ? 'محظور 🚫' : 'نشط ✓'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <Link
                        href={`/admin/ads?q=${encodeURIComponent(u.name || '')}`}
                        className="hover:text-brand-600 hover:underline flex items-center gap-1"
                        title="عرض إعلانات هذا المستخدم"
                      >
                        <span>{u._count?.ads || 0}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {new Date(u.createdAt).toLocaleDateString('ar-SA')}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Toggle Ban */}
                        <button
                          onClick={() => handleBanToggle(u.id, isBanned, u.name)}
                          disabled={actionLoadingId === u.id}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                            isBanned
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                          }`}
                          title={isBanned ? 'فك الحظر عن المستخدم' : 'حظر المستخدم'}
                        >
                          {isBanned ? (
                            <UserCheck className="w-3.5 h-3.5" />
                          ) : (
                            <UserX className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Toggle Role */}
                        <button
                          onClick={() => handleRoleToggle(u.id, u.role)}
                          disabled={actionLoadingId === u.id}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-brand-700 border border-blue-200 text-[11px] font-bold transition-colors"
                          title="ترقية / تنزيل الصلاحية"
                        >
                          {isAdmin ? 'تنزيل' : 'ترقية'}
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          disabled={actionLoadingId === u.id}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors"
                          title="حذف الحساب نهائياً"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500 text-xs bg-blue-50/30 rounded-2xl border border-blue-100">
          لا يوجد مستخدمون يطابقون خيارات البحث.
        </div>
      )}
    </div>
  );
}
