import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';
import Header from './components/Header';
import ConnectionBanner from './components/ConnectionBanner';
import AppErrorBoundary from './components/AppErrorBoundary';
import './asw.css';

const AuthProvider = dynamic(() => import('./components/AuthProvider'));
const AuthStatusBanner = dynamic(() => import('./components/AuthStatusBanner'));
const AuthAccessGate = dynamic(() => import('./components/AuthAccessGate'));
const SupabaseProvider = dynamic(() => import('./components/SupabaseProvider'));
const NotificationProvider = dynamic(() => import('./components/NotificationProvider'));
const QuickClipButton = dynamic(() => import('./components/QuickClipButton'));
const BottomNav = dynamic(() => import('./components/BottomNav'));

export const metadata: Metadata = {
  title: {
    default: 'Panini NBA All-Star Weekend 2026',
    template: '%s | NBA ASW',
  },
  description: 'Production coordination for Panini America NBA All-Star Weekend shoot — Los Angeles, Feb 13-14 2026.',
  metadataBase: new URL('https://productionpacket.com'),
  openGraph: {
    siteName: 'Panini NBA ASW Production Hub',
    type: 'website',
    locale: 'en_US',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NBA ASW',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0D0D0D',
};

export default function ASWLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#0D0D0D] text-white overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_-10%,rgba(255,209,0,0.18),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(59,130,246,0.14),transparent_30%),linear-gradient(180deg,#0d0d0d_0%,#090909_100%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>

      <AuthProvider>
        <SupabaseProvider />
        <NotificationProvider />
        <Header />
        <ConnectionBanner />
        <AuthStatusBanner />

        <AppErrorBoundary>
          <AuthAccessGate>
            <main className="pb-20">{children}</main>
            <QuickClipButton />
            <BottomNav />
          </AuthAccessGate>
        </AppErrorBoundary>
      </AuthProvider>
    </div>
  );
}
