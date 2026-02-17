'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SideNav from '../components/SideNav';
import BottomNav from '../components/BottomNav';
import StatusBadge from '../components/StatusBadge';
import SportBadge from '../components/SportBadge';
import EmptyState from '../components/EmptyState';
import { SkeletonBlock } from '../components/Skeleton';
import { useMounted } from '../hooks/useMounted';
import { usePartnershipsStore } from '../store';
import { fetchAllContracts } from '../lib/queries';
import { formatDate, formatDealType, hasNoAnnouncement, isExpired, isExpiringSoon, cn } from '../lib/utils';
import { SPORTS } from '../lib/constants';
import type { Athlete, AthleteContract } from '../types';

type ContractWithAthlete = AthleteContract & { athlete: Athlete };

export default function ContractsPage() {
  const mounted = useMounted();
  const { contractFilters, setContractFilters, refreshKey } = usePartnershipsStore();
  const [contracts, setContracts] = useState<ContractWithAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContracts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllContracts();
      setContracts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mounted) return;
    loadContracts();
  }, [mounted, loadContracts]);

  // Client-side filtering
  const filtered = contracts.filter((c) => {
    // Status filter
    if (contractFilters.status === 'active') {
      if (isExpired(c.contract_end)) return false;
    } else if (contractFilters.status === 'expired') {
      if (!isExpired(c.contract_end)) return false;
    }

    // Deal type filter
    if (contractFilters.dealType !== 'all' && c.deal_type !== contractFilters.dealType) return false;

    // Sport filter
    if (contractFilters.sport !== 'all' && c.athlete?.sport !== contractFilters.sport) return false;

    // Search
    if (contractFilters.search) {
      const search = contractFilters.search.toLowerCase();
      const name = c.athlete?.name?.toLowerCase() ?? '';
      if (!name.includes(search)) return false;
    }

    return true;
  });

  function getStatus(c: AthleteContract): 'active' | 'expired' | 'expiring' {
    if (isExpired(c.contract_end)) return 'expired';
    if (isExpiringSoon(c.contract_end)) return 'expiring';
    return 'active';
  }

  if (!mounted) return null;

  return (
    <>
      <SideNav className="hidden md:flex" />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold text-white">Contracts</h1>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={contractFilters.search}
              onChange={(e) => setContractFilters({ search: e.target.value })}
              placeholder="Search by athlete name..."
              className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            />
            <select
              value={contractFilters.status}
              onChange={(e) => setContractFilters({ status: e.target.value as 'active' | 'expired' | 'all' })}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
            <select
              value={contractFilters.dealType}
              onChange={(e) => setContractFilters({ dealType: e.target.value })}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            >
              <option value="all">All Deal Types</option>
              <option value="exclusive">Exclusive</option>
              <option value="non_exclusive">Non-Exclusive</option>
            </select>
            <select
              value={contractFilters.sport}
              onChange={(e) => setContractFilters({ sport: e.target.value })}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            >
              <option value="all">All Sports</option>
              {SPORTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>
          )}

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-20" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No contracts found" description="Try adjusting your filters." />
          ) : (
            <div className="space-y-3">
              {filtered.map((c) => (
                <Link
                  key={c.id}
                  href={`/partnerships/athletes/${c.athlete_id}`}
                  className="block bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 hover:border-[#FFD100]/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-sm">{c.athlete?.name ?? 'Unknown'}</span>
                        {c.athlete?.sport && <SportBadge sport={c.athlete.sport} />}
                        <StatusBadge variant={getStatus(c)} />
                        <StatusBadge variant={c.deal_type === 'exclusive' ? 'exclusive' : 'non_exclusive'} />
                        {hasNoAnnouncement(c.special_notes) && (
                          <span className="text-yellow-400 text-xs font-semibold">NO ANN.</span>
                        )}
                      </div>
                      <div className="flex gap-4 mt-1.5 text-xs text-[#6B7280]">
                        <span>{formatDate(c.contract_start)} — {formatDate(c.contract_end)}</span>
                        {c.contract_end_note && <span>({c.contract_end_note})</span>}
                        {c.exclusivity_scope && <span>{c.exclusivity_scope.replace(/_/g, ' ')}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              <p className="text-[#6B7280] text-xs text-center pt-2">
                {filtered.length} contract{filtered.length !== 1 ? 's' : ''} shown
              </p>
            </div>
          )}
        </div>
      </main>
      <BottomNav className="md:hidden" />
    </>
  );
}
