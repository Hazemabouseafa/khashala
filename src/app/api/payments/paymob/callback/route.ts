import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('paymentId');
    const success = searchParams.get('success') === 'true';
    const txnId = searchParams.get('id') || searchParams.get('txn_id') || 'TXN-' + Date.now();
    const orderId = searchParams.get('order_id') || searchParams.get('order');

    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8989';

    if (!paymentId) {
      // If paymentId not provided in query, look up by orderId if available
      if (orderId) {
        const paymentByOrder = await prisma.payment.findFirst({
          where: { paymobOrderId: orderId },
          include: { ad: true },
        });
        if (paymentByOrder && success) {
          await completeSuccessfulPayment(paymentByOrder, txnId);
          return NextResponse.redirect(`${origin}/ads/${paymentByOrder.adId}?featured=success`);
        }
      }
      return NextResponse.redirect(`${origin}/dashboard?payment=error`);
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { ad: true, user: true },
    });

    if (!payment) {
      return NextResponse.redirect(`${origin}/dashboard?payment=not_found`);
    }

    if (success) {
      await completeSuccessfulPayment(payment, txnId);
      return NextResponse.redirect(
        `${origin}/ads/${payment.adId}?featured=success&msg=${encodeURIComponent(
          'تهانينا! تمت ترقية إعلانك بنجاح وسيظهر الآن في المرتبة الأولى في القسم.'
        )}`
      );
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          paymobTxnId: txnId,
        },
      });
      return NextResponse.redirect(
        `${origin}/dashboard?payment=failed&adId=${payment.adId}`
      );
    }
  } catch (error: any) {
    console.error('Paymob Callback Error:', error);
    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8989';
    return NextResponse.redirect(`${origin}/dashboard?payment=error`);
  }
}

async function completeSuccessfulPayment(payment: any, txnId: string) {
  // 1. Mark payment as SUCCESS
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'SUCCESS',
      paymobTxnId: txnId,
    },
  });

  // 2. Upgrade Ad to isFeatured = true (appears at the top of category!)
  await prisma.ad.update({
    where: { id: payment.adId },
    data: {
      isFeatured: true,
      updatedAt: new Date(),
    },
  });

  // 3. Log audit event
  await prisma.adminLog.create({
    data: {
      adminName: 'Paymob Gateway',
      action: 'FEATURE_AD_PAYMOB',
      target: payment.ad?.title || payment.adId,
      details: `تمت ترقية الإعلان لإعلان مميز تلقائياً عبر Paymob بقيمة ${payment.amount} ${payment.currency} (معاملة: ${txnId})`,
    },
  }).catch(() => null);
}
