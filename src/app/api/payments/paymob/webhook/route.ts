import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, obj } = body;

    // We only process TRANSACTION events
    if (type !== 'TRANSACTION' || !obj) {
      return NextResponse.json({ received: true });
    }

    const orderId = String(obj.order?.id || obj.order_id || '');
    const merchantOrderId = String(obj.order?.merchant_order_id || '');
    const isSuccess = Boolean(obj.success);
    const txnId = String(obj.id || '');

    // Optional HMAC validation if HMAC secret is set
    const hmacSetting = await prisma.platformSetting.findUnique({
      where: { key: 'paymobHmac' },
    }).catch(() => null);

    const hmacSecret = hmacSetting?.value;
    const receivedHmac = req.nextUrl.searchParams.get('hmac');

    if (hmacSecret && receivedHmac) {
      // Paymob HMAC calculation: concatenated fields in specific alphabetical order
      const fields = [
        obj.amount_cents,
        obj.created_at,
        obj.currency,
        obj.error_occured,
        obj.has_parent_transaction,
        obj.id,
        obj.integration_id,
        obj.is_3d_secure,
        obj.is_auth,
        obj.is_capture,
        obj.is_refunded,
        obj.is_standalone_payment,
        obj.is_voided,
        obj.order?.id,
        obj.owner,
        obj.pending,
        obj.source_data?.pan,
        obj.source_data?.sub_type,
        obj.source_data?.type,
        obj.success,
      ].join('');

      const calculatedHmac = crypto
        .createHmac('sha512', hmacSecret)
        .update(fields)
        .digest('hex');

      if (calculatedHmac !== receivedHmac) {
        console.warn('Paymob HMAC verification failed.');
        return NextResponse.json({ error: 'HMAC validation failed' }, { status: 400 });
      }
    }

    // Find the corresponding Payment record
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { paymobOrderId: orderId },
          { paymobOrderId: merchantOrderId },
        ],
      },
      include: { ad: true },
    });

    if (!payment) {
      return NextResponse.json({ received: true, note: 'Payment record not found' });
    }

    if (isSuccess) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          paymobTxnId: txnId,
        },
      });

      // Upgrade Ad to isFeatured = true
      await prisma.ad.update({
        where: { id: payment.adId },
        data: {
          isFeatured: true,
          updatedAt: new Date(),
        },
      });

      await prisma.adminLog.create({
        data: {
          adminName: 'Paymob Webhook',
          action: 'FEATURE_AD_PAYMOB',
          target: payment.ad?.title || payment.adId,
          details: `تم تأكيد الدفع عبر Paymob Webhook وترقية الإعلان بنجاح (المعاملة: ${txnId})`,
        },
      }).catch(() => null);
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          paymobTxnId: txnId,
        },
      });
    }

    return NextResponse.json({ received: true, status: isSuccess ? 'SUCCESS' : 'FAILED' });
  } catch (error: any) {
    console.error('Paymob Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
