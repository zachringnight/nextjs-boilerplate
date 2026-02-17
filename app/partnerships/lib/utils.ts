export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function isExpiringSoon(contractEnd: string | null, days = 90): boolean {
  if (!contractEnd) return false;
  const end = new Date(contractEnd + 'T00:00:00');
  const now = new Date();
  const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return end >= now && end <= threshold;
}

export function isExpired(contractEnd: string | null): boolean {
  if (!contractEnd) return false;
  const end = new Date(contractEnd + 'T00:00:00');
  return end < new Date();
}

export function hasNoAnnouncement(specialNotes: string | null): boolean {
  if (!specialNotes) return false;
  return specialNotes.toUpperCase().includes('NO ANNOUNCEMENT');
}

export function formatObligationType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatDealType(type: string): string {
  return type === 'exclusive' ? 'Exclusive' : 'Non-Exclusive';
}

export function daysUntilExpiry(contractEnd: string | null): number | null {
  if (!contractEnd) return null;
  const end = new Date(contractEnd + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function urgencyColor(days: number | null): { bg: string; text: string; border: string; label: string } {
  if (days === null) return { bg: 'bg-[#6B7280]/10', text: 'text-[#6B7280]', border: 'border-[#6B7280]/30', label: 'No End Date' };
  if (days < 0) return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', label: 'Expired' };
  if (days <= 30) return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', label: 'Critical' };
  if (days <= 90) return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Soon' };
  return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', label: 'On Track' };
}

export function formatDaysRemaining(days: number | null): string {
  if (days === null) return 'No end date';
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'Expires today';
  if (days === 1) return '1 day left';
  return `${days}d left`;
}
