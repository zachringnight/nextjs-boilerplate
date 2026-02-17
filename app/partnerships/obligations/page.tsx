'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SideNav from '../components/SideNav';
import BottomNav from '../components/BottomNav';
import SportBadge from '../components/SportBadge';
import EmptyState from '../components/EmptyState';
import { SkeletonBlock } from '../components/Skeleton';
import { useMounted } from '../hooks/useMounted';
import { usePartnershipsStore } from '../store';
import { fetchAllObligations } from '../lib/queries';
import { formatObligationType } from '../lib/utils';
import { OBLIGATION_TYPES } from '../lib/constants';
import type { Athlete, AthleteContract, MarketingObligation } from '../types';

type ObligationWithContext = MarketingObligation & {
  contract: AthleteContract & { athlete: Athlete };
};

export default function ObligationsPage() {
  const mounted = useMounted();
  const { obligationFilters, setObligationFilters, refreshKey } = usePartnershipsStore();
  const [obligations, setObligations] = useState<ObligationWithContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const filtered = obligations.filter((o) => {
    if (obligationFilters.type !== 'all' && o.obligation_type !== obligationFilters.type) return false;
    if (obligationFilters.search) {
      const search = obligationFilters.search.toLowerCase();
      const name = o.contract?.athlete?.name?.toLowerCase() ?? '';
      if (!name.includes(search)) return false;
    }
    return true;
  });

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
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold text-white">Obligations</h1>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={obligationFilters.search}
              onChange={(e) => setObligationFilters({ search: e.target.value })}
              placeholder="Search by athlete name..."
              className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            />
            <select
              value={obligationFilters.type}
              onChange={(e) => setObligationFilters({ type: e.target.value })}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            >
              <option value="all">All Types</option>
              {OBLIGATION_TYPES.map((t) => (
                <option key={t} value={t}>{formatObligationType(t)}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>
          )}

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-14" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No obligations found" description="Try adjusting your filters." />
          ) : (
            <>
              <p className="text-[#6B7280] text-xs">
                {filtered.length} obligation{filtered.length !== 1 ? 's' : ''} across {athleteMap.size} athlete{athleteMap.size !== 1 ? 's' : ''}
              </p>

              <div className="space-y-2">
                {filtered.map((o) => (
                  <Link
                    key={o.id}
                    href={`/partnerships/athletes/${o.contract?.athlete_id}`}
                    className="flex items-center justify-between p-3 bg-[#141414] border border-[#2A2A2A] rounded-xl hover:border-[#FFD100]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium truncate">
                            {o.contract?.athlete?.name ?? 'Unknown'}
                          </span>
                          {o.contract?.athlete?.sport && <SportBadge sport={o.contract.athlete.sport} />}
                        </div>
                        <div className="flex gap-3 text-xs text-[#6B7280] mt-0.5">
                          <span className="text-[#FFD100]/70">{formatObligationType(o.obligation_type)}</span>
                          {o.platform && <span>{o.platform}</span>}
                          {o.notes && <span className="truncate max-w-[200px]">{o.notes}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      {o.quantity_per_year != null && (
                        <span className="text-white text-sm font-medium">{o.quantity_per_year}/yr</span>
                      )}
                      {o.quantity_total != null && (
                        <span className="text-white text-sm font-medium">{o.quantity_total} total</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <BottomNav className="md:hidden" />
    </>
  );
}
