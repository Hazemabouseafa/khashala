import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح، يتطلب صلاحيات المشرف' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const role = searchParams.get('role');
    const banned = searchParams.get('banned');

    const where: any = {};

    if (q.trim()) {
      where.OR = [
        { name: { contains: q.trim() } },
        { email: { contains: q.trim() } },
        { phone: { contains: q.trim() } },
      ];
    }

    if (role && role !== 'ALL') {
      where.role = role;
    }

    if (banned === 'true') {
      where.isBanned = true;
    } else if (banned === 'false') {
      where.isBanned = false;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isBanned: true,
        createdAt: true,
        _count: {
          select: { ads: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب قائمة المستخدمين' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح، يتطلب صلاحيات المشرف' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, role, isBanned } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (isBanned !== undefined) updateData.isBanned = Boolean(isBanned);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
      },
    });

    // Log admin action
    if (isBanned !== undefined) {
      await prisma.adminLog.create({
        data: {
          adminName: admin.name,
          action: isBanned ? 'BAN_USER' : 'UNBAN_USER',
          target: `${updatedUser.name} (${updatedUser.email})`,
          details: isBanned ? 'تم حظر المستخدم ومنعه من النشر' : 'تم فك حظر المستخدم',
        },
      }).catch(() => null);
    }

    if (role !== undefined) {
      await prisma.adminLog.create({
        data: {
          adminName: admin.name,
          action: 'CHANGE_USER_ROLE',
          target: `${updatedUser.name} (${updatedUser.email})`,
          details: `تم تغيير الصلاحية إلى ${role}`,
        },
      }).catch(() => null);
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تعديل بيانات المستخدم' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح، يتطلب صلاحيات المشرف' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
    }

    // Safety: prevent self-deletion
    if (userId === admin.id) {
      return NextResponse.json({ error: 'لا يمكنك حذف حسابك الشخصي' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: userId } });

    await prisma.adminLog.create({
      data: {
        adminName: admin.name,
        action: 'DELETE_USER',
        target: `${targetUser.name} (${targetUser.email})`,
        details: 'تم حذف حساب المستخدم وجميع إعلاناته المرتبطة',
      },
    }).catch(() => null);

    return NextResponse.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف المستخدم' }, { status: 500 });
  }
}
