import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.platformSetting.findMany({
      where: {
        key: {
          in: [
            'paymobEnabled',
            'featuredAdPrice',
            'featuredAdCurrency',
            'featuredDurationDays',
            'paymobSandbox',
          ],
        },
      },
    });

    const configMap: Record<string, string> = {};
    settings.forEach((s) => {
      configMap[s.key] = s.value;
    });

    const isEnabled = configMap.paymobEnabled === 'true';
    const price = parseFloat(configMap.featuredAdPrice || '100') || 100;
    const currency = configMap.featuredAdCurrency || 'EGP';
    const durationDays = parseInt(configMap.featuredDurationDays || '30', 10) || 30;
    const isSandbox = configMap.paymobSandbox !== 'false';

    return NextResponse.json({
      enabled: isEnabled,
      price,
      currency,
      durationDays,
      isSandbox,
    });
  } catch (error: any) {
    console.error('Error fetching Paymob public config:', error);
    return NextResponse.json(
      {
        enabled: false,
        price: 100,
        currency: 'EGP',
        durationDays: 30,
        isSandbox: true,
      },
      { status: 200 }
    );
  }
}
