import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';

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
    const file = formData.get('image') as File | null;

    if (!file || !file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'يرجى اختيار ملف صورة صالح للبوستر (PNG, JPG, WebP, SVG)' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const brandingDir = path.join(process.cwd(), 'public', 'uploads', 'branding');
    const randomId = crypto.randomBytes(6).toString('hex');
    const timestamp = Date.now();

    if (file.type === 'image/svg+xml') {
      const filename = `banner-${timestamp}-${randomId}.svg`;
      try {
        await fs.mkdir(brandingDir, { recursive: true });
        await fs.writeFile(path.join(brandingDir, filename), buffer);
        return NextResponse.json({
          success: true,
          imageUrl: `/uploads/branding/${filename}`,
        });
      } catch {
        return NextResponse.json({
          success: true,
          imageUrl: `data:image/svg+xml;base64,${buffer.toString('base64')}`,
        });
      }
    }

    const optimizedBuffer = await sharp(buffer)
      .rotate()
      .resize({
        width: 1600,
        height: 680,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: 86,
        effort: 4,
      })
      .toBuffer();

    const filename = `banner-${timestamp}-${randomId}.webp`;

    try {
      await fs.mkdir(brandingDir, { recursive: true });
      await fs.writeFile(path.join(brandingDir, filename), optimizedBuffer);
      return NextResponse.json({
        success: true,
        imageUrl: `/uploads/branding/${filename}`,
      });
    } catch {
      return NextResponse.json({
        success: true,
        imageUrl: `data:image/webp;base64,${optimizedBuffer.toString('base64')}`,
      });
    }
  } catch (error: any) {
    console.error('Banner upload error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء رفع صورة البوستر' },
      { status: 500 }
    );
  }
}
