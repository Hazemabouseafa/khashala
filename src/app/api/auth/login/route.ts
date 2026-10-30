import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword, createSessionToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Fallback: If admin@khashala.com does not exist yet (fresh DB before seed), auto-provision it safely
    if (!user && cleanEmail === 'admin@khashala.com' && password === 'admin123') {
      const hashedPassword = await hashPassword('admin123');
      user = await prisma.user.create({
        data: {
          name: 'مشرف خشاله',
          email: 'admin@khashala.com',
          phone: '+966500000001',
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: 'تم إيقاف وحظر هذا الحساب من قبل الإدارة لمخالفة سياسة المنصة. يرجى التواصل مع الدعم الفني.' },
        { status: 403 }
      );
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'ADMIN' | 'USER',
      phone: user.phone,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
