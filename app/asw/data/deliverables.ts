/**
 * Default Deliverables for ASW NBA All-Star Weekend
 *
 * Deliverable categories:
 *   1. Tunnel walk video for each player
 *   2. Product photos for each player
 *   3. Daily recaps (one per event day)
 */

import type { Deliverable, EventDay } from '../types';
import { players } from './players';

// Generate per-player deliverables (tunnel video + product photos for each player)
const playerDeliverables: Deliverable[] = players.flatMap((player) => {
  const dueDay: EventDay = player.day === 1 ? 'Thursday' : 'Friday';
  return [
    {
      id: `del-tunnel-${player.id}`,
      title: `Tunnel Walk Video — ${player.name}`,
      description: `Tunnel walk-in interview + B-roll for ${player.name} (${player.team})`,
      type: 'video' as const,
      status: 'pending' as const,
      playerId: player.id,
      dueDay,
      priority: 'high' as const,
    },
    {
      id: `del-product-${player.id}`,
      title: `Product Photos — ${player.name}`,
      description: `Card photography and product shots for ${player.name} (${player.team})`,
      type: 'photo' as const,
      status: 'pending' as const,
      playerId: player.id,
      dueDay,
      priority: 'high' as const,
    },
  ];
});

// Generate daily recap deliverables
const recapDeliverables: Deliverable[] = [
  {
    id: 'del-recap-day-1',
    title: 'Daily Recap — Day 1 (Thursday)',
    description: 'End-of-day recap video/content for Thursday, February 12',
    type: 'video' as const,
    status: 'pending' as const,
    dueDay: 'Thursday' as EventDay,
    priority: 'high' as const,
  },
  {
    id: 'del-recap-day-2',
    title: 'Daily Recap — Day 2 (Friday)',
    description: 'End-of-day recap video/content for Friday, February 13',
    type: 'video' as const,
    status: 'pending' as const,
    dueDay: 'Friday' as EventDay,
    priority: 'high' as const,
  },
];

export const defaultDeliverables: Deliverable[] = [
  ...playerDeliverables,
  ...recapDeliverables,
];
