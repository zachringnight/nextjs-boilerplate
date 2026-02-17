export const NAV_ITEMS = [
  { href: '/partnerships', label: 'Dashboard', id: 'dashboard', icon: 'grid' },
  { href: '/partnerships/athletes', label: 'Athletes', id: 'athletes', icon: 'users' },
  { href: '/partnerships/contracts', label: 'Contracts', id: 'contracts', icon: 'file' },
  { href: '/partnerships/obligations', label: 'Obligations', id: 'obligations', icon: 'check' },
  { href: '/partnerships/team-partnerships', label: 'Teams', id: 'teams', icon: 'shield' },
  { href: '/partnerships/partner-partnerships', label: 'Partners', id: 'partners', icon: 'handshake' },
  { href: '/partnerships/events', label: 'Events', id: 'events', icon: 'calendar' },
] as const;

export const SPORT_COLORS: Record<string, string> = {
  Basketball: 'bg-orange-500/20 text-orange-400',
  Football: 'bg-green-500/20 text-green-400',
  Baseball: 'bg-red-500/20 text-red-400',
  Soccer: 'bg-blue-500/20 text-blue-400',
  Tennis: 'bg-yellow-500/20 text-yellow-400',
  Volleyball: 'bg-purple-500/20 text-purple-400',
};

export const SPORT_ACCENT_COLORS: Record<string, string> = {
  Basketball: '#f97316',
  Football: '#22c55e',
  Baseball: '#ef4444',
  Soccer: '#3b82f6',
  Tennis: '#eab308',
  Volleyball: '#a855f7',
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
