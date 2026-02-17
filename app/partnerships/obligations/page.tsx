'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import SideNav from '../components/SideNav';
import BottomNav from '../components/BottomNav';
import SportBadge from '../components/SportBadge';
import EmptyState from '../components/EmptyState';
import { SkeletonBlock } from '../components/Skeleton';
import { useMounted } from '../hooks/useMounted';
import { usePartnershipsStore } from '../store';
import { fetchAllObligations } from '../lib/queries';
import { formatObligationType, cn } from '../lib/utils';
import { OBLIGATION_TYPES, SPORT_ACCENT_COLORS } from '../lib/constants';
import type { Athlete, AthleteContract, MarketingObligation } from '../types';

type ObligationWithContext = MarketingObligation & {
  contract: AthleteContract & { athlete: Athlete };
};

type SortKey = 'athlete' | 'type' | 'quantity';

export default function ObligationsPage() {
  const mounted = useMounted();
  const { obligationFilters, setObligationFilters, refreshKey } = usePartnershipsStore();
  const [obligations, setObligations] = useState<ObligationWithContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('athlete');

  const loadObligations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllObligations();
      setObligations(data as ObligationWithContext[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load obligations');
    } finally {
      setLoading(false);
    }
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mounted) return;
    loadObligations();
  }, [mounted, loadObligations]);

  const filtered = useMemo(() => {
    let result = obligations.filter((o) => {
      if (obligationFilters.type !== 'all' && o.obligation_type !== obligationFilters.type) return false;
      if (obligationFilters.search) {
        const search = obligationFilters.search.toLowerCase();
        const name = o.contract?.athlete?.name?.toLowerCase() ?? '';
        if (!name.includes(search)) return false;
      }
      return true;
    });

    switch (sortBy) {
      case 'athlete':
        result.sort((a, b) => (a.contract?.athlete?.name ?? '').localeCompare(b.contract?.athlete?.name ?? ''));
        break;
      case 'type':
        result.sort((a, b) => a.obligation_type.localeCompare(b.obligation_type));
        break;
      case 'quantity':
        result.sort((a, b) => (b.quantity_per_year ?? b.quantity_total ?? 0) - (a.quantity_per_year ?? a.quantity_total ?? 0));
        break;
    }
    return result;
  }, [obligations, obligationFilters, sortBy]);

  // Type breakdown for summary chips
  const typeBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of obligations) {
      map.set(o.obligation_type, (map.get(o.obligation_type) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [obligations]);

  // Group by athlete for summary
  const athleteMap = new Map<number, { name: string; sport: string | null; count: number }>();
  for (const o of filtered) {
    const aid = o.contract?.athlete_id;
    if (aid && !athleteMap.has(aid)) {
      athleteMap.set(aid, { name: o.contract.athlete?.name ?? '', sport: o.contract.athlete?.sport ?? null, count: 0 });
    }
    if (aid) {
      athleteMap.get(aid)!.count++;
    }
  }

  if (!mounted) return null;

  return (
    <>
      <SideNav className="hidden md:flex" />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-4">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Obligations</h1>
            {!loading && (
              <p className="text-[#6B7280] text-sm mt-1">
                {filtered.length} obligation{filtered.length !== 1 ? 's' : ''} across {athleteMap.size} athlete{athleteMap.size !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Type chips - quick filter */}
          {!loading && typeBreakdown.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setObligationFilters({ type: 'all' })}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                  obligationFilters.type === 'all'
                    ? 'bg-[#FFD100]/15 text-[#FFD100] border-[#FFD100]/30'
                    : 'bg-[#1A1A1A] text-[#9CA3AF] border-[#2A2A2A] hover:border-[#3A3A3A] hover:text-white'
                )}
              >
                All ({obligations.length})
              </button>
              {typeBreakdown.slice(0, 8).map(([type, count]) => (
                <button
                  key={type}
                  onClick={() => setObligationFilters({ type: obligationFilters.type === type ? 'all' : type })}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                    obligationFilters.type === type
                      ? 'bg-[#FFD100]/15 text-[#FFD100] border-[#FFD100]/30'
                      : 'bg-[#1A1A1A] text-[#9CA3AF] border-[#2A2A2A] hover:border-[#3A3A3A] hover:text-white'
                  )}
                >
                  {formatObligationType(type)} ({count})
                </button>
              ))}
            </div>
          )}

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                value={obligationFilters.search}
                onChange={(e) => setObligationFilters({ search: e.target.value })}
                placeholder="Search by athlete name..."
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:border-[#FFD100] focus:outline-none placeholder:text-[#4B5563]"
              />
            </div>
            <select
              value={obligationFilters.type}
              onChange={(e) => setObligationFilters({ type: e.target.value })}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            >
              <option value="all">All Types</option>
              {OBLIGATION_TYPES.map((t) => (
                <option key={t} value={t}>{formatObligationType(t)}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            >
              <option value="athlete">Sort: Athlete</option>
              <option value="type">Sort: Type</option>
              <option value="quantity">Sort: Quantity</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>
          )}

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-16" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No obligations found" description="Try adjusting your filters." />
          ) : (
            <div className="space-y-2">
              {filtered.map((o) => {
                const accentColor = o.contract?.athlete?.sport ? SPORT_ACCENT_COLORS[o.contract.athlete.sport] ?? '#6B7280' : '#6B7280';
                return (
                  <Link
                    key={o.id}
                    href={`/partnerships/athletes/${o.contract?.athlete_id}`}
                    className="flex items-center justify-between p-3.5 bg-[#141414] border border-[#2A2A2A] rounded-xl hover:border-[#FFD100]/30 transition-all group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                        style={{ background: `${accentColor}20`, color: accentColor }}
                      >
                        {(o.contract?.athlete?.name ?? '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium truncate group-hover:text-[#FFD100] transition-colors">
                            {o.contract?.athlete?.name ?? 'Unknown'}
                          </span>
                          {o.contract?.athlete?.sport && <SportBadge sport={o.contract.athlete.sport} />}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#6B7280] mt-0.5">
                          <span className="text-[#FFD100]/70 font-medium">{formatObligationType(o.obligation_type)}</span>
                          {o.platform && <span>{o.platform}</span>}
                          {o.notes && <span className="truncate max-w-[200px]">{o.notes}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <div className="text-right">
                        {o.quantity_per_year != null && (
                          <span className="text-white text-sm font-semibold">{o.quantity_per_year}<span className="text-[#6B7280] text-xs font-normal">/yr</span></span>
                        )}
                        {o.quantity_total != null && (
                          <span className="text-white text-sm font-semibold">{o.quantity_total} <span className="text-[#6B7280] text-xs font-normal">total</span></span>
                        )}
                      </div>
                      <span className="text-[#4B5563] group-hover:text-[#9CA3AF] transition-colors">&rarr;</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <BottomNav className="md:hidden" />
    </>
  );
}
