/**
 * Default Production Checklist for Prizm Lounge
 * Organized by category and event day
 */

import { ChecklistItem } from '../types';

export const defaultChecklist: ChecklistItem[] = [
  // =====================
  // THURSDAY - SETUP
  // =====================
  {
    id: 'setup-th-1',
    category: 'setup',
    title: 'Verify venue access and credentials',
    description: 'Confirm all crew members have proper credentials and venue access badges',
    completed: false,
    dueDay: 'Thursday',
    priority: 'high',
  },
  {
    id: 'setup-th-2',
    category: 'setup',
    title: 'Set up LED Wall station',
    description: 'Configure LED wall, test display, verify content playback system',
    completed: false,
    dueDay: 'Thursday',
    priority: 'high',
  },
  {
    id: 'setup-th-3',
    category: 'setup',
    title: 'Set up Signing station',
    description: 'Arrange tables, chairs, markers, Prizm cards for signing',
    completed: false,
    dueDay: 'Thursday',
    priority: 'high',
  },
  {
    id: 'setup-th-4',
    category: 'setup',
    title: 'Set up Pack Rips station',
    description: 'Arrange pack rip table, camera angles, product display',
    completed: false,
    dueDay: 'Thursday',
    priority: 'high',
  },
  {
    id: 'setup-th-5',
    category: 'setup',
    title: 'Test all camera equipment',
    description: 'Verify all cameras, batteries, memory cards, and backup equipment',
    completed: false,
    dueDay: 'Thursday',
    priority: 'high',
  },
  {
    id: 'setup-th-6',
    category: 'setup',
    title: 'Test audio equipment',
    description: 'Check microphones, wireless packs, audio recorder levels',
    completed: false,
    dueDay: 'Thursday',
    priority: 'medium',
  },
  {
    id: 'setup-th-7',
    category: 'setup',
    title: 'Verify WiFi and network connectivity',
    description: 'Test WiFi speeds, ensure backup connectivity options',
    completed: false,
    dueDay: 'Thursday',
    priority: 'medium',
  },
  {
    id: 'setup-th-8',
    category: 'setup',
    title: 'Set up charging stations',
    description: 'Establish device charging areas for crew equipment',
    completed: false,
    dueDay: 'Thursday',
    priority: 'low',
  },

  // THURSDAY - PLAYER
  {
    id: 'player-th-1',
    category: 'player',
    title: 'Confirm Thursday player arrivals',
    description: 'Verify arrival times and transportation for all Thursday players',
    completed: false,
    dueDay: 'Thursday',
    priority: 'high',
  },
  {
    id: 'player-th-2',
    category: 'player',
    title: 'Review Thursday player schedules with team',
    description: 'Brief entire crew on player rotation schedule and any special requirements',
    completed: false,
    dueDay: 'Thursday',
    priority: 'high',
  },
  {
    id: 'player-th-3',
    category: 'player',
    title: 'Prepare player welcome kits',
    description: 'Assemble gift bags, Prizm products, and welcome materials for players',
    completed: false,
    dueDay: 'Thursday',
    priority: 'medium',
  },

  // THURSDAY - CONTENT
  {
    id: 'content-th-1',
    category: 'content',
    title: 'Create opening day social posts',
    description: 'Draft and schedule social media posts for event opening',
    completed: false,
    dueDay: 'Thursday',
    priority: 'high',
  },
  {
    id: 'content-th-2',
    category: 'content',
    title: 'Capture venue B-roll',
    description: 'Film establishing shots of Prizm Lounge setup and atmosphere',
    completed: false,
    dueDay: 'Thursday',
    priority: 'medium',
  },
  {
    id: 'content-th-3',
    category: 'content',
    title: 'Test live streaming setup',
    description: 'Verify live stream connectivity, encoding, and backup streams',
    completed: false,
    dueDay: 'Thursday',
    priority: 'high',
  },

  // =====================
  // FRIDAY - SETUP
  // =====================
  {
    id: 'setup-fr-1',
    category: 'setup',
    title: 'Morning equipment check',
    description: 'Verify all equipment from previous day, replace batteries, format cards',
    completed: false,
    dueDay: 'Friday',
    priority: 'high',
  },
  {
    id: 'setup-fr-2',
    category: 'setup',
    title: 'Review and address Day 1 issues',
    description: 'Discuss any problems from Thursday and implement solutions',
    completed: false,
    dueDay: 'Friday',
    priority: 'high',
  },

  // FRIDAY - PLAYER
  {
    id: 'player-fr-1',
    category: 'player',
    title: 'Confirm Friday player arrivals',
    description: 'Verify arrival times and transportation for all Friday players',
    completed: false,
    dueDay: 'Friday',
    priority: 'high',
  },
  {
    id: 'player-fr-2',
    category: 'player',
    title: 'Review Friday player schedules with team',
    description: 'Brief crew on Friday rotation and any schedule changes',
    completed: false,
    dueDay: 'Friday',
    priority: 'high',
  },
  {
    id: 'player-fr-3',
    category: 'player',
    title: 'Coordinate VIP player handling',
    description: 'Ensure special arrangements for high-profile Friday guests',
    completed: false,
    dueDay: 'Friday',
    priority: 'medium',
  },

  // FRIDAY - CONTENT
  {
    id: 'content-fr-1',
    category: 'content',
    title: 'Review and select Thursday highlights',
    description: 'Edit and prepare best content from Day 1 for posting',
    completed: false,
    dueDay: 'Friday',
    priority: 'high',
  },
  {
    id: 'content-fr-2',
    category: 'content',
    title: 'Create Day 1 recap video',
    description: 'Produce summary video of Thursday highlights',
    completed: false,
    dueDay: 'Friday',
    priority: 'medium',
  },
  {
    id: 'content-fr-3',
    category: 'content',
    title: 'Post Friday preview content',
    description: 'Share teaser content for Friday player lineup',
    completed: false,
    dueDay: 'Friday',
    priority: 'medium',
  },

  // =====================
  // SATURDAY - SETUP
  // =====================
  {
    id: 'setup-sa-1',
    category: 'setup',
    title: 'Final day equipment check',
    description: 'Comprehensive equipment verification for final event day',
    completed: false,
    dueDay: 'Saturday',
    priority: 'high',
  },
  {
    id: 'setup-sa-2',
    category: 'setup',
    title: 'Prepare for increased traffic',
    description: 'Game day preparation - expect higher visitor volume',
    completed: false,
    dueDay: 'Saturday',
    priority: 'high',
  },

  // SATURDAY - PLAYER
  {
    id: 'player-sa-1',
    category: 'player',
    title: 'Confirm Saturday player arrivals',
    description: 'Verify arrival times for final day players',
    completed: false,
    dueDay: 'Saturday',
    priority: 'high',
  },
  {
    id: 'player-sa-2',
    category: 'player',
    title: 'Coordinate game day player schedules',
    description: 'Account for any Super Bowl related player commitments',
    completed: false,
    dueDay: 'Saturday',
    priority: 'high',
  },

  // SATURDAY - CONTENT
  {
    id: 'content-sa-1',
    category: 'content',
    title: 'Review and select Friday highlights',
    description: 'Edit best content from Day 2 for posting',
    completed: false,
    dueDay: 'Saturday',
    priority: 'high',
  },
  {
    id: 'content-sa-2',
    category: 'content',
    title: 'Create Day 2 recap video',
    description: 'Produce summary video of Friday highlights',
    completed: false,
    dueDay: 'Saturday',
    priority: 'medium',
  },
  {
    id: 'content-sa-3',
    category: 'content',
    title: 'Prepare final event wrap-up content',
    description: 'Draft comprehensive event summary for post-event release',
    completed: false,
    dueDay: 'Saturday',
    priority: 'medium',
  },

  // SATURDAY - TEARDOWN
  {
    id: 'teardown-sa-1',
    category: 'teardown',
    title: 'Begin equipment breakdown',
    description: 'Start packing non-essential equipment after last session',
    completed: false,
    dueDay: 'Saturday',
    priority: 'medium',
  },
  {
    id: 'teardown-sa-2',
    category: 'teardown',
    title: 'Inventory all equipment',
    description: 'Complete equipment checklist to ensure nothing is left behind',
    completed: false,
    dueDay: 'Saturday',
    priority: 'high',
  },
  {
    id: 'teardown-sa-3',
    category: 'teardown',
    title: 'Backup all content',
    description: 'Ensure all footage and photos are backed up to multiple locations',
    completed: false,
    dueDay: 'Saturday',
    priority: 'high',
  },
  {
    id: 'teardown-sa-4',
    category: 'teardown',
    title: 'Collect player autograph materials',
    description: 'Gather all signed cards and materials for cataloging',
    completed: false,
    dueDay: 'Saturday',
    priority: 'high',
  },
  {
    id: 'teardown-sa-5',
    category: 'teardown',
    title: 'Return venue to original condition',
    description: 'Remove all Panini branding and restore venue setup',
    completed: false,
    dueDay: 'Saturday',
    priority: 'medium',
  },
  {
    id: 'teardown-sa-6',
    category: 'teardown',
    title: 'Complete crew debrief',
    description: 'Final team meeting to discuss event and document lessons learned',
    completed: false,
    dueDay: 'Saturday',
    priority: 'low',
  },
];

/**
 * Get checklist items for a specific day
 */
export function getChecklistForDay(day: string): ChecklistItem[] {
  return defaultChecklist.filter((item) => item.dueDay === day);
}

/**
 * Get checklist items for a specific category
 */
export function getChecklistForCategory(category: string): ChecklistItem[] {
  return defaultChecklist.filter((item) => item.category === category);
}
