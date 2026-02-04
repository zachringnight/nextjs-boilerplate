import { Player } from '../types';

// NOTE: Player photos reference '/prizm/players/*.jpg' paths.
// These image files need to be added to the public/prizm/players directory.
// Until then, fallback initials will be displayed in the UI.
export const players: Player[] = [
  {
    id: 'trevor-lawrence',
    name: 'Trevor Lawrence',
    team: 'Jacksonville Jaguars',
    position: 'Quarterback',
    photo: '/prizm/players/trevor-lawrence.jpg',
    bio: '#1 overall pick in 2021 NFL Draft. Led Clemson to National Championship with a 34-2 record as a starter. The face of the Jaguars franchise and one of the most talented young quarterbacks in the NFL.',
    stats: ['2021 #1 Overall Pick', '2x Pro Bowl (2022, 2024)', '12,000+ career passing yards', '75+ career TD passes'],
    cardHistory: ['2021 Prizm Draft Picks #1', '2021 Prizm Base Rookie #331', '2021 Prizm Silver Prizm RC', '2022 Prizm Gold Vinyl 1/1'],
    moments: ['Clemson National Championship MVP', 'First NFL win vs Miami 2021', '2022 Playoff comeback vs Chargers (27-point deficit)', 'AFC Wild Card victory']
  },
  {
    id: 'aidan-hutchinson',
    name: 'Aidan Hutchinson',
    team: 'Detroit Lions',
    position: 'Defensive End',
    photo: '/prizm/players/aidan-hutchinson.jpg',
    bio: '#2 overall pick in 2022 NFL Draft. Heisman Trophy finalist and consensus All-American at Michigan. The leader of Detroit\'s dominant defensive line and a key piece of the Lions\' resurgence.',
    stats: ['2022 #2 Overall Pick', '2x Pro Bowl', 'Defensive Rookie of the Year finalist', '30+ career sacks'],
    cardHistory: ['2022 Prizm Draft Picks #2', '2022 Prizm Rookie Autograph', '2023 Prizm Blue Wave /199', '2024 Prizm Gold Prizm /10'],
    moments: ['Michigan vs Ohio State 2021 performance', 'NFL Debut sack vs Eagles', '3-sack game vs Packers', 'Playoffs vs Buccaneers dominant showing']
  },
  {
    id: 'garrett-wilson',
    name: 'Garrett Wilson',
    team: 'New York Jets',
    position: 'Wide Receiver',
    photo: '/prizm/players/garrett-wilson.jpg',
    bio: '#10 overall pick in 2022 NFL Draft. 2022 NFL Offensive Rookie of the Year. Two-time First-team All-Big Ten at Ohio State. The Jets\' top playmaker and one of the premier young receivers in the league.',
    stats: ['2022 NFL Offensive Rookie of the Year', '2x Pro Bowl', '3,000+ career receiving yards', '20+ career TDs'],
    cardHistory: ['2022 Prizm Draft Picks #10', '2022 Prizm Rookie of the Year Insert', '2023 Prizm Silver Prizm', '2024 Prizm Color Blast'],
    moments: ['Rookie of the Year acceptance', 'First career TD vs Browns', 'Game-winning catch vs Bills', '150+ yard game vs Eagles']
  },
  {
    id: 'dante-moore',
    name: 'Dante Moore',
    team: 'Los Angeles Chargers',
    position: 'Quarterback',
    photo: '/prizm/players/dante-moore.jpg',
    bio: 'First-round pick in 2025 NFL Draft from UCLA. Top high school recruit in the 2023 class. Electrifying dual-threat quarterback with elite arm talent and exceptional mobility.',
    stats: ['2025 First Round Pick', 'Top HS Recruit 2023', '5-star prospect', 'UCLA starter at 18 years old'],
    cardHistory: ['2025 Prizm Draft Picks Rookie', '2025 Prizm Silver Prizm RC', '2025 Prizm Rookie Autograph'],
    moments: ['UCLA commitment announcement', 'First collegiate start', 'Debut win vs Crosstown rival', 'NFL Draft selection day']
  },
  {
    id: 'julian-edelman',
    name: 'Julian Edelman',
    team: 'New England Patriots',
    position: 'Legend - Wide Receiver',
    photo: '/prizm/players/julian-edelman.jpg',
    bio: 'Super Bowl LIII MVP and three-time Super Bowl champion. Undrafted college quarterback who became one of the most clutch receivers in NFL history. Patriots legend and Brady\'s go-to target.',
    stats: ['3x Super Bowl Champion', 'Super Bowl LIII MVP', '6,822 career receiving yards', '620 career receptions'],
    cardHistory: ['2009 Topps Rookie', '2015 Prizm Base', '2019 Prizm Super Bowl MVP Insert', '2020 Prizm Retirement Tribute'],
    moments: ['Super Bowl XLIX catch vs Seahawks', 'Super Bowl LI comeback catch', 'Super Bowl LIII MVP performance', 'The Catch vs Falcons in OT']
  },
  {
    id: 'ty-law',
    name: 'Ty Law',
    team: 'New England Patriots',
    position: 'Legend - Cornerback',
    photo: '/prizm/players/ty-law.jpg',
    bio: 'Pro Football Hall of Fame cornerback and three-time Super Bowl champion. Five-time Pro Bowler and two-time First-team All-Pro. One of the most dominant cover corners of his era.',
    stats: ['Pro Football Hall of Fame (2019)', '3x Super Bowl Champion', '5x Pro Bowl', '53 career interceptions'],
    cardHistory: ['1995 Topps Rookie', '2000 Prizm Preview', '2019 Prizm Hall of Fame Insert', '2020 Prizm Legacy Collection'],
    moments: ['Super Bowl XXXVI pick-six vs Rams', '3 INT game vs Peyton Manning', 'AFC Championship dominance', 'Hall of Fame induction speech']
  },
  {
    id: 'malcolm-butler',
    name: 'Malcolm Butler',
    team: 'New England Patriots',
    position: 'Legend - Cornerback',
    photo: '/prizm/players/malcolm-butler.jpg',
    bio: 'Made the most famous play in Super Bowl history with his goal-line interception in Super Bowl XLIX. Undrafted free agent who became a Pro Bowl cornerback.',
    stats: ['Super Bowl XLIX Hero', 'Pro Bowl (2015)', '2x Super Bowl Champion', '17 career interceptions'],
    cardHistory: ['2014 Topps Rookie', '2015 Prizm Super Bowl Moment', '2016 Prizm Pro Bowl Insert', '2018 Prizm Patriots Collection'],
    moments: ['THE Interception - Super Bowl XLIX', 'Pro Bowl selection 2015', '4 INT season 2016', 'Super Bowl LI championship']
  },
  {
    id: 'eli-manning',
    name: 'Eli Manning',
    team: 'New York Giants',
    position: 'Legend - Quarterback',
    photo: '/prizm/players/eli-manning.jpg',
    bio: 'Two-time Super Bowl MVP and four-time Pro Bowler. Spent entire 16-year career with the New York Giants. Famous for defeating the undefeated Patriots twice in the Super Bowl.',
    stats: ['2x Super Bowl MVP', '4x Pro Bowl', '57,023 career passing yards', '366 career TD passes'],
    cardHistory: ['2004 Topps Rookie', '2008 Prizm Preview', '2012 Prizm Super Bowl MVP', '2020 Prizm Career Tribute'],
    moments: ['Helmet Catch drive - Super Bowl XLII', 'Super Bowl XLVI game-winning drive', 'Defeating 18-0 Patriots', 'Manning Bowl games vs Peyton']
  },
  {
    id: 'ricky-williams',
    name: 'Ricky Williams',
    team: 'Miami Dolphins',
    position: 'Legend - Running Back',
    photo: '/prizm/players/ricky-williams.jpg',
    bio: 'Heisman Trophy winner and one of the most talented running backs of his generation. Rushed for over 10,000 career yards. Known for his unique personality and dominance at Texas.',
    stats: ['Heisman Trophy (1998)', '10,009 career rushing yards', 'NCAA career rushing leader (at time)', 'Pro Bowl (2002)'],
    cardHistory: ['1999 Topps Rookie', '2002 Prizm Pro Bowl', '2005 Prizm Dolphins Collection', '2015 Prizm Legends Series'],
    moments: ['Heisman Trophy ceremony', '1,853 yard season with Dolphins', 'NCAA rushing record at Texas', 'Memorable Dolphins runs']
  },
  {
    id: 'champ-bailey',
    name: 'Champ Bailey',
    team: 'Denver Broncos',
    position: 'Legend - Cornerback',
    photo: '/prizm/players/champ-bailey.jpg',
    bio: 'Pro Football Hall of Fame cornerback and 12-time Pro Bowler. Considered one of the greatest cover corners in NFL history. Dominant with both the Redskins and Broncos.',
    stats: ['Pro Football Hall of Fame (2019)', '12x Pro Bowl', '3x First-team All-Pro', '52 career interceptions'],
    cardHistory: ['1999 Topps Rookie', '2004 Prizm Preview', '2019 Prizm Hall of Fame Insert', '2020 Prizm Broncos Legends'],
    moments: ['100-yard INT return in AFC Championship', 'Trade to Broncos blockbuster', '10 INT season 2006', 'Hall of Fame induction']
  }
];

// Helper functions
export const getPlayerById = (id: string): Player | undefined => {
  return players.find(p => p.id === id);
};

export const getPlayersByTeam = (team: string): Player[] => {
  return players.filter(p => p.team.toLowerCase().includes(team.toLowerCase()));
};

export const searchPlayers = (query: string): Player[] => {
  const q = query.toLowerCase();
  return players.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.team.toLowerCase().includes(q) ||
    p.position.toLowerCase().includes(q)
  );
};

// Player lookup map for O(1) access
export const playerMap = new Map<string, Player>(
  players.map(p => [p.id, p])
);
