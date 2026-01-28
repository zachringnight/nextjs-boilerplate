'use client';

import { useState, useEffect } from 'react';
import { players } from '../../data/players';
import type { Player } from '../../data/players';
import { Clock, Zap, AlertTriangle, Languages, ChevronDown, ChevronUp } from 'lucide-react';

interface ScheduleViewProps {
  onPlayerClick: (firstName: string) => void;
}

const dayStyles = {
  1: {
    border: 'border-blue-500/30',
    header: 'bg-blue-500/10',
    badge: 'text-blue-400',
  },
  2: {
    border: 'border-violet-500/30',
    header: 'bg-violet-500/10',
    badge: 'text-violet-400',
  },
};

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

function DaySchedule({
  day,
  dayPlayers,
  onPlayerClick,
  currentTime,
  isExpanded,
  onToggle,
}: {
  day: 1 | 2;
  dayPlayers: Player[];
  onPlayerClick: (name: string) => void;
  currentTime: Date;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const styles = dayStyles[day];
  const dayDate = day === 1 ? 'Wednesday, January 28' : 'Thursday, January 29';
  const embargoedCount = dayPlayers.filter(p => p.embargoed).length;
  const clearCount = dayPlayers.filter(p => !p.embargoed).length;
  const hasCurrentPlayer = dayPlayers.some(p => isCurrentPlayer(p, currentTime));

  return (
    <div className={`bg-[#141414] border ${styles.border} rounded-xl overflow-hidden`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full ${styles.header} px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <h3 className={`font-bold ${styles.badge}`}>DAY {day}</h3>
          <span className="text-sm text-gray-400">{dayDate}</span>
          {hasCurrentPlayer && (
            <span className="flex items-center gap-1 bg-amber-500 text-black px-2 py-0.5 rounded text-xs font-bold animate-pulse">
              <Zap className="w-3 h-3" />
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">{dayPlayers.length} players</span>
            <span className="text-green-400">{clearCount} clear</span>
            <span className="text-red-400">{embargoedCount} embargo</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Player List */}
      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a] bg-[#0a0a0a]">
                <th className="text-left py-3 px-4 text-gray-500 font-medium w-24">Time</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Player</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium w-20">Team</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium w-32">Status</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium w-28">Notes</th>
              </tr>
            </thead>
            <tbody>
              {dayPlayers.map((player) => {
                const isCurrent = isCurrentPlayer(player, currentTime);
                const isUpcoming = !isCurrent && isUpcomingPlayer(player, currentTime);

                return (
                  <tr
                    key={player.id}
                    className={`border-b border-[#2a2a2a] last:border-0 transition-colors ${
                      isCurrent
                        ? 'bg-amber-500/10 border-l-2 border-l-amber-500'
                        : isUpcoming
                        ? 'bg-blue-500/5'
                        : 'hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        {isCurrent && (
                          <span className="flex items-center gap-1 text-amber-400 text-xs font-bold animate-pulse mb-1">
                            <Zap className="w-3 h-3" />
                            NOW
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="flex items-center gap-1 text-blue-400 text-xs mb-1">
                            <Clock className="w-3 h-3" />
                            NEXT
                          </span>
                        )}
                        <span className={`font-mono text-xs ${isCurrent ? 'text-amber-400 font-bold' : 'text-gray-300'}`}>
                          {player.scheduledTime}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onPlayerClick(player.firstName)}
                        className="flex items-center gap-2 hover:text-amber-400 transition-colors"
                      >
                        <span className="text-lg">{player.flag}</span>
                        <span className={`font-medium ${isCurrent ? 'text-amber-400' : 'text-white'}`}>
                          {player.firstName} {player.lastName}
                        </span>
                      </button>
                      {player.pronunciation && (
                        <p className="text-xs text-gray-500 italic ml-7">{player.pronunciation}</p>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-xs text-gray-400 font-medium">{player.teamAbbr}</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      {player.embargoed ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
                          <AlertTriangle className="w-3 h-3" />
                          EMBARGO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                          Clear
                        </span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      {player.translatorNeeded && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-400">
                          <Languages className="w-3 h-3" />
                          Translator
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ScheduleView({ onPlayerClick }: ScheduleViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1, 2]));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const day1Players = players.filter(p => p.day === 1);
  const day2Players = players.filter(p => p.day === 2);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Los_Angeles',
  });

  const toggleDay = (day: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const currentPlayer = players.find(p => isCurrentPlayer(p, currentTime));

  const jumpToNow = () => {
    if (currentPlayer) {
      setExpandedDays(new Set([currentPlayer.day]));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Player Schedule</h2>
          <p className="text-sm text-gray-500">15 min per player • 2 stations (Tunnel + Product)</p>
        </div>
        <div className="flex items-center gap-4">
          {currentPlayer && (
            <button
              onClick={jumpToNow}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
            >
              <Zap className="w-3 h-3" />
              Jump to Now
            </button>
          )}
          <div className="text-right">
            <div className="flex items-center gap-2 text-amber-400">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">{formattedTime}</span>
            </div>
            <p className="text-xs text-gray-500">PT (Los Angeles)</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-white">{players.length}</p>
          <p className="text-xs text-gray-500">Total Players</p>
        </div>
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{players.filter(p => !p.embargoed).length}</p>
          <p className="text-xs text-gray-500">Clear for Use</p>
        </div>
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{players.filter(p => p.embargoed).length}</p>
          <p className="text-xs text-gray-500">Embargoed</p>
        </div>
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">{players.filter(p => p.translatorNeeded).length}</p>
          <p className="text-xs text-gray-500">Need Translator</p>
        </div>
      </div>

      <DaySchedule
        day={1}
        dayPlayers={day1Players}
        onPlayerClick={onPlayerClick}
        currentTime={currentTime}
        isExpanded={expandedDays.has(1)}
        onToggle={() => toggleDay(1)}
      />

      <DaySchedule
        day={2}
        dayPlayers={day2Players}
        onPlayerClick={onPlayerClick}
        currentTime={currentTime}
        isExpanded={expandedDays.has(2)}
        onToggle={() => toggleDay(2)}
      />

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-sm text-gray-500">
        <strong className="text-gray-400">Note:</strong> Each player visits both stations (Tunnel + Product Photography). Tunnel station includes interview. Product is visual only.
      </div>
    </div>
  );
}
