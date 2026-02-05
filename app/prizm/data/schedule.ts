import { ScheduleSlot, StationId } from '../types';

// Event dates
export const EVENT_DATES = ['2026-02-06', '2026-02-07', '2026-02-08'] as const;
export const EVENT_TIMEZONE = 'America/Los_Angeles';

// Day labels
export const DAY_LABELS: Record<string, string> = {
  '2026-02-06': 'Thursday',
  '2026-02-07': 'Friday',
  '2026-02-08': 'Saturday'
};

// Event hours (PST)
export const EVENT_START_TIME = '10:00';
export const EVENT_END_TIME = '18:00';

// Generate the complete schedule based on provided itinerary
export const defaultSchedule: ScheduleSlot[] = [
  // =====================================================
  // THURSDAY FEB 6 - Day 1
  // =====================================================

  // ---------------
  // 11:00 AM – 1:00 PM Session
  // ---------------

  // Jahmyr Gibbs — RB | Lions | Thu 11:00–1:00
  {
    id: 'thu-gibbs-1',
    playerId: 'jahmyr-gibbs',
    date: '2026-02-06',
    startTime: '11:00',
    endTime: '11:15',
    station: 'ledWall',
    status: 'scheduled'
  },
  {
    id: 'thu-gibbs-2',
    playerId: 'jahmyr-gibbs',
    date: '2026-02-06',
    startTime: '11:15',
    endTime: '12:25',
    station: 'signing',
    status: 'scheduled'
  },
  {
    id: 'thu-gibbs-3',
    playerId: 'jahmyr-gibbs',
    date: '2026-02-06',
    startTime: '12:25',
    endTime: '12:35',
    station: 'packRip',
    status: 'scheduled'
  },
  {
    id: 'thu-gibbs-4',
    playerId: 'jahmyr-gibbs',
    date: '2026-02-06',
    startTime: '12:35',
    endTime: '12:45',
    station: 'free',
    status: 'scheduled'
  },
  {
    id: 'thu-gibbs-5',
    playerId: 'jahmyr-gibbs',
    date: '2026-02-06',
    startTime: '12:45',
    endTime: '13:00',
    station: 'prCall',
    status: 'scheduled',
    prCallInfo: {
      outlet: 'Fox News Digital (Sports)',
      contact: 'Scott Thompson',
      callIn: '732-850-2940'
    }
  },

  // Penei Sewell — OT | Lions | Thu 11:00–1:00 (Signing only)
  {
    id: 'thu-sewell-1',
    playerId: 'penei-sewell',
    date: '2026-02-06',
    startTime: '11:00',
    endTime: '13:00',
    station: 'signing',
    status: 'scheduled',
    notes: 'Signing only'
  },

  // Kyle Hamilton — S | Ravens | Thu 11:00–1:00 (Signing only)
  {
    id: 'thu-hamilton-1',
    playerId: 'kyle-hamilton',
    date: '2026-02-06',
    startTime: '11:00',
    endTime: '13:00',
    station: 'signing',
    status: 'scheduled',
    notes: 'Signing only'
  },

  // ---------------
  // 2:30 PM – 4:30 PM Session
  // ---------------

  // Quinn Ewers — QB | Dolphins | Thu 2:30–4:30
  {
    id: 'thu-ewers-1',
    playerId: 'quinn-ewers',
    date: '2026-02-06',
    startTime: '14:30',
    endTime: '14:45',
    station: 'ledWall',
    status: 'scheduled'
  },
  {
    id: 'thu-ewers-2',
    playerId: 'quinn-ewers',
    date: '2026-02-06',
    startTime: '14:45',
    endTime: '16:05',
    station: 'free',
    status: 'scheduled',
    notes: 'Signing omitted per plan (free time buffer)'
  },
  {
    id: 'thu-ewers-3',
    playerId: 'quinn-ewers',
    date: '2026-02-06',
    startTime: '16:05',
    endTime: '16:15',
    station: 'packRip',
    status: 'scheduled'
  },
  {
    id: 'thu-ewers-4',
    playerId: 'quinn-ewers',
    date: '2026-02-06',
    startTime: '16:15',
    endTime: '16:30',
    station: 'prCall',
    status: 'scheduled',
    prCallInfo: {
      outlet: 'SiriusXM Radio',
      callIn: '1-866-603-8317'
    }
  },

  // Cole Kmet — TE | Bears | Thu 2:30–4:30 (Signing only)
  {
    id: 'thu-kmet-1',
    playerId: 'cole-kmet',
    date: '2026-02-06',
    startTime: '14:30',
    endTime: '16:30',
    station: 'signing',
    status: 'scheduled',
    notes: 'Signing only'
  },

  // ---------------
  // 3:30 PM – 4:30 PM Session
  // ---------------

  // Matt Leinart — QB | Retired | Thu 3:30–4:30
  {
    id: 'thu-leinart-1',
    playerId: 'matt-leinart',
    date: '2026-02-06',
    startTime: '15:30',
    endTime: '15:45',
    station: 'ledWall',
    status: 'scheduled'
  },
  {
    id: 'thu-leinart-2',
    playerId: 'matt-leinart',
    date: '2026-02-06',
    startTime: '15:45',
    endTime: '16:00',
    station: 'prCall',
    status: 'scheduled',
    prCallInfo: {
      outlet: "Men's Journal",
      contact: 'Kameron Duncan',
      callIn: '240-688-9648'
    }
  },
  {
    id: 'thu-leinart-3',
    playerId: 'matt-leinart',
    date: '2026-02-06',
    startTime: '16:00',
    endTime: '16:10',
    station: 'packRip',
    status: 'scheduled'
  },
  {
    id: 'thu-leinart-4',
    playerId: 'matt-leinart',
    date: '2026-02-06',
    startTime: '16:10',
    endTime: '16:30',
    station: 'free',
    status: 'scheduled',
    notes: 'Signing omitted per plan (free time buffer)'
  },

  // ---------------
  // Thursday TBD
  // ---------------

  // Michael Penix Jr. — QB | Falcons | Thu TBD
  {
    id: 'thu-penix-tbd',
    playerId: 'michael-penix-jr',
    date: '2026-02-06',
    startTime: '00:00',
    endTime: '00:00',
    station: 'free',
    status: 'tbd',
    notes: 'Schedule TBD - build LED/Pack/optional signing when times land'
  },

  // =====================================================
  // FRIDAY FEB 7 - Day 2
  // =====================================================

  // ---------------
  // 10:00 AM – 11:30 AM Session (Adjusted)
  // ---------------

  // Trevor Lawrence — QB | Jaguars | Fri 10:00–11:30
  {
    id: 'fri-lawrence-1',
    playerId: 'trevor-lawrence',
    date: '2026-02-07',
    startTime: '10:00',
    endTime: '10:15',
    station: 'ledWall',
    status: 'scheduled'
  },
  {
    id: 'fri-lawrence-2',
    playerId: 'trevor-lawrence',
    date: '2026-02-07',
    startTime: '10:15',
    endTime: '10:25',
    station: 'signing',
    status: 'scheduled'
  },
  {
    id: 'fri-lawrence-2b',
    playerId: 'trevor-lawrence',
    date: '2026-02-07',
    startTime: '10:25',
    endTime: '10:55',
    station: 'free',
    status: 'scheduled',
    notes: 'Free / Buffer'
  },
  {
    id: 'fri-lawrence-3',
    playerId: 'trevor-lawrence',
    date: '2026-02-07',
    startTime: '10:55',
    endTime: '11:05',
    station: 'packRip',
    status: 'scheduled'
  },
  {
    id: 'fri-lawrence-4',
    playerId: 'trevor-lawrence',
    date: '2026-02-07',
    startTime: '11:05',
    endTime: '11:15',
    station: 'free',
    status: 'scheduled',
    notes: 'Free / Buffer'
  },
  {
    id: 'fri-lawrence-5',
    playerId: 'trevor-lawrence',
    date: '2026-02-07',
    startTime: '11:15',
    endTime: '11:30',
    station: 'prCall',
    status: 'scheduled',
    prCallInfo: {
      outlet: 'The Mirror (US)',
      contact: 'Damian Burchardt',
      callIn: 'TBD'
    }
  },

  // Tyler Shough — QB | Saints | Fri 10:00–11:30
  {
    id: 'fri-shough-1',
    playerId: 'tyler-shough',
    date: '2026-02-07',
    startTime: '10:15',
    endTime: '10:30',
    station: 'ledWall',
    status: 'scheduled'
  },
  {
    id: 'fri-shough-2',
    playerId: 'tyler-shough',
    date: '2026-02-07',
    startTime: '10:30',
    endTime: '10:40',
    station: 'signing',
    status: 'scheduled'
  },
  {
    id: 'fri-shough-2b',
    playerId: 'tyler-shough',
    date: '2026-02-07',
    startTime: '10:40',
    endTime: '11:05',
    station: 'free',
    status: 'scheduled',
    notes: 'Free / Buffer'
  },
  {
    id: 'fri-shough-3',
    playerId: 'tyler-shough',
    date: '2026-02-07',
    startTime: '11:05',
    endTime: '11:15',
    station: 'packRip',
    status: 'scheduled'
  },
  {
    id: 'fri-shough-4',
    playerId: 'tyler-shough',
    date: '2026-02-07',
    startTime: '11:15',
    endTime: '11:30',
    station: 'prCall',
    status: 'scheduled',
    prCallInfo: {
      outlet: 'Fox News Digital (Sports)',
      contact: 'Scott Thompson',
      callIn: '732-850-2940'
    }
  },

  // ---------------
  // 11:00 AM – 1:00 PM Session
  // ---------------

  // Rome Odunze — WR | Bears | Fri 11:00–1:00
  {
    id: 'fri-odunze-1',
    playerId: 'rome-odunze',
    date: '2026-02-07',
    startTime: '11:00',
    endTime: '11:15',
    station: 'ledWall',
    status: 'scheduled'
  },
  {
    id: 'fri-odunze-2',
    playerId: 'rome-odunze',
    date: '2026-02-07',
    startTime: '11:15',
    endTime: '11:25',
    station: 'signing',
    status: 'scheduled'
  },
  {
    id: 'fri-odunze-2b',
    playerId: 'rome-odunze',
    date: '2026-02-07',
    startTime: '11:25',
    endTime: '12:25',
    station: 'free',
    status: 'scheduled',
    notes: 'Free / Buffer'
  },
  {
    id: 'fri-odunze-3',
    playerId: 'rome-odunze',
    date: '2026-02-07',
    startTime: '12:25',
    endTime: '12:35',
    station: 'packRip',
    status: 'scheduled'
  },
  {
    id: 'fri-odunze-4',
    playerId: 'rome-odunze',
    date: '2026-02-07',
    startTime: '12:35',
    endTime: '12:45',
    station: 'free',
    status: 'scheduled'
  },
  {
    id: 'fri-odunze-5',
    playerId: 'rome-odunze',
    date: '2026-02-07',
    startTime: '12:45',
    endTime: '13:00',
    station: 'prCall',
    status: 'scheduled',
    prCallInfo: {
      outlet: 'WestwoodOne Radio',
      contact: 'John Lund',
      callIn: 'TBD'
    }
  },

  // ---------------
  // 12:00 PM – 2:00 PM Session
  // ---------------

  // Champ Bailey — CB | Retired | Fri 12:00–2:00 (No signing, no PR)
  {
    id: 'fri-bailey-1',
    playerId: 'champ-bailey',
    date: '2026-02-07',
    startTime: '12:00',
    endTime: '12:15',
    station: 'ledWall',
    status: 'scheduled'
  },
  {
    id: 'fri-bailey-2',
    playerId: 'champ-bailey',
    date: '2026-02-07',
    startTime: '12:15',
    endTime: '12:25',
    station: 'packRip',
    status: 'scheduled'
  },
  {
    id: 'fri-bailey-3',
    playerId: 'champ-bailey',
    date: '2026-02-07',
    startTime: '12:25',
    endTime: '14:00',
    station: 'free',
    status: 'scheduled',
    notes: 'No PR listed; free/buffer time'
  },

  // Ty Law — CB | Retired | Fri 12:00–2:00
  {
    id: 'fri-law-1',
    playerId: 'ty-law',
    date: '2026-02-07',
    startTime: '12:00',
    endTime: '12:15',
    station: 'ledWall',
    status: 'scheduled'
  },
  {
    id: 'fri-law-2',
    playerId: 'ty-law',
    date: '2026-02-07',
    startTime: '12:15',
    endTime: '13:35',
    station: 'free',
    status: 'scheduled',
    notes: 'Signing omitted per plan (free time buffer)'
  },
  {
    id: 'fri-law-3',
    playerId: 'ty-law',
    date: '2026-02-07',
    startTime: '13:35',
    endTime: '13:45',
    station: 'packRip',
    status: 'scheduled'
  },
  {
    id: 'fri-law-4',
    playerId: 'ty-law',
    date: '2026-02-07',
    startTime: '13:45',
    endTime: '14:00',
    station: 'prCall',
    status: 'scheduled',
    prCallInfo: {
      outlet: 'WestwoodOne Radio',
      contact: 'John Lund',
      callIn: 'TBD'
    }
  },

  // ---------------
  // 12:30 PM – 2:30 PM Session
  // ---------------

  // Will Anderson Jr. — EDGE | Texans | Fri 12:30–2:30
  {
    id: 'fri-anderson-1',
    playerId: 'will-anderson-jr',
    date: '2026-02-07',
    startTime: '12:30',
    endTime: '12:45',
    station: 'ledWall',
    status: 'scheduled'
  },
  {
    id: 'fri-anderson-2',
    playerId: 'will-anderson-jr',
    date: '2026-02-07',
    startTime: '12:45',
    endTime: '14:05',
    station: 'free',
    status: 'scheduled',
    notes: 'Signing omitted per plan (free time buffer)'
  },
  {
    id: 'fri-anderson-3',
    playerId: 'will-anderson-jr',
    date: '2026-02-07',
    startTime: '14:05',
    endTime: '14:15',
    station: 'packRip',
    status: 'scheduled'
  },
  {
    id: 'fri-anderson-4',
    playerId: 'will-anderson-jr',
    date: '2026-02-07',
    startTime: '14:15',
    endTime: '14:30',
    station: 'prCall',
    status: 'scheduled',
    prCallInfo: {
      outlet: 'ESPN Radio LIVE',
      contact: 'Amber Wilson / Ian Fitzsimmons',
      callIn: 'TBD'
    }
  },

  // ---------------
  // 1:00 PM – 3:00 PM Session
  // ---------------

  // Ricky Williams — RB | Retired | Fri 1:00–3:00
  {
    id: 'fri-williams-1',
    playerId: 'ricky-williams',
    date: '2026-02-07',
    startTime: '13:00',
    endTime: '13:15',
    station: 'ledWall',
    status: 'scheduled'
  },
  {
    id: 'fri-williams-2',
    playerId: 'ricky-williams',
    date: '2026-02-07',
    startTime: '13:15',
    endTime: '14:35',
    station: 'free',
    status: 'scheduled',
    notes: 'Signing omitted per plan (free time buffer)'
  },
  {
    id: 'fri-williams-3',
    playerId: 'ricky-williams',
    date: '2026-02-07',
    startTime: '14:35',
    endTime: '14:45',
    station: 'packRip',
    status: 'scheduled'
  },
  {
    id: 'fri-williams-4',
    playerId: 'ricky-williams',
    date: '2026-02-07',
    startTime: '14:45',
    endTime: '15:00',
    station: 'free',
    status: 'scheduled',
    notes: 'No PR listed'
  },

  // ---------------
  // 2:00 PM – 3:30 PM Session
  // ---------------

  // Aidan Hutchinson — EDGE | Lions | Fri 2:00–3:30
  {
    id: 'fri-hutchinson-1',
    playerId: 'aidan-hutchinson',
    date: '2026-02-07',
    startTime: '14:00',
    endTime: '14:15',
    station: 'ledWall',
    status: 'scheduled'
  },
  {
    id: 'fri-hutchinson-2',
    playerId: 'aidan-hutchinson',
    date: '2026-02-07',
    startTime: '14:15',
    endTime: '14:25',
    station: 'signing',
    status: 'scheduled'
  },
  {
    id: 'fri-hutchinson-2b',
    playerId: 'aidan-hutchinson',
    date: '2026-02-07',
    startTime: '14:25',
    endTime: '15:05',
    station: 'free',
    status: 'scheduled',
    notes: 'Free / Buffer'
  },
  {
    id: 'fri-hutchinson-3',
    playerId: 'aidan-hutchinson',
    date: '2026-02-07',
    startTime: '15:05',
    endTime: '15:15',
    station: 'packRip',
    status: 'scheduled'
  },
  {
    id: 'fri-hutchinson-4',
    playerId: 'aidan-hutchinson',
    date: '2026-02-07',
    startTime: '15:15',
    endTime: '15:30',
    station: 'prCall',
    status: 'scheduled',
    prCallInfo: {
      outlet: 'Forbes',
      contact: 'DJ Siddiqi',
      callIn: '561-281-6882'
    }
  },

  // ---------------
  // 2:30 PM – 4:30 PM Session
  // ---------------

  // Andre Reed — WR | Retired | Fri 2:30–4:30
  {
    id: 'fri-reed-1',
    playerId: 'andre-reed',
    date: '2026-02-07',
    startTime: '14:30',
    endTime: '14:45',
    station: 'ledWall',
    status: 'scheduled'
  },
  {
    id: 'fri-reed-2',
    playerId: 'andre-reed',
    date: '2026-02-07',
    startTime: '14:45',
    endTime: '15:05',
    station: 'signing',
    status: 'scheduled'
  },
  {
    id: 'fri-reed-2b',
    playerId: 'andre-reed',
    date: '2026-02-07',
    startTime: '15:05',
    endTime: '16:05',
    station: 'free',
    status: 'scheduled',
    notes: 'Free / Buffer'
  },
  {
    id: 'fri-reed-3',
    playerId: 'andre-reed',
    date: '2026-02-07',
    startTime: '16:05',
    endTime: '16:15',
    station: 'packRip',
    status: 'scheduled'
  },
  {
    id: 'fri-reed-4',
    playerId: 'andre-reed',
    date: '2026-02-07',
    startTime: '16:15',
    endTime: '16:30',
    station: 'prCall',
    status: 'scheduled',
    prCallInfo: {
      outlet: 'ESPN Radio LIVE',
      contact: 'Amber Wilson / Ian Fitzsimmons',
      callIn: 'TBD'
    }
  },

  // ---------------
  // 4:30 PM – 6:00 PM Session
  // ---------------

  // Dante Moore — QB | Oregon | Fri 4:30–6:00
  {
    id: 'fri-moore-1',
    playerId: 'dante-moore',
    date: '2026-02-07',
    startTime: '16:30',
    endTime: '16:45',
    station: 'ledWall',
    status: 'scheduled'
  },
  {
    id: 'fri-moore-2',
    playerId: 'dante-moore',
    date: '2026-02-07',
    startTime: '16:45',
    endTime: '17:05',
    station: 'signing',
    status: 'scheduled'
  },
  {
    id: 'fri-moore-2b',
    playerId: 'dante-moore',
    date: '2026-02-07',
    startTime: '17:05',
    endTime: '17:35',
    station: 'free',
    status: 'scheduled',
    notes: 'Free / Buffer'
  },
  {
    id: 'fri-moore-3',
    playerId: 'dante-moore',
    date: '2026-02-07',
    startTime: '17:35',
    endTime: '17:45',
    station: 'packRip',
    status: 'scheduled'
  },
  {
    id: 'fri-moore-4',
    playerId: 'dante-moore',
    date: '2026-02-07',
    startTime: '17:45',
    endTime: '18:00',
    station: 'prCall',
    status: 'scheduled',
    prCallInfo: {
      outlet: 'On3',
      contact: 'Nick Schultz',
      callIn: '815-685-1854'
    }
  },

  // =====================================================
  // SATURDAY FEB 8 - Day 3
  // =====================================================

  // ---------------
  // 11:00 AM – 1:00 PM Session
  // ---------------

  // Keisean Henderson — QB | Houston (commit) | Sat 11:00–1:00
  {
    id: 'sat-henderson-1',
    playerId: 'keisean-henderson',
    date: '2026-02-08',
    startTime: '11:00',
    endTime: '11:15',
    station: 'ledWall',
    status: 'scheduled'
  },
  {
    id: 'sat-henderson-2',
    playerId: 'keisean-henderson',
    date: '2026-02-08',
    startTime: '11:15',
    endTime: '12:45',
    station: 'free',
    status: 'scheduled',
    notes: 'Optional stickers only if ahead (free time buffer)'
  },
  {
    id: 'sat-henderson-3',
    playerId: 'keisean-henderson',
    date: '2026-02-08',
    startTime: '12:45',
    endTime: '12:55',
    station: 'packRip',
    status: 'scheduled'
  },
  {
    id: 'sat-henderson-4',
    playerId: 'keisean-henderson',
    date: '2026-02-08',
    startTime: '12:55',
    endTime: '13:00',
    station: 'free',
    status: 'scheduled',
    notes: 'No PR listed'
  },

  // ---------------
  // 2:00 PM – 4:00 PM Session
  // ---------------

  // Julian Edelman — WR | Retired | Sat 2:00–4:00 (Eli Manning Show)
  {
    id: 'sat-edelman-1',
    playerId: 'julian-edelman',
    date: '2026-02-08',
    startTime: '14:00',
    endTime: '16:00',
    station: 'signing',
    status: 'scheduled',
    notes: 'Eli Manning Show - Special Event'
  },

  // =====================================================
  // TBD / SIGNING ONLY PLAYERS (Date/Time TBD, no media)
  // =====================================================

  // Cooper Kupp — WR | Seahawks (TBD)
  {
    id: 'tbd-kupp-1',
    playerId: 'cooper-kupp',
    date: '2026-02-06',
    startTime: '00:00',
    endTime: '00:00',
    station: 'signing',
    status: 'tbd',
    notes: 'Signing only, Date/Time TBD (no media)'
  },

  // Antonio Gibson — RB | Patriots (TBD)
  {
    id: 'tbd-gibson-1',
    playerId: 'antonio-gibson',
    date: '2026-02-06',
    startTime: '00:00',
    endTime: '00:00',
    station: 'signing',
    status: 'tbd',
    notes: 'Signing only, Date/Time TBD (no media)'
  },

  // Brian Robinson Jr. — RB | 49ers (TBD)
  {
    id: 'tbd-robinson-1',
    playerId: 'brian-robinson-jr',
    date: '2026-02-06',
    startTime: '00:00',
    endTime: '00:00',
    station: 'signing',
    status: 'tbd',
    notes: 'Signing only, Date/Time TBD (no media)'
  },

  // Trey McBride — TE | Cardinals (TBD)
  {
    id: 'tbd-mcbride-1',
    playerId: 'trey-mcbride',
    date: '2026-02-06',
    startTime: '00:00',
    endTime: '00:00',
    station: 'signing',
    status: 'tbd',
    notes: 'Signing only, Date/Time TBD (no media)'
  }
];

