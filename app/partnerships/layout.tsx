import type { Metadata, Viewport } from 'next';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import './partnerships.css';

export const metadata: Metadata = {
  title: {
    default: 'Panini Partnerships',
    template: '%s | Panini Partnerships',
  },
  description: 'Partnership contract management for Panini America — Ring Night AOR.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Partnerships',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0D0D0D',
};

export default function PartnershipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#0D0D0D] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_-10%,rgba(255,209,0,0.12),transparent_35%)]" />
      </div>

      <Header />

      <ErrorBoundary>
        <div className="flex">
          {children}
        </div>
      </ErrorBoundary>
    </div>
  );
}
