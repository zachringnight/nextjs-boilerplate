'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSchedulePlayers } from '../data/schedule';
import type { Player } from '../types';
import PlayerAvatar from './PlayerAvatar';
import { ChevronRight, Volume2, Zap, ArrowRight, Calendar, Radio } from 'lucide-react';
import { useASWStore } from '../store';
import { hapticFeedback } from '../lib/utils';
import {
  getEventDay,
  isCurrentPlayer,
  getTimeRemaining,
  getNextPlayer,
  getCompletedCount,
  getCurrentMinutesPT,
  formatTime,
  formatDate,
  parseTime,
} from '../lib/schedule-utils';
import { UPDATE_INTERVALS, DAY_STYLES, EVENT_DATES, EVENT_INFO, STATION_CONFIG, STATUS_COLORS, SLOT_DURATION_MINUTES } from '../lib/constants';
import { useMounted } from '../hooks/useMounted';
import { Skeleton } from './Skeleton';

function getSlotProgress(player: Player, currentTime: Date): number {
  const parsed = parseTime(player.scheduledTime);
  if (!parsed) return 0;

  const slotStart = parsed.hours * 60 + parsed.minutes;
  const currentMinutes = getCurrentMinutesPT(currentTime);
  const elapsed = Math.max(0, Math.min(SLOT_DURATION_MINUTES, currentMinutes - slotStart));

  return Math.round((elapsed / SLOT_DURATION_MINUTES) * 100);
}

function getMinutesUntil(player: Player, currentTime: Date): number | null {
  const parsed = parseTime(player.scheduledTime);
  if (!parsed) return null;

  const targetMinutes = parsed.hours * 60 + parsed.minutes;
  const currentMinutes = getCurrentMinutesPT(currentTime);
  return Math.max(0, targetMinutes - currentMinutes);
}

function CurrentPlayerCard({ player, onPlayerClick }: { player: Player; onPlayerClick: (playerId: string) => void }) {
  return (
    <button
      onClick={() => onPlayerClick(player.id)}
      className="w-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-xl p-5 text-left hover:border-amber-500 transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <PlayerAvatar player={player} size="xl" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-2xl sm:text-3xl">{player.flag}</span>
            {player.embargoed && (
              <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS.embargoed.bg} ${STATUS_COLORS.embargoed.text}`}>EMBARGO</span>
            )}
            {player.translatorNeeded && (
              <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS.translator.bg} ${STATUS_COLORS.translator.text}`}>Translator</span>
            )}
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400">{player.firstName}</p>
          <p className="text-xl sm:text-2xl text-white">{player.lastName}</p>
          {player.pronunciation && (
            <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
              <Volume2 className="w-4 h-4" />
              <span className="italic">{player.pronunciation}</span>
            </div>
          )}
          <p className="text-gray-400 mt-2">#{player.jerseyNumber} {player.position} - {player.team}</p>
        </div>
        <ChevronRight className="hidden sm:block w-8 h-8 text-amber-500" />
      </div>
      <div className="mt-4 pt-4 border-t border-amber-500/30">
        <p className="text-xs text-gray-400 mb-1">KEY TALKING POINT:</p>
        <p className="text-base text-gray-200">{player.talkingPoints[0]}</p>
      </div>
    </button>
  );
}

function NextPlayerCard({ player, onPlayerClick }: { player: Player; onPlayerClick: (playerId: string) => void }) {
  return (
    <button
      onClick={() => onPlayerClick(player.id)}
      className="w-full min-h-[56px] bg-[#141414] border border-blue-500/30 rounded-xl p-4 text-left hover:border-blue-500/50 transition-all"
    >
      <div className="flex items-center gap-3">
        <PlayerAvatar player={player} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{player.flag}</span>
            <span className="text-xs text-blue-400 font-medium">UP NEXT</span>
          </div>
          <p className="font-bold truncate">{player.firstName} {player.lastName}</p>
          <p className="text-sm text-gray-400">{player.scheduledTime || 'TBD'}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </div>
    </button>
  );
}

