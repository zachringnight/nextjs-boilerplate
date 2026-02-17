'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import SideNav from '../components/SideNav';
import BottomNav from '../components/BottomNav';
import AthleteCard from '../components/AthleteCard';
import AthleteForm from '../components/AthleteForm';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import { useMounted } from '../hooks/useMounted';
import { usePartnershipsStore } from '../store';
import { fetchAthletes } from '../lib/queries';
import { deleteAthlete } from '../lib/mutations';
import { SPORTS } from '../lib/constants';
import type { Athlete } from '../types';

type SortKey = 'name' | 'sport' | 'team' | 'recent';

export default function AthletesPage() {
  const mounted = useMounted();
  const { athleteFilters, setAthleteFilters, refreshKey, triggerRefresh } = usePartnershipsStore();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('name');

  const loadAthletes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAthletes({
        search: athleteFilters.search || undefined,
        sport: athleteFilters.sport !== 'all' ? athleteFilters.sport : undefined,
        league: athleteFilters.league !== 'all' ? athleteFilters.league : undefined,
      });
      setAthletes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load athletes');
    } finally {
      setLoading(false);
    }
  }, [athleteFilters, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mounted) return;
    loadAthletes();
  }, [mounted, loadAthletes]);

  const sorted = useMemo(() => {
    const copy = [...athletes];
    switch (sortBy) {
      case 'name':
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case 'sport':
        return copy.sort((a, b) => (a.sport ?? '').localeCompare(b.sport ?? '') || a.name.localeCompare(b.name));
      case 'team':
        return copy.sort((a, b) => (a.team ?? '').localeCompare(b.team ?? '') || a.name.localeCompare(b.name));
      case 'recent':
        return copy.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      default:
        return copy;
    }
  }, [athletes, sortBy]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteAthlete(deleteId);
      triggerRefresh();
      setDeleteId(null);
    } catch {
      // error is handled by re-render
    } finally {
      setDeleting(false);
    }
  }

  const hasFilters = athleteFilters.search || athleteFilters.sport !== 'all';

  if (!mounted) return null;

  return (
    <>
      <SideNav className="hidden md:flex" />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-4">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Athletes</h1>
              {!loading && (
                <p className="text-[#6B7280] text-sm mt-1">
                  {sorted.length} athlete{sorted.length !== 1 ? 's' : ''}
                  {hasFilters ? ' matching filters' : ''}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD100] text-black font-semibold rounded-lg text-sm hover:bg-[#FFD100]/90 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              <span className="hidden sm:inline">Add Athlete</span>
            </button>
          </div>

          {/* Filters + Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                value={athleteFilters.search}
                onChange={(e) => setAthleteFilters({ search: e.target.value })}
                placeholder="Search athletes..."
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:border-[#FFD100] focus:outline-none placeholder:text-[#4B5563]"
              />
            </div>
            <select
              value={athleteFilters.sport}
              onChange={(e) => setAthleteFilters({ sport: e.target.value })}
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
              <option value="name">Sort: Name</option>
              <option value="sport">Sort: Sport</option>
              <option value="team">Sort: Team</option>
              <option value="recent">Sort: Recent</option>
            </select>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              {athleteFilters.search && (
                <button
                  onClick={() => setAthleteFilters({ search: '' })}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFD100]/10 text-[#FFD100] rounded-full text-xs font-medium hover:bg-[#FFD100]/20 transition-colors"
                >
                  &ldquo;{athleteFilters.search}&rdquo;
                  <span className="text-[#FFD100]/60">✕</span>
                </button>
              )}
              {athleteFilters.sport !== 'all' && (
                <button
                  onClick={() => setAthleteFilters({ sport: 'all' })}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFD100]/10 text-[#FFD100] rounded-full text-xs font-medium hover:bg-[#FFD100]/20 transition-colors"
                >
                  {athleteFilters.sport}
                  <span className="text-[#FFD100]/60">✕</span>
                </button>
              )}
              <button
                onClick={() => setAthleteFilters({ search: '', sport: 'all', league: 'all' })}
                className="text-[#6B7280] hover:text-white text-xs transition-colors"
              >
                Clear all
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <EmptyState
              title="No athletes found"
              description={hasFilters ? 'Try adjusting your search or filters.' : 'Add your first athlete to get started.'}
              action={!hasFilters ? { label: 'Add Athlete', onClick: () => setShowForm(true) } : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sorted.map((athlete) => (
                <AthleteCard key={athlete.id} athlete={athlete} />
              ))}
            </div>
          )}
        </div>

        <AthleteForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSaved={triggerRefresh}
        />

        <ConfirmModal
          open={deleteId !== null}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Athlete"
          message="This will permanently delete this athlete and all associated contracts, obligations, and activities."
          loading={deleting}
        />
      </main>
      <BottomNav className="md:hidden" />
    </>
  );
}
