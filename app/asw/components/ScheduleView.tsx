'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { players, day1Players, day2Players, playerCounts } from '../data/players';
import type { Player } from '../types';
import { Clock, Zap, ChevronDown, ChevronUp, AlertTriangle, Languages } from 'lucide-react';
import { isCurrentPlayer, isUpcomingPlayer, formatTime, findCurrentPlayer } from '../lib/schedule-utils';
import { UPDATE_INTERVALS, DAY_STYLES, STATUS_COLORS } from '../lib/constants';
import { useMounted } from '../hooks/useMounted';
import { Skeleton } from './Skeleton';

interface ScheduleViewProps {
  onPlayerClick: (firstName: string) => void;
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
  const styles = DAY_STYLES[day];
  const embargoedCount = useMemo(() => dayPlayers.filter(p => p.embargoed).length, [dayPlayers]);
  const clearCount = useMemo(() => dayPlayers.filter(p => !p.embargoed).length, [dayPlayers]);
  const hasCurrentPlayer = useMemo(() => dayPlayers.some(p => isCurrentPlayer(p, currentTime)), [dayPlayers, currentTime]);

  return (
    <div className={`bg-[#141414] border ${styles.border} rounded-xl overflow-hidden`}>
      <button
        onClick={onToggle}
        className={`w-full ${styles.header} px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <h3 className={`font-bold ${styles.text}`}>DAY {day}</h3>
          <span className="text-sm text-gray-400">{styles.dateDisplay}</span>
          {hasCurrentPlayer && (
            <span className="flex items-center gap-1 bg-amber-500 text-black px-2 py-0.5 rounded text-xs font-bold animate-pulse">
              <Zap className="w-3 h-3" /> LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">{dayPlayers.length} players</span>
            <span className="text-green-400">{clearCount} clear</span>
            <span className="text-red-400">{embargoedCount} embargo</span>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </button>

      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a] bg-[#0a0a0a]">
                <th className="text-left py-3 px-4 text-gray-500 font-medium w-24">Time</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Player</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium w-20">Team</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium w-32">Status</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium w-40">Notes</th>
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
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-amber-500 text-black font-bold animate-pulse w-fit`}>
                            <Zap className="w-3 h-3" /> NOW
                          </span>
                        )}
                        {isUpcoming && (
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${STATUS_COLORS.upcoming.bg} ${STATUS_COLORS.upcoming.text} w-fit`}>
                            <Clock className="w-3 h-3" /> NEXT
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
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${STATUS_COLORS.embargoed.bg} ${STATUS_COLORS.embargoed.text}`}>
                          <AlertTriangle className="w-3 h-3" /> EMBARGO
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${STATUS_COLORS.clear.bg} ${STATUS_COLORS.clear.text}`}>
                          Clear
                        </span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex flex-col gap-1 items-center">
                        {player.translatorNeeded && (
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${STATUS_COLORS.translator.bg} ${STATUS_COLORS.translator.text}`}>
                            <Languages className="w-3 h-3" /> Translator
                          </span>
                        )}
                        {player.notes.length > 0 && (
                          <span className="text-xs text-gray-400">{player.notes[0]}</span>
                        )}
                      </div>
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
  const mounted = useMounted();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, UPDATE_INTERVALS.schedule);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = useMemo(() => formatTime(currentTime), [currentTime]);

  const toggleDay = useCallback((day: number) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }, []);

  const currentPlayer = useMemo(
    () => findCurrentPlayer(players, currentTime),
    [currentTime]
  );

  const jumpToNow = useCallback(() => {
    if (currentPlayer) {
      setExpandedDays(new Set([currentPlayer.day]));
    }
  }, [currentPlayer]);

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Player Schedule</h2>
          <p className="text-sm text-gray-500">Exclusive appearances + Signing only</p>
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

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-white">{playerCounts.total}</p>
          <p className="text-xs text-gray-500">Total Players</p>
        </div>
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{playerCounts.clear}</p>
          <p className="text-xs text-gray-500">Clear for Use</p>
        </div>
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{playerCounts.embargoed}</p>
          <p className="text-xs text-gray-500">Embargoed</p>
        </div>
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">{playerCounts.translatorNeeded}</p>
          <p className="text-xs text-gray-500">Need Translator</p>
        </div>
      </div>

      <DaySchedule day={1} dayPlayers={day1Players} onPlayerClick={onPlayerClick} currentTime={currentTime} isExpanded={expandedDays.has(1)} onToggle={() => toggleDay(1)} />
      <DaySchedule day={2} dayPlayers={day2Players} onPlayerClick={onPlayerClick} currentTime={currentTime} isExpanded={expandedDays.has(2)} onToggle={() => toggleDay(2)} />

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-sm text-gray-500">
        <strong className="text-gray-400">Note:</strong> Check each player&apos;s format (Exclusive or Signing Only) and duration in the Notes column. TBD times will be confirmed closer to event.
      </div>
    </div>
  );
}
