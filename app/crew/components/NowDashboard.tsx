'use client';

import { useState, useEffect } from 'react';
import { players } from '../../data/players';
import type { Player } from '../../data/players';
import PlayerAvatar from './PlayerAvatar';
import { Clock, Zap, ChevronRight, Volume2, AlertTriangle, Languages, Calendar } from 'lucide-react';

// Event dates: January 28 and 29, 2026
const EVENT_DATES = {
  day1: { year: 2026, month: 0, day: 28 }, // month is 0-indexed (January = 0)
  day2: { year: 2026, month: 0, day: 29 },
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

function getEventDay(date: Date): 1 | 2 | null {
  const pstString = date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const pstDate = new Date(pstString);

  const year = pstDate.getFullYear();
  const month = pstDate.getMonth();
  const day = pstDate.getDate();

  if (year === EVENT_DATES.day1.year && month === EVENT_DATES.day1.month && day === EVENT_DATES.day1.day) {
    return 1;
  }
  if (year === EVENT_DATES.day2.year && month === EVENT_DATES.day2.month && day === EVENT_DATES.day2.day) {
    return 2;
  }
  return null;
}

function isCurrentPlayer(player: Player, currentTime: Date, eventDay: 1 | 2 | null): boolean {
  // Only match players on the current event day
  if (eventDay === null || player.day !== eventDay) return false;

  const { hours, minutes } = parseTime(player.scheduledTime);
  const slotStart = hours * 60 + minutes;
  const slotEnd = slotStart + 15;

  const pstString = currentTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const pstDate = new Date(pstString);
  const currentMinutes = pstDate.getHours() * 60 + pstDate.getMinutes();

  return currentMinutes >= slotStart && currentMinutes < slotEnd;
}

function getTimeRemaining(player: Player, currentTime: Date): { minutes: number; seconds: number } {
  const { hours, minutes } = parseTime(player.scheduledTime);
  const slotEnd = (hours * 60 + minutes + 15) * 60;

  const pstString = currentTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const pstDate = new Date(pstString);
  const now = pstDate.getHours() * 60 * 60 + pstDate.getMinutes() * 60 + pstDate.getSeconds();

  const remaining = Math.max(0, slotEnd - now);
  return {
    minutes: Math.floor(remaining / 60),
    seconds: remaining % 60,
  };
}

function getNextPlayer(currentTime: Date, eventDay: 1 | 2 | null): Player | null {
  // Only look for next player on the current event day
  if (eventDay === null) return null;

  const pstString = currentTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const pstDate = new Date(pstString);
  const currentMinutes = pstDate.getHours() * 60 + pstDate.getMinutes();

  const dayPlayers = players.filter(p => p.day === eventDay);

  for (const player of dayPlayers) {
    const { hours, minutes } = parseTime(player.scheduledTime);
    const slotStart = hours * 60 + minutes;
    if (slotStart > currentMinutes) {
      return player;
    }
  }
  return null;
}

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
          <p className="text-3xl font-black text-amber-400">{player.firstName}</p>
          <p className="text-2xl text-white">{player.lastName}</p>
          {player.pronunciation && (
            <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
              <Volume2 className="w-4 h-4" />
              <span className="italic">{player.pronunciation}</span>
            </div>
          )}
          <p className="text-gray-400 mt-2">{player.position} • {player.team}</p>
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
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{player.flag}</span>
            <span className="text-xs text-blue-400 font-medium">UP NEXT</span>
          </div>
          <p className="font-bold truncate">{player.firstName} {player.lastName}</p>
          <p className="text-sm text-gray-400">{player.scheduledTime}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </div>
    </button>
  );
}

interface NowDashboardProps {
  onPlayerClick: (firstName: string) => void;
}

