import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    const body = await req.json();
    const { adId } = body;

    if (!adId) {
      return NextResponse.json({ error: 'معرف الإعلان مطلوب' }, { status: 400 });
    }

    // Verify Ad exists and user is owner or admin
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      include: { category: true, user: true },
    });

    if (!ad) {
      return NextResponse.json({ error: 'الإعلان غير موجود' }, { status: 404 });
    }

    if (ad.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح لك بترقية هذا الإعلان' },
        { status: 403 }
      );
    }

    // Fetch Paymob Settings
    const settings = await prisma.platformSetting.findMany({
      where: {
        key: {
          in: [
            'paymobEnabled',
            'paymobApiKey',
            'paymobIntegrationId',
            'paymobIframeId',
            'paymobHmac',
            'paymobSandbox',
            'featuredAdPrice',
            'featuredAdCurrency',
          ],
        },
      },
    });

    const config: Record<string, string> = {};
    settings.forEach((s) => {
      config[s.key] = s.value;
    });

    const isEnabled = config.paymobEnabled === 'true';
    if (!isEnabled) {
      return NextResponse.json(
        { error: 'بوابة الدفع معطلة حالياً من قبل الإدارة' },
        { status: 400 }
      );
    }

    const price = parseFloat(config.featuredAdPrice || '100') || 100;
    const currency = config.featuredAdCurrency || 'EGP';
    const amountCents = Math.round(price * 100);
    const isSandbox = config.paymobSandbox !== 'false';
    const apiKey = config.paymobApiKey?.trim() || '';
    const integrationId = config.paymobIntegrationId?.trim() || '';
    const iframeId = config.paymobIframeId?.trim() || '';

    const merchantOrderId = `KH-FEAT-${ad.id.slice(-6)}-${Date.now()}`;

    // Create a pending Payment record in database
    const payment = await prisma.payment.create({
      data: {
        adId: ad.id,
        userId: user.id,
        amount: price,
        currency,
        status: 'PENDING',
        paymobOrderId: merchantOrderId,
      },
    });

    // Determine Base URL for callbacks
    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8989';
    const callbackUrl = `${origin}/api/payments/paymob/callback?paymentId=${payment.id}`;

    // Live Paymob Integration: If real API Key and Integration ID are provided
    if (apiKey && integrationId && !isSandbox) {
      try {
        // Step 1: Authentication Token
        const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_key: apiKey }),
        });
        const authData = await authRes.json();
        const authToken = authData.token;

        if (!authToken) {
          throw new Error('فشل المصادقة مع Paymob. تأكد من صحة الـ API Key في لوحة التحكم.');
        }

        // Step 2: Order Registration
        const orderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth_token: authToken,
            delivery_needed: 'false',
            amount_cents: amountCents,
            currency,
            merchant_order_id: merchantOrderId,
            items: [
              {
                name: `ترقية الإعلان: ${ad.title.slice(0, 40)}`,
                amount_cents: amountCents,
                quantity: 1,
              },
            ],
          }),
        });
        const orderData = await orderRes.json();
        const paymobOrderId = orderData.id;

        // Step 3: Payment Key Request
        const [firstName = 'عميل', lastName = 'خشاله'] = (user.name || '').split(' ');
        const paymentKeyRes = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth_token: authToken,
            amount_cents: amountCents,
            expiration: 3600,
            order_id: paymobOrderId,
            billing_data: {
              first_name: firstName || 'عميل',
              last_name: lastName || 'خشاله',
              email: user.email || 'customer@khashala.com',
              phone_number: user.phone || '+201000000000',
              apartment: 'NA',
              floor: 'NA',
              street: 'NA',
              building: 'NA',
              shipping_method: 'PKG',
              postal_code: 'NA',
              city: ad.city || 'Cairo',
              country: 'EG',
              state: 'NA',
            },
            currency,
            integration_id: parseInt(integrationId, 10),
          }),
        });
        const paymentKeyData = await paymentKeyRes.json();
        const paymentToken = paymentKeyData.token;

        if (!paymentToken) {
          throw new Error('فشل استخراج مفتاح الدفع. تأكد من صحة الـ Integration ID.');
        }

        // Update payment record with paymob order id
        await prisma.payment.update({
          where: { id: payment.id },
          data: { paymobOrderId: String(paymobOrderId) },
        });

        // Paymob Iframe URL
        const paymobIframeUrl = iframeId
          ? `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`
          : `https://accept.paymob.com/unifiedcheckout/?publicKey=${apiKey}&clientSecret=${paymentToken}`;

        return NextResponse.json({
          success: true,
          mode: 'LIVE',
          paymentId: payment.id,
          paymentUrl: paymobIframeUrl,
          price,
          currency,
          adTitle: ad.title,
        });
      } catch (paymobErr: any) {
        console.error('Paymob Live API Error:', paymobErr);
        // Fallback to error message
        return NextResponse.json(
          { error: paymobErr.message || 'حدث خطأ في الاتصال مع Paymob' },
          { status: 502 }
        );
      }
    }

    // Sandbox / Test Simulator Mode:
    // Allows instant end-to-end testing without blocking when keys are in test mode
    const testCheckoutUrl = `${origin}/api/payments/paymob/callback?paymentId=${payment.id}&success=true&txn_response_code=APPROVED&order_id=${merchantOrderId}&simulated=true`;

    return NextResponse.json({
      success: true,
      mode: 'SANDBOX',
      paymentId: payment.id,
      paymentUrl: testCheckoutUrl,
      price,
      currency,
      adTitle: ad.title,
      note: 'وضع التجربة (Sandbox) مفعل: سيتم تنفيذ الترقية بنجاح لاختبار ميزة ظهور الإعلان في أول القسم.',
    });
  } catch (error: any) {
    console.error('Initiate payment error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء بدء عملية الدفع' },
      { status: 500 }
    );
  }
}
