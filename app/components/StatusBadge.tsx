import { AlertTriangle, Languages, Zap, Clock } from 'lucide-react';
import { STATUS_COLORS, DAY_STYLES } from '../lib/constants';

interface StatusBadgeProps {
  type: 'embargo' | 'translator' | 'current' | 'upcoming' | 'day';
  day?: 1 | 2;
  size?: 'sm' | 'md';
}

export function StatusBadge({ type, day, size = 'sm' }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  switch (type) {
    case 'embargo':
      return (
        <span className={`inline-flex items-center gap-1 ${sizeClasses} rounded ${STATUS_COLORS.embargoed.bg} ${STATUS_COLORS.embargoed.text}`}>
          <AlertTriangle className={iconSize} />
          EMBARGO
        </span>
      );
    case 'translator':
      return (
        <span className={`inline-flex items-center gap-1 ${sizeClasses} rounded ${STATUS_COLORS.translator.bg} ${STATUS_COLORS.translator.text}`}>
          <Languages className={iconSize} />
          Translator
        </span>
      );
    case 'current':
      return (
        <span className={`inline-flex items-center gap-1 ${sizeClasses} rounded bg-amber-500 text-black font-bold animate-pulse`}>
          <Zap className={iconSize} />
          NOW
        </span>
      );
    case 'upcoming':
      return (
        <span className={`inline-flex items-center gap-1 ${sizeClasses} rounded ${STATUS_COLORS.upcoming.bg} ${STATUS_COLORS.upcoming.text}`}>
          <Clock className={iconSize} />
          NEXT
        </span>
      );
    case 'day':
      if (!day) return null;
      return (
        <span className={`${sizeClasses} rounded ${DAY_STYLES[day].badge}`}>
          Day {day}
        </span>
      );
    default:
      return null;
  }
}

interface ClearBadgeProps {
  size?: 'sm' | 'md';
}

export function ClearBadge({ size = 'sm' }: ClearBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses} rounded ${STATUS_COLORS.clear.bg} ${STATUS_COLORS.clear.text}`}>
      Clear
    </span>
  );
}

export function LiveBadge() {
  return (
    <span className="flex items-center gap-1 bg-amber-500 text-black px-2 py-0.5 rounded text-xs font-bold animate-pulse">
      <Zap className="w-3 h-3" />
      LIVE
    </span>
  );
}
