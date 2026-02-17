'use client';

import { useState, useEffect, useCallback } from 'react';
import SideNav from '../components/SideNav';
import BottomNav from '../components/BottomNav';
import EventForm from '../components/EventForm';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import { useMounted } from '../hooks/useMounted';
import { usePartnershipsStore } from '../store';
import { fetchNascarActivities, fetchEuroleagueActivities } from '../lib/queries';
import { deleteNascarActivity, deleteEuroleagueActivity } from '../lib/mutations';
import { formatDate, cn } from '../lib/utils';
import type { NascarActivity, EuroleagueActivity } from '../types';

type Tab = 'nascar' | 'euroleague';

export default function EventsPage() {
  const mounted = useMounted();
  const { refreshKey, triggerRefresh } = usePartnershipsStore();
  const [tab, setTab] = useState<Tab>('nascar');
  const [nascarItems, setNascarItems] = useState<NascarActivity[]>([]);
  const [euroItems, setEuroItems] = useState<EuroleagueActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editNascar, setEditNascar] = useState<NascarActivity | null>(null);
  const [editEuro, setEditEuro] = useState<EuroleagueActivity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: Tab; id: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [nascar, euro] = await Promise.all([
        fetchNascarActivities(),
        fetchEuroleagueActivities(),
      ]);
      setNascarItems(nascar);
      setEuroItems(euro);
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
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'nascar') {
        await deleteNascarActivity(deleteTarget.id);
      } else {
        await deleteEuroleagueActivity(deleteTarget.id);
      }
      triggerRefresh();
      setDeleteTarget(null);
    } catch { /* handled */ } finally {
      setDeleting(false);
    }
  }

  function handleOpenForm() {
    setEditNascar(null);
    setEditEuro(null);
    setShowForm(true);
  }

  if (!mounted) return null;

  return (
    <>
      <SideNav className="hidden md:flex" />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Events</h1>
            <button
              onClick={handleOpenForm}
              className="px-4 py-2 bg-[#FFD100] text-black font-medium rounded-lg text-sm hover:bg-[#FFD100]/90 transition-colors"
            >
              Add Activity
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#1A1A1A] rounded-lg p-1 w-fit">
            <button
              onClick={() => setTab('nascar')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                tab === 'nascar' ? 'bg-[#FFD100] text-black' : 'text-[#9CA3AF] hover:text-white'
              )}
            >
              NASCAR ({nascarItems.length})
            </button>
            <button
              onClick={() => setTab('euroleague')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                tab === 'euroleague' ? 'bg-[#FFD100] text-black' : 'text-[#9CA3AF] hover:text-white'
              )}
            >
              Euroleague ({euroItems.length})
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : tab === 'nascar' ? (
            nascarItems.length === 0 ? (
              <EmptyState title="No NASCAR activities" action={{ label: 'Add Activity', onClick: handleOpenForm }} />
            ) : (
              <div className="space-y-3">
                {nascarItems.map((item) => (
                  <div key={item.id} className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 group">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-sm">{item.item}</h3>
                        {item.event_date && <p className="text-[#6B7280] text-xs mt-1">{item.event_date}</p>}
                        {item.details && <p className="text-[#9CA3AF] text-xs mt-2">{item.details}</p>}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditNascar(item); setShowForm(true); }}
                          className="px-2 py-1 text-xs text-[#9CA3AF] hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: 'nascar', id: item.id })}
                          className="px-2 py-1 text-xs text-red-400 hover:text-red-300"
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            euroItems.length === 0 ? (
              <EmptyState title="No Euroleague activities" action={{ label: 'Add Activity', onClick: handleOpenForm }} />
            ) : (
              <div className="space-y-3">
                {euroItems.map((item) => (
                  <div key={item.id} className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 group">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-sm">{item.event_name}</h3>
                        {item.event_date && <p className="text-[#6B7280] text-xs mt-1">{formatDate(item.event_date)}</p>}
                        {item.activation_type && (
                          <span className="text-xs text-[#9CA3AF] bg-[#1A1A1A] px-2 py-0.5 rounded mt-1 inline-block">
                            {item.activation_type}
                          </span>
                        )}
                        {item.details && <p className="text-[#9CA3AF] text-xs mt-2">{item.details}</p>}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditEuro(item); setShowForm(true); }}
                          className="px-2 py-1 text-xs text-[#9CA3AF] hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: 'euroleague', id: item.id })}
                          className="px-2 py-1 text-xs text-red-400 hover:text-red-300"
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        <EventForm
          open={showForm}
          onClose={() => { setShowForm(false); setEditNascar(null); setEditEuro(null); }}
          onSaved={() => { triggerRefresh(); }}
          type={tab}
          data={tab === 'nascar' ? editNascar : editEuro}
        />

        <ConfirmModal
          open={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Activity"
          message="This will permanently delete this activity."
          loading={deleting}
        />
      </main>
      <BottomNav className="md:hidden" />
    </>
  );
}
