'use client';

import { useState } from 'react';
import { players } from '../data/players';
import PlayerCard from './components/PlayerCard';
import PlayerModal from './components/PlayerModal';
import type { Player } from '../data/players';
import { Search, Users, Filter } from 'lucide-react';

export default function CrewPage() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [activeStation, setActiveStation] = useState<string | null>(null);

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
            <div className="text-right">
              <p className="text-sm text-amber-400 font-medium">Jan 28, 2026</p>
              <p className="text-xs text-gray-500">MG Studio, LA</p>
            </div>
          </div>

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
        </div>
      </header>

      {/* Player Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6">
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
      </main>

      {/* Player Modal */}
      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          station={activeStation}
          onClose={() => setSelectedPlayer(null)}
          onStationChange={setActiveStation}
        />
      )}
    </div>
  );
}
