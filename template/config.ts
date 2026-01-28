/**
 * SHOOT CONFIGURATION
 * ===================
 * Customize this file for each new shoot event.
 * This controls the event details, stations, colors, and scheduling.
 */

export interface StationConfig {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  colorClass: string;
  description: string;
}

export interface EventConfig {
  // Event Details
  name: string;
  subtitle: string;
  date: string;
  location: string;
  timezone: string;

  // Metadata
  metaTitle: string;
  metaDescription: string;

  // Theming
  accentColor: string;
  accentColorClass: string;

  // Station Configuration
  stations: StationConfig[];

  // Group Configuration
  groups: {
    id: number;
    name: string;
    time: string;
    color: string;
    borderClass: string;
  }[];

  // Rotation Settings
  rotationDurationMinutes: number;
}

/**
 * EXAMPLE CONFIGURATION
 * Copy and modify this for your shoot
 */
export const eventConfig: EventConfig = {
  // ============================================
  // EVENT DETAILS - Update for each shoot
  // ============================================
  name: 'YOUR EVENT NAME',
  subtitle: 'Partner Name • Event Type',
  date: 'Month DD, YYYY',
  location: 'Venue Name, City',
  timezone: 'America/Los_Angeles', // Use IANA timezone

  // ============================================
  // METADATA - For browser tab and SEO
  // ============================================
  metaTitle: 'Event Name | Partner Shoot Packet',
  metaDescription: 'Partner x League - Media Day Shoot Packet',

  // ============================================
  // THEMING - Primary accent color
  // ============================================
  accentColor: '#f59e0b', // Amber by default
  accentColorClass: 'amber-500',

  // ============================================
  // STATIONS - Define your shoot stations
  // ============================================
  stations: [
    {
      id: 'field',
      name: 'Field Station',
      shortName: 'Field',
      icon: '⬢',
      color: '#22c55e',
      colorClass: 'green-500',
      description: 'On-camera hero shots and rollouts',
    },
    {
      id: 'social',
      name: 'Social Station',
      shortName: 'Social',
      icon: '◎',
      color: '#3b82f6',
      colorClass: 'blue-500',
      description: 'Quick social media content and soundbites',
    },
    {
      id: 'vnr',
      name: 'VNR Station',
      shortName: 'VNR',
      icon: '◉',
      color: '#8b5cf6',
      colorClass: 'violet-500',
      description: 'Video news release interviews',
    },
    {
      id: 'packRip',
      name: 'Pack Rip Station',
      shortName: 'Pack Rip',
      icon: '▣',
      color: '#f59e0b',
      colorClass: 'amber-500',
      description: 'Product unboxing and reactions',
    },
  ],

  // ============================================
  // GROUPS - Participant rotation groups
  // ============================================
  groups: [
    {
      id: 1,
      name: 'Group 1',
      time: '9:00 AM - 10:20 AM',
      color: '#22c55e',
      borderClass: 'border-green-500',
    },
    {
      id: 2,
      name: 'Group 2',
      time: '10:30 AM - 11:50 AM',
      color: '#f59e0b',
      borderClass: 'border-amber-500',
    },
    {
      id: 3,
      name: 'Group 3',
      time: '1:00 PM - 2:20 PM',
      color: '#8b5cf6',
      borderClass: 'border-violet-500',
    },
  ],

  // ============================================
  // ROTATION - Time per station
  // ============================================
  rotationDurationMinutes: 20,
};

/**
 * Helper function to get station by ID
 */
export function getStation(id: string): StationConfig | undefined {
  return eventConfig.stations.find((s) => s.id === id);
}

/**
 * Helper function to get group by ID
 */
export function getGroup(id: number) {
  return eventConfig.groups.find((g) => g.id === id);
}

/**
 * Get all station IDs as a union type
 */
export type StationId = (typeof eventConfig.stations)[number]['id'];
