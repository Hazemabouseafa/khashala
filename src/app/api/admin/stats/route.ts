import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ensureSampleDataSeeded } from '@/lib/auto-seed';

export async function GET() {
  try {
    await ensureSampleDataSeeded();
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح، يتطلب صلاحيات المشرف' },
        { status: 403 }
      );
    }

    const [
      totalUsers,
      totalAds,
      pendingAds,
      activeAds,
      soldAds,
      categoriesCount,
      subcategoriesCount,
      featuredAds,
      urgentAds,
      pendingReportsCount,
      bannedUsersCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.ad.count(),
      prisma.ad.count({ where: { status: 'PENDING' } }),
      prisma.ad.count({ where: { status: 'ACTIVE' } }),
      prisma.ad.count({ where: { status: 'SOLD' } }),
      prisma.category.count(),
      prisma.subcategory.count(),
      prisma.ad.count({ where: { isFeatured: true } }),
      prisma.ad.count({ where: { isUrgent: true } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { isBanned: true } }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalAds,
        pendingAds,
        activeAds,
        soldAds,
        categoriesCount,
        subcategoriesCount,
        featuredAds,
        urgentAds,
        pendingReportsCount,
        bannedUsersCount,
      },
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب إحصائيات المشرف' },
      { status: 500 }
    );
  }
}
