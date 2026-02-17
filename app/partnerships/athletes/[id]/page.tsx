'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import SideNav from '../../components/SideNav';
import BottomNav from '../../components/BottomNav';
import SportBadge from '../../components/SportBadge';
import StatusBadge from '../../components/StatusBadge';
import NoAnnouncementBanner from '../../components/NoAnnouncementBanner';
import AthleteForm from '../../components/AthleteForm';
import ContractForm from '../../components/ContractForm';
import ObligationForm from '../../components/ObligationForm';
import ActivityForm from '../../components/ActivityForm';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import { SkeletonBlock } from '../../components/Skeleton';
import { useMounted } from '../../hooks/useMounted';
import {
  fetchAthleteById,
  fetchContractsForAthlete,
  fetchObligationsForContract,
  fetchActivitiesForContract,
  fetchBonusesForContract,
} from '../../lib/queries';
import {
  deleteAthlete,
  deleteContract,
  deleteObligation,
  deleteActivity,
  deleteBonus,
} from '../../lib/mutations';
import {
  formatDate,
  formatDealType,
  formatObligationType,
  hasNoAnnouncement,
  isExpired,
  isExpiringSoon,
} from '../../lib/utils';
import { SPORT_ACCENT_COLORS } from '../../lib/constants';
import type {
  Athlete,
  AthleteContract,
  MarketingObligation,
  CompletedActivity,
  ConditionalBonus,
} from '../../types';

interface ContractData {
  contract: AthleteContract;
  obligations: MarketingObligation[];
  activities: CompletedActivity[];
  bonuses: ConditionalBonus[];
}

