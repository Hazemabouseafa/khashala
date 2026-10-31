import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { DEFAULT_HOME_BANNERS, HomeBannerItem, parseHomeBanners } from '@/lib/banners';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const row = await prisma.platformSetting.findUnique({
      where: { key: 'homeBanners' },
    });
    const banners = parseHomeBanners(row?.value);
    return NextResponse.json({ banners });
  } catch (error: any) {
    console.error('Error fetching home banners:', error);
    return NextResponse.json({ banners: DEFAULT_HOME_BANNERS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح، يتطلب صلاحيات المشرف' },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (body.action === 'reset_defaults') {
      const serialized = JSON.stringify(DEFAULT_HOME_BANNERS);
      await prisma.platformSetting.upsert({
        where: { key: 'homeBanners' },
        update: { value: serialized },
        create: { key: 'homeBanners', value: serialized },
      });

      await prisma.adminLog
        .create({
          data: {
            adminName: admin.name,
            action: 'RESET_HOME_BANNERS',
            target: 'بوسترات الصفحة الرئيسية',
            details: 'استعادة البوسترات الافتراضية للصفحة الرئيسية',
          },
        })
        .catch(() => null);

      return NextResponse.json({
        success: true,
        banners: DEFAULT_HOME_BANNERS,
        message: 'تمت استعادة البوسترات الافتراضية بنجاح',
      });
    }

    if (!Array.isArray(body.banners)) {
      return NextResponse.json(
        { error: 'صيغة بيانات البوسترات غير صالحة' },
        { status: 400 }
      );
    }

    const sanitized: HomeBannerItem[] = body.banners.map(
      (item: any, idx: number) => ({
        id: String(item.id || `banner-${Date.now()}-${idx}`),
        badge: String(item.badge ?? '').trim(),
        title: String(item.title ?? '').trim(),
        subtitle: String(item.subtitle ?? '').trim(),
        ctaLabel: String(item.ctaLabel ?? '').trim(),
        ctaHref: String(item.ctaHref || '/ads').trim() || '/ads',
        image:
          String(item.image ?? '').trim() || DEFAULT_HOME_BANNERS[0].image,
        overlayTheme:
          item.overlayTheme === 'crimson' ||
          item.overlayTheme === 'slate' ||
          item.overlayTheme === 'dark' ||
          item.overlayTheme === 'none'
            ? item.overlayTheme
            : 'light_scrim',
        displayMode: item.displayMode === 'image_only' ? 'image_only' : 'with_text',
        isActive: item.isActive !== false,
      })
    );

    const serialized = JSON.stringify(sanitized);

    await prisma.platformSetting.upsert({
      where: { key: 'homeBanners' },
      update: { value: serialized },
      create: { key: 'homeBanners', value: serialized },
    });

    await prisma.adminLog
      .create({
        data: {
          adminName: admin.name,
          action: 'UPDATE_HOME_BANNERS',
          target: 'بوسترات الصفحة الرئيسية',
          details: `تحديث بوسترات الصفحة الرئيسية (العدد الإجمالي: ${sanitized.length})`,
        },
      })
      .catch(() => null);

    return NextResponse.json({
      success: true,
      banners: sanitized,
      message: 'تم حفظ تحديثات البوسترات بنجاح',
    });
  } catch (error: any) {
    console.error('Error saving home banners:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حفظ البوسترات' },
      { status: 500 }
    );
  }
}
