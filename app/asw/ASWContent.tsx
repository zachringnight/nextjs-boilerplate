'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { players, playerCounts, getPlayerByFirstName } from './data/players';
import PlayerCard from './components/PlayerCard';
import GlobalSearch from './components/GlobalSearch';
import { useASWStore } from './store';
import { useMounted } from './hooks/useMounted';
import { DAY_STYLES, STATUS_COLORS } from './lib/constants';
import { Search, Users, Filter, AlertTriangle } from 'lucide-react';
import type { Player } from './types';
import { PageSkeleton } from './components/Skeleton';

const PlayerModal = dynamic(() => import('./components/PlayerModal'), { ssr: false });
const ScheduleView = dynamic(() => import('./components/ScheduleView'));
const StationToolView = dynamic(() => import('./components/StationToolView'));
const NowDashboard = dynamic(() => import('./components/NowDashboard'));

export default function ASWContent() {
  const { viewMode, largeText, activeDay, setActiveDay, showEmbargoedOnly, setShowEmbargoedOnly } = useASWStore();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const mounted = useMounted();

  const handlePlayerClick = useCallback((firstName: string) => {
    const player = getPlayerByFirstName(firstName);
    if (player) setSelectedPlayer(player);
  }, []);

  const handleSearchSelect = useCallback((player: Player) => {
    setSelectedPlayer(player);
  }, []);

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesSearch =
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.teamAbbr.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDay = activeDay === null || player.day === activeDay;
      const matchesEmbargo = !showEmbargoedOnly || player.embargoed;
      return matchesSearch && matchesDay && matchesEmbargo;
    });
  }, [searchQuery, activeDay, showEmbargoedOnly]);

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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search players, teams, or nationality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD100]/50"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
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
          <StationToolView largeText={largeText} />
        )}
        {viewMode === 'players' && (
          <>
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No players match your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlayers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    onClick={() => setSelectedPlayer(player)}
                  />
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
