import type { PlayerTier } from '../types';

/**
 * Shared tier badge styling used across Prizm components.
 */
export const TIER_STYLES: Record<PlayerTier, { bg: string; text: string; label: string; fullLabel: string }> = {
  1: { bg: 'bg-[#FFD100]/20', text: 'text-[#FFD100]', label: 'T1', fullLabel: 'Tier 1 — Priority' },
  2: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'T2', fullLabel: 'Tier 2' },
  3: { bg: 'bg-[#9CA3AF]/20', text: 'text-[#9CA3AF]', label: 'T3', fullLabel: 'Tier 3' },
  4: { bg: 'bg-[#4B5563]/20', text: 'text-[#6B7280]', label: 'T4', fullLabel: 'Tier 4 — Developmental' },
};
