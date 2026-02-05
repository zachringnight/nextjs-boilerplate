'use client';

import { useMemo } from 'react';
import { useAppStore } from '../store';
import { players } from '../data/players';
import { ContentMode, CONTENT_MODES } from '../types';

export interface PlayerContentGap {
  playerId: string;
  playerName: string;
  team: string;
  unusedModes: ContentMode[];
  usedModes: ContentMode[];
  coveragePercentage: number;
  hasFullCoverage: boolean;
  hasCriticalGaps: boolean; // Missing more than 50% of modes
}

/**
 * Hook to identify players with content coverage gaps
 * Returns players sorted by gap severity
 */
export function useContentGaps() {
  const { contentTracking, getUnusedModes, getContentForPlayer } = useAppStore();

  const analysis = useMemo(() => {
    const allGaps: PlayerContentGap[] = players.map((player) => {
      const unusedModes = getUnusedModes(player.id);
      const usedModes = CONTENT_MODES.filter((mode) => !unusedModes.includes(mode));
      const coveragePercentage = Math.round((usedModes.length / CONTENT_MODES.length) * 100);

      return {
        playerId: player.id,
        playerName: player.name,
        team: player.team,
        unusedModes,
        usedModes,
        coveragePercentage,
        hasFullCoverage: unusedModes.length === 0,
        hasCriticalGaps: coveragePercentage < 50,
      };
    });

    // Sort by coverage percentage (ascending - worst coverage first)
    const sorted = [...allGaps].sort((a, b) => a.coveragePercentage - b.coveragePercentage);

    return {
      all: allGaps,
      withGaps: sorted.filter((p) => !p.hasFullCoverage),
      withFullCoverage: allGaps.filter((p) => p.hasFullCoverage),
      critical: sorted.filter((p) => p.hasCriticalGaps),
      totalPlayers: players.length,
      playersWithFullCoverage: allGaps.filter((p) => p.hasFullCoverage).length,
      playersWithGaps: allGaps.filter((p) => !p.hasFullCoverage).length,
      playersWithCriticalGaps: allGaps.filter((p) => p.hasCriticalGaps).length,
      overallCoverage: Math.round(
        allGaps.reduce((sum, p) => sum + p.coveragePercentage, 0) / players.length
      ),
    };
  }, [contentTracking, getUnusedModes, getContentForPlayer]);

  return analysis;
}

/**
 * Hook to get content gap for a specific player
 */
export function usePlayerContentGap(playerId: string) {
  const { getUnusedModes, getContentForPlayer, hasUsedMode } = useAppStore();

  return useMemo(() => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return null;

    const unusedModes = getUnusedModes(playerId);
    const usedModes = CONTENT_MODES.filter((mode) => !unusedModes.includes(mode));
    const coveragePercentage = Math.round((usedModes.length / CONTENT_MODES.length) * 100);
    const content = getContentForPlayer(playerId);

    return {
      playerId,
      playerName: player.name,
      team: player.team,
      unusedModes,
      usedModes,
      coveragePercentage,
      hasFullCoverage: unusedModes.length === 0,
      hasCriticalGaps: coveragePercentage < 50,
      contentHistory: content,
      totalContent: content.length,
    };
  }, [playerId, getUnusedModes, getContentForPlayer]);
}

/**
 * Get recommended next content mode for a player
 * Prioritizes modes that are most commonly needed across all players
 */
export function useRecommendedModes(playerId: string, limit = 3) {
  const { getUnusedModes, contentTracking } = useAppStore();

  return useMemo(() => {
    const unusedModes = getUnusedModes(playerId);

    // Count how many times each mode has been used across all players
    const modeUsageCounts: Record<ContentMode, number> = {} as Record<ContentMode, number>;
    CONTENT_MODES.forEach((mode) => {
      modeUsageCounts[mode] = contentTracking.filter((c) => c.mode === mode).length;
    });

    // Sort unused modes by least used (prioritize modes that need more coverage)
    const sorted = [...unusedModes].sort(
      (a, b) => modeUsageCounts[a] - modeUsageCounts[b]
    );

    return sorted.slice(0, limit);
  }, [playerId, getUnusedModes, contentTracking]);
}
