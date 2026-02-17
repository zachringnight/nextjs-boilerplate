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
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>

          {loading && <DashboardSkeleton />}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {stats && !loading && (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Athletes" value={stats.totalAthletes} />
                <StatCard label="Active Contracts" value={stats.activeContracts} />
                <StatCard label="Expired" value={stats.expiredContracts} />
                <StatCard label="Obligations" value={stats.totalObligations} />
              </div>

              {/* Sport breakdown */}
              <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
                <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
                  Athletes by Sport
                </h2>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(stats.sportBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([sport, count]) => (
                      <div key={sport} className="flex items-center gap-2">
                        <SportBadge sport={sport} />
                        <span className="text-white text-sm font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Expiring contracts */}
              {stats.expiringWithin90Days.length > 0 && (
                <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
                  <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
                    Expiring Within 90 Days ({stats.expiringWithin90Days.length})
                  </h2>
                  <div className="space-y-2">
                    {stats.expiringWithin90Days.map((contract) => (
                      <Link
                        key={contract.id}
                        href={`/partnerships/athletes/${contract.athlete_id}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-[#1A1A1A] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">
                            {contract.athlete?.name ?? 'Unknown'}
                          </span>
                          {contract.athlete?.sport && <SportBadge sport={contract.athlete.sport} />}
                          <StatusBadge variant={contract.deal_type === 'exclusive' ? 'exclusive' : 'non_exclusive'} />
                          {hasNoAnnouncement(contract.special_notes) && (
                            <span className="text-yellow-400 text-xs font-semibold">NO ANN.</span>
                          )}
                        </div>
                        <span className="text-[#6B7280] text-sm">{formatDate(contract.contract_end)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent activities */}
              {stats.recentActivities.length > 0 && (
                <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
                  <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
                    Recent Activities
                  </h2>
                  <div className="space-y-2">
                    {stats.recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-[#1A1A1A]/50">
                        <span className="text-white text-sm">{activity.activity_description}</span>
                        <span className="text-[#6B7280] text-xs">{formatDate(activity.activity_date)}</span>
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
