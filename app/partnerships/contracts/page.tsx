'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import SideNav from '../components/SideNav';
import BottomNav from '../components/BottomNav';
import StatusBadge from '../components/StatusBadge';
import SportBadge from '../components/SportBadge';
import EmptyState from '../components/EmptyState';
import { SkeletonBlock } from '../components/Skeleton';
import { useMounted } from '../hooks/useMounted';
import { usePartnershipsStore } from '../store';
import { fetchContractsWithObligationCounts } from '../lib/queries';
import {
  formatDate,
  hasNoAnnouncement,
  isExpired,
  isExpiringSoon,
  daysUntilExpiry,
  urgencyColor,
  formatDaysRemaining,
  cn,
} from '../lib/utils';
import { SPORTS, SPORT_ACCENT_COLORS } from '../lib/constants';
import type { Athlete, AthleteContract } from '../types';

type ContractRow = AthleteContract & { athlete: Athlete; obligation_count: number; completed_count: number };
type SortKey = 'athlete' | 'end_date' | 'start_date' | 'status' | 'obligations';
type UrgencyFilter = 'all' | 'critical' | 'warning' | 'on_track';

function getStatus(c: AthleteContract): 'active' | 'expired' | 'expiring' {
  if (isExpired(c.contract_end)) return 'expired';
  if (isExpiringSoon(c.contract_end)) return 'expiring';
  return 'active';
}

const STATUS_BORDER: Record<string, string> = {
  active: 'border-l-green-500',
  expired: 'border-l-red-500',
  expiring: 'border-l-yellow-500',
};

