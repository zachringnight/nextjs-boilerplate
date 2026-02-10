import type { Metadata, Viewport } from 'next';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import './asw.css';

export const metadata: Metadata = {
  title: {
    default: 'Panini NBA All-Star Weekend 2026',
    template: '%s | NBA ASW',
  },
  description: 'Production coordination for Panini America NBA All-Star Weekend shoot — Los Angeles, Feb 12-13 2026.',
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
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0D0D0D',
};

export default function ASWLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <Header />
      <main className="pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
