'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { players, playerCounts, getPlayerByFirstName } from '../data/players';
import PlayerCard from './components/PlayerCard';
import type { Player } from '../data/players';

const PlayerModal = dynamic(() => import('./components/PlayerModal'), { ssr: false });
const ScheduleView = dynamic(() => import('./components/ScheduleView'));
const StationToolView = dynamic(() => import('./components/StationToolView'));
const NowDashboard = dynamic(() => import('./components/NowDashboard'));
import { Search, Users, Filter, Calendar, User, Radio, Zap, X, Type, AlertTriangle } from 'lucide-react';
import { ViewMode, EVENT_INFO } from '../lib/constants';

export default function CrewPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('now');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [showEmbargoedOnly, setShowEmbargoedOnly] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [largeTextMode, setLargeTextMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut for global search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearch(true);
      }
      if (e.key === 'Escape') {
        setShowGlobalSearch(false);
        setGlobalSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (showGlobalSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showGlobalSearch]);

  // Memoized global search results
  const globalSearchResults = useMemo(() => {
    if (globalSearchQuery.length === 0) return [];
    const query = globalSearchQuery.toLowerCase();
    return players.filter(p =>
      p.firstName.toLowerCase().includes(query) ||
      p.lastName.toLowerCase().includes(query) ||
      p.team.toLowerCase().includes(query) ||
      p.position.toLowerCase().includes(query)
    );
  }, [globalSearchQuery]);

  // Memoized filtered players for Players view
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesSearch =
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.nationality.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDay = activeDay === null || player.day === activeDay;
      const matchesEmbargo = !showEmbargoedOnly || player.embargoed;
      return matchesSearch && matchesDay && matchesEmbargo;
    });
  }, [searchQuery, activeDay, showEmbargoedOnly]);

  // Memoized day counts (use pre-computed values)
  const dayCounts = useMemo(() => ({
    1: playerCounts.day1,
    2: playerCounts.day2,
  }), []);

  // Optimized player lookup using Map
  const handlePlayerClick = useCallback((firstName: string) => {
    const player = getPlayerByFirstName(firstName);
    if (player) {
      setSelectedPlayer(player);
    }
  }, []);

  const closeGlobalSearch = useCallback(() => {
    setShowGlobalSearch(false);
    setGlobalSearchQuery('');
  }, []);

  const handleGlobalSearchSelect = useCallback((player: Player) => {
    setSelectedPlayer(player);
    closeGlobalSearch();
  }, [closeGlobalSearch]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">
                <span className="text-[#FFD100]">PANINI</span> CREW APP
              </h1>
              <p className="text-sm text-gray-500">{EVENT_INFO.name} - {EVENT_INFO.location}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Global Search Button */}
              <button
                onClick={() => setShowGlobalSearch(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[#141414] border border-[#2a2a2a] rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Search</span>
                <kbd className="hidden sm:inline text-xs bg-[#0a0a0a] px-1.5 py-0.5 rounded">⌘K</kbd>
              </button>
              {/* Large Text Toggle */}
              <button
                onClick={() => setLargeTextMode(!largeTextMode)}
                className={`p-2 rounded-lg transition-colors ${
                  largeTextMode
                    ? 'bg-amber-500 text-black'
                    : 'bg-[#141414] text-gray-400 hover:text-white'
                }`}
                title="Toggle large text mode"
              >
                <Type className="w-5 h-5" />
              </button>
              <div className="text-right">
                <p className="text-sm text-[#FFD100] font-medium">{EVENT_INFO.dateDisplay}</p>
                <p className="text-xs text-gray-500">{playerCounts.total} Players - {EVENT_INFO.totalDays} Days</p>
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button
              onClick={() => setViewMode('now')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === 'now'
                  ? 'bg-[#FFD100] text-black'
                  : 'bg-[#141414] text-gray-300 hover:bg-[#1a1a1a]'
              }`}
            >
              <Zap className="w-4 h-4" />
              Live Now
            </button>
            <button
              onClick={() => setViewMode('schedule')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === 'schedule'
                  ? 'bg-[#FFD100] text-black'
                  : 'bg-[#141414] text-gray-300 hover:bg-[#1a1a1a]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Schedule
            </button>
            <button
              onClick={() => setViewMode('station')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === 'station'
                  ? 'bg-[#FFD100] text-black'
                  : 'bg-[#141414] text-gray-300 hover:bg-[#1a1a1a]'
              }`}
            >
              <Radio className="w-4 h-4" />
              Station Tool
            </button>
            <button
              onClick={() => setViewMode('players')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === 'players'
                  ? 'bg-[#FFD100] text-black'
                  : 'bg-[#141414] text-gray-300 hover:bg-[#1a1a1a]'
              }`}
            >
              <User className="w-4 h-4" />
              Players
            </button>
          </div>

          {viewMode === 'players' && (
            <>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search players, teams, or nationality..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD100]/50"
                />
              </div>

              {/* Day filters */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setActiveDay(null)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeDay === null
                      ? 'bg-[#FFD100] text-black'
                      : 'bg-[#141414] text-gray-300 hover:bg-[#1a1a1a]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  All ({playerCounts.total})
                </button>
                <button
                  onClick={() => setActiveDay(activeDay === 1 ? null : 1)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeDay === 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-[#141414] text-gray-300 hover:bg-[#1a1a1a]'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Day 1 (Wed) ({dayCounts[1]})
                </button>
                <button
                  onClick={() => setActiveDay(activeDay === 2 ? null : 2)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeDay === 2
                      ? 'bg-violet-500 text-white'
                      : 'bg-[#141414] text-gray-300 hover:bg-[#1a1a1a]'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Day 2 (Thu) ({dayCounts[2]})
                </button>
                <button
                  onClick={() => setShowEmbargoedOnly(!showEmbargoedOnly)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    showEmbargoedOnly
                      ? 'bg-red-500 text-white'
                      : 'bg-[#141414] text-gray-300 hover:bg-[#1a1a1a]'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Embargoed ({playerCounts.embargoed})
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-4 py-6 ${largeTextMode ? 'text-lg' : ''}`}>
        {viewMode === 'now' && (
          <NowDashboard onPlayerClick={handlePlayerClick} />
        )}
        {viewMode === 'schedule' && (
          <ScheduleView onPlayerClick={handlePlayerClick} />
        )}
        {viewMode === 'station' && (
          <StationToolView largeText={largeTextMode} />
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
      </main>

      {/* Global Search Modal */}
      {showGlobalSearch && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-[backdropFade_0.15s_ease-out]"
            onClick={closeGlobalSearch}
          />
          <div className="relative flex justify-center pt-[15vh] px-4 animate-[slideUp_0.25s_ease-out]">
            <div className="w-full max-w-xl bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center border-b border-[#2a2a2a] px-4">
                <Search className="w-5 h-5 text-gray-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search players by name, team, or position..."
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent px-4 py-4 text-white placeholder-gray-500 focus:outline-none"
                />
                <button
                  onClick={closeGlobalSearch}
                  className="p-1 hover:bg-[#2a2a2a] rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Search Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {globalSearchQuery.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <p className="text-sm">Start typing to search players</p>
                    <p className="text-xs mt-1">Press ESC to close</p>
                  </div>
                ) : globalSearchResults.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <p>No players found</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {globalSearchResults.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handleGlobalSearchSelect(player)}
                        className="group w-full px-4 py-3 flex items-center gap-3 hover:bg-[#1a1a1a] transition-all duration-150 text-left"
                      >
                        <span className="text-2xl">{player.flag}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate group-hover:text-[#FFD100] transition-colors">
                            {player.firstName} {player.lastName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {player.position} - {player.team} - Day {player.day}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-600">
                            {player.scheduledTime}
                          </span>
                          {player.embargoed && (
                            <span className="block text-xs text-red-400">EMBARGO</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player Modal */}
      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          largeText={largeTextMode}
        />
      )}
    </div>
  );
}
