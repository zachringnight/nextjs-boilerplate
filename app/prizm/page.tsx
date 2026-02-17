import type { Metadata } from 'next';
import DailyOverviewContent from './DailyOverviewContent';

export const metadata: Metadata = {
  title: 'Daily Overview | Prizm Lounge Production Hub',
  description: 'Live production overview for Panini America Prizm Lounge at Super Bowl LX — San Francisco Bay Area, Feb 5-7 2026.',
  openGraph: {
    title: 'Prizm Lounge — Daily Overview',
    description: 'Live production hub for the Panini America Prizm Lounge at Super Bowl LX.',
    siteName: 'Prizm Lounge Production Hub',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prizm Lounge — Daily Overview',
    description: 'Live production hub for the Panini America Prizm Lounge at Super Bowl LX.',
  },
};

export default function DailyOverviewPage() {
  return <DailyOverviewContent />;
}
