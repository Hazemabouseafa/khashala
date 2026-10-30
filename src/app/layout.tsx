import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const viewport: Viewport = {
  themeColor: '#1e3a8a',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-arabic antialiased flex flex-col min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-sky-100 text-slate-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
