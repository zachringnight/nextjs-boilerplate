import type { Metadata } from 'next';
import StationsContent from './StationsContent';

export const metadata: Metadata = {
  title: 'Stations | Prizm Lounge Production Hub',
  description: 'Station tool view for Panini America Prizm Lounge at Super Bowl LX — manage player rotations and talking points.',
  openGraph: {
    title: 'Prizm Lounge — Stations',
    description: 'Station tool for the Panini America Prizm Lounge at Super Bowl LX.',
    siteName: 'Prizm Lounge Production Hub',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prizm Lounge — Stations',
    description: 'Station tool for the Panini America Prizm Lounge at Super Bowl LX.',
  },
};

export default function StationsPage() {
  return <StationsContent />;
}
