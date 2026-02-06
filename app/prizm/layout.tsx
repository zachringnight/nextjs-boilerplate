import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';
import BottomNav from './components/BottomNav';
import GlobalSearch from './components/GlobalSearch';
import ConnectionBanner from './components/ConnectionBanner';
import AppErrorBoundary from './components/AppErrorBoundary';
import './prizm.css';

const ClipProvider = dynamic(() => import('./components/ClipProvider'));
const SupabaseProvider = dynamic(() => import('./components/SupabaseProvider'));
const NotificationProvider = dynamic(() => import('./components/NotificationProvider'));
const ServiceWorkerRegistration = dynamic(() => import('./components/ServiceWorkerRegistration'));

export const metadata: Metadata = {
  title: {
    default: 'Prizm Lounge Production Hub',
    template: '%s | Prizm Lounge',
  },
  description: 'Production coordination for Panini America Prizm Lounge at Super Bowl LX — San Francisco Bay Area, Feb 5-7 2026.',
  manifest: '/prizm/manifest.json',
  metadataBase: new URL('https://productionpacket.com'),
  openGraph: {
    siteName: 'Prizm Lounge Production Hub',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Prizm Hub',
  },
  icons: {
    icon: '/prizm/icons/icon.svg',
    apple: '/prizm/icons/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0D0D0D',
};

export default function PrizmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white prizm-app">
      <ServiceWorkerRegistration />
      <NotificationProvider />
      <GlobalSearch />
      <SupabaseProvider />
      <ClipProvider />
      <ConnectionBanner />
      <AppErrorBoundary>
        <main className="pb-20">
          {children}
        </main>
      </AppErrorBoundary>
      <BottomNav />
    </div>
  );
}
