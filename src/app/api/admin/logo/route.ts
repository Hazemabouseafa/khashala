import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح، يتطلب صلاحيات المشرف' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('logo') as File | null;

    if (!file || !file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'يرجى اختيار ملف صورة صالح للشعار (PNG, WebP, SVG, JPG)' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const brandingDir = path.join(process.cwd(), 'public', 'uploads', 'branding');
    await fs.mkdir(brandingDir, { recursive: true });

    const randomId = crypto.randomBytes(6).toString('hex');
    const timestamp = Date.now();
    let finalLogoUrl = '';

    if (file.type === 'image/svg+xml') {
      const filename = `logo-${timestamp}-${randomId}.svg`;
      const absPath = path.join(brandingDir, filename);
      await fs.writeFile(absPath, buffer);

      if (buffer.length <= 200 * 1024) {
        finalLogoUrl = `data:image/svg+xml;base64,${buffer.toString('base64')}`;
      } else {
        finalLogoUrl = `/uploads/branding/${filename}`;
      }
    } else {
      // Optimize raster logo while preserving 100% alpha channel transparency
      const optimizedBuffer = await sharp(buffer)
        .rotate()
        .resize({
          height: 240,
          width: 720,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality: 92,
          alphaQuality: 100,
          effort: 4,
        })
        .toBuffer();

      const filename = `logo-${timestamp}-${randomId}.webp`;
      const absPath = path.join(brandingDir, filename);
      await fs.writeFile(absPath, optimizedBuffer);

      if (optimizedBuffer.length <= 220 * 1024) {
        finalLogoUrl = `data:image/webp;base64,${optimizedBuffer.toString('base64')}`;
      } else {
        finalLogoUrl = `/uploads/branding/${filename}`;
      }
    }

    // Persist in PlatformSetting immediately
    await prisma.platformSetting.upsert({
      where: { key: 'siteLogoUrl' },
      update: { value: finalLogoUrl },
      create: { key: 'siteLogoUrl', value: finalLogoUrl },
    });

    await prisma.adminLog
      .create({
        data: {
          adminName: admin.name,
          action: 'UPDATE_LOGO',
          target: 'شعار المنصة الرسمي',
          details: 'تم رفع وتحديث شعار المنصة من لوحة التحكم',
        },
      })
      .catch(() => null);

    return NextResponse.json({
      success: true,
      logoUrl: finalLogoUrl,
      message: 'تم رفع وتحديث شعار المنصة بنجاح',
    });
  } catch (error: any) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء رفع ومعالجة الشعار' },
      { status: 500 }
    );
  }
}
