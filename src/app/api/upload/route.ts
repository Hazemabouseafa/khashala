import { NextRequest, NextResponse } from 'next/server';
import { compressAndSaveImage } from '@/lib/sharp-compress';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول لرفع الصور' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'لم يتم إرسال أي صور' },
        { status: 400 }
      );
    }

    if (files.length > 8) {
      return NextResponse.json(
        { error: 'الحد الأقصى لعدد الصور هو 8 صور لكل إعلان' },
        { status: 400 }
      );
    }

    const compressedImages = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: `الملف ${file.name} ليس صورة صالحة` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const result = await compressAndSaveImage(bytes, file.name);
      compressedImages.push(result);
    }

    return NextResponse.json({
      success: true,
      count: compressedImages.length,
      images: compressedImages,
    });
  } catch (error: any) {
    console.error('Error during image compression upload:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء معالجة وضغط الصور' },
      { status: 500 }
    );
  }
}
