'use client';

import { useState, useEffect } from 'react';
import { players, tunnelInterviewQuestions } from '../../data/players';
import type { Player } from '../../data/players';
import PlayerAvatar from './PlayerAvatar';
import { ChevronDown, ChevronUp, Volume2, Clock, Zap, AlertTriangle, Languages } from 'lucide-react';

interface StationToolViewProps {
  largeText?: boolean;
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return { hours: 0, minutes: 0 };

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
}

function isCurrentPlayer(player: Player, currentTime: Date): boolean {
  const { hours, minutes } = parseTime(player.scheduledTime);
  const slotStart = hours * 60 + minutes;
  const slotEnd = slotStart + 15;

  const pstString = currentTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const pstDate = new Date(pstString);
  const currentMinutes = pstDate.getHours() * 60 + pstDate.getMinutes();

  return currentMinutes >= slotStart && currentMinutes < slotEnd;
}

function isUpcomingPlayer(player: Player, currentTime: Date): boolean {
  const { hours, minutes } = parseTime(player.scheduledTime);
  const slotStart = hours * 60 + minutes;

  const pstString = currentTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const pstDate = new Date(pstString);
  const currentMinutes = pstDate.getHours() * 60 + pstDate.getMinutes();

  return slotStart > currentMinutes && slotStart <= currentMinutes + 30;
}

