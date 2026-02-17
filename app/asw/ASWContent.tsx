'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { players, playerCounts, getPlayerById } from './data/players';
import PlayerCard from './components/PlayerCard';
import GlobalSearch from './components/GlobalSearch';
import { useASWStore } from './store';
import { useMounted } from './hooks/useMounted';
import { DAY_STYLES } from './lib/constants';
import { Search, Users, Filter, AlertTriangle, Languages, ArrowUpDown, RotateCcw } from 'lucide-react';
import type { Player } from './types';
import { PageSkeleton } from './components/Skeleton';

const PlayerModal = dynamic(() => import('./components/PlayerModal'), { ssr: false });
const ScheduleView = dynamic(() => import('./components/ScheduleView'));
const StationToolView = dynamic(() => import('./components/StationToolView'));
const NowDashboard = dynamic(() => import('./components/NowDashboard'));

type PlayerSortOption = 'name' | 'team' | 'day' | 'time';

const getSortTimeValue = (time: string | null) => {
  if (!time) return Number.MAX_SAFE_INTEGER;
  const parsed = Date.parse(`2000-01-01 ${time}`);
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
};

export default function ASWContent() {
  const { viewMode, largeText, activeDay, setActiveDay, showEmbargoedOnly, setShowEmbargoedOnly, selectedStation } = useASWStore();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTranslatorOnly, setShowTranslatorOnly] = useState(false);
  const [sortBy, setSortBy] = useState<PlayerSortOption>('name');
  const mounted = useMounted();

  const handlePlayerClick = useCallback((playerId: string) => {
    const player = getPlayerById(playerId);
    if (player) setSelectedPlayer(player);
  }, []);

  const handleSearchSelect = useCallback((player: Player) => {
    setSelectedPlayer(player);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setActiveDay(null);
    setShowEmbargoedOnly(false);
    setShowTranslatorOnly(false);
    setSortBy('name');
  }, [setActiveDay, setShowEmbargoedOnly]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    activeDay !== null ||
    showEmbargoedOnly ||
    showTranslatorOnly ||
    sortBy !== 'name';

  const filteredPlayers = useMemo(() => {
    const filtered = players.filter((player) => {
      const matchesSearch =
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.teamAbbr.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDay = activeDay === null || player.day === activeDay;
      const matchesEmbargo = !showEmbargoedOnly || player.embargoed;
      const matchesTranslator = !showTranslatorOnly || player.translatorNeeded;
      return matchesSearch && matchesDay && matchesEmbargo && matchesTranslator;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'team':
          return a.team.localeCompare(b.team) || a.lastName.localeCompare(b.lastName);
        case 'day':
          return a.day - b.day || getSortTimeValue(a.scheduledTime) - getSortTimeValue(b.scheduledTime);
        case 'time':
          return getSortTimeValue(a.scheduledTime) - getSortTimeValue(b.scheduledTime) || a.lastName.localeCompare(b.lastName);
        case 'name':
        default:
          return a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName);
      }
    });
  }, [searchQuery, activeDay, showEmbargoedOnly, showTranslatorOnly, sortBy]);

  const visibleCounts = useMemo(() => {
    return {
      total: filteredPlayers.length,
      day1: filteredPlayers.filter((player) => player.day === 1).length,
      day2: filteredPlayers.filter((player) => player.day === 2).length,
      embargoed: filteredPlayers.filter((player) => player.embargoed).length,
      translator: filteredPlayers.filter((player) => player.translatorNeeded).length,
    };
  }, [filteredPlayers]);

  if (!mounted) {
    return <PageSkeleton type="live" />;
  }

  return (
    <>
      <GlobalSearch onPlayerSelect={handleSearchSelect} />

      <div className={`max-w-7xl mx-auto px-4 py-6 ${largeText ? 'text-lg' : ''}`}>
        {/* Players view filters */}
        {viewMode === 'players' && (
          <div className="mb-6 space-y-4">
            <div className="rounded-2xl border border-[#2A2A2A] bg-[linear-gradient(140deg,#1a1a1a_0%,#111111_55%,#161616_100%)] p-4 shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search players, teams, or nationality..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD100]/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      aria-label="Clear search"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="relative flex-1 lg:flex-none">
                    <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as PlayerSortOption)}
                      className="w-full lg:w-48 appearance-none bg-[#141414] border border-[#2A2A2A] rounded-xl pl-9 pr-8 py-3 text-sm text-white focus:outline-none focus:border-[#FFD100]/50"
                      aria-label="Sort players"
                    >
                      <option value="name">Sort: Name</option>
                      <option value="team">Sort: Team</option>
                      <option value="day">Sort: Day</option>
                      <option value="time">Sort: Time</option>
                    </select>
                  </label>

                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="shrink-0 px-3 py-3 rounded-xl border border-[#3A3A3A] bg-[#141414] text-[#D1D5DB] hover:text-white hover:border-[#FFD100]/40 transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setActiveDay(null)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeDay === null ? 'bg-[#FFD100] text-black' : 'bg-[#141414] text-gray-300 hover:bg-[#1a1a1a]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  All ({playerCounts.total})
                </button>
                {([1, 2] as const).map((day) => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(activeDay === day ? null : day)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      activeDay === day ? `${DAY_STYLES[day].bg} text-white` : 'bg-[#141414] text-gray-300 hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    Day {day} ({DAY_STYLES[day].shortDay}) ({day === 1 ? playerCounts.day1 : playerCounts.day2})
                  </button>
                ))}
                <button
                  onClick={() => setShowEmbargoedOnly(!showEmbargoedOnly)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    showEmbargoedOnly ? 'bg-red-500 text-white' : 'bg-[#141414] text-gray-300 hover:bg-[#1a1a1a]'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Embargoed ({playerCounts.embargoed})
                </button>
                <button
                  onClick={() => setShowTranslatorOnly(!showTranslatorOnly)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    showTranslatorOnly ? 'bg-blue-500 text-white' : 'bg-[#141414] text-gray-300 hover:bg-[#1a1a1a]'
                  }`}
                >
                  <Languages className="w-4 h-4" />
                  Translator ({players.filter((player) => player.translatorNeeded).length})
                </button>
              </div>

              <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                <div className="rounded-lg border border-[#2A2A2A] bg-[#101010] px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-[#6B7280]">Visible</p>
                  <p className="text-lg font-semibold text-white">{visibleCounts.total}</p>
                </div>
                <div className="rounded-lg border border-[#2A2A2A] bg-[#101010] px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-[#6B7280]">Day 1</p>
                  <p className="text-lg font-semibold text-white">{visibleCounts.day1}</p>
                </div>
                <div className="rounded-lg border border-[#2A2A2A] bg-[#101010] px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-[#6B7280]">Day 2</p>
                  <p className="text-lg font-semibold text-white">{visibleCounts.day2}</p>
                </div>
                <div className="rounded-lg border border-[#2A2A2A] bg-[#101010] px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-[#6B7280]">Embargoed</p>
                  <p className="text-lg font-semibold text-red-400">{visibleCounts.embargoed}</p>
                </div>
                <div className="rounded-lg border border-[#2A2A2A] bg-[#101010] px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-[#6B7280]">Translator</p>
                  <p className="text-lg font-semibold text-blue-300">{visibleCounts.translator}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Views */}
        {viewMode === 'now' && (
          <NowDashboard onPlayerClick={handlePlayerClick} />
        )}
        {viewMode === 'schedule' && (
          <ScheduleView onPlayerClick={handlePlayerClick} />
        )}
        {viewMode === 'station' && (
          <StationToolView largeText={largeText} selectedStation={selectedStation} />
        )}
        {viewMode === 'players' && (
          <>
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-[#2A2A2A] bg-[#121212]">
                <p className="text-gray-300 font-medium mb-2">No players match your current filters.</p>
                <p className="text-gray-500 text-sm mb-4">Try clearing one or more filters to broaden results.</p>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-lg bg-[#FFD100] text-black font-semibold hover:brightness-95 transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className="animate-[smoothAppear_0.25s_ease-out_both]"
                    style={{ animationDelay: `${Math.min(index * 30, 240)}ms` }}
                  >
                    <PlayerCard
                      player={player}
                      onClick={() => setSelectedPlayer(player)}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Player Modal */}
      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          largeText={largeText}
        />
      )}
    </>
  );
}
