import type { Metadata, Viewport } from 'next';
import BottomNav from './components/BottomNav';
import GlobalSearch from './components/GlobalSearch';
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration';
import NotificationProvider from './components/NotificationProvider';
import AppErrorBoundary from './components/AppErrorBoundary';
import './prizm.css';

export const metadata: Metadata = {
  title: 'Prizm Lounge Production Hub',
  description: 'Production coordination for Panini America Prizm Lounge at Super Bowl LX',
  manifest: '/prizm/manifest.json',
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
      <AppErrorBoundary>
        <main className="pb-20">
          {children}
        </main>
      </AppErrorBoundary>
      <BottomNav />
    </div>
  );
}
