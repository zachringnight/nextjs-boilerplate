'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '../store';
import { players } from '../data/players';
import { stations, checklistStations } from '../data/stations';
import { StationId } from '../types';

interface PlayerStationChecklistProps {
  filterSigningOnly?: boolean;
}

export default function PlayerStationChecklist({ filterSigningOnly = false }: PlayerStationChecklistProps) {
  const {
    largeText,
    togglePlayerStation,
    isStationCompleted,
    getPlayerProgress,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());

  // Filter players based on search and signingOnly preference
  const filteredPlayers = players.filter((player) => {
    if (filterSigningOnly && !player.signingOnly) return false;
    if (!filterSigningOnly && player.signingOnly) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        player.name.toLowerCase().includes(query) ||
        player.team.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Get station info by ID
  const getStation = (stationId: StationId) => {
    return stations.find((s) => s.id === stationId);
  };

  // Toggle player expansion
  const toggleExpand = (playerId: string) => {
    setExpandedPlayers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#FFD100]/50 ${
            largeText ? 'text-lg' : 'text-base'
          }`}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Station Legend */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
        <p className={`text-[#9CA3AF] mb-3 ${largeText ? 'text-base' : 'text-sm'}`}>Stations:</p>
        <div className="flex flex-wrap gap-2">
          {checklistStations.map((stationId) => {
            const station = getStation(stationId);
            if (!station) return null;
            return (
              <div
                key={stationId}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                style={{ backgroundColor: `${station.color}20` }}
              >
                <span>{station.icon}</span>
                <span className={`${largeText ? 'text-sm' : 'text-xs'}`} style={{ color: station.color }}>
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
                  {/* Player Avatar */}
                  <div className="w-12 h-12 rounded-full bg-[#2A2A2A] flex items-center justify-center text-lg font-bold text-white overflow-hidden flex-shrink-0">
                    {player.photo ? (
                      <img
                        src={player.photo}
                        alt={player.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = player.name.charAt(0);
                        }}
                      />
                    ) : (
                      player.name.charAt(0)
                    )}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <Link
                      href={`/prizm/players/${player.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className={`font-semibold text-white hover:text-[#FFD100] transition-colors truncate block ${largeText ? 'text-lg' : 'text-base'}`}
                    >
                      {player.name}
                    </Link>
                    <p className={`text-[#9CA3AF] ${largeText ? 'text-base' : 'text-sm'}`}>
                      {player.team} - {player.position}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`font-semibold ${progress.percentage === 100 ? 'text-green-500' : 'text-[#FFD100]'} ${largeText ? 'text-lg' : 'text-base'}`}>
                        {progress.completed}/{progress.total}
                      </p>
                      <p className={`text-[#6B7280] ${largeText ? 'text-sm' : 'text-xs'}`}>
                        {progress.percentage}%
                      </p>
                    </div>

                    {/* Progress Ring */}
                    <div className="relative w-10 h-10">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          stroke="#2A2A2A"
                          strokeWidth="3"
                          fill="none"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          stroke={progress.percentage === 100 ? '#22c55e' : '#FFD100'}
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
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

                    {/* Expand Icon */}
                    <svg
                      className={`w-5 h-5 text-[#6B7280] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Station Checklist (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-[#2A2A2A] p-4 bg-[#0F0F0F]">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {checklistStations.map((stationId) => {
                        const station = getStation(stationId);
                        if (!station) return null;
                        const completed = isStationCompleted(player.id, stationId);

                        return (
                          <button
                            key={stationId}
                            onClick={() => togglePlayerStation(player.id, stationId)}
                            className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                              completed
                                ? 'bg-green-500/20 border-green-500/50'
                                : 'bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#FFD100]/50'
                            }`}
                          >
                            {/* Checkbox */}
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                                completed ? 'bg-green-500' : 'border-2 border-[#4B5563]'
                              }`}
                            >
                              {completed && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>

                            {/* Station Info */}
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span>{station.icon}</span>
                              <span
                                className={`truncate ${largeText ? 'text-sm' : 'text-xs'} ${
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
  );
}
