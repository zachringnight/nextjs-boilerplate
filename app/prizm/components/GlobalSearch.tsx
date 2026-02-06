'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock } from 'lucide-react';
import { useAppStore } from '../store';
import { searchPlayers } from '../data/players';
import { getScheduleForPlayer, getNextSlot } from '../data/schedule';
import PlayerPhoto from './PlayerPhoto';

export default function GlobalSearch() {
  const router = useRouter();
  const { searchOpen, setSearchOpen, recentSearches, addRecentSearch, largeText, schedule } = useAppStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchPlayers(query).slice(0, 6);
  }, [query]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  // Focus input when opened
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
    }
  }, [searchOpen]);

  const handleSelect = (playerId: string, playerName: string) => {
    addRecentSearch(playerName);
    setSearchOpen(false);
    router.push(`/prizm/players/${playerId}`);
  };

  const handleRecentClick = (search: string) => {
    setQuery(search);
  };

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-[backdropFade_0.15s_ease-out]" onClick={() => setSearchOpen(false)}>
      <div
        className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-lg mx-4 animate-[slideUp_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-[#2A2A2A]">
            <Search size={20} className="text-[#9CA3AF]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search players..."
              className={`flex-1 bg-transparent text-white placeholder-[#9CA3AF] outline-none ${
                largeText ? 'text-lg' : 'text-base'
              }`}
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="p-1 rounded hover:bg-[#2A2A2A]"
            >
              <X size={20} className="text-[#9CA3AF]" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-2">
                <p className={`px-2 py-1 text-[#9CA3AF] ${largeText ? 'text-base' : 'text-sm'}`}>
                  Recent
                </p>
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => handleRecentClick(search)}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-[#2A2A2A] transition-colors ${
                      largeText ? 'text-base' : 'text-sm'
                    }`}
                  >
                    <Clock size={16} className="text-[#9CA3AF]" />
                    <span className="text-white">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Search Results */}
            {query && results.length > 0 && (
              <div className="p-2">
                {results.map((player) => {
                  const playerSchedule = getScheduleForPlayer(schedule, player.id);
                  const nextSlot = playerSchedule.length > 0
                    ? getNextSlot(schedule, playerSchedule[0].station, new Date())
                    : null;

                  return (
                    <button
                      key={player.id}
                      onClick={() => handleSelect(player.id, player.name)}
                      className="group flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-[#2A2A2A] transition-all duration-150"
                    >
                      <PlayerPhoto src={player.photo} name={player.name} size="sm" />

                      {/* Player Info */}
                      <div className="flex-1 text-left">
                        <p className={`font-medium text-white group-hover:text-[#FFD100] transition-colors ${largeText ? 'text-lg' : 'text-base'}`}>
                          {player.name}
                        </p>
                        <p className={`text-[#9CA3AF] ${largeText ? 'text-base' : 'text-sm'}`}>
                          {player.team} • {player.position}
                        </p>
                      </div>

                      {/* Next Appearance */}
                      {nextSlot && (
                        <div className={`text-right ${largeText ? 'text-base' : 'text-sm'}`}>
                          <p className="text-[#FFD100]">{nextSlot.startTime}</p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* No Results */}
            {query && results.length === 0 && (
              <div className="p-8 text-center">
                <p className={`text-[#9CA3AF] ${largeText ? 'text-lg' : 'text-base'}`}>
                  No players found for "{query}"
                </p>
              </div>
            )}

            {/* Empty State */}
            {!query && recentSearches.length === 0 && (
              <div className="p-8 text-center">
                <p className={`text-[#9CA3AF] ${largeText ? 'text-lg' : 'text-base'}`}>
                  Search by name, team, or position
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-[#2A2A2A] flex items-center justify-between text-xs text-[#9CA3AF]">
            <span>↵ to select</span>
            <span>esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
