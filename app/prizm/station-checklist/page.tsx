'use client';

import { useState, useEffect, useMemo } from 'react';
import { ClipboardCheck, RotateCcw, Users, Calendar } from 'lucide-react';
import { useAppStore } from '../store';
import { players } from '../data/players';
import { stations, checklistStations } from '../data/stations';
import { EVENT_DATES, DAY_LABELS, getPlayersForDay } from '../data/schedule';
import { formatDate } from '../lib/time';
import PlayerStationChecklist from '../components/PlayerStationChecklist';

type ViewMode = 'players' | 'summary';
type DayFilter = 'all' | typeof EVENT_DATES[number];

export default function StationChecklistPage() {
  const {
    schedule,
    largeText,
    playerStationCompletions,
    resetPlayerStationChecklist,
    getPlayerProgress,
    getStationCompletionCount,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<ViewMode>('players');
  const [showSigningOnly, setShowSigningOnly] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Auto-detect current day for default filter
  const [selectedDay, setSelectedDay] = useState<DayFilter>('all');

  useEffect(() => {
    setMounted(true);
    const today = formatDate(new Date());
    if ((EVENT_DATES as readonly string[]).includes(today)) {
      setSelectedDay(today as typeof EVENT_DATES[number]);
    }
  }, []);

  // Get player IDs scheduled for the selected day
  const dayPlayerIds = useMemo(() => {
    if (selectedDay === 'all') return null; // null means show all
    return new Set(getPlayersForDay(schedule, selectedDay));
  }, [schedule, selectedDay]);

  // Filter players by day and signing type
  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      if (showSigningOnly && !p.signingOnly) return false;
      if (!showSigningOnly && p.signingOnly) return false;
      if (dayPlayerIds && !dayPlayerIds.has(p.id)) return false;
      return true;
    });
  }, [showSigningOnly, dayPlayerIds]);

  // Calculate stats for currently filtered players
  const stats = useMemo(() => {
    const rotationPlayers = filteredPlayers.filter((p) => !p.signingOnly);
    const signingOnlyPlayers = filteredPlayers.filter((p) => p.signingOnly);

    const rotationCompleted = rotationPlayers.filter((p) => {
      const progress = getPlayerProgress(p.id);
      return progress.percentage === 100;
    }).length;

    const signingCompleted = signingOnlyPlayers.filter((p) => {
      const progress = getPlayerProgress(p.id);
      return progress.percentage === 100;
    }).length;

    return {
      rotationTotal: rotationPlayers.length,
      rotationCompleted,
      signingTotal: signingOnlyPlayers.length,
      signingCompleted,
      totalCompletions: playerStationCompletions.filter((c) => c.completed).length,
    };
  }, [playerStationCompletions, getPlayerProgress, filteredPlayers]);

  // Station summary data
  const stationSummary = useMemo(() => {
    const relevantPlayerIds = new Set(filteredPlayers.map((p) => p.id));
    return checklistStations.map((stationId) => {
      const station = stations.find((s) => s.id === stationId);
      const count = playerStationCompletions.filter(
        (c) => c.stationId === stationId && c.completed && relevantPlayerIds.has(c.playerId)
      ).length;
      const totalPlayers = filteredPlayers.length;
      return {
        id: stationId,
        name: station?.name || stationId,
        icon: station?.icon || '',
        color: station?.color || '#666',
        completed: count,
        total: totalPlayers,
        percentage: totalPlayers > 0 ? Math.round((count / totalPlayers) * 100) : 0,
      };
    });
  }, [playerStationCompletions, filteredPlayers]);

  // Day tab colors
  const dayColors: Record<string, string> = {
    'all': 'bg-zinc-600',
    [EVENT_DATES[0]]: 'bg-blue-600',
    [EVENT_DATES[1]]: 'bg-purple-600',
    [EVENT_DATES[2]]: 'bg-amber-600',
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`font-bold text-white flex items-center gap-2 ${largeText ? 'text-2xl' : 'text-xl'}`}>
              <ClipboardCheck className="w-6 h-6 text-[#FFD100]" />
              Player Station Checklist
            </h1>
            <p className={`text-zinc-400 mt-1 ${largeText ? 'text-base' : 'text-sm'}`}>
              Track which stations each player has completed
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm('Reset all player station completions?')) {
                resetPlayerStationChecklist();
              }
            }}
            className="text-zinc-500 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            title="Reset All"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Day Filter Tabs */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-zinc-400" />
          <span className={`text-zinc-400 ${largeText ? 'text-base' : 'text-sm'}`}>Filter by Day</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedDay('all')}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              selectedDay === 'all'
                ? 'bg-zinc-600 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            All Days
          </button>
          {EVENT_DATES.map((date) => {
            const isToday = formatDate(new Date()) === date;
            return (
              <button
                key={date}
                onClick={() => setSelectedDay(date)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedDay === date
                    ? `${dayColors[date]} text-white`
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <div>{DAY_LABELS[date]}</div>
                {isToday && (
                  <div className="text-[10px] opacity-80 font-normal">Today</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-[#FFD100]" />
              <span className={`text-zinc-400 ${largeText ? 'text-base' : 'text-sm'}`}>Rotation Players</span>
            </div>
            <div className={`font-bold text-white ${largeText ? 'text-2xl' : 'text-xl'}`}>
              {stats.rotationCompleted}/{stats.rotationTotal}
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-[#FFD100] transition-all duration-300"
                style={{
                  width: stats.rotationTotal > 0 ? `${(stats.rotationCompleted / stats.rotationTotal) * 100}%` : '0%',
                }}
              />
            </div>
            <p className={`text-zinc-500 mt-1 ${largeText ? 'text-sm' : 'text-xs'}`}>completed all stations</p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span className={`text-zinc-400 ${largeText ? 'text-base' : 'text-sm'}`}>Signing Only</span>
            </div>
            <div className={`font-bold text-white ${largeText ? 'text-2xl' : 'text-xl'}`}>
              {stats.signingCompleted}/{stats.signingTotal}
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{
                  width: stats.signingTotal > 0 ? `${(stats.signingCompleted / stats.signingTotal) * 100}%` : '0%',
                }}
              />
            </div>
            <p className={`text-zinc-500 mt-1 ${largeText ? 'text-sm' : 'text-xs'}`}>completed all stations</p>
          </div>
        </div>

        <div className="mt-3 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className={`text-zinc-400 ${largeText ? 'text-base' : 'text-sm'}`}>Total Station Completions</span>
            <span className={`font-bold text-green-500 ${largeText ? 'text-2xl' : 'text-xl'}`}>
              {stats.totalCompletions}
            </span>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('players')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              viewMode === 'players'
                ? 'bg-[#FFD100] text-black'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            By Player
          </button>
          <button
            onClick={() => setViewMode('summary')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              viewMode === 'summary'
                ? 'bg-[#FFD100] text-black'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            By Station
          </button>
        </div>
      </div>

      {/* Player Type Toggle */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setShowSigningOnly(false)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              !showSigningOnly
                ? 'bg-zinc-700 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            Rotation Players ({stats.rotationTotal})
          </button>
          <button
            onClick={() => setShowSigningOnly(true)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              showSigningOnly
                ? 'bg-zinc-700 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            Signing Only ({stats.signingTotal})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {viewMode === 'players' ? (
          <PlayerStationChecklist filterSigningOnly={showSigningOnly} dayPlayerIds={dayPlayerIds} />
        ) : (
          /* Station Summary View */
          <div className="space-y-3">
            {stationSummary.map((station) => (
              <div key={station.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${station.color}20` }}
                  >
                    {station.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-white ${largeText ? 'text-lg' : 'text-base'}`}>
                      {station.name}
                    </p>
                    <p className={`text-zinc-400 ${largeText ? 'text-base' : 'text-sm'}`}>
                      {station.completed} of {station.total} players completed
                    </p>
                  </div>
                  <div
                    className={`font-bold ${largeText ? 'text-2xl' : 'text-xl'}`}
                    style={{ color: station.percentage === 100 ? '#22c55e' : station.color }}
                  >
                    {station.percentage}%
                  </div>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${station.percentage}%`,
                      backgroundColor: station.percentage === 100 ? '#22c55e' : station.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
