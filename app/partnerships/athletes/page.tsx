'use client';

import { useState, useEffect, useCallback } from 'react';
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

export default function AthletesPage() {
  const mounted = useMounted();
  const { athleteFilters, setAthleteFilters, refreshKey, triggerRefresh } = usePartnershipsStore();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  if (!mounted) return null;

  return (
    <>
      <SideNav className="hidden md:flex" />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Athletes</h1>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-[#FFD100] text-black font-medium rounded-lg text-sm hover:bg-[#FFD100]/90 transition-colors"
            >
              Add Athlete
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={athleteFilters.search}
              onChange={(e) => setAthleteFilters({ search: e.target.value })}
              placeholder="Search athletes..."
              className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#FFD100] focus:outline-none"
            />
            <select
              value={athleteFilters.sport}
              onChange={(e) => setAthleteFilters({ sport: e.target.value })}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : athletes.length === 0 ? (
            <EmptyState
              title="No athletes found"
              description={athleteFilters.search ? 'Try adjusting your search or filters.' : 'Add your first athlete to get started.'}
              action={!athleteFilters.search ? { label: 'Add Athlete', onClick: () => setShowForm(true) } : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {athletes.map((athlete) => (
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