function UpcomingQueue({
  players,
  currentTime,
  onPlayerClick,
}: {
  players: Player[];
  currentTime: Date;
  onPlayerClick: (playerId: string) => void;
}) {
  if (players.length === 0) return null;

  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
      <p className="text-xs uppercase tracking-wide text-[#9CA3AF] mb-3">Upcoming Queue</p>
      <div className="space-y-2">
        {players.map((player) => {
          const minutesUntil = getMinutesUntil(player, currentTime);
          const relativeTime =
            minutesUntil === null ? 'TBD' : minutesUntil === 0 ? 'Now / Next' : `in ${minutesUntil}m`;

          return (
            <button
              key={player.id}
              onClick={() => onPlayerClick(player.id)}
              className="w-full min-h-[52px] flex items-center justify-between p-3 rounded-lg bg-[#101010] border border-[#2A2A2A] hover:border-[#FFD100]/40 hover:bg-[#181818] transition-colors text-left"
            >
              <div className="min-w-0">
                <p className="font-medium text-white truncate">{player.firstName} {player.lastName}</p>
                <p className="text-xs text-[#9CA3AF]">{player.teamAbbr} • {player.scheduledTime || 'TBD'}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/15 text-blue-300 whitespace-nowrap">
                {relativeTime}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StationGrid() {
  const setViewMode = useASWStore((s) => s.setViewMode);
  const setSelectedStation = useASWStore((s) => s.setSelectedStation);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {(['tunnel', 'product'] as const).map((key) => {
        const config = STATION_CONFIG[key];
        return (
          <button
            key={key}
            onClick={() => {
              hapticFeedback(30);
              setSelectedStation(key);
              setViewMode('station');
            }}
            className={`bg-[#141414] ${config.borderClass} border rounded-xl p-4 text-left transition-all duration-200 hover:bg-[#1a1a1a] hover:shadow-lg hover:shadow-black/20 active:scale-[0.97] group`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${config.bgClass} rounded-lg flex items-center justify-center text-xl`}>
                {config.emoji}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold ${config.textClass}`}>{config.shortName}</h3>
                <p className="text-xs text-gray-500">{config.description}</p>
              </div>
              <ArrowRight className={`w-4 h-4 ${config.textClass} opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5`} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function StatsGrid({ completedCount, remainingCount, totalCount }: { completedCount: number; remainingCount: number; totalCount: number }) {
  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-green-400">{completedCount}</p>
          <p className="text-xs text-gray-500">Completed Today</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-amber-400">{remainingCount}</p>
          <p className="text-xs text-gray-500">Remaining</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-violet-400">{totalCount}</p>
          <p className="text-xs text-gray-500">Total Players</p>
        </div>
      </div>
    </div>
  );
}

interface NowDashboardProps {
  onPlayerClick: (playerId: string) => void;
}

export default function NowDashboard({ onPlayerClick }: NowDashboardProps) {
  const { players, day1Players, day2Players, playerCounts } = useSchedulePlayers();
  const [currentTime, setCurrentTime] = useState(new Date());
  const setViewMode = useASWStore((s) => s.setViewMode);
  const mounted = useMounted();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, UPDATE_INTERVALS.realtime);
    return () => clearInterval(interval);
  }, []);

  const eventDay = useMemo(() => getEventDay(currentTime), [currentTime]);

  const dayPlayers = useMemo(() => {
    if (eventDay === 1) return day1Players;
    if (eventDay === 2) return day2Players;
    return [];
  }, [day1Players, day2Players, eventDay]);

  const currentPlayer = useMemo(
    () => players.find(p => isCurrentPlayer(p, currentTime, eventDay)),
    [currentTime, eventDay, players]
  );

  const nextPlayer = useMemo(
    () => getNextPlayer(players, currentTime, eventDay),
    [currentTime, eventDay, players]
  );

  const upcomingQueue = useMemo(() => {
    const currentMinutes = getCurrentMinutesPT(currentTime);
    return dayPlayers
      .filter((player) => {
        const parsed = parseTime(player.scheduledTime);
        if (!parsed) return false;
        const slotStart = parsed.hours * 60 + parsed.minutes;
        return slotStart > currentMinutes;
      })
      .slice(0, 3);
  }, [dayPlayers, currentTime]);

  const currentMinutes = useMemo(
    () => getCurrentMinutesPT(currentTime),
    [currentTime]
  );

  if (!mounted) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  const currentHour = Math.floor(currentMinutes / 60);
  const currentMin = currentMinutes % 60;
  const formattedDate = formatDate(currentTime);
  const formattedTime = formatTime(currentTime, true);

  const dateTimeCard = (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-white">{formattedDate}</p>
          <p className="text-xs text-gray-500">PT (Los Angeles)</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl text-amber-400">{formattedTime}</p>
          {eventDay && (
            <p className={`text-xs font-medium ${DAY_STYLES[eventDay].text}`}>
              Day {eventDay} of Shoot
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Not on event day
  if (eventDay === null) {
    const day1Date = new Date(EVENT_DATES.day1.year, EVENT_DATES.day1.month, EVENT_DATES.day1.day);
    const now = new Date(currentTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    const isBeforeEvent = now < day1Date;
    const firstPlayer = day1Players[0];

    return (
      <div className="space-y-6">
        {dateTimeCard}
        <div className={`rounded-xl p-4 ${isBeforeEvent ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{isBeforeEvent ? '\uD83D\uDCC5' : '\u2705'}</span>
            <div>
              <p className={`font-bold ${isBeforeEvent ? 'text-blue-400' : 'text-green-400'}`}>
                {isBeforeEvent ? 'Shoot Coming Up' : 'Shoot Complete'}
              </p>
              <p className="text-sm text-gray-400">{EVENT_INFO.dateDisplay} at {EVENT_INFO.location}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {([1, 2] as const).map((day) => (
            <div key={day} className={`bg-[#141414] ${DAY_STYLES[day].border} border rounded-xl p-4`}>
              <p className={`text-xs ${DAY_STYLES[day].text} font-medium mb-2`}>DAY {day}</p>
              <p className="font-bold text-white">{DAY_STYLES[day].dateDisplay}</p>
              <p className="text-sm text-gray-400">{day === 1 ? playerCounts.day1 : playerCounts.day2} players</p>
            </div>
          ))}
        </div>
        {firstPlayer && (
          <div>
            <p className="text-sm text-gray-500 mb-2">FIRST UP (DAY 1):</p>
            <NextPlayerCard player={firstPlayer} onPlayerClick={onPlayerClick} />
          </div>
        )}
        <StationGrid />
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{playerCounts.total}</p>
              <p className="text-xs text-gray-500">Total Players</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">2</p>
              <p className="text-xs text-gray-500">Stations</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">2</p>
              <p className="text-xs text-gray-500">Shoot Days</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Before shoot starts
  if (!currentPlayer) {
    if (currentHour < 9 || (currentHour === 9 && currentMin < 30)) {
      return (
        <div className="space-y-6">
          {dateTimeCard}
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{'\uD83C\uDF05'}</div>
            <h2 className="text-2xl font-bold mb-2">Good Morning!</h2>
            <p className="text-gray-500 mb-4">
              {eventDay === 1 ? 'Day 1 starts at 10:00 AM' : 'Day 2 starts at 9:30 AM'}
            </p>
          </div>
          {nextPlayer && (
            <div className="max-w-md mx-auto">
              <p className="text-sm text-gray-500 mb-2">FIRST UP TODAY:</p>
              <NextPlayerCard player={nextPlayer} onPlayerClick={onPlayerClick} />
            </div>
          )}
        </div>
      );
    }

    if (currentHour >= 20) {
      return (
        <div className="space-y-6">
          {dateTimeCard}
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{'\uD83C\uDF89'}</div>
            <h2 className="text-2xl font-bold mb-2">That&apos;s a Wrap!</h2>
            <p className="text-gray-500 mb-4">Great work today, team!</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {dateTimeCard}
        <div className="text-center py-12">
          <div className="text-6xl mb-4">{'\u23F3'}</div>
          <h2 className="text-2xl font-bold mb-2">Break</h2>
          <p className="text-gray-500 mb-4">Next player coming up</p>
        </div>
        {nextPlayer && (
          <div className="max-w-md mx-auto">
            <p className="text-sm text-gray-500 mb-2">UP NEXT:</p>
            <NextPlayerCard player={nextPlayer} onPlayerClick={onPlayerClick} />
          </div>
        )}
      </div>
    );
  }

  // Active player
  const timeRemaining = getTimeRemaining(currentPlayer, currentTime);
  const slotProgress = getSlotProgress(currentPlayer, currentTime);
  const completedCount = getCompletedCount(dayPlayers, currentTime);
  const dayColorClass = DAY_STYLES[currentPlayer.day].text;

  return (
    <div className="space-y-6">
      {dateTimeCard}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            Live Now
          </h2>
          <p className="text-sm text-gray-500">Current player at Panini station</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => setViewMode('schedule')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#D1D5DB] hover:text-white hover:border-[#FFD100]/40 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium">Full Schedule</span>
          </button>
          <button
            onClick={() => setViewMode('station')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#D1D5DB] hover:text-white hover:border-[#FFD100]/40 transition-colors"
          >
            <Radio className="w-4 h-4" />
            <span className="text-xs font-medium">Station Tool</span>
          </button>
        </div>
      </div>
      <div className="sm:hidden grid grid-cols-2 gap-2">
        <button
          onClick={() => setViewMode('schedule')}
          className="flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#D1D5DB] hover:text-white hover:border-[#FFD100]/40 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-xs font-medium">Schedule</span>
        </button>
        <button
          onClick={() => setViewMode('station')}
          className="flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#D1D5DB] hover:text-white hover:border-[#FFD100]/40 transition-colors"
        >
          <Radio className="w-4 h-4" />
          <span className="text-xs font-medium">Station Tool</span>
        </button>
      </div>

      <div className="bg-gradient-to-r from-amber-500/20 via-[#2a1f00]/60 to-orange-500/20 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-amber-400 font-medium">TIME REMAINING</p>
            <p className={`text-sm ${dayColorClass}`}>
              Day {currentPlayer.day} - {currentPlayer.scheduledTime || 'TBD'}
            </p>
          </div>
          <div className="text-right">
            <div className={`font-mono text-3xl sm:text-4xl font-bold ${timeRemaining.minutes < 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
            </div>
            <p className="text-xs text-gray-500">minutes remaining</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-[#9CA3AF] mb-1">
            <span>Slot progress</span>
            <span>{slotProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-black/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FFD100] to-[#f59e0b] transition-all duration-700"
              style={{ width: `${slotProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm text-amber-400 font-medium mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          NOW AT STATION
        </p>
        <CurrentPlayerCard player={currentPlayer} onPlayerClick={onPlayerClick} />
      </div>

      {nextPlayer && (
        <div>
          <p className="text-sm text-gray-500 mb-2">UP NEXT:</p>
          <NextPlayerCard player={nextPlayer} onPlayerClick={onPlayerClick} />
        </div>
      )}

      <UpcomingQueue players={upcomingQueue} currentTime={currentTime} onPlayerClick={onPlayerClick} />

      <StationGrid />

      <StatsGrid
        completedCount={completedCount}
        remainingCount={Math.max(0, dayPlayers.length - completedCount - 1)}
        totalCount={playerCounts.total}
      />
    </div>
  );
}
