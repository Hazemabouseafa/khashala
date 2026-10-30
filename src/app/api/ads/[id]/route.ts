import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const ad = await prisma.ad.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
      },
    });

    if (!ad) {
      return NextResponse.json(
        { error: 'الإعلان غير موجود أو قد تم حذفه' },
        { status: 404 }
      );
    }

    // Increment views in background
    await prisma.ad.update({
      where: { id },
      data: { views: { increment: 1 } },
    }).catch(() => null);

    const formattedAd = {
      ...ad,
      images: Array.isArray(ad.images)
        ? ad.images
        : typeof ad.images === 'string'
        ? JSON.parse(ad.images || '[]')
        : [],
    };

    return NextResponse.json({ ad: formattedAd });
  } catch (error: any) {
    console.error('Error fetching ad details:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب تفاصيل الإعلان' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول لتعديل الإعلان' },
        { status: 401 }
      );
    }

    const { id } = params;
    const existingAd = await prisma.ad.findUnique({ where: { id } });

    if (!existingAd) {
      return NextResponse.json(
        { error: 'الإعلان غير موجود' },
        { status: 404 }
      );
    }

    const isAdmin = user.role === 'ADMIN';
    const isOwner = existingAd.userId === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'غير مصرح لك بتعديل هذا الإعلان' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updateData: any = {};

    // Fields that ad author or admin can update
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.city !== undefined) updateData.city = body.city.trim();
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.subcategoryId !== undefined) updateData.subcategoryId = body.subcategoryId || null;
    if (body.condition !== undefined) updateData.condition = body.condition;
    if (body.isNegotiable !== undefined) updateData.isNegotiable = Boolean(body.isNegotiable);
    if (body.isUrgent !== undefined) updateData.isUrgent = Boolean(body.isUrgent);
    if (body.isFeatured !== undefined && isAdmin) updateData.isFeatured = Boolean(body.isFeatured);

    if (body.images !== undefined) {
      const arr = Array.isArray(body.images) ? body.images : [];
      updateData.images = (process.env.DATABASE_URL || '').includes('file:') ? JSON.stringify(arr) : (arr as any);
    }

    // Status updates:
    // - Admin can change status to any (ACTIVE, REJECTED, PENDING, SOLD)
    // - Owner can mark as SOLD or back to ACTIVE (if previously approved)
    if (body.status !== undefined) {
      if (isAdmin) {
        updateData.status = body.status;
      } else if (isOwner && (body.status === 'SOLD' || body.status === 'ACTIVE')) {
        updateData.status = body.status;
      }
    }

    const updatedAd = await prisma.ad.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        subcategory: true,
        user: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الإعلان بنجاح',
      ad: {
        ...updatedAd,
        images: Array.isArray(updatedAd.images)
          ? updatedAd.images
          : typeof updatedAd.images === 'string'
          ? JSON.parse(updatedAd.images || '[]')
          : [],
      },
    });
  } catch (error: any) {
    console.error('Error updating ad:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث الإعلان' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول لحذف الإعلان' },
        { status: 401 }
      );
    }

    const { id } = params;
    const existingAd = await prisma.ad.findUnique({ where: { id } });

    if (!existingAd) {
      return NextResponse.json(
        { error: 'الإعلان غير موجود' },
        { status: 404 }
      );
    }

    const isAdmin = user.role === 'ADMIN';
    const isOwner = existingAd.userId === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'غير مصرح لك بحذف هذا الإعلان' },
        { status: 403 }
      );
    }

    await prisma.ad.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'تم حذف الإعلان بنجاح',
    });
  } catch (error: any) {
    console.error('Error deleting ad:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الإعلان' },
      { status: 500 }
    );
  }
}
