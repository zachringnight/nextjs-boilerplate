'use client';

import { useState, useEffect, useMemo } from 'react';
import { players, day1Players, day2Players, playerCounts } from '../data/players';
import type { Player } from '../types';
import PlayerAvatar from './PlayerAvatar';
import { ChevronRight, Volume2, Zap, MapPin, Clock, Mail, Crown, PenLine } from 'lucide-react';
import {
  getEventDay,
  isCurrentPlayer,
  getTimeRemaining,
  getNextPlayer,
  getCompletedCount,
  getCurrentMinutesPT,
  formatTime,
  formatDate,
} from '../lib/schedule-utils';
import { UPDATE_INTERVALS, DAY_STYLES, EVENT_DATES, EVENT_INFO, STATION_CONFIG, STATUS_COLORS, ASW_TIER_STYLES } from '../lib/constants';
import { useMounted } from '../hooks/useMounted';
import { Skeleton } from './Skeleton';

function CurrentPlayerCard({ player, onPlayerClick }: { player: Player; onPlayerClick: (name: string) => void }) {
  return (
    <button
      onClick={() => onPlayerClick(player.firstName)}
      className="w-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-xl p-5 text-left hover:border-amber-500 transition-all"
    >
      <div className="flex items-center gap-4">
        <PlayerAvatar player={player} size="xl" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-3xl">{player.flag}</span>
            {player.tier && ASW_TIER_STYLES[player.tier] && (
              <span className={`text-xs px-2 py-0.5 rounded font-bold ${ASW_TIER_STYLES[player.tier].bg} ${ASW_TIER_STYLES[player.tier].text}`}>
                {ASW_TIER_STYLES[player.tier].label}
              </span>
            )}
            {player.league && (
              <span className="text-xs px-1.5 py-0.5 rounded font-bold bg-cyan-500/20 text-cyan-400">{player.league}</span>
            )}
            {player.exclusive && (
              <span className="text-xs px-2 py-0.5 rounded font-bold bg-[#FFD100]/20 text-[#FFD100] flex items-center gap-0.5">
                <Crown className="w-3 h-3" /> EXCL
              </span>
            )}
            {player.signingOnly && (
              <span className="text-xs px-2 py-0.5 rounded font-bold bg-violet-500/20 text-violet-400 flex items-center gap-0.5">
                <PenLine className="w-3 h-3" /> SIGNING
              </span>
            )}
            {player.embargoed && (
              <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS.embargoed.bg} ${STATUS_COLORS.embargoed.text}`}>EMBARGO</span>
            )}
            {player.translatorNeeded && (
              <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS.translator.bg} ${STATUS_COLORS.translator.text}`}>Translator</span>
            )}
          </div>
          <p className="text-3xl font-black text-amber-400">{player.firstName}</p>
          <p className="text-2xl text-white">{player.lastName}</p>
          {player.pronunciation && (
            <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
              <Volume2 className="w-4 h-4" />
              <span className="italic">{player.pronunciation}</span>
            </div>
          )}
          <p className="text-gray-400 mt-2">#{player.jerseyNumber} {player.position} - {player.team}</p>
        </div>
        <ChevronRight className="w-8 h-8 text-amber-500" />
      </div>
      <div className="mt-4 pt-4 border-t border-amber-500/30">
        <p className="text-xs text-gray-400 mb-1">KEY TALKING POINT:</p>
        <p className="text-base text-gray-200">{player.talkingPoints[0]}</p>
      </div>
    </button>
  );
}

function NextPlayerCard({ player, onPlayerClick }: { player: Player; onPlayerClick: (name: string) => void }) {
  return (
    <button
      onClick={() => onPlayerClick(player.firstName)}
      className="w-full bg-[#141414] border border-blue-500/30 rounded-xl p-4 text-left hover:border-blue-500/50 transition-all"
    >
      <div className="flex items-center gap-3">
        <PlayerAvatar player={player} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-lg">{player.flag}</span>
            <span className="text-xs text-blue-400 font-medium">UP NEXT</span>
            {player.tier && ASW_TIER_STYLES[player.tier] && (
              <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${ASW_TIER_STYLES[player.tier].bg} ${ASW_TIER_STYLES[player.tier].text}`}>
                {ASW_TIER_STYLES[player.tier].label}
              </span>
            )}
            {player.exclusive && (
              <Crown className="w-3 h-3 text-[#FFD100]" />
            )}
            {player.signingOnly && (
              <PenLine className="w-3 h-3 text-violet-400" />
            )}
          </div>
          <p className="font-bold truncate">{player.firstName} {player.lastName}</p>
          <p className="text-sm text-gray-400">{player.scheduledTime || 'TBD'}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </div>
    </button>
  );
}

function StationGrid() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {(['tunnel', 'qa', 'signing'] as const).map((key) => {
        const config = STATION_CONFIG[key];
        return (
          <div key={key} className={`bg-[#141414] ${config.borderClass} border rounded-xl p-3`}>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className={`w-10 h-10 ${config.bgClass} rounded-lg flex items-center justify-center text-xl`}>
                {config.emoji}
              </div>
              <div>
                <h3 className={`font-bold text-sm ${config.textClass}`}>{config.shortName}</h3>
                <p className="text-[10px] text-gray-500">{config.description}</p>
              </div>
            </div>
          </div>
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
  onPlayerClick: (firstName: string) => void;
}

export default function NowDashboard({ onPlayerClick }: NowDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
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
  }, [eventDay]);

  const currentPlayer = useMemo(
    () => players.find(p => isCurrentPlayer(p, currentTime, eventDay)),
    [currentTime, eventDay]
  );

  const nextPlayer = useMemo(
    () => getNextPlayer(players, currentTime, eventDay),
    [currentTime, eventDay]
  );

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
      <div className="flex items-center justify-between">
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
        {/* Venue Details */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-[#FFD100] uppercase tracking-wider">Venue</h3>
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#FFD100] mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-white">{EVENT_INFO.venue.name}</p>
              <p className="text-sm text-gray-400">{EVENT_INFO.venue.fullAddress}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-[#FFD100] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-400">
              <p>Fri, Feb 13: {EVENT_INFO.hours.day1.open} &ndash; {EVENT_INFO.hours.day1.close}</p>
              <p>Sat, Feb 14: {EVENT_INFO.hours.day2.open} &ndash; {EVENT_INFO.hours.day2.close}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-[#FFD100] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-400">
              <p>RSVP: {EVENT_INFO.rsvp.name}</p>
              <p className="text-[#FFD100]">{EVENT_INFO.rsvp.email}</p>
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
              <p className="text-2xl font-bold text-white">3</p>
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
  const completedCount = getCompletedCount(dayPlayers, currentTime);
  const dayColorClass = DAY_STYLES[currentPlayer.day].text;

  return (
    <div className="space-y-6">
      {dateTimeCard}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            Live Now
          </h2>
          <p className="text-sm text-gray-500">Current player at Panini station</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-400 font-medium">TIME REMAINING</p>
            <p className={`text-sm ${dayColorClass}`}>
              Day {currentPlayer.day} - {currentPlayer.scheduledTime || 'TBD'}
            </p>
          </div>
          <div className="text-right">
            <div className={`font-mono text-4xl font-bold ${timeRemaining.minutes < 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
            </div>
            <p className="text-xs text-gray-500">minutes remaining</p>
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

      <StationGrid />

      <StatsGrid
        completedCount={completedCount}
        remainingCount={dayPlayers.length - completedCount - 1}
        totalCount={playerCounts.total}
      />
    </div>
  );
}
