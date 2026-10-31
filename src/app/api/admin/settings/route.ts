import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const SECRET_ADMIN_KEYS = new Set(['paymobApiKey', 'paymobHmac']);

export async function GET() {
  try {
    const user = await getCurrentUser().catch(() => null);
    const isAdmin = user?.role === 'ADMIN';

    const settings = await prisma.platformSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      if (!isAdmin && SECRET_ADMIN_KEYS.has(s.key)) {
        return;
      }
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ settings: settingsMap });
  } catch (error: any) {
    console.error('Settings error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب إعدادات المنصة' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح، يتطلب صلاحيات المشرف' }, { status: 403 });
    }

    const body = await req.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'البيانات غير صالحة' }, { status: 400 });
    }

    for (const [key, value] of Object.entries(settings)) {
      await prisma.platformSetting.upsert({
        where: { key },
        update: { value: String(value ?? '') },
        create: { key, value: String(value ?? '') },
      });
    }

    await prisma.adminLog
      .create({
        data: {
          adminName: admin.name,
          action: 'UPDATE_PLATFORM_SETTINGS',
          target: 'إعدادات الهوية والمنصة',
          details: 'تم تحديث إعدادات الهوية البصرية (الشعار وألوان الأيقونات) وتكوين المنصة',
        },
      })
      .catch(() => null);

    return NextResponse.json({ success: true, message: 'تم حفظ الإعدادات بنجاح' });
  } catch (error: any) {
    console.error('Save settings error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ الإعدادات' }, { status: 500 });
  }
}
