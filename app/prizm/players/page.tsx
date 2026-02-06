import type { Metadata } from 'next';
import PlayersContent from './PlayersContent';

export const metadata: Metadata = {
  title: 'Players | Prizm Lounge Production Hub',
  description: 'NFL player roster for Panini America Prizm Lounge at Super Bowl LX — bios, stats, and card history.',
  openGraph: {
    title: 'Prizm Lounge — Players',
    description: 'NFL player roster for the Panini America Prizm Lounge at Super Bowl LX.',
    siteName: 'Prizm Lounge Production Hub',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prizm Lounge — Players',
    description: 'NFL player roster for the Panini America Prizm Lounge at Super Bowl LX.',
  },
};

export default function PlayersPage() {
  return <PlayersContent />;
}