export default function ContractsPage() {
  const mounted = useMounted();
  const { contractFilters, setContractFilters, refreshKey } = usePartnershipsStore();
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('end_date');
  const [urgency, setUrgency] = useState<UrgencyFilter>('all');

  const loadContracts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchContractsWithObligationCounts();
      setContracts(data as ContractRow[]);
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

  const filtered = useMemo(() => {
    let result = contracts.filter((c) => {
      // Status filter
      if (contractFilters.status === 'active') {
        if (isExpired(c.contract_end)) return false;
      } else if (contractFilters.status === 'expired') {
        if (!isExpired(c.contract_end)) return false;
      }
      if (contractFilters.dealType !== 'all' && c.deal_type !== contractFilters.dealType) return false;
      if (contractFilters.sport !== 'all' && c.athlete?.sport !== contractFilters.sport) return false;
      if (contractFilters.search) {
        const search = contractFilters.search.toLowerCase();
        const name = c.athlete?.name?.toLowerCase() ?? '';
        if (!name.includes(search)) return false;
      }

      // Urgency filter
      if (urgency !== 'all') {
        const days = daysUntilExpiry(c.contract_end);
        if (urgency === 'critical' && (days === null || days < 0 || days > 30)) return false;
        if (urgency === 'warning' && (days === null || days <= 30 || days > 90)) return false;
        if (urgency === 'on_track' && days !== null && days >= 0 && days <= 90) return false;
      }

      return true;
    });

    switch (sortBy) {
      case 'athlete':
        result.sort((a, b) => (a.athlete?.name ?? '').localeCompare(b.athlete?.name ?? ''));
        break;
      case 'end_date':
        result.sort((a, b) => {
          const aDate = a.contract_end ? new Date(a.contract_end).getTime() : Infinity;
          const bDate = b.contract_end ? new Date(b.contract_end).getTime() : Infinity;
          return aDate - bDate;
        });
        break;
      case 'start_date':
        result.sort((a, b) => {
          const aDate = a.contract_start ? new Date(a.contract_start).getTime() : 0;
          const bDate = b.contract_start ? new Date(b.contract_start).getTime() : 0;
          return bDate - aDate;
        });
        break;
      case 'status':
        result.sort((a, b) => {
          const order = { expiring: 0, active: 1, expired: 2 };
          return order[getStatus(a)] - order[getStatus(b)];
        });
        break;
      case 'obligations':
        result.sort((a, b) => b.obligation_count - a.obligation_count);
        break;
    }
    return result;
  }, [contracts, contractFilters, sortBy, urgency]);

  // Summary counts
  const activeCt = contracts.filter((c) => !isExpired(c.contract_end)).length;
  const expiredCt = contracts.filter((c) => isExpired(c.contract_end)).length;
  const expiringCt = contracts.filter((c) => isExpiringSoon(c.contract_end)).length;
  const criticalCt = contracts.filter((c) => { const d = daysUntilExpiry(c.contract_end); return d !== null && d >= 0 && d <= 30; }).length;

  if (!mounted) return null;

  return (
    <>
      <SideNav className="hidden md:flex" />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-4">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Contracts</h1>
            {!loading && (
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => setContractFilters({ status: 'all' })}
                  className={cn('text-sm transition-colors', contractFilters.status === 'all' ? 'text-white font-medium' : 'text-[#6B7280] hover:text-white')}
                >
                  All <span className="text-[#6B7280]">({contracts.length})</span>
                </button>
                <button
                  onClick={() => setContractFilters({ status: 'active' })}
                  className={cn('text-sm transition-colors', contractFilters.status === 'active' ? 'text-green-400 font-medium' : 'text-[#6B7280] hover:text-white')}
                >
                  Active <span className="text-[#6B7280]">({activeCt})</span>
                </button>
                <button
                  onClick={() => setContractFilters({ status: 'expired' })}
                  className={cn('text-sm transition-colors', contractFilters.status === 'expired' ? 'text-red-400 font-medium' : 'text-[#6B7280] hover:text-white')}
                >
                  Expired <span className="text-[#6B7280]">({expiredCt})</span>
                </button>
                {expiringCt > 0 && (
                  <span className="text-yellow-400 text-xs font-medium px-2 py-0.5 bg-yellow-400/10 rounded-full">
                    {expiringCt} expiring soon
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Urgency filter chips */}
          {!loading && (
            <div className="flex flex-wrap gap-2">
              {([
                { key: 'all' as const, label: 'All Urgencies' },
                { key: 'critical' as const, label: `Critical < 30d (${criticalCt})` },
                { key: 'warning' as const, label: `Warning < 90d (${expiringCt - criticalCt})` },
                { key: 'on_track' as const, label: 'On Track' },
              ]).map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => setUrgency(urgency === chip.key ? 'all' : chip.key)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                    urgency === chip.key
                      ? chip.key === 'critical' ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : chip.key === 'warning' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                        : chip.key === 'on_track' ? 'bg-green-500/15 text-green-400 border-green-500/30'
                        : 'bg-[#FFD100]/15 text-[#FFD100] border-[#FFD100]/30'
                      : 'bg-[#1A1A1A] text-[#9CA3AF] border-[#2A2A2A] hover:border-[#3A3A3A] hover:text-white'
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                value={contractFilters.search}
                onChange={(e) => setContractFilters({ search: e.target.value })}
                placeholder="Search by athlete name..."
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:border-[#FFD100] focus:outline-none placeholder:text-[#4B5563]"
              />
            </div>
            <select
              value={contractFilters.dealType}
              onChange={(e) => setContractFilters({ dealType: e.target.value })}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            >
              <option value="all">All Deal Types</option>
              <option value="exclusive">Exclusive</option>
              <option value="non_exclusive">Non-Exclusive</option>
            </select>
            <select
              value={contractFilters.sport}
              onChange={(e) => setContractFilters({ sport: e.target.value })}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            >
              <option value="all">All Sports</option>
              {SPORTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            >
              <option value="end_date">Sort: End Date</option>
              <option value="start_date">Sort: Start Date</option>
              <option value="athlete">Sort: Athlete</option>
              <option value="status">Sort: Status</option>
              <option value="obligations">Sort: Obligations</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>
          )}

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-20" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No contracts found" description="Try adjusting your filters." />
          ) : (
            <>
              <div className="space-y-2">
                {filtered.map((c) => {
                  const status = getStatus(c);
                  const days = daysUntilExpiry(c.contract_end);
                  const urg = urgencyColor(days);
                  const accentColor = c.athlete?.sport ? SPORT_ACCENT_COLORS[c.athlete.sport] ?? '#6B7280' : '#6B7280';
                  return (
                    <Link
                      key={c.id}
                      href={`/partnerships/athletes/${c.athlete_id}`}
                      className={cn(
                        'block bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 hover:border-[#FFD100]/30 transition-all group border-l-[3px]',
                        STATUS_BORDER[status]
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Avatar */}
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                            style={{ background: `${accentColor}20`, color: accentColor }}
                          >
                            {(c.athlete?.name ?? '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white font-semibold text-sm group-hover:text-[#FFD100] transition-colors">
                                {c.athlete?.name ?? 'Unknown'}
                              </span>
                              {c.athlete?.sport && <SportBadge sport={c.athlete.sport} />}
                              <StatusBadge variant={status} />
                              <StatusBadge variant={c.deal_type === 'exclusive' ? 'exclusive' : 'non_exclusive'} />
                              {hasNoAnnouncement(c.special_notes) && (
                                <span className="text-yellow-400 text-xs font-semibold px-1.5 py-0.5 bg-yellow-400/10 rounded">NO ANN.</span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1.5 text-xs text-[#6B7280]">
                              <span>{formatDate(c.contract_start)} &mdash; {formatDate(c.contract_end)}</span>
                              {c.contract_end_note && <span>({c.contract_end_note})</span>}
                              {c.exclusivity_scope && <span className="capitalize">{c.exclusivity_scope.replace(/_/g, ' ')}</span>}
                            </div>
                          </div>
                        </div>
                        {/* Right side: urgency + obligations */}
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          {/* Obligation count */}
                          {c.obligation_count > 0 && (
                            <div className="text-right">
                              <span className="text-white text-sm font-semibold">{c.completed_count}/{c.obligation_count}</span>
                              <p className="text-[#6B7280] text-[10px]">deliverables</p>
                            </div>
                          )}
                          {/* Days remaining */}
                          {!isExpired(c.contract_end) && days !== null && (
                            <span className={cn('text-xs font-semibold px-2 py-1 rounded-full', urg.bg, urg.text)}>
                              {formatDaysRemaining(days)}
                            </span>
                          )}
                          <span className="text-[#4B5563] group-hover:text-[#9CA3AF] transition-colors shrink-0 mt-1">&rarr;</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <p className="text-[#6B7280] text-xs text-center pt-2">
                Showing {filtered.length} of {contracts.length} contract{contracts.length !== 1 ? 's' : ''}
              </p>
            </>
          )}
        </div>
      </main>
      <BottomNav className="md:hidden" />
    </>
  );
}