function PlayerSlotCard({
  player,
  isExpanded,
  onToggle,
  currentTime,
  largeText,
}: {
  player: Player;
  isExpanded: boolean;
  onToggle: () => void;
  currentTime: Date;
  largeText: boolean;
}) {
  const isCurrent = isCurrentPlayer(player, currentTime);
  const isUpcoming = !isCurrent && isUpcomingPlayer(player, currentTime);

  const dayColors = {
    1: 'border-blue-500/30 bg-blue-500/5',
    2: 'border-violet-500/30 bg-violet-500/5',
  };

  const dayBadgeColors = {
    1: 'bg-blue-500/20 text-blue-400',
    2: 'bg-violet-500/20 text-violet-400',
  };

  return (
    <div className={`bg-[#141414] border rounded-xl overflow-hidden transition-all ${
      isCurrent
        ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10'
        : isUpcoming
        ? 'border-blue-500/50'
        : dayColors[player.day]
    }`}>
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className={`w-full p-4 flex items-center gap-4 transition-colors text-left ${
          isCurrent ? 'bg-amber-500/10' : 'hover:bg-[#1a1a1a]'
        }`}
      >
        <PlayerAvatar player={player} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {isCurrent && (
              <span className="flex items-center gap-1 bg-amber-500 text-black px-2 py-0.5 rounded text-xs font-bold animate-pulse">
                <Zap className="w-3 h-3" />
                NOW
              </span>
            )}
            {isUpcoming && (
              <span className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs">
                <Clock className="w-3 h-3" />
                NEXT
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded ${dayBadgeColors[player.day]}`}>
              Day {player.day}
            </span>
            <span className="text-xl">{player.flag}</span>
            {player.embargoed && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                <AlertTriangle className="w-3 h-3" />
                EMBARGO
              </span>
            )}
            {player.translatorNeeded && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                <Languages className="w-3 h-3" />
                Translator
              </span>
            )}
          </div>
          <p className={`text-lg font-bold truncate ${isCurrent ? 'text-amber-400' : ''}`}>
            {player.firstName} {player.lastName}
          </p>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className={`font-mono ${isCurrent ? 'text-amber-400 font-bold' : ''}`}>{player.scheduledTime}</span>
            <span>•</span>
            <span>{player.position}</span>
            <span>•</span>
            <span>{player.team}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-[#2a2a2a]">
          {/* Pronunciation */}
          {player.pronunciation && (
            <div className="px-4 py-3 bg-[#0a0a0a] border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2 text-gray-400">
                <Volume2 className="w-4 h-4" />
                <span className="text-sm italic">{player.pronunciation}</span>
              </div>
            </div>
          )}

          {/* Bio & Talking Points */}
          <div className="p-4 grid md:grid-cols-2 gap-4 border-b border-[#2a2a2a]">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 tracking-wide mb-2">BACKGROUND</h4>
              <ul className="space-y-1.5">
                {player.bio.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="w-1 h-1 bg-gray-600 rounded-full mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-amber-400 tracking-wide mb-2">TALKING POINTS</h4>
              <ul className="space-y-1.5">
                {player.talkingPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interview Questions */}
          <div className="p-4">
            <div className="mb-4">
              <h4 className="text-sm font-bold text-green-400 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs">
                  🚶
                </span>
                TUNNEL INTERVIEW QUESTIONS
              </h4>
              <p className="text-xs text-gray-500 ml-8">Partnership + Ad VO prompts</p>
            </div>

            {/* Partnership Questions */}
            <div className="mb-4">
              <h5 className="text-xs font-semibold text-gray-400 mb-2">{tunnelInterviewQuestions.partnership.title}</h5>
              <ul className={largeText ? 'space-y-4' : 'space-y-3'}>
                {tunnelInterviewQuestions.partnership.questions.map((question, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className={`${largeText ? 'w-7 h-7 text-sm' : 'w-6 h-6 text-xs'} bg-green-500 rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0`}>
                      {index + 1}
                    </span>
                    <span className={`text-gray-100 leading-relaxed ${largeText ? 'text-lg' : 'text-base'}`}>{question}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ad VO Questions */}
            <div className="mb-4">
              <h5 className="text-xs font-semibold text-gray-400 mb-2">{tunnelInterviewQuestions.adVO.title}</h5>
              <ul className={largeText ? 'space-y-4' : 'space-y-3'}>
                {tunnelInterviewQuestions.adVO.questions.map((question, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className={`${largeText ? 'w-7 h-7 text-sm' : 'w-6 h-6 text-xs'} bg-amber-500 rounded-lg flex items-center justify-center font-bold text-black flex-shrink-0`}>
                      {index + 1}
                    </span>
                    <span className={`text-gray-100 leading-relaxed ${largeText ? 'text-lg' : 'text-base'}`}>{question}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hybrid Questions */}
            <div>
              <h5 className="text-xs font-semibold text-gray-400 mb-2">{tunnelInterviewQuestions.hybrid.title}</h5>
              <ul className={largeText ? 'space-y-4' : 'space-y-3'}>
                {tunnelInterviewQuestions.hybrid.questions.map((question, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className={`${largeText ? 'w-7 h-7 text-sm' : 'w-6 h-6 text-xs'} bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0`}>
                      {index + 1}
                    </span>
                    <span className={`text-gray-100 leading-relaxed ${largeText ? 'text-lg' : 'text-base'}`}>{question}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StationToolView({ largeText = false }: StationToolViewProps) {
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeDay, setActiveDay] = useState<1 | 2 | 'all'>('all');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredPlayers = activeDay === 'all'
    ? players
    : players.filter(p => p.day === activeDay);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Los_Angeles',
  });

  const togglePlayer = (playerId: string) => {
    const newExpanded = new Set(expandedPlayers);
    if (newExpanded.has(playerId)) {
      newExpanded.delete(playerId);
    } else {
      newExpanded.add(playerId);
    }
    setExpandedPlayers(newExpanded);
  };

  const expandAll = () => {
    setExpandedPlayers(new Set(filteredPlayers.map(p => p.id)));
  };

  const collapseAll = () => {
    setExpandedPlayers(new Set());
  };

  // Find current player
  const currentPlayerIndex = filteredPlayers.findIndex(p => isCurrentPlayer(p, currentTime));

  // Auto-expand current player on mount
  useEffect(() => {
    if (currentPlayerIndex >= 0) {
      setExpandedPlayers(new Set([filteredPlayers[currentPlayerIndex].id]));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const jumpToNow = () => {
    if (currentPlayerIndex >= 0) {
      const player = filteredPlayers[currentPlayerIndex];
      setExpandedPlayers(new Set([player.id]));
      const element = document.getElementById(`player-${player.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white">
              🚶
            </span>
            Tunnel Station Tool
          </h2>
          <p className="text-sm text-gray-500 mt-1">View all players with interview questions and background</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-amber-400">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold">{formattedTime}</span>
          </div>
          <p className="text-xs text-gray-500">PT (Los Angeles)</p>
        </div>
      </div>

      {/* Day Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveDay('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeDay === 'all'
              ? 'bg-amber-500 text-black'
              : 'bg-[#141414] text-gray-300 hover:bg-[#1a1a1a]'
          }`}
        >
          All Days ({players.length})
        </button>
        <button
          onClick={() => setActiveDay(1)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeDay === 1
              ? 'bg-blue-500 text-white'
              : 'bg-[#141414] text-gray-300 hover:bg-[#1a1a1a]'
          }`}
        >
          Day 1 (Wed) ({players.filter(p => p.day === 1).length})
        </button>
        <button
          onClick={() => setActiveDay(2)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeDay === 2
              ? 'bg-violet-500 text-white'
              : 'bg-[#141414] text-gray-300 hover:bg-[#1a1a1a]'
          }`}
        >
          Day 2 (Thu) ({players.filter(p => p.day === 2).length})
        </button>
      </div>

      {/* Station Info Bar */}
      <div className="bg-[#141414] border border-green-500/30 rounded-xl p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-green-400 flex items-center gap-2">
            <span>🚶</span>
            TUNNEL STATION
          </h3>
          <p className="text-sm text-gray-500">{filteredPlayers.length} players • 15 min each • Walk-in + Interview</p>
        </div>
        <div className="flex gap-2">
          {currentPlayerIndex >= 0 && (
            <button
              onClick={jumpToNow}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
            >
              <Zap className="w-3 h-3" />
              Jump to Now
            </button>
          )}
          <button
            onClick={expandAll}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#0a0a0a] text-gray-400 hover:text-white transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Player Timeline */}
      <div className="space-y-3">
        {filteredPlayers.map((player) => (
          <div key={player.id} id={`player-${player.id}`}>
            <PlayerSlotCard
              player={player}
              isExpanded={expandedPlayers.has(player.id)}
              onToggle={() => togglePlayer(player.id)}
              currentTime={currentTime}
              largeText={largeText}
            />
          </div>
        ))}
      </div>

      {/* Footer tip */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-sm text-gray-500">
        <strong className="text-gray-400">Tip:</strong> Tap any player card to expand their full profile, background, and interview questions. Product station is visual only (no interview needed).
      </div>
    </div>
  );
}
