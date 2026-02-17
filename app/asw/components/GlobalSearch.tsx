'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useSchedulePlayers } from '../data/schedule';
import { useASWStore } from '../store';
import type { Player } from '../types';

interface GlobalSearchProps {
  onPlayerSelect: (player: Player) => void;
}

export default function GlobalSearch({ onPlayerSelect }: GlobalSearchProps) {
  const { players } = useSchedulePlayers();
  const { searchOpen, setSearchOpen } = useASWStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (query.length === 0) return [];
    const q = query.toLowerCase();
    return players.filter(p =>
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.team.toLowerCase().includes(q) ||
      p.position.toLowerCase().includes(q) ||
      p.teamAbbr.toLowerCase().includes(q)
    );
  }, [players, query]);

  const close = useCallback(() => {
    setSearchOpen(false);
    setQuery('');
  }, [setSearchOpen]);

  const handleSelect = useCallback((player: Player) => {
    onPlayerSelect(player);
    close();
  }, [onPlayerSelect, close]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape' && searchOpen) {
        close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, close, setSearchOpen]);

  // Focus input on open
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-[backdropFade_0.15s_ease-out]"
        onClick={close}
      />
      <div className="relative flex justify-center pt-[15vh] px-4 animate-[slideUp_0.25s_ease-out]">
        <div className="w-full max-w-xl bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center border-b border-[#2a2a2a] px-4">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search players by name, team, or position..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent px-4 py-4 text-white placeholder-gray-500 focus:outline-none"
            />
            <button onClick={close} className="p-1 hover:bg-[#2a2a2a] rounded" aria-label="Close search">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">Start typing to search players</p>
                <p className="text-xs mt-1">Press ESC to close</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No players found</p>
              </div>
            ) : (
              <div className="py-2">
                {results.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handleSelect(player)}
                    className="group w-full px-4 py-3 flex items-center gap-3 hover:bg-[#1a1a1a] transition-all duration-150 text-left"
                  >
                    <span className="text-2xl">{player.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate group-hover:text-[#FFD100] transition-colors">
                        {player.firstName} {player.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        #{player.jerseyNumber} {player.position} - {player.teamAbbr} - Day {player.day}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-600">{player.scheduledTime || 'TBD'}</span>
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
  );
}
