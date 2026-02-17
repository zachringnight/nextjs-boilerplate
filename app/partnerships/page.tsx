'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import SideNav from './components/SideNav';
import BottomNav from './components/BottomNav';
import StatCard from './components/StatCard';
import StatusBadge from './components/StatusBadge';
import SportBadge from './components/SportBadge';
import { DashboardSkeleton } from './components/Skeleton';
import { useMounted } from './hooks/useMounted';
import { fetchDeliverableTracker } from './lib/queries';
import {
  formatDate,
  formatObligationType,
  hasNoAnnouncement,
  daysUntilExpiry,
  urgencyColor,
  formatDaysRemaining,
  cn,
} from './lib/utils';
import { SPORT_ACCENT_COLORS } from './lib/constants';
import type { DeliverableTrackerStats } from './types';

type UrgencyFilter = 'all' | 'critical' | 'warning' | 'on_track';

export default function DashboardPage() {
  const mounted = useMounted();
  const [stats, setStats] = useState<DeliverableTrackerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await fetchDeliverableTracker();
        if (!cancelled) setStats(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [mounted]);

  const filtered = useMemo(() => {
    if (!stats) return [];
    return stats.rows.filter((row) => {
      const days = daysUntilExpiry(row.contract.contract_end);

      // Urgency filter
      if (urgencyFilter === 'critical' && (days === null || days > 30)) return false;
      if (urgencyFilter === 'warning' && (days === null || days <= 30 || days > 90)) return false;
      if (urgencyFilter === 'on_track' && (days !== null && days <= 90)) return false;

      // Search
      if (search) {
        const s = search.toLowerCase();
        const name = row.contract.athlete?.name?.toLowerCase() ?? '';
        if (!name.includes(s)) return false;
      }

      return true;
    });
  }, [stats, urgencyFilter, search]);

  if (!mounted) return null;

  return (
    <>
      <SideNav className="hidden md:flex" />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Deliverable Tracker
              </h1>
              <p className="text-[#6B7280] text-sm mt-1">
                Active deals sorted by expiration &mdash; track obligations before they expire
              </p>
            </div>
            <Link
              href="/partnerships/athletes"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[#FFD100] text-black font-semibold rounded-lg text-sm hover:bg-[#FFD100]/90 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add Athlete
            </Link>
          </div>

          {loading && <DashboardSkeleton />}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {stats && !loading && (
            <>
              {/* Stat cards - urgency-focused */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                  label="Active Deals"
                  value={stats.totalActiveDeals}
                  href="/partnerships/contracts"
                  accentColor="#22c55e"
                />
                <StatCard
                  label="Critical (< 30d)"
                  value={stats.criticalCount}
                  accentColor="#ef4444"
                  detail={stats.criticalCount > 0 ? 'Needs immediate attention' : 'None'}
                />
                <StatCard
                  label="Expiring (< 90d)"
                  value={stats.warningCount}
                  accentColor="#eab308"
                  detail={stats.warningCount > 0 ? 'Plan deliverables soon' : 'None'}
                />
                <StatCard
                  label="Total Deliverables"
                  value={stats.totalObligations}
                  href="/partnerships/obligations"
                  accentColor="#3b82f6"
                />
              </div>

              {/* Urgency filter tabs + search */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-1 bg-[#141414] border border-[#2A2A2A] rounded-lg p-1">
                  {([
                    { key: 'all', label: 'All', count: stats.rows.length },
                    { key: 'critical', label: 'Critical', count: stats.criticalCount },
                    { key: 'warning', label: 'Warning', count: stats.warningCount },
                    { key: 'on_track', label: 'On Track', count: stats.rows.length - stats.criticalCount - stats.warningCount },
                  ] as const).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setUrgencyFilter(tab.key)}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                        urgencyFilter === tab.key
                          ? 'bg-[#2A2A2A] text-white'
                          : 'text-[#6B7280] hover:text-white'
                      )}
                    >
                      {tab.label} <span className="text-[#6B7280]">({tab.count})</span>
                    </button>
                  ))}
                </div>
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search athlete..."
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none placeholder:text-[#4B5563]"
                  />
                </div>
              </div>

              {/* Deliverable rows */}
              {filtered.length === 0 ? (
                <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-8 text-center">
                  <p className="text-[#6B7280] text-sm">No deals match your filters.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Column header */}
                  <div className="hidden md:grid grid-cols-12 gap-3 px-4 text-xs text-[#6B7280] font-semibold uppercase tracking-wider">
                    <div className="col-span-3">Athlete</div>
                    <div className="col-span-2">End Date</div>
                    <div className="col-span-1">Urgency</div>
                    <div className="col-span-4">Deliverables</div>
                    <div className="col-span-2 text-right">Progress</div>
                  </div>

                  {filtered.map((row) => {
                    const days = daysUntilExpiry(row.contract.contract_end);
                    const urg = urgencyColor(days);
                    const accentColor = row.contract.athlete?.sport
                      ? SPORT_ACCENT_COLORS[row.contract.athlete.sport] ?? '#6B7280'
                      : '#6B7280';

                    // Group obligations by type
                    const oblByType = new Map<string, number>();
                    for (const o of row.obligations) {
                      const qty = o.quantity_per_year ?? o.quantity_total ?? 1;
                      oblByType.set(o.obligation_type, (oblByType.get(o.obligation_type) ?? 0) + qty);
                    }
                    const totalOblQty = Array.from(oblByType.values()).reduce((a, b) => a + b, 0);
                    const progressPct = totalOblQty > 0 ? Math.min(100, Math.round((row.completedCount / totalOblQty) * 100)) : 0;

                    return (
                      <Link
                        key={row.contract.id}
                        href={`/partnerships/athletes/${row.contract.athlete_id}`}
                        className={cn(
                          'block bg-[#141414] border rounded-xl p-4 hover:border-[#FFD100]/30 transition-all group',
                          days !== null && days <= 30 ? 'border-red-500/30' : days !== null && days <= 90 ? 'border-yellow-500/20' : 'border-[#2A2A2A]'
                        )}
                      >
                        {/* Mobile layout */}
                        <div className="md:hidden space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                                style={{ background: `${accentColor}20`, color: accentColor }}
                              >
                                {(row.contract.athlete?.name ?? '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                              </div>
                              <span className="text-white font-semibold text-sm truncate group-hover:text-[#FFD100] transition-colors">
                                {row.contract.athlete?.name ?? 'Unknown'}
                              </span>
                              {row.contract.athlete?.sport && <SportBadge sport={row.contract.athlete.sport} />}
                            </div>
                            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', urg.bg, urg.text)}>
                              {formatDaysRemaining(days)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-[#6B7280]">
                            <span>Ends {formatDate(row.contract.contract_end)}</span>
                            <span>{row.completedCount}/{totalOblQty} completed</span>
                          </div>
                          {/* Progress bar */}
                          <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${progressPct}%`,
                                background: progressPct >= 100 ? '#22c55e' : days !== null && days <= 30 ? '#ef4444' : days !== null && days <= 90 ? '#eab308' : '#3b82f6',
                              }}
                            />
                          </div>
                          {/* Obligation chips */}
                          {oblByType.size > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {Array.from(oblByType.entries()).map(([type, qty]) => (
                                <span key={type} className="px-2 py-0.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-[10px] text-[#9CA3AF]">
                                  {formatObligationType(type)} ({qty})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Desktop layout */}
                        <div className="hidden md:grid grid-cols-12 gap-3 items-center">
                          {/* Athlete */}
                          <div className="col-span-3 flex items-center gap-2 min-w-0">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                              style={{ background: `${accentColor}20`, color: accentColor }}
                            >
                              {(row.contract.athlete?.name ?? '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-semibold text-sm truncate group-hover:text-[#FFD100] transition-colors">
                                  {row.contract.athlete?.name ?? 'Unknown'}
                                </span>
                                {row.contract.athlete?.sport && <SportBadge sport={row.contract.athlete.sport} />}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <StatusBadge variant={row.contract.deal_type === 'exclusive' ? 'exclusive' : 'non_exclusive'} />
                                {hasNoAnnouncement(row.contract.special_notes) && (
                                  <span className="text-yellow-400 text-[10px] font-semibold px-1.5 py-0.5 bg-yellow-400/10 rounded">NO ANN.</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* End Date */}
                          <div className="col-span-2">
                            <span className="text-white text-sm">{formatDate(row.contract.contract_end)}</span>
                            {row.contract.contract_end_note && (
                              <p className="text-[#6B7280] text-[10px] mt-0.5">{row.contract.contract_end_note}</p>
                            )}
                          </div>

                          {/* Urgency badge */}
                          <div className="col-span-1">
                            <span className={cn('text-xs font-semibold px-2 py-1 rounded-full inline-block', urg.bg, urg.text)}>
                              {formatDaysRemaining(days)}
                            </span>
                          </div>

                          {/* Deliverables */}
                          <div className="col-span-4">
                            {oblByType.size > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {Array.from(oblByType.entries()).map(([type, qty]) => (
                                  <span key={type} className="px-2 py-0.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-[10px] text-[#9CA3AF]">
                                    {formatObligationType(type)} ({qty})
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[#4B5563] text-xs">No obligations</span>
                            )}
                          </div>

                          {/* Progress */}
                          <div className="col-span-2 text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <div className="w-16 h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${progressPct}%`,
                                    background: progressPct >= 100 ? '#22c55e' : days !== null && days <= 30 ? '#ef4444' : days !== null && days <= 90 ? '#eab308' : '#3b82f6',
                                  }}
                                />
                              </div>
                              <span className="text-[#9CA3AF] text-xs font-medium w-16 text-right">
                                {row.completedCount}/{totalOblQty}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Quick links to other sections */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { label: 'Athletes', href: '/partnerships/athletes' },
                  { label: 'Contracts', href: '/partnerships/contracts' },
                  { label: 'Obligations', href: '/partnerships/obligations' },
                  { label: 'Team Deals', href: '/partnerships/team-partnerships' },
                  { label: 'Partners', href: '/partnerships/partner-partnerships' },
                  { label: 'Events', href: '/partnerships/events' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-center p-2.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#9CA3AF] text-xs font-medium hover:border-[#FFD100]/30 hover:text-[#FFD100] transition-all"
                  >
                    {item.label}
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
