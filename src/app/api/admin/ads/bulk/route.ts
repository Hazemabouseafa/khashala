import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح، يتطلب صلاحيات المشرف' }, { status: 403 });
    }

    const body = await req.json();
    const { adIds, action } = body;

    if (!Array.isArray(adIds) || adIds.length === 0 || !action) {
      return NextResponse.json({ error: 'يرجى تحديد الإعلانات والإجراء المطلوب' }, { status: 400 });
    }

    let message = '';

    if (action === 'APPROVE') {
      await prisma.ad.updateMany({
        where: { id: { in: adIds } },
        data: { status: 'ACTIVE' },
      });
      message = `تمت الموافقة وتفعيل ${adIds.length} إعلان بنجاح`;
    } else if (action === 'REJECT') {
      await prisma.ad.updateMany({
        where: { id: { in: adIds } },
        data: { status: 'REJECTED' },
      });
      message = `تم رفض ${adIds.length} إعلان بنجاح`;
    } else if (action === 'DELETE') {
      await prisma.ad.deleteMany({
        where: { id: { in: adIds } },
      });
      message = `تم حذف ${adIds.length} إعلان نهائياً`;
    } else if (action === 'FEATURE') {
      await prisma.ad.updateMany({
        where: { id: { in: adIds } },
        data: { isFeatured: true },
      });
      message = `تم تمييز ${adIds.length} إعلان بنجاح ⭐`;
    } else if (action === 'UNFEATURE') {
      await prisma.ad.updateMany({
        where: { id: { in: adIds } },
        data: { isFeatured: false },
      });
      message = `تم إلغاء تمييز ${adIds.length} إعلان`;
    } else {
      return NextResponse.json({ error: 'إجراء غير مدعوم' }, { status: 400 });
    }

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminName: admin.name,
        action: `BULK_${action}`,
        target: `${adIds.length} إعلانات`,
        details: message,
      },
    }).catch(() => null);

    return NextResponse.json({ success: true, message, affectedCount: adIds.length });
  } catch (error: any) {
    console.error('Bulk ads error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تنفيذ الإجراء الجماعي' }, { status: 500 });
  }
}
