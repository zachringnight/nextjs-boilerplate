'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SideNav from './components/SideNav';
import BottomNav from './components/BottomNav';
import StatCard from './components/StatCard';
import StatusBadge from './components/StatusBadge';
import SportBadge from './components/SportBadge';
import { DashboardSkeleton } from './components/Skeleton';
import { useMounted } from './hooks/useMounted';
import { fetchDashboardStats } from './lib/queries';
import { formatDate, hasNoAnnouncement } from './lib/utils';
import { SPORT_ACCENT_COLORS } from './lib/constants';
import type { DashboardStats } from './types';

export default function DashboardPage() {
  const mounted = useMounted();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await fetchDashboardStats();
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

  if (!mounted) return null;

  return (
    <>
      <SideNav className="hidden md:flex" />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Dashboard</h1>
              <p className="text-[#6B7280] text-sm mt-1">Partnership overview and quick stats</p>
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
              {/* Stat cards - clickable with accent colors */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                  label="Athletes"
                  value={stats.totalAthletes}
                  href="/partnerships/athletes"
                  accentColor="#FFD100"
                />
                <StatCard
                  label="Active Contracts"
                  value={stats.activeContracts}
                  href="/partnerships/contracts"
                  accentColor="#22c55e"
                />
                <StatCard
                  label="Expired"
                  value={stats.expiredContracts}
                  href="/partnerships/contracts"
                  accentColor="#ef4444"
                />
                <StatCard
                  label="Obligations"
                  value={stats.totalObligations}
                  href="/partnerships/obligations"
                  accentColor="#3b82f6"
                />
              </div>

              {/* Two-column layout for sport breakdown + quick links */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Sport breakdown with visual bars */}
                <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider">
                      Athletes by Sport
                    </h2>
                    <span className="text-[#6B7280] text-xs">{stats.totalAthletes} total</span>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(stats.sportBreakdown)
                      .sort(([, a], [, b]) => b - a)
                      .map(([sport, count]) => {
                        const pct = stats.totalAthletes > 0 ? (count / stats.totalAthletes) * 100 : 0;
                        const color = SPORT_ACCENT_COLORS[sport] ?? '#6B7280';
                        return (
                          <div key={sport} className="group">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <SportBadge sport={sport} />
                                <span className="text-white text-sm font-medium">{count}</span>
                              </div>
                              <span className="text-[#6B7280] text-xs">{Math.round(pct)}%</span>
                            </div>
                            <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, background: color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Quick actions panel */}
                <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
                  <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider mb-4">
                    Quick Links
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'All Athletes', href: '/partnerships/athletes', icon: '👤', count: stats.totalAthletes },
                      { label: 'Contracts', href: '/partnerships/contracts', icon: '📄', count: stats.activeContracts + stats.expiredContracts },
                      { label: 'Obligations', href: '/partnerships/obligations', icon: '✅', count: stats.totalObligations },
                      { label: 'Team Deals', href: '/partnerships/team-partnerships', icon: '🏟️' },
                      { label: 'Partners', href: '/partnerships/partner-partnerships', icon: '🤝' },
                      { label: 'Events', href: '/partnerships/events', icon: '📅' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1A1A]/50 hover:bg-[#1A1A1A] border border-transparent hover:border-[#2A2A2A] transition-all group"
                      >
                        <span className="text-lg">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-white text-sm font-medium group-hover:text-[#FFD100] transition-colors block truncate">{item.label}</span>
                          {item.count != null && (
                            <span className="text-[#6B7280] text-xs">{item.count}</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Expiring contracts - prominent warning section */}
              {stats.expiringWithin90Days.length > 0 && (
                <div className="bg-[#141414] border border-yellow-500/20 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 bg-yellow-500/5 border-b border-yellow-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                      <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">
                        Expiring Within 90 Days
                      </h2>
                    </div>
                    <span className="text-yellow-400/60 text-xs font-medium">
                      {stats.expiringWithin90Days.length} contract{stats.expiringWithin90Days.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="divide-y divide-[#2A2A2A]/50">
                    {stats.expiringWithin90Days.map((contract) => (
                      <Link
                        key={contract.id}
                        href={`/partnerships/athletes/${contract.athlete_id}`}
                        className="flex items-center justify-between px-5 py-3 hover:bg-[#1A1A1A]/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-white font-medium group-hover:text-[#FFD100] transition-colors truncate">
                            {contract.athlete?.name ?? 'Unknown'}
                          </span>
                          {contract.athlete?.sport && <SportBadge sport={contract.athlete.sport} />}
                          <StatusBadge variant={contract.deal_type === 'exclusive' ? 'exclusive' : 'non_exclusive'} />
                          {hasNoAnnouncement(contract.special_notes) && (
                            <span className="text-yellow-400 text-xs font-semibold px-1.5 py-0.5 bg-yellow-400/10 rounded">NO ANN.</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span className="text-[#6B7280] text-sm">{formatDate(contract.contract_end)}</span>
                          <span className="text-[#4B5563] group-hover:text-[#9CA3AF] transition-colors">&rarr;</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent activities */}
              {stats.recentActivities.length > 0 && (
                <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#2A2A2A]">
                    <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider">
                      Recent Activities
                    </h2>
                  </div>
                  <div className="divide-y divide-[#2A2A2A]/50">
                    {stats.recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between px-5 py-3">
                        <span className="text-white text-sm">{activity.activity_description}</span>
                        <span className="text-[#6B7280] text-xs shrink-0 ml-3">{formatDate(activity.activity_date)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <BottomNav className="md:hidden" />
    </>
  );
}
