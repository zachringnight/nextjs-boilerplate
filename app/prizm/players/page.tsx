'use client';

import { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import PlayerCard from '../components/PlayerCard';
import { players } from '../data/players';
import { getNextSlot, getScheduleForPlayer } from '../data/schedule';
import { useAppStore } from '../store';
import { Search, X } from 'lucide-react';

export default function PlayersPage() {
  const { schedule, largeText } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return players;

    const q = searchQuery.toLowerCase();
    return players.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.team.toLowerCase().includes(q) ||
      p.position.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Get next slot for each player
  const getPlayerNextSlot = (playerId: string) => {
    const playerSchedule = getScheduleForPlayer(schedule, playerId);
    if (playerSchedule.length === 0) return null;

    const now = new Date();
    for (const slot of playerSchedule) {
      const nextSlot = getNextSlot(schedule, slot.station, now);
      if (nextSlot && nextSlot.playerId === playerId) {
        return nextSlot;
      }
    }
    return playerSchedule[0]; // Return first scheduled slot
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#9CA3AF]">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Players" />

      {/* Search Bar */}
      <div className="sticky top-[73px] z-30 bg-[#0D0D0D] border-b border-[#2A2A2A] p-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, team, or position..."
            className={`w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-10 py-3 text-white placeholder-[#9CA3AF] focus:border-[#FFD100] focus:outline-none transition-colors ${
              largeText ? 'text-lg' : 'text-base'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Player Count */}
      <div className="px-4 py-2 border-b border-[#2A2A2A]">
        <span className={`text-[#9CA3AF] ${largeText ? 'text-base' : 'text-sm'}`}>
          {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
      </div>

      {/* Player Grid */}
      <div className="p-4">
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-[#9CA3AF] ${largeText ? 'text-lg' : 'text-base'}`}>
              No players found for "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="player-grid">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                nextSlot={getPlayerNextSlot(player.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
