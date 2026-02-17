/**
 * Default Deliverables for Prizm Lounge Production
 *
 * Only three deliverable categories:
 *   1. Video for each player
 *   2. Photos for each player
 *   3. Daily recaps (one per event day)
 */

import { Deliverable, EventDay } from '../types';
import { players } from './players';
import { EVENT_DATES, DAY_LABELS } from './schedule';

// Map dates to EventDay labels
const dateToDayLabel: Record<string, EventDay> = {
  '2026-02-05': 'Thursday',
  '2026-02-06': 'Friday',
  '2026-02-07': 'Saturday',
};

// Generate per-player deliverables (video + photos for each player)
const playerDeliverables: Deliverable[] = players.flatMap((player) => [
  {
    id: `del-video-${player.id}`,
    title: `Video — ${player.name}`,
    description: `Capture video content for ${player.name} (${player.team})`,
    type: 'video' as const,
    status: 'pending' as const,
    playerId: player.id,
    dueDay: 'Thursday' as EventDay,
    priority: 'high' as const,
  },
  {
    id: `del-photo-${player.id}`,
    title: `Photos — ${player.name}`,
    description: `Capture photos for ${player.name} (${player.team})`,
    type: 'photo' as const,
    status: 'pending' as const,
    playerId: player.id,
    dueDay: 'Thursday' as EventDay,
    priority: 'high' as const,
  },
]);

// Generate daily recap deliverables (one per event day)
const recapDeliverables: Deliverable[] = EVENT_DATES.map((date, i) => ({
  id: `del-recap-day-${i + 1}`,
  title: `Daily Recap — Day ${i + 1} (${DAY_LABELS[date]})`,
  description: `End-of-day recap video/content for ${DAY_LABELS[date]}`,
  type: 'video' as const,
  status: 'pending' as const,
  dueDay: dateToDayLabel[date] || ('Thursday' as EventDay),
  priority: 'high' as const,
}));

export const defaultDeliverables: Deliverable[] = [
  ...playerDeliverables,
  ...recapDeliverables,
];

/**
 * Get deliverables for a specific day
 */
export function getDeliverablesForDay(day: string): Deliverable[] {
  return defaultDeliverables.filter((d) => d.dueDay === day);
}

/**
 * Get deliverables for a specific type
 */
export function getDeliverablesForType(type: string): Deliverable[] {
  return defaultDeliverables.filter((d) => d.type === type);
}
