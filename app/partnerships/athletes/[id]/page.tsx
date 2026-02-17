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
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
          <Link
            href="/partnerships/athletes"
            className="inline-flex items-center text-[#9CA3AF] hover:text-white text-sm transition-colors"
          >
            &larr; Back to Athletes
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
              {/* Hero */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">{athlete.name}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    {athlete.sport && <SportBadge sport={athlete.sport} />}
                    {athlete.league && <span className="text-[#6B7280] text-sm">{athlete.league}</span>}
                  </div>
                  {athlete.team && <p className="text-[#9CA3AF] text-sm mt-1">{athlete.team}</p>}
                </div>
                <div className="flex gap-2">
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
