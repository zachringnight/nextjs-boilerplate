'use client';

import { useState, useMemo } from 'react';
import { ClipboardCheck, RotateCcw, Users, Search } from 'lucide-react';
import { useASWStore } from '../store';
import { players } from '../data/players';
import { ASW_STATIONS, CHECKLIST_STATIONS, type ASWStationId } from '../types';

export default function ChecklistPage() {
  const {
    largeText,
    playerStationCompletions,
    togglePlayerStation,
    isStationCompleted,
    getPlayerProgress,
    getStationCompletionCount,
    resetPlayerStationChecklist,
  } = useASWStore();

  const [viewMode, setViewMode] = useState<'players' | 'summary'>('players');
  const [activeDay, setActiveDay] = useState<1 | 2 | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());

  // Filter players
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      if (activeDay !== null && player.day !== activeDay) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          player.name.toLowerCase().includes(q) ||
          player.team.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeDay, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const day1Players = players.filter((p) => p.day === 1);
    const day2Players = players.filter((p) => p.day === 2);

    const day1Completed = day1Players.filter((p) => {
      const progress = getPlayerProgress(p.id);
      return progress.percentage === 100;
    }).length;

    const day2Completed = day2Players.filter((p) => {
      const progress = getPlayerProgress(p.id);
      return progress.percentage === 100;
    }).length;

    return {
      day1Total: day1Players.length,
      day1Completed,
      day2Total: day2Players.length,
      day2Completed,
      totalCompletions: playerStationCompletions.filter((c) => c.completed).length,
    };
  }, [playerStationCompletions, getPlayerProgress]);

  // Station summary
  const stationSummary = useMemo(() => {
    return CHECKLIST_STATIONS.map((stationId) => {
      const station = ASW_STATIONS.find((s) => s.id === stationId);
      const count = getStationCompletionCount(stationId);
      const totalPlayers = activeDay
        ? players.filter((p) => p.day === activeDay).length
        : players.length;
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
  }, [activeDay, getStationCompletionCount]);

  const getStation = (stationId: ASWStationId) => {
    return ASW_STATIONS.find((s) => s.id === stationId);
  };

  const toggleExpand = (playerId: string) => {
    setExpandedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`font-bold text-white flex items-center gap-2 ${largeText ? 'text-2xl' : 'text-xl'}`}>
              <ClipboardCheck className="w-6 h-6 text-green-400" />
              Station Checklist
            </h1>
            <p className={`text-zinc-400 mt-1 ${largeText ? 'text-base' : 'text-sm'}`}>
              Track player progress through Tunnel & Product stations
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

      {/* Stats Overview */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className={`text-zinc-400 ${largeText ? 'text-base' : 'text-sm'}`}>Day 1 (Thursday)</span>
            </div>
            <div className={`font-bold text-white ${largeText ? 'text-2xl' : 'text-xl'}`}>
              {stats.day1Completed}/{stats.day1Total}
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{
                  width: stats.day1Total > 0 ? `${(stats.day1Completed / stats.day1Total) * 100}%` : '0%',
                }}
              />
            </div>
            <p className={`text-zinc-500 mt-1 ${largeText ? 'text-sm' : 'text-xs'}`}>completed all stations</p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-violet-400" />
              <span className={`text-zinc-400 ${largeText ? 'text-base' : 'text-sm'}`}>Day 2 (Friday)</span>
            </div>
            <div className={`font-bold text-white ${largeText ? 'text-2xl' : 'text-xl'}`}>
              {stats.day2Completed}/{stats.day2Total}
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-violet-500 transition-all duration-300"
                style={{
                  width: stats.day2Total > 0 ? `${(stats.day2Completed / stats.day2Total) * 100}%` : '0%',
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

      {/* Day Filter */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveDay(null)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeDay === null ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            All Players ({players.length})
          </button>
          <button
            onClick={() => setActiveDay(activeDay === 1 ? null : 1)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeDay === 1 ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            Day 1 ({stats.day1Total})
          </button>
          <button
            onClick={() => setActiveDay(activeDay === 2 ? null : 2)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeDay === 2 ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            Day 2 ({stats.day2Total})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {viewMode === 'players' ? (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#FFD100]/50 ${
                  largeText ? 'text-lg' : 'text-base'
                }`}
              />
            </div>

            {/* Station Legend */}
            <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
              <p className={`text-[#9CA3AF] mb-3 ${largeText ? 'text-base' : 'text-sm'}`}>Stations:</p>
              <div className="flex flex-wrap gap-2">
                {CHECKLIST_STATIONS.map((stationId) => {
                  const station = getStation(stationId);
                  if (!station) return null;
                  return (
                    <div
                      key={stationId}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: `${station.color}20` }}
                    >
                      <span>{station.icon}</span>
                      <span className={`${largeText ? 'text-sm' : 'text-xs'} font-medium`} style={{ color: station.color }}>
                        {station.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Player List */}
            <div className="space-y-3">
              {filteredPlayers.length === 0 ? (
                <div className="text-center py-8 text-[#6B7280]">
                  <p>No players found</p>
                </div>
              ) : (
                filteredPlayers.map((player) => {
                  const progress = getPlayerProgress(player.id);
                  const isExpanded = expandedPlayers.has(player.id);

                  return (
                    <div
                      key={player.id}
                      className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden"
                    >
                      {/* Player Header */}
                      <button
                        onClick={() => toggleExpand(player.id)}
                        className="w-full p-4 flex items-center gap-3 hover:bg-[#2A2A2A]/50 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#2A2A2A] flex items-center justify-center text-lg font-bold text-white overflow-hidden flex-shrink-0">
                          <span>{player.flag}</span>
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                          <span className={`font-semibold text-white truncate block ${largeText ? 'text-lg' : 'text-base'}`}>
                            {player.name}
                          </span>
                          <p className={`text-[#9CA3AF] ${largeText ? 'text-base' : 'text-sm'}`}>
                            {player.team} · Day {player.day}
                          </p>
                        </div>

                        {/* Progress */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className={`font-semibold ${progress.percentage === 100 ? 'text-green-500' : 'text-[#FFD100]'} ${largeText ? 'text-lg' : 'text-base'}`}>
                              {progress.completed}/{progress.total}
                            </p>
                          </div>

                          {/* Progress Ring */}
                          <div className="relative w-10 h-10">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="20" cy="20" r="16" stroke="#2A2A2A" strokeWidth="3" fill="none" />
                              <circle
                                cx="20" cy="20" r="16"
                                stroke={progress.percentage === 100 ? '#22c55e' : '#FFD100'}
                                strokeWidth="3" fill="none" strokeLinecap="round"
                                strokeDasharray={`${(progress.percentage / 100) * 100.5} 100.5`}
                              />
                            </svg>
                            {progress.percentage === 100 && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>

                          <svg
                            className={`w-5 h-5 text-[#6B7280] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Station Checklist (Expanded) */}
                      {isExpanded && (
                        <div className="border-t border-[#2A2A2A] p-4 bg-[#0F0F0F]">
                          <div className="grid grid-cols-2 gap-3">
                            {CHECKLIST_STATIONS.map((stationId) => {
                              const station = getStation(stationId);
                              if (!station) return null;
                              const completed = isStationCompleted(player.id, stationId);

                              return (
                                <button
                                  key={stationId}
                                  onClick={() => togglePlayerStation(player.id, stationId)}
                                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                                    completed
                                      ? 'bg-green-500/20 border-green-500/50'
                                      : 'bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#FFD100]/50'
                                  }`}
                                >
                                  <div
                                    className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                                      completed ? 'bg-green-500' : 'border-2 border-[#4B5563]'
                                    }`}
                                  >
                                    {completed && (
                                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-lg">{station.icon}</span>
                                    <span
                                      className={`font-medium ${largeText ? 'text-base' : 'text-sm'} ${
                                        completed ? 'text-green-400' : 'text-white'
                                      }`}
                                    >
                                      {station.name}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* Station Summary View */
          <div className="space-y-3">
            {stationSummary.map((station) => (
              <div key={station.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
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