export default function NowDashboard({ onPlayerClick }: NowDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Get the current event day (1, 2, or null if not during event)
  const eventDay = getEventDay(currentTime);

  const currentPlayer = players.find(p => isCurrentPlayer(p, currentTime, eventDay));
  const nextPlayer = getNextPlayer(currentTime, eventDay);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'America/Los_Angeles',
  });

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Los_Angeles',
  });

  const pstString = currentTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const pstDate = new Date(pstString);
  const currentHour = pstDate.getHours();
  const currentMin = pstDate.getMinutes();

  const dayPlayers = eventDay ? players.filter(p => p.day === eventDay) : [];

  // Date/time display component
  const DateTimeDisplay = () => (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-amber-400" />
          <div>
            <p className="font-medium text-white">{formattedDate}</p>
            <p className="text-xs text-gray-500">PT (Los Angeles)</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl text-amber-400">{formattedTime}</p>
          {eventDay && (
            <p className={`text-xs font-medium ${eventDay === 1 ? 'text-blue-400' : 'text-violet-400'}`}>
              Day {eventDay} of Shoot
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Not on an event day
  if (eventDay === null) {
    const day1Date = new Date(EVENT_DATES.day1.year, EVENT_DATES.day1.month, EVENT_DATES.day1.day);
    const day2Date = new Date(EVENT_DATES.day2.year, EVENT_DATES.day2.month, EVENT_DATES.day2.day);
    const now = new Date(pstString);

    const isBeforeEvent = now < day1Date;
    const isAfterEvent = now > day2Date;

    return (
      <div className="space-y-6">
        <DateTimeDisplay />
        <div className="text-center py-12">
          <div className="text-6xl mb-4">{isBeforeEvent ? '📅' : '✅'}</div>
          <h2 className="text-2xl font-bold mb-2">
            {isBeforeEvent ? 'Shoot Coming Soon' : 'Shoot Complete'}
          </h2>
          <p className="text-gray-500 mb-4">
            {isBeforeEvent
              ? 'The NWSL Media Day shoot is scheduled for January 28 and 29, 2026'
              : 'The NWSL Media Day 2026 shoot has wrapped!'}
          </p>
          <div className="inline-flex flex-col gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-6 py-4">
            <div className="flex items-center gap-3 text-blue-400">
              <span className="font-medium">Day 1:</span>
              <span>Wednesday, January 28, 2026</span>
            </div>
            <div className="flex items-center gap-3 text-violet-400">
              <span className="font-medium">Day 2:</span>
              <span>Thursday, January 29, 2026</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
            <p className="text-3xl font-bold text-white">{players.length}</p>
            <p className="text-xs text-gray-500">Total Players</p>
          </div>
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
            <p className="text-3xl font-bold text-white">2</p>
            <p className="text-xs text-gray-500">Shoot Days</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPlayer) {
    if (currentHour < 9 || (currentHour === 9 && currentMin < 35)) {
      return (
        <div className="space-y-6">
          <DateTimeDisplay />
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌅</div>
            <h2 className="text-2xl font-bold mb-2">Good Morning!</h2>
            <p className="text-gray-500 mb-4">
              {eventDay === 1 ? 'Day 1 starts at 10:05 AM' : 'Day 2 starts at 9:35 AM'}
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
          <DateTimeDisplay />
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">That's a Wrap!</h2>
            <p className="text-gray-500 mb-4">Great work today, team!</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <DateTimeDisplay />
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
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

  const timeRemaining = getTimeRemaining(currentPlayer, currentTime);
  const completedCount = dayPlayers.filter(p => {
    const { hours, minutes } = parseTime(p.scheduledTime);
    const slotEnd = hours * 60 + minutes + 15;
    const currentMinutes = currentHour * 60 + currentMin;
    return slotEnd <= currentMinutes;
  }).length;

  const dayColors = {
    1: 'text-blue-400',
    2: 'text-violet-400',
  };

  return (
    <div className="space-y-6">
      <DateTimeDisplay />

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
            <p className={`text-sm ${dayColors[currentPlayer.day]}`}>
              Day {currentPlayer.day} • {currentPlayer.scheduledTime}
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

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#141414] border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-xl">
              🚶
            </div>
            <div>
              <h3 className="font-bold text-green-400">TUNNEL</h3>
              <p className="text-xs text-gray-500">Walk-in + Interview</p>
            </div>
          </div>
        </div>
        <div className="bg-[#141414] border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-xl">
              📸
            </div>
            <div>
              <h3 className="font-bold text-amber-400">PRODUCT</h3>
              <p className="text-xs text-gray-500">Card Photography</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-400">{completedCount}</p>
            <p className="text-xs text-gray-500">Completed Today</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-400">{dayPlayers.length - completedCount - 1}</p>
            <p className="text-xs text-gray-500">Remaining</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-violet-400">{players.length}</p>
            <p className="text-xs text-gray-500">Total Players</p>
          </div>
        </div>
      </div>
    </div>
  );
}
