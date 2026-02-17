export const NAV_ITEMS = [
  { href: '/partnerships', label: 'Dashboard', id: 'dashboard' },
  { href: '/partnerships/athletes', label: 'Athletes', id: 'athletes' },
  { href: '/partnerships/contracts', label: 'Contracts', id: 'contracts' },
  { href: '/partnerships/obligations', label: 'Obligations', id: 'obligations' },
  { href: '/partnerships/team-partnerships', label: 'Teams', id: 'teams' },
  { href: '/partnerships/partner-partnerships', label: 'Partners', id: 'partners' },
  { href: '/partnerships/events', label: 'Events', id: 'events' },
] as const;

export const SPORT_COLORS: Record<string, string> = {
  Basketball: 'bg-orange-500/20 text-orange-400',
  Football: 'bg-green-500/20 text-green-400',
  Baseball: 'bg-red-500/20 text-red-400',
  Soccer: 'bg-blue-500/20 text-blue-400',
  Tennis: 'bg-yellow-500/20 text-yellow-400',
  Volleyball: 'bg-purple-500/20 text-purple-400',
};

export const OBLIGATION_TYPES = [
  'appearance',
  'draft_activation',
  'game_worn_item',
  'media_day',
  'memorabilia_signing',
  'packaging_highlight',
  'player_worn_jersey',
  'production_shoot',
  'rated_rookie_series',
  'social_post',
  'social_post_infeed',
  'social_post_story',
  'social_post_tweet',
  'super_bowl_appearance',
] as const;

export const SPORTS = ['Basketball', 'Football', 'Baseball', 'Soccer', 'Tennis', 'Volleyball'] as const;
