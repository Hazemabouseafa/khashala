import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  DEFAULT_HOME_BANNERS,
  DEFAULT_SECONDARY_BANNERS,
  HomeBannerItem,
  parseHomeBanners,
  parseSecondaryHomeBanners,
} from '@/lib/banners';

export const dynamic = 'force-dynamic';

function sanitizeBannerList(
  rawList: any[],
  fallbackImage: string,
  idPrefix: string
): HomeBannerItem[] {
  return rawList.map((item: any, idx: number) => ({
    id: String(item.id || `${idPrefix}-${Date.now()}-${idx}`),
    badge: String(item.badge ?? '').trim(),
    title: String(item.title ?? '').trim(),
    subtitle: String(item.subtitle ?? '').trim(),
    ctaLabel: String(item.ctaLabel ?? '').trim(),
    ctaHref: String(item.ctaHref || '/ads').trim() || '/ads',
    image: String(item.image ?? '').trim() || fallbackImage,
    overlayTheme:
      item.overlayTheme === 'crimson' ||
      item.overlayTheme === 'slate' ||
      item.overlayTheme === 'dark' ||
      item.overlayTheme === 'none'
        ? item.overlayTheme
        : 'light_scrim',
    displayMode: item.displayMode === 'image_only' ? 'image_only' : 'with_text',
    isActive: item.isActive !== false,
  }));
}

export async function GET() {
  try {
    const [topRow, secRow] = await Promise.all([
      prisma.platformSetting.findUnique({ where: { key: 'homeBanners' } }),
      prisma.platformSetting.findUnique({
        where: { key: 'homeSecondaryBanners' },
      }),
    ]);

    const banners = parseHomeBanners(topRow?.value);
    const secondaryBanners = parseSecondaryHomeBanners(secRow?.value);

    return NextResponse.json({ banners, secondaryBanners });
  } catch (error: any) {
    console.error('Error fetching home banners:', error);
    return NextResponse.json({
      banners: DEFAULT_HOME_BANNERS,
      secondaryBanners: DEFAULT_SECONDARY_BANNERS,
    });
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
      const targetSlot = body.slot || 'all';

      if (targetSlot === 'top' || targetSlot === 'all') {
        const serializedTop = JSON.stringify(DEFAULT_HOME_BANNERS);
        await prisma.platformSetting.upsert({
          where: { key: 'homeBanners' },
          update: { value: serializedTop },
          create: { key: 'homeBanners', value: serializedTop },
        });
      }

      if (targetSlot === 'after_categories' || targetSlot === 'all') {
        const serializedSec = JSON.stringify(DEFAULT_SECONDARY_BANNERS);
        await prisma.platformSetting.upsert({
          where: { key: 'homeSecondaryBanners' },
          update: { value: serializedSec },
          create: { key: 'homeSecondaryBanners', value: serializedSec },
        });
      }

      const [topRow, secRow] = await Promise.all([
        prisma.platformSetting.findUnique({ where: { key: 'homeBanners' } }),
        prisma.platformSetting.findUnique({
          where: { key: 'homeSecondaryBanners' },
        }),
      ]);

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
        banners: parseHomeBanners(topRow?.value),
        secondaryBanners: parseSecondaryHomeBanners(secRow?.value),
        message: 'تمت استعادة البوسترات الافتراضية بنجاح',
      });
    }

    const hasTop = Array.isArray(body.banners);
    const hasSecondary = Array.isArray(body.secondaryBanners);

    if (!hasTop && !hasSecondary) {
      return NextResponse.json(
        { error: 'صيغة بيانات البوسترات غير صالحة' },
        { status: 400 }
      );
    }

    let savedTop: HomeBannerItem[] | undefined;
    let savedSecondary: HomeBannerItem[] | undefined;

    if (hasTop) {
      savedTop = sanitizeBannerList(
        body.banners,
        DEFAULT_HOME_BANNERS[0].image,
        'banner'
      );
      const serializedTop = JSON.stringify(savedTop);
      await prisma.platformSetting.upsert({
        where: { key: 'homeBanners' },
        update: { value: serializedTop },
        create: { key: 'homeBanners', value: serializedTop },
      });
    }

    if (hasSecondary) {
      savedSecondary = sanitizeBannerList(
        body.secondaryBanners,
        DEFAULT_SECONDARY_BANNERS[0].image,
        'sec-banner'
      );
      const serializedSec = JSON.stringify(savedSecondary);
      await prisma.platformSetting.upsert({
        where: { key: 'homeSecondaryBanners' },
        update: { value: serializedSec },
        create: { key: 'homeSecondaryBanners', value: serializedSec },
      });
    }

    if (!savedTop || !savedSecondary) {
      const [topRow, secRow] = await Promise.all([
        prisma.platformSetting.findUnique({ where: { key: 'homeBanners' } }),
        prisma.platformSetting.findUnique({
          where: { key: 'homeSecondaryBanners' },
        }),
      ]);
      if (!savedTop) savedTop = parseHomeBanners(topRow?.value);
      if (!savedSecondary)
        savedSecondary = parseSecondaryHomeBanners(secRow?.value);
    }

    await prisma.adminLog
      .create({
        data: {
          adminName: admin.name,
          action: 'UPDATE_HOME_BANNERS',
          target: 'بوسترات الصفحة الرئيسية',
          details: `تحديث البوسترات (قبل الأقسام: ${savedTop.length}، بعد الأقسام: ${savedSecondary.length})`,
        },
      })
      .catch(() => null);

    return NextResponse.json({
      success: true,
      banners: savedTop,
      secondaryBanners: savedSecondary,
      message: 'تم حفظ ونشر جميع البوسترات بنجاح',
    });
  } catch (error: any) {
    console.error('Error saving home banners:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حفظ البوسترات' },
      { status: 500 }
    );
  }
}
