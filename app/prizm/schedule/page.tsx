import type { Metadata } from 'next';
import ScheduleContent from './ScheduleContent';

export const metadata: Metadata = {
  title: 'Schedule | Prizm Lounge Production Hub',
  description: 'Three-day player schedule for Panini America Prizm Lounge at Super Bowl LX — Feb 5-7, 2026.',
  openGraph: {
    title: 'Prizm Lounge — Schedule',
    description: 'Player schedule for the Panini America Prizm Lounge at Super Bowl LX.',
    siteName: 'Prizm Lounge Production Hub',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prizm Lounge — Schedule',
    description: 'Player schedule for the Panini America Prizm Lounge at Super Bowl LX.',
  },
};

export default function SchedulePage() {
  return <ScheduleContent />;
}
