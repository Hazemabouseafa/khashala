import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

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
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.ad.findMany({
        select: {
          id: true,
          price: true,
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
    ]);

    // Financial & Status aggregations
    let totalMarketValue = 0;
    let totalViews = 0;
    let featuredCount = 0;
    let urgentCount = 0;
    const statusCounts: Record<string, number> = { ACTIVE: 0, PENDING: 0, REJECTED: 0, SOLD: 0 };
    const cityCounts: Record<string, number> = {};
    const categoryValues: Record<string, number> = {};

    ads.forEach((ad) => {
      totalViews += ad.views || 0;
      if (ad.isFeatured) featuredCount++;
      if (ad.isUrgent) urgentCount++;
      if (statusCounts[ad.status] !== undefined) {
        statusCounts[ad.status]++;
      }

      // Add to market value if ACTIVE
      if (ad.status === 'ACTIVE') {
        totalMarketValue += ad.price || 0;
      }

      // City distribution
      cityCounts[ad.city] = (cityCounts[ad.city] || 0) + 1;

      // Category value
      categoryValues[ad.categoryId] = (categoryValues[ad.categoryId] || 0) + (ad.price || 0);
    });

    const activeCount = statusCounts.ACTIVE || 1;
    const averageActivePrice = Math.round(totalMarketValue / (statusCounts.ACTIVE || 1));

    // Format top cities
    const topCities = Object.entries(cityCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Format category distribution
    const categoryStats = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      adsCount: c._count.ads,
      subcategoriesCount: c._count.subcategories,
      totalValue: categoryValues[c.id] || 0,
      percentage: ads.length > 0 ? Math.round((c._count.ads / ads.length) * 100) : 0,
    })).sort((a, b) => b.adsCount - a.adsCount);

    return NextResponse.json({
      analytics: {
        totalMarketValue,
        averageActivePrice,
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
