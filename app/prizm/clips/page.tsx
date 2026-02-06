import type { Metadata } from 'next';
import ClipsContent from './ClipsContent';

export const metadata: Metadata = {
  title: 'Clip Markers | Prizm Lounge Production Hub',
  description: 'Clip marker tracking for Panini America Prizm Lounge at Super Bowl LX — mark, rate, and export production clips.',
  openGraph: {
    title: 'Prizm Lounge — Clip Markers',
    description: 'Clip marker tracking for the Panini America Prizm Lounge at Super Bowl LX.',
    siteName: 'Prizm Lounge Production Hub',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prizm Lounge — Clip Markers',
    description: 'Clip marker tracking for the Panini America Prizm Lounge at Super Bowl LX.',
  },
};

export default function ClipsPage() {
  return <ClipsContent />;
}
