export type ViewMode = 'now' | 'schedule' | 'station' | 'players';
export type Conference = 'Eastern' | 'Western';

export interface PlayerQuestion {
  station: 'tunnel' | 'product';
  questions: string[];
}

export interface Player {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  pronunciation?: string;
  position: string;
  team: string;
  teamAbbr: string;
  conference: Conference;
  nationality: string;
  flag: string;
  photo: string;
  jerseyNumber: number;
  day: 1 | 2;
  scheduledTime: string;
  playerNumber: number;
  notes: string[];
  embargoed: boolean;
  translatorNeeded: boolean;
  bio: string[];
  talkingPoints: string[];
  questions: PlayerQuestion[];
}
