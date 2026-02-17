import { cn } from '../lib/utils';

type BadgeVariant = 'active' | 'expired' | 'expiring' | 'exclusive' | 'non_exclusive';

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  active: 'bg-green-500/15 text-green-400 border-green-500/30',
  expired: 'bg-red-500/15 text-red-400 border-red-500/30',
  expiring: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  exclusive: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  non_exclusive: 'bg-[#6B7280]/15 text-[#9CA3AF] border-[#6B7280]/30',
};

const VARIANT_LABELS: Record<BadgeVariant, string> = {
  active: 'Active',
  expired: 'Expired',
  expiring: 'Expiring Soon',
  exclusive: 'Exclusive',
  non_exclusive: 'Non-Exclusive',
};

export default function StatusBadge({ variant, label }: { variant: BadgeVariant; label?: string }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', VARIANT_STYLES[variant])}>
      {label ?? VARIANT_LABELS[variant]}
    </span>
  );
}
