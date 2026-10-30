import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET all reports (Admin only)
export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح، يتطلب صلاحيات المشرف' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        ad: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true, isBanned: true } },
            category: true,
            subcategory: true,
          },
        },
      },
    });

    const formattedReports = reports.map((r: any) => ({
      ...r,
      ad: r.ad
        ? {
            ...r.ad,
            images: Array.isArray(r.ad.images)
              ? r.ad.images
              : typeof r.ad.images === 'string'
              ? JSON.parse(r.ad.images || '[]')
              : [],
          }
        : null,
    }));

    return NextResponse.json({ reports: formattedReports });
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب البلاغات' }, { status: 500 });
  }
}

// POST new report (Public / Authenticated users)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adId, reason, details, reporterName, reporterPhone } = body;

    if (!adId || !reason) {
      return NextResponse.json({ error: 'معرف الإعلان وسبب البلاغ مطلوبان' }, { status: 400 });
    }

    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) {
      return NextResponse.json({ error: 'الإعلان المبلغ عنه غير موجود' }, { status: 404 });
    }

    const report = await prisma.report.create({
      data: {
        adId,
        reason,
        details: details?.trim() || null,
        reporterName: reporterName?.trim() || null,
        reporterPhone: reporterPhone?.trim() || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم إرسال بلاغك بنجاح وسيقوم فريق الإدارة بمراجعته فوراً. شكراً لمساعدتك في الحفاظ على مجتمع آمن.',
      report,
    });
  } catch (error: any) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ البلاغ' }, { status: 500 });
  }
}

// PUT update report status or execute moderation action (Admin only)
export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح، يتطلب صلاحيات المشرف' }, { status: 403 });
    }

    const body = await req.json();
    const { reportId, status, action } = body;

    if (!reportId) {
      return NextResponse.json({ error: 'معرف البلاغ مطلوب' }, { status: 400 });
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { ad: true },
    });

    if (!report) {
      return NextResponse.json({ error: 'البلاغ غير موجود' }, { status: 404 });
    }

    // Action handling: e.g. DELETE_AD, REJECT_AD, BAN_SELLER
    if (action === 'DELETE_AD' && report.adId) {
      await prisma.ad.delete({ where: { id: report.adId } }).catch(() => null);
      await prisma.adminLog.create({
        data: {
          adminName: admin.name,
          action: 'DELETE_REPORTED_AD',
          target: report.ad?.title || report.adId,
          details: `حذف إعلان مخالف بناءً على بلاغ: ${report.reason}`,
        },
      }).catch(() => null);
    } else if (action === 'REJECT_AD' && report.adId) {
      await prisma.ad.update({
        where: { id: report.adId },
        data: { status: 'REJECTED' },
      }).catch(() => null);
      await prisma.adminLog.create({
        data: {
          adminName: admin.name,
          action: 'REJECT_REPORTED_AD',
          target: report.ad?.title || report.adId,
          details: `رفض إعلان بعد مراجعة البلاغ: ${report.reason}`,
        },
      }).catch(() => null);
    } else if (action === 'BAN_SELLER' && report.ad?.userId) {
      await prisma.user.update({
        where: { id: report.ad.userId },
        data: { isBanned: true },
      }).catch(() => null);
      await prisma.adminLog.create({
        data: {
          adminName: admin.name,
          action: 'BAN_REPORTED_SELLER',
          target: `مستخدم ID: ${report.ad.userId}`,
          details: `حظر بائع مخالف بناءً على بلاغ عن إعلان: ${report.ad?.title}`,
        },
      }).catch(() => null);
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: { status: status || 'RESOLVED' },
    });

    return NextResponse.json({ success: true, report: updated });
  } catch (error: any) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث حالة البلاغ' }, { status: 500 });
  }
}

// DELETE report (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح، يتطلب صلاحيات المشرف' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('reportId');

    if (!reportId) {
      return NextResponse.json({ error: 'معرف البلاغ مطلوب' }, { status: 400 });
    }

    await prisma.report.delete({ where: { id: reportId } });
    return NextResponse.json({ success: true, message: 'تم حذف البلاغ بنجاح' });
  } catch (error: any) {
    console.error('Error deleting report:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف البلاغ' }, { status: 500 });
  }
}