export default function AthleteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const athleteId = parseInt(id, 10);
  const mounted = useMounted();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [contractsData, setContractsData] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showAthleteForm, setShowAthleteForm] = useState(false);
  const [showContractForm, setShowContractForm] = useState(false);
  const [editContract, setEditContract] = useState<AthleteContract | null>(null);
  const [showObligationForm, setShowObligationForm] = useState<number | null>(null); // contract_id
  const [editObligation, setEditObligation] = useState<MarketingObligation | null>(null);
  const [showActivityForm, setShowActivityForm] = useState<number | null>(null); // contract_id
  const [editActivity, setEditActivity] = useState<CompletedActivity | null>(null);

  // Delete states
  const [deleteTarget, setDeleteTarget] = useState<{ entity: string; id: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [athleteData, contracts] = await Promise.all([
        fetchAthleteById(athleteId),
        fetchContractsForAthlete(athleteId),
      ]);

      setAthlete(athleteData);

      const contractsWithDetails = await Promise.all(
        contracts.map(async (contract) => {
          const [obligations, activities, bonuses] = await Promise.all([
            fetchObligationsForContract(contract.id),
            fetchActivitiesForContract(contract.id),
            fetchBonusesForContract(contract.id),
          ]);
          return { contract, obligations, activities, bonuses };
        })
      );

      setContractsData(contractsWithDetails);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load athlete');
    } finally {
      setLoading(false);
    }
  }, [athleteId]);

  useEffect(() => {
    if (!mounted) return;
    loadData();
  }, [mounted, loadData]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      switch (deleteTarget.entity) {
        case 'athlete':
          await deleteAthlete(deleteTarget.id);
          window.location.href = '/partnerships/athletes';
          return;
        case 'contract':
          await deleteContract(deleteTarget.id);
          break;
        case 'obligation':
          await deleteObligation(deleteTarget.id);
          break;
        case 'activity':
          await deleteActivity(deleteTarget.id);
          break;
        case 'bonus':
          await deleteBonus(deleteTarget.id);
          break;
      }
      setDeleteTarget(null);
      loadData();
    } catch {
      // error handled on re-render
    } finally {
      setDeleting(false);
    }
  }

  function getContractStatus(contract: AthleteContract): 'active' | 'expired' | 'expiring' {
    if (isExpired(contract.contract_end)) return 'expired';
    if (isExpiringSoon(contract.contract_end)) return 'expiring';
    return 'active';
  }

  if (!mounted) return null;

  return (
    <>
      <SideNav className="hidden md:flex" />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
          <Link
            href="/partnerships/athletes"
            className="inline-flex items-center gap-1.5 text-[#9CA3AF] hover:text-white text-sm transition-colors group"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform"><polyline points="15 18 9 12 15 6" /></svg>
            Athletes
          </Link>

          {loading && (
            <div className="space-y-4">
              <SkeletonBlock className="h-10 w-64" />
              <SkeletonBlock className="h-6 w-48" />
              <SkeletonBlock className="h-64" />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>
          )}

          {athlete && !loading && (
            <>
              {/* Hero Card */}
              <div className="relative overflow-hidden bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 md:p-6">
                <div
                  className="absolute top-0 left-0 w-full h-[3px]"
                  style={{ background: athlete.sport ? SPORT_ACCENT_COLORS[athlete.sport] ?? '#6B7280' : '#FFD100' }}
                />
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-lg font-bold"
                    style={{
                      background: `${athlete.sport ? SPORT_ACCENT_COLORS[athlete.sport] ?? '#6B7280' : '#FFD100'}20`,
                      color: athlete.sport ? SPORT_ACCENT_COLORS[athlete.sport] ?? '#6B7280' : '#FFD100',
                    }}
                  >
                    {athlete.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{athlete.name}</h1>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {athlete.sport && <SportBadge sport={athlete.sport} />}
                      {athlete.league && <span className="text-[#9CA3AF] text-sm">{athlete.league}</span>}
                      {athlete.team && (
                        <>
                          <span className="text-[#4B5563]">&middot;</span>
                          <span className="text-[#9CA3AF] text-sm">{athlete.team}</span>
                        </>
                      )}
                    </div>
                    {(athlete.team_city || athlete.team_state || athlete.hometown_city || athlete.hometown_state) && (
                      <div className="flex items-center gap-4 mt-2 text-xs text-[#6B7280]">
                        {(athlete.team_city || athlete.team_state) && (
                          <span>{[athlete.team_city, athlete.team_state].filter(Boolean).join(', ')}</span>
                        )}
                        {(athlete.hometown_city || athlete.hometown_state) && (
                          <span>Hometown: {[athlete.hometown_city, athlete.hometown_state].filter(Boolean).join(', ')}</span>
                        )}
                      </div>
                    )}
                    {(athlete.instagram_handle || athlete.x_handle) && (
                      <div className="flex items-center gap-4 mt-3">
                        {athlete.instagram_handle && (
                          <a
                            href={`https://instagram.com/${athlete.instagram_handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[#9CA3AF] text-sm hover:text-[#E1306C] transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                            @{athlete.instagram_handle}
                          </a>
                        )}
                        {athlete.x_handle && (
                          <a
                            href={`https://x.com/${athlete.x_handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[#9CA3AF] text-sm hover:text-white transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            @{athlete.x_handle}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setShowAthleteForm(true)}
                      className="px-3 py-1.5 text-xs font-medium text-[#9CA3AF] hover:text-white bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ entity: 'athlete', id: athlete.id })}
                      className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {contractsData.length > 0 && (
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[#2A2A2A]/60 text-sm">
                    <div>
                      <span className="text-[#6B7280]">Contracts</span>
                      <span className="text-white font-semibold ml-1.5">{contractsData.length}</span>
                    </div>
                    <div>
                      <span className="text-[#6B7280]">Obligations</span>
                      <span className="text-white font-semibold ml-1.5">{contractsData.reduce((sum, cd) => sum + cd.obligations.length, 0)}</span>
                    </div>
                    <div>
                      <span className="text-[#6B7280]">Activities</span>
                      <span className="text-white font-semibold ml-1.5">{contractsData.reduce((sum, cd) => sum + cd.activities.length, 0)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* NO ANNOUNCEMENT check */}
              {contractsData.some((cd) => hasNoAnnouncement(cd.contract.special_notes)) && (
                <NoAnnouncementBanner />
              )}

              {/* Add Contract button */}
              <div className="flex justify-end">
                <button
                  onClick={() => { setEditContract(null); setShowContractForm(true); }}
                  className="px-4 py-2 bg-[#FFD100] text-black font-medium rounded-lg text-sm hover:bg-[#FFD100]/90 transition-colors"
                >
                  Add Contract
                </button>
              </div>

              {/* Contracts */}
              {contractsData.length === 0 ? (
                <EmptyState
                  title="No contracts"
                  description="Add a contract for this athlete."
                  action={{ label: 'Add Contract', onClick: () => setShowContractForm(true) }}
                />
              ) : (
                contractsData.map(({ contract, obligations, activities, bonuses }) => (
                  <div key={contract.id} className="bg-[#141414] border border-[#2A2A2A] rounded-xl overflow-hidden">
                    {/* Contract header */}
                    <div className="p-4 border-b border-[#2A2A2A]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusBadge variant={getContractStatus(contract)} />
                          <StatusBadge variant={contract.deal_type === 'exclusive' ? 'exclusive' : 'non_exclusive'} />
                          {contract.exclusivity_scope && (
                            <span className="text-[#6B7280] text-xs">
                              ({contract.exclusivity_scope.replace(/_/g, ' ')})
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditContract(contract); setShowContractForm(true); }}
                            className="px-2 py-1 text-xs text-[#9CA3AF] hover:text-white transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ entity: 'contract', id: contract.id })}
                            className="px-2 py-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-[#9CA3AF]">
                        <span>{formatDate(contract.contract_start)} — {formatDate(contract.contract_end)}</span>
                        {contract.contract_end_note && (
                          <span className="text-[#6B7280]">({contract.contract_end_note})</span>
                        )}
                      </div>
                      {hasNoAnnouncement(contract.special_notes) && (
                        <div className="mt-2">
                          <span className="text-yellow-400 text-xs font-semibold">NO ANNOUNCEMENT</span>
                        </div>
                      )}
                      {contract.special_notes && !hasNoAnnouncement(contract.special_notes) && (
                        <p className="text-[#6B7280] text-xs mt-2">Note: {contract.special_notes}</p>
                      )}
                    </div>

                    {/* Obligations */}
                    <div className="p-4 border-b border-[#2A2A2A]">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider">
                          Obligations ({obligations.length})
                        </h3>
                        <button
                          onClick={() => { setEditObligation(null); setShowObligationForm(contract.id); }}
                          className="text-xs text-[#FFD100] hover:text-[#FFD100]/80 transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                      {obligations.length === 0 ? (
                        <p className="text-[#6B7280] text-sm">No obligations.</p>
                      ) : (
                        <div className="space-y-2">
                          {obligations.map((obl) => (
                            <div key={obl.id} className="flex items-center justify-between p-2 rounded-lg bg-[#1A1A1A]/50 group">
                              <div className="flex-1 min-w-0">
                                <span className="text-white text-sm">{formatObligationType(obl.obligation_type)}</span>
                                <div className="flex gap-3 text-xs text-[#6B7280] mt-0.5">
                                  {obl.quantity_per_year != null && <span>{obl.quantity_per_year}/yr</span>}
                                  {obl.quantity_total != null && <span>{obl.quantity_total} total</span>}
                                  {obl.platform && <span>{obl.platform}</span>}
                                </div>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => { setEditObligation(obl); setShowObligationForm(contract.id); }}
                                  className="px-2 py-1 text-xs text-[#9CA3AF] hover:text-white"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => setDeleteTarget({ entity: 'obligation', id: obl.id })}
                                  className="px-2 py-1 text-xs text-red-400 hover:text-red-300"
                                >
                                  Del
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Completed Activities */}
                    <div className="p-4 border-b border-[#2A2A2A]">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider">
                          Completed Activities ({activities.length})
                        </h3>
                        <button
                          onClick={() => { setEditActivity(null); setShowActivityForm(contract.id); }}
                          className="text-xs text-[#FFD100] hover:text-[#FFD100]/80 transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                      {activities.length === 0 ? (
                        <p className="text-[#6B7280] text-sm">No activities recorded.</p>
                      ) : (
                        <div className="space-y-2">
                          {activities.map((act) => (
                            <div key={act.id} className="flex items-center justify-between p-2 rounded-lg bg-[#1A1A1A]/50 group">
                              <div>
                                <span className="text-white text-sm">{act.activity_description}</span>
                                <span className="text-[#6B7280] text-xs ml-2">{formatDate(act.activity_date)}</span>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => { setEditActivity(act); setShowActivityForm(contract.id); }}
                                  className="px-2 py-1 text-xs text-[#9CA3AF] hover:text-white"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => setDeleteTarget({ entity: 'activity', id: act.id })}
                                  className="px-2 py-1 text-xs text-red-400 hover:text-red-300"
                                >
                                  Del
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Conditional Bonuses */}
                    {bonuses.length > 0 && (
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
                          Conditional Bonuses ({bonuses.length})
                        </h3>
                        <div className="space-y-2">
                          {bonuses.map((bonus) => (
                            <div key={bonus.id} className="flex items-center justify-between p-2 rounded-lg bg-[#1A1A1A]/50 group">
                              <div>
                                <span className="text-white text-sm">{bonus.trigger_event}</span>
                                {bonus.obligation && (
                                  <p className="text-[#6B7280] text-xs mt-0.5">{bonus.obligation}</p>
                                )}
                              </div>
                              <button
                                onClick={() => setDeleteTarget({ entity: 'bonus', id: bonus.id })}
                                className="px-2 py-1 text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Del
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Modals */}
        {athlete && (
          <AthleteForm
            open={showAthleteForm}
            onClose={() => setShowAthleteForm(false)}
            onSaved={loadData}
            athlete={athlete}
          />
        )}

        <ContractForm
          open={showContractForm}
          onClose={() => { setShowContractForm(false); setEditContract(null); }}
          onSaved={loadData}
          athleteId={athleteId}
          contract={editContract}
        />

        {showObligationForm !== null && (
          <ObligationForm
            open={true}
            onClose={() => { setShowObligationForm(null); setEditObligation(null); }}
            onSaved={loadData}
            contractId={showObligationForm}
            obligation={editObligation}
          />
        )}

        {showActivityForm !== null && (
          <ActivityForm
            open={true}
            onClose={() => { setShowActivityForm(null); setEditActivity(null); }}
            onSaved={loadData}
            contractId={showActivityForm}
            activity={editActivity}
          />
        )}

        <ConfirmModal
          open={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title={`Delete ${deleteTarget?.entity ?? ''}`}
          message={
            deleteTarget?.entity === 'athlete'
              ? 'This will permanently delete this athlete and all associated data.'
              : `This will permanently delete this ${deleteTarget?.entity ?? 'item'}.`
          }
          loading={deleting}
        />
      </main>
      <BottomNav className="md:hidden" />
    </>
  );
}
