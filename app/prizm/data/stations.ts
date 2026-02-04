import { Station, StationId } from '../types';

export const stations: Station[] = [
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
    name: 'Pack Rip Station',
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
    id: 'photoOp',
    name: 'Photo Op Station',
    icon: '📸',
    color: '#3b82f6',
    questions: [
      'Strike your signature pose!',
      'Recreate your championship moment',
      'Show us your celebration',
      'Give us your game face',
      'What pose do fans request most?'
    ]
  },
  {
    id: 'interview',
    name: 'Interview Station',
    icon: '🎙️',
    color: '#8b5cf6',
    questions: [
      'Defining moment of your career?',
      'Message to collectors and fans?',
      'What does being on a Prizm card mean to you?',
      'Favorite memory with fans?',
      'What legacy do you want to leave?'
    ]
  }
];

// Helper functions
export const getStationById = (id: StationId): Station | undefined => {
  return stations.find(s => s.id === id);
};

// Get short station name (removes "Station" suffix)
export const getShortStationName = (name: string): string => {
  return name.replace(' Station', '');
};

// Format station ID to display name (e.g., 'packRip' -> 'Pack Rip')
export const formatStationId = (id: StationId): string => {
  const station = getStationById(id);
  if (station) {
    return getShortStationName(station.name);
  }
  // Fallback: convert camelCase to space-separated words
  return id.replace(/([A-Z])/g, ' $1').trim();
};

// Station lookup map for O(1) access
export const stationMap = new Map<StationId, Station>(
  stations.map(s => [s.id, s])
);

// Station order for rotation
export const stationOrder: StationId[] = ['signing', 'packRip', 'photoOp', 'interview'];
