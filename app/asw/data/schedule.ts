'use client';

import { useMemo } from 'react';
import { players as basePlayers } from './players';
import { useASWStore } from '../store';
import type { Player } from '../types';

export type PlayerScheduleOverride = {
  day: 1 | 2;
  scheduledTime: string | null;
};

export type PlayerScheduleOverrides = Record<string, PlayerScheduleOverride>;

export const basePlayerById = new Map<string, Player>(basePlayers.map((player) => [player.id, player]));

export function applyScheduleOverrides(players: Player[], overrides: PlayerScheduleOverrides): Player[] {
  if (Object.keys(overrides).length === 0) return players;

  return players.map((player) => {
    const override = overrides[player.id];
    if (!override) return player;

    return {
      ...player,
      day: override.day,
      scheduledTime: override.scheduledTime,
    };
  });
}

function buildCollections(players: Player[]) {
  const day1Players = players.filter((player) => player.day === 1);
  const day2Players = players.filter((player) => player.day === 2);

  const playerCounts = {
    total: players.length,
    day1: day1Players.length,
    day2: day2Players.length,
    embargoed: players.filter((player) => player.embargoed).length,
    clear: players.filter((player) => !player.embargoed).length,
    translatorNeeded: players.filter((player) => player.translatorNeeded).length,
  } as const;

  const playerById = new Map<string, Player>(players.map((player) => [player.id, player]));

  return {
    players,
    day1Players,
    day2Players,
    playerCounts,
    playerById,
    getPlayerById: (id: string) => playerById.get(id),
  };
}

export function useSchedulePlayers() {
  const scheduleOverrides = useASWStore((state) => state.scheduleOverrides);

  return useMemo(() => {
    const players = applyScheduleOverrides(basePlayers, scheduleOverrides);
    const collections = buildCollections(players);

    return {
      ...collections,
      scheduleOverrides,
      overrideCount: Object.keys(scheduleOverrides).length,
      basePlayers,
      basePlayerById,
    };
  }, [scheduleOverrides]);
}
