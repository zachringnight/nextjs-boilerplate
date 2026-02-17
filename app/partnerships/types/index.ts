// === Unions ===

export type Sport = 'Basketball' | 'Football' | 'Baseball' | 'Soccer' | 'Tennis' | 'Volleyball';

export type DealType = 'exclusive' | 'non_exclusive';

export type ObligationType =
  | 'appearance'
  | 'draft_activation'
  | 'game_worn_item'
  | 'media_day'
  | 'memorabilia_signing'
  | 'packaging_highlight'
  | 'player_worn_jersey'
  | 'production_shoot'
  | 'rated_rookie_series'
  | 'social_post'
  | 'social_post_infeed'
  | 'social_post_story'
  | 'social_post_tweet'
  | 'super_bowl_appearance';

// === Core Entities ===

export interface Athlete {
  id: number;
  name: string;
  sport: string | null;
  league: string | null;
  team: string | null;
  created_at: string;
  updated_at: string;
}

export interface AthleteContract {
  id: number;
  athlete_id: number;
  deal_type: DealType;
  exclusivity_scope: string | null;
  contract_start: string | null;
  contract_end: string | null;
  contract_end_note: string | null;
  raw_marketing_specs: string | null;
  raw_completed_marketing: string | null;
  special_notes: string | null;
  created_at: string;
  updated_at: string;
  athlete?: Athlete;
}

export interface MarketingObligation {
  id: number;
  contract_id: number;
  obligation_type: string;
  quantity_per_year: number | null;
  quantity_total: number | null;
  platform: string | null;
  notes: string | null;
}

export interface CompletedActivity {
  id: number;
  contract_id: number;
  activity_description: string;
  activity_date: string | null;
  activity_year: number | null;
}

export interface ConditionalBonus {
  id: number;
  contract_id: number;
  trigger_event: string;
  obligation: string | null;
  bonus_amount: number | null;
}

export interface TeamPartnership {
  id: number;
  team_name: string;
  league: string | null;
  asset_type: string;
  details: string | null;
  activation_date: string | null;
  status: string | null;
  created_at: string;
}

export interface PartnerPartnership {
  id: number;
  partner_name: string;
  asset_type: string;
  details: string | null;
  activation_date: string | null;
  status: string | null;
  created_at: string;
}

export interface NascarActivity {
  id: number;
  item: string | null;
  event_date: string | null;
  details: string | null;
}

export interface EuroleagueActivity {
  id: number;
  event_name: string | null;
  event_date: string | null;
  activation_type: string | null;
  details: string | null;
}

// === Dashboard ===

export interface DashboardStats {
  totalAthletes: number;
  activeContracts: number;
  expiredContracts: number;
  totalObligations: number;
  expiringWithin90Days: AthleteContract[];
  recentActivities: CompletedActivity[];
  sportBreakdown: Record<string, number>;
}

// === Filters ===

export interface AthleteFilters {
  search: string;
  sport: string;
  league: string;
}

export interface ContractFilters {
  status: 'active' | 'expired' | 'all';
  dealType: string;
  sport: string;
  search: string;
}

export interface ObligationFilters {
  type: string;
  search: string;
}
