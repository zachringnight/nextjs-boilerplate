'use client';

import { useState, useEffect, useRef } from 'react';
import { players, rotationSchedule } from '../data/players';
import PlayerCard from './components/PlayerCard';
import PlayerModal from './components/PlayerModal';
import ScheduleView from './components/ScheduleView';
import StationToolView from './components/StationToolView';
import NowDashboard from './components/NowDashboard';
import type { Player } from '../data/players';
import { Search, Users, Filter, Calendar, User, Radio, Zap, X, Type } from 'lucide-react';

type ViewMode = 'now' | 'schedule' | 'station' | 'players';

export default function CrewPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('now');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [activeStation, setActiveStation] = useState<string | null>(null);
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

  // Filter players for global search
  const globalSearchResults = globalSearchQuery.length > 0
    ? players.filter(p =>
        p.firstName.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        p.lastName.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        p.team.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        p.position.toLowerCase().includes(globalSearchQuery.toLowerCase())
      )
    : [];

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.nationality.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = activeGroup === null || player.group === activeGroup;
    return matchesSearch && matchesGroup;
  });

  const groupCounts = {
    1: players.filter((p) => p.group === 1).length,
    2: players.filter((p) => p.group === 2).length,
    3: players.filter((p) => p.group === 3).length,
  };

  const handlePlayerClick = (firstName: string) => {
    const player = players.find(
      (p) => p.firstName.toLowerCase() === firstName.toLowerCase()
    );
    if (player) {
      setSelectedPlayer(player);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">CREW APP</h1>
              <p className="text-sm text-gray-500">NWSL Media Day 2026 • Panini</p>
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
                <p className="text-sm text-amber-400 font-medium">Jan 28, 2026</p>
                <p className="text-xs text-gray-500">MG Studio, LA</p>
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button
              onClick={() => setViewMode('now')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === 'now'
                  ? 'bg-amber-500 text-black'
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
                  ? 'bg-amber-500 text-black'
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
                  ? 'bg-amber-500 text-black'
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
                  ? 'bg-amber-500 text-black'
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
                  className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Group filters */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setActiveGroup(null)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeGroup === null
                      ? 'bg-amber-500 text-black'
                      : 'bg-[#141414] text-gray-300 hover:bg-[#1a1a1a]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  All ({players.length})
                </button>
                {[1, 2, 3].map((group) => (
                  <button
                    key={group}
                    onClick={() => setActiveGroup(activeGroup === group ? null : group)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      activeGroup === group
                        ? 'bg-amber-500 text-black'
                        : 'bg-[#141414] text-gray-300 hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    Group {group} ({groupCounts[group as keyof typeof groupCounts]})
                  </button>
                ))}
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
          <ScheduleView
            schedule={rotationSchedule}
            onPlayerClick={handlePlayerClick}
          />
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setShowGlobalSearch(false);
              setGlobalSearchQuery('');
            }}
          />
          <div className="relative flex justify-center pt-[15vh] px-4">
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
                  onClick={() => {
                    setShowGlobalSearch(false);
                    setGlobalSearchQuery('');
                  }}
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
                        onClick={() => {
                          setSelectedPlayer(player);
                          setShowGlobalSearch(false);
                          setGlobalSearchQuery('');
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#1a1a1a] transition-colors text-left"
                      >
                        <span className="text-2xl">{player.flag}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {player.firstName} {player.lastName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {player.position} • {player.team} • Group {player.group}
                          </p>
                        </div>
                        <span className="text-xs text-gray-600">
                          {player.groupTime}
                        </span>
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
          station={activeStation}
          onClose={() => setSelectedPlayer(null)}
          onStationChange={setActiveStation}
          largeText={largeTextMode}
        />
      )}
    </div>
  );
}
