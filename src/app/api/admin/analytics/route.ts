import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح، يتطلب صلاحيات المشرف' }, { status: 403 });
    }

    const [
      totalUsers,
      bannedUsers,
      ads,
      categories,
      pendingReportsCount,
      logsCount,
      successfulPayments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.ad.findMany({
        select: {
          id: true,
          status: true,
          city: true,
          isFeatured: true,
          isUrgent: true,
          views: true,
          categoryId: true,
          createdAt: true,
        },
      }),
      prisma.category.findMany({
        include: {
          _count: { select: { ads: true, subcategories: true } },
        },
      }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.adminLog.count(),
      prisma.payment.findMany({
        where: { status: 'SUCCESS' },
        select: { amount: true, currency: true },
      }),
    ]);

    let totalViews = 0;
    let featuredCount = 0;
    let urgentCount = 0;
    const statusCounts: Record<string, number> = { ACTIVE: 0, PENDING: 0, REJECTED: 0, SOLD: 0 };
    const cityCounts: Record<string, number> = {};
    const categoryViews: Record<string, number> = {};

    ads.forEach((ad) => {
      totalViews += ad.views || 0;
      if (ad.isFeatured) featuredCount++;
      if (ad.isUrgent) urgentCount++;
      if (statusCounts[ad.status] !== undefined) {
        statusCounts[ad.status]++;
      }
      cityCounts[ad.city] = (cityCounts[ad.city] || 0) + 1;
      categoryViews[ad.categoryId] = (categoryViews[ad.categoryId] || 0) + (ad.views || 0);
    });

    // Real verified payments ONLY (never seeded with dummy money data)
    const realPaymentsRevenue = successfulPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const realPaymentsCount = successfulPayments.length;

    const topCities = Object.entries(cityCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const categoryStats = categories
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        adsCount: c._count.ads,
        subcategoriesCount: c._count.subcategories,
        viewsCount: categoryViews[c.id] || 0,
        percentage: ads.length > 0 ? Math.round((c._count.ads / ads.length) * 100) : 0,
      }))
      .sort((a, b) => b.adsCount - a.adsCount);

    return NextResponse.json({
      analytics: {
        realPaymentsRevenue,
        realPaymentsCount,
        totalViews,
        totalUsers,
        bannedUsers,
        totalAds: ads.length,
        statusCounts,
        featuredCount,
        urgentCount,
        pendingReportsCount,
        logsCount,
        topCities,
        categoryStats,
      },
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إعداد التحليلات' }, { status: 500 });
  }
}
