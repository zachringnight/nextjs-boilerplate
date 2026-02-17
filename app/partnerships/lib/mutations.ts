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
} from '../types';

function requireClient() {
  return getServiceSupabaseClient();
}

// === Athletes ===

export async function createAthlete(data: Omit<Athlete, 'id' | 'created_at' | 'updated_at'>) {
  const client = requireClient();
  const { data: result, error } = await client.from('athletes').insert(data).select().single();
  if (error) throw error;
  return result;
}

export async function updateAthlete(id: number, data: Partial<Omit<Athlete, 'id' | 'created_at'>>) {
  const client = requireClient();
  const { error } = await client
    .from('athletes')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteAthlete(id: number) {
  const client = requireClient();
  const { error } = await client.from('athletes').delete().eq('id', id);
  if (error) throw error;
}

// === Contracts ===

export async function createContract(data: Omit<AthleteContract, 'id' | 'created_at' | 'updated_at' | 'athlete'>) {
  const client = requireClient();
  const { data: result, error } = await client.from('athlete_contracts').insert(data).select().single();
  if (error) throw error;
  return result;
}

export async function updateContract(id: number, data: Partial<Omit<AthleteContract, 'id' | 'created_at' | 'athlete'>>) {
  const client = requireClient();
  const { error } = await client
    .from('athlete_contracts')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteContract(id: number) {
  const client = requireClient();
  const { error } = await client.from('athlete_contracts').delete().eq('id', id);
  if (error) throw error;
}

// === Obligations ===

export async function createObligation(data: Omit<MarketingObligation, 'id'>) {
  const client = requireClient();
  const { data: result, error } = await client.from('marketing_obligations').insert(data).select().single();
  if (error) throw error;
  return result;
}

export async function updateObligation(id: number, data: Partial<Omit<MarketingObligation, 'id'>>) {
  const client = requireClient();
  const { error } = await client.from('marketing_obligations').update(data).eq('id', id);
  if (error) throw error;
}

export async function deleteObligation(id: number) {
  const client = requireClient();
  const { error } = await client.from('marketing_obligations').delete().eq('id', id);
  if (error) throw error;
}

// === Completed Activities ===

export async function createActivity(data: Omit<CompletedActivity, 'id'>) {
  const client = requireClient();
  const { data: result, error } = await client.from('completed_activities').insert(data).select().single();
  if (error) throw error;
  return result;
}

export async function updateActivity(id: number, data: Partial<Omit<CompletedActivity, 'id'>>) {
  const client = requireClient();
  const { error } = await client.from('completed_activities').update(data).eq('id', id);
  if (error) throw error;
}

export async function deleteActivity(id: number) {
  const client = requireClient();
  const { error } = await client.from('completed_activities').delete().eq('id', id);
  if (error) throw error;
}

// === Bonuses ===

export async function createBonus(data: Omit<ConditionalBonus, 'id'>) {
  const client = requireClient();
  const { data: result, error } = await client.from('conditional_bonuses').insert(data).select().single();
  if (error) throw error;
  return result;
}

export async function updateBonus(id: number, data: Partial<Omit<ConditionalBonus, 'id'>>) {
  const client = requireClient();
  const { error } = await client.from('conditional_bonuses').update(data).eq('id', id);
  if (error) throw error;
}

export async function deleteBonus(id: number) {
  const client = requireClient();
  const { error } = await client.from('conditional_bonuses').delete().eq('id', id);
  if (error) throw error;
}

// === Team Partnerships ===

export async function createTeamPartnership(data: Omit<TeamPartnership, 'id' | 'created_at'>) {
  const client = requireClient();
  const { data: result, error } = await client.from('team_partnerships').insert(data).select().single();
  if (error) throw error;
  return result;
}

export async function updateTeamPartnership(id: number, data: Partial<Omit<TeamPartnership, 'id' | 'created_at'>>) {
  const client = requireClient();
  const { error } = await client.from('team_partnerships').update(data).eq('id', id);
  if (error) throw error;
}

export async function deleteTeamPartnership(id: number) {
  const client = requireClient();
  const { error } = await client.from('team_partnerships').delete().eq('id', id);
  if (error) throw error;
}

// === Partner Partnerships ===

export async function createPartnerPartnership(data: Omit<PartnerPartnership, 'id' | 'created_at'>) {
  const client = requireClient();
  const { data: result, error } = await client.from('partner_partnerships').insert(data).select().single();
  if (error) throw error;
  return result;
}

export async function updatePartnerPartnership(id: number, data: Partial<Omit<PartnerPartnership, 'id' | 'created_at'>>) {
  const client = requireClient();
  const { error } = await client.from('partner_partnerships').update(data).eq('id', id);
  if (error) throw error;
}

export async function deletePartnerPartnership(id: number) {
  const client = requireClient();
  const { error } = await client.from('partner_partnerships').delete().eq('id', id);
  if (error) throw error;
}

// === NASCAR Activities ===

export async function createNascarActivity(data: Omit<NascarActivity, 'id'>) {
  const client = requireClient();
  const { data: result, error } = await client.from('nascar_activities').insert(data).select().single();
  if (error) throw error;
  return result;
}

export async function updateNascarActivity(id: number, data: Partial<Omit<NascarActivity, 'id'>>) {
  const client = requireClient();
  const { error } = await client.from('nascar_activities').update(data).eq('id', id);
  if (error) throw error;
}

export async function deleteNascarActivity(id: number) {
  const client = requireClient();
  const { error } = await client.from('nascar_activities').delete().eq('id', id);
  if (error) throw error;
}

// === Euroleague Activities ===

export async function createEuroleagueActivity(data: Omit<EuroleagueActivity, 'id'>) {
  const client = requireClient();
  const { data: result, error } = await client.from('euroleague_activities').insert(data).select().single();
  if (error) throw error;
  return result;
}

export async function updateEuroleagueActivity(id: number, data: Partial<Omit<EuroleagueActivity, 'id'>>) {
  const client = requireClient();
  const { error } = await client.from('euroleague_activities').update(data).eq('id', id);
  if (error) throw error;
}

export async function deleteEuroleagueActivity(id: number) {
  const client = requireClient();
  const { error } = await client.from('euroleague_activities').delete().eq('id', id);
  if (error) throw error;
}
