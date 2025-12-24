import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://resourcesjobs.ca';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ResourcesJobs.ca - Canadian Natural Resources Jobs',
    template: '%s | ResourcesJobs.ca',
  },
  description:
    'Find jobs in Canada\'s natural resources sector. Mining, Oil & Gas, Forestry, Fishing, Agriculture, Renewable Energy, and Environmental careers. 10,000+ jobs from 150+ companies.',
  keywords: [
    'jobs Canada',
    'careers Canada',
    'natural resources jobs',
    'mining jobs Canada',
    'oil and gas jobs Alberta',
    'forestry jobs BC',
    'agriculture jobs Saskatchewan',
    'renewable energy jobs',
    'environmental jobs Canada',
    'FIFO jobs Canada',
    'remote jobs Canada',
  ],
  authors: [{ name: 'ResourcesJobs.ca' }],
  creator: 'ResourcesJobs.ca',
  publisher: 'ResourcesJobs.ca',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: siteUrl,
    siteName: 'ResourcesJobs.ca',
    title: 'ResourcesJobs.ca - Canadian Natural Resources Jobs',
    description:
      'Find jobs in Canada\'s natural resources sector. Mining, Oil & Gas, Forestry, Fishing, Agriculture, Renewable Energy, and Environmental careers.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ResourcesJobs.ca - Canadian Natural Resources Jobs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResourcesJobs.ca - Canadian Natural Resources Jobs',
    description:
      'Find jobs in Canada\'s natural resources sector. 10,000+ jobs from 150+ companies.',
    images: ['/og-image.png'],
    creator: '@resourcesjobsca',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'en-CA': siteUrl,
      'fr-CA': `${siteUrl}/fr`,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: 'employment',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