// Helper functions
export const getScheduleForDay = (schedule: ScheduleSlot[], date: string): ScheduleSlot[] => {
  return schedule
    .filter(slot => slot.date === date && slot.status !== 'cancelled')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
};

export const getScheduleForStation = (schedule: ScheduleSlot[], station: StationId, date?: string): ScheduleSlot[] => {
  return schedule
    .filter(slot =>
      slot.station === station &&
      slot.status !== 'cancelled' &&
      (!date || slot.date === date)
    )
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
};

export const getScheduleForPlayer = (schedule: ScheduleSlot[], playerId: string): ScheduleSlot[] => {
  return schedule
    .filter(slot => slot.playerId === playerId && slot.status !== 'cancelled')
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
};

export const getCurrentSlot = (schedule: ScheduleSlot[], station: StationId, now: Date): ScheduleSlot | null => {
  const today = now.toISOString().split('T')[0];
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return schedule.find(slot =>
    slot.station === station &&
    slot.date === today &&
    slot.status === 'scheduled' &&
    slot.startTime <= currentTime &&
    slot.endTime > currentTime
  ) || null;
};

export const getNextSlot = (schedule: ScheduleSlot[], station: StationId, now: Date): ScheduleSlot | null => {
  const today = now.toISOString().split('T')[0];
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const upcomingSlots = schedule
    .filter(slot =>
      slot.station === station &&
      slot.status === 'scheduled' &&
      (slot.date > today || (slot.date === today && slot.startTime > currentTime))
    )
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });

  return upcomingSlots[0] || null;
};

