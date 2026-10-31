import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { BrandingProvider } from '@/components/providers/BrandingProvider';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'خشاله (Khashala) | المنصة الأولى للإعلانات المبوبة في الوطن العربي',
  description:
    'منصة خُشـاله (Khashala) لبيع وشراء السيارات، العقارات، الأجهزة الإلكترونية، الأثاث، والخدمات في جميع الدول العربية. اتصال مباشر وبدون وسيط مع سرعة فائقة وضغط صور فوري.',
  keywords: [
    'إعلانات مبوبة',
    'خشاله',
    'سوق سيارات',
    'عقارات للبيع والإيجار',
    'أجهزة مستعملة',
    'سوق مفتوح',
    'حراج',
    'Khashala',
    'classifieds',
  ],
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'خُشـاله | سوق الإعلانات المبوبة العربي المعتمد',
    description: 'بيع واشترِ كل ما تريد بسهولة وبدون وسيط في كافة الدول والمدن العربية.',
    url: 'https://khashala.com',
    siteName: 'خُشاله (Khashala)',
    images: [
      {
        url: '/logo.svg',
        width: 400,
        height: 100,
        alt: 'شعار منصة خشاله',
      },
    ],
    locale: 'ar_AR',
    type: 'website',
  },
};

function sanitizeHexColor(val: string | undefined, fallback: string): string {
  if (!val) return fallback;
  const clean = val.trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(clean)) return clean;
  return fallback;
}

async function getInitialBranding() {
  try {
    const rows = await prisma.platformSetting.findMany({
      where: {
        key: { in: ['siteLogoUrl', 'iconColor', 'iconBgColor'] },
      },
    });
    const map: Record<string, string> = {};
    rows.forEach((r) => {
      map[r.key] = r.value;
    });
    return {
      siteLogoUrl: map.siteLogoUrl || '',
      iconColor: sanitizeHexColor(map.iconColor, '#dc2626'),
      iconBgColor: sanitizeHexColor(map.iconBgColor, '#ffffff'),
    };
  } catch {
    return {
      siteLogoUrl: '',
      iconColor: '#dc2626',
      iconBgColor: '#ffffff',
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialBranding = await getInitialBranding();

  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      style={
        {
          '--platform-icon-color': initialBranding.iconColor,
          '--platform-icon-bg': initialBranding.iconBgColor,
        } as React.CSSProperties
      }
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="font-arabic antialiased flex flex-col min-h-screen bg-[#f7f8fa] text-[#222222]"
      >
        <BrandingProvider initialBranding={initialBranding}>
          <Header />
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
          <Footer />
          <MobileBottomNav />
        </BrandingProvider>
      </body>
    </html>
  );
}
