import { Station, StationId } from '../types';

export const stations: Station[] = [
  {
    id: 'ledWall',
    name: 'LED Wall',
    icon: '📺',
    color: '#ec4899',
    questions: [
      'Strike your signature pose for the LED wall!',
      'Show us your championship celebration!',
      'Give us your game face!',
      'What pose do fans request most?',
      'Recreate an iconic moment!'
    ]
  },
  {
    id: 'signing',
    name: 'Signing Station',
    icon: '✍️',
    color: '#22c55e',
    questions: [
      'What was the first autograph you ever signed?',
      'Do you have a favorite card of yourself?',
      'What do you think about when signing for fans?',
      'Most memorable signing experience?',
      'How has your signature evolved over the years?'
    ]
  },
  {
    id: 'packRip',
    name: 'Pack Rips',
    icon: '📦',
    color: '#f59e0b',
    questions: [
      'What pull would make your day?',
      'Best card you have ever pulled?',
      'Did you collect cards growing up?',
      'What player would you want to pull?',
      'First pack you ever opened?'
    ]
  },
  {
    id: 'prCall',
    name: 'PR Call',
    icon: '📞',
    color: '#8b5cf6',
    questions: [
      'Defining moment of your career?',
      'Message to collectors and fans?',
      'What does being on a Prizm card mean to you?',
      'Favorite memory with fans?',
      'What legacy do you want to leave?'
    ]
  },
  {
    id: 'free',
    name: 'Free / Buffer',
    icon: '⏸️',
    color: '#6b7280',
    questions: [
      'Rest and preparation time',
      'Available for impromptu media',
      'Touch-up and refreshments',
      'Review upcoming activities'
    ]
  },
  {
    id: 'kidReporter',
    name: 'Kid Reporter',
    icon: '🎤',
    color: '#06b6d4',
    questions: [
      'What was your favorite subject in school?',
      'If you could have any superpower, what would it be?',
      'What advice would you give to kids who want to play sports?',
      'Who was your hero growing up?',
      'What is your favorite snack before a game?'
    ]
  },
  {
    id: 'deacon',
    name: 'Deacon',
    icon: '🙏',
    color: '#a855f7',
    questions: [
      'How does faith play a role in your career?',
      'What motivates you off the field?',
      'Message of inspiration for fans?',
      'How do you stay grounded?',
      'What are you most grateful for?'
    ]
  }
];

// Helper functions
export const getStationById = (id: StationId): Station | undefined => {
  return stations.find(s => s.id === id);
};

// Station lookup map for O(1) access
export const stationMap = new Map<StationId, Station>(
  stations.map(s => [s.id, s])
);

// Station order for typical rotation
export const stationOrder: StationId[] = ['ledWall', 'signing', 'packRip', 'prCall', 'kidReporter', 'deacon'];

// Stations used for player completion checklist (excludes free/buffer)
export const checklistStations: StationId[] = ['ledWall', 'signing', 'packRip', 'prCall', 'kidReporter', 'deacon'];