// Get unique players scheduled for a specific day
export const getPlayersForDay = (schedule: ScheduleSlot[], date: string): string[] => {
  const playerIds = new Set(
    schedule
      .filter(slot => slot.date === date && slot.status === 'scheduled')
      .map(slot => slot.playerId)
  );
  return Array.from(playerIds);
};

// Count completed players for today (all their slots done)
export const getCompletedPlayerCount = (schedule: ScheduleSlot[], date: string, now: Date): number => {
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const todaySchedule = schedule.filter(slot => slot.date === date && slot.status === 'scheduled');

  const playerSlots = new Map<string, ScheduleSlot[]>();
  todaySchedule.forEach(slot => {
    const slots = playerSlots.get(slot.playerId) || [];
    slots.push(slot);
    playerSlots.set(slot.playerId, slots);
  });

  let completed = 0;
  playerSlots.forEach(slots => {
    const allDone = slots.every(slot => slot.endTime <= currentTime);
    if (allDone) completed++;
  });

  return completed;
};

// Get TBD slots that need scheduling
export const getTBDSlots = (schedule: ScheduleSlot[]): ScheduleSlot[] => {
  return schedule.filter(slot => slot.status === 'tbd');
};

// Get all PR calls for a day
export const getPRCallsForDay = (schedule: ScheduleSlot[], date: string): ScheduleSlot[] => {
  return schedule
    .filter(slot =>
      slot.date === date &&
      slot.station === 'prCall' &&
      slot.status === 'scheduled' &&
      slot.prCallInfo
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
};

// ---------- Player Arrival Summaries ----------

export interface PlayerArrival {
  playerId: string;
  date: string;
  arrivalTime: string;       // earliest startTime for this player on this day
  departureTime: string;     // latest endTime for this player on this day
  status: 'scheduled' | 'tbd';
  signingOnly: boolean;      // true when their only station is signing
  prCall: {
    time: string;
    outlet: string;
    contact?: string;
    callIn?: string;
    notes?: string;
  } | null;
  notes: string | null;      // first non-empty note on their slots
}

/**
 * Summarise every player's appearance on a given day into a single row:
 * arrival time, departure time, whether signing-only, and PR-call info.
 */
export const getPlayerArrivalsForDay = (
  schedule: ScheduleSlot[],
  date: string
): PlayerArrival[] => {
  const daySlots = schedule.filter(
    (slot) => slot.date === date && slot.status !== 'cancelled'
  );

  // Group by player
  const byPlayer = new Map<string, ScheduleSlot[]>();
  daySlots.forEach((slot) => {
    const list = byPlayer.get(slot.playerId) || [];
    list.push(slot);
    byPlayer.set(slot.playerId, list);
  });

  const arrivals: PlayerArrival[] = [];

  byPlayer.forEach((slots, playerId) => {
    // Sort slots by start time
    const sorted = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Arrival = earliest start that isn't 00:00 (TBD sentinel)
    const scheduled = sorted.filter((s) => s.startTime !== '00:00');
    const arrivalTime = scheduled.length > 0 ? scheduled[0].startTime : '00:00';
    const departureTime = scheduled.length > 0 ? scheduled[scheduled.length - 1].endTime : '00:00';
    const isTbd = sorted.every((s) => s.status === 'tbd') || arrivalTime === '00:00';

    // Signing only = every non-free station is 'signing'
    const nonFreeStations = sorted.filter((s) => s.station !== 'free').map((s) => s.station);
    const signingOnly = nonFreeStations.length > 0 && nonFreeStations.every((s) => s === 'signing');

    // PR call info
    const prSlot = sorted.find((s) => s.station === 'prCall' && s.prCallInfo);
    const prCall = prSlot?.prCallInfo
      ? {
          time: prSlot.startTime,
          outlet: prSlot.prCallInfo.outlet,
          contact: prSlot.prCallInfo.contact,
          callIn: prSlot.prCallInfo.callIn,
          notes: prSlot.prCallInfo.notes,
        }
      : null;

    // Grab first meaningful note
    const note = sorted.find((s) => s.notes)?.notes || null;

    arrivals.push({
      playerId,
      date,
      arrivalTime,
      departureTime,
      status: isTbd ? 'tbd' : 'scheduled',
      signingOnly,
      prCall,
      notes: note,
    });
  });

  // Sort: TBD at bottom, then by arrival time
  arrivals.sort((a, b) => {
    if (a.status === 'tbd' && b.status !== 'tbd') return 1;
    if (a.status !== 'tbd' && b.status === 'tbd') return -1;
    return a.arrivalTime.localeCompare(b.arrivalTime);
  });

  return arrivals;
};
