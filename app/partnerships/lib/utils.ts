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
