'use client';

import { useState, useEffect, useCallback } from 'react';
import SideNav from '../components/SideNav';
import BottomNav from '../components/BottomNav';
import PartnershipForm from '../components/PartnershipForm';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import { useMounted } from '../hooks/useMounted';
import { usePartnershipsStore } from '../store';
import { fetchTeamPartnerships } from '../lib/queries';
import { deleteTeamPartnership } from '../lib/mutations';
import { formatDate } from '../lib/utils';
import type { TeamPartnership } from '../types';

export default function TeamPartnershipsPage() {
  const mounted = useMounted();
  const { refreshKey, triggerRefresh } = usePartnershipsStore();
  const [partnerships, setPartnerships] = useState<TeamPartnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<TeamPartnership | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setPartnerships(await fetchTeamPartnerships());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mounted) return;
    loadData();
  }, [mounted, loadData]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteTeamPartnership(deleteId);
      triggerRefresh();
      setDeleteId(null);
    } catch { /* handled */ } finally {
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
            <h1 className="text-2xl font-bold text-white">Team Partnerships</h1>
            <button
              onClick={() => { setEditItem(null); setShowForm(true); }}
              className="px-4 py-2 bg-[#FFD100] text-black font-medium rounded-lg text-sm hover:bg-[#FFD100]/90 transition-colors"
            >
              Add Partnership
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : partnerships.length === 0 ? (
            <EmptyState
              title="No team partnerships"
              action={{ label: 'Add Partnership', onClick: () => setShowForm(true) }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {partnerships.map((p) => (
                <div key={p.id} className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 group">
                  <div className="flex items-start justify-between">
                    <h3 className="text-white font-semibold text-sm">{p.team_name}</h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditItem(p); setShowForm(true); }}
                        className="px-2 py-1 text-xs text-[#9CA3AF] hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="px-2 py-1 text-xs text-red-400 hover:text-red-300"
                      >
                        Del
                      </button>
                    </div>
                  </div>
                  {p.league && <p className="text-[#6B7280] text-xs mt-1">{p.league}</p>}
                  <p className="text-[#9CA3AF] text-xs mt-2">{p.asset_type}</p>
                  {p.details && <p className="text-[#6B7280] text-xs mt-1 line-clamp-2">{p.details}</p>}
                  <div className="flex items-center justify-between mt-3">
                    {p.status && (
                      <span className="text-xs text-[#9CA3AF] bg-[#1A1A1A] px-2 py-0.5 rounded">{p.status}</span>
                    )}
                    {p.activation_date && (
                      <span className="text-[#6B7280] text-xs">{formatDate(p.activation_date)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <PartnershipForm
          open={showForm}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={() => { triggerRefresh(); }}
          type="team"
          data={editItem}
        />

        <ConfirmModal
          open={deleteId !== null}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Partnership"
          message="This will permanently delete this team partnership."
          loading={deleting}
        />
      </main>
      <BottomNav className="md:hidden" />
    </>
  );
}
