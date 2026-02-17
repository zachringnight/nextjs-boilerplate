'use server';

import { getServiceSupabaseClient } from '@/app/lib/supabase-server';
import type {
  Athlete,
  AthleteContract,
  MarketingObligation,
  CompletedActivity,
  ConditionalBonus,
  TeamPartnership,
  PartnerPartnership,
  NascarActivity,
  EuroleagueActivity,
  DashboardStats,
} from '../types';

function requireClient() {
  return getServiceSupabaseClient();
}

// === Athletes ===

export async function fetchAthletes(filters?: {
  search?: string;
  sport?: string;
  league?: string;
}): Promise<Athlete[]> {
  const client = requireClient();
  let query = client.from('athletes').select('*').order('name');

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  if (filters?.sport && filters.sport !== 'all') {
    query = query.eq('sport', filters.sport);
  }
  if (filters?.league && filters.league !== 'all') {
    query = query.eq('league', filters.league);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Athlete[];
}

export async function fetchAthleteById(id: number): Promise<Athlete | null> {
  const client = requireClient();
  const { data, error } = await client
    .from('athletes')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Athlete | null;
}

// === Contracts ===

export async function fetchContractsForAthlete(athleteId: number): Promise<AthleteContract[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('athlete_contracts')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('contract_start', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AthleteContract[];
}

export async function fetchAllContracts(): Promise<(AthleteContract & { athlete: Athlete })[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('athlete_contracts')
    .select('*, athlete:athletes(*)')
    .order('contract_end', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as (AthleteContract & { athlete: Athlete })[];
}

export async function fetchActiveContracts(): Promise<(AthleteContract & { athlete: Athlete })[]> {
  const client = requireClient();
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await client
    .from('athlete_contracts')
    .select('*, athlete:athletes(*)')
    .or(`contract_end.gte.${today},contract_end.is.null`)
    .order('contract_end', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as (AthleteContract & { athlete: Athlete })[];
}

export async function fetchExpiredContracts(): Promise<(AthleteContract & { athlete: Athlete })[]> {
  const client = requireClient();
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await client
    .from('athlete_contracts')
    .select('*, athlete:athletes(*)')
    .lt('contract_end', today)
    .order('contract_end', { ascending: false });
  if (error) throw error;
  return (data ?? []) as (AthleteContract & { athlete: Athlete })[];
}

// === Obligations ===

export async function fetchObligationsForContract(contractId: number): Promise<MarketingObligation[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('marketing_obligations')
    .select('*')
    .eq('contract_id', contractId)
    .order('obligation_type');
  if (error) throw error;
  return (data ?? []) as MarketingObligation[];
}

export async function fetchAllObligations(): Promise<(MarketingObligation & { contract: AthleteContract & { athlete: Athlete } })[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('marketing_obligations')
    .select('*, contract:athlete_contracts(*, athlete:athletes(*))')
    .order('obligation_type');
  if (error) throw error;
  return (data ?? []) as (MarketingObligation & { contract: AthleteContract & { athlete: Athlete } })[];
}

// === Completed Activities ===

export async function fetchActivitiesForContract(contractId: number): Promise<CompletedActivity[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('completed_activities')
    .select('*')
    .eq('contract_id', contractId)
    .order('activity_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CompletedActivity[];
}

// === Bonuses ===

export async function fetchBonusesForContract(contractId: number): Promise<ConditionalBonus[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('conditional_bonuses')
    .select('*')
    .eq('contract_id', contractId);
  if (error) throw error;
  return (data ?? []) as ConditionalBonus[];
}

// === Partnerships ===

export async function fetchTeamPartnerships(): Promise<TeamPartnership[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('team_partnerships')
    .select('*')
    .order('team_name');
  if (error) throw error;
  return (data ?? []) as TeamPartnership[];
}

export async function fetchPartnerPartnerships(): Promise<PartnerPartnership[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('partner_partnerships')
    .select('*')
    .order('partner_name');
  if (error) throw error;
  return (data ?? []) as PartnerPartnership[];
}

// === Events ===

export async function fetchNascarActivities(): Promise<NascarActivity[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('nascar_activities')
    .select('*')
    .order('event_date');
  if (error) throw error;
  return (data ?? []) as NascarActivity[];
}

export async function fetchEuroleagueActivities(): Promise<EuroleagueActivity[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('euroleague_activities')
    .select('*')
    .order('event_date');
  if (error) throw error;
  return (data ?? []) as EuroleagueActivity[];
}

// === Dashboard ===

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const client = requireClient();

  const [
    athleteCount,
    activeContracts,
    expiredContracts,
    obligationCount,
    recentActivities,
    sportData,
  ] = await Promise.all([
    client.from('athletes').select('*', { count: 'exact', head: true }),
    fetchActiveContracts(),
    fetchExpiredContracts(),
    client.from('marketing_obligations').select('*', { count: 'exact', head: true }),
    client.from('completed_activities').select('*').order('activity_date', { ascending: false }).limit(10),
    client.from('athletes').select('sport'),
  ]);

  const now = new Date();
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const expiringSoon = activeContracts.filter((c) => {
    if (!c.contract_end) return false;
    const end = new Date(c.contract_end + 'T00:00:00');
    return end >= now && end <= in90Days;
  });

  const sportBreakdown: Record<string, number> = {};
  for (const a of sportData.data ?? []) {
    const sport = (a as { sport: string | null }).sport ?? 'Unknown';
    sportBreakdown[sport] = (sportBreakdown[sport] || 0) + 1;
  }

  return {
    totalAthletes: athleteCount.count ?? 0,
    activeContracts: activeContracts.length,
    expiredContracts: expiredContracts.length,
    totalObligations: obligationCount.count ?? 0,
    expiringWithin90Days: expiringSoon,
    recentActivities: (recentActivities.data ?? []) as CompletedActivity[],
    sportBreakdown,
  };
}
