import { SPORT_COLORS } from '../lib/constants';
import { cn } from '../lib/utils';

export default function SportBadge({ sport }: { sport: string | null }) {
  const s = sport ?? 'Unknown';
  const colorClass = SPORT_COLORS[s] ?? 'bg-[#6B7280]/20 text-[#9CA3AF]';
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', colorClass)}>
      {s}
    </span>
  );
}
